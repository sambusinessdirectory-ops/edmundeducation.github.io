#!/usr/bin/env python3
"""Build side-by-side scanned pages with selectable OCR and translation drafts."""
from __future__ import annotations

import argparse
import csv
import hashlib
import html
import io
import json
import os
import re
import statistics
import subprocess
import tempfile
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path

from PIL import Image

PDFTOPPM = os.environ.get("PDFTOPPM", "/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm")
MANUAL_OVERRIDES = json.loads(Path(__file__).with_name("manual-overrides.json").read_text(encoding="utf-8"))
LAYOUT_DIR = Path(__file__).with_name("layouts")


class LayoutText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.translation_depth = 0

    def handle_data(self, data):
        if not self.translation_depth:
            self.parts.append(data)

    def handle_starttag(self, tag, attrs):
        if self.translation_depth:
            self.translation_depth += 1
            return
        if dict(attrs).get("lang") == "zh-Hant":
            self.translation_depth = 1
            return
        if tag in {"br", "hr"}:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if self.translation_depth:
            self.translation_depth -= 1
            return
        if tag in {"h2", "h3", "h4", "p", "li", "th", "td", "tr", "caption", "figcaption", "div", "header", "main", "aside", "blockquote", "section"}:
            self.parts.append("\n")

    def text(self):
        return "\n".join(line.strip() for line in "".join(self.parts).splitlines() if line.strip())
YEAR_FILES = {
    2012: "DSE/2012/2012 DSE/DSE 2012/Paper 3 Part B 1 Data File.pdf",
    2013: "2013 DSE Paper 3.pdf",
    2014: "2014 Paper 3.pdf",
    2015: "2015 DSE Paper 3 Questions.pdf",
    2016: "2016 DSE Paper 3 Question.pdf",
    2018: "2018 Paper 3.pdf",
    2019: "2019 Paper 3.pdf",
    2020: "2020 DSE Paper 3 - Question.pdf",
    2021: "2021 Paper 3 Questions.pdf",
    2022: "2022 Paper 3.pdf",
    2023: "2023 Paper 3 Question.pdf",
}
MANIFEST = [
    (2012, "b1", [("DSE/2012/2012 DSE/DSE 2012/Paper 3 Part B 1 Data File.pdf", list(range(1, 10)), "data"), ("DSE/2012/2012 DSE/DSE 2012/Paper 3 Part B 1 Question-Answer Book.pdf", list(range(1, 5)), "qab")]),
    (2012, "b2", [("DSE/2012/2012 DSE English Language Paper 3B2.pdf", list(range(7, 16)), "data"), ("DSE/2012/2012 DSE English Language Paper 3B2.pdf", list(range(1, 7)), "qab")]),
    (2013, "b2", [(YEAR_FILES[2013], list(range(10, 21)), "data"), (YEAR_FILES[2013], list(range(32, 38)), "qab")]),
    (2014, "b1", [(YEAR_FILES[2014], list(range(1, 11)), "data"), (YEAR_FILES[2014], list(range(30, 34)), "qab")]),
    (2014, "b2", [(YEAR_FILES[2014], list(range(11, 22)), "data"), (YEAR_FILES[2014], list(range(34, 40)), "qab")]),
    (2015, "b1", [(YEAR_FILES[2015], list(range(13, 22)), "data"), (YEAR_FILES[2015], list(range(25, 29)), "qab")]),
    (2016, "b1", [(YEAR_FILES[2016], list(range(9, 18)), "data"), (YEAR_FILES[2016], list(range(28, 32)), "qab")]),
    (2018, "b1", [(YEAR_FILES[2018], list(range(15, 24)), "data"), (YEAR_FILES[2018], list(range(11, 15)), "qab")]),
    (2019, "b1", [(YEAR_FILES[2019], list(range(25, 35)), "data"), (YEAR_FILES[2019], list(range(13, 17)), "qab")]),
    (2019, "b2", [(YEAR_FILES[2019], list(range(37, 48)), "data"), (YEAR_FILES[2019], list(range(17, 25)), "qab")]),
    (2020, "b1", [(YEAR_FILES[2020], list(range(18, 28)), "data"), (YEAR_FILES[2020], list(range(12, 16)), "qab")]),
    (2021, "b1", [(YEAR_FILES[2021], list(range(8, 18)), "data"), (YEAR_FILES[2021], list(range(28, 32)), "qab")]),
    (2021, "b2", [(YEAR_FILES[2021], list(range(18, 28)), "data"), (YEAR_FILES[2021], list(range(32, 39)), "qab")]),
    # The supplied 2022 PDF is physically shuffled and contains a blank sheet
    # at source page 15. Map the printed DF-1 through DF-10 page numbers.
    (2022, "b1", [(YEAR_FILES[2022], [13, 14, 17, 18, 21, 22, 23, 20, 19, 16], "data"), (YEAR_FILES[2022], list(range(24, 28)), "qab")]),
    (2023, "b1", [(YEAR_FILES[2023], list(range(16, 26)), "data"), (YEAR_FILES[2023], list(range(12, 16)), "qab")]),
    (2023, "b2", [(YEAR_FILES[2023], list(range(34, 44)), "data"), (YEAR_FILES[2023], list(range(26, 34)), "qab")]),
]


def ocr_lines(image_path: Path):
    result = subprocess.run(["tesseract", str(image_path), "stdout", "--psm", "3", "tsv"], capture_output=True, text=True, check=True)
    groups = {}
    for row in csv.DictReader(io.StringIO(result.stdout), delimiter="\t"):
        raw_word = row["text"].strip()
        # A malformed TSV row once swallowed the remainder of a page into one
        # "word". Do not present raw OCR records as selectable source text.
        if row["level"] != "5" or not raw_word or len(raw_word) > 160 or "\t" in raw_word or "\n" in raw_word:
            continue
        try:
            conf = float(row["conf"])
        except ValueError:
            continue
        key = (row["block_num"], row["par_num"], row["line_num"])
        groups.setdefault(key, []).append({"x": int(row["left"]), "y": int(row["top"]), "w": int(row["width"]), "h": int(row["height"]), "conf": conf, "text": raw_word})
    lines = []
    for words in groups.values():
        words.sort(key=lambda item: item["x"])
        x = min(w["x"] for w in words)
        y = min(w["y"] for w in words)
        right = max(w["x"] + w["w"] for w in words)
        bottom = max(w["y"] + w["h"] for w in words)
        text = " ".join(w["text"] for w in words)
        confidence = statistics.mean(w["conf"] for w in words)
        lines.append({"x": x, "y": y, "w": right - x, "h": bottom - y, "text": text, "conf": confidence, "words": words, "group": key[:2]})
    return sorted(lines, key=lambda line: (line["y"], line["x"]))


def native_blocks(lines, kind: str):
    """Make readable, selectable text without drawing over the original scan."""
    blocks = []
    current = []
    prior = None
    for line in lines:
        if line["conf"] < 42 or not line["text"].strip():
            continue
        line_text = line["text"]
        if kind == "qab" and (line["conf"] < 64 or re.search(r"margins|poyzeul|Aasoress|^Provided by|^Go on to", line_text, re.I) or re.match(r"^\d", line_text) or re.fullmatch(r"[\d\W]+", line_text)):
            continue
        if re.fullmatch(r"Provided by (?:dse\.life|elite)", line_text, re.I):
            continue
        if re.fullmatch(r"Answers written in the margins will not be marked\.?", line_text, re.I):
            continue
        noise = re.search(r"\.{3,}|[csenCSEN]{12,}", line_text)
        if noise and len(line_text) > 35:
            last_page = re.search(r"\b\d{1,2}$", line_text)
            line_text = line_text[:noise.start()].rstrip(" .") + (" — " + last_page.group(0) if last_page else "")
        heading = len(line_text) < 75 and (line_text.isupper() or re.match(r"^(Email from|Message from|Chat between|Task \d+|Situation|Contents|Listening note-taking sheet|Part B|Subject:)", line_text, re.I))
        bullet = bool(re.match(r"^[•●▪®]\s|^[-–]\s", line_text))
        gap = (line["y"] - (prior["y"] + prior["h"])) if prior else 1000
        new = not current or heading or bullet or (prior and (line["group"] != prior["group"] or gap > max(16, prior["h"] * 1.2)))
        if new and current:
            blocks.append(current)
            current = []
        current.append({"text": line_text, "heading": heading, "bullet": bullet})
        prior = line
    if current:
        blocks.append(current)
    result = []
    for block in blocks:
        content = " ".join(item["text"] for item in block)
        tag = "h3" if block[0]["heading"] else "p"
        cls = ' class="bullet"' if block[0]["bullet"] else ""
        result.append(f"<{tag}{cls}>{html.escape(content)}</{tag}>")
    return "".join(result)


def translate_page(text: str, cache: Path) -> str:
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    stamp = cache.with_suffix(".source-sha256")
    if not text.strip():
        cache.unlink(missing_ok=True)
        stamp.unlink(missing_ok=True)
        return ""
    if cache.exists() and stamp.exists() and stamp.read_text(encoding="utf-8") == digest:
        return cache.read_text(encoding="utf-8")
    chunks = []
    current = ""
    for line in text.splitlines():
        if len(current) + len(line) > 2400 and current:
            chunks.append(current)
            current = ""
        current += line + "\n"
    if current:
        chunks.append(current)
    translated = []
    for chunk in chunks:
        query = urllib.parse.urlencode({"client": "gtx", "sl": "en", "tl": "zh-TW", "dt": "t", "q": chunk})
        req = urllib.request.Request("https://translate.googleapis.com/translate_a/single?" + query, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urllib.request.urlopen(req, timeout=25) as response:
                data = json.load(response)
            translated.append("".join(item[0] for item in data[0] if item and item[0]))
        except Exception:
            return ""
    output = "\n".join(translated).strip()
    cache.write_text(output, encoding="utf-8")
    stamp.write_text(digest, encoding="utf-8")
    return output


def render_page(source: Path, source_page: int, output_dir: Path, leaf: int, kind: str, translate: bool):
    stem = f"page-{leaf:02d}"
    asset_dir = output_dir / "assets"
    asset_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="paper3-leaf-") as tmp:
        prefix = Path(tmp) / "source"
        subprocess.run([PDFTOPPM, "-f", str(source_page), "-l", str(source_page), "-r", "200", "-singlefile", "-png", str(source), str(prefix)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        image_path = prefix.with_suffix(".png")
        lines = ocr_lines(image_path)
        image = Image.open(image_path).convert("RGB")
        width, height = image.size
        if kind == "qab":
            # The answer books print the same warning vertically in both side
            # margins. OCR treats those rotated letters as meaningless English.
            lines = [line for line in lines if not ((line["x"] < width * .11 or line["x"] > width * .82) and line["w"] < width * .12)]
        all_words = sum(len(line["words"]) for line in lines)
        native_words = sum(len(line["words"]) for line in lines if line["conf"] >= 42)
        art = asset_dir / f"{stem}.webp"
        image.save(art, format="WEBP", quality=82, method=6)
    native_html = native_blocks(lines, kind)
    source_text = html.unescape(re.sub(r"<[^>]+>", "", native_html.replace("</p>", "\n").replace("</h3>", "\n"))).strip()
    scan_missing = kind == "data" and not source_text and all_words < 8
    exact_endings = {
        ("2020 DSE Paper 3 - Question.pdf", 14): ("END OF TASK 6",),
        ("2021 Paper 3 Questions.pdf", 31): ("END OF TASK 7", "END OF PART B1"),
        ("2021 Paper 3 Questions.pdf", 36): ("END OF TASK 9",),
        ("2021 Paper 3 Questions.pdf", 38): ("END OF TASK 10", "END OF PART B2"),
        ("2023 Paper 3 Question.pdf", 15): ("END OF TASK 7", "END OF PART B1"),
    }
    if kind == "qab" and (source.name, source_page) in exact_endings:
        lines_exact = exact_endings[(source.name, source_page)]
        native_html = "".join(f"<p>{html.escape(item)}</p>" for item in lines_exact)
        source_text = "\n".join(lines_exact)
    layout_file = LAYOUT_DIR / f"{output_dir.name}-page-{leaf:02d}.html"
    override = MANUAL_OVERRIDES.get(output_dir.name, {}).get(str(leaf))
    if override:
        native_html = "".join(f"<{tag}>{html.escape(text)}</{tag}>" for tag, text in override["english"] if tag in {"h3", "p"})
        source_text = "\n".join(text for _, text in override["english"])
        translation = "\n".join(override["chinese"]) if translate else ""
        if translate and not layout_file.exists():
            cache = asset_dir / f"{stem}.zh.txt"
            cache.write_text(translation, encoding="utf-8")
            cache.with_suffix(".source-sha256").write_text(hashlib.sha256(source_text.encode("utf-8")).hexdigest(), encoding="utf-8")
    else:
        translation = translate_page(source_text, asset_dir / f"{stem}.zh.txt") if translate and not layout_file.exists() else ""
    if layout_file.exists():
        native_html = layout_file.read_text(encoding="utf-8")
        parser = LayoutText()
        parser.feed(native_html)
        source_text = parser.text()
        inline_translation = 'class="translation"' in native_html
        if inline_translation:
            translation = ""
        elif override and translate:
            translation = "\n".join(override["chinese"])
            cache = asset_dir / f"{stem}.zh.txt"
            cache.write_text(translation, encoding="utf-8")
            cache.with_suffix(".source-sha256").write_text(hashlib.sha256(source_text.encode("utf-8")).hexdigest(), encoding="utf-8")
        elif translate:
            translation = translate_page(source_text, asset_dir / f"{stem}.zh.txt")
    high_conf_words = sum(len(line["words"]) for line in lines if line["conf"] >= 64)
    return {"leaf": leaf, "kind": kind, "source_page": source_page, "source": source.name, "image": f"assets/{stem}.webp", "native": native_html, "translation": translation, "verified_layout": layout_file.exists(), "inline_translation": bool(layout_file.exists() and 'class="translation"' in native_html), "coverage": high_conf_words / all_words if all_words else 0, "words": all_words, "native_words": native_words, "text": source_text, "missing": scan_missing}


def build_reader(year: int, level: str, sections, source_root: Path, site_root: Path, translate: bool, workers: int):
    output = site_root / "paper3" / f"{year}-{level}"
    output.mkdir(parents=True, exist_ok=True)
    specs = [(source_root / file, page, kind, leaf) for leaf, (file, page, kind) in enumerate(((file, page, kind) for file, pages, kind in sections for page in pages), 1)]
    with ThreadPoolExecutor(max_workers=workers) as executor:
        leaves = list(executor.map(lambda spec: render_page(spec[0], spec[1], output, spec[3], spec[2], translate), specs))
    for asset in (output / "assets").glob("page-*"):
        match = re.match(r"page-(\d+)\.", asset.name)
        if match and int(match.group(1)) > len(leaves):
            asset.unlink()
    # OCR confidence is relevant only to pages that still display OCR text.
    # A source-checked, hand-authored layout replaces that extraction entirely.
    low = [leaf for leaf in leaves if not leaf["verified_layout"] and leaf["words"] >= 15 and leaf["coverage"] < 0.72 and (leaf["kind"] == "data" or len(leaf["text"]) >= 100)]
    report = {"year": year, "level": level, "pages": len(leaves), "data_pages": sum(leaf["kind"] == "data" for leaf in leaves), "qab_pages": sum(leaf["kind"] == "qab" for leaf in leaves), "missing_source_pages": [p["leaf"] for p in leaves if p["missing"]], "nontext_qab_pages": [p["leaf"] for p in leaves if p["kind"] == "qab" and not p["text"]], "low_coverage": [{"leaf": p["leaf"], "coverage": round(p["coverage"], 2)} for p in low], "sources": sorted({p["source"] for p in leaves})}
    (output / "audit.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    (output / "source-text.json").write_text(json.dumps([{k: p[k] for k in ("leaf", "kind", "source_page", "source", "text")} for p in leaves], ensure_ascii=False), encoding="utf-8")
    cards = []
    nav = []
    for p in leaves:
        label = "Data File" if p["kind"] == "data" else "Question-Answer Book"
        i = p["leaf"]
        nav.append(f'<a href="#page-{i}">{i:02d} · {label}</a>')
        zh = f'<div class="page-translation" lang="zh-Hant"><strong>中文對照</strong><p>{html.escape(p["translation"]).replace(chr(10), "<br>")}</p></div>' if p["translation"] else ''
        extra = f'<label class="practice-label">補充練習筆記（非原卷答題欄）<textarea data-note="{i}" rows="5" placeholder="在此整理答案或筆記；只儲存在此裝置。"></textarea></label>' if p["kind"] == "qab" and not p["verified_layout"] else ''
        empty = '<p class="source-gap">現有原卷來源缺少本頁內容，需取得完整原卷後補上。</p>' if p["missing"] else '<p>本頁以圖像或留白為主，請核對右側原卷。</p>'
        warning = '<p class="source-gap">所持掃描檔此頁空白；左側筆記欄標題依另一份 2022 B1 Data File 文字版重建，仍待完整原卷掃描核對。</p>' if p["missing"] and p["native"] else ''
        source_figure = f'<figure class="facsimile"><img src="{p["image"]}" alt="{label} original page {p["source_page"]}" loading="lazy"><figcaption>原卷影像供核對文字和版面</figcaption></figure>'
        if p["verified_layout"]:
            body = f'<div class="native-document" lang="en"><div class="native-label">原生文字重建</div>{p["native"]}</div>{zh}<details class="reference-scan"><summary>核對原卷影像</summary>{source_figure}</details>'
            layout_class = ' verified-reconstruction'
        else:
            body = f'<div class="source-layout"><div class="native-document" lang="en"><div class="native-label">可選取的英文文字</div>{warning}{p["native"] or empty}</div>{source_figure}</div>{zh}'
            layout_class = ''
        printed_page = i if p["kind"] == "data" else i - report["data_pages"]
        cards.append(f'<article class="paper-page{layout_class}" id="page-{i}" data-kind="{p["kind"]}"><header><span>{label} · 第 {printed_page} 頁</span><label><input type="checkbox" data-read="{i}"> 已讀</label></header>{body}{extra}</article>')
    complete = all(p["verified_layout"] for p in leaves)
    reconstruction_note = "所有頁面均已依原卷重建為原生 HTML，含可選取文字、原件版式和答題欄；可展開原卷影像核對。" if complete else ("已核對頁面以原生 HTML 重建文件版面、文字與可作答欄位；可展開原卷影像核對。其餘頁面仍保留文字與掃描對照，待逐頁完成重建。" if any(p["verified_layout"] for p in leaves) else "目前以可選取的英文文字與原卷掃描對照；各頁仍在逐頁重建。")
    footer_status = "所有頁面已按原卷逐頁重建。" if complete else "已重建頁面依原卷核對；其餘頁面仍在逐頁校對。"
    shell = f'''<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{year} {level.upper()} · DSE Paper 3 Part B | EdmundEducation</title><link rel="stylesheet" href="/paper3/native-facsimile.css?v=20261002"><script defer src="/paper3/native-facsimile.js?v=20261002"></script></head><body data-reader="{year}-{level}"><a class="skip" href="#reader">跳至原卷</a><header class="top"><a href="/dse-paper3-analysis.html">← 返回綜合能力分析</a><a href="/paper3/">全部試卷</a></header><main><div class="hero"><p>DSE PAPER 3 · PART {level.upper()} · {year}</p><h1>{year} {level.upper()} Data File + Question-Answer Book</h1><p>{reconstruction_note}</p><div class="toolbar"><button type="button" data-filter="all" aria-pressed="true">全部 {len(leaves)} 頁</button><button type="button" data-filter="data" aria-pressed="false">Data File</button><button type="button" data-filter="qab" aria-pressed="false">Question-Answer Book</button><label><input type="checkbox" id="toggle-zh" checked> 中文對照</label><button type="button" id="print-reader">列印</button></div></div><div class="layout"><aside><strong>閱讀進度</strong><output id="progress">0 / {len(leaves)}</output><nav>{''.join(nav)}</nav><small>原卷圖文與補充筆記分開；筆記只儲存在此瀏覽器。</small></aside><div id="reader">{''.join(cards)}</div></div></main><footer>來源：{html.escape(', '.join(report['sources']))}。{footer_status}中文為學習輔助，請以英文原卷為準。</footer></body></html>'''
    (output / "index.html").write_text(shell, encoding="utf-8")
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--site-root", type=Path, required=True)
    parser.add_argument("--reader", action="append", help="year-level, e.g. 2012-b1; default all")
    parser.add_argument("--translate", action="store_true")
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()
    selected = set(args.reader or [])
    for year, level, sections in MANIFEST:
        if selected and f"{year}-{level}" not in selected:
            continue
        report = build_reader(year, level, sections, args.source_root, args.site_root, args.translate, args.workers)
        print(json.dumps(report, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()

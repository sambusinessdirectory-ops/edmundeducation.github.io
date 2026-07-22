#!/usr/bin/env python3
"""Regression checks for flashcard text-to-speech pronunciation rewrites."""

from __future__ import annotations

import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATOR_PATH = ROOT / "tools" / "generate-flashcard-audio.py"


def load_generator():
    spec = importlib.util.spec_from_file_location("flashcard_audio_generator", GENERATOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {GENERATOR_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    generator = load_generator()
    cases = {
        "CO2 emissions": "C O two emissions",
        "CO₂ emissions": "C O two emissions",
        "RNA, DNA and HIV": "R N A, D N A and H I V",
        "USB and MRI data": "U S B and M R I data",
        "IPCC and GDP": "I P C C and G D P",
        "565 AD": "565 A D",
        "ALH84001 meteorite": "A L H eight four zero zero one meteorite",
        "the fall of Louis XVI": "the fall of Louis the sixteenth",
        "the G8 nations": "the G eight nations",
        "updated NHW11 Prius": "updated N H W eleven Prius",
        "CaCO3": "calcium carbonate",
        "6-n-propylthiouracil": "six N propyl thiouracil",
        "print a 3D version of": "print a three D version of",
        "H+ ions": "H plus ions",
        "around 2°C to 5°C": "around 2 degrees Celsius to 5 degrees Celsius",
        "covering a 60 × 60-metre area": "covering a sixty by sixty metre area",
        "above 70 dBA": "above seventy D B A",
        "fMRI scans": "F M R I scans",
        "PhD research": "P H D research",
        "CFCs": "C F C's",
        "recover an mtDNA fingerprint": "recover an M T D N A fingerprint",
        "an estimated $500 million": "an estimated five hundred million dollars",
        "saved $3.5 million on": "saved three point five million dollars on",
        "£6 million": "six million pounds",
        "a $50 fine": "a fifty dollar fine",
        "under $1 per gallon": "under one dollar per gallon",
        "no more than three words and/or a number": "no more than three words and or a number",
        "strong IQs": "strong I Q scores",
        "COVID-19 and IELTS": "COVID nineteen and eye elts",
        "after World War II": "after World War Two",
        "cooperate with CARB": "cooperate with CARB",
    }
    failures = []
    for display_text, expected in cases.items():
        actual = generator.spoken_text(display_text)
        if actual != expected:
            failures.append(f"{display_text!r}: expected {expected!r}, got {actual!r}")
    if failures:
        raise AssertionError("Pronunciation regressions:\n" + "\n".join(failures))
    print(f"Pronunciation checks passed: {len(cases)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

import {
  STUDENT_PROGRESS_SOURCES,
  buildActivitySeries,
  buildMasterTimeSeries,
  buildSourceTimeSeries,
  buildWritingAverageSeries,
  formatProgressDuration,
  niceProgressMaximum,
  normalizeProgressSnapshot,
  progressPolyline
} from "./student-progress-core.js";

const DEFAULT_SOURCE_IDS = Object.freeze(STUDENT_PROGRESS_SOURCES.map(({ id }) => id));

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function compactNumber(value) {
  return new Intl.NumberFormat("zh-HK", { maximumFractionDigits: 0 }).format(positiveNumber(value));
}

export function normalizeProgressExportSelection(value, { defaultAll = true } = {}) {
  if (!Array.isArray(value)) return defaultAll ? [...DEFAULT_SOURCE_IDS] : [];
  const valid = new Set(DEFAULT_SOURCE_IDS);
  return [...new Set(value.map(String).filter((id) => valid.has(id)))];
}

export function progressExportPreferenceKey({ role = "student", viewerId = "" } = {}) {
  const safeRole = String(role || "student").replace(/[^a-z-]/gi, "").toLowerCase() || "student";
  const safeViewer = String(viewerId || "anonymous").replace(/[^a-z0-9-]/gi, "").toLowerCase() || "anonymous";
  return `edmund-student-progress-export-v1:${safeRole}:${safeViewer}`;
}

function chartSvg({ points = [], series = [], time = false, yTitle = "" }) {
  const dimensions = { width: 680, height: 210, left: 58, right: 18, top: 28, bottom: 38 };
  const values = points.flatMap((point) => series.map((item) => positiveNumber(item.value(point))));
  const maximum = niceProgressMaximum(Math.max(0, ...values));
  const plotHeight = dimensions.height - dimensions.top - dimensions.bottom;
  const plotWidth = dimensions.width - dimensions.left - dimensions.right;
  const grid = Array.from({ length: 5 }, (_, index) => {
    const ratio = index / 4;
    const y = dimensions.top + plotHeight * ratio;
    const value = maximum * (1 - ratio);
    const label = time ? formatProgressDuration(value, { compact: true }) : compactNumber(value);
    return `<line x1="${dimensions.left}" y1="${y}" x2="${dimensions.width - dimensions.right}" y2="${y}" stroke="#d7e0e7" stroke-width="1"/><text x="${dimensions.left - 8}" y="${y + 4}" text-anchor="end" fill="#5f7280" font-size="10">${escapeHtml(label)}</text>`;
  }).join("");
  const lines = series.map((item) => {
    const pointsValue = progressPolyline(points, item.value, dimensions, maximum);
    return `<polyline points="${pointsValue}" fill="none" stroke="${escapeHtml(item.color)}" stroke-width="${item.emphasis ? 4 : 2.5}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("");
  const labelIndexes = [...new Set([0, Math.floor((points.length - 1) / 2), Math.max(0, points.length - 1)])];
  const xLabels = labelIndexes.map((index) => {
    const point = points[index];
    if (!point) return "";
    const x = dimensions.left + plotWidth * index / Math.max(points.length - 1, 1);
    return `<text x="${x}" y="${dimensions.height - 12}" text-anchor="middle" fill="#5f7280" font-size="10">${escapeHtml(point.key)}</text>`;
  }).join("");
  const legend = series.map((item) => `<span><i style="background:${escapeHtml(item.color)}"></i>${escapeHtml(item.label)}</span>`).join("");
  const empty = values.some((value) => value > 0) ? "" : `<text x="340" y="112" text-anchor="middle" fill="#758693" font-size="15" font-weight="700">此時段暫未有紀錄</text>`;
  return `<figure class="print-chart"><svg viewBox="0 0 ${dimensions.width} ${dimensions.height}" role="img" aria-label="${escapeHtml(yTitle)}">${grid}<line x1="${dimensions.left}" y1="${dimensions.top}" x2="${dimensions.left}" y2="${dimensions.height - dimensions.bottom}" stroke="#9bacb7"/><line x1="${dimensions.left}" y1="${dimensions.height - dimensions.bottom}" x2="${dimensions.width - dimensions.right}" y2="${dimensions.height - dimensions.bottom}" stroke="#9bacb7"/>${lines}${xLabels}${empty}<text x="${dimensions.left}" y="16" fill="#27475e" font-size="11" font-weight="800">${escapeHtml(yTitle)}</text></svg><figcaption>${legend}</figcaption></figure>`;
}

function rangeLabel(master) {
  const first = master.points[0]?.key || "—";
  const last = master.points.at(-1)?.key || first;
  return first === last ? first : `${first} 至 ${last}`;
}

function sourcePage({ snapshot, range, source, pageNumber, pageTotal }) {
  const activity = buildActivitySeries(snapshot, source.id, range);
  const time = buildSourceTimeSeries(snapshot, source.id, range);
  const primaryPeriod = activity.totals[source.primaryMetric] || 0;
  const primaryAll = activity.allTimeTotals[source.primaryMetric] || 0;
  const activitySeries = source.activitySeries.map((item) => ({
    ...item,
    value: (point) => point[item.key] || 0
  }));
  const activeRows = activity.points.map((point, index) => ({
    date: point.key,
    activity: point[source.primaryMetric] || 0,
    time: time.points[index]?.totalMs || 0
  })).filter((row) => row.activity || row.time).slice(-10).reverse();
  const rows = activeRows.length
    ? activeRows.map((row) => `<tr><td>${escapeHtml(row.date)}</td><td>${compactNumber(row.activity)} ${escapeHtml(source.activityUnit)}</td><td>${escapeHtml(formatProgressDuration(row.time))}</td></tr>`).join("")
    : `<tr><td colspan="3">所選時段暫未有紀錄。</td></tr>`;
  const average = source.id === "writingSubmission" ? buildWritingAverageSeries(snapshot, range) : null;
  const averagePanel = average ? `<section class="average-panel"><div><span>全部時間每篇平均</span><strong>${escapeHtml(formatProgressDuration(average.allTimeAverageMs))}</strong></div>${chartSvg({ points: average.points, series: [{ label: "每日平均時間", color: source.color, value: (point) => point.averageMs }], time: true, yTitle: "每篇文章平均寫作時間" })}</section>` : "";
  return `<section class="print-page" style="--accent:${escapeHtml(source.color)}">
    <header class="print-page-header"><div><p>EDMUND STUDENT PROGRESS</p><h1>${escapeHtml(source.labelZh)}</h1><small>${escapeHtml(source.labelEn)}</small></div><span>第 ${pageNumber} / ${pageTotal} 頁</span></header>
    <div class="print-stats"><article><span>所選時段完成</span><strong>${compactNumber(primaryPeriod)} ${escapeHtml(source.activityUnit)}</strong></article><article><span>全部時間完成</span><strong>${compactNumber(primaryAll)} ${escapeHtml(source.activityUnit)}</strong></article><article><span>所選時段學習時間</span><strong>${escapeHtml(formatProgressDuration(time.periodTotalMs))}</strong></article><article><span>全部學習時間</span><strong>${escapeHtml(formatProgressDuration(time.allTimeMs))}</strong></article></div>
    <div class="print-chart-grid">${chartSvg({ points: activity.points, series: activitySeries, yTitle: source.activityTitle })}${chartSvg({ points: time.points, series: [{ label: "每日學習時間", color: source.color, value: (point) => point.totalMs }], time: true, yTitle: "每日學習時間" })}</div>
    ${averagePanel}
    <section class="activity-table"><h2>最近 10 個有紀錄日期（所選時段內）</h2><table><thead><tr><th>日期</th><th>完成量</th><th>學習時間</th></tr></thead><tbody>${rows}</tbody></table></section>
  </section>`;
}

export function buildStudentProgressPrintDocument({ snapshot: snapshotValue, range = "month", selectedSourceIds, viewerLabel = "" } = {}) {
  const snapshot = normalizeProgressSnapshot(snapshotValue);
  const selected = normalizeProgressExportSelection(selectedSourceIds, { defaultAll: true });
  if (!selected.length) throw new RangeError("At least one source must be selected");
  const definitions = selected.map((id) => STUDENT_PROGRESS_SOURCES.find((source) => source.id === id)).filter(Boolean);
  const master = buildMasterTimeSeries(snapshot, range);
  const pageTotal = definitions.length + 1;
  const sourceSeries = definitions.map((source) => ({ label: source.labelZh, color: source.color, sourceId: source.id }));
  const selectedAllTimeTotalMs = definitions.reduce((sum, source) => sum + positiveNumber(master.allTimeBySystem[source.id]), 0);
  const totalLabel = definitions.length === STUDENT_PROGRESS_SOURCES.length ? "全部系統累積學習時間" : "已選系統累積學習時間";
  const overview = `<section class="print-page overview-page" style="--accent:#123a63">
    <header class="print-page-header"><div><p>COMPLETE ENGLISH DEVELOPMENT</p><h1>全面英文能力發展進度表</h1><small>${escapeHtml(snapshot.student.name)}</small></div><span>第 1 / ${pageTotal} 頁</span></header>
    <div class="report-meta"><span><strong>學生：</strong>${escapeHtml(snapshot.student.name)}</span><span><strong>統計時段：</strong>${escapeHtml(rangeLabel(master))}</span><span><strong>報告建立：</strong>${escapeHtml(new Intl.DateTimeFormat("zh-HK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Hong_Kong" }).format(new Date()))}</span>${viewerLabel ? `<span><strong>匯出帳戶：</strong>${escapeHtml(viewerLabel)}</span>` : ""}</div>
    <div class="overview-total"><span>${totalLabel}</span><strong>${escapeHtml(formatProgressDuration(selectedAllTimeTotalMs))}</strong><small>本報告包括 1 頁總覽及 ${definitions.length} 個獨立系統頁面。</small></div>
    <div class="print-chart-grid overview-charts">${chartSvg({ points: master.points, series: [{ label: "已選系統累積", color: "#102a43", emphasis: true, value: (point) => definitions.reduce((sum, source) => sum + positiveNumber(point.cumulativeSystems[source.id]), 0) }, ...sourceSeries.map((source) => ({ ...source, value: (point) => point.cumulativeSystems[source.sourceId] || 0 }))], time: true, yTitle: "已選系統累積時間" })}${chartSvg({ points: master.points, series: [{ label: "每日已選系統總和", color: "#102a43", emphasis: true, value: (point) => definitions.reduce((sum, source) => sum + positiveNumber(point.systems[source.id]), 0) }, ...sourceSeries.map((source) => ({ ...source, value: (point) => point.systems[source.sourceId] || 0 }))], time: true, yTitle: "每日已選系統學習時間" })}</div>
    <section class="included-systems"><h2>本次報告包括</h2><ol>${definitions.map((source) => `<li><i style="background:${escapeHtml(source.color)}"></i>${escapeHtml(source.labelZh)} <small>${escapeHtml(source.labelEn)}</small></li>`).join("")}</ol></section>
  </section>`;
  const pages = definitions.map((source, index) => sourcePage({ snapshot, range, source, pageNumber: index + 2, pageTotal })).join("");
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(snapshot.student.name)}｜全面英文能力發展進度表</title><style>
    @page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}html,body{margin:0;background:#eef3f6;color:#17253a;font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",Arial,sans-serif}body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.print-page{width:190mm;min-height:277mm;margin:12px auto;padding:10mm;background:#fff;break-after:page;page-break-after:always;overflow:hidden;border-top:5px solid var(--accent)}.print-page:last-child{break-after:auto;page-break-after:auto}.print-page-header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;padding-bottom:12px;border-bottom:1px solid #dce5eb}.print-page-header p{margin:0 0 4px;color:var(--accent);font-size:10px;font-weight:900;letter-spacing:.16em}.print-page-header h1{margin:0;font-family:Georgia,"Noto Serif TC",serif;font-size:25px}.print-page-header small{color:#627583}.print-page-header>span{font-weight:800;color:#647987;white-space:nowrap}.report-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;margin:16px 0;padding:12px 14px;background:#f3f7f9;border-radius:10px;font-size:12px}.overview-total{margin:16px 0;padding:22px;background:linear-gradient(135deg,#123a63,#2e6f86);border-radius:14px;color:#fff}.overview-total span,.overview-total small{display:block}.overview-total strong{display:block;margin:7px 0;font-family:Georgia,serif;font-size:34px}.print-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.print-stats article{padding:11px;background:#f4f7f9;border-left:3px solid var(--accent);border-radius:7px}.print-stats span{display:block;color:#667986;font-size:10px}.print-stats strong{display:block;margin-top:5px;font-size:14px}.print-chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.print-chart{margin:0;padding:7px;border:1px solid #dbe4e9;border-radius:8px;background:#fbfdfe}.print-chart svg{display:block;width:100%;height:auto}.print-chart figcaption{display:flex;flex-wrap:wrap;gap:4px 10px;min-height:24px;padding-top:5px;color:#536773;font-size:8px}.print-chart figcaption span{display:inline-flex;align-items:center;gap:4px}.print-chart figcaption i,.included-systems i{width:7px;height:7px;border-radius:50%;display:inline-block;flex:none}.average-panel{display:grid;grid-template-columns:140px 1fr;align-items:center;gap:10px;margin-top:10px}.average-panel>div{padding:12px;background:#f4f7f9;border-radius:8px}.average-panel span,.average-panel strong{display:block}.average-panel span{font-size:10px;color:#667986}.average-panel strong{margin-top:6px;font-size:17px}.activity-table{margin-top:12px}.activity-table h2,.included-systems h2{margin:0 0 7px;font-size:13px}.activity-table table{width:100%;border-collapse:collapse;font-size:10px}.activity-table th,.activity-table td{padding:6px 8px;border:1px solid #dce5ea;text-align:left}.activity-table th{background:#eef4f7}.included-systems{margin-top:18px}.included-systems ol{display:grid;grid-template-columns:1fr 1fr;gap:7px 24px;margin:0;padding-left:24px;font-size:12px}.included-systems li{padding:5px;border-bottom:1px solid #e1e8ec}.included-systems li i{margin-right:7px}.included-systems small{display:block;margin-left:15px;color:#697b88}.overview-charts{margin-top:14px}@media print{html,body{background:#fff}.print-page{margin:0;width:auto;box-shadow:none}}@media(max-width:760px){.print-page{width:100%;min-height:auto;padding:22px}.print-chart-grid,.print-stats,.report-meta,.included-systems ol{grid-template-columns:1fr}.print-page-header{flex-direction:column}.average-panel{grid-template-columns:1fr}}
  </style></head><body>${overview}${pages}</body></html>`;
}

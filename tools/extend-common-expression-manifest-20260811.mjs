#!/usr/bin/env node

// Append only the explicitly requested 11 Aug 2026 Common Expression batch.
// The number ranges below intentionally exclude later PDFs that may already
// exist in Downloads.  Source numbering is preserved separately from the
// stable in-system lesson id (the speaking source has several teacher-issued
// duplicate numbers, so the new source #11 becomes stable lesson #14).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "tools", "common-expression-import-manifest.json");
const sourceDirectory = path.resolve(process.env.COMMON_EXPRESSION_PDF_DIR || "/Users/sammak/Downloads");

const straight = (value) => String(value || "")
  .normalize("NFC")
  .replace(/[\u2018\u2019\u02bc]/g, "'")
  .replace(/\s+/g, " ")
  .trim();

const specs = {
  speaking: [
    [11, 14, "Give me a second", "等我一下"],
    [12, 15, "Not necessarily", "不一定"],
    [13, 16, "Fair enough", "有道理／可以接受"],
    [14, 17, "I see what you mean", "我明白你的意思"],
    [15, 18, "I'm not so sure about that", "我不太確定是否同意"],
    [16, 19, "Whenever you're ready", "您準備好就可以"],
    [17, 20, "I'm glad it worked out", "很高興事情順利解決"],
    [18, 21, "That means a lot (to me)", "這對我意義重大"],
    [19, 22, "I'm glad you brought that up", "很高興您提出這一點"],
    [20, 23, "Thanks for letting me know", "謝謝您告訴我"],
    [21, 24, "Just a heads-up, ...", "先提醒您一下……"],
    [22, 25, "I'm having second thoughts", "我開始重新考慮"],
    [23, 26, "Help yourself", "請自便"],
    [24, 27, "After you", "您先請"],
    [25, 28, "Speaking of which, ...", "說到這件事……"],
    [26, 29, "Sorry, I didn't catch that", "抱歉，我沒有聽清楚"],
    [27, 30, "I'm a big fan of...", "我很喜歡……"],
    [28, 31, "I'm really into...", "我非常喜歡／投入於……"]
  ],
  written: [
    [12, 12, "This may be due to...", "這可能是由於……"],
    [13, 13, "This can be attributed to...", "這可歸因於……"],
    [14, 14, "One possible explanation is that...", "一個可能的解釋是……"],
    [15, 15, "Another factor to consider is...", "另一個需要考慮的因素是……"],
    [16, 16, "One possible solution is to...", "一個可行的解決方法是……"],
    [17, 17, "One way to address this issue is to...", "處理這個問題的一個方法是……"],
    [18, 18, "Steps should be taken to...", "應採取措施……"],
    [19, 19, "More should be done to...", "應採取更多行動……"],
    [20, 20, "It may be necessary to...", "可能有必要……"],
    [21, 21, "It would be beneficial to...", "……將會帶來益處"],
    [22, 22, "Consideration should be given to...", "應考慮……"],
    [23, 23, "Priority should be given to...", "應優先……"],
    [24, 24, "Particular attention should be paid to...", "應特別注意……"],
    [25, 25, "The aim is to...", "目的是……"],
    [26, 26, "This could encourage...", "這可以鼓勵……"],
    [27, 27, "This would allow...", "這將容許……"],
    [28, 28, "This would help to...", "這將有助於……"],
    [29, 29, "It is clear that...", "顯然……"],
    [30, 30, "It appears that...", "看來……"]
  ],
  "rhetorical-speaking": [
    [11, 11, "The way I see it, ...", "依我看來……"],
    [12, 12, "From where I'm standing, ...", "從我的立場來看……"],
    [13, 13, "That's the problem", "這就是問題所在"],
    [14, 14, "That's the point", "這就是重點"],
    [15, 15, "That's the difference", "這就是分別"],
    [16, 16, "That's the key", "這就是關鍵"],
    [17, 17, "That's the catch", "這就是難處"],
    [18, 18, "That's where it gets complicated", "事情就是在這裡變得複雜"],
    [19, 19, "...and that matters", "……而這一點很重要"],
    [20, 20, "Maybe. Maybe not.", "也許是，也許不是"],
    [21, 21, "In theory, yes", "理論上，是的"],
    [22, 22, "In practice? Not so much.", "實際上則未必"],
    [23, 23, "Easier said than done", "說易行難"],
    [24, 24, "Simple idea. Difficult reality.", "概念簡單，現實困難"],
    [25, 25, "That's the tricky part", "這就是棘手之處"],
    [26, 26, "Good idea. Wrong timing.", "好主意，但時機不對"],
    [27, 27, "Same problem. Different context.", "同一問題，不同情境"],
    [28, 28, "Why should that be the case?", "為甚麼會是這樣？"],
    [29, 29, "Why would we / you / X assume that?", "我們／您／X 為甚麼會作此假設？"]
  ],
  "rhetorical-writing": [
    [9, 9, "If X wants..., X / it / they must...", "如果 X 想……，就必須……"],
    [10, 10, "If X fails to..., X / it / they risk(s)...", "如果 X 未能……，便有可能……"],
    [11, 11, "The more..., the more...", "越……，越……"],
    [12, 12, "Whether..., whether..., or whether...", "無論……、……還是……"],
    [13, 13, "In X, in Y, and in Z, ...", "在 X、Y 和 Z 中……"],
    [14, 14, "We see it in..., we see it in..., and we see it in...", "我們在……、……和……中都可看見"],
    [15, 15, "X requires..., demands..., and ultimately depends on...", "X 需要……、要求……，最終取決於……"],
    [16, 16, "To..., to..., and to...", "以三組不定詞建立平行結構"],
    [17, 17, "Not..., not..., but...", "不是……，不是……，而是……"],
    [18, 18, "Can we really afford to ignore...?", "我們真的承受得起忽視……的代價嗎？"],
    [19, 19, "Is that necessarily a bad thing?", "那就一定是壞事嗎？"],
    [20, 20, "If not now, when?", "如果不是現在，更待何時？"],
    [21, 21, "What does this mean in practice? It means...", "這在實際上意味著甚麼？這意味著……"],
    [22, 22, "What, then, should be done?", "那麼，應該怎樣做？"],
    [23, 23, "What explains this difference? One answer is...", "如何解釋這個差異？其中一個答案是……"],
    [24, 24, "Can this be achieved? Yes, but only if...", "能否做到？可以，但前提是……"],
    [25, 25, "It is not a question of..., but of...", "問題不在於……，而在於……"],
    [26, 26, "The issue is not whether..., but how...", "問題不在於是否……，而在於如何……"],
    [27, 27, "It is easy to...; it is much harder to...", "……很容易；真正困難的是……"],
    [28, 28, "What appears to be... may actually be...", "看似……的事物，實際上可能……"],
    [29, 29, "One may gain..., but lose...", "人可能得到……，卻失去……"]
  ],
  "professional-message": [
    [9, 9, "I'll sort it", "我會處理"],
    [10, 10, "I'll take care of it", "我會處理好"],
    [11, 11, "I'll handle it from here", "接下來由我處理"],
    [12, 12, "I've got this", "這件事我來處理"],
    [13, 13, "All sorted", "全部處理好了"],
    [14, 14, "That's sorted now", "那件事現在已處理好"],
    [15, 15, "We're good to go", "我們可以開始了"],
    [16, 16, "All set on my side", "我這邊已準備妥當"],
    [17, 17, "Everything's in place", "一切準備就緒"],
    [18, 18, "We're all set", "我們都準備好了"],
    [19, 19, "That's been taken care of", "那件事已處理妥當"],
    [20, 20, "I've got it covered", "我已安排妥當"],
    [21, 21, "Will do", "我會辦妥"],
    [22, 22, "Looks good to me", "我看沒有問題"],
    [23, 23, "Works perfectly", "完全可行"],
    [24, 24, "That'll work", "這樣可行"],
    [25, 25, "That's doable", "這做得到"],
    [26, 26, "That can be arranged", "這可以安排"],
    [27, 27, "We can make that work", "我們可以配合"]
  ],
  "business-speaking": [
    [9, 9, "Thanks for everything", "感謝您一直以來的一切"],
    [10, 10, "I've really enjoyed being part of the team", "很高興能成為團隊一員"],
    [11, 11, "I'm taking some time to figure out what I want to do next", "我正花點時間思考下一步"],
    [12, 12, "I'm keeping my options open", "我暫時保留不同選擇"],
    [13, 13, "I've sent out a few applications", "我已投了幾份申請"],
    [14, 14, "I'm waiting to hear back", "我正等待回覆"],
    [15, 15, "I'll keep looking", "我會繼續尋找"],
    [16, 16, "I think I'm ready for more", "我想我已準備好迎接更多"],
    [17, 17, "Things have been pretty busy lately", "最近工作相當忙碌"],
    [18, 18, "It's been a hectic few weeks", "過去幾星期非常忙碌"],
    [19, 19, "We've got a lot going on", "我們手上有很多事情"],
    [20, 20, "There's a lot to get through", "還有很多事情要處理"],
    [21, 21, "We're getting there", "我們正逐步接近目標"],
    [22, 22, "We're making good progress", "我們進展良好"],
    [23, 23, "We're heading in the right direction", "我們正朝正確方向前進"],
    [24, 24, "We've still got a long way to go", "我們還有很長的路要走"],
    [25, 25, "There's still plenty of work to do", "還有很多工作要做"],
    [26, 26, "It's starting to come together", "事情開始成形／順利整合"]
  ]
};

const patterns = {
  speaking: (number) => new RegExp(`^Common Expressions? ${number}(?:\\s*-)?`, "i"),
  written: (number) => new RegExp(`^Written Expression ${number}\\s*-`, "i"),
  "rhetorical-speaking": (number) => new RegExp(`^Rhetorical Speaking (?:Common Expression|Series) ${number}\\s*-`, "i"),
  "rhetorical-writing": (number) => new RegExp(`^Rhetorical Writing Common Expression ${number}\\s*-`, "i"),
  "professional-message": (number) => new RegExp(`^Professional Communication Common Expression ${number}\\s*-`, "i"),
  "business-speaking": (number) => new RegExp(`^Business _ Commercial Speaking Common Expression ${number}\\s*-?`, "i")
};

const existing = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const existingFiles = new Set(existing.map(({ file }) => file));
const sourceFiles = fs.readdirSync(sourceDirectory).filter((file) => file.toLowerCase().endsWith(".pdf"));
const additions = [];

for (const [systemKey, entries] of Object.entries(specs)) {
  for (const [sourceNumber, idNumber, titleEn, titleZh] of entries) {
    const matches = sourceFiles.filter((file) => patterns[systemKey](sourceNumber).test(straight(file)) && !existingFiles.has(file));
    if (matches.length !== 1) {
      throw new Error(`${systemKey} source #${sourceNumber}: expected one new PDF, found ${matches.length}: ${matches.join(", ")}`);
    }
    additions.push({ systemKey, idNumber, sourceNumber, file: matches[0], titleEn, titleZh });
  }
}

if (additions.length !== 114) throw new Error(`Expected 114 requested additions, found ${additions.length}`);

const merged = [...existing, ...additions];
const keys = new Set();
for (const entry of merged) {
  const key = `${entry.systemKey}:${entry.idNumber}`;
  if (keys.has(key)) throw new Error(`Duplicate stable lesson id: ${key}`);
  keys.add(key);
}

fs.writeFileSync(manifestPath, `${JSON.stringify(merged, null, 2)}\n`);
console.log(JSON.stringify({ existing: existing.length, added: additions.length, total: merged.length }, null, 2));

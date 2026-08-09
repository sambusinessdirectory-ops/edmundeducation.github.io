#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const sourcePath = path.resolve(process.argv[2] || "tmp/pdfs/2025-b2-paper3.txt");
const outputPath = path.resolve(process.argv[3] || "dse-paper3-analysis-data.js");

const ANALYSIS_SECTIONS = Object.freeze([
  { id: "orientation", title: "分析方法、三項任務與 Situation", pages: [5, 7], summary: "先掌握六類標記、三項寫作任務、身份和資料來源，再開始逐份 Data File 分析。" },
  { id: "listening-notes", title: "Listening note-taking sheet", pages: [8, 9], summary: "分辨 Asian Games Week 的干擾資料，以及 Wellness Month 真正可用的錄音線索。" },
  { id: "boss-letter", title: "Email from Mr John Duncan to Nico Lin (boss letter)", pages: [10, 16], summary: "由主管電郵鎖定三項任務、硬性要求、資料來源與錄音更新線索。" },
  { id: "duncan-henley-emails", title: "Emails between Mr John Duncan and Ms Melissa Henley", pages: [17, 26], summary: "比較 2024 舊活動與 2025 決定，找出保留、更新及淘汰的 Wellness Month 內容。" },
  { id: "wellness-poster", title: "Email attachment - poster for Wellness Month 2024", pages: [27, 32], summary: "逐項審視舊海報，只保留已獲 2025 文件或錄音確認的活動與特色。" },
  { id: "student-interview", title: "Transcript of an interview during the 2024 Wellness Month", pages: [33, 40], summary: "抽取 Task 1 所需的學生意見，以及 Task 3 可用的家長義工經驗。" },
  { id: "whatsapp-chat", title: "WhatsApp chat between Ms Melissa Henley and Dr David Chan", pages: [41, 47], summary: "整理 Sports Day at the Beach 的目的、選擇標準、場地考慮及批准條件。" },
  { id: "duncan-singh-emails", title: "Emails between Mr John Duncan and Mr Manraj Singh", pages: [48, 54], summary: "找出家長義工的實際職責、參與方法，以及海灘交通和場地篩選資料。" },
  { id: "influator-blog", title: "Email attachment - 'The Influator' blog", pages: [55, 59], summary: "把家長參與研究轉化為 Task 3 可用的好處，同時避開只屬作者個人意見的內容。" },
  { id: "sports-email", title: "Email from Mr John Duncan to Ms Melissa Henley", pages: [60, 62], summary: "把運動文章連回 Task 2，並鎖定選擇或淘汰個別運動的線索。" },
  { id: "sports-article", title: "Email attachment - a magazine article on sports", pages: [63, 71], summary: "比較各項運動是否新鮮、容易入門、具文化特色及足夠活躍。" },
  { id: "podcast", title: "PODCAST Recording Transcript", pages: [72, 86], summary: "利用較新的錄音決定覆蓋舊資料，確認主題、活動賣點、義工安排與報名方法。" },
  { id: "final-integration", title: "最後整合核心答案", pages: [87, 91], summary: "把所有資料整合成 Task 1、Task 2 和 Task 3 的最終可用內容及淘汰清單。" }
]);

const ESSAYS = Object.freeze([
  {
    id: "task-1",
    task: "Task 1",
    format: "School Magazine Article",
    title: "A Relaxing and Rewarding Wellness Month",
    page: 2,
    blocks: [
      "Task 1 - School Magazine Article",
      "A Relaxing and Rewarding Wellness Month",
      "Three Returning Highlights",
      "This July, after the examination period, students will once again have the chance to rest and refresh themselves through Wellness Month. With the theme \"Relax and Recover\", this year's programme will certainly be both meaningful and enjoyable.",
      "Firstly, the Crafting Session will return this year. Instead of focusing on South America, it will introduce arts and crafts from Asian countries, making it more relevant to students in Hong Kong. Secondly, the Wellness Fair will also be held again. Students can receive exercise advice and learn about self-care resources there. In addition, interactive booths will be added this year to make the event even more interesting. Finally, the popular Yoga and Meditation Sessions will return. Besides helping students relax, yoga can also improve focus and attention span. Moreover, two famous instructors will be invited.",
      "What Students Said Last Year",
      "Last year's Wellness Month was very well received. Students said that it gave them a chance to unwind after exams, helped them feel more prepared for next year's studies, and offered a wide variety of useful and meaningful activities. Some also said that they could let their creativity run loose, pick up healthy habits, and benefit from the exercise advice provided. With so many enjoyable programmes, this year's Wellness Month will certainly be worth joining."
    ]
  },
  {
    id: "task-2",
    task: "Task 2",
    format: "Proposal",
    title: "Proposal on Sports Day at the Beach",
    page: 3,
    blocks: [
      "Task 2 - Proposal",
      "Proposal on Sports Day at the Beach",
      "Introduction",
      "This proposal aims to explain why Sports Day at the Beach should be included in this year's Wellness Month and to recommend two suitable sports for the event.",
      "Suggested Activities",
      "Firstly, this new event would allow students to try new sports, learn about different cultures, and spend quality time outdoors. It would also be a more interesting and inclusive activity while encouraging students to become more physically active.",
      "Secondly, it is suggested that Sepak Takraw and Kabaddi be chosen. Sepak Takraw is a sport from Southeast Asia and is similar to volleyball, although it is played without hands. It is easy for beginners to learn and also provides excellent exercise. Kabaddi, which comes from India, is also suitable because it is fun, physically challenging, and easy for newcomers to pick up. In this sport, players try to tag others while holding their breath. Both sports are likely to be new to our students and are enjoyable for beginners.",
      "Venue",
      "It is suggested that the event be held at Cafeteria Beach. Stanley is not suitable due to traffic problems, while parking near Cheung Sha Beach is difficult.",
      "Conclusion",
      "It is hoped that the above suggestions will be found useful and that this new event will be approved."
    ]
  },
  {
    id: "task-3",
    task: "Task 3",
    format: "Letter to Parents",
    title: "Letter to Parents - Wellness Month Volunteers",
    page: 4,
    blocks: [
      "Task 3 - Letter to Parents",
      "Dear Parents,",
      "You are cordially invited to serve as volunteers for this year's Wellness Month.",
      "Firstly, parent volunteers can bring many benefits to our school events. Your involvement can help create a more positive atmosphere for students, allow them to interact with adults other than their teachers, and help them feel more relaxed during school events. In addition, last year's volunteers found the experience enjoyable and worthwhile. Many parents also had the opportunity to get to know other parents and teachers better.",
      "Secondly, regarding the responsibilities of parent volunteers, you may be asked to assist with administrative duties, such as taking attendance, and to remain at your chosen event in case students require help. Please be assured that teachers, rather than parents, will prepare students for the activities.",
      "Lastly, if you are interested in becoming a volunteer, we would be most grateful if you could sign up through the school app. In addition, a briefing session will be arranged before the events begin so that all volunteers can understand their duties clearly.",
      "Should you have any enquiries, please do not hesitate to contact us. We would be more than happy to provide further information. Thank you very much for your attention, and we look forward to your support.",
      "Yours faithfully,",
      "Nico Lin",
      "President, Healthy Living Club"
    ]
  }
]);

function normalizeTypography(value) {
  return String(value || "")
    .replace(/[\u2018\u2019\u201B\u2032\uFF07]/g, "'")
    .replace(/[\u201C\u201D\u201F\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00a0/g, " ");
}

function normalizeLine(value) {
  return normalizeTypography(value).replace(/\s+/g, " ").trim();
}

function isBoilerplate(line) {
  return line.startsWith("Edmund Education -")
    || line.startsWith("有免費每日通訊學英文")
    || line.startsWith('"- Knowledge pays the highest dividends')
    || line.startsWith("港大畢業, 基因工程")
    || /^\d+年專業英語導師\s+Sir$/i.test(line);
}

function parsePages(text) {
  const parts = normalizeTypography(text).split(/===== PAGE (\d+) =====/).slice(1);
  const pages = new Map();
  for (let index = 0; index < parts.length; index += 2) {
    pages.set(Number(parts[index]), parts[index + 1] || "");
  }
  return pages;
}

function shouldStartFresh(line) {
  return /^(?:[●•]|Task\s+\d|重點：|分析：|類型\s*\d*：|類型：|=\s|\[[^\]]|"|Dear\s|Yours\s|Introduction$|Suggested Activities$|Venue$|Conclusion$|Three Returning Highlights$|What Students Said Last Year$)/i.test(line);
}

function blocksForPage(rawPage) {
  const blocks = [];
  let buffer = [];
  let blankRun = 0;

  const flush = () => {
    const value = normalizeLine(buffer.join(" "));
    if (value && !isBoilerplate(value)) blocks.push(value);
    buffer = [];
  };

  for (const rawLine of String(rawPage || "").split(/\r?\n/)) {
    const line = normalizeLine(rawLine);
    if (!line) {
      blankRun += 1;
      continue;
    }
    if (isBoilerplate(line)) {
      flush();
      blankRun = 0;
      continue;
    }
    if (blankRun >= 3 || (buffer.length && shouldStartFresh(line))) flush();
    blankRun = 0;
    buffer.push(line);
    if (/^[●•]/.test(line) || /^類型/.test(line) || /^重點：$/.test(line) || /^分析：$/.test(line)) flush();
  }
  flush();

  return blocks.filter((block) => block.length > 1);
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function buildData(sourceText) {
  const pages = parsePages(sourceText);
  const essays = ESSAYS.map((essay) => ({
    ...essay,
    blocks: essay.blocks.map(normalizeLine)
  }));
  const analysisSections = ANALYSIS_SECTIONS.map((section, sectionIndex) => ({
    ...section,
    order: sectionIndex + 1,
    pageCount: section.pages[1] - section.pages[0] + 1,
    pages: range(section.pages[0], section.pages[1]).map((pageNumber) => ({
      pageNumber,
      blocks: blocksForPage(pages.get(pageNumber))
    }))
  }));

  return {
    version: 1,
    generatedFrom: "2025 B2 - DSE - Paper 3 - Integrated Skills - 5__Benchmark Essays.pdf",
    years: range(2012, 2025).reverse(),
    levels: [
      { id: "b1", label: "B1" },
      { id: "b2", label: "B2" }
    ],
    materialTypes: [
      { id: "model-essay", titleZh: "實用文範文", titleEn: "Model Essay" },
      { id: "data-file-analysis", titleZh: "Data File 分析", titleEn: "Data File Analysis" }
    ],
    resources: {
      "2025-b2": {
        year: 2025,
        level: "B2",
        modelEssays: essays,
        analysisSections
      }
    }
  };
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Source extraction not found: ${sourcePath}`);
  process.exit(1);
}

const data = buildData(fs.readFileSync(sourcePath, "utf8"));
const output = `/* Generated by tools/build-dse-paper3-analysis-data.mjs. */\nwindow.EDMUND_DSE_PAPER3_DATA = Object.freeze(${JSON.stringify(data, null, 2)});\n`;
fs.writeFileSync(outputPath, output, "utf8");
console.log(`Wrote ${outputPath}`);
console.log(`Essays: ${data.resources["2025-b2"].modelEssays.length}`);
console.log(`Analysis sections: ${data.resources["2025-b2"].analysisSections.length}`);
console.log(`Analysis pages: ${data.resources["2025-b2"].analysisSections.reduce((sum, section) => sum + section.pages.length, 0)}`);

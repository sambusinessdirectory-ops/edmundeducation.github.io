(function registerEddyDialogueBoxes() {
  "use strict";

  const files = [
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-after-lunch-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-afternoon-tea-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-bedtime-pyjamas-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-bubble-gum-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-coffee-break-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-cotton-candy-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-english-difference-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-english-usage-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-evening-teddy-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-finishing-work-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-fun-fact-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-gaming-time-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-lunchtime-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-midnight-snack-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-morning-coffee-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-morning-strength-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-new-announcement-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-offline-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-password-error-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-saturday-grocery-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-saturday-plant-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-sunday-couch-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-sunday-hobbies-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-closet-purchase-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-coin-wallet-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-error-identifier-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-first-question-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-tenth-question-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-twentieth-question-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-thirtieth-question-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-fortieth-question-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-five-streak-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-ten-streak-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-fifteen-streak-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-twenty-streak-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-twenty-five-streak-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-thirty-streak-alien.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-thirty-five-streak-gentleman.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-lost-streak-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-grammar-daily-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-pomodoro-tomato-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-empty-day-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-two-day-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-three-day-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-four-day-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-five-day-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-six-day-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-seven-day-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-eight-day-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-nine-day-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-ten-day-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-two-day-incomplete-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-schedule-three-day-incomplete-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-high-confidence-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-high-motivation-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-low-attention-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-low-concentration-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-low-motivation-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-self-rating-low-stress-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-song-appreciation-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-student-progress-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-three-wrong-mc-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-two-wrong-mc-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-writing-ielts-bars-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-writing-ielts-lines-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-writing-ielts-maps-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-writing-ielts-mixed-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-writing-ielts-pies-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-writing-ielts-process-dialogue.png",
    "https://edmund-public-media.edmundeducation.workers.dev/eddy-writing-ielts-tables-dialogue.png", "https://edmund-public-media.edmundeducation.workers.dev/eddy-writing-submission-dialogue.png"
  ];

  const frontPage = new Set(files.slice(0, 23));
  const numberWords = Object.freeze({ first: 1, five: 5, tenth: 10, ten: 10, fifteen: 15, twentieth: 20, twenty: 20, "twenty-five": 25, thirtieth: 30, thirty: 30, "thirty-five": 35, fortieth: 40 });
  const titleReplacements = Object.freeze({
    ielts: "IELTS", mc: "MC", eddy: "Eddy", pomodoro: "Pomodoro"
  });

  function idFromFile(file) {
    const path = String(file).split(/[?#]/, 1)[0];
    const name = path.slice(path.lastIndexOf("/") + 1);
    return name.replace(/\.(png|jpe?g|webp)$/i, "");
  }

  function titleFromId(id) {
    return id.replace(/^eddy-/, "").replace(/-dialogue$/, "").split("-").map(word => (
      titleReplacements[word] || word.charAt(0).toUpperCase() + word.slice(1)
    )).join(" ");
  }

  function milestone(id, suffix) {
    const key = Object.keys(numberWords).find(word => id.includes(`-${word}-`));
    return key ? `達到連續 ${numberWords[key]} ${suffix}` : "達到指定學習里程碑時出現。";
  }

  function triggerFor(id, group) {
    if (id.includes("password-error")) return "在首頁或學習系統輸入錯誤學生密碼時出現。";
    if (id.includes("offline")) return "偵測到裝置離線或網絡中斷時出現。";
    if (id.includes("new-announcement")) return "首頁有新的 EdmundEducation 公告時出現。";
    if (id.includes("english-difference")) return "在首頁開啟英式與美式英文差異提示時出現。";
    if (id.includes("english-usage")) return "在首頁開啟英文用法提示時出現。";
    if (id.includes("fun-fact")) return "在首頁顯示 Eddy 英文趣聞時出現。";
    if (group === "front-page") return "在首頁符合相應日期、時間或休息情境時出現。";
    if (id.includes("question")) return milestone(id, "題時出現。" );
    if (id.includes("streak") && id.includes("lost")) return "學生的連續答對紀錄中斷時出現。";
    if (id.includes("streak")) return milestone(id, "題答對時出現。" );
    if (id.includes("schedule-empty-day")) return "功課系統偵測到本週有空白日程時出現。";
    if (id.includes("schedule") && id.includes("incomplete")) return "功課系統偵測到連續多日仍有未完成功課時出現。";
    if (id.includes("schedule")) return "在功課系統達到相應的連續登入或安排日數時出現。";
    if (id.includes("self-rating")) return "學生提交相應的每日自我評分後出現。";
    if (id.includes("pomodoro")) return "在功課系統使用番茄鐘專注功能時出現。";
    if (id.includes("coin-wallet")) return "學生開啟 Edmund Coin 錢包詳情時出現。";
    if (id.includes("closet-purchase")) return "學生在角色衣櫥成功購買物品時出現。";
    if (id.includes("grammar")) return "在 Grammar 系統完成每日語法學習時出現。";
    if (id.includes("error-identifier")) return "在 Error Identifier 系統進行錯因練習時出現。";
    if (id.includes("song-appreciation")) return "學生進入 Song Appreciation 學習空間時出現。";
    if (id.includes("student-progress")) return "學生查看全面英文能力發展進度時出現。";
    if (id.includes("wrong-mc")) return "學生在選擇題連續答錯相應次數時出現。";
    if (id.includes("writing-ielts")) return "學生在 IELTS Writing Task 1 選擇相應圖表類型時出現。";
    if (id.includes("writing-submission")) return "學生進入或使用 Writing Submission 交文系統時出現。";
    return "在對應的已登入學習系統與學習情境中出現。";
  }

  function soundEffectFor(id, group) {
    const audioFiles = {
      "eddy-bedtime-pyjamas-dialogue": "/ui-sounds/eddy-pyjama-night.mp3",
      "eddy-english-difference-dialogue": "/ui-sounds/homepage-dialogue-next.mp3",
      "eddy-english-usage-dialogue": "/ui-sounds/homepage-dialogue-next.mp3",
      "eddy-fun-fact-dialogue": "/ui-sounds/homepage-dialogue-next.mp3",
      "eddy-new-announcement-dialogue": "/ui-sounds/public-announcement.mp3",
      "eddy-password-error-dialogue": "/ui-sounds/wrong-login.mp3",
      "eddy-schedule-two-day-incomplete-dialogue": "/ui-sounds/homework-two-days-incomplete.mp3"
    };
    if (audioFiles[id]) return audioFiles[id];
    if (group === "front-page") return "內建 Web Audio · eddy-global-dialogues.js";
    if (id.includes("question")) return "內建 Web Audio · eddy-first-question-dialogue.js";
    if (id.includes("streak")) return "內建 Web Audio · eddy-five-streak-dialogue.js";
    if (/^eddy-schedule-(two|three|four|five|six|seven|eight|nine|ten)-day-dialogue$/.test(id)) return "內建 Web Audio · eddy-schedule-two-day-dialogue.js";
    return "";
  }

  const registry = files.map((file, index) => {
    const id = idFromFile(file);
    const group = frontPage.has(file) ? "front-page" : "user-system";
    return Object.freeze({
      id,
      file: `eddy-dialogue-crops/${id}.jpg`,
      title: titleFromId(id),
      group,
      order: index + 1,
      trigger: triggerFor(id, group),
      remarks: Object.freeze([]),
      soundEffect: soundEffectFor(id, group)
    });
  });

  window.EDMUND_EDDY_DIALOGUE_REGISTRY = Object.freeze(registry);
})();

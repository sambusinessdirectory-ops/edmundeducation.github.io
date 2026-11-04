(() => {
  "use strict";

  const copy = {
    en: {
      documentTitle: "Chip Design Course | EdmundEducation", languageLabel: "Language",
      cardNumber: "CARD 70 · CHIP DESIGN COURSE", eyebrow: "One small chip, one step at a time",
      pageTitle: "Chip Design Course", pageIntro: "Start with the smallest useful design: a low-voltage LED blinker.",
      adminAccess: "Administrator access", signIn: "Sign in", loginHelp: "Enter the course administrator username and password to open Lesson 1.",
      username: "Username", password: "Password", openCourse: "Open the course", lessonNumber: "LESSON 01", signOut: "Sign out",
      rulesTitle: "What the chip does", wordsTitle: "Plain words", fileOne: "File 1 · led_blinker.v", designTitle: "The chip design",
      editDesign: "Edit the design", restoreExample: "Restore example", downloadDesign: "Download design file",
      tryHere: "Try it here", labTitle: "LED blinker tool",
      labHelp: "This browser tool reads the design you edited above. [Simulation; a computer copy of how the chip would behave.] Try changing the last 1'b0 to 1'b1, then click Check design.",
      labLimit: "This first tool understands the small set of Verilog rules used in this lesson. It does not build a physical chip.",
      runEightHelp: "Run 8 beats shows four full blinks in about four seconds.", enableBlinking: "Enable blinking",
      reset: "Reset", oneBeat: "One clock beat", runEight: "Run 8 beats", checkDesign: "Check design",
      traceCaption: "What happened at each step", step: "Step", enable: "Enable",
      fileTwo: "File 2 · led_blinker_tb.v", testTitle: "The computer test", runTestTitle: "Run the test",
      runTestHelp: "The Check design button above runs the on/off checks in this browser. To run the separate test file on your computer, save the two files with the names above and use these commands:",
      chipLinkTitle: "How this leads to a chip",
      chipLinkBody: "The code sets the LED's on and off rules. This page lets you check those rules. Later, [synthesis; software that turns the code into connected logic gates.] and [physical design; software that places and wires those gates on a chip.] prepare a design for manufacturing. This page teaches the first design and check step.",
      readMore: "Read more:", yosysLink: "Yosys: turning code into gates", openroadLink: "OpenROAD: placing and wiring gates",
      backLink: "← Back to all learning systems",
      connectionUnavailable: "Course connection is unavailable.", connectionFailed: "The course could not connect. Please try again.",
      sessionEnded: "Your sign-in has ended. Please sign in again.", lessonUnavailable: "Lesson 1 is not available yet.",
      signInFailed: "Sign-in failed. Check the details. After several failed attempts, wait 15 minutes.", signedOut: "Signed out.",
      ledOn: "LED ON", ledOff: "LED OFF", on: "On", off: "Off", resetRow: "Reset", resetAgainRow: "Reset again", disabledRow: "Disabled", clockRow: n => `Clock ${n}`,
      resetComplete: "Reset complete. Click One clock beat to move forward.", oneBeatFinished: "One clock beat finished.",
      beatsFinished: n => `${n} clock beats finished.`, blinkingNow: "Blinking now: two clock beats each second.",
      eightFinished: "Eight clock beats finished.", pass: "PASS: the LED turns on, off, stays off when disabled, and resets.",
      checkFailed: (step, expected, actual) => `CHECK FAILED at ${step}: expected LED ${expected}, got ${actual}.`,
      designError: detail => `Design error: ${detail}`, designChanged: "Design changed. Click Reset or Check design to run the new rules.",
      errorUnsupported: "This code uses a rule this small tool does not understand.", errorExpected: "A required part of the code is missing or misplaced.",
      errorSignals: "Use only led, enable, reset_n, 1'b0, or 1'b1 in a rule.", errorBeginEnd: "A begin block needs an end.",
      errorOneBlock: "This lesson supports one always block only.", errorTooLong: "Keep the design under 12,000 characters.",
      errorHeader: "Start with module led_blinker and its four lesson pins.", errorPins: "Keep the four lesson pins: clk, reset_n, enable, and led.",
      errorClock: "Use the lesson clock and reset line in the always block.", errorFooter: "Finish the design with endmodule."
    },
    "zh-Hant": {
      documentTitle: "晶片設計課程 | EdmundEducation", languageLabel: "語言",
      cardNumber: "第 70 卡 · 晶片設計課程", eyebrow: "一步一步設計一顆小晶片",
      pageTitle: "晶片設計課程", pageIntro: "從最簡單的實用設計開始：低電壓 LED 閃燈。",
      adminAccess: "管理員專用", signIn: "登入", loginHelp: "輸入課程管理員的用戶名稱和密碼，開啟第一課。",
      username: "用戶名稱", password: "密碼", openCourse: "開啟課程", lessonNumber: "第一課", signOut: "登出",
      rulesTitle: "晶片會做甚麼", wordsTitle: "簡單詞語", fileOne: "檔案 1 · led_blinker.v", designTitle: "晶片設計",
      editDesign: "修改設計", restoreExample: "還原範例", downloadDesign: "下載設計檔案",
      tryHere: "在這裏試試", labTitle: "LED 閃燈工具",
      labHelp: "這個瀏覽器工具會讀取你在上面修改的設計。[模擬；用電腦模仿晶片的行為。] 試把最後一個 1'b0 改成 1'b1，然後按「檢查設計」。",
      labLimit: "這個入門工具只懂本課所用的一小部分 Verilog 規則，並不會製造實體晶片。",
      runEightHelp: "按「執行 8 拍」，約四秒可看到四次完整閃燈。", enableBlinking: "啟用閃燈",
      reset: "重設", oneBeat: "執行一拍", runEight: "執行 8 拍", checkDesign: "檢查設計",
      traceCaption: "每一步發生了甚麼", step: "步驟", enable: "啟用",
      fileTwo: "檔案 2 · led_blinker_tb.v", testTitle: "電腦測試", runTestTitle: "執行測試",
      runTestHelp: "上面的「檢查設計」會在瀏覽器檢查開關燈。要在自己的電腦執行另一個測試檔案，請按上面的名稱儲存兩個檔案，再輸入以下指令：",
      chipLinkTitle: "這與製造晶片有甚麼關係？",
      chipLinkBody: "程式訂下 LED 何時亮、何時滅的規則。本頁讓你先檢查規則。之後，[邏輯綜合；把程式轉成互相連接的邏輯閘。] 和 [實體設計；把邏輯閘放到晶片上並接線。] 會準備製造所需的設計。本頁教的是第一步：設計和檢查。",
      readMore: "延伸閱讀：", yosysLink: "Yosys：把程式轉成邏輯閘", openroadLink: "OpenROAD：排列邏輯閘並接線",
      backLink: "← 返回所有學習系統",
      connectionUnavailable: "目前無法連接課程。", connectionFailed: "無法連接課程，請再試一次。",
      sessionEnded: "登入已過期，請重新登入。", lessonUnavailable: "第一課暫時無法開啟。",
      signInFailed: "登入失敗，請檢查資料。若多次登入失敗，請等 15 分鐘再試。", signedOut: "已登出。",
      ledOn: "LED 亮", ledOff: "LED 滅", on: "開", off: "關", resetRow: "重設", resetAgainRow: "再次重設", disabledRow: "停用", clockRow: n => `第 ${n} 拍`,
      resetComplete: "重設完成。按「執行一拍」繼續。", oneBeatFinished: "已執行一拍。",
      beatsFinished: n => `已執行 ${n} 拍。`, blinkingNow: "正在閃燈：每秒執行兩拍。",
      eightFinished: "已執行八拍。", pass: "通過：LED 會亮、會滅，停用時保持熄滅，也能重設。",
      checkFailed: (step, expected, actual) => `在「${step}」檢查失敗：LED 應該${expected}，實際卻是${actual}。`,
      designError: detail => `設計有錯：${detail}`, designChanged: "設計已修改。按「重設」或「檢查設計」來執行新規則。",
      errorUnsupported: "程式使用了這個入門工具不懂的規則。", errorExpected: "程式缺少必要部分，或把它放錯位置。",
      errorSignals: "規則只能使用 led、enable、reset_n、1'b0 或 1'b1。", errorBeginEnd: "begin 區塊需要一個 end。",
      errorOneBlock: "本課只支援一個 always 區塊。", errorTooLong: "設計不可超過 12,000 個字元。",
      errorHeader: "程式應以 module led_blinker 和四個指定接腳開始。", errorPins: "請保留四個指定接腳：clk、reset_n、enable 和 led。",
      errorClock: "請在 always 區塊使用本課的時鐘和重設線。", errorFooter: "請用 endmodule 結束設計。"
    }
  };

  let language = "en";
  try {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    language = fromUrl === "zh-Hant" || fromUrl === "en" ? fromUrl : localStorage.getItem("chip-course-language") || "en";
  } catch { /* Storage may be unavailable. */ }
  if (!copy[language]) language = "en";

  function t(key, ...args) {
    const value = copy[language][key] ?? copy.en[key] ?? "";
    return typeof value === "function" ? value(...args) : value;
  }

  function setLanguage(next) {
    if (!copy[next]) return;
    language = next;
    document.documentElement.lang = next;
    document.title = t("documentTitle");
    document.querySelector(".language-switch").setAttribute("aria-label", t("languageLabel"));
    document.querySelectorAll("[data-i18n]").forEach(element => { element.textContent = t(element.dataset.i18n); });
    document.getElementById("lang-en").setAttribute("aria-pressed", String(next === "en"));
    document.getElementById("lang-zh").setAttribute("aria-pressed", String(next === "zh-Hant"));
    try { localStorage.setItem("chip-course-language", next); } catch { /* Preference remains for this page. */ }
    document.dispatchEvent(new Event("chip-course-language-change"));
  }

  window.ChipCourseI18n = { t, getLanguage: () => language, setLanguage };
  document.getElementById("lang-en").addEventListener("click", () => setLanguage("en"));
  document.getElementById("lang-zh").addEventListener("click", () => setLanguage("zh-Hant"));
  setLanguage(language);
})();

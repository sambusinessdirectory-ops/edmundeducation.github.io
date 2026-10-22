/* Editorial pilot for the first five idioms. Existing question IDs and answers remain unchanged. */
(function defineIdiomCompass() {
  const lessons = {
    "idiom-01": {
      meaningZh: "有人先採取行動，讓討論、活動或計劃真正開始。",
      meaningEn: "Take the first useful step so a shared activity can begin.",
      picture: "靜止的球，需要第一下推動。",
      boundary: "重點是帶動後續進展；只說一件孤立的小事開始，通常直接用 start 更自然。",
      where: "小組討論、會議、項目起步",
      tone: "友善、中性；日常和工作場合都自然。",
      formal: "正式法律或學術文稿可用 initiate 或 launch。",
      fixed: "the ball rolling",
      moving: "start 可按時態變成 starts、started、starting；後面三個字不變。",
      forms: ["start the ball rolling", "started the ball rolling", "starting the ball rolling"],
      checks: ["是否有人或事物踏出第一步？", "這一步是否推動其他人或下一步？", "有否保留 the ball rolling 的次序？"],
      choices: {
        2: { promptZh: "哪個情境最適合？", promptEn: "Which scene fits?", options: ["一位組員先提出問題，其他人開始討論。", "一位同學每天獨自準時起床。", "一場已進行兩小時的會議正在結束。"], correct: 0, feedback: "第一個問題打開局面，讓其他人接得上。" },
        3: { promptZh: "在非常正式的法律報告中，哪種說法較穩妥？", promptEn: "Choose the safer register.", options: ["使用 initiate，清楚交代程序。", "每段都用這個慣用語。", "用它代替所有形式的 start。"], correct: 0, feedback: "慣用語適合談話和一般工作溝通；法律報告宜選更準確的動詞。" },
        5: { promptZh: "朋友說小組還未開始討論。你會怎樣推進？", promptEn: "Choose the next move.", options: ["先拋出一個可討論的問題。", "只說時間過得很快。", "宣布討論已經結束。"], correct: 0, feedback: "先提出具體問題，才是帶動討論的第一步。" },
        6: { promptZh: "哪個情境不宜使用這個慣用語？", promptEn: "Spot the boundary.", options: ["有人先聯絡義工，清潔行動隨後展開。", "團隊提出第一個方案，其他人繼續完善。", "一個人獨自打開抽屜，沒有其他進展。"], correct: 2, feedback: "沒有後續過程時，普通動詞較清楚。" }
      }
    },
    "idiom-02": {
      meaningZh: "催促熟悉的人快點行動，通常因為時間緊迫。",
      meaningEn: "Tell someone to hurry, usually in a familiar, spoken setting.",
      picture: "不是叫人搖腿，而是提醒動作快一點。",
      boundary: "對陌生顧客、行動不便的人或需要格外禮貌的場合，這句可能顯得命令式。",
      where: "家人、朋友、隊友；趕車或活動快開始時",
      tone: "口語、熟絡，略帶舊式色彩；語氣可輕鬆，也可能顯得不耐煩。",
      formal: "正式溝通用 please hurry 或更具體的禮貌要求。",
      fixed: "shake a leg",
      moving: "a 和單數 leg 固定；可作直接催促，或接在 need to、must 後。",
      forms: ["shake a leg", "need to shake a leg", "must shake a leg"],
      checks: ["真的需要加快嗎？", "雙方關係是否夠熟？", "有否保留 a leg，而非 legs？"],
      choices: {
        2: { promptZh: "哪個情境最自然？", promptEn: "Which scene fits?", options: ["朋友還在收拾，校巴兩分鐘後開走。", "顧客因腳傷走得慢，店員大聲催促。", "大家提早一小時到達，沒有時間壓力。"], correct: 0, feedback: "有真實時間壓力，而且對象是熟悉的朋友。" },
        3: { promptZh: "向不熟悉的顧客提出趕快提交文件的要求，應如何表達？", promptEn: "Choose the right tone.", options: ["用禮貌而具體的要求。", "直接命令顧客 shake a leg。", "完全不說明時限。"], correct: 0, feedback: "這個慣用語帶口語催促感，對陌生顧客不夠得體。" },
        5: { promptZh: "隊友還未換好衣服，比賽快開始。你的下一步是？", promptEn: "Choose the next move.", options: ["提醒隊友快一點，並說明開賽時間。", "稱讚隊友今天很早。", "只談下星期的練習。"], correct: 0, feedback: "提醒加速並說明原因，語用才完整。" },
        6: { promptZh: "哪個判斷有問題？", promptEn: "Spot the boundary.", options: ["可對熟悉隊友作輕鬆催促。", "在緊急情況可表達快一點。", "對任何人、任何情況都同樣禮貌。"], correct: 2, feedback: "語氣取決於關係與處境，不是通用的禮貌句。" }
      }
    },
    "idiom-03": {
      meaningZh: "剛開始新工作或新項目，就立即有效地投入並取得進展。",
      meaningEn: "Begin a new role or project with immediate, effective action.",
      picture: "一落地便開始跑：沒有長時間適應期。",
      boundary: "只有『快』而沒有有效工作或進展，不足以使用這個慣用語。",
      where: "新工作、新學期、新項目、團隊上任",
      tone: "中性而積極；職場及簡報常用。",
      formal: "極正式的技術文稿可直說 begin work immediately and effectively。",
      fixed: "the ground running",
      moving: "hit 的過去式仍是 hit，絕不是 hitted。",
      forms: ["hit the ground running", "hits the ground running", "hitting the ground running"],
      checks: ["是否新的開始？", "是否立即有實際貢獻？", "過去式是否仍用 hit？"],
      choices: {
        2: { promptZh: "哪個情境符合？", promptEn: "Which scene fits?", options: ["新同事第一天已整理資料並解決問題。", "新同事第一天只是提早到公司門口。", "舊項目已做一年，今天照常工作。"], correct: 0, feedback: "新的開始加上即時有效的工作，兩個條件都齊備。" },
        3: { promptZh: "面試中描述新職位的理想開局，哪個重點最合適？", promptEn: "Choose the emphasis.", options: ["說明能立即投入並帶來實際進展。", "只強調自己會跑得很快。", "只說自己會提早到場。"], correct: 0, feedback: "慣用語稱讚的是迅速而有效的投入。" },
        5: { promptZh: "新隊員加入後馬上改善流程。你會怎樣回應？", promptEn: "Choose the next move.", options: ["肯定其第一天就有實際貢獻。", "只稱讚對方的鞋子。", "說對方仍未開始工作。"], correct: 0, feedback: "回應應聚焦於新開始時的即時成效。" },
        6: { promptZh: "哪個情況不能只憑速度就套用？", promptEn: "Spot the boundary.", options: ["新組長上任便完成重要協調。", "新生第一天已幫團隊完成任務。", "新員工跑上樓梯，但沒有開始工作。"], correct: 2, feedback: "字面上的跑步並不等於迅速上手。" }
      }
    },
    "idiom-04": {
      meaningZh: "對同一件事反覆改主意或改做法，通常帶點不滿。",
      meaningEn: "Keep changing a decision or plan instead of settling on one.",
      picture: "選項被換來換去，大家難以跟上。",
      boundary: "只改動一次，尤其有充分理由時，不宜說成 chop and change。",
      where: "計劃、選擇、做事方式反覆變動",
      tone: "偏英式、非正式；常帶輕微批評。",
      formal: "正式報告可用 change repeatedly 或 make repeated changes。",
      fixed: "chop and change",
      moving: "兩個動詞一起變化：chops and changes、chopped and changed、chopping and changing。",
      forms: ["chop and change", "chopped and changed", "chopping and changing"],
      checks: ["是否改了不只一次？", "是否有拿不定主意或不一致的感覺？", "兩個動詞的形式是否一致？"],
      choices: {
        2: { promptZh: "哪個情境最適合？", promptEn: "Which scene fits?", options: ["活動日期在週一、週五、週一之間來回更改。", "因颱風改期一次，之後一直不變。", "一個人用刀切菜。"], correct: 0, feedback: "來回更改才是這個表達的核心。" },
        3: { promptZh: "你想在正式報告中記錄多次更改，哪種說法較中性？", promptEn: "Choose the register.", options: ["change repeatedly。", "用 chop and change 指責每個人。", "不交代更改次數。"], correct: 0, feedback: "正式報告通常適合直接、客觀的說法。" },
        5: { promptZh: "小組已第四次更改計劃，你的回應應包含甚麼？", promptEn: "Choose the next move.", options: ["指出反覆改動造成困難，並促請定案。", "稱讚這是第一次修改。", "轉而討論完全無關的題目。"], correct: 0, feedback: "這個慣用語常表達對反覆更改的不滿。" },
        6: { promptZh: "哪個使用界線最重要？", promptEn: "Spot the boundary.", options: ["任何一次變動都可以這樣說。", "只有反覆或不必要的改動才貼切。", "只要出現刀具就可以這樣說。"], correct: 1, feedback: "一次合理改動不等於反覆改來改去。" }
      }
    },
    "idiom-05": {
      meaningZh: "敢於規劃更大規模、更長遠或更有抱負的目標。",
      meaningEn: "Plan ambitiously and consider a wider scale of possibility.",
      picture: "把目光從眼前的小範圍，移向更遠的目標。",
      boundary: "這不是『仔細想』，也不保證大計劃一定成功。",
      where: "升學、事業、社區計劃、創意項目",
      tone: "正面、鼓勵；也可提醒別人不要把目標定得太小。",
      formal: "極正式的文件可用 develop a large-scale plan 等具體說法。",
      fixed: "big",
      moving: "think 可變為 thinks、thought、thinking；big 保持不變。",
      forms: ["think big", "thinks big", "thought big", "thinking big"],
      checks: ["目標是否比眼前小任務更遠大？", "談的是抱負，不是物件大小嗎？", "有否按主語和時態變化 think？"],
      choices: {
        2: { promptZh: "哪個情境符合？", promptEn: "Which scene fits?", options: ["學生把班級花園構想擴展成全校計劃。", "學生仔細量度一個很大的紙箱。", "學生只打算今天完成一題練習。"], correct: 0, feedback: "由一個班別擴展至全校，體現更大的目標。" },
        3: { promptZh: "在鼓勵同伴時，這個表達主要傳達甚麼？", promptEn: "Choose the tone.", options: ["不要被眼前的小規模限制。", "你一定會成功，毋須計劃。", "你應該找一件體積大的物件。"], correct: 0, feedback: "它鼓勵更有抱負的構想，但不保證成果。" },
        5: { promptZh: "同伴想把學校網站開放給全港學生。你會聚焦甚麼？", promptEn: "Choose the next move.", options: ["肯定目標規模擴大，再討論實行步驟。", "只評論網站圖示大小。", "說這個計劃已經完成。"], correct: 0, feedback: "有遠大目標後仍要考慮可行步驟。" },
        6: { promptZh: "哪個理解不正確？", promptEn: "Spot the boundary.", options: ["可以用於更廣闊的計劃。", "可以用於勉勵人放眼遠方。", "意思是想一想大型物件。"], correct: 2, feedback: "big 指抱負或規模，不是實際尺寸。" }
      }
    }
  };
  window.EDMUND_IDIOM_COMPASS = Object.freeze(lessons);
})();

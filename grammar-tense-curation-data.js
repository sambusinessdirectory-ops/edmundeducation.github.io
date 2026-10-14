// A progressive guide distilled from the explanations for all 150 Tense questions.
// Keep the teaching order aligned with the first pass through questions 1–50;
// questions 51–150 then revisit and mix these decisions.
window.EDMUND_GRAMMAR_TENSE_CURATION = Object.freeze([
  {
    chapter: "01 · 先找時間", title: "先問：句子站在哪個時間點？",
    focus: "不要只見到一個時間字就選時態。先找「現在、過去，還是將來」，再問事情在那一刻已完成，還是正在進行。",
    formula: "時間點 → 當時的狀態 → 動詞寫法",
    examples: [["I cooked dinner last night.", "昨晚煮了飯：說一件已發生的事。"], ["I was cooking at 8 p.m.", "昨晚八時正在煮：看過去某一刻的過程。"]],
    check: "讀完整句和前後文；同一個 at 8 可能指開始，也可能指正在進行。", source: "總方法 · 第 1–150 題"
  },
  {
    chapter: "01 · 先找時間", title: "Simple Present：習慣、一般情況與時間表",
    focus: "usually、every Friday 等指向重複；own、know、need 等常說一般狀態。固定班次即使在將來，也常用 Simple Present。",
    formula: "he / she / it + verb-s · I / you / we / they + verb",
    examples: [["Tom usually walks to work.", "平時的習慣。"], ["The train leaves at 11:30 every night.", "固定時間表。"]],
    check: "是否只說今天這一次？如果是，未必用 Simple Present。", source: "第 1–4、51、65、79、93、107、121、135 題"
  },
  {
    chapter: "01 · 先找時間", title: "Simple Past：已結束的過去時間",
    focus: "yesterday、last night、last summer 等把事件放在已結束的時間；重點是「當時發生了」，不是一直計到現在。",
    formula: "verb-ed / 不規則過去式 · didn't + verb · Did + 主語 + verb?",
    examples: [["We visited the museum last Saturday.", "上星期六已結束。"], ["I didn't check my email last night.", "didn't 後面用原形，不寫 checked。"]],
    check: "題目若指定一個已完結的日期，通常不要改成 have + 過去分詞。", source: "第 5–8、52、66、80、94、108、122、136 題"
  },
  {
    chapter: "02 · 將來怎樣發生", title: "will：即時決定、承諾與一般預測",
    focus: "電話剛響才說「我去接」是即時決定；I promise 是承諾；I think、I am sure 可引出一般預測。",
    formula: "will + verb",
    examples: [["The phone is ringing. I'll answer it.", "現在才決定。"], ["I promise I will call you when I arrive.", "承諾；when 後用 arrive。"]],
    check: "will 後面不用 -s；when / after 等時間子句常用現在式說將來。", source: "第 9–11、53、67、81、95、109、123、137 題"
  },
  {
    chapter: "02 · 將來怎樣發生", title: "be going to：已有打算或眼前有跡象",
    focus: "說話前已作決定，即使細節未安排好；或現在已看到明顯證據，因而預測接下來的事。",
    formula: "am / is / are + going to + verb",
    examples: [["Look at those clouds. It's going to rain.", "烏雲是眼前的證據。"], ["We decided last month. We are going to move.", "之前已有決定。"]],
    check: "若已有明確預約與時間，下一節的 Present Continuous 往往更切合。", source: "第 12–13、54、68、82、96、110、124、138 題"
  },
  {
    chapter: "02 · 將來怎樣發生", title: "Present Continuous：現在進行、暫時變化、已約好的將來",
    focus: "right now 是眼前正在做；this week 可表示目前暫時不同；appointment booked 指向已安排好的將來活動。",
    formula: "am / is / are + verb-ing",
    examples: [["Nora is studying right now.", "此刻正在做。"], ["I'm meeting my tutor at 4 tomorrow.", "明天四時已預約。"]],
    check: "normally 與 this week 同時出現時，要分清平日習慣和短期改變。", source: "第 14–17、55、69、83、97、111、125、139 題"
  },
  {
    chapter: "02 · 將來怎樣發生", title: "三種將來說法，差在「決定從哪裡來」",
    focus: "同樣談將來，句子可能要突出即時反應、已有意向，或已有具體安排。看前文提供哪一種證據。",
    formula: "現在才決定 → will · 之前已決定 → going to · 已約好 → am/is/are + -ing",
    examples: [["I'll answer the door.", "門鈴剛響，現在提出幫忙。"], ["I'm meeting Ava at six.", "雙方已約定六時。"]],
    check: "這不是說其他寫法永遠不合文法；練習要求選最能表達句中證據的一種。", source: "對照 · 第 9–17 題及混合練習"
  },
  {
    chapter: "03 · 看當時的過程", title: "Past Continuous：過去那一刻正在做",
    focus: "At 8 p.m. last night 讓我們看一個過去時刻；一段較長活動中途發生短事，也常把長活動寫成進行式。",
    formula: "was / were + verb-ing",
    examples: [["I was cooking at 8 p.m.", "八時仍在煮。"], ["While Sam was driving, his phone rang.", "駕車持續；電話中途響。"]],
    check: "when、while 只是提示；仍要判斷哪件事持續、哪件事突然發生。", source: "第 18–21、56、70、84、98、112、126、140 題"
  },
  {
    chapter: "03 · 看當時的過程", title: "Future Continuous：將來那一刻會正在做",
    focus: "已知活動從何時到何時，再看將來某個時間是否落在活動途中。此時重點不是會做，而是到時正在做。",
    formula: "will be + verb-ing",
    examples: [["The class runs from 7 to 9. At 8, we'll be studying.", "八時位於課堂中途。"], ["Don't call at eight; we'll be eating.", "八時晚餐會正在進行。"]],
    check: "will eat 可表示會吃；will be eating 才明確突出那一刻的過程。", source: "第 22–24、57、71、85、99、113、127、141 題"
  },
  {
    chapter: "04 · 看已完成的結果", title: "Perfect 的核心：站在一個時間點回望",
    focus: "Perfect 不是單指「很久以前」。先決定回望點：現在、過去某一刻，或將來某一刻；再看事情是否在那之前已發生。",
    formula: "現在回望 → have/has + V3 · 過去回望 → had + V3 · 將來回望 → will have + V3",
    examples: [["I've finished three tasks so far.", "從現在回望完成數量。"], ["By Friday, I'll have finished five lessons.", "想像星期五，回望已完成的事。"]],
    check: "V3 是過去分詞：go → went → gone；had gone，不能寫 had went。", source: "總方法 · 第 25–36 題"
  },
  {
    chapter: "04 · 看已完成的結果", title: "Present Perfect：過去與現在相連",
    focus: "可說到目前為止的經驗或完成數量、從以前延續到現在的狀態，以及剛發生而現在看得到的結果。",
    formula: "have / has + V3",
    examples: [["Have you ever tried Korean food?", "問截至現在的人生經驗。"], ["I have forgotten my password, so I can't log in.", "過去的事影響現在。"]],
    check: "so far、since、ever、never、just 有幫助，但要連同「時間是否仍通向現在」一起看。", source: "第 25–29、58、72、86、100、114、128、142–143 題"
  },
  {
    chapter: "04 · 看已完成的結果", title: "Past Perfect：從較後的過去回頭看",
    focus: "兩件事都在過去；如果敘述站在較後一件事，回頭解釋更早已發生的原因或結果，就用 had + V3。",
    formula: "先發生 A → 後發生 B；在 B 回望 A：had + V3",
    examples: [["The train had left before I arrived.", "火車九時走；我九時十分才到。"], ["She couldn't pay because she'd left her wallet at home.", "先漏帶銀包，後無法付款。"]],
    check: "只是按順序講幾件過去的事，不必每件都加 had。", source: "第 30–33、59、73、87、101、115、129、144–145 題"
  },
  {
    chapter: "04 · 看已完成的結果", title: "Future Perfect：到將來某時已完成",
    focus: "by Friday、by the time you arrive 等設下將來的檢查點；如果工作在那之前完成，焦點就是已達成的結果。",
    formula: "will have + V3",
    examples: [["By Friday, I will have completed all five lessons.", "星期四做完，星期五已完成。"], ["By the time you arrive, we will have cooked dinner.", "你八時到，七時半前已煮好。"]],
    check: "will be cooking 表示到時仍在煮；will have cooked 表示到時已煮好。", source: "第 34–36、60、74、88、102、116、130、146 題"
  },
  {
    chapter: "05 · 看持續了多久", title: "Perfect Continuous：回望一段持續的活動",
    focus: "既有一個回望點，又特別問「已經做了多久」，而活動持續或留下持續過的痕跡，就留意 Perfect Continuous。",
    formula: "回望點 + have been / had been / will have been + verb-ing",
    examples: [["I've been studying for two hours.", "兩小時的溫習過程；現在仍在讀。"], ["I've studied three chapters.", "三章是已完成的數量。"]],
    check: "for two hours 問時間長度；three chapters、four rooms 常突出完成數量。", source: "總方法 · 第 37–46 題"
  },
  {
    chapter: "05 · 看持續了多久", title: "Present Perfect Continuous：一直做到現在",
    focus: "以前開始、一直持續到現在；題目常明說 still studying now，並給 for 或 since 說多久。",
    formula: "have / has been + verb-ing",
    examples: [["I have been studying for two hours.", "兩小時前開始，現在仍在讀。"], ["It has been raining all morning.", "整個早上一直下，現在仍在下。"]],
    check: "know 這類表示狀態的動詞，題目用 have known for ten years，而非 been knowing。", source: "第 37–40、61、75、89、103、117、131、147–148 題"
  },
  {
    chapter: "05 · 看持續了多久", title: "Past Perfect Continuous：到過去某時已持續多久",
    focus: "活動先開始，到了後來的過去時刻已進行一段時間；那時的疲倦、濕地或長久等待，也能顯示之前持續的過程。",
    formula: "had been + verb-ing",
    examples: [["We had been waiting for nearly an hour when the bus arrived.", "巴士到時，之前已等接近一小時。"], ["Ben was out of breath because he'd been running.", "氣喘是先前持續跑步的結果。"]],
    check: "were waiting 只說巴士到時正在等；had been waiting 還說明到當時已等了多久。", source: "第 41–43、62、76、90、104、118、132、149 題"
  },
  {
    chapter: "05 · 看持續了多久", title: "Future Perfect Continuous：到將來某時已持續多久",
    focus: "活動會先開始；到了將來的檢查點，已持續一段時間，而且題目通常明說到時仍會繼續。",
    formula: "will have been + verb-ing",
    examples: [["By noon, I will have been studying for five hours.", "七時開始；中午已讀五小時，還在讀。"], ["At six, Nina will have been working for ten hours.", "八時開始；六時還有兩小時工作。"]],
    check: "will have studied five chapters 說完成多少；will have been studying for five hours 說已持續多久。", source: "第 44–46、63、77、91、105、119、133、150 題"
  },
  {
    chapter: "06 · 回頭推斷", title: "Modal Perfect：對已發生的事作判斷",
    focus: "must have 是高度把握的推斷；might have 是可能；should have 是過去應做卻未做；could have 是當時有機會卻未實現。",
    formula: "must / might / should / could + have + V3",
    examples: [["They must have left already.", "現在車不見了：很有把握地推斷。"], ["You should have told me earlier.", "當時應說，現在已錯過。"]],
    check: "must leave 是『必須離開』；must have left 是『推斷已離開』。先分清語氣和時間。", source: "第 47–50、64、78、92、106、120、134 題"
  },
  {
    chapter: "07 · 綜合解題", title: "每題按這四步走",
    focus: "先讀意思，建立時間線；再判斷重點是習慣、當時正在做、已完成的結果，還是到某時已持續多久。最後才寫動詞形式。",
    formula: "① 時間點  →  ② 過程 / 結果 / 時長  →  ③ 選時態  →  ④ 檢查動詞",
    examples: [["By 5, we will have been waiting for six hours.", "將來五時回望：已等多久，仍在等。"], ["By 5, we will have finished the report.", "將來五時回望：報告已完成。"]],
    check: "先做第 1–50 題掌握各形式；第 51–150 題會混合再考，不能只靠題目順序猜。", source: "綜合 · 全部 150 題"
  }
]);

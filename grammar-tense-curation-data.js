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
  },
  {
    chapter: "08 · 線索與動詞", title: "時間字是線索，不是答案鍵",
    focus: "usually、just、when、by 會提醒你看某種時間關係，但最後仍要讀完整句。例如 just 的重點不是字本身，而是剛發生的動作和現在結果相連。",
    formula: "提示字 + 前後文 → 真正的時間關係",
    examples: [["Ava has just sent the message. I can see it now.", "剛傳出；現在手機看得到。"], ["While Sam was driving, his phone rang.", "判斷長短事件，不能只靠 while。"]],
    check: "看到提示字後，能否用一句話解釋『這件事在哪個時間點，當時在做甚麼』？", source: "第 1、19、25、29、70、86 題"
  },
  {
    chapter: "08 · 線索與動詞", title: "沒有時間字，也能從意思判斷",
    focus: "own、need、know 常描述持續的狀態；機器的使用要求、某人的擁有情況，通常是一般事實，不需要 yesterday 或 usually 才能用 Simple Present。",
    formula: "一般狀態 → Simple Present · 延續到現在 → Present Perfect",
    examples: [["Daniel owns a bookshop.", "說目前的一般擁有情況。"], ["Sara and I have known each other for ten years.", "十年前開始，現在仍認識。"]],
    check: "own / know / need 表示這些意思時，通常不寫 is owning、been knowing、is needing。", source: "第 2、72、93、128、135 題"
  },
  {
    chapter: "08 · 線索與動詞", title: "第三人稱的 -s 只放在該放的位置",
    focus: "肯定句 he / she / it 的一般現在式通常加 -s；否定句已由 does 承擔人稱變化，後面的動詞回到原形。不只人名會有第三人稱單數：the train、this machine 也可當 it。",
    formula: "she walks · she doesn't walk · they don't walk",
    examples: [["Tom usually walks to work.", "Tom = he，所以 walks。"], ["My sister doesn't eat meat.", "doesn't 後不寫 eats。"]],
    check: "先找主語，再看有沒有 does / doesn't；不要寫 doesn't eats。", source: "第 1–4、51、79、121、135 題"
  },
  {
    chapter: "08 · 線索與動詞", title: "時間表上的明天，仍可用現在式",
    focus: "固定班次或機構時間表描述的是預先確定、規律的安排。即使下一班發生在明天，若句子強調 timetable，也可用 Simple Present。",
    formula: "According to the timetable, the bus leaves at 6:15 tomorrow.",
    examples: [["The train leaves at 11:30 every night.", "每天相同的固定時間。"], ["The first bus leaves at 6:15 tomorrow.", "明天那班也按時間表出發。"]],
    check: "will leave 並非不合文法；這些題選 leaves，是因為說話角度是固定時間表。", source: "第 4、65、107 題"
  },
  {
    chapter: "08 · 線索與動詞", title: "過去式、did 與不規則動詞",
    focus: "肯定句的動詞可以加 -ed，也可能是不規則過去式；一旦用了 did / didn't，後面的主要動詞便用原形。",
    formula: "visited · lost · didn't check · Did you finish?",
    examples: [["Leo lost his keys yesterday.", "lose → lost，不是 losed。"], ["Did you finish the homework yesterday?", "did 已標示過去，不能寫 finished。"]],
    check: "別寫 didn't checked、didn't enjoyed 或 Did you finished。", source: "第 5–8、66、80、94、108、122、136 題"
  },
  {
    chapter: "09 · 時間範圍", title: "已結束的時間，與一直開放到現在的時間",
    focus: "last Saturday、yesterday morning 已封閉；so far this month、today（而今天仍未結束）則可一直計到現在。關鍵是這段時間是否包含說話的現在。",
    formula: "已結束 → Simple Past · 到目前為止 → Present Perfect",
    examples: [["I bought this jacket yesterday afternoon.", "昨天已完結。"], ["I've visited that café three times so far this month.", "本月仍未完，次數仍可增加。"]],
    check: "不是看到 today 就機械地選 Perfect；先看句子是否把今天當作仍在進行的統計範圍。", source: "第 5、8、25、52、58、80、114、122 題"
  },
  {
    chapter: "09 · 時間範圍", title: "will 可以有三種不同的說話動作",
    focus: "突然有事時即時答應或提出幫忙；向別人作承諾；沒有眼前證據時表達 I think / I am sure 的一般預測。三種都談將來，但語氣不同。",
    formula: "即時反應 · 主動幫忙 · 承諾 / 預測 → will + verb",
    examples: [["Someone is knocking. I'll see who it is.", "現在才提出行動。"], ["I promise I'll return your book tomorrow.", "向對方作承諾。"]],
    check: "I think she will like it 是預測；不是說她現在已經喜歡。", source: "第 9–11、53、67、81、95、109、123、137 題"
  },
  {
    chapter: "09 · 時間範圍", title: "主句用 will，when 後常不用 will",
    focus: "兩個子句都指向將來，但 when 引出的時間子句通常用現在式；將來的承諾放在主句。",
    formula: "I will call you when I arrive.",
    examples: [["I'll call you when I arrive.", "到達是未來，但 when 後用 arrive。"], ["When I arrive, I'll call you.", "先後調換，動詞關係不變。"]],
    check: "別寫 when I will arrive；這裡的 arrive 不是說我現在到達。", source: "第 10 題"
  },
  {
    chapter: "09 · 時間範圍", title: "眼前證據如何改變預測",
    focus: "暗雲、快滑落的箱子、睏得睜不開眼、正在鬆脫的手柄，都是現在可見的跡象。題目特意給這些證據，就讓 be going to 表達『看來快要發生』。",
    formula: "現在已見跡象 → am / is / are going to + verb",
    examples: [["Look at those dark clouds. It's going to rain.", "烏雲是眼前證據。"], ["The handle is coming loose. It's going to break.", "手柄已在鬆脫。"]],
    check: "will rain / will break 也可作一般預測；本題重點是已看見的證據。", source: "第 12、54、82、124 題"
  },
  {
    chapter: "09 · 時間範圍", title: "早已決定，不等於已約好細節",
    focus: "decided last month 代表意向早已存在；not chosen a date 代表還未具體安排。若雙方已約定明天六時，Present Continuous 更能突出已落實的安排。",
    formula: "已決定但未定日期 → going to · 已約好時間 → am/is/are + -ing",
    examples: [["We're going to move next year; nothing is arranged yet.", "意向已有，細節未定。"], ["We're having dinner at six tomorrow.", "已約定具體時間。"]],
    check: "兩種說法可以有重疊；練習要你選最能反映已給資料的語氣。", source: "第 13、17、68、83、96、110、138–139 題"
  },
  {
    chapter: "10 · 進行中的活動", title: "現在這一刻，與目前這一段時間",
    focus: "right now 表示眼前正在做；this week / this month 可表示短期情況，即使並非說話這一秒也在做。與 normally 形成對照時，暫時改變尤其明顯。",
    formula: "眼前進行 / 暫時情況 → am/is/are + verb-ing",
    examples: [["I'm cooking dinner now.", "此刻正在煮。"], ["I normally cycle, but I'm taking the bus this week.", "這星期暫時不同。"]],
    check: "have dinner 的 have 是一項活動，可說 we are having dinner；但 own、need 的狀態義通常不用 -ing。", source: "第 14–16、55、69、97、111、125、139–140 題"
  },
  {
    chapter: "10 · 進行中的活動", title: "Past Continuous：中途插入，或兩事同時",
    focus: "一件活動持續進行時，另一件較短的事可以插入；也可能兩件活動同時持續。要比較事件本身，而非只看到 when / while 就套公式。",
    formula: "長活動：was/were + -ing · 插入短事：Simple Past",
    examples: [["Ben was walking home when he saw a friend.", "走路途中看見朋友。"], ["While I was cooking, Maya was setting the table.", "兩件活動同時持續。"]],
    check: "was walking 不保證最後走到家；它只把鏡頭放在當時進行中的路程。", source: "第 19–20、70、84、112 題"
  },
  {
    chapter: "10 · 進行中的活動", title: "At 8 是一個鏡頭，不一定是起點",
    focus: "At 8、at midnight、this time tomorrow 指定一個觀察點。若已知活動在此之前開始、之後才結束，進行式描述觀察點上的過程。",
    formula: "開始 < 觀察點 < 結束 → Continuous",
    examples: [["The wedding lasted until one. At midnight, they were still dancing.", "午夜活動仍在進行。"], ["The exam runs from two to four. At three, I'll be taking it.", "三時位於考試中途。"]],
    check: "單獨看到 at 8 並不足以證明進行式；要找活動跨過該時間的證據。", source: "第 18、21–24、57、71、85、98–99、113、127、140–141 題"
  },
  {
    chapter: "10 · 進行中的活動", title: "將來某刻正在做，與那時才會做",
    focus: "will be eating at eight 把八時放在晚餐中途；will eat at eight 可能是八時開始吃。從 from…to… 的時間段，更容易判斷將來某刻是否在活動中間。",
    formula: "將來某刻在活動中途 → will be + verb-ing",
    examples: [["We'll be eating at eight.", "八時晚餐正在進行。"], ["We'll eat at eight.", "可能八時才開始吃。"]],
    check: "先畫出開始和結束，再放入 at eight；不要把 will be + -ing 當作 will 的華麗替代。", source: "第 22–24、57、71、85、99、113、127、141 題"
  },
  {
    chapter: "11 · 回望與結果", title: "Perfect 後要用 V3，不是過去式",
    focus: "have、has、had、will have 後都接過去分詞。規則動詞的 V2、V3 常相同；不規則動詞要分清 saw/seen、went/gone、ate/eaten、flew/flown。",
    formula: "see → saw → seen · go → went → gone · eat → ate → eaten",
    examples: [["We haven't seen Daniel since January.", "have 後用 seen。"], ["Everyone had already gone home.", "had 後用 gone，不寫 went。"]],
    check: "put 的三個形式都寫 put；had put 仍有 had 標示『更早已做』。", source: "第 27–28、32、87、100–101、143–144 題"
  },
  {
    chapter: "11 · 回望與結果", title: "人生經驗：ever、never、first time",
    focus: "沒有指定某個已結束的場合，而是從出生一直問到現在，便在談人生經驗。ever 問曾否；never 說從未；This is my first… 也會建立這個時間範圍。",
    formula: "Have you ever + V3? · I have never + V3.",
    examples: [["Have you ever tried Korean food?", "到現在為止曾否試過？"], ["This is my first flight. I've never flown before.", "現在以前從未坐飛機。"]],
    check: "Did you try it last night? 問的是昨晚那一次；不能把兩種問題混為一談。", source: "第 25、28、100、143 題"
  },
  {
    chapter: "11 · 回望與結果", title: "現在看到結果，才是重點",
    focus: "just sent 並在手機上看到訊息；forgotten password 並且現在不能登入。動作較早發生，句子的焦點卻是目前的結果。",
    formula: "較早發生 → 現在仍有直接結果 → have/has + V3",
    examples: [["Ava has just sent it; it's on my phone now.", "目前看得到訊息。"], ["I've forgotten my password, so I can't log in.", "現在仍受忘記密碼影響。"]],
    check: "若改成 I forgot it yesterday，焦點便移到已結束的過去時間。", source: "第 29、86、142 題"
  },
  {
    chapter: "11 · 回望與結果", title: "since 說起點，for 說時長",
    focus: "since January 把起點連到現在；for ten years 量度一段長度。兩者都可配延續的狀態或活動，但要看焦點是關係仍存在，還是行動一直在做。",
    formula: "since + 起點 · for + 時長",
    examples: [["We've known each other for ten years.", "認識的狀態延續至今。"], ["She has been learning Spanish since January.", "學習的活動一直持續。"]],
    check: "看到 for 不代表必須用 Continuous；know 的狀態義用 have known。", source: "第 26–27、37–40、72、75、89、128、147–148 題"
  },
  {
    chapter: "11 · 回望與結果", title: "Past Perfect 是改變敘事視角",
    focus: "我先說後來的發現或困境，再回頭交代更早的原因：留下護照、吃光餅乾、忘帶銀包。had 幫讀者快速理清這個倒敘。",
    formula: "更早的 A（had + V3） → 後來的 B（Simple Past）",
    examples: [["We reached the airport and realised we'd left the passports.", "先漏帶，後到機場才發現。"], ["I opened the cupboard; someone had eaten the biscuits.", "先吃光，後打開櫥櫃。"]],
    check: "若事件已按順序清楚敘述，未必需要每件事都寫 had；題目重點是從後來回望更早。", source: "第 30–33、59、73、87、101、115、129、144–145 題"
  },
  {
    chapter: "11 · 回望與結果", title: "by 是檢查點，不一定是動作發生點",
    focus: "By Friday 意思是到了星期五之前或最遲那時已完成。動作可能星期四就做好；Future Perfect 讓我們站在星期五看完成的結果。",
    formula: "星期四完成 → 到星期五已完成：will have + V3",
    examples: [["I'll finish on Thursday. By Friday, I'll have sent everything.", "星期五回望已傳送。"], ["We'll finish cooking at 7:30. By eight, we'll have cooked dinner.", "八時已煮好，不是八時正在煮。"]],
    check: "by 不自動等於 Future Perfect；還要看句子是否在該時點回望已完成的事。", source: "第 34–36、60、74、88、102、116、130、146 題"
  },
  {
    chapter: "12 · 數量與時長", title: "完成多少，與做了多久",
    focus: "three tasks、twenty emails、four rooms、five chapters 量度完成成果；for two hours、all morning 量度活動歷時。兩種資料會把句子的焦點推向不同的 aspect。",
    formula: "完成量 → Perfect · 持續時間 → Perfect Continuous",
    examples: [["Priya has finished three tasks.", "數已完成的工作。"], ["I have been cleaning for two hours.", "看打掃持續了多久。"]],
    check: "完成量與時間長度不是不可同句出現；要看題目最想突出的資訊。", source: "第 26、36–40、61、75、88、102–105、114、133、148 題"
  },
  {
    chapter: "12 · 數量與時長", title: "Present Perfect Continuous：still 是關鍵證據",
    focus: "題目先給開始時間，再明說 still studying now、still waiting、still looking；這些細節讓『一直在做』比『已完成』更鮮明。",
    formula: "以前開始 + 一直做 + 現在仍做 → have/has been + -ing",
    examples: [["I'm still waiting. I've been waiting for an hour.", "等候現在仍未結束。"], ["He is still repairing his bike. He has been repairing it for an hour.", "修理仍在進行。"]],
    check: "have waited an hour 有時也成立；這組題選 been waiting，是因為仍在等的過程被明確強調。", source: "第 37–40、61、75、89、103、117、131、147–148 題"
  },
  {
    chapter: "12 · 數量與時長", title: "Past Perfect Continuous：只說正在等還不夠",
    focus: "were waiting when the taxi arrived 只定格在抵達那一刻；had been waiting for fifty minutes 還把開始到抵達之間的長度算進來。",
    formula: "過去起點 → 持續多久 → 過去檢查點：had been + -ing",
    examples: [["We were waiting when the taxi arrived.", "那時正在等。"], ["We had been waiting for fifty minutes when it arrived.", "到那時已等了五十分鐘。"]],
    check: "過去檢查點要清楚；可能是巴士到達、老師進來，或商店開門。", source: "第 41–43、62、90、118、149 題"
  },
  {
    chapter: "12 · 數量與時長", title: "活動已停，持續過的痕跡仍可見",
    focus: "過去進行的活動未必到檢查點仍持續。跑完後氣喘、搬箱後手痛、下雨後地濕，都能把焦點放在此前持續的過程。",
    formula: "過去一段持續活動 → 當時留下的結果：had been + -ing",
    examples: [["Ben was out of breath because he'd been running.", "跑步已停，氣喘仍在。"], ["Sara's arms hurt because she'd been carrying boxes all morning.", "長時間搬運留下手痛。"]],
    check: "不要把 Past Perfect Continuous 教成『到後來仍在做』的唯一情況；它也能解釋後來的狀態。", source: "第 42、76、104、132 題"
  },
  {
    chapter: "12 · 數量與時長", title: "Future Perfect Continuous：還有多久未做完",
    focus: "題目常同時給開始時間、將來檢查點、已持續時數，以及 still / one hour to go。最後一項證明檢查點上活動尚未完成。",
    formula: "先開始 → 到將來已做 X 小時 → 仍要繼續：will have been + -ing",
    examples: [["At six, Nina will have been working for ten hours.", "八時開始；六時還有兩小時要做。"], ["At five, we'll have been waiting for six hours.", "十一時開始；五時仍在等結果。"]],
    check: "will have waited six hours 本身也可能成立；這些題用 still be waiting 強調過程持續。", source: "第 44–46、63、77、91、105、119、133、150 題"
  },
  {
    chapter: "13 · 回頭判斷", title: "must have：根據線索作高度把握的推斷",
    focus: "車不見、燈關了、鞋沾滿泥，或考試全對，都是現在觀察到的證據；說話者因此推斷較早發生的事情。",
    formula: "現在的證據 → 強推斷較早的事：must have + V3",
    examples: [["Their car is gone. They must have left.", "車不在，推斷人已離開。"], ["Ella got every answer right. She must have studied hard.", "由成績推斷先前努力。"]],
    check: "must leave 表示義務；must have left 是對過去作推斷，兩者意思不同。", source: "第 47、64、120 題"
  },
  {
    chapter: "13 · 回頭判斷", title: "might have：可能，但沒有證明",
    focus: "現在找不到銀包或雨傘，坐錯巴士也能解釋遲到；這些只是其中一個可能原因，不能說成已確定。",
    formula: "現在的情況 → 猜較早可能發生：might have + V3",
    examples: [["I might have left my wallet in the café.", "只是可能留在咖啡店。"], ["Nora might have taken the wrong bus.", "只提出一個可能解釋。"]],
    check: "might take 指現在或之後的可能；might have taken 才是猜之前可能已做過。", source: "第 48、78、134 題"
  },
  {
    chapter: "13 · 回頭判斷", title: "should have：回頭說本應做，卻沒做",
    focus: "會議已在昨天舉行，通知的機會已過去；should have 對過去未做的事作評價，與現在給建議不同。",
    formula: "過去本應做但未做 → should have + V3",
    examples: [["You should have told me earlier.", "當時應該說，但沒有說。"], ["You should tell me next time.", "給下一次的建議。"]],
    check: "先確認事件真的已過去；不然 should tell 可能才是現在的建議。", source: "第 49、92 題"
  },
  {
    chapter: "13 · 回頭判斷", title: "could have：過去本有機會，但沒有實現",
    focus: "比賽已輸，最後一球差點入；昨天尚有空位，卻沒有訂。這些題已明說結果未實現，所以 could have 回看錯過的可能。",
    formula: "當時有條件 + 事實未發生 → could have + V3",
    examples: [["We could have won with the last shot.", "本有機會贏，但實際輸了。"], ["I could have booked that seat yesterday.", "昨日有位，但沒有訂。"]],
    check: "could have 在別的語境也可有其他意思；此處的『沒有實現』由題目背景提供。", source: "第 50、106 題"
  },
  {
    chapter: "13 · 回頭判斷", title: "另一個答案可能通順，但焦點不同",
    focus: "will rain 可作一般預測；have waited an hour 也可以說；will have worked ten hours 並非絕對錯。這套練習要求按完整語境，選最能表達題目刻意凸顯的意思。",
    formula: "先確認句子可說甚麼，再選最能保留原文焦點的寫法",
    examples: [["It's going to rain — look at the clouds.", "眼前證據使 going to 更貼切。"], ["I've been waiting for an hour, and I'm still here.", "still here 突出等待過程。"]],
    check: "別把教材中的最佳答案誤教成其他語法形式在所有語境都錯。", source: "第 12、17、45、54、77、82–83、124、147、150 題"
  },
  {
    chapter: "14 · 細節整合", title: "綜合檢查：意思、時間線、形式、語氣",
    focus: "先說清楚題目真正要表達甚麼，再畫出起點和檢查點；選結果或過程，最後檢查助動詞、主語及 V3 / -ing。這樣遇到混合題也不用靠關鍵字猜。",
    formula: "① 意思  →  ② 時間線  →  ③ 焦點  →  ④ 形式  →  ⑤ 語氣",
    examples: [["By six, she will have painted four rooms.", "到六時，重點是四間已完成。"], ["By six, she will have been painting for four hours.", "到六時，重點是已持續四小時。"]],
    check: "如果兩種寫法都看似可行，指出題目哪一句讓其中一種更精確。", source: "綜合 · 第 51–150 題"
  },
  {
    chapter: "15 · 句型與位置", title: "問句與否定：助動詞先承擔時態",
    focus: "一般動詞的 Simple Present / Past 用 do、does、did 組成問句和否定句；主要動詞回原形。Perfect 問句則把 have、has、had 移到主語前，主要動詞仍用 V3。",
    formula: "Does she walk? · She doesn't walk. · Did she walk? · Has she walked?",
    examples: [["Did you finish the homework yesterday?", "did 表示過去；finish 不再加 -ed。"], ["Have you ever ridden a horse?", "have 移到 you 前；ride 用 V3 ridden。"]],
    check: "先找負責時態的助動詞，再檢查主要動詞。be 和情態動詞的問句通常把它們提前，不要機械地加 do。", source: "第 3、7、27–28、79、94、100、136 題",
    checkpoint: {
      prompt: "昨晚有沒有查電郵？選一句最合適的問句。",
      choices: ["Did you check your email last night?", "Did you checked your email last night?", "Have you checked your email last night?"],
      answer: 0,
      whyPrompt: "為甚麼選這句？",
      whyChoices: ["last night 是已結束的過去時間；did 已表示過去，check 用原形。", "所有問句都要用 have + V3。", "問句中的主要動詞必須再加 -ed。"],
      whyAnswer: 0,
      explanation: "先看 last night 的時間範圍，再讓 did 承擔過去式；不要寫 did checked。"
    }
  },
  {
    chapter: "15 · 句型與位置", title: "just、ever、never、already、still 放在哪裏？",
    focus: "在這組題裏，just / never / already 常放在 Perfect 的第一個助動詞與 V3 之間；ever 在 Have you…? 的主語後。still 修飾進行中的活動時，常放在 be 與 -ing 之間。",
    formula: "has just sent · have never flown · had already eaten · Have you ever tried? · were still dancing",
    examples: [["Maya has just sent the file.", "has + just + V3 sent；現在看得到結果。"], ["At midnight, the guests were still dancing.", "were + still + -ing；午夜仍在跳舞。"]],
    check: "先選對時態，再放副詞；already 也可在句末，這裏展示的是題目採用的自然位置，不是唯一位置。", source: "第 21、29、32、87、100、115、143 題",
    checkpoint: {
      prompt: "我們九時接到 Sam 電話前已吃完。選最自然的寫法。",
      choices: ["We had already eaten dinner.", "We had already ate dinner.", "We were still eating dinner."],
      answer: 0,
      whyPrompt: "哪個理由最能支持你的選擇？",
      whyChoices: ["電話來時晚餐已完成；had + already + V3 eaten 回望更早的事。", "看到 already，動詞一定用過去式 ate。", "九時仍在進行，所以應用 were + -ing。"],
      whyAnswer: 0,
      explanation: "第 87 題的焦點是『之前已吃完』；already 在 had 與 eaten 之間，eaten 是 V3。"
    }
  }
]);

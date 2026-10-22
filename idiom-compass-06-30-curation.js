/* Idiom Compass 06–30: lesson-specific editorial copy and practice controls.
 * The protected fifty-question catalogue is unchanged. */
(function defineNextCompassLessons() {
  const catalogue = window.EDMUND_IDIOM_SYSTEM_DATA?.lessons || [];
  const existing = window.EDMUND_IDIOM_COMPASS || {};
  // Columns: meaning EN/ZH, mental picture EN/ZH, use boundary EN/ZH,
  // natural setting EN/ZH, tone EN/ZH, misuse 1 EN/ZH, misuse 2 EN/ZH,
  // three decisions EN/ZH (meaning, boundary, form).
  const editorial = {
    "idiom-06": ["Act while a useful opportunity is still available.","趁有利時機尚在，立即採取行動。","A blacksmith shapes metal while it is hot.","鐵還熱時才容易打造成形。","The idiom needs a real opportunity that may pass; ordinary speed alone is not enough.","必須有可能消失的機會；單純做事快並不足夠。","Applications, sales and timely invitations.","申請、限時優惠、及時邀請。","Encouraging and fairly neutral.","鼓勵把握時機，語氣較中性。","I struck while the iron was hot by waiting until the offer expired.","優惠過期後才行動，已錯過時機。","I struck while the iron was hot by buying something I never wanted at full price.","沒有有利條件，並非把握時機。","Is the opportunity still open?|Could waiting make it disappear?|Did I match strike/struck with is/was?","機會仍在嗎？|再等會錯失嗎？|strike／struck 與 is／was 是否配合？"],
    "idiom-07": ["Describe something visually pleasant and comfortable to look at.","形容外觀悅目、看起來舒服。","A calm page lets the eyes rest.","柔和清楚的畫面，讓眼睛看得舒服。","It judges appearance, not whether something is cheap, easy to use or pleasant to hear.","這是視覺判斷，不是價格、操作難度或聲音的評價。","Design, rooms, clothes and displays.","設計、房間、衣服及展示。","Mildly positive and conversational.","溫和正面，適合一般談話。","The loud alarm is easy on the eye because it sounds gentle.","警報的聲音不是視覺外觀。","The broken screen is easy on the eye because it is cheap to repair.","維修費與外觀是否悅目無關。","Am I judging appearance?|Would someone find it comfortable to look at?|Did I keep easy on the eye together?","我在評價外觀嗎？|看起來舒服嗎？|有否保留 easy on the eye？"],
    "idiom-08": ["Express a strong inner conviction without claiming proof.","表達缺乏證據卻強烈的內在確信。","A feeling seems to come from deep inside you.","一種感覺彷彿從內心深處湧出。","A hunch is not evidence; do not use it to claim something has been proved.","直覺不等於證據；不能藉此聲稱事情已獲證明。","Predictions and personal impressions.","預感及個人印象。","Personal and emphatic.","帶個人色彩，語氣較強。","I knew in my bones because the official report proved every detail.","已有完整證據時，重點不是內在直覺。","The judge knew in her bones that he was guilty, so no evidence was needed.","直覺不能取代判斷罪責所需的證據。","Is this a strong inner feeling?|Am I avoiding a false claim of proof?|Does the possessive match the person?","這是強烈直覺嗎？|有否避免把直覺當證據？|所有格與感受者相符嗎？"],
    "idiom-09": ["Describe a case or question with little serious doubt.","形容證據或答案清楚、幾乎沒有重大疑問。","The evidence makes the answer look obvious.","證據把答案指向一個清楚方向。","Do not call a disputed matter open-and-shut before checking contrary evidence.","尚有相反證據時，不能過早斷言毫無疑問。","Cases, decisions and clear-cut questions.","案件、決定及答案明確的問題。","Confident; use care when evidence is incomplete.","語氣肯定；證據未齊時要審慎。","The case is open-and-shut, although two reliable witnesses give conflicting accounts.","兩名可靠證人的說法矛盾，仍有重大疑問。","This is an open-and-shut case because we have not looked at the evidence yet.","未查看證據，不足以斷言結果明確。","Is the evidence genuinely clear?|Have I checked for serious doubt?|Did I keep open-and-shut hyphenated?","證據真的清楚嗎？|有否檢查重大疑點？|open-and-shut 的連字號正確嗎？"],
    "idiom-10": ["Wait to see how events develop before choosing a course.","先觀望形勢，再決定立場或做法。","A cat jumps; you watch its direction before moving.","先看貓往哪邊跳，再決定自己怎樣走。","It describes a deliberate wait for information, not permanent indecision.","這是為了掌握形勢而暫緩決定，不是永遠不作決定。","Politics, group choices and uncertain plans.","局勢、小組選擇及未明朗的計劃。","Mainly British and conversational.","偏英式，適合談話。","I'll see which way the cat jumps after I have already signed the final contract.","已簽最終合約後，便不是決定前的觀望。","I'll see which way the cat jumps because I never intend to decide anything.","完全不打算作決定，不是等待更多資訊。","Is the decision still open?|Am I waiting for useful information?|Does see/saw match the tense?","決定仍未作出嗎？|等待的資訊有用嗎？|see／saw 與時態相符嗎？"],
    "idiom-11": ["Choose a sensible precaution rather than risk avoidable regret.","採取合理防範，避免本可預防的後悔。","A small check now prevents a larger problem later.","現在多檢查一步，可免日後出大問題。","The precaution should be proportionate; the phrase does not excuse harmful or extreme measures.","防範應合乎比例，不能用來合理化傷害或極端做法。","Travel, health, safety and everyday planning.","旅行、健康、安全及日常計劃。","Practical and conversational.","務實，適合日常說話。","Better safe than sorry, so I'll ignore the fire alarm and stay inside.","忽視警報並非安全的防範行動。","Better safe than sorry, so I'll cancel every activity despite no plausible risk.","沒有合理風險便取消所有活動，並非合比例的防範。","Is there a plausible risk?|Is this precaution proportionate?|Did I keep the full fixed saying?","風險合理存在嗎？|措施合乎比例嗎？|固定說法完整嗎？"],
    "idiom-12": ["Warn that someone is taking a serious, avoidable risk.","警告某人正做可能惹禍的危險事。","A small spark could grow into a dangerous fire.","一點火花也可能引發大火。","Reserve it for meaningful danger, not every harmless experiment.","只用於有實際危險的行為，別把無害嘗試都說成玩火。","Dishonesty, unsafe actions and risky choices.","欺騙、不安全行為及高風險選擇。","Warning and somewhat critical.","帶警告意味，有時含批評。","I'm playing with fire by trying a new ice-cream flavour.","試新口味沒有嚴重風險。","She's playing with fire by following a tested safety procedure.","遵守已驗證的安全程序，並非冒險。","Could this cause serious harm?|Is the risk avoidable?|Did play change correctly for tense?","可能造成嚴重後果嗎？|風險可以避免嗎？|play 的時態正確嗎？"],
    "idiom-13": ["Make an existing conflict or bad situation worse.","令已存在的爭執或不利情況更加惡化。","A burning fire grows when more fuel is added.","火已經燃燒，再加燃料便燒得更旺。","There must already be a problem; a kind intervention that calms it is different.","必須先有問題；能平息局面的善意行動並非火上加油。","Arguments, rumours and tense meetings.","爭執、流言及氣氛緊張的會議。","Critical but common in speech and writing.","帶批評意味，談話與寫作均常見。","Her apology added fuel to the fire by calming both sides.","道歉平息爭執，沒有令情況惡化。","He added fuel to the fire before any disagreement had begun.","尚未出現衝突，便無從使其加劇。","Was there already a problem?|Did the action make it worse?|Does add agree with tense and subject?","問題本已存在嗎？|行動令其惡化嗎？|add 與主語、時態相符嗎？"],
    "idiom-14": ["Boast beyond what actions or evidence support.","說大話，誇口超出實際證據或行動。","A person's words grow bigger than their record.","說得比自己真正做過的還厲害。","Confident claims backed by real results are not automatically boasting.","有成果支持的自信陳述，不一定等於吹噓。","Predictions, interviews and team talk.","預測、面試及隊伍對話。","Informal and usually disapproving.","非正式，通常帶批評。","She talks big by quietly showing the results she has already achieved.","平實展示已有成果，不屬於誇口。","He talked big about the plan by asking a cautious question.","提出審慎問題，不是自誇。","Is the claim inflated?|Is there a gap between words and proof?|Did talk change for the subject?","說法被誇大了嗎？|言語與證據有落差嗎？|talk 的形式正確嗎？"],
    "idiom-15": ["Describe a person with exceptional energy and enthusiasm.","形容精力充沛、熱心投入的人。","A lively person seems to light up a whole room.","充滿活力的人，彷彿讓整個房間亮起來。","It describes a person, not a hot object or an actual ball.","形容的是人，不是發熱物件或真的球。","Volunteers, performers and active teammates.","義工、表演者及積極的隊友。","Warm, informal and complimentary.","溫暖、非正式，帶讚賞。","The burning football is a ball of fire because its surface is hot.","字面上的火球不是形容人的慣用語。","The empty classroom is a ball of fire because nobody is there.","空房間並非精力充沛的人。","Am I describing a person?|Are energy and enthusiasm evident?|Did I keep a ball of fire together?","我在形容人嗎？|活力與熱誠明顯嗎？|有否保留 a ball of fire？"],
    "idiom-16": ["Cost more than someone can comfortably afford.","花費大到令人負擔吃力。","A purchase seems to empty the whole bank account.","一筆開支彷彿掏空整個戶口。","In a negative sentence, won't break the bank means affordable; it is not a costly warning.","否定句 won’t break the bank 表示負擔得起，不能讀成昂貴警告。","Prices, budgets and affordable choices.","價錢、預算及可負擔的選擇。","Conversational; often used in the negative.","口語常見，尤其常用否定式。","This free ticket will break the bank because it costs nothing.","免費門票不會造成巨大開支。","The meal won't break the bank, so we cannot possibly afford it.","won’t break the bank 表示負擔得起，後句卻說相反。","Whose budget matters?|Is the sentence affirmative or negative?|Did break change correctly?","以誰的預算為準？|句子有否否定？|break 的變化正確嗎？"],
    "idiom-17": ["Say that something is very expensive.","形容某物價錢非常昂貴。","The price feels as large as giving up a limb.","價錢高得彷彿要付出一條手臂和一條腿。","It is figurative; do not use it for a small, manageable price.","這是比喻，不能用來形容低廉且容易負擔的價錢。","Goods, repairs, travel and services.","商品、維修、旅行及服務。","Informal and emphatic.","非正式，語氣強烈。","The pencil cost an arm and a leg because it was free.","免費鉛筆不可能非常昂貴。","The hotel cost an arm and a leg because it had four beds.","床數不能直接證明價錢昂貴。","Is the price genuinely high?|Am I describing cost, not physical injury?|Did I use cost, not costed, for the past?","價錢真的高嗎？|這是說成本，不是受傷嗎？|過去式有否用 cost？"],
    "idiom-18": ["Describe a plan or claim resting on weak foundations.","形容計劃或說法缺乏可靠基礎。","A structure on loose sand cannot stand securely.","建在鬆沙上的東西，難以穩固。","Identify the weak evidence or assumption; a plan with solid support is different.","須指出薄弱的證據或假設；有充足支持的計劃不適用。","Plans, arguments and financial proposals.","計劃、論證及財務方案。","Critical and moderately emphatic.","帶批評意味，語氣稍強。","The plan is built on sand because it has been tested thoroughly.","充分測試是可靠基礎，不是鬆沙。","Her claim is built on sand because several independent sources confirm it.","多個獨立來源支持，並非證據薄弱。","What is the weak foundation?|Does the flaw affect the whole claim?|Did I keep built on sand fixed?","薄弱基礎是甚麼？|缺陷影響整體論點嗎？|有否保留 built on sand？"],
    "idiom-19": ["Say someone faces suspicion or damaged trust.","表示某人正受懷疑，聲譽蒙上陰影。","A cloud casts a shadow over a person's reputation.","一片雲在某人的名聲上投下陰影。","Suspicion is not proof of wrongdoing; never present it as a conviction.","懷疑不等於犯罪證據，不能當作已定罪。","Investigations, allegations and reputational doubt.","調查、指控及聲譽受疑。","Serious and cautious.","嚴肅，須審慎表述。","She is under a cloud, so the untested rumour proves she is guilty.","未經查證的傳聞不能證明有罪。","He is under a cloud because he won a prize and everyone praised him.","受到讚賞並不等於被懷疑。","Is there genuine suspicion?|Have I avoided claiming guilt?|Did I use under a cloud?","確有懷疑嗎？|有否避免斷言有罪？|有否使用 under a cloud？"],
    "idiom-20": ["Name an unexpected contender who may succeed.","形容原本不被看好的潛在勝出者。","A little-noticed runner moves into the lead.","一位原本少人留意的跑手後來領先。","The candidate must be overlooked or underestimated; a favourite is not a dark horse.","對象須原本被忽視或低估；熱門人選不是黑馬。","Competitions, elections and awards.","比賽、選舉及獎項。","Neutral, sometimes admiring.","中性，有時帶欣賞。","The unanimous favourite is a dark horse because everyone expects her to win.","眾人看好的大熱門，不是黑馬。","This black horse is a dark horse simply because of its coat colour.","馬匹顏色不是這個比喻的重點。","Was this person underestimated?|Is success now plausible?|Did I use a dark horse for a contender?","原本被低估嗎？|現在有勝出可能嗎？|a dark horse 指競爭者嗎？"],
    "idiom-21": ["Describe a harsh system where power overrides fairness.","形容強者壓過公平規則的殘酷環境。","Only the strongest animals seem able to survive.","環境彷彿只容最強者生存。","Do not use it for ordinary competition with fair rules and protection.","有公平規則和保障的普通競爭，不宜稱作弱肉強食。","Unfair workplaces, markets and social systems.","不公平的職場、市場及社會環境。","Strongly critical.","批評意味強烈。","The friendly contest follows clear fair rules; it is the law of the jungle.","公平而友善的比賽，不屬於弱肉強食。","The jungle has many plants, so the classroom follows the law of the jungle.","這不是字面上的叢林或植物。","Is fairness absent?|Do the powerful dominate?|Did I keep the law of the jungle intact?","公平保障缺失嗎？|強者是否主導？|固定說法完整嗎？"],
    "idiom-22": ["Make a bold decision after hesitation.","猶豫後鼓起勇氣作重大決定。","Someone stands at the edge, then jumps in.","站在邊緣猶豫一會，終於跳下去。","A routine action with no meaningful commitment is not taking the plunge.","沒有實際承諾的例行小事，不宜說成下定決心。","Courses, moves, ventures and new roles.","課程、搬遷、創業及新職位。","Positive and conversational.","正面，適合日常談話。","I took the plunge by choosing my usual breakfast again.","照常點早餐沒有重大決定。","She took the plunge by thinking about a change but refusing to decide.","只想一想而沒有決定，不算付諸行動。","Was there real hesitation or stakes?|Did the person actually decide?|Does take/took/taken fit the tense?","先前有猶豫或代價嗎？|真的作了決定嗎？|take／took／taken 正確嗎？"],
    "idiom-23": ["Handle several active tasks or projects at once.","同時處理多項正在進行的事情。","A worker keeps several irons heating at once.","鐵匠同時照看幾塊正在加熱的鐵。","Several possibilities alone are not enough; the person is actively involved in multiple things.","只有很多可能選項並不足夠；須同時參與多件事。","Workloads, activities and overlapping projects.","工作量、活動及同步項目。","Neutral and conversational.","中性，適合一般談話。","I have many irons in the fire because I once considered three hobbies but do none of them.","只想過幾種嗜好，沒有同步參與。","He has many irons in the fire because he finished several projects last year.","去年已完成的項目，不是現在同步進行。","Are several tasks active now?|Is the same person involved?|Did have/has agree with the subject?","現在有多件事在進行嗎？|同一人有參與嗎？|have／has 與主語相符嗎？"],
    "idiom-24": ["Criticise someone who has begun acting superior.","批評某人開始自視過高、擺出高人一等姿態。","A person imagines standing above everyone else.","一個人以為自己高人一等。","Success alone is not arrogance; observe dismissive behaviour before using it.","有成就不等於傲慢；須有輕視他人的行為。","Team roles, promotions and changed attitudes.","隊伍職務、晉升及態度變化。","Mainly British, informal and disapproving.","偏英式、非正式，帶批評。","She is getting above herself because she thanked everyone after winning.","得獎後感謝大家，不是自視過高。","He got above himself by admitting he still needed help.","承認需要幫助，不是驕傲自大。","Is the behaviour condescending?|Am I avoiding judging success alone?|Does the reflexive pronoun match the person?","行為有輕視他人嗎？|有否避免單憑成就評價？|反身代名詞正確嗎？"],
    "idiom-25": ["Name a decisive test that reveals real quality.","指出能真正檢驗質素的關鍵考驗。","A hard trial separates claims from actual performance.","嚴格測試把口頭聲稱與真正表現分開。","A routine check with no meaningful stakes is not the acid test.","沒有實質判斷力的例行小檢查，不宜稱作關鍵考驗。","Products, plans, skills and difficult conditions.","產品、計劃、能力及艱難環境。","Evaluative and neutral.","帶評估意味，語氣中性。","The colour of the box is the acid test of whether the umbrella keeps people dry.","包裝顏色不能檢驗雨傘的防水能力。","A practice quiz with no relevant questions is the acid test of the whole course.","無關的練習題不能作決定性考驗。","Will the test reveal real quality?|Is the condition relevant and demanding?|Did I keep the acid test as a noun phrase?","能顯示真正質素嗎？|條件相關而具挑戰嗎？|the acid test 的名詞形式正確嗎？"],
    "idiom-26": ["Retire permanently from playing a sport.","永久停止參與某項運動，結束球員生涯。","A player hangs up the boots used in competition.","球員把比賽穿的靴子掛起來。","A short break or missing one match is not retirement.","短暫休息或缺席一場比賽，不等於退役。","Football and other sporting careers.","足球及其他運動員生涯。","Neutral to informal.","中性至非正式。","I hung up my boots for one afternoon and played the next morning.","只休息一個下午，不是永久退役。","She hung up her boots because she bought a new shoe rack.","購買鞋架是字面動作，並非結束球員生涯。","Is the playing career ending?|Is it permanent rather than temporary?|Does the possessive match the player?","球員生涯結束嗎？|是永久而非暫停嗎？|所有格與球員相符嗎？"],
    "idiom-27": ["Say that something has not happened for a very long time.","表示很久沒有做某事或出現某情況。","A very long gap stretches between two visits.","兩次探訪之間隔了很長時間。","It normally looks back over a long gap, often with a negative perfect form.","通常回顧長時間的空白，常配合完成式否定句。","Reunions, visits and long-absent experiences.","重聚、探訪及久違的體驗。","Informal.","非正式。","I haven't seen you in a dog's age—we met five minutes ago.","五分鐘不算很久。","I've visited her every day in a dog's age.","每天探訪，便沒有長時間沒見。","Has there really been a long gap?|Does the sentence express non-occurrence?|Did I keep in a dog’s age?","真的隔了很久嗎？|句子表達長久未發生嗎？|固定說法完整嗎？"],
    "idiom-28": ["Describe two people or things that do not mix well.","形容兩人或兩事物格格不入，難以配合。","Oil and water separate instead of blending.","油和水放在一起，也難以融合。","Difference alone is not enough; there must be friction or incompatibility.","只有差異仍不足夠；須有相處或配合上的衝突。","Partnerships, personalities and clashing plans.","合作關係、性格及不相容的計劃。","Conversational and mildly critical.","口語常見，帶輕微批評。","We are like oil and water because our different skills complement each other perfectly.","技能不同卻配合完美，並非格格不入。","The two plans are like oil and water because both work smoothly together.","兩個計劃能順利結合，便不相斥。","Are there two sides?|Do they clash rather than complement?|Did I use like oil and water?","是否有兩方？|彼此相斥而非互補嗎？|固定說法正確嗎？"],
    "idiom-29": ["Name an exaggerated obstacle used as a reason to avoid action.","指被誇大並用作拖延或逃避理由的障礙。","Someone imagines a lion blocking an ordinary path.","有人以為普通道路上有獅子擋路。","Do not dismiss a real danger as imaginary; check the evidence first.","不能把真實危險說成幻想；應先核實情況。","Procrastination and overstated worries.","拖延及被誇大的憂慮。","Formal or literary; use sparingly.","較正式或文學化，宜審慎使用。","The verified flood is a lion in the way, so we can ignore every safety warning.","真實水災不能被當成藉口而忽視安全。","A small spelling question is a lion in the way because it is actually a wild animal.","這裡不是指真的獅子。","Is the obstacle exaggerated?|Is it being used to avoid action?|Have I checked real danger first?","障礙被誇大了嗎？|有人藉此不行動嗎？|有否先核實真實危險？"],
    "idiom-30": ["Describe entering or facing a seriously dangerous situation.","形容走進或身處有嚴重風險的處境。","A person moves toward the jaws of a lion.","一個人一步步走向獅子的嘴。","Reserve it for substantial danger, not ordinary embarrassment or inconvenience.","只用於重大危險，普通尷尬或不便不宜誇大。","Threats, hostile encounters and severe risks.","威脅、敵意環境及嚴重風險。","Dramatic and relatively formal.","戲劇性較強，語氣相對正式。","I stepped into the lion's mouth by choosing the wrong sandwich for lunch.","午餐選錯三文治，只是不便，並非重大危險。","She was in the lion's mouth because the meeting ran five minutes late.","會議遲五分鐘，通常不算高度危險。","Is the danger serious?|Is the person entering or inside it?|Did I choose in or into correctly?","危險嚴重嗎？|是進入還是身處其中？|in／into 用得恰當嗎？"]
  };

  const extended = {};
  const fixedChunks = {
    "idiom-06": "while the iron is hot", "idiom-07": "easy on the eye", "idiom-08": "in + possessive + bones",
    "idiom-09": "open-and-shut", "idiom-10": "which way the cat jumps", "idiom-11": "better safe than sorry",
    "idiom-12": "with fire", "idiom-13": "fuel to the fire", "idiom-14": "talk big",
    "idiom-15": "a ball of fire", "idiom-16": "the bank", "idiom-17": "an arm and a leg",
    "idiom-18": "built on sand", "idiom-19": "under a cloud", "idiom-20": "a dark horse",
    "idiom-21": "the law of the jungle", "idiom-22": "the plunge", "idiom-23": "many irons in the fire",
    "idiom-24": "above + reflexive pronoun", "idiom-25": "the acid test", "idiom-26": "hang up + possessive + boots",
    "idiom-27": "in a dog’s age", "idiom-28": "like oil and water", "idiom-29": "a lion in the way",
    "idiom-30": "the lion’s mouth"
  };
  const approvedForms = {
    "idiom-06": ["strike while the iron is hot", "struck while the iron was hot", "striking while the iron is hot"],
    "idiom-07": ["is easy on the eye", "remains easy on the eye", "find it easy on the eye"],
    "idiom-08": ["know in my bones", "knew in his bones", "felt in her bones"],
    "idiom-09": ["an open-and-shut case", "the matter is open-and-shut", "not open-and-shut"],
    "idiom-10": ["see which way the cat jumps", "saw which way the cat jumped", "wait to see which way the cat jumps"],
    "idiom-11": ["better safe than sorry", "I'll check—better safe than sorry", "Better safe than sorry, so I'll check"],
    "idiom-12": ["play with fire", "played with fire", "playing with fire"],
    "idiom-13": ["add fuel to the fire", "added fuel to the fire", "adding fuel to the fire"],
    "idiom-14": ["talk big", "talked big", "talking big"],
    "idiom-15": ["is a ball of fire", "was a ball of fire", "could be a ball of fire"],
    "idiom-16": ["break the bank", "won't break the bank", "broke the bank"],
    "idiom-17": ["cost an arm and a leg", "costs an arm and a leg", "could cost an arm and a leg"],
    "idiom-18": ["is built on sand", "was built on sand", "a plan built on sand"],
    "idiom-19": ["is under a cloud", "came under a cloud", "remained under a cloud"],
    "idiom-20": ["is a dark horse", "was a dark horse", "could be a dark horse"],
    "idiom-21": ["the law of the jungle", "it was the law of the jungle", "end the law of the jungle"],
    "idiom-22": ["take the plunge", "took the plunge", "has taken the plunge"],
    "idiom-23": ["have many irons in the fire", "has many irons in the fire", "had many irons in the fire"],
    "idiom-24": ["getting above himself", "got above herself", "get above yourself"],
    "idiom-25": ["the acid test of a plan", "the acid test for a team", "pass the acid test"],
    "idiom-26": ["hang up his boots", "hung up her boots", "hanging up their boots"],
    "idiom-27": ["haven't seen her in a dog’s age", "hadn't played in a dog’s age", "haven't been this busy in a dog’s age"],
    "idiom-28": ["are like oil and water", "were like oil and water", "have been like oil and water"],
    "idiom-29": ["a lion in the way", "saw a lion in the way", "treated it as a lion in the way"],
    "idiom-30": ["in the lion’s mouth", "into the lion’s mouth", "put her head into the lion’s mouth"]
  };
  // Page 02 tests the situation before the learner sees English answer forms.
  // These three scenes are parallel in length and do not leak the key by
  // including the idiom in only the incorrect choices.
  const situationScenes = {
    "idiom-06": ["A useful discount ends tonight, and the buyer can act now.","The buyer waits until the discount expires before deciding.","The buyer pays full price for something they never wanted.","折扣今晚結束，買家現在可以行動。","買家等到折扣過期才決定。","買家以原價購買本來不想要的東西。"],
    "idiom-07": ["A poster's calm colours and spacing make it comfortable to view.","A loud alarm sounds gentle, though nobody looks at it.","A screen is cheap to repair, though its display is harsh.","海報配色柔和、間距適中，看起來舒服。","警報聲柔和，但這與視覺無關。","螢幕維修便宜，畫面卻刺眼。"],
    "idiom-08": ["Someone feels deeply sure of an outcome without having proof.","Someone reads an official report that proves every detail.","A judge declares guilt without seeking any evidence at all.","某人沒有證據，卻從心底確信結果。","某人讀過證明一切的官方報告。","法官未找證據便斷定有罪。"],
    "idiom-09": ["Two independent records agree, leaving almost no serious doubt.","Two reliable witnesses give conflicting accounts of the event.","Nobody has checked the evidence, so the conclusion is unknown.","兩份獨立紀錄一致，幾乎沒有重大疑點。","兩名可靠證人的說法互相矛盾。","尚未查看證據，結論仍然未知。"],
    "idiom-10": ["A decision remains open while someone waits for a useful update.","Someone signs the final contract and only then considers options.","Someone refuses to decide even after all information is available.","決定仍未作出，有人等待有用消息。","有人簽妥最終合約，才考慮選擇。","所有資訊已齊，有人仍堅決不作決定。"],
    "idiom-11": ["A traveller carries a light raincoat because rain is possible.","A resident ignores a real fire alarm instead of leaving.","Someone cancels every harmless plan despite no plausible risk.","可能下雨，旅客帶上一件輕便雨衣。","住客無視真實火警，沒有撤離。","毫無合理風險，卻取消所有無害計劃。"],
    "idiom-12": ["A student changes official marks and risks serious punishment.","A child tries a different ice-cream flavour without danger.","An employee follows a tested safety procedure with care.","學生改動正式成績，可能受到嚴重處分。","孩子試另一種雪糕口味，沒有危險。","員工小心遵守已驗證的安全程序。"],
    "idiom-13": ["An argument is underway, and a mocking post makes it worse.","A sincere apology calms an argument that was already tense.","Before any dispute starts, someone quietly leaves the room.","爭執已經發生，嘲諷貼文令情況惡化。","真誠道歉令緊張的爭執平息。","尚未起爭端，有人安靜離開。"],
    "idiom-14": ["A player boasts of certain victory despite having no record.","A player quietly reports results already verified by the coach.","A player asks cautiously whether the team is ready.","球員毫無成績，卻誇口必勝。","球員平實交代教練已證實的成績。","球員審慎詢問隊伍是否準備好。"],
    "idiom-15": ["An energetic volunteer takes initiative and inspires the group.","A real football catches fire in an empty field.","An empty room has no active person in it.","充滿活力的義工主動做事，鼓舞團體。","空地上一個真正的足球着了火。","空房間裏沒有活躍的人。"],
    "idiom-16": ["An expensive refit would use nearly all of a café's savings.","A free ticket requires no money from the buyer.","A modest purchase fits easily within the family's budget.","昂貴裝修會耗盡咖啡店幾乎所有積蓄。","免費門票不用買家付錢。","一筆小開支在家人的預算之內。"],
    "idiom-17": ["A repair bill is far beyond what the family expected.","A pencil is given away for free at the desk.","A hotel lists four beds but gives no price at all.","維修帳單遠高於家人預期。","櫃檯免費派發鉛筆。","酒店列出四張床，卻沒有任何價錢資料。"],
    "idiom-18": ["A plan relies on an untested assumption that may fail.","A plan has been thoroughly tested with reliable results.","A claim is confirmed by several independent sources.","計劃依賴一項可能錯誤的未驗證假設。","計劃已充分測試，結果可靠。","說法得到多個獨立來源確認。"],
    "idiom-19": ["A worker faces unproved suspicion while an inquiry continues.","A rumour is treated as proof of guilt without investigation.","A person receives praise and faces no accusation or doubt.","調查仍在進行，員工受到未證實的懷疑。","未調查便把傳聞當成有罪證據。","某人只受到讚賞，沒有指控或懷疑。"],
    "idiom-20": ["An overlooked entrant performs well enough to challenge favourites.","Everyone already expects the top-ranked entrant to win.","A horse is described only by the colour of its coat.","原本被忽視的參賽者表現出色，能挑戰熱門人選。","所有人早已預計最高排名的參賽者勝出。","描述一匹馬的毛色，沒有談競爭。"],
    "idiom-21": ["With no fair rules, powerful groups take resources from weaker ones.","A friendly contest follows rules that protect every entrant.","A garden has many plants but no conflict over power.","沒有公平規則，強勢團體搶走弱勢者的資源。","友善比賽有規則保障每位參賽者。","花園有很多植物，沒有權力衝突。"],
    "idiom-22": ["After long hesitation, a person commits to a major change.","Someone orders the same breakfast as usual without deciding anything new.","Someone imagines a change but never chooses or acts.","長久猶豫後，某人決定作重大改變。","某人照常點早餐，沒有新決定。","某人只是想像改變，從未作選擇或行動。"],
    "idiom-23": ["A volunteer actively manages several projects at the same time.","Someone once considered several hobbies but does none of them.","Someone completed several projects last year and has none now.","義工同時積極管理多個項目。","某人曾考慮幾種嗜好，卻一樣也沒做。","某人去年完成多個項目，現在沒有項目。"],
    "idiom-24": ["After promotion, a worker belittles people who helped her.","After winning, a worker sincerely thanks everyone who helped.","A leader admits he still needs his colleagues' advice.","晉升後，員工輕視曾幫助她的人。","得獎後，員工真誠感謝所有幫手。","領袖承認仍需要同事的意見。"],
    "idiom-25": ["A demanding live trial reveals whether a product truly works.","A box's colour is used to judge an umbrella's waterproofing.","An unrelated quiz is said to prove an entire course's quality.","嚴格實測揭示產品是否真的有效。","只看盒子顏色便判斷雨傘能否防水。","無關測驗被說成能證明整個課程質素。"],
    "idiom-26": ["After a long career, a player retires from competition permanently.","A player misses one afternoon but competes the next morning.","A player buys a rack to store footwear in a bedroom.","多年球員生涯後，運動員永久退役。","球員只缺席一個下午，翌晨繼續作賽。","球員買鞋架在睡房放鞋。"],
    "idiom-27": ["Two cousins meet after many years without seeing one another.","Two friends meet again just five minutes after parting.","Someone visits the same relative every single day.","兩名表親多年不見後重聚。","兩名朋友分開五分鐘後再見面。","某人每天都探望同一位親人。"],
    "idiom-28": ["Two partners' clashing methods stop them working together.","Two people have different skills that complement each other.","Two plans fit smoothly together despite different details.","兩名合夥人的做法相斥，難以合作。","兩人技能不同，卻互相配合。","兩個計劃細節不同，卻能順利結合。"],
    "idiom-29": ["A small difficulty is exaggerated and used to delay the task.","A verified flood creates real danger that requires safety measures.","A child sees a real lion at a wildlife park.","小困難被誇大，成為拖延工作的理由。","已證實的水災帶來真實危險，須採安全措施。","孩子在野生動物園看到真正的獅子。"],
    "idiom-30": ["Someone knowingly enters a place where serious threats await.","Someone chooses the wrong sandwich and feels briefly annoyed.","A meeting runs five minutes late without any real danger.","某人明知有嚴重威脅，仍進入危險地點。","某人選錯三文治，只是短暫不快。","會議延遲五分鐘，卻沒有真正危險。"]
  };
  // Each contrast changes the idiom inside the original answer, leaving its
  // actor, setting and surrounding details in place. Explanations name the
  // actual distinction; no answer is keyed by sentence length or subject.
  const contrasts = {
    "idiom-06": [["while","after","after 把行動推遲到時機之後，失去『趁熱』的意思。"],["hot","cold","cold 表示有利時機已經過去。"],["iron","offer","固定意象是 iron；offer 只點出交易，沒有正確用上慣用語。"]],
    "idiom-07": [["easy","hard","hard on the eye 表示刺眼或不舒服，意思相反。"],["eye","ear","ear 評價聲音，原句評價的是視覺外觀。"],["eye","wallet","wallet 指費用或負擔，不是看起來是否悅目。"]],
    "idiom-08": [["bones","notes","notes 是筆記證據，不是無法解釋的內在直覺。"],["bones","dreams","dreams 是夢境，不能等同強烈而清醒的預感。"],["bones","memory","memory 是記憶，不是這個固定慣用語的感覺。"]],
    "idiom-09": [["open-and-shut","open-and-unclear","unclear 表示仍有疑點，與原句的清晰結論相反。"],["open-and-shut","open-and-doubtful","doubtful 表示不確定，不能表達證據明確。"],["open-and-shut","open-and-closed","open-and-closed 不是表示案件毫無懸念的固定說法。"]],
    "idiom-10": [["cat","plan","固定慣用語要用 cat；plan 不是這個意象。"],["jumps","sleeps","sleeps 指貓在睡覺，失去觀望事態走向的意思。"],["jumped","slept","slept 指貓睡覺，不是觀望事態走向。"],["which way","whether","whether 只問會否發生，不是觀察往哪一方發展。"]],
    "idiom-11": [["safe","sorry","better sorry than sorry 不能表達先防範、免後悔的對比。"],["safe","fast","fast 強調速度，沒有合理防範的意思。"],["sorry","late","late 關乎時間，並非事後後悔的後果。"]],
    "idiom-12": [["fire","water","water 不是這個表示嚴重風險的固定意象。"],["fire","safety","safety 表示安全，與冒險惹禍的意思相反。"],["with fire","for fun","for fun 只說為了好玩，沒有說明嚴重風險。"]],
    "idiom-13": [["fuel","water","water 通常用來滅火，與令已有衝突惡化相反。"],["fire","peace","peace 表示和解，不是原來已在惡化的衝突。"],["fuel to the fire","fuel to the car","car 指實際汽車燃料，沒有『火上加油』的比喻。"]],
    "idiom-14": [["big","softly","softly 只描述說話音量，不是誇口。"],["big","clearly","clearly 表示清楚表達，不代表吹噓。"],["big","briefly","briefly 指話說得短，沒有誇大的意思。"]],
    "idiom-15": [["a ball of fire","a ball of nerves","a ball of nerves 表示焦慮，不是充滿幹勁。"],["a ball of fire","a ball of ice","a ball of ice 不是形容精力充沛之人的固定說法。"],["a ball of fire","a wall of fire","a wall of fire 是火牆，不能自然形容一個人有活力。"]],
    "idiom-16": [["the bank","the ice","break the ice 指打破尷尬，不是花費太高。"],["the bank","a record","break a record 指創紀錄，不是預算壓力。"],["the bank","the rules","break the rules 指違反規則，不是花費。"]],
    "idiom-17": [["an arm and a leg","a minute and a half","a minute and a half 是時間長度，不是高昂價錢。"],["an arm and a leg","an apple and a pear","an apple and a pear 是物件，不是表示昂貴的慣用語。"],["an arm and a leg","a hand and a foot","a hand and a foot 不是表示價錢昂貴的固定說法。"]],
    "idiom-18": [["sand","rock","rock 象徵堅實基礎，與原句的薄弱基礎不同。"],["sand","facts","facts 指事實證據，不是欠缺可靠支持的意象。"],["sand","stone","stone 暗示較穩固的基礎，原句卻指出基礎薄弱。"]],
    "idiom-19": [["cloud","spotlight","spotlight 表示受到注目，並不一定受懷疑。"],["cloud","promise","promise 是承諾，不是籠罩聲譽的懷疑。"],["cloud","rainbow","rainbow 常帶正面意象，與聲譽蒙陰不同。"]],
    "idiom-20": [["a dark horse","a clear favourite","clear favourite 是大家看好的熱門人選，不是出乎意料的黑馬。"],["a dark horse","a black horse","black horse 只說馬的顏色，沒有低估後可能勝出的意思。"],["a dark horse","a known winner","known winner 早已被看好，與黑馬的意外性不同。"]],
    "idiom-21": [["the law of the jungle","the rules of fair play","fair play 有公平規則，與強者壓過公平相反。"],["the law of the jungle","the spirit of cooperation","cooperation 強調合作，不是弱肉強食。"],["the law of the jungle","the code of equal rights","equal rights 強調平等保障，與此慣用語的殘酷環境相反。"]],
    "idiom-22": [["the plunge","the stairs","take the stairs 是實際走樓梯，不是作出重大決定。"],["the plunge","a shortcut","take a shortcut 是走捷徑，不一定有經過猶豫的重大承諾。"],["the plunge","a break","take a break 是休息，並非下定決心採取行動。"]],
    "idiom-23": [["many irons in the fire","many ideas in the notebook","ideas in the notebook 只是想法，不代表同步處理多項工作。"],["many irons in the fire","many books on the shelf","books on the shelf 是物件數量，並非多項正在進行的任務。"],["many irons in the fire","many plans in the past","plans in the past 指過去計劃，不是現在同時忙碌。"]],
    "idiom-24": [["above","beside","beside 只表示旁邊，沒有自視高人一等的意思。"],["above","behind","behind 表示後方，並非傲慢的姿態。"],["above","below","below 表示下方，與自視高人一等相反。"]],
    "idiom-25": [["acid","easy","easy test 不一定能揭露真正質素，失去關鍵考驗之意。"],["acid","practice","practice test 是練習測驗，不一定是決定性的驗證。"],["acid","colour","colour test 關乎顏色，並非檢驗真正能力的固定慣用語。"]],
    "idiom-26": [["boots","coat","coat 是外套；固定運動退役說法是 hang up one’s boots。"],["boots","hat","hat 是帽子，不能代替這個運動退役慣用語。"],["boots","shoes","shoes 不是此處固定的 boots 說法。"]],
    "idiom-27": [["dog’s age","cat’s nap","cat’s nap 是短暫睡眠，不是很久沒做某事。"],["dog’s age","single day","single day 只是一日，不能表示久違。"],["dog’s age","short while","short while 時間短，與很久沒有發生相反。"]],
    "idiom-28": [["oil and water","bread and butter","bread and butter 可相互搭配，與彼此不合相反。"],["oil and water","salt and pepper","salt and pepper 是常見搭配，不表示難以融合。"],["oil and water","lock and key","lock and key 相互配合，並非格格不入。"]],
    "idiom-29": [["a lion in the way","a sign in the way","sign 是實際路牌，不是被誇大並用來逃避的障礙。"],["a lion in the way","a lion at the zoo","at the zoo 指真的動物，失去比喻意思。"],["a lion in the way","a path in the way","path 是道路，不是被當作藉口的危險。"]],
    "idiom-30": [["lion’s mouth","lion’s roar","roar 是獅吼聲，不是身陷危險的處境。"],["lion’s mouth","lion’s mane","mane 是獅鬃，不能代表走進險境。"],["lion’s mouth","lion’s tail","tail 是尾巴，與進入危險核心的意象不同。"]]
  };
  // Prefer two changes to source facts over three malformed idioms. These
  // targets must occur in both the prompt and answer, outside the idiom.
  const factContrasts = [
    ["today","tomorrow"],["tomorrow","today"],["tonight","tomorrow"],["yesterday","today"],
    ["now","later"],["later","now"],["immediately","eventually"],["early","late"],["late","early"],
    ["before","after"],["after","before"],["first","last"],["last","first"],
    ["new","old"],["old","new"],["young","old"],["small","large"],["large","small"],
    ["one","two"],["two","one"],["three","one"],["four","two"],["five","two"],
    ["six","nine"],["seven","three"],["eight","four"],["ten","two"],
    ["Monday","Friday"],["Tuesday","Thursday"],["Wednesday","Monday"],["Thursday","Tuesday"],["Friday","Monday"],["Saturday","Sunday"],["Sunday","Saturday"],
    ["day","week"],["week","month"],["month","year"],["year","week"],["morning","evening"],["afternoon","morning"],["evening","morning"],["night","morning"],
    ["school","office"],["office","school"],["team","class"],["class","team"],["club","team"],
    ["shop","restaurant"],["restaurant","shop"],["café","school"],["hotel","school"],
    ["room","garden"],["garden","room"],["home","school"],["town","school"],["city","village"],
    ["bag","coat"],["coat","bag"],["phone","laptop"],["laptop","phone"],["book","poster"],["poster","book"],
    ["bus","train"],["train","bus"],["car","bike"],["bike","car"],["flight","train"],
    ["meeting","party"],["party","meeting"],["match","practice"],["practice","match"],["test","game"],["game","test"],
    ["plan","report"],["report","plan"],["project","meeting"],["course","trip"],["trip","course"],
    ["price","date"],["date","price"],["money","time"],["time","money"],["food","clothes"],
    ["quiet","noisy"],["noisy","quiet"],["clear","unclear"],["unclear","clear"],
    ["cheap","expensive"],["expensive","cheap"],["affordable","unaffordable"],["unaffordable","affordable"],
    ["low","high"],["high","low"],["free","costly"],["costly","free"],
    ["few","many"],["many","few"],["all","some"],["none","some"],["every","one"],
    ["always","never"],["never","always"],["often","rarely"],["rarely","often"],
    ["busy","quiet"],["calm","angry"],["angry","calm"],["strong","weak"],["weak","strong"],
    ["true","false"],["false","true"],["correct","incorrect"],["incorrect","correct"],
    ["finished","unfinished"],["unfinished","finished"],["ready","unprepared"],
    ["red","blue"],["blue","red"],["green","yellow"],["yellow","green"],
    ["left","right"],["right","left"],["front","back"],["back","front"],
    ["safe","risky"],["risky","safe"],["ready","unprepared"],["unprepared","ready"],
    ["won","lost"],["lost","won"],["open","closed"],["closed","open"],
    ["started","finished"],["finished","started"],["start","finish"],["finish","start"],
    ["buy","sell"],["sell","buy"],["join","leave"],["leave","join"],
    ["accept","reject"],["reject","accept"],["yes","no"],["no","yes"],
    ["soft","harsh"],["gentle","harsh"],["harsh","gentle"],["pleasant","unpleasant"],
    ["comfortable","uncomfortable"],["uncomfortable","comfortable"],["tidy","messy"],["messy","tidy"],
    ["quietly","loudly"],["loudly","quietly"],["unlocked","locked"],["locked","unlocked"],
    ["proved","guessed"],["proven","unproven"],["proof","rumour"],["evidence","rumour"],
    ["video","rumour"],["camera","rumour"],["record","rumour"],["receipt","guess"],
    ["signed","unsigned"],["confirmed","disputed"],["known","unknown"],["unknown","known"],
    ["missing","found"],["found","missing"],["stolen","returned"],["returned","stolen"],
    ["furious","calm"],["anger","relief"],["danger","safety"],["dangerous","safe"],["violent","peaceful"],
    ["harm","help"],["help","harm"],["injured","healthy"],["healthy","injured"],
    ["friend","stranger"],["stranger","friend"],["brother","sister"],["sister","brother"],
    ["coach","player"],["captain","reserve"],["leader","member"],["manager","trainee"],
    ["worker","visitor"],["staff","visitors"],["customer","employee"],["seller","buyer"],
    ["arguing","agreeing"],["argument","discussion"],["dispute","agreement"],["conflict","agreement"],
    ["laughing","apologising"],["mocking","praising"],["shouting","whispering"],
    ["sharing","hiding"],["posted","deleted"],["sent","withheld"],["asked","answered"],
    ["password","username"],["bank","library"],["online","offline"],["public","private"],
    ["chess","football"],["football","chess"],["training","rest"],["energetic","tired"],
    ["lunch","dinner"],["breakfast","dinner"],["simple","luxury"],["luxury","simple"],
    ["washing","drying"],["machine","basket"],["repairing","replacing"],["repair","replacement"],
    ["lies","facts"],["facts","lies"],["promise","contract"],["untested","tested"],["tested","untested"],
    ["speech","spelling"],["contest","practice"],["final","opening"],["opening","final"],
    ["street","school"],["market","classroom"],["fair","unfair"],["unfair","fair"],
    ["flat","office"],["house","shop"],["moved","stayed"],["stayed","moved"],
    ["fifteen","five"],["twenty","ten"],["years","days"],["months","days"],
    ["cousins","colleagues"],["neighbours","strangers"],["relatives","colleagues"],
    ["little","heavy"],["heavy","little"],["rain","flood"],["flood","drizzle"],
    ["short","long"],["long","short"],["easy","difficult"],["difficult","easy"],
    ["notes","slides"],["without","with"],["with","without"],["topic","poem"],
    ["pay","leave"],["salary","bonus"],["workers","managers"],["manager","assistant"]
  ];
  // Broad noun swaps can make an answer ungrammatical ("a office") or
  // nonsensical ("time disappeared from the till"). Only use short details
  // whose substitution keeps the sentence's grammar and actor intact.
  const safeFactOriginals = new Set([
    "today", "tomorrow", "tonight", "yesterday", "now", "later", "immediately",
    "early", "late", "before", "after", "first", "last",
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    "morning", "afternoon", "evening", "night", "red", "blue", "green", "yellow",
    "left", "right", "open", "closed", "finished", "unfinished", "ready", "unprepared",
    "cheap", "expensive", "affordable", "unaffordable", "free", "costly",
    "clear", "unclear", "safe", "risky", "calm", "angry", "quiet", "noisy",
    "true", "false", "correct", "incorrect", "won", "lost", "started",
    "with", "without", "tested", "untested", "confirmed", "disputed"
  ]);
  function factualFoils(question, lesson) {
    const answer = String(question.answer || "");
    const prompt = String(question.prompt || "");
    const phrase = String(question.highlight || "");
    const phraseAt = answer.toLocaleLowerCase().indexOf(phrase.toLocaleLowerCase());
    if (phraseAt < 0) return [];
    const found = [];
    const seenOriginals = new Set();
    const actorTerms = new Set(["teacher", "student", "manager", "customer", "coach", "captain", "leader", "worker", "workers", "staff", "seller", "buyer", "friend", "stranger", "brother", "sister", "cousins", "neighbours", "relatives", "players", "children", "family"]);
    for (const [original, replacement] of factContrasts) {
      if (!safeFactOriginals.has(original)) continue;
      if (actorTerms.has(original.toLocaleLowerCase())) continue;
      const pattern = new RegExp(`\\b${original}\\b`, "ig");
      if (!new RegExp(`\\b${original}\\b`, "i").test(prompt) || !new RegExp(`\\b${original}\\b`, "i").test(answer)) continue;
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(answer))) {
        if (match.index >= phraseAt && match.index < phraseAt + phrase.length) continue;
        // Keep the original actor/subject, including a leading organisation.
        if ((answer.slice(0, match.index).match(/\b[\p{L}\p{N}]+\b/gu) || []).length < 6) continue;
        const altered = answer.slice(0, match.index) + replacement + answer.slice(match.index + match[0].length);
        if (altered === answer || seenOriginals.has(original.toLocaleLowerCase())) continue;
        seenOriginals.add(original.toLocaleLowerCase());
        found.push({ text: altered, reason: `原題的關鍵細節是「${match[0]}」；這句改成「${replacement}」，沒有保留原意。`, distance: Math.abs(match.index - phraseAt) });
        break;
      }
    }
    // A shared numerical detail is an exact fact, and changing it creates a
    // strong comparison without changing the actor or making the foil longer.
    for (const match of answer.matchAll(/\b\d+(?:\.\d+)?\b/g)) {
      if (match.index >= phraseAt && match.index < phraseAt + phrase.length) continue;
      if ((answer.slice(0, match.index).match(/\b[\p{L}\p{N}]+\b/gu) || []).length < 6) continue;
      if (!new RegExp(`\\b${match[0].replace(".", "\\.")}\\b`).test(prompt)) continue;
      const number = Number(match[0]);
      if (!Number.isFinite(number)) continue;
      const replacement = String(number + (number < 10 ? 1 : 10));
      const text = answer.slice(0, match.index) + replacement + answer.slice(match.index + match[0].length);
      found.push({ text, reason: `原題的數字是「${match[0]}」；這句改成「${replacement}」，改變了關鍵資料。`, distance: 1000 });
      break;
    }
    if (lesson.id === "idiom-16") {
      const polarity = /\b(won['’]t|wouldn['’]t|will|would|could|can)\b/i.exec(answer.slice(0, phraseAt));
      if (polarity) {
        const opposite = { "won't": "will", "wouldn't": "would", will: "won't", would: "wouldn't", could: "couldn't", can: "can't" }[polarity[0].toLocaleLowerCase().replace("’", "'")];
        if (opposite) {
          const text = answer.slice(0, polarity.index) + opposite + answer.slice(polarity.index + polarity[0].length);
          found.push({ text, reason: `這句把「${polarity[0]}」改成「${opposite}」，反轉了是否負擔得起的意思。`, distance: 2000 });
        }
      }
    }
    return found.sort((a, b) => b.distance - a.distance).slice(0, 2).map(({ text, reason }) => ({ text, reason }));
  }
  function contrastFoils(question, lesson) {
    const phrase = String(question.highlight || "");
    const source = String(question.answer || "");
    const rules = contrasts[lesson.id] || [];
    const foils = factualFoils(question, lesson);
    const phraseAtStart = source.toLocaleLowerCase().startsWith(phrase.toLocaleLowerCase());
    const caseMatch = (value) => phraseAtStart ? value[0].toLocaleUpperCase() + value.slice(1) : value;
    const wholePhraseContrasts = {
      "idiom-11": [
        ["better late than never", "better late than never 強調遲做總比不做好，不是預先防範風險。"],
        ["nothing ventured, nothing gained", "nothing ventured, nothing gained 鼓勵冒險，與審慎預防的意思不同。"],
        ["no pain, no gain", "no pain, no gain 強調努力承受辛苦以求成果，不是有備無患。"]
      ],
      "idiom-21": [
        ["the rule of law", "the rule of law 指按法律及公平規則治理，與強者壓過公平相反。"],
        ["a level playing field", "a level playing field 指公平競爭環境，與弱肉強食相反。"],
        ["the principle of fair competition", "fair competition 強調公平競爭，並非強者任意欺壓弱者。"]
      ],
      "idiom-15": [
        ["a shrinking violet", "shrinking violet 形容害羞退縮的人，與精力充沛相反。"],
        ["a real couch potato", "couch potato 形容懶於活動的人，不是積極投入。"],
        ["a nervous wreck", "nervous wreck 形容極度緊張的人，不等於充滿幹勁。"]
      ],
      "idiom-27": [
        ["for a few days", "for a few days 只說幾天，原題說的是很長時間。"],
        ["since this morning", "since this morning 只由今早算起，不是多年未見。"],
        ["for a short while", "for a short while 是短時間，與久違相反。"]
      ],
      "idiom-30": [
        ["the public eye", "public eye 指受公眾注目，不等於身處嚴重危險。"],
        ["a safe place", "safe place 表示安全處所，與走進險境相反。"],
        ["a calm room", "calm room 只形容平靜地方，沒有重大威脅。"]
      ],
      "idiom-19": [
        ["in the clear", "in the clear 表示已洗清嫌疑，與仍受懷疑相反。"],
        ["free from suspicion", "free from suspicion 表示沒有被懷疑，與原題相反。"],
        ["beyond all suspicion", "beyond all suspicion 表示不受懷疑，與原題相反。"]
      ],
      "idiom-29": [
        ["a rather small obstacle", "rather small obstacle 承認困難有限，沒有把它誇成難以跨越的障礙。"],
        ["a perfectly manageable hurdle", "manageable hurdle 表示困難可以處理，不是被誇大的危險。"],
        ["a real and serious threat", "real and serious threat 表示危險真實而重大，原題卻只是誇大小困難。"]
      ],
      "idiom-20": [
        ["a clear favourite", "clear favourite 是賽前已被看好的人選，與黑馬的意外性不同。"],
        ["a leading contender", "leading contender 指原本已受注目的競爭者，不是被低估的黑馬。"],
        ["a likely winner", "likely winner 表示大家預計他會勝出，與原題的意外性不符。"]
      ],
      "idiom-25": [
        ["the routine check", "routine check 只是例行檢查，沒有關鍵考驗的判斷力。"],
        ["the preliminary trial", "preliminary trial 是初步測試，不一定能作最終判斷。"],
        ["the final rehearsal", "final rehearsal 是預演，不是能驗證真正質素的關鍵考驗。"]
      ],
      "idiom-18": [
        ["built on rock", "built on rock 表示基礎穩固，與原題的薄弱基礎相反。"],
        ["grounded in verified facts", "verified facts 表示基礎已經核實，與原題未核實的前提不符。"],
        ["supported by strong data", "strong data 表示有充分資料支持，並非建立在沙上。"]
      ]
    }[lesson.id];
    if (wholePhraseContrasts) {
      for (const [replacement, reason] of wholePhraseContrasts) {
        if (foils.length === 3) break;
        let text = source.replace(phrase, caseMatch(replacement));
        if (lesson.id === "idiom-30") {
          const headPattern = /\b(put|puts|putting) (his|her|my|your|our|their) head (in|into) the lion[’']s mouth\b/i;
          const reflexive = { his: "himself", her: "herself", my: "myself", your: "yourself", our: "ourselves", their: "themselves" };
          text = source.replace(headPattern, (full, verb, possessive, direction) =>
            `${verb} ${reflexive[possessive.toLocaleLowerCase()]} ${replacement === "the public eye" ? "directly " : ""}${direction} ${replacement}`);
          if (text === source) text = source.replace(phrase, caseMatch(replacement));
        }
        if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason });
      }
    }
    if (lesson.id === "idiom-06") {
      const verb = /^(strikes|struck|strike)\b/i.exec(phrase)?.[1]?.toLocaleLowerCase();
      const variants = {
        strike: ["wait until the best chance passes", "delay action until the chance fades", "ignore this opportunity until tomorrow"],
        strikes: ["waits until the best chance passes", "delays action until the chance fades", "ignores this opportunity until tomorrow"],
        struck: ["waited until the best chance passed", "delayed action until the chance faded", "ignored this opportunity until tomorrow"]
      }[verb] || [];
      variants.forEach((replacement, index) => {
        if (foils.length === 3) return;
        const text = source.replace(phrase, caseMatch(replacement));
        const reasons = [
          "這句等到好機會過去才行動，與趁時機尚在採取行動相反。",
          "這句把行動拖延到機會漸失，沒有保留原題的把握時機之意。",
          "這句忽略眼前機會，與本課慣用語的意思相反。"
        ];
        if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason: reasons[index] });
      });
    }
    if (lesson.id === "idiom-14") {
      const verb = /^(talks|talked|talking|talk) big$/i.exec(phrase)?.[1]?.toLocaleLowerCase();
      const variants = {
        talks: ["speaks modestly", "asks questions", "shares facts"],
        talked: ["spoke modestly", "asked questions", "shared facts"],
        talking: ["speaking modestly", "asking questions", "sharing facts"],
        talk: ["speak modestly", "ask questions", "share facts"]
      }[verb] || [];
      variants.forEach((replacement, index) => {
        if (foils.length === 3) return;
        const text = source.replace(phrase, caseMatch(replacement));
        const reasons = [
          "speaks modestly 強調謙遜，沒有用本課慣用語表達誇口。",
          "asks questions 是提問，並非誇耀自己的能力。",
          "shares facts 是陳述資料，不等於誇大自己的本事。"
        ];
        if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason: reasons[index] });
      });
    }
    if (lesson.id === "idiom-16") {
      const verb = /^(breaks|breaking|broken|broke|break) the bank$/i.exec(phrase)?.[1]?.toLocaleLowerCase();
      const variants = {
        break: ["fit within the budget", "cost very much", "drain our savings"],
        breaks: ["fits within the budget", "costs very much", "drains our savings"],
        breaking: ["fitting within the budget", "costing very much", "draining our savings"],
        broke: ["fit within the budget", "cost very much", "drained our savings"],
        broken: ["fitted within the budget", "cost very much", "drained our savings"]
      }[verb] || [];
      variants.forEach((replacement, index) => {
        if (foils.length === 3) return;
        const text = source.replace(phrase, caseMatch(replacement));
        const reasons = [
          "fit within the budget 說的是開支能否負擔；須對照原題的肯定或否定語氣。",
          "cost very much 只直接說價錢，沒有用本課的固定慣用語。",
          "drain our savings 只說積蓄受影響，沒有用本課的固定慣用語。"
        ];
        if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason: reasons[index] });
      });
    }
    if (lesson.id === "idiom-22") {
      const verb = /^(takes|took|taken|taking|take) the plunge$/i.exec(phrase)?.[1]?.toLocaleLowerCase();
      const variants = {
        take: ["delay the choice", "avoid the decision", "consider the option"],
        takes: ["delays the choice", "avoids the decision", "considers the option"],
        took: ["delayed the choice", "avoided the decision", "considered the option"],
        taken: ["delayed the choice", "avoided the decision", "considered the option"],
        taking: ["delaying the choice", "avoiding the decision", "considering the option"]
      }[verb] || [];
      variants.forEach((replacement, index) => {
        if (foils.length === 3) return;
        const text = source.replace(phrase, caseMatch(replacement));
        const reasons = [
          "這句說延後決定，原題卻強調終於作出決定。",
          "這句說迴避決定，與原題已採取行動相反。",
          "這句只說考慮選項，沒有表達最後下定決心。"
        ];
        if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason: reasons[index] });
      });
    }
    if (lesson.id === "idiom-17") {
      for (const [replacement, reason] of [
        ["only a handful of dollars", "only a handful of dollars 表示價錢低廉，與原題的高昂費用相反。"],
        ["just a few dollars total", "just a few dollars total 表示開支很少，不能表達昂貴。"],
        ["no more than a meal", "no more than a meal 把開支比作一頓飯，與原題的沉重價格不符。"]
      ]) {
        if (foils.length === 3) break;
        const text = source.replace(/an arm and a leg/i, replacement);
        if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason });
      }
    }
    if (lesson.id === "idiom-08") {
      const pattern = /\b(knew|know|knows|felt|feel|feels) in (my|her|his|our|their|your) bones\b/i;
      const match = pattern.exec(source);
      if (match) {
        const verb = match[1].toLocaleLowerCase();
        const alternatives = /^(felt|feel|feels)$/.test(verb)
          ? ({ felt: ["had a vivid dream", "had some official proof", "read a reliable report"], feel: ["have a vivid dream", "have some official proof", "read a reliable report"], feels: ["has a vivid dream", "has some official proof", "reads a reliable report"] })[verb]
          : ({ knew: ["knew from a report", "heard from a witness", "had proof in hand"], know: ["know from a report", "hear from a witness", "have proof in hand"], knows: ["knows from a report", "hears from a witness", "has proof in hand"] })[verb];
        const reasons = [
          "這句把沒有證據的內在確信改成另一種來源或經歷，沒有用本課慣用語。",
          "這句改用外來資料或證據，與原題只憑內心直覺的情況不同。",
          "這句把直覺改成可查證的資料，沒有保留原題的依據。"
        ];
        alternatives.forEach((replacement, index) => {
          if (foils.length === 3) return;
          const text = source.replace(match[0], replacement);
          if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason: reasons[index] });
        });
      }
      const specific = {
        "idiom-08-q12": [
          "I have always planned to return to this town one day, after I finish my studies.",
          "I have always hoped to return to this town one day, perhaps with my old friends.",
          "I have always expected to return to this town one day, after my work was done."
        ],
        "idiom-08-q19": [
          "We sincerely hoped that the difficult year would end well for everyone.",
          "We had clear evidence that the difficult year would end well for everyone.",
          "We confidently expected that the difficult year would end well for everyone."
        ],
        "idiom-08-q46": [
          "People keep saying the plan will work, but I do not have any convincing proof at all yet.",
          "People keep saying the plan will work, but I do not trust the written report they gave.",
          "People keep saying the plan will work, but I still need to see more reliable evidence."
        ],
        "idiom-08-q49": [
          "I can read it in the report: the danger is real.",
          "I can prove it with clear evidence: the danger is real.",
          "I can see it in the records: the danger is real."
        ]
      }[question.id] || [];
      for (const text of specific) {
        if (foils.length === 3) break;
        if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason: "這句改說希望、計劃或外在證據，沒有自然使用本課表達內心直覺的慣用語。" });
      }
    }
    if (lesson.id === "idiom-09") {
      for (const [replacement, reason] of [
        ["uncertain", "uncertain 表示仍未確定，不能代替本課的固定慣用語。"],
        ["ambiguous", "ambiguous 表示有不止一種解讀，沒有使用本課慣用語。"],
        ["unambiguous", "unambiguous 雖可表示清楚，卻不是本課指定的慣用語。"]
      ]) {
        if (foils.length === 3) break;
        const text = source.replace(phrase, caseMatch(replacement));
        if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason });
      }
    }
    if (lesson.id === "idiom-23") {
      const match = /^(has|have|had) many irons in the fire$/i.exec(phrase);
      if (match) {
        for (const [suffix, reason] of [
          ["just one active project", "just one active project 只有一項進行中的工作，與原題同時兼顧多事不符。"],
          ["only past projects to show", "past projects 已完成，不是現在同時進行的多項任務。"],
          ["several idle plans on paper", "idle plans 只是尚未執行的想法，並非多項同步工作。"]
        ]) {
          if (foils.length === 3) break;
          const text = source.replace(phrase, `${match[1]} ${suffix}`);
          if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason });
        }
      }
    }
    if (lesson.id === "idiom-10") {
      const past = phrase.toLocaleLowerCase().startsWith("saw ");
      const alternatives = past
        ? [["saw which way the vote went", "這句同樣表示觀望結果，但沒有使用本課的貓跳向哪邊的慣用語。"], ["saw which option the group chose", "這句只直接交代所選選項，沒有使用本課慣用語。"], ["watched how the situation developed", "這句說觀察局勢，但沒有使用本課的慣用語。"]]
        : [["see which way the vote goes", "這句同樣表示觀望結果，但沒有使用本課的貓跳向哪邊的慣用語。"], ["see which option the group chooses", "這句只直接交代所選選項，沒有使用本課慣用語。"], ["watch how the situation develops", "這句說觀察局勢，但沒有使用本課的慣用語。"]];
      for (const [replacement, reason] of alternatives) {
        if (foils.length === 3) break;
        const text = source.replace(phrase, caseMatch(replacement));
        if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason });
      }
    }
    if (lesson.id === "idiom-26") {
      const match = /^(hang|hangs|hung|hanging) up (his|her|their|my|your|our) boots$/i.exec(phrase);
      if (match) {
        const lace = { hang: "lace", hangs: "laces", hung: "laced", hanging: "lacing" }[match[1].toLocaleLowerCase()];
        const put = { hang: "put", hangs: "puts", hung: "put", hanging: "putting" }[match[1].toLocaleLowerCase()];
        const continueVerb = { hang: "continue", hangs: "continues", hung: "continued", hanging: "continuing" }[match[1].toLocaleLowerCase()];
        for (const [replacement, reason] of [
          [`${lace} up ${match[2]} boots`, "lace up boots 表示穿好球靴準備繼續踢，不是永久退役。"],
          [`${put} on ${match[2]} boots`, "put on boots 是穿上球靴，並非結束球員生涯。"],
          [`${continueVerb} ${match[2]} playing career`, "continue a playing career 表示繼續作賽，與退役相反。"]
        ]) {
          if (foils.length === 3) break;
          const text = source.replace(phrase, caseMatch(replacement));
          if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason });
        }
      }
    }
    if (lesson.id === "idiom-24") {
      for (const [replacement, reason] of [
        [phrase.replace("above", "ahead of"), "ahead of oneself 表示想得或做得太早，不等於自視高人一等。"],
        [phrase.replace("above", "over"), "get over oneself 指放下自我中心，與變得傲慢的方向相反。"],
        [phrase.replace("above", "beside"), "beside oneself 指情緒激動，不是自視高人一等。"]
      ]) {
        if (foils.length === 3) break;
        const text = source.replace(phrase, replacement);
        if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason });
      }
    }
    if (lesson.id === "idiom-12") {
      const match = /^(play|plays|played|playing) with fire$/i.exec(phrase);
      if (match) {
        const tense = match[1].toLocaleLowerCase();
        const alternatives = {
          play: ["play it safe", "avoid serious risks", "stay out of trouble"],
          plays: ["plays it safe", "avoids serious risks", "stays out of trouble"],
          played: ["played it safe", "avoided serious risks", "stayed out of trouble"],
          playing: ["playing it safe", "avoiding serious risks", "staying out of trouble"]
        }[tense];
        const reasons = [
          "play it safe 指選擇安全做法，與原題的嚴重冒險相反。",
          "avoid serious risks 表示避開風險，不是原題的冒險行為。",
          "stay out of trouble 表示避免惹禍，與原題可能導致嚴重後果相反。"
        ];
        alternatives.forEach((replacement, index) => {
          if (foils.length === 3) return;
          const text = source.replace(phrase, caseMatch(replacement));
          if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason: reasons[index] });
        });
      }
    }
    if (lesson.id === "idiom-13") {
      const match = /^(add|adds|added|adding) fuel to the fire$/i.exec(phrase);
      if (match) {
        const tense = match[1].toLocaleLowerCase();
        const verbs = {
          add: ["make", "help", "reduce"], adds: ["makes", "helps", "reduces"],
          added: ["made", "helped", "reduced"], adding: ["making", "helping", "reducing"]
        }[tense];
        const alternatives = [
          `${verbs[0]} the tense situation calmer`,
          `${verbs[1]} calm the existing dispute`,
          `${verbs[2]} the growing tension`
        ];
        const reasons = [
          "這句說令緊張局面緩和，原題卻說衝突變得更差。",
          "這句說幫助平息爭執，與原題的惡化結果相反。",
          "這句說減少緊張，原題卻強調緊張加劇。"
        ];
        alternatives.forEach((replacement, index) => {
          if (foils.length === 3) return;
          const text = source.replace(phrase, caseMatch(replacement));
          if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason: reasons[index] });
        });
      }
    }
    for (const [search, replacement, reason] of rules) {
      if (foils.length >= 3) break;
      if (!phrase.toLocaleLowerCase().includes(search.toLocaleLowerCase())) continue;
      const altered = phrase.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), replacement);
      const text = source.replace(phrase, altered);
      if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason, kind: "fallback-form" });
      if (foils.length === 3) break;
    }
    return foils;
  }
  for (const lesson of catalogue.filter((item) => Number(item.order) >= 6 && Number(item.order) <= 30)) {
    const row = editorial[lesson.id];
    if (!row) continue;
    const [meaningEn, meaningZh, pictureEn, picture, boundaryEn, boundary, whereEn, where, toneEn, tone, badEn1, badZh1, badEn2, badZh2, checksEnJoined, checksJoined] = row;
    const source = lesson.questions;
    const model = source[0];
    const reading = source[39];
    const checksEn = checksEnJoined.split("|");
    const checks = checksJoined.split("|");
    const [fitScene, badScene1, badScene2, fitSceneZh, badSceneZh1, badSceneZh2] = situationScenes[lesson.id];
    const forms = approvedForms[lesson.id];
    const goodSecond = source[11].answer;
    const choice = (promptEn, promptZh, optionsEn, options, correct, feedbackEn, feedback) => ({
      promptEn, promptZh, optionsEn, options, correct, feedbackEn, feedback
    });
    extended[lesson.id] = {
      modelEn: model.answer, modelZh: model.answerZh,
      readAloudEn: reading.answer, readAloudZh: reading.answerZh,
      meaningEn, meaningZh, pictureEn, picture, boundaryEn, boundary,
      whereEn, where, toneEn, tone,
      formalEn: "In a formal report, state the precise action or evidence rather than relying on the idiom alone.",
      formal: "正式報告應直接交代行動或證據，不宜只靠慣用語表意。",
      fixed: fixedChunks[lesson.id] || forms[0],
      movingEn: lesson.fixedVariable?.variableEn || "Keep the phrase together; change only the surrounding grammar.",
      moving: lesson.fixedVariable?.variableZh || "保留固定說法，只按語境調整前後文法。",
      forms, checksEn, checks,
      choices: {
        2: choice("Which situation supports the lesson idiom?", "哪個情境真正符合這個慣用語？", [fitScene, badScene1, badScene2], [fitSceneZh, badSceneZh1, badSceneZh2], 0, `The first situation has the essential condition: ${meaningEn}`, `第一個情境符合核心意思：${meaningZh}`),
        3: choice("Which line uses the idiom with the right meaning and tone?", "哪一句在意思和語氣上最貼切？", [model.answer, badEn1, badEn2], [model.answerZh, badZh1, badZh2], 0, `This line fits the setting. ${boundaryEn}`, `這句符合情境。${boundary}`),
        5: choice(model.prompt, model.promptZh, [model.answer, badEn1, badEn2], [model.answerZh, badZh1, badZh2], 0, `The response uses the idiom to express this situation: ${meaningEn}`, `正確回應用慣用語表達：${meaningZh}`),
        6: choice("Which use of this idiom crosses its meaning boundary?", "哪一句誤用了這個慣用語？", [model.answer, goodSecond, badEn1], [model.answerZh, source[11].answerZh, badZh1], 2, boundaryEn, boundary)
      }
    };
  }
  window.EDMUND_IDIOM_COMPASS = Object.freeze({ ...existing, ...extended });
  window.EDMUND_IDIOM_COMPASS_FOILS = contrastFoils;
})();

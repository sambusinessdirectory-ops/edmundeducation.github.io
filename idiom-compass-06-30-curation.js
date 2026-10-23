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
  function factualFoils(question, lesson) {
    const answer = String(question.answer || "");
    const prompt = String(question.prompt || "");
    const phrase = String(question.highlight || "");
    const phraseAt = answer.toLocaleLowerCase().indexOf(phrase.toLocaleLowerCase());
    if (phraseAt < 0) return [];
    const found = [];
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
    return found.sort((a, b) => b.distance - a.distance).slice(0, 2).map(({ text, reason }) => ({ text, reason, kind: "fact" }));
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
        ["for a single week", "for a single week 只說一週，不是多年未見。"],
        ["for a short while", "for a short while 是短時間，與久違相反。"]
      ],
      "idiom-30": [
        ["the public eye", "public eye 指受公眾注目，不等於身處嚴重危險。"],
        ["an awkward conversation", "awkward conversation 只是尷尬對話，沒有走進嚴重險境的意思。"],
        ["a minor argument", "minor argument 只是輕微爭執，沒有原題所說的重大危險。"]
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
        ["an early indication", "early indication 只是初步跡象，不是能驗證真正質素的關鍵考驗。"]
      ],
      "idiom-18": [
        ["built on rock", "built on rock 表示基礎穩固，與原題的薄弱基礎相反。"],
        ["grounded in verified facts", "verified facts 表示基礎已經核實，與原題未核實的前提不符。"],
        ["supported by strong data", "strong data 表示有充分資料支持，並非建立在沙上。"]
      ]
    }[lesson.id];
    const cloudTransition = lesson.id === "idiom-19"
      ? /\b(come|comes|came|coming) under a cloud\b/i.exec(source)
      : null;
    if (cloudTransition) {
      const verb = cloudTransition[1].toLocaleLowerCase();
      const replacements = {
        come: ["receive warm public praise", "be free from suspicion", "win back public trust"],
        comes: ["receives warm public praise", "is free from suspicion", "wins back public trust"],
        came: ["received warm public praise", "was free from suspicion", "won back public trust"],
        coming: ["receiving warm public praise", "being free from suspicion", "winning back public trust"]
      }[verb];
      replacements.forEach((replacement) => {
        if (foils.length === 3) return;
        foils.push({
          text: source.replace(cloudTransition[0], replacement),
          reason: "這句改成受到讚賞或擺脫懷疑，與原題仍然蒙受嫌疑的情況相反。"
        });
      });
    }
    if (lesson.id === "idiom-21") {
      const before = source.slice(0, source.toLocaleLowerCase().indexOf(phrase.toLocaleLowerCase()));
      const nominal = /\b(?:is|was|became|become|like|into|actually)\s+$/i.test(before);
      const replacements = nominal
        ? ["the rule of fair play", "a system of fair competition", "a culture of mutual respect"]
        : ["clear and fair rules", "equal and transparent rules", "fair and consistently enforced rules"];
      for (const replacement of replacements) {
        if (foils.length === 3) break;
        let text = source.replace(phrase, caseMatch(replacement));
        text = text.replace(/\b(ruled|governed) by (clear and fair rules|equal and transparent rules|fair and consistently enforced rules)/i, (_, verb, rules) => `${verb === "ruled" ? "guided" : "governed"} by ${rules}`);
        text = text.replace(/\b(\w+(?:\s+\w+){0,3}) (to rule|used to rule|will soon rule|ruled)\b/i, (full, lead, verb) => {
          if (!lead.endsWith("rules")) return full;
          if (verb === "to rule" && /^\s+(?:the|a|an|this|that|our|their)\b/i.test(text.slice(text.indexOf(full) + full.length))) return `${lead} to govern`;
          return `${lead} ${verb.replace(/rule(d)?$/, (_, past) => past ? "prevailed" : "prevail")}`;
        });
        if (text !== source && !foils.some((item) => item.text === text)) foils.push({ text, reason: "這句改成公平規則或互相尊重；原題說的是強者壓過保障的環境。" });
      }
    }
    if (wholePhraseContrasts && !cloudTransition && lesson.id !== "idiom-21") {
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
        break: ["fit within the budget", "be too expensive", "cost a fortune"],
        breaks: ["fits within the budget", "is too expensive", "costs a fortune"],
        breaking: ["staying within the budget", "being too expensive", "costing a fortune"],
        broke: ["fit within the budget", "was too expensive", "cost a fortune"],
        broken: ["stayed within the budget", "been too expensive", "cost a fortune"]
      }[verb] || [];
      variants.forEach((replacement, index) => {
        if (foils.length === 3) return;
        const text = source.replace(phrase, caseMatch(replacement));
        const reasons = [
          "這句只說預算是否足夠；須對照原題的肯定或否定語氣，也沒有用本課慣用語。",
          "too expensive 只直接說價錢，沒有用本課的固定慣用語。",
          "cost a fortune 是另一種說法，沒有用本課指定的慣用語。"
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
      const negativePrice = /\b(?:not|never|without|won['’]t|can['’]t)\b(?:\s+\w+){0,3}\s*$/i.test(source.slice(0, source.toLocaleLowerCase().indexOf(phrase.toLocaleLowerCase())));
      for (const [replacement, reason] of (negativePrice ? [
        ["a great deal of money", "這句直接說花費不少錢，意思接近，但沒有用本課指定的慣用語。"],
        ["a large sum of money", "這句直接描述大筆開支，沒有用本課的固定慣用語。"],
        ["an enormous amount", "這句形容高價，卻沒有用本課的慣用語。"]
      ] : [
        ["only a handful of dollars", "only a handful of dollars 表示價錢低廉，與原題的高昂費用相反。"],
        ["just a few dollars total", "just a few dollars total 表示開支很少，不能表達昂貴。"],
        ["no more than a meal", "no more than a meal 把開支比作一頓飯，與原題的沉重價格不符。"]
      ])) {
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
          ["just one task under way", "just one task 只有一項進行中的工作，與原題同時兼顧多事不符。"],
          ["several plans on hold", "plans on hold 尚未執行，並非多項同步工作。"],
          ["very little work ongoing", "very little work ongoing 表示當前工作量很少，與原題相反。"]
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
        ? [["saw how the whole situation developed", "這句直接說觀望局勢，但沒有使用本課慣用語。"], ["saw how events unfolded from there", "這句說觀察事情發展，沒有用本課指定的慣用語。"], ["saw how the situation played out", "這句同樣表示觀望結果，卻沒有用本課的固定說法。"]]
        : [["see how the whole situation develops", "這句直接說觀望局勢，但沒有使用本課慣用語。"], ["see how events unfold from here", "這句說觀察事情發展，沒有用本課指定的慣用語。"], ["see how the situation plays out", "這句同樣表示觀望結果，卻沒有用本課的固定說法。"]];
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
        [phrase.replace("above", "down on"), "get down on oneself 指責怪或貶低自己，與自視高人一等相反。"]
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
  // Two independent decisions per lesson. Page 03 tests evidence and register;
  // page 05 asks for a usable response in a different setting. Each tuple is
  // [English situation, Traditional Chinese situation, English choices,
  //  Traditional Chinese choices, English reason, Traditional Chinese reason].
  const freshDecisions = {
    "idiom-06": [
      ["A gallery can still book a visiting artist, but the offer expires tonight. Which advice fits?", "畫廊仍可預約一位到訪藝術家，但邀請今晚失效。哪項建議合適？", ["Strike while the iron is hot and confirm the booking today.", "Strike while the iron is hot after the artist accepts another offer.", "Strike while the iron is hot by buying unrelated paintings instead."], ["趁邀請仍有效，今天便確認預約。", "藝術家接受別人的邀請後才行動，已錯過機會。", "購買無關畫作並非把握這項邀請。"], "The invitation is open now and may disappear tonight.", "邀請仍有效，但今晚可能失效；此時行動才是把握時機。"],
      ["Your friend can apply for a funded internship until Friday. What would you tell her?", "朋友可在星期五前申請有津貼的實習。你會怎樣提醒她？", ["Strike while the iron is hot—send the application before Friday.", "Strike while the iron is hot—wait until the application closes.", "Strike while the iron is hot—accept a role she does not want."], ["趁截止前遞交申請，把握現有機會。", "等到截止後才申請，便錯過時機。", "接受不想要的工作，不代表善用這項申請機會。"], "The useful opening has a clear deadline.", "實習申請有截止日期；應趁機會仍在時行動。"]
    ],
    "idiom-07": [
      ["A designer wants feedback on a new library sign. Which comment concerns its appearance?", "設計師想聽新圖書館標示的意見。哪句評價的是外觀？", ["The uncluttered sign is easy on the eye.", "The loud announcement is easy on the eye.", "The low printing bill is easy on the eye."], ["標示清爽悅目，看起來舒服。", "廣播音量屬聽覺，不是視覺。", "印刷費低屬成本，不是外觀。"], "The comment evaluates what people see.", "這句評價的是標示的視覺效果，而非聲音或價錢。"],
      ["Your classmate has simplified a crowded presentation slide. What praise sounds natural?", "同學把擠迫的簡報頁面整理得更簡潔。你會怎樣自然地稱讚？", ["The new layout is easy on the eye; I can follow it now.", "The new layout is easy on the eye; it sounds quieter now.", "The new layout is easy on the eye; it costs less now."], ["新版面悅目，內容也更容易看清。", "版面不會因設計改變而『聽起來』更安靜。", "節省成本不是 easy on the eye 的意思。"], "The response names a visible improvement.", "新版面在視覺上較舒適，因此用 easy on the eye 貼切。"]
    ],
    "idiom-08": [
      ["Before any results arrive, a singer feels certain that her audition went well. Which account is honest?", "成績未公布前，歌手強烈覺得試音成功。哪種說法如實？", ["I know in my bones that the audition went well, though I have no result yet.", "I know in my bones that it went well because the official score proves it.", "I know in my bones that it went well, so no one needs to hear me sing."], ["尚未有結果，但內心強烈相信試音順利。", "已有正式分數作證，重點便不是沒有證據的直覺。", "個人直覺不能代替別人實際聆聽。"], "The speaker admits certainty without claiming proof.", "說話者承認仍未有結果，只表達強烈直覺。"],
      ["A friend asks why you returned to your childhood town despite no clear plan. How might you answer?", "朋友問你為何在尚無明確計劃時回到童年住過的小鎮。你會怎樣回答？", ["I knew in my bones that I belonged here, even before I found work.", "I knew in my bones that I belonged here because a contract required it.", "I knew in my bones that everyone here must feel exactly as I do."], ["尚未找到工作時，內心已強烈覺得自己屬於這裏。", "合約要求是外在理由，並非內心的強烈直覺。", "自己的直覺不能證明每個人都有相同感受。"], "This is a personal conviction, not a claim about others.", "這句只表達自己的內在確信，沒有冒稱掌握他人的感受。"]
    ],
    "idiom-09": [
      ["A refund dispute has a signed receipt and an admission. Which assessment is justified?", "退款爭議有已簽收據，也有人承認錯誤。哪項判斷有根據？", ["With the signed receipt and admission, the case looks open-and-shut.", "With two opposing witnesses, the case is certainly open-and-shut.", "Without checking any records, the case must be open-and-shut."], ["有收據和承認，事情看來沒有重大疑點。", "證人說法相反，不能斷言毫無疑點。", "未核查紀錄，不能先斷言事情明確。"], "Two independent facts support the conclusion.", "收據和承認互相支持，因此作此判斷有根據。"],
      ["A colleague says the missing parcel case is obvious, but the delivery photo shows a different door. What would you say?", "同事說包裹失蹤案很明確，但送貨照片拍到另一扇門。你會怎樣回應？", ["It isn't open-and-shut; the delivery photo raises a real question.", "It is open-and-shut; the wrong doorway proves everything is settled.", "It is open-and-shut; we need not look at the photo at all."], ["案件並非毫無疑點；照片提出重要問題。", "拍到錯誤門口，反而令原有結論存疑。", "不看照片便斷言案情明確，缺乏根據。"], "A contradictory photo prevents a simple conclusion.", "照片與原有說法不符，不能稱為 open-and-shut。"]
    ],
    "idiom-10": [
      ["Two proposals are under discussion and a public vote is tomorrow. Which reply suits the uncertainty?", "兩項方案仍在討論，明天有公眾投票。哪句回應符合未明朗的局面？", ["Let's see which way the cat jumps before we back either proposal.", "Let's see which way the cat jumps after we sign an irreversible deal.", "Let's see which way the cat jumps and refuse to decide forever."], ["先看投票結果，再決定支持哪項方案。", "簽下不能撤回的協議後，便不是決定前觀望。", "永遠不決定，並非等待有用資訊。"], "The vote can inform a decision that is still open.", "決定尚未作出，投票結果可提供有用資訊。"],
      ["Your family asks whether to book a hiking trip while the park closure decision is pending. What is a measured answer?", "公園是否關閉仍未公布，家人問要不要預訂遠足。怎樣回答較審慎？", ["Let's see which way the cat jumps on the closure before we book.", "Let's see which way the cat jumps after we pay the non-refundable fee.", "Let's see which way the cat jumps even if the park never announces anything."], ["先等關閉安排明朗，再決定預訂。", "付了不能退款的費用才觀望，已失去決定空間。", "若沒有等待中的消息，這句觀望便缺乏依據。"], "Waiting is useful because a specific decision is pending.", "正在等待的關閉決定會影響預訂，因此暫時觀望合理。"]
    ],
    "idiom-11": [
      ["The trail may be slippery after rain. Which suggestion is a sensible precaution?", "雨後山徑可能濕滑。哪項建議屬合理防範？", ["Take shoes with good grip—better safe than sorry.", "Ignore the weather warning—better safe than sorry.", "Cancel every future walk—better safe than sorry."], ["穿防滑鞋，以防萬一。", "忽略天氣警告不是防範。", "因一次雨後濕滑便取消所有日後遠足，措施不合比例。"], "Grippy shoes address a plausible risk without overreacting.", "防滑鞋針對實際風險，也沒有過度反應。"],
      ["Before updating a shared computer, a teammate offers to save a backup. How would you respond?", "更新共用電腦前，隊友提議先備份。你會怎樣回應？", ["Yes, back it up first—better safe than sorry.", "No, delete the backup—better safe than sorry.", "Yes, stop using computers forever—better safe than sorry."], ["好，先備份，以免資料意外遺失。", "刪掉備份增加風險，與防範相反。", "永遠不用電腦不符合這項風險的比例。"], "A backup is a modest safeguard against data loss.", "備份是針對資料遺失的合理預防措施。"]
    ],
    "idiom-12": [
      ["A damaged charger is getting hot, but its owner keeps using it overnight. Which warning fits?", "充電器損壞並發熱，物主卻整晚繼續使用。哪句警告貼切？", ["You're playing with fire by leaving that damaged charger on overnight.", "You're playing with fire by unplugging the damaged charger now.", "You're playing with fire by asking an electrician to inspect it."], ["讓損壞充電器整晚通電，可能釀成嚴重事故。", "立即拔掉損壞充電器是在降低風險。", "請電工檢查是審慎做法，並非冒險。"], "The person continues a serious, avoidable risk.", "明知充電器有故障仍整晚使用，是可避免的嚴重風險。"],
      ["Your friend is about to send her bank password to someone she met online. What would you tell her?", "朋友準備把銀行密碼傳給網上認識的人。你會怎樣勸她？", ["You're playing with fire; don't send your password.", "You're playing with fire; ask the bank through its official app.", "You're playing with fire; keep the password private."], ["你這樣冒很大風險；不要傳送密碼。", "透過銀行官方程式查詢是在降低風險。", "保密密碼是在保護自己，並非冒險。"], "Sharing a bank password creates serious danger.", "把銀行密碼交給陌生人有嚴重而可避免的風險。"]
    ],
    "idiom-13": [
      ["Two neighbours are already arguing. Which comment describes the effect of a mocking post?", "鄰居已在爭吵。哪句能描述嘲諷貼文的影響？", ["The mocking post added fuel to the fire between the neighbours.", "The private apology added fuel to the fire by calming them both.", "The dispute ended before any post appeared, but it added fuel to the fire."], ["嘲諷貼文令現有爭執加劇。", "私下道歉令雙方冷靜，沒有令爭執惡化。", "貼文出現前爭執已結束，便不是火上加油。"], "The post worsens a conflict already under way.", "嘲諷貼文令已存在的爭執進一步惡化。"],
      ["A teammate wants to blame one person publicly while a meeting is already tense. What might you say?", "會議已很緊張，隊友還想公開責怪一人。你會怎樣提醒他？", ["Public blame will add fuel to the fire; speak to them privately first.", "Private discussion will add fuel to the fire because it may calm everyone.", "A calm pause will add fuel to the fire because it may stop the argument."], ["公開指責會火上加油，先私下談較好。", "私下談若能平息局面，便不是火上加油。", "冷靜暫停若能阻止爭吵，也不是令局面惡化。"], "Public blame may intensify an existing dispute.", "爭執已存在，公開責怪可能令情況更差。"]
    ],
    "idiom-14": [
      ["A candidate promises to double sales but cannot explain the plan. Which assessment is fair?", "候選人聲稱能令銷售額倍增，卻無法解釋方法。哪項判斷合理？", ["He is talking big about sales without showing a workable plan.", "He is talking big because he quietly presents audited results.", "He is talking big because he asks what figures are reliable."], ["未提出可行計劃卻誇口能大幅增加銷售。", "平實展示已審核成果，不一定是誇口。", "詢問數據是否可靠，並非吹噓。"], "The grand claim outruns the evidence.", "誇大的聲稱沒有相應計劃或證據支持。"],
      ["A start-up founder says her untested app will replace every school textbook. What would you tell a colleague?", "初創創辦人說未測試的程式會取代所有學校課本。你會怎樣向同事評論？", ["She's talking big; I'd like to see a classroom trial first.", "She's talking big; the classroom trial has already proved every claim.", "She's talking big; she only asked teachers for feedback."], ["她在誇口；我想先看課堂實測。", "若實測已證實所有聲稱，不能只憑雄心說她誇口。", "只向教師徵求意見，並非宣稱自己無所不能。"], "The promise is sweeping, but the app is untested.", "程式尚未測試，全面取代課本的聲稱缺乏支持。"]
    ],
    "idiom-15": [
      ["At a busy food bank, Mei greets visitors and sorts parcels without slowing down. Which description fits?", "食物銀行很忙，Mei 一邊招呼訪客，一邊整理物資，始終充滿活力。哪句貼切？", ["Mei is a ball of fire at the food bank.", "The hot parcel is a ball of fire at the food bank.", "The empty room is a ball of fire at the food bank."], ["Mei 精力充沛、積極投入。", "發熱的包裹不是形容有活力的人。", "空房間並非一位充滿幹勁的人。"], "The phrase praises an energetic person.", "這句讚賞 Mei 這位熱心而精力充沛的人。"],
      ["Your new stage manager solves problems cheerfully all afternoon. What would you say to the director?", "新舞台經理整個下午都精神奕奕地解決問題。你會怎樣告訴導演？", ["Our new stage manager is a ball of fire; she keeps the show moving.", "Our new stage manager is a ball of fire because the lamps are hot.", "Our new stage manager is a ball of fire because the stage is empty."], ["她充滿幹勁，推動演出順利進行。", "燈具發熱與她是否充滿活力無關。", "舞台沒有人，也不能說明她的精神狀態。"], "Her sustained energy makes the compliment apt.", "她持續積極工作，正好符合這句讚美。"]
    ],
    "idiom-16": [
      ["A community group can hire a hall within its small budget. Which comment fits the cost?", "社區小組可在有限預算內租用會堂。哪句符合費用情況？", ["Hiring the hall won't break the bank for the group.", "Hiring the hall will break the bank because it is fully funded.", "Hiring the hall broke the bank because it cost nothing."], ["會堂租金負擔得起，不會耗盡預算。", "費用已全數獲資助，不能說造成重大負擔。", "沒有費用，自然不會耗盡預算。"], "The negative form means the cost is manageable.", "won't break the bank 表示這筆開支負擔得起。"],
      ["A friend worries that a museum ticket will be expensive, but it costs only a few dollars. How would you reassure him?", "朋友擔心博物館門票很貴，但門票只需幾元。你會怎樣安慰他？", ["The ticket won't break the bank; let's go together.", "The ticket will break the bank; it costs almost nothing.", "The ticket won't break the bank; neither of us can afford it."], ["門票價格相宜，不會造成財政壓力。", "幾元門票不可能耗盡預算。", "前半句說負擔得起，後半句卻說兩人都付不起。"], "A small price warrants the reassuring negative form.", "價格很低，適合用否定式表示不會花費太多。"]
    ],
    "idiom-17": [
      ["A family postpones a trip because every flight is unusually costly. Which remark fits?", "一家人因機票異常昂貴而押後旅行。哪句貼切？", ["Flights this week cost an arm and a leg.", "Flights this week cost an arm and a leg because they are free.", "Flights this week cost an arm and a leg because they are short."], ["本週機票價錢高得驚人。", "免費機票並不昂貴。", "飛行時間短，不代表票價昂貴。"], "The family's decision is driven by a high price.", "一家人因高昂票價而押後旅行，符合慣用語的意思。"],
      ["A mechanic quotes far more than you expected for a simple repair. What might you tell your brother?", "簡單維修的報價遠高於預期。你會怎樣告訴弟弟？", ["That repair could cost an arm and a leg; I'll get another quote.", "That repair costs an arm and a leg because the mechanic works nearby.", "That repair costs an arm and a leg because the spare part is tiny."], ["維修費可能非常高，我會再問另一個報價。", "維修店在附近，不能證明收費昂貴。", "零件細小，也不能直接證明收費昂貴。"], "The unexpectedly large quote supports the idiom.", "報價遠高於預期，才有根據說維修費非常昂貴。"]
    ],
    "idiom-18": [
      ["A charity's budget assumes a donation that nobody has promised. Which assessment is grounded?", "慈善機構的預算假設會收到一筆未獲承諾的捐款。哪項評估有根據？", ["The budget is built on sand because the donation is unconfirmed.", "The budget is built on sand because the donation is already in its account.", "The budget is built on sand because two signed grants cover every cost."], ["捐款未獲確認，預算基礎薄弱。", "捐款已入帳，便不能以此說基礎不穩。", "已有兩筆正式撥款支付全部費用，並非缺乏支持。"], "A crucial assumption has not been secured.", "關鍵捐款尚未確定，整份預算因而缺乏可靠基礎。"],
      ["A teammate presents a campaign forecast based on one anonymous comment. What would you say?", "隊友只憑一則匿名留言預測整項宣傳活動的成效。你會怎樣回應？", ["That forecast is built on sand; we need stronger evidence.", "That forecast is built on sand; three independent surveys confirm it.", "That forecast is built on sand; the figures have been audited twice."], ["預測缺乏可靠基礎，應尋找更多證據。", "三項獨立調查支持預測，不能說毫無根據。", "數據經兩次審核，不能因此說基礎薄弱。"], "One anonymous comment is a weak foundation for a forecast.", "一則匿名留言不足以支撐整項活動的預測。"]
    ],
    "idiom-19": [
      ["An audit is still examining missing funds, and the treasurer faces public suspicion. Which statement is careful?", "帳目審查仍在追查失款，司庫受到公眾懷疑。哪句審慎？", ["The treasurer is under a cloud while the audit continues.", "The treasurer is under a cloud, so the accusation is proved.", "The treasurer is under a cloud because everyone has cleared her."], ["審查未完，司庫仍受懷疑。", "受到懷疑不等於指控已被證實。", "若已獲澄清，便不應說仍被懷疑。"], "The phrase describes suspicion, not a verdict.", "under a cloud 只說聲譽受疑，沒有斷言有罪。"],
      ["A colleague wants to announce that a singer is guilty before an inquiry ends. How would you correct him?", "調查未結束，同事卻想宣布歌手有罪。你會怎樣糾正他？", ["She's under a cloud, but the inquiry has not reached a finding.", "She's under a cloud, so we can call the rumour a conviction.", "She's under a cloud, though no one has raised any concern."], ["她受懷疑，但調查尚無結論。", "傳聞不能當作定罪。", "若無任何疑慮，便沒有聲譽蒙陰的根據。"], "A careful response separates suspicion from proof.", "審慎的說法把懷疑與已證實的事實分開。"]
    ],
    "idiom-20": [
      ["An unranked runner reaches the final after several surprising wins. Which description fits?", "一位沒有排名的跑手意外連勝，闖入決賽。哪句貼切？", ["She is a dark horse in the race after those surprise wins.", "She is a dark horse because she was the clear favourite from day one.", "She is a dark horse because her running shoes are black."], ["她原本不被看好，如今有望勝出。", "從一開始便是大熱門，並非黑馬。", "鞋子顏色不是黑馬的意思。"], "Her rise was unexpected and she may win.", "她先前被低估，如今有勝出可能。"],
      ["Your friend dismisses a little-known choir before the contest, but it wins its heat. What would you say?", "朋友賽前看輕一隊鮮為人知的合唱團，但它在初賽勝出。你會怎樣說？", ["That choir could be a dark horse in the final.", "That choir is a dark horse because everyone picked it to win.", "That choir is a dark horse because it wears dark uniforms."], ["這隊合唱團可能是決賽中的黑馬。", "若眾人早已看好它，便沒有意外性。", "制服顏色與出人意料的競爭力無關。"], "The overlooked choir has become a real contender.", "合唱團原本不受注意，初賽勝出後已有競爭力。"]
    ],
    "idiom-21": [
      ["A landlord allocates rooms only to whoever can threaten other tenants. Which judgment fits?", "房東只把房間分給能威嚇其他租客的人。哪項判斷貼切？", ["In that building, it is the law of the jungle.", "In that building, it is the law of the jungle because fair rules protect all.", "In that building, it is the law of the jungle because tenants share rooms fairly."], ["強者靠威嚇取得資源，缺乏公平保障。", "有公平規則保障所有人，並非弱肉強食。", "租客公平分享房間，也不是強者欺壓弱者。"], "Threats replace fair protection.", "這裏以威嚇代替公平規則，符合弱肉強食的意思。"],
      ["A colleague says a fair sports league is 'the law of the jungle.' How would you respond?", "同事把有公平球例的體育聯賽稱作『弱肉強食』。你會怎樣回應？", ["I wouldn't call it the law of the jungle; the rules protect every team.", "It is the law of the jungle precisely because the rules protect every team.", "It is the law of the jungle because referees enforce those fair rules."], ["有規則保障各隊，便不宜稱作弱肉強食。", "公平保障與弱肉強食的意思相反。", "裁判執行公平規則，也不是無視公正。"], "The phrase would overstate an ordinary fair contest.", "普通而有保障的競賽，不應誇稱為弱肉強食。"]
    ],
    "idiom-22": [
      ["After months of uncertainty, Farah signs a lease for her first studio. Which account fits?", "Farah 猶豫數月後，簽約租下第一間工作室。哪句貼切？", ["Farah took the plunge and signed the studio lease.", "Farah took the plunge by reading the lease but refusing to decide.", "Farah took the plunge by buying her usual coffee on the way."], ["她終於下定決心，簽下工作室租約。", "只閱讀合約卻不決定，未有採取行動。", "照常買咖啡沒有重大承諾。"], "The long-considered decision becomes a real commitment.", "她經過猶豫，終於作出有實際承諾的決定。"],
      ["A friend has debated entering a marathon and finally registers today. What would you say?", "朋友考慮參加馬拉松一段時間，今天終於報名。你會怎樣說？", ["You took the plunge and signed up—I'll cheer for you.", "You took the plunge by browsing the entry page without deciding.", "You took the plunge by running your usual short route again."], ["你終於下定決心報名，我會支持你。", "只瀏覽報名頁而未決定，並非付諸行動。", "照常跑短路線不是報名這項重大決定。"], "Registration turns hesitation into action.", "完成報名代表終於作出原本猶豫的決定。"]
    ],
    "idiom-23": [
      ["Nina is rehearsing a play, editing a magazine and coaching a team this month. Which summary fits?", "Nina 本月同時排練話劇、編輯雜誌和訓練隊伍。哪句概括貼切？", ["Nina has many irons in the fire this month.", "Nina has many irons in the fire because she once considered three hobbies.", "Nina has many irons in the fire because all three projects ended last year."], ["她現時同時投入多項工作。", "曾考慮幾種嗜好，並不等於同步參與。", "去年已完結的項目，不是現在同時在做的事。"], "Several projects are active at the same time.", "三項工作都在本月進行，因此符合慣用語的意思。"],
      ["A colleague asks why you cannot take on another task while you are running two events and a newsletter. What would you say?", "你同時籌辦兩項活動和一份通訊，同事問為何不能再接工作。你會怎樣回答？", ["I have many irons in the fire already; could we discuss next month?", "I have many irons in the fire already; I only imagined those projects.", "I have many irons in the fire already; every project finished yesterday."], ["我現時已有多項工作在進行，能否下月再談？", "只是想像項目，並非實際同時參與。", "所有項目昨天已完成，便不是現時忙於多項工作。"], "The reply refers to current, overlapping commitments.", "兩項活動和通訊都正在籌辦，正好說明手頭有多項工作。"]
    ],
    "idiom-24": [
      ["A new committee chair dismisses older volunteers as beneath her. Which comment is justified?", "新任委員會主席輕視資深義工，認為他們不如自己。哪句評論合理？", ["She is getting above herself since becoming chair.", "She is getting above herself because she thanks the volunteers.", "She is getting above herself simply because she accepted the role."], ["她上任後開始自視高人一等。", "感謝義工不等於傲慢。", "接受職務本身不能證明她自視過高。"], "Her dismissive behaviour, not her title, supports the criticism.", "判斷根據是她輕視他人的行為，而不是主席職銜。"],
      ["A friend calls a student arrogant merely for applying to lead the debate club. What would you say?", "朋友只因一名學生申請當辯論學會主席，便說他傲慢。你會怎樣回應？", ["Applying for the role doesn't mean he's getting above himself.", "Applying for the role proves he's getting above himself already.", "Asking for feedback proves he's getting above himself already."], ["申請職務本身並不代表他自視過高。", "只憑申請職務不能斷言他傲慢。", "徵求意見也不是輕視他人的表現。"], "Ambition alone is not condescension.", "有抱負不等於看不起別人，不能只憑申請作判斷。"]
    ],
    "idiom-25": [
      ["A trainee works well with help but has not yet handled a shift alone. Which assessment is measured?", "實習生在有人協助時表現良好，尚未獨自當值。哪項評估較審慎？", ["The acid test will be her first shift without the supervisor.", "The acid test was her first assisted shift under close guidance.", "The acid test will be another rehearsal with the supervisor."], ["首次沒有主管協助當值，才是關鍵考驗。", "有人密切指導的班次，不能證明她能獨立工作。", "主管在場的再一次排練，仍未檢驗獨立工作能力。"], "An unsupervised shift tests the specific ability still in doubt.", "尚未驗證的是獨立工作能力，須看她沒有主管協助時的表現。"],
      ["A charity says its new water filter works. A village will rely on it through the dry season. What would you tell the team?", "慈善機構聲稱新濾水器有效，一條村將在旱季依賴它。你會怎樣告訴團隊？", ["Sustained use through the dry season will be the acid test of the filter's reliability.", "One supervised demonstration will be the acid test of the filter's reliability.", "A favourable review of the design will be the acid test of the filter's reliability."], ["旱季持續使用，才可關鍵地檢驗濾水器是否可靠。", "一次有人監督的示範，未能證明它能應付整個旱季。", "設計獲得好評，仍不能驗證長期使用的可靠程度。"], "The claim concerns sustained reliability, not a short demonstration or an appraisal.", "要驗證的是長期可靠性，短暫示範或設計評價均不足夠。"]
    ],
    "idiom-26": [
      ["After a long professional career, a goalkeeper announces that she will never play competitively again. Which line fits?", "守門員經過漫長職業生涯，宣布不再參與競技比賽。哪句貼切？", ["The goalkeeper has decided to hang up her boots.", "The goalkeeper has hung up her boots for one afternoon.", "The goalkeeper has hung up her boots by changing clubs."], ["守門員決定退役，結束球員生涯。", "只休息一個下午，不等於退役。", "轉會後仍繼續作賽，也不是退役。"], "The decision ends her playing career.", "她不再參賽，才符合退役的意思。"],
      ["Your uncle says he is retiring from competitive rugby after this season. What would you say?", "叔叔說本季過後會退出競技欖球。你會怎樣說？", ["So you're hanging up your boots after the final match?", "So you're hanging up your boots for next Tuesday's training only?", "So you're hanging up your boots while joining another rugby team?"], ["所以最後一場賽事後，你便正式退役？", "只缺席下星期二的訓練，不是退役。", "加入另一支球隊繼續比賽，也不是退役。"], "The phrase asks about ending competitive play.", "叔叔說的是本季後退出競賽，因此可問是否正式退役。"]
    ],
    "idiom-27": [
      ["Two old neighbours meet again after twelve years apart. Which greeting sounds natural?", "兩位舊鄰居相隔十二年再見。哪句招呼自然？", ["I haven't seen you in a dog's age!", "I haven't seen you in a dog's age—we met this morning!", "I haven't seen you in a dog's age—I see you every week!"], ["真的很久沒見了！", "今早才見過，並非久別重逢。", "每星期見面，也不是很久沒見。"], "The expression fits a genuinely long interval.", "兩人相隔十二年再見，符合很久沒見的意思。"],
      ["A friend brings back a board game you last played years ago. How would you react?", "朋友拿來一款你多年沒玩過的桌上遊戲。你會怎樣回應？", ["I haven't played this in a dog's age—let's set it up!", "I haven't played this in a dog's age—I played it yesterday.", "I haven't played this in a dog's age—I play it each weekend."], ["我很久沒玩這款遊戲了，來擺好棋盤吧！", "昨天才玩過，並非很久沒玩。", "每週都玩，也不能說久違。"], "The gap since the last game is measured in years.", "多年沒玩，正好可用 in a dog's age 表達久違。"]
    ],
    "idiom-28": [
      ["Two co-directors repeatedly clash over every decision and cannot run the project together. Which description fits?", "兩名聯合總監事事爭執，無法合作管理項目。哪句貼切？", ["The co-directors are like oil and water.", "The co-directors are like oil and water because their skills complement each other.", "The co-directors are like oil and water because they agree on every choice."], ["兩人性格或做法不合，難以共事。", "技能互補並非格格不入。", "事事意見一致，也不是彼此不合。"], "Repeated clashes show an inability to mix well.", "兩人不斷衝突，符合油水難融的比喻。"],
      ["Your club wants two people with opposite working styles to share one job, but every trial ends in conflict. What would you say?", "學會讓工作方式相反的兩人共職，但每次試行都以爭執告終。你會怎樣說？", ["They are like oil and water; let's give them separate roles.", "They are like oil and water; their methods fit perfectly together.", "They are like oil and water; one likes tea and the other likes coffee."], ["兩人難以合作，或可分開職務。", "方法完全相配，與油水難融相反。", "飲品喜好不同，不足以判斷兩人不能合作。"], "The proposed roles should reflect a real working conflict.", "多次共職都發生衝突，才有根據說兩人難以融合。"]
    ],
    "idiom-29": [
      ["One missing photograph becomes an excuse to delay a report that could be sent without it. Which reply fits?", "一張照片不見了，有人以此為由拖延一份原本可先寄出的報告。哪句貼切？", ["Don't make the missing photo a lion in the way; send the report.", "The missing photo is a lion in the way because it is required by law.", "The missing photo is a lion in the way because the report has already been sent."], ["別把小障礙誇大成藉口，先寄出報告。", "若法律規定必須附上，便是真正限制，不是虛構藉口。", "報告已寄出，照片便沒有阻止寄出。"], "The small obstacle is being exaggerated to avoid action.", "照片並非寄出報告的必要條件，卻被誇大為阻礙。"],
      ["A classmate will not begin rehearsing because the first line feels awkward, though the script is ready. What might you say?", "劇本已備妥，同學卻因第一句說得不順而遲遲不肯排練。你會怎樣說？", ["Don't let one awkward line become a lion in the way; start rehearsing.", "The awkward line is a lion in the way because rehearsal is forbidden.", "The awkward line is a lion in the way because you have rehearsed for weeks."], ["別把一句不順口的台詞當成拖延排練的藉口。", "若排練真的被禁止，障礙並非被誇大。", "若早已排練多週，就不是這一句阻止開始。"], "A manageable first line should not stop the whole rehearsal.", "一句可改善的台詞被放大成不開始排練的理由。"]
    ],
    "idiom-30": [
      ["A reporter enters a meeting with people who have threatened her, despite a warning. Which description fits?", "記者收到警告後，仍走進曾威脅她的人的會議。哪句貼切？", ["She is walking into the lion's mouth by entering that meeting alone.", "She is walking into the lion's mouth by meeting a friendly colleague.", "She is walking into the lion's mouth by taking a harmless wrong turn."], ["她獨自進入明知有威脅的地方。", "會見友善同事沒有嚴重威脅。", "無害地走錯路，也不是進入險境。"], "She knowingly enters a place of serious danger.", "她明知現場有威脅，仍獨自走進去。"],
      ["Your teammate plans to confront a violent group alone. How would you warn him?", "隊友計劃獨自面對一群有暴力傾向的人。你會怎樣提醒他？", ["Going alone would put your head into the lion's mouth; get support.", "Going alone would put your head into the lion's mouth; they are trusted friends.", "Going alone would put your head into the lion's mouth; they pose no threat."], ["獨自行動會身陷險境，應先找人支援。", "若對方是可信任的朋友，便沒有相同危險。", "若對方沒有威脅，便不應說身陷險境。"], "The warning is justified by a credible threat.", "有實際暴力風險，獨自前往才稱得上進入險境。"]
    ]
  };
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
    const [socialDecision, responseDecision] = freshDecisions[lesson.id];
    const situationPrompts = [
      ["Which situation genuinely calls for this idiom?", "哪個情境真正適合使用這個慣用語？"],
      ["Where is the essential condition present?", "哪個情境具備這個說法所需的關鍵條件？"],
      ["Which account matches the expression's real meaning?", "哪項描述符合這個說法的真正意思？"],
      ["Which event gives you a sound reason to use the idiom?", "哪件事足以支持使用這個慣用語？"],
      ["Find the situation that supports the figurative sense.", "找出符合比喻意思的情境。"]
    ];
    const boundaryPrompts = [
      ["Which line stretches the idiom beyond its meaning?", "哪一句超出了這個慣用語的意思？"],
      ["Which statement would you challenge as a misuse?", "哪個說法屬於誤用，值得你指出？"],
      ["Spot the sentence that lacks the necessary condition.", "找出缺少必要條件的一句。"],
      ["Which use needs a more accurate expression?", "哪一句需要改用更準確的說法？"]
    ];
    const situationPrompt = situationPrompts[(lesson.order - 6) % situationPrompts.length];
    const boundaryPrompt = boundaryPrompts[(lesson.order - 6) % boundaryPrompts.length];
    const choice = (promptEn, promptZh, optionsEn, options, correct, feedbackEn, feedback) => ({
      promptEn, promptZh, optionsEn, options, correct, feedbackEn, feedback
    });
    const refreshedChoice = ([promptEn, promptZh, optionsEn, options, feedbackEn, feedback]) =>
      choice(promptEn, promptZh, optionsEn, options, 0, feedbackEn, feedback);
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
        2: lesson.id === "idiom-25"
          ? choice(...situationPrompt,
              ["A new bridge carries loaded trucks safely during a severe storm.", "A bridge model holds a small weight in a sheltered classroom.", "Engineers praise a bridge's design before any load trial."],
              ["新橋在暴風雨中安全承受滿載貨車，經得起實際嚴格考驗。", "模型在室內承受小重量，尚未驗證真橋的實際表現。", "工程師稱讚設計，仍未測試橋樑的承重能力。"],
              0, "The storm and full load test the bridge's real performance.", "暴風雨與滿載貨車能檢驗橋樑的實際表現。")
          : choice(...situationPrompt, [fitScene, badScene1, badScene2], [fitSceneZh, badSceneZh1, badSceneZh2], 0, meaningEn, meaningZh),
        3: refreshedChoice(socialDecision),
        5: refreshedChoice(responseDecision),
        6: choice(...boundaryPrompt, [source[17].answer, source[34].answer, lesson.id === "idiom-25" ? badEn2 : badEn1], [source[17].answerZh, source[34].answerZh, lesson.id === "idiom-25" ? badZh2 : badZh1], 2, boundaryEn, boundary)
      }
    };
  }
  window.EDMUND_IDIOM_COMPASS = Object.freeze({ ...existing, ...extended });
  window.EDMUND_IDIOM_COMPASS_FOILS = contrastFoils;
})();

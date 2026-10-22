/* Ten additional themed transfer situations for each Compass lesson 06–30.
 * Each line is a new English situation, faithful Traditional Chinese support,
 * and a complete model answer using the target idiom. */
(function defineCompassTransferPractice() {
  const source = window.EDMUND_IDIOM_COMPASS || {};
  const catalogue = window.EDMUND_IDIOM_SYSTEM_DATA?.lessons || [];
  const material = {
    "idiom-06": `School|The art scholarship closes tonight, and Ava has a finished portfolio ready.|藝術獎學金今晚截止，Ava 已備好作品集。|Ava should strike while the iron is hot and submit her portfolio tonight.
Work|A client wants a proposal this morning, and the team has one ready to send.|客戶今早想收到方案，團隊已準備就緒。|The team should strike while the iron is hot and send the proposal this morning.
Travel|Discounted rail tickets are available only until midnight, and the family already knows its dates.|火車票折扣只到午夜，家人已確定日期。|The family should strike while the iron is hot and book the tickets now.
Sport|A promising goalkeeper is available for one trial session, and the coach has an opening today.|有潛質的守門員今天可試訓，教練也有空檔。|The coach should strike while the iron is hot and invite the goalkeeper today.
Community|A sponsor offers to fund the first clean-up, but needs confirmation before Friday.|贊助者願資助首次清潔活動，但要在星期五前確認。|The volunteers should strike while the iron is hot and confirm the funding before Friday.
Technology|An accessibility grant has opened for a week, and the developers have a working demo.|無障礙科技資助開放申請一週，開發者已有可用示範。|The developers should strike while the iron is hot and apply for the grant.
Environment|Residents support a refill station now, and the council is accepting pilot proposals.|居民現在支持設置補水站，議會正接受試點方案。|The group should strike while the iron is hot and propose a refill station.
Arts|The theatre has a vacant weekend slot, and the cast can perform that weekend.|劇院週末有空檔，演員也能在當天演出。|The cast should strike while the iron is hot and reserve the weekend slot.
Health|Free screening appointments opened today, and Mei has been waiting to book one.|免費篩查今天開放預約，Mei 一直想預約。|Mei should strike while the iron is hot and book her screening.
Business|A local café wants to stock the bakery's bread this month, and the bakery can supply it.|本地咖啡店今個月想售賣麵包店的麵包，麵包店也有供應能力。|The bakery should strike while the iron is hot and agree to supply the café.`,
    "idiom-07": `School|The worksheet has clear headings and enough white space to read comfortably.|工作紙標題清楚，留白充足，看起來舒服。|The well-spaced worksheet is easy on the eye.
Work|The report uses calm colours and uncluttered charts.|報告用色柔和，圖表不擠迫。|The report is easy on the eye because its charts are uncluttered.
Travel|The station map uses legible labels and a restrained colour palette.|車站地圖標籤清晰，配色不刺眼。|The station map is easy on the eye.
Sport|The team poster balances its photographs and text without crowding either.|球隊海報的相片和文字佈局平衡，互不擠迫。|The balanced team poster is easy on the eye.
Community|The neighbourhood noticeboard has simple lettering and neat spacing.|社區告示板字體簡單，間距整齊。|The neighbourhood noticeboard is easy on the eye.
Technology|The new app screen has readable type and no flashing colours.|新應用程式字體易讀，沒有閃爍的顏色。|The new app screen is easy on the eye.
Environment|The park sign uses soft green shades and clear symbols.|公園標示用柔和的綠色及清楚圖示。|The redesigned park sign is easy on the eye.
Arts|The gallery arranges a small number of paintings against pale walls.|畫廊在淺色牆上疏落地掛了幾幅畫。|The gallery display is easy on the eye.
Health|The clinic leaflet uses large headings and avoids dense blocks of text.|診所單張標題較大，也避免密密麻麻的文字。|The clinic leaflet is easy on the eye.
Business|The shop window has a tidy display with gentle lighting.|店舖櫥窗整齊，燈光柔和。|The shop window is easy on the eye.`,
    "idiom-08": `School|Before results arrive, Nina has a strong feeling that her debate team has won, but no proof.|成績未公布前，Nina 強烈預感辯論隊勝出，卻沒有證據。|Nina feels in her bones that her debate team has won.
Work|The interview went quietly, yet Omar strongly feels he will receive an offer.|面試過程平靜，但 Omar 強烈感到自己會獲聘。|Omar knows in his bones that an offer is coming.
Travel|No alert has been issued, but the guide says she has a strong feeling the weather will change.|尚未有警報，但女導遊強烈預感天氣將變。|The guide feels in her bones that the weather will change.
Sport|Without seeing the final score, the captain says she feels certain the younger team pulled through.|未看到最終比數，女隊長卻直覺確信年輕隊伍撐過來了。|The captain knows in her bones that the younger team pulled through.
Community|The volunteers cannot explain why, but they feel certain neighbours will help.|義工說不出原因，卻深信鄰居會幫忙。|The volunteers feel in their bones that the neighbours will help.
Technology|Although the data is incomplete, Priya strongly senses that one bug remains.|雖然數據未齊，Priya 強烈感到仍有一個程式錯誤。|Priya feels in her bones that one bug remains.
Environment|With no measurements yet, a ranger says he strongly senses that the river has changed.|尚未量度，男護林員卻強烈感到河流已有變化。|The ranger knows in his bones that the river has changed.
Arts|Before the audience reacts, the actor says she strongly feels the new ending will work.|觀眾尚未回應，女演員卻直覺認為新結局會奏效。|The actor feels in her bones that the new ending will work.
Health|Before a test, Luis strongly feels he is recovering, though he cannot explain why.|檢查前，Luis 無法解釋原因，卻強烈感到自己在康復。|Luis feels in his bones that he is recovering.
Family|Nobody has called yet, but I have a strong feeling my cousin will visit tonight.|尚未有人來電，但我強烈預感表弟今晚會來。|I know in my bones that my cousin will visit tonight.`,
    "idiom-09": `School|The answer sheet and recording both show who submitted the project first.|答題紙和錄影都顯示誰先提交項目。|The question of who submitted first is open-and-shut.
Work|The signed contract states the agreed date clearly, and both parties accept it.|已簽合約清楚列明日期，雙方也同意。|The dispute over the agreed date is open-and-shut.
Travel|The boarding record and ticket show the same seat number.|登機紀錄與機票顯示同一座位號碼。|The seat-number question is open-and-shut.
Sport|Two cameras clearly show the ball crossed the line before the whistle.|兩部攝影機都清楚拍到球在哨響前越線。|The goal decision is open-and-shut.
Community|The meeting minutes record a unanimous vote, and everyone confirms it.|會議紀錄記下全票贊成，所有人也確認。|The question of the vote is open-and-shut.
Technology|The timestamped logs identify the exact update that caused the outage.|附時間戳的紀錄指出造成故障的確切更新。|The cause of the outage is open-and-shut.
Environment|Independent readings agree that the water level rose after the storm.|獨立量度結果一致，顯示暴風雨後水位上升。|The water-level finding is open-and-shut.
Arts|The dated sketch and signed receipt prove who made the original design.|註明日期的草圖和簽收單，證明誰作出原設計。|The design-credit case is open-and-shut.
Health|The appointment system and printed receipt show the same booking time.|預約系統與收據顯示同一時間。|The appointment-time question is open-and-shut.
Business|The till record and receipt both show that the customer paid twice.|收銀紀錄和收據都顯示顧客付款兩次。|The double-payment case is open-and-shut.`,
    "idiom-10": `School|Two clubs have offered places, but Ben wants to learn their schedules before choosing.|兩個學會都取錄了 Ben，但他想先知道時間表才選擇。|Ben will see which way the cat jumps before choosing a club.
Work|A team may change its hours, so Lara waits for the announcement before accepting a shift.|團隊可能改時間，Lara 等公布後才接受輪班。|Lara will see which way the cat jumps before accepting the shift.
Travel|A ferry may resume service, so the family waits for the update before booking a coach.|渡輪可能復航，家人等消息後才訂旅遊巴。|The family will see which way the cat jumps before booking a coach.
Sport|The match venue may move, so the captain delays arranging transport.|比賽場地可能改動，隊長暫緩安排交通。|The captain will see which way the cat jumps before arranging transport.
Community|The council is still considering two sites, so residents wait before signing a petition.|議會仍考慮兩個選址，居民先等一等再簽請願書。|Residents will see which way the cat jumps before signing the petition.
Technology|Two software standards are competing, so the developer waits for the final decision.|兩種軟件標準仍在競爭，開發者等最終決定。|The developer will see which way the cat jumps before choosing a standard.
Environment|The new recycling rules are not final, so the charity waits before printing leaflets.|新回收規例未定案，慈善團體暫緩印單張。|The charity will see which way the cat jumps before printing leaflets.
Arts|The festival may add a second stage, so the band waits before confirming a slot.|藝術節可能增設第二個舞台，樂隊先等安排。|The band will see which way the cat jumps before confirming a slot.
Health|The clinic may extend its opening hours, so volunteers wait before setting a rota.|診所可能延長開放時間，義工先等消息才排班。|The volunteers will see which way the cat jumps before setting a rota.
Business|A supplier may lower its price next week, so the café delays signing a contract.|供應商下週可能減價，咖啡店暫緩簽約。|The café will see which way the cat jumps before signing a contract.`,
    "idiom-11": `School|The forecast may turn wet, so I put my notes in a waterproof folder.|天氣可能轉雨，我把筆記放進防水文件夾。|I'll use a waterproof folder—better safe than sorry.
Work|The presentation file might fail, so the speaker carries a second copy.|簡報檔案可能故障，講者帶了第二份。|The speaker brought a second copy—better safe than sorry.
Travel|The final bus might be full, so we reserve seats before leaving.|尾班巴士可能滿座，我們出發前先訂位。|We'll reserve seats—better safe than sorry.
Sport|The field could be muddy, so the coach checks the playing surface.|球場可能有泥濘，教練先檢查場地。|The coach will check the field—better safe than sorry.
Community|The outdoor fair may need shelter, so volunteers prepare a tent.|戶外市集可能需要遮蓋，義工預備了帳篷。|The volunteers packed a tent—better safe than sorry.
Technology|An update might fail, so the developer backs up the files first.|更新可能失敗，開發者先備份檔案。|The developer backed up the files—better safe than sorry.
Environment|The stream may rise after rain, so hikers choose the marked high path.|下雨後溪水可能上漲，行山者選有標示的高路。|The hikers chose the high path—better safe than sorry.
Arts|The stage lights might go out, so the crew tests the spare lamps.|舞台燈可能熄滅，工作人員先測試後備燈。|The crew tested spare lamps—better safe than sorry.
Health|The nurse checks an unclear dosage with the doctor before giving medicine.|劑量不清楚，護士在給藥前向醫生核實。|The nurse checked the dosage—better safe than sorry.
Family|A child may need a jacket after sunset, so her father packs one.|日落後孩子可能要穿外套，父親便帶上一件。|Her father packed a jacket—better safe than sorry.`,
    "idiom-12": `School|A student changes attendance records and could face serious disciplinary action.|學生篡改出席紀錄，可能面臨嚴重紀律處分。|The student is playing with fire by changing the attendance records.
Work|A worker shares confidential files without permission and risks losing the job.|員工未經許可分享機密檔案，可能丟掉工作。|The worker is playing with fire by sharing confidential files.
Travel|A tourist ignores a closed-trail warning despite falling rocks.|遊客無視因落石而封閉的小徑警告。|The tourist is playing with fire by entering the closed trail.
Sport|An athlete hides a serious injury and competes without medical advice.|運動員隱瞞嚴重傷患，未諮詢醫護便作賽。|The athlete is playing with fire by hiding the injury.
Community|An organiser uses unsafe wiring at a crowded street event.|主辦人在擠迫的街頭活動使用不安全電線。|The organiser is playing with fire by using unsafe wiring.
Technology|A developer disables all security checks before releasing a banking app.|開發者在銀行應用程式推出前關掉所有安全檢查。|The developer is playing with fire by disabling the security checks.
Environment|A factory dumps waste near a drinking-water source despite warnings.|工廠無視警告，在飲用水源附近棄置廢物。|The factory is playing with fire by dumping waste near the water source.
Arts|A producer ignores repeated fire-safety warnings in a packed theatre.|製作人無視擠滿觀眾的劇院反覆發出的消防警告。|The producer is playing with fire by ignoring the safety warnings.
Health|Someone takes a stranger's prescription tablets without checking with a clinician.|有人未詢問醫護，便服用陌生人的處方藥。|That person is playing with fire by taking a stranger's prescription tablets.
Business|An owner falsifies accounts to secure a loan.|老闆造假帳目以取得貸款。|The owner is playing with fire by falsifying the accounts.`,
    "idiom-13": `School|Two classmates are already arguing, and a third student shares an insulting screenshot.|兩名同學本在爭執，第三名同學再轉發侮辱性截圖。|Sharing the screenshot added fuel to the fire.
Work|A team is upset about delays, and the manager blames them publicly.|團隊已因延誤不快，經理再公開責怪他們。|The manager added fuel to the fire by blaming the team publicly.
Travel|Passengers are angry about a cancellation, and staff give conflicting information.|乘客已因取消班次生氣，職員再提供互相矛盾的消息。|The conflicting information added fuel to the fire.
Sport|The players are disputing a decision, and the coach mocks one side.|球員正為判決爭論，教練還嘲笑其中一方。|The coach added fuel to the fire by mocking the players.
Community|Neighbours are arguing about noise, and someone posts private messages online.|鄰居正為噪音爭吵，有人再公開私人訊息。|Posting the messages added fuel to the fire.
Technology|Users are upset about an outage, and the company deletes their complaints.|用戶已因故障不滿，公司還刪除投訴。|Deleting the complaints added fuel to the fire.
Environment|Residents fear pollution, and officials refuse to explain the test results.|居民已擔心污染，官員再拒絕解釋檢測結果。|The refusal to explain the results added fuel to the fire.
Arts|The cast disagrees over a scene, and the director insults an actor in front of everyone.|演員對場景有分歧，導演還當眾侮辱其中一人。|The director added fuel to the fire by insulting the actor.
Health|Families are anxious about clinic delays, and a notice gives an inaccurate waiting time.|家屬已為診所延誤焦急，告示再提供錯誤等候時間。|The inaccurate notice added fuel to the fire.
Business|A customer disputes a bill, and the shop posts the complaint online without consent.|顧客正爭議帳單，商店未經同意把投訴放上網。|The shop added fuel to the fire by posting the complaint online.`,
    "idiom-14": `School|Before the debate, a student claims she can defeat anyone but has never prepared.|辯論前，學生自稱能打敗所有人，卻從未準備。|The student talks big about winning despite never preparing.
Work|A new employee claims he can run every department without learning its work.|新員工未了解工作，就聲稱能管理所有部門。|The new employee talks big about running every department.
Travel|A guide promises to lead a difficult climb though he has never walked the route.|導遊未行過艱難路線，卻聲稱可以領隊。|The guide talks big about leading the climb.
Sport|A player predicts an easy victory against champions but skips training.|球員缺席訓練，卻誇口能輕鬆擊敗冠軍。|The player talks big about an easy victory.
Community|A volunteer claims she alone can solve every local problem without a plan.|義工沒有計劃，卻聲稱一人可解決社區所有問題。|The volunteer talks big about solving every local problem.
Technology|A founder promises a flawless app in one day despite having no prototype.|創辦人沒有原型，卻承諾一天內做出零錯誤應用程式。|The founder talks big about building a flawless app in one day.
Environment|A campaigner claims he will clean the entire river in an hour without equipment.|倡議者沒有工具，卻聲稱一小時能清理整條河。|The campaigner talks big about cleaning the whole river.
Arts|An actor says every critic will praise her first performance before rehearsals begin.|排練還未開始，演員便說所有評論家都會讚賞她的首演。|The actor talks big about her first performance.
Health|A coach claims one untested routine will cure every injury.|教練聲稱一套未經測試的訓練能治好所有傷患。|The coach talks big about an untested routine.
Business|An owner boasts that a shop will dominate the market before it opens.|店舖尚未開業，老闆便吹噓會壟斷市場。|The owner talks big about dominating the market.`,
    "idiom-15": `School|Mina eagerly organises class activities and keeps everyone involved.|Mina 熱心組織班級活動，也讓大家參與。|Mina is a ball of fire in her class.
Work|A new colleague volunteers for tasks and brings energy to every meeting.|新同事主動承擔工作，為每次會議帶來活力。|The new colleague is a ball of fire at work.
Travel|Our group leader cheerfully organises each stop and helps tired travellers.|團隊領隊愉快地安排每個站點，也幫助疲倦旅客。|Our group leader is a ball of fire on the trip.
Sport|The young captain leads warm-ups and encourages everyone throughout practice.|年輕隊長帶熱身，整場練習都鼓勵隊友。|The young captain is a ball of fire at training.
Community|A volunteer leads three activities and welcomes every new neighbour.|義工帶領三項活動，也歡迎每位新鄰居。|The volunteer is a ball of fire at the community centre.
Technology|An enthusiastic developer keeps the team moving through a difficult launch.|熱心的開發者在艱難推出階段仍帶動團隊。|The developer is a ball of fire during the launch.
Environment|Leah recruits helpers, plants trees and teaches children about local wildlife.|Leah 招募幫手、種樹，也教孩子認識本地野生動物。|Leah is a ball of fire in the conservation group.
Arts|The dancer rehearses with energy and lifts the spirits of the whole cast.|舞者活力十足地排練，也鼓舞全體演員。|The dancer is a ball of fire in rehearsal.
Health|A nurse works energetically and encourages every patient in the activity group.|護士精力充沛，也鼓勵活動小組的每位病人。|The nurse is a ball of fire in the activity group.
Business|The café owner greets customers warmly and drives every new idea forward.|咖啡店老闆熱情招呼顧客，也積極推動新想法。|The café owner is a ball of fire.`,
    "idiom-16": `School|The second-hand textbook costs very little and fits the student's budget.|二手教科書價格低，學生負擔得起。|The second-hand textbook won't break the bank.
Work|The team can buy a basic microphone without straining its small budget.|團隊買基本咪高峰，不會令有限預算吃緊。|A basic microphone won't break the bank.
Travel|A luxury suite costs more than the family can comfortably spend.|豪華套房價錢超出一家人的負擔能力。|The luxury suite would break the bank for the family.
Sport|The club can afford a set of used training cones.|球會負擔得起一套二手訓練雪糕筒。|The used training cones won't break the bank.
Community|A small donation from each household covers the printing cost easily.|每戶捐一點錢，就能輕鬆支付印刷費。|Printing the notices won't break the bank.
Technology|An enterprise server costs far more than the small club can afford.|企業級伺服器遠超小型社團的預算。|An enterprise server would break the bank for the club.
Environment|The class can buy reusable cups within its modest event budget.|班級在有限活動預算內買得到環保杯。|Reusable cups won't break the bank for the class.
Arts|The school can rent a simple stage light without using all its funds.|學校租一盞簡單舞台燈，不用花光經費。|One simple stage light won't break the bank.
Health|The basic first-aid kit is inexpensive enough for the group.|基本急救包價錢不高，小組負擔得起。|A basic first-aid kit won't break the bank.
Business|A complete refit would consume almost all of the café's savings.|全面裝修會用掉咖啡店幾乎所有積蓄。|A complete refit could break the bank for the café.`,
    "idiom-17": `School|The specialist course has a fee far beyond most students' budgets.|專門課程收費遠超大多數學生的預算。|The specialist course costs an arm and a leg.
Work|A last-minute conference venue charges an exceptionally high fee.|臨時預訂的會議場地收費異常高。|The last-minute venue costs an arm and a leg.
Travel|The family finds that a peak-season flight is extremely expensive.|家人發現旺季機票非常昂貴。|The peak-season flight costs an arm and a leg.
Sport|The team's new professional equipment carries a very high price.|隊伍的新專業器材價錢非常高。|The professional equipment costs an arm and a leg.
Community|Hiring the huge hall is far more expensive than the small group expected.|租用大型會堂遠超小團體預期的價錢。|Hiring the huge hall costs an arm and a leg.
Technology|Replacing every laptop at once would be extremely expensive.|一次過更換所有手提電腦會非常昂貴。|Replacing every laptop would cost an arm and a leg.
Environment|A custom water-testing machine is priced far above the charity's budget.|訂製水質檢測機遠超慈善團體預算。|The custom testing machine costs an arm and a leg.
Arts|The rare instrument is priced well beyond the young musician's means.|稀有樂器價錢遠超年輕音樂家的能力。|The rare instrument costs an arm and a leg.
Health|The private clinic quotes an exceptionally high price for the procedure.|私人診所為療程報出異常高價。|The private procedure costs an arm and a leg.
Business|The shop's urgent overnight repair carries a huge bill.|商店的緊急通宵維修帳單極高。|The overnight repair cost an arm and a leg.`,
    "idiom-18": `School|The club's budget assumes a grant that has never been promised.|學會的預算假設有一筆從未獲承諾的資助。|The club's budget is built on sand.
Work|The hiring plan relies entirely on an unverified sales forecast.|招聘計劃完全依賴未經核實的銷售預測。|The hiring plan is built on sand.
Travel|The itinerary assumes a ferry runs daily, but nobody checked its timetable.|行程假設渡輪每天開航，卻無人查過時間表。|The travel itinerary is built on sand.
Sport|The coach's strategy assumes an injured player will recover tomorrow without medical advice.|教練的策略假設傷兵明天可康復，卻沒有醫療意見。|The coach's strategy is built on sand.
Community|The petition claims universal support after speaking to only two residents.|請願書只訪問兩名居民，卻聲稱全體支持。|The petition's claim is built on sand.
Technology|The launch date depends on a feature that has not been designed or tested.|推出日期依賴一項尚未設計或測試的功能。|The launch timetable is built on sand.
Environment|The report uses one damaged sensor to claim the river is clean.|報告只憑一個損壞的感應器便聲稱河流潔淨。|The river report is built on sand.
Arts|The exhibition plan assumes a gallery is available without asking its owner.|展覽計劃未問場地方，便假設畫廊可使用。|The exhibition plan is built on sand.
Health|The campaign promises results based on a single untested claim.|活動只憑一項未經測試的說法便保證成效。|The campaign's promise is built on sand.
Business|The café expansion depends on customer numbers that were guessed, not counted.|咖啡店擴張計劃依賴估算而非統計的客量。|The café's expansion plan is built on sand.`,
    "idiom-19": `School|A missing prize has led to unproved suspicion of a student who handled the box.|獎品遺失後，曾接觸盒子的學生受到未證實的懷疑。|The student is under a cloud after the prize went missing.
Work|A manager faces questions about accounts, but no investigation has reached a conclusion.|經理因帳目受到質疑，但調查尚未有結論。|The manager remains under a cloud while the accounts are investigated.
Travel|An organiser is suspected of losing tickets, though the records are still being checked.|主辦人被懷疑弄失門票，紀錄仍在核對。|The organiser is under a cloud while the ticket records are checked.
Sport|Rumours surround a referee's decision, but no misconduct has been established.|裁判的判決引起傳聞，卻未證實違規。|The referee is under a cloud after the disputed decision.
Community|Questions about donation records have damaged a volunteer's reputation before the audit ends.|捐款紀錄的疑問令義工名聲受損，審計尚未完成。|The volunteer is under a cloud until the audit is complete.
Technology|A programmer is suspected of leaking data, but the security review is unfinished.|程式員被懷疑洩漏資料，安全審查尚未完成。|The programmer is under a cloud during the security review.
Environment|An official faces suspicion over test results, but the laboratory has not reported back.|官員因檢測結果受到懷疑，實驗室尚未回覆。|The official is under a cloud while the laboratory checks the results.
Arts|A curator is accused of mishandling a painting, though experts have not assessed it.|策展人被指處理畫作不當，專家尚未評估。|The curator is under a cloud before the expert review.
Health|A clinic director faces allegations about records, but no findings have been made.|診所主管面臨紀錄指控，但未有調查結論。|The director is under a cloud while the records are examined.
Business|A shop owner faces questions about refunds, although the inquiry is still open.|店主因退款問題受質疑，調查仍在進行。|The shop owner is under a cloud during the refund inquiry.`,
    "idiom-20": `School|A quiet student unexpectedly reaches the final of the speech contest.|一名平日低調的學生意外打入演講決賽。|The quiet student is a dark horse in the speech contest.
Work|A little-known applicant gives the strongest interview for the leadership role.|一名少人認識的申請者在領導職位面試中表現最佳。|The little-known applicant is a dark horse for the leadership role.
Travel|A small town unexpectedly becomes a leading candidate to host the festival.|一個小鎮意外成為主辦節慶的熱門候選地。|The small town is a dark horse to host the festival.
Sport|An unseeded runner qualifies near the top of the championship field.|一名非種子跑手在錦標賽預賽中名列前茅。|The unseeded runner is a dark horse for the title.
Community|A little-known neighbourhood group gains strong support for the award.|少人認識的社區團體在獎項評選中獲得大力支持。|The neighbourhood group is a dark horse for the award.
Technology|An unknown start-up produces a strong prototype in the innovation contest.|一間名不經傳的初創公司在創新比賽拿出優秀原型。|The unknown start-up is a dark horse in the contest.
Environment|A small village submits an unexpectedly strong conservation bid.|一條小村莊提交了出乎意料地出色的保育方案。|The small village is a dark horse for the conservation prize.
Arts|An unpublicised play wins over critics before the theatre awards.|一齣沒有宣傳的劇作在戲劇獎前贏得評論家支持。|The unpublicised play is a dark horse for the theatre award.
Health|A little-known team develops a promising solution in a medical innovation challenge.|少人認識的團隊在醫療創新挑戰中提出有潛力的方案。|The little-known team is a dark horse in the challenge.
Business|A small family bakery unexpectedly reaches the final of a city-wide food award.|一間小型家庭麵包店意外打入全市美食獎決賽。|The family bakery is a dark horse for the food award.`,
    "idiom-21": `School|Older pupils take all the equipment and nobody enforces the sharing rules.|高年級學生拿走所有器材，卻無人執行分享規則。|Without fair rules, the playground became the law of the jungle.
Work|Powerful staff take credit for juniors' work and complaints are ignored.|資深員工搶走初級員工功勞，投訴也被忽視。|The workplace felt like the law of the jungle.
Travel|At an unregulated ticket queue, the strongest push aside everyone else.|在無人管理的售票隊伍，強壯者推開其他人。|The ticket queue became the law of the jungle.
Sport|A tournament has no referee and the biggest teams intimidate the others.|比賽沒有裁判，大隊伍威嚇其他隊伍。|Without a referee, the tournament became the law of the jungle.
Community|A market has no fair allocation process, so the largest sellers seize every stall.|市集沒有公平分配機制，大商戶搶走所有攤位。|The market became the law of the jungle.
Technology|A platform allows powerful users to silence smaller creators with no appeal process.|平台容許大用戶壓制小創作者，也沒有上訴機制。|The platform feels like the law of the jungle.
Environment|Companies take water from a shared source without limits, leaving villages short.|公司無限制取用共同水源，令村莊缺水。|Water access became the law of the jungle.
Arts|A festival has no selection rules, and big sponsors force small performers out.|藝術節沒有遴選規則，大贊助者擠走小表演團體。|The festival became the law of the jungle.
Health|A clinic has no fair queue, so influential patients always go first.|診所沒有公平輪候制度，有權勢的病人總是先看診。|The clinic queue feels like the law of the jungle.
Business|There are no protections for small suppliers, and dominant buyers dictate every term.|小供應商沒有保障，強勢買家控制所有條款。|The supply market has become the law of the jungle.`,
    "idiom-22": `School|After months of hesitation, Felix signs up for the public-speaking contest.|Felix 猶豫幾個月後，終於報名演講比賽。|Felix took the plunge and entered the public-speaking contest.
Work|After careful thought, Aisha accepts a new role in another city.|Aisha 深思後，接受另一城市的新職位。|Aisha took the plunge and accepted the new role.
Travel|The family has long considered a year abroad and finally books the journey.|家人考慮到外地生活一年已久，終於訂了旅程。|The family took the plunge and booked a year abroad.
Sport|After worrying about the level, a beginner joins the competitive swim team.|初學者擔心水平不足，但終於加入競賽泳隊。|The beginner took the plunge and joined the swim team.
Community|The residents have debated a food-sharing project and now open the first site.|居民討論食物分享計劃已久，終於開設首個站點。|The residents took the plunge and opened the first food-sharing site.
Technology|After testing for months, the developers finally release their accessibility app.|開發者測試了數月，終於推出無障礙應用程式。|The developers took the plunge and released their app.
Environment|After weighing the cost, the school starts a campus-wide solar project.|學校權衡成本後，開始全校太陽能計劃。|The school took the plunge and started the solar project.
Arts|The actor has long feared solo performance but now agrees to lead the show.|演員一直害怕獨演，如今終於同意擔綱。|The actor took the plunge and accepted the leading role.
Health|After discussing the commitment, Leo enrols in a long rehabilitation programme.|Leo 討論長期投入的要求後，報名復康計劃。|Leo took the plunge and enrolled in rehabilitation.
Business|After years of planning, two friends open their first bakery.|兩位朋友計劃多年，終於開設首間麵包店。|The friends took the plunge and opened their first bakery.`,
    "idiom-23": `School|Nora leads the debate team, edits the magazine and tutors younger pupils this term.|Nora 本學期帶辯論隊、編校刊，又輔導低年級學生。|Nora has many irons in the fire this term.
Work|Omar is managing a launch, training staff and revising the budget at the same time.|Omar 同時管理產品推出、培訓員工和修訂預算。|Omar has many irons in the fire at work.
Travel|A tour organiser is booking rooms, confirming guides and planning meals this week.|旅遊主辦人本週同時訂房、確認導遊和安排膳食。|The tour organiser has many irons in the fire.
Sport|The coach runs two teams, prepares a tournament and teaches a new class.|教練同時帶兩隊、籌備比賽及教授新班。|The coach has many irons in the fire.
Community|Volunteers are opening a pantry, organising visits and repairing the hall.|義工同時開設食物站、安排探訪和維修會堂。|The volunteers have many irons in the fire.
Technology|A developer maintains the website, tests an app and trains new contributors.|開發者同時維護網站、測試應用程式及培訓新人。|The developer has many irons in the fire.
Environment|The group monitors a river, plants trees and writes a conservation guide.|團體同時監察河流、種樹及撰寫保育指南。|The group has many irons in the fire.
Arts|The artist is preparing an exhibition, teaching workshops and designing a poster.|藝術家同時籌備展覽、教授工作坊及設計海報。|The artist has many irons in the fire.
Health|The clinic is running screenings, training volunteers and opening a new service.|診所同時進行篩查、培訓義工及開設新服務。|The clinic has many irons in the fire.
Business|The bakery is expanding delivery, hiring staff and testing a new menu.|麵包店同時擴展外送、招聘員工和試新餐牌。|The bakery has many irons in the fire.`,
    "idiom-24": `School|After becoming prefect, Hugo starts ordering classmates about and dismissing their ideas.|Hugo 當上領袖生後，開始命令同學，又輕視他們的意見。|Hugo is getting above himself after becoming prefect.
Work|A new supervisor speaks as if experienced colleagues no longer deserve respect; she dismisses their advice.|新女主管說話彷彿資深同事不再值得尊重，也輕視他們的意見。|The new supervisor is getting above herself.
Travel|After being chosen as guide, Mia treats the other volunteers as servants.|Mia 獲選當導遊後，把其他義工當僕人看待。|Mia is getting above herself as the new guide.
Sport|Since becoming captain, Ethan refuses to listen to teammates he used to respect.|Ethan 當隊長後，不再聽以前尊重的隊友意見。|Ethan has got above himself since becoming captain.
Community|A committee chair now belittles neighbours who helped start his project.|男委員會主席如今貶低曾幫忙創辦其項目的鄰居。|The chair has got above himself.
Technology|After one award, a coder claims her junior colleagues are not worth hearing.|女程式員得獎一次後，便說初級同事的意見不值得聽。|The coder is getting above herself after the award.
Environment|A campaign leader dismisses local residents as ignorant after his group gains publicity.|倡議領袖的團體受注目後，他便說本地居民無知。|The campaign leader is getting above himself.
Arts|After a successful opening, an actor speaks rudely to his stage crew.|首演成功後，男演員粗魯地對待舞台工作人員。|The actor is getting above himself after the opening.
Health|A newly promoted director ignores the nurses who helped build her service.|新晉升的女主管無視曾建立其服務的護士。|The director has got above herself since the promotion.
Business|A shop owner wins one prize and begins treating his long-time customers with contempt.|男店主得獎一次後，便輕蔑地對待長期顧客。|The owner is getting above himself after winning the prize.`,
    "idiom-25": `School|The final oral presentation will reveal whether pupils can use the language independently.|最後口頭匯報能顯示學生是否能獨立運用語言。|The final oral presentation is the acid test of the pupils' fluency.
Work|A busy first week will show whether the new schedule works under pressure.|繁忙的首週能顯示新時間表在壓力下是否有效。|The first busy week will be the acid test of the schedule.
Travel|A long trip in heavy rain will reveal whether the luggage is truly waterproof.|一段暴雨下的長途旅程，能檢驗行李是否真防水。|The rainy journey will be the acid test of the luggage.
Sport|The championship final will show whether the new team can handle pressure.|錦標賽決賽能檢驗新隊伍是否能承受壓力。|The final will be the acid test for the new team.
Community|A large public event will reveal whether the volunteer plan can scale up.|大型公開活動能檢驗義工方案能否擴大規模。|The public event will be the acid test of the volunteer plan.
Technology|Thousands of simultaneous users will reveal whether the app is stable.|數千人同時使用，能檢驗應用程式是否穩定。|A heavy user load will be the acid test of the app.
Environment|A dry summer will show whether the new garden conserves enough water.|乾旱夏天能檢驗新花園是否夠節水。|The dry summer will be the acid test of the garden.
Arts|A live performance without edits will reveal the cast's true readiness.|沒有剪輯的現場演出，能看出演員是否真正準備好。|The live performance will be the acid test for the cast.
Health|The emergency drill will show whether staff can follow the new response plan.|緊急演習能檢驗職員是否能依照新應變計劃。|The emergency drill will be the acid test of the response plan.
Business|The first holiday rush will reveal whether the bakery can serve a crowd.|首個假期人潮能檢驗麵包店是否能應付大量顧客。|The holiday rush will be the acid test for the bakery.`,
    "idiom-26": `Football|After sixteen seasons, the striker announces that she will never play competitively again.|踢了十六個球季後，前鋒宣布永久告別競技。|The striker has decided to hang up her boots after sixteen seasons.
Goalkeeping|The goalkeeper plans to retire permanently after his cup final.|男守門員打算在盃賽決賽後永久退役。|The goalkeeper plans to hang up his boots after the cup final.
School team|A school captain graduates and decides to end his competitive football career.|校隊隊長畢業，決定結束競技足球生涯。|The captain decided to hang up his boots after graduation.
Injury|A long-term injury forces a player to end her playing career for good.|長期傷患迫使球員永久結束球員生涯。|The injury forced the player to hang up her boots.
Coaching|A former player ends his playing career and moves into full-time coaching.|前男球員結束球員生涯，轉為全職教練。|He hung up his boots and became a full-time coach.
Club career|After twenty years with one club, a defender plays his final professional match.|後衛效力同一球會二十年後，踢完最後一場職業賽。|The defender hung up his boots after twenty years with the club.
Announcement|At a press conference, the midfielder says this season will be her last.|中場球員在記者會說本季是最後一季。|The midfielder will hang up her boots at the end of the season.
Family decision|A player retires permanently to spend more time raising his children.|球員為了有更多時間照顧孩子而永久退役。|The player hung up his boots to spend more time with his children.
National side|After the tournament, the veteran says she will not play for any team again.|賽事後，資深球員說不會再為任何球隊作賽。|The veteran will hang up her boots after the tournament.
Farewell match|The club arranges a farewell game because its captain is ending his playing career.|球會安排告別賽，因為隊長正結束球員生涯。|The captain is hanging up his boots after the farewell game.`,
    "idiom-27": `School|I have not visited my old school for many years.|我多年沒有回母校。|I haven't visited my old school in a dog’s age.
Work|Nora has not met her former colleague since they changed jobs years ago.|Nora 多年前轉工後，便沒有見過舊同事。|Nora hasn't seen her former colleague in a dog’s age.
Travel|We have not taken the mountain train for years.|我們多年沒有乘搭山區火車。|We haven't taken the mountain train in a dog’s age.
Sport|Ben has not played badminton since leaving school.|Ben 離校後已多年沒打羽毛球。|Ben hasn't played badminton in a dog’s age.
Community|The neighbours have not held a street party for a very long time.|街坊已很久沒有辦街頭派對。|The neighbours haven't held a street party in a dog’s age.
Technology|I have not opened that old messaging app for years.|我多年沒有打開那個舊通訊程式。|I haven't opened that messaging app in a dog’s age.
Environment|The village has not seen this many butterflies for a very long time.|村莊已很久沒有見過這麼多蝴蝶。|The village hasn't seen this many butterflies in a dog’s age.
Arts|Leah has not sung onstage since she was a child.|Leah 自小時候起便沒有在台上唱歌。|Leah hasn't sung onstage in a dog’s age.
Health|After years of stress, I finally feel rested again.|多年壓力過後，我終於再次感到精神充足。|I haven't felt this rested in a dog’s age.
Family|We have not gathered all our cousins together for many years.|我們多年沒有與所有表兄弟姊妹聚首。|We haven't gathered all our cousins together in a dog’s age.`,
    "idiom-28": `School|Two classmates argue whenever they plan a project and cannot cooperate.|兩名同學每次策劃項目都爭吵，無法合作。|The two classmates are like oil and water on projects.
Work|Two managers have conflicting approaches and cannot make a joint decision.|兩名經理做事方式衝突，無法一起決定。|The two managers are like oil and water.
Travel|The travellers want incompatible itineraries and argue at every stop.|兩名旅客想要互不相容的行程，每站都爭執。|The two travellers are like oil and water on this trip.
Sport|Two players refuse to share the ball and clash in every practice.|兩名球員不肯互傳球，每次練習都衝突。|The two players are like oil and water on the pitch.
Community|The committees cannot agree on any shared rule and keep blocking one another.|兩個委員會無法同意共同規則，互相阻撓。|The two committees are like oil and water.
Technology|A privacy-first design and a plan to collect every user's data cannot work together.|重視私隱的設計與收集所有用戶資料的方案，無法並行。|The two design plans are like oil and water.
Environment|One group wants to protect the wetland while the other insists on paving it over.|一個團體想保護濕地，另一個卻堅持鋪平。|The two proposals are like oil and water.
Arts|The director wants a quiet drama, but the producer demands constant loud spectacle.|導演想拍安靜的劇情片，製作人卻要求不斷有喧鬧場面。|The director and producer are like oil and water.
Health|Two team leaders reject each other's methods and cannot coordinate patient care.|兩名組長互相否定做法，無法協調病人護理。|The two leaders are like oil and water.
Business|The partners disagree over every purchase and cannot run the shop together.|兩名合夥人對每筆採購都意見相左，無法一起經營。|The partners are like oil and water.`,
    "idiom-29": `School|Milo calls one unfamiliar word an impossible barrier and refuses to begin the essay.|Milo 把一個生字說成不可跨越的障礙，因此不肯開始作文。|Milo sees a lion in the way whenever he meets an unfamiliar word.
Work|A worker delays a simple form because one field looks confusing, though help is available.|員工因一欄表格看似複雜而拖延，儘管有人可幫忙。|The confusing field became a lion in the way for the worker.
Travel|The family avoids planning a trip because one train timetable seems hard to read.|家人只因一張火車時間表難讀，便不肯規劃旅程。|The timetable became a lion in the way for the family.
Sport|A player will not try a beginner's class because the first drill looks difficult.|球員因第一項初學者訓練看似困難，便不肯試上課。|The first drill became a lion in the way for the player.
Community|Volunteers put off a small garden project because they must make one phone call.|義工只因要打一通電話，便拖延小型花園計劃。|The phone call became a lion in the way for the volunteers.
Technology|A learner refuses to start coding because one error message seems intimidating.|學習者因一則錯誤訊息看似嚇人，便不肯開始寫程式。|The error message became a lion in the way for the learner.
Environment|A group delays a clean-up because it must ask for one ordinary permit.|團體只因要申請一張普通許可證，便延遲清潔活動。|The permit became a lion in the way for the group.
Arts|An artist postpones a small exhibition because one label needs rewriting.|藝術家只因一張說明牌要重寫，便延遲小展覽。|The label became a lion in the way for the artist.
Health|A student avoids a routine appointment because filling in one short form feels daunting.|學生只因一張短表格看似麻煩，便不去例行預約。|The short form became a lion in the way for the student.
Business|An owner puts off opening a stall because one sign is not quite finished.|店主只因一塊招牌尚未完全做好，便不肯開檔。|The unfinished sign became a lion in the way for the owner.`,
    "idiom-30": `School|A student knowingly confronts a violent group alone and faces serious danger.|學生明知危險，仍獨自面對暴力團體。|The student walked into the lion’s mouth by confronting the group alone.
Work|An employee enters a threatening meeting with people known to retaliate against witnesses.|員工進入一場充滿威脅的會議，與曾報復證人的人見面。|The employee went into the lion’s mouth by attending the meeting.
Travel|Despite a clear danger warning, a traveller enters a violent conflict zone.|旅客無視明確危險警告，進入暴力衝突地區。|The traveller headed into the lion’s mouth.
Sport|A reporter enters a hostile crowd after threats were made against her.|記者收到威脅後，仍走進充滿敵意的人群。|The reporter walked into the lion’s mouth.
Community|A witness knowingly visits a violent gang's meeting place to ask about threats against him.|男證人明知危險，仍去暴力幫派聚集地追問針對他的威脅。|The witness put his head into the lion’s mouth.
Technology|A whistleblower meets people who have threatened severe retaliation over leaked evidence.|揭發者與曾威脅嚴重報復的人會面，討論外洩證據。|The whistleblower stepped into the lion’s mouth.
Environment|An investigator enters a guarded illegal dump despite credible threats.|調查員收到可信威脅後，仍進入有人看守的非法堆填場。|The investigator walked into the lion’s mouth.
Arts|A performer knowingly visits a violent extortion group after they threatened the venue.|表演者明知勒索團體曾威脅場地，仍去見對方。|The performer went into the lion’s mouth.
Health|A medic enters an active conflict area where workers have been attacked.|醫護進入仍有衝突、工作人員曾遭襲擊的地區。|The medic went into the lion’s mouth to help patients.
Business|An owner meets a dangerous criminal group alone despite explicit threats against her.|女老闆收到明確威脅後，仍獨自與危險犯罪團體見面。|The owner put her head into the lion’s mouth.`,
  };
  const updated = { ...source };
  for (const [id, block] of Object.entries(material)) {
    const lesson = catalogue.find((item) => item.id === id);
    const highlights = [...new Set((lesson?.questions || []).map((question) => question.highlight))].sort((a, b) => b.length - a.length);
    const bonusPractice = block.trim().split("\n").map((line, index) => {
      const [theme, prompt, promptZh, answer] = line.split("|");
      const highlight = highlights.find((value) => answer.toLocaleLowerCase().includes(value.toLocaleLowerCase())) || "";
      return { id: `${id}-bonus-${String(index + 1).padStart(2, "0")}`, number: index + 51, theme, prompt, promptZh, answer, highlight, bonus: true };
    });
    updated[id] = { ...source[id], bonusPractice };
  }
  window.EDMUND_IDIOM_COMPASS = Object.freeze(updated);
})();

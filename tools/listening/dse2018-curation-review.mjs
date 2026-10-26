// Editorial decisions for the 2018 Part A pilot. Row IDs refer to the existing
// bilingual guide, not newly generated transcript text. Pauses follow confirmation.
export const reviews = [
// question, contextual prompt, pre-answer listening target, note mapping, start row, last row
[1,'Iris had a _____ weekend.','先認人物：這格問 Iris 的感受，原因在下一格。','really terrible → a terrible weekend',5,6],
[2,'Iris: because her _____.','because her 後補主語餘下部分及發生的事。','my dog was sick → because her dog was sick',7,10],
[3,'Dan had a _____ weekend.','轉到 Dan 一列；感受與購物原因分開記。','great / wonderful → 愉快的週末',11,13],
[4,'Dan: because he _____.','because he 已提供主語，記下過去發生的動作。','I bought a new TV → because he bought a new TV',12,13],
[5,'Kaity had a _____ weekend.','第三位說話者到場；形容的是 weekend。','boring → 事情令人無聊；bored → 人感到無聊',16,16],
[6,'Kaity: because she _____.','聽齊動作及時間範圍，別只記職位。','had to work + all weekend → had to work all weekend',17,18],
[7,'Accepted topic: _____; examples in Q8–9.','題材欄填類別，名稱欄才填個別遊戲。','games children play in the playground → playground games',26,27],
[8,'Names of the two playground games — first answer.','兩款遊戲，聽齊名稱及後面的重複確認。','Catch the Dragon → 完整名稱；與 Q9 次序可互換',28,31],
[9,'Names of the two playground games — second answer.','記另一款遊戲，不能把同一名稱填兩次。','Fingers Out → 保留複數 Fingers 及 Out',28,31],
[10,'Why does Kaity accept the playground-games topic?','這一欄問採用理由；留意確認後的解釋。','fun to watch → 觀看遊戲有趣',32,34],
[11,'Rejected topic: _____; game name in Q12.','題材與遊戲名分開，留意 for 的對象。','computer games for animals → 供動物玩的電腦遊戲',35,36],
[12,'Name of the computer game for animals: _____.','聽名稱，裝置及遊戲中的物件只是補充。','Crazy Cat → 遊戲名稱；red dot → 畫面中的物件',38,40],
[13,'Why does Kaity reject Dan’s topic?','等候最終取捨及原因，別只記開頭反應。','no research → topic has not been researched → rejected',41,44],
[14,'Monster Maze key: label above the grid _____.','先按圖分清上、下方；問題中的猜測還不是確認。','top → exit；bottom / numbers 1–6 → entrance',12,15],
[15,'Monster Maze key: label below the grid _____.','上下兩個標籤固定位置，不按先聽到的字填第一格。','bottom / numbers 1–6 → entrance',12,15],
[16,'Monster Maze key: shaded squares = _____.','分清灰格、O、M 三種符號。','grey squares → walls of the maze',16,17],
[17,'Plot Dan’s first life. Mark O along the route and M at a monster.','每經一格都要記錄，最後等對方確認是否遇上怪物。','A4 → B4 → B5 → B6（M）；其餘走過的格子標 O',40,43],
[18,'Plot Dan’s second life. Mark O along the route and M at a monster.','重新聽起點，按固定方向走每一格；等到最後確認。','A5 → B5 → B4 → B3 → C3 → D3 → E3 → E4 → F4；全部 O',46,51],
[19,'What are Dan’s suggestions for improving Monster Maze? First suggestion.','題目問改善方法，不只描述現有問題。','boring to look at → make the game more colourful',56,60],
[20,'What are Dan’s suggestions for improving Monster Maze? Second suggestion.','第二個不同的建議；方法與預期效果分開。','more monsters → more challenging / more fun',56,60],
[21,'How will people play the game online? First way.','聽兩種操作方法，單寫裝置名稱不足。','speaking → voice controlled',61,66],
[22,'How will people play the game online? Second way.','留意 The second way，記下操作動作及對象。','touch the screen → touchscreen control',61,66],
[23,'First, when the game starts, _____.','防作弊的四個步驟：先確認何時發生及傳送什麼。','when the game starts → sends a document to the player’s phone',69,70],
[24,'Second, when the game’s over, _____.','分清遊戲開始與結束時發生的事情。','when the game is over → a password appears on the screen',71,72],
[25,'Third, _____.','第三步要交代動作及所用方法。','opens the document + with the password',73,75],
[26,'Fourth, _____.','最後核對的是什麼資料？聽齊為何能確認沒有作弊。','checks the location of the monsters → verifies the game did not cheat',76,79],
[27,'Correct the mistake or write ✓: It was started in the year 1560.','先對照原句。要求核對日期，不等於日期一定錯。','started → completed；1560 不變',21,23],
[28,'Correct the mistake or write ✓: The artist was called Pete Bruegel the Elder.','以逐字串字作準，找出原句真正要替換的部分。','Pete → Pieter（P-I-E-T-E-R）',24,28],
[29,'Correct the mistake or write ✓: He was born in the Netherlands and died in Belgium.','國家提及順序可能倒轉；把出生、去世各自配對。','born: Netherlands；died: Belgium → 原句正確 ✓',29,31],
[30,'Painting — upper circle (boys on the fence). Name the game in ≤4 words.','先定位圖中的人物。錄音不按 Q30–33 題號順序。','boys on top of the fence → riding horses',48,50],
[31,'Painting — right circle (girls with a basket). Name the game in ≤4 words.','分清手上的道具與正在玩的遊戲。','girls holding a basket → a pretend wedding',41,44],
[32,'Painting — small left circle (boy on the grass). Name the game in ≤4 words.','先對照坐姿及圖中位置，再記活動名稱。','boy sitting cross-legged → exercise, like yoga',37,39],
[33,'Painting — large lower circle. Name the game in ≤4 words.','留意動作、疼痛描述及最後的概括。','kick very hard → a kicking game',51,55],
[34,'Most of these games use _____.','由歷史畫作轉到現代遊戲；留意圖像技術名稱。','8-bit graphics → 圖像技術',71,72],
[35,'Designers enjoy using _____ with (36) _____ to make (37) _____.','同一句三格：材料、顏色限制、成品。聽齊再配對。','little / small blocks → 素材',74,78],
[36,'Using (35) _____ with _____ to make (37) _____.','with 後的資料要保留數量限制。','only a few colours → a small number of colours',74,78],
[37,'Using (35) _____ with (36) _____ to make _____.','to make 後是製作的結果，別與玩法難度混淆。','complex pictures ↔ complicated images',74,78],
[38,'The games are simple and their intention is to be _____.','留意多義詞，等說話者確認所指意思。','funny = humorous / like a joke；不是 weird',81,86],
[39,'These games can be played online _____.','題目已給 online；補充的是收費情況。','free / do not need to pay anything → for free',87,89],
[40,'What are the three key aspects in the definition of a game? First aspect.','三點定義要各不相同，聽齊兩位講者的補充。','entertainment ↔ pleasure and fun',10,21],
[41,'What are the three key aspects in the definition of a game? Second aspect.','區分主要特點與舉例，不只寫其中一種結果。','outcome or goal → win / lose / finish are examples',10,21],
[42,'What are the three key aspects in the definition of a game? Third aspect.','留意第三點及另一位講者是否同意。','follow a set of rules → essential element',10,21],
[43,'Which point do Jonathan and Natalie disagree about?','要聽到雙方立場，才能確定爭議所在。','life is a game ↔ mine is not → whether life itself is a game',22,34],
[44,'Ants — play fighting — benefit: _____.','活動已印好；這格只記它帶來的好處。','play fighting → get better at real fighting',39,47],
[45,'Fish — type of play: _____.','先記活動，別把主持人的猜測當解釋。','jump out of water → jumping for fun',49,55],
[46,'Fish — benefit of this play: _____.','和上一格分開：這格問實際好處。','jumping → escape predators and hunters',56,58],
[47,'Rats play fighting — first key point: _____.','聽比較關係，記清楚哪兩類老鼠參與。','stronger + weaker → abilities are unequal',62,66],
[48,'Rats play fighting — second key point: _____.','保留條件詞、頻率及結果，避免把意思說得太絕對。','if weaker rat always loses → it stops playing',69,72],
[49,'Rats play fighting — third key point: _____.','聽齊強弱雙方、頻率及讓賽目的。','stronger rat lets weaker rat win sometimes → keep playing',74,78],
[50,'What do the rats learn from play fighting? First lesson.','總結的是社會學習，別搬前面另一種動物的好處。','develop morality → learn to be moral',80,86],
[51,'What do the rats learn from play fighting? Second lesson.','第二點保留和平相處的意思，不只記住同住。','live together peacefully → 和平共處',80,86]
];
export const groups = [[3,4],[8,9],[14,15],[19,20],[21,22],[35,36,37],[40,41,42],[50,51]];
// Additional exact spans establish complete routes, alternatives and the decision.
export const extraEvidence = {
2:[[10,'really sick']],3:[[12,'A really wonderful weekend.']],6:[[17,'I had to work, work, work']],
8:[[31,'Catch the Dragon.']],10:[[33,'Yep, definitely.']],11:[[36,'contrast human games with like games animals play']],13:[[42,'no research'],[43,"you haven't done any research"]],
14:[[13,'No, the other way round.']],15:[[13,'where the numbers 1 to 6 are']],
17:[[40,"I'll start on A4."],[43,"You've landed on my monster."]],
18:[[46,"I'll start at A5. I move forward one square."],[47,"I'll move left two squares."],[50,'Move forward one square.'],[51,'You survived the maze.']],
19:[[57,"the grid's a bit boring to look at"]],20:[[60,'adding more monsters would make it more fun']],21:[[63,'actually speaking like we did']],
25:[[75,'they open the document in the third step']],26:[[78,"the game hasn't been cheating"]],
27:[[22,"No, no, it's right."]],28:[[26,'Pete Bruegel. P-E-T-E.']],
30:[[48,'boys on top of the fence']],31:[[41,'girls holding a basket']],32:[[37,'one boy sitting cross-legged on the grass']],33:[[54,'kick very hard']],
35:[[78,'small blocks']],36:[[78,'only a small number of colours']],37:[[78,'really complicated images']],38:[[86,'Yeah, exactly, like a joke.']],39:[[89,"You don't need to pay anything."]],
40:[[12,'pleasure and fun']],41:[[14,'win or lose a game or finish it']],42:[[21,'following rules would be an essential element']],
43:[[29,"Mine isn't."],[30,"I don't think anyone else's is either."]],44:[[47,'get better at real fighting from play fighting']],45:[[54,'No, no,']],
47:[[65,'one rat will always be stronger than another rat']],48:[[72,"I'm not playing this game if you keep winning."]],
49:[[76,'some of the time so they can keep playing.'],[77,'deliberately lose to the weaker rat']],50:[[85,'learn to be moral']],51:[[86,'live peacefully with one another']]
};
// [source row, exact span, row completing rejection, reason]. Only actual
// rejected readings are struck; valid information for another field stays valid.
export const distractors={
13:[[37,'it sounds interesting',44,'最初反應正面，但最後因沒有研究而拒絕。']],
14:[[12,'Is it at the top here?',13,'這是入口位置的猜測；對方立即更正入口在底部。']],
27:[[22,'started in 1560',23,'年份正確，錯的是 started；後文改為 completed。']],
28:[[26,'Pete Bruegel. P-E-T-E.',28,'這是文件原來的錯字；已要求改為 Pieter。']],
38:[[85,'weird funny',86,'humorous funny 獲確認；weird 的意思被排除。']],
45:[[53,'jump to catch food',55,'主持人猜為了捕食；對方否定並說魚在水底覓食。']]
};
export const noise = {
1:[14,15],
2:[11,27,29,52,53],
3:[8,9,10,14,19,45,46,47,56,57,58,59,66,67,70,76,79,80,90,91,92],
4:[3,5,7,9,32,33,37,38,40,41,46,48,52,73,79,84,88,89,90,91]
};
export const instruction = {1:[0,1,2,3,45,46],2:[0,1,2,3,4,5,31,32,54,55,80],3:[0,1,2,3,4,5,6,7,60,61],4:[0,1,92,93,94]};
export const noiseSpans={1:{4:["Morning, Dan. You look very well. Where's Katie?"],5:["Hi, Iris. She's not here yet, but she texted to say she's on her way."]}};

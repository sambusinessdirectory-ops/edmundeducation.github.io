// Original-year guide, with visual matching checked against all supplied diagrams.
export const notes=['Campsites, depth locations and animal-order answers were independently matched to the supplied question figures. Multi-answer choices follow the native question-number ordering.', 'Task 3 explicitly says the journey began in 1821 but calls this three years after 1819. An independent transcription of the original audio also produced that wording. The reference answer follows the explicit 1821 and openly flags the inconsistent interval; no alternative date is invented.', 'English source cues are preserved apart from the unmistakable “shell on their bags” → “shell on their backs” recognition error. The existing overlapping task-introduction and Data File boundary cues are translated too.', 'Guide-only labels mark obvious instruction continuations and Data File directions as Narrator; cues crossing announcement/dialogue boundaries have combined labels. Other dialogue labels remain nonspecific groups, with no guessed individual speaker turns. Original cue timings are unchanged.'];
export const speakerCorrections={
 ...Object.fromEntries(['1:0','1:1','1:43','2:0','2:1','2:3','3:0','3:1','3:2','3:3','4:1','4:2','4:3','4:59'].map(key=>[key,'Narrator'])),
 '1:3':'Narrator / Julia and Mark','1:42':'Julia and Mark / Narrator','2:4':'Narrator / Jason and Dr Anita Carter','4:4':'Narrator / Modern Explorer','4:57':'Modern Explorer / Narrator'
};
export const corrections={'2:24':'carry a shell on their backs. No, they don’t. What’s this one here? It looks quite alien.'};
export const transcriptZh={
1:`任務一。Julia 和 Mark 正在瀏覽 World Watch Travel 的網頁。聆聽他們的對話，
並在以下空格填上資料。第一項已作為例子提供。
你現在有三十秒閱讀題目。本任務結束後，你將有一分鐘
整理答案。喂，我找到一個介紹考察之旅的網站，看看它怎樣說。
你曾否想過成為探險家，發現新的動物？現在有 World
Watch Travel 就能實現。參加 World Watch Travel，你會展開一趟環保歷險，前往受保護的
巴西雨林。原來在巴西，嘩，聽起來很棒。我們什麼時候可以去？嗯，
讓我看看。這裡說夏季可以預訂考察團，每趟持續
六晚。即是自己在雨林裡逛六晚？不，是跟團，
每組由來自不同國家的八至十名學生組成。八至十名學生
一組，人數不少。我想人多比較安全吧。對，應該是。等等，
要多少錢？看看，學生價是七百五十美元。
換成港幣是多少？我想大約六千港元。
六千？雖然不便宜，但這是畢生難忘的假期。好，看看他們實際
做什麼。你可以按「主要活動」嗎？可以。主要活動是研究小型動物。
那我們要做什麼？這裡說要設置陷阱。天啊，
那就是用陷阱捕捉真正的動物，看看抓到什麼。希望沒有大
蜘蛛。動物進了陷阱後，我們要怎樣做？讓我讀讀看。
看來我們要檢查牠們的體重和整體健康狀況。即是看看
牠們有多重，也檢查是否健康。可以吧？可以，聽起來有趣。那
設施呢？提供哪些設施？看來是住在小屋裡，
每間小屋至少有廁所和淋浴設施。好消息。這……
有廚房嗎？看起來沒有。那我們要在哪裡煮食？
我也在想。不過有休息室，所以你可以跟
同組其他人在休息室聚一聚。很好。噢，但你看，沒有熱水。
那也可以很舒服吧，我想水應該夠暖，可以洗澡。聽起來一切都很
棒，即使用冷水也是。對，我同意。這裡有營地位置地圖。
你可以看到有哪些有趣的地方，以及在哪裡發現了新物種。藍色
營地是考察的起點，也是最北面的營地，就在
地圖左上角。據說這裡發現了很多新昆蟲。清單上的下一個
是紅色營地，離藍色營地相當遠，在地圖另一邊。對，
在右邊這裡。這裡有獸醫中心，他們會把發現的生病
動物帶到這裡。這一區曾發現新的蝴蝶品種。下一個是
綠色營地，在地圖正中央，這裡說經常可以看到龜。
最後是黃色營地，在東南方。嗯，我不肯定去這裡是否好主意。
看看那裡生活的動物。對，我不介意見到猴子，
但我可不想遇見鱷魚。我也不想。噢，看，
有一些評論。哎呀，這一則不太好：我以為這會是個
輕鬆的假期，誰知結束時累得要再放一次假。這根本不是假期，
而是付錢替別人工作。付錢替別人工作，這看法真糟糕。
天啊，真笨，難道沒看網站嗎？這裡有一則比較好的。
World Watch 營最好的地方，是美味的當地食物。所有食物都新鮮
好吃。原來如此，所以才沒有廚房，一定是有食堂。任務一
完結。你現在有一分鐘整理答案。任務二。Jason 是紀錄片
`,
2:`任務一完結。你現在有一分鐘整理答案。任務二。Jason 是紀錄片
製作人。他正訪問 Anita Carter 博士，製作關於海洋探索的紀錄片。
聆聽訪問，並在以下空格填上資料。第一項已經
作為例子提供。你現在有三十秒閱讀題目。本任務結束後，
你將有一分鐘整理答案。午安，Carter 博士。午安，Jason。
Carter 博士，你所屬的美國研究團隊在
Alonso 海溝發現了新的魚類，那是海洋最深的地方之一。對。你們
研究這個地區多久了？研究從去年春天開始，所以我們記錄這個
地區已經大約一年。是什麼吸引你們來這片海域？因為這裡
有很多瀕危物種嗎？不，其實不是，只是因為我們對這裡還了解得不多，
雖然它其實離海岸很近。明白，所以仍有很多
待發現的事物。沒錯，我們總想知道更多。可以說說到目前為止
發現了什麼嗎？海面之下有很多事情發生，
也有很多值得發掘的東西。不過我想最主要的發現，是一個新的獅子魚品種。
獅子魚？英文叫 snailfish，名字不太好聽呢。對，但牠們是非常特別的生物。
這裡有一張地圖，並非按比例繪製，不過能讓你了解發現魚類的位置。
以前我們只能下潛到大約三千米，現在可以潛得更深。
我們已經到達海平面以下六千五百至七千五百米之間。
我們就是在那裡找到獅子魚。很深呢。對，真的很深。
我們也有找到的動物影像。好，一起看看。
這一隻就是獅子魚。你可以看到牠身體非常柔軟，也相當
修長。牠們有兩組鰭，較大的一組在身體前部、頭部後面。
這張圖只能看到前面的那一組。
牠們的確像魚，但不太像蝸牛，對嗎？牠們沒有
背着殼。對，沒有。這一隻是什麼？看起來很像外星生物。
不，牠來自地球。這是我們拍到的另一種動物：長腿等足類動物，
大小約有人類手掌那麼大，看起來很像蜘蛛。牠們的身體很小，
有八條很長、很幼的腿。對，真的很像蜘蛛。
第三種有趣的生物，是一種叫「海豬」的海參。
海豬？這名字比 snailfish 還要糟糕。
的確，但牠們同樣很特別。這隻動物是在海洋的另一個區域
觀察到的，不過我們用相同科技拍攝。牠們身體下方有幾條短腿，
通常還有四條腿從身體上方伸出。不過這一隻只有兩條。
你可以看到，這些腿幫助牠爬過岩石。
真奇妙。所以頭頂那些不是觸角？
不是，那也是腿。好，回到獅子魚。
牠們看起來很脆弱，是嗎？牠們的確非常柔弱，
但也有堅硬部分。事實上，牙齒和耳骨是牠們身體裡最硬的結構。
有趣，我還以為脊骨最硬，
因為在圖片裡看得見。你說牠們有堅硬的牙齒？
對，用來嚇退其他魚。
明白為什麼需要硬牙齒了，但為什麼需要耳骨？
牠們需要耳骨來保持平衡，就像人類一樣。
即是耳骨讓牠們在水中保持正直姿勢？
基本上是。沒有耳骨，牠們便很難朝正確的
方向游泳。那身體其他部分呢？
牠們表面覆蓋着一層看起來像啫喱的皮膚。
這意味牠們被帶到水面後，無法存活很久。
為什麼不能存活？
因為在水面很難維持牠們生存所需的條件。
把魚缸弄暗、提供合適食物，倒不困難，
但牠們需要非常低的溫度和非常高的水壓。帶到水面後，
環境太暖、水壓太低；缺少這兩個條件，牠們便會死亡。
真的嗎？很可惜，這一定令研究更困難。你會很沮喪嗎？
能夠在牠們的自然棲息地研究牠們，實在令人非常興奮。
但很可惜，牠們無法活着完成前往水面的旅程。
好，Carter 博士，非常感謝。
任務二完結。你現在有一分鐘整理答案。`,
3:`任務三。Julia 和 Mark 正與導賞員在歷史博物館參觀。聆聽他們
參觀展覽時的討論，並完成以下筆記。第一項已經
作為例子提供。你現在有三十秒閱讀題目。本任務結束後，
你將有一分鐘整理答案。
由 James Merlin 船長率領、前往西伯利亞東北部的 Merlin 遠征，是歷史上最
著名的考察之一。不幸地，也是死傷最慘重的考察之一。
一百七十九名船員展開旅程，卻沒有一人生還。
一百七十九人死亡，太可怕了。
海軍部於 1819 年開始籌備任務。船名為「暗影號」，
最後在三年後的 1821 年啟航。這裡是暗影號的圖片，〔原稿明說 1821，但「三年後」與前述 1819 並不一致。〕
也展示專家認為它在冰上遭遇的情況。船上所用的科技
在當時相當先進。最主要的科技是一部蒸汽機，原本是
為火車提供動力而造的，因此船隻能航行得很快。
蒸汽機，即是沒有風也可以航行，是這個
意思嗎？對，動力很強。這裡展示一部類似的蒸汽機。
你可以看出它多麼厲害。嘩，是啊。另一項在當時相當
先進的科技，是特殊的暖氣系統。這套系統設在船內，
也用蒸汽運作，讓船員即使在嚴寒中仍能保暖。
明白。再往前走，這裡展示船上廚房當時的模樣。
galley 是什麼？像廚房嗎？對，我想是。嘩，好多湯。
你可以看到大部分食物裝在罐裡，對吧？看起來都一樣。他們
總是吃同樣的東西，不會厭倦嗎？也許會悶，不過這確實
節省船上的空間。他們要餵飽很多人，所以需要不佔太多
地方的食物。船上一定很擠迫。他們整天做什麼？光看着
冰山，不會覺得無聊嗎？我們知道，為了娛樂大家，
船員每個月會演出一次。即是他們不
工作時，就當演員和歌手？對，當時船上這種活動很普遍。他們表演，
讓船員開心，也讓大家有事可做。有點像我們今天看
電視節目。我有問題，他們不怕去西伯利亞嗎？換了我一定害怕。
對我們而言，這大概是漫長而可怕的旅程，但船員認為
沒有什麼好擔心。他們相信已為旅程作好準備，因為覺得
所需的東西一應俱全。不過他們不知道食物出了
問題。真的嗎？怎麼回事？製造商出了問題。他們需要
八千罐食物，而且要求在短短兩個月內備妥。
時間不多，但接訂單的公司很有經驗，
所以時間本身不是問題。然而，公司買來裝罐的食物
品質不太好。結果即使船隻準時收到貨，
收到的卻是一大堆劣質食物，有些罐頭蔬菜已經腐爛。
有些肉可能可以餵動物，卻不適合人吃。過去
專家以為罐子使用了危險金屬，但現在我們知道
那不是真的，問題不在此。那他們就是因此死去？我們知道，
船被困在冰裡，大部分專家相信，足足被困了三個
冬天。大部分專家認為三個冬天，即是沒有人真正
知道發生什麼事？我們不確切知道經過，但肯定沒有一個
人生還。我們也知道，他們的健康受多種問題影響。其中一項是
飲食品質。他們攝取的維他命根本不足，因為如我之前所說，
沒有吃到足夠優質的肉。明白，缺乏維他命，還有呢？
他們被困冰上太久，在那樣寒冷的環境裡，人體需要大量卡路里，
但他們攝取不足，因此餓死。他們得不到足夠的
卡路里來生存。嘩，真是悲慘的故事。是啊，情況一定很可怕。
你說船在 2010 年找到，是在哪裡？說來有點奇怪，那個
地區的名字跟船名幾乎一樣，是在「暗影灣」發現的。
這個巧合有點毛骨悚然。暗影號、暗影灣。
另一件奇怪的事，是發現它的經過。據說一名當地漁夫做了個夢，
夢見一艘船在冰上遇上巨大暴風雪。這個夢令他非常不安，
覺得必須親自去看看。到達後，他找到一艘舊船，
位置跟夢裡所見一模一樣。於是他通知當局，
當局最終確認，那的確是暗影號。他說對了。
真不可思議，竟然在夢中看到它。
任務三完結。你現在有一分鐘整理答案。
任務四。請聆聽介紹現代探險的播客《Modern Explorer》。`,
4:`任務四。請聆聽介紹現代探險的播客《Modern Explorer》。
你會聽到歷史學家 Anna Connor 介紹一本有聲書。聽過部分內容後，
Anna 會評論這本有聲書。請注意，你不需要用
完整句子作答。你現在有三十秒閱讀題目。本任務結束後，
你將有三分鐘整理答案。早安，歡迎收聽節目。
我是 Anna Connor，你正在收聽《Modern Explorer》。今天我們會聽一位
名叫 Peter Dales 的探險家分享，他聲稱發現了一處失落古蹟：
豹神神廟。現在聽聽他的新有聲書《豹神崛起》的部分內容。
第一章：穿越叢林。搜索第一天，我和團隊離開叢林
營地，由兩名經驗豐富的嚮導帶路。他們很熟悉這個地方，因為家族
世世代代住在附近，而他們從小聽着豹神的故事長大。他們的祖先
對豹神極為崇敬，因為豹應該是叢林裡最
強大的動物。幸好我們沒有見到真正活生生的豹。不過，途中確實
遇上了一些非常好奇的野生動物。猴子在我們頭上的樹梢跟着我們，
小鹿也走出來看我們。如果牠們從來沒
見過人類，又怎會懂得害怕？這清楚顯示，人們已經很久、
很久沒來過這個地方。我們繼續向山谷前進，艱難地穿過叢林。
但到下午較晚時，我們遇上問題。嚮導說不願再帶我們
前進，聲稱該區不安全。他們說最近有一次地震，
使這個地方變得危險，所以不能繼續走。這似乎有點可疑，
我覺得他們不願繼續，可能另有原因。
就是豹神。我其實認為他們怕惹怒豹神。
根據當地傳說，打擾豹神可能帶來非常嚴重的後果。
所以他們不肯前進。我們獨自繼續。第二章：神像。第二天，
在茂密叢林中攀爬了好幾個小時後，我們終於到達一片平地。
這裡就是神廟所在嗎？傳說神廟由一座巨大的豹神像
守護，神像完全用藍色石頭造成。忽然，我們有了驚人的發現。
在綠葉和啡色泥土之間，有一種顏色格外突出：一大塊塊藍色石頭，
絕對不會認錯。接着，我們在周圍地面看到越來越多藍石。
就是這裡，失落的豹神像。我們小心清除植物和泥土時，
又有一個美妙驚喜：植物下面有一枚金幣。我們開始搜尋。
單是那一天，就挖出超過七十枚無價的金幣，散落在附近
各處。還有很多地方值得探索，我們發誓有一天會回來。
第三章：研究。下一步是把一些證據帶回我們在
倫敦的研究中心。部分歷史學家可能不同意把文物移走，但我們有兩個
很充分的理由。第一，我們需要仔細研究這些物件，
唯一能做到這點的地方是實驗室。因此我們把物件裝箱，
全部運回倫敦實驗室分析。第二個理由
對這次發現尤其重要：這裡隨時可能再發生地震，若真的發生，
遺址便可能被毀。我們知道必須把找到的物件帶到安全地方，
這樣即使地震再次襲擊，文物也不會失去。
好，以上是 Peter Dales 新書《豹神崛起》的節錄。
我能說什麼呢？全是胡說八道。問題實在太多，
不知從何說起。首先，也是最重要的，Peter 不應說自己
發現了神廟。他沒有發現，因為當地人早已知道它存在。
當地人知道神廟，因為他們的家族一直住在那裡。
不能因為有個歐洲人親自去看過，
就說以前沒有人知道。真是的，
他為什麼不停強調有那麼多金子？他以為會發生什麼事？
現在大家知道神廟在哪裡，任何人都可以去把物件拿走。
這對當地社區和歷史研究都會是災難。
Peter Dales 真應該記住，研究歷史物件的真正價值是什麼。
不是它們值多少錢，也不是用什麼材料造的。
重要的是人們怎樣在生活中使用這些東西。
例如，神廟為什麼有那麼多金幣？
這讓我們了解人們怎樣使用神廟？
如果找到這些問題的答案，我們便能更清楚
了解古人如何生活。任務四及卷三甲部完結。
你現在有三分鐘完成任務四的答案，並整理
所有其他答案。資料檔案第二頁。情境：你是 Nico Lin。`
};
export const questions={
1:{title:'World Watch Travel',instruction:'Julia 和 Mark 正在瀏覽 World Watch Travel 的網頁。聆聽對話，並在以下空格填上資料。第一項已作為例子提供。',blocks:[
'關於 World Watch Travel。欄目：項目／詳情。\n主要目標：提供環保歷險（例子）。\n國家：{{1}}。\n考察行程長度：{{2}}。\n團體：來自不同國家的{{3}}。\n價格：約{{4}}港元。\n主要活動：研究小型動物。','工作','設置{{5}}。\n檢查{{6}}和{{7}}。','{{8}} {{9}} {{10}} 小屋設施：選三項並加剔號。\nA 休息室\nB 溫習室\nC 廚房\nD 淋浴（有熱水）\nE 淋浴（只有冷水）\nF 廁所','2020 年夏季營地位置','每個空格填上一個英文字母，指出各營地的位置。','保護區內營地地圖，標示 A–G。指南針：N 北、E 東、S 南、W 西。圖示包括昆蟲、蝴蝶、獸醫設施、龜、山峰、老虎、猴子和鱷魚。','營地位置。欄目：營地／位置。\n藍色營地：{{11}}\n紅色營地：{{12}}\n綠色營地：{{13}}\n黃色營地：{{14}}\n各題選項：A、B、C、D、E、F、G。','World Watch Travel 的評論。欄目：評價／意見。\n負面評價：付錢{{15}}。\n正面評價：很棒的{{16}}。']},
2:{title:'海洋探索',instruction:'Jason 是紀錄片製作人，正在訪問 Anita Carter 博士，製作關於海洋探索的紀錄片。聆聽訪問，把資料填在以下空格。第一項已作為例子提供。',blocks:[
'研究地區：Alonso 海溝（例子）。\n研究開始時間：{{17}}。','{{18}} 他們為什麼決定探索這個地區？\nA 它接近海岸\nB 它是一個相對陌生、未充分了解的地區\nC 那裡有很多瀕危物種','Alonso 海溝深度圖。海平面為 0 米，垂直軸以米表示深度；圖中標示太平洋，以及 A、B、C、D 四個位置。','{{19}} 參看上圖，新的獅子魚品種在哪個位置發現？\nA／B／C／D','{{20}} {{21}} {{22}} Carter 博士描述了以下三種動物。選出這三種動物，按提及的先後填上 1、2、3，其餘圖片留空。\n選項：插圖 A、插圖 B、插圖 C、插圖 D、插圖 E、插圖 F。請按圖中外形與錄音配對。','獅子魚的資料。欄目：身體最堅硬的部分／功能。\n{{23}}／{{24}}\n{{25}}／{{26}}','把獅子魚帶到水面','{{27}} {{28}} 哪兩個條件在水面很難維持？選兩項並加剔號。\nA 黑暗\nB 高水壓\nC 大量氧氣\nD 水質\nE 低溫\nF 特別食物','{{29}} Carter 博士對研究獅子魚有什麼感受？\nA 心情矛盾，既有正面也有負面感受\nB 中立\nC 沮喪\nD 自豪']},
3:{title:'西伯利亞東北部考察',instruction:'Julia 和 Mark 正與導賞員在歷史博物館參觀展覽。聆聽討論，完成以下筆記。第一項已作為例子提供。',blocks:[
'「暗影號」（The Shadow）考察船圖片。','前往西伯利亞東北部考察','死亡船員人數：179（例子）。\n出發年份：{{30}}。','暗影號的科技設備：\n{{31}}\n{{32}}','罐頭食物的好處：{{33}}。\n娛樂類型：{{34}}。','{{35}} 出發前，船員感到……\nA 無聊\nB 興奮\nC 緊張\nD 有信心','{{36}} 罐頭食物的製造過程有什麼主要問題？\nA 罐子含危險金屬\nB 製造得太匆忙\nC 食材品質低劣\nD 由一家新公司製造','船隻被困在冰中{{37}}。','死亡原因。欄目：問題／詳情。\n飲食不良：缺乏{{38}}。\n饑餓：需要{{39}}。','2010 年發現船隻','暗影號的發現位置有什麼令人驚訝之處？\n{{40}}','誰發現這艘船？\n{{41}}','他怎樣知道應到哪裡尋找船隻？\n{{42}}']},
4:{title:'豹神像',instruction:'請聆聽介紹現代探險的播客《Modern Explorer》。歷史學家 Anna Connor 會介紹一本有聲書。播放部分內容後，她會發表意見。你毋須用完整句子作答。',blocks:[
'Peter Dales 的有聲書：《豹神崛起》。','第一章：穿越叢林','人們為什麼認為豹神比其他神更重要？\n{{43}}','Peter 為什麼認為野生動物不怕人？\n{{44}}','Peter 認為嚮導不願繼續前進的原因是什麼？\n{{45}}','第二章：神像','Peter 的團隊怎樣知道自己找到了豹神像？\n{{46}}','Peter 的團隊在神廟意外找到什麼物件？\n{{47}}','第三章：研究','Peter 的團隊為什麼把物件從神廟帶走？\n{{48}}\n{{49}}','Anna Connor 的意見','Anna 為什麼認為 Peter 不應說自己發現了神廟？\n{{50}}','Anna 認為這本有聲書會令其餘珍貴物件遭遇什麼情況？\n{{51}}','根據 Anna，研究歷史物件的真正意義是什麼？\n{{52}}']}
};
export const analysisRows=[
[1,'Brazil','Julia 讀到考察地點是 Brazilian rainforest，Mark 隨即確認 it’s in Brazil。題目 Country 問國家名稱，所以填 Brazil。\n中伏位：Brazilian 是形容詞「巴西的」，不能直接當國家名；rainforest 是地形環境，也不是國家。不要由後面不同國家的學生組成一團，誤以為考察會跨越多國。',"it's in Brazil",6],
[2,'six nights / 6 nights','網站說每趟行程 lasts for six nights，對方亦以六晚再問一次。因此行程長度填 six nights。\n中伏位：錄音明說 nights，不是 days，不宜自行換算成六天；summer 是可以預訂的季節，不是行程長度。題目 Expedition length 要時間長短，填數字時必須保留 nights 這個單位。','six nights',8],
[3,'eight to ten students / 8–10 students','每組由不同國家的八至十名學生組成。題目已提供 from different countries，因此填 eight to ten students。\n中伏位：八至十是範圍，不是八加十共十八人；也不是有八至十個國家。students 必須保留，清楚指出數字指人數。後面 Safety in numbers 是人多較安全的評論，不是另一個數字。','eight to ten students from different countries',9],
[4,'6,000 / six thousand','網站原價為七百五十美元，但題目明確要求港元。對話把它換算為大約六千港元，因此填 6,000。\n中伏位：750 是美元價格，不可直接填到 Hong Kong Dollars 前；題目已有 Around，毋須自行用當前匯率重新計算。這是按錄音資料作答，不是即時貨幣換算題。','around 6,000 Hong Kong dollars',12],
[5,'traps','工作清單先要求 set up traps，即設置捕捉動物的陷阱。題目已給 Set up，空格只須填 traps。\n中伏位：不是設置帳篷，學生後面住宿的是小屋；animals 是捕捉對象，不是 set up 的受詞。traps 用複數，與整項研究需要設置捕捉設備的說法一致，不要拼成 tracks。','you will set up traps',15],
[6,'weight','動物被捕獲後，要 check their weight and general health。第 6、7 題為兩項檢查，可按相反次序填，但必須包括體重和健康。\n中伏位：weight 是名詞「體重」，weigh 是動詞「稱重」；題目 Check 後列出被檢查的項目，應填 weight。不要把後面 how much they weigh 的動詞直接照搬。','check their weight and general health',18],
[7,'general health / health','另一項要檢查的是 general health，後句也重述 see if they’re healthy。因此可填 general health，即整體健康狀況。\n中伏位：health 是名詞，healthy 是形容詞，Check 後面本格需要名詞；也不是只查一種特定疾病，錄音沒有作此限制。兩格應分別記錄體重與健康，不要重複同一項。','check their weight and general health',18],
[8,'A — lounge','小屋三項設施的其中一項是 lounge，講者清楚說可以在那裡與同組的人相聚，因此選 A。第 8–10 題整組答案為 A、E、F，逐項顯示按選項順序排列。\n中伏位：study room 沒有被確認；不要把所有聽見的設施都勾選。廚房是詢問後得知沒有，而休息室以 but there is 明確確認存在。','there is a lounge',23],
[9,'E — shower (cold water only)','小屋有淋浴設備，但後面補充 there’s no hot water，所以要選只有冷水的淋浴 E，不能選有熱水的 D。這是整組 A、E、F 的第二項。\n中伏位：只聽到 shower 就立即勾選 D 容易出錯，必須等熱水條件補充。後面猜水溫可能夠暖，不代表有熱水供應；條件仍是 cold water only。',"there's no hot water",24],
[10,'F — toilet','錄音說 each lodge has a toilet at least and a shower，清楚確認每間小屋有廁所，所以整組設施答案的第三項是 F。\n中伏位：at least 表示至少有這些，不是說可能沒有廁所；也不應把最後猜測的食堂加入選項。第 8–10 題只選三項，完整組合為休息室、冷水淋浴和廁所。','each lodge has a toilet at least',21],
[11,'A','藍色營地是最北面的營地，也是考察起點，錄音再說地圖左上角。圖中 A 位於最上方偏左，附近有昆蟲圖示，符合新昆蟲的補充線索。\n中伏位：B 雖也偏北，但位置低於 A，不能只憑大概在左上區就選 B。先依 most northern 鎖定，再用 left 和昆蟲作交叉核對。','the most northern campsite',28],
[12,'C','紅色營地在地圖另一邊右方，附近有獸醫中心，也發現過新蝴蝶品種。圖中 C 同時鄰近聽診器和蝴蝶圖示，因此填 C。\n中伏位：F、G 也在右側，但沒有獸醫中心和蝴蝶這兩個標記；只聽 right 不足以決定。應把方位與具體設施、動物線索合併，而不是按顏色自行猜位置。',"there's a veterinary center here",31],
[13,'E','綠色營地位於地圖中央，並說經常可以看到龜。圖中 E 是中部、靠近龜圖示的營地，所以答案是 E。\n中伏位：地圖並非規則方形，單靠視覺估算幾何中心可能猶豫；turtles 是更具體的定位線索。D 靠左及山峰，F 靠右及老虎，都不符合這一營地的完整描述。',"It's right in the middle of the map",33],
[14,'G','黃色營地在東南方，對話接着提到猴子和鱷魚。指南針顯示東在右、南在下，圖中 G 位於右下方，附近正有這兩種動物，因此填 G。\n中伏位：F 也偏東南，但配的是老虎，不能只聽一個方位就停下。應用猴子與鱷魚確認 G；不喜歡鱷魚只是評論，不會改變營地位置。',"Yellow Camp. Over in the southeast",34],
[15,'to work for someone else','負面評論把這個行程形容為 paying to work for someone else，即付錢替別人工作。題目已寫 Paying，空格填 to work for someone else。\n中伏位：評論者原本以為會輕鬆，但實際覺得勞累；不要填 relaxing holiday，因為那是落空的期待。to work 是 Paying 後面的不定詞結構，不能只寫 work。','paying to work for someone else',39],
[16,'local food / delicious local food','正面評論說最好的地方是 delicious local food，並補充所有食物新鮮好吃。所以題目 Great 後填 local food。\n中伏位：廚房不存在、食堂只是兩人的推測，真正評論讚賞的是食物；不要把推測設施當答案。題目已有 Great，直接寫 local food 已足夠，也可保留 delicious 加強描述。','the delicious local food',41],
[17,'last spring','博士被問研究多久時，回答研究在去年春天開始，所以 When research started 填 last spring。下一句 about a year now 是已持續的時間。\n中伏位：題目問開始時點，不是研究長度；只寫 one year 回答的是另一種問題。也毋須用今天年份推算，last spring 的參照點是錄音情境，不是使用者現在的日期。','our research began last spring',7],
[18,'B — It is a relatively unknown area','主持人猜是否因為有瀕危物種，博士立即否定，說只是因為對該地區了解不多，所以選 B。接近海岸雖是真實背景，卻不是探索理由。\n中伏位：選擇題三項都在對話中出現，但關係不同；No 否定 C，even though 引出 A 這項讓步背景。真正理由由 simply because 帶出，是仍有很多未知之處。',"we don't know much about",9],
[19,'C','博士說新獅子魚在海平面下六千五百至七千五百米發現。圖中 C 約在七千米，符合範圍，所以選 C。\n中伏位：三千米是以前只能到達的深度，對應 B，並非新魚的發現處；D 約在八千多米，又超出所述範圍。這題要讀深度刻度，而不是一律選最深的點。','between 6,500 meters and 7,500 meters below sea level',17],
[20,'A — first animal (snailfish)','第一種動物是獅子魚：身體柔軟修長，頭後、身體前部有較大的鰭，圖中只見前面一組。這些特徵符合插圖 A，所以 A 填 1。\n中伏位：名稱有 snail，不代表背上有蝸牛殼；對話特意否認有殼，因此 C 不對。第 20–22 題按提及順序記錄 A、F、D，並非按圖片排列填滿六格。','this one here is the snailfish',20],
[21,'F — second animal (long-legged isopod)','第二種動物外形像蜘蛛，小小身體配八條長而纖幼的腿，與插圖 F 相符，所以 F 填 2。錄音把它稱為 long-legged isopod。\n中伏位：不要只憑有很多肢體便選 E，E 的肢體有明顯羽毛狀結構，不符合 very thin legs 的描述。需同時檢查身體大小、腿的形狀和數量，並保持第二個次序。','eight long, very thin legs',27],
[22,'D — third animal (sea pig)','第三種是海豬，身體下有短腿，圖中上方另伸出兩條腿。插圖 D 符合這種身形，所以 D 填 3。其餘圖片不應填次序。\n中伏位：講者先說通常有四條上方腿，再更正眼前這隻只有兩條，應按 this one 配圖；也明說頂上的不是觸角。一般特徵與當前圖片的特例要分清。','This one has just two',32],
[23,'teeth','博士說最硬的兩部分是 teeth 和 ear bones。表格第一列按錄音先後填 teeth，下一格接它的功能。\n中伏位：主持人原以為脊骨最硬，但那是猜測，不是博士答案；spines 不能填入。teeth 是 tooth 的不規則複數，不寫 tooths。兩列若互換，功能也必須一起換，不能把耳骨的平衡功能配給牙齒。','their teeth and ear bones are the hardest structures',37],
[24,'scare off other fish','牙齒的功能是 scare off other fish，即嚇退其他魚。博士直接在被問牙齒後解釋用途，所以與 teeth 那列配對。\n中伏位：不要憑常識填 eating food，雖然一般牙齒可能用來進食，但這題要按錄音所述功能。scare off 是「嚇走」，不是吸引；other fish 是受影響對象，最好一併保留。','scare off other fish',40],
[25,'ear bones','第二個最堅硬部分是 ear bones，即耳骨，博士後面會解釋它跟平衡有關。答案要寫完整名詞片語，而不是只寫 ears。\n中伏位：spines 是主持人的錯誤猜測；hard skin 也不對，身體外皮反而被形容像啫喱。ear bones 用複數，與錄音一致；若調換兩列，仍須保持身體部位與功能正確配對。','their teeth and ear bones are the hardest structures',37],
[26,'balance / keep upright and swim in the right direction','耳骨的用途是保持平衡，博士說 for balance，後面補充讓魚在水裡保持正確姿勢及游泳方向。所以填 balance 已能概括。\n中伏位：雖然名為耳骨，錄音並不是說用來聽聲音；不要憑器官名稱自行回答 hearing。這一列是 ear bones 的功能，scare off other fish 則屬上一列牙齒。','they need ear bones for balance',42],
[27,'B — high water pressure','獅子魚在水面难以存活，因為很難維持深海的高水壓和低溫。按選項順序，第 27、28 題組合為 B、E。\n中伏位：黑暗和合適食物反而被說成 easy enough，不能選 A 或 F。這題問難以維持的條件，不是所有生存需求；high water pressure 對應帶到水面後 pressure too low 的問題。','very high pressure',51],
[28,'E — low temperatures','另一個難維持的條件是非常低的溫度，因為魚到水面後太暖，所以選 E，與高水壓 B 構成完整兩項。\n中伏位：too warm 描述水面不合適的狀態，題目選項則問魚所需條件，因此選 low temperatures，而不是自行找高溫。氧氣和水質沒有被列為這段的兩個困難，不能補上。','they need very cold temperatures',51],
[29,'A — Mixed feelings','博士一方面說在自然棲息地研究牠們非常興奮，另一方面覺得牠們到不了水面很可惜，正負兩種感受並存，所以選 A。\n中伏位：Frustrated 是主持人的提問，不是博士單一表態；只聽 unfortunate 會漏掉 exciting。Proud 也沒有充分依據，整段重點是興奮與遺憾的對比，而不是自豪或中立。',"it's incredibly exciting",54],
[30,'1821','現有錄音稿明說船在 1821 年啟航，因此參考答案按明述年份填 1821。需留意同句把它稱為 1819 年之後三年，這個間隔與年份不一致，應視為原資料待核對之處。\n中伏位：1819 是開始籌備，不是啟航年份；不能只做 1819＋3 而擅自改成 1822。本答案保留明述資料並公開說明矛盾，不把推算當確定事實。','began its journey three years later in 1821',9],
[31,'a steam engine','暗影號主要科技是一部蒸汽機，本來為火車提供動力，因此船即使無風也能航行。第 31、32 題可互換，但須寫蒸汽機和暖氣系統兩項。\n中伏位：trains 只是引擎原來用途，不是船上有火車；這題問設備，不是「航行得快」的好處。填 a steam engine 最直接，保留 steam 區別動力類型。','a steam engine',11],
[32,'a special heating system / a steam-powered heating system','第二項科技是船內特殊暖氣系統，也由蒸汽供能，讓船員在嚴寒中保暖。因此答案是 heating system，可加 steam-powered。\n中伏位：不要把兩項都寫 steam engine，它們用途不同：引擎推動船隻，暖氣系統調節船內溫度。題目問 technological features，應填設備名稱，不只寫 warm。','a special heating system',16],
[33,'saved space on the ship','罐頭食物的好處是節省船上空間。導賞員承認重複吃可能沉悶，但用 but 指出它不佔太多地方，方便供應大量船員。\n中伏位：不要憑一般常識填長期保鮮，這段明確說的是 save space；後來罐頭品質差亦不是此格所問優點。答 saved space 可同時保留動作和船上儲存需求。','save space on the ship',22],
[34,'putting on a show once a month / monthly shows','娛樂方式是船員每月演出一次，後面說他們會當演員、歌手，令大家開心並有事可做。因此可寫 monthly shows。\n中伏位：watching TV shows 只是用今天的生活作比喻，當時船員不是看電視；也不只是望冰山。題目問娛樂類型，show 是核心，加入 once a month 能完整呈現所述安排。','the crew would put on a show once a month',25],
[35,'D — confident','船員認為沒什麼好擔心，覺得準備充分、所需物資齊備，所以出發前有信心，選 D。這從 thought there was nothing to worry about 可推得。\n中伏位：nervous 是參觀者想像自己會有的感受，不是船員心情；excited 沒有被用來概括他們的態度。要分辨「我們覺得可怕」與「他們相信準備好」的主語對比。','They believed they were well prepared for the journey',30],
[36,'C — Low-quality ingredients','罐頭的真正問題是食材標準不高，蔬菜腐爛、肉不適合人吃，所以選 C。公司雖只有兩個月，但經驗豐富，時間本身不是問題。\n中伏位：危險金屬是過去專家的舊看法，後面明說不正確；公司也不是新成立。四個選項中多項被提及，但只有低質食材獲確認是原因。',"wasn't of a very high standard",36],
[37,'three winters / 3 winters','導賞員說大部分專家相信船被困三個冬天，之後再次重複 three winters。因此題目 trapped in the ice for 後填 three winters。\n中伏位：不是三個月，也不是資料確定精確日期；錄音以 most experts believe 表示重建推斷。填答案應保留 winters 這個時間單位，不能只寫 3，也不要由年份另行估算。','three winters',42],
[38,'vitamins','飲食不良的一項後果，是得不到足夠 vitamins。題目已給 Not enough，空格直接填 vitamins。\n中伏位：calories 是下一列饑餓的問題，兩者相鄰但作用不同；vitamins 指維他命，calories 指能量。高品質肉不足是導賞員用來解釋維他命不足的原因，不是這一格最直接的營養項目。',"didn't get enough vitamins",45],
[39,'a huge number of calories / enough calories','在嚴寒中人體需要大量卡路里，船員被困太久又攝取不足，結果餓死。所以這列 Needed 後填 a huge number of calories 或 enough calories。\n中伏位：前一列 vitamins 是飲食品質問題，這裡談寒冷環境下的能量需求；不能把兩種營養概念混用。只寫 food 過於籠統，錄音反覆強調 calories。','the human body needs a huge number of calories',47],
[40,'the area had almost the same name as the ship: Shadow Bay','驚訝之處是發現地點叫 Shadow Bay，幾乎與船名 The Shadow 一樣。題目問位置有何奇特，所以應說兩者名字相似。\n中伏位：2010 是發現年份，不是令人驚訝的地點特點；只填 Shadow Bay 雖列出位置，仍未說明巧合。答案加上 same name as the ship，便能回應 What was surprising。','area was almost the same as that of the ship',51],
[41,'a local fisherman','故事說一位 local fisherman 夢見船，前往查看後發現舊船，再通知當局。所以發現者是一名當地漁夫。\n中伏位：authorities 是之後確認船隻身份的機構，不是首先找到它的人；Captain James Merlin 是當年領隊，也不是現代發現者。題目 Who 問身分，無須猜一個錄音沒有提供的名字。','a local fisherman',53],
[42,'he saw the location of the ship in a dream','漁夫夢見船在冰上暴風雪中，因不安而去查看，最後在夢中同一位置找到船。因此他知道去哪裡，是因為夢中見過位置。\n中伏位：這是錄音以 The story goes 引述的故事，不代表可據此證明夢能預知；作答只須概括故事內容。不是根據地圖或官方搜尋資料，這些線索都沒有被提及。',"in exactly the same spot where he'd seen it in his dream",56],
[43,'the leopard was the most powerful animal in the jungle','Peter 說當地祖先極尊重豹神，因為豹是叢林最強大的動物。因此答案要把對神的尊崇連到豹在自然界的力量。\n中伏位：不是因為神像用金造，神像其實說是藍石；金幣到後面才發現。題目問 why，單寫 Leopard God 沒有解釋，要保留 most powerful animal 的最高級意思。','powerful animal in the jungle',12],
[44,'the animals had never seen humans before','Peter 見猴子跟隨、小鹿走出來看，推斷牠們從未見過人，所以不知道要害怕。答案是 never seen humans before。\n中伏位：這是 Peter 的推測，不能寫成已被科學證實；不是說動物受過訓練或知道他們友善。never 很重要，若只說看見人類，便失去「未有經驗所以不怕」的因果。','seen humans before',15],
[45,'they were afraid of making the Leopard God angry','嚮導聲稱地震令區域危險，但 Peter 認為另有原因：怕惹怒豹神。所以題目問 Peter 的想法，答案應填這個推測。\n中伏位：recent earthquake 是嚮導提出的理由，不是 Peter 最終相信的解釋。題幹人物立場是關鍵；不要把先聽見、較具體的地震理由直接當答案，須聽後面的 I actually think。','afraid of making the Leopard God angry',21],
[46,'they found large pieces of blue stone matching the description of the statue','傳說神像完全由藍石造成，團隊到達後在綠葉和泥土間看見大量藍色石塊，因此認為找到豹神像。答案要指出藍石與傳說材質吻合。\n中伏位：不是看見完整金像，金幣是稍後的意外發現；也不是任何石頭都可作證。保留 blue stone，才能表達識別神像的特定線索，而非只說 found stones。','The large pieces of blue stone',27],
[47,'more than 70 gold coins / gold coins','清除植物和泥土時，團隊意外發現金幣，當天就找到超過七十枚。因此答案是 gold coins，可補 more than 70。\n中伏位：問的是 unexpected items，原本搜尋的藍石神像不算意外物件；也不是金條或金製神像。數量是超過七十，而非剛好七十；若寫數字，須保留 more than。','more than 70 priceless gold coins',31],
[48,'to study and analyse the objects carefully in their laboratory','Peter 第一個移走文物的理由，是要仔細研究，而他認為只能在實驗室進行，因此把物件送回倫敦作分析。答案應包括研究或分析用途。\n中伏位：London 是送往的地點，不是理由本身；不是為出售或私人收藏，這些不是 Peter 在此提供的解釋。第 48、49 題可互換，但一點是研究，一點是防災保護。','we needed to study the items carefully',35],
[49,'to protect the objects from a possible future earthquake','第二個理由是該區可能再地震，遺址及物件有被毀的風險，所以把它們移往安全地方。答案要連結保護文物與未來地震。\n中伏位：這不是說地震已毀掉剛找到的金幣；could 和 if 表示可能性。只寫 safety 太概括，補上 earthquake 才能指出威脅，也可避免與前面嚮導擔心自身安全混淆。',"so that they wouldn't be lost if an earthquake struck the area again",40],
[50,'local people already knew about the temple','Anna 認為 Peter 不能自稱發現神廟，因為當地人早已知道它存在，家族也世代住在附近。歐洲人首次親自看到不等於此前無人知情。\n中伏位：她不是說神廟不存在，也不是質疑團隊找到藍石；批評的是把當地知識抹去的「發現」說法。答案要寫 already knew，而非只是 local people lived nearby。','the local people already knew about it',44],
[51,'other people may go there and take / steal the remaining valuable objects','Anna 擔心有聲書不斷強調黃金、又透露位置，會讓其他人前往取走剩下的珍貴文物，破壞社區和歷史研究。\n中伏位：不是預言下一次地震，那是 Peter 的移走理由；這題要指出出版內容引起的人為損失。anybody can go there and take 表達風險，答案宜用 may 或 could，不要聲稱已發生盜竊。','anybody can go there and take the objects',49],
[52,'understand how people used the objects in their lives / how people lived in the past','Anna 說研究價值不在價格或材料，而在人們怎樣在生活中使用物件，藉此了解古人生活。因此答案是理解過去人類的生活與用途。\n中伏位：gold 的昂貴和材質都被 not 排除，不能答估值或尋寶。最後金幣為何在廟內的問題，是用途研究的例子，不是要求再數一次金幣；重點是歷史理解。',"It's how people use these things in their lives",53]
];

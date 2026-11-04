/*
 * Audited-v6 manual ledger for Data File · 逐句判讀.
 *
 * IMPORTANT: `type` and every string in `analysis` are authored text from
 * 2023_B2_Integrated_Skills_Benchmark_Essays_Final_Audited_2026-11-03_v6.pdf.
 * Do not paraphrase these fields. Supplemental evidence remains available in
 * the reader, but is explicitly labelled by provenance elsewhere.
 */
const manualVerbatim23 = [
  // Big Cheese Celebrity Food Gossip article · PDF pages 28–35
  {type:'類型：5 提示 + 6 噪音',analysis:[
    '這些標題有兩層作用：',
    '有用的一層：它們告訴你社會輿論的主軸是 flood / disaster / scandal，所以 Task 1 的公告一定要回應這場公關風波；',
    '沒用的一層：它們是 tabloid 式誇張語氣，不能直接搬進公司網站公告。',
    '所以它們是背景線索，不是可直接套用的正文句。'
  ],quote:'Puddle Starts a Flood! / William Puddle’s disastrous cooking video goes viral / Teen NetChef TV star’s latest video did not go swimmingly / Can his career survive the soaking?'},
  {type:'類型：5 提示',analysis:[
    '交代輿論背景。',
    '說明 Task 1 為甚麼要寫公告：因為事情已經 viral。',
    '但沒有分清哪些是真的 mistake、哪些是被誤解，所以只是背景，不是最後要用的精準內容點。'
  ]},
  {type:'類型：1 Task 1 直接可用',analysis:[
    '這裡講的是 flood 事件本身。',
    '根據 boss letter，Task 1 要「acknowledge and explain William’s mistake」。',
    '這段指出那個真錯誤是甚麼：他真的讓廚房水浸了。',
    '之後 chat 再補出原因：忘記關 manual tap。',
    '所以這一段是 Task 1 的承認部分，不是誤會部分。'
  ]},
  {type:'類型：1 Task 1 直接可用',analysis:[
    '這段是 Task 1 必須處理的第二個指控。',
    '它在 article 中被寫成事實，但 chat 會推翻：他有清潔，只是那些片段被剪掉了。',
    '所以這段在 Task 1 點出公眾誤會的內容。'
  ]},
  {type:'類型：5 提示',analysis:[
    '這些句子不是 Task 1 最終要寫進公告的點。',
    '作用：公眾批評的力度很強。',
    '所以公告的語氣不能太輕鬆，必須較認真、要有回應性',
    '但因為這是 rival show 的人說的，而且語氣帶攻擊性，所以不能原樣照搬。'
  ]},
  {type:'類型：1 Task 1 直接可用',analysis:[
    '這一段包含兩個要澄清的誤會：',
    '他看來在哭；',
    '文章聲稱他用了同一條茶巾。',
    '後面 chat 和錄音會分別澄清：',
    '他眼睛泛淚是因為切洋蔥；',
    '擦面的是乾淨茶巾；他有 150 條一樣的茶巾。',
    '所以這段是 Task 1 很核心的誤會清單來源。'
  ]},
  {type:'類型：5 提示',analysis:[
    '這句不是你最終要寫的內容。',
    '但它幫你看出「crying」這個誤會被外界如何解讀：被升級成情緒失控。',
    '這會提醒你在 Task 1 內，澄清時最好不要只寫 "he was crying because of onions"，要寫得更完整：he was not upset; he was chopping onions。'
  ]},
  {type:'類型：5 提示 + 6 噪音',analysis:[
    '前句說 Puddle 和 Dante 未能聯絡回應；這解釋公司為何需要發公告。',
    '後句把新節目寫成傳聞，並誇張推測 William 的處境。後來資料才確認 Viewer’s Choice 的安排。',
    '前半可作 Task 1 背景；後半不要搬進三項寫作答案。'
  ]},

  // Draft storyboard · PDF pages 36–44
  {type:'類型：5 提示',analysis:[
    '這是 Dante 的修改方向。',
    '它直接告訴你：Task 3 其中一個核心，是要講清楚 viewers choose what。',
    '之後錄音檔補出：viewers choose the ingredients。'
  ]},
  {type:'類型：3 Task 3 直接可用 + 5 提示',analysis:[
    '"Viewer’s Choice" 當然是 Task 3 直接可用。',
    '"Ground-breaking TV!" 也是可用方向，但未完成。',
    '真正重要的是旁邊評語：它提醒你不能只說節目很厲害，必須說出具體原因。',
    '後面錄音檔會補出答案：it is fully interactive and totally live。'
  ]},
  {type:'類型：5 提示（但已過時）',analysis:[
    '這段和 Task 3 有關，但不能直接用。',
    '因為 boss letter 已提醒 storyboard 過時，而 William 的 chat 又明講：',
    'forget the mystery guest idea',
    '改成 Mary Steward as co-star',
    '所以它的價值不在於答案本身，而在於提示你：這裡是更新點。'
  ]},
  {type:'類型：5 提示（選擇環節）',analysis:[
    '這個 panel 指出節目設有「選擇」環節，但單靠標題還未說明由誰選、選甚麼。',
    '錄音補出觀眾選食材；Dante 的 email 再補出第一集選蘋果或藍莓餡料。',
    '寫講稿時交代完整機制，不只寫 “The choices”。'
  ]},
  {type:'類型：3 Task 3 直接可用 + 5 提示',analysis:[
    '"Fruit Pie" 是 Task 3 直接可用。',
    '旁邊 comment 是提示你：還要再找出主要選項是甚麼。',
    'Dante 的 email 之後補出：apple or blueberry filling。'
  ]},
  {type:'類型：3 Task 3 可用 + 5 舊版線索',analysis:[
    '觀眾投票這個環節仍然有效。',
    'William 和 Archie 的 chat 已取消 voting hotline，改用 Teen NetChef TV app 免費投票。',
    '講稿保留投票，並改寫為 “vote for free through the Teen NetChef TV app”。'
  ]},
  {type:'類型：5 提示（流程標題）',analysis:[
    '“The finished dish” 指出節目會展示完成菜式；單看標題，仍未交代獎品屬誰。',
    '連同下一格的 “one lucky voter” 合讀，便可寫出：一名投票者贏得完成菜式。'
  ]},
  {type:'類型：3 Task 3 直接可用',analysis:[
    '後來的更新沒有取消「幸運投票者」這部分。',
    '所以這一格仍然有效。',
    'Task 3 可直接轉化成：one lucky voter will win the finished dish / Big Prize。'
  ]},
  {type:'類型：3 Task 3 直接可用 + 5 提示',analysis:[
    '送菜到家這個概念本身仍然有效。',
    '但 company 還未填，所以這是待更新空格。',
    'Dante 的 email 補出最終答案：FlyingFood using a drone。'
  ]},

  // Chat between William Puddle and Archie Li · PDF pages 45–51
  {type:'類型：1 Task 1 直接可用',analysis:[
    '這組對話是 Task 1 的核心真相。',
    '它精準回答兩件事：',
    '1. 真正錯誤是甚麼：he forgot to turn off the tap；',
    '2. 為甚麼發生：automatic tap recently switched to manual one。',
    '這正好補齊 article 只講現象、不講原因的缺口。'
  ]},
  {type:'類型：5 提示',analysis:[
    '前半句不是 Task 1 重點，因為公司公告不會用「我以為大家會覺得好笑」來當主要 defence。',
    '後半句則是 Task 3 的過渡提示：William 的事件會影響新節目。',
    '所以它主要是情境連接句，不是正文核心。'
  ]},
  {type:'類型：1 Task 1 直接可用',analysis:[
    '這段回應 article 指 William 處理生雞肉後沒有洗手的指控。',
    'William 說影片太長，清潔片段因而被剪走；他的原話是 “I cut out the parts where I cleaned everything!”。',
    '官方內容分點確認洗手畫面被剪走。公告可寫明：William 有洗手，相關畫面在剪輯時被刪去。',
    '這樣便交代了觀眾產生誤會的原因，也回應了食物安全疑慮。'
  ]},
  {type:'類型：1 Task 1 直接可用',analysis:[
    '這裡直接澄清了第三項指控。',
    '真正可用的點有兩個：',
    '1. he used a clean tea towel',
    '2. all the tea towels look the same / he has 150 of the same kind',
    '"kitchen tour video" 本身不是最終公告要寫的重點，因為公眾未必看過；它只是解釋 Archie 為何知道這件事。'
  ]},
  {type:'類型：5 提示',analysis:[
    '這句不是公告內容。',
    '但它非常重要，因為它講出 Task 1 的寫作理由：',
    '公眾不知道完整背景；',
    '所以公司要主動補充背景。',
    '這句也告訴你：Task 1 的定位是 supportive clarification，不是冷冰冰的事故報告。'
  ]},
  {type:'類型：3 Task 3 直接可用',analysis:[
    '這一段是 Task 3 的關鍵更新。',
    '原 storyboard 設定：每集有一位不同的 mystery guest。',
    'William 在聊天中說 Mary Steward 想擔任 co-star；Archie 同意改動，並表示確認後要把她寫進宣傳片。',
    '此時仍待 Mary 正式確認；Dante 後來的 email 已確認她參演。',
    '寫 Task 3 講稿時，介紹 Mary 是 William 的 co-star，刪去「每集神秘嘉賓」的舊設定。'
  ],quote:'William: Thank you so much! Now let me pay you back: I have some news about the new show that I think might cheer up Dante. / Archie: Go on. / William: So, we planned to have a different mystery guest each week, right? Well, Mary Steward just called. She says she supports me, she wants to help and she wants to be my co-star! / Archie: Mary Steward? The Queen of TV Cooking? As a co-star?! Well, she just might be able to save you! OK, let’s go with her as the co-star and forget the mystery guest idea. If she confirms soon, we absolutely must include this in the promotion video.'},
  {type:'類型：3 Task 3 直接可用',analysis:[
    '這裡同時出現舊資料和新資料。',
    '舊資料是 William 口中的 voting hotline。',
    '新資料是 Archie 的更正：',
    'vote for free',
    'through the Teen NetChef TV app',
    'hotline cancelled',
    '因為 Archie 這句是更正句，所以 Task 3 一定要採用 Archie 的版本。'
  ]},

  // Dante's weekly email · PDF pages 52–58
  {type:'類型：5 提示 + 6 噪音',analysis:[
    '這是 email 開場。',
    '"Live, Study, Cook" 本身對三個寫作任務不直接有用，所以屬背景多於內容。'
  ]},
  {type:'類型：2 Task 2 直接可用',analysis:[
    '這是 Task 2 的選課標準之一。',
    '它說明：',
    '有兩個 urgent training areas',
    '對象是 all staff',
    '這會影響你之後的課程篩選：',
    '只適合管理層或只適合戶外廚師的，不是最佳答案',
    '能給全體員工的課會更有力。'
  ]},
  {type:'類型：2 Task 2 直接可用',analysis:[
    '這是 Task 2 的第二個硬條件。',
    '它直接告訴你：推薦的 food hygiene course 必須HAB approved。',
    '因此它會變成篩選鍵：',
    'The Chef ’s Special 可留；',
    'Food Hygiene Basics 要淘汰，因為之後資料顯示 HAB 有問題。'
  ]},
  {type:'類型：2 Task 2 直接可用',analysis:[
    '這不是選課標準，寫電郵時可用的 benefit。',
    'Boss letter 要你解釋「how their work will benefit from each one」。',
    '除了各課程的實際技能外，這裡提供了公司層面的好處：',
    'training counts towards ARTs',
    'looks good on appraisal',
    '所以這是 Task 2 很高價值的附加好處。'
  ]},
  {type:'類型：3 Task 3 直接可用',analysis:[
    '這句把 chat 中的「if she confirms soon」變成已確認。',
    '所以它是 Mary Steward 參與節目的最終版本。',
    'Task 3 應用這個版本，不應再寫成未確定。'
  ]},
  {type:'類型：3 Task 3 直接可用',analysis:[
    '這句把 storyboard 裡未填的 delivery company 補齊。',
    '其中真正要用的內容是：',
    'FlyingFood',
    'using a drone',
    '"Cutting edge technology!" 也可作宣傳語氣，但最好改寫，不要原句照抄。'
  ]},
  {type:'類型：3 Task 3 直接可用',analysis:[
    '這句直接回答 storyboard 上留白的位置。',
    '而且 Dante 明說：should mention this in promotional materials。',
    '所以這是 Task 3 必寫點。'
  ]},

  // Corporate Training Intranet · PDF pages 59–68
  {type:'類型：2 Task 2 直接可用',analysis:[
    '這一行交代課程提供者是 Pinafore Solutions。',
    '推薦 Hazard Awareness 時，把課程名稱和提供者寫在一起，方便員工辨認課程。',
    '但名稱本身不是選課理由；仍要看下列課程內容、適用對象和評語，解釋它如何幫助員工。'
  ]},
  {type:'類型：5 提示（Task 2 的淘汰線索）',analysis:[
    '表面看，這課跟 fire safety 很吻合，似乎應該入選。',
    '但細看內容，重點是：',
    'develop and manage your staff',
    'training fire marshals',
    'emergency routes',
    '這些都偏向管理層 / 較高層級安全管理。',
    '再和 reviews 對讀，就會發現它其實不適合 all staff。',
    '所以用來幫你淘汰的候選課。'
  ]},
  {type:'類型：2 Task 2 直接可用',analysis:[
    '這課和錄音檔裡的 fire problem / staff didn’t know what to do 非常吻合。',
    '真正可抽出的工作好處是：',
    'recognise fire hazards',
    'use a fire extinguisher',
    'keep fire exits clear',
    'keep everyone safe',
    '這些都是可直接寫進推薦電郵的實際功能。'
  ]},
  {type:'類型：5 提示（Task 2 的淘汰線索）',analysis:[
    '課程內容本身其實不差，和 food hygiene 有關。',
    '但最後一句 AFH approval pending 很致命。',
    '因為 Dante email 已定下規則：food hygiene trainers 必須 HAB approved。',
    '這裡不但不是 HAB，還只是 AFH pending。',
    '所以這課的功能不是用來最後推薦，用來被排除。'
  ]},
  {type:'類型：2 Task 2 直接可用',analysis:[
    '這組資料指出課程提供者是 The Grill Gurus；推薦 The Chef’s Special 時可一併寫出。',
    '所有導師均獲 HAB 認可，符合 Dante 電郵所述的食品衞生培訓條件。',
    '再用課程內容說明員工可學到防止交叉污染和安全烹調溫度。'
  ]},
  {type:'類型：2 Task 2 直接可用',analysis:[
    '這是 food hygiene 類裡最強的候選課。',
    '因為它直接對應工作需要：',
    'avoid cross-contamination',
    'safe cooking temperatures',
    '這些也正好回應 William 影片風波中的 food hygiene 敏感點',
    '再加上 provider 已寫 HAB approved'
  ]},
  {type:'類型：5 提示（Task 2 的淘汰線索）',analysis:[
    '它不是完全無關，因為也有 fire safety。',
    '但它的語境很明顯偏向：',
    'alfresco cooking',
    'campfire',
    '戶外場景',
    '而公司目前最急的是 kitchen / private kitchen / staff safety 問題，不是海邊燒烤。',
    '所以它屬於相關但不是最適合的陪跑課。'
  ]},
  {type:'類型：2 Task 2 直接可用 + 5 提示',analysis:[
    'PR Productions 是 Be Your Best! 的課程提供者；推薦時連同課程名稱寫出。',
    '宣傳口號不用照搬；課程詳情中的清楚表達，才可對應錄音提出的網上溝通需要。'
  ]},
  {type:'類型：2 Task 2 直接可用 + 4 語義相關',analysis:[
    '真正有用的核心只有第一句：',
    'only saying what you mean and meaning what you say',
    '這和錄音檔裡的需求：',
    'behaving properly online',
    'people don’t misinterpret what you’re saying',
    'how not to offend people',
    '是語義上完全對得上的。',
    '所以這課是 social media training 的正解',
    '後面那些 social media angel / KOL / yoga mums 等，主要是宣傳味，不是推薦電郵的主體。'
  ]},
  {type:'類型：5 提示（淘汰線索）',analysis:[
    'Maximise My Money 主打品牌變現和營利，與錄音提出的網上言行、避免誤解及冒犯較不相符。',
    '三選一時保留 Be Your Best!；正式電郵集中介紹入選課程。'
  ]},

  // Previous participants' reviews · PDF pages 69–76
  {type:'類型：5 提示（Task 2 的淘汰線索）',analysis:[
    '這句幾乎是致命證據。',
    '因為 Dante email 要求 HAB approved',
    '這裡 reviews 明說 lost their HAB approval',
    '所以 Food Hygiene Basics 雖然內容看似合適，但制度上不符合公司要求',
    '這是非常典型的 DSE 篩選陷阱：表面合題，實際不合條件'
  ]},
  {type:'類型：5 提示',analysis:[
    '這些評語不是完全沒用。',
    '它告訴你 Food Hygiene Basics 內容不差。',
    '但因為 HAB 問題已經足以把它淘汰，所以這些正評不能救回它',
    '它們的功能只是讓這個 distractor 更像正確答案。'
  ]},
  {type:'類型：4 語義相關／補充佐證',analysis:[
    '學員評語稱課程有實用食安貼士，亦提及專業資格；這些是參加者的經驗。',
    '寫電郵時可借「食安貼士」補充工作好處；主要介紹仍應用課程資料中的交叉污染與安全溫度。'
  ]},
  {type:'類型：4 語義相關／補充佐證',analysis:[
    '一位參加者認為 Hazard Awareness 對廚師以外的員工也有用，支持向全體員工推薦。',
    '電郵可把課程的滅火筒、火警風險和走火通道內容，連到員工的工作安全。'
  ]},
  {type:'類型：5 提示（Task 2 的淘汰線索）',analysis:[
    '這課聚焦 beach / open-air fire；評語顯示室內廚房員工未必用得上。',
    'Task 2 要選三課。Hazard Awareness 教火警風險、滅火筒和逃生通道，更切合公司現時的防火培訓需要。',
    '因此淘汰 The Fire Chef’s Manual；正式電郵集中介紹入選的三課，毋須提及落選課程。'
  ]},
  {type:'類型：5 提示（淘汰線索）',analysis:[
    '一位學員認為 Advanced Fire Safety 偏重管理層；另一位質疑 25 小時網上講座的效益。',
    'Dante 要向全體員工推課；因此選較普遍適用的 Hazard Awareness。',
    '正式電郵介紹入選課程的實際技能，無須詳述落選課程的評語。'
  ]},
  {type:'類型：4 語義相關／補充佐證',analysis:[
    '一位兼任 PR 的學員說，Be Your Best! 改善了她在工作會議中的溝通。',
    '這個經驗可補充課程的工作用途；主要論據仍是課程教清楚表達，對應錄音中的網上溝通需要。'
  ]},
  {type:'類型：5 提示（淘汰線索）',analysis:[
    '評語讚賞 Maximise My Money 的品牌、盈利、文字和視覺技巧。',
    '本次培訓要處理安全、食物衞生和清楚溝通；這課偏向品牌變現，故不列入三項推薦。'
  ]}
];

if(manualBaseRows23.length!==49 || manualVerbatim23.length!==49){
  throw Error(`2023 B2 verbatim ledger mismatch: ${manualBaseRows23.length} rows / ${manualVerbatim23.length} records`);
}

const manualPdfPages23=[
  28,29,30,31,32,33,34,35,
  36,37,38,39,40,41,42,42,43,
  44,45,46,47,48,50,51,
  52,53,54,55,56,57,58,
  59,60,61,62,63,64,65,66,67,68,
  69,70,71,72,73,74,75,76
];
manualBaseRows23.forEach((row,index)=>{
  const record=manualVerbatim23[index];
  row.legacyQuote=row.originalQuote??row.q;
  row.manualId=`manual-p${manualPdfPages23[index]}-u${index+1}`;
  row.manualPdfPage=manualPdfPages23[index];
  row.manualPdfLabel=index===22?'49–50':String(manualPdfPages23[index]);
  row.origin='manual';
  row.manualType=record.type;
  row.manualAnalysis=record.analysis.slice();
  row.manualQuote=record.quote||row.q;
  row.a=record.analysis.join('\n');
});

// The authored manual discussed two consecutive sentences in one unit. Preserve
// that wording verbatim on the first row, but enforce one primary runtime type
// per sentence so the UI never presents a contradictory Type 5 + Type 6 badge.
const contactHint23=rows.find(row=>row.stage===3&&row.q.startsWith('Neither Puddle, nor the director'));
const rumourNoiseQuote23='With rumours of a new show coming soon, Puddle is surely in hot water after this latest fiasco!';
if(contactHint23&&!rows.some(row=>row.stage===3&&row.q===rumourNoiseQuote23)){
  const at=rows.indexOf(contactHint23);
  rows.splice(at+1,0,{
    stage:3,p:contactHint23.p,leaf:contactHint23.leaf,t:6,topic:contactHint23.topic,
    q:rumourNoiseQuote23,manualQuote:rumourNoiseQuote23,
    a:contactHint23.manualAnalysis.slice(1).join('\n'),
    manualAnalysis:contactHint23.manualAnalysis.slice(1),manualType:'類型：6 噪音',
    manualId:contactHint23.manualId+'-sentence-2',manualPdfPage:contactHint23.manualPdfPage,
    manualPdfLabel:contactHint23.manualPdfLabel,origin:'manual',state:'CURRENT'
  });
}

for(const row of rows.filter(row=>row.stage===3&&!row.origin))row.origin='evidence';


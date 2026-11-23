(() => {
  'use strict';

  const sourceRows = window.EDMUND_DSE_LISTENING_2016_TRANSCRIPT?.partB || [];
  const properNameCorrections = Object.freeze({
    'Indi Wong': 'Indy Wong',
    'Lara Gao': 'Lara Gau',
    'Chang Yi Tak': 'Chang Yee Tak'
  });
  const normalizeNames = text => Object.entries(properNameCorrections)
    .reduce((copy, [from, to]) => copy.replaceAll(from, to), String(text || ''));

  const fields = [
    {
      id: '3-1', slug: 'museum-directions',
      title: 'Social History Museum (and directions)',
      titleZh: '社會歷史博物館（包括路線）',
      selector: 'textarea[data-note="3-1"]',
      headingSelector: '#page-3 .notes-form-body > h3:nth-of-type(1)',
      classification: 'listening', task: null,
      help: '這欄是完整聆聽筆記的一部分，但三項 B2 寫作均沒有要求介紹博物館或路線，因此不收入 A／B／C 證據庫。',
      transcriptStart: 8, transcriptEnd: 33
    },
    {
      id: '3-2', slug: 'farmhouse-village',
      title: 'Wang Chung Traditional Farmhouse and Village',
      titleZh: 'Wang Chung 傳統農舍與村落',
      selector: 'textarea[data-note="3-2"]',
      headingSelector: '#page-3 .notes-form-body > h3:nth-of-type(2)',
      classification: 'task', task: 'B',
      help: '這欄直接支援 Task B 的網站介紹：搬遷重建、發現地點、村落消失及菠蘿節。',
      transcriptStart: 16, transcriptEnd: 27
    },
    {
      id: '3-3', slug: 'dr-jones-talk',
      title: 'Dr Jones’ Talk',
      titleZh: 'Jones 博士的講座',
      selector: 'textarea[data-note="3-3"]',
      headingSelector: '#page-3 .notes-form-body > h3:nth-of-type(3)',
      classification: 'listening', task: null,
      help: '日期、時間和講座題目都是有效聆聽筆記，但不屬 Task A、B 或 C 的指定內容。',
      transcriptStart: 34, transcriptEnd: 36
    },
    {
      id: '3-4', slug: 'plough',
      title: 'Chang Yee Tak Plough',
      titleZh: 'Chang Yee Tak Plough',
      selector: 'textarea[data-note="3-4"]',
      headingSelector: '#page-3 .notes-form-body > h3:nth-of-type(4)',
      classification: 'task', task: 'A',
      help: '這欄支援 Task A：展覽借用目的，以及犁的年代、材質和近乎完好的保存狀況。',
      transcriptStart: 37, transcriptEnd: 41
    }
  ];

  const cues = [
    {
      id: 'museum-purpose', start: 393.91, endpoint: 496.88, field: '3-1', transcriptIndex: 9,
      quote: 'what daily life was like for ordinary people in the past',
      title: '記下社會歷史博物館的功能',
      note: 'Visitors experience daily life of ordinary people in the past.',
      noteZh: '訪客可了解昔日普通人的日常生活。',
      use: 'listening', task: null,
      help: '這是第一個完整答案點。ordinary people 是定義核心；並非帝王將相。'
    },
    {
      id: 'museum-items', start: 496.88, endpoint: 552.19, field: '3-1', transcriptIndex: 15,
      quote: 'old tables and chairs ... old telephones, computers ... old clothes',
      title: '記下館藏例子',
      note: 'Old everyday items: tables, chairs, telephones, computers and clothes.',
      noteZh: '昔日常用品：桌椅、電話、電腦和衣服。',
      use: 'listening', task: null,
      help: '保留具體例子即可；這些資料只完成筆記，不寫入三篇指定成品。'
    },
    {
      id: 'farmhouse-rebuilt', start: 552.19, endpoint: 587.99, field: '3-2', transcriptIndex: 17,
      quote: 'moved to the museum brick by brick and reconstructed inside the museum ... in 2015',
      title: '記下農舍的搬遷與重建',
      note: 'Moved brick by brick; reconstructed inside the museum in 2015.',
      noteZh: '逐磚搬遷，並於 2015 年在博物館內重建。',
      use: 'task', task: 'B',
      help: '把方法、地點和年份合併成一項完整歷程；不必抄寫「very difficult」的評語。'
    },
    {
      id: 'farmhouse-reservoir', start: 587.99, endpoint: 603.57, field: '3-2', transcriptIndex: 21,
      quote: 'at the bottom of the Wang Chung reservoir',
      title: '確認農舍的發現地點',
      note: 'Found at the bottom of Wang Chung Reservoir.',
      noteZh: '在 Wang Chung Reservoir 水塘底被發現。',
      use: 'task', task: 'B',
      help: '先聽到 a reservoir，再等 Dr Jones 具體確認為 Wang Chung Reservoir 才落筆。'
    },
    {
      id: 'village-submerged', start: 603.57, endpoint: 621.62, field: '3-2', transcriptIndex: 23,
      quote: 'disappeared under water in 1990 when they built the reservoir',
      title: '記下村落消失的年份與原因',
      note: 'Village disappeared underwater in 1990 when the reservoir was built.',
      noteZh: '1990 年興建水塘時，村落被水淹沒。',
      use: 'task', task: 'B',
      help: '事件、年份和因果要一併保留，才能解釋農舍為何出現在水塘底。'
    },
    {
      id: 'pineapple-festival', start: 621.62, endpoint: 648.12, field: '3-2', transcriptIndex: 27,
      quote: 'Farmers would offer pineapples to the god of farming',
      title: '完成菠蘿節文化筆記',
      note: 'Famous Pineapple Festival: farmers offered pineapples to the god of farming.',
      noteZh: '著名菠蘿節：農民向農神供奉菠蘿。',
      use: 'task', task: 'B',
      help: '節日名稱和儀式合在一起，才構成可放入網站介紹的完整文化事實。'
    },
    {
      id: 'museum-location', start: 648.12, endpoint: 663.68, field: '3-1', transcriptIndex: 29,
      quote: 'in South Point, close to the new MTR station',
      title: '記下博物館所在地',
      note: 'In South Point, close to the new MTR station.',
      noteZh: '位於 South Point，鄰近新港鐵站。',
      use: 'listening', task: null,
      help: '這是路線欄的第一項定位資料；有效，但不屬 A／B／C 寫作內容。'
    },
    {
      id: 'museum-mtr', start: 663.68, endpoint: 670.56, field: '3-1', transcriptIndex: 31,
      quote: 'only two minutes from South Point MTR, Exit A',
      title: '記下港鐵出口與步行時間',
      note: 'Two minutes from South Point MTR, Exit A.',
      noteZh: '由 South Point 港鐵站 A 出口步行兩分鐘。',
      use: 'listening', task: null,
      help: '保留 two minutes 和 Exit A；兩者都是實際方向資料。'
    },
    {
      id: 'museum-route', start: 670.56, endpoint: 686.66, field: '3-1', transcriptIndex: 33,
      quote: 'go straight up Reed Street to the museum',
      title: '完成 Reed Street 路線',
      note: 'From Exit A, go straight up Reed Street to the museum.',
      noteZh: '由 A 出口沿 Reed Street 直行至博物館。',
      use: 'listening', task: null,
      help: '錄音先拼出 R-E-I-D，再由 Dr Jones 說明路線；筆記採用卷面／錄音確認的 Reed Street。'
    },
    {
      id: 'talk-details', start: 686.66, endpoint: 708.83, field: '3-3', transcriptIndex: 35,
      quote: 'On April 13th, from 8 to 9 ... Farming in the New Territories',
      title: '一次記齊講座資料',
      note: 'Farming in the New Territories — Wed 13 April, 8–9 pm.',
      noteZh: '「Farming in the New Territories」— 4 月 13 日星期三晚上 8 時至 9 時。',
      use: 'listening', task: null,
      help: '同一個確認回合提供題目、日期和時間；三項都寫進原生講座欄，但不進寫作證據庫。'
    },
    {
      id: 'plough-exhibition', start: 708.83, endpoint: 737.24, field: '3-4', transcriptIndex: 37,
      quote: 'an exhibition on farming in the New Territories ... hoping to display the Chang Yee Tak Plough',
      title: '記下借犁的展覽目的',
      note: 'Farming in the New Territories exhibition hopes to display the plough.',
      noteZh: '「Farming in the New Territories」展覽希望展出該犁。',
      use: 'task', task: 'A',
      help: '這是借用目的。hoping 保留仍待借出者同意的狀態，不可寫成已獲批准。'
    },
    {
      id: 'plough-qualified-uniqueness', start: 737.24, endpoint: 793.22, field: '3-4', transcriptIndex: 41,
      quote: 'the only one from the 18th century that’s not damaged ... almost perfect condition',
      title: '等完整修正後才記獨特價值',
      note: 'Only undamaged 18th-century wood-and-iron plough; almost perfect condition.',
      noteZh: '唯一沒有損壞的十八世紀木鐵犁；保存狀況近乎完美。',
      use: 'task', task: 'A', rejectedTranscriptIndexes: [39, 40],
      help: '前面的半句和 Patty 的猜測都不完整。必須等 Dr Jones 加上 18th century、not damaged 和 almost perfect condition 的限制。'
    },
    {
      id: 'recording-end', start: 793.22, endpoint: 830.86, field: null, transcriptIndex: 43,
      quote: 'That is the end of the listening component',
      title: '錄音完結 · 準備逐句核對',
      note: null, noteZh: null,
      use: 'closure', task: null,
      help: '四個原生欄目的筆記已按錄音次序完成。下一階段逐句檢查哪些可寫、哪些只是提示或不取材。'
    }
  ];

  const reviews = [
    ['hint', null, '乙部。請查看資料檔第 2 頁的「情境」。你是 Indy Wong，在香港社會歷史博物館擔任 Lara Gau 的博物館助理。Lara 有幾項工作想請你協助完成。', '作答身分與工作關係只控制語氣及立場，不直接寫入成品。'],
    ['hint', null, '你將收聽 Patty Leung 與 Jack Jones 博士為播客節目《Nosing Around》進行的一段訪談。', '這句交代錄音來源和說話者，真正內容仍要按任務篩選。'],
    ['hint', null, '錄音播放前，你有五分鐘閱讀問答冊和資料檔，以熟習情境及各項任務。請按照問答冊和錄音中的指示完成任務。所需的全部資料均可在問答冊、', '這一行是考試程序及來源提示；句子在下一行接續。'],
    ['noise', null, '資料檔及錄音中找到。聆聽時，你可在資料檔第 3 頁做筆記。現在你有五分鐘熟習問答冊及資料檔。', '考試操作提示，不是任何成品內容。'],
    ['hint', null, '錄音即將開始。請翻到資料檔第 3 頁。', '只提示開始聆聽及筆記頁位置。'],
    ['noise', null, '本星期節目內容豐富：我們會報道成為香港本地足球死忠球迷是怎樣的體驗，並邀請香港超級聯賽十支球隊的球迷會成員到場；又會訪問新加坡酒店主管 Hav 博士，他日間在酒店工作，晚上則兼任唱片騎師。不過首先，我會訪問另一位截然不同的博士。', '足球和另一位嘉賓都是節目預告，與博物館任務無關。'],
    ['hint', null, '今天與我一起的是香港社會歷史博物館的 Jack Jones 博士。Jones 博士，歡迎再次來到《Nosing Around》。我想，這是你第三次上本節目。', '確認受訪者代表博物館；上節目次數不是寫作內容。'],
    ['noise', null, 'Patty，你好。對，能夠再次來到《Nosing Around》真好；我一向都很樂意上來。', '禮貌寒暄，沒有內容點。'],
    ['hint', null, '那麼，我們不如先談談社會歷史博物館。相信聽眾都熟悉傳統博物館的意思，但你可否向大家解釋甚麼是社會歷史博物館？', '這是筆記欄的問題引子，本身不是答案。'],
    ['listening', null, 'Patty，這個問題問得很好。社會歷史博物館是一個讓訪客體驗昔日普羅大眾日常生活的地方。', '完整定義，寫入第 1 個原生筆記欄。'],
    ['listening', null, '好的，即是昔日普羅大眾的日常生活。你所說的普羅大眾，是指像我和聽眾一樣的人，而不是國王、王后之類的人，對嗎？', '主持人重述定義並提出確認。'],
    ['mixed', null, '對，是像你我一樣的普通人，而不是國王和王后。我猜你不是女王吧。', '前句確認定義；後句只是玩笑。'],
    ['mixed', null, '嗯，也許我前世是。那麼，在社會歷史博物館可以看到甚麼東西？', '前句是玩笑；後句引出館藏例子。'],
    ['listening', null, '你會看到昔日人們使用的普通物品。與其看古代陶器和武器，我們會看祖父母家裏可能有的舊桌椅，以及舊電話、舊電腦之類的東西……', '具體館藏例子，屬完整聆聽筆記。'],
    ['listening', null, '即是普通但古舊的物品。那也包括人們以前穿的舊衣服嗎？', '補充 old clothes 這個例子。'],
    ['hint', null, '對，正是。', '只確認上一個例子，沒有獨立內容點。'],
    ['mixed', 'B', '這樣我便有興趣了。我很喜歡復古時尚物品，例如外套、首飾之類。聽說你們的博物館很大；事實上，大得連整座農舍也在館內重建了。', '個人喜好不取材；後半句把話題帶到 Task B 農舍。'],
    ['task', 'B', '對，正是 Wang Chung Traditional Farmhouse。它逐磚搬到博物館，並於 2015 年在館內重建。整項工程非常艱巨。', 'Task B 直接可用；保留搬遷方法、地點和年份，省略主觀難度評語。'],
    ['hint', null, '那麼，它原本來自哪裏？', '問題引子，答案在下一回合。'],
    ['task', 'B', '這座農舍是在一個水塘底被發現的，也就是人工湖底。', '先得到發現位置；仍要等下一句確認水塘名稱。'],
    ['hint', null, '嘩，你是說這座農舍原本在水底？', '主持人確認意思，沒有新增事實。'],
    ['task', 'B', '對，就在 Wang Chung Reservoir 的水塘底。', '具體確認發現地點，可支援 Task B。'],
    ['noise', null, '好的，我知道 Wang Chung Reservoir；我曾經到那裏遠足。', '主持人的個人經驗與指定任務無關。'],
    ['task', 'B', '你可能不知道，在興建水塘之前，那裏原本有一條村落，名為 Wang Chung Village。1990 年興建水塘時，村落被水淹沒。', '提供村落消失的事件、年份和原因。'],
    ['noise', null, '真的嗎？不，我不知道。', '主持人反應，沒有新內容。'],
    ['task', 'B', 'Wang Chung Village 從前其實頗有名，因 Wang Chung Pineapple Festival 而聞名。', 'Task B 的村落文化特色。'],
    ['noise', null, '好的，菠蘿節。我好像看過一些舊照片。', '主持人的記憶不構成所需事實。'],
    ['task', 'B', '對，很有可能。菠蘿節當年是個規模頗大的節慶；農民會把菠蘿供奉給農神。', '節日和核心儀式合成完整文化事實。'],
    ['mixed', null, '對，那就是我從照片記得的情景。好吧。啊，我記起想問甚麼了。請原諒我突然轉題：社會歷史博物館在哪裏？', '照片反應及問題本身不取材；答案在下一回合。'],
    ['listening', null, '博物館位於 South Point，鄰近新的港鐵站。', '有效路線筆記，但不屬三篇寫作。'],
    ['noise', null, '嗯，那很方便。', '主持人反應，沒有資料。'],
    ['listening', null, '對，由 South Point 港鐵站 A 出口步行只需兩分鐘。', '記下步行時間和出口。'],
    ['listening', null, '嘩，只需步行兩分鐘。是在 Reed Street 嗎？就是拼作 R-E-I-D？對，沒錯。', '確認街道名稱和拼法。'],
    ['listening', null, '在 A 出口離開車站，沿 Reed Street 一直走便到博物館。', '完成路線筆記。'],
    ['listening', null, '我聽說你將主持一場關於新界農業的講座。是在下星期三，即 4 月 13 日嗎？對，沒錯。', '確認講座題目和日期。'],
    ['listening', null, '講座在 4 月 13 日星期三晚上 8 時至 9 時舉行；正如你剛才所說，講座題目是 Farming in the New Territories。', '一次提供講座日期、時間和題目。'],
    ['mixed', null, '好的，聽起來很有趣。我很想進一步了解新界農業；各位聽眾，你們也想吧？記住，如果想參加，請不要遲到：晚上 8 時開始，9 時結束。', '只有重申的講座時間屬有效筆記；主持人的興趣和呼籲不取材。'],
    ['task', 'A', '我也想補充，博物館將舉辦一個關於新界農業的展覽；我們希望在展覽中展出 Chang Yee Tak Plough。', 'Task A 的借用目的；希望展出仍屬待批准狀態。'],
    ['hint', null, '啊，我讀書時其實讀過 Chang Yee Tak Plough；相信很多聽眾也記得在學校讀過它。我很想親眼看看。你可否向不認識它的聽眾解釋，Chang Yee Tak Plough 有甚麼特別？', '個人回憶與興趣不取材；問題引出獨特價值。'],
    ['noise', null, '它很特別，因為它是世上唯一一件木鐵犁……', '句子在限定條件出現前被打斷，不能當成答案。'],
    ['noise', null, '等等，等等。你的意思是世上沒有其他木鐵犁？', '主持人的誤解隨即被否定。'],
    ['task', 'A', '不是，Patty。我剛才還未說完。我想說的是，世上當然有很多木鐵犁，但這是唯一一件沒有損壞的十八世紀木鐵犁。這就是 Chang Yee Tak Plough 的非凡之處：它來自十八世紀，保存狀況卻近乎完美。', 'Task A 必須保留年代、材質和未損壞三重限制，並可補充近乎完好。'],
    ['noise', null, '好的，正如我所說，我想親眼看看實物。Jones 博士，謝謝你今天到來接受訪問；祝你的展覽順利。', '主持人的個人反應和節目結語不提供新內容。'],
    ['noise', null, '本試卷的聆聽部分到此結束。你有一小時十五分鐘完成 B1 或 B2 的寫作任務。時間完結時會有廣播。現在請除下耳機並關掉收音機。', '考試程序，不寫入任何成品。']
  ];

  // Golden Manual §§27 and V5-F require sentence-level projection: only the
  // exact usable answer span is coloured; every remaining word is rejected
  // with red ink on the copy (never on the speaker label).
  const highlightPhrases = Object.freeze({
    9: ['A Social History Museum is a place where visitors can experience what daily life was like for ordinary people in the past.'],
    10: ['everyday life for ordinary people in the past'],
    11: ['ordinary people like you and me, not kings and queens.'],
    13: ['ordinary items people used in the past.', "old tables and chairs you would find in your grandparents' homes.", 'Things like old telephones, computers...'],
    14: ['old clothes people used to wear'],
    16: ['rebuilt a whole farmhouse inside the museum building'],
    17: ['The Wang Chung Traditional Farmhouse. It was moved to the museum brick by brick and reconstructed inside the museum last year in 2015.'],
    19: ['The farmhouse was found at the bottom of a reservoir.'],
    21: ['at the bottom of the Wang Chung reservoir'],
    23: ['before the reservoir there was a village there, Wang Chung village. And it disappeared under water in 1990 when they built the reservoir.'],
    25: ['quite a famous village, Wang Chung, for the Wang Chung Pineapple Festival'],
    27: ['The Pineapple Festival was a pretty big festival in its day. Farmers would offer pineapples to the god of farming.'],
    29: ["It's in South Point, close to the new MTR station."],
    31: ['only two minutes from South Point MTR, Exit A.'],
    32: ['only two minutes walk.', "Is that on Reed Street, you know, as in R-E-I-D? Yes, that's right."],
    33: ['Get out at Exit A and just go straight up Reed Street to the museum.'],
    34: ['you are giving a talk on farming in the New Territories. Is that next Wednesday, the 13th of April? Yes, that\'s right.'],
    35: ['On April 13th, from 8 to 9 in the evening, Wednesday', 'Farming in the New Territories.'],
    36: ['8pm start and finish at 9pm.'],
    37: ["we're having an exhibition on farming in the New Territories at the museum? And in the exhibition, we're hoping to display the Chang Yee Tak Plough."],
    41: ["this is the only one from the 18th century that's not damaged", "It's from the 18th century, but is in almost perfect condition."]
  });

  const transcript = sourceRows.map((row, index) => {
    const review = reviews[index] || ['hint', null, '', ''];
    return Object.freeze({
      id: `part-b-turn-${String(index + 1).padStart(2, '0')}`,
      index,
      start: row.start,
      end: row.end,
      speaker: row.speaker,
      text: normalizeNames(row.text),
      sourceText: row.text,
      kind: review[0],
      task: review[1],
      translation: review[2],
      explanation: review[3],
      rejectUnhighlighted: true,
      highlightPhrases: highlightPhrases[index] || []
    });
  });

  const setupSteps = [
    {
      id: 'p3-orientation', kind: 'orientation', title: '先看四個原生筆記欄',
      sourcePage: 'Data File p.3 · Nosing Around',
      quote: 'Social History Museum · Wang Chung Traditional Farmhouse and Village · Dr Jones’ Talk · Chang Yee Tak Plough',
      translation: '四個欄目都要完成聆聽筆記；只有農舍／村落和犁的資料進入 B2 寫作。',
      explanation: '原卷第 3 頁是唯一筆記介面。Stage 3 不會建立替代工作紙，也不會把 listening-only 資料誤收進寫作證據庫。'
    },
    {
      id: 'p3-controls', kind: 'controls', title: '認識錄音控制與逐字稿',
      sourcePage: '完整 Part B 錄音 · 13:51.63',
      quote: '播放／暫停 · 停頓點 · 時間軸 · 0.5×–3× · 中文逐字稿 · 四角調整大小',
      translation: '播放器使用完整 2016 Part B MP3；正式訪談在 6:33 後開始。',
      explanation: '一般播放不會強迫捲動原卷或逐字稿。每個答案端點都會暫停；倒帶會移除未來生成筆記，但保留你自行輸入的文字。'
    }
  ];
  const cueSteps = cues.map(cue => ({
    id: `p3-cue-${cue.id}`, kind: 'cue', cueId: cue.id,
    title: cue.title,
    sourcePage: cue.field ? `Data File p.3 · ${fields.find(field => field.id === cue.field)?.title}` : '完整 Part B 錄音',
    quote: cue.quote,
    translation: cue.noteZh || '錄音完結。',
    explanation: cue.help
  }));
  const transcriptSteps = transcript.map(turn => ({
    id: `p3-review-${turn.id}`, kind: 'review', transcriptIndex: turn.index,
    title: `逐句錄音稿 · ${turn.speaker}`,
    sourcePage: `Part B ${Math.floor(turn.start / 60)}:${String(Math.floor(turn.start % 60)).padStart(2, '0')}–${Math.floor(turn.end / 60)}:${String(Math.floor(turn.end % 60)).padStart(2, '0')}`,
    quote: turn.text,
    translation: turn.translation,
    explanation: turn.explanation,
    task: turn.task,
    reviewKind: turn.kind
  }));
  const closingSteps = [
    {
      id: 'p3-final-verification', kind: 'verification', title: '最後核對四欄與兩個任務',
      sourcePage: 'Data File p.3 · 完整核對',
      quote: '4 authentic fields · 12 written notes · 13 cue stops · 44 transcript turns',
      translation: '四欄筆記完整；Task B 只取農舍／村落，Task A 只取展覽目的及犁的限定獨特價值。',
      explanation: '確認 directions 和 talk 仍留在筆記欄但不進 A／B／C；確認錯誤的「世上唯一木鐵犁」已用紅線排除。'
    },
    {
      id: 'p3-complete', kind: 'complete', title: 'Stage 3 完成',
      sourcePage: 'Super Curation · Stage 3',
      quote: 'Listening notes, cue ledger and transcript review complete.',
      translation: '聆聽筆記、精確停頓點和逐句核對已完成。',
      explanation: '本次工作到 Stage 3 為止；Stage 4 逐句取證及 Stage 5 三篇寫作保持未開放。'
    }
  ];

  const steps = [...setupSteps, ...cueSteps, ...transcriptSteps, ...closingSteps]
    .map((step, index) => Object.freeze({...step, index}));

  window.EDMUND_2016_B2_STAGE3 = Object.freeze({
    version: '2016-b2-super-curation-stage3-v1',
    schema: 2,
    architectureVersion: '2016-b2-podcast-v1-single-owner',
    storageKey: 'edmund-paper3-2016-b2-super-curation-stage3-v1',
    audio: Object.freeze({
      src: 'https://ookkxzgpdclzrrhfmvqx.supabase.co/functions/v1/public-audio-relay/DSE%20Listening%20-%20Recordings/DSE%202016%20Part%20B.mp3',
      sourceUrl: 'https://edmund-neural-audio.edmundeducation.workers.dev/DSE%20Listening%20-%20Recordings/DSE%202016%20Part%20B.mp3',
      duration: 831.63,
      sha256: '1e32a9f8d57cc8a27c72edeead5cbb6c6be04cfee37e339d25a1c482d6c676de'
    }),
    properNameCorrections,
    fields: Object.freeze(fields.map(Object.freeze)),
    cues: Object.freeze(cues.map(Object.freeze)),
    transcript: Object.freeze(transcript),
    steps: Object.freeze(steps)
  });
})();

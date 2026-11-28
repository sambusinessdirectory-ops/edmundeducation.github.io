(() => {
  'use strict';

  const inventory = [
    {
      id: 'p2-p03-pet-club-notes', page: 3, sourcePage: 'Data File p.3',
      selector: '#page-3 .conference-notes > h2',
      title: 'Pet Club podcast 聆聽筆記頁',
      documentTitle: 'Listening note-taking sheet for the Pet Club podcast',
      documentType: '錄音筆記頁／聆聽路線',
      writer: '試卷編製者（預設筆記欄）', reader: '考生 Joey Wong', date: '未註明',
      sourceRefs: ['Kerry 的 Task A 指示明確叫 Joey 查看 Pet Club podcast notes', 'Task C 需要錄音內的負責任飼養／醫院服務分支', 'Situation 指示可在 Data File p.3 記錄錄音資料'],
      initialTasks: ['A', 'C'], possibleFinalTasks: ['A', 'C'], classificationStatus: 'subheading-routed',
      contents: '六個錄音筆記欄目必須分開標記；只有 Email 2 對應 Task A，Advice for exotic pet owners 對應 Task C。',
      reason: '這份筆記頁整體屬 A + C，但不是每個欄目都可用：Email 2 是 Pinky／Wendy 的獸醫護士分支；Advice 是負責任飼養及醫院支援分支。其餘四欄不屬三項成品。',
      revisionGuidance: 'Stage 3 逐段聆聽時，只在 Email 2 下核對 Task A 職業資料，在 Advice 下核對 Task C 的負責任飼養／醫院服務；欄目名稱本身仍只是路線，不是證據。',
      risk: '不要把整段 podcast 都標成 A 或 C；Definition、Reasons、Examples 和 Email 1 均不得因為同在筆記頁而混入答案。',
      subheadings: [
        {id: 'p2-p03-definition', selector: '#page-3 .notes-form-body > h3:nth-of-type(1)', title: 'Exotic pets — Definition', tasks: [], label: '不取材', reason: '三項任務均沒有要求 exotic pets 的一般定義。'},
        {id: 'p2-p03-reasons', selector: '#page-3 .notes-form-body > h3:nth-of-type(2)', title: 'Reasons to have an exotic pet', tasks: [], label: '不取材', reason: '一般飼養原因不回答 Task A、B 或 C。'},
        {id: 'p2-p03-examples', selector: '#page-3 .notes-form-body > h3:nth-of-type(3)', title: 'Examples of exotic pets in Hong Kong', tasks: [], label: '不取材', reason: '物種例子不回答三項成品要求。'},
        {id: 'p2-p03-email-1', selector: '#page-3 .notes-form-body > h3:nth-of-type(4)', title: 'Email 1', tasks: [], label: '不取材', reason: 'Kenny 的蛇隻問題與三項任務沒有直接關係。'},
        {id: 'p2-p03-email-2', selector: '#page-3 .notes-form-body > h3:nth-of-type(5)', title: 'Email 2', tasks: ['A'], label: 'Task A', reason: 'Pinky／Wendy 的獸醫護士問題與回答直接支援資訊頁。'},
        {id: 'p2-p03-advice', selector: '#page-3 .notes-form-body > h3:nth-of-type(6)', title: 'Advice for exotic pet owners', tasks: ['C'], label: 'Task C', reason: '負責任飼養、不要放生及醫院支援直接支援回應信。'}
      ]
    },
    {
      id: 'p2-p04-online-today-statistics', page: 4, sourcePage: 'Data File p.4',
      selector: '#page-4 .exotic-email-chart > h2:nth-of-type(2)',
      title: 'Online Today 年齡統計',
      documentTitle: 'Statistics from Online Today magazine, November 29, 2013',
      documentType: '雜誌統計圖表', writer: 'Online Today magazine', reader: '一般雜誌讀者', date: '29 Nov 2013',
      sourceRefs: ['Contents p.2', 'Task B：virtual pets／old people'],
      initialTasks: ['B'], possibleFinalTasks: ['B'], classificationStatus: 'strong-initial',
      contents: '圖表按年齡分組顯示虛擬寵物使用者；本階段只判斷用途，不抄取數字。',
      reason: '主題同時吻合 Task B 的 virtual pets 和 old people；與獸醫護士資訊頁及醫院義務工作回應沒有直接任務關係。',
      revisionGuidance: 'Stage 4 細讀圖表後，確認哪些數字可支持 Task B 的簡短背景；不要把所有圖表資料都搬入演辭。',
      risk: '日期和雜誌名稱是來源資料，不是演辭必寫內容。'
    },
    {
      id: 'p2-p05-veterinary-course-ad', page: 5, sourcePage: 'Data File p.5',
      selector: '#page-5 .exotic-course-gamer > h2:first-of-type',
      title: '獸醫護士課程廣告',
      documentTitle: 'Course Advertisement from Hong Kong Metropolitan University',
      documentType: '大學課程廣告', writer: 'Hong Kong Metropolitan University', reader: '準獸醫護士／升學人士', date: '未註明',
      sourceRefs: ['Contents p.2', 'Task A：qualifications and future prospects'],
      initialTasks: ['A'], possibleFinalTasks: ['A'], classificationStatus: 'strong-initial',
      contents: '課程與畢業發展資料，對應入行資格和未來前景。',
      reason: '文件主題直接對應 Task A 的 qualifications and future prospects，讀者亦與 young people or school leavers 接近。',
      revisionGuidance: 'Stage 4 再分開「課程資格／訓練」和「未來前景」兩欄，刪除純宣傳背景。',
      risk: '廣告內所有句子不一定都可用；學校歷史或教師國籍可能只是宣傳。'
    },
    {
      id: 'p2-p05-gamer-article', page: 5, sourcePage: 'Data File p.5',
      selector: '#page-5 .exotic-course-gamer > h2:nth-of-type(2)',
      title: 'The Gamer 長者虛擬寵物文章',
      documentTitle: 'Article from The Gamer magazine',
      documentType: '遊戲雜誌文章', writer: 'The Gamer 記者／Perry Schmidt', reader: '遊戲雜誌讀者', date: '未註明',
      sourceRefs: ['Contents p.2', 'Task B：how old people use virtual pets'],
      initialTasks: ['B'], possibleFinalTasks: ['B'], classificationStatus: 'strong-initial',
      contents: '文章以長者玩虛擬寵物為中心；細節留待 Stage 4。',
      reason: 'old people、gaming 和 virtual pets 三個主題全部對應 Task B 的主體要求。',
      revisionGuidance: 'Stage 4 只保留能回答「長者如何使用」的活動或原因；刪去記者的娛樂性語氣。',
      risk: '有趣例子不等於全部都重要；要按 Task B 的 focus 篩選。'
    },
    {
      id: 'p2-p06-student-podcast-interview', page: 6, sourcePage: 'Data File p.6',
      selector: '#page-6 .exotic-podcast > h2',
      title: '學生 podcast 的獸醫護士訪問',
      documentTitle: 'Interview excerpt from student podcast: A different kind of nurse!',
      documentType: '訪問逐字節錄', writer: '學生主持與受訪獸醫護士', reader: '學生 podcast 聽眾', date: '未註明',
      sourceRefs: ['Contents p.2', 'Task A：duties／qualities／prospects／challenges'],
      initialTasks: ['A'], possibleFinalTasks: ['A'], classificationStatus: 'strong-initial',
      contents: '多位獸醫護士談工作、發展與挑戰；本階段不抽取個別答案。',
      reason: '文件職業主題直接覆蓋 Task A 的工作內容、專業素質、前景和挑戰。',
      revisionGuidance: 'Stage 4 依 Task A 三個內容欄分類受訪內容，避免把主持人的反應當成職業證據。',
      risk: '受訪者姓名和個案故事主要用來辨認發言者，不必全部寫入資訊頁。'
    },
    {
      id: 'p2-p07-virtual-jungle-book', page: 7, sourcePage: 'Data File p.7',
      selector: '#page-7 .exotic-book-fish > h2:first-of-type',
      title: 'Inside the Virtual Jungle 書本節錄',
      documentTitle: 'Extract from book: Inside the Virtual Jungle and Pets Online',
      documentType: '研究／非小說書本節錄', writer: '書本作者及受訪使用者', reader: '一般／研究讀者', date: '未註明',
      sourceRefs: ['Kerry 的 Task B 指示明確指定此書為起點', 'Contents p.2'],
      initialTasks: ['B'], possibleFinalTasks: ['B'], classificationStatus: 'explicit-route',
      contents: '書本談虛擬寵物背景和較年長使用者；具體證據留待 Stage 4。',
      reason: 'Kerry 明確把 Task B 路線指向這本書，因此先標 B；start by 只表示起點，不表示唯一來源。',
      revisionGuidance: 'Stage 4 把簡短背景和長者使用方式分開；只選能服務演辭目的的資料。',
      risk: '不要因為是指定來源就全篇照用，也不要提前把書中句子視為完成答案。'
    },
    {
      id: 'p2-p07-hong-kong-times', page: 7, sourcePage: 'Data File p.7',
      selector: '#page-7 .exotic-book-fish > h2:nth-of-type(2)',
      title: 'Hong Kong Times 珍禽異獸新聞',
      documentTitle: 'Article from the Hong Kong Times, November 2013',
      documentType: '報章新聞', writer: 'Hong Kong Times 記者／受訪 AFCD 人員', reader: '香港公眾', date: 'Nov 2013',
      sourceRefs: ['Contents p.2', 'Task C：回應醫院批評及交代社區義務工作'],
      initialTasks: ['C'], possibleFinalTasks: ['C'], classificationStatus: 'strong-initial',
      contents: '報道珍禽異獸問題及醫院／政府的處理；細節留待 Stage 4。',
      reason: '文件以醫院的公共回應和社區工作為中心，最可能支援 Task C 的回應與 voluntary work。',
      revisionGuidance: 'Stage 4 分清「問題背景」「外界風險」和「醫院實際行動」，再決定哪些可用於反駁。',
      risk: '負面事件背景不一定是醫院過失；寫信時要準確歸因。'
    },
    {
      id: 'p2-p08-elderly-news', page: 8, sourcePage: 'Data File p.8',
      selector: '#page-8 .exotic-elderly > h2',
      title: 'Elderly News 長者文章',
      documentTitle: 'Excerpt from the Elderly News magazine',
      documentType: '長者雜誌節錄／讀者分享', writer: 'Elderly News 編輯與讀者', reader: '長者及其家庭', date: '未註明',
      sourceRefs: ['Contents p.2', 'Task B：how old people use virtual pets'],
      initialTasks: ['B'], possibleFinalTasks: ['B'], classificationStatus: 'strong-initial',
      contents: '長者分享接觸和使用虛擬寵物的情況；本階段不抽取例子。',
      reason: '來源讀者和內容都直接貼近 Task B 的 old people use virtual pets。',
      revisionGuidance: 'Stage 4 區分「開始使用的原因」和「實際怎樣使用」，以免把兩類資料混在一起。',
      risk: '不要把一般數碼活動誤當虛擬寵物活動。'
    },
    {
      id: 'p2-p09-squeers-letter', page: 9, sourcePage: 'Data File p.9',
      selector: '#page-9 .exotic-letter-news > h2:first-of-type',
      title: 'Squeers 致 Kowloon Herald 的來信',
      documentTitle: 'Letter in the Kowloon Herald',
      documentType: '致編輯的批評信', writer: 'Mr W. Squeers', reader: 'Kowloon Herald 編輯及公眾', date: '23 Mar 2014',
      sourceRefs: ['Kerry 的 Task C 指示明確指定先讀此信', 'Contents p.2'],
      initialTasks: ['C'], possibleFinalTasks: ['C'], classificationStatus: 'explicit-route',
      contents: '來信提出對醫院的批評；具體指控留待 Stage 4。',
      reason: 'Task C 明確要求回應 Squeers 的來信，因此這是界定回應對象的核心來源。',
      revisionGuidance: 'Stage 4 逐項記錄指控，再另找證據回應；不要把批評當成已證實事實。',
      risk: '成品直接寫給編輯，不是寫給 Squeers。引用指控時必須清楚歸因。'
    },
    {
      id: 'p2-p09-hong-kong-telegraph', page: 9, sourcePage: 'Data File p.9',
      selector: '#page-9 .exotic-letter-news > h2:nth-of-type(2)',
      title: 'Hong Kong Telegraph 醫院新聞',
      documentTitle: 'Article from the Hong Kong Telegraph, March 2014',
      documentType: '報章新聞', writer: 'Hong Kong Telegraph 記者／受訪者', reader: '香港公眾', date: 'Mar 2014',
      sourceRefs: ['Contents p.2', 'Task C：醫院的 voluntary work／回應'],
      initialTasks: ['C'], possibleFinalTasks: ['C'], classificationStatus: 'strong-initial',
      contents: '報道醫院處理無人照顧動物的工作；細節留待 Stage 4。',
      reason: '文件聚焦醫院對社區和動物的實際工作，可用來核對 Task C 要求的 voluntary work。',
      revisionGuidance: 'Stage 4 核對項目名稱、服務對象和免費／義務性質，避免只靠新聞標題推斷。',
      risk: '報章個案可作例證，但不能代替「all voluntary work」的完整性核對。'
    },
    {
      id: 'p2-p10-hospital-annual-report', page: 10, sourcePage: 'Data File p.10',
      selector: '#page-10 .exotic-annual > h2',
      title: '醫院年報節錄',
      documentTitle: 'Excerpt from Kowloon Exotic Pets Hospital annual report',
      documentType: '機構年報（含小節及圖表）', writer: 'Kowloon Exotic Pets Hospital', reader: '管理層／持份者／公眾', date: '2014 年報語境',
      sourceRefs: ['Contents p.2', 'Task C：all voluntary work'],
      initialTasks: ['C'], possibleFinalTasks: ['C'], classificationStatus: 'strong-initial',
      contents: '年報記錄醫院社區服務及相關數據；兩個小節仍屬同一份文件。',
      reason: '機構正式紀錄最適合核對 Task C 所要求的醫院義務工作及其範圍。',
      revisionGuidance: 'Stage 4 逐節核對活動、合作對象和圖表趨勢；同一文件可提供多個內容點，但只分類一次。',
      risk: '不要把圖表約數寫成超出原圖精度的精確數字。'
    },
    {
      id: 'p2-p11-neelay-email', page: 11, sourcePage: 'Data File p.11',
      selector: '#page-11 .exotic-thanks > h2',
      title: 'Neelay Shah 給 Kerry 的電郵',
      documentTitle: 'Email from Neelay Shah to Kerry Lam',
      documentType: '政府人員致醫院的工作電郵', writer: 'Neelay Shah', reader: 'Kerry Lam', date: '未註明',
      sourceRefs: ['Contents p.2', 'Task C：醫院的 community work／回應'],
      initialTasks: ['C'], possibleFinalTasks: ['C'], classificationStatus: 'strong-initial',
      contents: '外部工作夥伴回顧醫院的協作與公眾教育；細節留待 Stage 4。',
      reason: '電郵由外部伙伴確認醫院的社區合作，最可能支援 Task C 的 voluntary work 和回應。',
      revisionGuidance: 'Stage 4 分開可核實的合作事實、風險限定和禮貌稱讚；只保留真正回答任務的部分。',
      risk: '感謝語和稱讚不是獨立證據；來源身分亦不等於所有陳述都必須採用。'
    }
  ];

  const categorySteps = inventory.flatMap(record => [
    {...record, stage: 'categorize', categoryStep: true},
    ...(record.subheadings || []).map((subheading, index) => ({
      id: subheading.id,
      stage: 'categorize',
      subheadingStep: true,
      parentRecordId: record.id,
      subheadingIndex: index,
      page: record.page,
      sourcePage: `${record.sourcePage} · Podcast sub-heading ${index + 1}/${record.subheadings.length}`,
      selector: subheading.selector,
      title: `Podcast 細分欄目 · ${subheading.title}`,
      quote: subheading.title,
      translation: subheading.tasks.length
        ? `此欄只路由到 ${subheading.tasks.map(task => `Task ${task}`).join(' + ')}。`
        : '此欄仍需在聆聽時記錄答案，但不供 B2 三項寫作取材。',
      explanation: subheading.reason,
      help: '這是獨立的細分欄目分類步驟；完成後再到下一個 podcast 欄目。',
      label: subheading.label,
      labelTasks: [...subheading.tasks],
      points: subheading.tasks.length
        ? subheading.tasks.map(task => `標記：Task ${task}`)
        : ['標記：不取材', '仍須按錄音要求完成筆記']
    }))
  ]);

  const steps = [
    {
      id: 'p2-stage-intro', stage: 'categorize', sourcePage: 'Stage 2 transition', page: 2,
      selector: '#page-2 .contents-box', title: 'Stage 2 開始 · 先分類，後取證',
      quote: 'One document, one initial classification decision.',
      translation: '每一份相關文件先作一次暫定分類。',
      explanation: '你已在 Stage 1 建立 A／B／C 三項任務合約。現在逐份檢視資料檔文件標題、文類、作者、讀者和來源路線，暫定它屬於哪些任務。分類是可修改的工作假設，不代表已經採用了文件內任何句子。',
      help: '可自由跳到任何 Stage 2 步驟。A／B／C 可複選；資料仍不足時選「暫未確定」。',
      points: ['A：獸醫護士資訊頁', 'B：開放日虛擬寵物演辭', 'C：致 Kowloon Herald 編輯的回應信']
    },
    ...categorySteps,
    {
      id: 'p2-stage-complete', stage: 'categorize', sourcePage: 'Stage 2 review', page: 11, final: true,
      selector: '#page-11 .exotic-thanks > h2', title: 'Stage 2 完成 · 十二份文件及六個 Podcast 細分欄目已分類',
      quote: 'Stage 2 complete · source documents categorized',
      translation: '資料分類完成；所有選擇仍可返回修改。',
      explanation: '十二份相關文件已有保存的 A／B／C 或暫未確定標記；Pet Club podcast 的六個細分欄目亦已逐一標記。這些標記只決定後續閱讀路線；它們不是證據句、答案清單或範文。Stage 3–5 仍然鎖定。',
      help: '可用上一步或步驟選單返回任何文件。進入 Stage 3 前，應先取得並核對真實 2014 錄音。',
      points: ['已保存每份文件的分類', 'Podcast 六個細分欄目均有獨立步驟及標記', '多任務文件使用獨立 A／B／C 標記', '未確定項目保留到後續閱讀再修正']
    }
  ];

  window.EDMUND_2014_B2_CURATION_STAGE2 = Object.freeze({
    version: '2014-b2-super-curation-stage2-v3',
    inventory: Object.freeze(inventory.map(item => Object.freeze({...item, sourceRefs: Object.freeze([...item.sourceRefs]), initialTasks: Object.freeze([...item.initialTasks]), possibleFinalTasks: Object.freeze([...item.possibleFinalTasks]), subheadings: item.subheadings ? Object.freeze(item.subheadings.map(subheading => Object.freeze({...subheading, tasks: Object.freeze([...subheading.tasks])}))) : undefined}))),
    steps: Object.freeze(steps.map(item => Object.freeze(item)))
  });
})();

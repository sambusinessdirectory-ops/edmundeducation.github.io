(() => {
  'use strict';

  const situation = '#page-2 .situation-box';
  const letter = '#page-4 .email-window';
  const emailBody = `${letter} .email-content`;
  const taskA = `${emailBody} .bilingual:nth-of-type(3) p[lang="en"]`;
  const taskB = `${emailBody} .bilingual:nth-of-type(4) p[lang="en"]`;
  const taskC = `${emailBody} .bilingual:nth-of-type(5) p[lang="en"]`;
  const taskASourceHighlights = [{phrase: 'Have a look at her email'}];
  const taskBSourceHighlights = [{phrase: 'a WhatsApp to give you some ideas'}];
  const taskCSourceHighlights = [
    {phrase: 'email from Ms O’Conner'},
    {phrase: 'minutes of the recent staff meeting'}
  ];

  const steps = [
    {
      id: 'p1-situation-writer-indy-wong', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(1) p[lang="en"]`, phrase: 'You are Indy Wong.',
      title: '先確認寫作者身分', kind: 'hint', type: 5,
      translation: '你是 Indy Wong。',
      explanation: '三項成品都由 Indy 撰寫。這句控制寫作身分、立場和署名，不是可直接搬進答案的內容。',
      help: '先把「我是誰」和「成品寫給誰」分開；兩者通常不是同一人。'
    },
    {
      id: 'p1-situation-role-museum-assistant', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(1) p[lang="en"]`, phrase: 'You are a museum assistant for Lara Gau at the Hong Kong Social History Museum.',
      title: '確定職位、上司和機構', kind: 'hint', type: 5,
      translation: '你是香港社會歷史博物館的助理，為 Lara Gau 工作。',
      explanation: 'Indy 代表博物館執行 Lara 的工作。這個職務關係控制專業語氣，但不等於三項成品都寫給 Lara。',
      help: '圈出 museum assistant、Lara Gau 和 museum，建立寫作者的工作背景。'
    },
    {
      id: 'p1-situation-task-overview', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(1) p[lang="en"]`, phrase: 'Lara has a few things she wants you to do to help out.',
      title: '預告有多項工作', kind: 'hint', type: 5,
      translation: 'Lara 有幾項工作請你協助。',
      explanation: '這只是任務入口。稍後的電郵會把工作分成三項，不能把三項要求混成一篇答案。',
      help: '先留一個三欄表，等讀到 Lara 的電郵再填 Task A、B、C。'
    },
    {
      id: 'p1-situation-recording-identity', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(2) p[lang="en"]`, phrase: 'You will listen to an interview between Patty Leung and Dr Jack Jones for the podcast Nosing Around.',
      title: '辨認錄音來源', kind: 'hint', type: 5,
      translation: '你將收聽 Patty Leung 與 Dr Jack Jones 為《Nosing Around》進行的訪問。',
      explanation: '錄音是正式來源之一；節目名稱和說話者只協助定位。Stage 1 不會提前展示任何錄音答案。',
      help: '先記「來源是甚麼」，真正內容要到聆聽階段逐點核實。'
    },
    {
      id: 'p1-situation-five-minute-preview', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(3) p[lang="en"]`, phrase: 'Before the recording is played, you will have five minutes to study the Question-Answer Book and the Data File to familiarize yourself with the situation and the tasks.',
      title: '五分鐘是考試程序', kind: 'noise', type: 6,
      translation: '錄音播放前有五分鐘閱讀問答冊及資料檔。',
      explanation: '這是考試程序，不是 Task A、B 或 C 的寫作內容。它提醒你先掌握情境和任務。',
      help: '可標成「要遵守，但不寫入成品」。'
    },
    {
      id: 'p1-situation-follow-qab-recording', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(4) p[lang="en"]`, phrase: 'Complete the tasks by following the instructions in the Question-Answer Book and on the recording.',
      title: '兩處正式指示都要遵守', kind: 'hint', type: 5,
      translation: '按問答冊及錄音中的指示完成任務。',
      explanation: 'Question-Answer Book 定義成品規格；錄音可能補充內容。只看其中一處，任務可能不完整。',
      help: '把「任務規格」和「可用資料」分成兩欄記錄。'
    },
    {
      id: 'p1-situation-source-inventory', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(4) p[lang="en"]`, phrase: 'You will find all the information you need in the Question-Answer Book, the Data File and on the recording.',
      title: '建立三類來源清單', kind: 'hint', type: 5,
      translation: '所需資料分布在問答冊、資料檔和錄音。',
      explanation: '三類來源共同構成題目；不能用常識補寫卷內沒有的資料，也不能只靠 Lara 的電郵。',
      help: '日後每個內容點都要能回指卷內來源。'
    },
    {
      id: 'p1-situation-note-sheet-page-three', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(4) p[lang="en"]`, phrase: 'As you listen you can make notes on page 3 of the Data File.',
      title: '找到錄音筆記頁', kind: 'hint', type: 5,
      translation: '聆聽時可在資料檔第 3 頁記筆記。',
      explanation: '這是一條來源路線，只確認筆記頁位置；Stage 1 不會填入或展示錄音答案。',
      help: '下一步只定位頁面，不開始聆聽。'
    },
    {
      id: 'p1-route-note-sheet-visit', page: 3, sourcePage: 'Data File p.3', sourceJump: true,
      selector: '#page-3 .conference-notes h2', phrase: 'Listening note-taking sheet for podcast Nosing Around',
      quote: 'page 3 → Listening note-taking sheet for podcast Nosing Around', routeLabel: '錄音筆記頁', routeFrom: 'p1-situation-note-sheet-page-three',
      title: '來源路線 · 找到錄音筆記頁', kind: 'hint', type: 5,
      translation: '已找到《Nosing Around》錄音筆記頁。',
      explanation: '先確認這是 Lara 情境所指的第 3 頁。欄目和答案留待 Stage 2–3，現在不作分類或填寫。',
      help: '看清標題後返回情境文件。'
    },
    {
      id: 'p1-route-note-sheet-return', page: 2, sourcePage: 'Data File p.2', routeReturn: true,
      selector: `${situation} .bilingual:nth-of-type(4) p[lang="en"]`, phrase: 'As you listen you can make notes on page 3 of the Data File.',
      title: '返回情境文件', kind: 'hint', type: 5,
      translation: '回到第 2 頁的來源指示。',
      explanation: '來源位置已確認。繼續按原文件次序閱讀，不把筆記頁尚未出現的答案帶回 Stage 1。',
      help: '返回後只保留「第 3 頁是筆記頁」這項結構資訊。'
    },
    {
      id: 'p1-situation-five-minute-start', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(5) p[lang="en"]`, phrase: 'You now have five minutes to familiarize yourself with the Question-Answer Book and the Data File.',
      title: '重複程序仍不是內容', kind: 'noise', type: 6,
      translation: '現在有五分鐘熟悉問答冊及資料檔。',
      explanation: '這句再次提醒閱讀程序，不屬任何一項成品的內容要求。',
      help: '讀到時間提示時，先判斷它是作答程序還是正文資料。'
    },
    {
      id: 'p1-letter-heading-lara-to-indy', page: 4, sourcePage: 'Data File p.4',
      selector: '#page-4 .museum-email > h2:first-of-type', phrase: 'Email from Lara Gau to Indy Wong',
      highlight: false,
      title: '定位 Lara 的工作電郵', kind: 'hint', type: 5,
      translation: 'Lara Gau 寄給 Indy Wong 的電郵。',
      explanation: '這是三項工作要求的主文件。標題確認文件關係，不是可直接搬進三篇成品的內容。',
      help: '把這份文件當作 task contract，而不是 evidence bank。'
    },
    {
      id: 'p1-letter-to-indy', page: 4, sourcePage: 'Data File p.4',
      selector: `${letter} .email-headers > div:nth-child(1)`, phrase: 'To: Indy Wong',
      highlights: [{phrase: 'Indy Wong'}],
      title: '確認工作指示的收件人', kind: 'hint', type: 5,
      translation: '收件人：Indy Wong。',
      explanation: 'Indy 是執行者；這個 To 欄不是 Task A 外部電郵可沿用的收件人。',
      help: '「工作電郵收件人」和「成品讀者」要分開。'
    },
    {
      id: 'p1-letter-sent-2016-04-08', page: 4, sourcePage: 'Data File p.4',
      selector: `${letter} .email-headers > div:nth-child(2)`, phrase: 'Sent: Fri 8 April 2016 3:14 AM',
      title: '寄出時間只供排序', kind: 'noise', type: 6,
      translation: '寄出時間：2016 年 4 月 8 日星期五凌晨 3:14。',
      explanation: '時間可協助判斷文件先後，但三項成品都不要求重述 Lara 寄信的時間。',
      help: '行政欄位可以控制 chronology，卻未必是正文內容。'
    },
    {
      id: 'p1-letter-from-lara', page: 4, sourcePage: 'Data File p.4',
      selector: `${letter} .email-headers > div:nth-child(3)`, phrase: 'From: Lara Gau',
      highlights: [{phrase: 'Lara Gau'}],
      title: '確認指示者', kind: 'hint', type: 5,
      translation: '寄件人：Lara Gau。',
      explanation: 'Lara 是工作要求的發出者。她的話定義必須完成甚麼，但不會自動成為可寫入答案的事實。',
      help: '發出要求的人不一定是成品的最終讀者。'
    },
    {
      id: 'p1-letter-subject-things-to-do', page: 4, sourcePage: 'Data File p.4',
      selector: `${letter} .email-headers > div:nth-child(4)`, phrase: 'Subject: Things to do',
      highlights: [{phrase: 'Things to do'}],
      title: '主旨提示多項工作', kind: 'hint', type: 5,
      translation: '主旨：要處理的工作。',
      explanation: '這個內部主旨只提醒下文列出多項工作；Task A 要另擬與 plough 借用有關的 subject。',
      help: '不要把 Things to do 抄成 Task A 的主旨。'
    },
    {
      id: 'p1-letter-greeting-hi-indy', page: 4, sourcePage: 'Data File p.4',
      selector: `${emailBody} .bilingual:nth-of-type(1) p[lang="en"]`, phrase: 'Hi Indy',
      title: '內部稱呼不沿用', kind: 'noise', type: 6,
      translation: 'Indy，你好。',
      explanation: '這只反映 Lara 與 Indy 的內部工作關係；Task A 的外部讀者是 Ms Ip。',
      help: '稱呼必須跟真正收件人轉換。'
    },
    {
      id: 'p1-letter-small-talk-hong-kong', page: 4, sourcePage: 'Data File p.4',
      selector: `${emailBody} .bilingual:nth-of-type(2) p[lang="en"]`, phrase: 'How are things in Hong Kong?',
      title: '寒暄不是任務內容', kind: 'noise', type: 6,
      translation: '香港近況如何？',
      explanation: '這句令內部電郵自然，但沒有回答三項任務任何一項。',
      help: '刪去後 task contract 完全不變，所以不取材。'
    },
    {
      id: 'p1-letter-small-talk-mexico', page: 4, sourcePage: 'Data File p.4',
      selector: `${emailBody} .bilingual:nth-of-type(2) p[lang="en"]`, phrase: 'Mexico is great!',
      title: '私人近況不取材', kind: 'noise', type: 6,
      translation: '墨西哥很棒！',
      explanation: 'Lara 的旅行感受與 plough、farmhouse 和 museum report 均無關。',
      help: '背景出現在指示信內，不等於它能回應任務。'
    },
    {
      id: 'p1-letter-small-talk-return', page: 4, sourcePage: 'Data File p.4',
      selector: `${emailBody} .bilingual:nth-of-type(2) p[lang="en"]`, phrase: 'I’ll tell you all about it when I get back.',
      title: '私人安排不取材', kind: 'noise', type: 6,
      translation: '我回來後再告訴你詳情。',
      explanation: '這項私人安排不改變任何文類、讀者或內容要求。',
      help: '把社交語和任務規格分開標記。'
    },
    {
      id: 'p1-letter-three-things', page: 4, sourcePage: 'Data File p.4',
      selector: `${emailBody} .bilingual:nth-of-type(2) p[lang="en"]`, phrase: 'While I am away, I’ve got three things I need you to do.',
      highlight: false,
      title: '建立 Task A、B、C 三個分支', kind: 'hint', type: 5,
      translation: 'Lara 不在期間，有三項工作需要你完成。',
      explanation: '以下三段依次對應 Task A（原題 Task 8）、Task B（Task 9）和 Task C（Task 10）。',
      help: '三個分支要分開記錄，避免把不同讀者和內容要求混合。'
    },
    {
      id: 'p1-task-a-email-reply-ms-ip', page: 4, sourcePage: 'Data File p.4', task: 'A',
      selector: taskA, phrase: 'I need you to write an email to reply to Ms Ip about our museum borrowing the Chang Yee Tak Plough.',
      highlights: [
        {phrase: 'write an email'},
        {phrase: 'reply to Ms Ip'},
        {phrase: 'borrowing the Chang Yee Tak Plough'}
      ],
      title: 'Task A · 文類、讀者和目的', kind: 'A', type: 1,
      translation: '寫電郵回覆 Ms Ip，內容關於博物館借用 Chang Yee Tak Plough。',
      explanation: '成品是回覆電郵；外部讀者是 Ms Ip；目的為推進 plough 借用。不能寫成一般介紹文章。',
      help: '一句內同時圈出 email、reply to Ms Ip 和 borrowing the plough。'
    },
    {
      id: 'p1-task-a-read-and-answer-ms-ip', page: 4, sourcePage: 'Data File p.4', task: 'A',
      selector: taskA, phrase: 'Have a look at her email',
      highlights: taskASourceHighlights,
      title: 'Task A · 來源提示：查看 Ms Ip 電郵', kind: 'hint', type: 5,
      translation: '查看她的電郵。',
      explanation: '這是來源路線提示，告訴你下一步要到 Ms Ip 的電郵找資料；它本身不是 Task A 要寫入成品的內容。',
      help: '把「到哪裏找資料」和「成品必須做到甚麼」分開。'
    },
    {
      id: 'p1-route-ms-ip-email-visit', page: 6, sourcePage: 'Data File p.6', task: 'A', sourceJump: true,
      selector: '#page-6 .museum-email > h2', phrase: 'Email from Ip Lai Ping from the Shun Yee Tak Village Hall',
      quote: 'her email → Email from Ip Lai Ping', routeLabel: 'Ms Ip 的問題電郵', routeFrom: 'p1-task-a-read-and-answer-ms-ip',
      title: '來源路線 · Ms Ip 的電郵', kind: 'hint', type: 5,
      translation: '已找到 Ip Lai Ping 的電郵。',
      explanation: '這份文件將定義 Task A 要回答的疑問。Stage 1 只確認文件位置，不揭示其問題或證據答案。',
      help: '看清文件標題後返回 Lara 的句子。'
    },
    {
      id: 'p1-route-ms-ip-email-return', page: 4, sourcePage: 'Data File p.4', task: 'A', routeReturn: true,
      selector: taskA, phrase: 'Have a look at her email',
      highlights: taskASourceHighlights,
      title: '返回 Task A 指示', kind: 'hint', type: 5,
      translation: '回到 Lara 的來源提示。',
      explanation: '來源位置已確認。現在把來源提示和緊接的寫作要求分開處理，不提前揭示 Ms Ip 電郵內容。',
      help: '保留 route，不把 source evidence 當作 Stage 1 答案。'
    },
    {
      id: 'p1-task-a-answer-ms-ip-questions', page: 4, sourcePage: 'Data File p.4', task: 'A', point: '1',
      selector: taskA, phrase: 'and respond to her questions.',
      highlights: [{phrase: 'respond to her questions', point: '1'}],
      title: 'Task A · 必須逐項回答她的問題', kind: 'A', type: 1,
      translation: '並回應她提出的問題。',
      explanation: '這才是寫作要求：回覆不能只談拍照，亦要逐項處理 Ms Ip 的疑問。',
      help: '來源內有哪些問題，要到後續閱讀階段才逐項取證。'
    },
    {
      id: 'p1-task-a-photo-and-poster-purpose', page: 4, sourcePage: 'Data File p.4', task: 'A', point: '2',
      selector: taskA, phrase: 'It would also be great if we could photograph the plough - I want to put a photo of it on our new museum posters.',
      highlights: [
        {phrase: 'photograph the plough', point: '2'},
        {phrase: 'put a photo of it on our new museum posters'}
      ],
      title: 'Task A · 額外請求及指定用途', kind: 'A', type: 1,
      translation: 'Lara 希望拍攝 plough，並把照片用於新的博物館海報。',
      explanation: '這一個完整句子同時提供 photo permission request 和 new museum posters 的用途；兩部分都要保留。',
      help: '不要把連字符兩邊拆成兩個教學步驟；它們屬同一個句子和同一項要求。'
    },
    {
      id: 'p1-task-a-ask-permission', page: 4, sourcePage: 'Data File p.4', task: 'A', point: '3',
      selector: taskA, phrase: 'Could you ask her?',
      highlights: [{phrase: 'Could you ask her', point: '3'}],
      title: 'Task A · 必須真正提出拍照請求', kind: 'A', type: 1,
      translation: '你可以替我向她提出這項請求嗎？',
      explanation: '成品不用交代 Lara 曾叫 Indy 去問；應在寄給 Ms Ip 的電郵直接、禮貌地請求准許拍照。',
      help: '把內部交辦轉成外部 request sentence。'
    },
    {
      id: 'p1-task-b-website-context', page: 4, sourcePage: 'Data File p.4', task: 'B',
      selector: taskB, phrase: 'We are working on the museum website.',
      highlight: false,
      title: 'Task B · 發布平台是 museum website', kind: 'B', type: 2,
      translation: '博物館正在製作網站內容。',
      explanation: '這控制公開讀者和宣傳語氣；不用在成品重述「我們正在製作網站」。',
      help: '平台資訊控制表達方式，不一定成為正文內容。'
    },
    {
      id: 'p1-task-b-description-farmhouse', page: 4, sourcePage: 'Data File p.4', task: 'B',
      selector: taskB, phrase: 'Please write a description for the website to introduce the traditional farmhouse from Wang Chung Village.',
      highlights: [
        {phrase: 'write a description'},
        {phrase: 'traditional farmhouse from Wang Chung Village'}
      ],
      title: 'Task B · 文類與核心主題', kind: 'B', type: 2,
      translation: '為網站寫一篇介紹，介紹來自 Wang Chung Village 的傳統農舍。',
      explanation: '成品是面向博物館網站讀者的 description；farmhouse 是文章中心，不是一般村史報告。',
      help: '圈出 description、website 和 traditional farmhouse。'
    },
    {
      id: 'p1-task-b-found-and-village-facts', page: 4, sourcePage: 'Data File p.4', task: 'B', point: '1',
      selector: taskB, phrase: 'Mention how the farmhouse was found and include some interesting facts about Wang Chung Village.',
      highlights: [
        {phrase: 'how the farmhouse was found', point: '1'},
        {phrase: 'interesting facts about Wang Chung Village', point: '2'}
      ],
      title: 'Task B · 發現經過與村落資料', kind: 'B', type: 2,
      translation: '交代農舍如何被發現，並加入 Wang Chung Village 的有趣資料。',
      explanation: '同一句含兩項必寫內容：discovery 和 village facts。具體事實要留待來源閱讀，不可在 Stage 1 猜測。',
      help: '一個句子可有多個要求；仍維持一個 source-unit step。'
    },
    {
      id: 'p1-task-b-cupboard-summary', page: 4, sourcePage: 'Data File p.4', task: 'B', point: '3',
      selector: taskB, phrase: 'Include a brief summary of the amazing story of the kitchen cupboard, which is in the farmhouse.',
      highlights: [{phrase: 'brief summary of the amazing story of the kitchen cupboard', point: '3'}],
      title: 'Task B · 簡述 kitchen cupboard 故事', kind: 'B', type: 2,
      translation: '簡短概述位於農舍內的 kitchen cupboard 故事。',
      explanation: 'brief 是重要限制：故事要完整但精簡；which is in the farmhouse 把故事連回展品。',
      help: '先記「brief summary + cupboard in farmhouse」，內容留待資料來源核實。'
    },
    {
      id: 'p1-task-b-audience-prediction', page: 4, sourcePage: 'Data File p.4', task: 'B',
      selector: taskB, phrase: 'People will love that story.',
      highlight: false,
      title: 'Task B · 宣傳方向，不是事實', kind: 'hint', type: 4,
      translation: 'Lara 認為讀者會喜歡這個故事。',
      explanation: '這是預測和宣傳意圖，不證明所有人一定喜歡。它只提醒你把故事寫得吸引。',
      help: '不要把 opinion 改寫成調查結果。'
    },
    {
      id: 'p1-task-b-whatsapp-source', page: 4, sourcePage: 'Data File p.4', task: 'B',
      selector: taskB, phrase: 'Dr Jones said he would send a WhatsApp to give you some ideas.',
      highlights: taskBSourceHighlights,
      title: 'Task B · WhatsApp 是後續線索', kind: 'hint', type: 5,
      translation: 'Dr Jones 會用 WhatsApp 提供一些構思。',
      explanation: '這句指向另一份來源。傳送安排沒有獨立內容價值；Stage 1 只建立路線。',
      help: '不要把「Dr Jones said」寫入網站介紹。'
    },
    {
      id: 'p1-route-whatsapp-visit', page: 7, sourcePage: 'Data File p.7', task: 'B', sourceJump: true,
      selector: '#page-7 .museum-whatsapp > h2', phrase: 'WhatsApp messages from the Social History Museum group',
      quote: 'a WhatsApp → Social History Museum group messages', routeLabel: 'Dr Jones 的 WhatsApp 線索', routeFrom: 'p1-task-b-whatsapp-source',
      title: '來源路線 · WhatsApp 訊息', kind: 'hint', type: 5,
      translation: '已找到 Social History Museum 群組訊息。',
      explanation: '這份文件會在後續階段提供線索。現在只看標題，不展示其中的 farmhouse 或 cupboard 答案。',
      help: '確認來源後返回 Lara 的 Task B 句子。'
    },
    {
      id: 'p1-route-whatsapp-return', page: 4, sourcePage: 'Data File p.4', task: 'B', routeReturn: true,
      selector: taskB, phrase: 'Dr Jones said he would send a WhatsApp to give you some ideas.',
      highlights: taskBSourceHighlights,
      title: '返回 Task B 指示', kind: 'hint', type: 5,
      translation: '回到 Lara 的 WhatsApp 來源提示。',
      explanation: '來源位置已確認；繼續讀 Task C，不提前採用訊息內的任何內容。',
      help: '路線和證據要分兩個階段處理。'
    },
    {
      id: 'p1-task-c-report-board-problems-recommendations', page: 4, sourcePage: 'Data File p.4', task: 'C', point: '1',
      selector: taskC, phrase: 'I need you to write the main section of a report to the Museum Board, which covers the problems the museum has been having and the recommendations we would like to suggest.',
      highlights: [
        {phrase: 'main section of a report'},
        {phrase: 'Museum Board'},
        {phrase: 'problems', point: '1'},
        {phrase: 'recommendations', point: '2'}
      ],
      title: 'Task C · 文類、讀者和兩大內容', kind: 'C', type: 3,
      translation: '撰寫呈交 Museum Board 的報告主體，涵蓋問題和建議。',
      explanation: '成品是 report main section；讀者是 Museum Board；每個分支都要有 problem 和 recommendation。',
      help: '圈出 main section、Museum Board、problems 和 recommendations。'
    },
    {
      id: 'p1-task-c-incidents', page: 4, sourcePage: 'Data File p.4', task: 'C', point: '3',
      selector: taskC, phrase: 'Please mention incidents which illustrate these problems.',
      highlights: [{phrase: 'incidents which illustrate these problems', point: '3'}],
      title: 'Task C · 必須用事件說明問題', kind: 'C', type: 3,
      translation: '提及能說明這些問題的事件。',
      explanation: '報告不能只有抽象批評或建議；要以具體 incidents 說明每項問題。',
      help: '先建立 problem → incident → recommendation 三欄，Stage 1 不填具體答案。'
    },
    {
      id: 'p1-task-c-start-with-two-sources', page: 4, sourcePage: 'Data File p.4', task: 'C',
      selector: taskC, phrase: 'Start by looking at the email from Ms O’Conner and the minutes of the recent staff meeting.',
      highlights: taskCSourceHighlights,
      title: 'Task C · 從兩份指定文件開始', kind: 'hint', type: 5,
      translation: '先查看 Ms O’Conner 的電郵和最近職員會議紀錄。',
      explanation: '一句內指定兩份獨立來源，所以要逐一定位；start by 表示它們是起點，不保證是唯一來源。',
      help: '先走兩條來源路線，仍不要提取後續內容。'
    },
    {
      id: 'p1-route-ms-oconner-visit', page: 10, sourcePage: 'Data File p.10', task: 'C', sourceJump: true,
      selector: '#page-10 .museum-email > h2', phrase: 'Email from Ms O’Conner',
      quote: 'email from Ms O’Conner → Data File page 10', routeLabel: 'Ms O’Conner 的電郵', routeFrom: 'p1-task-c-start-with-two-sources',
      title: '來源路線 · Ms O’Conner 電郵', kind: 'hint', type: 5,
      translation: '已找到 Ms O’Conner 的電郵。',
      explanation: '這是 Task C 的第一個指定起點。Stage 1 只確認文件，不揭示投訴、事件或建議。',
      help: '下一步先返回原句，再走第二條來源路線。'
    },
    {
      id: 'p1-route-ms-oconner-return', page: 4, sourcePage: 'Data File p.4', task: 'C', routeReturn: true,
      selector: taskC, phrase: 'Start by looking at the email from Ms O’Conner and the minutes of the recent staff meeting.',
      highlights: taskCSourceHighlights,
      title: '返回雙來源指示', kind: 'hint', type: 5,
      translation: '回到 Lara 指定兩份文件的句子。',
      explanation: '第一份來源已定位；同一句還有 staff meeting minutes，必須繼續走第二條路線。',
      help: '不要在第一份文件找到後便忽略 and 後面的第二份來源。'
    },
    {
      id: 'p1-route-staff-minutes-visit', page: 5, sourcePage: 'Data File p.5', task: 'C', sourceJump: true,
      selector: '#page-5 .museum-minutes > h2', phrase: 'Minutes from museum staff meeting',
      quote: 'recent staff meeting minutes → Data File page 5', routeLabel: '最近職員會議紀錄', routeFrom: 'p1-task-c-start-with-two-sources',
      title: '來源路線 · Staff meeting minutes', kind: 'hint', type: 5,
      translation: '已找到博物館職員會議紀錄。',
      explanation: '這是 Task C 的第二個指定起點。Stage 1 不會展示會議內任何決定。',
      help: '確認標題後返回 Lara 的 Task C 指示。'
    },
    {
      id: 'p1-route-staff-minutes-return', page: 4, sourcePage: 'Data File p.4', task: 'C', routeReturn: true,
      selector: taskC, phrase: 'Start by looking at the email from Ms O’Conner and the minutes of the recent staff meeting.',
      highlights: taskCSourceHighlights,
      title: '返回 Task C 指示', kind: 'hint', type: 5,
      translation: '兩份指定起點都已定位。',
      explanation: '現在只保留來源路線，繼續讀最後的格式限制；後續內容留待 Data File 階段。',
      help: '來源已找到不等於證據已分析。'
    },
    {
      id: 'p1-task-c-official-paragraph-form', page: 4, sourcePage: 'Data File p.4', task: 'C',
      selector: taskC, phrase: 'Since this report will be kept for official records it must be written in paragraph form.',
      highlights: [
        {phrase: 'official records'},
        {phrase: 'must'},
        {phrase: 'paragraph form'}
      ],
      title: 'Task C · 正式記錄與段落格式', kind: 'C', type: 4,
      translation: '報告會作正式記錄，因此必須以段落形式撰寫。',
      explanation: '這是強制資格，不是建議：使用完整 paragraphs；不能只交項目符號，也不用電郵稱呼和結語。',
      help: '圈出 official records、must 和 paragraph form。'
    },
    {
      id: 'p1-letter-signoff-lara', page: 4, sourcePage: 'Data File p.4',
      selector: `${emailBody} .bilingual:nth-of-type(6) p[lang="en"]`, phrase: 'Lara',
      title: 'Lara 的署名不能沿用', kind: 'noise', type: 6,
      translation: 'Lara（署名）。',
      explanation: '這只再次確認指示來源。三項成品由 Indy 撰寫，不能以 Lara 署名。',
      help: '行政署名有辨識功能，但不是成品內容。'
    },
    {
      id: 'p1-task-a-qab-heading', page: 11, sourcePage: 'Question-Answer Book p.1', task: 'A',
      selector: '#page-11 .museum-answer > h2', phrase: 'Task 8: Email to Ms Ip Lai Ping',
      title: 'Task A · 官方題目確認讀者與文類', kind: 'A', type: 1,
      translation: 'Task 8：寫給 Ms Ip Lai Ping 的電郵。',
      explanation: 'Question-Answer Book 再次確認 Task A 是 email，收件人是 Ms Ip；這不是 Lara 的內部電郵。',
      help: '原題 Task 8 在 Super Curation 中稱為 Task A。'
    },
    {
      id: 'p1-task-a-qab-instruction', page: 11, sourcePage: 'Question-Answer Book p.1', task: 'A',
      selector: '#page-11 .museum-answer .bilingual p[lang="en"]', phrase: 'Write an email to Ms Ip Lai Ping about the Chang Yee Tak Plough using information from the B2 Data File and your notes.',
      title: 'Task A · 正式來源與題材範圍', kind: 'A', type: 1,
      translation: '使用 B2 資料檔和筆記，寫電郵給 Ms Ip，內容關於 Chang Yee Tak Plough。',
      explanation: '可用資料必須來自 B2 Data File 和 notes；題材限於 plough。不能用常識補寫未提供的承諾。',
      help: '把 source requirement 和 topic scope 一起記下。'
    },
    {
      id: 'p1-task-a-qab-word-limit', page: 11, sourcePage: 'Question-Answer Book p.1', task: 'A',
      selector: '#page-11 .museum-answer .bilingual p[lang="en"]', phrase: 'Write around 120 words.',
      title: 'Task A · 約 120 字', kind: 'A', type: 5,
      translation: '撰寫約 120 字。',
      explanation: '篇幅要求回覆精簡並逐項處理問題。字數限制本身不寫入電郵正文。',
      help: '每個 required point 都要有位置，但避免重述內部背景。'
    },
    {
      id: 'p1-task-a-qab-to-field', page: 11, sourcePage: 'Question-Answer Book p.1', task: 'A',
      selector: '#page-11 .email-answer-head > p', phrase: 'To: Ip Lai Ping',
      title: 'Task A · 預填收件人', kind: 'A', type: 5,
      translation: '收件人已預填為 Ip Lai Ping。',
      explanation: '這個欄位視覺上再次確認讀者；不要改成 Lara 或 Indy。',
      help: '預填欄位是作答規格的一部分。'
    },
    {
      id: 'p1-task-a-qab-subject-field', page: 11, sourcePage: 'Question-Answer Book p.1', task: 'A',
      selector: '#page-11 .email-answer-head > label', phrase: 'Subject:',
      title: 'Task A · 需要自擬主旨', kind: 'A', type: 5,
      translation: '主旨欄留白，須由考生填寫。',
      explanation: '應擬與 plough loan／reply 相關的 subject；不能沿用 Lara 電郵的 Things to do。',
      help: '主旨要讓 Ms Ip 一眼知道回覆主題。'
    },
    {
      id: 'p1-task-b-qab-heading', page: 13, sourcePage: 'Question-Answer Book p.3', task: 'B',
      selector: '#page-13 .museum-answer > h2', phrase: 'Task 9: Introduction to Wang Chung traditional farmhouse and village',
      title: 'Task B · 官方文類是 introduction', kind: 'B', type: 2,
      translation: 'Task 9：Wang Chung 傳統農舍與村落介紹。',
      explanation: 'Question-Answer Book 把 Lara 所說的 description 明確為 public-facing introduction。',
      help: '原題 Task 9 在 Super Curation 中稱為 Task B。'
    },
    {
      id: 'p1-task-b-qab-instruction', page: 13, sourcePage: 'Question-Answer Book p.3', task: 'B',
      selector: '#page-13 .museum-answer .bilingual p[lang="en"]', phrase: 'Write an introduction to Wang Chung traditional farmhouse and village for the museum website using information from the B2 Data File and your notes.',
      title: 'Task B · 平台、題材與正式來源', kind: 'B', type: 2,
      translation: '使用 B2 資料檔和筆記，為博物館網站寫 Wang Chung 農舍與村落介紹。',
      explanation: '讀者是 museum website 訪客；題材和來源均有明確限制。',
      help: 'website、farmhouse and village、Data File and notes 三組詞都要保留。'
    },
    {
      id: 'p1-task-b-qab-word-limit', page: 13, sourcePage: 'Question-Answer Book p.3', task: 'B',
      selector: '#page-13 .museum-answer .bilingual p[lang="en"]', phrase: 'Write around 150 words.',
      title: 'Task B · 約 150 字', kind: 'B', type: 5,
      translation: '撰寫約 150 字。',
      explanation: '篇幅要求你精選 farmhouse、village facts 和 cupboard story，不可把所有資料逐項堆入。',
      help: 'brief summary 的限制與 150 字要求互相配合。'
    },
    {
      id: 'p1-task-c-qab-heading', page: 15, sourcePage: 'Question-Answer Book p.5', task: 'C',
      selector: '#page-15 .museum-answer > h2', phrase: 'Task 10: Report to Museum Board',
      title: 'Task C · 官方文類與讀者', kind: 'C', type: 3,
      translation: 'Task 10：呈交 Museum Board 的報告。',
      explanation: '正式題目確認 report genre 和 Museum Board 讀者，與 Lara 電郵要求一致。',
      help: '原題 Task 10 在 Super Curation 中稱為 Task C。'
    },
    {
      id: 'p1-task-c-qab-instruction', page: 15, sourcePage: 'Question-Answer Book p.5', task: 'C',
      selector: '#page-15 .museum-answer .bilingual p[lang="en"]', phrase: 'Write the main section of the report to the Museum Board using information from the B2 Data File.',
      title: 'Task C · 只寫主體並使用 Data File', kind: 'C', type: 3,
      translation: '使用 B2 資料檔，撰寫呈交 Museum Board 報告的主要部分。',
      explanation: '只需 main section，不用電郵稱呼、完整封面或署名；指定來源是 B2 Data File。',
      help: '注意 Task C 的正式題目沒有寫 notes。不要自行擴大來源。'
    },
    {
      id: 'p1-task-c-qab-word-limit', page: 15, sourcePage: 'Question-Answer Book p.5', task: 'C',
      selector: '#page-15 .museum-answer .bilingual p[lang="en"]', phrase: 'Write around 200 words.',
      title: 'Task C · 約 200 字', kind: 'C', type: 5,
      translation: '撰寫約 200 字。',
      explanation: '篇幅要容納問題、相關事件和建議，並以完整段落組織。字數本身不寫入報告。',
      help: '每段可依 problem → incident → recommendation 組織。'
    },
    {
      id: 'p1-stage-complete', page: 4, sourcePage: 'Stage 1 review', final: true,
      selector: '#page-4 .museum-email > h2:first-of-type', phrase: 'Email from Lara Gau to Indy Wong',
      highlight: false,
      quote: 'Stage 1 complete · identity, readers, genres, requirements, sources and restrictions checked',
      title: 'Stage 1 完成 · 任務合約已建立', kind: 'hint', type: 5,
      translation: '已完成 2016 Part 1 任務指示分析。',
      explanation: '你已核對 Indy 的身分、三項文類與讀者、所有內容要求、四條文件路線、正式來源、字數和格式限制，也排除了寒暄及行政欄位。Stage 2–5 仍鎖定，未揭示任何後續答案。',
      points: ['Task A：回覆 Ms Ip 的借用電郵，回答問題並請求拍照作海報用途。', 'Task B：博物館網站介紹，包含發現經過、村落資料及簡短 cupboard 故事。', 'Task C：Museum Board 報告主體，以事件說明問題並提出建議，使用段落。'],
      help: '如有任何一項文類、讀者、來源或限制仍不清楚，可在進入 Stage 2 前加入書籤。'
    }
  ];

  const categories = [
    {
      id: 'p2-category-staff-manual', page: 4, sourcePage: 'Data File p.4',
      selector: '#page-4 .museum-email > h2:nth-of-type(2)',
      title: '借用品職員手冊', quote: 'Staff manual on borrowing of items',
      documentType: '政策手冊', writer: '博物館政策編寫者', reader: '博物館職員', date: '未列明',
      initialTasks: ['A'], possibleFinalTasks: ['A'],
      explanation: '先只看標題與文件類型：「borrowing of items」直接對應 Task A 的借用電郵，所以暫定標 A。',
      revision: '閱讀後仍可保留 A；句子是否真正可用，要到逐句取證時才判斷。',
      help: '先找 task noun：borrowing / borrowed items 與哪一項工作的核心最接近？'
    },
    {
      id: 'p2-category-staff-minutes', page: 5, sourcePage: 'Data File p.5',
      selector: '#page-5 .museum-minutes > h2',
      title: '博物館職員會議紀錄', quote: 'Minutes from museum staff meeting',
      documentType: '會議紀錄', writer: 'Cindy Lau（秘書；記錄與會者發言）', reader: '博物館職員', date: '2016-04-05',
      initialTasks: ['C'], possibleFinalTasks: ['A', 'C'],
      explanation: 'Boss Letter 已明確叫你為 Task C 查看會議紀錄，所以第一輪先標 C；不要因為知道答案而提前加上其他任務。',
      revision: '細讀後可能發現同一份會議紀錄亦服務另一項任務；保留原來的 C，再加新字母，不要覆蓋。',
      help: 'Stage 2 只運用已知的 source route。先標 C，之後才容許 cross-task revision。'
    },
    {
      id: 'p2-category-ip-email', page: 6, sourcePage: 'Data File p.6',
      selector: '#page-6 .museum-email > h2',
      title: 'Ip Lai Ping 的來信', quote: 'Email from Ip Lai Ping from the Shun Yee Tak Village Hall',
      documentType: '外部電郵', writer: 'Ip Lai Ping', reader: 'Lara Gau', date: '2016-04-01',
      initialTasks: ['A'], possibleFinalTasks: ['A'],
      explanation: 'Task A 要回覆 Ms Ip，而 Boss Letter 指示先看她的電郵；文件標題足以支持暫定 A。',
      revision: '閱讀後仍是 A 的核心來源；這一步不展示她問了甚麼。',
      help: '把「成品讀者」與「這份來源文件的收件人」分開，但兩者的 Ms Ip 路線相連。'
    },
    {
      id: 'p2-category-whatsapp', page: 7, sourcePage: 'Data File p.7',
      selector: '#page-7 .museum-whatsapp > h2',
      title: '博物館群組 WhatsApp', quote: 'WhatsApp messages from the Social History Museum group',
      documentType: '群組即時訊息', writer: 'Dr Jack Jones、Lara Gau', reader: '博物館群組', date: '2016-04-08',
      initialTasks: ['B'], possibleFinalTasks: ['B', 'C'],
      explanation: 'Boss Letter 說 Dr Jones 會用 WhatsApp 提供 Task B 線索，所以第一輪先標 B。',
      revision: '細讀完整對話後可能需要增加另一個任務字母。照片本身不證明相中物件就是要借的 Chang Yee Tak Plough，因此不應只憑圖片加 A。',
      help: '群組對話可在中途轉題。先用 Boss Letter 已知路線分類，閱讀後再修正。'
    },
    {
      id: 'p2-category-resident-interview', page: 8, sourcePage: 'Data File p.8',
      selector: '#page-8 .museum-interview > h2',
      title: 'Wang Chung 村民訪問', quote: 'Transcript of interview with Wang Chung Village resident',
      documentType: '訪問逐字稿', writer: 'Dr Jones、Mrs Wang', reader: '博物館研究讀者', date: '未列明',
      initialTasks: ['B'], possibleFinalTasks: ['B'],
      explanation: '標題中的 Wang Chung Village 與 Task B 的 farmhouse and village introduction 直接相符，暫定 B。',
      revision: '文件整體仍屬 B，但並非每段都相關；逐句取證時仍要排除 Mrs Wang 後來生活的支線。',
      help: '頁面分類不等於全頁每一句都可寫。現在只判斷文件主要服務哪項任務。'
    },
    {
      id: 'p2-category-news-article', page: 9, sourcePage: 'Data File p.9 · 文件 1',
      selector: '#page-9 .museum-news-survey > h2:nth-of-type(1)',
      title: '1983 年新聞文章', quote: 'Article from Hong Kong News, August 30, 1983',
      documentType: '新聞報道', writer: 'Jovi Bon', reader: '報章讀者', date: '1983-08-30',
      initialTasks: ['B'], possibleFinalTasks: ['B'],
      explanation: 'Task B 要簡述 cupboard story；1983 年的新聞標題與年代提示它是故事的歷史來源，暫定 B。',
      revision: '閱讀後仍保留 B。來源年代有助核對故事，但 Stage 2 不提前展示任何故事細節。',
      help: '把 page 9 的兩個文件分開判斷；同頁不代表同一任務。'
    },
    {
      id: 'p2-category-visitor-survey', page: 9, sourcePage: 'Data File p.9 · 文件 2',
      selector: '#page-9 .museum-news-survey > h2:nth-of-type(2)',
      title: '博物館訪客網上調查', quote: 'Question Wizard online survey results of museum visitors',
      documentType: '量化調查結果', writer: 'Question Wizard／博物館訪客', reader: '博物館決策者', date: '未列明',
      initialTasks: ['C'], possibleFinalTasks: ['C'],
      explanation: '訪客調查很可能用來證明博物館問題並支持建議，與 Task C 的報告目的相符，暫定 C。',
      revision: '閱讀後仍保留 C；每一行數字是否支持投訴，要到逐句取證再判斷。',
      help: '這是 page 9 的第二份獨立文件；不要沿用上一個新聞文件的 B 標記。'
    },
    {
      id: 'p2-category-oconnor-email', page: 10, sourcePage: 'Data File p.10',
      selector: '#page-10 .museum-email > h2',
      title: 'Ms O’Conner 的投訴電郵', quote: 'Email from Ms O’Conner',
      documentType: '外部投訴電郵', writer: 'S. O’Conner', reader: 'Dr Jack Jones', date: '2016-04-02',
      initialTasks: ['C'], possibleFinalTasks: ['C'],
      explanation: 'Boss Letter 明確叫你為 Task C 先看 Ms O’Conner 的電郵，所以暫定 C。',
      revision: '閱讀後仍是 C 的問題與事件來源；投訴者的判斷仍要保留其來源身分。',
      help: 'source route 已經足夠分類；不要在 Stage 2 把投訴內容整段揭示。'
    },
    {
      id: 'p2-category-note-sheet', page: 3, sourcePage: 'Data File p.3',
      selector: '#page-3 .conference-notes > h2',
      title: 'Nosing Around 聆聽筆記頁', quote: 'Listening note-taking sheet for podcast Nosing Around',
      documentType: '聆聽筆記框架', writer: '考卷編寫者', reader: '考生', date: '錄音日期未列明',
      initialTasks: [], possibleFinalTasks: ['A', 'B'], uncertain: true,
      explanation: '只看總標題，無法知道整頁屬 A、B 還是 C；先標「未能確定」，再逐一檢查四個原生欄目。',
      revision: '欄目分類後會看出這頁混合 A、B 和不取材分支；總標題本身仍不應被當作答案。',
      help: '不確定是有效的 Stage 2 決定。不要為了填滿 A/B/C 而猜測。'
    },
    {
      id: 'p2-category-note-museum-directions', page: 3, sourcePage: 'Data File p.3 · 錄音欄目 1',
      selector: '#page-3 .notes-form-body > h3:nth-of-type(1)',
      title: 'Social History Museum（包括路線）', quote: 'Social History Museum (and directions)',
      documentType: '聆聽筆記欄目', writer: 'Patty Leung、Dr Jack Jones', reader: '考生', date: '錄音日期未列明',
      initialTasks: [], possibleFinalTasks: [], noTask: true,
      explanation: '三項任務都沒有要求介紹博物館定義或前往方法；這個欄目應標「不屬 A/B/C」。',
      revision: '聆聽後仍是有效筆記內容，但不進入三篇指定寫作。',
      help: '問自己：刪去 museum directions 後，A、B、C 的指定內容會否缺失？答案是否定的。'
    },
    {
      id: 'p2-category-note-farmhouse-village', page: 3, sourcePage: 'Data File p.3 · 錄音欄目 2',
      selector: '#page-3 .notes-form-body > h3:nth-of-type(2)',
      title: 'Wang Chung 農舍與村落', quote: 'Wang Chung Traditional Farmhouse and Village',
      documentType: '聆聽筆記欄目', writer: 'Patty Leung、Dr Jack Jones', reader: '考生', date: '錄音日期未列明',
      initialTasks: ['B'], possibleFinalTasks: ['B'],
      explanation: '欄目標題與 Task B 的 farmhouse and village introduction 直接相符，暫定 B。',
      revision: '聆聽後仍保留 B；具體可用資料留待 Stage 3–4。',
      help: '這是最直接的 title-to-task match，不需要提前猜錄音答案。'
    },
    {
      id: 'p2-category-note-dr-jones-talk', page: 3, sourcePage: 'Data File p.3 · 錄音欄目 3',
      selector: '#page-3 .notes-form-body > h3:nth-of-type(3)',
      title: 'Dr Jones 的講座', quote: 'Dr Jones’ Talk',
      documentType: '聆聽筆記欄目', writer: 'Patty Leung、Dr Jack Jones', reader: '考生', date: '錄音日期未列明',
      initialTasks: [], possibleFinalTasks: [], noTask: true,
      explanation: '三項任務都沒有要求宣傳 Dr Jones 的講座；主題相近不等於符合 task contract，標「不屬 A/B/C」。',
      revision: '聆聽後仍是寫作噪音；日期、時間和邀請內容不進入 A、B 或 C。',
      help: '用 task contract 測試，而不是只看它是否與博物館或農業有關。'
    },
    {
      id: 'p2-category-note-plough', page: 3, sourcePage: 'Data File p.3 · 錄音欄目 4',
      selector: '#page-3 .notes-form-body > h3:nth-of-type(4)',
      title: 'Chang Yee Tak Plough', quote: 'Chang Yee Tak Plough',
      documentType: '聆聽筆記欄目', writer: 'Patty Leung、Dr Jack Jones', reader: '考生', date: '錄音日期未列明',
      initialTasks: ['A'], possibleFinalTasks: ['A'],
      explanation: '欄目標題直接對應 Task A 的 plough 借用電郵，暫定 A。',
      revision: '聆聽後仍保留 A；真正的借用理由要等錄音內容出現才記錄。',
      help: '先分類欄目，不要把尚未播放的錄音內容補進去。'
    }
  ];

  const lesson = {
    version: '2016-b2-super-curation-stage1-v2',
    stage2Version: '2016-b2-super-curation-stage2-v1',
    stage3Version: '2016-b2-super-curation-stage3-v1',
    storageKey: 'edmund-paper3-2016-b2-super-curation-stage1-v2',
    stages: [
      {id: 'instruction', label: '任務指示', enabled: true},
      {id: 'categorize', label: '資料分類', enabled: true},
      {id: 'podcast', label: '聆聽錄音', enabled: true},
      {id: 'data', label: '逐句取證', enabled: false},
      {id: 'writing', label: '三篇寫作', enabled: false}
    ],
    steps,
    categories
  };

  window.EDMUND_2016_B2_CURATION = Object.freeze(lesson);
})();

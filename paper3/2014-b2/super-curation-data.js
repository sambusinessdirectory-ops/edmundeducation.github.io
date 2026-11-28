(() => {
  'use strict';

  const situation = '#page-2 .situation-box';
  const letter = '#page-4 .email-window';
  const emailBody = `${letter} .email-content`;
  const taskA = `${emailBody} .bilingual:nth-of-type(3) p[lang="en"]`;
  const taskAList = `${emailBody} > ul`;
  const taskAClosing = `${emailBody} .bilingual:nth-of-type(4) p[lang="en"]`;
  const taskB = `${emailBody} .bilingual:nth-of-type(5) p[lang="en"]`;
  const taskC = `${emailBody} .bilingual:nth-of-type(6) p[lang="en"]`;

  const steps = [
    {
      id: 'p1-situation-writer-joey-wong', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(1) p[lang="en"]`, phrase: 'Joey Wong', quote: 'You are Joey Wong.', essential: true,
      title: '先確認寫作者身分', kind: 'hint', type: 5,
      translation: '你是 Joey Wong。',
      explanation: '三項成品都由 Joey 撰寫。這句控制第一人稱、立場和署名，不是可直接搬進正文的資料點。',
      help: '先把「我是誰」和「成品寫給誰」分開；後者要按每項任務另行判斷。'
    },
    {
      id: 'p1-situation-role-hospital-assistant', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(1) p[lang="en"]`, phrase: 'an assistant', secondaryPhrases: ['Kowloon Exotic Pets Hospital'], quote: 'You are an assistant at the Kowloon Exotic Pets Hospital, which takes care of people’s unusual pets.', essential: true,
      title: '確定職位、機構和職能', kind: 'hint', type: 4,
      translation: '你是九龍珍禽異獸寵物醫院的助理；醫院照顧人們飼養的非一般寵物。',
      explanation: 'Joey 代表醫院處理工作，但職級只是 assistant。關係子句交代醫院職能，兩者主要控制專業語氣和機構立場，並非要求在三篇成品逐字自我介紹。',
      help: '圈出 assistant、醫院名稱和 which 後的職能；把背景與必寫內容分開。'
    },
    {
      id: 'p1-situation-boss-task-overview', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(1) p[lang="en"]`, phrase: 'Your boss, Kerry Lam, has asked you to help with the development of the Hospital’s website and other tasks.',
      title: '確認指示者與任務總引', kind: 'hint', type: 5,
      translation: '你的上司 Kerry Lam 請你協助發展醫院網站及處理其他工作。',
      explanation: 'Kerry 是有權交辦工作的上司；這句只預告網站工作和其他任務。具體文類、讀者和內容要到第 4 頁電郵逐項確認。',
      help: '把這句視為 task contract 的入口，不要把概括字眼當作完整要求。'
    },
    {
      id: 'p1-situation-podcast-recording', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(2) p[lang="en"]`, phrase: 'a recording of a podcast', quote: 'You will listen to a recording of a podcast.', essential: true,
      title: '辨認聲音來源', kind: 'hint', type: 5,
      translation: '你將聆聽一段 podcast 錄音。',
      explanation: '錄音是正式來源之一，但 podcast 這個標籤本身不是答案內容。Stage 1 只建立來源路線，不提前展示聆聽答案。',
      help: '先記來源形式；真正資料要留待 Podcast 階段逐點核實。'
    },
    {
      id: 'p1-situation-podcast-speakers', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(2) p[lang="en"]`, phrase: 'Neelay Shah and Wendy Yee', quote: 'In the podcast you will hear an interview with Neelay Shah and Wendy Yee.', essential: true,
      title: '辨認受訪者', kind: 'hint', type: 5,
      translation: 'Podcast 會播放 Neelay Shah 和 Wendy Yee 的訪問。',
      explanation: '姓名讓學生在錄音中辨認不同權威來源；它們不是三篇成品必須列出的內容。',
      help: '先記 speaker identity，稍後才判斷各人的資料可支援哪一項任務。'
    },
    {
      id: 'p1-situation-five-minute-preview', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(3) p[lang="en"]`, phrase: 'Before the recording is played, you will have five minutes to study the Question-Answer Book and the Data File for Part B1 and the Question-Answer Book and the Data File for Part B2.',
      title: '五分鐘是考試程序', kind: 'noise', type: 6,
      translation: '錄音播放前有五分鐘閱讀 B1、B2 的問答冊和資料檔。',
      explanation: '這句管理考試流程，並不提供 Task A、B 或 C 的正文內容。',
      help: '標成「要遵守，但不寫入成品」。'
    },
    {
      id: 'p1-situation-choose-one-part', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(3) p[lang="en"]`, phrase: 'Remember you must choose to do the tasks in either Part B1 or Part B2.',
      title: '分卷選擇不是作文內容', kind: 'noise', type: 6,
      translation: '你必須選擇完成 B1 或 B2 的任務。',
      explanation: '這是選卷規則。選定 B2 後遵守即可，不應寫入任何一篇成品。',
      help: '把行政規則與 B2 task contract 分開。'
    },
    {
      id: 'p1-situation-do-not-attempt-both', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(3) p[lang="en"]`, phrase: 'Do NOT attempt both Parts B1 and B2.',
      title: '禁止同時作答兩部', kind: 'noise', type: 6,
      translation: '不要同時作答 B1 和 B2。',
      explanation: '大寫 NOT 加強考試限制，但沒有新增任何寫作內容。',
      help: '重要不等於可取材；先問它控制流程還是控制文章。'
    },
    {
      id: 'p1-situation-follow-qab-and-recording', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(4) p[lang="en"]`, phrase: 'Question-Answer Book', secondaryPhrases: ['the recording'], quote: 'Complete the tasks by following the instructions in the Question-Answer Book that you choose and on the recording.', essential: true,
      title: '兩處正式指示都要遵守', kind: 'hint', type: 5,
      translation: '按所選問答冊及錄音中的指示完成任務。',
      explanation: 'Question-Answer Book 和錄音共同控制作答；單看其中一處可能漏掉規格或資料。現有分析沒有完整 QAB 題目頁，因此不能補寫看不到的題目措辭。',
      help: '把「任務規格」和「資料來源」分欄記錄，並公開缺失來源。'
    },
    {
      id: 'p1-situation-closed-source-set', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(4) p[lang="en"]`, phrase: 'You will find all the information you need in the Question-Answer Book and Data File that you choose and on the recording.',
      title: '建立封閉的來源範圍', kind: 'hint', type: 5,
      translation: '所需資料都在所選問答冊、資料檔和錄音之中。',
      explanation: '三類來源構成封閉證據範圍；不能用外來常識補寫卷內沒有的資料，也不能只靠 Kerry 的電郵。',
      help: '日後每個內容點都要能回指卷內來源。'
    },
    {
      id: 'p1-situation-note-sheet-page-three', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(4) p[lang="en"]`, phrase: 'page 3 of the Data File', quote: 'As you listen you can make notes on page 3 of the Data File.', essential: true,
      title: '找到錄音筆記頁', kind: 'hint', type: 5,
      translation: '聆聽時可在資料檔第 3 頁記筆記。',
      explanation: '這是一條來源路線，只確認筆記頁位置；Stage 1 不會填入或展示錄音答案。',
      help: '下一步只定位頁面，不開始聆聽。'
    },
    {
      id: 'p1-route-note-sheet-visit', page: 3, sourcePage: 'Data File p.3', sourceJump: true,
      selector: '#page-3 .conference-notes h2', phrase: 'Listening note-taking sheet for the Pet Club podcast',
      quote: 'page 3 → Listening note-taking sheet for the Pet Club podcast', routeLabel: 'Pet Club 錄音筆記頁', routeFrom: 'p1-situation-note-sheet-page-three',
      title: '來源路線 · 找到錄音筆記頁', kind: 'hint', type: 5,
      translation: '已找到《Pet Club》錄音筆記頁。',
      explanation: '先確認這就是第 2 頁所指的 page 3。欄目和答案留待 Stage 2–3，現在不作分類或填寫。',
      help: '看清標題後返回情境文件。'
    },
    {
      id: 'p1-route-note-sheet-return', page: 2, sourcePage: 'Data File p.2', routeReturn: true,
      selector: `${situation} .bilingual:nth-of-type(4) p[lang="en"]`, phrase: 'As you listen you can make notes on page 3 of the Data File.',
      title: '返回情境文件', kind: 'hint', type: 5,
      translation: '回到第 2 頁的來源指示。',
      explanation: '來源位置已確認。繼續按原文件次序閱讀，不把筆記頁尚未出現的答案帶回 Stage 1。',
      help: '只保留「第 3 頁是筆記頁」這項結構資訊。'
    },
    {
      id: 'p1-situation-five-minute-start', page: 2, sourcePage: 'Data File p.2',
      selector: `${situation} .bilingual:nth-of-type(5) p[lang="en"]`, phrase: 'You now have five minutes to familiarize yourself with the Part B Question-Answer Book and the Data File.',
      title: '重複程序仍不是內容', kind: 'noise', type: 6,
      translation: '現在有五分鐘熟習 Part B 問答冊和資料檔。',
      explanation: '這句再次標示考試流程階段，不屬任何一項成品的內容要求。',
      help: '看到時間提示時，先判斷它是作答程序還是文章規格。'
    },
    {
      id: 'p1-letter-heading-kerry-to-joey', page: 4, sourcePage: 'Data File p.4',
      selector: '#page-4 .exotic-email-chart > h2:first-of-type', phrase: 'Email from Kerry Lam to Joey Wong',
      title: '定位 Kerry 的工作電郵', kind: 'hint', type: 5,
      translation: 'Kerry Lam 寄給 Joey Wong 的電郵。',
      explanation: '這是三項工作要求的主文件。標題確認文件關係，不是可直接搬進三篇成品的內容。',
      help: '把這份文件視為 task contract，而不是 evidence bank。'
    },
    {
      id: 'p1-letter-to-joey', page: 4, sourcePage: 'Data File p.4',
      selector: `${letter} .email-headers > div:nth-child(1)`, phrase: 'To: Joey Wong',
      title: '確認工作指示的收件人', kind: 'hint', type: 5,
      translation: '收件人：Joey Wong。',
      explanation: 'Joey 是執行者；這個 To 欄不是三項成品的最終讀者。',
      help: '「工作電郵收件人」和「成品讀者」要分開。'
    },
    {
      id: 'p1-letter-from-kerry', page: 4, sourcePage: 'Data File p.4',
      selector: `${letter} .email-headers > div:nth-child(2)`, phrase: 'From: Kerry Lam',
      title: '確認指示者', kind: 'hint', type: 5,
      translation: '寄件人：Kerry Lam。',
      explanation: 'Kerry 是工作要求的發出者。她的話定義必須完成甚麼，但不會自動成為可寫入正文的事實。',
      help: '發出要求的人不一定是成品的最終讀者。'
    },
    {
      id: 'p1-letter-date-2014-04-12', page: 4, sourcePage: 'Data File p.4',
      selector: `${letter} .email-headers > div:nth-child(3)`, phrase: 'Date: 12 April, 2014',
      title: '日期只供文件定位', kind: 'noise', type: 6,
      translation: '日期：2014 年 4 月 12 日。',
      explanation: '日期可協助辨認文件，但三項成品都沒有要求重述 Kerry 寄信的日期。',
      help: '行政欄位可以幫助排序，卻未必是正文內容。'
    },
    {
      id: 'p1-letter-subject-work-to-be-done', page: 4, sourcePage: 'Data File p.4',
      selector: `${letter} .email-headers > div:nth-child(4)`, phrase: 'Subject: Work to be done',
      title: '主旨提示多項工作', kind: 'hint', type: 5,
      translation: '主旨：要完成的工作。',
      explanation: '這個內部主旨只提醒下文列出多項工作，不是任何一篇成品可直接沿用的標題。',
      help: '不要把內部電郵主旨誤當 Task A 資訊頁標題。'
    },
    {
      id: 'p1-letter-greeting-dear-joey', page: 4, sourcePage: 'Data File p.4',
      selector: `${emailBody} .bilingual:nth-of-type(1) p[lang="en"]`, phrase: 'Dear Joey,',
      title: '內部稱呼不沿用', kind: 'noise', type: 6,
      translation: 'Joey：',
      explanation: '這是 Kerry 對 Joey 的內部稱呼。三項成品有各自讀者，不能把 Dear Joey 抄入答案。',
      help: '稱呼要跟真正的成品讀者轉換。'
    },
    {
      id: 'p1-letter-help-few-things', page: 4, sourcePage: 'Data File p.4',
      selector: `${emailBody} .bilingual:nth-of-type(2) p[lang="en"]`, phrase: 'I’d like your help with a few things.',
      title: '建立三項工作分支', kind: 'hint', type: 5,
      translation: '我有幾件事想請你幫忙。',
      explanation: '這句是下文三項工作的過渡語。以下依次對應 Task A（原題 Task 8）、Task B（Task 9）和 Task C（Task 10）。',
      help: '先建立 A、B、C 三欄，避免混合不同文類、讀者和內容。'
    },
    {
      id: 'p1-task-a-info-page-audience-topic', page: 4, sourcePage: 'Data File p.4', task: 'A',
      selector: taskA, phrase: 'information page', secondaryPhrases: ['young people or school leavers', 'becoming a veterinary nurse'], quote: 'We’re updating our website and we’ve decided to include an information page which has advice for young people or school leavers on becoming a veterinary nurse.', essential: true,
      title: 'Task A · 平台、文類、讀者和主題', kind: 'A', type: 1,
      translation: '網站將加入資訊頁，向年輕人或離校生提供成為獸醫護士的建議。',
      explanation: '成品是 Hospital website 的 information page；主要讀者是 young people or school leavers；主題是 becoming a veterinary nurse。這一句同時控制平台、文類、受眾和目的。',
      help: '在同一句圈出 website、information page、young people or school leavers 和 becoming a veterinary nurse。'
    },
    {
      id: 'p1-task-a-write-this-page', page: 4, sourcePage: 'Data File p.4', task: 'A',
      selector: taskA, phrase: 'Please can you write this page?',
      title: 'Task A · Joey 是資訊頁撰稿人', kind: 'A', type: 1,
      translation: '請你撰寫這個頁面。',
      explanation: '代詞 this page 回指上一句的 information page；不能改寫成演辭或信件。',
      help: '先找代詞回指對象，確認成品仍是 information page。'
    },
    {
      id: 'p1-task-a-content-list-intro', page: 4, sourcePage: 'Data File p.4', task: 'A',
      selector: taskA, phrase: 'You might want to include information about:',
      title: 'Task A · 下列項目構成內容清單', kind: 'A', type: 1,
      translation: '你可加入以下方面的資料：',
      explanation: '冒號把要求帶到三個獨立項目。雖然 might want 語氣較柔和，三個項目共同界定頁面應覆蓋的職業資訊。',
      help: '冒號後逐項讀，不要把三個 bullet 合成一個模糊主題。'
    },
    {
      id: 'p1-task-a-duties-and-qualities', page: 4, sourcePage: 'Data File p.4', task: 'A', point: '1',
      selector: `${taskAList} > li:nth-child(1)`, phrase: 'what veterinary nurses do and professional qualities they need', essential: true,
      title: 'Task A · 職責與專業素質', kind: 'A', type: 1,
      translation: '獸醫護士做甚麼，以及他們需要哪些專業素質。',
      explanation: '同一個 bullet 有兩部分：duties 和 professional qualities。後續取證時兩部分都要找到，不能只列工作內容。',
      help: '用「職責」和「素質」兩個子欄保存證據。'
    },
    {
      id: 'p1-task-a-qualifications-and-prospects', page: 4, sourcePage: 'Data File p.4', task: 'A', point: '2',
      selector: `${taskAList} > li:nth-child(2)`, phrase: 'qualifications and future prospects', essential: true,
      title: 'Task A · 資格與未來前景', kind: 'A', type: 1,
      translation: '資格與未來發展。',
      explanation: '這個 bullet 亦有兩部分：入行或培訓資格，以及完成訓練後的發展。不能自行加入卷內沒有的薪酬或晉升資料。',
      help: '把 qualifications 和 prospects 分開核對來源。'
    },
    {
      id: 'p1-task-a-challenges', page: 4, sourcePage: 'Data File p.4', task: 'A', point: '3',
      selector: `${taskAList} > li:nth-child(3)`, phrase: 'challenges', essential: true,
      title: 'Task A · 工作挑戰', kind: 'A', type: 1,
      translation: '挑戰。',
      explanation: '資訊頁不能只宣傳好處，也要處理獸醫護士面對的困難；具體挑戰要留待後續來源閱讀。',
      help: '現在只記 requirement，不提前填入任何 podcast 或訪問答案。'
    },
    {
      id: 'p1-task-a-title-required', page: 4, sourcePage: 'Data File p.4', task: 'A',
      selector: taskAClosing, phrase: 'a title', quote: 'Please give a title.', essential: true,
      title: 'Task A · 必須有標題', kind: 'A', type: 1,
      translation: '請加上標題。',
      explanation: '這是明確格式要求。標題應讓年輕讀者立即知道頁面主題；句子本身不會成為正文內容。',
      help: '在作答清單加入 title，而不是把 Please give a title 抄入答案。'
    },
    {
      id: 'p1-task-a-podcast-notes-route', page: 4, sourcePage: 'Data File p.4', task: 'A',
      selector: taskAClosing, phrase: 'notes from the Pet Club podcast', quote: 'You may want to start by checking your notes from the Pet Club podcast.', essential: true,
      title: 'Task A · 指向 Pet Club 筆記', kind: 'hint', type: 5,
      translation: '你可先查看 Pet Club podcast 的筆記。',
      explanation: '這是找資料的方法，不是資訊頁要寫的內容。Stage 1 只建立到 page 3 的路線。',
      help: '下一步只確認來源位置，不展示錄音資料。'
    },
    {
      id: 'p1-route-task-a-podcast-visit', page: 3, sourcePage: 'Data File p.3', task: 'A', sourceJump: true,
      selector: '#page-3 .conference-notes h2', phrase: 'Listening note-taking sheet for the Pet Club podcast',
      quote: 'Pet Club podcast notes → Data File page 3', routeLabel: 'Task A · Pet Club 筆記', routeFrom: 'p1-task-a-podcast-notes-route',
      title: '來源路線 · Task A 錄音筆記', kind: 'hint', type: 5,
      translation: '已回到 Pet Club podcast 筆記頁。',
      explanation: '這些欄目會在後續階段接收錄音資料。現在只確認文件，不顯示任何答案。',
      help: '看清標題後返回 Kerry 的 Task A 指示。'
    },
    {
      id: 'p1-route-task-a-podcast-return', page: 4, sourcePage: 'Data File p.4', task: 'A', routeReturn: true,
      selector: taskAClosing, phrase: 'You may want to start by checking your notes from the Pet Club podcast.',
      title: '返回 Task A 指示', kind: 'hint', type: 5,
      translation: '回到 Kerry 的 Pet Club 來源提示。',
      explanation: '來源位置已確認。接着讀 Task B，不把尚未聽到的 podcast 內容帶回 Stage 1。',
      help: '保留 route，不把 source evidence 當作 Stage 1 答案。'
    },
    {
      id: 'p1-task-b-open-day-speech', page: 4, sourcePage: 'Data File p.4', task: 'B',
      selector: taskB, phrase: 'a speech', secondaryPhrases: ['open day'], quote: 'Next month, we’re going to have an open day and I’m going to give a speech and I’d like you to write it for me.', essential: true,
      title: 'Task B · 場合、文類與代筆關係', kind: 'B', type: 2,
      translation: '下月醫院舉行開放日；Kerry 會發表演辭，Joey 要替她撰寫。',
      explanation: '成品是 open day 現場 speech，聲音應像 Kerry 對公眾說話；Joey 是代筆人，不應以自己身分發言。',
      help: '圈出 open day、give a speech 和 write it for me。'
    },
    {
      id: 'p1-task-b-virtual-pet-topic', page: 4, sourcePage: 'Data File p.4', task: 'B',
      selector: taskB, phrase: 'virtual pets', quote: 'As we’re thinking about having a virtual pet page on our website, I’d like to talk about virtual pets.', essential: true,
      title: 'Task B · 網站背景與演辭主題', kind: 'B', type: 2,
      translation: '醫院正考慮增設虛擬寵物專頁，因此 Kerry 想談虛擬寵物。',
      explanation: 'virtual pet page 是背景，演辭主題是 virtual pets。這句不表示頁面已經建立，也不要求在演辭聲稱它已上線。',
      help: '分開「正在考慮」和「演辭要談」；不要把計劃寫成已完成事實。'
    },
    {
      id: 'p1-task-b-background-and-old-people-focus', page: 4, sourcePage: 'Data File p.4', task: 'B', point: '1',
      selector: taskB, phrase: 'a brief background on virtual pets', essential: true,
      title: 'Task B · 簡短交代虛擬寵物背景', kind: 'B', type: 2,
      translation: '簡短交代虛擬寵物的背景。',
      explanation: '這是 Task B 的第一項內容要求；brief 限制背景只作簡短鋪墊，不能佔去演辭主要篇幅。',
      help: '把 requirement ① 記成 brief background，並保留 brief 這個篇幅限制。'
    },
    {
      id: 'p1-task-b-old-people-focus', page: 4, sourcePage: 'Data File p.4', task: 'B', point: '2',
      selector: taskB, phrase: 'how old people use virtual pets', essential: true,
      title: 'Task B · 重點說明長者如何使用虛擬寵物', kind: 'B', type: 2,
      translation: '重點說明長者如何使用虛擬寵物。',
      explanation: '這是 Task B 的第二項內容要求；focus on 表示它應是演辭主體，不可只列一兩句帶過。',
      help: '把 requirement ② 記成 main focus: how old people use virtual pets。'
    },
    {
      id: 'p1-task-b-book-route', page: 4, sourcePage: 'Data File p.4', task: 'B',
      selector: taskB, phrase: '‘Inside the Virtual Jungle’ book', quote: 'I suggest that you start by looking at that ‘Inside the Virtual Jungle’ book.', essential: true,
      title: 'Task B · 指向指定書本', kind: 'hint', type: 5,
      translation: 'Kerry 建議先查看《Inside the Virtual Jungle》。',
      explanation: '這是來源路線；start by 表示起點，不代表書本是唯一來源。Stage 1 不抽取書中例子。',
      help: '下一步只定位書本節錄。'
    },
    {
      id: 'p1-route-task-b-book-visit', page: 7, sourcePage: 'Data File p.7', task: 'B', sourceJump: true,
      selector: '#page-7 .exotic-book-fish > h2:first-of-type', phrase: 'Extract from book: Inside the Virtual Jungle and Pets Online',
      quote: 'Inside the Virtual Jungle → Data File page 7', routeLabel: 'Task B · 書本節錄', routeFrom: 'p1-task-b-book-route',
      title: '來源路線 · 虛擬寵物書本', kind: 'hint', type: 5,
      translation: '已找到《Inside the Virtual Jungle and Pets Online》書本節錄。',
      explanation: '書本會在後續階段提供虛擬寵物背景和長者入門資料。現在只確認文件標題。',
      help: '不要在 Stage 1 展開書中內容或建立證據答案。'
    },
    {
      id: 'p1-route-task-b-book-return', page: 4, sourcePage: 'Data File p.4', task: 'B', routeReturn: true,
      selector: taskB, phrase: 'I suggest that you start by looking at that ‘Inside the Virtual Jungle’ book.',
      title: '返回 Task B 指示', kind: 'hint', type: 5,
      translation: '回到 Kerry 的書本來源提示。',
      explanation: '來源位置已確認。繼續讀 Task C，不提前採用書中內容。',
      help: '先保留 route，後續閱讀才建立 evidence。'
    },
    {
      id: 'p1-task-c-letter-editor-response', page: 4, sourcePage: 'Data File p.4', task: 'C',
      selector: taskC, phrase: 'a letter to the editor of the Kowloon Herald', quote: 'Please write a letter to the editor of the Kowloon Herald', essential: true,
      title: 'Task C · 文類與直接讀者', kind: 'C', type: 3,
      translation: '寫信給《Kowloon Herald》編輯。',
      explanation: '成品是 letter to the editor；直接讀者是 Kowloon Herald editor。這是文類與讀者設定，不佔內容要求編號。',
      help: '先圈出 letter to the editor 和 Kowloon Herald；下一步再讀回應目的。'
    },
    {
      id: 'p1-task-c-response-to-squeers', page: 4, sourcePage: 'Data File p.4', task: 'C', point: '1',
      selector: taskC, phrase: 'in response to the letter from Mr. W. Squeers', secondaryPhrases: ['criticizes the Kowloon Exotic Pets Hospital'], quote: 'in response to the letter from Mr. W. Squeers, which criticizes the Kowloon Exotic Pets Hospital.', essential: true,
      title: 'Task C · 回應 Squeers 對醫院的批評', kind: 'C', type: 3,
      translation: '回應 W. Squeers 批評九龍珍禽異獸寵物醫院的來信。',
      explanation: '這是 Task C 的第一項內容要求：不能只一般介紹醫院，必須針對 Squeers 的批評作回應。',
      help: '把 requirement ① 記成 response to Squeers’ criticism。'
    },
    {
      id: 'p1-task-c-all-voluntary-work', page: 4, sourcePage: 'Data File p.4', task: 'C', point: '2',
      selector: taskC, phrase: 'all of the voluntary work we do for the community in Hong Kong', quote: 'Make sure you mention all of the voluntary work we do for the community in Hong Kong.', essential: true,
      title: 'Task C · 全部義務工作是完整性要求', kind: 'C', type: 3,
      translation: '務必提及醫院為香港社區所做的全部義務工作。',
      explanation: 'Make sure 和 all 都是強制限定：不能只舉一個例子；voluntary work 必須與 community in Hong Kong 有關。具體項目留待後續來源核實。',
      help: '把 all 圈起來，日後逐項做 coverage check。'
    },
    {
      id: 'p1-task-c-squeers-letter-route', page: 4, sourcePage: 'Data File p.4', task: 'C',
      selector: taskC, phrase: 'Mr. Squeers’ letter in the Kowloon Herald', quote: 'You might want to start by looking at Mr. Squeers’ letter in the Kowloon Herald.', essential: true,
      title: 'Task C · 指向 Squeers 來信', kind: 'hint', type: 5,
      translation: '可先查看 Squeers 在《Kowloon Herald》的來信。',
      explanation: '這是回應文的起點：先準確了解對方批評，再尋找回應證據。Stage 1 只定位文件。',
      help: '下一步只看來信標題，不揭示批評細節或反駁證據。'
    },
    {
      id: 'p1-route-task-c-squeers-visit', page: 9, sourcePage: 'Data File p.9', task: 'C', sourceJump: true,
      selector: '#page-9 .exotic-letter-news > h2:first-of-type', phrase: 'Letter in the Kowloon Herald',
      quote: 'Mr. Squeers’ letter → Data File page 9', routeLabel: 'Task C · Squeers 來信', routeFrom: 'p1-task-c-squeers-letter-route',
      title: '來源路線 · Kowloon Herald 來信', kind: 'hint', type: 5,
      translation: '已找到《Kowloon Herald》來信。',
      explanation: '這份文件會在後續階段界定要回應的批評。現在只確認文件位置，不展示指控或答案。',
      help: '看清標題後返回 Kerry 的 Task C 指示。'
    },
    {
      id: 'p1-route-task-c-squeers-return', page: 4, sourcePage: 'Data File p.4', task: 'C', routeReturn: true,
      selector: taskC, phrase: 'You might want to start by looking at Mr. Squeers’ letter in the Kowloon Herald.',
      title: '返回 Task C 指示', kind: 'hint', type: 5,
      translation: '回到 Kerry 的 Squeers 來信來源提示。',
      explanation: '來源位置已確認。Stage 1 只保存這條路線，不開始反駁或列義務工作答案。',
      help: 'route 已完成；下一步讀電郵結語。'
    },
    {
      id: 'p1-letter-thanks', page: 4, sourcePage: 'Data File p.4',
      selector: `${emailBody} .bilingual:nth-of-type(7) p[lang="en"]`, phrase: 'Thanks for your help.',
      title: '禮貌結語不取材', kind: 'noise', type: 6,
      translation: '謝謝你的幫忙。',
      explanation: '這句維持 Kerry 與 Joey 的工作關係，但沒有新增任何文類、讀者或內容要求。',
      help: '刪去後 task contract 不變，所以不寫入成品。'
    },
    {
      id: 'p1-letter-signature-kerry', page: 4, sourcePage: 'Data File p.4',
      selector: `${emailBody} > p:last-child`, phrase: 'Kerry',
      title: '署名確認指示者', kind: 'noise', type: 6,
      translation: 'Kerry。',
      explanation: '署名確認整封工作電郵由 Kerry 發出；它不是 Task B 演辭以外各成品可直接照抄的署名。',
      help: '內部電郵署名與最終成品署名要分開。'
    },
    {
      id: 'p1-stage-complete', page: 4, sourcePage: 'Stage 1 review', final: true,
      selector: '#page-4 .email-window', phrase: '',
      quote: 'Stage 1 complete · Kerry’s task contract reviewed',
      title: 'Stage 1 完成 · 三項任務規格已建立', kind: 'hint', type: 5,
      translation: '已完成 2014 B2 指示文件分析。',
      explanation: '已確認 Joey 的身分、三項成品的文類與讀者、必寫內容、重要限定，以及三條指定來源路線。Stage 2–5 仍然鎖定，未展示資料分類、錄音、資料檔證據或寫作答案。',
      help: '完成後先讓老師審核 Stage 1，再開展 Stage 2。',
      points: ['Task A：醫院網站資訊頁，面向年輕人／離校生', 'Task B：Kerry 在開放日發表的虛擬寵物演辭', 'Task C：致 Kowloon Herald 編輯、回應 Squeers 的信']
    }
  ];

  window.EDMUND_2014_B2_CURATION = Object.freeze({
    version: '2014-b2-super-curation-stage2-v3',
    storageKey: 'edmund-paper3-2014-b2-curation-stage1-v1',
    stages: Object.freeze([
      {id: 'instruction', label: '1 · 任務指示', enabled: true},
      {id: 'categorize', label: '2 · 資料分類', enabled: true},
      {id: 'podcast', label: '3 · Podcast', enabled: false},
      {id: 'data', label: '4 · Data File', enabled: false},
      {id: 'writing', label: '5 · Writing', enabled: false}
    ]),
    steps: Object.freeze(steps.map(step => Object.freeze(step)))
  });
})();

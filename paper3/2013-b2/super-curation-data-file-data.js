(() => {
  'use strict';

  const steps = [];
  const add = (id, page, sourceId, phrase, title, explanation, extra = {}) => steps.push({
    id:`data-${id}`, page, sourceId, sourcePhrase:phrase, title, explanation,
    evidenceType:extra.evidenceType || 6, task:extra.task || null,
    bank:extra.bank === true, rejected:extra.rejected === true,
    provisional:extra.provisional === true, updateOf:extra.updateOf || null,
    sourceRoot:extra.sourceRoot || `#page-${page} .recreated-page`, help:extra.help || '',
    ...extra
  });
  const doc = (id, page, sourceId, phrase, title) => add(id, page, sourceId, phrase, title,
    '先辨認文件身分和來源，再逐句判斷；文件標題只建立閱讀路線，本身不會自動成為答案內容。',
    {evidenceType:6, sourceRoot:`#page-${page} .recreated-page`});
  const use = (id, page, sourceId, phrase, title, task, explanation, extra = {}) => add(id, page, sourceId, phrase, title,
    explanation, {task, evidenceType:task === 'A' ? 1 : task === 'B' ? 2 : 3, bank:true, ...extra});
  const context = (id, page, sourceId, phrase, title, explanation, extra = {}) => add(id, page, sourceId, phrase, title,
    explanation, {evidenceType:4, ...extra});
  const reject = (id, page, sourceId, phrase, title, explanation, extra = {}) => add(id, page, sourceId, phrase, title,
    explanation, {evidenceType:6, rejected:true, ...extra});

  // Data File p.5 — editorial meeting minutes (read in printed order).
  doc('p05-minutes-title', 5, 'doc-2013-editorial-minutes', 'Minutes from editorial meeting at Asia Life magazine', '第 5 頁：編輯會議紀錄');
  reject('p05-present', 5, 'doc-2013-editorial-minutes', 'James Lee · Casey Wong · Mavis Lam · Vicki Swan', '與會者名單', '行政紀錄，只確認會議參與者；三項寫作都不需要列出姓名。');
  reject('p05-date', 5, 'doc-2013-editorial-minutes', '14th March, 2013', '會議日期', '會議日期只建立時序，不是任何成品的內容。');
  reject('p05-venue', 5, 'doc-2013-editorial-minutes', 'meeting room, 6th Floor', '會議地點', '會議室資料屬行政噪音，不收入 A、B 或 C。');
  reject('p05-confirmation', 5, 'doc-2013-editorial-minutes', '1. Confirmation of minutes', '確認上次會議紀錄', '只有議程標題，沒有提供可用任務證據。');
  context('p05-topics', 5, 'doc-2013-editorial-minutes', 'Three topics were decided: unusual travel and tourism, buying a new car and the benefits of evening classes.', '下期三個題目', '確認本期還有另外兩個主題；只有旅遊主題與這份 B2 工作有關。');
  context('p05-main-focus', 5, 'doc-2013-editorial-minutes', 'The main focus would be on unusual travel and tourism.', '本期主題焦點', '這是整期雜誌背景，不是可直接搬入某一篇答案的證據。');
  reject('p05-writers-contact', 5, 'doc-2013-editorial-minutes', 'JL agreed to contact Tony Kwok and Queenie Lau and ask them to contribute articles for publication.', '邀稿行政紀錄', '只交代由誰邀稿；Task B 不需要向 Queenie 重述內部分工。');
  context('p05-guidelines-route', 5, 'doc-2013-editorial-minutes', 'ML reminded the editorial team to follow the new 2013 guidelines for publication.', '交叉路線：2013 投稿指引', '這句不是修改要求本身；它指示我們轉到第 6 頁，核對本期有效的投稿規則。', {routeTarget:'#doc-2013-writers-guidelines', routeLabel:'2013 Writers’ Guidelines'});
  use('p05-images-submit', 5, 'doc-2013-editorial-minutes', 'writers should be encouraged to submit 15-20 images per article', 'Task B：提交 15–20 張圖片', 'B', '會議紀錄給出本期的圖片數量要求；要清楚告訴 Queenie 提交 15–20 張。');
  use('p05-images-select', 5, 'doc-2013-editorial-minutes', 'the editorial team would choose 5 for each article accepted for publication', 'Task B：編輯組會選 5 張', 'B', '這是數量要求的完整限定：作者交 15–20 張，編輯組最終選 5 張。');
  use('p05-deadline', 5, 'doc-2013-editorial-minutes', 'All agreed to set the deadline for 30th April.', 'Task B：截稿日期 4 月 30 日', 'B', 'Boss letter 明確要求提醒期限；這句確認確切日期為 4 月 30 日。');
  reject('p05-payment-rate', 5, 'doc-2013-editorial-minutes', 'the payment to writers would be HKD 1000 per page', '稿酬每頁港幣 1,000 元', 'Task B 要求修改稿件和提醒截稿，不要求討論稿酬。');
  reject('p05-payment-includes', 5, 'doc-2013-editorial-minutes', 'this would include both text and pictures used', '稿酬包括文字和圖片', '稿酬細節不屬 Queenie 必須修改的事項。');
  reject('p05-next-meeting', 5, 'doc-2013-editorial-minutes', 'The next meeting date was decided as 6th May to give the team time to read through any submitted articles.', '下次會議日期', '內部會議安排不應寫入給 Queenie 的電郵。');
  use('p05-word-limit', 5, 'doc-2013-editorial-minutes', 'the word limit for articles in the next issue would be 900 words', 'Task B：本期字數上限 900 字', 'B', '這是「本期」的最新具體字數上限，稍後會用來修正審稿表中的 1,200 字現況。');
  use('p05-email-writers', 5, 'doc-2013-editorial-minutes', 'All writers would be informed by email.', 'Task B：以電郵通知作者', 'B', '這與指定文體一致：要以電郵直接通知 Queenie。', {evidenceType:5});

  // Data File p.6 — current publication rules.
  doc('p06-guidelines-title', 6, 'doc-2013-writers-guidelines', '2013 Writers’ Guidelines for Publication', '第 6 頁：2013 投稿指引');
  reject('p06-to', 6, 'doc-2013-writers-guidelines', 'To: Editorial team, Asia Life magazine', '備忘錄收件人', '這是內部備忘錄的收件欄，不應轉寄給 Queenie。');
  reject('p06-from', 6, 'doc-2013-writers-guidelines', 'From: Casey Wong', '備忘錄發件人', '只確認規則來源，不是修改內容。');
  context('p06-effective-date', 6, 'doc-2013-writers-guidelines', 'Please note the new submission guidelines with effect from 1st February, 2013:', '規則生效日期', '這句確認以下是 2013 年 2 月 1 日起生效的現行規則，因此可用來核對 Queenie 稿件。');
  use('p06-on-time', 6, 'doc-2013-writers-guidelines', 'All articles must be submitted on time', 'Task B：必須準時交稿', 'B', '這項規則支持電郵中的截稿提醒。');
  context('p06-revision-purpose', 6, 'doc-2013-writers-guidelines', 'to allow the editorial team time to read and suggest any revisions', '準時交稿的原因', '這是期限背後的理由，可用來理解規則；120 字電郵未必需要全部解釋。', {task:'B'});
  use('p06-late', 6, 'doc-2013-writers-guidelines', 'Late articles will not be considered for publication.', 'Task B：遲交不獲考慮', 'B', '這是重要後果，能令截稿提醒清楚而具行動性。');
  use('p06-copyright', 6, 'doc-2013-writers-guidelines', 'any materials used (e.g. photographs) must not breach copyright', 'Task B：圖片不可侵犯版權', 'B', '審稿表要求交代圖片來源；現行指引說明背後的版權要求。');
  use('p06-image-source', 6, 'doc-2013-writers-guidelines', 'Writers should state the source of images.', 'Task B：註明圖片來源', 'B', '這是 Queenie 圖片修改清單中的來源要求。');
  use('p06-image-format', 6, 'doc-2013-writers-guidelines', 'soft copy (high resolution JPEG file format)', 'Task B：高解像 JPEG 電子檔', 'B', '精確保留 soft copy、high resolution 和 JPEG 三個限定。');
  context('p06-word-route', 6, 'doc-2013-writers-guidelines', 'Refer to the word limit set in editorial meetings as this may vary from issue to issue.', '字數上限要回查本期會議', '指引沒有給固定數字；它要求回到第 5 頁找本期上限。', {task:'B', evidenceType:5, routeTarget:'#doc-2013-editorial-minutes', routeLabel:'本期編輯會議紀錄'});
  use('p06-title-limit', 6, 'doc-2013-writers-guidelines', 'Titles must not be more than 80 characters long.', 'Task B：補標題，最多 80 字元', 'B', '審稿表指出標題缺漏；這句補上確切的 80 字元限制。');
  reject('p06-style', 6, 'doc-2013-writers-guidelines', 'Style of article to be decided by the writer, unless otherwise indicated by the editor.', '文章風格由作者決定', '審稿表沒有要求 Queenie 改變文章風格；不要自行新增修改。');
  reject('p06-rights', 6, 'doc-2013-writers-guidelines', 'Asia Life magazine retains the rights to any articles published.', '出版權利', '權利條款不屬本次稿件修改要求。');
  reject('p06-payment', 6, 'doc-2013-writers-guidelines', 'Once an article is accepted for publication, payment will be made.', '接納後付款', '付款程序與本次需要修改的內容無關。');

  // Data File p.7 — provisional review is resolved by p.5–6.
  doc('p07-review-title', 7, 'doc-2013-queenie-review', 'Notes from the editorial team on Queenie Lau’s article', '第 7 頁：Queenie 稿件審閱筆記');
  context('p07-issue', 7, 'doc-2013-queenie-review', 'Vol 12 – June 2013', '稿件所屬期數', '確認這是下一期六月號的稿件；主要用來建立審稿語境。', {task:'B'});
  reject('p07-reviewed-date', 7, 'doc-2013-queenie-review', '5th April, 2013', '審閱日期', '內部審閱日期不是 Queenie 要修改的事項。');
  context('p07-writer', 7, 'doc-2013-queenie-review', 'Queenie Lau', '作者：Queenie Lau', '確認 Task B 的收件人和稿件作者是同一人。', {task:'B'});
  context('p07-topic', 7, 'doc-2013-queenie-review', 'Plastic surgery holidays (Thailand)', '稿件主題', '可在電郵中簡潔辨認是哪一篇稿件，但不是修改項目。', {task:'B'});
  reject('p07-reviewer', 7, 'doc-2013-queenie-review', 'James Lee', '審稿人姓名', '內部審稿人姓名不需要告訴 Queenie。');
  context('p07-current-words', 7, 'doc-2013-queenie-review', 'No. of words: 1200', '現稿字數：1,200', '這是現況而非容許上限；必須與第 5 頁的 900 字上限比較。', {task:'B', provisional:true});
  context('p07-images-route', 7, 'doc-2013-queenie-review', 'how many we need, the format and source', '圖片要求要跨頁補全', '審稿筆記列出三個待查欄位；第 5、6 頁才分別提供數量、格式和來源。', {task:'B', evidenceType:5, routeTarget:'#doc-2013-editorial-minutes', routeLabel:'圖片數量；再查投稿指引'});
  use('p07-title-missing', 7, 'doc-2013-queenie-review', 'Title is missing!!', 'Task B：稿件缺少標題', 'B', '這是直接修改要求：Queenie 必須補上標題。');
  context('p07-title-route', 7, 'doc-2013-queenie-review', 'Remember there’s a limit on number of characters.', '標題限制要回查指引', '審稿表沒有數字；回到第 6 頁才確認最多 80 字元。', {task:'B', evidenceType:5, routeTarget:'#doc-2013-writers-guidelines', routeLabel:'標題 80 字元限制'});
  context('p07-check-limit', 7, 'doc-2013-queenie-review', 'what’s the word limit for this issue?', '字數問題仍未解答', '問句是查找指令，不是答案；要到第 5 頁找到本期 900 字。', {task:'B', provisional:true, evidenceType:5, routeTarget:'#doc-2013-editorial-minutes', routeLabel:'本期 900 字上限'});
  use('p07-reduce-words', 7, 'doc-2013-queenie-review', 'Please check and then tell her.', 'Task B：核對後通知她減字', 'B', '把 1,200 字現稿與 900 字上限合併，得出要刪減約 300 字的可執行要求。', {evidenceType:5, updateOf:'data-p07-current-words'});
  use('p07-publish-changes', 7, 'doc-2013-queenie-review', 'Yes (with changes)', 'Task B：修改後可刊登', 'B', '決定不是拒稿；語氣應清楚指出修改後才可刊登。', {evidenceType:5});
  use('p07-spelling', 7, 'doc-2013-queenie-review', 'the spelling of Thai place names – she needs to check these carefully', 'Task B：核對泰國地名拼寫', 'B', '這是獨立、明確的校對要求。');
  use('p07-accuracy', 7, 'doc-2013-queenie-review', 'ask her if all the details in the article are accurate', 'Task B：確認所有資料準確', 'B', '不要把它縮窄成只查地名；全篇細節也要確認。');
  context('p07-follow-directly', 7, 'doc-2013-queenie-review', 'Follow this up with her directly.', '直接跟進 Queenie', '支持以直接、專業的電郵語氣提出所有修改。', {task:'B', evidenceType:5});

  // Data File p.8 — TV transcript; questions/context stay out of the bank.
  doc('p08-tv-title', 8, 'doc-2013-see-the-world', 'Transcript excerpt of TV travel show See the World', '第 8 頁：See the World 節錄');
  reject('p08-gap-years', 8, 'doc-2013-see-the-world', 'We’ve all heard of student gap years', '學生 gap year 背景', '只用作節目引入，沒有回答 Task C 的正面影響。');
  reject('p08-south-america', 8, 'doc-2013-see-the-world', 'Some go to places like South America and live with the natives – even for like up to a year.', '南美同住例子', '描述旅遊形式，但沒有說明對當地人的正面影響。');
  context('p08-culture-tourism', 8, 'doc-2013-see-the-world', 'Welcome to a really new kind of culture tourism.', '文化旅遊語境', '建立討論類型，仍需往下讀具體影響。', {task:'C'});
  context('p08-sauri-purpose', 8, 'doc-2013-see-the-world', 'to find out what the impact might be on local people', '節目問題對準 Task C', '這是採訪目的，不是可用正面證據；要由受訪者的回答取證。', {task:'C', evidenceType:5});
  context('p08-kemi-role', 8, 'doc-2013-see-the-world', 'you’re a teacher here in Sauri', 'Kemi 的當地身分', '她是 Sauri 教師，令其對當地影響的觀察具語境；姓名和職銜本身不是論點。', {task:'C'});
  context('p08-effect-question', 8, 'doc-2013-see-the-world', 'what do you think about the effect of tourism on local people?', '問題重申 Task C 範圍', '問題沒有答案；繼續讀 Kemi 的回應。', {task:'C', evidenceType:5});
  use('p08-positive-overall', 8, 'doc-2013-see-the-world', 'I’d say positive for Sauri on the whole.', 'Task C：整體影響正面', 'C', '這是總判斷，適合引出後面的具體例子，但單獨使用仍太籠統。');
  reject('p08-ceci-reaction', 8, 'doc-2013-see-the-world', 'Really? Well, that’s encouraging.', '主持反應', '主持的鼓勵語不是獨立證據。');
  context('p08-how-positive', 8, 'doc-2013-see-the-world', 'How do you mean positive?', '追問具體正面影響', '這個追問提示下面才是可用證據。', {task:'C', evidenceType:5});
  use('p08-share-ideas', 8, 'doc-2013-see-the-world', 'people are starting to share ideas with tourists', 'Task C：居民與旅客交流意念', 'C', '可用作教育／知識交流的正面影響，但要配合後面的實例。');
  context('p08-practical-question', 8, 'doc-2013-see-the-world', 'You mean sharing practical ideas?', '「實用意念」需要例子確認', '這是主持的釐清，不要把問句本身當成事實。', {task:'C', provisional:true, evidenceType:5});
  use('p08-yusuf-webpage', 8, 'doc-2013-see-the-world', 'helped us create a village webpage', 'Task C：旅客協助建立村落網頁', 'C', '具體證明旅客把實用技能和網上工具帶給社區。');
  use('p08-web-information', 8, 'doc-2013-see-the-world', 'It’s got a lot of information about the village that visitors can read.', 'Task C：網頁讓外界認識村落', 'C', '說明網頁的實際效益：村落可以向訪客分享資訊。');
  reject('p08-writer-prompt', 8, 'doc-2013-see-the-world', 'I heard that there was a writer who came to the village...', '主持引出作家例子', '只是提示下一個例子；證據在 Kemi 的回答。');
  context('p08-jessica-name', 8, 'doc-2013-see-the-world', 'a very nice lady called Mrs. Jessica Glasser', '作家身分', '姓名只建立例子來源，不是正面影響本身。', {task:'C'});
  use('p08-stories-published', 8, 'doc-2013-see-the-world', 'wrote down some of the stories and helped us to get those published', 'Task C：協助記錄並出版傳統故事', 'C', '這是文化保存的具體行動。');
  use('p08-learn-traditions', 8, 'doc-2013-see-the-world', 'anybody who reads the book learns about our traditions', 'Task C：讀者認識當地傳統', 'C', '出版成果令文化得以傳播和被理解。');
  use('p08-culture-alive', 8, 'doc-2013-see-the-world', 'tourism is helping you keep your culture alive', 'Task C：旅遊協助文化傳承', 'C', '主持把前面的故事出版例子概括成文化保存效益；可用，但最好連同實例。', {evidenceType:5});

  // Data File p.9 — forum posts are judged one claim at a time.
  doc('p09-forum-title', 9, 'doc-2013-tourism-forum', 'Travel forum thread: tourism and local people', '第 9 頁：旅遊討論區');
  context('p09-immersion-query', 9, 'doc-2013-tourism-forum', 'I’ve been checking out this immersion holiday stuff.', '沉浸式旅遊話題', '只提出話題，未說明正面影響。', {task:'C'});
  context('p09-definition', 9, 'doc-2013-tourism-forum', 'It’s when you go and live like a local person', '沉浸式旅遊定義', '幫助理解討論，但 Task C 需要的是對當地人的正面影響。', {task:'C'});
  reject('p09-change-culture', 9, 'doc-2013-tourism-forum', 'it changes the local culture', '負面觀點：改變當地文化', '這是反方憂慮，不是 Task C 的正面證據；可作對照但不可冒充主論點。');
  reject('p09-unfair', 9, 'doc-2013-tourism-forum', 'Any kind of tourism is really unfair.', '未充分支持的負面概括', '過度概括，沒有提供可驗證的正面內容。');
  reject('p09-self-esteem', 9, 'doc-2013-tourism-forum', 'That must really affect their self-esteem.', '推測自尊受影響', 'must really 是推測，且方向負面；不收入正面證據庫。');
  use('p09-money', 9, 'doc-2013-tourism-forum', 'at least they have some money because tourists go to their countries', 'Task C：旅遊帶來收入', 'C', '這是對當地人的直接經濟效益。');
  use('p09-education', 9, 'doc-2013-tourism-forum', 'They can buy things they really need... say like education for their kids.', 'Task C：收入可支持子女教育', 'C', '把「收入」連到具體生活效益——孩子教育。');
  reject('p09-laugh', 9, 'doc-2013-tourism-forum', 'Some tourists just laugh at the local people.', '負面例子：嘲笑居民', '與 Task C 主方向相反，不收入正面證據庫。');
  reject('p09-throwing', 9, 'doc-2013-tourism-forum', 'throwing money and food at some native dancers', '負面例子：不尊重舞者', '屬負面、不尊重的行為；不可扭轉成正面證據。');
  reject('p09-overdepend', 9, 'doc-2013-tourism-forum', 'the local people will start to over-depend on tourists and their money', '限制：可能過度依賴旅遊', '這是經濟效益的風險限定，可用來避免絕對化，但不是正面證據。');
  use('p09-jobs', 9, 'doc-2013-tourism-forum', 'more tourism = more jobs!!', 'Task C：旅遊創造工作', 'C', '直接、清楚的就業效益。');
  use('p09-job-easier', 9, 'doc-2013-tourism-forum', 'you can get a job easier because you’re working with tourists', 'Task C：居民較容易就業', 'C', '進一步說明工作機會如何落到當地人身上。');
  use('p09-government-money', 9, 'doc-2013-tourism-forum', 'governments can use the money from us tourists to help the people', 'Task C：旅遊收入可投入公共服務', 'C', '把旅遊收入與政府改善民生連起來。');
  use('p09-clean-water', 9, 'doc-2013-tourism-forum', 'government projects to bring clean water into poor areas', 'Task C：改善清潔食水', 'C', '具體公共建設例子，支持旅遊收入改善生活。');
  context('p09-education-question', 9, 'doc-2013-tourism-forum', 'Do local people get education from tourism?', '教育問題仍待回答', '問句不能進證據庫；要讀到後面的語言例子。', {task:'C', provisional:true, evidenceType:5});
  reject('p09-not-sure', 9, 'doc-2013-tourism-forum', 'Not sure what you mean CoolKarma', '沒有提供內容的回應', '這句只表示不理解，沒有證據。');
  use('p09-language', 9, 'doc-2013-tourism-forum', 'the local people learn some things from tourists, like language', 'Task C：居民向旅客學習語言', 'C', '回答前面的教育問題，提供交流學習的具體方向。');
  use('p09-english', 9, 'doc-2013-tourism-forum', 'That comes from speaking to tourists.', 'Task C：交談帶來語言練習', 'C', '補充學習機制：與旅客交談令居民練習英語。');

  // Data File p.10 — Mei interview (A), then Kevin letter (C).
  doc('p10-mei-title', 10, 'doc-2013-mei-interview', 'Interview notes from interview with Mei Cheng', '第 10 頁：Mei Cheng 訪問筆記');
  context('p10-mei-topic', 10, 'doc-2013-mei-interview', 'Hong Kong Tourism: Past and Present', '訪問主題對準 Task A', '標題確認來源談香港旅遊的今昔。', {task:'A', evidenceType:5});
  context('p10-mei-age', 10, 'doc-2013-mei-interview', 'Age = 97', 'Mei 的年齡', '年齡支持她能回憶 1920 年代，但不是旅遊例子本身。', {task:'A'});
  context('p10-mei-father', 10, 'doc-2013-mei-interview', 'Father – manager Dragon Hotel (DH) Mei grew up in DH', 'Mei 的見證基礎', '她在酒店長大、父親任經理，解釋她為何能觀察當年旅客。', {task:'A'});
  reject('p10-anniversary', 10, 'doc-2013-mei-interview', '100th Anniversary Ball planned for October 2013', '2013 百周年舞會', '屬現代酒店活動，不是 1920 年代旅遊。');
  reject('p10-spa', 10, 'doc-2013-mei-interview', 'Opening of new spa facilities in December', '2013 新水療設施', '屬現代宣傳資料，Task A 不採用。');
  use('p10-stables', 10, 'doc-2013-mei-interview', 'DH had stables for horses – like other hotels', 'Task A：酒店設馬廄', 'A', '具體重現 1920 年代酒店為馬匹交通提供設施。');
  use('p10-carriage', 10, 'doc-2013-mei-interview', 'People used to hire horse + carriage', 'Task A：旅客租用馬車', 'A', '是 1920 年代香港旅遊交通的直接例子。');
  reject('p10-taxi-pollution', 10, 'doc-2013-mei-interview', 'she doesn’t like taxis = pollution', 'Mei 不喜歡的士污染', '這是現代個人評價，不是昔日旅遊證據。');
  use('p10-richer', 10, 'doc-2013-mei-interview', 'Interntnl tourists then – richer – more glamourous', 'Task A：當年國際旅客較富有華麗', 'A', '描述誰能負擔當年的國際旅遊及其形象。');
  use('p10-servant-rooms', 10, 'doc-2013-mei-interview', 'DH had extra rooms for servants', 'Task A：酒店設僕人房', 'A', '具體顯示富裕旅客帶僕人同行的旅遊方式。');
  use('p10-servants', 10, 'doc-2013-mei-interview', 'always saw tourists travel with servants', 'Task A：旅客帶僕人同行', 'A', 'Mei 的親身觀察支持當年旅客身分與出行排場。');
  use('p10-luggage', 10, 'doc-2013-mei-interview', 'Tourists used to have so much luggage!!', 'Task A：旅客攜帶大量行李', 'A', '直接描述當年旅行的外在特徵。');
  use('p10-outfits', 10, 'doc-2013-mei-interview', 'Before had different outfits for dinner etc.', 'Task A：晚餐等場合更換服裝', 'A', '解釋大量行李的原因，也呈現當年旅遊生活方式。');
  reject('p10-luggage-now', 10, 'doc-2013-mei-interview', 'Now amount of luggage ↓', '現代行李較少', '只可作今昔對照，Task A 的核心應放在 1920 年代。');
  use('p10-dancing', 10, 'doc-2013-mei-interview', 'Mei liked watching people dance after dinner', 'Task A：旅客晚餐後跳舞', 'A', '提供旅客當年休閒活動的具體例子。');
  doc('p10-kevin-title', 10, 'doc-2013-kevin-letter', 'Letter printed from Kevin Hui in Asia Life magazine March issue', '第 10 頁：Kevin Hui 三月來信');
  reject('p10-salutation', 10, 'doc-2013-kevin-letter', 'Dear Sir', '來信稱呼', '信件格式，不是 Kevin 的觀點。');
  context('p10-kevin-experience', 10, 'doc-2013-kevin-letter', 'I used to be a travel agent and I’ve travelled to many different places in the world because of my job', 'Kevin 的經驗背景', '支持他以旅遊經驗提出立場，但 Task C 摘要只需一至兩句，毋須詳列履歷。', {task:'C'});
  use('p10-negative-position', 10, 'doc-2013-kevin-letter', 'the effects of tourism are increasingly negative', 'Task C：Kevin 的核心負面立場', 'C', '這是社論必須準確概括並反駁的中心觀點。', {evidenceType:5});
  context('p10-lost-tribe', 10, 'doc-2013-kevin-letter', 'the Brazilian government discovered a ‘lost tribe’ of people living deep inside the rainforest', 'Kevin 的巴西例子背景', '建立反方例子的對象和地點。', {task:'C'});
  use('p10-uncontacted', 10, 'doc-2013-kevin-letter', 'they have decided to leave the tribes of people uncontacted', 'Task C：Kevin 支持不接觸部落', 'C', '這是 Kevin 用來支持其負面立場的具體主張，適合納入一至兩句摘要。', {evidenceType:5});
  use('p10-guards', 10, 'doc-2013-kevin-letter', 'guards to stop everyone, especially tourists, going into those areas to contact the tribes', 'Task C：守衛阻止旅客接觸', 'C', '補充 Kevin 支持的政策做法；摘要時可按篇幅取捨。', {evidenceType:5});
  context('p10-agree', 10, 'doc-2013-kevin-letter', 'I couldn’t agree more with this decision.', 'Kevin 明確贊同', '確認上述並非中立報道，而是他的立場。', {task:'C', evidenceType:5});
  use('p10-traditions', 10, 'doc-2013-kevin-letter', 'live immersed in their own traditions and without being negatively influenced by anyone from outside', 'Task C：Kevin 的理由是保護傳統', 'C', '準確概括他的因果：隔離外界可避免負面影響、保存傳統。', {evidenceType:5});
  reject('p10-signoff', 10, 'doc-2013-kevin-letter', 'Yours faithfully', '來信結語', '信件格式，不是觀點或證據。');
  reject('p10-signature', 10, 'doc-2013-kevin-letter', 'Kevin Hui Shatin', '作者署名與地區', '只確認來信者；Task C 不需把 Shatin 當成論點。');

  // Data File p.11 — historian blog and two visual/statistical sources.
  doc('p11-blog-title', 11, 'doc-2013-historian-blog', 'New Territories Historian blog page', '第 11 頁：New Territories Historian 網誌');
  context('p11-authority', 11, 'doc-2013-historian-blog', 'Dr. Laurence Lieu is a Lecturer at the Department of History at Hong Kong Metropolitan University', '作者歷史學背景', '支持這是歷史資料來源；職銜本身不放進短文。', {task:'A'});
  context('p11-book', 11, 'doc-2013-historian-blog', 'local historian Ip Ling Fung published ‘Fauna of Hong Kong 1850-1945’', '老虎史料來源', '建立資料出處，接下來才是與旅遊直接相關的內容。', {task:'A'});
  context('p11-hunting-context', 11, 'doc-2013-historian-blog', 'there was still tiger hunting going on in Hong Kong in the first half of the 20th C', '20 世紀上半葉香港仍有獵虎', '是歷史語境；Task A 要連到旅客和 1920 年代才可採用。', {task:'A'});
  use('p11-derby', 11, 'doc-2013-historian-blog', 'an American tourist, Mr. Edgar Derby, who shot this tiger in Lung Yeuk Tau, near Fanling in 1923', 'Task A：美國旅客 1923 年在新界獵虎', 'A', '同時具備旅客身分、香港地點、年份和活動，是完整的 Task A 例子。');
  use('p11-photo-caption', 11, 'doc-2013-historian-blog', 'Edgar Derby, Lung Yeuk Tau, 1923', 'Task A：老虎照片標題核對', 'A', '照片標題交叉確認人物、地點和年份。', {evidenceType:5});
  use('p11-many-tourists', 11, 'doc-2013-historian-blog', 'lots of tourists from North America used to come to Hong Kong in the 1920s to go tiger hunting in the New Territories', 'Task A：北美旅客來港獵虎', 'A', '把單一照片擴展成當時較普遍的旅遊活動。');
  context('p11-none-successful', 11, 'doc-2013-historian-blog', 'none were as ‘successful’ as Mr. Derby', '限定：其他旅客沒有同樣「成功」', '引號顯示作者語氣，也限制我們不能說所有旅客都獵到老虎。', {task:'A', evidenceType:5});
  reject('p11-boars', 11, 'doc-2013-historian-blog', 'And we worry about wild boars!', '現代野豬插語', '作者的現代幽默旁白，不是 1920 年代旅遊證據。');
  reject('p11-stat-reaction', 11, 'doc-2013-historian-blog', 'I love random historical statistics!', '作者對統計的反應', '語氣句，不提供事實。');
  use('p11-room-1928', 11, 'doc-2013-historian-blog', '$10,300', 'Task A：1928 房價約今值 $10,300', 'A', '數據顯示當年 Dragon Hotel 住宿昂貴，支持旅客較富有。', {sourceRoot:'#page-11 .table-scroll'});
  context('p11-room-2013', 11, 'doc-2013-historian-blog', '$4,200', '2013 房價比較值', '只用作比較；Task A 重點是 1928 年約今值 $10,300。', {task:'A', sourceRoot:'#page-11 .table-scroll'});
  use('p11-rickshaw-1928', 11, 'doc-2013-historian-blog', '3,243', 'Task A：1928 年有 3,243 個人力車牌照', 'A', '大量牌照配合下一句，顯示人力車是當年常見旅遊交通。', {sourceRoot:'#page-11 .table-scroll'});
  context('p11-rickshaw-2013', 11, 'doc-2013-historian-blog', '2', '2013 年只餘 2 個牌照', '比較數字突出昔日人力車普及，但 Task A 主要採用 1928 數字。', {task:'A', sourceRoot:'#page-11 .table-scroll'});
  use('p11-rickshaw-popular', 11, 'doc-2013-historian-blog', 'Rickshaws were always popular with the tourists.', 'Task A：人力車受旅客歡迎', 'A', '直接把交通統計與旅客使用連起來。');
  reject('p11-gone', 11, 'doc-2013-historian-blog', 'A great pity they’ve gone.', '作者感嘆人力車消失', '個人感嘆不是歷史證據。');
  context('p11-hotel-photo', 11, 'doc-2013-historian-blog', 'Here’s a photo of the Dragon Hotel from the 1920s.', '1920 年代酒店照片', '可作視覺背景，但短文仍需用文字證據說明旅遊情況。', {task:'A', evidenceType:5});
  reject('p11-anniversary', 11, 'doc-2013-historian-blog', 'Happy 100th Anniversary!', '現代百周年祝賀', '屬 2013 年祝賀語，不是 1920 年代旅遊內容。');
  context('p11-hotel-caption', 11, 'doc-2013-historian-blog', 'Dragon Hotel, 1920s', '酒店照片標題', '確認照片年代，但不會單靠照片標題虛構更多細節。', {task:'A', sourceRoot:'#page-11'});
  reject('p11-end', 11, 'doc-2013-historian-blog', 'THIS IS THE LAST PAGE OF THE PART B2 DATA FILE', '資料檔完結標記', '行政頁尾，只表示 Data File 已讀完。', {sourceRoot:'#page-11'});

  add('stage-complete', 11, 'doc-2013-historian-blog', 'THIS IS THE LAST PAGE OF THE PART B2 DATA FILE', 'Stage 4 完成：逐句取證與證據庫已核對',
    '第 5–11 頁已按實際次序逐項讀完；Task A、B、C 證據、跨頁更新、限定和不採用資料均已記錄。Stage 5 Writing 仍保持鎖定。',
    {evidenceType:6, sourceRoot:'#page-11', focusSelector:'#page-11 .source-end', final:true, help:'可用任務篩選器重看證據，或自由返回 Stage 1–3；不會顯示任何範文。'});

  steps.forEach((item, index) => { item.index = index; item.order = index + 1; });
  window.EDMUND_2013_B2_DATA_FILE = Object.freeze({
    schemaVersion:1,
    contentVersion:'2013-b2-stage4-v1',
    steps:Object.freeze(steps.map(item => Object.freeze(item))),
    evidenceTypes:Object.freeze({1:'Task A 可用證據',2:'Task B 可用證據',3:'Task C 可用證據',4:'語義／語氣／關係',5:'更新／限定／跨頁關係',6:'不採用／行政／噪音'})
  });
})();

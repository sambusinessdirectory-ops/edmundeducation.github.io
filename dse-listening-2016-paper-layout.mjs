const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

const line = (question, value, className = '') => `
  <label class="digital-paper-answer ${className}">
    <span>(${question})</span>
    <input data-original-q="${question}" data-dse-answer-q="${question}" value="${esc(value(question))}" maxlength="2000" spellcheck="false" aria-label="第 ${question} 題答案">
  </label>`;

const longLine = (question, value, className = '') => `
  <label class="digital-paper-answer digital-paper-answer-long ${className}">
    <span>(${question})</span>
    <textarea data-original-q="${question}" data-dse-answer-q="${question}" maxlength="2000" spellcheck="false" aria-label="第 ${question} 題答案">${esc(value(question))}</textarea>
  </label>`;

const choice = (question, value, options, multiple = false) => {
  const saved = new Set(String(value(question)).split(',').filter(Boolean));
  return `<div class="digital-paper-choices" role="group" aria-label="第 ${question} 題">
    ${options.map(([key, label]) => `<label><input type="${multiple ? 'checkbox' : 'radio'}" name="dse-digital-q${question}" data-original-q="${question}" data-dse-answer-q="${question}" value="${key}" ${saved.has(key) ? 'checked' : ''}><span>${esc(label)}</span></label>`).join('')}
  </div>`;
};

const page = (number, code, content, extra = '') => `
  <section class="original-paper-page digital-paper-page ${extra}" id="original-paper-${number}" aria-label="原卷第 ${number} 頁">
    <div class="digital-paper-sheet">${content}</div>
    <footer><span>${esc(code)}</span><strong>${({1: 37, 2: 39, 3: 40, 4: 41, 5: 42, 6: 43, 7: 44, 8: 45})[number]}</strong></footer>
  </section>`;

const marginNotice = '<span class="digital-paper-margin digital-paper-margin-left">Answers written in the margins will not be marked.</span><span class="digital-paper-margin digital-paper-margin-right">Answers written in the margins will not be marked.</span>';
const translation = text => `<span class="digital-paper-translation" lang="zh-Hant">${esc(text)}</span>`;
const taskEnd = number => `<p class="digital-paper-task-end">END OF TASK ${number}${translation(`任務 ${number} 完結`)}</p>`;

export function render2016DigitalPaper(answers, selectedTask = 0) {
  const value = question => String(answers.get(Number(question)) || '');
  const yesNo = question => choice(question, value, [['A', 'yes'], ['B', 'no']]);
  const people = question => choice(question, value, [['A', 'Angela'], ['B', 'Mr Chau'], ['C', 'Mrs Chau']], true);

  const pages = [
    {task: 0, html: page(1, '2016-DSE-ENG LANG 3-A-1', `
      <div class="digital-paper-cover">
        <p>PAPER 3<br>PART A</p>
        <h1>2016-DSE<br><span>ENG LANG</span></h1>
        <strong>COMPULSORY</strong>
        <h2>HONG KONG EXAMINATIONS AND ASSESSMENT AUTHORITY</h2>
        <h3>HONG KONG DIPLOMA OF SECONDARY EDUCATION EXAMINATION 2016</h3>
        <h2>ENGLISH LANGUAGE PAPER 3<br>PART A</h2>
        <h3>Question-Answer Book</h3>
        <section class="digital-paper-instructions"><h4>GENERAL INSTRUCTIONS</h4><ol>
          <li>There are two parts (A and B) in this paper. All candidates should attempt ALL tasks in Part A. In Part B, you should attempt either Part B1 (easier section) OR Part B2 (more difficult section).</li>
          <li>Write your Candidate Number and stick barcode labels in the spaces provided.</li>
          <li>Write your answers clearly and neatly in the spaces provided. Answers written in the margins will not be marked. You are advised to use a pencil for Part A.</li>
          <li>All listening materials will be played ONCE only.</li>
          <li>The rough-work sheets are for notes only and will not be marked.</li>
        </ol></section>
      </div>`, 'digital-paper-cover-page')},

    {task: 0, html: page(2, '2016-DSE-ENG LANG 3-A-3', `
      <div class="digital-paper-barcode">Please stick the barcode label here.</div>
      <section class="digital-paper-situation">
        <h2>Part A</h2><h3>Situation</h3>
        <p>The Chau family is on holiday in London. You are going to listen to four recordings of the Chau family planning their holiday activities and visiting a museum.</p>
        <p>In Part A, you will have a total of four tasks to do. Follow the instructions in the Question-Answer Book and in the recording to complete the tasks. You will find all the information you need in the Question-Answer Book and the recording. You now have two minutes to familiarize yourself with Tasks 1-4.</p>
      </section>`, 'digital-paper-situation-page')},

    {task: 1, html: page(3, '2016-DSE-ENG LANG 3-A-4', `${marginNotice}
      <header class="digital-paper-task-header"><h2>Task 1 <em>(15 marks)</em></h2>${translation('任務一（15 分）')}<p>The Chau family is searching on the internet and talking about things to do. Listen to their discussion and write the information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one minute to tidy up your answers.</p>${translation('Chau 一家正在上網搜尋，討論可以做些什麼。請聆聽他們的討論，把資料填入以下空格。第一項已作為例子。你現在有 30 秒閱讀題目；任務完結時有一分鐘整理答案。')}</header>
      <section class="digital-paper-box digital-paper-task-one">
        <h3>Name of Museum 1: The Video Games Museum</h3>${translation('博物館一名稱：電子遊戲博物館')}
        <h4>Example Video Game 1</h4>${translation('電子遊戲例子一')}<p>Name: <u>Tennis for two (example)</u> <span>year: 1958</span>${translation('名稱：Tennis for Two（例子）；年份：1958。')}</p>
        <h4>Example Video Game 2</h4>${translation('電子遊戲例子二')}<div class="digital-paper-pair"><p>Name: ${line(1, value)}${translation('名稱：（1）')}</p><p>year: ${line(2, value)}${translation('年份：（2）')}</p></div>
        <h4>Example Video Game 3</h4>${translation('電子遊戲例子三')}<div class="digital-paper-pair"><p>Name: ${line(3, value)}${translation('名稱：（3）')}</p><p>year: ${line(4, value)}${translation('年份：（4）')}</p></div>
        <h4>Comments on visiting Museum 1:</h4>${translation('參觀博物館一的意見')}<p>Reason for not going: ${line(5, value)}${translation('不去的原因：（5）')}</p>
        <hr><h3>Name of Museum 2: ${line(6, value)}</h3>${translation('博物館二名稱：（6）')}<p>What you do in the museum: ${line(7, value)}${translation('在博物館內可以做什麼：（7）')}</p>
        <h4>Comments on visiting Museum 2:</h4>${translation('參觀博物館二的意見')}<p>Reason 1 for not going: ${line(8, value)}${translation('不去的原因一：（8）')}</p><p>Reason 2 for not going: ${line(9, value)}${translation('不去的原因二：（9）')}</p>
        <hr><h3>Name of Museum 3: Museum of Youth Culture</h3>${translation('博物館三名稱：青年文化博物館')}<h4>Exhibitions Angela wants to see (circle yes or no):</h4>${translation('Angela 想看的展覽（圈出「是」或「否」）')}
        <div class="digital-paper-choice-row"><span>Exhibition 1: (10) Toy ponies${translation('展覽一：（10）玩具小馬')}</span>${yesNo(10)}</div>
        <div class="digital-paper-choice-row"><span>Exhibition 2: (11) Boy bands${translation('展覽二：（11）男子組合')}</span>${yesNo(11)}</div>
        <div class="digital-paper-choice-row"><span>Exhibition 3: (12) Children's fashion${translation('展覽三：（12）兒童時裝')}</span>${yesNo(12)}</div>
        <h4>Comments on visiting Museum 3:</h4>${translation('參觀博物館三的意見')}<p>Reason 1 for going: ${line(13, value)}${translation('前往的原因一：（13）')}</p><p>Reason 2 for going: ${line(14, value)}${translation('前往的原因二：（14）')}</p><p>Reason 3 for going: ${line(15, value)}${translation('前往的原因三：（15）')}</p>
      </section>${taskEnd(1)}`)},

    {task: 2, html: page(4, '2016-DSE-ENG LANG 3-A-5', `${marginNotice}<div class="digital-paper-barcode">Please stick the barcode label here.${translation('請在此貼上條碼標籤。')}</div>
      <header class="digital-paper-task-header"><h2>Task 2 <em>(16 marks)</em></h2>${translation('任務二（16 分）')}<p>The Chau family are in the museum. They are talking about what they have just seen. Listen and fill in the missing information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one minute to tidy up your answers.</p>${translation('Chau 一家正在博物館內，談論剛看過的展品。請聆聽錄音，把缺漏資料填入以下空格。第一項已作為例子。你現在有 30 秒閱讀題目；任務完結時有一分鐘整理答案。')}</header>
      <section class="digital-paper-box">
        <h3>Exhibition seen by Mr Chau and Angela: <u>Teenagers and comics of the world (example)</u></h3>${translation('Chau 先生與 Angela 看過的展覽：「青少年與世界漫畫」（例子）')}
        <h3>Comics for girls</h3>${translation('女孩漫畫')}<p>Country: ${line(16, value)}${translation('國家：（16）')}</p><p>Two main kinds of comics:${translation('兩種主要漫畫類別：')}</p>
        <ul class="digital-paper-answer-list"><li>${line(17, value)} <span>e.g. ${line(18, value)}</span>${translation('類別（17），例如（18）')}</li><li>${line(19, value)} <span>e.g. ${line(20, value)}</span>${translation('類別（19），例如（20）')}</li></ul>
        <h3>Comic books that Angela buys in Hong Kong</h3>${translation('Angela 在香港購買的漫畫')}<p>They are from a shop in ${line(21, value)}${translation('購自（21）的商店')}</p><p>Reason for going there: ${line(22, value)}${translation('到那裡的原因：（22）')}</p><p>They are about ${line(23, value)}${translation('內容關於：（23）')}</p><p>e.g. ${line(24, value)}${translation('例如：（24）')}</p>
        <h3>Exhibition seen by Mrs Chau: Best-selling toys from the past</h3>${translation('Chau 太太看過的展覽：「昔日暢銷玩具」')}
        <div class="digital-paper-exhibit-table"><div class="digital-paper-exhibit-title">Exhibits</div><div class="digital-paper-exhibit-title">Details</div>
          <div><strong>Exhibit 1: Cabbage Patch Doll</strong>${translation('展品一：Cabbage Patch Doll（椰菜娃娃）')}<img src="assets/dse-listening/reconstructed-v3/2016/cabbage-patch-doll-1280.webp" alt="Cabbage Patch Doll"></div>
          <div><p>Popular in the ${line(25, value)}${translation('流行於（25）')}</p><p>• Reasons for popularity:${translation('受歡迎的原因：')}</p>${line(26, value)}${translation('原因：（26）')}${line(27, value)}${translation('原因：（27）')}</div>
          <div><strong>Exhibit 2: Space Hopper</strong>${translation('展品二：Space Hopper（彈跳球）')}<img src="assets/dse-listening/reconstructed-v3/2016/space-hopper-1280.webp" alt="Space Hopper"></div>
          <div><p>What it is: ${line(28, value)}${translation('它是什麼：（28）')}</p><p>What you do with it: ${line(29, value)}${translation('基本玩法：（29）')}</p><p>Two more things you can do with a Space Hopper:${translation('另外兩種彈跳球玩法：')}</p>${line(30, value)}${translation('玩法：（30）')}${line(31, value)}${translation('玩法：（31）')}</div>
        </div>
      </section>${taskEnd(2)}`)},

    {task: 3, html: page(5, '2016-DSE-ENG LANG 3-A-6', `${marginNotice}
      <header class="digital-paper-task-header"><h2>Task 3 <em>(16 marks)</em></h2>${translation('任務三（16 分）')}<p>The Chau family are looking at an exhibition in the museum called Young Inventors. A guide is showing them around this exhibition. Listen and fill in the missing information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one and a half minutes to tidy up your answers.</p>${translation('Chau 一家正在博物館參觀名為「年輕發明家」的展覽，由導賞員帶領。請聆聽錄音，把缺漏資料填入以下空格。第一項已作為例子。你現在有 30 秒閱讀題目；任務完結時有一分半鐘整理答案。')}</header>
      <section class="digital-paper-box"><h3>Invention 1: Shoe battery charger</h3>${translation('發明一：鞋子電池充電器')}<p>• Name of inventor: Juan Domingo${translation('發明者姓名：Juan Domingo')}</p>
        <h3>Origin of the idea</h3>${translation('構思來源')}<ul><li>The inventor walks <u>5 km to school every day (example)</u>.${translation('發明者每天步行五公里上學（例子）。')}</li><li>He realized that this is ${line(32, value)}${translation('他發覺這是（32）')}</li><li>The average person takes ${line(33, value)}${translation('一般人平均會走（33）')}</li></ul>
        <h3>How the invention works</h3>${translation('發明的運作原理')}<ol class="digital-paper-flow"><li>Step on the ${line(34, value)}${translation('步驟一：踏在（34）上')}</li><li>Footsteps generate ${line(35, value)}${translation('步驟二：腳步產生（35）')}</li><li>This is converted to electricity.${translation('步驟三：這轉化為電力。')}</li><li>Electricity is stored in batteries, which are attached to ${line(36, value)}${translation('步驟四：電力儲存在電池內，電池裝在（36）')}</li></ol>
        <h3>Examples of use</h3>${translation('用途例子')}<p>Ninety minutes of ${line(37, value)} = fifteen minutes of electricity for ${line(38, value)}${translation('（37）九十分鐘＝足供（38）使用十五分鐘的電力')}</p><p>Another application of the shoes: ${line(39, value)}${translation('鞋子的另一用途：（39）')}</p>
        <h3>(40) Who thinks the invention is useful? <em>(tick the correct option or options below)</em></h3>${translation('第 40 題：誰認為這項發明有用？（剔選以下正確選項）')}<p><em>Note: You can tick one or more of the options</em>${translation('注意：可選一項或以上。')}</p>${people(40)}
      </section>`)},

    {task: 3, html: page(6, '2016-DSE-ENG LANG 3-A-7', `${marginNotice}
      <section class="digital-paper-box digital-paper-page-six"><h2>Invention 2: Smelly Alarm Clock</h2>${translation('發明二：氣味鬧鐘')}<p>• Name of inventor: Jean Paul Moncoeur${translation('發明者姓名：Jean Paul Moncoeur')}</p>
        <h3>Origin of the idea</h3>${translation('構思來源')}<p>• His father ${line(41, value)} the sound of an alarm clock<br>and so ${line(42, value)}${translation('他的父親（41）鬧鐘聲，所以（42）')}</p>
        <h3>Further details</h3>${translation('其他詳情')}<p>• Smell that works best is ${line(43, value)}${translation('最有效的氣味是（43）')}</p><p>• The device ${line(44, value)} towards the person who is sleeping.${translation('裝置會朝着熟睡的人（44）')}</p><p>• Most people wake up ${line(45, value)} and ${line(46, value)}${translation('大部分人醒來時（45），而且（46）')}</p>
        <h3>(47) Who likes the invention? <em>(tick the correct option or options below)</em></h3>${translation('第 47 題：誰喜歡這項發明？（剔選以下正確選項）')}<p><em>Note: You can tick one or more of the options</em>${translation('注意：可選一項或以上。')}</p>${people(47)}
      </section>${taskEnd(3)}`)},

    {task: 4, html: page(7, '2016-DSE-ENG LANG 3-A-8', `${marginNotice}
      <header class="digital-paper-task-header"><h2>Task 4 <em>(11 marks)</em></h2>${translation('任務四（11 分）')}<p>The Chau family are attending a lecture given by David Stott about movie stars that are popular with young people. Listen to the lecture and answer the questions below. Please note you do not need to answer in complete sentences. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have two minutes to tidy up your answers.</p>${translation('Chau 一家正在聽 David Stott 的講座，主題是受年輕人歡迎的影星。請聆聽講座並回答以下問題；不必以完整句子作答。第一項已作為例子。你現在有 30 秒閱讀題目；任務完結時有兩分鐘整理答案。')}</header>
      <section class="digital-paper-box digital-paper-james"><img src="assets/dse-listening/reconstructed-v3/2016/james-dean-1280.webp" alt="James Dean">
        ${translation('圖片：James Dean')}
        <p>If people have not seen a James Dean movie, in what <u>three</u> ways might people recognize him?${translation('即使未看過 James Dean 的電影，人們仍可能透過哪三種方式認識他？')}</p><p class="digital-paper-example"><u>From a work of art (example)</u>${translation('從藝術作品中認識（例子）')}</p>${line(48, value)}${translation('方式：（48）')}${line(49, value)}${translation('方式：（49）')}
        <p>Give <u>two</u> reasons why he is still so famous.${translation('提出兩個他至今仍如此有名的原因。')}</p>${line(50, value)}${translation('原因：（50）')}${line(51, value)}${translation('原因：（51）')}
        <p>Why was he fired from his job as a stunt tester?${translation('他為何被辭退，不再擔任特技測試員？')}</p>${longLine(52, value)}${translation('答案：（52）')}
      </section>`)},

    {task: 4, html: page(8, '2016-DSE-ENG LANG 3-A-9', `${marginNotice}
      <section class="digital-paper-box digital-paper-task-four-end">
        <p>What was special about the movie <em>Rebel Without a Cause</em>?${translation('電影《阿飛正傳》（Rebel Without a Cause）有何特別？')}</p>${longLine(53, value)}${translation('答案：（53）')}
        <p>Before <em>Rebel Without a Cause</em>, what kind of roles did young people have in movies?${translation('在《阿飛正傳》之前，年輕人在電影中扮演什麼類型的角色？')}</p>${longLine(54, value)}${translation('答案：（54）')}
        <p>What was the purpose of having young people in movies before <em>Rebel Without a Cause</em>?${translation('在《阿飛正傳》之前，電影安排年輕人出場的目的是什麼？')}</p>${longLine(55, value)}${translation('答案：（55）')}
        <p>What <u>three</u> effects did <em>Rebel Without a Cause</em> have on the movie industry?${translation('《阿飛正傳》對電影業造成哪三項影響？')}</p>${line(56, value)}${translation('影響：（56）')}${line(57, value)}${translation('影響：（57）')}${line(58, value)}${translation('影響：（58）')}
      </section>${taskEnd(4)}<h2 class="digital-paper-part-end">End of Part A<br><span>Now go on to Part B</span>${translation('甲部完結；請繼續乙部。')}</h2>
      <p class="digital-paper-source-note">Sources of materials used in this paper will be acknowledged in the Examination Report and Question Papers published by the Hong Kong Examinations and Assessment Authority at a later stage.${translation('本卷使用的資料來源將於稍後出版的考試報告及試題中鳴謝。')}</p>`) }
  ];
  const task = Number(selectedTask);
  return pages.filter(item => task >= 1 && task <= 4 ? item.task === task : true).map(item => item.html).join('');
}

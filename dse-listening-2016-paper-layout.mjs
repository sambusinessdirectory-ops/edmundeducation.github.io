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
const taskEnd = number => `<p class="digital-paper-task-end">END OF TASK ${number}</p>`;

export function render2016DigitalPaper(answers) {
  const value = question => String(answers.get(Number(question)) || '');
  const yesNo = question => choice(question, value, [['A', 'yes'], ['B', 'no']]);
  const people = question => choice(question, value, [['A', 'Angela'], ['B', 'Mr Chau'], ['C', 'Mrs Chau']], true);

  return [
    page(1, '2016-DSE-ENG LANG 3-A-1', `
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
      </div>`, 'digital-paper-cover-page'),

    page(2, '2016-DSE-ENG LANG 3-A-3', `
      <div class="digital-paper-barcode">Please stick the barcode label here.</div>
      <section class="digital-paper-situation">
        <h2>Part A</h2><h3>Situation</h3>
        <p>The Chau family is on holiday in London. You are going to listen to four recordings of the Chau family planning their holiday activities and visiting a museum.</p>
        <p>In Part A, you will have a total of four tasks to do. Follow the instructions in the Question-Answer Book and in the recording to complete the tasks. You will find all the information you need in the Question-Answer Book and the recording. You now have two minutes to familiarize yourself with Tasks 1-4.</p>
      </section>`, 'digital-paper-situation-page'),

    page(3, '2016-DSE-ENG LANG 3-A-4', `${marginNotice}
      <header class="digital-paper-task-header"><h2>Task 1 <em>(15 marks)</em></h2><p>The Chau family is searching on the internet and talking about things to do. Listen to their discussion and write the information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one minute to tidy up your answers.</p></header>
      <section class="digital-paper-box digital-paper-task-one">
        <h3>Name of Museum 1: The Video Games Museum</h3>
        <h4>Example Video Game 1</h4><p>Name: <u>Tennis for two (example)</u> <span>year: 1958</span></p>
        <h4>Example Video Game 2</h4><div class="digital-paper-pair"><p>Name: ${line(1, value)}</p><p>year: ${line(2, value)}</p></div>
        <h4>Example Video Game 3</h4><div class="digital-paper-pair"><p>Name: ${line(3, value)}</p><p>year: ${line(4, value)}</p></div>
        <h4>Comments on visiting Museum 1:</h4><p>Reason for not going: ${line(5, value)}</p>
        <hr><h3>Name of Museum 2: ${line(6, value)}</h3><p>What you do in the museum: ${line(7, value)}</p>
        <h4>Comments on visiting Museum 2:</h4><p>Reason 1 for not going: ${line(8, value)}</p><p>Reason 2 for not going: ${line(9, value)}</p>
        <hr><h3>Name of Museum 3: Museum of Youth Culture</h3><h4>Exhibitions Angela wants to see (circle yes or no):</h4>
        <div class="digital-paper-choice-row"><span>Exhibition 1: (10) Toy ponies</span>${yesNo(10)}</div>
        <div class="digital-paper-choice-row"><span>Exhibition 2: (11) Boy bands</span>${yesNo(11)}</div>
        <div class="digital-paper-choice-row"><span>Exhibition 3: (12) Children's fashion</span>${yesNo(12)}</div>
        <h4>Comments on visiting Museum 3:</h4><p>Reason 1 for going: ${line(13, value)}</p><p>Reason 2 for going: ${line(14, value)}</p><p>Reason 3 for going: ${line(15, value)}</p>
      </section>${taskEnd(1)}`),

    page(4, '2016-DSE-ENG LANG 3-A-5', `${marginNotice}<div class="digital-paper-barcode">Please stick the barcode label here.</div>
      <header class="digital-paper-task-header"><h2>Task 2 <em>(16 marks)</em></h2><p>The Chau family are in the museum. They are talking about what they have just seen. Listen and fill in the missing information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one minute to tidy up your answers.</p></header>
      <section class="digital-paper-box">
        <h3>Exhibition seen by Mr Chau and Angela: <u>Teenagers and comics of the world (example)</u></h3>
        <h3>Comics for girls</h3><p>Country: ${line(16, value)}</p><p>Two main kinds of comics:</p>
        <ul class="digital-paper-answer-list"><li>${line(17, value)} <span>e.g. ${line(18, value)}</span></li><li>${line(19, value)} <span>e.g. ${line(20, value)}</span></li></ul>
        <h3>Comic books that Angela buys in Hong Kong</h3><p>They are from a shop in ${line(21, value)}</p><p>Reason for going there: ${line(22, value)}</p><p>They are about ${line(23, value)}</p><p>e.g. ${line(24, value)}</p>
        <h3>Exhibition seen by Mrs Chau: Best-selling toys from the past</h3>
        <div class="digital-paper-exhibit-table"><div class="digital-paper-exhibit-title">Exhibits</div><div class="digital-paper-exhibit-title">Details</div>
          <div><strong>Exhibit 1: Cabbage Patch Doll</strong><img src="assets/dse-listening/reconstructed-v3/2016/cabbage-patch-doll-1280.webp" alt="Cabbage Patch Doll"></div>
          <div><p>Popular in the ${line(25, value)}</p><p>• Reasons for popularity:</p>${line(26, value)}${line(27, value)}</div>
          <div><strong>Exhibit 2: Space Hopper</strong><img src="assets/dse-listening/reconstructed-v3/2016/space-hopper-1280.webp" alt="Space Hopper"></div>
          <div><p>What it is: ${line(28, value)}</p><p>What you do with it: ${line(29, value)}</p><p>Two more things you can do with a Space Hopper:</p>${line(30, value)}${line(31, value)}</div>
        </div>
      </section>${taskEnd(2)}`),

    page(5, '2016-DSE-ENG LANG 3-A-6', `${marginNotice}
      <header class="digital-paper-task-header"><h2>Task 3 <em>(16 marks)</em></h2><p>The Chau family are looking at an exhibition in the museum called Young Inventors. A guide is showing them around this exhibition. Listen and fill in the missing information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one and a half minutes to tidy up your answers.</p></header>
      <section class="digital-paper-box"><h3>Invention 1: Shoe battery charger</h3><p>• Name of inventor: Juan Domingo</p>
        <h3>Origin of the idea</h3><ul><li>The inventor walks <u>5 km to school every day (example)</u>.</li><li>He realized that this is ${line(32, value)}</li><li>The average person takes ${line(33, value)}</li></ul>
        <h3>How the invention works</h3><ol class="digital-paper-flow"><li>Step on the ${line(34, value)}</li><li>Footsteps generate ${line(35, value)}</li><li>This is converted to electricity.</li><li>Electricity is stored in batteries, which are attached to ${line(36, value)}</li></ol>
        <h3>Examples of use</h3><p>Ninety minutes of ${line(37, value)} = fifteen minutes of electricity for ${line(38, value)}</p><p>Another application of the shoes: ${line(39, value)}</p>
        <h3>(40) Who thinks the invention is useful? <em>(tick the correct option or options below)</em></h3><p><em>Note: You can tick one or more of the options</em></p>${people(40)}
      </section>`),

    page(6, '2016-DSE-ENG LANG 3-A-7', `${marginNotice}
      <section class="digital-paper-box digital-paper-page-six"><h2>Invention 2: Smelly Alarm Clock</h2><p>• Name of inventor: Jean Paul Moncoeur</p>
        <h3>Origin of the idea</h3><p>• His father ${line(41, value)} the sound of an alarm clock<br>and so ${line(42, value)}</p>
        <h3>Further details</h3><p>• Smell that works best is ${line(43, value)}</p><p>• The device ${line(44, value)} towards the person who is sleeping.</p><p>• Most people wake up ${line(45, value)} and ${line(46, value)}</p>
        <h3>(47) Who likes the invention? <em>(tick the correct option or options below)</em></h3><p><em>Note: You can tick one or more of the options</em></p>${people(47)}
      </section>${taskEnd(3)}`),

    page(7, '2016-DSE-ENG LANG 3-A-8', `${marginNotice}
      <header class="digital-paper-task-header"><h2>Task 4 <em>(11 marks)</em></h2><p>The Chau family are attending a lecture given by David Stott about movie stars that are popular with young people. Listen to the lecture and answer the questions below. Please note you do not need to answer in complete sentences. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have two minutes to tidy up your answers.</p></header>
      <section class="digital-paper-box digital-paper-james"><img src="assets/dse-listening/reconstructed-v3/2016/james-dean-1280.webp" alt="James Dean">
        <p>If people have not seen a James Dean movie, in what <u>three</u> ways might people recognize him?</p><p class="digital-paper-example"><u>From a work of art (example)</u></p>${line(48, value)}${line(49, value)}
        <p>Give <u>two</u> reasons why he is still so famous.</p>${line(50, value)}${line(51, value)}
        <p>Why was he fired from his job as a stunt tester?</p>${longLine(52, value)}
      </section>`),

    page(8, '2016-DSE-ENG LANG 3-A-9', `${marginNotice}
      <section class="digital-paper-box digital-paper-task-four-end">
        <p>What was special about the movie <em>Rebel Without a Cause</em>?</p>${longLine(53, value)}
        <p>Before <em>Rebel Without a Cause</em>, what kind of roles did young people have in movies?</p>${longLine(54, value)}
        <p>What was the purpose of having young people in movies before <em>Rebel Without a Cause</em>?</p>${longLine(55, value)}
        <p>What <u>three</u> effects did <em>Rebel Without a Cause</em> have on the movie industry?</p>${line(56, value)}${line(57, value)}${line(58, value)}
      </section>${taskEnd(4)}<h2 class="digital-paper-part-end">End of Part A<br><span>Now go on to Part B</span></h2>
      <p class="digital-paper-source-note">Sources of materials used in this paper will be acknowledged in the Examination Report and Question Papers published by the Hong Kong Examinations and Assessment Authority at a later stage.</p>`)
  ].join('');
}

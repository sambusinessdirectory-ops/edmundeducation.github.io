// Source-checked draft of the 2026 HKDSE English Paper 3 Part A booklet.
// Printed page 4 was cross-checked against the complete online booklet;
// the other pages were transcribed from the user's local scanned booklet.
// All 53 numbered answer controls are backed by the local booklet and the
// complete RTHK examination broadcast, split into four task recordings.
(function registerDse2026() { 'use strict';
const data = {
  version: 1, year: 2026, questionCount: 53,
  situation: 'In Part A, you will have a total of four tasks to do related to special and unusual libraries around the world.',
  situationZh: '甲部共有四項任務，內容與世界各地特別而罕見的圖書館有關。',
  instructions: 'Follow the instructions in the Question-Answer Book and in the recording to complete the tasks. You will find all the information you need in the Question-Answer Book and the recording.',
  instructionsZh: '請按答題簿和錄音的指示完成任務；所需資料均在答題簿和錄音中。',
  familiarisation: 'You now have two minutes to familiarise yourself with Tasks 1–4.',
  familiarisationZh: '你現在有兩分鐘熟習任務一至四。',
  tasks: [
    {number:1, marks:11, title:'Tiny Libraries', titleZh:'迷你圖書館',
      instruction:'Mary Yang is a presenter on a local radio station. Today, she is interviewing James Leigh, a local resident, about Tiny Libraries. Listen to their conversation and complete the information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one minute to tidy up your answers.',
      instructionZh:'本地電台主持 Mary Yang 訪問居民 James Leigh，討論迷你圖書館。聆聽對話並完成資料；首題為例子。你有三十秒閱讀題目，錄音結束後有一分鐘整理答案。',
      blocks:[
        {type:'template',html:'<p>Tiny Libraries are <span class="dse-example-answer">small boxes full of books (example)</span>.</p>',translation:'迷你圖書館是裝滿書的小箱子（例子）。'},
        {type:'multiple-choice',number:1,prompt:'Tiny Libraries are usually made from',options:['paper.','plastic.','wood.','metal.'],translation:'迷你圖書館通常由甚麼材料製成？'},
        {type:'multiple-choice',number:2,prompt:'James was told about Tiny Libraries by his',options:['wife.','sister.','brother.','brother-in-law.'],translation:'是 James 的哪位親人告訴他迷你圖書館的事？'},
        {type:'template',html:'<p>James says every Tiny Library needs to be {{3}} and {{4}}.</p>',translation:'James 說每個迷你圖書館需要具備哪兩項特質？'},
        {type:'multiple-choice',number:5,prompt:'James says Tiny Libraries should be about the same height as',options:['a post box.','a rubbish bin.','his neck.','a bird house.'],translation:'James 說迷你圖書館的高度應大約相當於哪一樣東西？'},
        {type:'multiple-select',number:6,prompt:'Tick the features that James says every Tiny Library must have.',options:['wi-fi','a sign','a window','a door','animal prints','LED lights','music'],translation:'勾選 James 認為每個迷你圖書館都必須有的設備或特徵。'},
        {type:'template',html:'<p>People started to use James’s Tiny Library after {{7}}.</p><p>After having a Tiny Library, James’s daughter learned about {{8}}.</p>',translation:'人們在甚麼事情發生後開始使用 James 的迷你圖書館？他的女兒因為有了迷你圖書館而學會了甚麼？'},
        {type:'heading',text:'Locations of the Tiny Libraries',translation:'迷你圖書館的位置'},
        {type:'template',html:'<p>Study the map. Write the letter (A–G) that matches each Tiny Library.</p><img class="dse-reconstructed-diagram" src="assets/listening/dse-2026-tiny-libraries-map.svg" alt="Map of Oak Tree Lane, Magnolia Drive and Maple Avenue, showing buildings and possible Tiny Library locations A to G"><p>James’s Tiny Library: {{9|A|B|C|D|E|F|G}}</p><p>Leila’s Tiny Library: {{10|A|B|C|D|E|F|G}}</p><p>Nisha’s Tiny Library: {{11|A|B|C|D|E|F|G}}</p>',translation:'參照地圖，為 James、Leila 和 Nisha 的迷你圖書館選出相應位置（A–G）。'}
      ]},
    {number:2,marks:17,title:'A mobile library van in Canada',titleZh:'加拿大流動圖書車',
      instruction:'John Murray is interviewing Iain Fraser for his podcast. Iain drives a mobile library van in the Canadian countryside. Listen carefully and complete the information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one minute to tidy up your answers.',
      instructionZh:'John Murray 在播客訪問 Iain Fraser；Iain 在加拿大鄉郊駕駛流動圖書車。仔細聆聽並完成資料；首題為例子。你有三十秒讀題，最後有一分鐘整理答案。',
      blocks:[
        {type:'template',html:'<p>Iain’s van is easy to see on the road because it is <span class="dse-example-answer">painted bright yellow (example)</span>.</p>',translation:'Iain 的車漆成鮮黃色，所以在路上很容易看見（例子）。'},
        {type:'heading',text:'Inside the van',translation:'車內佈局'},
        {type:'template',html:'<p>Complete the diagram of the mobile library van.</p><img class="dse-reconstructed-diagram" src="assets/listening/dse-2026-van-plan.svg" alt="Plan of the van with numbered positions 12 to 15, plus children’s books, fantasy books, crime books, a kettle, chair, driver’s seat and door"><p>(12) {{12}}</p><p>(13) {{13}} books</p><p>(14) {{14}} books</p><p>(15) {{15}} books</p>',translation:'完成流動圖書車的平面圖；填上司機後方的物件及三類書籍。'},
        {type:'multiple-choice',number:16,prompt:'Items are currently checked out from the van using',options:['a notebook.','a barcode scanner.','a mobile phone app.','the library website.'],translation:'目前借出車上物品時用甚麼記錄？'},
        {type:'heading',text:'Iain’s route',translation:'Iain 的行車路線'},
        {type:'template',html:'<p>Complete the map of Iain’s route.</p><img class="dse-reconstructed-diagram" src="assets/listening/dse-2026-van-route.svg" alt="Iain’s mobile library route from Village Square past stops 17, 18, Picnic Area, 19 and 20"><p>(17) {{17}}</p><p>(18) {{18}}</p><p>(19) {{19}}</p><p>(20) {{20}}</p><p>Iain enjoys driving by the ______ and through the ______.</p><p>(21) Write both missing places, in order: {{21}}</p>',translation:'完成 Iain 的行車路線圖；並填上他喜歡駛經的兩個地方。'},
        {type:'template',html:'<p>Iain has twice been stopped from completing his route:</p><ul><li>In summertime, he was stopped by {{22}}.</li><li>In wintertime, he was stopped by {{23}}.</li></ul>',translation:'Iain 曾兩次未能完成路線：分別說明夏季和冬季的阻礙。'},
        {type:'template',html:'<p>Complete the table below.</p><div class="listening-table-wrap"><table class="dse-native-table"><thead><tr><th>Person</th><th>How they are nice to Iain</th></tr></thead><tbody><tr><td>Ellie</td><td>brings him pinecones</td></tr><tr><td>Annie</td><td>{{24}}</td></tr><tr><td>William</td><td>helps him fix the van’s engine</td></tr><tr><td>Peter</td><td>{{25}}</td></tr><tr><td>Frankie</td><td>{{26}} every time he visits</td></tr></tbody></table></div><p>Iain says the biggest challenge of his job is {{27}}.</p><p>With all of his experience driving the van, Iain has {{28}}.</p>',translation:'完成居民如何友善對待 Iain 的表格，並記下工作的最大挑戰，以及多年駕車帶給他的收穫。'}
      ]},
    {number:3,marks:13,title:'Unusual mobile libraries',titleZh:'世界各地的特別流動圖書館',
      instruction:'You will hear a discussion hosted by Monica Lam at a conference about libraries. Monica is joined by Dr Asha Giles and Dr Bill Lorimer, experts in unusual mobile libraries around the world. Listen to their conversation and complete the information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one minute to tidy up your answers.',
      instructionZh:'在圖書館會議上，主持 Monica Lam 與研究世界各地特別流動圖書館的專家 Asha Giles 博士和 Bill Lorimer 博士討論。聆聽並完成資料；首題為例子。',
      blocks:[
        {type:'heading',text:'Laos',translation:'老撾'},
        {type:'template',html:'<p>The Laos Literacy Project reaches rural communities using <span class="dse-example-answer">a fleet of river boats (example)</span>.</p><p>Younger children prefer reading on the boat because {{29}}.</p><p>Paper books are used because the villagers are unable to {{30}}.</p><p>To show their appreciation, the children always {{31}}.</p>',translation:'老撾識字計劃以一隊河船服務鄉村（例子）。小朋友為何喜歡在船上閱讀？村民為何不能使用紙本以外的書？孩子如何表達謝意？'},
        {type:'heading',text:'Kenya',translation:'肯尼亞'},
        {type:'template',html:'<p>Camels are suited to delivering library books to remote villages in Kenya because they:</p><ul><li>{{32}} in the heat.</li><li>don’t require {{33}}.</li></ul><p>The camel handler:</p><ul><li>regularly {{34}} of the camels.</li><li>{{35}} to the village elders.</li></ul><p>The job of the second camel is to {{36}}.</p>',translation:'為何駱駝適合把書送到肯尼亞偏遠村落？駱駝照料員做甚麼？第二隻駱駝有何用途？'},
        {type:'heading',text:'Norway',translation:'挪威'},
        {type:'template',html:'<p>The Epos library ship is unique because it has {{37}} on one of its decks.</p><h4>Aksel Andersen’s event</h4><p>Aksel Andersen, a visitor to the ship, is a {{38}}.</p><p>For Aksel’s event, around ______ local children had to ______ in really cold weather simply to ______.</p><p>(39) Write all three missing parts, in order: {{39}}</p><p>After Aksel’s event, the children were treated to {{40}}.</p><p>To make the lounge more cosy, the librarians arranged beanbags {{41}} for the attendees to sit on.</p>',translation:'Epos 圖書船哪項設施獨特？Aksel Andersen 的身分是甚麼？孩子在嚴寒中為活動做了甚麼？活動後獲得甚麼款待？圖書館員如何擺放豆袋令休息室更舒適？'}
      ]},
    {number:4,marks:12,title:'Trinity College Library',titleZh:'都柏林聖三一學院圖書館',
      instruction:'You will hear lecturer Alex Lowry introduce Trinity College Library, recorded for the tourism board of Dublin, Ireland. Listen carefully and complete the information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have three minutes to tidy up your answers.',
      instructionZh:'講師 Alex Lowry 為愛爾蘭都柏林旅遊局介紹聖三一學院圖書館。仔細聆聽並完成資料；首題為例子。你有三十秒讀題，最後有三分鐘整理答案。',
      blocks:[
        {type:'heading',text:'Trinity College Library Fact Sheet',translation:'聖三一學院圖書館資料表'},
        {type:'template',html:'<h4>The Legal Deposit System</h4><ul><li>began <span class="dse-example-answer">in the early 19th century (example)</span></li><li>the library receives a copy of every book when it is published</li><li>makes sure that {{42}}</li></ul><h4>The Long Room</h4><p>Impressive features include:</p><p>{{43}}</p><p>{{44}}</p><h4>The Book of Kells</h4><p>most famous for {{45}}.</p><p>Ways the library protects the Book of Kells:</p><p>The library {{46}}.</p><p>The library {{47}} in the room.</p>',translation:'法定送存制度始於十九世紀初（例子），令圖書館收到每本新出版書籍，並確保甚麼？長廊的兩項令人讚嘆的特色是甚麼？《凱爾經》以甚麼聞名？圖書館用哪兩種方法保護它？'},
        {type:'template',html:'<h4>Collections</h4><p>Types of rare item that the library holds, apart from books:</p><p>{{48}}</p><p>{{49}}</p><h4>Educational Workshops</h4><p>aimed at getting young people to {{50}}.</p><h4>Culture Nights</h4><p>The two measures that encourage workers to visit are ______ and ______.</p><p>(51) Write both measures, in order: {{51}}</p><h4>Winter Festival</h4><p>the organisers {{52}}.</p><h4>‘Mother’ installation</h4><p>a large, bright globe with {{53}}.</p>',translation:'除書籍外，圖書館收藏哪兩類珍貴物品？教育工作坊希望年輕人做甚麼？文化之夜透過哪兩項措施鼓勵上班族參觀？冬季節慶的主辦單位做甚麼？「Mother」裝置是一個帶有甚麼的大型明亮球體？'}
      ]}
  ], transcript:{partA:window.EDMUND_DSE_LISTENING_2026_TRANSCRIPT || {},partB:[]}
};
function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
window.EDMUND_DSE_LISTENING_2026=freeze(data);
})();

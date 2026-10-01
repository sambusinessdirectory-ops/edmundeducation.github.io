// Source-checked reconstruction of the 2025 HKDSE English Paper 3 Part A booklet.
// Source: local 12-page complete exam booklet; numbered answer fields 1–53.
(function registerDse2025() { 'use strict';
const data = {
  version: 1, year: 2025, questionCount: 53,
  situation: 'In Part A, you will have a total of four tasks to do related to a podcast about health and fitness.',
  situationZh: '甲部共有四項任務，內容圍繞一個討論健康與健身的播客。',
  instructions: 'Follow the instructions in the Question-Answer Book and in the recording to complete the tasks. You will find all the information you need in the Question-Answer Book and the recording.',
  instructionsZh: '請依照答題簿和錄音中的指示完成任務；所需資料均可在答題簿及錄音中找到。',
  familiarisation: 'You now have two minutes to familiarise yourself with Tasks 1–4.',
  familiarisationZh: '你現在有兩分鐘熟習任務一至四。',
  tasks: [
    { number: 1, marks: 13, title: 'Sea Friends',
      instruction: 'Stella Poon and Adrian Timpson host a podcast about health and fitness in Hong Kong. They are now talking with a guest, Ricky Harrison, who is the founder of a charity called Sea Friends. Listen to the interview and complete the information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one minute to tidy up your answers.',
      blocks: [
        {type:'template',html:'<p>When Ricky started <em>Sea Friends</em>: <span class="dse-example-answer">10 years ago (example)</span></p><p>The number of people who have learned to swim with <em>Sea Friends</em>: {{1}}</p><p>How long it takes to learn how to swim with <em>Sea Friends</em>: {{2}}</p><p>Who <em>Sea Friends</em> mainly helps: {{3}} <small>(write both groups)</small></p><p>When <em>Sea Friends</em> meets: {{4}}</p>'},
        {type:'template',html:'<p>Ricky first went swimming with his {{5}}.</p><p>He stopped swimming because his coach {{6}}.</p><p>He started swimming again because he wanted to {{7}}.</p><p>His new coach was his {{8}}.</p>'},
        {type:'heading',text:'Next year’s Sea Friends event'},
        {type:'template',html:'<div class="listening-table-wrap"><table class="dse-native-table"><tbody><tr><th scope="row">Name of event</th><td>{{9}}</td></tr><tr><th scope="row">Details of event</th><td>{{10}}</td></tr></tbody></table></div><p>Three reasons why Ricky recommends joining <em>Sea Friends</em>:</p><p>{{11}}</p><p>{{12}}</p><p>{{13}}</p>'}
      ]},
    { number: 2, marks: 13, title: 'Exercise in Asia',
      instruction: 'Adrian is interviewing Jessica Becker. Jessica has written a book about culture and fitness in Asia. Listen to the interview and complete the information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one minute to tidy up your answers.',
      blocks: [
        {type:'template',html:'<p>The title of Jessica’s book is <span class="dse-example-answer">Exercise in Asia (example)</span>.</p>'},
        {type:'heading',text:'Taiko Drumming in Japan'},
        {type:'template',html:'<h4>The Taiko Drumming Tradition</h4><p>Jessica says the aim of taiko drumming was to communicate {{14}}.</p><h4>Taiko Festivals</h4><p>Jessica says taiko drums are too _____ to _____, so the drums are placed on {{16}}.</p><p>(15) Write both missing words/phrases, in order: {{15}}</p><h4>The Big Drums</h4><p>In the past, the big drums were made from {{17}}.</p><p>To play a big drum well, you must use {{18}}.</p>'},
        {type:'heading',text:'K-pop Dancing Lessons in Korea'},
        {type:'template',html:'<p>Jessica thinks K-pop dancing became good exercise when boy bands added {{19}} to their performances.</p><p>Jessica’s advice for attending a K-pop dance class in Korea:</p><ul><li>{{20}} before class</li><li>wear clothes that let you move freely</li><li>wear {{21}}</li></ul><p>According to Jessica, the most important thing to learn in a K-pop dance class is {{22}}.</p>'},
        {type:'heading',text:'Marathons in Thailand'},
        {type:'template',html:'<p>Jessica says that because it is hot in Thailand, marathons usually start {{23}} and {{24}} are given out.</p><p>Jessica’s tips for marathon running in Thailand:</p><p>{{25}}</p><p>{{26}}</p>'}
      ]},
    { number: 3, marks: 14, title: 'Wearable fitness trackers',
      instruction: 'Adrian and Stella have been testing some wearable fitness trackers. They are now reviewing them for the podcast. Listen to their conversation and complete the information in the spaces below. The first one has been provided as an example. You now have 30 seconds to study the task. At the end of the task, you will have one minute to tidy up your answers.',
      blocks: [
        {type:'heading',text:'The N.R.G. 6'},
        {type:'template',html:'<p>Stella likes the N.R.G. 6 because it is <span class="dse-example-answer">comfortable (example)</span>.</p><p>Stella thinks that the N.R.G. 6 buttons make it {{27}}.</p><p>Two things Adrian didn’t like about the N.R.G. 6:</p><p>{{28}}</p><p>{{29}}</p><p>The N.R.G. 6 gave Stella {{30}}, which she really liked.</p>'},
        {type:'heading',text:'The Getfit 4'},
        {type:'template',html:'<p>The Getfit 4 has workout exercises such as {{31}}.</p><p>Stella wants the Getfit 4 company to improve {{32}}.</p><p>Stella didn’t monitor her sleep with the Getfit 4 because {{33}}.</p><p>Adrian thinks the rating of his sleep quality was {{34}}.</p>'},
        {type:'heading',text:'Features'},
        {type:'template',html:'<p>Complete the table summarising Adrian and Stella’s opinion on the features of the devices. Tick ONLY ONE option for each feature.</p><div class="listening-table-wrap"><table class="dse-native-table"><thead><tr><th>Feature</th><th>Getfit 4 is better / N.R.G. 6 is better / Both are very good</th></tr></thead><tbody><tr><th>Screen brightness</th><td>{{35|Getfit 4 is better|N.R.G. 6 is better|Both are very good}}</td></tr><tr><th>Battery life</th><td>{{36|Getfit 4 is better|N.R.G. 6 is better|Both are very good}}</td></tr><tr><th>GPS</th><td>{{37|Getfit 4 is better|N.R.G. 6 is better|Both are very good}}</td></tr><tr><th>Waterproofness</th><td>{{38|Getfit 4 is better|N.R.G. 6 is better|Both are very good}}</td></tr></tbody></table></div>'},
        {type:'heading',text:'Recommendations'},
        {type:'template',html:'<p>Adrian recommends the Getfit 4 for someone who {{39}}.</p><p>Stella recommends the N.R.G. 6 for people who {{40}}.</p>'}
      ]},
    { number: 4, marks: 13, title: 'A professional dog walker',
      instruction: 'In this episode of the podcast, Stella’s friend Sandy Elliot is giving a talk about her life as a professional dog walker. Listen to the talk, answer the questions and complete the information below. The first one has been provided as an example. Please note that you do not need to answer in complete sentences. You now have 30 seconds to study the task. At the end of the task, you will have three minutes to tidy up your answers.',
      blocks: [
        {type:'template',html:'<p>Why did Sandy become a professional dog walker?</p><p><span class="dse-example-answer">because the cost of opening a pet shop was too high (example)</span></p><p>What did Sandy send to customers after every walk?</p><p>{{41}}</p><p>Unusual requests from Sandy’s customers:</p><p>A video of a dog {{42}}</p><p>Photos of a dog {{43}}</p>'},
        {type:'template',html:'<p>Complete the table about the health benefits of walking a dog.</p><div class="listening-table-wrap"><table class="dse-native-table"><thead><tr><th>Health benefit for owner</th><th>Reason for benefit</th></tr></thead><tbody><tr><td>May have a longer life</td><td>{{44}}</td></tr><tr><td>{{45}}</td><td>Dogs can change direction without warning</td></tr><tr><td>{{46}}</td><td>{{47}}</td></tr></tbody></table></div>'},
        {type:'heading',text:'Dog Scuba Diving'},
        {type:'template',html:'<p>Why did Sandy decide to take her dog Bugsy scuba diving?</p><p>{{48}}</p><p>Main requirements for taking a dog scuba diving:</p><p>{{49}}</p><p>{{50}}</p><p>How could Sandy afford to take Bugsy scuba diving?</p><p>{{51}}</p><p>Advice for people who want to take their dog scuba diving:</p><p>{{52}}</p><p>{{53}}</p>'}
      ]}
  ],
  transcript: {partA:window.EDMUND_DSE_LISTENING_2025_TRANSCRIPT || {},partB:[]}
};
const translations = {
  1: {
    title:'海洋之友',
    instruction:'Stella Poon 與 Adrian Timpson 主持香港健康健身播客，訪問慈善機構 Sea Friends 的創辦人 Ricky Harrison。聆聽訪問並填寫資料。首題為例子；你有三十秒讀題，結束後有一分鐘整理答案。',
    blocks:[
      'Ricky 何時創辦 Sea Friends（例子）？已有多少人透過機構學會游泳？學游泳要多久？機構主要幫助哪兩類人？他們何時聚會？',
      'Ricky 初次與誰游泳？他為何停止？後來為何重新開始？新教練是誰？',
      '明年的 Sea Friends 活動',
      '明年 Sea Friends 活動的名稱和內容為何？Ricky 提出哪三個加入機構的理由？'
    ]
  },
  2: {
    title:'亞洲運動文化',
    instruction:'Adrian 訪問《Exercise in Asia》作者 Jessica Becker，討論亞洲文化與健身。聆聽訪問並完成資料；首題為例子。你有三十秒讀題，結束後有一分鐘整理答案。',
    blocks:[
      'Jessica 的書名是《Exercise in Asia》（例子）。',
      '日本太鼓傳統',
      '傳統太鼓的溝通目的為何？在太鼓祭典中，鼓因為哪兩個原因而放在甚麼上面？過去大型鼓用甚麼製作？要把鼓打好需要運用甚麼？',
      '韓國 K-pop 舞蹈課',
      '男團加入甚麼元素後，K-pop 舞蹈成為有益運動？Jessica 建議上課前做甚麼、穿甚麼鞋？課堂最重要的是學到甚麼？',
      '泰國馬拉松',
      '因天氣炎熱，泰國馬拉松通常何時起跑？會派發甚麼？Jessica 給跑手哪兩個建議？'
    ]
  },
  3: {
    title:'可穿戴健身追蹤器',
    instruction:'Adrian 和 Stella 試用了兩款可穿戴健身追蹤器，現於播客分享評價。聆聽對話並完成資料；首題為例子。你有三十秒讀題，結束後有一分鐘整理答案。',
    blocks:[
      'N.R.G. 6',
      'Stella 喜歡 N.R.G. 6 是因為它舒適（例子）。按鈕令它怎樣？Adrian 不喜歡哪兩點？它給 Stella 甚麼讓她很喜歡？',
      'Getfit 4',
      'Getfit 4 包括哪種鍛鍊？Stella 希望廠商改善甚麼？她為何沒有用它監察睡眠？Adrian 如何評價自己的睡眠分數？',
      '功能比較',
      '就螢幕亮度、電池續航、GPS 和防水能力，各選一項：Getfit 4 較佳、N.R.G. 6 較佳，或兩者都很出色。',
      '推薦對象',
      'Adrian 會向哪類人推薦 Getfit 4？Stella 會向哪類人推薦 N.R.G. 6？'
    ]
  },
  4: {
    title:'專業遛狗員',
    instruction:'Stella 的朋友 Sandy Elliot 講述專業遛狗員的生活。聆聽演講，回答問題並完成資料；首題為例子，無須使用完整句子。你有三十秒讀題，結束後有三分鐘整理答案。',
    blocks:[
      'Sandy 為何成為專業遛狗員（例子：開寵物店成本太高）？她每次散步後會傳甚麼給客人？客人有哪兩項特別的影片或照片要求？',
      '完成遛狗對飼主健康益處的表格：為何可能活得更久？狗突然轉向可帶來甚麼益處？另一項益處及其原因是甚麼？',
      '狗狗潛水',
      'Sandy 為何帶愛犬 Bugsy 潛水？主要兩項要求是甚麼？她如何負擔費用？她給想帶狗潛水的人哪兩項建議？'
    ]
  }
};
for (const task of data.tasks) {
  const zh = translations[task.number];
  task.titleZh = zh.title;
  task.instructionZh = zh.instruction;
  task.blocks.forEach((block, index) => { block.translation = zh.blocks[index] || ''; });
}
function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
window.EDMUND_DSE_LISTENING_2025 = freeze(data);
})();

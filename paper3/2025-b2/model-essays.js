/* Student-supplied Revised Benchmark Essays, pages 2–4. The article is Task A in this reader. */
window.EDMUND_B2_MODEL_ESSAYS = {
  A:{genre:'School magazine article',title:'A Relaxing and Rewarding Wellness Month',sections:[
    {heading:'Three Returning Highlights',paragraphs:[
      'This July, Wellness Month returns after exams with the theme “Relax and Recover”. Three popular events will help students rest, recharge and enjoy meaningful activities.',
      'The Crafting Session will introduce arts and crafts from Asian countries instead of South America, making the activities more relevant to students. The Wellness Fair will again offer exercise advice and self-care resources, with new interactive booths adding interest. Meanwhile, the Yoga and Meditation Sessions will feature two famous instructors and help students relax while improving focus and attention span.'
    ]},
    {heading:'What Students Said Last Year',paragraphs:[
      'Last year’s participants praised the wide variety of useful and meaningful activities. They said the programme gave them a chance to unwind after exams and feel more prepared for the next year’s studies. Some enjoyed letting their creativity run loose and picked up healthy habits. Others found the exercise talk given by Form 6 students helpful.',
      'With familiar favourites and fresh features, this year’s Wellness Month offers a rewarding way to relax and recover. Get ready to join in!'
    ]}
  ]},
  B:{genre:'Proposal',title:'Proposal on Sports Day at the Beach',sections:[
    {heading:'Introduction',paragraphs:['This proposal aims to explain why Sports Day at the Beach should be included in this year’s Wellness Month and to recommend two suitable sports for the event.']},
    {heading:'Suggested Activities',paragraphs:[
      'Firstly, this new event would allow students to try new sports, learn about different cultures, and spend quality time outdoors. It would also be a more interesting and inclusive activity while encouraging students to become more physically active.',
      'Secondly, it is suggested that Sepak Takraw and Kabaddi be chosen. Sepak Takraw is a sport from Southeast Asia and is similar to volleyball, although it is played without hands. It is easy for beginners to learn and also provides excellent exercise. Kabaddi, which comes from India, is also suitable because it is fun, physically challenging, and easy for newcomers to pick up. In this sport, players try to tag others while holding their breath. Both sports are likely to be new to our students and are enjoyable for beginners.'
    ]},
    {heading:'Venue',paragraphs:['It is suggested that the event be held at Cafeteria Beach. Stanley is not suitable due to traffic problems, while parking near Cheung Sha Beach is difficult.']},
    {heading:'Conclusion',paragraphs:['It is hoped that the above suggestions will be found useful and that this new event will be approved.']}
  ]},
  C:{genre:'Letter to parents',title:'Letter to Parents',sections:[
    {paragraphs:[
      'Dear Parents,',
      'You are cordially invited to serve as volunteers for this year’s Wellness Month.',
      'Firstly, parent volunteers can bring many benefits to our school events. Your involvement can help create a more positive atmosphere for students, allow them to interact with adults other than their teachers, and help them feel more relaxed during school events. In addition, last year’s volunteers found the experience enjoyable and worthwhile. Many parents also had the opportunity to get to know other parents and teachers better.',
      'Secondly, regarding the responsibilities of parent volunteers, you may be asked to assist with administrative duties, such as taking attendance, and to remain at your chosen event in case students require help. Please be assured that teachers, rather than parents, will prepare students for the activities.',
      'Lastly, if you are interested in becoming a volunteer, we would be most grateful if you could sign up through the school app. In addition, a briefing session will be arranged before the events begin so that all volunteers can understand their duties clearly.',
      'Should you have any enquiries, please do not hesitate to contact us. We would be more than happy to provide further information. Thank you very much for your attention, and we look forward to your support.',
      'Yours faithfully,',
      'Nico Lin\nPresident, Healthy Living Club'
    ]}
  ]}
};
(() => {
  const cards=document.querySelectorAll('#practice .draft-card');
  for(const [index,task] of ['A','B','C'].entries()){
    const card=cards[index],essay=window.EDMUND_B2_MODEL_ESSAYS[task];if(!card)return;
    const details=document.createElement('details');details.id=`curation-model-${task}`;details.className='curation-model-essay';
    const summary=document.createElement('summary');summary.textContent=`查看 Task ${task} 參考範文 · Revised Benchmark Essay`;details.append(summary);
    const article=document.createElement('article');article.lang='en';
    const title=document.createElement('h4');title.textContent=essay.title;article.append(title);
    for(const section of essay.sections){if(section.heading){const h=document.createElement('h5');h.textContent=section.heading;article.append(h);}for(const copy of section.paragraphs){const p=document.createElement('p');p.textContent=copy;article.append(p);}}
    details.append(article);
    card.append(details);
  }
})();

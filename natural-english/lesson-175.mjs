import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-175-v2-audio','audio','只聽工作進度。說話者目前處於甚麼狀態？',['完成速度追不上原定進度。','所有工作都已提前完成。','目前比原定進度稍微超前。','正在幫同事補上進度。'],'完成速度追不上原定進度。','falling behind 強調正在逐漸落後於計劃或期限。'),
  mc('native-175-v2-detail','detail','哪個情況最能說明「開始落後」，而不是「先做一點」？',['原定今天完成五項，只做了兩項，新的任務仍在增加。','下週工作已提前完成一半。','今天所有任務都按時結束。','你只差最後一項，而且仍有很多時間。'],'原定今天完成五項，只做了兩項，新的任務仍在增加。','已完成量追不上計劃，且待辦增加，符合逐漸落後的方向。'),
  mc('native-175-v2-explain','explain','同事問 How’s the project going? 你說 I’m falling behind。哪個後續資訊最有助他理解？',['哪個任務卡住，以及還差多少進度。','原定期限是否仍是星期五。','哪些文件已經完成。','同事是否也在等同一份資料。'],'哪個任務卡住，以及還差多少進度。','falling behind 說出趨勢；指出卡點和差距才能幫同事評估如何支援。'),
  mc('native-175-v2-branch','branch','同事問 Do you need help? 你想請他協助資料整理，而非把下一整段工作交出去。哪句回覆最清楚？',["Yes, could you help me sort these figures? That's where I'm behind.","Maybe, but I'd rather wait until next week.","Yes, could you take over the next section entirely?","I think I'm okay; I'll catch up without help."],"Yes, could you help me sort these figures? That's where I'm behind.",'明確指出資料整理這個卡點，讓支援落在能改善進度的工作上。'),
  mc('native-175-v2-transfer','transfer','換到課堂：你缺了兩次課，讀本進度追不上全班。哪句也可用？',["I'm falling behind in class.","I'm getting ahead of every lesson.","I'm done with the course.","I'm catching up on last week's notes."],"I'm falling behind in class.",'falling behind 可用於學習進度，不限於辦公室工作。'),
  open('native-175-v2-repair','repair',"你原定今天完成五項工作，但只做了兩項，明天還有新任務。寫兩句英文向同事修正「我進度超前」的說法，並指出需要幫助的地方。",["I'm actually falling behind on my work. Could you help me sort the figures so I can catch up?", "I thought I was ahead, but I've completed only two of five tasks. Could you help with the data check?"],"用 falling behind 修正方向，再指出可支援的具體工作，讓同事知道怎樣幫忙。"),
];
const steps=[
  {id:'native-175-v2-audio',style:'audio',label:'先聽進度',title:'開始追不上',intro:'聽完後比較現在進度和原定進度。',model:'I’m falling behind.',zh:'我正逐漸落後進度。',audioOnly:true,questions:['native-175-v2-audio']},
  {id:'native-175-v2-detail',style:'detail',label:'看進度表',title:'原定五項只做兩項',intro:'用具體差距判斷。',questions:['native-175-v2-detail']},
  {id:'native-175-v2-explain',style:'explain',label:'說清卡點',title:'同事怎樣幫得上忙？',intro:'把籠統進度變成可行資訊。',questions:['native-175-v2-explain']},
  {id:'native-175-v2-branch',style:'branch',label:'接受支援',title:'資料整理拖慢了',intro:'接續同事的幫忙提議。',questions:['native-175-v2-branch']},
  {id:'native-175-v2-transfer',style:'transfer',label:'換到課堂',title:'學習也會落後',intro:'把同一進度詞轉到學習。',questions:['native-175-v2-transfer']},
  {id:'native-175-v2-repair',style:'repair',label:'修正方向',title:'不是超前',intro:'依時間線選準說法。',model:'I’m falling behind on my work.',zh:'我的工作進度正落後。',questions:['native-175-v2-repair']}
];
export default {revision:2,summary:'用 falling behind 描述工作或學習進度逐漸追不上，並能指出具體卡點。',steps,questions,takeaways:['I’m falling behind.','I’m falling behind on my work.'],completionTitle:'你能清楚說明進度落後，也能提出需要哪方面支援。'};

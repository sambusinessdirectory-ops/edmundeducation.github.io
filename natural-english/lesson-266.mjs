import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-266-v2-audio','audio','先聽這句提醒。朋友衣服上最可能有甚麼？',['衣領後面的標籤翻到外面。','袖口沾了墨水。','一條線頭露出來。','外套拉鍊沒有拉。'],'衣領後面的標籤翻到外面。','tag 是衣服的標籤，sticking out 表示它從衣領等位置露在外面。'),
  mc('native-266-v2-repair','repair','你看見的是洗衣標籤，卻說「There’s a thread sticking out」。哪句修正了物件？',["Your tag is sticking out.","Your sleeve is stained.","Your zipper is open.","Your coat is inside out."],"Your tag is sticking out.",'thread 是線頭；眼前露出的是 tag，應直接提醒標籤翻出。'),
  mc('native-266-v2-branch','branch','朋友說：「Really? Where?」標籤在後領。你怎樣接話？',["Yeah, right in the back of your collar.","The front pocket is missing.","It fell off on the bus.","Your sleeve is wet."],"Yeah, right in the back of your collar.",'朋友問標籤在哪裏；指出後領，讓他不用猜測就能把翻出的標籤塞回衣服裏。'),
  mc('native-266-v2-transfer','transfer','拍照前你看見另一位朋友帽子裏的品牌標籤露出帽沿。哪句沿用 sticking out？',["The tag on your cap is sticking out.","Your cap has shrunk in the wash.","Your cap is completely wet.","The cap's color has faded."],"The tag on your cap is sticking out.",'sticking out 描述標籤突出，衣領以外的帽沿也可用。'),
  open('native-266-v2-final','final','新情境：朋友正準備上台，衣領後的白色標籤翻在外面；你只剩幾秒提醒。寫兩句簡短、友善的英文，指出問題和位置。',["Hey, your tag is sticking out. It's right at the back of your collar.","Just a second—your tag is sticking out. You can tuck it in at the back.","Your clothing tag is showing. It's behind your neck."],'自評時確認你提醒的是標籤而非線頭，並讓朋友知道標籤在哪裏。')
];
const steps=[
  {id:'native-266-v2-audio',style:'audio',label:'聽出提醒',title:'衣服哪裏露出來？',intro:'先聽衣服上露出的是標籤還是線頭。',model:'Your tag is sticking out.',zh:'你的衣服標籤露出來了。',audioOnly:true,questions:['native-266-v2-audio']},
  {id:'native-266-v2-repair',style:'repair',label:'修正物件',title:'標籤不是線頭',intro:'選對露出來的物件。',questions:['native-266-v2-repair']},
  {id:'native-266-v2-branch',style:'branch',label:'朋友追問',title:'標籤在哪裏？',intro:'接着對方的問題說位置。',questions:['native-266-v2-branch']},
  {id:'native-266-v2-transfer',style:'transfer',label:'換到帽子',title:'標籤仍可突出',intro:'把 sticking out 用在另一件衣物。',questions:['native-266-v2-transfer']},
  {id:'native-266-v2-speak',style:'speak',label:'輕聲提醒',title:'合照前一句話',intro:'先自己說；錄音或跳過後才聽示範。',model:'Your tag is sticking out.',zh:'你的衣服標籤露出來了。',speakingPrompt:'朋友準備拍合照，後領標籤翻出。簡短提醒。',recording:'phrase',questions:[]},
  {id:'native-266-v2-final',style:'final',label:'上台挑戰',title:'快而友善地提醒',intro:'用自己的話寫兩句。',questions:['native-266-v2-final']}
];
export default {revision:2,summary:'用 tag is sticking out 輕聲提醒朋友衣服標籤翻出，並與線頭區分。',steps,questions,takeaways:['Your tag is sticking out.'],completionTitle:'你能友善指出衣服標籤的位置，幫朋友及時整理。'};

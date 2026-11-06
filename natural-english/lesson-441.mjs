import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-441-v2-audio','audio','只聽安全帶的狀態。扣上前要先處理甚麼？',['把帶身轉回平整，避免扭著壓在身上。','把扣舌換到另一個座位。','把肩帶拉得更緊而不理會扭結。','檢查車門有沒有關好。'],'把帶身轉回平整，避免扭著壓在身上。','twisted 指帶身沿長度翻轉；先理平才可貼身。'),
  mc('native-441-v2-detail','detail','車上朋友說安全帶 twisted。哪個觀察最能證實？',['肩帶在胸前翻了一圈，邊緣向外。','扣舌還沒插進扣位。','安全帶拉不夠長。','帶身平整但略微鬆。'],'肩帶在胸前翻了一圈，邊緣向外。','翻轉的一圈是 twisted 的核心；未扣上或長度不夠是另一問題。'),
  mc('native-441-v2-repair','repair','乘客抱怨安全帶勒著，司機只叫他拉鬆一點。你看到帶身翻了一圈，哪句更準確？',["Your seat belt is twisted.","Your seat belt is too short.","Your seat belt isn't buckled yet.","Your seat belt is already flat."],"Your seat belt is twisted.",'先指出扭轉位置，才知道要理平帶身而非只調鬆。'),
  mc('native-441-v2-branch','branch','朋友看見你的安全帶翻轉，問 Should I tighten it? 你要表明先理平、再調鬆緊，怎樣回答？',["Not yet—let me straighten the twist first.","Yes, let's tighten it and flatten it afterward.","No, I'll loosen the belt without fixing the twist.","Let's adjust the shoulder height before touching the twist."],"Not yet—let me straighten the twist first.",'安全帶在胸前翻轉時，先把帶身理平，再調整鬆緊；扭著直接拉緊會壓住身體。'),
  open('native-441-v2-final','final','最後挑戰：開車前你看到副駕的肩帶翻了一圈、壓著朋友胸口。寫兩句英文提醒他，並說明先做甚麼再出發。',["Your seat belt is twisted across your chest. Please straighten it before we leave.","The belt has a twist in it. Could you flatten it and then buckle up?"],'明確指出帶身扭轉和理平的下一步，不把問題誤說成安全帶太短。')
];
const steps=[
  {id:'native-441-v2-audio',style:'audio',label:'先聽狀態',title:'安全帶翻了一圈',intro:'聽出是扭轉還是鬆緊問題。',model:'The seat belt is twisted.',zh:'安全帶扭了一圈。',audioOnly:true,questions:['native-441-v2-audio']},
  {id:'native-441-v2-detail',style:'detail',label:'看帶身',title:'胸前邊緣翻轉',intro:'找出扭轉的可見線索。',questions:['native-441-v2-detail']},
  {id:'native-441-v2-repair',style:'repair',label:'修正判斷',title:'不是太短',intro:'按帶身形狀說明。',questions:['native-441-v2-repair']},
  {id:'native-441-v2-branch',style:'branch',label:'先理平',title:'別急著拉緊',intro:'回應朋友的調整提議。',questions:['native-441-v2-branch']},
  {id:'native-441-v2-speak',style:'speak',label:'口頭提醒',title:'讓乘客注意',intro:'先自己說；錄音或跳過後才聽示範。',model:'Your seat belt is twisted.',zh:'你的安全帶扭了。',speakingPrompt:'你看到乘客的肩帶翻了一圈。先口頭提醒。',recording:'phrase',questions:[]},
  {id:'native-441-v2-final',style:'final',label:'出發挑戰',title:'副駕的安全帶',intro:'自己提醒並說清下一步。',questions:['native-441-v2-final']}
];
export default {revision:2,summary:'用 twisted 指安全帶帶身翻轉，並在出發前提醒理平。',steps,questions,takeaways:['The seat belt is twisted.','Your seat belt is twisted.'],completionTitle:'你能指出安全帶扭轉的位置並提醒朋友理平。'};

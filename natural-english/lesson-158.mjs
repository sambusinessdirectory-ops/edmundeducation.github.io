import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-158-v2-audio','audio','只聽昨晚睡著的速度。說話者最可能怎樣？',['一上床幾乎立刻睡著。','在床上翻來覆去幾小時。','整晚沒睡。','白天睡了很久。'],'一上床幾乎立刻睡著。','as soon as I hit the bed 強調碰到床後立刻睡著，通常因為很累。'),
  mc('native-158-v2-detail','detail','朋友問 Did it take you long to fall asleep? 你答這句。最重要的時間細節是甚麼？',['幾乎沒有入睡等待時間。','總共睡了八小時。','上床後有沒有翻來覆去。','睡著前躺了多久。'],'幾乎沒有入睡等待時間。','這句說入睡速度快，不說睡眠總時長或床的品質。'),
  mc('native-158-v2-explain','explain','這裡的 hit the bed 是甚麼意思？',['上床或碰到床，不是真的撞床。','床太硬，讓他睡不著。','因為太累，倒在床上。','上床時動作很快。'],'上床或碰到床，不是真的撞床。','hit 在口語畫面裡誇張地表示一碰到床就睡著，不是受傷事件。'),
  mc('native-158-v2-continue','continue','朋友說 I fell asleep as soon as I hit the bed。你想自然接話，哪句最貼切？',["You must have been exhausted.","Did you wake up again soon afterward?","Did you sleep through the night?","Were you still awake after midnight?"],"You must have been exhausted.",'幾乎立刻入睡常暗示非常疲倦，這句順著他的經歷回應。'),
  mc('native-158-v2-branch','branch','對方問你是不是躺了很久才睡。你昨天工作了一整天，哪句直接澄清？',["Not at all—I fell asleep as soon as I hit the bed.","Yes, I tossed and turned for hours.","I didn't go to bed at all.","I got up before dinner."],"Not at all—I fell asleep as soon as I hit the bed.",'Not at all 直接否定「躺很久」，後半句說明一上床就睡著。'),
  open('native-158-v2-transfer','transfer',"換一個場景：你做完夜班，頭剛碰枕頭就睡著。朋友問你昨晚花多久才入睡。用一兩句英文自然回答。",["My head hit the pillow, and I was out. I was exhausted after the night shift.", "I fell asleep as soon as I hit the bed after work."],"用預錄的 pillow 或 bed 口語畫面，表達入睡幾乎沒有等待時間。"),
];
const steps=[
  {id:'native-158-v2-audio',style:'audio',label:'先聽速度',title:'一碰床就睡',intro:'只聽一句昨晚的經歷。',model:'I fell asleep as soon as I hit the bed.',zh:'我一碰到床就睡著了。',audioOnly:true,questions:['native-158-v2-audio']},
  {id:'native-158-v2-detail',style:'detail',label:'抓時間',title:'沒有等多久',intro:'這句究竟說速度還是時長？',questions:['native-158-v2-detail']},
  {id:'native-158-v2-explain',style:'explain',label:'拆解畫面',title:'hit 不是撞傷',intro:'理解口語誇張的動作。',questions:['native-158-v2-explain']},
  {id:'native-158-v2-continue',style:'continue',label:'自然接話',title:'你一定很累',intro:'回應快速入睡背後的狀態。',questions:['native-158-v2-continue']},
  {id:'native-158-v2-branch',style:'branch',label:'回答追問',title:'躺了很久嗎？',intro:'直接澄清入睡速度。',questions:['native-158-v2-branch']},
  {id:'native-158-v2-transfer',style:'transfer',label:'換個說法',title:'頭碰枕頭就睡',intro:'對照另一句預錄口語。',model:'My head hit the pillow, and I was out.',zh:'頭一碰枕頭，我就睡著了。',questions:['native-158-v2-transfer']}
];
export default {revision:2,summary:'理解 as soon as I hit the bed 表示幾乎立即入睡，並認識枕頭版本的口語說法。',steps,questions,takeaways:['I fell asleep as soon as I hit the bed.','My head hit the pillow, and I was out.'],completionTitle:'你能自然說出累得一上床就睡著。'};

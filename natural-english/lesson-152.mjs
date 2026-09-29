import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-152-v2-audio','audio','只聽打開雪櫃後的反應。說話者目前能確定甚麼？',['雪櫃裡有股不對勁的味道。','雪櫃內有一盒牛奶可能已過期。','雪櫃門似乎沒有關緊。','有一樣食物可能需要檢查。'],'雪櫃裡有股不對勁的味道。','smells weird 只是說聞到異味，尚未找出來源或判定哪樣食物變壞。'),
  mc('native-152-v2-transfer','transfer','換到車內：你一上車就聞到怪味，還不知從哪來。哪句自然？',["The car smells weird.","The car smells musty because of a wet towel.","The car smells musty after yesterday's rain.","The air freshener has a stronger smell than usual."],"The car smells weird.",'來源未明時用 smells weird 保留不確定；不應無證據指定潮霉或漏氣。'),
  mc('native-152-v2-contrast','contrast','哪個描述比「雪櫃聞起來怪怪的」更具體，且需要額外證據？',["The towel smells musty.","The fridge smells strange.","There's an odd smell inside.","Something smells off."],"The towel smells musty.",'musty 指潮霉味且指定毛巾來源；其他說法都只表達一般異味。'),
  open('native-152-v2-rewrite','rewrite',"打開雪櫃後你聞到怪味，但還沒找到是哪樣食物。寫兩句英文給室友，說明你確定的觀察並提議一起檢查。",["The fridge smells weird, but I'm not sure what's causing it. Can we check the food inside together?", "There's an odd smell in the fridge. Let's go through the containers and find the source."],"先報告確知的異味，再提議檢查；不要把某一樣食物壞掉寫成已證實。"),
];
const steps=[
  {id:'native-152-v2-audio',style:'audio',label:'先聽嗅覺',title:'雪櫃有怪味',intro:'只聽一句，不先判斷來源。',model:'The fridge smells weird.',zh:'雪櫃聞起來怪怪的。',audioOnly:true,questions:['native-152-v2-audio']},
  {id:'native-152-v2-transfer',style:'transfer',label:'換到車內',title:'來源還不清楚',intro:'把一般異味說法用在別處。',questions:['native-152-v2-transfer']},
  {id:'native-152-v2-contrast',style:'contrast',label:'比較精確度',title:'怪味與潮霉味',intro:'區分一般描述和特定味道。',model:'The towel smells musty.',zh:'毛巾有潮霉味。',questions:['native-152-v2-contrast']},
  {id:'native-152-v2-speak',style:'speak',label:'口頭描述',title:'讓室友聞一下',intro:'先自己說；錄音或跳過後才聽示範。',model:'The fridge smells weird.',zh:'雪櫃聞起來怪怪的。',speakingPrompt:'你開雪櫃時聞到怪味，但尚未知道是哪樣食物。告訴室友。',recording:'phrase',questions:[]},
  {id:'native-152-v2-rewrite',style:'rewrite',label:'寫給室友',title:'一起查來源',intro:'只把已知的事寫成事實。',questions:['native-152-v2-rewrite']}
];
export default {revision:2,summary:'用 smells weird 描述來源未明的異味，避免過早斷定是哪種食物或味道。',steps,questions,takeaways:['The fridge smells weird.','The towel smells musty.'],completionTitle:'你能準確說出聞到怪味，也知道何時要先查來源。'};

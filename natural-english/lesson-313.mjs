import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-313-v2-audio','audio','只聽鞋子的問題。哪一部分反覆移位？',['鞋舌走一會兒就滑到旁邊。','鞋帶每走幾步就鬆開。','鞋舌一直固定在正中間。','鞋底前端有點磨損。'],'鞋舌走一會兒就滑到旁邊。','tongue 是鞋帶下方的鞋舌；keeps sliding 強調它反覆離開正中位置。'),
  mc('native-313-v2-scene','scene','新鞋大小合適，但走十分鐘後中間那片鞋舌又偏到右邊。哪句最貼切？',["The tongue keeps sliding to the side.","The shoe is too small.","The laces keep coming undone.","The shoe tongue is crooked only when I first put it on."],"The tongue keeps sliding to the side.",'大小合適，問題在鞋舌反覆偏移，不是鞋底或鞋帶。'),
  mc('native-313-v2-tone','tone','試鞋時店員問 How do they feel? 你想肯定尺寸，但指出鞋舌問題。哪句最有用？',["They fit well, but the tongue keeps sliding to the side.","The left shoe feels slightly tighter than the right.","I think the left one might be slightly loose.","They fit fine except for a little rubbing at the heel."],"They fit well, but the tongue keeps sliding to the side.",'先交代尺寸合適，再指出真正需要處理的鞋舌偏移。'),
  mc('native-313-v2-continue','continue','朋友問 Why do you keep fixing your shoe? 你怎樣接，才解釋反覆停下的原因？',["The tongue keeps sliding to one side when I walk.","The tongue looked crooked once before I put it on.","The laces were too long yesterday.","I want to check the shoe size again."],"The tongue keeps sliding to one side when I walk.",'走路時反覆滑到一邊，直接解釋你為何一直調整。'),
  open('native-313-v2-final','final','最後挑戰：你試穿鞋子，尺寸很好，但每走幾步鞋舌就滑到左邊。向店員寫兩句英文，說明合身程度與反覆問題。',["The shoes fit well, but the tongue keeps sliding to the left. It happens every time I walk around.","The size feels right. The tongue keeps moving to the side after a few steps."],'把尺寸合適與鞋舌反覆偏移分開說，店員才知道你不是要求換鞋碼。')
];
const steps=[
  {id:'native-313-v2-audio',style:'audio',label:'先聽部位',title:'鞋舌滑向旁邊',intro:'聽清是哪片鞋子的部件。',model:'The tongue keeps sliding to the side.',zh:'鞋舌總是滑到旁邊。',audioOnly:true,questions:['native-313-v2-audio']},
  {id:'native-313-v2-scene',style:'scene',label:'走十分鐘',title:'尺寸沒問題',intro:'按反覆發生的位置選說法。',questions:['native-313-v2-scene']},
  {id:'native-313-v2-tone',style:'tone',label:'試鞋回饋',title:'先肯定合身',intro:'給店員可處理的資訊。',questions:['native-313-v2-tone']},
  {id:'native-313-v2-continue',style:'continue',label:'回應朋友',title:'為何一直低頭整理',intro:'把動作與鞋舌問題連起來。',questions:['native-313-v2-continue']},
  {id:'native-313-v2-speak',style:'speak',label:'口頭對照',title:'單次歪了',intro:'先自己說；錄音或跳過後才聽示範。',model:'The tongue is crooked.',zh:'鞋舌歪了。',speakingPrompt:'鞋舌現在歪向旁邊，但你還不知道是否一直會滑。先口頭描述。',recording:'phrase',questions:[]},
  {id:'native-313-v2-final',style:'final',label:'試鞋挑戰',title:'每走幾步都偏',intro:'自己向店員說明。',questions:['native-313-v2-final']}
];
export default {revision:2,summary:'用 tongue keeps sliding 描述鞋舌反覆偏移，並與單次歪斜及鞋碼不合區分。',steps,questions,takeaways:['The tongue keeps sliding to the side.','The tongue is crooked.'],completionTitle:'你能把試鞋時反覆出現的鞋舌問題說清楚。'};

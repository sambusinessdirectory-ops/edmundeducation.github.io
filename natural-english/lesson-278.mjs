import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-278-v2-audio','audio','聽完這句描述木頭的話，哪個畫面最相符？',['木面開始裂出細小尖刺。','木面剛被打磨得光滑。','木材被泡得濕透。','木板已經完全燒焦。'],'木面開始裂出細小尖刺。','splintering 說的是木材正在裂出可能刺手的細小木刺。'),
  mc('native-278-v2-reverse','reverse','舊長椅表面起了不少木刺，你要提醒人別用手摸。哪句描述長椅本身？',["The wood is splintering.","I got a splinter in my finger.","The wood is polished smooth.","The bench is made of metal."],"The wood is splintering.",'wood is splintering 說木頭的狀態；got a splinter 則是人已被刺到。'),
  mc('native-278-v2-tone','tone','朋友正扶着一段有木刺的欄杆。哪句提醒既清楚又不誇大？',["Careful, the wood is splintering. You could get a splinter.","Don't touch anything here; the whole building is collapsing.","That railing is perfectly smooth.","Your hand is already broken."],"Careful, the wood is splintering. You could get a splinter.",'先提醒，再說明可能扎手；不把局部木刺誇大成整棟樓危險。'),
  mc('native-278-v2-transfer','transfer','這回是木桌邊緣乾裂，有細刺翹起。哪句把同一現象用到桌子？',["The edge of the wooden table is splintering.","The table is soaking wet.","The table has a marble top.","The table legs are missing."],"The edge of the wooden table is splintering.",'splintering 可形容木桌邊緣等木材表面裂出小刺。'),
  mc('native-278-v2-branch','branch',"朋友問：Why shouldn't I slide my hand along the railing? 你看到木面起刺。怎樣答？",["The wood is splintering; it may catch your skin.","The paint is still wet, so it may stain your hand.","The railing is too cold to touch.","Someone left a bag under it."],"The wood is splintering; it may catch your skin.",'回答把木刺與觸碰可能受傷連起來，正好解釋你的提醒。'),
  open('native-278-v2-branch-write','branch','新情境：朋友準備坐在公園舊木椅上，你看到座面邊緣裂出細木刺。寫兩句英文提醒他並說明可能的後果。',
    ["Careful, the wood on the bench is splintering. You could get a splinter in your leg.","Wait before you sit down; that wooden edge is splintering. It might catch your clothes or skin.","The bench has started to splinter along the edge. You may want to avoid touching that part."],
    '自評時看是否說出木材起刺，以及接觸後可能被扎的具體風險。')
];
const steps=[
  {id:'native-278-v2-audio',style:'audio',label:'聽出木材狀態',title:'表面有甚麼變化？',intro:'先聽木頭表面是否開始起細刺。',model:'The wood is splintering.',zh:'木頭開始起木刺。',audioOnly:true,questions:['native-278-v2-audio']},
  {id:'native-278-v2-reverse',style:'reverse',label:'木頭還是手指',title:'是哪個在 splinter？',intro:'分清木材起刺和人被刺到。',questions:['native-278-v2-reverse']},
  {id:'native-278-v2-tone',style:'tone',label:'提醒朋友',title:'扶手可能扎手',intro:'用具體風險說明提醒。',questions:['native-278-v2-tone']},
  {id:'native-278-v2-transfer',style:'transfer',label:'換到桌邊',title:'另一處乾裂木面',intro:'把詞用到木桌邊緣。',questions:['native-278-v2-transfer']},
  {id:'native-278-v2-branch',style:'branch',label:'回答原因',title:'為何不要摸欄杆？',intro:'把木材狀態接上可能後果。',questions:['native-278-v2-branch','native-278-v2-branch-write']},
  {id:'native-278-v2-speak',style:'speak',label:'即時口說',title:'報告木面起刺',intro:'先自己說；錄音或跳過後才聽示範。',model:'The wood is splintering.',zh:'木頭開始起木刺。',speakingPrompt:'公園長椅的木面裂出細小尖刺。向同行的人簡短指出。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'用 splintering 描述木材表面起細刺，並與人已被木刺扎到分開。',steps,questions,takeaways:['The wood is splintering.'],completionTitle:'你能指出木材起刺，並友善提醒別人避免被扎。'};

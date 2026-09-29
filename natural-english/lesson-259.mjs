import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-259-v2-audio','audio','只聽這句話，馬克筆最可能怎樣？',['筆頭太乾，幾乎寫不出顏色。','墨水不斷漏出來。','筆蓋打不開。','筆尖折斷了。'],'筆頭太乾，幾乎寫不出顏色。','dried out 指放久後太乾、寫不出來；不必推斷是漏墨或機械損壞。'),
  mc('native-259-v2-detail','detail','你在紙上用舊馬克筆畫線。哪個線索最支持它 dried out？',['筆尖掃過紙張，只留下很淡而斷續的痕跡。','筆尖滴出一大灘彩色墨水。','筆蓋鎖得太緊，完全拔不開。','握筆的塑膠殼有裂縫，但線條仍清晰。'],'筆尖掃過紙張，只留下很淡而斷續的痕跡。','dry 的結果是出墨不足；外殼裂縫若不影響線條，不能證明筆已乾。'),
  mc('native-259-v2-reverse','reverse','哪句話對應「這支放久的筆乾了，畫不出線」？',['The marker dried out.','The marker leaked.','The marker snapped in half.','The marker stained the desk.'],'The marker dried out.','dried out 對應乾掉；leaked 是漏墨，snapped 是斷裂，stained 是留下污漬。'),
  mc('native-259-v2-tone','tone','同學正趕着完成海報，試了你的筆卻畫不出來。你想簡短道歉並提出替代筆。哪句自然？',["Sorry, that marker dried out. Try this one.","You must be using it wrong. Keep trying.","The paper is definitely broken. Throw it away.","All markers are unusable forever."],"Sorry, that marker dried out. Try this one.",'承認筆乾了，立即提供另一支；語氣和解決方法都適合趕工情境。'),
  open('native-259-v2-final','final','新情境：你做海報時拿起放了很久的藍色馬克筆，只畫出淡淡幾點。寫兩句英文向同伴說明，並請他找另一支。',["This blue marker has dried out. Could you get me another one?","I can barely draw with this marker because it dried out. Do we have a spare?","The old marker is dried out and hardly leaves any color. Please pass me a different one."],'自評時確認你說的是筆乾了，並在第二部分提出換筆，不必斷定筆完全沒有墨。')
];
const steps=[
  {id:'native-259-v2-audio',style:'audio',label:'聽出筆況',title:'為何畫不出色？',intro:'先聽，不看英文描述。',model:'The marker dried out.',zh:'馬克筆乾掉了。',audioOnly:true,questions:['native-259-v2-audio']},
  {id:'native-259-v2-detail',style:'detail',label:'看線條',title:'淡而斷續的痕跡',intro:'從紙上的結果推斷筆的狀態。',questions:['native-259-v2-detail']},
  {id:'native-259-v2-reverse',style:'reverse',label:'中文找英文',title:'乾掉還是漏墨？',intro:'把故障現象對應到精確說法。',questions:['native-259-v2-reverse']},
  {id:'native-259-v2-tone',style:'tone',label:'趕工應對',title:'道歉並遞上另一支',intro:'選有幫助又不責怪同學的回應。',questions:['native-259-v2-tone']},
  {id:'native-259-v2-speak',style:'speak',label:'即時說明',title:'告訴同伴筆乾了',intro:'先自己說；錄音或跳過後才聽示範。',model:'The marker dried out.',zh:'馬克筆乾掉了。',speakingPrompt:'舊馬克筆筆尖幾乎留不下顏色。向同伴簡短說明。',recording:'phrase',questions:[]},
  {id:'native-259-v2-final',style:'final',label:'海報挑戰',title:'說明並請人換筆',intro:'寫完後用三個示例自行檢查。',questions:['native-259-v2-final']}
];
export default {revision:2,summary:'用 dried out 說明放久的馬克筆因乾而寫不出來，並與漏墨或斷裂分開。',steps,questions,takeaways:['The marker dried out.'],completionTitle:'你能從淡而斷續的線條辨認乾掉的筆，並自然請人換筆。'};

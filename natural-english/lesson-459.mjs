import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-459-v2-audio','audio','先只聽保護貼的描述。哪部分有變化？',['邊緣從螢幕翹起。','中間出現一道裂痕。','整張保護貼滑下來。','表面留下指紋。'],'邊緣從螢幕翹起。','edges are lifting 指邊或角離開表面，未必整張脫落。'),
  mc('native-459-v2-branch','branch','只有右上角離開螢幕，其餘仍貼平。向店員說明，哪句最精確？',["The edges are lifting, especially at the top right.","The whole protector has come off.","There's a crack across the middle.","There are bubbles in the centre."],"The edges are lifting, especially at the top right.",'句子說明局部邊角翹起；其他選項說的是整張脫落、裂痕或中間氣泡。'),
  mc('native-459-v2-tone','tone','你剛貼好保護貼，發現邊角開始翹，想請店員幫忙檢查。哪句具體又禮貌？',["The edges are lifting already. Could you take a look?","It's bad. Give me a refund now.","The screen is broken; you did this.","I don't like how it looks, so replace my phone."],"The edges are lifting already. Could you take a look?",'具體指出邊緣翹起並請求檢查，比籠統抱怨更易處理。'),
  open('native-459-v2-speak','speak','用手指看到保護貼左下角已離開螢幕。先口頭告訴朋友你看到的變化，再聽示範。',["The edges are lifting.","The corner of the screen protector is lifting."],'lifting 說原本貼平的邊角開始離開表面。'),
  open('native-459-v2-final','final','新場景：手機保護貼四角不再貼平，朋友只說 It’s bad。寫兩句英文向店員具體描述問題，並請求協助。',["The edges of my screen protector are lifting. Could you help me check whether it needs replacing?","The corners have started lifting off the screen. Could you take a look at it?"],'用具體部位與變化代替籠統評語，再提出可回應的請求。')
];
const steps=[
  {id:'native-459-v2-audio',style:'audio',label:'先聽部位',title:'保護貼不再平整',intro:'判斷是邊角還是中間。',model:'The edges are lifting.',zh:'邊緣開始翹起。',audioOnly:true,questions:['native-459-v2-audio']},
  {id:'native-459-v2-branch',style:'branch',label:'描述右上角',title:'局部翹起',intro:'選與眼前情況吻合的一句。',questions:['native-459-v2-branch']},
  {id:'native-459-v2-tone',style:'tone',label:'找店員幫忙',title:'剛貼好就翹',intro:'具體而禮貌地開口。',questions:['native-459-v2-tone']},
  {id:'native-459-v2-speak',style:'speak',label:'親口指出',title:'左下角翹起',intro:'先開口，再核對示範。',model:'The edges are lifting.',zh:'邊緣開始翹起。',speakingPrompt:'指出保護貼一角正從螢幕翹起。',recording:'phrase',questions:['native-459-v2-speak']},
  {id:'native-459-v2-final',style:'final',label:'具體投訴',title:'四角都不平',intro:'寫出問題和請求。',questions:['native-459-v2-final']}
];
export default {revision:2,summary:'用 The edges are lifting 具體描述保護貼邊角開始脫離螢幕。',steps,questions,takeaways:['The edges are lifting.','It’s bad.'],completionTitle:'你能具體指出保護貼翹邊並請求協助。'};

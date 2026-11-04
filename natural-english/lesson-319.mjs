import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-319-v2-audio','audio','只聽耳機問題。一邊的聲音是怎樣失效的？',['時有時無，會突然斷掉。','從開始就完全沒有聲音。','兩邊都有聲，但一邊音量較低。','整對耳機一直沒有連上藍牙。'],'時有時無，會突然斷掉。','cutting out 指聲音間歇中斷；isn’t working 可是完全不出聲。'),
  mc('native-319-v2-contrast','contrast','左耳機一分鐘有聲，下一分鐘又沒聲。哪句比「完全壞掉」更準確？',["One earbud is cutting out.","One earbud isn't working at all.","One earbud is quieter than the other.","Both earbuds have a crackling sound."],"One earbud is cutting out.",'有聲與無聲交替，重點是間歇性，不是永久完全沒聲。'),
  mc('native-319-v2-repair','repair','客服理解成左耳機完全無聲，但它偶爾又恢復。哪句能修正？',["It keeps cutting out, but it works sometimes.","It has never made any sound.","The left earbud is quieter than usual.","The left earbud never works, even after charging."],"It keeps cutting out, but it works sometimes.",'補上「偶爾有聲」這個關鍵，客服才會理解為間歇故障。'),
  mc('native-319-v2-transfer','transfer','換到藍牙喇叭：音樂每隔十秒斷一下又恢復。哪句可沿用同一動詞？',["The speaker keeps cutting out.","The speaker is permanently silent.","The speaker crackles constantly.","The speaker is quieter than usual."],"The speaker keeps cutting out.",'cutting out 也可用於喇叭的間歇音訊中斷。'),
  open('native-319-v2-final','final','最後挑戰：你戴無線耳機聽播客，右邊一直有聲，左邊時有時無。向客服寫兩句英文說明是哪一邊及故障如何反覆。',["The left earbud keeps cutting out, while the right one works fine. The sound disappears and comes back every few minutes.","One earbud is cutting out—the left one. It isn't completely dead, but the audio drops repeatedly."],'指出左耳和反覆斷續，與完全沒有聲音的故障分開。')
];
const steps=[
  {id:'native-319-v2-audio',style:'audio',label:'先聽故障',title:'一邊時有時無',intro:'聽出是間歇還是完全無聲。',model:'One earbud is cutting out.',zh:'一邊耳機斷斷續續。',audioOnly:true,questions:['native-319-v2-audio']},
  {id:'native-319-v2-contrast',style:'contrast',label:'程度差別',title:'偶爾又恢復',intro:'不要把間歇說成全壞。',model:'One earbud isn’t working.',zh:'一邊耳機不能用。',questions:['native-319-v2-contrast']},
  {id:'native-319-v2-repair',style:'repair',label:'修正客服',title:'它不是一直無聲',intro:'補上反覆恢復的關鍵。',questions:['native-319-v2-repair']},
  {id:'native-319-v2-transfer',style:'transfer',label:'換到喇叭',title:'音樂也會斷續',intro:'把動詞用於另一裝置。',questions:['native-319-v2-transfer']},
  {id:'native-319-v2-speak',style:'speak',label:'口頭報告',title:'左耳常斷聲',intro:'先自己說；錄音或跳過後才聽示範。',model:'One earbud is cutting out.',zh:'一邊耳機一直斷聲。',speakingPrompt:'左耳機時有時無，右耳正常。先口頭向朋友說。',recording:'phrase',questions:[]},
  {id:'native-319-v2-final',style:'final',label:'客服挑戰',title:'說清哪邊和頻率',intro:'自己寫有診斷價值的描述。',questions:['native-319-v2-final']}
];
export default {revision:2,summary:'用 cutting out 描述一邊耳機聲音間歇中斷，與完全無聲區分。',steps,questions,takeaways:['One earbud is cutting out.','One earbud isn’t working.'],completionTitle:'你能向客服說清耳機是間歇斷聲，而不是一直無聲。'};

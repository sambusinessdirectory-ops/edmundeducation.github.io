import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-448-v2-audio','audio','只聽鍵盤故障。按一次鍵會怎樣？',['電腦輸出兩個相同字母。','按鍵完全沒有反應。','按鍵需要用力才按得下。','游標慢半秒才移動。'],'電腦輸出兩個相同字母。','double-typing 指一次輸入被重複成兩個字，和卡鍵或無反應不同。'),
  mc('native-448-v2-scene','scene','你只按一次 A，文件裡卻常出現 aa；其他鍵正常。哪句最精確？',["The A key is double-typing.","Every key on the keyboard is broken.","The A key doesn't type at all.","The cursor has input lag."],"The A key is double-typing.",'指出 A 鍵和一次變兩次的現象，避免把問題擴大到整個鍵盤。'),
  mc('native-448-v2-tone','tone','IT 同事問 What happens when you press it? 哪句回答最有診斷價值？',["I press A once, but it often types two A's.","The keyboard feels odd somehow.","The computer is a little old.","I think I type too fast."],"I press A once, but it often types two A's.",'說出操作次數和輸出次數的落差，比籠統說鍵盤怪更可查。'),
  mc('native-448-v2-continue','continue','同事說 A 鍵會 double-type。你想知道問題是否只限這顆鍵，怎樣追問？',["Does it happen with other keys too?","Does it happen every time you press A?","Does it also happen in other apps?","Did you change the keyboard recently?"],"Does it happen with other keys too?",'詢問其他鍵是否也一按變兩字，可分清是單一 A 鍵故障還是整個鍵盤都受影響；其餘問題追查頻率、程式或時間。'),
  open('native-448-v2-final','final','最後挑戰：你寫電郵時按一次空白鍵，常出現兩個空格；字母鍵都正常。向 IT 寫兩句英文說明是哪個鍵，以及一次按下的結果。',["The space bar is double-typing. One press often inserts two spaces, while the letter keys work normally.","I'm getting two spaces when I press the space bar once. The other keys seem fine."],'把按鍵、按壓次數和輸出說清楚，讓 IT 知道不是整個鍵盤重複輸入。')
];
const steps=[
  {id:'native-448-v2-audio',style:'audio',label:'先聽輸入',title:'一下打出兩個',intro:'比較按鍵次數與字元數。',model:'The key is double-typing.',zh:'這顆鍵按一次卻輸出兩次。',audioOnly:true,questions:['native-448-v2-audio']},
  {id:'native-448-v2-scene',style:'scene',label:'A 鍵變 aa',title:'只壞一顆鍵',intro:'對準具體鍵位。',questions:['native-448-v2-scene']},
  {id:'native-448-v2-tone',style:'tone',label:'回覆 IT',title:'說出一變二',intro:'給出可重現的描述。',questions:['native-448-v2-tone']},
  {id:'native-448-v2-continue',style:'continue',label:'查故障範圍',title:'其他鍵也會嗎？',intro:'接著問是否局部問題。',questions:['native-448-v2-continue']},
  {id:'native-448-v2-speak',style:'speak',label:'口頭報修',title:'A 鍵重複輸入',intro:'先自己說；錄音或跳過後才聽示範。',model:'The A key is double-typing.',zh:'A 鍵按一次卻打出兩個 A。',speakingPrompt:'按一次 A，文件常出現 aa。先口頭告訴同事。',recording:'phrase',questions:[]},
  {id:'native-448-v2-final',style:'final',label:'空白鍵挑戰',title:'一次變兩個空格',intro:'自己寫具體報修資訊。',questions:['native-448-v2-final']}
];
export default {revision:2,summary:'用 double-typing 描述單次按鍵變成兩個字元，並報告具體鍵位。',steps,questions,takeaways:['The key is double-typing.','The A key is double-typing.'],completionTitle:'你能提供 IT 可重現的按鍵問題描述。'};

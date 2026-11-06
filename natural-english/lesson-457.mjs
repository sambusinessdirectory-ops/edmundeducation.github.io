import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-457-v2-audio','audio','只聽寫字時的抱怨。筆的問題是甚麼？',['筆畫時有時斷墨。','筆不停漏墨。','墨水滲透紙張。','筆尖寫得太粗。'],'筆畫時有時斷墨。','pen keeps skipping 指筆畫斷斷續續，並非流出太多墨。'),
  mc('native-457-v2-scene','scene','寫名字時每個字母中間都有空白，但筆身沒有漏墨。哪句貼切？',["This pen keeps skipping.","This pen is smudging the ink.","This pen is bleeding through the paper.","This pen is running out of space."],"This pen keeps skipping.",'筆畫不連續是 skipping；smudging 是墨未乾被抹開。'),
  mc('native-457-v2-reverse','reverse','朋友說 The pen keeps skipping。你會預期紙上的字怎樣？',['線條時有時無，字母有缺口。','墨水把字糊成一團。','紙背面被墨染透。','每個字母都完整但太粗。'],'線條時有時無，字母有缺口。','skipping 描述出墨不穩定，所以筆畫中間會有空缺。'),
  mc('native-457-v2-tone','tone','向前台借到斷墨的筆，想禮貌地換一支。哪句最合適？',["This pen keeps skipping. Could I try another one?","This pen is broken. You should replace all of them.","You gave me a bad pen. Find me a new one now.","The paper is wrong, so please change the form."],"This pen keeps skipping. Could I try another one?",'具體說明斷墨並禮貌請求換筆，比責備前台或怪紙張更合適。'),
  open('native-457-v2-speak','speak','試寫簽名卻斷斷續續。先用英文口說問題，再對照示範。',["The pen keeps skipping.","This pen keeps skipping when I write."],'用 keeps skipping 說明反覆斷墨，不表示完全沒有墨。'),
  open('native-457-v2-final','final','新場景：你在銀行填表，筆每寫幾筆就斷墨。寫兩句英文告訴職員情況，並禮貌地借另一支。',["This pen keeps skipping when I write. Could I borrow another one, please?","I'm having trouble filling this out because the pen keeps skipping. May I try a different pen?"],'清楚指出筆畫反覆中斷，再提出具體、禮貌的換筆請求。')
];
const steps=[
  {id:'native-457-v2-audio',style:'audio',label:'先聽筆況',title:'寫到一半',intro:'聽出筆畫的問題。',model:'The pen keeps skipping.',zh:'這支筆一直斷墨。',audioOnly:true,questions:['native-457-v2-audio']},
  {id:'native-457-v2-scene',style:'scene',label:'看簽名',title:'字母留下缺口',intro:'從紙上的痕跡選說法。',questions:['native-457-v2-scene']},
  {id:'native-457-v2-reverse',style:'reverse',label:'想像痕跡',title:'聽句子猜筆畫',intro:'由 skipping 回推紙面現象。',questions:['native-457-v2-reverse']},
  {id:'native-457-v2-tone',style:'tone',label:'請人換筆',title:'前台借來的筆',intro:'具體且禮貌地開口。',questions:['native-457-v2-tone']},
  {id:'native-457-v2-speak',style:'speak',label:'自己先說',title:'試寫一筆',intro:'口說後再核對示範。',model:'This pen keeps skipping.',zh:'這支筆一直斷墨。',speakingPrompt:'筆畫斷斷續續，先口頭向前台描述。',recording:'phrase',questions:['native-457-v2-speak']},
  {id:'native-457-v2-final',style:'final',label:'填表挑戰',title:'借一支新筆',intro:'寫出問題和請求。',questions:['native-457-v2-final']}
];
export default {revision:2,summary:'用 keeps skipping 說原子筆反覆斷墨，並禮貌請求換筆。',steps,questions,takeaways:['The pen keeps skipping.','This pen keeps skipping.'],completionTitle:'你能說明筆斷墨並自然提出換筆請求。'};

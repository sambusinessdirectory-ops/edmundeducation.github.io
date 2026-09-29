import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-153-v2-audio','audio','只聽房間的描述。最可能要改善甚麼？',['空氣不流通，令人覺得焗促。','室內有點熱，但空氣仍流通。','房間人多，座位很擠。','房間裡的東西很凌亂。'],'空氣不流通，令人覺得焗促。','stuffy 描述空氣悶、不流通；開窗讓新鮮空氣進來是自然反應。'),
  mc('native-153-v2-repair','repair','會議室人多又不通風，你說 It’s messy in here。哪句改得更準確？',["It's stuffy in here.","It's bright in here.","It's noisy in here.","It's crowded with furniture."],"It's stuffy in here.",'messy 是雜亂；stuffy 對準空氣焗促、難以呼吸的感覺。'),
  mc('native-153-v2-continue','continue','朋友說 It’s stuffy in here。你想直接改善房間本身的通風，怎樣接？',["Let's open a window and get some fresh air in.","Let's turn the fan on before opening the window.","Let's step outside for a minute.","Let's ask if the AC can be adjusted."],"Let's open a window and get some fresh air in.",'通風是對付焗促空氣的直接辦法；關通風口反而可能更悶。'),
  open('native-153-v2-final','final','最後挑戰：四個人在小會議室開了兩小時會，窗戶一直關著。你覺得空氣焗促。寫兩句英文向同事描述情況並提議改善。',["It's getting stuffy in here. Could we open the window for some fresh air?","The room feels stuffy after two hours with the windows shut. Let's open one for a bit."],'說出房間焗促與通風不足，再提出開窗等直接做法。')
];
const steps=[
  {id:'native-153-v2-audio',style:'audio',label:'先聽感覺',title:'室內空氣焗促',intro:'只聽一句房間描述。',model:'It’s stuffy in here.',zh:'這裡很悶、空氣不流通。',audioOnly:true,questions:['native-153-v2-audio']},
  {id:'native-153-v2-repair',style:'repair',label:'改準形容',title:'亂與悶不一樣',intro:'把觀察對準空氣。',questions:['native-153-v2-repair']},
  {id:'native-153-v2-continue',style:'continue',label:'接住抱怨',title:'怎樣讓空氣流通？',intro:'提出合適的下一步。',questions:['native-153-v2-continue']},
  {id:'native-153-v2-speak',style:'speak',label:'口頭提議',title:'開一扇窗',intro:'先自己說；錄音或跳過後才聽示範。',model:'Let’s open a window and get some fresh air in here.',zh:'開窗讓新鮮空氣進來吧。',speakingPrompt:'小房間待得很悶，向朋友提議開窗。',recording:'phrase',questions:[]},
  {id:'native-153-v2-final',style:'final',label:'會議室挑戰',title:'兩小時沒通風',intro:'自己寫觀察和提議。',questions:['native-153-v2-final']}
];
export default {revision:2,summary:'用 stuffy 描述室內空氣焗促不流通，並自然提出通風建議。',steps,questions,takeaways:['It’s stuffy in here.','Let’s open a window and get some fresh air in here.'],completionTitle:'你能說清房間為何悶，並提出開窗改善。'};

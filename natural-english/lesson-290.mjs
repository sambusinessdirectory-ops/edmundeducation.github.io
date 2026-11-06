import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-290-v2-audio','audio','先聽這句關於藥房的話。說話者現在可以做甚麼？',['到藥房領取已備妥的處方藥。','等待醫生第一次開處方。','等藥房開始配藥。','把吃剩的藥退回去。'],'到藥房領取已備妥的處方藥。','ready for pickup 表示備妥可取，不再只是配藥中。'),
  mc('native-290-v2-repair','repair','藥房傳來「Your prescription is ready」短訊，你卻說「They’re still filling it」。哪句能修正進度？',["My prescription is ready for pickup.","The doctor hasn't written the prescription.","The pharmacy is closed all week.","I've already taken the last pill."],"My prescription is ready for pickup.",'收到已備妥通知後，ready for pickup 才反映目前狀態。'),
  mc('native-290-v2-explain','explain','「ready for pickup」比單說「ready」多了哪項實用資訊？',['藥可由你前往領取。','醫生已取消處方。','藥房會立即送貨到家。','藥不需要任何付款。'],'藥可由你前往領取。','pickup 指到店領取；這句沒有承諾送貨或免費。'),
  open('native-290-v2-final','final','新情境：藥房剛傳訊說你的處方藥已備好，你打算下班後順路去拿。寫兩句英文向家人交代狀況和計劃。',["My prescription is ready for pickup. I'll collect it after work.","The pharmacy says my prescription is ready. I'm going to pick it up on my way home.","My medication is ready for pickup now. I can stop by the pharmacy after work."],'自評時看是否清楚說藥已備妥，並在第二部分交代領取時間。')
];
const steps=[
  {id:'native-290-v2-audio',style:'audio',label:'聽出進度',title:'處方藥備好了嗎？',intro:'聽處方藥現在是否已備妥可取。',model:'My prescription is ready for pickup.',zh:'我的處方藥可以領了。',audioOnly:true,questions:['native-290-v2-audio']},
  {id:'native-290-v2-repair',style:'repair',label:'修正時間線',title:'短訊說已備妥',intro:'別再說仍在配藥。',questions:['native-290-v2-repair']},
  {id:'native-290-v2-explain',style:'explain',label:'理解領取方式',title:'pickup 代表甚麼？',intro:'找出能採取的下一步。',questions:['native-290-v2-explain']},
  {id:'native-290-v2-speak',style:'speak',label:'口頭通知',title:'告訴家人可以取藥',intro:'先自己說；錄音或跳過後才聽示範。',model:'My prescription is ready for pickup.',zh:'我的處方藥可以領了。',speakingPrompt:'藥房已通知處方藥備好。向家人簡短轉述。',recording:'phrase',questions:[]},
  {id:'native-290-v2-final',style:'final',label:'下班挑戰',title:'說明領藥計劃',intro:'寫兩句，再對照示例檢查。',questions:['native-290-v2-final']}
];
export default {revision:2,summary:'用 ready for pickup 說明處方藥已備妥，可前往藥房領取。',steps,questions,takeaways:['My prescription is ready for pickup.'],completionTitle:'你能準確轉述藥已備妥，並安排領取。'};

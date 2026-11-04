import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-289-v2-audio','audio','聽完這句藥房說法，藥物處於哪個階段？',['藥房正在按處方備藥。','醫生還在寫處方。','藥已備好可立即領取。','病人已把藥吃完。'],'藥房正在按處方備藥。','filling my prescription 指藥房備藥的過程，尚未一定可取。'),
  mc('native-289-v2-detail','detail','你已把醫生處方交給藥劑師，櫃台請你再等十五分鐘。哪項推斷最穩妥？',['藥房正在配你的處方藥。','藥已準備好等你拿。','醫生尚未開處方。','你的藥已經送到家。'],'藥房正在配你的處方藥。','已交處方而仍需等候，正符合 filling；ready for pickup 才表示備好。'),
  mc('native-289-v2-transfer','transfer','從實體藥房換到醫院藥劑部：你交出處方後，職員正在備藥。哪句仍適用？',["They're filling my prescription.","The doctor is examining me now.","I've already taken every dose.","The pharmacy has closed permanently."],"They're filling my prescription.",'只要藥劑人員正在按處方備藥，地點換成醫院仍可這樣說。'),
  mc('native-289-v2-branch','branch','朋友問：「Are you ready to go?」你仍在等藥劑師備藥。怎樣回答？',["Not yet. They're still filling my prescription.","Yes, the doctor hasn't seen me yet.","No, I lost my bank card.","Yes, I've already picked up the medicine."],"Not yet. They're still filling my prescription.",'Not yet 說明仍要等，再指出藥房正在備藥，直接回答朋友的問題。'),
  open('native-289-v2-final','final','新情境：你陪朋友到藥房，已交處方，櫃台說仍要等十分鐘。寫兩句英文告訴在門外等的家人藥房在做甚麼，以及你何時能離開。',["They're still filling the prescription. We should be out in about ten minutes.","The pharmacist is filling my friend's prescription now. We'll need roughly ten more minutes.","The medicine isn't ready yet; they're filling the prescription. I'll come out when it's done."],'自評時確認你沒有說藥已備好，並把預計等候時間交代清楚。')
];
const steps=[
  {id:'native-289-v2-audio',style:'audio',label:'聽出配藥階段',title:'藥可以拿了嗎？',intro:'辨認藥房仍在備藥還是已可領取。',model:'They’re filling my prescription.',zh:'他們正在配我的處方藥。',audioOnly:true,questions:['native-289-v2-audio']},
  {id:'native-289-v2-detail',style:'detail',label:'看等候訊息',title:'還要等十五分鐘',intro:'按藥房進度判斷階段。',questions:['native-289-v2-detail']},
  {id:'native-289-v2-transfer',style:'transfer',label:'轉到醫院',title:'另一處藥劑部',intro:'把同一表達用在相同備藥過程。',questions:['native-289-v2-transfer']},
  {id:'native-289-v2-branch',style:'branch',label:'回答朋友',title:'現在能離開嗎？',intro:'按目前仍在備藥的情況回應。',questions:['native-289-v2-branch']},
  {id:'native-289-v2-speak',style:'speak',label:'口頭說明',title:'告訴朋友仍要等',intro:'先自己說；錄音或跳過後才聽示範。',model:'They’re filling my prescription.',zh:'他們正在配我的處方藥。',speakingPrompt:'藥房已收下處方，但藥劑師仍在準備藥。簡短向朋友解釋。',recording:'phrase',questions:[]},
  {id:'native-289-v2-final',style:'final',label:'藥房挑戰',title:'向家人報告等待時間',intro:'寫兩句，再用示例自評。',questions:['native-289-v2-final']}
];
export default {revision:2,summary:'用 filling my prescription 表示藥房仍在按處方備藥，與已備妥可領取分開。',steps,questions,takeaways:['They’re filling my prescription.'],completionTitle:'你能向同行的人說清藥房進度及等待時間。'};

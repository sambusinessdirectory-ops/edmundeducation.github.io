import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});

const questions=[
  mc('native-252-v2-audio','audio','只聽這句維修描述。問題最可能出在哪裏？',
    ['螺絲頭的凹槽磨壞，工具咬不住。','螺絲在孔內已經鬆了。','螺絲起子握柄斷了。','木板上的螺絲孔太深。'],
    '螺絲頭的凹槽磨壞，工具咬不住。','stripped 在這個情境指螺絲頭的槽磨損，起子轉動時容易滑開。'),
  mc('native-252-v2-detail','detail','你想判斷螺絲是否 stripped。哪項觀察最關鍵？',
    ['十字凹槽的邊緣被磨圓，起子一轉就打滑。','螺絲可輕易轉動，而且不再鎖緊。','螺絲起子握柄太短，握起來不舒服。','螺絲周圍的木頭顏色變深。'],
    '十字凹槽的邊緣被磨圓，起子一轉就打滑。','要看的是起子與螺絲頭能否咬合；「容易轉動」反而可能是螺絲鬆了。'),
  mc('native-252-v2-reverse','reverse','哪句英文對應「螺絲頭磨平，螺絲起子抓不住」？',
    ['The screw is stripped.','The screw is loose.','The screw is missing.','The screwdriver is bent.'],
    'The screw is stripped.','stripped 指螺絲頭受損；loose 指螺絲鬆，missing 指根本沒有螺絲。'),
  mc('native-252-v2-branch','branch','同伴問：「Why won’t the screwdriver catch?」你看到螺絲頭的槽已磨圓。接下來哪句最有幫助？',
    ['The screw is stripped. We may need a different tool.','The screw is loose. Just turn it by hand.','The screw is missing. Look for another one.','The screwdriver handle is wet. Dry it first.'],
    'The screw is stripped. We may need a different tool.','回答先指出咬不住的原因，再提出換工具；其他回應指向與現場觀察不同的問題。'),
  open('native-252-v2-final','final','新情境：你要拆下舊書架的一顆螺絲。螺絲頭已磨平，起子不停滑開。寫兩句英文告訴同伴問題和下一步。',
    ['The screw is stripped. Let’s try a different tool.','I think the screw head is stripped. This screwdriver can’t grip it.','The screw is stripped, so the screwdriver keeps slipping. We may need another way to remove it.'],
    '自評時檢查是否指出螺絲頭磨損，並給出合理下一步；不要把 stripped 誤當成 loose。')
];

const steps=[
  {id:'native-252-v2-audio',style:'audio',label:'聽出故障',title:'起子為何打滑？',intro:'先只聽一句，不看英文文字。',model:'The screw is stripped.',zh:'螺絲頭磨損了。',audioOnly:true,questions:['native-252-v2-audio']},
  {id:'native-252-v2-detail',style:'detail',label:'找出線索',title:'看螺絲頭的槽',intro:'從可觀察的狀況判斷問題。',questions:['native-252-v2-detail']},
  {id:'native-252-v2-reverse',style:'reverse',label:'反向配對',title:'由故障找英文',intro:'區分螺絲磨損、鬆動和缺失。',questions:['native-252-v2-reverse']},
  {id:'native-252-v2-branch',style:'branch',label:'維修對話',title:'回答同伴的疑問',intro:'選一個能讓維修繼續下去的回應。',questions:['native-252-v2-branch']},
  {id:'native-252-v2-speak',style:'speak',label:'口頭報告',title:'告訴同伴螺絲的問題',intro:'先自己說；錄音或跳過後才聽示範。',model:'The screw is stripped.',zh:'螺絲頭磨損了。',speakingPrompt:'螺絲起子在螺絲頭上一直打滑。向同伴指出故障。',recording:'phrase',questions:[]},
  {id:'native-252-v2-final',style:'final',label:'書架挑戰',title:'問題和下一步',intro:'用自己的話寫，再對照示例自評。',questions:['native-252-v2-final']}
];

export default {revision:2,summary:'分清螺絲頭磨損與螺絲鬆動，並在維修對話中說明起子為何咬不住。',steps,questions,takeaways:['The screw is stripped.'],completionTitle:'你能看出螺絲頭磨損的線索，並清楚向同伴說明。'};

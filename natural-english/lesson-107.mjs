import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-107-v2-audio','audio','只聽這句話。它把哪兩件事作比較？',
    ['遲了才做，和完全沒有做。','早到，和準時到。','做得快，和做得慢。','昨天做，和明天做。'],
    '遲了才做，和完全沒有做。','Better late than never 說雖然遲，總比沒有發生或沒有做要好。'),
  mc('native-107-v2-detail','detail','朋友終於開始運動，之前一直想做卻沒開始。哪個細節令 Better late than never 貼切？',
    ['開始時間比原先想的晚，但現在真的開始了。','他今天比平常早十分鐘到。','他從來沒有想過運動。','他只是換了一雙新鞋。'],
    '開始時間比原先想的晚，但現在真的開始了。','這句著重「終於做了」；若還未開始，就不能說已經 better than never。'),
  mc('native-107-v2-branch','branch','同事很晚才交上答應給你的資料，說 Sorry it took so long。你確實仍用得上資料。哪個回應帶輕鬆接受的語氣？',
    ["Thanks for sending it. Better late than never.","I never wanted the file at all.","Because it's late, it has no value.","You sent it before I asked."],
    "Thanks for sending it. Better late than never.",'先道謝，再以輕鬆語氣說雖遲仍有用；但若延誤造成實際損失，這句未必合適。'),
  mc('native-107-v2-repair','repair','朋友遲到令你錯過最後一班車，對方說 Better late than never。你想指出這句在此刻不合適，哪個理由最準確？',
    ['延誤已造成實際損失，這句可能顯得輕描淡寫。','因為 late 永遠不能形容人。','因為 never 只能用於未來。','因為這句只可以寫在郵件標題。'],
    '延誤已造成實際損失，這句可能顯得輕描淡寫。','片語不是萬用道歉；先承認影響和補救，比用玩笑帶過更合適。'),
  mc('native-107-v2-explain','explain','I finally started exercising. Better late than never。第二句在這裡做甚麼？',
    ['承認開始得晚，但肯定現在開始仍有價值。','要求別人停止運動。','保證以後永遠不會遲。','說自己從未運動過。'],
    '承認開始得晚，但肯定現在開始仍有價值。','它把「晚了」和「至少已開始」一起表達，不是保證未來或否定行動。'),
  open('native-107-v2-writing','transfer','最後情境：你一直想學游泳，今天終於上了第一堂課，雖然比自己計劃的晚了半年。朋友問感覺如何。用兩句英文說明你終於開始，並自然加入今天的片語。',
    ["I finally started swimming lessons today. Better late than never!","I put it off for six months, but I had my first swimming lesson today. Better late than never.","I finally took my first swimming lesson. Better late than never, right?"],
    '先交代行動確實已開始，再用 Better late than never 肯定遲來仍有價值；別用它替延誤造成的傷害開脫。')
];
const steps=[
  {id:'native-107-v2-audio',style:'audio',label:'聽出比較',title:'晚做與沒做',intro:'先只聽這句慣用語。',model:'Better late than never.',zh:'遲做總比不做好。',audioOnly:true,questions:['native-107-v2-audio']},
  {id:'native-107-v2-detail',style:'detail',label:'找到前提',title:'真的開始了嗎？',intro:'判斷甚麼事實令這句話成立。',questions:['native-107-v2-detail']},
  {id:'native-107-v2-branch',style:'branch',label:'接住遲來的事',title:'資料仍然有用',intro:'試著讀出輕鬆接受的語氣。',questions:['native-107-v2-branch']},
  {id:'native-107-v2-repair',style:'repair',label:'避免輕描淡寫',title:'延誤有代價時',intro:'判斷這句慣用語何時不宜當道歉。',questions:['native-107-v2-repair']},
  {id:'native-107-v2-explain',style:'explain',label:'拆開意思',title:'終於開始運動',intro:'說明片語在句中做的事。',questions:['native-107-v2-explain']},
  {id:'native-107-v2-transfer',style:'transfer',label:'游泳課挑戰',title:'晚半年開始，仍值得',intro:'換新情境，自己組織兩句英文。',questions:['native-107-v2-writing']}
];
export default {revision:2,summary:'理解 Better late than never 可肯定遲來的行動，也要留意延誤已傷害別人時的語氣。',steps,questions,takeaways:['Better late than never.','I finally started exercising. Better late than never.'],completionTitle:'你能用這句話肯定遲來的開始，也懂得何時別用它輕輕帶過損失。'};

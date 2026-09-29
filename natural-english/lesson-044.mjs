import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-044-v2-audio','audio','只聽一句車上的話。說話者想在甚麼地方離開車？',
    ['就在目前這個位置附近。','到下一個城市。','回出發的地方。','車站另一邊。'],
    '就在目前這個位置附近。',"I'll get out here. 用 here 指目前這個位置，表示不必再繼續載他。"),
  mc('native-044-v2-tone','tone','的士仍在行駛，你想在前面安全可停的位置下車。哪句對司機清楚又有禮？',
    ['Could you let me out up ahead, please?','Stop right now in the middle of the road.','I already got out of the car.','You can take me anywhere.'],
    'Could you let me out up ahead, please?','up ahead 指前面一段位置；請求司機在可停的地方讓你下車，比要求立即在路中央停下恰當。'),
  mc('native-044-v2-transfer','transfer','從的士改成巴士：你要在下一站下車，哪個說法比 get out here 更貼近巴士情境？',
    ["I'll get off at the next stop.","I'll get out the next stop.","I'll get in at the next stop.","I'll get over the next stop."],
    "I'll get off at the next stop.",'一般說 get out of a car/taxi，但說 get off a bus/train；交通工具一換，介詞也變。'),
  mc('native-044-v2-continue','continue','司機問 Should I keep going? 你已在目的地附近，想在合法可停處下車。怎樣接話？',
    ["No, a safe spot around here is fine, thanks.","Yes, please drive for another hour.","I don't know where I am, but don't stop.","The car needs petrol."],
    "No, a safe spot around here is fine, thanks.",'先回答不用再開，並把停車地點說成附近安全可停的位置。'),
  blank('native-044-v2-final','final','最後挑戰：朋友載你回家，已駛近路口；你願意在前面安全位置下車，不用他繞進小街。寫一句自然英文告訴他。',
    ["I can get out up ahead.","I can get out here if you can stop safely.","You can let me out up ahead.","I can get out at the corner."],
    '你要下車，不用朋友再繞路。','用 get out 或 let me out 表示從車上下來；補上可安全停車的位置比含糊地叫司機立刻停更好。')
];

const steps=[
  {id:'native-044-v2-audio',style:'audio',label:'聽出地點',title:'還要繼續開嗎？',intro:'先只聽聲音，判斷說話者想在哪裏下車。',model:'I’ll get out here.',zh:'我在這裏下車。',audioOnly:true,questions:['native-044-v2-audio']},
  {id:'native-044-v2-tone',style:'tone',label:'禮貌請停',title:'車仍在行駛',intro:'請求司機找安全可停的位置。',questions:['native-044-v2-tone']},
  {id:'native-044-v2-transfer',style:'transfer',label:'換交通工具',title:'巴士要說 get off',intro:'分清車和公共交通的說法。',questions:['native-044-v2-transfer']},
  {id:'native-044-v2-speak',style:'speak',label:'即時口說',title:'朋友問要不要繼續開',intro:'先自己說；錄音或跳過後才聽示範。',model:'I’ll get out here.',zh:'我在這裏下車。',speakingPrompt:'朋友：Should I keep going? 車已停在合適位置，你就在這裏下。',recording:'phrase',questions:[]},
  {id:'native-044-v2-continue',style:'continue',label:'接住問題',title:'回應司機下一步',intro:'不只說下車，還要交代合適的停車位置。',questions:['native-044-v2-continue']},
  {id:'native-044-v2-final',style:'final',label:'路口挑戰',title:'不用繞進小街',intro:'新情境，自己選用自然的下車說法。',questions:['native-044-v2-final']}
];

export default {revision:2,summary:'在車上自然表示要下車，分清 get out 和巴士的 get off，並向司機說明合適停車位置。',steps,questions,takeaways:['I’ll get out here.','You can let me out here.'],completionTitle:'你能自然告訴司機在哪裏下車，也能按交通工具選對說法了！'};

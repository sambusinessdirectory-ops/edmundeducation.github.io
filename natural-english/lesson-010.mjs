import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'open',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-010-v2-reverse','reverse',
    '朋友對司機說 Can you make it a little cooler? 他希望車內變成怎樣？',
    ['比現在稍微涼一點。','比現在稍微暖一點。','立刻冷到最低溫。','把車窗完全關上。'],
    '比現在稍微涼一點。',
    'a little cooler 是「稍微涼一點」，沒有要求開到最冷；make it 指車內環境。'),
  mc('native-010-v2-explain','explain',
    '酒店房間太熱，你想禮貌地請職員調涼一點。為甚麼 Can you make it a little cooler? 比 Make it cold! 更合適？',
    ['它提出請求，而且只要求稍微降溫。','它表示不要再開冷氣。','它保證房間會立刻變冷。','兩句都在問室外的天氣。'],
    '它提出請求，而且只要求稍微降溫。',
    'Can you…? 是請求；a little cooler 限定只要稍微涼一點，語氣也比命令句柔和。'),
  mc('native-010-v2-audio','audio',
    '只聽一句請求。說話者想調整甚麼？',
    ['所在環境的溫度。','車上的音量。','餐點的辣度。','房間的燈光。'],
    '所在環境的溫度。',
    'cooler 描述溫度變涼；在這個房間情境，it 指目前的室內環境。'),
  blank('native-010-v2-final','final',
    '最後挑戰：你在朋友車上覺得有點熱，但不想要求開到最冷。自己寫一句有禮貌的英文，請他把車內調涼一點。',
    ['Can you make it a little cooler?','Could you make it a little cooler?','Can you make the car a little cooler?','Could you make the car a little cooler?'],
    '用禮貌問句，表達「只要稍微涼一點」。',
    'Can you make it a little cooler? 清楚而有禮；Could you…? 也可以。')
];

const steps=[
  {id:'native-010-v2-audio',style:'audio',label:'只聽聲音',title:'這個請求指向甚麼？',intro:'答完才看逐字稿；先從聲音判斷。',model:'Can you make it a little cooler?',zh:'可以涼一點嗎？',audioOnly:true,questions:['native-010-v2-audio']},
  {id:'native-010-v2-reverse',style:'reverse',label:'反向理解',title:'從英文還原真正的請求',intro:'先理解整句意思，不急着照抄。',questions:['native-010-v2-reverse']},
  {id:'native-010-v2-explain',style:'explain',label:'說明分寸',title:'要涼一點，不是命令開到最冷',intro:'看看禮貌和程度如何改變句子的效果。',questions:['native-010-v2-explain']},
  {id:'native-010-v2-speak',style:'speak',label:'即時請求',title:'酒店房間太熱，輪到你說',intro:'先自己向職員提出請求，錄音或跳過後才有示範。',model:'Can you make it a little cooler?',zh:'可以涼一點嗎？',speakingPrompt:'酒店職員：Is the room comfortable? 房間有點熱，你只想它稍微涼一點。',recording:'phrase',questions:[]},
  {id:'native-010-v2-final',style:'final',label:'車內挑戰',title:'轉到車內，也能自然提出請求',intro:'不給選項；自己選擇合適的禮貌問句。',questions:['native-010-v2-final']}
];

export default {revision:2,summary:'把室內或車內溫度請求說得有禮、準確，理解 a little cooler 的分寸。',steps,questions,takeaways:['Can you make it a little cooler?','Can you make it a little warmer?'],completionTitle:'你能自然請人把環境調涼一點了！'};

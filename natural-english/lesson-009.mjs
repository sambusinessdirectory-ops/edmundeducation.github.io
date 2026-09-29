import {mc} from './editorial-question.mjs';
const blank=(id,style,prompt,answers,hint,explanation)=>({id,type:'blank',style,prompt,before:'',after:'',answers,hint,explanation});

const questions=[
  mc('native-009-v2-audio','audio',
    '先只聽一句室內對話。說話者提到的是哪一種設備？',
    ['冷氣機。','暖爐。','電風扇。','加濕機。'],
    '冷氣機。',
    'AC 是 air conditioning 的日常簡稱。這句中的 turn down 可能因人而異地指風量或溫度設定；這裏先辨認設備。'),
  mc('native-009-v2-detail','detail',
    '酒店房間很冷。你向櫃檯說 The AC is too strong. 哪個字組指出「冷氣」而不是暖氣？',
    ['AC','too strong','The','is'],
    'AC',
    'AC 是 air conditioning 的日常簡稱；too strong 描述它太強，並不指設備。'),
  mc('native-009-v2-contrast','contrast',
    '室友把 AC 和 fan 當成同一樣東西。哪個說明最能分清兩種設備？',
    ['AC 會制冷；fan 主要推動空氣。','AC 只會吹風，fan 會製造冷空氣。','兩個字都只指暖爐。','AC 是窗，fan 是門。'],
    'AC 會制冷；fan 主要推動空氣。',
    'AC 指冷氣；fan 指風扇。日常對話中兩者常一起出現，但不是同一設備。'),
  blank('native-009-v2-final','final',
    '最後挑戰：你在車內覺得熱，冷氣目前沒有開。用自然英文請司機開冷氣。',
    ['Can you turn on the AC?','Could you turn on the AC?','Can you turn the AC on?','Could you turn the AC on?'],
    '說清楚你要開的是哪一種設備。',
    'Can you turn on the AC? 明確要求打開冷氣；Could you…? 也自然有禮。')
];

const steps=[
  {id:'native-009-v2-audio',style:'audio',label:'聽出設備',title:'說話者提到哪部機器？',intro:'只聽聲音先辨認設備；答完才看文字。',model:'Can you turn down the AC?',zh:'可以調一下冷氣設定嗎？',audioOnly:true,questions:['native-009-v2-audio']},
  {id:'native-009-v2-detail',style:'detail',label:'抓設備名稱',title:'AC 指甚麼？',intro:'從完整句中找出冷氣的日常英文名稱。',questions:['native-009-v2-detail']},
  {id:'native-009-v2-contrast',style:'contrast',label:'分清設備',title:'冷氣與風扇不是同一樣',intro:'把設備名稱和功能配對，避免問錯機器。',questions:['native-009-v2-contrast']},
  {id:'native-009-v2-speak',style:'speak',label:'口說名稱',title:'告訴職員你說的是冷氣',intro:'先用英文簡稱說出設備名稱，錄音或跳過後才聽示範。',model:'AC',zh:'冷氣。',speakingPrompt:'酒店職員：Do you mean the fan or the air conditioning? 你要說的是冷氣。',recording:'phrase',questions:[]},
  {id:'native-009-v2-final',style:'final',label:'車內挑戰',title:'車裏太熱，請司機開冷氣',intro:'沒有選項，自己寫出自然請求。',questions:['native-009-v2-final']}
];

export default {revision:2,summary:'認識 AC 的日常用法，分清冷氣和風扇，並在需要時請人開冷氣。',steps,questions,takeaways:['AC','Can you turn down the AC?'],completionTitle:'你能準確說出冷氣，並自然請人打開它了！'};

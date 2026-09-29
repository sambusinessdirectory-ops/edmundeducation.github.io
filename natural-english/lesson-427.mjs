import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-427-v2-audio","audio","傘打開後最可能怎樣？",["放手後滑回關閉位置。", "傘面被風吹得向上翻。", "傘布漏水但仍撐開。", "傘柄無法從袋裏拿出。"],"放手後滑回關閉位置。","won’t lock open 指撐開後不能固定，因此可能一放手便收回。"),
  mc("native-427-v2-repair","repair","顧客說 I can’t open the umbrella，但示範時能打開，只是放手就合上。哪句修正最精確？",["It opens, but it won’t lock open.", "It opens, but the fabric turned inside out.", "It won’t open at all.", "It opens, but I forgot where I bought it."],"It opens, but it won’t lock open.","先承認可以打開，再指出不能卡在打開位置，能避免店員誤判。"),
  mc("native-427-v2-continue","continue","新買的傘一鬆手就收起，店員請你說明。哪句最有助於檢查？",["It won’t stay open when I let go. Could you check the catch?", "It doesn’t match my coat. Could you check the colour?", "It turned inside out in the wind yesterday.", "I’m not sure whether it’s an umbrella."],"It won’t stay open when I let go. Could you check the catch?","描述放手後收起的現象並請對方檢查卡扣，能直接定位問題。"),
  mc("native-427-v2-tone","tone","傘在店裏測試時也會自己收起。哪句較得體？",["Could you take a look? It won’t lock open even when I push it all the way up.", "You sold me a useless umbrella, so replace it now without looking.", "I’ll say it’s fine and come back after it breaks further.", "The rain is your fault because this umbrella closes."],"Could you take a look? It won’t lock open even when I push it all the way up.","說明已完全推開仍固定不了，再請店員查看，語氣清楚又留有查核空間。"),
  {id:"native-427-v2-final",type:'open',style:"final",prompt:"新情境：在巴士站打傘，傘一推開就滑下，手必須一直頂著才能遮雨。寫一兩句英文向同伴說明故障，並提出當下怎樣避雨。",answers:["The umbrella won’t lock open. Let’s wait under the bus shelter.", "It won’t stay open unless I hold the slider up. Can we stand under the roof?", "My umbrella won’t lock open, so I need to get under the shelter."],explanation:"指出傘不能固定在打開位置，再提出走到有遮蓋的地方。"}
];

const steps=[
  {"id": "native-427-v2-audio", "style": "audio", "label": "先聽故障", "title": "能撐住嗎？", "intro": "先聽句子，再判斷傘的動作。", "model": "The umbrella won’t lock open.", "zh": "這把傘打開後卡不住。", "audioOnly": true, "questions": ["native-427-v2-audio"]},
  {"id": "native-427-v2-repair", "style": "repair", "label": "修正描述", "title": "不是打不開", "intro": "把含糊投訴改成準確故障。", "questions": ["native-427-v2-repair"]},
  {"id": "native-427-v2-continue", "style": "continue", "label": "請人檢查", "title": "向店員示範", "intro": "用具體症狀提出請求。", "questions": ["native-427-v2-continue"]},
  {"id": "native-427-v2-tone", "style": "tone", "label": "清楚但客氣", "title": "售後詢問", "intro": "在店內提出合理請求。", "questions": ["native-427-v2-tone"]},
  {"id": "native-427-v2-final", "style": "final", "label": "新雨天自評", "title": "巴士站的雨傘", "intro": "自己寫症狀和需要。", "questions": ["native-427-v2-final"]}
];

export default {revision:2,summary:"用 The umbrella won’t lock open. 描述雨傘撐開後不能固定，放手便滑回收起。",steps,questions,takeaways:["The umbrella won’t lock open.", "It won’t stay open."],completionTitle:"你能指出固定機構失效，並向店員要求檢查。"};

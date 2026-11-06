import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-197-v2-audio","audio","聽到這個詞組，最合理的理解是甚麼？",["暫時停用會籍，日後可恢復。", "今天永久退會。", "把會籍升級到較貴方案。", "把剩餘會籍轉給另一人。"],"暫時停用會籍，日後可恢復。","freeze 在會籍情境是暫停，不是把卡片冷凍。"),
  mc("native-197-v2-contrast","contrast","你旅行三個月後會回來健身，想保留會籍。哪句最適合？",["I’d like to freeze my membership.", "I’d like to cancel my membership forever.", "I’d like to book a class tonight.", "I’d like to transfer my membership to a friend."],"I’d like to freeze my membership.","freeze 指暫停使用或收費安排；你仍打算日後恢復。"),
  mc("native-197-v2-transfer","transfer","你半年不會使用瑜伽會籍，但希望保留會員資格。哪個動詞表達暫停最貼切？",["freeze", "cancel", "upgrade", "renew"],"freeze","freeze a membership 也可用於能暫停的其他會籍服務。"),
  mc("native-197-v2-reverse","reverse","要說「我只是想暫停會籍幾個月」，哪句最貼切？",["I want to freeze my membership.", "I want to cancel my membership.", "I want to replace my membership card.", "I want to renew my membership today."],"I want to freeze my membership.","freeze membership 指暫停；cancel 指取消。"),
  {id:"native-197-v2-final",type:'open',style:"final",prompt:"新的情境：你要去外地工作兩個月，之後會回健身室。寫一句英文給職員，要求把會籍暫停兩個月。",answers:["I'd like to freeze my membership for two months.", "Could I freeze my membership while I’m away for two months?", "I’ll be away for two months. Can I freeze my membership?"],explanation:"freeze my membership 表示暫停；加 for two months 清楚說明期限。"}
];

const steps=[
  {"id": "native-197-v2-audio", "style": "audio", "label": "聽出安排", "title": "會籍會怎樣？", "intro": "先聽聲音，想想「會籍會怎樣？」所問的關鍵。", "model": "freeze my membership", "zh": "暫停我的會籍。", "audioOnly": true, "questions": ["native-197-v2-audio"]},
  {"id": "native-197-v2-contrast", "style": "contrast", "label": "暫停或取消", "title": "幾個月後會再用", "intro": "辨認兩種安排。", "questions": ["native-197-v2-contrast"]},
  {"id": "native-197-v2-transfer", "style": "transfer", "label": "換服務場景", "title": "不只健身室", "intro": "把概念轉到另一種月費服務。", "questions": ["native-197-v2-transfer"]},
  {"id": "native-197-v2-speak", "style": "speak", "label": "口頭辦理", "title": "向櫃台說明", "intro": "先試着說出「暫停我的會籍。」，再聽示範。", "model": "freeze my membership", "zh": "暫停我的會籍。", "speakingPrompt": "你只是暫停健身會籍。先口頭說出「暫停我的會籍」這個關鍵詞組。", "recording": "phrase", "questions": []},
  {"id": "native-197-v2-reverse", "style": "reverse", "label": "從中文選詞", "title": "不是退會", "intro": "由目的選表達。", "questions": ["native-197-v2-reverse"]},
  {"id": "native-197-v2-final", "style": "final", "label": "新時段自寫", "title": "暫停到年底", "intro": "自己寫請求，再看示例自評。", "questions": ["native-197-v2-final"]}
];

export default {revision:2,summary:"用 freeze my membership 表示暫停健身會籍，而非永久取消。",steps,questions,takeaways:["freeze my membership", "I want to freeze my membership."],completionTitle:"你能向健身室要求暫停會籍，並說清與取消不同。"};

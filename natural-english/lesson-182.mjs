import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-182-v2-audio","audio","聽到這個詞組，原定下午三點的會議最可能改到哪時？",["下午兩點。", "下午四點。", "改天但時間不定。", "仍是下午三點。"],"下午兩點。","move up 指移到較早時間；兩點早於三點。"),
  mc("native-182-v2-contrast","contrast","會議原定三點，改到兩點。這是甚麼變動？",["把會議提前。", "把會議延後。", "把會議取消。", "只縮短會議長度。"],"把會議提前。","兩點比三點早；move the meeting up 表示提前。"),
  mc("native-182-v2-reverse","reverse","一個會議由上午十一點改到十點。哪句描述了變動？",["We moved the meeting up an hour.", "We pushed the meeting back an hour.", "We called the meeting off.", "We kept the meeting at eleven."],"We moved the meeting up an hour.","由十一點到十點早了一小時，所以是 moved up an hour。"),
  mc("native-182-v2-scene","scene","你會在甚麼情況問 Can we move the meeting up to 2?",["原定三點，想兩點開會。", "原定一點，想兩點開會。", "不想開會，請求取消。", "想把兩點的會議延長一小時。"],"原定三點，想兩點開會。","這句要求把會議提前到兩點；只有原定時間較遲時才吻合。"),
  mc("native-182-v2-repair","repair","同事原定五點開會，想改到四點，卻說「push it back to four」。哪個修改最準確？",["改成 move it up to four。", "保留 push it back to four。", "改成 call it off at four。", "改成 keep it at five。"],"改成 move it up to four。","四點早於五點；應說 move it up。push back 會暗示更遲。"),
  {id:"native-182-v2-final",type:'open',style:"final",prompt:"新的情境：你和設計組約好星期五四點見面，但三點更方便。寫一句禮貌英文訊息，提議把會議提前到三點。",answers:["Could we move Friday's meeting up to 3?", "Would it be okay to move our meeting up to 3 p.m.?", "Can we move the meeting up to 3?"],explanation:"move up to 指向新而較早的時間；寫清三點才能讓對方回應安排。"}
];

const steps=[
  {"id": "native-182-v2-audio", "style": "audio", "label": "聽出動作", "title": "先聽核心詞組", "intro": "先聽英文，暫時不看字句。", "model": "move the meeting up", "zh": "把會議提前。", "audioOnly": true, "questions": ["native-182-v2-audio"]},
  {"id": "native-182-v2-contrast", "style": "contrast", "label": "辨認方向", "title": "比原定時間更早", "intro": "從時間變化理解 move up。", "questions": ["native-182-v2-contrast"]},
  {"id": "native-182-v2-reverse", "style": "reverse", "label": "看時間選句", "title": "一小時以前", "intro": "由具體時間反推表達。", "questions": ["native-182-v2-reverse"]},
  {"id": "native-182-v2-scene", "style": "scene", "label": "選合適時機", "title": "甚麼時候會這樣問？", "intro": "比較幾種不同的改動。", "questions": ["native-182-v2-scene"]},
  {"id": "native-182-v2-repair", "style": "repair", "label": "修正方向", "title": "把錯的動詞改準", "intro": "留意時間線與動詞是否一致。", "questions": ["native-182-v2-repair"]},
  {"id": "native-182-v2-final", "style": "final", "label": "自主寫訊息", "title": "給團隊新時間", "intro": "在新情境先自己寫，再對照示例。", "questions": ["native-182-v2-final"]}
];

export default {revision:2,summary:"用 move the meeting up 表示把會議改到更早，並和 push back、取消區分。",steps,questions,takeaways:["move the meeting up", "Can we move the meeting up to 2?"],completionTitle:"你能分辨會議提前和延後，並自然提出較早的新時間。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-196-v2-audio","audio","聽到這個詞組，最接近哪個動作？",["輕輕拍一下肩膀。", "用手碰了一下對方的背。", "輕拍了對方的手臂。", "在對方面前揮了揮手。"],"輕輕拍一下肩膀。","tap 是輕拍，on the shoulder 指肩膀的位置。"),
  mc("native-196-v2-repair","repair","要說他輕拍我的肩膀，哪句正確？",["He tapped me on the shoulder.", "He tapped me on the back.", "He tapped me on the arm.", "He put his hand on my shoulder."],"He tapped me on the shoulder.","常用結構是 tap someone on the shoulder。"),
  mc("native-196-v2-branch","branch","你在排隊時有人從背後 tapped you on the shoulder。最自然的反應是甚麼？",["轉身看看對方有甚麼事。", "查看自己手機是否響了。", "轉頭看隊伍後方有否空位。", "看看前面隊伍是否開始移動。"],"轉身看看對方有甚麼事。","輕拍肩膀常用來引起注意，尤其對方在身後；拍肩膀是讓背對自己的人注意到你，轉身便可知道對方所需。"),
  {id:"native-196-v2-final",type:'open',style:"final",prompt:"新的情境：圖書館裏你戴着耳機，館員輕拍你的肩膀提醒你快關門。寫一句英文告訴朋友發生甚麼事。",answers:["The librarian tapped me on the shoulder to tell me the library was closing.", "I had my headphones on, so the librarian tapped me on the shoulder.", "The librarian tapped me on the shoulder and said it was closing time."],explanation:"tap someone on the shoulder 是輕拍以引起注意；過去式 tapped。"}
];

const steps=[
  {"id": "native-196-v2-audio", "style": "audio", "label": "只聽動作", "title": "動作輕還是重？", "intro": "先聽詞組，再判斷。", "model": "tapped me on the shoulder", "zh": "輕拍我的肩膀。", "audioOnly": true, "questions": ["native-196-v2-audio"]},
  {"id": "native-196-v2-speak", "style": "speak", "label": "口頭描述", "title": "背後有人叫你", "intro": "先試着說出「輕拍我的肩膀。」，再聽示範。", "model": "tapped me on the shoulder", "zh": "輕拍我的肩膀。", "speakingPrompt": "朋友問對方如何引起你注意。先口頭說出「輕拍我的肩膀」這個關鍵詞組。", "recording": "phrase", "questions": []},
  {"id": "native-196-v2-repair", "style": "repair", "label": "修正部位", "title": "輕拍哪裏？", "intro": "辨認英文介詞和部位。", "questions": ["native-196-v2-repair"]},
  {"id": "native-196-v2-branch", "style": "branch", "label": "對話分支", "title": "引起注意後", "intro": "根據動作推斷下一步。", "questions": ["native-196-v2-branch"]},
  {"id": "native-196-v2-final", "style": "final", "label": "新場景自寫", "title": "圖書館提醒", "intro": "先寫再看示例。", "questions": ["native-196-v2-final"]}
];

export default {revision:2,summary:"用 tapped me on the shoulder 描述為引起注意而輕拍肩膀。",steps,questions,takeaways:["tapped me on the shoulder", "He tapped me on the shoulder."],completionTitle:"你能準確描述有人輕拍肩膀引起注意。"};

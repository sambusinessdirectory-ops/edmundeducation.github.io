import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-549-v2-audio","audio","說話者最可能手上拿着甚麼？",["從罐頂斷下來的拉環。", "完整拉開的罐蓋。", "漏出飲料的罐底。", "仍緊扣在罐上的拉環。"],"從罐頂斷下來的拉環。","snapped off 表示拉環突然斷離原位；罐口未必已打開。"),
  mc("native-549-v2-contrast","contrast","你拉了一下易開罐，拉環掉了，但開口仍封着。哪句最準確？",["The pull tab snapped off, but the can is still closed.", "The can opened normally when I pulled the tab.", "The bottom of the can leaked before I touched it.", "The pull tab is still attached and works fine."],"The pull tab snapped off, but the can is still closed.","拉環斷掉不代表罐口打開；句子同時交代兩個結果。"),
  mc("native-549-v2-rewrite","rewrite","朋友說 The can broke，但實際是拉環斷掉，罐身完好。怎樣修正？",["The pull tab snapped off.", "The can split down the side.", "The drink spilled through the bottom.", "The lid opened without the tab."],"The pull tab snapped off.","點出 pull tab 才能讓對方知道壞的是開罐拉環，避免誤以為罐身破裂。"),
  {id:"native-549-v2-final",type:'open',style:"final",prompt:"新情境：野餐時你拉開汽水罐，拉環突然斷下來，罐口仍未打開。寫一兩句英文告訴同伴發生甚麼事，並問有沒有安全的替代飲品或開法。",answers:["The pull tab snapped off, and the can is still closed. Do we have another drink?", "The tab broke off before I could open the can. Is there another can I can take?", "The pull tab snapped off. Could you help me find a safe way to open it?"],explanation:"說清拉環斷掉而罐口仍封住，再詢問替代飲品或安全處理方法。"}
];

const steps=[
  {"id": "native-549-v2-audio", "style": "audio", "label": "先聽斷裂", "title": "哪部分脫落？", "intro": "先聽句子，留意 snapped off 的結果。", "model": "The pull tab snapped off.", "zh": "易開罐拉環一下斷掉了。", "audioOnly": true, "questions": ["native-549-v2-audio"]},
  {"id": "native-549-v2-contrast", "style": "contrast", "label": "斷環與開罐", "title": "罐口仍封住", "intro": "分清操作結果。", "questions": ["native-549-v2-contrast"]},
  {"id": "native-549-v2-rewrite", "style": "rewrite", "label": "說清事故", "title": "不是整罐碎掉", "intro": "把模糊說法改為具體部件。", "questions": ["native-549-v2-rewrite"]},
  {"id": "native-549-v2-speak", "style": "speak", "label": "口頭報告", "title": "打不開罐子", "intro": "看着手上斷掉的拉環，先說再核對錄音。", "model": "The pull tab snapped off.", "zh": "拉環一下斷掉了。", "speakingPrompt": "易開罐拉環一拉就斷；向朋友口說「拉環一下斷掉了」。", "recording": "phrase", "questions": []},
  {"id": "native-549-v2-final", "style": "final", "label": "新飲料自評", "title": "野餐的罐裝飲品", "intro": "自行寫斷裂和下一步需求。", "questions": ["native-549-v2-final"]}
];

export default {revision:2,summary:"用 The pull tab snapped off. 描述易開罐拉環被拉斷，與整個罐口已打開區分。",steps,questions,takeaways:["The pull tab snapped off.", "Can you still open it?"],completionTitle:"你能說清拉環斷掉，並討論是否仍可安全打開罐子。"};

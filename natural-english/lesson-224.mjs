import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-224-v2-audio","audio","在擁擠走廊中聽到這句，最可能是甚麼？",["走路時身體輕輕撞到他。", "腳踩到他的腳。", "有人拍了他的肩膀。", "他完全沒有出現。"],"走路時身體輕輕撞到他。","bump into 在擁擠走路情境指意外碰撞，和 step on foot 不同。"),
  mc("native-224-v2-scene","scene","哪個情況最適合說 I bumped into him？",["轉角時肩膀輕碰到另一人。", "鞋底踩上他的腳趾。", "在街上看到他，但沒有走近。", "從他身後經過但沒有碰到。"],"轉角時肩膀輕碰到另一人。","bump into 描述意外碰撞，與踩腳或揮手不同。"),
  mc("native-224-v2-continue","continue","走路時輕撞陌生人，對方轉過來。哪句合適？",["Sorry, I bumped into you. I didn’t see you there.", "Sorry, you stepped on my foot.", "You should have moved; I’m not sorry.", "I meant to push you hard."],"Sorry, I bumped into you. I didn’t see you there.","向當事人道歉用 you，並說明自己沒看見他。"),
  mc("native-224-v2-detail","detail","I bumped into an old friend yesterday at the market. 如果雙方停下來聊天，這裏最可能是甚麼意思？",["偶然遇見一位舊朋友。", "用肩膀撞傷舊朋友。", "和舊朋友事先約好在市場見面。", "隔着街道看見舊朋友但沒有交談。"],"偶然遇見一位舊朋友。","bump into someone 也可指偶遇；old friend 和市場聊天使此義更自然。"),
  {id:"native-224-v2-final",type:'open',style:"final",prompt:"新的情境：你在車站轉角邊看時間邊走，輕撞到迎面的人。寫一兩句英文直接向他道歉並說明你沒看見他。",answers:["Sorry, I bumped into you. I didn’t see you coming.", "I’m sorry I bumped into you. I was looking at the time.", "Oh, sorry! I didn’t see you around the corner and bumped into you."],explanation:"向當事人用 bumped into you，並簡短說明沒有看見對方。"}
];

const steps=[
  {"id": "native-224-v2-audio", "style": "audio", "label": "先聽動作", "title": "發生小碰撞", "intro": "先聽句子，再看所在場景。", "model": "I bumped into him.", "zh": "我撞到他。", "audioOnly": true, "questions": ["native-224-v2-audio"]},
  {"id": "native-224-v2-scene", "style": "scene", "label": "選場景", "title": "肩膀碰到人", "intro": "分辨身體接觸方式。", "questions": ["native-224-v2-scene"]},
  {"id": "native-224-v2-continue", "style": "continue", "label": "接續道歉", "title": "碰撞後怎樣說？", "intro": "在當事人面前回應。", "questions": ["native-224-v2-continue"]},
  {"id": "native-224-v2-detail", "style": "detail", "label": "抓語境", "title": "碰撞還是偶遇？", "intro": "同一詞組有另一用法。", "questions": ["native-224-v2-detail"]},
  {"id": "native-224-v2-speak", "style": "speak", "label": "口頭交代", "title": "走廊碰撞", "intro": "先說出意外碰到他的動作，再聽示範。", "model": "I bumped into him.", "zh": "我撞到他。", "speakingPrompt": "走廊太擠，肩膀輕碰到一名男子；口頭向朋友說「我撞到他」。", "recording": "phrase", "questions": []},
  {"id": "native-224-v2-final", "style": "final", "label": "新場合自寫", "title": "車站轉角", "intro": "先寫道歉及原因，再看示例。", "questions": ["native-224-v2-final"]}
];

export default {revision:2,summary:"用 bumped into him 描述走路時意外輕撞到人，並辨認也可指偶遇。",steps,questions,takeaways:["I bumped into him.", "I bumped into an old friend yesterday."],completionTitle:"你能按上下文分辨輕撞與偶遇，並在擁擠地方道歉。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-543-v2-audio","audio","說話者面對的具體問題是甚麼？",["膠帶尾端黏平在卷上，找不到起撕處。", "整卷膠帶在房間裏不見了。", "膠帶已經用完，只剩空紙芯。", "膠帶找到了，但剪刀不見了。"],"膠帶尾端黏平在卷上，找不到起撕處。","the end of the tape 指可拉起的尾端；不是說整卷膠帶不見。"),
  mc("native-543-v2-detail","detail","你拿着一卷透明膠帶，轉了幾圈仍看不出從哪裏撕。哪句最貼切？",["I can't find the end of the tape.", "I can't find the tape roll.", "The tape won't stick to the box.", "The tape dispenser is broken."],"I can't find the end of the tape.","膠帶卷就在手上，難題是找不到貼平的尾端；其他選項指不同問題。"),
  mc("native-543-v2-reverse","reverse","你想請同伴指出膠帶從哪裏撕起，哪句最自然？",["Where's the end of this tape?", "Where did you put the whole tape roll?", "Why doesn't this tape stick?", "When did we buy the tape?"],"Where's the end of this tape?","問 end of this tape 是請對方找卷上的尾端，不會誤解為找整卷。"),
  mc("native-543-v2-transfer","transfer","你終於找到膠帶尾端，還要封幾箱。怎樣避免下一次又找不到？",["把尾端折一小角，留下可抓的邊。", "把整卷膠帶壓得更平。", "先把膠帶貼在紙芯內側。", "把膠帶卷放到看不見的抽屜。"],"把尾端折一小角，留下可抓的邊。","折出小邊讓尾端不再完全貼平，下次能更容易抓住。"),
  {id:"native-543-v2-final",type:'open',style:"final",prompt:"新情境：包生日禮物時你拿着紙膠帶卷，尾端貼得太平，找不到起撕處。寫一兩句英文告訴朋友問題，並請他幫忙找。",answers:["I can't find the end of the tape. Could you help me find where to peel it?", "Where's the end of this tape? Can you help me lift it?", "The end of this tape is hard to see. Could you find it for me?"],explanation:"明確指出是卷上的尾端難找，再提出幫忙找或掀起尾端的請求。"}
];

const steps=[
  {"id": "native-543-v2-audio", "style": "audio", "label": "先聽困難", "title": "膠帶少了嗎？", "intro": "先聽句子，辨認找不到的是哪一部分。", "model": "I can't find the end of the tape.", "zh": "我找不到膠帶的尾端。", "audioOnly": true, "questions": ["native-543-v2-audio"]},
  {"id": "native-543-v2-detail", "style": "detail", "label": "物件仍在手上", "title": "只差起點", "intro": "從動作區分找卷和找尾端。", "questions": ["native-543-v2-detail"]},
  {"id": "native-543-v2-reverse", "style": "reverse", "label": "自然問句", "title": "請人指給你看", "intro": "把陳述改為找位置的問句。", "questions": ["native-543-v2-reverse"]},
  {"id": "native-543-v2-transfer", "style": "transfer", "label": "包裹現場", "title": "封箱前的小技巧", "intro": "從困難推導實際做法。", "questions": ["native-543-v2-transfer"]},
  {"id": "native-543-v2-speak", "style": "speak", "label": "口頭求助", "title": "請朋友幫忙找", "intro": "看着手上的膠帶卷，先開口再聽示範。", "model": "Where's the end of this tape?", "zh": "這卷膠帶的尾端在哪裏？", "speakingPrompt": "你找不到手上膠帶卷的起撕處；向朋友口說「這卷膠帶的尾端在哪裏？」", "recording": "phrase", "questions": []},
  {"id": "native-543-v2-final", "style": "final", "label": "新工作自評", "title": "包生日禮物", "intro": "自己寫出問題和求助，對照示例核查兩點。", "questions": ["native-543-v2-final"]}
];

export default {revision:2,summary:"用 I can't find the end of the tape. 描述膠帶卷的尾端貼平，看不出從哪裏撕起。",steps,questions,takeaways:["I can't find the end of the tape.", "Where's the end of this tape?"],completionTitle:"你能說清膠帶的起撕位置難找，並請人幫忙。"};

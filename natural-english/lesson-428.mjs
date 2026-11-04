import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-428-v2-audio","audio","最可能看到甚麼？",["項鍊鏈子互相繞住，難以攤開。", "項鍊扣子已扣好，平放在盒內。", "墜子不見了，鏈子仍平直。", "項鍊顏色因日曬變淡。"],"項鍊鏈子互相繞住，難以攤開。","tangled 描述鏈子纏結，不等於扣好、遺失墜子或褪色。"),
  mc("native-428-v2-branch","branch","項鍊鏈子打了細結，你怕用力拉會斷。哪句適合請朋友幫忙？",["My necklace is tangled. Can you help me untangle it?", "My necklace is tangled. Please pull both ends as hard as you can.", "My necklace is missing. Can you fasten it?", "My necklace is new. Can you return it for me?"],"My necklace is tangled. Can you help me untangle it?","先說狀態，再用 untangle 請求解開；細鏈不宜用力拉。"),
  mc("native-428-v2-transfer","transfer","耳機線在袋裏繞成一團。哪句使用 tangled 最準確？",["My earphone cable is tangled.", "My earphone cable is expired.", "My earphone cable is inside out.", "My earphone cable is bent open."],"My earphone cable is tangled.","tangled 也可形容線材互相繞住；詞義不限於項鍊。"),
  {id:"native-428-v2-final",type:'open',style:"final",prompt:"新情境：出門前你的細項鍊打了結，自己試了幾分鐘仍解不開。寫一兩句英文向室友說明問題，並請他輕手幫忙。",answers:["My necklace is tangled. Could you help me untangle it gently?", "There’s a knot in my necklace chain. Can you help me work it loose?", "I can’t untangle my necklace. Could you give me a hand without pulling hard?"],explanation:"說清項鍊打結，並用 help me untangle it 等自然請求；輕手處理細鏈。"}
];

const steps=[
  {"id": "native-428-v2-audio", "style": "audio", "label": "先聽狀態", "title": "鏈子怎麼了？", "intro": "先聽句子，再辨認問題。", "model": "My necklace is tangled.", "zh": "我的項鍊纏在一起了。", "audioOnly": true, "questions": ["native-428-v2-audio"]},
  {"id": "native-428-v2-branch", "style": "branch", "label": "請求幫忙", "title": "怕拉斷鏈子", "intro": "選自然的求助方式。", "questions": ["native-428-v2-branch"]},
  {"id": "native-428-v2-transfer", "style": "transfer", "label": "另一條鏈子", "title": "耳機線同樣纏結", "intro": "把字義轉用到新物件。", "questions": ["native-428-v2-transfer"]},
  {"id": "native-428-v2-speak", "style": "speak", "label": "口頭求助", "title": "先說問題", "intro": "在「先說問題」情境先開口，然後聽錄音核對。", "model": "My necklace is tangled.", "zh": "我的項鍊纏在一起了。", "speakingPrompt": "你從首飾盒拿出纏成一團的項鍊；向朋友口說「我的項鍊纏在一起了」。", "recording": "phrase", "questions": []},
  {"id": "native-428-v2-final", "style": "final", "label": "新首飾自評", "title": "出門前的小結", "intro": "自己寫困難和請求。", "questions": ["native-428-v2-final"]}
];

export default {revision:2,summary:"用 My necklace is tangled. 描述項鍊鏈子纏結，並禮貌請人協助解開。",steps,questions,takeaways:["My necklace is tangled.", "Can you untangle it?"],completionTitle:"你能描述鏈子打結的狀態，並提出清楚的協助請求。"};

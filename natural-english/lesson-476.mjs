import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-476-v2-audio","audio","飯店窗簾最可能怎樣？",["兩片拉到盡頭，中央仍留一道縫。", "窗簾完全拉合，房間已變暗。", "窗簾已從軌道整幅掉下。", "窗簾布料髒了，但開合順暢。"],"兩片拉到盡頭，中央仍留一道縫。","won’t close all the way 指不能完全合上，仍留空隙；不等於整幅脫落。"),
  mc("native-476-v2-detail","detail","你把飯店窗簾拉到右端，但滑輪卡在離牆十厘米處，早晨陽光透入。哪句最精確？",["The curtains won’t close all the way.", "The curtains are too thin to block light.", "The curtains won’t open at all.", "The window glass has cracked."],"The curtains won’t close all the way.","滑輪卡住使窗簾不能拉到終點；若只是布薄，關密後仍會透光。"),
  mc("native-476-v2-branch","branch","你想睡覺，但窗簾留縫，走廊燈照進房內。向前台怎樣說最有用？",["The curtains won’t close all the way, so light is coming in. Could someone check the track?", "The room has light; could you change the lobby music?", "The curtains are closed tightly, but please replace them anyway.", "The window is broken, although the glass looks fine."],"The curtains won’t close all the way, so light is coming in. Could someone check the track?","說明未關密、造成光線透入，再請人檢查軌道，方便前台處理。"),
  {id:"native-476-v2-final",type:'open',style:"final",prompt:"新情境：你住的飯店房間窗簾左邊卡住，清晨日光會照到床上。寫一兩句英文向前台說明窗簾不能完全合上，並請他們安排檢查。",answers:["The curtains won’t close all the way on the left, and morning light comes in. Could someone check them?", "I can’t close the curtains all the way. Could maintenance look at the track?", "The left curtain gets stuck before it reaches the wall. Could you have it fixed?"],explanation:"要指出窗簾卡在左邊、留縫透光，再提出檢查或維修請求。"}
];

const steps=[
  {"id": "native-476-v2-audio", "style": "audio", "label": "先聽程度", "title": "還留着縫嗎？", "intro": "先聽句子，留意 all the way 對關閉程度的限制。", "model": "The curtains won’t close all the way.", "zh": "窗簾怎樣也關不密。", "audioOnly": true, "questions": ["native-476-v2-audio"]},
  {"id": "native-476-v2-detail", "style": "detail", "label": "找阻礙位置", "title": "軌道右端卡住", "intro": "比較窗簾開合與遮光問題。", "questions": ["native-476-v2-detail"]},
  {"id": "native-476-v2-branch", "style": "branch", "label": "向前台反映", "title": "交代影響", "intro": "選能讓職員採取行動的說法。", "questions": ["native-476-v2-branch"]},
  {"id": "native-476-v2-speak", "style": "speak", "label": "口頭報修", "title": "窗簾仍留縫", "intro": "想像兩片窗簾間的縫，先向職員說，再聽錄音。", "model": "The curtains won’t close all the way.", "zh": "窗簾怎樣也關不密。", "speakingPrompt": "飯店窗簾拉到底仍有空隙；向職員口說「窗簾怎樣也關不密」。", "recording": "phrase", "questions": []},
  {"id": "native-476-v2-final", "style": "final", "label": "新房間自評", "title": "清晨的窗邊", "intro": "獨立寫出問題和合理請求。", "questions": ["native-476-v2-final"]}
];

export default {revision:2,summary:"用 The curtains won’t close all the way. 描述飯店窗簾拉到盡頭仍留縫，並向職員說明影響。",steps,questions,takeaways:["The curtains won’t close all the way.", "The door won’t close all the way."],completionTitle:"你能說明窗簾未能完全合上，並提出具體維修請求。"};

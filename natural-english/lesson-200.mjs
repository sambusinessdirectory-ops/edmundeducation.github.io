import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-200-v2-audio","audio","聽到這句，哪個部位最不舒服？",["腳趾。", "腳掌。", "腳後跟。", "鞋後跟。"],"腳趾。","pinch my toes 指鞋頭擠壓腳趾。"),
  mc("native-200-v2-detail","detail","哪個試鞋觀察最支持說 The shoes pinch my toes？",["長度剛好，但鞋頭擠住腳趾。", "腳後跟一直滑出鞋子。", "鞋底已經磨平。", "鞋帶鬆了。"],"長度剛好，但鞋頭擠住腳趾。","pinch toes 的重點是腳趾被夾，不一定是鞋整體太短。"),
  mc("native-200-v2-branch","branch","你說 These shoes pinch my toes，並指出鞋頭兩側太窄、腳長卻合適。店員最合理的建議是甚麼？",["Let’s try a wider pair.", "Let’s loosen the laces first.", "Let’s try a longer but equally narrow pair.", "Let’s try a different insole."],"Let’s try a wider pair.","鞋頭夾腳趾通常需要較寬的鞋楦或尺碼；鞋長可以合適，但鞋頭太窄仍會夾腳趾，試較寬鞋款才對症。"),
  mc("native-200-v2-repair","repair","鞋頭太窄夾腳趾，但你說 My heels keep slipping out. 應改成哪句？",["The shoes pinch my toes.", "The sole is worn out.", "My shoes squeak.", "The laces are loose."],"The shoes pinch my toes.","pinch my toes 才對應鞋頭壓腳趾；slipping out 是後跟滑出。"),
  {id:"native-200-v2-final",type:'open',style:"final",prompt:"新的情境：你試穿一雙跑鞋，鞋頭夾腳趾但鞋長合適。寫一兩句英文告訴店員問題，並請他拿較寬的一雙。",answers:["These shoes pinch my toes. Do you have a wider pair?", "The length is fine, but they pinch my toes. Could I try a wider fit?", "My toes feel pinched in these shoes. Can I try a wider size?"],explanation:"先指出 toes 被夾，再要求 wider pair；能避免店員只拿更長的鞋。"}
];

const steps=[
  {"id": "native-200-v2-audio", "style": "audio", "label": "聽出痛點", "title": "鞋哪裏不合？", "intro": "先聽完整句，再回答「鞋哪裏不合？」。", "model": "The shoes pinch my toes.", "zh": "鞋子夾我的腳趾。", "audioOnly": true, "questions": ["native-200-v2-audio"]},
  {"id": "native-200-v2-detail", "style": "detail", "label": "抓試鞋細節", "title": "長度好但前面窄", "intro": "分辨長度和寬度。", "questions": ["native-200-v2-detail"]},
  {"id": "native-200-v2-branch", "style": "branch", "label": "試鞋對話", "title": "下一步試哪雙？", "intro": "選有助解決問題的回應。", "questions": ["native-200-v2-branch"]},
  {"id": "native-200-v2-repair", "style": "repair", "label": "修正描述", "title": "不是後跟滑出", "intro": "把部位說準。", "questions": ["native-200-v2-repair"]},
  {"id": "native-200-v2-speak", "style": "speak", "label": "口頭回報", "title": "告訴店員哪裏不合", "intro": "先試着說出「鞋子夾我的腳趾。」，再聽示範。", "model": "The shoes pinch my toes.", "zh": "鞋子夾我的腳趾。", "speakingPrompt": "試穿新鞋，長度合適但鞋頭夾腳趾；口頭告訴店員。", "recording": "phrase", "questions": []},
  {"id": "native-200-v2-final", "style": "final", "label": "新鞋款自寫", "title": "請求寬版", "intro": "自己寫，再對照例句自評。", "questions": ["native-200-v2-final"]}
];

export default {revision:2,summary:"用 pinch my toes 描述鞋頭太窄夾腳趾，並與長度問題區分。",steps,questions,takeaways:["The shoes pinch my toes.", "These shoes pinch my toes."],completionTitle:"你能試鞋時指出鞋頭夾腳趾，並請求更寬尺寸。"};

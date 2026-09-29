import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-483-v2-audio","audio","哪個情況最貼近？",["爐頭附近久未徹底清潔，逐漸積成黏油層。", "剛滴下一小點新油，立即擦掉。", "表面完全乾爽，只是有灰塵。", "抽油煙機電源線鬆了。"],"爐頭附近久未徹底清潔，逐漸積成黏油層。","buildup 強調經一段時間積聚，grease 指油膩物；不是剛滴落又擦掉的一點油。"),
  mc("native-483-v2-contrast","contrast","抽油煙機底面摸起來黏，已有一層舊油；灶台上是剛濺的一滴油。哪個描述對應抽油煙機？",["There’s grease buildup on the range hood.", "There’s one fresh oil drop on the hood.", "The hood has a dry water mark.", "The hood is covered only in dust."],"There’s grease buildup on the range hood.","舊油逐漸成層才是 grease buildup；單滴新油的時間與範圍不同。"),
  mc("native-483-v2-rewrite","rewrite","室友說 The range hood feels sticky，你看到罩底長期累積油層。怎樣改寫較具體？",["There’s a lot of grease buildup on the range hood.", "The range hood is sticky because it’s still wet with water.", "The range hood has a loose screw but no dirt.", "The range hood is fogged up after a shower."],"There’s a lot of grease buildup on the range hood.","grease buildup 說明黏感來源是積油，on the range hood 指出要清理的位置。"),
  {id:"native-483-v2-final",type:'open',style:"final",prompt:"新情境：爐頭後牆面多年來積了一層黏油污，平日抹一下去不掉。寫一兩句英文向家人說明問題，並提出一次徹底清潔。",answers:["There’s grease buildup on the wall behind the stove. We should give it a thorough clean.", "The wall behind the stove has a lot of grease buildup, so let’s clean it properly this weekend.", "Grease has built up behind the stove. We’ll need to clean more than the surface."],explanation:"要交代是長期累積的油垢、指出爐後牆面，並提出徹底清潔。"}
];

const steps=[
  {"id": "native-483-v2-audio", "style": "audio", "label": "先聽時間感", "title": "油垢怎樣形成？", "intro": "先聽句子，留意 buildup 暗示逐漸累積。", "model": "There’s grease buildup.", "zh": "這裏積了一層油垢。", "audioOnly": true, "questions": ["native-483-v2-audio"]},
  {"id": "native-483-v2-contrast", "style": "contrast", "label": "積油與新濺油", "title": "清潔範圍不同", "intro": "比較時間與厚度。", "questions": ["native-483-v2-contrast"]},
  {"id": "native-483-v2-rewrite", "style": "rewrite", "label": "向室友說清", "title": "不只說 sticky", "intro": "加入污垢種類和位置。", "questions": ["native-483-v2-rewrite"]},
  {"id": "native-483-v2-speak", "style": "speak", "label": "口頭描述", "title": "抽油煙機積油", "intro": "想到罩底那層舊油，先說再比對錄音。", "model": "There’s a lot of grease buildup on the range hood.", "zh": "抽油煙機上積了很多油垢。", "speakingPrompt": "抽油煙機罩底積了一層厚油垢；向室友口說「抽油煙機上積了很多油垢」。", "recording": "phrase", "questions": []},
  {"id": "native-483-v2-final", "style": "final", "label": "新廚房自評", "title": "爐後牆面", "intro": "自己寫積油位置與清潔安排。", "questions": ["native-483-v2-final"]}
];

export default {revision:2,summary:"用 There’s grease buildup. 描述廚房表面長時間累積的油膩污垢，而非一次新濺出的油點。",steps,questions,takeaways:["There’s grease buildup.", "There’s a lot of grease buildup on the range hood."],completionTitle:"你能辨認長期積聚的油垢，並安排有針對性的清潔。"};

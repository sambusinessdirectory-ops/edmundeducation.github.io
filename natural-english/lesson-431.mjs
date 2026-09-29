import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-431-v2-audio","audio","布朗尼被形容 gooey，最可能是甚麼口感？",["中心濕潤黏軟。", "整塊乾到一碰就碎。", "蛋糕體非常輕盈蓬鬆。", "表面像冰一樣硬。"],"中心濕潤黏軟。","gooey 指柔軟、黏稠或濕潤的質地；布朗尼中心常可以是這樣。"),
  mc("native-431-v2-contrast","contrast","布朗尼中心柔軟濕潤，但外沿已熟、切片能成形。哪個回應較合理？",["It’s gooey; that may be the intended texture.", "It must be raw because any moisture means failure.", "It’s crumbly because the centre is soft.", "It’s fluffy like a sponge cake."],"It’s gooey; that may be the intended texture.","gooey 描述黏軟質地，本身不證明未熟；外沿和成形狀態可幫助判斷。"),
  mc("native-431-v2-tone","tone","你試吃朋友做的布朗尼，中心比預期更黏軟，但不知是否刻意。哪句較得體？",["Is it supposed to be this gooey?", "You clearly forgot to bake it.", "This is definitely unsafe to eat.", "Why did you make it dry and crumbly?"],"Is it supposed to be this gooey?","問 is it supposed to be 表達對預期質地的疑問，沒有在未了解食譜前指責。"),
  mc("native-431-v2-rewrite","rewrite","你說 The centre feels weird；真正意思是中心柔軟、略黏。怎樣改寫較具體？",["The centre is gooey.", "The centre is crisp and dry.", "The centre is airy and fluffy.", "The centre is missing."],"The centre is gooey.","gooey 精確指出柔軟略黏的口感，比 weird 更方便對方理解。"),
  {id:"native-431-v2-final",type:'open',style:"final",prompt:"新情境：朋友的巧克力杯蛋糕中心濕潤黏軟，你以前沒吃過這款。寫一兩句英文描述口感，並禮貌問這是否預期的做法。",answers:["The centre is gooey. Is it supposed to be this soft?", "It’s quite gooey in the middle. Is that the texture you were aiming for?", "The middle feels moist and gooey. Is it meant to be like that?"],explanation:"先客觀描述黏軟中心，再用問句確認是否符合食譜預期。"}
];

const steps=[
  {"id": "native-431-v2-audio", "style": "audio", "label": "先聽中心", "title": "切開後怎樣？", "intro": "先聽句子，再想像口感。", "model": "It's gooey.", "zh": "它裏面黏軟濕潤。", "audioOnly": true, "questions": ["native-431-v2-audio"]},
  {"id": "native-431-v2-contrast", "style": "contrast", "label": "區分未熟", "title": "濕潤還是生麵糊", "intro": "根據其他線索審慎判斷。", "questions": ["native-431-v2-contrast"]},
  {"id": "native-431-v2-tone", "style": "tone", "label": "向烘焙者確認", "title": "不先下結論", "intro": "把疑問說得自然。", "questions": ["native-431-v2-tone"]},
  {"id": "native-431-v2-rewrite", "style": "rewrite", "label": "具體評語", "title": "把 weird 說清楚", "intro": "描述可觀察的質地。", "questions": ["native-431-v2-rewrite"]},
  {"id": "native-431-v2-speak", "style": "speak", "label": "口頭提問", "title": "確認質地", "intro": "在「確認質地」情境先開口，然後聽錄音核對。", "model": "Is it supposed to be this gooey?", "zh": "它本來就應該這麼黏軟嗎？", "speakingPrompt": "你不確定布朗尼中心是否應該這麼黏軟；向烘焙者口說「它本來就應該這麼黏軟嗎？」", "recording": "phrase", "questions": []},
  {"id": "native-431-v2-final", "style": "final", "label": "新甜點自評", "title": "巧克力杯蛋糕", "intro": "自己寫觀察和溫和詢問。", "questions": ["native-431-v2-final"]}
];

export default {revision:2,summary:"用 It's gooey. 描述布朗尼中心濕潤黏軟，並在不確定熟度時問是否正常。",steps,questions,takeaways:["It's gooey.", "Is it supposed to be this gooey?"],completionTitle:"你能描述布朗尼質地，並向烘焙者確認是否符合預期。"};

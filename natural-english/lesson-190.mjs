import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-190-v2-audio","audio","聽到這句，最可能需要檢查鞋的哪一部分？",["鞋底。", "鞋帶。", "鞋內接觸腳底的鞋墊。", "鞋內標籤。"],"鞋底。","sole 是鞋底；這句說它已經 worn out，磨損嚴重。"),
  mc("native-190-v2-branch","branch","朋友問 Why are you replacing those shoes? 鞋底已磨得很薄。哪句回答最準確？",["The soles are worn out.", "The heels keep slipping out.", "The shoes pinch my toes.", "The uppers are badly stained."],"The soles are worn out.","worn out 指長期使用後磨損嚴重；複數 soles 指兩隻鞋底。"),
  mc("native-190-v2-detail","detail","哪個觀察最能證明 The sole is worn out？",["鞋底磨得幾乎沒有紋路，而且很薄。", "鞋面仍完好，但有一道淺痕。", "鞋墊剛換新，腳感仍舒服。", "鞋底紋路仍深，只有鞋帶磨損。"],"鞋底磨得幾乎沒有紋路，而且很薄。","worn out 指經長期使用而嚴重耗損；灰塵不等於磨壞。"),
  mc("native-190-v2-explain","explain","句中 The sole is worn out. 的 sole 指甚麼？",["鞋底。", "鞋帶。", "鞋跟上方的鞋面。", "鞋內接觸腳底的鞋墊。"],"鞋底。","sole 是鞋的底部；worn out 描述這部分已被磨得很舊。"),
  {id:"native-190-v2-final",type:'open',style:"final",prompt:"新的情境：你常跑步的鞋底紋路幾乎磨平，打算買新鞋。寫一兩句英文，告訴朋友鞋底的狀況和你的決定。",answers:["The soles are worn out, so I need new running shoes.", "My running shoes have worn-out soles. I’m going to replace them.", "The soles are nearly worn out. I think I need a new pair."],explanation:"用 soles are worn out 描述鞋底磨損，再說明需要換一雙。"}
];

const steps=[
  {"id": "native-190-v2-audio", "style": "audio", "label": "先聽狀態", "title": "是甚麼磨壞？", "intro": "只聽句子，再判斷部位。", "model": "The sole is worn out.", "zh": "鞋底已磨壞。", "audioOnly": true, "questions": ["native-190-v2-audio"]},
  {"id": "native-190-v2-branch", "style": "branch", "label": "下一句怎樣接", "title": "為何要換鞋？", "intro": "從對話中的鞋底問題選回應。", "questions": ["native-190-v2-branch"]},
  {"id": "native-190-v2-detail", "style": "detail", "label": "看磨損程度", "title": "不是一點灰塵", "intro": "找最能支持 worn out 的細節。", "questions": ["native-190-v2-detail"]},
  {"id": "native-190-v2-explain", "style": "explain", "label": "說明用詞", "title": "sole 是哪部分？", "intro": "把單字連回具體部位。", "questions": ["native-190-v2-explain"]},
  {"id": "native-190-v2-final", "style": "final", "label": "自寫換鞋原因", "title": "新一雙跑鞋", "intro": "先寫自己的說法，再按示例自評。", "questions": ["native-190-v2-final"]}
];

export default {revision:2,summary:"用 worn out 描述鞋底長期磨損到不能再好好穿，並分清局部與整雙鞋。",steps,questions,takeaways:["The sole is worn out.", "The soles are worn out."],completionTitle:"你能觀察鞋底磨損，並向人說明換鞋原因。"};

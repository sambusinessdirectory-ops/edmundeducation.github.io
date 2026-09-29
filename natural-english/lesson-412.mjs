import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-412-v2-audio","audio","聽到這句，瓶蓋最可能呈現甚麼？",["一側高一側低，越旋越卡。", "平整旋緊，只是很難再打開。", "鬆鬆放在瓶口，尚未旋。", "蓋子已完全拿掉。"],"一側高一側低，越旋越卡。","cross-threaded 是螺紋錯位咬住，蓋子常會歪斜；overtightened 則可能平整但太緊。"),
  mc("native-412-v2-scene","scene","哪項細節最支持 The cap is cross-threaded，而不是 overtightened？",["剛開始旋就歪斜，一邊蓋緣高一邊低。", "蓋子平整到底，但轉開很費力。", "蓋子沒碰到瓶口，仍拿在手上。", "蓋子旋到位後能輕鬆開合。"],"剛開始旋就歪斜，一邊蓋緣高一邊低。","旋歪從開始就能看出角度異常；單純過緊通常仍沿正確螺紋平整旋入。"),
  mc("native-412-v2-transfer","transfer","螺絲斜着進孔，越轉越卡；要說故障而非硬轉，哪句合適？",["The screw is cross-threaded.", "The screw is overtightened but straight.", "The screw hole is too large.", "The screw has already fallen out."],"The screw is cross-threaded.","螺絲也有螺紋；斜着咬住就是 cross-threaded。"),
  mc("native-412-v2-tone","tone","朋友蓋子越旋越歪。哪句提醒最有幫助？",["It may be cross-threaded. Let’s take it off and start again.", "You’re too weak; turn it harder.", "The cap is straight, so force it down.", "It’s already sealed; ignore the gap."],"It may be cross-threaded. Let’s take it off and start again.","先指出可能的螺紋錯位，再建議退下重旋，避免硬轉損壞螺紋。"),
  {id:"native-412-v2-final",type:'open',style:"final",prompt:"新的情境：保溫杯蓋一開始就斜着咬住螺紋，現在越旋越緊但蓋不平。寫一兩句英文告訴朋友問題與你的下一步。",answers:["The cap is cross-threaded. I’ll take it off and start again.", "It went on crooked, so I think it’s cross-threaded. Let me unscrew it first.", "The lid looks cross-threaded; I shouldn’t force it. I’ll realign it."],explanation:"cross-threaded 說明螺紋旋歪；先退下再對正，比硬轉更合適。"}
];

const steps=[
  {"id": "native-412-v2-audio", "style": "audio", "label": "先聽蓋子", "title": "為何旋不上？", "intro": "先聽句子，再想像瓶蓋位置。", "model": "The cap is cross-threaded.", "zh": "瓶蓋的螺紋旋歪了。", "audioOnly": true, "questions": ["native-412-v2-audio"]},
  {"id": "native-412-v2-scene", "style": "scene", "label": "從外觀判斷", "title": "先退回再旋", "intro": "選符合故障的觀察。", "questions": ["native-412-v2-scene"]},
  {"id": "native-412-v2-transfer", "style": "transfer", "label": "換到螺絲", "title": "同一螺紋問題", "intro": "把詞用在另一物件。", "questions": ["native-412-v2-transfer"]},
  {"id": "native-412-v2-tone", "style": "tone", "label": "協助時的語氣", "title": "別怪對方用力小", "intro": "提出具體而合作的做法。", "questions": ["native-412-v2-tone"]},
  {"id": "native-412-v2-final", "style": "final", "label": "新容器自評", "title": "保溫杯蓋旋歪", "intro": "自己寫觀察和處理，再看示例。", "questions": ["native-412-v2-final"]}
];

export default {revision:2,summary:"用 cross-threaded 描述瓶蓋一開始旋歪、螺紋咬錯，並轉用於螺絲。",steps,questions,takeaways:["The cap is cross-threaded.", "The screw is cross-threaded."],completionTitle:"你能區分螺紋咬歪與單純太緊，並知道先退回重旋。"};

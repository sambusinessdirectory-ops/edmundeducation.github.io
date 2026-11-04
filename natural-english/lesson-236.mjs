import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-236-v2-audio","audio","聽到這句，最可能是哪種情況？",["襪子在鞋裏擠皺成一團。", "襪子在鞋裏往下滑到腳跟。", "襪子仍平整，但鞋頭太窄。", "襪子因汗水貼在腳上。"],"襪子在鞋裏擠皺成一團。","bunching up 是布料聚攏成一團，令腳底或腳趾不舒服。"),
  mc("native-236-v2-repair","repair","鞋本身尺碼合適，只是襪子在腳趾前皺成一團。哪句更準確？",["My socks are bunching up.", "My shoes pinch my toes.", "My heels keep slipping out.", "The sole is worn out."],"My socks are bunching up.","鞋本身合腳，真正聚在腳趾前的是襪子；bunching up 比鞋頭太窄或後跟滑出更準確。"),
  mc("native-236-v2-transfer","transfer","睡覺時床單在身下皺成一團，哪句可沿用？",["The sheets are bunching up.", "The sheets are shedding.", "The sheets are scratchy.", "The sheets are riding up."],"The sheets are bunching up.","床單也能在某處堆皺成團，所以可說 bunching up。"),
  mc("native-236-v2-explain","explain","襪子在鞋內摺成一坨，T-shirt 下擺往腰上縮。哪組用詞正確？",["襪子 bunch up；T-shirt rides up。", "襪子 ride up；T-shirt bunches up。", "兩者都只表示衣服太小。", "兩者都只表示衣服太鬆。"],"襪子 bunch up；T-shirt rides up。","bunch up 強調聚成團；ride up 強調衣物向上移。"),
  {id:"native-236-v2-final",type:'open',style:"final",prompt:"新的情境：跑步到一半，襪子在兩隻鞋的腳趾位置都皺成團，磨得你不舒服。寫一兩句英文告訴同伴問題和你要停下來整理。",answers:["My socks are bunching up near my toes. I need to stop and fix them.", "The socks keep bunching up in my shoes, so let me adjust them.", "My socks are bunching up and rubbing my toes. I’ll stop for a moment."],explanation:"bunching up 說明襪子聚成團，補上位置和需要整理的行動。"}
];

const steps=[
  {"id": "native-236-v2-audio", "style": "audio", "label": "先聽襪子", "title": "鞋內有甚麼感覺？", "intro": "先聽句子，再判斷布料狀態。", "model": "My socks are bunching up.", "zh": "襪子在鞋內皺成一團。", "audioOnly": true, "questions": ["native-236-v2-audio"]},
  {"id": "native-236-v2-repair", "style": "repair", "label": "修正原因", "title": "不是鞋子太緊", "intro": "把鞋內問題說準。", "questions": ["native-236-v2-repair"]},
  {"id": "native-236-v2-transfer", "style": "transfer", "label": "轉到床單", "title": "布料也會聚成團", "intro": "把 bunch up 用於另一物件。", "questions": ["native-236-v2-transfer"]},
  {"id": "native-236-v2-explain", "style": "explain", "label": "辨認形狀", "title": "與 ride up 不同", "intro": "比較兩種布料移動。", "questions": ["native-236-v2-explain"]},
  {"id": "native-236-v2-speak", "style": "speak", "label": "口頭反映", "title": "走路不舒服", "intro": "先說出襪子擠皺成團，再聽示範。", "model": "My socks are bunching up.", "zh": "我的襪子皺成一團。", "speakingPrompt": "襪子在鞋裏不停皺起；口頭說「我的襪子在鞋裏皺成一團」。", "recording": "phrase", "questions": []},
  {"id": "native-236-v2-final", "style": "final", "label": "新運動自寫", "title": "跑步中停下", "intro": "自己寫不適和處理，再看示例。", "questions": ["native-236-v2-final"]}
];

export default {revision:2,summary:"用 bunching up 描述襪子在鞋內擠成一團，並能用於床單皺在一起。",steps,questions,takeaways:["My socks are bunching up.", "The sheets are bunching up."],completionTitle:"你能描述襪子皺成一團的不適，並轉用於其他布料。"};

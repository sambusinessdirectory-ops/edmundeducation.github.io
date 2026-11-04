import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-546-v2-audio","audio","這句最可能表示甚麼？",["袋口看似壓上，但封條有一段仍未密合。", "袋子完全沒有封口設計。", "袋子已經完全密封且不漏。", "袋子的底部整個裂開。"],"袋口看似壓上，但封條有一段仍未密合。","won’t close properly 重點是封條無法妥善密合，不等於整袋不存在或底部破裂。"),
  mc("native-546-v2-reverse","reverse","你看到朋友把食物放進夾鏈袋，但未確定封口是否壓好。哪句可自然確認？",["Did you close the bag?", "Did you clog the bag?", "Did you retract the bag?", "Did you yellow the bag?"],"Did you close the bag?","close the bag 是確認袋口是否已關上；其他動詞不描述這個動作。"),
  mc("native-546-v2-repair","repair","你壓過封條三次，但一角又彈開。有人說 You forgot to close it。哪句釐清最準確？",["I tried, but the seal won’t close properly.", "I forgot to press the seal at all.", "The bag is sealed tightly now.", "The bag has no food inside."],"I tried, but the seal won’t close properly.","句子保留你已嘗試的事實，指出封條本身無法密合，而非忘記操作。"),
  mc("native-546-v2-transfer","transfer","夾鏈袋封口壓好後仍有空隙。哪個檢查最直接？",["看看封條凹槽有沒有碎屑或變形。", "查看袋子標籤印了甚麼顏色。", "把袋子放在更高的架子上。", "只量食物的重量而不看封口。"],"看看封條凹槽有沒有碎屑或變形。","碎屑或變形可能妨礙封條咬合，比查看標籤更能找出封不牢原因。"),
  {id:"native-546-v2-final",type:'open',style:"final",prompt:"新情境：冷凍水果放進夾鏈袋後，封口有一段無法壓牢，擔心放進冰箱會漏出。寫一兩句英文說明問題，並提出換袋或其他處理。",answers:["The seal won’t close properly, so I’ll put the fruit in a different bag.", "This bag won’t seal all the way. I’ll transfer the frozen fruit to another one.", "The seal keeps opening at one end. Let’s use a new bag before freezing it."],explanation:"說清是封條局部不能密合，並提出換袋以免內容物漏出。"}
];

const steps=[
  {"id": "native-546-v2-audio", "style": "audio", "label": "先聽封口", "title": "袋子合緊了嗎？", "intro": "先聽，留意 properly 對關閉程度的限制。", "model": "The seal won’t close properly.", "zh": "封口怎樣也封不緊。", "audioOnly": true, "questions": ["native-546-v2-audio"]},
  {"id": "native-546-v2-reverse", "style": "reverse", "label": "問袋口狀態", "title": "確認有否關上", "intro": "從問題轉向檢查動作。", "questions": ["native-546-v2-reverse"]},
  {"id": "native-546-v2-repair", "style": "repair", "label": "說清故障", "title": "不是忘記壓", "intro": "修正容易誤解的說法。", "questions": ["native-546-v2-repair"]},
  {"id": "native-546-v2-transfer", "style": "transfer", "label": "找漏氣原因", "title": "檢查邊緣", "intro": "從封不牢推導下一步。", "questions": ["native-546-v2-transfer"]},
  {"id": "native-546-v2-speak", "style": "speak", "label": "口頭報告", "title": "對家人說明", "intro": "看着彈開的封條，先開口再比對示範。", "model": "The seal won’t close properly.", "zh": "封口怎樣也封不緊。", "speakingPrompt": "夾鏈袋一角一直彈開；向家人口說「封口怎樣也封不緊」。", "recording": "phrase", "questions": []},
  {"id": "native-546-v2-final", "style": "final", "label": "新食物自評", "title": "冷凍水果袋", "intro": "自己寫封口問題與處理方式。", "questions": ["native-546-v2-final"]}
];

export default {revision:2,summary:"用 The seal won’t close properly. 描述夾鏈袋封口對不齊或壓不牢，與整個袋子無法合上區分。",steps,questions,takeaways:["The seal won’t close properly.", "Did you close the bag?"],completionTitle:"你能指出夾鏈袋封口未密合，並決定是否換袋。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-435-v2-audio","audio","這句最可能指甚麼？",["腹部有脹滿不舒服的感覺。", "肚子很餓，想再吃一餐。", "喉嚨乾，需要喝水。", "腳踝因扭傷腫起。"],"腹部有脹滿不舒服的感覺。","bloated 在吃飯後常描述腹部脹滿感，並不是單純的餓或口渴。"),
  mc("native-435-v2-explain","explain","朋友只說 I'm bloated. 你能確定甚麼？",["他覺得腹脹，但原因仍需另問。", "他一定吃壞肚子。", "他必定對牛奶過敏。", "他已決定去看醫生。"],"他覺得腹脹，但原因仍需另問。","句子只報告腹脹感，不足以判斷特定原因或他下一步的決定。"),
  mc("native-435-v2-tone","tone","朋友請你吃第二份甜點，你已經腹脹。哪句最自然？",["Thanks, but I feel really bloated. I’ll pass for now.", "Your dessert made me ill, so take it away.", "I’m bloated, which proves your cooking is bad.", "I’ll take three more, although I can’t eat any."],"Thanks, but I feel really bloated. I’ll pass for now.","先道謝，再說自己的感受和暫時不吃，避免把腹脹直接歸咎於朋友。"),
  mc("native-435-v2-repair","repair","你不只是吃飽，還有腹部脹得難受。哪句比 I’m full 更準確？",["I feel really bloated.", "I’m still very hungry.", "I feel very sleepy.", "I’m having dessert."],"I feel really bloated.","full 只是飽；bloated 進一步表達腹部脹滿和不舒服。"),
  {id:"native-435-v2-final",type:'open',style:"final",prompt:"新情境：聚餐後你覺得腹脹，朋友提議立刻再去吃宵夜。寫一兩句英文說明感受，並禮貌提出另一個安排。",answers:["I’m bloated after dinner, so I’ll skip the late snack. Could we take a short walk instead?", "I feel really bloated. Let’s sit for a while rather than get more food.", "Thanks, but I’m bloated and can’t eat more. Maybe we can go for a walk."],explanation:"要說明腹脹感，再提出暫緩進食、散步或休息等具體替代安排。"}
];

const steps=[
  {"id": "native-435-v2-audio", "style": "audio", "label": "先聽感受", "title": "吃飽後怎樣？", "intro": "先聽句子，再判斷身體感受。", "model": "I'm bloated.", "zh": "我覺得肚子脹。", "audioOnly": true, "questions": ["native-435-v2-audio"]},
  {"id": "native-435-v2-explain", "style": "explain", "label": "感受與原因", "title": "不要過度推斷", "intro": "理解句子未說出的部分。", "questions": ["native-435-v2-explain"]},
  {"id": "native-435-v2-tone", "style": "tone", "label": "婉拒甜點", "title": "吃不下了", "intro": "表達感受又不失禮。", "questions": ["native-435-v2-tone"]},
  {"id": "native-435-v2-repair", "style": "repair", "label": "更準確表達", "title": "不是只說 full", "intro": "用詞突出不適感。", "questions": ["native-435-v2-repair"]},
  {"id": "native-435-v2-speak", "style": "speak", "label": "口頭說明", "title": "告訴同伴", "intro": "在「告訴同伴」情境先開口，然後聽錄音核對。", "model": "I feel really bloated.", "zh": "我覺得肚子很脹。", "speakingPrompt": "你吃完大餐覺得腹部脹滿不舒服；向同伴口說「我覺得肚子很脹」。", "recording": "phrase", "questions": []},
  {"id": "native-435-v2-final", "style": "final", "label": "新聚餐自評", "title": "飯後改計劃", "intro": "自己寫感受和選擇。", "questions": ["native-435-v2-final"]}
];

export default {revision:2,summary:"用 I'm bloated. 描述吃太飽後腹部脹滿不舒服，並禮貌調整晚餐安排。",steps,questions,takeaways:["I'm bloated.", "I feel really bloated."],completionTitle:"你能表達腹脹感，並提出適合自己的下一步。"};

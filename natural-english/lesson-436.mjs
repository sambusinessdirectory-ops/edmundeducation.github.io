import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-436-v2-audio","audio","這句更著重哪種感受？",["肚子多氣，可能想打嗝或放屁。", "純粹吃太飽而沒有氣。", "胃口很好，想加菜。", "腿部肌肉因運動痠痛。"],"肚子多氣，可能想打嗝或放屁。","gassy 聚焦腸胃裏的氣，可能伴隨打嗝或排氣；bloated 更重脹滿感。"),
  mc("native-436-v2-reverse","reverse","朋友說胃裏很多氣、一直想打嗝。哪句最直接對應？",["I’m gassy.", "I’m hungry.", "I’m dizzy.", "I’m sleepy."],"I’m gassy.","氣多和打嗝直接對應 gassy；其他選項說的是不同身體感受。"),
  mc("native-436-v2-continue","continue","你每次喝同一款汽水後都覺得多氣。朋友再遞給你一罐，哪句回應較自然？",["Thanks, but that drink makes me gassy. I’ll have water.", "Thanks, but that drink makes my watch crack.", "Yes, give me two more even though I feel unwell.", "No, because the bottle is too fluffy."],"Thanks, but that drink makes me gassy. I’ll have water.","說明汽水令自己多氣，再選水作替代，直接回應朋友的提議。"),
  {id:"native-436-v2-branch",type:'open',style:"branch",prompt:"新情境：午餐後你一直想打嗝，朋友問要不要再喝一杯汽水。寫一兩句英文說明身體感受，並提出較適合的飲品。",answers:["I’m gassy after lunch, so I’ll skip the soda and have water.", "I feel gassy and keep burping. Could I have some water instead?", "That lunch made me gassy. I’d rather have tea than another soda."],explanation:"用 gassy 說明氣多，再婉拒汽水並提出水或茶等替代。"}
];

const steps=[
  {"id": "native-436-v2-audio", "style": "audio", "label": "先聽身體感受", "title": "是哪一種不舒服？", "intro": "先聽句子，再辨別重點。", "model": "I’m gassy.", "zh": "我肚子很多氣。", "audioOnly": true, "questions": ["native-436-v2-audio"]},
  {"id": "native-436-v2-reverse", "style": "reverse", "label": "詞義對照", "title": "脹和氣可同時存在", "intro": "選合適的精確詞。", "questions": ["native-436-v2-reverse"]},
  {"id": "native-436-v2-continue", "style": "continue", "label": "調整飲食", "title": "找出可能誘因", "intro": "在熟悉的朋友面前自然說明。", "questions": ["native-436-v2-continue"]},
  {"id": "native-436-v2-speak", "style": "speak", "label": "口頭說明", "title": "向熟人描述", "intro": "在「向熟人描述」情境先開口，然後聽錄音核對。", "model": "I’m gassy.", "zh": "我肚子很多氣。", "speakingPrompt": "吃完豆類後你覺得肚子多氣；向熟悉的朋友口說「我肚子很多氣」。", "recording": "phrase", "questions": []},
  {"id": "native-436-v2-branch", "style": "branch", "label": "新午餐自評", "title": "改喝甚麼", "intro": "自己寫感受和選擇。", "questions": ["native-436-v2-branch"]}
];

export default {revision:2,summary:"用 I’m gassy. 描述吃某些食物後肚子多氣、想打嗝或放屁，並和 bloated 區分。",steps,questions,takeaways:["I’m gassy.", "I’m bloated."],completionTitle:"你能在熟人間自然說明肚子多氣，並提出減少不適的安排。"};

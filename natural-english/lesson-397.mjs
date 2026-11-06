import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-397-v2-audio","audio","聽到這句，最可能看到甚麼？",["嘴唇有一道裂口，可能滲血。", "嘴唇乾燥脫皮，但沒有單一道口。", "嘴唇被碰撞後腫起，但沒有裂口。", "嘴唇內側被咬到，但外側沒有裂。"],"嘴唇有一道裂口，可能滲血。","split my lip 指嘴唇裂開一道傷口，程度比單純乾燥具體。"),
  mc("native-397-v2-scene","scene","朋友說嘴唇只是乾，但你看到碰撞後立即出現一道裂口及少量血。哪個細節最能支持 split my lip 而非 chapped lips？",["撞擊後立即有一道新裂口並出血。", "天氣乾冷，嘴唇表面輕微脫皮。", "嘴唇擦了護唇膏後有光澤。", "喝水後嘴唇不再乾。"],"撞擊後立即有一道新裂口並出血。","單一碰撞後新裂口和血跡指向 split lip；chapped 通常是乾燥造成的粗糙裂紋。"),
  mc("native-397-v2-reverse","reverse","你已向朋友說 My lip is split. 現在要補充「我在撞到桌邊時弄傷了它」這個已發生的動作。哪句合適？",["I split my lip when I hit the table.", "I am splitting my lip on purpose.", "My lips are always chapped in winter.", "I will split my lip tomorrow."],"I split my lip when I hit the table.","split 在這裏同時是過去式，說明碰撞當時發生的裂傷；不是將來或刻意動作。"),
  {id:"native-397-v2-final",type:'open',style:"final",prompt:"新的情境：打球時你不小心碰到隊友的手肘，嘴唇裂了一道小口，有點流血。寫一兩句英文向教練說明。",answers:["I split my lip when I hit my teammate’s elbow. It’s bleeding a little.", "My lip split after I bumped into an elbow. Could I take a moment to check it?", "I split my lip playing basketball, and there’s a little blood."],explanation:"split my lip 說明裂傷，再補上碰撞原因和流血程度。"}
];

const steps=[
  {"id": "native-397-v2-audio", "style": "audio", "label": "先聽傷口", "title": "嘴唇怎樣了？", "intro": "先聽句子，再判斷損傷。", "model": "I split my lip.", "zh": "我的嘴唇裂傷了。", "audioOnly": true, "questions": ["native-397-v2-audio"]},
  {"id": "native-397-v2-speak", "style": "speak", "label": "口頭交代", "title": "說出嘴唇裂傷", "intro": "先說出嘴唇裂開的結果，再聽示範。", "model": "I split my lip.", "zh": "我的嘴唇裂傷了。", "speakingPrompt": "不小心碰到門邊，嘴唇裂開；口頭說「我的嘴唇裂傷了」。", "recording": "phrase", "questions": []},
  {"id": "native-397-v2-scene", "style": "scene", "label": "選用語情況", "title": "裂傷或乾裂", "intro": "從傷口細節選句。", "questions": ["native-397-v2-scene"]},
  {"id": "native-397-v2-reverse", "style": "reverse", "label": "症狀反推", "title": "見到少量血", "intro": "由損傷選英文。", "questions": ["native-397-v2-reverse"]},
  {"id": "native-397-v2-final", "style": "final", "label": "新意外自寫", "title": "運動場邊撞到", "intro": "先寫發生的事和現況，再看示例。", "questions": ["native-397-v2-final"]}
];

export default {revision:2,summary:"用 I split my lip. 描述嘴唇裂出傷口，並與乾裂 chapped lips 區分。",steps,questions,takeaways:["I split my lip.", "My lips are chapped."],completionTitle:"你能說明嘴唇有裂傷，並指出是碰撞而非一般乾燥。"};

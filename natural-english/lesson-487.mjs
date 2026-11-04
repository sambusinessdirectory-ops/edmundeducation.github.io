import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-487-v2-audio","audio","最可能看到甚麼？",["紙箱其中一角凹陷變形。", "紙箱每一面都平整無損。", "箱子只是貼紙翹起。", "箱子一角有水痕但沒變形。"],"紙箱其中一角凹陷變形。","crushed 指受壓而變形；corner 把受損位置限於角落。"),
  mc("native-487-v2-explain","explain","只看見紙箱一角被壓扁，還沒開箱。你能確定甚麼？",["外箱角落受壓；裏面物品是否受損仍要檢查。", "裏面玻璃一定全碎了。", "裏面物品一定完好。", "快遞員一定故意擠壓箱子。"],"外箱角落受壓；裏面物品是否受損仍要檢查。","外箱凹角是可見事實，但內容物狀態和原因都不能只憑外觀斷定。"),
  mc("native-487-v2-repair","repair","快遞到達時只有一個箱角凹陷，其他箱面完整。你原說 The whole box was destroyed。哪句改寫較準？",["One corner of the box got crushed during shipping.", "The entire box was flattened during shipping.", "The package was soaked but kept its shape.", "The label fell off, but the box is undamaged."],"One corner of the box got crushed during shipping.","只說 one corner 可準確限定受損範圍，並交代是在運送期間發生。"),
  {id:"native-487-v2-final",type:'open',style:"final",prompt:"新情境：你收到一箱陶瓷杯，外箱右下角被壓扁；還未開箱。寫一兩句英文向賣家報告可見損壞，並說會檢查杯子是否完好。",answers:["The lower right corner of the box got crushed during shipping. I’ll check the cups inside.", "One corner of the package is crushed, but I haven’t opened it yet. I’ll inspect the cups.", "The box arrived with a crushed corner. I’ll check whether any of the ceramic cups broke."],explanation:"只報告右下角可見受壓，並說明開箱檢查內容物，避免未查便斷言全碎。"}
];

const steps=[
  {"id": "native-487-v2-audio", "style": "audio", "label": "先聽受損位置", "title": "哪裏被壓？", "intro": "先聽句子，留意 corner 與 crushed。", "model": "The corner got crushed.", "zh": "那一角被壓扁了。", "audioOnly": true, "questions": ["native-487-v2-audio"]},
  {"id": "native-487-v2-explain", "style": "explain", "label": "外箱與內容物", "title": "不能直接推斷內裏", "intro": "分辨可見損壞與未查的部分。", "questions": ["native-487-v2-explain"]},
  {"id": "native-487-v2-repair", "style": "repair", "label": "報告範圍", "title": "不是整箱毀壞", "intro": "用更精確的部位修正說法。", "questions": ["native-487-v2-repair"]},
  {"id": "native-487-v2-speak", "style": "speak", "label": "口頭報告", "title": "向店家說明", "intro": "看着到貨紙箱的凹角，先說再聽示範。", "model": "One corner of the box got crushed during shipping.", "zh": "紙箱一角在運送時被壓扁了。", "speakingPrompt": "貨到時紙箱一角明顯壓扁；向店家口說「紙箱一角在運送時被壓扁了」。", "recording": "phrase", "questions": []},
  {"id": "native-487-v2-final", "style": "final", "label": "新包裹自評", "title": "送來的杯具", "intro": "自己寫外箱損壞和檢查打算。", "questions": ["native-487-v2-final"]}
];

export default {revision:2,summary:"用 The corner got crushed. 描述運送中的紙箱一角被壓扁，並區分外箱與內容物狀態。",steps,questions,takeaways:["The corner got crushed.", "One corner of the box got crushed during shipping."],completionTitle:"你能報告紙箱角落受壓，並先查內容物是否完好。"};

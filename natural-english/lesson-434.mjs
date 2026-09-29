import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-434-v2-audio","audio","這句含有甚麼時間變化？",["手機殼原先較淺或透明，現在發黃。", "手機殼一買回來就是黃色。", "手機屏幕變黃而殼沒有變。", "手機殼昨天才被染成藍色。"],"手機殼原先較淺或透明，現在發黃。","has yellowed 描述經過一段時間後變黃，不是只說它本來是黃色。"),
  mc("native-434-v2-detail","detail","透明手機殼邊緣發黃，但屏幕顏色正常。哪句最準確？",["My phone case has yellowed.", "My phone screen has yellowed.", "My phone case has cracked.", "My phone battery has expired."],"My phone case has yellowed.","變色的是 phone case；若說 screen，維修重點便會錯。"),
  mc("native-434-v2-transfer","transfer","一個原本透明的塑膠收納盒放在陽台多年，現在泛黃。哪句自然？",["The plastic box has yellowed over time.", "The plastic box is tangled over time.", "The plastic box has expired next month.", "The plastic box has turned inside out."],"The plastic box has yellowed over time.","yellowed 可描述透明或淺色塑膠隨時間泛黃，並不限於手機殼。"),
  {id:"native-434-v2-final",type:'open',style:"final",prompt:"新情境：你相機的透明保護套用了兩年，現在泛黃；你想買新的。寫一兩句英文向朋友說明變化和打算。",answers:["My clear camera case has yellowed over time. I’m going to replace it.", "The transparent case has yellowed after two years, so I’ll look for a new one.", "This case used to be clear, but it has yellowed. I think I need a replacement."],explanation:"要交代原本透明、現在發黃的變化，並說明更換打算。"}
];

const steps=[
  {"id": "native-434-v2-audio", "style": "audio", "label": "先聽變化", "title": "現在甚麼顏色？", "intro": "先聽句子，再推想前後。", "model": "My phone case has yellowed.", "zh": "我的手機殼變黃了。", "audioOnly": true, "questions": ["native-434-v2-audio"]},
  {"id": "native-434-v2-detail", "style": "detail", "label": "物件分清", "title": "殼還是屏幕", "intro": "定位顏色變化。", "questions": ["native-434-v2-detail"]},
  {"id": "native-434-v2-transfer", "style": "transfer", "label": "另一件透明物", "title": "塑膠盒變色", "intro": "把 yellowed 用在新物件。", "questions": ["native-434-v2-transfer"]},
  {"id": "native-434-v2-speak", "style": "speak", "label": "口頭回應", "title": "朋友記得它透明", "intro": "先口說問句，再聽示範。", "model": "Wasn’t that case clear before?", "zh": "那個手機殼以前不是透明的嗎？", "speakingPrompt": "你看到朋友的手機殼變黃，記得它原本透明；口說「那個殼以前不是透明的嗎？」", "recording": "phrase", "questions": []},
  {"id": "native-434-v2-final", "style": "final", "label": "新物件自評", "title": "相機透明保護套", "intro": "自己寫顏色變化和選擇。", "questions": ["native-434-v2-final"]}
];

export default {revision:2,summary:"用 My phone case has yellowed. 描述原本透明的手機殼用久後變黃。",steps,questions,takeaways:["My phone case has yellowed.", "Wasn’t that case clear before?"],completionTitle:"你能指出手機殼顏色隨時間變化，並回答朋友的觀察。"};

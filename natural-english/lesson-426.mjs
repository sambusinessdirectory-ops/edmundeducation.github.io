import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-426-v2-audio","audio","說話者的傘最可能發生甚麼事？",["傘面被風吹得反向翻起。", "傘自動滑下收起。", "傘留在室內忘了帶。", "傘面只是被雨淋濕。"],"傘面被風吹得反向翻起。","turned inside out 描述傘面向反方向翻起，常由強風造成。"),
  mc("native-426-v2-detail","detail","路邊有人把傘舉著，突來一陣風使傘布向上反折、傘骨露出。哪句最貼切？",["My umbrella turned inside out.", "My umbrella won’t stay open.", "I left my umbrella at home.", "The umbrella is still dry."],"My umbrella turned inside out.","傘布反折是 inside out；won’t stay open 指傘開了又滑回關閉，外形不同。"),
  mc("native-426-v2-reverse","reverse","哪句與 My umbrella turned inside out. 描述同一種變化？",["The wind flipped my umbrella inside out.", "I folded my umbrella before entering.", "My umbrella closed because the catch slipped.", "I turned the umbrella handle around."],"The wind flipped my umbrella inside out.","flipped ... inside out 以風作主語，仍表示傘面向反方向翻起。"),
  {id:"native-426-v2-branch",type:'open',style:"branch",prompt:"新情境：過馬路時強風吹得你的傘反折，傘骨可能已變形。寫一兩句英文告訴同伴發生甚麼事，並說接下來怎樣處理。",answers:["My umbrella turned inside out in the wind. I need to check whether the ribs are bent.", "A gust flipped my umbrella inside out. Let’s step under the awning so I can fix it.", "My umbrella turned inside out as we crossed. I’ll close it and look for damage."],explanation:"要說明強風使傘反折，並提出檢查或先收傘避風的實際行動。"}
];

const steps=[
  {"id": "native-426-v2-audio", "style": "audio", "label": "先聽風勢", "title": "傘變成甚麼樣？", "intro": "先聽句子，再想像形狀。", "model": "My umbrella turned inside out.", "zh": "我的雨傘被吹得整個反過來了。", "audioOnly": true, "questions": ["native-426-v2-audio"]},
  {"id": "native-426-v2-detail", "style": "detail", "label": "分清故障", "title": "翻傘與自行收傘", "intro": "觀察傘骨的方向。", "questions": ["native-426-v2-detail"]},
  {"id": "native-426-v2-reverse", "style": "reverse", "label": "換個主語", "title": "風作主語", "intro": "用另一個句型保留同一事件。", "questions": ["native-426-v2-reverse"]},
  {"id": "native-426-v2-speak", "style": "speak", "label": "口頭報告", "title": "雨中說明", "intro": "在「雨中說明」情境先開口，然後聽錄音核對。", "model": "My umbrella turned inside out.", "zh": "我的雨傘被吹得反過來了。", "speakingPrompt": "一陣強風吹得傘面向上反折；向朋友口說「我的雨傘整個反過來了」。", "recording": "phrase", "questions": []},
  {"id": "native-426-v2-branch", "style": "branch", "label": "新街口自評", "title": "過馬路的強風", "intro": "自己寫成因和下一步。", "questions": ["native-426-v2-branch"]}
];

export default {revision:2,summary:"用 My umbrella turned inside out. 說明大風令傘面反向翻起，而不是傘單純合上。",steps,questions,takeaways:["My umbrella turned inside out.", "What happened to your umbrella?"],completionTitle:"你能描述強風造成的翻傘，並回答對方的關心。"};

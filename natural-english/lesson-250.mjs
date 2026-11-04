import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-250-v2-audio","audio","聽到這句，最可能發現甚麼？",["筆身或筆尖滲出墨水。", "紙上的字被手擦花。", "筆完全沒有墨水。", "筆尖接觸紙後正常出墨，但手不沾墨。"],"筆身或筆尖滲出墨水。","leaking 指墨水從筆內往外滲，不是紙上墨跡被擦花。"),
  mc("native-250-v2-rewrite","rewrite","你握筆的手指沾滿新鮮墨水，筆身也有墨。哪句比 The ink smeared 更準確？",["The pen is leaking.", "The ink smeared on the page.", "The pen has run out of ink.", "The page is wet with water."],"The pen is leaking.","墨水從筆身或筆尖滲出，源頭是筆；smeared 指紙上未乾墨水被擦開。"),
  mc("native-250-v2-explain","explain","The pen is leaking ink. 的 leaking 表示甚麼？",["墨水從不應流出的地方滲出。", "筆尖的墨正常流到紙上。", "筆尖完全沒墨可寫。", "墨水從筆芯流出，但只在書寫時。"],"墨水從不應流出的地方滲出。","leak 表示液體滲漏；這裏液體是筆內的墨水。"),
  {id:"native-250-v2-contrast",type:'open',style:"contrast",prompt:"新的情境：朋友以為桌上紙張的墨痕是簽名被擦花；你發現其實原子筆正漏墨，把手和紙都沾黑。寫一兩句英文澄清來源，並提醒別再把筆放回袋裏。",answers:["The pen is leaking, not just smearing on the page. Don’t put it back in your bag.", "Ink is leaking from the pen onto my hand and paper. We shouldn’t put this pen in the bag."],explanation:"leaking 指墨水從筆內滲出；smeared 才是紙面上墨水被擦散。"}
];

const steps=[
  {"id": "native-250-v2-audio", "style": "audio", "label": "先聽問題", "title": "墨水從哪裏來？", "intro": "先聽句子，再判斷原因。", "model": "The pen is leaking.", "zh": "原子筆在漏墨。", "audioOnly": true, "questions": ["native-250-v2-audio"]},
  {"id": "native-250-v2-rewrite", "style": "rewrite", "label": "精確改寫", "title": "為何手上有墨？", "intro": "從墨水位置選原因。", "questions": ["native-250-v2-rewrite"]},
  {"id": "native-250-v2-explain", "style": "explain", "label": "辨認來源", "title": "leaking 的意思", "intro": "把現象連回動詞。", "questions": ["native-250-v2-explain"]},
  {"id": "native-250-v2-speak", "style": "speak", "label": "口頭提醒", "title": "先別放進袋", "intro": "先說出原子筆漏墨，再聽示範。", "model": "The pen is leaking.", "zh": "原子筆在漏墨。", "speakingPrompt": "朋友正要把這支沾墨的筆放入背包；口頭說「這支筆在漏墨」。", "recording": "phrase", "questions": []},
  {"id": "native-250-v2-contrast", "style": "contrast", "label": "新情境自評", "title": "漏墨和擦花分清楚", "intro": "轉到「漏墨和擦花分清楚」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-250-v2-contrast"]}
];

export default {revision:2,summary:"用 The pen is leaking. 描述原子筆漏墨，並與墨水被擦開區分。",steps,questions,takeaways:["The pen is leaking.", "The pen is leaking ink."],completionTitle:"你能指出墨水從筆身滲出，並避免再放進袋內。"};

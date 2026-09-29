import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-404-v2-audio","audio","剛睡醒聽到這句，最可能是哪種情況？",["眼睫附近有乾掉的分泌物。", "眼睛被沙粒磨得痛。", "眼睛因洋蔥刺激而流眼淚。", "眨眼時眼內像有細沙摩擦。"],"眼睫附近有乾掉的分泌物。","crusty 指眼周有乾掉的分泌物；gritty 指眼內沙沙異物感。"),
  mc("native-404-v2-detail","detail","哪項觀察最支持 My eyes are crusty？",["睡醒時眼角有乾屑，眼皮有點黏。", "盯螢幕後眼內像有砂。", "眼睛被洋蔥刺激流淚。", "眼睛只有點癢，沒有乾屑。"],"睡醒時眼角有乾屑，眼皮有點黏。","乾屑黏在眼角和眼睫，是 crusty 的具體線索。"),
  mc("native-404-v2-continue","continue","室友問 Did you just wake up? 你眼角有些乾掉分泌物。哪句好？",["Yeah, my eyes are a little crusty this morning.", "Yeah, my eyes feel gritty after working late.", "Yes, I got up early and my eyes are itchy.", "No, I’ve been awake for hours; my eyes just feel dry."],"Yeah, my eyes are a little crusty this morning.","this morning 和 just woke up 連到睡醒後眼角有乾分泌物的情況。"),
  {id:"native-404-v2-repair",type:'open',style:"repair",prompt:"新的情境：坐完通宵巴士後，你早上醒來眼角有乾掉的分泌物、眼皮有點黏。朋友說你眼睛 gritty。寫一兩句英文修正他的說法，並描述你實際看到的情況。",answers:["My eyes are crusty, not gritty. There’s dried discharge around the corners.", "They’re a little crusty after sleeping on the bus; my eyelids feel sticky.", "I have some dried crust around my eyes this morning, rather than a gritty feeling inside them."],explanation:"crusty 說眼周乾分泌物；gritty 則是眼內像有沙摩擦，兩者位置和感覺不同。"}
];

const steps=[
  {"id": "native-404-v2-audio", "style": "audio", "label": "先聽早晨", "title": "眼周有甚麼？", "intro": "先聽句子，再辨認外觀。", "model": "My eyes are crusty.", "zh": "我的眼睛周圍有乾掉的分泌物。", "audioOnly": true, "questions": ["native-404-v2-audio"]},
  {"id": "native-404-v2-detail", "style": "detail", "label": "觀察證據", "title": "眼皮有點黏", "intro": "從早晨外觀判斷。", "questions": ["native-404-v2-detail"]},
  {"id": "native-404-v2-speak", "style": "speak", "label": "口頭說明", "title": "剛起床的眼睛", "intro": "先說出眼周乾分泌物，再聽示範。", "model": "My eyes are crusty.", "zh": "我的眼周有乾掉的分泌物。", "speakingPrompt": "早上醒來眼角有乾掉的分泌物；口頭說「我的眼睛周圍黏黏的」。", "recording": "phrase", "questions": []},
  {"id": "native-404-v2-continue", "style": "continue", "label": "接續早晨對話", "title": "朋友問你累嗎", "intro": "解釋外觀而不推測疾病。", "questions": ["native-404-v2-continue"]},
  {"id": "native-404-v2-repair", "style": "repair", "label": "新場景自評", "title": "旅途後的眼角", "intro": "先自己寫，再與示例比較眼內、眼周之別。", "questions": ["native-404-v2-repair"]}
];

export default {revision:2,summary:"用 My eyes are crusty. 描述睡醒眼周有乾掉的分泌物、眼皮黏住。",steps,questions,takeaways:["My eyes are crusty.", "My eyes feel gritty."],completionTitle:"你能分清眼周乾分泌物與眼內沙粒般的感覺。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-411-v2-audio","audio","聽到這句，容器剛打開時最可能怎樣？",["液體突然從開口噴出一股。", "液體慢慢滴到杯裏。", "容器完全是空的。", "蓋子仍密封，沒有打開。"],"液體突然從開口噴出一股。","spurted out 強調突然、短促地噴出；when I opened it 指打開的那一刻。"),
  mc("native-411-v2-continue","continue","你說 Liquid spurted out of the can. 朋友問 Did it get on you? 你袖子被濺濕。哪句最完整？",["Yes, it spurted onto my sleeve when I opened it.", "No, I poured it carefully into a glass.", "The can was empty before I opened it.", "It leaked slowly from the bottom overnight."],"Yes, it spurted onto my sleeve when I opened it.","回答 Yes，並交代濺到袖子的結果；spurted 保留突發噴出的意思。"),
  mc("native-411-v2-reverse","reverse","開罐一瞬間泡沫成股衝出，而不是慢慢漏出。哪句最準？",["Foam spurted out of the can.", "Foam slowly leaked from the base.", "Foam dripped one drop at a time.", "Foam stayed inside the sealed can."],"Foam spurted out of the can.","成股、突然衝出是 spurted out；leak 和 drip 表示較慢的流出。"),
  {id:"native-411-v2-final",type:'open',style:"final",prompt:"新的情境：野餐時你打開一瓶剛搖過的氣泡飲料，泡沫突然噴到桌布上。寫一兩句英文告訴朋友發生甚麼。",answers:["Foam spurted out when I opened the bottle. It got on the tablecloth.", "I opened the shaken soda, and it spurted onto the tablecloth.", "The soda spurted out as soon as I opened it, so the tablecloth is wet."],explanation:"spurted out 表示打開瞬間突然噴出；再說泡沫濺到桌布。"}
];

const steps=[
  {"id": "native-411-v2-audio", "style": "audio", "label": "先聽突發動作", "title": "打開時怎樣了？", "intro": "先聽句子，再辨認液體的動作。", "model": "It spurted out when I opened it.", "zh": "我打開時它突然噴出來。", "audioOnly": true, "questions": ["native-411-v2-audio"]},
  {"id": "native-411-v2-speak", "style": "speak", "label": "口頭交代", "title": "為何袖子濕？", "intro": "先說出打開時噴出的事件，再聽示範。", "model": "It spurted out when I opened it.", "zh": "我打開時它噴了出來。", "speakingPrompt": "朋友問你袖子為何濕；口頭說「我打開它時液體噴出來」。", "recording": "phrase", "questions": []},
  {"id": "native-411-v2-continue", "style": "continue", "label": "接續問答", "title": "朋友問有沒有濺到", "intro": "用噴出的方向回答。", "questions": ["native-411-v2-continue"]},
  {"id": "native-411-v2-reverse", "style": "reverse", "label": "辨認動作速度", "title": "噴出還是滲漏", "intro": "由短促動作選動詞。", "questions": ["native-411-v2-reverse"]},
  {"id": "native-411-v2-final", "style": "final", "label": "新瓶子自評", "title": "野餐氣泡飲料", "intro": "自己寫事件和結果，再看示例。", "questions": ["native-411-v2-final"]}
];

export default {revision:2,summary:"用 spurted out 描述容器剛打開時液體突然噴出一股。",steps,questions,takeaways:["It spurted out when I opened it.", "Liquid spurted out of the can."],completionTitle:"你能說清噴出的時間、方向和結果。"};

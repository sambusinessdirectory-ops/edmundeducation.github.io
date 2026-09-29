import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-394-v2-audio","audio","聽到這句，最可能觀察到甚麼？",["燈會亮，但裏面食物不夠冷。", "冰箱內食物保持正常低溫，只是門封條有一道小縫。", "溫控被調到最暖一格，但功能正常。", "冰箱短暫開門後仍未回到原溫度。"],"燈會亮，但裏面食物不夠冷。","isn’t cooling properly 指冷卻效果不足，不必然是完全沒電。"),
  mc("native-394-v2-detail","detail","哪項細節最支持 The fridge isn’t cooling properly？",["放了整夜的飲料仍接近室溫。", "冰箱內只有門架的飲料不夠涼。", "門封條邊有一道小縫。", "溫控顯示器的字變暗。"],"放了整夜的飲料仍接近室溫。","長時間冷藏後飲料仍不涼，直接顯示冷卻功能不足。"),
  mc("native-394-v2-rewrite","rewrite","你向維修員說 The fridge is broken. 哪句改寫更有用？",["The fridge is running, but it isn’t cooling properly.", "The fridge is unplugged, so it isn’t running.", "The fridge is making a loud hum but still feels cold.", "The fridge light is out but the food is cold."],"The fridge is running, but it isn’t cooling properly.","說明仍在運作但冷卻不足，能協助維修員區分電源與製冷問題。"),
  mc("native-394-v2-contrast","contrast","燈亮、壓縮機有聲，但牛奶不夠冷。哪句比 The fridge is dead 更準？",["The fridge isn’t cooling properly.", "The fridge has no power.", "The outlet is dead.", "The door has fallen off."],"The fridge isn’t cooling properly.","有電且在運行，故障集中在冷卻效果，而非完全斷電。"),
  {id:"native-394-v2-final",type:'open',style:"final",prompt:"新的情境：租屋冰箱仍有電，但放一晚的牛奶和水都不夠冷。寫一兩句英文給房東，說明問題並請人檢查。",answers:["The fridge is running, but it isn’t cooling properly. Could someone check it?", "The fridge isn’t cooling properly. The milk and water are still warm after a night inside.", "Could you have the fridge checked? It has power, but it’s not getting cold enough."],explanation:"說明有電卻不夠冷，再舉過夜仍不涼的證據，方便房東安排檢查。"}
];

const steps=[
  {"id": "native-394-v2-audio", "style": "audio", "label": "先聽故障", "title": "有運作但不夠冷", "intro": "先聽句子，再判斷冰箱表現。", "model": "The fridge isn’t cooling properly.", "zh": "冰箱冷卻得不正常。", "audioOnly": true, "questions": ["native-394-v2-audio"]},
  {"id": "native-394-v2-detail", "style": "detail", "label": "找支持證據", "title": "飲料仍不夠涼", "intro": "由日常觀察定位故障。", "questions": ["native-394-v2-detail"]},
  {"id": "native-394-v2-rewrite", "style": "rewrite", "label": "具體報修", "title": "不是籠統壞了", "intro": "把症狀說完整。", "questions": ["native-394-v2-rewrite"]},
  {"id": "native-394-v2-contrast", "style": "contrast", "label": "電源還是冷卻", "title": "燈亮不代表夠冷", "intro": "分清兩種故障。", "questions": ["native-394-v2-contrast"]},
  {"id": "native-394-v2-speak", "style": "speak", "label": "口頭報修", "title": "說出冷卻問題", "intro": "先說出雪櫃製冷不足，再聽示範。", "model": "The fridge isn’t cooling properly.", "zh": "冰箱不夠冷。", "speakingPrompt": "冰箱燈亮但飲料不涼；口頭說「冰箱冷卻得不正常」。", "recording": "phrase", "questions": []},
  {"id": "native-394-v2-final", "style": "final", "label": "新租屋自寫", "title": "給房東具體描述", "intro": "自己寫症狀和請求，再看示例。", "questions": ["native-394-v2-final"]}
];

export default {revision:2,summary:"用 The fridge isn’t cooling properly. 描述冰箱仍運作但不夠冷，並清楚報修。",steps,questions,takeaways:["The fridge isn’t cooling properly.", "The fridge isn’t cooling properly. It’s not getting cold enough."],completionTitle:"你能說明冰箱有電卻不夠冷，並提供報修所需細節。"};

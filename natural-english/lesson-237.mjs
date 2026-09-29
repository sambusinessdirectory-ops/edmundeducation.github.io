import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-237-v2-audio","audio","浴缸旁聽到這句，最可能在哪裏看到裂縫？",["浴缸與牆接縫的防水膠。", "浴缸瓷面的一道裂痕。", "水槽旁的瓷磚縫。", "浴缸上方剝落的牆漆。"],"浴缸與牆接縫的防水膠。","caulk 是接縫處的密封膠，cracking 表示它出現裂縫。"),
  mc("native-237-v2-repair","repair","浴缸邊緣的白色密封膠裂了，但瓷磚完好。哪句最準確？",["The caulk around the tub is cracking.", "The tile around the tub is cracked.", "The tub is overflowing.", "The paint is bubbling."],"The caulk around the tub is cracking.","裂縫在密封膠，不在瓷磚；around the tub 指出位置。"),
  mc("native-237-v2-tone","tone","你見到浴缸邊膠裂，但未發現滲水。哪句報修最穩妥？",["The caulk is cracking. Could someone check it?", "The bathroom is definitely flooding behind the wall.", "There is no issue because water isn’t visible.", "The tiles must all be replaced today."],"The caulk is cracking. Could someone check it?","先報告看得到的裂縫，再請人檢查是否需要重打膠。"),
  {id:"native-237-v2-final",type:'open',style:"final",prompt:"新的情境：廚房水槽後方的密封膠開始裂，洗碗時水常濺到那裏。寫一兩句英文給維修員，說明問題並請人處理。",answers:["The caulk behind the kitchen sink is cracking. Could you check and repair it?", "The caulk around the sink is starting to crack, and water splashes there. Can it be resealed?", "I’ve noticed cracks in the caulk behind the sink. Please take a look."],explanation:"指出 caulk 裂的位置及有水接觸，讓維修員明白需要檢查密封。"}
];

const steps=[
  {"id": "native-237-v2-audio", "style": "audio", "label": "先聽位置", "title": "裂的是甚麼？", "intro": "先聽句子，再辨認材料。", "model": "The caulk is cracking.", "zh": "密封膠正在裂開。", "audioOnly": true, "questions": ["native-237-v2-audio"]},
  {"id": "native-237-v2-repair", "style": "repair", "label": "修正物件", "title": "不是瓷磚裂了", "intro": "從裂縫位置選說法。", "questions": ["native-237-v2-repair"]},
  {"id": "native-237-v2-tone", "style": "tone", "label": "審慎報修", "title": "先說觀察", "intro": "避免未檢查就斷定漏水。", "questions": ["native-237-v2-tone"]},
  {"id": "native-237-v2-speak", "style": "speak", "label": "口頭報告", "title": "浴缸邊有裂縫", "intro": "先說出密封膠裂開，再聽示範。", "model": "The caulk is cracking.", "zh": "密封膠裂了。", "speakingPrompt": "洗澡時看到浴缸邊的密封膠裂開；口頭說「密封膠裂了」。", "recording": "phrase", "questions": []},
  {"id": "native-237-v2-final", "style": "final", "label": "新水槽自寫", "title": "給維修員留言", "intro": "先寫位置和請求，再看示例。", "questions": ["native-237-v2-final"]}
];

export default {revision:2,summary:"用 caulk is cracking 描述浴缸邊防水密封膠出現裂縫，並提出檢查。",steps,questions,takeaways:["The caulk is cracking.", "We need to caulk around the tub."],completionTitle:"你能指出浴缸或水槽邊的密封膠裂縫，並提出修補需要。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-481-v2-audio","audio","洗完熱水澡後最可能看到甚麼？",["鏡面白濛濛，看不清倒影。", "鏡面有一道永久裂痕。", "鏡面乾淨清晰，能照得很清楚。", "鏡子掛鈎脫落，掉到地上。"],"鏡面白濛濛，看不清倒影。","fogged up 指水汽凝在鏡面使畫面模糊，通常與熱水澡後的濕氣有關。"),
  mc("native-481-v2-detail","detail","鏡面白濛濛，用手擦過一角後，那一角立即能照清楚。哪個解釋較有根據？",["鏡面只是起霧，可先擦拭或等水汽散去。", "鏡面玻璃整片永久變白。", "鏡面有多道深刮痕。", "鏡子後面的塗層已整片脫落。"],"鏡面只是起霧，可先擦拭或等水汽散去。","擦過就清楚說明遮擋多半是表面凝結水汽，而非永久損壞。"),
  mc("native-481-v2-tone","tone","室友要用鏡子整理頭髮，但你剛洗完澡，鏡面全是霧。哪句最自然？",["The mirror is fogged up. Give it a minute, or I can wipe it for you.", "The mirror is shattered, so don’t look at it.", "You can see perfectly; just ignore the steam.", "I broke the mirror when I showered."],"The mirror is fogged up. Give it a minute, or I can wipe it for you.","說清只是水汽起霧，再提供等待或擦拭的選擇，回應室友需要。"),
  mc("native-481-v2-transfer","transfer","冷天車窗內側被呼氣和濕氣蒙住，看不清路外。哪句可用？",["The car windows are fogged up.", "The car windows are cracked.", "The car windows are covered in fingerprints only.", "The car windows have been removed."],"The car windows are fogged up.","fogged up 也可形容車窗被水汽蒙住；重點仍是視線暫時模糊。"),
  {id:"native-481-v2-final",type:'open',style:"final",prompt:"新情境：你洗完熱水澡，整面浴室鏡子起霧；你趕時間要刮鬍子。寫一兩句英文說明情況，並說怎樣讓鏡子可用。",answers:["The whole mirror is fogged up, so I’ll wipe a clear patch before shaving.", "The mirror is fogged up after my shower. I’ll turn on the fan and wipe it.", "I can’t see my reflection because the mirror is fogged up. I’ll clear it first."],explanation:"說出鏡面水汽阻礙視線，再提出擦拭或通風等實際做法。"}
];

const steps=[
  {"id": "native-481-v2-audio", "style": "audio", "label": "先聽鏡面", "title": "能看清倒影嗎？", "intro": "先聽，再判斷 fogged up 的可見效果。", "model": "The mirror is fogged up.", "zh": "鏡子起霧了。", "audioOnly": true, "questions": ["native-481-v2-audio"]},
  {"id": "native-481-v2-detail", "style": "detail", "label": "暫時還是損壞", "title": "擦一角就清楚", "intro": "利用擦拭結果判斷。", "questions": ["native-481-v2-detail"]},
  {"id": "native-481-v2-tone", "style": "tone", "label": "共用浴室", "title": "請人等一會兒", "intro": "說明短暫障礙。", "questions": ["native-481-v2-tone"]},
  {"id": "native-481-v2-transfer", "style": "transfer", "label": "換到車窗", "title": "晨早車窗白濛濛", "intro": "把 fogged up 用到另一塊玻璃。", "questions": ["native-481-v2-transfer"]},
  {"id": "native-481-v2-final", "style": "final", "label": "新浴室自評", "title": "趕時間刮鬍子", "intro": "自己寫問題和可行處理。", "questions": ["native-481-v2-final"]}
];

export default {revision:2,summary:"用 The mirror is fogged up. 描述熱水澡後浴室鏡面蒙上一層霧，看不清映像。",steps,questions,takeaways:["The mirror is fogged up.", "The whole mirror is fogged up."],completionTitle:"你能描述鏡面起霧，並提出等待或改善通風的做法。"};

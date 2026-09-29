import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-215-v2-audio","audio","聽到這句，牆上最可能有甚麼？",["油漆鼓起一個個小泡。", "油漆整片脫落到地上。", "牆漆顏色均勻變淡。", "漆片開始從牆面剝落。"],"油漆鼓起一個個小泡。","bubbling 是鼓泡；peeling 才偏向油漆剝落。"),
  mc("native-215-v2-tone","tone","你要向管理員報告天花板附近的油漆鼓泡，並建議檢查有沒有水分；但原因尚未確認。哪句最合適？",["The paint is bubbling. We should check for moisture.", "It must be a leak, so tear the wall open now.", "The paint has completely fallen off.", "It may be old paint; let’s leave it for now."],"The paint is bubbling. We should check for moisture.","先描述可見鼓泡，再建議檢查潮氣；不把未確認原因說成定論。"),
  mc("native-215-v2-explain","explain","牆漆表面隆起，仍附在牆上；用哪個詞比 peeling 更準？",["bubbling", "peeling", "fading", "drying"],"bubbling","鼓起但未脫落是 bubbling；peeling 指漆層從牆面剝離。"),
  mc("native-215-v2-branch","branch","你說 The paint is bubbling near the window，窗框旁還有新水漬；管理員想先排查水從何處來。哪句追問最切題？",["Is there any water leaking nearby?", "Has the wall felt damp lately?", "Did this begin after the last rain?", "Has the paint started peeling anywhere?"],"Is there any water leaking nearby?","窗邊鼓泡可能和水分有關，先確認是否漏水有助找原因。"),
  {id:"native-215-v2-final",type:'open',style:"final",prompt:"新的情境：廚房水槽旁的牆漆鼓起幾個泡，最近那裏常有水漬。寫一兩句英文給業主，說明位置和需要檢查的問題。",answers:["The paint is bubbling beside the kitchen sink. Could you check for a leak?", "There are bubbles in the paint near the sink, and the wall has been damp. Please have it checked.", "The paint near the sink is bubbling; could someone look for moisture behind the wall?"],explanation:"指出鼓泡位置與水漬，再請對方檢查；不要自行斷定已有嚴重漏水。"}
];

const steps=[
  {"id": "native-215-v2-audio", "style": "audio", "label": "先聽外觀", "title": "牆面怎樣了？", "intro": "先聽完整句，再回答「牆面怎樣了？」。", "model": "The paint is bubbling.", "zh": "油漆鼓泡了。", "audioOnly": true, "questions": ["native-215-v2-audio"]},
  {"id": "native-215-v2-tone", "style": "tone", "label": "審慎提醒", "title": "先觀察原因", "intro": "說問題而不亂下結論。", "questions": ["native-215-v2-tone"]},
  {"id": "native-215-v2-explain", "style": "explain", "label": "辨認形狀", "title": "鼓泡與剝落", "intro": "比較兩種牆面現象。", "questions": ["native-215-v2-explain"]},
  {"id": "native-215-v2-speak", "style": "speak", "label": "口頭報告", "title": "指着牆面說", "intro": "先說出牆漆鼓泡，再聽示範。", "model": "The paint is bubbling.", "zh": "油漆鼓泡了。", "speakingPrompt": "你發現牆壁油漆隆起；口頭說「油漆鼓泡了」。", "recording": "phrase", "questions": []},
  {"id": "native-215-v2-branch", "style": "branch", "label": "報修後續", "title": "管理員會問甚麼？", "intro": "把觀察變成下一步檢查。", "questions": ["native-215-v2-branch"]},
  {"id": "native-215-v2-final", "style": "final", "label": "新牆面自寫", "title": "廚房水槽旁", "intro": "自己寫觀察與請求，再對照示例。", "questions": ["native-215-v2-final"]}
];

export default {revision:2,summary:"用 The paint is bubbling. 描述牆上油漆鼓起，並和 peeling 區分。",steps,questions,takeaways:["The paint is bubbling.", "The paint is peeling."],completionTitle:"你能指出油漆鼓泡的位置，並提醒可能需要檢查潮濕。"};

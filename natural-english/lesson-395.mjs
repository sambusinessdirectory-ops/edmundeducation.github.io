import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-395-v2-audio","audio","聽到這句，螺絲最可能怎樣？",["一直轉動，卻抓不緊螺絲孔。", "螺絲頭滑牙，螺絲起子抓不住它。", "螺絲太短，碰不到孔內螺紋。", "螺絲孔太深，需要長一點的螺絲。"],"一直轉動，卻抓不緊螺絲孔。","stripped threads 表示螺紋磨壞，螺絲因此無法咬緊。"),
  mc("native-395-v2-detail","detail","同一個螺絲孔換了兩顆尺寸正確的螺絲，兩顆都空轉；其他孔卻鎖得緊。哪個判斷最有根據？",["The threads in that hole are stripped.", "Both replacement screws must be too short.", "The screwdriver handle is too smooth.", "Every screw hole on the chair is damaged."],"The threads in that hole are stripped.","兩顆合適螺絲只在同一孔空轉，故障較可能在孔內螺紋，而非所有螺絲或整張椅子。"),
  mc("native-395-v2-continue","continue","同伴問 Why won’t the screw tighten? 兩顆尺寸正確的螺絲都只在同一孔內空轉。哪句最審慎又切題？",["The threads may be stripped. Let’s stop forcing it.", "It might be the wrong screw; let’s try a smaller one.", "Maybe the screwdriver tip is too small.", "Perhaps the screw needs a washer."],"The threads may be stripped. Let’s stop forcing it.","說明螺紋可能磨壞，再停止硬轉以免進一步損壞。"),
  mc("native-395-v2-explain","explain","The threads in the hole are stripped. 中的 threads 是甚麼？",["螺絲孔內讓螺絲咬合的螺紋。", "縫衣服的棉線。", "電線外面的膠皮。", "工具箱的布帶。"],"螺絲孔內讓螺絲咬合的螺紋。","在螺絲語境，threads 是螺紋；in the hole 指孔內的螺紋。"),
  {id:"native-395-v2-final",type:'open',style:"final",prompt:"新的情境：你在修椅腳，螺絲進孔後只會空轉，椅腳仍鬆。寫一兩句英文向同伴說明可能問題，並建議先停下來檢查螺絲孔。",answers:["The threads in the hole may be stripped. Let’s stop and check before turning it again.", "The screw keeps spinning, so I think the threads are stripped. We should inspect the hole.", "The threads look stripped and the leg is still loose. Let’s check the screw hole."],explanation:"空轉而鎖不緊支持 threads stripped 的判斷；先檢查孔位，避免硬轉。"}
];

const steps=[
  {"id": "native-395-v2-audio", "style": "audio", "label": "先聽故障", "title": "螺絲為何空轉？", "intro": "先聽句子，再判斷結構。", "model": "The threads are stripped.", "zh": "螺紋滑牙了。", "audioOnly": true, "questions": ["native-395-v2-audio"]},
  {"id": "native-395-v2-speak", "style": "speak", "label": "口頭指出", "title": "螺絲孔壞了", "intro": "先說出螺紋滑牙的狀態，再聽示範。", "model": "The threads are stripped.", "zh": "螺紋滑牙了。", "speakingPrompt": "螺絲放進孔後不停空轉；口頭說「螺紋滑牙了」。", "recording": "phrase", "questions": []},
  {"id": "native-395-v2-detail", "style": "detail", "label": "觀察動作", "title": "是哪個線索？", "intro": "從鎖螺絲的結果判斷。", "questions": ["native-395-v2-detail"]},
  {"id": "native-395-v2-continue", "style": "continue", "label": "接續修理", "title": "別再硬轉", "intro": "根據故障回應同伴。", "questions": ["native-395-v2-continue"]},
  {"id": "native-395-v2-explain", "style": "explain", "label": "部位辨認", "title": "threads 指甚麼？", "intro": "把英文連到螺絲結構。", "questions": ["native-395-v2-explain"]},
  {"id": "native-395-v2-final", "style": "final", "label": "新修理自寫", "title": "椅腳螺絲孔", "intro": "先寫故障和下一步，再看示例。", "questions": ["native-395-v2-final"]}
];

export default {revision:2,summary:"用 The threads are stripped. 描述螺絲孔螺紋磨壞，螺絲空轉而鎖不緊。",steps,questions,takeaways:["The threads are stripped.", "The threads in the hole are stripped."],completionTitle:"你能指出螺絲鎖不緊的真正原因，並避免繼續硬轉。"};

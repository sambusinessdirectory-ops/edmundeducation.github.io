import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-248-v2-audio","audio","聽到這句，最可能怎樣？",["用力轉仍毫無移動。", "蓋子剛被輕鬆轉開。", "蓋子一碰就掉下。", "蓋子有點緊，但已轉動半圈。"],"用力轉仍毫無移動。","won’t budge 表示即使用力仍一點都不動。"),
  mc("native-248-v2-scene","scene","哪個情況適合說 The lid won’t budge？",["雙手用力轉罐蓋，仍完全不動。", "罐蓋一轉就開。", "罐蓋已從罐上拿下。", "蓋子旋歪但還能繼續轉。"],"雙手用力轉罐蓋，仍完全不動。","說 won't budge 時，重點是物件完全沒有移動。"),
  mc("native-248-v2-branch","branch","朋友問 Do you need help opening that jar? 你已試過很久。哪句自然？",["Yes, the lid won’t budge.", "No, the lid is already open.", "Yes, but the lid turned easily after I loosened it.", "No, I haven’t touched it yet."],"Yes, the lid won’t budge.","你已試過打開卻完全轉不動，接受朋友幫忙並指出蓋子卡緊很自然。"),
  mc("native-248-v2-continue","continue","你說 The lid won’t budge；朋友想現在幫你把同一個罐蓋轉開。哪句最直接？",["Let me try with a towel for a better grip.", "Let’s check whether the jar is already open.", "Let’s try opening a different jar instead.", "Let’s leave this jar closed for now."],"Let me try with a towel for a better grip.","用毛巾增加抓力是針對緊蓋的合理嘗試；其他建議不處理阻力。"),
  {id:"native-248-v2-final",type:'open',style:"final",prompt:"新的情境：早餐時果醬罐蓋太緊，你試了兩次仍完全轉不動。寫一兩句英文告訴室友並請他試試。",answers:["The lid won’t budge. Could you try opening the jam jar?", "I’ve tried twice, but the lid won’t budge. Can you give it a try?", "This jam jar’s lid won’t budge; could you help me open it?"],explanation:"won’t budge 表示試過仍無法移動，再用 could you 具體請人幫忙。"}
];

const steps=[
  {"id": "native-248-v2-audio", "style": "audio", "label": "先聽阻力", "title": "罐蓋動了嗎？", "intro": "先聽句子，再判斷嘗試結果。", "model": "The lid won’t budge.", "zh": "蓋子完全轉不動。", "audioOnly": true, "questions": ["native-248-v2-audio"]},
  {"id": "native-248-v2-scene", "style": "scene", "label": "選適用情境", "title": "真的動不了", "intro": "分辨稍緊與完全卡住。", "questions": ["native-248-v2-scene"]},
  {"id": "native-248-v2-speak", "style": "speak", "label": "口頭求助", "title": "請朋友開罐", "intro": "先說出罐蓋不動，再聽示範。", "model": "The lid won’t budge.", "zh": "蓋子完全轉不動。", "speakingPrompt": "你怎樣轉都打不開罐子；口頭說「蓋子完全轉不動」。", "recording": "phrase", "questions": []},
  {"id": "native-248-v2-branch", "style": "branch", "label": "對話分支", "title": "朋友來幫忙", "intro": "根據困難接續請求。", "questions": ["native-248-v2-branch"]},
  {"id": "native-248-v2-continue", "style": "continue", "label": "繼續談話", "title": "試一個方法", "intro": "選能處理緊蓋的建議。", "questions": ["native-248-v2-continue"]},
  {"id": "native-248-v2-final", "style": "final", "label": "新早餐自寫", "title": "果醬罐打不開", "intro": "先寫問題和求助，再按示例自評。", "questions": ["native-248-v2-final"]}
];

export default {revision:2,summary:"用 The lid won’t budge. 描述罐蓋太緊、怎樣轉都不動，並轉用於窗戶。",steps,questions,takeaways:["The lid won’t budge.", "The window won’t budge."],completionTitle:"你能清楚描述罐蓋完全轉不動，並自然請人幫忙。"};

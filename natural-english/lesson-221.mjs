import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-221-v2-audio","audio","在地下停車場聽到這句，最可能是哪個問題？",["這個位置收不到手機訊號。", "手機電池已耗盡。", "對方把電話關靜音。", "手機開了飛航模式。"],"這個位置收不到手機訊號。","dead zone 指地點的通訊訊號盲區，離開該處可能又有訊號。"),
  mc("native-221-v2-detail","detail","哪項觀察最支持說地下室是 a dead zone？",["地下室沒訊號，走上樓梯就恢復。", "手機在其他樓層也沒有訊號。", "朋友把手機調成靜音。", "手機電量只剩百分之一。"],"地下室沒訊號，走上樓梯就恢復。","訊號隨位置改變，顯示問題在覆蓋範圍而非手機電池。"),
  mc("native-221-v2-branch","branch","你知道地鐵站這個角落長期沒有訊號，現在必須立即傳訊息。最可靠的下一步是甚麼？",["走到有訊號的出口再傳。", "在原位重新啟動手機。", "留在原位等手機自動重連。", "到同一角落再等五分鐘。"],"走到有訊號的出口再傳。","dead zone 是局部地點沒有覆蓋，移到另一位置可能恢復訊號。"),
  mc("native-221-v2-continue","continue","朋友說 I couldn’t reach you in the basement. 你當時完全沒訊號，怎樣回？",["Sorry, it’s a dead zone down there.", "Sorry, my phone was on silent.", "Sorry, my battery was empty.", "Sorry, I switched my phone to airplane mode."],"Sorry, it’s a dead zone down there.","說明地下室是訊號盲區，便能解釋對方為何聯絡不到你。"),
  {id:"native-221-v2-final",type:'open',style:"final",prompt:"新的情境：你在山徑某段完全收不到訊號，但走回觀景台就能傳訊息。寫一兩句英文告訴同行朋友這段路的問題和你打算怎樣聯絡人。",answers:["This stretch is a dead zone. I'll text them from the lookout.", "I have no signal here; it’s a dead zone. Let’s send the message at the lookout.", "This part of the trail is a dead zone, so I’ll contact them when we get back to the lookout."],explanation:"dead zone 描述特定位置的訊號問題；補上會到有訊號的位置聯絡。"}
];

const steps=[
  {"id": "native-221-v2-audio", "style": "audio", "label": "先聽地點", "title": "為何打不通？", "intro": "先聽句子，再判斷周圍環境。", "model": "It’s a dead zone.", "zh": "這裏是訊號盲區。", "audioOnly": true, "questions": ["native-221-v2-audio"]},
  {"id": "native-221-v2-detail", "style": "detail", "label": "辨認證據", "title": "換位置就有訊號", "intro": "由訊號變化判斷。", "questions": ["native-221-v2-detail"]},
  {"id": "native-221-v2-branch", "style": "branch", "label": "對話下一步", "title": "要傳緊急訊息", "intro": "根據所在位置選行動。", "questions": ["native-221-v2-branch"]},
  {"id": "native-221-v2-continue", "style": "continue", "label": "接續對話", "title": "朋友問為何失聯", "intro": "回應上一通電話斷線。", "questions": ["native-221-v2-continue"]},
  {"id": "native-221-v2-final", "style": "final", "label": "新位置自寫", "title": "山徑中途失聯", "intro": "先寫狀況和下一步，再看示例。", "questions": ["native-221-v2-final"]}
];

export default {revision:2,summary:"用 dead zone 描述某個地點收不到手機訊號，並分清手機本身故障。",steps,questions,takeaways:["It’s a dead zone.", "I have no signal."],completionTitle:"你能指出訊號盲區，並在新地點說明如何恢復聯絡。"};

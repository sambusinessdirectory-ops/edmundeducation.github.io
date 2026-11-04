import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-478-v2-audio","audio","哪項觀察最符合？",["地毯一角離開地面向上翹。", "整張地毯平貼地面，只是顏色褪了。", "地毯中央沾了一圈水漬。", "地毯邊緣被整齊捲起收納。"],"地毯一角離開地面向上翹。","corner 指地毯角；curling up 是邊角向上捲起，可能絆住腳。"),
  mc("native-478-v2-reverse","reverse","走廊地毯只有前方右角翹起，其餘仍貼地。哪句最準？",["The corner of the rug is curling up.", "The whole rug has rolled itself up.", "The rug is shedding fibers.", "The corner of the rug is wet."],"The corner of the rug is curling up.","corner 限定只有地毯一角；curling up 描述角落離地向上捲，不是整張地毯捲走或被水浸濕。"),
  mc("native-478-v2-scene","scene","哪個位置最需要立即提醒 Someone could trip over it？",["翹起的地毯角正伸進常走的門口通道。", "平整地毯放在沒人經過的角落。", "地毯只是顏色變淺，邊緣平貼。", "地毯已捲好放進儲物櫃。"],"翹起的地毯角正伸進常走的門口通道。","行走通道有翹起的邊角，腳尖可能勾到，才需要立即提醒絆倒風險。"),
  mc("native-478-v2-tone","tone","客人快走過那塊翹角地毯。哪句最體貼且具體？",["Watch that corner of the rug—it’s curling up, and you could trip.", "You should know better than to walk there.", "The floor looks unusual, but I won’t say where.", "The rug is perfectly flat, so watch your step."],"Watch that corner of the rug—it’s curling up, and you could trip.","明確指出地毯角及可能絆倒，能讓對方立即避開。"),
  mc("native-478-v2-branch","branch","地毯角已令同事差點踢到；修理膠帶還沒到。哪個臨時處理最有效？",["先把地毯移離通道，或暫時封住該路線。", "繼續讓人經過，等明天再說。", "只把翹角壓一下，不再檢查是否又捲起。", "在地毯旁放一個看不見的小物件。"],"先把地毯移離通道，或暫時封住該路線。","在未能固定翹角前，移離通道或避開該路線可直接減少絆倒風險。"),
  {id:"native-478-v2-transfer",type:'open',style:"transfer",prompt:"新情境：辦公室入口小地毯左角向上翹，早上很多人會經過。寫一兩句英文提醒同事，並提出當下先怎樣處理。",answers:["The corner of the rug is curling up by the entrance. Someone could trip, so let’s move it aside.", "Watch the rug’s left corner—it’s curling up. We should keep people away until it’s fixed.", "The left corner is lifting off the floor. Someone could trip over it; let’s remove the rug for now."],explanation:"要指出入口處翹起的角、絆倒風險，並提出移開或隔離通道。"}
];

const steps=[
  {"id": "native-478-v2-audio", "style": "audio", "label": "先聽形狀", "title": "地毯哪裏翹？", "intro": "先聽句子，定位角落與捲起方向。", "model": "The corner of the rug is curling up.", "zh": "地毯的一角正在向上捲。", "audioOnly": true, "questions": ["native-478-v2-audio"]},
  {"id": "native-478-v2-reverse", "style": "reverse", "label": "把觀察說出", "title": "翹起的角", "intro": "用位置和動作組成準確句子。", "questions": ["native-478-v2-reverse"]},
  {"id": "native-478-v2-scene", "style": "scene", "label": "分辨風險", "title": "人會走過的地方", "intro": "看清翹角和行走路線。", "questions": ["native-478-v2-scene"]},
  {"id": "native-478-v2-tone", "style": "tone", "label": "提醒來客", "title": "不責怪對方", "intro": "簡短說明危險與位置。", "questions": ["native-478-v2-tone"]},
  {"id": "native-478-v2-branch", "style": "branch", "label": "即時處理", "title": "先移開通道", "intro": "選能減少絆倒風險的做法。", "questions": ["native-478-v2-branch"]},
  {"id": "native-478-v2-transfer", "style": "transfer", "label": "新走廊自評", "title": "辦公室入口地毯", "intro": "自己寫位置、風險和處理方法。", "questions": ["native-478-v2-transfer"]}
];

export default {revision:2,summary:"用 The corner of the rug is curling up. 描述地毯角向上捲，並提醒別人可能絆倒。",steps,questions,takeaways:["The corner of the rug is curling up.", "Someone could trip over it."],completionTitle:"你能指出翹起的地毯角，並及時提醒和處理絆倒風險。"};

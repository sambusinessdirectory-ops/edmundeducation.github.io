import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-214-v2-audio","audio","聽到這句，哪部分最可能沒有供電？",["牆上的插座。", "手機電池。", "桌燈本身的開關。", "充電器的插頭。"],"牆上的插座。","outlet 是插座；dead 在這裏表示它沒有電力輸出。"),
  mc("native-214-v2-transfer","transfer","檯燈和手機充電器插在同一插座都不運作；換另一插座都正常。哪句最準確？",["That outlet is dead.", "Both devices have faulty cables.", "The lamp has a burnt-out bulb.", "The wall switch may be off."],"That outlet is dead.","兩件設備在另一插座正常，故障較可能是原來的插座。"),
  mc("native-214-v2-continue","continue","朋友說 My charger works in the kitchen but not here. 你已確認這個牆插座沒電。哪句回應好？",["The outlet is dead. Try the one by the door.", "Your charger is definitely broken.", "Your charger may be loose in that socket.", "Try a different cable in the same outlet."],"The outlet is dead. Try the one by the door.","充電器在廚房正常，故障較可能是這個插座；再提供門旁插座供朋友測試。"),
  {id:"native-214-v2-final",type:'open',style:"final",prompt:"新的情境：酒店房間床邊插座讓兩個充電器都無法充電，但書桌旁插座正常。寫一兩句英文通知前台床邊插座沒電。",answers:["The outlet by the bed is dead. Both chargers work at the desk.", "Could someone check the outlet by the bed? It seems dead, but the desk outlet works.", "The bedside outlet is dead; neither of my chargers works there."],explanation:"指出床邊位置和測試結果，讓前台知道問題在插座。"}
];

const steps=[
  {"id": "native-214-v2-audio", "style": "audio", "label": "先聽設備", "title": "哪裏沒有電？", "intro": "先聽完整句，再回答「哪裏沒有電？」。", "model": "The outlet is dead.", "zh": "插座沒電了。", "audioOnly": true, "questions": ["native-214-v2-audio"]},
  {"id": "native-214-v2-speak", "style": "speak", "label": "口頭報修", "title": "先說故障位置", "intro": "先說出插座失去供電，再聽示範。", "model": "The outlet is dead.", "zh": "插座沒電了。", "speakingPrompt": "插上檯燈卻完全不亮；口頭說「這個插座沒電了」。", "recording": "phrase", "questions": []},
  {"id": "native-214-v2-transfer", "style": "transfer", "label": "換設備測試", "title": "不是燈泡問題", "intro": "同一插座試兩件電器。", "questions": ["native-214-v2-transfer"]},
  {"id": "native-214-v2-continue", "style": "continue", "label": "接續對話", "title": "手機充不了電", "intro": "說明真正的供電問題。", "questions": ["native-214-v2-continue"]},
  {"id": "native-214-v2-final", "style": "final", "label": "新房間自寫", "title": "通知住宿管理員", "intro": "先寫故障與證據，再按示例自評。", "questions": ["native-214-v2-final"]}
];

export default {revision:2,summary:"用 The outlet is dead. 描述牆上插座沒有供電，並與手機沒電區分。",steps,questions,takeaways:["The outlet is dead.", "My phone is dead."],completionTitle:"你能指出插座沒電，並安排檢查另一個插座。"};

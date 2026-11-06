import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-219-v2-audio","audio","聽到這句，手機最可能怎樣？",["畫面亮着，但觸碰沒有任何回應。", "應用程式稍慢但仍可點。", "手機畫面有影像，但點一下要等兩秒才回應。", "畫面能滑動，但只有一個 app 沒反應。"],"畫面亮着，但觸碰沒有任何回應。","unresponsive 指沒有反應；lagging 則是反應慢而非完全無反應。"),
  mc("native-219-v2-transfer","transfer","平板畫面亮着，怎樣滑也沒有回應。哪句合適？",["The tablet screen is unresponsive.", "The tablet battery drains fast.", "The tablet camera won’t focus.", "The tablet is lagging when I swipe."],"The tablet screen is unresponsive.","unresponsive 可用於平板觸控螢幕，重點仍是完全不回應操作。"),
  mc("native-219-v2-repair","repair","手機只是每次點按後等兩秒才回應。你說 The screen is unresponsive. 哪句更準確？",["The phone is lagging.", "The screen is completely unresponsive.", "The battery is dead.", "The outlet is dead."],"The phone is lagging.","仍有回應但延遲，是 lagging；完全無回應才是 unresponsive。"),
  {id:"native-219-v2-final",type:'open',style:"final",prompt:"新的情境：你把手機帶到維修櫃台。畫面仍亮着，但你點任何圖示都沒有反應。寫一兩句英文描述問題。",answers:["The screen is unresponsive. Nothing happens when I tap any icon.", "My phone's screen is on, but it's unresponsive to touch.", "The screen is unresponsive; I can't open any apps even though the display is on."],explanation:"說出亮屏但觸控無反應，讓維修員明白故障不是電池沒電。"}
];

const steps=[
  {"id": "native-219-v2-audio", "style": "audio", "label": "先聽故障", "title": "點螢幕有用嗎？", "intro": "先聽完整句，再回答「點螢幕有用嗎？」。", "model": "The screen is unresponsive.", "zh": "螢幕沒有反應。", "audioOnly": true, "questions": ["native-219-v2-audio"]},
  {"id": "native-219-v2-transfer", "style": "transfer", "label": "換到平板", "title": "同類觸控問題", "intro": "把形容詞用在另一裝置。", "questions": ["native-219-v2-transfer"]},
  {"id": "native-219-v2-repair", "style": "repair", "label": "修正程度", "title": "慢還是沒反應", "intro": "讓描述符合觀察。", "questions": ["native-219-v2-repair"]},
  {"id": "native-219-v2-speak", "style": "speak", "label": "口頭求助", "title": "說明觸控狀況", "intro": "先說出螢幕不回應，再聽示範。", "model": "The screen is unresponsive.", "zh": "螢幕沒有反應。", "speakingPrompt": "手機亮着但滑不動；口頭說「螢幕沒有反應」。", "recording": "phrase", "questions": []},
  {"id": "native-219-v2-final", "style": "final", "label": "新維修自寫", "title": "到櫃台說明", "intro": "先寫症狀和已試操作，再看示例。", "questions": ["native-219-v2-final"]}
];

export default {revision:2,summary:"用 unresponsive 描述手機螢幕亮着，但點按或滑動完全沒有反應；分清 lagging。",steps,questions,takeaways:["The screen is unresponsive.", "The phone is lagging."],completionTitle:"你能區分完全沒有觸控反應與只是運行緩慢。"};

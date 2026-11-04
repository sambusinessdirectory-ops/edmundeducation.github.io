import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-232-v2-audio","audio","聽到這句，最可能看見甚麼？",["大片雲層遮住天空。", "晴朗無雲的藍天。", "正下傾盆大雨。", "天空只有零散小雲，仍見到大片藍天。"],"大片雲層遮住天空。","overcast 指天空被雲覆蓋；它本身不保證正在下雨。"),
  mc("native-232-v2-repair","repair","外面灰濛濛，雲蓋滿天空，但地面是乾的。有人說 It’s raining. 應怎樣改？",["It’s overcast.", "It’s drizzling.", "It’s pouring.", "It’s hailing."],"It’s overcast.","沒有雨點時，overcast 只描述雲層和陰沉天色。"),
  mc("native-232-v2-tone","tone","你看到滿天厚雲，想說可能稍後下雨。哪句最審慎？",["It’s overcast. It might rain later.", "It’s raining hard now, though I can’t see any drops.", "The sky is cloudy, so it must rain right now.", "It’s cloudy, but the sky is mostly blue."],"It’s overcast. It might rain later.","先說可見的陰天，再用 might 表示下雨只是可能。"),
  mc("native-232-v2-rewrite","rewrite","把 The weather is bad 改成具體說法：整片天空被灰雲蓋住。哪句最好？",["It’s overcast today.", "It’s drizzling today.", "It’s humid but sunny.", "The sky is partly cloudy today."],"It’s overcast today.","overcast 精確描述雲層遮天；其他句子說雨、濕度或地面水。"),
  {id:"native-232-v2-final",type:'open',style:"final",prompt:"新的情境：你準備去郊遊，外面沒有下雨，但整片天空都是灰雲。寫一兩句英文告訴朋友天氣，並建議帶傘以防萬一。",answers:["It’s overcast, though it isn’t raining. Let’s bring an umbrella just in case.", "The sky is overcast today. We should take an umbrella in case it rains.", "It’s overcast outside; I’d bring an umbrella just in case."],explanation:"overcast 描述目前雲層；帶傘是基於可能下雨的預防。"}
];

const steps=[
  {"id": "native-232-v2-audio", "style": "audio", "label": "先聽天空", "title": "看得到藍天嗎？", "intro": "先聽句子，再判斷天空。", "model": "It’s overcast.", "zh": "天空陰沉多雲。", "audioOnly": true, "questions": ["native-232-v2-audio"]},
  {"id": "native-232-v2-repair", "style": "repair", "label": "修正天氣", "title": "沒有雨點卻陰陰的", "intro": "找符合觀察的詞。", "questions": ["native-232-v2-repair"]},
  {"id": "native-232-v2-tone", "style": "tone", "label": "審慎預測", "title": "可能下雨", "intro": "分清觀察與預測。", "questions": ["native-232-v2-tone"]},
  {"id": "native-232-v2-rewrite", "style": "rewrite", "label": "具體改寫", "title": "比 bad weather 準", "intro": "由天空畫面選詞。", "questions": ["native-232-v2-rewrite"]},
  {"id": "native-232-v2-final", "style": "final", "label": "新郊遊自寫", "title": "出發前看天", "intro": "自己寫天空狀況和安排，再對照示例。", "questions": ["native-232-v2-final"]}
];

export default {revision:2,summary:"用 overcast 描述天空被厚雲覆蓋、整體灰暗，但不等於已下雨。",steps,questions,takeaways:["It’s overcast.", "It’s overcast today."],completionTitle:"你能區分陰天與正在下雨，並準確描述天空。"};

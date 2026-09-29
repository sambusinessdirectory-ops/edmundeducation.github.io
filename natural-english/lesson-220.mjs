import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-220-v2-audio","audio","聽到這句，最可能發生甚麼？",["剛充好電，電量很快下降。", "電量一直保持百分百。", "手機只在充電時電量緩慢上升。", "電池在使用中維持同一百分比。"],"剛充好電，電量很快下降。","drains fast 指電量快速流失，不是無法開機或插座故障。"),
  mc("native-220-v2-rewrite","rewrite","同事問 Why are you charging your phone again? 哪句最能說明續航問題？",["The battery drains really fast.", "The screen is unresponsive.", "The page won’t load.", "The charger takes a long time to fill it."],"The battery drains really fast.","短時間內再充電，說明電量耗得快；drains 直接描述這個變化。"),
  mc("native-220-v2-contrast","contrast","手機早上充滿，兩小時後只剩 15%。哪句最具體描述過程？",["The battery drains really fast.", "The outlet is dead.", "The screen is cracked.", "The battery is always full."],"The battery drains really fast.","這句說的是電量下降速度；dead 多指已經沒電的結果。"),
  mc("native-220-v2-explain","explain","This app drains my battery. 表示甚麼？",["這個程式令手機電量消耗得快。", "這個程式讓電量保持不變。", "這個程式只會讓螢幕變暗。", "這個程式幫電池省電。"],"這個程式令手機電量消耗得快。","drains my battery 指 app 會耗電；主語是造成耗電的程式。"),
  {id:"native-220-v2-transfer",type:'open',style:"transfer",prompt:"新的情境：平板剛充滿電，開影片程式一小時後只剩少量電。寫一兩句英文告訴朋友電量變化，並指出可能耗電的程式。",answers:["The tablet battery drains really fast. This video app seems to drain it.", "My tablet battery dropped quickly after I opened this video app. I think the app drains it."],explanation:"drains really fast 描述電量下降速度；再用 app drains it 指可能的耗電來源。"}
];

const steps=[
  {"id": "native-220-v2-audio", "style": "audio", "label": "先聽電量", "title": "充完電後怎樣？", "intro": "先聽完整句，再回答「充完電後怎樣？」。", "model": "The battery drains really fast.", "zh": "電池耗電很快。", "audioOnly": true, "questions": ["native-220-v2-audio"]},
  {"id": "native-220-v2-rewrite", "style": "rewrite", "label": "具體描述", "title": "為何又充電？", "intro": "把抱怨說成具體狀況。", "questions": ["native-220-v2-rewrite"]},
  {"id": "native-220-v2-contrast", "style": "contrast", "label": "耗電和沒電", "title": "過程與結果", "intro": "辨認電量下降的過程。", "questions": ["native-220-v2-contrast"]},
  {"id": "native-220-v2-explain", "style": "explain", "label": "找耗電來源", "title": "主語可以是 app", "intro": "理解 drain 的另一種用法。", "questions": ["native-220-v2-explain"]},
  {"id": "native-220-v2-transfer", "style": "transfer", "label": "新情境自評", "title": "平板看影片後掉電", "intro": "轉到「平板看影片後掉電」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-220-v2-transfer"]}
];

export default {revision:2,summary:"用 drains really fast 描述電池電量快速下降，並辨認某個 app 也能耗電。",steps,questions,takeaways:["The battery drains really fast.", "This app drains my battery."],completionTitle:"你能描述電池續航太短，並指出可能耗電的應用程式。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-225-v2-audio","audio","廚房狹窄通道聽到這句，說話者最可能在哪裏？",["正從你的身後經過。", "站在你面前問路。", "正從你的前方走近。", "正從你左側經過。"],"正從你的身後經過。","Behind you 是走近別人背後時的簡短提醒，讓對方知道你的位置。"),
  mc("native-225-v2-repair","repair","在繁忙廚房，你拿着餐盤正從同事背後通過；要用一句最簡短的定位提醒，而非請他讓路。哪句最合適？",["Behind you.", "On your left.", "Excuse me, I need to pass.", "Coming through."],"Behind you.","先說 Behind you 讓對方知道身後有人要經過。"),
  mc("native-225-v2-branch","branch","你在備餐桌前聽到身後有人說 Behind you. 最合適的反應是甚麼？",["先別突然後退，留意對方通過。", "立即向後跨一步。", "立刻轉身面向身後的人。", "一邊後退一邊看向前方。"],"先別突然後退，留意對方通過。","這句提醒身後有人，避免你突然轉身或後退造成碰撞。"),
  mc("native-225-v2-transfer","transfer","你在擁擠列車座位後方通過，怕前面的人突然站起；要簡短說明自己正位於他身後，哪句最準確？",["Behind you.", "On your left.", "Excuse me, may I pass?", "Coming through."],"Behind you.","只要從人身後近距離經過，Behind you 可清楚提醒位置。"),
  {id:"native-225-v2-final",type:'open',style:"final",prompt:"新的情境：你端着一碗熱湯，必須從朋友身後狹窄的空隙走過。寫一句簡短英文提醒朋友你的位置，避免他突然後退。",answers:["Behind you—I’m carrying hot soup.", "Careful, behind you. I’m coming past with soup.", "Behind you. I’ve got hot soup."],explanation:"Behind you 先指出位置；可補上 hot soup 讓朋友更小心。"}
];

const steps=[
  {"id": "native-225-v2-audio", "style": "audio", "label": "先聽提醒", "title": "說話者在哪裏？", "intro": "先聽短句，再推斷位置。", "model": "Behind you.", "zh": "我在你後面。", "audioOnly": true, "questions": ["native-225-v2-audio"]},
  {"id": "native-225-v2-repair", "style": "repair", "label": "修正提醒", "title": "先出聲再過", "intro": "避免直接碰撞。", "questions": ["native-225-v2-repair"]},
  {"id": "native-225-v2-speak", "style": "speak", "label": "即時提醒", "title": "經過同事身後", "intro": "先說出簡短的位置提醒，再聽示範。", "model": "Behind you.", "zh": "我在你後面。", "speakingPrompt": "你在餐廳廚房從同事身後經過；口頭說「我在你後面」。", "recording": "phrase", "questions": []},
  {"id": "native-225-v2-branch", "style": "branch", "label": "下一步動作", "title": "收到提醒後", "intro": "從對方的位置選反應。", "questions": ["native-225-v2-branch"]},
  {"id": "native-225-v2-transfer", "style": "transfer", "label": "換通道", "title": "人多也可提醒", "intro": "把短句轉到另一個狹窄場景。", "questions": ["native-225-v2-transfer"]},
  {"id": "native-225-v2-final", "style": "final", "label": "新情境自寫", "title": "端湯過餐桌", "intro": "自己寫當下會說的話，再看示例。", "questions": ["native-225-v2-final"]}
];

export default {revision:2,summary:"用 Behind you. 提醒別人自己正從他身後通過，並和 Coming through. 比較。",steps,questions,takeaways:["Behind you.", "Coming through."],completionTitle:"你能在狹窄通道及早提醒前方的人，避免碰撞。"};

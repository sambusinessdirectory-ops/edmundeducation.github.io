import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-423-v2-audio","audio","這句對損壞範圍作了甚麼限定？",["多片葉片中有一片彎了。", "每片葉片都彎了。", "整個窗框掉了下來。", "只有拉繩斷了。"],"多片葉片中有一片彎了。","one of the slats 指多片中的一片；bent 描述彎曲，不表示整幅百葉窗都壞了。"),
  mc("native-423-v2-scene","scene","哪個觀察最適合用 One of the slats is bent. 轉述？",["百葉窗中間一片橫條向上拱，其餘平直。", "所有橫條都平直，但拉繩卡住。", "一片橫條不見了，留下空位。", "窗框的一角裂開，橫條仍完好。"],"百葉窗中間一片橫條向上拱，其餘平直。","slat 是百葉窗的單片葉片；其中一片變形向上拱，才是 one slat is bent。"),
  mc("native-423-v2-branch","branch","你說有一片葉片彎了。維修員問 Which one? 哪個回答最有幫助？",["The third slat from the bottom, on the left.", "The whole window is somewhere over there.", "I bought the blinds last year.", "Yes, I know what a slat is."],"The third slat from the bottom, on the left.","Which one? 要求指出具體哪一片；數位置和方向能幫維修員找到它。"),
  {id:"native-423-v2-final",type:'open',style:"final",prompt:"新情境：書房百葉窗只有最底下一片彎了；室友沒看到。寫一句英文描述問題，另加一句指出位置。",answers:["One of the slats is bent. It’s the bottom one.", "The bottom slat of the blinds is bent. The others look fine.", "One of the slats is bent—the one at the very bottom."],explanation:"要保留只有一片受損的範圍，並指出是最底下那片。"}
];

const steps=[
  {"id": "native-423-v2-audio", "style": "audio", "label": "先聽範圍", "title": "壞了多少片？", "intro": "先聽句子，再留意 one of。", "model": "One of the slats is bent.", "zh": "百葉窗其中一片葉片彎了。", "audioOnly": true, "questions": ["native-423-v2-audio"]},
  {"id": "native-423-v2-scene", "style": "scene", "label": "找受損部位", "title": "窗邊的細節", "intro": "比較相近但不同的故障。", "questions": ["native-423-v2-scene"]},
  {"id": "native-423-v2-branch", "style": "branch", "label": "定位葉片", "title": "哪一片？", "intro": "回應對方的追問。", "questions": ["native-423-v2-branch"]},
  {"id": "native-423-v2-speak", "style": "speak", "label": "口頭描述", "title": "向室友說明", "intro": "先說問題，再聽示範。", "model": "One of the slats is bent.", "zh": "百葉窗其中一片葉片彎了。", "speakingPrompt": "你發現百葉窗只有一片橫條彎了；向室友口說「其中一片葉片彎了」。", "recording": "phrase", "questions": []},
  {"id": "native-423-v2-final", "style": "final", "label": "新房間自評", "title": "書房百葉窗", "intro": "自行寫損壞和位置。", "questions": ["native-423-v2-final"]}
];

export default {revision:2,summary:"用 One of the slats is bent. 指出百葉窗其中一片薄片彎曲，並回應 Which one?。",steps,questions,takeaways:["One of the slats is bent.", "Which one?"],completionTitle:"你能指出受損的那一片，而不把整幅百葉窗說成壞掉。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-405-v2-audio","audio","聽到這句，最接近甚麼感覺？",["眨眼像有細沙在磨。", "眼皮外側有乾屑。", "眼睛因洋蔥一直流淚。", "眼內刺癢但沒有沙沙摩擦。"],"眨眼像有細沙在磨。","gritty 指眼內粗糙、似有細沙的感覺；crusty 指眼周乾分泌物。"),
  mc("native-405-v2-explain","explain","gritty 和 itchy 的主要差別是甚麼？",["gritty 像有沙粒摩擦；itchy 是癢。", "gritty 是眼周分泌物；itchy 是流眼淚。", "兩者都只表示視力模糊。", "兩者都只說眼睛正在流淚。"],"gritty 像有沙粒摩擦；itchy 是癢。","兩詞都描述不適，但 gritty 的沙粒摩擦感比 itchy 更具體。"),
  mc("native-405-v2-contrast","contrast","眼角有乾屑叫 crusty；眨眼時眼內像有砂，應叫甚麼？",["gritty", "crusty", "watery", "itchy"],"gritty","gritty 指眼內的沙沙異物感；crusty 是眼周乾屑。"),
  {id:"native-405-v2-final",type:'open',style:"final",prompt:"新的情境：你連續看電腦六小時，眼睛很乾，眨眼時像有細沙。寫一兩句英文告訴同事感覺，並說你想休息一下。",answers:["My eyes feel gritty after staring at the screen. I need a short break.", "My eyes are dry and gritty, so I’m going to step away from the computer.", "After six hours at the screen, my eyes feel gritty. I’ll take a break."],explanation:"用 feel gritty 描述沙沙摩擦感，再提出暫時離開螢幕休息。"}
];

const steps=[
  {"id": "native-405-v2-audio", "style": "audio", "label": "先聽觸感", "title": "眨眼像有甚麼？", "intro": "先聽句子，再判斷眼內感覺。", "model": "My eyes feel gritty.", "zh": "我的眼睛有沙沙異物感。", "audioOnly": true, "questions": ["native-405-v2-audio"]},
  {"id": "native-405-v2-speak", "style": "speak", "label": "口頭描述", "title": "對朋友說乾眼", "intro": "先說出眼內沙沙感，再聽示範。", "model": "My eyes feel gritty.", "zh": "我的眼睛有沙沙感。", "speakingPrompt": "看螢幕太久，眨眼像有細沙；口頭說「我的眼睛有沙沙感」。", "recording": "phrase", "questions": []},
  {"id": "native-405-v2-explain", "style": "explain", "label": "與 itchy 比較", "title": "癢還是摩擦", "intro": "從感覺選詞。", "questions": ["native-405-v2-explain"]},
  {"id": "native-405-v2-contrast", "style": "contrast", "label": "內外分辨", "title": "眼內與眼周", "intro": "分清 gritty 和 crusty。", "questions": ["native-405-v2-contrast"]},
  {"id": "native-405-v2-final", "style": "final", "label": "新工作日自寫", "title": "長時間看螢幕", "intro": "自己寫感覺和下一步，再看示例。", "questions": ["native-405-v2-final"]}
];

export default {revision:2,summary:"用 My eyes feel gritty. 描述乾眼時眨眼像有細沙摩擦，並和 itchy 分清。",steps,questions,takeaways:["My eyes feel gritty.", "My eyes are itchy."],completionTitle:"你能指出眼內沙沙摩擦感，而非只說眼睛癢。"};

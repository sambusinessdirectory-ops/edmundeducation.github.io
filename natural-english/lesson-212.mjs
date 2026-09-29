import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-212-v2-audio","audio","聽到這句，最可能是甚麼問題？",["窗戶可動，但滑動很澀。", "窗戶邊的橡膠條脫落。", "窗戶完全卡死，一點也推不動。", "窗戶滑動順暢，只是鎖扣鬆。"],"窗戶可動，但滑動很澀。","sticking 描述推拉時卡澀，並不等於玻璃破了。"),
  mc("native-212-v2-explain","explain","為何說 The window is sticking，而不是 The window won’t budge？",["因為窗戶要用力才動，但仍能移動。", "因為窗戶完全卡死，毫無移動。", "因為窗戶可以毫不費力滑動。", "因為玻璃上有一道裂縫。"],"因為窗戶要用力才動，但仍能移動。","sticking 是運作不順；won’t budge 暗示完全推不動。"),
  mc("native-212-v2-scene","scene","哪個畫面最適合說 The window is sticking？",["窗框有點澀，要用力才能滑開。", "玻璃有裂痕，但窗戶仍好推。", "窗戶鎖扣鬆了，但滑動正常。", "窗戶大開，沒有阻力。"],"窗框有點澀，要用力才能滑開。","句子描述窗戶推動不順，不是玻璃或窗簾的問題。"),
  {id:"native-212-v2-branch",type:'open',style:"branch",prompt:"新的情境：酒店房間的窗戶還能推開，但要用很大力。朋友問為何不開窗通風。寫一兩句英文說明問題並提出請職員檢查。",answers:["The window is sticking. I’ll ask the front desk to check it.", "It’s hard to slide open because it’s sticking. Let’s ask someone to inspect the track."],explanation:"sticking 指窗戶滑動卡澀但仍可動；補上請職員檢查的下一步。"}
];

const steps=[
  {"id": "native-212-v2-audio", "style": "audio", "label": "先聽狀態", "title": "窗戶怎樣難開？", "intro": "先聽完整句，再回答「窗戶怎樣難開？」。", "model": "The window is sticking.", "zh": "窗戶推動時會卡。", "audioOnly": true, "questions": ["native-212-v2-audio"]},
  {"id": "native-212-v2-explain", "style": "explain", "label": "說明差別", "title": "不是完全動不了", "intro": "辨認卡澀的程度。", "questions": ["native-212-v2-explain"]},
  {"id": "native-212-v2-speak", "style": "speak", "label": "口頭反映", "title": "和室友說", "intro": "先說出窗戶推動時的狀態，再聽示範。", "model": "The window is sticking.", "zh": "窗戶會卡。", "speakingPrompt": "窗戶要用力才推得開；口頭說「窗戶推動時會卡」。", "recording": "phrase", "questions": []},
  {"id": "native-212-v2-scene", "style": "scene", "label": "選合適畫面", "title": "哪扇窗是 sticking？", "intro": "比較不同窗戶問題。", "questions": ["native-212-v2-scene"]},
  {"id": "native-212-v2-branch", "style": "branch", "label": "新情境自評", "title": "客房窗戶很澀", "intro": "轉到「客房窗戶很澀」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-212-v2-branch"]}
];

export default {revision:2,summary:"用 The window is sticking. 描述窗戶難滑動但仍可推開。",steps,questions,takeaways:["The window is sticking.", "The drawer is sticking."],completionTitle:"你能分辨窗戶卡澀與完全卡死，並自然提出處理方式。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-438-v2-audio","audio","這句最可能描述甚麼？",["嘴型和聽到的話對不上時間。", "影片完全沒有聲音。", "畫面顏色偏黃。", "字幕語言選錯。"],"嘴型和聽到的話對不上時間。","out of sync 是時間上未對齊，這裏指聲音和影片動作錯位。"),
  mc("native-438-v2-contrast","contrast","演員嘴巴先動，半秒後你才聽到台詞。哪句最精確？",["The audio is behind the video.", "The video is behind the audio.", "The audio is missing entirely.", "The video is playing without images."],"The audio is behind the video.","聲音晚於嘴型出現，所以 audio 落後於 video；方向不能倒置。"),
  mc("native-438-v2-reverse","reverse","剪輯時鼓槌碰到鼓面後，鼓聲才傳出。哪個問題最可能存在？",["The audio is out of sync.", "The volume is too low.", "The image is too dark.", "The video has no soundtrack."],"The audio is out of sync.","有鼓聲但出現時間晚於擊鼓畫面，問題是同步，不只是音量。"),
  mc("native-438-v2-rewrite","rewrite","同事說 This video feels odd；你觀察到嘴型先於聲音。怎樣改寫最有用？",["The audio is behind the video by about half a second.", "The video is odd because I dislike the actor.", "The audio is probably too quiet, although I can hear it clearly.", "The video has no picture, although the lips are visible."],"The audio is behind the video by about half a second.","指出哪個軌道落後和約略幅度，剪輯者才能針對時間差調整。"),
  {id:"native-438-v2-final",type:'open',style:"final",prompt:"新情境：同事的會議錄影中，畫面上的嘴型總比話音早約一秒。寫一兩句英文向剪輯同事說明問題，並請他檢查聲軌。",answers:["The audio is out of sync; it’s about a second behind the video. Could you check the audio track?", "The voices come after the speakers’ lips move. Please check the audio timing.", "The audio is behind the video by roughly one second. Can you adjust the track?"],explanation:"說明嘴型先、聲音後，最好指出約一秒的落差並請對方檢查聲軌。"}
];

const steps=[
  {"id": "native-438-v2-audio", "style": "audio", "label": "先聽故障", "title": "聲畫合拍嗎？", "intro": "先聽句子，再判斷時間關係。", "model": "The audio is out of sync.", "zh": "聲音跟畫面不同步。", "audioOnly": true, "questions": ["native-438-v2-audio"]},
  {"id": "native-438-v2-contrast", "style": "contrast", "label": "指出方向", "title": "先見嘴動後聽聲", "intro": "判斷誰落後。", "questions": ["native-438-v2-contrast"]},
  {"id": "native-438-v2-reverse", "style": "reverse", "label": "從現象推問題", "title": "鼓點與畫面", "intro": "用新例子推斷不同步。", "questions": ["native-438-v2-reverse"]},
  {"id": "native-438-v2-rewrite", "style": "rewrite", "label": "清楚回報", "title": "從 odd 到具體", "intro": "把模糊評語改為可修問題。", "questions": ["native-438-v2-rewrite"]},
  {"id": "native-438-v2-speak", "style": "speak", "label": "口頭回報", "title": "看片時提醒", "intro": "在「看片時提醒」情境先開口，然後聽錄音核對。", "model": "The audio is out of sync.", "zh": "聲音跟畫面不同步。", "speakingPrompt": "你看到說話者嘴型和聲音對不上；向朋友口說「聲音跟畫面不同步」。", "recording": "phrase", "questions": []},
  {"id": "native-438-v2-final", "style": "final", "label": "新影片自評", "title": "線上會議錄影", "intro": "自己寫現象和請求。", "questions": ["native-438-v2-final"]}
];

export default {revision:2,summary:"用 The audio is out of sync. 描述影片聲音和嘴型時間錯位，並指出聲音落後畫面時的方向。",steps,questions,takeaways:["The audio is out of sync.", "The audio is behind the video."],completionTitle:"你能指出影音不同步及具體落後方向，方便他人調整播放。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-222-v2-audio","audio","通話中聽到這句，最可能是哪種情況？",["說話聲後面有車聲和人聲。", "對方聲音斷斷續續，像網絡不穩。", "對方的咪高峰音量太低。", "通話傳來持續的回音。"],"說話聲後面有車聲和人聲。","background noise 是說話聲以外的環境雜音，會令通話難聽清。"),
  mc("native-222-v2-scene","scene","哪個通話情況最適合說 There’s a lot of background noise on your end？",["對方在繁忙街道上，車聲蓋過說話聲。", "對方說話很清晰但語速快。", "對方的聲音非常小。", "訊號不穩，聲音每隔幾秒斷掉。"],"對方在繁忙街道上，車聲蓋過說話聲。","on your end 明確指出雜音來自對方那一端的環境。"),
  mc("native-222-v2-repair","repair","你聽到對方聲音，但咖啡店音樂太大。哪句比 Your microphone is broken 更準確？",["There’s a lot of background noise on your end.", "Your voice keeps cutting out.", "Your microphone sounds very quiet.", "I can’t hear any sound at all."],"There’s a lot of background noise on your end.","你仍聽到對方說話，問題是環境雜音多，未能判定咪高峰故障。"),
  mc("native-222-v2-tone","tone","對方身後很嘈，你想禮貌地請他移到安靜一點的地方再說。哪句最具體？",["There’s a lot of background noise. Could you move somewhere quieter?", "Your café is too noisy; call me later.", "I can hear some noise, but I’ll try to keep listening.", "You chose a noisy place, so this is your problem."],"There’s a lot of background noise. Could you move somewhere quieter?","先指出聽到的問題，再提出可行請求，不責怪對方。"),
  {id:"native-222-v2-final",type:'open',style:"final",prompt:"新的情境：你和導師視訊，對方附近正在施工，電鑽聲令你聽不清。寫一兩句禮貌英文說明問題，請他換個較安靜的位置或稍後再談。",answers:["There’s a lot of background noise on your end. Could you move somewhere quieter?", "I can hear construction noise behind you. Could we talk when it’s quieter?", "The background noise is making it hard to hear you. Would it be possible to move or call later?"],explanation:"說明雜音來自對方環境，並給對方換位置或改時間的選擇。"}
];

const steps=[
  {"id": "native-222-v2-audio", "style": "audio", "label": "先聽狀況", "title": "聽不清楚的原因", "intro": "先聽完整句，再回答「聽不清楚的原因」。", "model": "There’s a lot of background noise.", "zh": "背景雜音很多。", "audioOnly": true, "questions": ["native-222-v2-audio"]},
  {"id": "native-222-v2-speak", "style": "speak", "label": "口頭指出", "title": "有雜音", "intro": "先口說一句描述電話聲音的話，再聽示範。", "model": "There’s a lot of background noise.", "zh": "背景雜音很多。", "speakingPrompt": "電話另一端有人聲和車聲；口頭說「背景雜音很多」。", "recording": "phrase", "questions": []},
  {"id": "native-222-v2-scene", "style": "scene", "label": "選通話場景", "title": "哪種聲音是背景？", "intro": "比較通話中的不同問題。", "questions": ["native-222-v2-scene"]},
  {"id": "native-222-v2-repair", "style": "repair", "label": "修正問題", "title": "不是麥克風壞了", "intro": "先描述已聽到的現象。", "questions": ["native-222-v2-repair"]},
  {"id": "native-222-v2-tone", "style": "tone", "label": "禮貌請求", "title": "請換個位置", "intro": "比較幾種回應語氣。", "questions": ["native-222-v2-tone"]},
  {"id": "native-222-v2-final", "style": "final", "label": "新通話自寫", "title": "與導師視訊", "intro": "自己寫出問題和請求，再看示例。", "questions": ["native-222-v2-final"]}
];

export default {revision:2,summary:"用 background noise 描述通話時對方身後的雜音，並禮貌請他換安靜位置。",steps,questions,takeaways:["There’s a lot of background noise.", "There’s a lot of background noise on your end."],completionTitle:"你能指出電話另一端的雜音，並自然請對方調整位置。"};

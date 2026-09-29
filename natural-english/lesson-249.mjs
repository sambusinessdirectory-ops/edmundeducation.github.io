import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-249-v2-audio","audio","聽到這句，螢幕最可能怎樣？",["鏡頭畫面一直模糊，點選主體仍不清晰。", "已拍好的照片很清晰。", "相機畫面清晰，但快門按鈕沒有反應。", "鏡頭有水漬，畫面局部模糊。"],"鏡頭畫面一直模糊，點選主體仍不清晰。","won’t focus 指相機拍攝時無法把主體對清楚。"),
  mc("native-249-v2-transfer","transfer","你用平板拍文件，鏡頭一直對不清楚字。哪句可沿用？",["The tablet camera won’t focus.", "The tablet screen is unresponsive.", "The tablet battery drains fast.", "The tablet page won’t load."],"The tablet camera won’t focus.","focus 是相機把拍攝主體變清晰；裝置換成平板仍適用。"),
  mc("native-249-v2-repair","repair","你還沒按快門；即時取景畫面一直模糊。哪句比 The picture is blurry 更準？",["The camera won’t focus.", "The picture came out blurry.", "The photo has been deleted.", "The screen is cracked."],"The camera won’t focus.","畫面還在取景、無法對焦，說 camera won’t focus；picture blurry 常評價已拍成品。"),
  mc("native-249-v2-detail","detail","相機一直對不到焦，你清楚看到一塊油指紋蓋住鏡頭中央。哪個細節最值得先處理？",["鏡頭是否沾了指紋。", "手機螢幕亮度是否太低。", "相機是否被保護殼擋住一角。", "相機是不是切到了自拍鏡頭。"],"鏡頭是否沾了指紋。","鏡頭髒污可能令取景模糊，清潔鏡頭是簡單的排查步驟。"),
  {id:"native-249-v2-final",type:'open',style:"final",prompt:"新的情境：你用手機掃車票上的 QR 碼，但相機畫面一直糊，對不到焦。寫一兩句英文告訴同行朋友問題，並說你要先擦鏡頭。",answers:["The camera won’t focus on the QR code. I’ll clean the lens first.", "My camera keeps showing a blurry image. I’ll wipe the lens and try again.", "The camera won’t focus, so I can’t scan the ticket yet. Let me clean the lens."],explanation:"指出 QR 碼無法對焦，補上先擦鏡頭的具體處理。"}
];

const steps=[
  {"id": "native-249-v2-audio", "style": "audio", "label": "先聽相機", "title": "拍照前畫面怎樣？", "intro": "先聽句子，再判斷拍攝問題。", "model": "The camera won’t focus.", "zh": "相機對不到焦。", "audioOnly": true, "questions": ["native-249-v2-audio"]},
  {"id": "native-249-v2-transfer", "style": "transfer", "label": "換到攝影機", "title": "不只手機", "intro": "把問題轉到另一鏡頭。", "questions": ["native-249-v2-transfer"]},
  {"id": "native-249-v2-repair", "style": "repair", "label": "修正階段", "title": "拍攝中還是拍完後", "intro": "辨認故障發生時間。", "questions": ["native-249-v2-repair"]},
  {"id": "native-249-v2-speak", "style": "speak", "label": "口頭說明", "title": "鏡頭對不清", "intro": "先說出相機對不到焦，再聽示範。", "model": "The camera won’t focus.", "zh": "相機對不到焦。", "speakingPrompt": "手機鏡頭一直模糊，點螢幕也沒用；口頭說「相機對不到焦」。", "recording": "phrase", "questions": []},
  {"id": "native-249-v2-detail", "style": "detail", "label": "排查細節", "title": "先看鏡頭", "intro": "按故障選檢查。", "questions": ["native-249-v2-detail"]},
  {"id": "native-249-v2-final", "style": "final", "label": "新拍攝自寫", "title": "掃描車票 QR 碼", "intro": "自己寫問題和排查，再看示例。", "questions": ["native-249-v2-final"]}
];

export default {revision:2,summary:"用 The camera won’t focus. 描述手機相機畫面持續模糊、無法對焦，並分清成品模糊。",steps,questions,takeaways:["The camera won’t focus.", "The picture is blurry."],completionTitle:"你能說明問題在拍攝時的對焦，並試一個合理排查步驟。"};

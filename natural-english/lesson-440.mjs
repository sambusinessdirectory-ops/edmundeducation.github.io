import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-440-v2-audio","audio","安全帶最可能怎樣？",["拉出後鬆開仍不自動縮回。", "卡在收納處，完全拉不出。", "扣進插槽後無法解開。", "布帶被剪成兩段。"],"拉出後鬆開仍不自動縮回。","retract 是拉出後縮回；won’t retract 指回縮功能失效。"),
  mc("native-440-v2-explain","explain","同事說 The seat belt won't retract. 維修員應先檢查哪個功能？",["放手後的自動回縮。", "安全帶是否能從卷軸拉出。", "插扣的顏色是否一致。", "車門玻璃能否升降。"],"放手後的自動回縮。","retract 指縮回卷軸，故障重點是放手後不回收，而非拉出或車窗。"),
  mc("native-440-v2-transfer","transfer","一把自動捲尺拉出後按回收鈕仍不縮回。哪句自然？",["The tape measure won’t retract.", "The tape measure won’t inflate.", "The tape measure won’t scan.", "The tape measure won’t expire."],"The tape measure won’t retract.","捲尺和安全帶都可拉出再回縮，retract 在這個新物件上仍適用。"),
  {id:"native-440-v2-final",type:'open',style:"final",prompt:"新情境：你在出租車後座拉出安全帶，放手後帶子仍垂著，不會自動縮回。寫一兩句英文向司機說明問題，並請他安排檢查。",answers:["The back seat belt won’t retract when I let go. Could you have it checked?", "This seat belt won’t retract; it stays loose after I release it. Please get it inspected.", "The belt doesn’t pull back in after I let go. Could you check it?"],explanation:"指出鬆開後安全帶不回縮的具體現象，並提出檢查請求。"}
];

const steps=[
  {"id": "native-440-v2-audio", "style": "audio", "label": "先聽動作", "title": "安全帶往哪裏走？", "intro": "先聽句子，再辨認故障。", "model": "The seat belt won't retract.", "zh": "安全帶不會縮回去。", "audioOnly": true, "questions": ["native-440-v2-audio"]},
  {"id": "native-440-v2-explain", "style": "explain", "label": "故障方向", "title": "不是拉不出", "intro": "分清伸出與縮回。", "questions": ["native-440-v2-explain"]},
  {"id": "native-440-v2-transfer", "style": "transfer", "label": "另一設備", "title": "捲尺也會回縮", "intro": "將 retract 用到新物件。", "questions": ["native-440-v2-transfer"]},
  {"id": "native-440-v2-speak", "style": "speak", "label": "口頭報告", "title": "請人檢查", "intro": "在「請人檢查」情境先開口，然後聽錄音核對。", "model": "The seat belt won't retract.", "zh": "安全帶不會縮回去。", "speakingPrompt": "你鬆開安全帶後它仍鬆垂在座位旁；向維修員口說「安全帶不會縮回去」。", "recording": "phrase", "questions": []},
  {"id": "native-440-v2-final", "style": "final", "label": "新車廂自評", "title": "出租車後座", "intro": "自己寫故障和請求。", "questions": ["native-440-v2-final"]}
];

export default {revision:2,summary:"用 The seat belt won't retract. 描述安全帶拉出後不能自動縮回固定位置。",steps,questions,takeaways:["The seat belt won't retract.", "It won't retract."],completionTitle:"你能準確描述安全帶回縮故障，並向服務人員報告。"};

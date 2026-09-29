import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-228-v2-audio","audio","聽到這句，你知道甚麼？",["他最後沒有到場。", "他比預定早到。", "他已經離開但曾到場。", "他改了集合地點。"],"他最後沒有到場。","didn’t show up 直接說沒有出現；不一定知道原因。"),
  mc("native-228-v2-branch","branch","你說 Mike didn’t show up at the meeting. 同事最自然追問甚麼？",["Did he say why?", "Did he arrive early?", "What did he say during the meeting?", "Did he message before the meeting?"],"Did he say why?","人沒有到場，合理的下一步是問是否有缺席原因。"),
  mc("native-228-v2-explain","explain","同事沒來大型會議，你只知道他缺席。為何先用 didn’t show up 較準？",["它只報告未到場，不額外暗示他放我鴿子。", "它表示他一定故意欺騙我。", "它表示他事先改了時間並通知大家。", "它表示他已經到過，只是提早離開。"],"它只報告未到場，不額外暗示他放我鴿子。","stood me up 常用於約好見面而使人空等；didn’t show up 只說缺席。"),
  mc("native-228-v2-transfer","transfer","義工答應早上九點來幫忙，到了十點仍未出現。哪句可用？",["He didn’t show up.", "He moved the meeting up.", "He called the event off.", "He arrived but left early."],"He didn’t show up.","show up 指到場；答應來卻沒有到，可說 didn’t show up。"),
  {id:"native-228-v2-final",type:'open',style:"final",prompt:"新的情境：隊友答應參加早晨訓練，大家等了二十分鐘，他沒有出現。寫一兩句英文向教練報告。",answers:["He didn’t show up for practice. We waited twenty minutes.", "Our teammate didn’t show up this morning, although we waited for him.", "He said he’d come, but he didn’t show up. We waited twenty minutes."],explanation:"didn’t show up 報告未到場；加等待時間讓教練知道情況。"}
];

const steps=[
  {"id": "native-228-v2-audio", "style": "audio", "label": "先聽結果", "title": "人來了嗎？", "intro": "先聽句子，再判斷出席情況。", "model": "He didn’t show up.", "zh": "他沒有出現。", "audioOnly": true, "questions": ["native-228-v2-audio"]},
  {"id": "native-228-v2-speak", "style": "speak", "label": "口頭報告", "title": "會議缺席", "intro": "先說出他未到場的結果，再聽示範。", "model": "He didn’t show up.", "zh": "他沒有出現。", "speakingPrompt": "同事問 Jason 是否來開會；口頭說「他沒有出現」。", "recording": "phrase", "questions": []},
  {"id": "native-228-v2-branch", "style": "branch", "label": "對話分支", "title": "原因仍未知", "intro": "根據缺席消息接話。", "questions": ["native-228-v2-branch"]},
  {"id": "native-228-v2-explain", "style": "explain", "label": "說法範圍", "title": "缺席與失約", "intro": "比較一般缺席和私人約會。", "questions": ["native-228-v2-explain"]},
  {"id": "native-228-v2-transfer", "style": "transfer", "label": "換到義工活動", "title": "出席承諾沒兌現", "intro": "同一句用在另一活動。", "questions": ["native-228-v2-transfer"]},
  {"id": "native-228-v2-final", "style": "final", "label": "新活動自寫", "title": "球隊少了一人", "intro": "先寫出缺席和影響，再看示例。", "questions": ["native-228-v2-final"]}
];

export default {revision:2,summary:"用 didn’t show up 表示原本答應來的人最後未到場，並和 stood me up 區分。",steps,questions,takeaways:["He didn’t show up.", "He stood me up."],completionTitle:"你能報告某人未到場，並在私人約會情境辨認更具體的說法。"};

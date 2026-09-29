import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-181-v2-audio","audio","會議本來在下午兩點；聽到這個詞組，最可能要怎樣改？",["改到下午三點。", "改到下午一點。", "把會議取消。", "維持下午兩點。"],"改到下午三點。","push back 把會議推到較遲的時間；三點比原定兩點遲。"),
  mc("native-181-v2-contrast","contrast","原定兩點的會議改到一點。哪個說法準確？",["Move the meeting up to 1.", "Push the meeting back to 1.", "Call the meeting off at 1.", "Keep the meeting at 2."],"Move the meeting up to 1.","一點比兩點早，所以用 move up；push back 會指較遲。"),
  mc("native-181-v2-reverse","reverse","主管說：原定下午四點開會，現在改為五點。這個變化最接近哪個詞組？",["push the meeting back", "move the meeting up", "call the meeting off", "keep the meeting as planned"],"push the meeting back","五點比四點遲；push back 是延後，不是取消。"),
  {id:"native-181-v2-final",type:'open',style:"final",prompt:"新的情境：團隊原定星期四上午十點開會，但你十一點才有空。寫一句英文訊息，提議把會議延到十一點，並清楚說出新時間。",answers:["Could we push the meeting back to 11?", "Can we push Thursday's meeting back to 11 a.m.?", "Would it be possible to push our meeting back to 11?"],explanation:"用 push back to 加新的較遲時間；寫出十一點，對方才知道你提議的安排。"}
];

const steps=[
  {"id": "native-181-v2-audio", "style": "audio", "label": "先聽方向", "title": "時間往哪邊改？", "intro": "先只聽詞組，再判斷時間方向。", "model": "push the meeting back", "zh": "把會議延後。", "audioOnly": true, "questions": ["native-181-v2-audio"]},
  {"id": "native-181-v2-contrast", "style": "contrast", "label": "比較方向", "title": "延後還是提前？", "intro": "用兩個時間表達作比較。", "questions": ["native-181-v2-contrast"]},
  {"id": "native-181-v2-speak", "style": "speak", "label": "口頭改期", "title": "先自己提出來", "intro": "先口說；錄音或跳過後再聽示範。", "model": "push the meeting back", "zh": "把會議延後。", "speakingPrompt": "原定三點的會議要延到四點。先口頭說出「把會議延後」這個關鍵詞組。", "recording": "phrase", "questions": []},
  {"id": "native-181-v2-reverse", "style": "reverse", "label": "從意思選詞", "title": "把意思倒過來看", "intro": "看安排的變化，再選合適動詞。", "questions": ["native-181-v2-reverse"]},
  {"id": "native-181-v2-final", "style": "final", "label": "新時間挑戰", "title": "改到較遲的一刻", "intro": "先寫自己的訊息，再看示例自評。", "questions": ["native-181-v2-final"]}
];

export default {revision:2,summary:"分清 push a meeting back 是改到較遲，而 move it up 是改到較早；練習說出新時間。",steps,questions,takeaways:["push the meeting back", "Can we move the meeting up to 1?"],completionTitle:"你能清楚說明會議改到較遲的時間，也能辨認提前的說法。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-223-v2-audio","audio","聽到這句，意外涉及哪個部位？",["他的腳。", "他的肩膀。", "他的手肘。", "他的頭髮。"],"他的腳。","step on someone’s foot 指腳踩在對方腳上；his 表示說話者談論另一名男子。"),
  mc("native-223-v2-explain","explain","你不小心踩到面前的人，現在直接向他道歉。哪句正確？",["Sorry, I stepped on your foot.", "Sorry, I stepped on his foot.", "Sorry, you stepped on my foot.", "Sorry, I bumped your shoulder."],"Sorry, I stepped on your foot.","直接對當事人說用 your；his 用於向第三者描述他。"),
  mc("native-223-v2-tone","tone","你剛踩到陌生人的腳，哪句立即回應最得體？",["Oh, sorry! I stepped on your foot.", "Move your foot out of my way.", "That didn’t happen, so be quiet.", "You should apologize to me."],"Oh, sorry! I stepped on your foot.","先道歉，再承認剛才踩到對方的腳；your 對當事人說。"),
  mc("native-223-v2-continue","continue","朋友問 Why did that man say “Ow”? 你剛不小心踩到他的腳。哪句好？",["I accidentally stepped on his foot.", "I accidentally tapped his shoulder.", "I accidentally bumped his elbow.", "I accidentally dropped his bag."],"I accidentally stepped on his foot.","這句說清踩到的部位，也用 accidentally 表明無意。"),
  {id:"native-223-v2-final",type:'open',style:"final",prompt:"新的情境：戲院散場很擠，你不小心踩到前面女士的腳。寫一兩句英文直接向她道歉，說明發生了甚麼。",answers:["I’m sorry! I accidentally stepped on your foot.", "Oh, sorry, I stepped on your foot. Are you okay?", "I’m so sorry. I didn’t see your foot and stepped on it."],explanation:"對當事人用 your foot，並以 sorry 和 accidentally 表示歉意及無意。"}
];

const steps=[
  {"id": "native-223-v2-audio", "style": "audio", "label": "先聽意外", "title": "碰到哪個部位？", "intro": "先聽完整句，再回答「碰到哪個部位？」。", "model": "I stepped on his foot.", "zh": "我踩到了他的腳。", "audioOnly": true, "questions": ["native-223-v2-audio"]},
  {"id": "native-223-v2-explain", "style": "explain", "label": "代名詞轉換", "title": "對本人怎樣說？", "intro": "分清對人說和談論人。", "questions": ["native-223-v2-explain"]},
  {"id": "native-223-v2-speak", "style": "speak", "label": "口頭描述", "title": "向朋友交代", "intro": "先說出剛才踩腳的意外，再聽示範。", "model": "I stepped on his foot.", "zh": "我踩到他的腳。", "speakingPrompt": "你在擠迫車廂踩到一名男子的腳；口頭向朋友說「我踩到他的腳」。", "recording": "phrase", "questions": []},
  {"id": "native-223-v2-tone", "style": "tone", "label": "立即道歉", "title": "擠迫人群中", "intro": "比較道歉的語氣。", "questions": ["native-223-v2-tone"]},
  {"id": "native-223-v2-continue", "style": "continue", "label": "接續談話", "title": "朋友問發生甚麼", "intro": "從意外選準確回應。", "questions": ["native-223-v2-continue"]},
  {"id": "native-223-v2-final", "style": "final", "label": "新地方自寫", "title": "戲院出口意外", "intro": "自己寫描述和道歉，再對照示例。", "questions": ["native-223-v2-final"]}
];

export default {revision:2,summary:"用 stepped on his foot 描述踩到某人的腳，並正確轉換 his 與 your。",steps,questions,takeaways:["I stepped on his foot.", "I stepped on a piece of glass."],completionTitle:"你能向當事人道歉，並向第三者準確描述踩腳意外。"};

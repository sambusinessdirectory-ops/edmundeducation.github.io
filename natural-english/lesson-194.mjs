import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-194-v2-audio","audio","在電梯裏聽到這句，靠近按鈕的人應按哪個鍵？",["五樓。", "一樓。", "開門鍵。", "關門鍵。"],"五樓。","press five 在電梯情境指按五樓的按鈕。"),
  mc("native-194-v2-tone","tone","按鈕被陌生人擋住，你想請他按五樓。哪句最得體？",["Excuse me, could you press five?", "Press five for me.", "Move aside so I can press five.", "I need to get to five; move over."],"Excuse me, could you press five?","Excuse me 加 Could you 使請求禮貌清楚。"),
  mc("native-194-v2-reverse","reverse","你只想禮貌說「五樓，麻煩」，也可以怎樣說？",["Five, please.", "At five, please.", "Five people, please.", "Five dollars, please."],"Five, please.","電梯裏站在按鈕旁的人問樓層時，Five, please 是簡短自然的回答。"),
  mc("native-194-v2-rewrite","rewrite","把「Press five!」改成適合對陌生人說的句子，哪個最好？",["Could you press five, please?", "I’m going to the fifth floor.", "Please make room by the buttons.", "Could you press the close-door button?"],"Could you press five, please?","Could you … please? 是禮貌請求；意思仍是請對方按五樓。"),
  {id:"native-194-v2-final",type:'open',style:"final",prompt:"新的情境：你提着兩袋東西上電梯，想去八樓，按鈕旁有鄰居。寫一句禮貌英文，請對方幫你按八樓。",answers:["Excuse me, could you press eight for me?", "Could you press eight, please?", "Eight, please, if you don't mind."],explanation:"延用 Could you press 加樓層；新情境要把 five 換成 eight。"}
];

const steps=[
  {"id": "native-194-v2-audio", "style": "audio", "label": "聽出樓層", "title": "要按哪個鍵？", "intro": "先聽問句再判斷。", "model": "Could you press five?", "zh": "可以幫我按五樓嗎？", "audioOnly": true, "questions": ["native-194-v2-audio"]},
  {"id": "native-194-v2-tone", "style": "tone", "label": "禮貌程度", "title": "向陌生人請幫忙", "intro": "比較直接命令和請求。", "questions": ["native-194-v2-tone"]},
  {"id": "native-194-v2-speak", "style": "speak", "label": "口頭請求", "title": "你離按鈕太遠", "intro": "先自己說；錄音或跳過後再聽示範。", "model": "Could you press five?", "zh": "可以幫我按五樓嗎？", "speakingPrompt": "在電梯裏你離按鈕很遠，口頭請人幫你按五樓。", "recording": "phrase", "questions": []},
  {"id": "native-194-v2-reverse", "style": "reverse", "label": "由中文選句", "title": "五樓，麻煩你", "intro": "把具體目的變成英文。", "questions": ["native-194-v2-reverse"]},
  {"id": "native-194-v2-rewrite", "style": "rewrite", "label": "改寫命令", "title": "由生硬到禮貌", "intro": "把指令改成請求。", "questions": ["native-194-v2-rewrite"]},
  {"id": "native-194-v2-final", "style": "final", "label": "新樓層訊息", "title": "請按另一層", "intro": "先寫新場景中的話，再對照自評。", "questions": ["native-194-v2-final"]}
];

export default {revision:2,summary:"在電梯裏用 Could you press five? 禮貌請靠近按鈕的人幫忙按五樓。",steps,questions,takeaways:["Could you press five?", "Five, please."],completionTitle:"你能在電梯裏自然請人幫忙按樓層。"};

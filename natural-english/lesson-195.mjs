import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-195-v2-audio","audio","聽到這句，對方最應該做甚麼？",["把鹽遞給說話者。", "替說話者拿一個新的鹽樽。", "替說話者的食物加鹽。", "告訴說話者鹽在哪裏。"],"把鹽遞給說話者。","pass me 表示遞給我；這是餐桌上拿不到鹽時的請求。"),
  mc("native-195-v2-rewrite","rewrite","鹽在朋友面前，哪句話最適合請他遞過來？",["Could you pass me the salt?", "Could you add salt to my soup?", "Could you tell me where the salt is?", "Could you put the salt shaker away?"],"Could you pass me the salt?","pass me the salt 指把鹽遞給我，不是煮鹽或丟掉。"),
  mc("native-195-v2-reverse","reverse","Could you pass me the salt? 也可以自然說成哪句？",["Could you pass the salt?", "Could you pass the pepper?", "Could you refill the salt shaker?", "Could you put the salt away?"],"Could you pass the salt?","pass the salt 省去 me，在餐桌上仍能清楚表達請對方遞鹽。"),
  mc("native-195-v2-tone","tone","和不太熟的晚餐客人同桌，你想直接而禮貌地請他把鹽遞過來。哪句最合適？",["Could you pass me the salt, please?", "Give me the salt.", "Salt. Now.", "I’d like some salt if you’re finished with it."],"Could you pass me the salt, please?","Could you 加 please 是有禮貌的請求，適合同桌但不熟的人。"),
  {id:"native-195-v2-final",type:'open',style:"final",prompt:"新的情境：晚餐時辣醬在哥哥旁邊，你想加一點，但拿不到。寫一句禮貌英文請他遞辣醬。",answers:["Could you pass me the hot sauce, please?", "Could you pass the hot sauce?", "Please could you pass me the hot sauce?"],explanation:"沿用 Could you pass me/the …?，把 salt 換成 hot sauce。"}
];

const steps=[
  {"id": "native-195-v2-audio", "style": "audio", "label": "聽出動作", "title": "對方要做甚麼？", "intro": "先聽問句，再判斷動作。", "model": "Could you pass me the salt?", "zh": "可以把鹽遞給我嗎？", "audioOnly": true, "questions": ["native-195-v2-audio"]},
  {"id": "native-195-v2-speak", "style": "speak", "label": "先開口", "title": "鹽在對面", "intro": "先口說；錄音或跳過後才聽示範。", "model": "Could you pass me the salt?", "zh": "可以把鹽遞給我嗎？", "speakingPrompt": "餐桌上的鹽在朋友那邊，你拿不到；口頭請他遞給你。", "recording": "phrase", "questions": []},
  {"id": "native-195-v2-rewrite", "style": "rewrite", "label": "請求改寫", "title": "不伸手越過人", "intro": "把目的寫成自然請求。", "questions": ["native-195-v2-rewrite"]},
  {"id": "native-195-v2-reverse", "style": "reverse", "label": "換種結構", "title": "不說 me 也可以", "intro": "選語意相同的簡短版本。", "questions": ["native-195-v2-reverse"]},
  {"id": "native-195-v2-tone", "style": "tone", "label": "語氣比較", "title": "禮貌請求", "intro": "比較同一目的的說法。", "questions": ["native-195-v2-tone"]},
  {"id": "native-195-v2-final", "style": "final", "label": "新桌上物品", "title": "請遞辣醬", "intro": "自己寫新場景的請求，再按示例自評。", "questions": ["native-195-v2-final"]}
];

export default {revision:2,summary:"用 Could you pass me the salt? 在餐桌上禮貌請人遞鹽，並練習換成其他桌上物品。",steps,questions,takeaways:["Could you pass me the salt?", "Could you pass the salt?"],completionTitle:"你能禮貌請人遞過餐桌上拿不到的東西。"};

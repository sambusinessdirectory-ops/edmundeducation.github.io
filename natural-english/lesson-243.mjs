import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-243-v2-audio","audio","聽到這句，紙上最可能出現甚麼？",["字跡被拖成模糊墨痕。", "字跡乾爽清晰。", "墨水顏色變淡，因為筆快沒墨。", "紙被水浸濕，字跡向四周擴散。"],"字跡被拖成模糊墨痕。","smeared 指墨水受擦碰而散開，留下模糊痕跡。"),
  mc("native-243-v2-contrast","contrast","剛簽完名手一擦，墨水被拖開，紙上有模糊墨痕。哪句描述發生的事？",["The ink smeared.", "The ink was already dry when touched.", "The pen ran dry before the last letter.", "The signature was rewritten on a new page."],"The ink smeared.","smeared 描述墨水擦開；smudge 可指留下的模糊污痕。"),
  mc("native-243-v2-rewrite","rewrite","你的簽名仍在，但末端拖出一片黑痕。哪句比 My pen is empty 更準？",["The ink smeared before it dried.", "The pen ran out halfway.", "The ink is too faint to read.", "The pen stopped writing halfway."],"The ink smeared before it dried.","簽名還在紙上，只是未乾的墨水被袖口碰開；這和筆沒墨是不同問題。"),
  {id:"native-243-v2-final",type:'open',style:"final",prompt:"新的情境：你剛在表格上簽名，墨水未乾就碰到袖口，簽名被擦花。寫一兩句英文向職員說明並請求另一張表格。",answers:["The ink smeared when my sleeve touched it. Could I have another form?", "My signature smeared before the ink dried. May I fill out a new form?", "Sorry, the ink smeared on this form. Could you give me a clean copy?"],explanation:"用 smeared 說明墨水被擦開，再提出換表格的具體請求。"}
];

const steps=[
  {"id": "native-243-v2-audio", "style": "audio", "label": "先聽結果", "title": "字為何糊了？", "intro": "先聽句子，再想像紙面。", "model": "The ink smeared.", "zh": "墨水被擦開了。", "audioOnly": true, "questions": ["native-243-v2-audio"]},
  {"id": "native-243-v2-contrast", "style": "contrast", "label": "動作與痕跡", "title": "smear 和 smudge", "intro": "辨認發生的事與留下的痕。", "questions": ["native-243-v2-contrast"]},
  {"id": "native-243-v2-speak", "style": "speak", "label": "口頭報告", "title": "簽名擦花了", "intro": "先說出墨水擦開的結果，再聽示範。", "model": "The ink smeared.", "zh": "墨水擦花了。", "speakingPrompt": "剛寫完字手掃過紙面；口頭說「墨水被擦開了」。", "recording": "phrase", "questions": []},
  {"id": "native-243-v2-rewrite", "style": "rewrite", "label": "具體改寫", "title": "不是筆沒墨", "intro": "由紙面痕跡判斷。", "questions": ["native-243-v2-rewrite"]},
  {"id": "native-243-v2-final", "style": "final", "label": "新文件自寫", "title": "合同簽名被擦花", "intro": "自己寫原因和下一步，再按示例自評。", "questions": ["native-243-v2-final"]}
];

export default {revision:2,summary:"用 The ink smeared. 描述濕墨水被擦開，並分清紙上的 smudge 痕跡。",steps,questions,takeaways:["The ink smeared.", "There’s a smudge on the page."],completionTitle:"你能描述墨水擦開的過程及紙上留下的污痕。"};

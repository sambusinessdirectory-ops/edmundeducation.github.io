import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-211-v2-audio","audio","聽到這句，抽屜最可能怎樣？",["能拉開，但要多用力。", "抽屜完全卡死，一毫米也拉不動。", "抽屜能輕鬆拉開，只是把手鬆了。", "抽屜滑軌發出聲音但移動順暢。"],"能拉開，但要多用力。","sticking 指動作澀、卡住，但並非一定完全打不開。"),
  mc("native-211-v2-rewrite","rewrite","把 The drawer is broken 改成更準確的描述：它仍可開，但要用力拉。哪句最好？",["The drawer is sticking.", "The drawer won’t budge at all.", "The drawer handle is loose.", "The drawer squeaks but slides smoothly."],"The drawer is sticking.","這句指出拉動時卡澀，比籠統說 broken 更精確。"),
  mc("native-211-v2-contrast","contrast","抽屜最後仍可拉開，只是很澀。哪句比 The drawer is stuck 更精確？",["The drawer is sticking.", "The drawer won’t budge.", "The drawer is locked shut.", "The drawer has fallen apart."],"The drawer is sticking.","sticking 描述移動時反覆卡澀；won’t budge 才表示完全不動。"),
  {id:"native-211-v2-final",type:'open',style:"final",prompt:"新的情境：辦公室文件櫃的下層抽屜每次拉開都很卡，但用力仍能打開。寫一句英文向管理員描述問題並請人檢查。",answers:["The bottom drawer is sticking; could someone take a look?", "The filing cabinet's bottom drawer keeps sticking. Can we have it checked?", "Could you check the bottom drawer? It’s sticking when I pull it out."],explanation:"指出 bottom drawer 和 sticking，讓管理員知道是哪個抽屜及具體問題。"}
];

const steps=[
  {"id": "native-211-v2-audio", "style": "audio", "label": "先聽故障", "title": "抽屜能拉開嗎？", "intro": "先聽完整句，再回答「抽屜能拉開嗎？」。", "model": "The drawer is sticking.", "zh": "抽屜拉動時會卡。", "audioOnly": true, "questions": ["native-211-v2-audio"]},
  {"id": "native-211-v2-speak", "style": "speak", "label": "口頭反映", "title": "向室友說明", "intro": "先說出抽屜拉動時的問題，再聽示範。", "model": "The drawer is sticking.", "zh": "抽屜會卡。", "speakingPrompt": "抽屜每次都很難拉；口頭說「抽屜拉動時會卡」。", "recording": "phrase", "questions": []},
  {"id": "native-211-v2-rewrite", "style": "rewrite", "label": "具體改寫", "title": "不是籠統壞了", "intro": "用動作細節說準問題。", "questions": ["native-211-v2-rewrite"]},
  {"id": "native-211-v2-contrast", "style": "contrast", "label": "比較程度", "title": "卡澀與完全卡死", "intro": "根據是否還能移動選詞。", "questions": ["native-211-v2-contrast"]},
  {"id": "native-211-v2-final", "style": "final", "label": "新櫃子自寫", "title": "向管理員報修", "intro": "先寫，再依示例自評。", "questions": ["native-211-v2-final"]}
];

export default {revision:2,summary:"用 sticking 描述抽屜仍可拉動但很澀、經常卡住。",steps,questions,takeaways:["The drawer is sticking.", "This drawer keeps sticking."],completionTitle:"你能具體描述抽屜難拉的狀況，並提出下一步。"};

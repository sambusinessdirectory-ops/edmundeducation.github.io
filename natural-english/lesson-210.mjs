import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-210-v2-audio","audio","聽到這句，鍵盤最可能出現甚麼？",["某鍵按下後回彈不順。", "某鍵完全不回應按壓。", "空白鍵彈回來的速度很慢。", "鍵盤連線偶爾中斷。"],"某鍵按下後回彈不順。","sticking 指按鍵卡住、動作不順，不代表整部鍵盤完全失效。"),
  mc("native-210-v2-contrast","contrast","空白鍵有時按得下，但會卡着慢慢彈回。哪句最準確？",["The space bar is sticking.", "The space bar is missing.", "The space bar has no label.", "The space bar is fully responsive."],"The space bar is sticking.","回彈不順是 sticking；missing 是整顆鍵不見。"),
  mc("native-210-v2-rewrite","rewrite","把 My keyboard is broken 改成更具體的描述：只有一顆鍵常卡着。哪句最好？",["One key keeps sticking.", "Every key has fallen off.", "The screen is unresponsive.", "The battery drains fast."],"One key keeps sticking.","指出一顆鍵反覆卡住，比籠統說整部鍵盤壞了更準。"),
  mc("native-210-v2-scene","scene","抽屜能拉開但每次都很澀，也可怎樣說？",["The drawer is sticking.", "The drawer is squeaking loudly.", "The drawer won’t budge at all.", "The drawer slides smoothly."],"The drawer is sticking.","sticking 也可指抽屜移動時卡、不順。"),
  {id:"native-210-v2-final",type:'open',style:"final",prompt:"新的情境：筆電的 Enter 鍵按下後常停在低位，你得再按一次才彈回。寫一兩句英文向維修員說明。",answers:["The Enter key is sticking. It doesn't spring back right away.", "My Enter key keeps sticking when I press it.", "The key is sticking, especially the Enter key. It sometimes stays down."],explanation:"sticking 精確描述按下後卡住；指出 Enter 鍵和回彈問題。"}
];

const steps=[
  {"id": "native-210-v2-audio", "style": "audio", "label": "先聽故障", "title": "按鍵怎樣了？", "intro": "先聽完整句，再回答「按鍵怎樣了？」。", "model": "The key is sticking.", "zh": "按鍵按下去會卡。", "audioOnly": true, "questions": ["native-210-v2-audio"]},
  {"id": "native-210-v2-contrast", "style": "contrast", "label": "卡住或失靈", "title": "還能按，但不順", "intro": "比較兩種按鍵問題。", "questions": ["native-210-v2-contrast"]},
  {"id": "native-210-v2-rewrite", "style": "rewrite", "label": "具體說明", "title": "不要只說壞了", "intro": "從現象選精確句。", "questions": ["native-210-v2-rewrite"]},
  {"id": "native-210-v2-scene", "style": "scene", "label": "另一個會卡的物件", "title": "sticking 的範圍", "intro": "把動詞用於相似動作。", "questions": ["native-210-v2-scene"]},
  {"id": "native-210-v2-final", "style": "final", "label": "新鍵盤自寫", "title": "向維修員交代", "intro": "自己寫故障描述，再按示例自評。", "questions": ["native-210-v2-final"]}
];

export default {revision:2,summary:"用 sticking 描述鍵盤按鍵能按下但回彈不順，並分清完全失靈。",steps,questions,takeaways:["The key is sticking.", "The drawer is sticking."],completionTitle:"你能指出鍵盤按鍵卡住，而不是完全壞掉。"};

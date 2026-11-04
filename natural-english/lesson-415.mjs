import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-415-v2-audio","audio","洗衣機脫水時聽到這句，最可能看見甚麼？",["厚衣服全堆在滾筒一邊。", "衣物平均分散，機器很平穩。", "洗衣粉盒完全空了。", "機門只是沒有關緊。"],"厚衣服全堆在滾筒一邊。","unbalanced load 指衣物重量偏到一側，脫水時可能令機器震動。"),
  mc("native-415-v2-repair","repair","洗衣機震動很大，打開看見厚毛巾全部聚在一邊。哪句比 The washer is broken 更具體？",["The load is unbalanced.", "The detergent is missing.", "The drain hose is leaking.", "The door latch is loose."],"The load is unbalanced.","衣物集中一側是直接可見的負載問題，先調整分佈，不必先斷定機器壞了。"),
  mc("native-415-v2-detail","detail","The load is unbalanced. 你關掉機器後最直接應做甚麼？",["Redistribute the clothes more evenly in the drum.", "Add all remaining towels to the same side.", "Change only the detergent brand.", "Ignore the shaking and restart at maximum speed."],"Redistribute the clothes more evenly in the drum.","把衣物重新分散能改善重量偏一側的問題，正對 unbalanced 的原因。"),
  mc("native-415-v2-transfer","transfer","洗一條厚毯和幾件輕衣，脫水時毯子捲到單側。哪句仍適用？",["The load is unbalanced.", "The clothes are color-transferred.", "The machine isn’t cooling properly.", "The blanket has a loose thread."],"The load is unbalanced.","即使衣物種類改變，只要重量集中單側，仍是 unbalanced load。"),
  {id:"native-415-v2-final",type:'open',style:"final",prompt:"新的情境：洗床單和毛巾時，床單把所有毛巾裹到一邊，洗衣機脫水狂震。寫一兩句英文告訴室友問題和你要怎樣處理。",answers:["The load is unbalanced because the towels are caught on one side. I’ll stop the washer and redistribute them.", "The washer is shaking because the load is unbalanced. Let me spread the towels out.", "The sheet wrapped around the towels, so the load is unbalanced. I’ll rearrange it before restarting."],explanation:"指出衣物偏重造成震動，再說停機並重新分散，與新場景相符。"}
];

const steps=[
  {"id": "native-415-v2-audio", "style": "audio", "label": "先聽洗衣機", "title": "為何劇烈震動？", "intro": "先聽句子，再判斷滾筒內情況。", "model": "The load is unbalanced.", "zh": "衣物負載分佈不均。", "audioOnly": true, "questions": ["native-415-v2-audio"]},
  {"id": "native-415-v2-repair", "style": "repair", "label": "修正故障判斷", "title": "不是必然壞機", "intro": "根據衣物位置選原因。", "questions": ["native-415-v2-repair"]},
  {"id": "native-415-v2-speak", "style": "speak", "label": "口頭報告", "title": "脫水聲很大", "intro": "先說出衣物偏一側，再聽示範。", "model": "The load is unbalanced.", "zh": "衣物分佈不平均。", "speakingPrompt": "洗衣機震動，衣物全在滾筒一側；口頭說「負載不平衡」。", "recording": "phrase", "questions": []},
  {"id": "native-415-v2-detail", "style": "detail", "label": "下一個動作", "title": "把衣物重新鋪開", "intro": "由原因選處理方法。", "questions": ["native-415-v2-detail"]},
  {"id": "native-415-v2-transfer", "style": "transfer", "label": "換衣物組合", "title": "厚毯子也會偏重", "intro": "把概念轉到另一批衣物。", "questions": ["native-415-v2-transfer"]},
  {"id": "native-415-v2-final", "style": "final", "label": "新洗衣自評", "title": "床單裹住毛巾", "intro": "自己寫原因與下一步，再看示例。", "questions": ["native-415-v2-final"]}
];

export default {revision:2,summary:"用 The load is unbalanced. 描述洗衣機衣物偏到一側，脫水時劇烈震動。",steps,questions,takeaways:["The load is unbalanced.", "I need to redistribute the load."],completionTitle:"你能分辨衣物分佈不均與機器故障，並說出調整方法。"};

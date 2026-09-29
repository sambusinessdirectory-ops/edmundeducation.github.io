import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-399-v2-audio","audio","新鞋磨腳後聽到這句，最可能看到甚麼？",["皮膚鼓起一個含液的小泡。", "皮膚長期變得厚硬。", "腳跟有一片被磨紅的平面擦傷。", "腳掌上有長期形成的硬繭。"],"皮膚鼓起一個含液的小泡。","blister 是摩擦後鼓起、常含液的小泡；厚硬皮是 callus。"),
  mc("native-399-v2-explain","explain","為甚麼剛穿一天新鞋磨出的含液小泡叫 blister，而不是 callus？",["blister 是新起的泡；callus 是反覆摩擦後的厚皮。", "blister 是長期形成的乾硬皮。", "callus 是當天出現的透明小泡。", "兩詞都指同一種皮膚形狀。"],"blister 是新起的泡；callus 是反覆摩擦後的厚皮。","兩者都可能由摩擦造成，但外觀和形成時間不同。"),
  mc("native-399-v2-branch","branch","朋友看到你腳跟未破的水泡，問 Should we keep walking in those shoes? 哪句回應最能處理摩擦問題？",["Let me change shoes; these are rubbing the blister.", "I’ll loosen the laces but keep walking in the same shoes.", "I’ll rest for a minute and then walk in these shoes again.", "I’ll put the shoes back on and hope the rubbing stops."],"Let me change shoes; these are rubbing the blister.","新鞋持續摩擦同一位置，換鞋能減少水泡繼續受刺激。"),
  mc("native-399-v2-scene","scene","哪一組觀察最能分辨腳跟的 blister 和手掌的 callus？",["水泡是新起的含液小泡；厚繭是長期摩擦形成的硬皮。", "水泡是長期厚皮；厚繭是新起含液小泡。", "兩者都只會出現在腳後跟。", "兩者都只是皮膚表面發紅，沒有形狀差異。"],"水泡是新起的含液小泡；厚繭是長期摩擦形成的硬皮。","外觀和形成時間都有差別：blister 含液而較新，callus 厚硬且逐漸形成。"),
  {id:"native-399-v2-repair",type:'open',style:"repair",prompt:"新的情境：你划艇練習後手指側面磨出一顆未破、內有液體的小泡；同伴把它叫 callus。寫一兩句英文修正詞語，說明外觀和可能原因。",answers:["It’s a blister, not a callus. The paddle rubbed my finger and left a little fluid-filled bump.", "I’ve got a blister on my finger from rowing. It’s a new fluid-filled bubble, not thick skin.", "That’s a blister from the paddle rubbing my finger; a callus would be hard thick skin."],explanation:"把 blister 轉用到划艇手指，說出新起含液小泡和槳摩擦的原因，並區分厚繭。"}
];

const steps=[
  {"id": "native-399-v2-audio", "style": "audio", "label": "先聽皮膚", "title": "新鞋磨出甚麼？", "intro": "先聽名詞，再想像外觀。", "model": "I have a blister.", "zh": "我磨出一個水泡。", "audioOnly": true, "questions": ["native-399-v2-audio"]},
  {"id": "native-399-v2-explain", "style": "explain", "label": "和 callus 比較", "title": "短期與長期摩擦", "intro": "由形成方式判斷。", "questions": ["native-399-v2-explain"]},
  {"id": "native-399-v2-speak", "style": "speak", "label": "口頭解釋", "title": "腳跟磨出水泡", "intro": "先說出皮膚起泡，再聽示範。", "model": "I have a blister.", "zh": "我長了水泡。", "speakingPrompt": "新鞋磨得腳後跟起一個未破小水泡；口頭說「我有一個水泡」。", "recording": "phrase", "questions": []},
  {"id": "native-399-v2-branch", "style": "branch", "label": "走路對話", "title": "為何走得慢？", "intro": "回應朋友的觀察。", "questions": ["native-399-v2-branch"]},
  {"id": "native-399-v2-scene", "style": "scene", "label": "選適合情況", "title": "水泡未破", "intro": "從外觀和原因辨認。", "questions": ["native-399-v2-scene"]},
  {"id": "native-399-v2-repair", "style": "repair", "label": "新活動自評", "title": "划艇手指磨起泡", "intro": "先修正詞語並說明證據，再看示例。", "questions": ["native-399-v2-repair"]}
];

export default {revision:2,summary:"用 blister 描述摩擦後未破、含液的小水泡，並與厚皮 callus 分清。",steps,questions,takeaways:["I have a blister.", "I have a blister on my heel."],completionTitle:"你能指出鞋磨出的水泡，並在對話中避免把它誤稱厚皮。"};

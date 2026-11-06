import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-413-v2-audio","audio","聽到這句，哪個時間點最關鍵？",["吞下後嘴裏仍有怪味。", "還未入口時聞到怪味。", "剛入口時感覺燙。", "吞下後嘴裏完全沒味道。"],"吞下後嘴裏仍有怪味。","aftertaste 是吞嚥後持續留下的味道；left 強調已吃完仍有。"),
  mc("native-413-v2-contrast","contrast","飲料第一口正常，吞下幾秒後才有苦味。哪句最準？",["It has a bitter aftertaste.", "It tastes bitter the moment it touches my tongue.", "It smells bitter before I drink it.", "It has no flavor afterward."],"It has a bitter aftertaste.","苦味在吞下後才留下，是 bitter aftertaste，不是第一口立即嚐到的味道。"),
  mc("native-413-v2-rewrite","rewrite","朋友問 How’s the tea? 你第一口尚可，但喝完留下金屬味。哪句有用？",["It tastes okay at first, but leaves a strange aftertaste.", "It tastes metallic immediately and nothing remains.", "It smells sweet, so the aftertaste must be sweet.", "I haven’t tried it, but I know the aftertaste."],"It tastes okay at first, but leaves a strange aftertaste.","先說入口感受尚可，再指出吞下後留下的怪味，資訊比 bad 更具體。"),
  mc("native-413-v2-repair","repair","同伴說 The drink tastes weird before I swallow it，但他其實吞下後才有怪味。哪句改得好？",["It leaves a weird aftertaste.", "It tastes strange immediately.", "It smells odd in the cup.", "It was too hot to drink."],"It leaves a weird aftertaste.","aftertaste 指吞下後仍留下的味道，修正了原句的時間順序。"),
  mc("native-413-v2-explain","explain","It left a weird aftertaste. 中的 left 表示甚麼？",["飲料喝完後仍留下味道。", "飲料被放在桌子左邊。", "飲料倒出杯外。", "飲料完全沒有味道。"],"飲料喝完後仍留下味道。","left 在這裏是 leave 的過去式，指味道在食物離口後仍殘留。"),
  {id:"native-413-v2-final",type:'open',style:"final",prompt:"新的情境：一顆薄荷糖入口時很清新，但吃完後嘴裏留下奇怪的苦味。寫一兩句英文向朋友評價它。",answers:["It tastes fresh at first, but it leaves a bitter aftertaste.", "The mint is fine while I’m eating it. It leaves a strange bitter aftertaste afterward.", "It has a nice mint flavor at first, but the aftertaste is oddly bitter."],explanation:"aftertaste 說吃完後的餘味；和入口時的清新味道作時間對照。"}
];

const steps=[
  {"id": "native-413-v2-audio", "style": "audio", "label": "先聽時間", "title": "味道何時還在？", "intro": "先聽句子，再想想食物已否吞下。", "model": "It left a weird aftertaste.", "zh": "吃完後留下怪味。", "audioOnly": true, "questions": ["native-413-v2-audio"]},
  {"id": "native-413-v2-contrast", "style": "contrast", "label": "入口與餘味", "title": "前味不差，後味怪", "intro": "比較味道出現的先後。", "questions": ["native-413-v2-contrast"]},
  {"id": "native-413-v2-rewrite", "style": "rewrite", "label": "把評論說具體", "title": "不只說不好喝", "intro": "指出問題發生時間。", "questions": ["native-413-v2-rewrite"]},
  {"id": "native-413-v2-repair", "style": "repair", "label": "修正時間", "title": "不是 beforetaste", "intro": "把味道出現順序說準。", "questions": ["native-413-v2-repair"]},
  {"id": "native-413-v2-explain", "style": "explain", "label": "理解 left", "title": "味道留下來", "intro": "看代名詞指向哪件事。", "questions": ["native-413-v2-explain"]},
  {"id": "native-413-v2-final", "style": "final", "label": "新點心自評", "title": "嚼完薄荷糖後", "intro": "自己寫先後味道，再對照示例。", "questions": ["native-413-v2-final"]}
];

export default {revision:2,summary:"用 aftertaste 描述食物已吞下後仍留在嘴裏的怪味，與入口當下的味道區分。",steps,questions,takeaways:["It left a weird aftertaste.", "It has a bitter aftertaste."],completionTitle:"你能辨認怪味出現的時間，並精確描述餘味。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-480-v2-audio","audio","最可能看到甚麼？",["冰箱門上多處手指摸過的模糊印。", "冰箱內食物都不夠冷。", "冰箱門有一道深凹痕。", "冰箱表面乾淨，只是燈不亮。"],"冰箱門上多處手指摸過的模糊印。","smudges 是表面模糊印痕；covered in 表示這種痕跡到處都有。"),
  mc("native-480-v2-detail","detail","不鏽鋼門上到處有灰灰指印，濕布擦過便淡了；表面並無凹陷。哪句較準？",["The fridge is covered in smudges.", "The fridge door is deeply scratched.", "The fridge is not cooling properly.", "The fridge handle has snapped off."],"The fridge is covered in smudges.","可擦淡的灰指印屬 smudges，而非金屬表面深刮痕或機件故障。"),
  mc("native-480-v2-explain","explain","冰箱門只有一個小指印。哪句不會誇大數量？",["There’s a smudge on the fridge door.", "The fridge is covered in smudges.", "The fridge door is spotless.", "There are smudges all over the fridge."],"There’s a smudge on the fridge door.","一個小指印用 a smudge；covered in 和 all over 都表示多處。"),
  mc("native-480-v2-continue","continue","室友說 The fridge is covered in smudges，且冰箱製冷正常。你怎樣回應較切題？",["I’ll wipe the door with a suitable soft cloth.", "I’ll call a technician to repair the compressor.", "I’ll buy a new fridge because the metal is dented.", "I’ll leave the marks until the food gets warmer."],"I’ll wipe the door with a suitable soft cloth.","問題是外表油印，先擦拭比檢查壓縮機或更換冰箱更切題。"),
  {id:"native-480-v2-final",type:'open',style:"final",prompt:"新情境：客廳玻璃櫃門上有許多手指印，客人晚上要來。寫一兩句英文說明外觀，並提出來客前怎樣處理。",answers:["There are smudges all over the glass cabinet door. I’ll wipe it before the guests arrive.", "The glass is covered in smudges, so I’ll clean it before tonight.", "There are fingerprints and smudges on the cabinet glass. Let’s wipe them off."],explanation:"用 smudges 說明多處模糊指印，再提出來客前擦拭。"}
];

const steps=[
  {"id": "native-480-v2-audio", "style": "audio", "label": "先聽外觀", "title": "表面怎樣了？", "intro": "先聽句子，留意 covered in 的數量感。", "model": "The fridge is covered in smudges.", "zh": "冰箱表面滿是模糊的油印。", "audioOnly": true, "questions": ["native-480-v2-audio"]},
  {"id": "native-480-v2-detail", "style": "detail", "label": "指印還是刮花", "title": "可擦的模糊痕", "intro": "從觸摸與清潔線索判斷。", "questions": ["native-480-v2-detail"]},
  {"id": "native-480-v2-explain", "style": "explain", "label": "程度用法", "title": "一個與到處都有", "intro": "比較 a smudge 和 covered in。", "questions": ["native-480-v2-explain"]},
  {"id": "native-480-v2-continue", "style": "continue", "label": "清潔安排", "title": "用合適布料", "intro": "從可擦痕跡選下一步。", "questions": ["native-480-v2-continue"]},
  {"id": "native-480-v2-speak", "style": "speak", "label": "口頭提醒", "title": "冰箱門多處油印", "intro": "望向不鏽鋼門面的指印，先說再核對錄音。", "model": "The fridge is covered in smudges.", "zh": "冰箱表面滿是模糊的油印。", "speakingPrompt": "不鏽鋼冰箱門上到處有手指油印；向室友口說「冰箱表面滿是模糊的油印」。", "recording": "phrase", "questions": []},
  {"id": "native-480-v2-final", "style": "final", "label": "新表面自評", "title": "玻璃櫃門", "intro": "自己寫多處痕跡與清理打算。", "questions": ["native-480-v2-final"]}
];

export default {revision:2,summary:"用 The fridge is covered in smudges. 描述不鏽鋼冰箱門上多處手指油印與模糊痕。",steps,questions,takeaways:["The fridge is covered in smudges.", "There are smudges all over the glass."],completionTitle:"你能辨認表面油印，並與內部製冷故障區分。"};

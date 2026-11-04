import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-198-v2-audio","audio","聽到這句，穿着者最可能感到甚麼？",["布料摩擦皮膚，有點刺癢。", "布料柔軟順滑。", "布料雖粗糙，卻完全不會刺膚。", "毛衣尺寸太緊，肩膀活動不自在。"],"布料摩擦皮膚，有點刺癢。","scratchy 是觸感詞，常指毛線等粗糙刺膚。"),
  mc("native-198-v2-detail","detail","哪個情況最支持說毛衣 It’s scratchy？",["袖子擦到手臂時刺刺癢癢。", "袖口緊到壓住手腕。", "羊毛很柔軟，手臂不覺刺癢。", "領口鬆得一直滑下肩膀。"],"袖子擦到手臂時刺刺癢癢。","scratchy 指布料粗糙、刺膚的觸感；那種不舒服來自布料碰到皮膚，並非衣服尺寸或顏色。"),
  mc("native-198-v2-scene","scene","哪個試衣者最可能說 This sweater is scratchy？",["穿上後脖子和手臂被羊毛刺得不舒服。", "穿上後發現袖口太緊。", "穿上後發現袖子太長。", "穿上後只覺得太熱，皮膚不癢。"],"穿上後脖子和手臂被羊毛刺得不舒服。","這句指布料接觸皮膚的粗糙刺感；羊毛接觸脖子和手臂時產生刺癢感，所以可說 scratchy。"),
  {id:"native-198-v2-final",type:'open',style:"final",prompt:"新的情境：朋友送你一條羊毛圍巾，顏色漂亮，但戴上後頸部覺得刺刺的。寫一句英文，說明觸感及你暫時不想戴的原因。",answers:["The scarf is scratchy, so I don’t want to wear it for long.", "I like the color, but the wool feels scratchy on my neck.", "It looks nice, but it’s too scratchy against my skin."],explanation:"scratchy 形容接觸皮膚時粗糙刺癢的感覺，不是顏色問題。"}
];

const steps=[
  {"id": "native-198-v2-audio", "style": "audio", "label": "先聽形容詞", "title": "感覺如何？", "intro": "先聽英文，再選觸感。", "model": "It’s scratchy.", "zh": "它刺刺的。", "audioOnly": true, "questions": ["native-198-v2-audio"]},
  {"id": "native-198-v2-detail", "style": "detail", "label": "找觸感證據", "title": "皮膚的反應", "intro": "從細節判斷用詞。", "questions": ["native-198-v2-detail"]},
  {"id": "native-198-v2-speak", "style": "speak", "label": "試衣口說", "title": "告訴朋友感覺", "intro": "先試着說出「它穿起來刺刺的。」，再聽示範。", "model": "It’s scratchy.", "zh": "它穿起來刺刺的。", "speakingPrompt": "朋友問你試穿毛衣的感覺；口頭說它有點刺膚。", "recording": "phrase", "questions": []},
  {"id": "native-198-v2-scene", "style": "scene", "label": "選場景", "title": "哪件衣物可這樣說？", "intro": "比較不同問題。", "questions": ["native-198-v2-scene"]},
  {"id": "native-198-v2-final", "style": "final", "label": "自寫評價", "title": "新圍巾的問題", "intro": "自己寫觸感及決定。", "questions": ["native-198-v2-final"]}
];

export default {revision:2,summary:"用 scratchy 描述毛衣布料碰到皮膚時刺刺的觸感。",steps,questions,takeaways:["It’s scratchy.", "The fabric feels rough."],completionTitle:"你能在試衣時準確描述布料刺膚。"};

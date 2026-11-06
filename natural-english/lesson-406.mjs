import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-406-v2-audio","audio","新牛仔褲旁的白鞋出現藍印；聽到這句，最可能是甚麼？",["牛仔褲染料沾到白鞋。", "白鞋被深色襪子的染料染藍。", "白鞋沾到藍色油漆。", "牛仔褲在洗衣時均勻褪色。"],"牛仔褲染料沾到白鞋。","dye transferred 指染料從一件物件移到另一件；新深色牛仔褲可染上白鞋。"),
  mc("native-406-v2-scene","scene","哪個畫面最適合說 The dye transferred？",["新深藍牛仔褲坐過白沙發後留下藍痕。", "牛仔褲在陽光下慢慢褪色。", "牛仔褲洗後整件顏色變淡。", "沙發上出現一個濕水圈。"],"新深藍牛仔褲坐過白沙發後留下藍痕。","新牛仔褲接觸白沙發後留下藍痕，時間和顏色都支持染料轉移。"),
  mc("native-406-v2-reverse","reverse","你背着白色帆布袋靠着新牛仔褲走了一天，袋子一側變藍。哪句描述原因？",["The dye from my jeans transferred to the bag.", "The bag was sun-faded.", "The bag picked up a blue ink stain.", "The jeans faded evenly in the wash."],"The dye from my jeans transferred to the bag.","說清染料從牛仔褲移到袋上，符合袋子局部變藍。"),
  mc("native-406-v2-branch","branch","朋友問 Why are there blue marks on your white shoes? 你剛穿新牛仔褲。哪句最自然？",["I think the dye from my jeans transferred.", "I think the shoes are sun-faded.", "I think blue polish rubbed off the shoes.", "I think the blue marks came from the floor."],"I think the dye from my jeans transferred.","白鞋藍印與新牛仔褲接觸吻合；I think 表示合理推測。"),
  {id:"native-406-v2-final",type:'open',style:"final",prompt:"新的情境：你穿新深色牛仔褲坐在朋友的白椅上，起身後看到藍色痕跡。寫一兩句英文向朋友說明可能發生甚麼並道歉。",answers:["I’m sorry. I think the dye from my new jeans transferred to your chair.", "Sorry, the dye from my jeans seems to have transferred onto the white chair.", "My new jeans may have left some color transfer on your chair. I’m sorry."],explanation:"說明染料由牛仔褲移到白椅，並承認對朋友家具造成的痕跡。"}
];

const steps=[
  {"id": "native-406-v2-audio", "style": "audio", "label": "先聽顏色", "title": "藍色從哪來？", "intro": "先聽句子，再判斷染色方向。", "model": "The dye transferred.", "zh": "染料轉移過去了。", "audioOnly": true, "questions": ["native-406-v2-audio"]},
  {"id": "native-406-v2-scene", "style": "scene", "label": "選發生場所", "title": "不只洗衣會染色", "intro": "把染色和接觸連起來。", "questions": ["native-406-v2-scene"]},
  {"id": "native-406-v2-reverse", "style": "reverse", "label": "從痕跡反推", "title": "淺色袋變藍", "intro": "由來源和結果選英文。", "questions": ["native-406-v2-reverse"]},
  {"id": "native-406-v2-branch", "style": "branch", "label": "對話下一步", "title": "朋友問白鞋", "intro": "根據顏色痕跡解釋。", "questions": ["native-406-v2-branch"]},
  {"id": "native-406-v2-speak", "style": "speak", "label": "口頭指出", "title": "染料沾到鞋上", "intro": "先說出顏色轉移的結果，再聽示範。", "model": "The dye transferred.", "zh": "染料轉移了。", "speakingPrompt": "新牛仔褲把白鞋邊染藍；口頭說「染料轉移了」。", "recording": "phrase", "questions": []},
  {"id": "native-406-v2-final", "style": "final", "label": "新家具自寫", "title": "白椅子染藍", "intro": "先寫來源和結果，再對照示例。", "questions": ["native-406-v2-final"]}
];

export default {revision:2,summary:"用 The dye transferred. 描述牛仔褲的染料沾到白鞋或家具。",steps,questions,takeaways:["The dye transferred.", "There’s some color transfer."],completionTitle:"你能指出顏色是從新牛仔褲轉移到淺色物件上。"};

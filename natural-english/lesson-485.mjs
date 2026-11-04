import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-485-v2-audio","audio","哪個畫面最符合？",["床底有灰塵、毛髮和纖維聚成的小團。", "床底有一隻真正的小兔。", "床底只有一張平整的紙。", "床底有一灘水，沒有灰塵。"],"床底有灰塵、毛髮和纖維聚成的小團。","dust bunny 是灰塵和毛髮等聚成的毛團，並非真正的小兔。"),
  mc("native-485-v2-scene","scene","哪個發現最適合說 There’s a dust bunny under the bed？",["移開床邊箱子後，床底角落滾出一團灰絨。", "床上被單有一道黑色墨水痕。", "床架上有一個鬆動的螺絲。", "枕頭表面只有幾粒乾麵包屑。"],"移開床邊箱子後，床底角落滾出一團灰絨。","床底角落的灰絨團是 dust bunny；墨水、螺絲和麵包屑都不是。"),
  mc("native-485-v2-continue","continue","室友說 There’s a huge dust bunny under the bed。你想現在清理，哪句最切題？",["I’ll use the vacuum attachment to reach under the bed.", "I’ll wipe the top of the bedside lamp.", "I’ll change the pillowcase but leave the floor.", "I’ll wash the bedsheet, though the dust is underneath."],"I’ll use the vacuum attachment to reach under the bed.","灰塵毛球藏在床底，使用吸塵器延長配件才能伸到狹窄位置清走它。"),
  mc("native-485-v2-branch","branch","朋友問 Where did you spot the other dust bunny? 你看到它在房間角落。哪句直接回答？",["There’s a dust bunny in the corner.", "There’s one under the bed, where we already looked.", "The curtains won’t close all the way.", "There are scuff marks on the floor."],"There’s a dust bunny in the corner.","問的是另一團的位置；in the corner 直接定位房間角落。"),
  {id:"native-485-v2-final",type:'open',style:"final",prompt:"新情境：客人快來，你發現沙發底靠牆處有兩團灰塵毛球。寫一兩句英文告訴家人位置，並說會怎樣清理。",answers:["There are two dust bunnies under the sofa by the wall. I’ll vacuum them before the guests arrive.", "I found a couple of dust bunnies behind the sofa. I’ll use the vacuum attachment.", "There’s dust built up in little clumps under the couch. I’ll clean that corner now."],explanation:"要指出沙發底靠牆的位置和灰團，並提出吸塵清理。"}
];

const steps=[
  {"id": "native-485-v2-audio", "style": "audio", "label": "先聽床底", "title": "找到甚麼？", "intro": "先聽句子，注意 dust bunny 在這裏不是動物。", "model": "There’s a dust bunny under the bed.", "zh": "床底有一團灰塵毛球。", "audioOnly": true, "questions": ["native-485-v2-audio"]},
  {"id": "native-485-v2-scene", "style": "scene", "label": "哪裏容易積聚", "title": "家具底部角落", "intro": "從清潔盲點判斷。", "questions": ["native-485-v2-scene"]},
  {"id": "native-485-v2-continue", "style": "continue", "label": "清掃安排", "title": "床底不易伸手", "intro": "選具體清潔方法。", "questions": ["native-485-v2-continue"]},
  {"id": "native-485-v2-branch", "style": "branch", "label": "位置追問", "title": "另一團在角落", "intro": "回答具體位置。", "questions": ["native-485-v2-branch"]},
  {"id": "native-485-v2-speak", "style": "speak", "label": "口頭指出", "title": "床底灰團", "intro": "指着床底那團灰絨，先說再核對錄音。", "model": "There’s a dust bunny under the bed.", "zh": "床底有一團灰塵毛球。", "speakingPrompt": "清掃時你發現床底有一團灰塵毛球；向室友口說「床底有一團灰塵毛球」。", "recording": "phrase", "questions": []},
  {"id": "native-485-v2-final", "style": "final", "label": "新角落自評", "title": "沙發底的灰團", "intro": "自己寫位置和清理方法。", "questions": ["native-485-v2-final"]}
];

export default {revision:2,summary:"用 There’s a dust bunny under the bed. 描述床底由灰塵、毛髮和纖維聚成的毛球。",steps,questions,takeaways:["There’s a dust bunny under the bed.", "There’s a dust bunny in the corner."],completionTitle:"你能描述家具底下的灰塵毛球，並安排清掃。"};

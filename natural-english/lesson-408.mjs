import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-408-v2-audio","audio","白襯衫與紅 T-shirt 同洗後變粉；聽到這句，發生甚麼？",["紅色染料沾到了白襯衫。", "白襯衫被太陽曬白。", "白襯衫領口有一圈汗漬。", "紅 T-shirt 自己洗後均勻褪色。"],"紅色染料沾到了白襯衫。","color transfer 指一件衣服的染料轉到另一件上，混洗時可能發生。"),
  mc("native-408-v2-explain","explain","白衣與新紅襪同洗，白衣變粉，紅襪仍紅。最可能是哪個方向？",["紅襪染料轉到白衣。", "白衣染料轉到紅襪。", "兩件都被陽光曬褪色。", "白衣只是沾到灰塵。"],"紅襪染料轉到白衣。","白衣新增粉紅色，顯示紅襪染料可能流出並沾上白布。"),
  mc("native-408-v2-detail","detail","哪項細節最支持 There’s color transfer on the shirt？",["白襯衫洗前純白，和藍衣同洗後有淡藍區域。", "白襯衫一直是淡藍色。", "白襯衫原有的藍條紋變淡。", "白襯衫領口有汗漬。"],"白襯衫洗前純白，和藍衣同洗後有淡藍區域。","洗前沒有、混洗後才出現另一件衣服的顏色，是轉移線索。"),
  mc("native-408-v2-repair","repair","白衣洗後染上紅色，但你說 It’s sun-faded. 應改成哪句？",["There’s color transfer on the shirt.", "The shirt has faded in sunlight.", "The shirt has a red food stain.", "The shirt has a bleach mark."],"There’s color transfer on the shirt.","白衣增加紅色是染料轉移；sun-faded 會令原色變淡。"),
  {id:"native-408-v2-final",type:'open',style:"final",prompt:"新的情境：你把淺色枕套和新深藍毛巾同洗，枕套洗後出現藍色痕跡。寫一兩句英文告訴室友可能發生甚麼。",answers:["There’s color transfer on the pillowcases. I think the new blue towel caused it.", "The blue dye seems to have transferred from the towel to the light pillowcases.", "The pillowcases picked up some color in the wash, probably from the new towel."],explanation:"指出枕套新增藍色，並審慎說明可能來自新毛巾。"}
];

const steps=[
  {"id": "native-408-v2-audio", "style": "audio", "label": "先聽洗衣", "title": "白衣怎麼變色？", "intro": "先聽句子，再判斷顏色來源。", "model": "There’s color transfer.", "zh": "有顏色轉移。", "audioOnly": true, "questions": ["native-408-v2-audio"]},
  {"id": "native-408-v2-speak", "style": "speak", "label": "口頭告知", "title": "洗完白衫變粉", "intro": "先說出衣服互染的現象，再聽示範。", "model": "There’s color transfer.", "zh": "顏色染到另一件衣服上。", "speakingPrompt": "白衫和紅衫同洗後，白衫染粉；口頭說「有顏色轉移」。", "recording": "phrase", "questions": []},
  {"id": "native-408-v2-explain", "style": "explain", "label": "找出方向", "title": "誰染到誰？", "intro": "由原色和洗後顏色判斷。", "questions": ["native-408-v2-explain"]},
  {"id": "native-408-v2-detail", "style": "detail", "label": "抓洗衣證據", "title": "不是本來的顏色", "intro": "留意洗前洗後。", "questions": ["native-408-v2-detail"]},
  {"id": "native-408-v2-repair", "style": "repair", "label": "修正原因", "title": "不是陽光褪色", "intro": "把增加的顏色說準。", "questions": ["native-408-v2-repair"]},
  {"id": "native-408-v2-final", "style": "final", "label": "新洗衣自寫", "title": "找出被染來源", "intro": "自己寫結果和可能來源，再按示例自評。", "questions": ["native-408-v2-final"]}
];

export default {revision:2,summary:"用 color transfer 描述混洗衣服時一件的顏色染到另一件。",steps,questions,takeaways:["There’s color transfer.", "There’s some color transfer on the shirt."],completionTitle:"你能指出白衣被染色，並說清是哪件衣服可能掉色。"};

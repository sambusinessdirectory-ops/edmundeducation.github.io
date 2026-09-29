import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-393-v2-audio","audio","聽到這句，最可能是哪種變化？",["長期日曬令原本鮮明的顏色變淡。", "洗衣時另一件深色衣服把它染色。", "漂白劑濺到衣服留下淺色斑。", "多次洗衣令整件衣服均勻變淡。"],"長期日曬令原本鮮明的顏色變淡。","sun-faded 明確指出褪色來自陽光照射，而非染色轉移。"),
  mc("native-393-v2-branch","branch","朋友說 Only the window-facing side is lighter. 哪個問題最能查明原因？",["Was it stored in direct sunlight?", "Did a dark shirt bleed onto it in the wash?", "Did bleach splash on just that side?", "Was it left in a damp closet?"],"Was it stored in direct sunlight?","靠窗一面先褪色，直接日曬是最相關的可能原因。"),
  mc("native-393-v2-tone","tone","衣服一面變淡，你猜是陽光造成。哪句較審慎？",["It looks sun-faded. Was it by a window?", "You left it by the window, so this is all your fault.", "It must be bleach, even though no bleach was used.", "It looks faded from washing, though only one side changed."],"It looks sun-faded. Was it by a window?","looks 表示根據外觀推測，再問存放位置確認原因。"),
  mc("native-393-v2-reverse","reverse","一件紅 T-shirt 長期晾在陽台，向陽面慢慢變粉。哪個形容詞最準？",["sun-faded", "color-transferred", "stained", "bleached in the wash"],"sun-faded","向陽面逐漸變淡，符合 sun-faded 的原因與過程。"),
  {id:"native-393-v2-repair",type:'open',style:"repair",prompt:"新的情境：客廳窗簾朝窗的一邊逐漸變淡，另一邊仍是原色。原本有人說「There’s color transfer」。寫一兩句英文修正這個判斷，交代你推測的原因和一個防止繼續褪色的做法。",answers:["The curtain looks sun-faded on the window side. We should keep it out of direct sunlight.", "This seems sun-faded rather than color transfer. Let’s draw the blinds when the sun is strongest.", "The sunlight has faded one side of the curtain. We could move it or use a window shade."],explanation:"新場景仍以單側向陽變淡為證據；sun-faded 表示陽光使顏色消退，再提出減少日曬的方法。"}
];

const steps=[
  {"id": "native-393-v2-audio", "style": "audio", "label": "先聽變化", "title": "顏色為何淡？", "intro": "先聽句子，再想像衣物外觀。", "model": "It’s sun-faded.", "zh": "它被太陽曬褪色了。", "audioOnly": true, "questions": ["native-393-v2-audio"]},
  {"id": "native-393-v2-speak", "style": "speak", "label": "口頭說明", "title": "窗邊外套變淡", "intro": "先說出日曬褪色，再聽示範。", "model": "It’s sun-faded.", "zh": "它曬褪色了。", "speakingPrompt": "窗邊外套一面顏色變淡；口頭說「它被陽光曬褪色了」。", "recording": "phrase", "questions": []},
  {"id": "native-393-v2-branch", "style": "branch", "label": "接着查原因", "title": "只有一邊淡了", "intro": "根據不均勻褪色追問。", "questions": ["native-393-v2-branch"]},
  {"id": "native-393-v2-tone", "style": "tone", "label": "審慎判斷", "title": "觀察和推測", "intro": "別在未問清前說得太肯定。", "questions": ["native-393-v2-tone"]},
  {"id": "native-393-v2-reverse", "style": "reverse", "label": "由原因選詞", "title": "陽光造成的褪色", "intro": "從時間和位置反推。", "questions": ["native-393-v2-reverse"]},
  {"id": "native-393-v2-repair", "style": "repair", "label": "新場景自評", "title": "窗簾朝窗一面變淡", "intro": "先修正說法並提出做法，再看示例。", "questions": ["native-393-v2-repair"]}
];

export default {revision:2,summary:"用 sun-faded 描述衣服長期受陽光照射後褪色，並分清一般褪色。",steps,questions,takeaways:["It’s sun-faded.", "The color has faded."],completionTitle:"你能指出褪色的原因是陽光，並辨認單側變淡的線索。"};

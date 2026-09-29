import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-189-v2-audio","audio","聽到這個詞組，最可能進行哪項修改？",["把褲腳收邊改短。", "把褲腰放大兩吋。", "替褲子換拉鍊。", "把褲腳熨平但不改長度。"],"把褲腳收邊改短。","hem 指修改衣物邊緣；在過長褲腳情境就是改短並收邊。"),
  mc("native-189-v2-contrast","contrast","褲腰剛好，但褲腳太長，遮住鞋面。你應要求甚麼？",["Please hem the pants.", "Please take in the waist.", "Please replace the zipper.", "Please dye them darker."],"Please hem the pants.","問題在褲腳長度；hem the pants 是改褲腳，不是改腰圍。"),
  mc("native-189-v2-reverse","reverse","你想問裁縫「可以幫我改短這條褲嗎？」哪句最貼切？",["Can you hem these pants?", "Can you iron these pants?", "Can you wash these pants?", "Can you stretch these pants?"],"Can you hem these pants?","hem these pants 直接說明褲腳需要修改長度。"),
  {id:"native-189-v2-scene",type:'open',style:"scene",prompt:"新的情境：畢業典禮的西褲褲腳拖地，你想請裁縫改短約兩吋。寫一兩句英文向裁縫提出要求。",answers:["Could you hem these pants about two inches shorter? They’re dragging on the floor.", "These pants are too long. Could you hem them by about two inches?"],explanation:"hem 指把褲腳收邊改短；加上約兩吋，裁縫才知道想改多少。"}
];

const steps=[
  {"id": "native-189-v2-audio", "style": "audio", "label": "聽出修改", "title": "裁縫要做甚麼？", "intro": "先聽詞組，再選修改方式。", "model": "hem the pants", "zh": "把褲腳改短。", "audioOnly": true, "questions": ["native-189-v2-audio"]},
  {"id": "native-189-v2-speak", "style": "speak", "label": "先說需求", "title": "褲腳拖地了", "intro": "自己口說後再聽示範。", "model": "hem the pants", "zh": "把褲腳縫短。", "speakingPrompt": "褲腳拖地，需要裁縫改短。先口頭說出「把褲腳收邊改短」這個英文詞組。", "recording": "phrase", "questions": []},
  {"id": "native-189-v2-contrast", "style": "contrast", "label": "比較修改", "title": "長度還是腰圍", "intro": "根據衣服問題選說法。", "questions": ["native-189-v2-contrast"]},
  {"id": "native-189-v2-reverse", "style": "reverse", "label": "意圖反推", "title": "對裁縫說一句", "intro": "由中文需要選英文。", "questions": ["native-189-v2-reverse"]},
  {"id": "native-189-v2-scene", "style": "scene", "label": "新情境自評", "title": "畢業典禮前改褲腳", "intro": "轉到「畢業典禮前改褲腳」場景獨立作答，再用示例核對兩個要點。", "questions": ["native-189-v2-scene"]}
];

export default {revision:2,summary:"用 hem the pants 表示把過長的褲腳改短，並能向裁縫提出要求。",steps,questions,takeaways:["hem the pants", "Can you hem these pants?"],completionTitle:"你能說明褲腳太長，並向裁縫請求改短。"};

import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-233-v2-audio","audio","雨後聽到這個詞，最可能要避開甚麼？",["地上的一小灘水。", "街邊連續流動的排水渠。", "雨水覆蓋整條行人路。", "鞋底沾的一點水珠。"],"地上的一小灘水。","puddle 是地面的淺小積水，不是河流或雨傘。"),
  mc("native-233-v2-contrast","contrast","暴雨後行人路凹處積了一小片水，幾步就能繞開。哪個名詞最貼切？",["puddle", "lake", "river", "sea"],"puddle","puddle 是小而局部的積水；lake 和 river 的範圍大得多。"),
  mc("native-233-v2-reverse","reverse","你剛踩進路上的小水灘，鞋面濕了。哪句說明原因？",["I stepped in a puddle.", "I walked along a wet path.", "I stepped over a puddle.", "I avoided every wet spot."],"I stepped in a puddle.","stepped in 表示腳踩進水灘；stepped over 是跨過，鞋不一定濕。"),
  mc("native-233-v2-detail","detail","哪項觀察最支持地上有 a puddle？",["雨後磚地凹處留了一小灘水。", "雨後鞋底仍有幾滴水。", "玻璃窗有幾滴水珠。", "水龍頭正在滴水入杯。"],"雨後磚地凹處留了一小灘水。","puddle 是地面積聚的小灘水，與天空雲或玻璃上的水珠不同。"),
  {id:"native-233-v2-final",type:'open',style:"final",prompt:"新的情境：雨後公園步道有一小灘深水，小孩正跑向它。寫一兩句英文提醒他留意水灘，並指出位置。",answers:["Watch out for the puddle just ahead. It looks deep.", "Careful—there’s a puddle on the path in front of you.", "Slow down. There’s a deep puddle near the bench."],explanation:"用 puddle 指出小灘積水，並說明前方或長櫈旁的位置。"}
];

const steps=[
  {"id": "native-233-v2-audio", "style": "audio", "label": "先聽地面", "title": "要避開甚麼？", "intro": "先聽名詞，再判斷。", "model": "puddle", "zh": "地上一小灘積水。", "audioOnly": true, "questions": ["native-233-v2-audio"]},
  {"id": "native-233-v2-speak", "style": "speak", "label": "口頭提醒", "title": "前面有水灘", "intro": "先說出地上小水灘的名稱，再聽示範。", "model": "puddle", "zh": "小水灘。", "speakingPrompt": "朋友快踩進路上的小水灘；先口頭說出 puddle 這個關鍵詞。", "recording": "phrase", "questions": []},
  {"id": "native-233-v2-contrast", "style": "contrast", "label": "分清大小", "title": "小灘還是大水域", "intro": "從範圍選詞。", "questions": ["native-233-v2-contrast"]},
  {"id": "native-233-v2-reverse", "style": "reverse", "label": "動作反推", "title": "鞋為何濕？", "intro": "由鞋子沾水選句。", "questions": ["native-233-v2-reverse"]},
  {"id": "native-233-v2-detail", "style": "detail", "label": "抓位置", "title": "水在哪裏？", "intro": "辨認名詞指向。", "questions": ["native-233-v2-detail"]},
  {"id": "native-233-v2-final", "style": "final", "label": "新步道自寫", "title": "提醒小孩慢走", "intro": "先寫提醒，再對照示例。", "questions": ["native-233-v2-final"]}
];

export default {revision:2,summary:"用 puddle 描述雨後地上的小灘積水，並提醒人避免踩進去。",steps,questions,takeaways:["puddle", "I stepped in a puddle."],completionTitle:"你能指出地上的小水灘，並在行走時提醒朋友。"};

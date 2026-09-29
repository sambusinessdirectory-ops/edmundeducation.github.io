import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-477-v2-audio","audio","最可能看見哪個畫面？",["兩端仍固定，中間慢慢向下垂。", "整塊層板已掉到地上。", "層板平直，只是表面刮花。", "層板一端翹高、另一端仍平。"],"兩端仍固定，中間慢慢向下垂。","sagging 指受重量影響而下垂，尤其中央低於兩端；仍未整塊掉落。"),
  mc("native-477-v2-repair","repair","層架仍在牆上，但書本太重令中間低了幾厘米。你原說 The shelf fell down。應怎樣改？",["The shelf is sagging under the books.", "The shelf has fallen to the floor.", "The shelf is level and sturdy.", "The wall paint is bubbling."],"The shelf is sagging under the books.","層架仍固定時應說 sagging，並點出書本負重，而非說整塊已掉。"),
  mc("native-477-v2-tone","tone","你看到層架中間正在下垂，室友還想加一箱書。哪句最有幫助？",["The shelf is sagging. Let’s take some books off before adding more.", "The shelf is fine; put the heavy box in the middle.", "You ruined the shelf, so throw everything away.", "The shelf already fell, although it’s still attached."],"The shelf is sagging. Let’s take some books off before adding more.","先描述可見下垂，再建議減少負重，避免在未確認承重前繼續加書。"),
  {id:"native-477-v2-final",type:'open',style:"final",prompt:"新情境：儲物室層板兩端牢固，但中央放着一箱重工具後逐漸下彎。寫一兩句英文提醒同伴，並提出怎樣減輕負重。",answers:["The shelf is sagging under that tool box. Let’s move the box to the floor.", "The middle of the shelf is starting to sag. We should take the heavy tools off.", "This shelf is sagging, though the brackets are still attached. Let’s move some weight elsewhere."],explanation:"點出中央受重物壓得下垂，再提出移走工具或重新分配重量。"}
];

const steps=[
  {"id": "native-477-v2-audio", "style": "audio", "label": "先聽形狀", "title": "中間往哪裏變？", "intro": "先聽，想像層架中央與兩端的高度。", "model": "The shelf is sagging.", "zh": "層架中間開始向下彎。", "audioOnly": true, "questions": ["native-477-v2-audio"]},
  {"id": "native-477-v2-repair", "style": "repair", "label": "修正描述", "title": "不是已掉下", "intro": "把故障程度說準。", "questions": ["native-477-v2-repair"]},
  {"id": "native-477-v2-tone", "style": "tone", "label": "提醒室友", "title": "先減輕負重", "intro": "用審慎語氣提出行動。", "questions": ["native-477-v2-tone"]},
  {"id": "native-477-v2-speak", "style": "speak", "label": "口頭警示", "title": "書架有點下垂", "intro": "看着兩端固定而中央下垂的層架，先說再核對錄音。", "model": "The shelf is sagging.", "zh": "層架中間開始下垂。", "speakingPrompt": "書架中央被書壓得下彎；向室友口說「層架中間開始下垂」。", "recording": "phrase", "questions": []},
  {"id": "native-477-v2-final", "style": "final", "label": "新空間自評", "title": "儲物室的層板", "intro": "自己寫觀察和可行的下一步。", "questions": ["native-477-v2-final"]}
];

export default {revision:2,summary:"用 The shelf is sagging. 描述層架仍固定在兩側，但中央受重物壓得向下彎。",steps,questions,takeaways:["The shelf is sagging.", "The shelf is bent."],completionTitle:"你能辨認逐漸下垂的層架，並及早減輕負重。"};

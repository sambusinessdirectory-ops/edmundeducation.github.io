import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-240-v2-audio","audio","聽到這句，最可能怎樣？",["外套拉鍊怎樣拉都不動。", "外套扣子掉到地上。", "外套下擺往上縮。", "外套布料一直掉毛。"],"外套拉鍊怎樣拉都不動。","stuck 指拉鍊卡住而無法移動；其他選項是不同衣物問題。"),
  mc("native-240-v2-transfer","transfer","抽屜完全拉不出，怎樣說？",["The drawer is stuck.", "The drawer is squeaky but opens.", "The drawer is loose.", "The drawer is sticking but still opens."],"The drawer is stuck.","stuck 可描述完全難以移動的抽屜；跟拉鍊卡死是同一概念。"),
  mc("native-240-v2-continue","continue","朋友問 Ready to go? 你的外套拉鍊完全拉不動。哪句合適？",["Almost. My zipper is stuck.", "Yes, I’ve already zipped it up.", "No, my button is loose but zipped.", "My jacket is already zipped up."],"Almost. My zipper is stuck.","拉鍊卡住令你未能準備好，Almost 加原因自然接上。"),
  mc("native-240-v2-branch","branch","拉鍊卡住時，你看見一角內襯布料被夾進齒間。朋友問 Want some help? 哪個回應最針對眼前問題？",["Yes, could you check if fabric is caught in it?", "Yes, could you sew on a missing button?", "Yes, could you see whether the zipper teeth are misaligned?", "Yes, could you check whether the pull tab has broken?"],"Yes, could you check if fabric is caught in it?","布料夾進拉鍊是常見卡住原因，先檢查比硬拉合適。"),
  {id:"native-240-v2-final",type:'open',style:"final",prompt:"新的情境：機場安檢前，你要從背包拿證件，但拉鍊完全卡住。寫一兩句英文向同行朋友說明並請他幫忙看。",answers:["My bag’s zipper is stuck. Could you help me check it?", "The zipper won’t move, and my ID is inside. Can you take a look?", "I can’t open my backpack because the zipper is stuck. Could you help?"],explanation:"說明 zipper stuck 和證件在內，再具體請朋友檢查。"}
];

const steps=[
  {"id": "native-240-v2-audio", "style": "audio", "label": "先聽問題", "title": "哪一部分動不了？", "intro": "先聽句子，再想像動作。", "model": "The zipper is stuck.", "zh": "拉鍊卡住了。", "audioOnly": true, "questions": ["native-240-v2-audio"]},
  {"id": "native-240-v2-transfer", "style": "transfer", "label": "換到抽屜", "title": "stuck 不只拉鍊", "intro": "把狀態詞用在另一件物品。", "questions": ["native-240-v2-transfer"]},
  {"id": "native-240-v2-continue", "style": "continue", "label": "接續出門", "title": "朋友在門口等", "intro": "解釋自己為何還沒好。", "questions": ["native-240-v2-continue"]},
  {"id": "native-240-v2-branch", "style": "branch", "label": "請人幫忙", "title": "下一句怎樣說", "intro": "根據故障選請求。", "questions": ["native-240-v2-branch"]},
  {"id": "native-240-v2-speak", "style": "speak", "label": "口頭說明", "title": "袋子拉鍊卡死", "intro": "先說出拉鍊動不了，再聽示範。", "model": "The zipper is stuck.", "zh": "拉鍊卡住了。", "speakingPrompt": "背包拉鍊怎樣拉都不動；口頭說「拉鍊卡住了」。", "recording": "phrase", "questions": []},
  {"id": "native-240-v2-final", "style": "final", "label": "新袋子自寫", "title": "在機場找證件", "intro": "自己寫故障和求助，再按示例自評。", "questions": ["native-240-v2-final"]}
];

export default {revision:2,summary:"用 The zipper is stuck. 描述拉鍊完全拉不動，並與抽屜卡住作轉用。",steps,questions,takeaways:["The zipper is stuck.", "The drawer is stuck."],completionTitle:"你能向人說明拉鍊卡住，並請人幫忙檢查。"};

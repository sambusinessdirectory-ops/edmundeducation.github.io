import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-391-v2-audio","audio","單靠聽到的這句，你能確定哪件事？",["說話者的眼睛正在流淚。", "說話者一定因傷心而哭。", "說話者一定正在洗眼睛。", "說話者的視線一定模糊。"],"說話者的眼睛正在流淚。","句子只確認眼睛正在流淚；原因可以是洋蔥、煙或情緒，要靠上下文判斷。"),
  mc("native-391-v2-explain","explain","The smoke is making my eyes water. 哪個部分是原因，哪個部分是反應？",["煙是刺激物；眼睛流淚是反應。", "眼睛流淚令煙出現。", "水令煙變多。", "說話者主動把水倒進眼睛。"],"煙是刺激物；眼睛流淚是反應。","make my eyes water 是使眼睛流淚；句子的主語 smoke 指出造成反應的刺激物。"),
  mc("native-391-v2-scene","scene","朋友切洋蔥時流淚。哪項額外觀察最支持洋蔥刺激，而不是他原本就為別的事難過？",["眼淚在他開始切洋蔥後才出現，離開砧板後減輕。", "他切洋蔥之前就說自己剛收到壞消息。", "他接觸洋蔥之前已一直擦眼淚。", "他離開廚房很久後仍因回想壞消息流淚。"],"眼淚在他開始切洋蔥後才出現，離開砧板後減輕。","只有流淚跟接觸洋蔥同時開始、遠離後減輕，才直接支持刺激物造成反應；其他細節更支持情緒原因。"),
  mc("native-391-v2-continue","continue","你切洋蔥切到眼睛流淚，想請朋友接手。朋友問 Want me to finish cutting them? 哪句最符合你的目的？",["Yes, please. My eyes are watering; I need a moment away from the onions.", "Thanks, but I’ll finish cutting after I take a short break.", "No thanks. I can keep cutting if I open the window.", "Could you get me a tissue? I’d rather finish the onions myself."],"Yes, please. My eyes are watering; I need a moment away from the onions.","四句都可在廚房說；只有 Yes, please 接受朋友接手切洋蔥，符合說話者想暫時離開刺激物的目的。"),
  mc("native-391-v2-reverse","reverse","你想說眼睛因刺激而自己流淚；哪句沒有變成「我主動用水洗眼」？",["My eyes are watering.", "I’m watering my eyes with a bottle.", "I’m washing my eyes with water.", "I’m putting drops in my eyes."],"My eyes are watering.","My eyes 是主語，watering 描述不由自主的流淚；I’m watering my eyes 變成主動對眼睛用水。"),
  {id:"native-391-v2-transfer",type:'open',style:"transfer",prompt:"新的情境：你從泳池出來，池水刺激眼睛令你一直流淚。朋友問你是否不舒服。寫一兩句英文說明眼睛的反應、可能原因，以及你會怎樣處理。",answers:["My eyes are watering from the pool water. I’m going to rinse them with clean water.", "I’m okay, but the pool water is making my eyes water. I’ll rinse my eyes now.", "My eyes keep watering after swimming. I think the pool water irritated them, so I’ll rinse them."],explanation:"轉到泳池場景時，保留 eyes are watering 的身體反應，再交代池水刺激和沖洗眼睛的行動。"}
];

const steps=[
  {"id": "native-391-v2-audio", "style": "audio", "label": "先聽身體反應", "title": "說話者正在經歷甚麼？", "intro": "只聽錄音，先不看英文。", "model": "My eyes are watering.", "zh": "我的眼睛一直流淚。", "audioOnly": true, "questions": ["native-391-v2-audio"]},
  {"id": "native-391-v2-explain", "style": "explain", "label": "拆解因果", "title": "煙與眼淚的關係", "intro": "讀一個不同原因的說法，找出觸發物。", "questions": ["native-391-v2-explain"]},
  {"id": "native-391-v2-scene", "style": "scene", "label": "找出缺失資訊", "title": "不要替人判斷心情", "intro": "單看表情還不能知道流淚原因。", "questions": ["native-391-v2-scene"]},
  {"id": "native-391-v2-continue", "style": "continue", "label": "接住朋友幫忙", "title": "有人願意接手切菜", "intro": "在眼睛不適時選一個自然回應。", "questions": ["native-391-v2-continue"]},
  {"id": "native-391-v2-reverse", "style": "reverse", "label": "從動作選結構", "title": "眼睛自己流淚", "intro": "留意 eyes water 與 water my eyes 的主語差別。", "questions": ["native-391-v2-reverse"]},
  {"id": "native-391-v2-transfer", "style": "transfer", "label": "新場景自評", "title": "泳池水刺激眼睛", "intro": "先自己寫，再用示例檢查有否說出反應、原因和下一步。", "questions": ["native-391-v2-transfer"]}
];

export default {revision:2,summary:"把 My eyes are watering. 用於受刺激而不由自主流淚，並能說明觸發物及接續對話。",steps,questions,takeaways:["My eyes are watering.", "The smoke is making my eyes water."],completionTitle:"你能從對話推斷流淚原因，並在新情境說明刺激物與處理方法。"};

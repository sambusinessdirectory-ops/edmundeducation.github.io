import {mc} from './editorial-question.mjs';

const questions=[
  mc("native-418-v2-audio","audio","在超市聽到這句，最可能看到甚麼？",["購物車橫放在走道中間，其他人難通過。", "購物車在走道旁，留有足夠空間。", "貨架上的商品都已售完。", "顧客在尋找穀物所在走道。"],"購物車橫放在走道中間，其他人難通過。","blocking the aisle 指車佔了通道，妨礙別人通過。"),
  mc("native-418-v2-continue","continue","你說 Excuse me, your cart is blocking the aisle. 對方把車移開並說 Sorry. 你怎樣接？",["No problem, thanks for moving it.", "No, leave it in the middle again.", "You should never shop here again.", "The cereal is in aisle five."],"No problem, thanks for moving it.","對方已移開障礙，簡單致謝能自然結束這段通行對話。"),
  mc("native-418-v2-branch","branch","有人問 Do you need to get through? 他把購物車停在整條走道中央。哪句最直接又禮貌？",["Yes, could you move your cart to the side? It’s blocking the aisle.", "Yes, could you tell me the price of your groceries?", "No, I just want to look at your cart.", "Yes, please leave your cart where it is."],"Yes, could you move your cart to the side? It’s blocking the aisle.","先確認要通過，再提出把車移到旁邊的具體請求。"),
  mc("native-418-v2-reverse","reverse","手推車橫在兩排貨架之間，阻住人行。哪句最準？",["Your cart is blocking the aisle.", "Your cart is blocking a product label.", "Your cart is blocking the cashier’s receipt.", "Your cart is blocking the store entrance."],"Your cart is blocking the aisle.","兩排貨架之間可走的通道是 aisle；句子指出被擋的是通行空間。"),
  {id:"native-418-v2-transfer",type:'open',style:"transfer",prompt:"新的情境：超市冷藏區的走道很窄，一位顧客把購物車停在中間，你推着嬰兒車過不去。寫一兩句禮貌英文提醒對方，請他把車移到旁邊。",answers:["Excuse me, your cart is blocking the aisle. Could you move it to the side?", "Sorry, I can’t get through with the stroller. Would you mind moving your cart?", "Could you move your cart a little? It’s blocking the aisle here."],explanation:"說明購物車擋着 aisle，再提出移到旁邊的具體請求；保持禮貌。"}
];

const steps=[
  {"id": "native-418-v2-audio", "style": "audio", "label": "先聽障礙", "title": "為何過不去？", "intro": "先聽句子，再定位物件。", "model": "Your cart is blocking the aisle.", "zh": "你的購物車擋住走道。", "audioOnly": true, "questions": ["native-418-v2-audio"]},
  {"id": "native-418-v2-continue", "style": "continue", "label": "接續對話", "title": "對方說抱歉", "intro": "選自然回應。", "questions": ["native-418-v2-continue"]},
  {"id": "native-418-v2-branch", "style": "branch", "label": "指明問題", "title": "讓對方知道怎樣幫忙", "intro": "在窄走道選具體請求。", "questions": ["native-418-v2-branch"]},
  {"id": "native-418-v2-reverse", "style": "reverse", "label": "由位置選句", "title": "走道不是貨架", "intro": "分清 aisle 指通道。", "questions": ["native-418-v2-reverse"]},
  {"id": "native-418-v2-transfer", "style": "transfer", "label": "新超市自評", "title": "冷藏區的窄走道", "intro": "自己寫提醒和可行安排，再看示例。", "questions": ["native-418-v2-transfer"]}
];

export default {revision:2,summary:"用 Your cart is blocking the aisle. 禮貌指出購物車擋住超市走道。",steps,questions,takeaways:["Your cart is blocking the aisle.", "Which aisle is the cereal in?"],completionTitle:"你能指出購物車擋路的位置，並在新走道情境提出可行請求。"};

import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-263-v2-audio','audio','只聽這個付款請求。說話者想對一張鈔票做甚麼？',['換成幾張較小面額的鈔票。','把鈔票撕開。','取消一筆二十元付款。','借一張二十元鈔票。'],'換成幾張較小面額的鈔票。','break a twenty 是日常口語的「找開一張二十元」，不是破壞紙幣。'),
  mc('native-263-v2-reverse','reverse','自動售賣機只收小鈔；你只有一張 $20。你可怎樣請店員幫忙？',["Can you break a twenty?","Can you tear a twenty?","Can you charge me twenty more?","Can you lend me a twenty?"],"Can you break a twenty?",'break 在這個現金情境指換成小面額；lend 則表示借錢。'),
  mc('native-263-v2-rewrite','rewrite','朋友用「destroy a twenty-dollar bill」描述你找換零錢的請求。哪句改寫能保留原意？',["Could you break a twenty for me?","Could you rip up my twenty?","Could you print a new twenty?","Could you keep my twenty?"],"Could you break a twenty for me?",'加 for me 說明請求，break 在固定用法裏表示找開而非撕毀。'),
  mc('native-263-v2-explain','explain','為何店員聽到「Can you break a twenty?」不會以為你要他撕鈔票？',['在現金交易場景，break a bill 慣常指換成小面額。','break 在任何英文句子都表示付款。','twenty 在這裏是二十張鈔票。','店員通常不會聽到 break 這個字。'],'在現金交易場景，break a bill 慣常指換成小面額。','語境和 break a bill 這個固定用法一起決定意思。'),
  mc('native-263-v2-tone','tone','收銀員說可以找開，接着問你想怎樣換。你希望拿四張五元。哪句合適？',["Four fives would be great, thanks.","Break it into four dollars.","Give me four twenties instead.","I don't need any change after all."],"Four fives would be great, thanks.",'four fives 即四張五元，合共二十元；回答明確且有禮貌。'),
  open('native-263-v2-rewrite-write','rewrite','新情境：你到洗衣店，投幣機不收大鈔。你只有一張二十元，想向櫃台換成四張五元。寫兩句英文提出請求及你想要的面額。',
    ["Could you break a twenty for me? Four fives would be great.","Can you break this twenty? I'd like four five-dollar bills, please.","I need smaller bills for the machine. Could you break a twenty into four fives?"],
    '自評時看是否先請對方找開鈔票，再準確說出四張五元。')
];
const steps=[
  {id:'native-263-v2-audio',style:'audio',label:'聽懂口語',title:'break 這張鈔票？',intro:'先聽問句，再按現金情境判斷。',model:'Can you break a twenty?',zh:'可以幫我找開二十元嗎？',audioOnly:true,questions:['native-263-v2-audio']},
  {id:'native-263-v2-reverse',style:'reverse',label:'目的配對',title:'售賣機只收小鈔',intro:'從實際需求選英文請求。',questions:['native-263-v2-reverse']},
  {id:'native-263-v2-rewrite',style:'rewrite',label:'改自然說法',title:'別逐字理解 break',intro:'保留找換零錢的意思。',questions:['native-263-v2-rewrite','native-263-v2-rewrite-write']},
  {id:'native-263-v2-explain',style:'explain',label:'說明語境',title:'為何沒人真的撕鈔票？',intro:'用現金交易的語境解釋意思。',questions:['native-263-v2-explain']},
  {id:'native-263-v2-tone',style:'tone',label:'收銀台對話',title:'說出你要的面額',intro:'對方答應後把需求講清楚。',questions:['native-263-v2-tone']},
  {id:'native-263-v2-speak',style:'speak',label:'即時口說',title:'請店員找開',intro:'先自己說；錄音或跳過後才聽示範。',model:'Can you break a twenty?',zh:'可以幫我找開二十元嗎？',speakingPrompt:'你手上只有一張二十元鈔票，要換成幾張小鈔。向店員提出請求。',recording:'phrase',questions:[]}
];
export default {revision:2,summary:'在現金場景用 break a twenty 請人把 $20 換成小鈔，並說清楚所需面額。',steps,questions,takeaways:['Can you break a twenty?'],completionTitle:'你能自然請人找開二十元，也能回答要怎樣找換。'};

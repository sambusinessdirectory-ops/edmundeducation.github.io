import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-138-v2-audio','audio','只聽座位名稱。在餐廳最可能看到甚麼？',['靠牆、兩邊相對的高背卡座。','靠窗的普通四人餐桌。','吧台前一張沒有靠背的高凳。','吧台旁的長形高桌。'],'靠牆、兩邊相對的高背卡座。','booth 是餐廳常見的卡座，與一般獨立桌椅不同。'),
  mc('native-138-v2-reverse','reverse','服務生問你想坐獨立桌椅還是靠牆的卡座。後者英文是哪個詞？',["booth","counter","stool","patio"],"booth",'booth 是有靠背、通常固定在牆邊的座位；stool 是高凳，patio 是戶外區。'),
  mc('native-138-v2-contrast','contrast','四個人希望坐兩排相對的高背固定座位。哪個安排比吧台高凳合適？',["A booth with facing seats.","Four stools at the counter.","A four-person table with separate chairs.","A banquette along one wall, with chairs opposite."],"A booth with facing seats.",'卡座通常讓同伴相對而坐；吧台凳多朝向同一方向。'),
  mc('native-138-v2-repair','repair','你指著卡座說 Can we sit in the counter? 哪句改法能讓服務生明白？',["Could we have a booth, please?","Could we stand by the counter?","Could we have a table by the window?","Could we sit at the counter instead?"],"Could we have a booth, please?",'想要的是 booth；counter 指吧台位置，不是高背卡座。'),
  open('native-138-v2-final','final','最後挑戰：餐廳服務生問 Table or booth? 你和朋友想坐靠牆的高背卡座，因為比較安靜。寫兩句英文回答並簡單說明偏好。',["A booth, please. We'd like somewhere a little quieter.","Could we have a booth? The one by the wall would be great."],'直接選 booth，再用位置或安靜的理由讓服務生安排。')
];
const steps=[
  {id:'native-138-v2-audio',style:'audio',label:'先聽座位',title:'靠牆的卡座',intro:'只聽一個餐廳用詞。',model:'booth',zh:'餐廳卡座。',audioOnly:true,questions:['native-138-v2-audio']},
  {id:'native-138-v2-reverse',style:'reverse',label:'由圖像想詞',title:'有高靠背的座位',intro:'從座位結構找英文名稱。',questions:['native-138-v2-reverse']},
  {id:'native-138-v2-contrast',style:'contrast',label:'比較座位',title:'卡座還是吧台？',intro:'依照同行人數和坐法判斷。',questions:['native-138-v2-contrast']},
  {id:'native-138-v2-repair',style:'repair',label:'修正請求',title:'別把卡座叫吧台',intro:'換成服務生能直接安排的說法。',questions:['native-138-v2-repair']},
  {id:'native-138-v2-speak',style:'speak',label:'當場點座',title:'回答 Table or booth?',intro:'先自己說；錄音或跳過後才聽示範。',model:'Table or booth?',zh:'普通桌位還是卡座？',speakingPrompt:'服務生問座位類型，你想要卡座。先口頭回答。',recording:'phrase',questions:[]},
  {id:'native-138-v2-final',style:'final',label:'入座挑戰',title:'說出偏好與原因',intro:'自己提出完整請求。',questions:['native-138-v2-final']}
];
export default {revision:2,summary:'認識餐廳 booth 卡座，並能在桌位、吧台和卡座之間清楚提出偏好。',steps,questions,takeaways:['booth','Table or booth?'],completionTitle:'你能在餐廳自然要求一個卡座。'};

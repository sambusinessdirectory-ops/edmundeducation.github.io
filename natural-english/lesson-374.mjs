import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-374-v2-audio','audio','聽完這句商店描述，商品上缺少甚麼？',['標示售價的小標籤。','商品本身的包裝。','收銀台的掃描器。','品牌商標。'],'標示售價的小標籤。','price tag 是商品上的價格標籤；missing 表示找不到它。'),
  mc('native-374-v2-scene','scene','你拿起一件外套想看價格，吊牌上只有尺寸，附近也沒有售價。怎樣向店員說？',["It's missing a price tag.","The price tag says ten dollars.","The zipper is missing.","The sleeve is torn."],"It's missing a price tag.",'商品有尺寸資訊但沒有價格標示，所以是缺少 price tag。'),
  mc('native-374-v2-reverse','reverse','店員說「This is missing a price tag」。你應預期他要查哪項資訊？',['這件商品的售價。','退貨期限。','外套的布料成分。','貨架的高度。'],'這件商品的售價。','缺少價格標籤使顧客看不到售價，店員可掃碼查價。'),
  mc('native-374-v2-detail','detail','哪個觀察最能支持 missing a price tag，而不是 tag shows no discount？',['商品上完全找不到任何標價。','標價 $30，但沒有打折。','標價字體太小，仍可讀出 $30。','折扣貼紙遮住了一半價格。'],'商品上完全找不到任何標價。','missing 表示價格標籤不在，而非標籤存在但內容不合意。'),
  mc('native-374-v2-explain','explain','店員說「Let me scan it for you」。這如何幫助顧客？',['掃碼可查到商品價格，彌補標籤缺失。','掃碼會自動修好外套拉鍊。','掃碼證明商品完全免費。','掃碼會關閉退貨期限。'],'掃碼可查到商品價格，彌補標籤缺失。','顧客目前缺少的是售價資訊，掃碼提供另一種查價方式。'),
  open('native-374-v2-final','final','新情境：你在書店拿起一本筆記本，找不到售價標籤，想請店員查價。寫兩句英文指出問題並提出請求。',["Excuse me, this notebook is missing a price tag. Could you check the price for me?","I can't find a price on this notebook. Would you mind scanning it for me?","This is missing a price tag. Could you tell me how much it costs?"],'自評時看是否說明商品沒有價格標示，並提出查價，而不是斷定免費。')
];
const steps=[
  {id:'native-374-v2-audio',style:'audio',label:'聽出缺少物',title:'商品少了哪個標籤？',intro:'聽商品缺少的是售價標籤。',model:'It’s missing a price tag.',zh:'它沒有價格標籤。',audioOnly:true,questions:['native-374-v2-audio']},
  {id:'native-374-v2-scene',style:'scene',label:'外套查價',title:'有尺寸，沒售價',intro:'從吊牌資訊判斷。',questions:['native-374-v2-scene']},
  {id:'native-374-v2-reverse',style:'reverse',label:'由句找需求',title:'店員要查甚麼？',intro:'理解缺少標價帶來的問題。',questions:['native-374-v2-reverse']},
  {id:'native-374-v2-detail',style:'detail',label:'確認 missing',title:'標籤不存在還是沒折扣？',intro:'分清缺失與標籤內容。',questions:['native-374-v2-detail']},
  {id:'native-374-v2-explain',style:'explain',label:'店員掃碼',title:'另一種查價方式',intro:'連結問題與店員的處理。',questions:['native-374-v2-explain']},
  {id:'native-374-v2-final',style:'final',label:'書店挑戰',title:'請店員幫忙查價',intro:'指出缺少價錢標籤，再請店員掃碼查價。',questions:['native-374-v2-final']}
];
export default {revision:2,summary:'用 missing a price tag 指出商品缺少售價標示，並請店員掃碼查價。',steps,questions,takeaways:['It’s missing a price tag.'],completionTitle:'你能清楚指出缺少價格標籤並禮貌請店員查價。'};

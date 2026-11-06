import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-135-v2-audio','audio','只聽生菜的狀況。它失去了甚麼？',['葉片原本挺立的爽脆感。','表面的綠色。','剛洗完而表面帶水。','久放後的脆度。'],'葉片原本挺立的爽脆感。','wilted 指葉菜失去水分後變軟下垂，對比原本挺立爽脆的葉片。'),
  mc('native-135-v2-detail','detail','打開冰箱後，哪個觀察最能支持生菜是 wilted？',['葉片垂下來，摸起來不再爽脆。','葉片剛洗好，水珠仍在表面。','葉片摸起來有一點濕。','葉片顏色還很綠。'],'葉片垂下來，摸起來不再爽脆。','垂軟、失去挺度是 wilted 的核心表徵。'),
  mc('native-135-v2-contrast','contrast','薯條被蒸氣弄得濕軟，生菜久放而萎垂。哪組詞最合適？',["soggy fries; wilted lettuce","wilted fries; soggy lettuce","stale fries; soggy lettuce","crispy fries; soft lettuce"],"soggy fries; wilted lettuce",'soggy 強調吸水後濕軟；wilted 強調葉菜失水後下垂。'),
  mc('native-135-v2-rewrite','rewrite','你要在備餐群組簡短說明為何不用這盒生菜。哪句最好？',["The lettuce is wilted and no longer crisp; I'll use the fresh box.","The lettuce is a little damp; I'll dry it.","The lettuce looks green enough, so I'll use it.","The lettuce is still cold; let's use it."],"The lettuce is wilted and no longer crisp; I'll use the fresh box.",'訊息說出生菜萎垂、不再爽脆，並指定改用新鮮盒子，讓備餐同伴知道原因和下一步。'),
  open('native-135-v2-final','final','最後挑戰：你準備沙律，發現放了幾天的菠菜葉軟軟垂下；朋友問能不能用。寫兩句英文描述葉子的狀況及你的決定。',["The spinach is wilted. I'd rather use some fresh leaves for the salad.","These leaves have wilted and aren't crisp anymore. Let's use the fresh spinach instead."],'wilted 可用於菠菜等葉菜；說明失水下垂，再提出具體決定。')
];
const steps=[
  {id:'native-135-v2-audio',style:'audio',label:'聽出狀態',title:'不再挺立的生菜',intro:'先只聽一句。',model:'The lettuce is wilted.',zh:'生菜萎軟了。',audioOnly:true,questions:['native-135-v2-audio']},
  {id:'native-135-v2-detail',style:'detail',label:'看葉片',title:'哪種變化最關鍵？',intro:'找出「萎」的可見表徵。',questions:['native-135-v2-detail']},
  {id:'native-135-v2-contrast',style:'contrast',label:'比較濕軟',title:'薯條與生菜不一樣',intro:'區分吸水變軟與失水萎垂。',model:'The fries are soggy.',zh:'薯條濕軟了。',questions:['native-135-v2-contrast']},
  {id:'native-135-v2-rewrite',style:'rewrite',label:'備餐訊息',title:'說明不用這盒',intro:'把判斷寫成同伴可執行的訊息。',questions:['native-135-v2-rewrite']},
  {id:'native-135-v2-final',style:'final',label:'沙律挑戰',title:'菠菜葉也會萎',intro:'自己描述新食材並作出決定。',questions:['native-135-v2-final']}
];
export default {revision:2,summary:'用 wilted 描述葉菜失水、垂軟，並與薯條吸水後的 soggy 區分。',steps,questions,takeaways:['The lettuce is wilted.','The fries are soggy.'],completionTitle:'你能從葉片的狀態說明為何要換新鮮菜。'};

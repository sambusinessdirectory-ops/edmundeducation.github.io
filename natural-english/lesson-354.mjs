import {mc} from './editorial-question.mjs';
const open=(id,style,prompt,answers,explanation)=>({id,type:'open',style,prompt,answers,explanation});
const questions=[
  mc('native-354-v2-audio','audio','聽完這句對烤盤的評語，殘渣最可能怎樣？',['乾硬成厚層，牢牢黏在表面。','剛灑上去，輕吹就掉。','已完全洗淨。','只是一點清水。'],'乾硬成厚層，牢牢黏在表面。','caked on 指污物累積、乾硬地附着在表面。'),
  mc('native-354-v2-detail','detail','你洗昨晚的烤盤。哪個線索最支持 food is caked on？',['醬汁乾成厚厚硬層，刷幾下仍不鬆。','盤面還有幾滴新鮮油。','盤上只有鬆散麵包屑。','盤已洗淨但仍熱。'],'醬汁乾成厚厚硬層，刷幾下仍不鬆。','厚、乾、黏得牢是 caked on 的重點；新鮮油滴或鬆屑不同。'),
  mc('native-354-v2-reverse','reverse','烤盤上的醬汁放了一晚，現在結成一層很難刷下的硬塊。哪句口語描述合適？',["It's caked on.","It's still wet and loose.","The tray is cracked.","The sauce has separated."],"It's caked on.",'it 指殘留醬汁；caked on 描述它已乾硬附着在盤上。'),
  mc('native-354-v2-repair','repair','室友說「There are a few crumbs」。其實烤盤有厚厚一層乾硬殘渣。怎樣修正？',["The food is completely caked on.","The tray has no residue left.","There are only two loose crumbs.","The tray is filled with fresh water."],"The food is completely caked on.",'few crumbs 低估了厚度和黏附程度；caked on 能說出清洗困難。'),
  open('native-354-v2-final','final','新情境：你打算洗昨晚的烤盤，乾掉的醬汁厚厚黏住，刷不下來。寫兩句英文向同伴說明，並提議先浸泡。',["The sauce is caked on the tray. Let's soak it in warm water first.","I can't scrub this residue off because it's caked on. I'll soak the tray before trying again.","There's a thick layer of food caked onto the pan. Maybe soaking it will loosen it."],'自評時看是否說明殘渣乾硬黏附，再提出與清潔有關的浸泡方法。')
];
const steps=[
  {id:'native-354-v2-audio',style:'audio',label:'聽出黏附程度',title:'為何那麼難洗？',intro:'聽烤盤上殘渣是否已乾硬黏牢。',model:'It’s caked on.',zh:'它乾硬黏住了。',audioOnly:true,questions:['native-354-v2-audio']},
  {id:'native-354-v2-detail',style:'detail',label:'檢查烤盤',title:'厚硬的醬汁層',intro:'從外觀和刷洗反應判斷。',questions:['native-354-v2-detail']},
  {id:'native-354-v2-reverse',style:'reverse',label:'由殘渣找英文',title:'昨晚留到今天',intro:'選能說出黏附程度的口語。',questions:['native-354-v2-reverse']},
  {id:'native-354-v2-repair',style:'repair',label:'修正程度',title:'不只是幾粒麵包屑',intro:'把過輕說法改成符合現場。',questions:['native-354-v2-repair']},
  {id:'native-354-v2-speak',style:'speak',label:'即時口說',title:'告訴同伴很難刷',intro:'先自己說；錄音或跳過後才聽示範。',model:'It’s caked on.',zh:'它乾硬黏住了。',speakingPrompt:'烤盤食物殘渣乾成厚層，怎樣刷都不掉。用一句英文描述。',recording:'phrase',questions:[]},
  {id:'native-354-v2-final',style:'final',label:'清洗挑戰',title:'提議先浸泡',intro:'說明殘渣為何難洗，再提議先浸泡。',questions:['native-354-v2-final']}
];
export default {revision:2,summary:'用 caked on 描述乾硬食物殘渣厚厚黏在烤盤上，並提出浸泡。',steps,questions,takeaways:['It’s caked on.'],completionTitle:'你能說明殘渣難洗的原因，並提出處理方法。'};

// Task 1 Tables 10: shares attending four secondary school types, 2000/05/09.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,detail:'百分比是各年份學生在四類學校的分布；同一年四列相加為 100%。',options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按 2000→2005→2009 的領先類別與升跌寫。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The table shows what percentage of pupils went to each of four kinds of secondary school in 2000, 2005 and 2009.',
 'Overall, the share of pupils at voluntary-controlled and grammar schools fell a lot, while the community-school share rose.',
 'Voluntary-controlled schools had by far the most pupils in 2000, but community schools had the most in 2009. Specialist schools were the smallest or tied for smallest every year.',
 'In 2000, voluntary-controlled schools had 52% of pupils, just over half and more than twice the 24% at grammar schools.',
 'Specialist and community schools each had 12%; together they had the same share as grammar schools, 24%.',
 'By 2005, voluntary-controlled schools had fallen to 38%, while community schools had risen quickly to 32%. Their gap was just six percentage points.',
 'By 2009, the change was even bigger.',
 'Community schools rose again to 58%, nearly five times their starting share of 12%.',
 'In contrast, voluntary-controlled schools fell to 20%, less than half their 2000 share of 52%.',
 'Grammar schools fell each time, from 24% to 12%, while specialist schools fell only a little, from 12% to 10%.',
];
const vocabulary=[
 v(['compares','shows','比較'],['proportions of pupils','what percentage of pupils','學生比例'],['enrolled in','went to','就讀於'],['four types of secondary school','four kinds of secondary school','四類中學']),
 v(['shifted markedly away from','fell a lot','顯著轉離'],['towards community schools','community-school share rose','轉向社區學校'],['attendance','share of pupils','就讀比例']),
 v(['by far the largest share','by far the most pupils','份額遠最大'],['dominant type','had the most','成為最多學生類型'],['smallest or joint-smallest','smallest or tied for smallest','最小或並列最小'],['throughout','every year','全期']),
 v(['just over half','just over half','略多於一半'],['making this sector more than twice as large','more than twice','是另一類兩倍以上'],['accounted for','at','佔有']),
 v(['each had 12%','each had 12%','各佔百分之十二'],['combined share','together they had','合計份額'],['equal to','same share as','相等']),
 v(['had fallen to','had fallen to','跌至'],['climbed sharply','risen quickly','急升'],['narrowing the gap','Their gap was','縮窄差距'],['percentage points','percentage points','百分點']),
 v(['more pronounced','even bigger','更明顯'],['by 2009','By 2009','至二〇〇九年']),
 v(['rose further','rose again','進一步上升'],['almost five times','nearly five times','接近五倍'],['initial proportion','starting share','初始比例']),
 v(['By contrast','In contrast','相反'],['dropped to','fell to','跌至'],['less than half','less than half','少於一半']),
 v(['declined steadily','fell each time','持續下跌'],['slipped only slightly','fell only a little','僅輕微下降'],['from 12% to 10%','from 12% to 10%','由百分之十二至十']),
];
const structures=[
 f('The table compares the proportions of pupils enrolled in four types of secondary school in 2010, 2015 and 2020.','引言交代四類學校、學生分布和三個年份',[1,3,6],{formula:'The table compares the proportions of pupils enrolled in four types of secondary school in [三年份]',meaning:'四類中學就讀比例，2000、2005、2009。',usage:'表是學生比例，不能推成學校數量或學生總人數。',parts:[link('The table compares the proportions of pupils enrolled in four types of secondary school in '),slot('2000, 2005 and 2009','三年份'),link('.')]}),
 f('Overall, attendance shifted markedly away from schools of Types A and B towards schools of Type C.','概覽兩類下跌與另一類增加的方向轉移',[0,3,6],{formula:'Overall, attendance shifted markedly away from [下降類] towards [上升類]',meaning:'Voluntary-controlled 52→20、grammar 24→12；community 12→58%。',usage:'share 的變動不證明學生實際由一所學校轉校到另一所。',parts:[link('Overall, attendance shifted markedly away from '),slot('voluntary-controlled and grammar schools','下降類'),link(' towards '),slot('community schools','上升類'),link('.')]}),
 f('While Type A schools had by far the largest share at the beginning, Type B schools became the dominant type by 2020, and Type C schools remained the smallest or joint-smallest category throughout.','概覽首尾最大類與全期最小類',[0,3,6],{formula:'While [起初最大類] had by far the largest share at the beginning, [最後最大類] became the dominant type by [末年], and [最小類] remained the smallest or joint-smallest category throughout',meaning:'2000 voluntary-controlled 52 最大；2009 community 58 最大；specialist 2000 並列最小、之後單獨最小。',usage:'2000 specialist/community 都 12%，不能說 specialist 全期獨自最小。',parts:[link('While '),slot('voluntary-controlled schools','起初最大類'),link(' had by far the largest share at the beginning, '),slot('community schools','最後最大類'),link(' became the dominant type by '),slot('2009','末年'),link(', and '),slot('specialist schools','最小類'),link(' remained the smallest or joint-smallest category throughout.')]}),
 f('In 2000, just over half of pupils attended Type A schools, at 54%, making this sector more than twice as large as Type B schools, which accounted for 25%.','起年報最大類並用兩倍比較第二類',[0,2,6],{formula:'In [年], just over half of pupils attended [最大類], at [值], making this sector more than twice as large as [比較類], which accounted for [值]',meaning:'2000 voluntary-controlled 52%，grammar 24%；52>2×24。',usage:'兩倍比較的是同年學生份額，不是學校所數量。',parts:[link('In '),slot('2000','年'),link(', just over half of pupils attended '),slot('voluntary-controlled schools','最大類'),link(', at '),slot('52%','份額'),link(', making this sector more than twice as large as '),slot('grammar schools','比較類'),link(', which accounted for '),slot('24%','份額'),link('.')]}),
 f('Type C and Type D schools each had 13%, so their combined share was equal to that of Type B schools alone.','以 so 計算兩類合計與單一類相等',[0,2,6],{formula:'[兩類] each had [同值], so their combined share was equal to that of [第三類] alone',meaning:'2000 specialist 12 + community 12 = grammar 24%。',usage:'combined share 可相加，因四類在同年互斥且同分母。',parts:[slot('Specialist and community schools','兩類'),link(' each had '),slot('12%','同值'),link(', so their combined share was equal to that of '),slot('grammar schools','第三類'),link(' alone.')]}),
 f('By 2015, however, Type A schools had fallen to 40%, while Type B schools had climbed sharply to 34%, narrowing the gap between the two leading categories to only six percentage points.','同時比較兩類的反向變化與當年差距',[0,2,4],{formula:'By [年], however, [下降類] had fallen to [值], while [上升類] had climbed sharply to [值], narrowing the gap between the two leading categories to only [差距] percentage points',meaning:'2005 voluntary-controlled 38、community 32，相差 6 百分點。',usage:'38−32=6 個百分點；不是 6% 相對減幅。',parts:[link('By '),slot('2005','年'),link(', however, '),slot('voluntary-controlled schools','下降類'),link(' had fallen to '),slot('38%','值'),link(', while '),slot('community schools','上升類'),link(' had climbed sharply to '),slot('32%','值'),link(', narrowing the gap between the two leading categories to only '),slot('six','差距'),link(' percentage points.')]}),
 f('The change became more pronounced by 2015.','用短過渡引出末年的更大轉變',[0,2,4],{formula:'The change became more pronounced by [末年]',meaning:'2009 community 58、voluntary-controlled 20，差距更大。',usage:'短句指向後面具體數值，不自行推斷原因。',parts:[link('The change became more pronounced by '),slot('2009','末年'),link('.')]}),
 f('Community schools rose further to 60%, almost five times their initial proportion.','把末年值與起年基數做近五倍比較',[0,2,4],{formula:'Community schools rose further to [末值], almost five times their initial proportion',meaning:'Community 12→58%；58/12≈4.83。',usage:'近五倍是比例的倍數，不是增加五個百分點。',parts:[link('Community schools rose further to '),slot('58%','末值'),link(', almost five times their initial proportion.')]}),
 f('By contrast, Type A schools dropped to 18%, less than half their 2000 figure.','以反向變化對照上句增長類',[0,2,4],{formula:'By contrast, [下降類] dropped to [末值], less than half their [起年] figure',meaning:'Voluntary-controlled 52→20%；20<26。',usage:'less than half 比較的是兩年同一類份額。',parts:[link('By contrast, '),slot('voluntary-controlled schools','下降類'),link(' dropped to '),slot('20%','末值'),link(', less than half their '),slot('2000','起年'),link(' figure.')]}),
 f('Type B schools also declined steadily, from 26% to 13%, while Type C schools slipped only slightly, from 12% to 11%.','對比兩個剩餘類別下降幅度不同',[0,2,4],{formula:'[類甲] also declined steadily, from [起值] to [末值], while [類乙] slipped only slightly, from [起值] to [末值]',meaning:'Grammar 24→19→12，specialist 12→11→10%。',usage:'grammar 三次均降；specialist 只減 2 百分點。',parts:[slot('Grammar schools','下降較多類'),link(' also declined steadily, from '),slot('24%','起值'),link(' to '),slot('12%','末值'),link(', while '),slot('specialist schools','下降較少類'),link(' slipped only slightly, from '),slot('12%','起值'),link(' to '),slot('10%','末值'),link('.')]}),
];
const intro=[quiz('每個百分比的分母是甚麼？',['該年份所有列於表中的中學生','該年學校總數','某類學校的教師人數','每名學生的考試分數'],'四類份額同年加總為 100%。'),{type:'multi',prompt:'哪兩項概覽最準確？',detail:'選兩項，再按「確認」。',options:['社區學校份額由 12% 大升至 58%，末年最多','志願管理及文法學校份額都下降','專門學校在 2000 年獨自最少','四類學校份額都上升'],correct:[0,1],why:'主趨勢是由兩類下降到社區學校份額提高。'}];
const route=[sequence('按範文重排三年學校份額',[
 ['引言','四類中學學生比例；2000、2005、2009。'],['概覽','志願管理／文法下降，社區上升；領先類易位。'],['2000→2005','52/24/12/12；2005 志願管理 38、社區 32，差 6 點。'],['2009','社區 58 最大；志願管理 20；文法 12；專門 10。'],
 ],'同年各類佔比可比較，跨年只比較同類份額趨勢。')];
const evidence=[
 quiz('2000 哪類最大？',['志願管理學校 52%','文法學校 24%','社區學校 12%','專門學校 12%'],'52% 略高於半數。'),
 quiz('2009 哪類最大？',['社區學校 58%','志願管理學校 20%','文法學校 12%','專門學校 10%'],'社區由 12 升至 58。'),
 quiz('2000 哪兩類並列最小？',['專門學校和社區學校，均 12%','文法和社區，均 24%','志願管理和文法，均 52%','四類完全相同'],'specialist/community 皆 12%。'),
 quiz('2005 兩大類差距？',['38−32=6 個百分點','38−32=6% 的相對增長','38−32=70 點','兩者已相同'],'voluntary-controlled 38、community 32。'),
 quiz('社區學校 2009 相對 2000？',['58/12≈4.83，接近五倍','正好增加五個百分點','份額減半','12/58≈5'],'倍數與百分點要分開。'),
];
const logic=[sequence('領先類型三年轉變',[
 ['2000','志願管理 52 最大；社區 12 與專門並列最小。'],['2005','志願管理 38 仍先於社區 32，差 6 點。'],['2009','社區 58 成最多；志願管理跌至 20。'],['轉變','只可說份額向社區類傾斜，不可推斷個別學生實際轉校。'],
 ],'表格是不同年份分布，不是個人追蹤。'),sequence('合計、差值與倍數',[
 ['2000 合計','專門 12 + 社區 12 = 文法 24%。'],['2005 差值','志願管理 38−社區 32=6 百分點。'],['2009 倍數','社區 58÷初值 12≈4.83，近五倍。'],['末年比較','志願管理 20 <2000 的半數 26。'],
 ],'四種比較都要保留年份和百分比單位。')];
const transfers=[
 transfer('另一表列四種學校在三年的學生份額。','哪句引言不誤作學校數量？',['表格比較三年學生就讀四類中學的比例。','表格列出三年各類學校的棟數。','每個百分比是教師人數。','數字代表考試平均分。'],['學生份額是量度對象。','沒有學校棟數。','非教師。','非分數。'],[0],'原文 proportions of pupils enrolled。'),
 transfer('志願管理 52→20、文法 24→12、社區 12→58%。','哪句概覽方向轉變？',['學生份額從志願管理和文法學校下降，社區學校份額上升。','四類份額均上升。','社區學校份額持續下降。','個別學生全部由舊校轉至新校。'],['份額升跌可說。','同年總和 100%。','方向反。','表不追蹤個人。'],[1],'原文 shifted away from two types towards community。'),
 transfer('2000 專門與社區同為 12%，其後專門最低。','哪句保留並列？',['專門學校全期最少或並列最少。','專門學校在 2000 年獨自最少。','社區學校在 2009 年最少。','志願管理學校全期最多。'],['2000 並列；之後獨自最少。','忽略社區同 12%。','2009 社區 58 最大。','2009 非。'],[2],'原文 smallest or joint-smallest。'),
 transfer('2000 志願管理 52%、文法 24%。','哪句兩倍比較成立？',['志願管理學校略多於一半，是文法學校份額兩倍以上。','文法學校份額是志願管理兩倍。','兩者同為 52%。','兩類學校的校舍數量差兩倍。'],['52>2×24。','方向反。','數值不同。','無校舍數。'],[3],'原文 just over half，more than twice grammar。'),
 transfer('2000 專門 12%、社區 12%、文法 24%。','哪句合計正確？',['專門與社區學校合計 24%，等於文法學校一類。','專門與社區合計 12%。','文法學校份額是兩者合計兩倍。','三類合計只有 24%。'],['12+12=24。','少算一類。','兩者合計相等。','三類合計 48。'],[4],'原文 combined share equal grammar alone。'),
 transfer('2005 志願管理 38%、社區 32%。','哪句差距單位正確？',['兩個最大類型相差 6 個百分點。','兩類相差 6% 的相對增長。','社區已超越志願管理。','志願管理仍為 52%。'],['38−32=6 百分點。','百分點不是相對百分比。','社區較低。','2005 為 38。'],[5],'原文 gap six percentage points。'),
 transfer('2009 社區 58%、志願管理 20%。','哪句可引出末年更大轉變？',['到 2009 年，類型間的變化更加明顯。','到 2009 年，全部四類回到 2000 的比例。','2009 年兩類完全相同。','2009 年不存在任何數據。'],['後文可用 58 對 20 支持。','份額變化大。','相差 38 點。','有數據。'],[6],'原文 change more pronounced by 2009。'),
 transfer('社區學校 2000 12%、2009 58%。','哪句倍數恰當？',['末年 58% 接近初期 12% 的五倍。','末年只比初期多五個百分點。','份額從 58% 下降至 12%。','末年恰好是初期十倍。'],['58/12≈4.83。','增加 46 點。','方向反。','非十倍。'],[7],'原文 almost five times initial proportion。'),
 transfer('志願管理學校 2000 52%、2009 20%。','哪句比較初末年正確？',['末年 20% 少於起年 52% 的一半。','末年 20% 高於起年。','兩年恰好相同。','2009 年為 58%。'],['20<26。','方向反。','兩值不同。','58 是社區。'],[8],'原文 less than half their 2000 figure。'),
 transfer('文法 24→19→12%；專門 12→11→10%。','哪句區分下降幅度？',['文法每次都降且幅度較大；專門只由 12% 微降至 10%。','專門由 12% 大升至 58%。','文法一直保持 24%。','兩類 2009 都是 20%。'],['兩類皆降，但程度不同。','58 是社區。','文法降。','文法 12、專門 10。'],[9],'原文 grammar declined steadily，specialist slipped slightly。'),
];
export default {key:'task1-tables:10',meta:{topic:'2000–2009 四類中學就讀學生份額',summary:'志願管理和文法學校份額下降，社區學校由 12% 升至 58% 成末年最大類；專門學校一直最小或並列最小。2005 志願管理 38% 與社區 32% 差 6 百分點。表格只提供各年分布，不能證明個別學生轉校。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

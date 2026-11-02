// Economic development: practical living-standard gains versus potential social-value losses.
// Hold for canonical Chinese repair in advantage-disadvantage-18-translations.review.json.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:18'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Many people see economic growth as one of the best ways to make everyday life better.',
 'Fast growth may weaken values such as helping neighbours and keeping families close. Still, I think the good points are clearly greater because it reduces problems caused by not having enough money and gives governments money to improve important public services.',
 'The biggest good point of economic growth is that it helps people in direct, everyday ways.',
 'When industries grow and businesses spend money to build more, more jobs become available, so families can earn regular pay instead of just having enough to get through each day.',
 'With more money from work, people can pay for better homes, healthier food and enough medical help.',
 'At the same time, more business activity brings in more tax money, letting governments build schools, hospitals and ways to travel.',
 'For example, growth in many less wealthy regions has brought clean water, steady electricity and more chances to go to school, changing daily life from the basics up.',
 'It is true that economic growth can also harm how people live together.',
 'In busy places where people compete strongly, they often work longer, move for jobs and think more about their own success.',
 'So being friendly to neighbours, helping family and taking responsibility together may slowly become less important.',
 'For example, adult children in fast-growing cities may move away for jobs, leaving older parents with less everyday help.',
 'Buying more goods can also encourage people to think a person matters mainly because of how much money they earn.',
 'Even so, these losses are serious, but I think the gains are greater.',
 'People can help bring back social values through teaching, family life and government action, while not having enough money and poor public services can do deeper and longer-lasting harm.',
 'To sum up, growth may weaken some important social values, but overall it does much more good than harm.',
 'By reducing poverty and paying for better public services, it makes life better for many people in a way that the problems do not outweigh.',
];
const vocabulary=[
 v(['Economic development','economic growth','經濟發展'],['widely seen','Many people see','普遍被視為'],['most effective ways','best ways','最有效方法'],['raise living standards','make everyday life better','提升生活水平']),
 v(['rapid growth','Fast growth','快速增長'],['weaken values','weaken values','削弱價值'],['community spirit','helping neighbours','社區精神'],['family cohesion','keeping families close','家庭凝聚'],['firmly believe','think','堅信'],['material hardship','problems caused by not having enough money','物質困境'],['essential public services','important public services','重要公共服務']),
 v(['principal advantage','biggest good point','主要優點'],['people’s lives','people','人們生活'],['immediate, practical ways','direct, everyday ways','直接實際方式']),
 v(['industries expand','industries grow','產業擴張'],['businesses invest','businesses spend money to build more','企業投資'],['jobs are created','jobs become available','創造工作'],['stable incomes','regular pay','穩定收入'],['merely get by','just having enough to get through each day','勉強維生']),
 v(['higher earnings','more money from work','較高收入'],['afford','pay for','負擔'],['better housing','better homes','較好住屋'],['more nutritious food','healthier food','更營養食物'],['adequate medical care','enough medical help','足夠醫療']),
 v(['At the same time','At the same time','同時'],['stronger economic activity','more business activity','更活躍經濟活動'],['tax revenue','tax money','稅收'],['enabling governments','letting governments','讓政府能'],['transport systems','ways to travel','交通系統']),
 v(['developing regions','less wealthy regions','發展中地區'],['clean water','clean water','潔淨用水'],['reliable electricity','steady electricity','穩定電力'],['wider access to education','more chances to go to school','更廣泛教育機會'],['transforming daily life','changing daily life','改變日常生活']),
 v(['Admittedly','It is true','誠然'],['economic progress','economic growth','經濟進步'],['social cost','harm how people live together','社會代價']),
 v(['fast-paced, competitive societies','busy places where people compete strongly','節奏快競爭激烈社會'],['longer hours','work longer','更長工時'],['relocate for employment','move for jobs','為工作搬遷'],['preoccupied with personal success','think more about their own success','更在意個人成就']),
 v(['As a result','So','因此'],['neighbourliness','being friendly to neighbours','鄰里互助'],['family duty','helping family','家庭責任'],['collective responsibility','taking responsibility together','集體責任'],['fade into the background','become less important','退居次要位置']),
 v(['For instance','For example','例如'],['rapidly expanding cities','fast-growing cities','迅速擴張城市'],['adult children','adult children','成年子女'],['elderly parents','older parents','年邁父母'],['day-to-day support','everyday help','日常支援']),
 v(['Consumerism','Buying more goods','消費主義'],['encourage the belief','encourage people to think','助長觀念'],['person’s worth','a person matters','人的價值'],['measured mainly by income','mainly because of how much money they earn','主要以收入衡量']),
 v(['Even so','Even so','即便如此'],['losses','losses','損失'],['serious','serious','嚴重'],['do not outweigh the gains','the gains are greater','不足以超過好處']),
 v(['Social values','social values','社會價值'],['not gone beyond repair','help bring back','並非無法修復'],['education','teaching','教育'],['family upbringing','family life','家庭教養'],['public policy','government action','公共政策'],['poverty','not having enough money','貧窮'],['poor public services','poor public services','欠佳公共服務'],['deeper and more lasting harm','deeper and longer-lasting harm','更深更持久傷害']),
 v(['In conclusion','To sum up','總結'],['erode','weaken','侵蝕'],['social values','social values','社會價值'],['overall impact','overall','整體影響'],['far more positive','does much more good than harm','正面得多']),
 v(['reducing poverty','reducing poverty','減少貧窮'],['funding better public services','paying for better public services','資助更好公共服務'],['quality of life','life better','生活質素'],['on a scale','for many people','廣泛層面'],['disadvantages do not surpass','problems do not outweigh','缺點不足超過']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error(`Missing fixed phrase ${i+1}: ${fixed}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'Economic development is widely seen as one way to raise household incomes.',d:[1,7,14],relation:'以普遍觀點開篇，提出經濟發展與生活水平的關係',formula:'Economic development is widely seen as [常見評價] to raise [生活結果]',meaning:'經濟發展常被視為提高生活水平的方法。',usage:'widely seen 是常見看法，正文才說明具體路徑。',links:['Economic development is widely seen as ', ' to raise ','.'],labels:['常見評價','生活結果']},
 {example:'Although rapid growth can weaken values such as neighbourhood ties and family contact, I firmly believe that its advantages clearly outweigh its disadvantages because it creates stable jobs and funds essential services.',d:[0,7,14],relation:'Although 承認社會價值風險，because 提出物質困境與公共服務的權衡理由',formula:'Although rapid growth can weaken values such as [社會價值], I firmly believe that its advantages clearly outweigh its disadvantages because [主要物質好處]',meaning:'作者承認社區與家庭價值可能受損，但認為減少困境與改善公共服務更重。',usage:'立場須同時建立物質收益及社會代價兩面，不能只寫口號。',links:['Although rapid growth can weaken values such as ', ', I firmly believe that its advantages clearly outweigh its disadvantages because ','.'],labels:['可能削弱的價值','權衡理由']},
 {example:'The principal advantage of economic development is that it improves people’s lives in direct and visible ways.',d:[1,7,13],relation:'第一大好處先定位在日常生活的實際改善',formula:'The principal advantage of economic development is that it improves people’s lives in [改善方式]',meaning:'經濟發展能帶來直接可感的生活改善。',usage:'後面需用工作、收入、住屋食物醫療具體化。',links:['The principal advantage of economic development is that it improves people’s lives in ','.'],labels:['改善方式']},
 {example:'As industries expand and businesses invest, more jobs are created, which allows families to earn regular pay rather than rely only on short-term help.',d:[2,8,12],relation:'以 As 連企業擴張到就業，再由 which 連家庭穩定收入',formula:'As industries expand and businesses invest, more jobs are created, which allows families to [收入結果] rather than [原來困境]',meaning:'產業投資創造工作，家庭可有穩定收入而非勉強維生。',usage:'這是範文提出的因果機制，不能把投資與所有家庭結果視為必然。',links:['As industries expand and businesses invest, more jobs are created, which allows families to ', ' rather than ','.'],labels:['收入改善','原來困境']},
 {example:'With higher earnings, people can afford safer homes, healthier meals and medical care.',d:[3,8,12],relation:'由較高收入推到住屋、食物與醫療三種實際生活條件',formula:'With higher earnings, people can afford [基本生活改善]',meaning:'收入提高可能令家庭較能負擔住屋、食物與醫療。',usage:'can 表可能能力，不是每人收入都必然上升。',links:['With higher earnings, people can afford ','.'],labels:['基本生活改善']},
 {example:'At the same time, stronger economic activity generates more tax revenue, enabling governments to improve schools and public transport.',d:[3,8,12],relation:'從個人收入轉到稅收與政府公共服務資源',formula:'At the same time, stronger economic activity generates [公共收入], enabling governments to [公共用途]',meaning:'經濟活動帶來稅收，可支援學校、醫院與交通建設。',usage:'稅收增加不等於每項工程必定落實；這是可用資源的論點。',links:['At the same time, stronger economic activity generates ', ', enabling governments to ','.'],labels:['公共收入','公共用途']},
 {example:'In many developing regions, for example, growth has brought cleaner water and more reliable electricity, transforming daily life from the ground up.',d:[4,8,12],relation:'以潔淨水、穩定電力和教育作公共改善例子',formula:'In many developing regions, for example, growth has brought [基礎服務], transforming daily life from the ground up',meaning:'範文以發展中地區的水、電和教育改善說明生活變化。',usage:'many 保留範圍，不能說所有發展中地區已有同等改善。',links:['In many developing regions, for example, growth has brought ', ', transforming daily life from the ground up.'],labels:['基礎服務']},
 {example:'Admittedly, economic progress can come at a cost to local relationships.',d:[3,9,12],relation:'用 Admittedly 承認增長的社會代價',formula:'Admittedly, economic progress can come at [社會代價]',meaning:'經濟進步也可能使社區與家庭關係受壓。',usage:'轉到另一面時不否認前文物質好處。',links:['Admittedly, economic progress can come at ','.'],labels:['社會代價']},
 {example:'In fast-paced, competitive societies, people often work longer hours, move for jobs and focus more on personal success.',d:[3,7,12],relation:'列出長工時、搬遷與個人成就關注三種社會條件',formula:'In fast-paced, competitive societies, people often [工時], [搬遷] and [注意力變化]',meaning:'高競爭社會可能令工作時間更長，因工作搬遷及更重個人成就。',usage:'often 是常見傾向，非所有人或所有經濟發展的必然效果。',links:['In fast-paced, competitive societies, people often ', ', ', ' and ','.'],labels:['工時','搬遷','注意力']},
 {example:'As a result, values such as trust between neighbours and family duty may gradually fade into the background.',d:[3,7,12],relation:'As a result 把前句工作與搬遷變化連到社會價值退居次要',formula:'As a result, values such as [社會價值] may gradually fade into the background',meaning:'鄰里、家庭和集體責任可能變得較不受重視。',usage:'may gradually 表慢性可能變化，不能說價值已完全消失。',links:['As a result, values such as ', ' may gradually fade into the background.'],labels:['社會價值']},
 {example:'For instance, in rapidly expanding cities, adult children may move away for work, leaving older parents with less regular support.',d:[4,7,12],relation:'用成年子女遷移與年邁父母支援減少作具體例子',formula:'For instance, in rapidly expanding cities, adult children may [遷移行為], leaving [家人] with [後果]',meaning:'子女因工作搬走，父母可能少了日常支援。',usage:'may 保留可能性；不是所有遷居者都不照顧父母。',links:['For instance, in rapidly expanding cities, adult children may ', ', leaving ', ' with ','.'],labels:['遷移行為','受影響家人','支援變化']},
 {example:'Consumerism can also encourage the belief that a person’s worth is measured mainly by earnings.',d:[4,7,10],relation:'補充收入成為衡量人價值標準的觀念風險',formula:'Consumerism can also encourage the belief that a person’s worth is measured mainly by [衡量標準]',meaning:'消費文化可能鼓勵以收入衡量一個人的價值。',usage:'can encourage 是觀念風險，非認同此判斷標準。',links:['Consumerism can also encourage the belief that a person’s worth is measured mainly by ','.'],labels:['不當衡量標準']},
 {example:'Even so, these losses, serious as they are, do not outweigh the material gains.',d:[3,7,10],relation:'讓步插入語 serious as they are 承認損失，仍作好處較重判斷',formula:'Even so, these losses, serious as they are, do not outweigh [較大好處]',meaning:'作者承認社會價值損失嚴重，但認為物質好處更大。',usage:'權衡不是說社會損失無關緊要。',links:['Even so, these losses, serious as they are, do not outweigh ','.'],labels:['較大好處']},
 {example:'Social values are not gone beyond repair; they can be strengthened through schools and family support, whereas poverty and poor public services cause deeper harm.',d:[4,8,12],relation:'分號提出價值可修復，whereas 比較貧窮及服務不足的傷害',formula:'Social values are not gone beyond repair; they can be strengthened through [修復途徑], whereas [物質問題] cause [更重傷害]',meaning:'社會價值可透過教育家庭政策加強，貧窮與服務差則較難忽視。',usage:'這是範文的權重理由，不表示修復社會關係完全容易。',links:['Social values are not gone beyond repair; they can be strengthened through ', ', whereas ', ' cause ','.'],labels:['修復途徑','物質問題','傷害']},
 {example:'In conclusion, while economic development may erode some important social values, its overall impact is more positive.',d:[2,8,12],relation:'結論承認社會價值可能受損，仍重申整體正面',formula:'In conclusion, while economic development may erode [社會價值], its overall impact is [權衡判斷]',meaning:'作者認為經濟發展的整體正面效果較重。',usage:'結論回應已討論的物質與社會兩邊，不加新理由。',links:['In conclusion, while economic development may erode ', ', its overall impact is ','.'],labels:['可能受損價值','整體判斷']},
 {example:'By reducing poverty and funding better public services, it improves daily life for many families on a scale that the disadvantages do not surpass.',d:[2,8,12],relation:'By + doing 回收減貧與公共服務，說明廣泛生活改善',formula:'By reducing poverty and funding better public services, it improves [廣泛生活結果] on a scale that the disadvantages do not surpass',meaning:'減貧及公共服務資助改善眾多人的生活質素。',usage:'最後一句是作者比較結果，不能當成無條件的經濟政策定律。',links:['By reducing poverty and funding better public services, it improves ', ' on a scale that the disadvantages do not surpass.'],labels:['廣泛生活結果']},
];
const usageGuides=[
 '當你要在引言指出一項做法普遍被認為有何主要作用時。',
 '當你要用 Although 承認代價，再明確比較整體利弊並列出判斷理由時。',
 '當你要用 The principal advantage 開始一段，先概括最重要的好處時。',
 '當你要用 As 說明兩項條件同時發展後，如何引出結果及其連鎖影響時。',
 '當你要用 With + 名詞片語承接前句變化，再列出人們因此能做的事時。',
 '當你要用 At the same time 加入另一條好處鏈，並以現在分詞指出它能促成甚麼時。',
 '當你要以具體地點和事物舉例，再用現在分詞收束其生活影響時。',
 '當你要用 Admittedly 開始承認一項與自己立場相反的代價時。',
 '當你要列出某種環境中的多項行為變化，為下一句後果作準備時。',
 '當你要用 As a result 將前句行為變化連到可能逐漸出現的影響時。',
 '當你要用 For instance 舉出具體人物及情況，展示前一句的抽象風險時。',
 '當你要用 can also 補充另一項可能影響，並以 that 子句說明一種觀念時。',
 '當你要用 Even so 承認先前的損失確實嚴重，但指出它們仍不足以推翻整體判斷時。',
 '當你要先回應一項問題可以修補，再用 whereas 比較另一項問題的嚴重程度時。',
 '當你要在結論中用 while 重申一項代價，同時清楚給出整體評價時。',
 '當你要用 By + doing 重述促成好處的兩項途徑，再概括其影響規模時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:`這句${s.relation}，用法與原文一致。`,distractorReason:`這句${s.relation}；它並非本題要辨認的句型及功能。`}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把工作、收入、稅收與社區家庭價值的比較排清。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('範文評估經濟發展的甚麼影響？',['物質生活改善與可能削弱的社會價值','只討論個人是否喜歡新商店','只比較兩條道路長度','只討論單一家公司的名稱'],'主題是 economic development 的利弊權衡。'),
 {type:'multi',prompt:'範文的兩條主要物質好處是甚麼？',detail:'選兩項，再按「確認」。',options:['更多工作與較穩定家庭收入','稅收可支持學校、醫院及交通等公共服務','保證任何家庭都永不貧窮','保證所有社區價值只會增強'],correct:[0,1],why:'家庭收入與政府公共服務是正文兩條好處。'},
];
const route=[sequence('依範文還原經濟與社會權衡',[
 ['背景與立場','經濟發展常被認為可提高生活水平；作者認為物質好處更重。'],
 ['家庭生活','產業擴張→工作→穩定收入→住屋、食物與醫療改善。'],
 ['公共服務','較多經濟活動帶來稅收，政府可改善學校、醫院與交通。'],
 ['社會代價','長工時、搬遷及個人成就取向可能削弱鄰里和家庭責任。'],
 ['權重理由','價值可透過教育家庭政策加強；貧窮與差劣服務的傷害可能更深更久。'],
 ],'作者承認社會損失嚴重，再解釋為何仍判斷經濟好處較大。')];
const evidence=[
 quiz('產業擴張如何可能改善家庭日常生活？',['增加工作與穩定收入，使家庭較能負擔住屋、食物與醫療','保證每人立即成為企業家','令所有人完全不用工作','自動消除每個家庭的所有困難'],'原文是工作→收入→基本生活條件。'),
 quiz('政府公共服務的資金從哪個機制來？',['更活躍經濟活動帶來更多稅收，政府可用於學校醫院與交通','只靠家庭搬遷','只靠社區精神消失','公共服務完全不需資金'],'tax revenue 與公共服務支出是範文第二條好處。'),
 quiz('範文如何描述經濟進步可能的社會代價？',['長工時、因工作搬遷及個人成就取向可能弱化鄰里與家庭責任','所有家庭必然停止照顧長者','任何經濟活動都必然毀掉社區','人們永遠不再與鄰居交談'],'often/may 表可能與傾向。'),
 quiz('成年子女搬走的例子支持甚麼？',['工作遷移可能使年長父母少了日常支持','成年子女搬家必然不再關心父母','每座城市的家庭都完全一樣','年長父母只需要交通系統'],'例子使家庭責任的損失具體。'),
 quiz('作者為何認為物質好處更重？',['社會價值可透過教育、家庭與政策加強，而貧窮和差劣服務傷害可能更深更久','社會價值完全不重要','貧窮不會影響任何人','公共服務改良必定毫無成本'],'權衡保留社會損失的嚴重性。'),
];
const logic=[
 sequence('個人與公共兩層物質改善',[
 ['產業投資','企業擴張可能創造工作。'],
 ['家庭收入','穩定收入較能支持住屋、食物與醫療。'],
 ['政府收入','經濟活動可能帶來較多稅款。'],
 ['公共服務','政府可建學校、醫院及交通系統。'],
 ],'家庭收入與稅收是兩條相連但不同的改善路徑。'),
 sequence('社會損失與最後權重',[
 ['生活節奏','長工時、搬遷與重視個人成就可能增加。'],
 ['關係風險','鄰里互助與家庭責任可能退到次要位置。'],
 ['可修復性','教育、家庭教養與公共政策或能加強價值。'],
 ['作者判斷','貧窮及公共服務欠佳的傷害被認為較深、較長。'],
 ],'「可修復」不等於社會損失無關緊要。'),
];
const transfers=[
 transfer('某地新工廠提供工作，家庭收入變得較穩定。','哪句完整轉用範文的家庭改善機制？',['穩定收入可能使家庭較能負擔住屋、營養食物和醫療照顧。','有工廠便保證每個家庭都完全沒有困難。','工廠增加與家庭生活完全無關。','收入穩定便不再需要任何公共服務。'],['工作→收入→基本生活條件。','過度保證。','忽略機制。','公共服務仍重要。'],[3,4],'原文 jobs→stable incomes→housing/food/medical care。'),
 transfer('地方商業活動增加，政府計劃改善交通與醫院。','哪句說明範文提出的公共路徑？',['經濟活動可能增加稅收，讓政府有更多資源改善公共設施。','商店一增加，醫院便自動建好。','稅收與公共服務完全沒有關係。','交通改善必然令所有家庭收入同樣上升。'],['稅收是中間機制。','未跳過政策與工程。','方向相反。','無此保證。'],[5,6],'原文 stronger activity→tax revenue→schools/hospitals/transport。'),
 transfer('一些成年人為新工作搬離家鄉，年長父母少了日常陪伴。','哪句準確表達範文的社會代價？',['因工作搬遷可能減少對年長父母的日常支援。','所有搬家的成年人必然不再照顧父母。','有工作的人不可能維持家庭關係。','父母的日常支援與居住距離毫無關係。'],['保留 may，說具體家庭後果。','過度斷言。','仍可維持關係。','可能相關。'],[8,10],'原文 adult children move away→elderly parents less day-to-day support。'),
 transfer('有人說收入是評估一個人價值的唯一標準。','哪句符合範文對消費主義的警惕？',['消費文化可能鼓勵以收入衡量人的價值，但這是一種值得質疑的觀念。','收入高必然代表善良與責任感高。','任何工作所得都沒有實際用途。','一旦經濟發展，所有人必然接受同一價值觀。'],['指出可能形成的觀念，不當作正確標準。','收入不等於人格。','抹掉物質好處。','過度普遍化。'],[11],'原文 consumerism can encourage belief worth measured by income。'),
 transfer('一個社區因工作繁忙而較少鄰里互助。','哪句同時承認損失與可能的修復途徑？',['互助減少是代價；學校、家庭與公共政策仍可能加強社區連結。','互助一減少便永遠無法修復。','只要經濟好，鄰里關係必然不重要。','社區價值只靠工資高低決定。'],['保留嚴重性與可修復性。','與原文相反。','作者未否定社會價值。','過度簡化。'],[9,12,13],'原文 losses serious but social values not gone beyond repair。'),
 transfer('作文需判斷一項政策的好處是否壓過缺點。','哪句使用本文的權重方法？',['先承認社會關係可能受損，再比較貧窮與差劣公共服務的長期傷害。','只列好處，不提已知缺點。','只列一個家庭例子便作全國結論。','凡是有缺點的政策都一定不能採用。'],['兩邊證據及傷害深度都比較。','沒有完整權衡。','單例不足。','無法比較權重。'],[1,12,13],'原文 serious as they are, losses do not outweigh gains。'),
 transfer('某區學校與醫院獲得新資金，但工作節奏也變快。','哪句保持兩層影響？',['公共服務可能改善，同時部分家庭和社區關係也可能受壓。','醫院一改善，工作壓力必然消失。','工作節奏加快便證明學校資金沒有作用。','資金與生活節奏完全不能同時變化。'],['物質與社會維度可並存。','無此保證。','不抹掉服務好處。','情境可同時發生。'],[5,8,9],'原文公共服務收益與社會代價並列。'),
 transfer('一些人認為基礎用水與電力改善比新商店數量更重要。','哪句與範文例子最接近？',['潔淨用水、穩定電力與教育機會可從根本改善日常生活。','只要新商店多，潔淨用水便不重要。','電力穩定必然令所有人富有。','基礎服務與生活品質毫無關係。'],['回到範文具體公共服務例子。','忽略基礎需求。','過度保證。','相反。'],[6],'原文 clean water/reliable electricity/wider education access。'),
 transfer('一篇作文論證經濟增長利大於弊。','哪句在結尾保留原文的限定與理由？',['增長可能侵蝕社區價值，但減貧與公共服務改善使作者判斷整體較正面。','增長永遠不會影響任何社會價值。','只要有人工作更長，所有物質好處便不存在。','結尾只重複「經濟好」，不用交代理由。'],['承認代價並列較重理由。','與正文相反。','未作權衡。','需理由。'],[14,15],'原文 while social values may erode, overall impact positive through poverty/services。'),
 transfer('另一題比較都市化帶來收入與鄰里關係的改變。','哪句可轉移本文的分析框架？',['分別追蹤工作與收入的好處，以及搬遷與忙碌對社區支援的代價。','都市化與經濟發展完全相同，所有結果必然一致。','只要收入增加，鄰里關係便不能討論。','只看一項價值，不看生活所需。'],['轉移兩條因果鏈，保留新情境差異。','跨題不保證同結論。','忽略代價。','需要權衡。'],[3,8,10,13],'原文 material gains 與 neighbourliness/family duty 兩線。'),
];
export default {key:'advantage-disadvantage:18',meta:{topic:'經濟發展的生活改善與社會價值代價',summary:'範文以工作、家庭收入及稅收支持公共服務說明物質好處；也承認長工時、搬遷和消費文化可能削弱家庭社區價值。作者認為減貧與公共服務的廣泛效果更重。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

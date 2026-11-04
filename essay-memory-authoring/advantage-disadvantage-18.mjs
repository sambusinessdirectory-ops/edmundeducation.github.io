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
 transfer('某地新工廠提供工作，家庭收入變得較穩定。','哪句完整轉用範文的家庭改善機制？',["較穩定收入或讓家庭更能負擔住屋、營養食物及醫療照顧", "工廠新增職位後，每個家庭都能立即負擔所有生活開支", "家庭收入較穩定，但住屋和醫療條件不可能因此改善", "新工廠帶來就業，只會改變產品數量而不影響家庭生活"],["把就業收入轉成具體生活條件。", "有工作不保證所有家庭零困難。", "收入可能改善支付能力。", "忽略家庭機制。"],[3,4],'原文 jobs→stable incomes→housing/food/medical care。'),
 transfer('地方商業活動增加，政府計劃改善交通與醫院。','哪句說明範文提出的公共路徑？',["商業活動或帶來較多稅收，政府可投入交通和醫院設施", "商店增加後，政府不用籌集稅收也能即時建好醫院", "地方生意較好或增加稅收，但公共服務不可能受益", "交通和醫院需要資金，所以政府不應考慮新增經濟活動"],["經濟活動經稅收到公共服務的路徑。", "項目仍需資源與決策。", "忽略再投資可能。", "否定收入來源的作用。"],[5,6],'原文 stronger activity→tax revenue→schools/hospitals/transport。'),
 transfer('一些成年人為新工作搬離家鄉，年長父母少了日常陪伴。','哪句準確表達範文的社會代價？',["工作搬遷或使成年人較少在日常生活中支援年長父母", "搬到遠處工作後，所有人便永遠不再關心年長父母", "搬遷能增加收入，所以父母的陪伴需求必然完全消失", "成年人住得較遠時，日常照顧與探望仍可保持完全不變"],["指出距離對日常支援的可能影響。", "把可能減少誇成完全斷絕。", "收入不能取代陪伴。", "距離可能影響頻率。"],[8,10],'原文 adult children move away→elderly parents less day-to-day support。'),
 transfer('有人說收入是評估一個人價值的唯一標準。','哪句符合範文對消費主義的警惕？',["以收入作唯一價值標準可能忽略關懷與責任，值得質疑", "收入能衡量工作成果，因此也足以代表一個人的全部品格", "消費文化可能影響觀念，所以所有薪酬資訊都應被禁止", "人們重視收入時，便不可能再重視任何家庭和社區關係"],["警惕把經濟價值誤當人的全部價值。", "收入不等於完整品格。", "質疑觀念不等於禁止資訊。", "過度推斷所有關係消失。"],[11],'原文 consumerism can encourage belief worth measured by income。'),
 transfer('一個社區因工作繁忙而較少鄰里互助。','哪句同時承認損失與可能的修復途徑？',["鄰里互助減少是代價，家庭學校與政策仍可重建連結", "社區互助一減少，便表示任何制度都無法改善關係", "經濟增長能增加收入，所以鄰里互助不再值得維持", "學校和家庭可支持社區，卻完全不能影響人際互助"],["承認代價，也提出仍可修復的途徑。", "社區關係未必不可修復。", "收入不取消連結價值。", "忽略社會機構作用。"],[9,12,13],'原文 losses serious but social values not gone beyond repair。'),
 transfer('作文需判斷一項政策的好處是否壓過缺點。','哪句使用本文的權重方法？',["承認社區關係受損，再比較貧窮與公共服務不足的代價", "只要政策能增加收入，便不需評估任何社會關係損失", "社區有一項代價，就足以否定所有減貧和醫療收益", "比較政策好壞時，列出正反項目數目便能決定分量"],["先承認缺點，再按影響程度權衡。", "漏掉已知代價。", "代價不自動壓過所有收益。", "數量不等於嚴重程度。"],[1,12,13],'原文 serious as they are, losses do not outweigh gains。'),
 transfer('某區學校與醫院獲得新資金，但工作節奏也變快。','哪句保持兩層影響？',["公共服務或改善，同時部分家庭和社區關係仍可能受壓", "醫院和學校得到資金後，所有家庭時間壓力便自然消失", "工作節奏較快時，新增公共服務資金便不可能有作用", "經濟增長可改善設施，因此不需要再觀察社區互助"],["把服務收益與關係代價分作兩層。", "公共投資不取消時間壓力。", "兩面影響可並存。", "仍須看社區關係。"],[5,8,9],'原文公共服務收益與社會代價並列。'),
 transfer('一些人認為基礎用水與電力改善比新商店數量更重要。','哪句與範文例子最接近？',["潔淨用水、穩定電力與教育機會可直接改善基本生活", "新商店增加能帶來選擇，因此潔淨用水不再是需要", "水電有助日常生活，但教育機會與基礎發展完全無關", "只要電力穩定，所有居民便會立即有相同收入水平"],["列出文章重視的基本服務和生活效果。", "商業選擇不取代用水。", "教育也是基礎生活機會。", "服務改善不保證收入相同。"],[6],'原文 clean water/reliable electricity/wider education access。'),
 transfer('一篇作文論證經濟增長利大於弊。','哪句在結尾保留原文的限定與理由？',["承認增長或損社區，仍因減貧與服務改善判整體正面", "既然作者判斷正面，便不必再提忙碌和關係疏離", "社區價值可能受損，所以新增工作和醫療收益全屬虛構", "只要家庭收入增加，便能保證所有居民同等受益"],["結論保留限制並說明何以仍支持。", "漏掉文章承認的代價。", "損失不否定其他收益。", "增長不保證均等分配。"],[14,15],'原文 while social values may erode, overall impact positive through poverty/services。'),
 transfer('另一題比較都市化帶來收入與鄰里關係的改變。','哪句可轉移本文的分析框架？',["比較都市工作與收入收益，也查搬遷忙碌對鄰里支援的影響", "都市收入可能較高，所以搬遷後的照顧變化不必討論", "鄰里互助或減少，便代表都市工作不會帶來任何收入", "只把經濟增長的結論搬到都市化題目，不查具體條件"],["轉移收入與社區關係兩條不同路徑。", "漏掉人際代價。", "代價不取消工作收益。", "新題結論仍須另證。"],[3,8,10,13],'原文 material gains 與 neighbourliness/family duty 兩線。'),
];
const revised=[
 {wrong:['新工廠帶來職位，家庭收入應足以應付各類生活開支','收入較穩定後，住屋改善較可能，醫療仍與收入無關','工廠創造就業，但家庭生活品質主要由產品數量決定'],why:['工作機會不保證所有家庭能負擔各項開支。','較穩定收入也可能增加醫療可及性。','家庭條件並非只由產品數量決定。']},
 {wrong:['商店增加可直接改善醫院，政府稅收只是次要途徑','地方生意較好或增加稅收，但公共設施仍不會受益','交通與醫院需要資金，因此應先限制新增商業活動'],why:['範文的公共路徑經過稅收與政府投入。','稅收可成為公共服務的資金來源。','資金需要不等於應限制經濟活動。']},
 {wrong:['搬到遠處工作後，收入提高可補足父母日常陪伴','搬遷可能增加收入，因此年長父母照顧需求會下降','成年人住得較遠，日常探望次數仍應與搬遷前相同'],why:['經濟支援不能直接取代日常陪伴。','收入增加不會消除父母照顧需要。','距離可能使日常探望較困難。']},
 {wrong:['收入可反映工作成果，亦可概括一個人的整體品格','消費文化影響觀念，所以薪酬資訊應少讓人知道','重視收入往往意味家庭和社區關係會變得次要'],why:['工作收入不能代表關懷與責任等全部價值。','原文警惕價值標準，未主張封鎖資訊。','重視收入不必然排除人際關係。']},
 {wrong:['社區互助減少後，正式政策已難以改善人際關係','經濟增長可增加收入，鄰里互助便不太需要維持','家庭學校能支持社區，但難以改變日常互助習慣'],why:['家庭、學校與政策仍可協助重建連結。','收入收益不取消互助的社會價值。','教育與家庭行動可影響互助行為。']},
 {wrong:['政策增加收入時，社區關係損失可列為次要因素','社區出現一項代價，減貧與醫療收益便較難成立','正反項目各列幾項，數量較多的一方就往往較重要'],why:['仍須按社會影響的大小作權衡。','關係代價不否定實際減貧和服務收益。','論據分量不能只按項目數目計算。']},
 {wrong:['醫院學校獲資金後，家庭時間壓力應可逐步下降','工作節奏變快時，新增公共服務便更難有實際作用','設施得到改善，因此社區互助可留待其他議題討論'],why:['資金改善不直接解除工作時間壓力。','服務改善與家庭受壓可同時發生。','此題要求同時看公共與社區影響。']},
 {wrong:['新商店增加選擇，因此用水與電力改善較不重要','水電有助日常生活，教育機會則與經濟發展分開','電力較穩定後，居民收入差距便會自然逐漸縮小'],why:['商店選擇不能代替基礎用水和供電。','範文同時把教育列為基本生活改善。','供電改善不直接決定收入分布。']},
 {wrong:['整體判斷正面，結論可將忙碌與關係疏離略去','社區價值或受損，故新增工作與醫療益處較不可靠','家庭收入增加時，便可推知居民受益程度相近'],why:['有權重的結論仍應承認已分析的代價。','社區代價不否定工作與醫療收益。','收入增長未必平均分配。']},
 {wrong:['都市收入可能較高，搬遷造成的照顧變化可略去','鄰里互助若減少，都市工作收入便較少值得討論','經濟增長的結論可直接移用，毋須再看都市條件'],why:['收入與照顧變化應並列分析。','互助代價不抹去收入收益。','轉移分析框架時仍須核對新情境。']},
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
transfers[9].options[0]='比較都市工作與收入收益，也查搬遷對鄰里支援的影響';
export default {key:'advantage-disadvantage:18',meta:{topic:'經濟發展的生活改善與社會價值代價',summary:'範文以工作、家庭收入及稅收支持公共服務說明物質好處；也承認長工時、搬遷和消費文化可能削弱家庭社區價值。作者認為減貧與公共服務的廣泛效果更重。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

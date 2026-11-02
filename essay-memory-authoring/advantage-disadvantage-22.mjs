// Mothers in paid work: financial resilience and role models versus time and fatigue.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:22'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Home machines that save time and effort make it easier for mothers to earn money while still caring for children who need them.',
 'Some people say this can make family life harder. Still, I think the good points are much greater because a working mother can make a family safer with money and help make home life fairer.',
 'The first big good point is having steadier family money.',
 'When both parents earn money, the family is better able to deal with rising prices, surprise medical costs or one parent losing a job.',
 'This greater ability to handle money problems lets parents give children better food, safer homes and more help with school, which helps children directly.',
 'For example, a family with two incomes may be able to pay for good care for their children, extra lessons or a home near a better school; otherwise these choices might cost too much.',
 'Just as important, less worry about money often means fewer arguments about it, so home feels calmer and safer for everyone.',
 'A second good point is that a mother’s job can improve what family members learn about roles at home.',
 'Children who see their mother doing important work for pay may grow up with a better understanding of duty, doing things for themselves and fairness between men and women.',
 'A daughter may learn that being a mother does not mean needing another person’s money, while a son may be less likely to think that only women should care for children and do housework.',
 'It is true that there are problems, especially less time at home and the chance of feeling very tired.',
 'Even so, families can usually deal with these problems by using home machines, arranging child care and sharing housework more fairly between parents.',
 'Put another way, losing a small amount of time together is less harmful than living with money problems for years or with unfair roles at home.',
 'To sum up, when a mother works, the family usually gets both a stronger money base and fairer ideas about family roles.',
 'This may add some everyday pressure, but its bad points are limited and do not beat the large good points that last for years.',
];
const vocabulary=[
 v(['Labour-saving household appliances','Home machines that save time and effort','省時省力家電'],['increasingly possible','easier','愈來愈可能'],['paid employment','earn money','有薪工作'],['dependent children','children who need them','仍依賴父母的子女']),
 v(['place extra strain','make family life harder','增加家庭壓力'],['disadvantages are clearly outweighed','good points are much greater','利大於弊'],['financial security','safer with money','經濟保障'],['balanced home environment','home life fairer','較平衡家庭環境']),
 v(['first major advantage','first big good point','第一主要優點'],['economic stability','steadier family money','經濟穩定']),
 v(['both parents earn an income','both parents earn money','父母雙方有收入'],['less vulnerable','better able to deal with','較不脆弱'],['inflation','rising prices','通脹'],['unexpected medical bills','surprise medical costs','意外醫療費'],['loss of one job','one parent losing a job','一方失業']),
 v(['financial resilience','ability to handle money problems','經濟抗壓能力'],['better food','better food','較好飲食'],['safer housing','safer homes','較安全住屋'],['educational support','help with school','教育支援'],['directly benefits children','helps children directly','直接令孩子受益']),
 v(['dual-income family','family with two incomes','雙收入家庭'],['afford','pay for','負擔'],['reliable childcare','good care for their children','可靠托兒'],['private tutoring','extra lessons','私人補習'],['better school district','better school','較佳校網'],['out of reach','cost too much','難以取得']),
 v(['Just as importantly','Just as important','同樣重要'],['reduced financial pressure','less worry about money','經濟壓力減輕'],['fewer arguments over money','fewer arguments about it','減少金錢爭執'],['calmer and more secure','calmer and safer','更平靜安全']),
 v(['A second benefit','A second good point','第二好處'],['maternal employment','a mother’s job','母親就業'],['overall culture of the family','what family members learn about roles at home','家庭文化']),
 v(['contributing professionally','doing important work for pay','在職場作貢獻'],['responsibility','duty','責任感'],['independence','doing things for themselves','獨立'],['gender equality','fairness between men and women','性別平等']),
 v(['motherhood','being a mother','母職'],['economic dependence','needing another person’s money','經濟依賴'],['solely female duties','only women should','只有女性的責任'],['childcare and housework','care for children and do housework','照顧孩子與家務']),
 v(['Admittedly','It is true','誠然'],['drawbacks','problems','缺點'],['reduced time at home','less time at home','在家時間減少'],['risk of fatigue','chance of feeling very tired','疲勞風險']),
 v(['However','Even so','然而'],['manageable','families can usually deal with','可應付'],['modern appliances','home machines','現代家電'],['childcare arrangements','arranging child care','托兒安排'],['fairer division of labour','sharing housework more fairly','較公平分工']),
 v(['In other words','Put another way','換言之'],['small loss of time','losing a small amount of time','少量時間減少'],['far less damaging','less harmful','傷害較小'],['long-term financial insecurity','money problems for years','長期經濟不穩'],['unequal family structure','unfair roles at home','不平等家庭結構']),
 v(['In conclusion','To sum up','總結'],['stronger financial foundation','stronger money base','較穩固經濟基礎'],['not only','both','不但'],['balanced set of values','fairer ideas about family roles','較平衡價值觀']),
 v(['practical pressure','everyday pressure','實際壓力'],['disadvantages are limited','bad points are limited','缺點有限'],['substantial long-term benefits','large good points that last for years','重大長遠好處']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'Time-saving household appliances have made it increasingly possible for carers to take training courses while still raising dependent children.',d:[1,2,10],relation:'工具令照顧者可兼顧另一項活動',formula:'[省時工具] have made it increasingly possible for [照顧者] to [新活動] while still raising dependent children',meaning:'家電省時省力，讓母親較可兼顧有薪工作及照顧子女。',links:[' have made it increasingly possible for ', ' to ', ' while still raising dependent children.'],labels:['省時工具','照顧者','新增活動']},
 {example:'Although some people argue that this can place extra strain on family life, I believe the disadvantages are clearly outweighed by the advantages, chiefly because it improves family income and allows fairer roles.',d:[0,10,13],relation:'先承認家庭壓力，再指出經濟與家庭價值的整體好處',formula:'Although [反方壓力], I believe the disadvantages are clearly outweighed by the advantages, chiefly because [主要理由]',meaning:'作者承認可能增壓，認為經濟保障與較平衡家庭價值更重要。',links:['Although ', ', I believe the disadvantages are clearly outweighed by the advantages, chiefly because '],labels:['已承認的壓力','較重的好處']},
 {example:'The first major advantage is financial security.',d:[1,7,10],relation:'主題句點出首項好處為穩定家庭財政',formula:'The first major advantage is [首項好處]',meaning:'第一項好處是家庭經濟穩定。',links:['The first major advantage is '],labels:['首項好處']},
 {example:'When both adults earn an income, the household is less vulnerable to sudden repairs, higher prices or the loss of one job.',d:[2,7,10],relation:'雙收入可分散物價、醫療與失業風險',formula:'When [兩人都有收入], the household is less vulnerable to [多項財務風險]',meaning:'雙收入令家庭較能承受通脹、突發醫療費或一方失業。',links:['When ', ', the household is less vulnerable to '],labels:['收入條件','財務風險']},
 {example:'This greater financial resilience allows parents to provide a safer home and more school support, which directly benefits children.',d:[3,7,10],relation:'This 回指經濟抗壓能力，which 指對孩子的直接收益',formula:'This greater financial resilience allows parents to provide [較好資源], which directly benefits children',meaning:'較穩定財政可用於飲食、住屋及教育，直接有利孩子。',links:['This greater financial resilience allows parents to provide ', ', which directly benefits children.'],labels:['能提供的資源']},
 {example:'For example, a dual-income family may be able to afford quality childcare or after-school lessons, opportunities that might otherwise be out of reach.',d:[3,7,10],relation:'以具體支出示範原本難負擔的家庭機會',formula:'For example, a dual-income family may be able to afford [具體機會], opportunities that might otherwise be out of reach',meaning:'雙收入家庭或可負擔托兒、補習與較佳校網。',links:['For example, a dual-income family may be able to afford ', ', opportunities that might otherwise be out of reach.'],labels:['原本可能難以負擔的機會']},
 {example:'Just as importantly, reduced financial pressure often leads to fewer arguments over bills, so the home becomes calmer and more secure for children.',d:[3,9,11],relation:'收入壓力減少也可能降低爭執，so 推出家庭氣氛',formula:'Just as importantly, reduced financial pressure often leads to [關係改變], so the home becomes [家庭氣氛]',meaning:'減少金錢壓力或可減少爭吵，使家庭更平靜安全。',links:['Just as importantly, reduced financial pressure often leads to ', ', so the home becomes '],labels:['關係改變','家庭氣氛']},
 {example:'A second benefit is that maternal employment can improve the daily example children see at home.',d:[3,9,11],relation:'第二好處轉到家庭價值及角色示範',formula:'A second benefit is that [做法] can improve [家庭文化面向]',meaning:'母親就業亦可改善孩子理解的家庭角色與價值。',links:['A second benefit is that ', ' can improve '],labels:['做法','文化或角色面向']},
 {example:'Children who see their mother contributing professionally are more likely to grow up with a healthier understanding of work, independence and gender equality.',d:[3,7,10],relation:'who 限定觀察對象，are more likely 說較可能形成的觀念',formula:'Children who see [榜樣行動] are more likely to grow up with a healthier understanding of [相關價值]',meaning:'孩子看到母親的職業貢獻，可較健康地理解責任、獨立與性別平等。',links:['Children who see ', ' are more likely to grow up with a healthier understanding of '],labels:['可觀察榜樣','相關價值']},
 {example:'A daughter may learn that motherhood does not require economic dependence, while a son may be less likely to assume that cooking and cleaning are solely female duties.',d:[3,7,10],relation:'while 並列女兒與兒子可能學到的不同觀念',formula:'A daughter may learn that [觀念一], while a son may be less likely to assume that [觀念二]',meaning:'女兒可看到母職不等於經濟依附；兒子可不再視照顧與家務為女性專責。',links:['A daughter may learn that ', ', while a son may be less likely to assume that '],labels:['女兒可能學到的事','兒子可能放下的假設']},
 {example:'Admittedly, there are drawbacks, most notably less free time and the risk of exhaustion.',d:[3,7,13],relation:'Admittedly 承認兩項最主要實際缺點',formula:'Admittedly, there are drawbacks, most notably [兩項具體缺點]',meaning:'在家時間減少及疲勞風險是真實代價。',links:['Admittedly, there are drawbacks, most notably '],labels:['兩項具體缺點']},
 {example:'However, these problems are usually manageable through better schedules, childcare arrangements and a fairer division of labour between parents.',d:[3,7,13],relation:'However 提出三種減輕壓力的安排',formula:'However, these problems are usually manageable through [處理方法]',meaning:'家電、托兒及較公平分工通常可處理部分壓力。',links:['However, these problems are usually manageable through '],labels:['處理方法']},
 {example:'In other words, a small loss of free time is far less damaging than long-term debt or an unequal family structure.',d:[3,9,13],relation:'用 far less damaging than 比較小代價與較重長期風險',formula:'In other words, [較小代價] is far less damaging than [較大長期風險]',meaning:'少量相處時間減少，較長期經濟不穩或角色不平等輕。',links:['In other words, ', ' is far less damaging than '],labels:['較小代價','較大風險']},
 {example:'In conclusion, when a carer works, the family usually gains not only a stronger financial foundation but also a fairer set of values.',d:[3,10,12],relation:'not only...but also 重提經濟與價值兩項好處',formula:'In conclusion, when [人物] works, the family usually gains not only [經濟好處] but also [價值好處]',meaning:'母親工作可加強經濟基礎，也有利較平衡的家庭價值。',links:['In conclusion, when ', ' works, the family usually gains not only ', ' but also '],labels:['人物','經濟好處','價值好處']},
 {example:'While this arrangement can create some practical pressure, the disadvantages are limited and do not outweigh the substantial long-term gains.',d:[3,10,12],relation:'While 承認實際壓力，再給最終利弊判斷',formula:'While [實際壓力], the disadvantages are limited and do not outweigh [長遠好處]',meaning:'實際壓力有限，不能蓋過長期經濟與家庭價值好處。',links:['While ', ', the disadvantages are limited and do not outweigh '],labels:['已承認壓力','長遠收益']},
];
const usageGuides=[
 '當你要指出一項省時工具，如何讓照顧者兼顧另一項活動時。',
 '當你要先承認家庭可能增壓，再用 chiefly because 解釋為何整體仍支持時。',
 '當你要用主題句先清楚點出第一項主要好處時。',
 '當你要用 When 說明一項財務條件如何降低多種風險時。',
 '當你要用 This 回指前句的改善，再用 which 說明誰直接受益時。',
 '當你要用具體可負擔的事物，說明抽象財務好處時。',
 '當你要用 Just as importantly 補充與金錢用途不同的人際後果時。',
 '當你要以 A second benefit 轉到性質不同的第二項好處時。',
 '當你要寫孩子看見某種榜樣後，更可能形成甚麼觀念時。',
 '當你要用 while 並列兩組人各自可能改變的不同假設時。',
 '當你要用 Admittedly 真正承認先前立場仍有具體代價時。',
 '當你要用 However 說明已承認的困難通常可由哪些方法處理時。',
 '當你要用 In other words 重述權衡，再用 far less damaging than 比較輕重時。',
 '當你要在結論用 not only...but also 概括兩項不同收益時。',
 '當你要用 While 重提代價，並清楚給出最後的利弊比較時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清經濟保障、家庭角色與可處理的實際代價。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('本文評估母親有薪工作對哪個單位的影響？',['仍須照顧子女的家庭','只評估單一公司的年度利潤','只比較兩款洗衣機價格','只研究學校考試長度'],'題目焦點是母親工作與家庭利弊。'),
 {type:'multi',prompt:'作者支持母親工作的兩項主因是甚麼？',detail:'選兩項，再按「確認」。',options:['雙收入提升家庭經濟抗壓能力','孩子可看到較平衡的家庭角色榜樣','母親工作後所有家務都自動消失','孩子一定無須任何托兒安排'],correct:[0,1],why:'範文以財務保障與家庭價值兩條好處作判斷。'},
];
const route=[sequence('還原母親工作的利弊論證',[
 ['背景與立場','省時家電使照顧孩子的母親較可工作；作者認為整體利多於弊。'],
 ['經濟保障','雙收入較能承受物價、醫療費和失業風險，也可供應孩子需要。'],
 ['家庭氣氛與價值','財務壓力減少或令爭執較少；孩子可看到較平衡的性別角色。'],
 ['承認缺點','在家時間可能減少，也可能疲勞。'],
 ['處理與權衡','家電、托兒與分工可減壓；作者認為長期好處較重。'],
 ],'本文不是只談家庭收入，還有榜樣、相處時間與分工。')];
const evidence=[
 quiz('雙收入家庭對哪些風險較有抵抗力？',['通脹、突發醫療費與一方失業。','只對洗衣機故障有抵抗力。','可保證永不遇上任何帳單。','只要父母工作就不再需要住屋。'],'原文列出三類財務風險。'),
 quiz('較強財務抗壓能力如何可能直接幫助孩子？',['讓父母較能負擔飲食、住屋及教育支援。','令所有私校必然免費。','令孩子立即有全職工作。','只改變家中電視的數量。'],'which directly benefits children 回指家庭資源。'),
 quiz('孩子看見母親在職場貢獻，可能學到甚麼？',['責任、獨立及男女分擔家庭角色的觀念。','只有母親才可以作家庭決定。','父親必須完全不參與家務。','性別分工永遠不能改變。'],'女兒與兒子的例子具體化角色觀念。'),
 quiz('範文承認哪些實際缺點？',['母親在家時間減少，以及疲勞風險。','家庭經濟必然立即崩潰。','孩子必然失去全部家庭關係。','所有家電都必然停止運作。'],'作者沒有否認時間及疲勞壓力。'),
 quiz('哪三種安排可緩和實際壓力？',['現代家電、托兒安排與父母較公平的分工。','只讓母親承擔所有工作和家務。','完全禁止子女上學。','只在結論略過所有缺點。'],'原文列三種具體可行安排。'),
];
const logic=[
 sequence('雙收入的財務與情緒連鎖',[
 ['兩份收入','家庭較能抵抗物價、醫療費或失業衝擊。'],
 ['孩子資源','較易負擔飲食、住屋、托兒和教育支援。'],
 ['金錢壓力','帳單壓力下降，爭執可能減少。'],
 ['家庭氣氛','家可能變得更平靜、更有安全感。'],
 ],'物質資源與家庭氣氛是同一財務機制的兩個後果。'),
 sequence('榜樣、實際代價與權衡',[
 ['職場榜樣','孩子看見母親工作的專業貢獻。'],
 ['角色觀念','女兒及兒子可能形成較平衡的家庭角色理解。'],
 ['實際壓力','在家時間減少與疲勞仍需承認。'],
 ['可行安排','家電、托兒及較公平分工可減輕壓力。'],
 ],'不要把可處理的壓力寫成不存在。'),
];
const transfers=[
 transfer('一個家庭原本只有一份收入，最近開始有兩份收入。','哪句準確轉用經濟抗壓論證？',['若其中一人失業，另一份收入仍可能幫助家庭支付基本開支。','兩份收入保證家庭永不面對任何帳單。','雙收入只會改變孩子的校服顏色。','兩人工作代表醫療費必然全部免費。'],['雙收入可分散部分財務風險。','不能保證零風險。','與財務無關。','無此保證。'],[3,4],'原文雙收入降低通脹醫療與一方失業風險。'),
 transfer('父母較有能力支付安全住屋及托兒服務。','哪句指出孩子如何受益？',['較穩定的收入可能讓孩子得到更安全的居住與照顧安排。','父母收入較多，便可保證孩子不再需要照顧。','托兒服務必然取代父母所有責任。','安全住屋只影響父母，不可能影響孩子。'],['把財務資源連到具體兒童需要。','孩子仍需照顧。','托兒是支援。','孩子也住在家中。'],[4,5],'原文 stronger financial resilience→food/housing/education。'),
 transfer('家庭少了為開支爭吵的壓力。','哪句保留範文的情緒後果？',['金錢壓力較低，家庭氣氛可能較平靜，成員也較有安全感。','只要有兩份收入，家庭便永遠不會有任何爭執。','收入只影響購物，與家庭情緒完全無關。','金錢爭執減少代表所有壓力都必然消失。'],['often/so 是可能的連鎖效果。','過度保證。','原文談氣氛。','仍可能有其他壓力。'],[6],'原文 reduced financial pressure→fewer arguments→calmer home。'),
 transfer('女兒看見母親既工作又照顧家庭。','哪句符合角色榜樣的論證？',['她可能明白母職不必等於經濟依附，家庭責任也可以分擔。','她必然認定父親不該參與育兒。','她一定選擇與母親相同的職業。','她會因此不再需要任何家庭支持。'],['may 保留可能性，觀念與原文一致。','與分工相反。','無職業保證。','仍需支持。'],[8,9],'原文女兒可能學到母職不必經濟依賴。'),
 transfer('兒子看到父母一起照顧孩子和做家務。','哪句轉用另一半榜樣論證？',['他較不會把育兒及家務視為只屬於女性的工作。','他必然完全不必做任何家務。','他會認為只有一名家長有責任養家。','他因此必然拒絕所有工作。'],['對應 while 後的兒子角色觀念。','與分工相反。','原文較平衡。','無此因果。'],[9],'原文兒子較不會認為育兒家務只屬女性。'),
 transfer('母親工作後在家時間減少，父母考慮如何安排家務。','哪句同時承認代價與提出處理方法？',['在家時間可能較少，但托兒、家電和較公平的家務分工可減輕壓力。','時間減少是虛構問題，所以不用任何安排。','所有家務應只由母親在下班後完成。','托兒安排能保證全家永遠不疲倦。'],['承認實際壓力，再列可行方法。','忽略缺點。','分工不公平。','無疲勞保證。'],[10,11],'原文 Admittedly 承認時間疲勞，However 列處理方式。'),
 transfer('另一題討論父親轉為彈性工作，以便照顧孩子。','哪句正確跨題使用本文的思路？',['應比較收入穩定、孩子的角色榜樣、相處時間與照顧分工。','既然本文支持母親工作，父親彈性工作必然沒有缺點。','只需討論父親的職銜，不用看家庭生活。','任何工作形式都保證孩子價值觀相同。'],['轉移評估面向，不照搬結論。','情境需另證。','忽略家庭機制。','不能保證。'],[3,8,10,11],'原文財務、榜樣、時間及分工四面向。'),
 transfer('有人只用「家庭收入增加」作為全部論證。','哪句能把財務好處解釋完整？',['收入較穩可應對突發開支，並可能改善孩子資源及家庭氣氛。','收入增加便足以證明家庭完全沒有壓力。','收入只可能用來購買奢侈品。','孩子的住屋與教育不可能受收入影響。'],['包含風險、資源和情緒連鎖。','否認缺點。','用途太窄。','與原文相反。'],[3,4,6],'原文財務穩定具有多層後果。'),
 transfer('兩名家長都工作，孩子放學後仍需有人照顧。','哪句避免把家庭安排說得過度簡單？',['雙收入可能有益，但仍須安排可靠托兒並公平分擔家務。','只要兩人都有收入，托兒便自動完成。','托兒只能由母親一人負責。','有工作便不必考慮疲勞和時間。'],['好處與實際安排要一起看。','仍須具體安排。','原文主張較公平。','需承認代價。'],[5,10,11],'原文托兒安排與公平分工緩解壓力。'),
 transfer('一篇作文已承認短期在家時間略減。','哪句最符合範文最後的權重比較？',['可比較這項時間代價與長期經濟不穩及角色不平等的影響。','只要時間減少一分鐘，所有長期好處便必然失效。','長期經濟不穩與家庭生活完全無關。','只列缺點數量，不看嚴重程度。'],['用 far less damaging than 比較實際分量。','過度絕對。','原文認為有關。','權衡看分量。'],[12,14],'原文用小幅時間減少對照長期財務與家庭結構代價。'),
];
export default {key:'advantage-disadvantage:22',meta:{topic:'母親就業的家庭保障與角色榜樣',summary:'範文指出雙收入可分散通脹、醫療及失業風險，也讓孩子看見較平衡的家庭角色；作者承認相處時間和疲勞問題，認為家電、托兒與公平分工可減輕。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:82'].map(x=>x.english);
const simple=[
'People without homes show that society is not helping some of those who need help most, so giving them money can feel like a kind thing to do.',
'But I strongly disagree that giving money is the best way to help them.',
'Cash can make today a little easier, but help that lasts must deal with why people have no home.',
'First, money treats the problem as though it is only about money.',
'A person on the street may need food, but they may also need a fixed address, papers, health care, family help, or confidence to work again.',
'In these cases, a gift of money may be spent just to get through the day without changing their situation.',
'For example, someone may buy food and be safe for one more night, but face the same problems the next morning.',
'That is kind, but it does not solve the problem.',
'A better approach is planned help that lets people put their lives back together one step at a time.',
'Places to sleep, advice, help with drug dependence, cheaper housing, and job training deal with the causes of homelessness, not just its visible problems.',
'Workers with training can also help people without homes deal with systems that are hard to use alone.',
'For example, help getting an ID card, visiting a doctor, and moving into a short-term home can help someone return to everyday life.',
'So money helps bring lasting change when it pays for planned support, safety, and a clear path forward.',
'In short, I strongly disagree that handing over money is the best way to deal with homelessness.',
'Giving money comes from kindness, but it cannot do enough for a problem with many causes.',
'The best help continues over time and gives people a real way to leave the street.',
];
const vocabulary=[
[['Homelessness','People without homes','無家可歸'],['clearest signs','show','清楚跡象'],['most vulnerable members','those who need help most','最弱勢者'],['handing over money','giving them money','直接給錢'],['kind response','kind thing to do','善意回應']],
[['However','But','然而'],['completely disagree','strongly disagree','完全不同意'],['best way to help homeless people','best way to help them','最佳幫助方法']],
[['Direct cash','Cash','直接金錢'],['ease immediate discomfort','make today a little easier','緩解即時不適'],['lasting help','help that lasts','持續幫助'],['address the causes of homelessness','deal with why people have no home','處理成因']],
[['treats the problem','treats the problem','處理問題'],['only financial','only about money','只有經濟層面']],
[['living on the street','on the street','露宿街頭'],['stable address','fixed address','穩定地址'],['official documents','papers','官方文件'],['medical care','health care','醫療'],['confidence to return to work','confidence to work again','復工信心']],
[['In such cases','In these cases','在這些情況'],['donation','gift of money','捐款'],['swallowed by daily survival','spent just to get through the day','被日常求生消耗'],['without changing the person’s life','without changing their situation','無法改變生活']],
[['For example','For example','例如'],['one more night','one more night','多一晚'],['facing the same barriers','face the same problems','仍面對障礙']],
[['kind action','kind','善意行動'],['real solution','solve the problem','真正解決']],
[['more effective response','better approach','更有效回應'],['organised support','planned help','有組織支援'],['rebuild their lives step by step','put their lives back together one step at a time','逐步重建生活']],
[['Shelters','Places to sleep','庇護所'],['counselling','advice','輔導'],['addiction treatment','help with drug dependence','戒癮治療'],['affordable housing','cheaper housing','可負擔房屋'],['job-training schemes','job training','職訓計劃'],['roots of homelessness','causes of homelessness','無家可歸根源']],
[['Trained workers','Workers with training','受訓工作者'],['guide homeless individuals','help people without homes','引導無家者'],['systems that are difficult to manage alone','systems that are hard to use alone','獨自難應付的制度']],
[['For instance','For example','例如'],['identity card','ID card','身份證'],['medical appointments','visiting a doctor','醫療預約'],['temporary accommodation','short-term home','臨時住所'],['bridge back into ordinary life','help someone return to everyday life','回歸生活的橋樑']],
[['In this sense','So','從此意義'],['useful only when','helps bring lasting change when','只有在...才真正有用'],['structure, safety and direction','planned support, safety, and a clear path forward','制度保障方向']],
[['In conclusion','In short','總結'],['strongly disagree','strongly disagree','強烈不同意'],['giving money','handing over money','給錢'],['best response to homelessness','best way to deal with homelessness','最佳應對']],
[['impulse is compassionate','comes from kindness','出於同情'],['too limited','cannot do enough','太有限'],['deep social problem','problem with many causes','深層社會問題']],
[['sustained support','continues over time','持續性支援'],['genuine route off the street','real way to leave the street','真正離開街頭的路']],
];
const chunkOverrides={3:['The first reason is that money treats the problem','as if it were only financial.'],7:['This is a kind action,','but it is not a real solution.'],14:['Although the impulse is compassionate,','it is too limited for such a deep social problem.']};
const simpleChunkOverrides={3:['First, money treats the problem','as though it is only about money.'],7:['That is kind,','but it does not solve the problem.'],14:['Giving money comes from kindness,','but it cannot do enough for a problem with many causes.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'看清短期幫助、成因與持續方案的關係。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['Homelessness','a society','some of its most vulnerable members','handing over money'],['Food insecurity','a community','some of its most vulnerable members','giving out free meals'],'承認直接施助出於善意，建立對方動機。','反對某善意措施之前，先承認它為何吸引人時。',[1,2,3]),
makeStructure(1,['this','homeless people'],['a one-off payment','people in poverty'],'用轉折清楚反對「最佳方法」而非否認善意。','接受某做法有好處，卻反對它是最佳方案時。',[0,2,13]),
makeStructure(2,['Direct cash','immediate discomfort','lasting help','the causes of homelessness'],['Free meals','immediate hunger','lasting support','the causes of food insecurity'],'以短期緩解與長期成因作核心區分。','比較即時救急與持續改善時。',[1,3,8]),
makeStructure(3,['money','the problem','only financial'],['a one-time payment','the difficulty','only financial'],'指出單一措施把多面向問題錯當單一成因。','反駁只用一種資源處理複雜問題時。',[2,4,5]),
makeStructure(4,['A person living on the street','a meal','a stable address, official documents, medical care, family support or the confidence to return to work'],['A family facing food insecurity','a meal','stable income, access to shops, medical care, community support or the ability to cook safely'],'先承認眼前需求，再列其他深層障礙。','需要展示同一人可能同時缺乏多種支持時。',[3,5,6]),
makeStructure(5,['a donation','daily survival','the person’s life'],['a small grant','immediate bills','the family’s long-term position'],'說明短期款項可能被當天需求吸收。','解釋一次性援助為何未必改變長期處境時。',[3,4,6]),
makeStructure(6,['someone','the money','food and stay safe for one more night','the same barriers'],['a struggling student','the grant','a bus ticket and attend one more class','the same financial barriers'],'用隔日仍有障礙的例子展示救急有限。','抽象談短期緩解後，以時間對照說明限制時。',[4,5,7]),
makeStructure(7,['a kind action','a real solution'],['a helpful gesture','a lasting answer'],'一句話承認善意並否定其充分性。','已舉短期援助例子，需概括善意不等於解決時。',[2,6,8]),
makeStructure(8,['organised support','people','their lives'],['coordinated support','families','their stability'],'轉入可持續、分步驟的替代方案。','已說明單次措施不足，需提出有次序的整體支持時。',[2,7,9]),
makeStructure(9,['Shelters, counselling, addiction treatment, affordable housing and job-training schemes','the roots of homelessness','its surface'],['School meals, tutoring, family counselling, transport support and affordable childcare','the causes of school absence','its visible symptoms'],'用多類服務對照根因與表面症狀。','提出整體方案後，要具體列出不同服務如何針對成因時。',[8,10,11]),
makeStructure(10,['Trained workers','homeless individuals','systems'],['Case workers','families in crisis','public services'],'指出專業人員可協助跨越制度障礙。','某群體需要服務但難以獨自辦理程序時。',[8,9,11]),
makeStructure(11,['someone','an identity card, attend medical appointments and move into temporary accommodation','ordinary life'],['a newcomer','the right papers, attend language classes and move into stable housing','everyday life'],'把抽象組織支援化成文件、醫療及住宿路徑。','已列服務種類，要展示協助者如何一步步銜接服務時。',[8,9,10]),
makeStructure(12,['money','structure, safety and direction'],['funding','planning, safety and guidance'],'總結金錢支持持續方案時的價值，呼應救急與治本。','不否定資金本身，但強調其須轉為可持續服務時。',[2,8,9]),
makeStructure(13,['giving money','homelessness'],['a one-time payment','long-term unemployment'],'結論重申反對某措施為最佳回應。','結論直接回答「最佳方法」的同意題時。',[1,14,15]),
makeStructure(14,['the impulse','such a deep social problem'],['the wish to help','such a complex public problem'],'讓步承認動機，同時指出措施規模不足。','反對善意措施時，需要避免把好動機當作充分效果。',[0,2,13]),
makeStructure(15,['sustained support','people','off the street'],['steady guidance','families','out of crisis'],'以持續支持與真正退出路徑定義較佳幫助。','結論要提出比一次性援助更完整的成功標準時。',[8,12,13]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依原文順序逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者是否認為直接給錢是幫助無家者的最佳方法？',['完全不同意；現金可救急，持續支援才處理成因','完全同意；給錢能自動解決所有障礙','沒有立場；只討論城市房價','完全反對任何形式的即時救助'],'作者承認現金可緩解眼前不適，但非最佳長期方案。'),{type:'multi',prompt:'選出兩段主體的不同重點',detail:'選兩項，再按「確認」。',options:['缺地址、文件、醫療及工作信心等障礙，不能只靠捐款','住宿、輔導、住房與職訓等有組織支援可逐步重建生活','每名無家者面對的成因完全相同','只要有庇護所就毋須任何其他服務'],correct:[0,1],why:'先說現金的限制，再說整體服務的作用。'}];
const route=[sequence('排好全文四段',[['引言 · 善意與立場','承認給錢出於善意，但反對其為最佳方法。'],['主體一 · 一次援助限制','多種障礙仍在；一晚安全未必改變隔日處境。'],['主體二 · 分步支援','住宿、治療、文件、醫療與職訓處理成因。'],['結論 · 持續離街','持續性支援提供真正離開街頭的路。']],'即時救急 → 多重障礙 → 組織支援 → 長期出路。')];
const evidence=[Q('露宿者除了食物，還可能缺甚麼？',['地址、文件、醫療、家庭支持或復工信心','只有戲院入場券與娛樂節目','只有更多同一張街頭海報','所有人必然只缺現金一項'],'原文列多項非純金錢障礙。'),Q('捐款例子為何未構成長期解決？',['買到食物和一夜安全，翌日障礙仍在','捐款必然立即讓所有人有正式工作','食物會令任何醫療需要自動消失','捐款從來不能帶來任何即時舒緩'],'作者明確承認一夜救急作用。'),Q('第三段列甚麼支援？',['庇護所、輔導、戒癮治療、住房與職訓','只在街上再派一次現金','只向所有人提供同一份宣傳單','完全不用專業人員協助'],'原文列五類組織支援。'),Q('受訓工作者可具體幫甚麼？',['辦身份證、赴醫療預約及搬入臨時住所','只替人決定每餐應買甚麼','自動清除所有制度和文件','完全代替當事人作所有人生決定'],'例子展示跨越制度障礙的橋樑。')];
const logic=[sequence('主體一：為何單次給錢不足？',[['問題定性','無家可歸不只是經濟問題。'],['障礙清單','地址、證件、醫療、家庭與工作信心。'],['捐款限制','款項或被日常求生消耗。'],['隔日例子','一晚有食物和安全，翌日障礙仍在。'],['判斷','行動善意，卻非完整解決。']],'多種成因 → 當日舒緩 → 障礙未消。'),sequence('主體二：怎樣建立持續出路？',[['方向','提供有組織、逐步的支援。'],['服務','住宿、輔導、治療、住房與職訓。'],['人員','受訓工作者協助處理制度程序。'],['具體路徑','文件、醫療和臨時住處銜接日常生活。'],['資金用途','把金錢變成制度、保障與方向。']],'組織服務 → 跨越程序 → 生活逐步重建。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('社區為有需要家庭派一餐飯，但翌日仍沒有穩定收入。','哪項最符合文章的區分？',['一餐可救急，持續支援仍須處理收入來源','一餐不能解決根因，故完全沒有任何價值','只要提供一餐，家庭便必然重獲穩定收入','收入不穩定只需再派一次相同的餐點'],['救急與治本有別。','仍有即時價值。','不保證。','成因仍在。'],[2,5,6,7],'immediate relief versus lasting help'),
T('某人有少量現金，卻缺身份文件，無法申請住宿服務。','哪項協助更接近長期方案？',['協助辦文件並銜接可入住的暫時住所','只再給現金而完全忽略文件程序','告訴他不用再理會任何公共服務','只提供翌日一張廣告但不附聯絡'],['處理制度障礙。','仍有障礙。','需服務。','無實質支援。'],[4,10,11],'identity card and temporary accommodation'),
T('一名學生獲一次補助，仍缺學習支援與穩定住所。','怎樣遷移文章的批評？',['一次金錢援助未必處理所有持續障礙','補助一發出，所有其他問題便必定消失','學生有住所需要，便不可能使用金錢','任何教育問題都只由學生懶惰造成'],['多因問題需多面支援。','無此保證。','資金可有用。','未有依據。'],[3,4,5,8,9],'money treats problem as only financial'),
T('某項慈善計劃提供即時食物，再協助求醫與找工作。','這為何較完整？',['先緩解眼前需要，再逐步處理根本障礙','只要食物夠多，求醫與就業便完全無關','計劃有職訓，就不應照顧即時飢餓','只有完全不花錢的方案才可持續'],['結合救急與治本。','多種需要。','可兼顧。','資金有用。'],[2,4,8,9,11,12],'organised support step by step'),
T('捐款讓露宿者吃飯並安全過夜，翌日仍難求醫。','哪句評價最精確？',['這是善意救急，但還不是完整長遠解決','既然未治本，這一晚的幫助毫無意義','只要能過夜，求醫困難便不再重要','任何給錢者都必定缺乏同情與善意'],['source 例子與判斷。','救急有價值。','醫療仍重要。','原文承認善意。'],[5,6,7,14],'kind action, not real solution'),
T('受訓社工陪同當事人辦證件、預約醫生及申請短住。','原文會稱這些步驟為甚麼？',['把人帶回日常生活的一道實際橋樑','只提供一天娛樂而不涉及任何服務','直接取代當事人所有選擇與決定','只改變街頭標語而不改變處境'],['bridge back into ordinary life。','有實質服務。','不取代自主。','非表面宣傳。'],[10,11],'bridge back into ordinary life'),
T('地方政府只派現金，沒有住宿、醫療或求職服務。','主體二會建議甚麼？',['建立跨住宿、健康及工作的有組織支援','把所有社工和受訓服務人員立即撤走','把成因視作只有今天缺錢一個','只派款但禁止任何人申請長期住房'],['根因需組織服務。','人員有用。','問題多面。','與方案相反。'],[8,9,10,11,12],'organised support addresses roots'),
T('某計劃獲捐款後，用資金建立住房與職訓服務。','這如何理解文章的金錢觀？',['金錢可轉成安全、支援與清晰的出路','作者認為任何捐款都不會有即時好處','資金一進服務機構就必然失去價值','住房與職訓只會增加街頭生活障礙'],['資金服務於結構。','承認救急。','可有長期價值。','目標相反。'],[2,8,9,12],'money turned into structure, safety and direction'),
T('有人說「給錢出於善意，所以一定是最佳方案」。','文章怎樣反駁？',['善意動機仍須檢視能否處理深層成因','只要有善意，任何方案都毋須評估效果','反對最佳方案等於否認給錢者的同情','深層問題只需一次付款便能立即消失'],['動機不等於效果。','需評估。','可承認善意。','非一次可解。'],[0,1,14,15],'compassionate impulse too limited'),
T('失業者獲一天交通費，但沒有證件與職業訓練。','哪個障礙仍未解決？',['求職所需文件與技能，須配合持續服務','交通費只能用一次，所以完全不算幫忙','所有失業者都只需要再買更多車票','有證件與技能便必然立刻得到工作'],['多重障礙。','當日仍有用。','非只交通。','無保證。'],[4,5,9,10,11],'official documents and job-training schemes'),
T('要判斷哪種慈善支援較佳。','依文章最應檢查甚麼？',['能否持續移除障礙，讓人真正走出困境','能否令當日的捐款看起來數字更大','能否只用一項方法處理所有不同需要','能否避免與受助者建立任何後續聯繫'],['持續路徑是標準。','數額非唯一。','多樣障礙。','需要跟進。'],[8,9,10,11,12,15],'sustained support; genuine route'),
T('要概括全文對直接給錢的立場。','哪項最完整？',['承認現金可救急，卻反對它單獨成為最佳方法','認為善意必定無用，所以任何錢都不該給','認為捐款一出，無家可歸問題便會自動消失','沒有提出替代方案，僅批評他人的同情'],['救急與治本並列。','原文承認善意。','障礙仍在。','有組織支援方案。'],[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],'cash immediate; causes lasting'),
];
const plausibleAlternatives=[
  [['一餐可救急，家庭仍須等待下一次食物派發','一餐能暫時紓困，收入問題可留給家庭處理','持續派餐較易安排，故比改善收入更重要'],['再次派餐未處理穩定收入來源。','把深層障礙留給受助者，並非長期方案。','便利性不能代替對根因的處理。']],
  [['先給現金補日常支出，文件可之後再處理','協助尋找住所，申請程序則由當事人自辦','先提供服務資訊，無須協助處理證件'],['缺文件正阻礙使用住宿服務。','程序障礙仍可能讓住所無法落實。','資訊本身未必能移除申請障礙。']],
  [['一次補助有幫助，住所問題可由學生自行解決','先繼續發補助，學習支援則可暫時延後','一次金錢援助可處理住宿，學習仍需另談'],['未處理持續住宿障礙。','文章主張同步看多種需要。','一次補助未必能保證穩定住所。']],
  [['先提供食物，其他支援等待求助者再提出','求醫與找工作重要，即時食物可先省去','長期服務較有效，食物援助應由家庭承擔'],['方案缺乏主動銜接深層障礙的步驟。','即時飢餓同樣需要照顧。','救急與持續支援可一併安排。']],
  [['這是有效救急，求醫問題可由個人自行處理','當晚獲幫助，代表已找到長期脫困路徑','求醫仍難，顯示食物援助應改為現金'],['醫療障礙仍須納入持續服務。','一晚安全與長期方案不能混為一談。','把援助換成現金也未必解決求醫。']],
  [['幫助辦證件，醫療與住宿可待之後再說','社工陪同辦事，重點主要是減少文書','提供短住服務，求醫和證件仍應自行處理'],['各項服務須銜接才能形成出路。','文書程序是通往醫療與住宿的實際障礙。','缺少程序協助可能阻礙服務使用。']],
  [['增加現金額度，其他服務由不同機構自行決定','先建立短住服務，醫療與工作支援可延後','建立求職課程，住宿與健康仍由個人處理'],['文章要求有組織地銜接多種需要。','單一服務仍難處理交織的障礙。','求職支援需與生活穩定及健康配合。']],
  [['資金可提供短住，但職訓應等搬家後再做','金錢可轉成服務，重點只在提高籌款額','住房與職訓有用，直接給現金仍是最佳方案'],['文章看重分步銜接，而非僵硬延後。','資金價值在實際保障與出路。','服務投入正挑戰單靠現金的做法。']],
  [['善意值得肯定，效果較難衡量便可略過','最佳方案須有效，但捐贈動機更應優先','給錢若能救急，深層原因便可之後再談'],['難衡量不代表毋須評估。','動機良善不自動成為最佳結果。','救急與移除深層障礙都需納入判斷。']],
  [['交通費有助面試，文件問題可由僱主處理','證件與技能有用，但一天車費已足夠應徵','持續職訓重要，求職文件則可留待入職'],['僱主不能必然代替當事人辦理文件。','一次交通支援不足以消除其餘障礙。','文件可能是應徵前的必要條件。']],
  [['能否先令更多人當天獲得同額現金','能否減少機構管理成本，再考慮後續服務','能否讓受助者短期安心，其他障礙稍後再問'],['當日覆蓋面不足以衡量長期脫困。','成本重要，但不能排除有效的持續支援。','即時舒緩不等於移除持續障礙。']],
  [['承認現金可救急，並把它視為完整長期方案','反對直接給錢，服務則應由受助者自行尋找','主張增加捐款，但無須安排住宿醫療服務'],['救急作用不足以證明單獨給錢最佳。','原文提出有組織的分步協助。','資金須轉化為安全與脫困路徑。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:82',meta:{topic:'給錢是否幫助無家者的最佳方法',summary:'作者完全不同意直接給錢是最佳方案，同時承認現金能緩解眼前不適。無家者也可能缺地址、證件、醫療、家庭支援和復工信心；一夜的食物與安全未必解除翌日障礙。較有效的方法是持續、分步的住宿、輔導、治療、住房、職訓和程序協助。資金可有價值，但應轉化為保障與真正離開街頭的路徑。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};

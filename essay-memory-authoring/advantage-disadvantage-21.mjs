// Household machines: time and physical effort versus dependence and lost manual skills.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:21'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Machines have greatly changed life at home in the last few decades.',
 'Jobs people once did with their hands, such as washing clothes and cleaning floors, are now often done by machines.',
 'This change has brought some new problems. Even so, I think its good points are much greater because it saves time and makes housework less tiring.',
 'The most obvious good point is that jobs take less time.',
 'Machines do the same jobs again and again much faster than people, so family members can spend time on work, caring for children or rest rather than everyday housework.',
 'For example, a washing machine can wash a full load of clothes while the person using it does something else.',
 'Another important point is that machines make work at home much less hard on the body.',
 'Before these machines were common, housework often meant standing for a long time, rubbing things clean and lifting heavy things. These jobs were especially tiring for parents, older people and people who were unwell.',
 'By doing much of this tiring and dull work, machines make home life more comfortable and better overall.',
 'Still, this change can cause some problems.',
 'One problem is relying on machines too much: once people are used to them, even an easy job may seem hard if a machine stops working or the electricity goes off.',
 'Another worry is that some useful skills for looking after a home may slowly be lost, especially among younger people who have never had to do the jobs by hand.',
 'Even so, these problems are fairly small.',
 'Not knowing how to wash clothes by hand is much less serious than spending hours doing hard physical work every week.',
 'To sum up, using machines for housework is mostly good.',
 'It can make people depend on machines and lose some skills. Still, for most families it makes everyday life faster, less tiring and easier to manage.',
];
const vocabulary=[
 v(['Household life','life at home','家庭生活'],['transformed','greatly changed','大大改變'],['over the past few decades','in the last few decades','過去幾十年']),
 v(['Tasks','Jobs','工作'],['once done by hand','once did with their hands','過去以人手完成'],['routinely handled','often done','經常由機器處理'],['washing clothes','washing clothes','洗衣服'],['cleaning floors','cleaning floors','清潔地板']),
 v(['trend','change','趨勢'],['far more advantages than disadvantages','good points are much greater','優點遠大於缺點'],['physical burden','makes housework less tiring','體力負擔'],['domestic work','housework','家務']),
 v(['clearest benefit','most obvious good point','最明顯好處'],['efficiency','jobs take less time','效率']),
 v(['repetitive chores','same jobs again and again','重複家務'],['far more quickly','much faster','快得多'],['devote their time','spend time','投入時間'],['childcare','caring for children','照顧孩子'],['routine housework','everyday housework','日常家務']),
 v(['entire load of laundry','full load of clothes','整桶衣物'],['while its user is doing something else','while the person using it does something else','使用者同時做別的事']),
 v(['Equally important','Another important point','同樣重要'],['automation','machines','自動化'],['less physically demanding','much less hard on the body','體力要求較低']),
 v(['appliances','machines','家電'],['prolonged standing','standing for a long time','長時間站立'],['scrubbing','rubbing things clean','刷洗'],['lifting','lifting heavy things','搬抬'],['in poor health','unwell','健康欠佳']),
 v(['taking over','doing','接手'],['domestic drudgery','tiring and dull work','繁重乏味家務'],['comfort','more comfortable','舒適'],['overall quality of life','better overall','整體生活質素']),
 v(['That said','Still','話雖如此'],['development','change','發展'],['not entirely harmless','can cause some problems','並非完全無害']),
 v(['overdependence','relying on machines too much','過度依賴'],['become accustomed to','are used to','習慣'],['device breaks down','machine stops working','機器故障'],['power cut','electricity goes off','停電']),
 v(['Another concern','Another worry','另一憂慮'],['practical household skills','useful skills for looking after a home','實用家務技能'],['gradually disappear','slowly be lost','逐漸消失'],['manually','by hand','人手做']),
 v(['However','Even so','然而'],['disadvantages','problems','缺點'],['relatively limited','fairly small','相對有限']),
 v(['Losing the habit of hand-washing clothes','Not knowing how to wash clothes by hand','失去手洗衣物習慣'],['far less serious','much less serious','遠沒那麼嚴重'],['physically exhausting work','hard physical work','耗費體力工作']),
 v(['In conclusion','To sum up','總結'],['mechanisation of household tasks','using machines for housework','家務機械化'],['largely beneficial','mostly good','整體有益']),
 v(['encourage dependence','make people depend on machines','助長依賴'],['weaken certain manual skills','lose some skills','削弱某些手動技能'],['overall effect','for most families','整體影響'],['more efficient','faster','更有效率'],['more manageable','easier to manage','更容易應付']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'School life has been transformed by digital tools over the past decade.',d:[1,3,9],relation:'用 has been transformed by 交代某領域及改變因素',formula:'[生活領域] has been transformed by [改變因素] over [時段]',meaning:'科技在過去幾十年大幅改變家庭生活。',links:[' has been transformed by ',' over '],labels:['生活領域','改變因素','時段']},
 {example:'Tasks that were once done by hand, from sorting mail to recording payments, are now routinely handled by software.',d:[0,3,9],relation:'用 from...to 舉舊工作，再對照現時處理方式',formula:'Tasks that were once done by hand, from [工作一] to [工作二], are now routinely handled by [新工具]',meaning:'洗衣及清潔等過去靠人手的家務，如今多由機器處理。',links:['Tasks that were once done by hand, from ',' to ', ', are now routinely handled by '],labels:['工作一','工作二','新工具']},
 {example:'Although this change has created some difficulties, I believe it brings far more advantages than disadvantages because it saves money and reduces repeated effort.',d:[0,9,14],relation:'用 Although 承認問題，再以 because 說整體利大於弊',formula:'Although [問題], I believe it brings far more advantages than disadvantages because [兩項理由]',meaning:'作者承認新問題，但判斷省時與減少體力負擔更重要。',links:['Although ', ', I believe it brings far more advantages than disadvantages because '],labels:['已承認問題','優勢理由']},
 {example:'The clearest benefit is convenience.',d:[2,9,14],relation:'短主題句點出第一項好處',formula:'The clearest benefit is [主要好處]',meaning:'第一項主要好處是效率。',links:['The clearest benefit is '],labels:['主要好處']},
 {example:'Machines can perform repetitive chores far more quickly than people can, which allows users to devote their time to study or rest instead of repeated cleaning.',d:[3,7,10],relation:'以 which 連快速工作與時間用途，instead of 對照原有家務',formula:'Machines can perform repetitive chores far more quickly than people can, which allows [人物] to devote their time to [用途] instead of [被替代工作]',meaning:'機器較快完成重複家務，家庭成員可把時間用於工作、照顧孩子或休息。',links:['Machines can perform repetitive chores far more quickly than people can, which allows ', ' to devote their time to ', ' instead of '],labels:['受益者','時間用途','被替代工作']},
 {example:'A washing machine, for example, can clean a full basket of clothes while its user prepares dinner.',d:[3,7,10],relation:'以 while 呈現機器與人同時完成兩件事的省時例子',formula:'A washing machine, for example, can [機器工作] while its user [同時做的事]',meaning:'洗衣機可在使用者處理其他事時洗好衣物。',links:['A washing machine, for example, can ', ' while its user '],labels:['機器工作','使用者的同步活動']},
 {example:'Equally important is the fact that automation has made factory work much less physically demanding.',d:[3,9,12],relation:'用 Equally important 引入與效率並列的體力好處',formula:'Equally important is the fact that [做法] has made [活動] much less physically demanding',meaning:'自動化令家務較不耗費體力。',links:['Equally important is the fact that ', ' has made ', ' much less physically demanding.'],labels:['做法','活動']},
 {example:'Before these tools became common, many domestic duties involved standing, carrying and cleaning, all of which were especially tiring for injured workers.',d:[6,9,12],relation:'用 Before 對照過去，all of which 指前列多項辛勞工作',formula:'Before [工具] became common, many duties involved [多項工作], all of which were especially tiring for [受影響者]',meaning:'家電普及前的站立、刷洗、搬抬，對體弱者等群體尤其辛苦。',links:['Before ', ' became common, many domestic duties involved ', ', all of which were especially tiring for '],labels:['工具','辛勞工作','受影響者']},
 {example:'By taking over much of this repeated labour, machines improve comfort as well as overall quality of home life.',d:[6,9,12],relation:'用 By + doing 說明接手工作如何帶來兩項結果',formula:'By taking over much of [繁重工作], [工具] improve [好處一] as well as [好處二]',meaning:'機器接手繁重家務後，提高舒適度與整體生活質素。',links:['By taking over much of ', ', machines improve ', ' as well as '],labels:['被接手工作','第一項好處','第二項好處']},
 {example:'That said, this arrangement is not entirely harmless.',d:[3,6,12],relation:'用 That said 從好處轉向不能忽視的代價',formula:'That said, [改變] is not entirely harmless',meaning:'家務機械化也有問題。',links:['That said, ', ' is not entirely harmless.'],labels:['改變']},
 {example:'One drawback is overdependence: once staff rely on software, even a simple calculation may feel difficult when the system fails.',d:[3,9,12],relation:'冒號後用 once 與 when 解釋過度依賴的條件和後果',formula:'One drawback is overdependence: once [習慣], even [簡單工作] may feel difficult when [故障條件]',meaning:'習慣機器後，故障或停電會讓簡單家務也變難。',links:['One drawback is overdependence: once ', ', even ', ' may feel difficult when '],labels:['形成的習慣','原本簡單的事','機器失效條件']},
 {example:'Another concern is that practical repair skills may gradually disappear, particularly among people who have never maintained their own equipment.',d:[3,10,12],relation:'用 Another concern 接第二項代價，particularly among 指較易受影響者',formula:'Another concern is that [技能] may gradually disappear, particularly among [較易受影響群體]',meaning:'手動家務技能可能逐漸流失，年輕人尤其如此。',links:['Another concern is that ', ' may gradually disappear, particularly among '],labels:['可能失去的技能','較易受影響群體']},
 {example:'However, these costs are relatively limited.',d:[3,10,14],relation:'用 However 轉到缺點的權重判斷',formula:'However, these [缺點] are relatively limited',meaning:'作者認為上述缺點相對有限。',links:['However, these ', ' are relatively limited.'],labels:['已提缺點']},
 {example:'Losing the habit of doing calculations by hand is far less serious than spending hours on repetitive paperwork every week.',d:[3,10,14],relation:'用 far less serious than 直接比較兩項代價輕重',formula:'Losing the habit of [較小損失] is far less serious than [較大負擔]',meaning:'失去手洗衣物習慣，比每週耗時做繁重家務輕得多。',links:['Losing the habit of ', ' is far less serious than '],labels:['較小損失','較大負擔']},
 {example:'In conclusion, the mechanisation of office records is largely beneficial.',d:[3,10,12],relation:'短結論句重申整體評價',formula:'In conclusion, [工作] is largely beneficial',meaning:'作者認為家務機械化整體有益。',links:['In conclusion, ', ' is largely beneficial.'],labels:['被評價的改變']},
 {example:'Although it can encourage dependence and weaken certain manual skills, its overall effect is to make work faster and less tiring for most staff.',d:[3,10,14],relation:'結論以 Although 再承認缺點，再概括較重的實際好處',formula:'Although it can encourage [問題一] and weaken [問題二], its overall effect is to make [活動] [三項改善]',meaning:'即使有依賴及技能流失問題，對多數家庭仍省時、減少疲勞。',links:['Although it can encourage ', ' and weaken ', ', its overall effect is to make '],labels:['依賴風險','技能風險','整體改善']},
];
const usageGuides=[
 '當你要先交代某領域在一段時間內受甚麼因素改變時。',
 '當你要用 from...to 列出舊做法的例子，再說明現時由甚麼接手時。',
 '當你要先承認難處，再比較整體利弊並用 because 給出理由時。',
 '當你要用短主題句提出第一項、最容易解釋的好處時。',
 '當你要先說明效率差異，再用 which 推出人們可如何重新運用時間時。',
 '當你要用 while 展示兩件事可同時進行，落實省時的論點時。',
 '當你要用 Equally important 引出與前一項同樣重要的另一項好處時。',
 '當你要列出過去多項辛勞工作，再用 all of which 說它們對某群體的共同影響時。',
 '當你要用 By + doing 指出某工具接手工作後，如何同時帶來兩項改善時。',
 '當你要用 That said 承認已談的好處，同時轉入尚未分析的缺點時。',
 '當你要提出一項缺點，並在冒號後用 once 和 when 說明它出現的條件時。',
 '當你要用 Another concern 補充第二項風險，再指出較易受影響的群體時。',
 '當你已分析缺點，要用 However 開始比較它們的嚴重程度時。',
 '當你要用 far less serious than 直接比較兩種代價，而非只說其中一種不好時。',
 '當你要在結論中用一句短句明確重申整體判斷時。',
 '當你要在結論再次承認兩項缺點，然後指出較重的整體改善時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先找兩項好處，再找兩項限制，最後比較其輕重。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('這篇文章評估哪一項改變？',['家務逐漸由機器代替人手處理','所有家庭停止照顧孩子','家用電器全面停止銷售','學校改用線上考試'],'原文從洗衣和清潔等家務出發。'),
 {type:'multi',prompt:'範文認為最重要的兩項好處是甚麼？',detail:'選兩項，再按「確認」。',options:['節省處理重複家務的時間','減輕站立刷洗搬抬的體力負擔','保證電器永不故障','保證每人都保留全部手動技能'],correct:[0,1],why:'時間效率與體力負擔是兩條主要好處。'},
];
const route=[sequence('按範文還原家務機械化的利弊',[
 ['背景與立場','洗衣與清潔等家務由機器處理；作者判斷整體利多於弊。'],
 ['效率好處','重複工作做得較快，家人可把時間用於工作、照顧孩子或休息。'],
 ['體力好處','機器接手站立、刷洗與搬抬等辛勞工作，令家庭生活較舒適。'],
 ['兩項缺點','依賴機器會令故障時工作難做；部分手動技能可能流失。'],
 ['權衡與結論','作者認為這些缺點比每週繁重家務的代價輕，因此整體支持。'],
 ],'先區分省時與減少體力負擔，再評估依賴和技能流失。')];
const evidence=[
 quiz('洗衣機的例子如何證明省時？',['機器洗一整桶衣物時，使用者可以同時做其他事。','洗衣機令所有衣物毋須任何時間清潔。','使用者必須站在機器旁不斷刷洗。','洗衣機只證明衣物數量增加。'],'while 呈現機器與使用者同時進行的兩項活動。'),
 quiz('為甚麼體力好處對長者等群體特別重要？',['以往家務涉及長時間站立、刷洗與搬抬。','所有家務都不需要使用身體。','機器使每個人必須搬更多重物。','長者都無法使用任何家電。'],'all of which 回指多項辛勞家務。'),
 quiz('範文所說的「過度依賴」在甚麼情況下顯現？',['機器故障或停電時，原本簡單的工作也可能變得難做。','機器運作正常時，家務必然完全消失。','只要有家電，人人都失去所有技能。','任何停電都保證持續一年。'],'once...when 說明形成習慣後的特定風險。'),
 quiz('作者如何比較缺點與好處的輕重？',['失去手洗衣物的習慣，比每週做數小時繁重家務輕。','兩種代價在文中被判斷完全相同。','手洗技能流失被判為最大社會問題。','作者沒有比較任何代價。'],'far less serious than 是明確權衡。'),
 quiz('結論有否否認家務機器的缺點？',['沒有；作者承認依賴與技能流失，仍認為多數家庭的日常生活改善。','有；結論說家電完全沒有風險。','有；結論只談機器的價格。','沒有；但作者認為全部家庭必然同等受益。'],'Although 保留代價，most families 保留適用範圍。'),
];
const logic=[
 sequence('省時與減少體力負擔',[
 ['重複工作','機器比人手更快完成部分例行家務。'],
 ['時間用途','家人可把時間轉向工作、照顧孩子或休息。'],
 ['辛勞工作','站立、刷洗與搬抬對部分群體尤其吃力。'],
 ['生活改善','機器接手這些工作，提升舒適與生活質素。'],
 ],'兩項好處的機制不同：一項省時間，一項省體力。'),
 sequence('缺點、比較與最終判斷',[
 ['依賴','故障或停電時，簡單工作也可能變難。'],
 ['技能','部分人可能逐漸失去手動家務技能。'],
 ['比較','技能損失比每週數小時繁重家務較輕。'],
 ['結論','承認缺點，仍判斷多數家庭的日常生活改善。'],
 ],'不可把「可能失去某技能」誇大成每個人都完全不會做家務。'),
];
const transfers=[
 transfer('一部洗衣機運作時，家長可以陪孩子閱讀。','哪句準確運用省時論證？',['機器處理重複家務時，家長可把同一段時間用於照顧孩子。','洗衣機令家庭再也不用花任何時間做家務。','孩子閱讀必然是洗衣機唯一帶來的好處。','家長只能在機器停用時陪伴孩子。'],['機器工作與照顧孩子可同時進行。','過度保證。','不只一種用途。','與情境相反。'],[4,5],'原文洗衣機工作時使用者可做其他事。'),
 transfer('一位長者以機器清潔地板，減少彎腰與長時間刷洗。','哪句對應範文的第二項好處？',['機器接手辛勞的家務，可能減輕長者的體力負擔。','機器保證所有長者永遠不會疲倦。','清潔地板與體力負擔完全無關。','只有年輕人才可能從機器得到幫助。'],['減輕體力負擔，保留可能性。','無此保證。','刷洗本來耗體力。','原文提到長者。'],[6,7,8],'原文站立刷洗搬抬對長者尤辛苦。'),
 transfer('社區洗衣設備暫時故障，部分居民不知如何手洗衣服。','哪句指出過度依賴的條件？',['長期習慣機器後，設備一旦故障，簡單工作也可能變難。','機器每次故障都代表居民永久失去全部能力。','設備故障可以證明機器從未節省時間。','居民只要手洗一次便必然不再使用機器。'],['once 習慣後，when 故障時出現風險。','過度斷言。','好處仍可存在。','無此必然。'],[10],'原文 once accustomed to machines, task difficult when breakdown or power cut。'),
 transfer('學生用計算機多年，逐漸少做基本心算。','哪句正確轉用「技能流失」機制？',['長期依賴工具，部分實用技能可能因少練習而逐漸退步。','每個使用工具的學生都立即完全不會計算。','只要技能可能退步，所有工具都沒有好處。','工具使用與技能練習永遠完全相同。'],['可跨題使用，保留部分與可能。','過度普遍化。','需要比較利弊。','使用工具可減少練習。'],[11],'原文某些實用家務技能可能逐漸消失。'),
 transfer('某人每週省去數小時繁重家務，但較少練習手洗衣物。','哪句符合範文的權衡？',['手洗習慣減少是代價，但可與每週節省的時間和體力比較輕重。','只要少手洗一次，省下的時間便毫無價值。','省時便證明任何技能流失都不可能發生。','兩種影響完全不能比較。'],['承認兩面後比較嚴重程度。','忽略好處。','否認缺點。','原文明確比較。'],[13,15],'原文 far less serious than 比較技能與繁重工作。'),
 transfer('一篇文章說自動化可節省時間，卻可能令員工過度依賴系統。','哪句可作完整而審慎的結論？',['雖然系統或帶來依賴風險，仍應比較節省的時間與故障時的代價。','既然省時，便完全不必討論故障。','只要可能故障，所有自動化都應立刻停止。','任何系統都永遠不會影響工作習慣。'],['先承認風險，再根據實際得失權衡。','缺少另一面。','未作比較。','與風險不符。'],[2,10,15],'原文 Although 承認代價並作整體判斷。'),
 transfer('一家小店用掃地機器人，員工把時間轉去服務顧客。','哪句展示範文的效率鏈？',['機器處理重複清潔工作，員工便可把時間用於其他有用的任務。','掃地機器人保證商店客戶數量即日翻倍。','員工使用機器後必然完全不用工作。','商店清潔與時間用途沒有任何關係。'],['工作轉由機器處理，時間重新分配。','無數字證據。','仍做其他任務。','正是時間論證。'],[4,5],'原文機器做重複家務，家庭成員可轉用時間。'),
 transfer('停電時，家庭仍須完成一些基本清潔工作。','哪句提出針對依賴風險的合理做法？',['平日保留基本手動技能，可減少設備失效時的困難。','停電可保證所有家電永久損壞。','只要有停電風險，平時都不能使用家電。','基本清潔工作必須等所有設備重啟才可能進行。'],['回應機器故障時的具體風險。','過度保證。','無須全盤禁用。','手動工作可應急。'],[10,11],'原文指出故障時簡單工作可能變難、技能可能流失。'),
 transfer('有人只說「家電很好」，未解釋原因。','哪句能把籠統好處寫成可檢驗的論證？',['家電可較快完成重複工作，並減少站立和刷洗等體力要求。','家電很好，因為家電的確很好。','任何家電都必然使每個人生活完全相同。','只要有家電，所有家庭問題就會消失。'],['列出省時與減少體力負擔兩種機制。','循環論證。','無此保證。','過度概括。'],[4,7,8],'原文分別分析效率與體力好處。'),
 transfer('另一篇作文要評估自助結帳機。','哪句真正跨題使用本文的分析框架？',['可比較顧客節省的時間、員工減少的重複工作，以及設備故障與技能流失。','因為家務機器有益，自助結帳機必然也有益。','只要設備能開機，就不必討論任何代價。','兩個題目完全無法用相同的利弊比較方法。'],['轉移機制，不照搬結論。','題目不同，結論需另證。','缺少風險。','分析框架可轉用。'],[4,7,10,11,13],'原文省時、體力、依賴和技能四維度可跨題檢查。'),
];
export default {key:'advantage-disadvantage:21',meta:{topic:'家務機械化的效率與依賴風險',summary:'範文比較機器帶來的省時和減少體力負擔，與過度依賴及手動技能流失兩項問題；作者判斷前者對多數家庭更重要。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

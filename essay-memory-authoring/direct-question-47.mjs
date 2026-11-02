// Promotion: extrinsic reward and recognition, alongside purpose and workplace conditions.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['direct-question:47'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'In workplaces today, people often see a move to a higher job as a clear sign that someone has noticed how hard an employee works.',
 'People want to move up because it usually means more pay, a higher place at work and more say over where their career goes.',
 'But people work hard for reasons that are harder to see too, such as feeling their work matters, knowing their job is safe and liking the way people treat each other at work.',
 'The first reason moving up matters so much is that it links hard work to money and respect from others.',
 'A higher job often gives more pay, better support and a stronger feeling that money will be available in future, so workers see it as a real way to make life better.',
 'Besides money, moving up also makes people feel that they matter.',
 'A promotion suggests managers and coworkers have noticed that someone makes good decisions, keeps working carefully and can do the job well.',
 'Being noticed openly can strongly encourage people because many want to know their hard work has led to something.',
 'For example, someone who often stays late to finish work may see promotion not just as a new job name but as proof that their hard work was not forgotten.',
 'Even so, moving up is not the only thing that makes people work hard.',
 'One big reason is work that feels worth doing.',
 'When people think their work helps customers, pupils, patients or other people, they are more likely to keep trying even without an immediate prize.',
 'Another big influence is what it is like to work with the people around them.',
 'Managers who help, rules that are fair and coworkers who show respect can make people want to do better, but a harmful workplace can make them lose interest even if they might be promoted.',
 'Personal goals matter too: some people work hard to learn a skill well, feel more sure of themselves or show themselves they can reach a difficult goal.',
 'To sum up, moving to a higher job encourages people because it offers more money, shows that others notice their work and makes their career path clearer.',
 'But people keep trying over time when their work has meaning, the rules are fair, they can grow and the workplace feels good to be in.',
];
const vocabulary=[
 v(['contemporary workplaces','workplaces today','當代職場'],['promotion','move to a higher job','晉升'],['visible sign','clear sign','明顯標誌'],['effort has been recognised','noticed how hard an employee works','努力獲認可']),
 v(['strongly motivated','want to move up','強烈受激勵'],['better pay','more pay','更高薪酬'],['higher status','higher place at work','更高地位'],['greater control','more say','更大掌控權'],['professional future','where their career goes','職業未來']),
 v(['less tangible factors','reasons that are harder to see','較不具體因素'],['purpose','feeling their work matters','目標感'],['security','knowing their job is safe','安全感'],['workplace culture','way people treat each other at work','職場文化']),
 v(['so powerful','matters so much','如此有力量'],['connects effort','links hard work','連結努力'],['material and social reward','money and respect from others','物質及社會回報']),
 v(['senior position','higher job','較高職位'],['higher salary','more pay','更高薪金'],['better benefits','better support','更好福利'],['financial stability','money will be available in future','經濟穩定'],['quality of life','make life better','生活質素']),
 v(['Beyond money','Besides money','金錢以外'],['promotion','moving up','晉升'],['psychological value','makes people feel that they matter','心理價值']),
 v(['Being promoted','A promotion','獲得晉升'],['judgement','makes good decisions','判斷力'],['discipline','keeps working carefully','自律'],['competence','can do the job well','能力'],['managers and colleagues','managers and coworkers','管理者同事']),
 v(['public recognition','Being noticed openly','公開認可'],['deeply motivating','strongly encourage','深深激勵'],['sacrifices','hard work','付出'],['led somewhere','led to something','有所成果']),
 v(['regularly works late','often stays late','經常加班'],['complete projects','finish work','完成項目'],['new title','new job name','新職銜'],['commitment','hard work','投入'],['not disappeared into the background','not forgotten','未被埋沒']),
 v(['Nevertheless','Even so','然而'],['promotion','moving up','晉升'],['not the only force','not the only thing','不是唯一力量'],['work hard','work hard','努力工作']),
 v(['major factor','big reason','重要因素'],['meaningful work','work that feels worth doing','有意義工作']),
 v(['tasks benefit','work helps','工作有益於'],['society in general','other people','整個社會'],['stay committed','keep trying','保持投入'],['immediate reward','immediate prize','即時回報']),
 v(['Another important influence','Another big influence','另一重要因素'],['working environment','what it is like to work with the people around them','工作環境']),
 v(['Supportive managers','Managers who help','支持員工的管理者'],['fair rules','rules that are fair','公平規則'],['respectful colleagues','coworkers who show respect','尊重同事'],['raise their standards','do better','提高標準'],['toxic workplace','harmful workplace','有毒職場'],['drain motivation','lose interest','耗盡動力']),
 v(['Personal ambition','Personal goals','個人抱負'],['master a skill','learn a skill well','掌握技能'],['build confidence','feel more sure of themselves','建立自信'],['demanding goals','difficult goal','具挑戰目標']),
 v(['In conclusion','To sum up','總結'],['promotion','moving to a higher job','晉升'],['recognition','shows that others notice their work','認可'],['clearer career path','career path clearer','更清晰職涯']),
 v(['Still','But','不過'],['lasting effort','keep trying over time','持久努力'],['purpose','work has meaning','目標感'],['fairness','rules are fair','公平'],['personal growth','they can grow','個人成長'],['emotional atmosphere','workplace feels good to be in','職場情緒氛圍']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'In contemporary workplaces, a public award is often treated as a visible sign that an employee’s effort has been recognised.',d:[1,3,9],relation:'背景句界定一個可見的努力認可訊號',formula:'In contemporary workplaces, [獎賞] is often treated as a visible sign that an employee’s effort has been recognised',meaning:'職場常把晉升視為努力獲認可的明顯標誌。',links:['In contemporary workplaces, ', ' is often treated as a visible sign that an employee’s effort has been recognised.'],labels:['被視為認可的獎賞']},
 {example:'People are strongly motivated by it because it usually brings better pay, higher status and greater control over their working hours.',d:[0,3,9],relation:'because 列薪酬地位控制權三項晉升誘因',formula:'People are strongly motivated by [獎賞] because it usually brings [三項回報]',meaning:'晉升常帶來薪酬、地位與職涯掌控。',links:['People are strongly motivated by it because it usually brings better pay, higher status and greater control over their '],labels:['控制的職涯範圍']},
 {example:'However, hard work is also shaped by less tangible factors, such as trust, security and workplace culture.',d:[0,3,9],relation:'However 轉入較難量度的其他動機',formula:'However, hard work is also shaped by less tangible factors, such as [三項非物質因素]',meaning:'目標、安全感和職場文化也影響努力。',links:['However, hard work is also shaped by less tangible factors, such as '],labels:['非物質動機']},
 {example:'The first reason a public award is so powerful is that it connects effort with material and social reward.',d:[0,2,9],relation:'is that 解釋努力與物質社會回報的連結',formula:'The first reason [獎賞] is so powerful is that it connects effort with material and social reward',meaning:'晉升把付出與錢及尊重連起來。',links:['The first reason ', ' is so powerful is that it connects effort with material and social reward.'],labels:['具有激勵力的獎賞']},
 {example:'A more senior position often means a higher salary, better benefits and a stronger sense of financial stability, so employees see it as a practical route to paying for a home.',d:[3,9,10],relation:'so 把經濟回報接到生活質素',formula:'A more senior position often means [三項經濟回報], so employees see it as a practical route to [生活改善]',meaning:'較高職位可增加薪金福利與穩定感，改善生活。',links:['A more senior position often means a higher salary, better benefits and a stronger sense of financial stability, so employees see it as a practical route to '],labels:['回報帶來的生活改善']},
 {example:'Beyond money, an award also carries psychological value.',d:[3,9,10],relation:'Beyond money 轉入心理認可',formula:'Beyond money, [獎賞] also carries psychological value',meaning:'晉升除金錢還有心理價值。',links:['Beyond money, ', ' also carries psychological value.'],labels:['具有心理價值的獎賞']},
 {example:'Being promoted suggests that a person’s care, discipline and competence have been noticed by managers and colleagues.',d:[3,9,10],relation:'獲晉升成為判斷自律能力被看見的證據',formula:'Being promoted suggests that a person’s [三種能力] have been noticed by managers and colleagues',meaning:'管理者與同事認可判斷、自律和能力。',links:['Being promoted suggests that a person’s ', ', discipline and competence have been noticed by managers and colleagues.'],labels:['被注意的首項能力']},
 {example:'This public recognition can be deeply motivating because many workers want to feel that their efforts have led somewhere.',d:[3,9,10],relation:'because 解釋公開認可滿足付出有結果的需要',formula:'This public recognition can be deeply motivating because [人] want to feel that their sacrifices have led somewhere',meaning:'公開認可讓人感到犧牲未白費。',links:['This public recognition can be deeply motivating because many workers want to feel that their ', ' have led somewhere.'],labels:['被認可的付出']},
 {example:'For example, an employee who regularly works late to complete projects may view promotion not simply as a new title, but as proof that their effort has not disappeared into the background.',d:[3,9,10],relation:'not simply ... but as proof 對比職銜與付出獲認可',formula:'For example, [員工] may view promotion not simply as a new title, but as proof that their [付出] has not disappeared into the background',meaning:'常加班的員工可視晉升為投入獲承認。',links:['For example, ', ' may view promotion not simply as a new title, but as proof that their ', ' has not disappeared into the background.'],labels:['具體員工','被看見的付出']},
 {example:'Nevertheless, a public award is not the only force that pushes people to work hard.',d:[3,4,11],relation:'Nevertheless 從晉升轉到其他持久動機',formula:'Nevertheless, [外在獎賞] is not the only force that pushes people to work hard',meaning:'晉升不是唯一努力動機。',links:['Nevertheless, ', ' is not the only force that pushes people to work hard.'],labels:['外在獎賞']},
 {example:'One major factor is helpful work.',d:[3,4,13],relation:'短主題句提出工作意義',formula:'One major factor is [非物質動機]',meaning:'有意義的工作是一大因素。',links:['One major factor is '],labels:['推動努力的因素']},
 {example:'When employees believe their tasks benefit customers or neighbours, they are more likely to stay committed even without an immediate reward.',d:[3,4,13],relation:'When 說明利他意義可支持沒有即時回報的投入',formula:'When employees believe their tasks benefit [受益者], they are more likely to stay committed even without an immediate reward',meaning:'相信工作有益於他人，即使無即時獎賞也較投入。',links:['When employees believe their tasks benefit ', ', they are more likely to stay committed even without an immediate reward.'],labels:['工作受益者']},
 {example:'Another important influence is the school environment.',d:[3,4,10],relation:'另一短主題句轉入環境',formula:'Another important influence is the [工作或學習環境]',meaning:'工作環境同樣影響動力。',links:['Another important influence is the ', ' environment.'],labels:['受分析的環境']},
 {example:'Supportive managers, fair rules and respectful colleagues can make people willing to raise their standards, whereas a toxic workplace can drain motivation even when higher pay is possible.',d:[3,4,10],relation:'whereas 對比支持性與有毒環境',formula:'[支持因素] can raise standards, whereas a toxic workplace can drain motivation even when [獎賞] is possible',meaning:'支持、公平、尊重可激勵；有毒環境可消耗動力。',links:['Supportive managers, fair rules and respectful colleagues can make people willing to raise their standards, whereas a toxic workplace can drain motivation even when ', ' is possible.'],labels:['仍可能存在的獎賞']},
 {example:'Personal ambition also plays a role: some people work hard because they want to master a language, build confidence or prove to themselves that they can meet demanding goals.',d:[3,4,10],relation:'冒號後列三項自我成長動機',formula:'Personal ambition also plays a role: some people work hard because they want to [技能], [自信] or [自我證明]',meaning:'個人抱負可帶來技能、自信和達標動力。',links:['Personal ambition also plays a role: some people work hard because they want to master a ', ', build confidence or prove to themselves that they can meet demanding goals.'],labels:['想掌握的技能']},
 {example:'In conclusion, promotion motivates people because it offers money, recognition and a clearer path to leadership.',d:[3,4,10],relation:'結論 because 收束三種晉升誘因',formula:'In conclusion, promotion motivates people because it offers [三項回報]',meaning:'晉升帶來金錢、認可和較清晰職涯。',links:['In conclusion, promotion motivates people because it offers money, recognition and a clearer '],labels:['更清晰的發展路向']},
 {example:'Still, lasting effort also depends on purpose, fairness, personal growth and the emotional atmosphere of a team.',d:[3,4,10],relation:'Still 補上持久努力的非晉升條件',formula:'Still, lasting effort also depends on [目的公平成長及氛圍]',meaning:'持久努力也靠目標、公平、成長與職場氣氛。',links:['Still, lasting effort also depends on purpose, fairness, personal growth and the emotional atmosphere of ', '.'],labels:['具體環境']},
];
const usage=[
 '當你要在引言指出某獎賞如何成為努力獲認可的可見訊號時。',
 '當你要用 because 列出某獎賞吸引人的幾項直接回報時。',
 '當你要從可見獎賞轉向目標感、保障或文化等較難量度的因素時。',
 '當你要用 is that 解釋付出和回報之間的連結時。',
 '當你要用 so 說明薪酬與福利如何變成改善生活的途徑時。',
 '當你已分析金錢回報，還要提出同一獎賞的心理作用時。',
 '當你要說明某獎賞如何顯示一個人的能力被他人看見時。',
 '當你要用 because 解釋公開認可為何使付出者有動力時。',
 '當你要用 not simply ... but as proof 對照表面獎賞與深層認可時。',
 '當你要承認某獎賞有效，仍指出它不是唯一努力動機時。',
 '當你要用短主題句引出工作本身有意義這種動機時。',
 '當你要用 When 說明利他意義可支持沒有即時獎賞的投入時。',
 '當你要用另一主題句轉入環境對努力程度的影響時。',
 '當你要用 whereas 對比支持性與有害環境對動力的不同作用時。',
 '當你要用冒號列出掌握技能、自信和自我證明等內在目標時。',
 '當結論要用 because 收束一項外在獎賞的三種回報時。',
 '當你已總結外在獎賞，仍要補上持久努力所需的其他條件時。',
];
const structures=specs.map((s,i)=>({example:s.example,distractors:s.d,frame:frame(i,s.formula,s.meaning,usage[i],s.links,s.labels),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'把晉升回報與其他動機分清。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('文章要解釋哪兩部分？',['為何晉升激勵員工，以及還有甚麼令他們努力。','只列公司每月工資總額。','只討論一名主管的辦公桌。','只比較兩種職銜的長度。'],'先談晉升，再談意義、環境及抱負。'),{type:'multi',prompt:'晉升的兩類回報是甚麼？',detail:'選兩項，再按「確認」。',options:['薪金福利與經濟穩定。','努力獲公開認可的心理價值。','保證每名員工永不疲累。','自動令所有工作環境變好。'],correct:[0,1],why:'物質與心理回報均有解釋。'}];
const route=[sequence('還原四段論證',[['引言','晉升是可見認可，還有目標安全感及文化等其他動機。'],['晉升回報','較高薪資改善生活，公開認可使付出被看見。'],['其他因素','工作意義、支持性環境及個人抱負。'],['結論','晉升有用，持久努力仍需目的、公平、成長與好氛圍。']],'外在獎賞不應吞掉其他動機。')];
const evidence=[quiz('較高職位可帶來甚麼物質回報？',['較高薪金、福利與經濟穩定感。','必然不再需要任何工作。','所有同事立刻得到同一職位。','公司所有規則即時消失。'],'物質回報被連到生活質素。'),quiz('為何公開認可使加班員工受激勵？',['它可證明其投入與付出沒有被埋沒。','只因新的職銜必然很長。','因加班保證不再辛苦。','因同事全都不會看見工作。'],'例子對比職銜與被看見。'),quiz('有意義工作如何推動努力？',['知道工作有益於他人，沒有即時回報也可能保持投入。','只要沒有獎金，人便必然停止工作。','服務他人與投入程度完全無關。','只有升職後工作才可能有意義。'],'作用來自目的感。'),quiz('支持性環境與有毒環境有何不同？',['前者可鼓勵提高標準，後者即使有晉升也可耗盡動力。','兩者保證帶來完全相同效果。','有毒環境一定令所有人更加投入。','公平規則只影響薪金，不影響工作感受。'],'whereas 直接對照兩種環境。'),quiz('個人抱負包括哪三項？',['掌握技能、建立自信及達成具挑戰目標。','只要求每年更換桌椅。','只尋求一個更長的職銜。','完全不關心能力與成長。'],'冒號後列出三項。')];
const logic=[sequence('晉升的兩類激勵',[['物質回報','薪金福利與財務穩定支持生活改善。'],['心理認可','判斷、自律和能力被主管同事看見。'],['具體例子','常加班者把晉升視作投入未被埋沒。']],'金錢與認可是不同機制。'),sequence('持久努力的其他來源',[['有意義的工作','幫助他人可支持無即時回報的投入。'],['公平環境','支持管理、公平規則、尊重同事。'],['個人抱負','技能、自信和具挑戰目標。'],['總結','持久努力不只靠晉升。']],'不要把晉升等同所有員工的唯一動機。')];
const transfers=[
 transfer('一名員工升任主管，得到加薪和更穩定的收入。','哪句對應物質回報？',['較高薪金與福利可令晉升成為改善生活的實際途徑。','升職必然使他再也不用工作。','經濟穩定感與生活質素完全無關。','所有員工會同時升任主管。'],['薪資福利→生活改善。','過度。','有關。','無保證。'],[3,4],'material/social reward and financial stability。'),
 transfer('一位常加班的員工獲晉升，感到投入終於被看見。','哪句說清心理價值？',['晉升可成為公開認可，證明努力未被埋沒，而不只是一個新職銜。','他只因職銜字數增加而感到有意義。','升職證明主管從未注意他的工作。','公開認可與工作動力毫無關係。'],['not simply title, but proof of commitment。','忽略認可。','方向相反。','原文有關。'],[5,7,8],'recognition beyond money。'),
 transfer('醫護員覺得自己的工作有助病人，近期卻未有升職。','哪句符合範文？',['知道工作有助他人，仍可能使他在沒有即時獎賞時保持投入。','沒有升職便保證他完全停止工作。','工作意義只存在於主管職位。','病人是否受益與員工動力必然無關。'],['有意義工作是獨立動機。','過度。','不限主管。','原文相反。'],[10,11],'meaningful work without immediate reward。'),
 transfer('公司可升職，但主管不支持、規則不公平、同事互不尊重。','哪句評估動力風險？',['有毒環境仍可能耗盡動力，即使升職機會存在。','只要能升職，任何環境都必然令所有人努力。','公平規則與職場動力沒有關係。','不受尊重必然提高每個人標準。'],['whereas 對比環境與晉升。','無保證。','原文有關。','方向相反。'],[13],'toxic workplace even when promotion possible。'),
 transfer('一名學徒努力練習，只想掌握技能並證明自己能達標。','哪句指出動機類型？',['個人抱負可推動努力，即使目標不是立即加薪或升職。','只有公開職銜才能令任何人練技能。','學徒努力便保證已得到升職。','自信與達標完全不能影響投入。'],['技能與自我證明是內在目標。','過度。','無此事實。','原文相反。'],[14],'personal ambition: skill/confidence/goals。'),
 transfer('另一題問學生為何努力學習，除了成績還有甚麼動機。','哪句能轉用分析框架？',['可分外在認可與內在目的，再看支持性環境和自我成長。','因員工升職，所有學生必然獲同一工作。','只有分數能影響任何學生努力。','學習環境與目標感完全不重要。'],['獎賞、意義、環境、抱負可跨題檢查。','題目不同。','原文反例。','均可影響。'],[2,10,13,14],'外在與內在動機框架。'),
 transfer('有人說「晉升之所以吸引人，只因為錢」。','哪句指出遺漏？',['除了薪資，晉升還可表示能力與付出受到同事主管認可。','職銜與心理感受絕不可能有關。','只有工資單才可反映任何努力。','認可一定令所有人不再需要工資。'],['物質與心理兩條回報。','原文相反。','忽略認可。','兩者可並存。'],[4,5,6,7],'Beyond money psychological value。'),
 transfer('一段論證只寫「員工努力因為升職」，沒有說如何。','哪句補上機制？',['升職可能帶來薪資福利，亦公開顯示判斷、自律和能力獲認可。','員工努力，因為員工會努力。','只要有職位名稱，薪資和認可都不存在。','努力必然立即使每人升職。'],['具體物質與心理機制。','循環。','與原文相反。','無保證。'],[3,4,6,7],'material/social reward。'),
 transfer('主管想提升員工長期投入，而不是只設升職名額。','哪句符合結論？',['還需讓工作有目的、公平待遇、成長機會和良好職場氣氛。','只需每人發一張新名片便保證持久投入。','有升職名額就可忽略所有有毒文化。','員工能力成長與努力完全無關。'],['持久努力依靠多因素。','無保證。','環境重要。','原文有關。'],[16],'lasting effort depends on purpose/fairness/growth。'),
 transfer('結論要同時回答晉升激勵和其他努力因素。','哪句最完整？',['晉升提供金錢、認可與職涯方向；持久努力也取決於意義、公平及成長。','晉升有用，因為晉升有用。','只談薪金，完全不提其他因素。','只談環境，否定晉升的任何作用。'],['兩部分都有原因。','循環。','漏第二問。','漏第一問。'],[15,16],'結論 promotion + lasting effort。'),
];
const balancedTransferOptions=[
 ['加薪與福利可使晉升成為改善生活的途徑。','晉升讓員工有機會帶領團隊，重點在管理經驗。','晉升使判斷與自律獲得公開肯定，重點在認可。','較穩定的收入主要來自同事的尊重與合作。'],
 ['升職可公開認可付出，不只是新職銜。','較高薪金讓員工能負擔更好的生活。','新職位讓員工接觸不同的管理工作。','同事稱讚他的加班，卻沒有談到這次晉升。'],
 ['知道工作有助病人，未即時升職也可投入。','醫護員因為預期很快升職，才繼續投入。','醫護員因薪金提高而願意多做工作。','醫護員因主管公開表揚其能力而保持投入。'],
 ['環境若不公平且缺尊重，升職仍難維持動力。','只要薪金增加，管理和同事關係便不再重要。','員工可以設定個人目標，因此不公平不會造成風險。','升職機會目前不存在，因此員工失去工作的方向。'],
 ['個人抱負可推動練習，即使暫無升職加薪。','學徒努力主要因為同事已公開稱讚他的表現。','學徒練習是因為工作直接幫助了服務對象。','學徒投入是因為新職位已帶來較高收入。'],
 ['比較外在認可與內在目標，再看環境和成長。','比較分數與獎狀，便可找到學生努力的主要原因。','老師的表揚可解釋學生的長期投入，不必另談目標。','比較課程難度，再判斷學生是否有足夠能力。'],
 ['升職除薪金外，亦可代表能力與付出獲認可。','晉升帶來較高薪金，因此心理回報不必另談。','員工得到認可，因此薪金福利已不影響晉升吸引力。','晉升代表職責增加，因此付出是否被看見並不重要。'],
 ['升職可增薪酬福利，也公開認可判斷與能力。','升職可讓員工加薪，其他回報可以留到結論再說。','主管會宣布升職結果，但不必說明它如何激勵員工。','員工有個人抱負，因此晉升的作用可以省略。'],
 ['還要有工作目的、公平待遇、成長與良好氣氛。','增加晉升名額便足夠，不必處理不公平的管理。','只談員工的個人抱負，略去工作目的和職場環境。','只改善同事關係，忽略工作意義與學習機會。'],
 ['升職有金錢與認可，持久努力亦靠意義公平成長。','晉升能增加薪金，因此可略去其他動力來源。','意義與公平環境重要，因此不用回答晉升的作用。','晉升提供認可與方向，其他動力只需談薪金。'],
];
const balancedTransferFeedback=[
 ['薪酬和福利是題目要辨認的物質回報。','管理經驗可能有價值，卻不是薪酬或福利。','這是原文的心理認可機制，並非物質回報。','同事合作並不是這次加薪的收入來源。'],
 ['公開承認投入，是這次晉升的心理價值。','這是物質回報，沒有解釋被看見的感受。','工作內容可能改變，卻沒有說明努力獲認可。','情境重點是晉升帶來的公開認可。'],
 ['病人受益帶來工作意義，可獨立於即時升職。','題目沒有說他預期很快升職。','題目沒有提到薪金增加。','情境沒有主管表揚；動機來自幫助病人。'],
 ['不公平與缺乏尊重可能抵銷升職的吸引力。','加薪不會直接消除情境中的管理問題。','個人目標不能證明不公平已無風險。','題目明說升職機會存在。'],
 ['掌握技能與自我達標是個人抱負。','情境沒有說同事已表揚他。','服務他人可帶來意義，但不是這位學徒提出的目標。','情境沒有新職位或加薪。'],
 ['外在、內在、環境與成長四方面都可跨題分析。','分數和獎狀只涵蓋外在回報。','老師表揚只涵蓋認可，未處理目的與環境。','課程難度不能代替動機分析。'],
 ['原文同時說明薪酬和公開認可。','只談薪金會漏掉付出被看見的心理價值。','認可存在不表示薪酬不重要。','職責增加不等於努力已獲認可。'],
 ['薪酬福利和公開認可解釋了晉升如何激勵。','只談薪酬，仍未解釋心理回報。','宣布結果沒有說明金錢或認可的作用。','個人抱負是另一種動機，不能替代晉升機制。'],
 ['長期投入需要多項因素共同支持。','升職名額仍不能解決不公平的管理。','抱負只是其中一項，不能取代其他因素。','同事關係有幫助，但未涵蓋意義與成長。'],
 ['兩部分都得到回答：晉升的回報與其他持久動機。','只回答晉升的物質回報，漏掉第二問。','只回答其他因素，漏掉晉升的作用。','把薪金誤放進其他動機，且漏掉意義和公平。'],
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options;transfers[i].explanations=balancedTransferFeedback[i];transfers[i].why=balancedTransferFeedback[i][0]});
// Reviewed connector structure decompositions.
structures[1].frame.parts=[["People are strongly motivated by ","link","句型固定部分"],["it","slot","使人有動力的事物"],[" because it usually brings ","link","句型固定部分"],["better pay, higher status and greater control over their professional future","slot","帶來的回報"],[".","link","句型固定部分"]];
structures[1].frame.formula="People are strongly motivated by [使人有動力的事物] because it usually brings [帶來的回報].";
structures[4].frame.parts=[["A more senior position often means ","link","句型固定部分"],["a higher salary, better benefits and a stronger sense of financial stability","slot","經濟回報"],[", so employees see it as a practical route to ","link","句型固定部分"],["improving their quality of life","slot","希望改善的生活面向"],[".","link","句型固定部分"]];
structures[4].frame.formula="A more senior position often means [經濟回報], so employees see it as a practical route to [希望改善的生活面向].";
structures[13].frame.parts=[["Supportive managers, fair rules and respectful colleagues","slot","支持性環境"],[" can make people willing to raise their standards, whereas a toxic workplace can drain motivation even when ","link","句型固定部分"],["promotion","slot","可能的獎賞"],[" is possible.","link","句型固定部分"]];
structures[13].frame.formula="[支持性環境] can make people willing to raise their standards, whereas a toxic workplace can drain motivation even when [可能的獎賞] is possible.";
structures[14].frame.parts=[["Personal ambition also plays a role: some people work hard because they want to ","link","句型固定部分"],["master a skill","slot","想掌握的能力"],[", ","link","句型固定部分"],["build confidence","slot","想建立的信心"],[" or ","link","句型固定部分"],["prove to themselves that they can meet demanding goals","slot","想證明的能力"],[".","link","句型固定部分"]];
structures[14].frame.formula="Personal ambition also plays a role: some people work hard because they want to [想掌握的能力], [想建立的信心] or [想證明的能力].";
export default {key:'direct-question:47',meta:{topic:'晉升及其他努力工作動機',summary:'文章區分晉升的物質回報與公開認可，再分析工作意義、支持性職場和個人抱負，指出持久努力不能只靠升職。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

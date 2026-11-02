import fs from 'node:fs';
const E=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:85'].map(x=>x.english);
const simple=[
'Working well with others is an important people skill, and many parents think children learn it best by playing team sports.',
'But I strongly disagree that games like football, basketball, or volleyball are the best way to teach children this skill.',
'A better way is to give children planned group work where adults teach cooperation, watch it, and help children think about how they worked together.',
'The biggest problem with team sports is that they often praise winning skills more than working together.',
'In a game, children may think mainly about winning, scoring, or not being blamed instead of listening to others or sharing duties fairly.',
'Children who play well may take over, while shy children may be left out and learn to stay quiet instead of working with a team.',
'For example, in a school football game, the fastest child may get most of the ball because the other children think this gives them the best chance to win.',
'In that case, the team may look united, but children who play less well are not really learning to take part, discuss choices, or solve problems together.',
'But well-planned group tasks teach cooperation more directly and give more children a chance to take part.',
'When children do a school project, make a group talk, or plan a small charity activity, they must share jobs, talk about ideas, deal with different opinions, and rely on each other.',
'These tasks also let adults show children clearly how to work together.',
'A teacher can ask why one child was left out, how jobs could be shared more fairly, and what the group should do if someone cannot keep up.',
'Thinking about these questions turns cooperation from something children simply do into a skill they understand.',
'It also prepares them to work with others in real life, where success usually needs less physical skill and more talking, patience, and shared responsibility.',
'In short, I strongly disagree that team sports teach children teamwork best.',
'Planned group tasks work better because every child can have a useful job and learn the habits needed to work well with others.',
];
const vocabulary=[
[['Teamwork','Working well with others','團隊合作'],['essential social skill','important people skill','重要社交技能'],['team sports','team sports','團隊運動']],
[['However','But','然而'],['completely disagree','strongly disagree','完全不同意'],['introducing children to sports','games','讓孩子接觸運動'],['this quality','this skill','這項素質']],
[['more reliable method','better way','更可靠方法'],['structured group tasks','planned group work','有結構團體任務'],['directly taught, monitored, and reflected upon','teach cooperation, watch it, and help children think about how they worked together','直接教授監察反思']],
[['main weakness','biggest problem','主要弱點'],['reward performance','praise winning skills','獎勵表現'],['cooperation','working together','合作']],
[['competitive game','game','競爭性比賽'],['focused on winning, scoring, or avoiding blame','think mainly about winning, scoring, or not being blamed','專注勝負得分避責'],['listening carefully to others','listening to others','仔細聆聽'],['sharing responsibility fairly','sharing duties fairly','公平分責']],
[['Stronger players','Children who play well','能力較強者'],['dominate the activity','take over','主導活動'],['less confident children','shy children','較缺乏自信者'],['pushed to the side','left out','被推一旁'],['silence rather than teamwork','stay quiet instead of working with a team','沉默非合作']],
[['For example','For example','例如'],['school football match','school football game','校內足球賽'],['receive most of the passes','get most of the ball','收到大部分傳球'],['best chance of winning','best chance to win','最佳勝算']],
[['In that situation','In that case','在此情況'],['appear united','look united','看似團結'],['weaker players','children who play less well','較弱球員'],['genuinely learning','really learning','真正學習'],['contribute, negotiate, or solve problems together','take part, discuss choices, or solve problems together','貢獻協商解難']],
[['By contrast','But','相比之下'],['carefully designed group activities','well-planned group tasks','精心設計團體活動'],['directly and inclusively','more directly and give more children a chance to take part','直接包容地']],
[['complete a class project','do a school project','完成班級專題'],['prepare a group presentation','make a group talk','準備小組匯報'],['organise a small charity event','plan a small charity activity','組織小慈善活動'],['divide responsibilities','share jobs','分配責任'],['exchange ideas','talk about ideas','交換想法'],['manage disagreements','deal with different opinions','處理分歧'],['depend on one another’s effort','rely on each other','依靠彼此']],
[['allow adults','let adults','讓成人'],['guide the process explicitly','show children clearly how to work together','明確引導過程']],
[['one member was ignored','one child was left out','某成員被忽略'],['tasks should be shared more fairly','jobs could be shared more fairly','任務公平分配'],['someone falls behind','someone cannot keep up','有人落後']],
[['This kind of reflection','Thinking about these questions','這種反思'],['vague experience','something children simply do','模糊經驗'],['conscious skill','skill they understand','有意識技能']],
[['real-life teamwork','work with others in real life','現實團隊合作'],['physical ability','physical skill','體能'],['communication, patience, and shared accountability','talking, patience, and shared responsibility','溝通耐性共同責任']],
[['In conclusion','In short','總結'],['completely disagree','strongly disagree','完全不同意'],['best way to teach children teamwork','teach children teamwork best','最佳教授合作方式']],
[['Structured collaborative tasks','Planned group tasks','有結構合作任務'],['more effective','work better','更有效'],['meaningful role','useful job','有意義角色'],['actual habits that teamwork requires','habits needed to work well with others','真正合作習慣']],
];
const chunkOverrides={3:['The main weakness of team sports is that they often reward performance','more than cooperation.'],10:['These activities also allow adults','to guide the process explicitly.'],12:['This kind of reflection turns cooperation','from a vague experience into a conscious skill.']};
const simpleChunkOverrides={3:['The biggest problem with team sports is that they often praise winning skills','more than working together.'],10:['These tasks also let adults','show children clearly how to work together.'],12:['Thinking about these questions turns cooperation','from something children simply do into a skill they understand.']};
function makeStructure(i,slots,replacements,meaning,usage,distractors){const text=E[i],parts=[];let p=0;slots.forEach((slot,j)=>{const q=text.indexOf(slot,p);if(q<0)throw Error(`slot ${i} ${slot}`);if(q>p)parts.push([text.slice(p,q),'link','固定連接']);parts.push([slot,'slot',`可換內容 ${j+1}`]);p=q+slot.length;});if(p<text.length)parts.push([text.slice(p),'link','固定連接']);let example=parts.map(x=>x[1]==='link'?x[0]:replacements.shift()).join('');return{example,answerReason:meaning,distractorReason:'分辨表面成績與真正學到的合作習慣。',distractors,frame:{formula:parts.map(x=>x[1]==='link'?x[0]:`[${x[2]}]`).join(''),meaning,usage,parts}};}
const structures=[
makeStructure(0,['Teamwork','children','team sports'],['Leadership','students','competitive games'],'引言指出某能力與普遍相信的最佳教法。','題目爭論某活動是否最適合教某能力時。',[1,2,3]),
makeStructure(1,['the view','children','sports such as football, basketball, or volleyball','this quality'],['the claim','students','games such as chess, football, or basketball','this quality'],'直接反對指定方法是最佳，不等於它完全無用。','「最佳方法」題需清楚回應排名，而非泛談好處時。',[0,2,14]),
makeStructure(2,['children','structured group tasks','cooperation'],['students','guided classroom projects','communication'],'先提出有明確教導、觀察與反思的替代方法。','反對某教學方式最佳後，立即給出可操作替代方案時。',[1,8,10]),
makeStructure(3,['team sports','performance','cooperation'],['competitive quizzes','speed','careful reasoning'],'指出活動獎勵的行為未必等於目標能力。','評估教學活動時，區分獎勵標準與真正學習目標。',[4,5,8]),
makeStructure(4,['a competitive game','winning, scoring, or avoiding blame','listening carefully to others or sharing responsibility fairly'],['a timed group contest','finishing first, scoring, or avoiding blame','listening carefully to others or sharing responsibility fairly'],'解釋競爭壓力如何擠走聆聽與分責。','已指出獎勵偏差，要展開學生實際注意力變化時。',[3,5,6]),
makeStructure(5,['Stronger players','dominate the activity','less confident children','silence rather than teamwork'],['Faster speakers','dominate the discussion','quieter students','silence rather than discussion'],'展示強弱不均令部分孩子被邊緣化。','活動看似群體參與，需檢查誰實際能發言與貢獻時。',[3,4,7]),
makeStructure(6,['a school football match','the fastest child','most of the passes','classmates','the best chance of winning'],['a school debate','the most confident speaker','most of the speaking time','teammates','the best chance of winning'],'以傳球集中於強者顯示追求勝利可犧牲參與。','要用具體分配行為證明強者主導時。',[4,5,7]),
makeStructure(7,['the group','the weaker players','contribute, negotiate, or solve problems together'],['the class','the quieter students','contribute, negotiate, or solve problems together'],'區分看似團結的結果與每人實際學到的技能。','團隊看似完成目標，仍須檢查弱勢成員的學習時。',[5,6,8]),
makeStructure(8,['carefully designed group activities','teamwork'],['well-planned group projects','teamwork'],'轉入更直接而包容的替代教法。','批評某活動後，要引出能讓更多人實際參與的方式時。',[2,9,10]),
makeStructure(9,['a class project, prepare a group presentation, or organise a small charity event','divide responsibilities, exchange ideas, manage disagreements, and depend on one another’s effort'],['a community project, prepare a group report, or organise a small local event','divide responsibilities, exchange ideas, manage disagreements, and depend on one another’s effort'],'用三種任務說明合作必須做哪些事。','提出團體活動後，拆解角色分工、交流及解決分歧時。',[8,10,11]),
makeStructure(10,['These activities','adults','the process'],['Such projects','teachers','the process'],'指出成人能明確指導合作過程。','活動不只讓學生自己做，還需要可觀察的教學時。',[8,9,11]),
makeStructure(11,['A teacher','one member','tasks','someone'],['A supervisor','one member','tasks','someone'],'用提問檢查被忽略者、分工及落後者。','指導者需要具體反思問題，而非只說「要合作」時。',[9,10,12]),
makeStructure(12,['This kind of reflection','cooperation','a vague experience','a conscious skill'],['That kind of discussion','leadership','a vague experience','a conscious skill'],'反思把偶然經歷轉為可描述、可練習的技能。','學生活動後需要討論做法及改善，形成可遷移能力時。',[10,11,13]),
makeStructure(13,['It','children','real-life teamwork','physical ability','communication, patience, and shared accountability'],['Guided group practice','students','real-life teamwork','individual speed','communication, patience, and shared accountability'],'以現實應用說明教法重視溝通與共同責任。','結合課堂學習與未來實際場景時。',[8,12,15]),
makeStructure(14,['team sports','children teamwork'],['competitive quizzes','students cooperation'],'結論再次否定指定活動是最佳教法。','「最佳方法」題結論要直接回答排名時。',[1,13,15]),
makeStructure(15,['Structured collaborative tasks','every child','a meaningful role','the actual habits that teamwork requires'],['Guided group projects','every learner','a meaningful role','the actual habits that teamwork requires'],'以普遍參與與真實合作習慣作比較標準。','結尾說明替代方案為何更有效，指出參與及技能兩項時。',[2,8,14]),
];
const Q=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,rows,why)=>({type:'sequence',prompt,detail:'依原文順序逐一點選。',items:rows.map(([title,body])=>({title,body})),why});
const intro=[Q('作者認為團隊運動是教授團隊合作的最佳方式嗎？',['完全不同意；有引導與反思的團體任務更可靠','完全同意；比賽得分就是合作本身','沒有立場；只談運動器材','認為任何團隊運動都絕不能有益'],'反對「最佳」，未說運動完全不能教合作。'),{type:'multi',prompt:'選出兩段主體的不同理由',detail:'選兩項，再按「確認」。',options:['團隊運動常獎勵表現，弱者可能只學會沉默','有結構的團體任務可分工、交流並在成人引導下反思','比賽越激烈，所有隊員必然有相同參與','只要小組完成任務，便不需檢查任何成員'],correct:[0,1],why:'第一段指出競爭排擠，第二段展示可教導的合作。'}];
const route=[sequence('排好全文四段',[['引言 · 反對最佳說','團隊合作重要，作者主張有引導的團體任務更可靠。'],['主體一 · 比賽限制','得分壓力與強者主導可使弱者缺少真正參與。'],['主體二 · 替代方法','分工討論、教師提問與反思把合作變成技能。'],['結論 · 比較標準','每人有角色並學習實際習慣的任務較有效。']],'表現獎勵 → 弱者邊緣化 → 引導反思 → 真正合作。')];
const evidence=[Q('足球例子中，誰可能接到最多傳球？',['跑得最快的孩子，因大家想提高勝算','每一位較弱球員必然平均得球','從未參加比賽的老師','只負責看台的觀眾'],'勝利動機令傳球集中。'),Q('團隊看似團結時，較弱孩子可能缺甚麼？',['實際貢獻、協商與共同解難的機會','只缺隊服的顏色選擇','只缺更響亮的歡呼','只缺比賽後獎牌的形狀'],'外表團結不等於每人學習。'),Q('小組任務要求孩子做甚麼？',['分責、交流想法、處理分歧與互相依靠','只讓最快的人完成全部工作','只計分數不討論任何工作','只觀看別人完成所有項目'],'原文列四種合作行動。'),Q('教師的反思問題包括甚麼？',['誰被忽略、如何公平分工、有人落後時怎辦','只問全組能否比其他班快','只問最強者獲得多少獎品','只問活動場地用了甚麼顏色'],'反思針對包容與分責。')];
const logic=[sequence('主體一：比賽為何未必教會合作？',[['獎勵偏差','團隊運動常重表現多於合作。'],['注意力','孩子或只想得分、贏及避免被責怪。'],['權力不均','強者主導，較弱者被邊緣化。'],['足球例子','最快孩子得多數傳球。'],['真正結果','看似團結，弱者未學貢獻協商與解難。']],'勝利目標 → 強者集中機會 → 弱者少學技能。'),sequence('主體二：團體任務怎樣教真正合作？',[['活動形式','班級專題、匯報與小慈善活動。'],['合作動作','分工、交流、處理分歧、互相依靠。'],['成人引導','問誰被忽略、如何公平分責、怎幫落後者。'],['反思成果','把模糊經驗變成有意識技能。'],['現實遷移','靠溝通、耐性與共同責任，而非體能。']],'每人參與 → 明確引導 → 反思 → 現實合作。')];
const T=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({type:'quiz',prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transfer=[
T('小組比賽只讓最快的同學答題，最後雖勝出，其他人沒有發言。','文章會提醒甚麼？',['贏得比賽不等於每位成員都學會合作','勝利證明全部成員都有相同學習機會','最快同學發言多，其他人便自然懂協商','只要完成比賽，就不需檢查分工過程'],['結果不等於每人學習。','發言不均。','未必。','需檢查。'],[3,4,5,6,7],'appear united but weaker players not learning'),
T('教師安排專題，每人負責一段，再討論不同方案。','哪項是較直接的合作練習？',['分配責任、交流想法並處理彼此的分歧','只讓一名學生獨自完成全份報告','把所有分歧留到活動後而絕不討論','只計誰先完成，不讓成員互相依靠'],['對應具體合作動作。','無共同分工。','未處理。','只有速度。'],[8,9],'divide responsibilities; exchange ideas; manage disagreements'),
T('團隊運動中，較強者拿到全部表現機會，較弱者只能旁觀。','這是哪種教學風險？',['強者主導可能讓弱者學沉默而非合作','旁觀愈久，弱者便必然更擅長討論','只要有隊名，便代表每人實際同等參與','較強者越多，老師就不必引導任何人'],['對應 stronger players dominate。','非必然。','隊名非參與。','仍需引導。'],[5,6,7],'silence rather than teamwork'),
T('班級小組有一人落後，老師請大家討論如何重新分工。','這屬於甚麼教學？',['引導與反思，使合作成為可練的技能','讓落後學生永久退出所有小組任務','只求本次成績，不關心組員學習','教師完全不介入，任由強者決定'],['guided reflection。','與包容相反。','需學習。','有教師引導。'],[10,11,12],'ask when someone falls behind'),
T('公司團隊依靠清楚溝通、耐性與共同承擔，而非跑得快。','哪項課堂活動較能遷移？',['分工與討論的任務更貼近真實團隊習慣','只反覆記錄體能得分，不討論任何決定','只讓最強者表現，其他人從不參與','只要求每人穿相同服裝，就算分責完成'],['現實重溝通責任。','體能不足。','少參與。','服裝非合作。'],[8,9,13,15],'real-life teamwork depends on communication'),
T('孩子說「我們是一隊」，卻從未傾聽或協商。','文章如何判斷？',['表面團結不足，還要看具體合作習慣','只要口號一致，就表示合作技能已成熟','一隊必須完全沒有任何不同意見','不必觀察誰被忽略或誰負責工作'],['appearance versus learning。','口號不足。','可有分歧。','需觀察。'],[4,7,11,12],'appear united; contribute and negotiate'),
T('某教學活動給表現最快者獎勵，卻希望學生學會公平分責。','首先要檢查甚麼？',['獎勵的行為是否與要教的能力一致','獎品包裝是否比活動內容更鮮艷','是否完全禁止所有能力較強的學生','學生完成後有沒有同色的獎狀'],['reward performance versus cooperation。','非核心。','不需禁止。','獎狀非核心。'],[3,4],'reward performance more than cooperation'),
T('慈善活動由學生共同規劃，老師讓每人說明自己的角色。','這種做法為何有用？',['每人有角色，也有機會反思合作過程','只要活動叫慈善，合作便無須實際分工','老師問角色，表示學生不能自行參與','只要角色數量相同，責任便必然公平'],['角色加反思。','仍需分工。','可參與。','需看內容。'],[2,9,10,11,12,15],'meaningful role and explicit guidance'),
T('小組作業中，安靜的學生未獲任務，導師事後追問原因。','這個問題有甚麼作用？',['找出被忽略者，調整分工並建立包容合作','證明安靜學生應永久退出所有活動','只為提高最強學生的個人比賽成績','讓老師可以不用再觀察日後的合作'],['反思缺席成員。','應包容。','非個人成績。','需持續觀察。'],[5,10,11,12],'why one member was ignored'),
T('有人說團隊運動也能讓孩子互動，故一定是最佳方法。','作者會作哪項區分？',['互動未必最佳；教導與反思或更可靠','任何互動都完全沒有教育價值','只要比賽有輸贏，所有孩子便自動合作','團體任務不需要成人指導或討論'],['反對最佳非否認互動。','仍可有價值。','不自動。','需要引導。'],[0,1,2,3,8,10,12],'best way versus more reliable structured tasks'),
T('完成小組任務後，孩子討論哪些做法讓每人都有參與。','這一步最可能帶來甚麼？',['把合作經驗變成可重用的明確技能','只增加比賽分數，不改變孩子的理解','讓所有人從此再也不會有任何分歧','使原本參與較少的孩子繼續沉默'],['reflection conscious skill。','非只得分。','仍會分歧。','應增加參與。'],[10,11,12,13],'reflection turns experience into conscious skill'),
T('要概括作者的立場與較佳替代方法。','哪項最準確？',['反對運動最佳；主張有引導的團體任務','完全反對孩子參加任何足球或籃球活動','認為得分最高的球員就最懂公平分工','沒有提出方法，只批評學校體育設施'],['立場及替代法俱全。','非禁運動。','得分非合作。','有具體方法。'],[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],'structured collaborative tasks more effective'),
];
const plausibleAlternatives=[
  [['勝出代表小組有效率，合作可留待下一次練','最快者能答題，其餘同學可從旁學會協商','比賽成果良好，成員發言多少便較不重要'],['效率不能代替每位成員的合作學習。','旁觀未提供實際傾聽與協商機會。','結果與過程是不同評估面向。']],
  [['分配責任可練合作，分歧應交由教師解決','各自完成一段，再直接合併而不作討論','討論方案有用，責任分配則可自然形成'],['教師可引導，但學生也需練習協商。','缺少交流與整合便難練合作。','清楚分責是有結構合作的一部分。']],
  [['強者主導可提高成績，弱者稍後再練合作','弱者旁觀能看見技巧，便等同參與協商','隊伍有勝利目標，可自行平衡表現機會'],['勝利與人人學習合作不是同一件事。','觀察不等於親自表達與處理分歧。','無引導時強者仍可能包攬機會。']],
  [['重新分工能提升分數，反思可留到學期末','教師介入代表學生暫時不必自行協商','照顧落後者有用，但合作技能只能靠比賽'],['即時反思本身能令合作可練習。','教師引導是讓孩子學會協商。','文章提出有引導的團體任務作替代。']],
  [['體能活動能練耐性，分責則較難在課堂實現','討論任務有助溝通，責任可由最強者承擔','團隊習慣可在課堂練，仍須以跑速評分'],['有結構任務可讓學生明確分工。','共同承擔不能變成強者獨攬。','真實團隊能力不以跑速為核心。']],
  [['表面團結已有幫助，傾聽可待衝突出現','一隊口號可建立身份，責任安排較次要','未有分歧便代表成員已懂協商'],['文章要求觀察具體傾聽與合作習慣。','團隊身份不能取代公平分責。','沒有可見衝突不證明已具協商能力。']],
  [['獎勵可促速度，公平分責可另設課外活動','先看獎品是否吸引，再決定合作目標','最快者獲獎，其他人便會模仿公平分工'],['現有獎勵與目標不一致仍是問題。','獎品吸引力不能替代教學目標。','獎勵速度未必會鼓勵公平分責。']],
  [['每人有角色，便可省去合作過程的討論','老師說明角色有用，學生可不必自行分工','各人角色相同，便較容易保證公平合作'],['反思能把活動經驗變成可用技能。','文章重視學生實際協商與承擔。','公平參與未必等同相同角色。']],
  [['找出被忽略者，但分工可由最快者決定','導師追問可改善成績，參與機會較次要','調整任務後，安靜學生仍可只負責旁觀'],['只讓強者決定仍可能重現不均。','提問是為促進包容與公平合作。','旁觀未提供真正的貢獻機會。']],
  [['團隊運動有互動，便通常比專題任務可靠','互動有益，但勝利會自然教會公平分責','教師引導有用，分歧可在活動後略過'],['互動本身不足以證明是最佳方法。','勝利可讓強者主導而非人人協商。','反思分歧也是合作學習的一部分。']],
  [['討論能改善下次分工，仍不算合作技能','反思可提升團結感，未必需要具體行動','大家分享感受後，可不再安排公平參與'],['可重用的分工與傾聽正是技能。','文章重視把經驗化成可實行的習慣。','討論應支持日後更公平的合作。']],
  [['反對運動最佳；改以競賽結果評估合作','支持團隊任務，但教師不必引導反思','認為運動有用，仍是最可靠的合作教法'],['比賽結果未必顯示每人學會合作。','作者強調結構、教師提問與反思。','文章明確反對運動是最佳方法。']],
];
plausibleAlternatives.forEach(([options,explanations],i)=>{transfer[i].options.splice(1,3,...options);transfer[i].explanations.splice(1,3,...explanations);});
export default {key:'opinion:85',meta:{topic:'團隊運動是否教授合作的最佳方法',summary:'作者完全不同意團隊運動是教授兒童合作的最佳方法。比賽往往獎勵得分與勝利，強者主導，較弱者可能只學會沉默，整隊看似團結亦不代表每人能貢獻協商。更可靠的是有結構的專題、匯報或慈善任務，讓孩子分工、交流、處理分歧，並在教師提問和反思中學會可遷移的合作習慣。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer,mediumExtras:[]};

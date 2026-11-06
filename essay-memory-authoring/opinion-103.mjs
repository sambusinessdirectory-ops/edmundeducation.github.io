// Equal salaries and workplace harmony: fair recognition, incentives, and morale.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['opinion:103'];
const original=groups.map(row=>row.english),v=(...rows)=>rows;
const simple=[
 'In any workplace, pay is more than money sent each month; it shows how much duty, work and trust a person has.',
 'So I completely disagree that paying everyone the same would make workers truly get along or respect one another.',
 'The idea may look fair at first, but it would quickly become unfair in real life.',
 'The main problem is that the same pay ignores real differences in how much people work, what they can do and what they are responsible for.',
 'An experienced engineer designing hard systems, a manager responsible for a whole team and a new worker still learning do not carry the same amount of work.',
 'If all get exactly the same pay, the company is not being fair; it is choosing not to see important differences.',
 'This can make workers feel angry instead of bringing them together, because people with harder jobs may feel their work no longer counts.',
 'For example, a team leader who stays late to solve customer problems may not feel respected if a worker with far fewer duties gets exactly the same pay.',
 'Another reason is that one pay level for everyone can make people less willing to work hard and make work worse.',
 'In a good workplace, pay should not be the only reason to work hard, but it still helps thank people for getting better, being dependable and doing excellent work.',
 'If doing extra work brings no extra thanks, keen workers may work less hard or leave for a company that values what they do more fairly.',
 'At the same time, people doing weaker work may have little reason to get better if poor work brings no clear result.',
 'After some time, this would not make a calm workplace; people would quietly feel upset.',
 'To sum up, paying everyone the same may look like a way to stop jealousy, but it would hurt fairness, effort and respect.',
 'A workplace where people get along comes from treating people fairly, not treating everyone in exactly the same way.',
];
const vocabulary=[
 v(['organisation','workplace','機構'],['more than a monthly transfer','more than money sent each month','不只是每月轉帳'],['signal','shows','訊號'],['responsibility','duty','責任'],['contribution','work','貢獻'],['trust','trust','信任']),
 v(['For this reason','So','因此'],['completely disagree','completely disagree','完全不同意'],['all workers the same salary','paying everyone the same','所有人同薪'],['genuine harmony','truly get along','真正和諧'],['mutual respect','respect one another','互相尊重']),
 v(['Although','but','雖然'],['sound fair at first glance','look fair at first','初看公平'],['unfair in practice','unfair in real life','實際不公']),
 v(['main problem','main problem','主要問題'],['equal pay','the same pay','劃一薪酬'],['ignores real differences','ignores real differences','忽視差異'],['workload','how much people work','工作量'],['skill','what they can do','技能'],['responsibility','what they are responsible for','責任']),
 v(['senior engineer','experienced engineer','資深工程師'],['complex systems','hard systems','複雜系統'],['accountable','responsible','須負責'],['junior employee','new worker','初級員工'],['being trained','still learning','仍受訓'],['same burden','same amount of work','相同負擔']),
 v(['identical salaries','exactly the same pay','完全相同薪金'],['not treating them equally','not being fair','不平等對待'],['refusing to recognise','choosing not to see','拒絕承認'],['meaningful differences','important differences','實質差異']),
 v(['breed resentment','make workers feel angry','滋生怨氣'],['rather than unity','instead of bringing them together','而非團結'],['more demanding','harder','更繁重'],['effort','work','努力'],['quietly erased','no longer counts','被抹去']),
 v(['team leader','team leader','團隊主管'],['works late','stays late','工作至晚'],['client problems','customer problems','客戶問題'],['unlikely to feel respected','may not feel respected','難感受尊重'],['far fewer duties','far fewer duties','職責少很多'],['same reward','same pay','相同報酬']),
 v(['Another reason','Another reason','另一原因'],['flat salary system','one pay level for everyone','劃一薪酬制度'],['weaken motivation','make people less willing to work hard','削弱動力'],['damage performance','make work worse','損害表現']),
 v(['healthy workplace','good workplace','健康職場'],['only incentive','only reason to work hard','唯一誘因'],['reward progress','thank people for getting better','獎勵進步'],['reliability','being dependable','可靠性'],['excellence','doing excellent work','卓越']),
 v(['extra effort','doing extra work','額外努力'],['extra recognition','extra thanks','額外認可'],['ambitious workers','keen workers','有抱負員工'],['slow down','work less hard','放慢步伐'],['value their contribution','values what they do','重視貢獻']),
 v(['At the same time','At the same time','同時'],['weaker employees','people doing weaker work','較弱員工'],['improve','get better','改善'],['consequences of poor performance','clear result','低效後果']),
 v(['Over time','After some time','長遠'],['peaceful workplace','calm workplace','平和職場'],['quiet frustration','quietly feel upset','沉默挫敗']),
 v(['In conclusion','To sum up','總結'],['appear to remove jealousy','look like a way to stop jealousy','看似消除嫉妒'],['undermine fairness','hurt fairness','削弱公平'],['motivation','effort','動力'],['respect','respect','尊重']),
 v(['True workplace harmony','A workplace where people get along','真正職場和諧'],['fair treatment','treating people fairly','公平對待'],['not identical treatment','not treating everyone in exactly the same way','非完全同樣對待']),
];
const part=(text,kind,label)=>[text,kind,label];
function makeFrame(i,s){const source=original[i],at=source.indexOf(s.target);if(at<0)throw Error('Missing target '+(i+1)+': '+s.target);const prefix=source.slice(0,at),suffix=source.slice(at+s.target.length),parts=[];if(prefix)parts.push(part(prefix,'link','句型固定部分'));parts.push(part(s.target,'slot',s.slot));if(suffix)parts.push(part(suffix,'link','句型固定部分'));return {formula:s.formula,meaning:s.meaning,usage:s.usage,parts}}
const specs=[
 {target:'pay',replacement:'recognition',slot:'超越金錢本身的訊號',formula:'In any organisation, [回報] is more than [形式]; it signals [責任價值]',meaning:'薪酬不只轉帳，亦傳遞責任貢獻與信任。',usage:'當引言要指出一項制度的象徵作用超過表面功能時。',relation:'more than ...; it is ... 重估薪酬含義',d:[1,8,13]},
 {target:'giving all workers the same salary',replacement:'giving all workers the same bonus',slot:'作者反對的劃一待遇',formula:'For this reason, I completely disagree that [劃一做法] would create [和諧]',meaning:'同薪不會帶來真正和諧尊重。',usage:'當你要從制度的象徵意義推到明確反對的立場時。',relation:'For this reason 把前提連到立場',d:[0,8,13]},
 {target:'the idea',replacement:'the proposal',slot:'初看公平的提議',formula:'Although [提議] may sound fair at first glance, it becomes unfair in practice',meaning:'表面公平的同薪實際可不公。',usage:'當你要區分表面平等與執行後的公平時。',relation:'Although 對照初看與實際',d:[0,8,13]},
 {target:'equal pay',replacement:'one fixed salary',slot:'忽視角色差異的制度',formula:'The main problem is that [制度] ignores differences in [負擔技能責任]',meaning:'同薪忽視工作量技能責任差異。',usage:'當首個主體段需先標出方案的核心缺陷時。',relation:'that 交代主要問題內容',d:[8,9,13]},
 {target:'A senior engineer',replacement:'A senior designer',slot:'承擔較重職責的第一人',formula:'[資深者], [主管], and [初級者] do not carry the same burden',meaning:'工程師經理與新員工負擔不相同。',usage:'當你要用不同角色比較工作負擔是否相同時。',relation:'三角色並列具體化差異',d:[8,9,13]},
 {target:'identical salaries',replacement:'one fixed wage',slot:'拒絕承認差異的同額薪酬',formula:'If [不同角色] receive [同薪], it is not equal; it ignores [實質差異]',meaning:'同薪可不是平等，而是忽視差異。',usage:'當你要用 If 檢驗一種表面平等政策的真實後果時。',relation:'not ...; it is ... 重新定義公平',d:[8,9,13]},
 {target:'resentment',replacement:'quiet anger',slot:'同薪可能滋生的感受',formula:'This can breed [負面感受] rather than unity, because [努力未被看見]',meaning:'工作要求高者若努力被抹去會生怨。',usage:'要指出某做法帶來的結果與預期相反，並用 because 補充原因時。',relation:'because 解釋怨氣來源',d:[8,9,13]},
 {target:'a team leader',replacement:'an experienced technician',slot:'付出較多的具體員工',formula:'For example, [多付出者] may not feel respected if [少付出者] receives the same reward',meaning:'加班解客戶問題的主管與少職責同酬或不受尊重。',usage:'當你要用兩名工作者的付出與回報作具體對照時。',relation:'if 以例子展示認可落差',d:[8,9,13]},
 {target:'a flat salary system',replacement:'a one-rate bonus scheme',slot:'削弱動力的劃一制度',formula:'Another reason is that [同額制度] would weaken motivation and performance',meaning:'同薪還會削弱動力及表現。',usage:'當第二段要加入與公平感不同的激勵理由時。',relation:'Another reason 開另一因果線',d:[3,4,13]},
 {target:'the only incentive',replacement:'the main incentive',slot:'薪酬不應成為的唯一誘因',formula:'Pay should not be [唯一動機], but remains one way to reward [表現]',meaning:'薪酬非唯一誘因，仍能獎勵進步可靠表現。',usage:'當你要避免把某工具說成唯一動機，同時肯定其作用時。',relation:'not ... but ... 保留有限作用',d:[3,4,13]},
 {target:'extra effort',replacement:'better performance',slot:'未獲額外認可的付出',formula:'If [付出] brings no [認可], ambitious workers may [放慢或離開]',meaning:'額外努力無回報，進取員工或減速離職。',usage:'當你要追蹤缺乏獎勵對努力者的長期反應時。',relation:'If 串認可缺失與流失',d:[3,4,13]},
 {target:'weaker employees',replacement:'less engaged employees',slot:'可能缺少改善動力的人',formula:'At the same time, [員工] may have little reason to improve since [制度屏蔽後果]',meaning:'表現較弱者也可能缺乏改善誘因。',usage:'當你要補充同一制度對另一類員工的不同影響時。',relation:'At the same time 補另一群體反應',d:[3,4,13]},
 {target:'a peaceful workplace',replacement:'a motivated workplace',slot:'同薪原本希望帶來的工作環境',formula:'Over time, this would not create [理想環境]; it would create [隱藏問題]',meaning:'同薪未必有和諧，可能只有壓抑怨氣。',usage:'當你要用分號對照方案承諾與長期實際結果時。',relation:'not ...; it would ... 對照表面與實際',d:[3,4,13]},
 {target:'paying everyone the same',replacement:'giving everyone the same bonus',slot:'結論中看似消妒忌的做法',formula:'Although [同樣待遇] appears to remove jealousy, it undermines [公平動力尊重]',meaning:'同薪表面消妒忌，實際削弱公平動力尊重。',usage:'當結論要承認提議表面好處再說其實際代價時。',relation:'but 反轉表面目的與後果',d:[3,8,14]},
 {target:'fair treatment',replacement:'recognising real contributions',slot:'真正和諧所依靠的待遇',formula:'True harmony comes from [公平對待], not [完全同樣對待]',meaning:'和諧來自公平，而非人人完全相同。',usage:'當最後要用精簡對照總結公平的核心標準時。',relation:'not identical treatment 定最終原則',d:[3,8,13]},
];
const structures=specs.map((s,i)=>({example:original[i].replace(s.target,s.replacement),distractors:s.d,frame:makeFrame(i,s),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
structures[6].frame.formula='This can easily breed [負面感受] rather than unity, because [原因].';
structures[6].frame.parts=[
  part('This can easily breed ','link','引出結果'),
  part('resentment','slot','產生的感受'),
  part(' rather than unity, because ','link','對照預期結果並交代原因'),
  part('employees whose roles are more demanding may feel that their effort has been quietly erased','slot','形成這種感受的原因'),
  part('.','link','句末'),
];
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'分清表面相同與實際公平，再追蹤兩類員工反應。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者對所有員工同薪持甚麼立場？',['完全反對，因同薪忽視職責差異並削弱動力。','完全支持，因不同職責代表相同工作量。','認為薪酬是唯一可影響員工的因素。','認為任何公平制度都必須人人同額。'],'作者區分公平與完全相同。'),{type:'multi',prompt:'文章的兩條主要反對理由是甚麼？',detail:'選兩項，再按「確認」。',options:['同薪忽略工作量技能責任的差異。','額外努力無認可可傷動力與表現。','所有員工的職責都完全相同。','同薪保證進取員工永遠不會離職。'],correct:[0,1],why:'一條論證公平，另一條論證激勵。'}];
const route=[sequence('還原四段論證',[['引言','薪酬傳遞責任與信任；作者反對同薪。'],['公平','不同角色負擔不一，同薪可抹去努力並生怨。'],['動力','付出無額外認可，進取者減速或離職，較弱者少改善。'],['結論','表面消妒忌，實際損公平；和諧靠公平而非同樣。']],'兩個主體段分別問「是否公平」與「會否有動力」。')];
const evidence=[quiz('工程師、經理與初級員工的例子證明甚麼？',['三者技能責任與工作負擔不同。','每名員工從第一天起負擔完全相同。','只有初級員工需要任何專業技能。','經理必然不需對團隊作任何決策。'],'同薪忽略有意義差異。'),quiz('付出較多者為何可能生怨？',['同額回報可使其感到努力未被承認。','同薪必然讓所有人感到更受尊重。','努力較多的人從不需要任何認可。','客戶問題必定能自動解決。'],'認可與公平感相連。'),quiz('同薪如何影響進取員工？',['額外努力無認可時或放慢工作或離職。','每名進取員工必定立即永久停止工作。','同薪保證每人只會更加積極。','離職與公司是否重視貢獻完全無關。'],'動力和人才留任是第二條機制。'),quiz('作者有否說薪酬應是唯一誘因？',['沒有；它仍是獎勵進步可靠表現的方法之一。','有；除此之外所有因素都應永久取消。','沒有；薪酬與任何工作表現都完全無關。','有；同薪必定最能獎勵所有人的進步。'],'作者對薪酬作用有明確限定。')];
const logic=[sequence('同薪為何不公平',[['訊號','薪酬反映責任、貢獻與信任。'],['角色差異','工程師主管初級員工的負擔不同。'],['被抹去','完全同薪未承認實質差異。'],['感受','多付出者可能生怨而非團結。']],'相同數字不等於公平評價。'),sequence('同薪為何傷動力',[['公平回報','薪酬可獎進步可靠及優秀表現。'],['進取員工','多做無認可或放慢及離職。'],['較弱員工','少後果便缺乏改善誘因。'],['結果','表面和平下積累沉默挫敗。']],'分別分析不同員工的反應。')];
const transfers=[
 transfer('資深工程師與新員工承擔不同責任，卻完全同薪。','哪句貼合公平論證？',['同額薪酬忽略工作負擔，未必是真正公平對待。','同額薪酬較易管理，故不用比較職責差異','工程師技能較高，便可省略培訓新人的安排','新員工仍在學習，薪酬可只按年齡設定'],['數字相同不等於負擔相同。','管理方便不能代表對不同責任公平。','較高技能與培訓責任仍需評估。','年齡不能替代職責與貢獻。'],[3,4,5],'meaningful differences。'),
 transfer('主管加班解決客戶問題，同事工作較少卻同酬。','主管可能怎樣感受？',['額外付出未獲承認，或感到不被尊重。','同酬方便發放，但不用計算額外工作量','主管加班有助客戶，卻不必納入待遇評估','同事工作較少，可先看辦公室排班形式'],['認可落差可生怨。','行政方便漏掉額外付出。','加班與客戶問題正是待遇評估的情境。','排班形式不能獨自決定公平。'],[6,7],'team leader resentment。'),
 transfer('公司說「所有人同薪便沒有嫉妒」。','哪句指出反效果？',['同薪可掩蓋責任差異，反而積累怨氣。','同薪可減少比較，便不必查不同職位負擔','制度簡單有用，員工表現可留待日後評估','員工有怨氣時，只需提醒他們同額待遇'],['同薪可能引發不公感。','相同金額可能掩蓋負擔差異。','簡單制度仍會影響表現與怨氣。','提醒金額相同不能處理被忽視的貢獻。'],[5,6,12],'quiet frustration rather than harmony。'),
 transfer('額外努力永遠不被認可，進取員工考慮離職。','哪句說明激勵機制？',['缺乏回報可能令肯努力的人放慢或轉職。','額外努力未獲獎勵，可先加強使命感宣傳','進取員工想離職，主因是辦公室地點','公平薪酬重要，卻不影響長期投入程度'],['努力與回報有關。','宣傳未給額外付出實際回報。','情境已給未獲認可的原因。','回報與投入是文章連起的因果。'],[9,10],'extra effort no recognition。'),
 transfer('同薪制度下較弱員工不需承擔低效後果。','哪句補上另一群體反應？',['缺少改善誘因，工作表現或難以提升。','員工無改善壓力，仍可只靠年度培訓','工作表現較弱，便不必提供具體回饋','制度未設後果，但可只增加考勤檢查'],['制度也影響較弱者。','培訓可幫助，但缺改善誘因仍在。','具體回饋有助改善弱項。','考勤未必鼓勵工作質素提升。'],[11],'weaker employees little reason to improve。'),
 transfer('另一題問學校所有職員是否應有同一獎金。','哪句可轉用本文原則？',['先比較責任與貢獻，再看制度能否鼓勵進步。','同一獎金方便計算，不需看責任與貢獻','先按職稱決定獎金，不用比較工作表現','學校可評估公平，卻不必看激勵效果'],['公平及激勵可跨題。','方便計算不能取代公平評估。','職稱未必反映實際工作。','激勵進步是另一個關鍵尺度。'],[3,9,10],'fairness plus motivation。'),
 transfer('有人說「薪酬是唯一工作動機」。','哪句符合文章的限定？',['薪酬並非唯一動機，仍可獎勵進步與可靠表現。','薪酬不是唯一動機，待遇可先放在次要位置','薪酬重要，便不必看工作意義或團隊感','有其他動機，仍只按固定同額薪酬發放'],['非唯一但仍重要。','非唯一不等於薪酬無影響。','作者承認多種動機。','固定同額可能難獎勵進步。'],[9],'not only incentive。'),
 transfer('作文只說「同薪不好」，沒有解釋。','哪句補上具體因果？',['同薪抹去差異，努力者生怨，亦可能減少投入。','同薪可能有爭議，但只需再重申反對立場','先談員工怨氣，卻不說為何同薪引起','只看員工投入減少，不分析公平感變化'],['差異→感受→行為。','重申立場未解釋機制。','應連同額與被忽視的貢獻。','公平感是投入變化的中間環節。'],[5,6,10],'difference, resentment, effort。'),
 transfer('一位員工聽到「同薪就是公平」的說法。','哪句可檢驗其前提？',['要先看職責與付出是否相同，不能只看金額。','金額一致方便管理，職責差異可先不看','職責不同，可只按職稱高低決定公平','只看付出，不需看公司給的實際待遇'],['公平需看實質差異。','同額不代表負擔相同。','職稱也需對照實際付出。','公平比較要看待遇與付出。'],[3,4,5],'equal pay vs fair treatment。'),
 transfer('結論要區分「相同待遇」與「公平待遇」。','哪句最完整？',['真正和諧來自按貢獻公平對待，而非人人同額。','相同薪額較易管理，可先把責任差異略過','按貢獻分配有益，卻不必解釋公平標準','待遇不同可有理由，但不查員工如何感受'],['公平不等於完全相同。','責任差異是公平判斷核心。','需要可解釋的貢獻尺度。','員工感受與和諧也重要。'],[13,14],'fair not identical treatment。'),
];
// Reviewed connector structure decompositions.
structures[5].frame.parts=[["If ","link","句型固定部分"],["they all","slot","接受同樣待遇的人"],[" receive ","link","句型固定部分"],["identical salaries","slot","相同薪酬"],[", the company is not treating them equally; it is refusing to recognise ","link","句型固定部分"],["meaningful differences","slot","實質差異"],[".","link","句型固定部分"]];
structures[5].frame.formula="If [接受同樣待遇的人] receive [相同薪酬], the company is not treating them equally; it is refusing to recognise [實質差異].";
structures[7].frame.parts=[["For example, ","link","句型固定部分"],["a team leader","slot","付出較多的人"],[" who works late to solve client problems is unlikely to feel respected if ","link","句型固定部分"],["a colleague with far fewer duties","slot","責任較少的同事"],[" receives exactly the same reward.","link","句型固定部分"]];
structures[7].frame.formula="For example, [付出較多的人] who works late to solve client problems is unlikely to feel respected if [責任較少的同事] receives exactly the same reward.";
structures[10].frame.parts=[["If ","link","句型固定部分"],["extra effort","slot","額外付出"],[" brings no ","link","句型固定部分"],["extra recognition","slot","額外認可"],[", ","link","句型固定部分"],["ambitious workers","slot","積極員工"],[" may eventually slow down or leave for ","link","句型固定部分"],["companies that value their contribution more accurately","slot","更能認可貢獻的地方"],[".","link","句型固定部分"]];
structures[10].frame.formula="If [額外付出] brings no [額外認可], [積極員工] may eventually slow down or leave for [更能認可貢獻的地方].";
structures[11].frame.parts=[["At the same time, ","link","句型固定部分"],["weaker employees","slot","可能缺少改善動機的人"],[" may have little reason to improve, since ","link","句型固定部分"],["the system protects them from the consequences of poor performance","slot","制度屏蔽後果"],[".","link","句型固定部分"]];
structures[11].frame.formula="At the same time, [可能缺少改善動機的人] may have little reason to improve, since [制度屏蔽後果].";
structures[0].frame.parts=[["In any organisation, ","link","句型固定部分"],["pay","slot","回報"],[" is more than ","link","句型固定部分"],["a monthly transfer","slot","表面形式"],["; it is ","link","句型固定部分"],["a signal of responsibility, contribution, and trust","slot","傳遞的價值訊號"],[".","link","句型固定部分"]];
structures[0].frame.formula="In any organisation, [回報] is more than [表面形式]; it is [傳遞的價值訊號].";
structures[3].frame.parts=[["The main problem is that ","link","句型固定部分"],["equal pay","slot","受批評的制度"],[" ignores ","link","句型固定部分"],["real differences in workload, skill, and responsibility","slot","被忽略的實質差異"],[".","link","句型固定部分"]];
structures[3].frame.formula="The main problem is that [受批評的制度] ignores [被忽略的實質差異].";
structures[4].frame.parts=[["A senior engineer who designs complex systems","slot","第一種角色及職責"],[", ","link","句型固定部分"],["a manager who is accountable for a whole department","slot","第二種角色及職責"],[", and ","link","句型固定部分"],["a junior employee who is still being trained","slot","第三種角色及職責"],[" do not carry the same burden.","link","句型固定部分"]];
structures[4].frame.formula="[第一種角色及職責], [第二種角色及職責], and [第三種角色及職責] do not carry the same burden.";
structures[9].frame.parts=[["In a healthy workplace, pay should not be ","link","句型固定部分"],["the only incentive","slot","不應成為的唯一誘因"],[", but it is still one important way to reward ","link","句型固定部分"],["progress, reliability, and excellence","slot","應獎勵的表現"],[".","link","句型固定部分"]];
structures[9].frame.formula="In a healthy workplace, pay should not be [不應成為的唯一誘因], but it is still one important way to reward [應獎勵的表現].";
structures[13].frame.parts=[["In conclusion, ","link","句型固定部分"],["paying everyone the same","slot","看似消除妒忌的做法"],[" may appear to remove jealousy, but it would actually undermine ","link","句型固定部分"],["fairness, motivation, and respect","slot","實際受損的價值"],[".","link","句型固定部分"]];
structures[13].frame.formula="In conclusion, [看似消除妒忌的做法] may appear to remove jealousy, but it would actually undermine [實際受損的價值].";
structures[14].frame.parts=[["True workplace harmony comes from ","link","句型固定部分"],["fair treatment","slot","真正帶來和諧的做法"],[", not ","link","句型固定部分"],["identical treatment","slot","被對照的劃一做法"],[".","link","句型固定部分"]];
structures[14].frame.formula="True workplace harmony comes from [真正帶來和諧的做法], not [被對照的劃一做法].";
// Source-aligned remaining frames.
structures[1].frame.parts=[["For this reason, I completely disagree that ","link","句型固定部分"],["giving all workers the same salary","slot","劃一做法"],[" would create ","link","句型固定部分"],["genuine harmony or mutual respect.","slot","和諧"]];
structures[12].frame.parts=[["Over time, this would not create ","link","句型固定部分"],["a peaceful workplace","slot","理想環境"],["; it would create ","link","句型固定部分"],["a quiet frustration under the surface.","slot","隱藏問題"]];
export default {key:'opinion:103',meta:{topic:'所有員工同薪能否帶來職場和諧',summary:'同薪看似平等，實際忽視工作量、技能和責任差異；額外努力無認可也可能使進取者減速離職、較弱者缺乏改善誘因，故和諧靠公平而非完全相同。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

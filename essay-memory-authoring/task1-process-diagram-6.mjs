// Task 1 Process Diagram 6: day-generation/night-pumping reservoir cycle.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先沿白天向下的水流，再沿夜間向上的抽水箭頭。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The diagram shows how a hydroelectric station makes electricity using water at two different heights.',
 'Overall, the system repeats every day: in daytime, water flows down from a high reservoir and makes electricity; at night, pumps send it back up to use again.',
 'The dam and turbines that can work in two directions are central. The electricity goes to the national grid.',
 'In daytime, river water stays in the high reservoir behind a dam.',
 'When the intake opens, stored water flows down a sloping pipe to the power station.',
 'As the water passes through turbines, they drive a generator, which makes electricity from the moving water.',
 'Power lines carry the electricity to the national grid. The used water goes into the low reservoir.',
 'At night, the water moves in the other direction.',
 'The dam intake closes, and pumps push water from the lower reservoir through the same turbine system and pipe to the high reservoir.',
 'This fills the high reservoir again, so the same water can be used the next day.',
];
const vocabulary=[
 v(['illustrates','shows','展示'],['hydroelectric power station','hydroelectric station','水力發電站'],['produces electricity','makes electricity','發電'],['water stored at different heights','water at two different heights','不同高度儲水']),
 v(['daily cycle','repeats every day','每日循環'],['during the day','in daytime','日間'],['upper reservoir','high reservoir','上水庫'],['generate electricity','makes electricity','發電'],['pumped back uphill','pumps send it back up','抽回高處']),
 v(['A dam','The dam','水壩'],['reversible turbines','turbines that can work in two directions','可逆水輪機'],['electricity produced','electricity','產生的電力'],['national grid','national grid','國家電網']),
 v(['In the daytime','In daytime','白天'],['high-level reservoir','high reservoir','高水位水庫'],['held','stays','蓄存'],['behind the dam','behind a dam','水壩後']),
 v(['intake is opened','intake opens','進水口打開'],['stored water is released','stored water flows','儲水放出'],['sloping pipe','sloping pipe','斜管']),
 v(['passes through','passes through','流經'],['reversible turbines','turbines','可逆水輪機'],['operate a generator','drive a generator','帶動發電機'],['converts the energy','makes electricity','轉換能量']),
 v(['transmitted by power lines','Power lines carry','由電線輸送'],['national grid','national grid','國家電網'],['discharged','goes','排入'],['low-level reservoir','low reservoir','低水位水庫']),
 v(['At night','At night','夜間'],['direction of movement is reversed','moves in the other direction','流向反轉']),
 v(['intake at the dam is closed','dam intake closes','壩口關閉'],['lower reservoir','lower reservoir','下水庫'],['pumped back','pumps push','抽回'],['conduit','pipe','管道']),
 v(['restores the supply','fills','補回水量'],['begin again','used the next day','次日再運作'],['following day','next day','翌日']),
];
const structures=[
 f('The diagram illustrates how a pumped-storage power station produces electricity by using water stored at different heights.','引言說明系統、輸出及高度差來源',[1,3,8],{formula:'The diagram illustrates how [設施] produces electricity by using water stored at different heights',meaning:'高水庫與低水庫水位差供日間發電，夜間再抽回。',usage:'圖示是水力站與高低水庫，不要寫成潮汐海浪裝置。',parts:[link('The diagram illustrates how'),slot(' a hydroelectric power station','設施'),link(' produces electricity by using water stored at different heights.')]}),
 f('Overall, the system works as a daily cycle: during the day, water descends from a high basin to drive the generator, while at night it is pumped back to the high basin for reuse.','用白天／夜晚的相反方向概述每日循環',[0,4,8],{formula:'Overall, the system works as a daily cycle: during the day, [日間方向與用途], while at night [夜間方向與用途]',meaning:'白天高→低發電，夜晚低→高抽水；兩段用同一水路與可逆水輪機。',usage:'夜間是抽水回補，不是圖中另一個發電階段。',parts:[link('Overall, the system works as a daily cycle: during the day,'),slot(' water flows downwards from an upper reservoir to generate electricity','日間方向與用途'),link(', while at night'),slot(' the same water is pumped back uphill for reuse','夜間方向與用途'),link('.')]}),
 f('A dam and reversible turbines are the central features, and the electricity produced is sent to the regional grid.','列核心部件與電力去向',[0,4,6],{formula:'A dam and reversible turbines are the central features, and the electricity produced is sent to [去向]',meaning:'dam 儲高位水，reversible turbines 日間帶發電機、夜間抽水；電力接 national grid。',usage:'national grid 是日間電力輸出方向，不表示夜間抽水的能源來源。',parts:[link('A dam and reversible turbines are the central features, and the electricity produced is sent to'),slot(' the national grid','去向'),link('.')]}),
 f('In the daytime, river water is held in the upper reservoir behind the dam.','先定位日間儲水及水壩位置',[0,4,8],{formula:'In the daytime, river water is held in [儲水地點] behind the dam',meaning:'河水在壩後 high-level reservoir，位於發電站上方。',usage:'高水庫是日間發電前的起點；低水庫是發電後的終點。',parts:[link('In the daytime, river water is held in'),slot(' the high-level reservoir','儲水地點'),link(' behind the dam.')]}),
 f('When the intake is opened, the stored water is released through a sloping pipe towards the turbine chamber.','以 When 對準日間閘口打開及水往下流',[0,3,8],{formula:'When the intake is opened, the stored water is released through a sloping pipe towards [目的地]',meaning:'圖標 Intake (Day: open)，高水庫水經斜管向 power station 流下。',usage:'night intake closed；這句只能對應白天。',parts:[link('When the intake is opened, the stored water is released through a sloping pipe towards'),slot(' the power station','目的地'),link('.')]}),
 f('As it passes through the reversible turbines, these operate a generator, which converts the energy from the moving water into electric power.','串連流動水→水輪機→發電機→電力',[0,4,8],{formula:'As it passes through the reversible turbines, these operate a generator, which converts the energy from the moving water into [產物]',meaning:'日間水推可逆水輪機帶 generator 發電。',usage:'it 回指水，these 回指 turbines，which 回指 generator；不能說低水庫直接發電。',parts:[link('As it passes through the reversible turbines, these operate a generator, which converts the energy from the moving water into'),slot(' electricity','產物'),link('.')]}),
 f('The power is then transmitted by power lines to the regional grid, while the used water is discharged into the lower reservoir.','同句分別交代電力和用後水的去向',[0,4,8],{formula:'The power is then transmitted by power lines to [電力去向], while the used water is discharged into [水去向]',meaning:'電力走 power lines→national grid；水走 station→low-level reservoir。',usage:'電力與水是兩種不同輸出，不可把水寫成沿電線流到電網。',parts:[link('The power is then transmitted by power lines to'),slot(' the national grid','電力去向'),link(', while the used water is discharged into'),slot(' the low-level reservoir','水去向'),link('.')]}),
 f('At night, the direction of water movement is reversed.','短句明確轉換到夜間反向抽水',[0,4,9],{formula:'At night, the direction of [流動物] is reversed',meaning:'日間高→低；夜間低→高。',usage:'反轉的是水流，不是電力送國家電網的路徑。',parts:[link('At night, the direction of'),slot(' movement','流動物'),link(' is reversed.')]}),
 f('The intake at the dam is closed, and water from the bottom reservoir is pumped back through the same turbine system and conduit to the top reservoir.','並列夜間閘口狀態與回水路徑',[0,4,6],{formula:'The intake at the dam is closed, and water from [低水庫] is pumped back through the same turbine system and conduit to [高水庫]',meaning:'夜間 intake closed；可逆水輪機抽水 low→high，管道與白天同一條。',usage:'圖中不提供夜間抽水電力來源，不能寫電網直接給泵供電。',parts:[link('The intake at the dam is closed, and water from'),slot(' the lower reservoir','低水庫'),link(' is pumped back through the same turbine system and conduit to'),slot(' the upper reservoir','高水庫'),link('.')]}),
 f('This restores the supply of water, allowing the process to begin again on the next day.','以 This 回指夜間抽水，連到次日再啟動',[0,4,8],{formula:'This restores the supply of water, allowing the process to begin again [時間]',meaning:'夜間把水送回高水庫，翌日 intake 再開可重複日間發電。',usage:'This 指前句抽水回補，並非水被消耗後憑空再生。',parts:[link('This restores the supply of water, allowing the process to begin again'),slot(' the following day','時間'),link('.')]}),
];
const intro=[quiz('這個站的白天與夜晚各做甚麼？',['白天放水發電；夜晚把低處水抽回高處','白天與夜晚都只向下放水','夜晚發電；白天抽水','兩段都只送電而沒有水流'],'圖標 reversible turbines：Day operate generator；Night pump water uphill。'),{type:'multi',prompt:'哪兩項適合作概覽？',detail:'選兩項，再按「確認」。',options:['高低水庫與可逆水輪機構成每日發電／抽水循環','日間電力經線路送電網，夜間同一水經管道抽回高水庫','夜間 intake 打開以向下放水','電力和用後水都經同一電線送到電網'],correct:[0,1],why:'概覽須分清水流、電流和日夜控制。'}];
const route=[sequence('依範文排序水力站四段報告',[
 ['引言','以不同高度儲水產生電力。'],['概覽','每日循環：日間下流發電，夜間抽回；水壩和可逆水輪機為關鍵。'],['日間細節','高水庫壩後儲水→intake 開→斜管下流→水輪機帶發電機→電網與低水庫。'],['夜間細節','intake 關→低水庫水由同套水輪機和管道抽回高水庫→翌日再用。'],
],'圖中 electricity 去電網，used water 去低水庫，是分開的路。')];
const evidence=[
 quiz('日間 intake 的狀態？',['開啟','關閉','拆除','圖未標示'],'圖標 Day: open。'),
 quiz('日間水流方向？',['高水庫經斜管往低水庫','低水庫直接往天上','高水庫進國家電網','低水庫往更低的海'],'高→站→低。'),
 quiz('發電站內水輪機日間作用？',['帶動發電機','抽水回高水庫','封住水壩','儲存陽光'],'圖標 Day: operate generator。'),
 quiz('電力與用後水分別去哪裏？',['電力沿線到國家電網；水入低水庫','水沿電線到電網；電力入低水庫','兩者都入高水庫','兩者都停在閘口'],'圖中兩箭頭目的地不同。'),
 quiz('夜間 intake 的狀態？',['關閉','開啟並向下放水','被拆除','變成發電機'],'圖標 Night: closed。'),
 quiz('夜間水流方向？',['低水庫經同套水輪機／管道抽回高水庫','高水庫經閘口下流發電','國家電網流到水壩','上水庫直接變海水'],'圖標 Night pump water into high-level reservoir。'),
 quiz('圖有沒有說夜間抽水的電源來自哪裏？',['沒有，不能自行指定','明確由太陽能供電','明確由國家電網供電','明確由飛機供電'],'圖示夜間抽水路徑，未標供能來源。'),
];
const logic=[sequence('日間：水、機械、電的分路',[
 ['儲水與放水','壩後高水庫，intake open，水沿斜管下降。'],['機械轉換','水推 reversible turbines，帶 generator。'],['電力輸出','generator 的電沿 power lines 到 national grid。'],['水的去向','已用水進低水庫，留待夜間抽回。'],
 ],'水不沿電線走；電力也不流入低水庫。'),sequence('夜間：把日間的水路倒用',[
 ['控制','intake closed。'],['方向','低水庫→同一 turbine system／conduit→高水庫。'],['目的','補回高處蓄水供翌日使用。'],['未給資料','圖未標夜間抽水用電來源或效率。'],
 ],'reversible 表設備角色可切換；不要當夜間也以同向水流發電。')];
const transfers=[
 transfer('另一圖展示以高低水庫儲水運作的發電站。','哪句引言交代機制？',['流程圖展示水力發電站如何利用不同高度的水來發電。','流程圖只比較電價。','水力站完全沒有水流。','圖展示燃燒煤炭發電。'],['設施、物料和產物吻合。','不是價格圖。','水沿管道流。','沒有煤。'],[0],'原文 hydroelectric station uses water stored at different heights。'),
 transfer('白天高→低發電，夜晚低→高回補。','哪句總結每日循環？',['日間水向下流產電，夜間同一水被抽回高處以供再用。','日夜都只向下放水，從不回補。','夜晚發電，白天抽回。','用後的水直接消失。'],['兩方向及用途對圖。','夜晚上抽。','日夜顛倒。','水進低水庫。'],[1],'原文 daily cycle：day down generate，night uphill reuse。'),
 transfer('水壩、可逆水輪機與國家電網都在圖中。','哪句分清裝置和輸出目的地？',['水壩與可逆水輪機是核心設備，產生的電送國家電網。','水壩和電網都是儲水的水庫。','可逆水輪機只用於儲存標籤。','電力進入河水而非電網。'],['核心部件和去向正確。','電網不是水庫。','功能錯。','電線通電網。'],[2],'原文 dam/reversible turbines central；electricity national grid。'),
 transfer('日間河水在壩後高處水庫。','哪句定位儲水？',['白天河水蓄於水壩後的高水位水庫。','白天河水一開始就在低水庫。','水壩在國家電網裏。','水先從夜間泵直接進飛機。'],['起點為壩後高水庫。','低水庫是用後。','電網不是水壩。','無飛機。'],[3],'原文 river water held high-level reservoir behind dam。'),
 transfer('圖標 Day: open，水沿斜管下降。','哪句把控制與水流連起來？',['進水口打開後，儲水經斜管向發電站流下。','進水口夜晚關閉時，水仍由高處同向流下發電。','儲水沿電線送往發電站。','日間進水口永久封閉。'],['日間閘開、斜管放水。','夜間走回抽路。','水走管道。','Day open。'],[4],'原文 intake opened→water released through sloping pipe。'),
 transfer('日間水推可逆水輪機，再帶動 generator。','哪句因果鏈正確？',['流動的水經水輪機帶動發電機，將水的能量轉為電。','電網直接把低水庫變成汽油。','水輪機將電力轉成衣物。','發電機在水流到來前已由夜間管道造水。'],['水→turbine→generator→electricity。','無汽油。','產物是電。','順序錯。'],[5],'原文 water passes turbines→operate generator→electricity。'),
 transfer('圖中有 Power lines→National grid；Day 水往低水庫。','哪句分清兩條輸出路？',['電力沿線路進國家電網，用後水則排入低水位水庫。','水沿電線進電網，電力流入水庫。','兩者都送回高水庫。','發電站沒有任何輸出。'],['電與水的去向分開。','把兩路交換。','白天水到低水庫。','有兩條輸出。'],[6],'原文 power to grid，used water to low-level reservoir。'),
 transfer('夜間箭頭與日間箭頭相反。','哪句簡潔轉入夜間？',['到了夜晚，水流方向反過來。','到了夜晚，電網變成河流。','到了夜晚，水仍只向下流。','到了夜晚，水壩被拆掉。'],['反轉的是水流。','物件變化錯。','方向相反。','水壩仍在。'],[7],'原文 At night, direction of movement is reversed。'),
 transfer('夜間閘口關閉，下水庫水被泵回上水庫。','哪句保留控制與完整路徑？',['壩口關閉，下水庫的水經同一套水輪機和管道抽回上水庫。','壩口打開，下水庫水只向更低處流。','夜間電網直接變成水。','抽水只把水送到低水庫自身。'],['控制、方向、同一路徑均準。','夜閘關且上抽。','物理對象錯。','目的地是高水庫。'],[8],'原文 intake closed，lower→same turbine/conduit→upper。'),
 transfer('高水庫在夜間補水，翌日可重用。','哪句 This 指向前一步？',['夜間抽水回補高處的水，因此流程下一天可再開始。','This 指國家電網被拆除。','流程只運作一天，之後無水。','水憑空產生而不需回補。'],['This 回指低→高的抽水。','前句說水回補。','可每日循環。','水由低水庫抽回。'],[9],'原文 This restores supply，process begins following day。'),
];
const balancedTransferOptions=[
  ['發電站利用高低水庫之間的水流產生電力。','發電站利用高低水庫之間的水流決定電價。','發電站利用燃燒煤炭及汽油產生電力。','發電站完全沒有水流，只有電線輸送。'],
  ['日間水由高往低流發電，夜間再抽回高處。','日間水由高往低流，夜間仍只往低處流。','日間水抽回高處，夜間才由高往低流發電。','日間用完的水消失，夜間改用全新河水。'],
  ['水壩和水輪機是設備，電力送往國家電網。','水壩和國家電網是兩處用來蓄水的水庫。','水輪機只用來儲存標籤，並不參與發電。','電力由發電機產生後，直接注入河流水中。'],
  ['白天河水先蓄在水壩後方的高水位水庫。','白天河水先蓄在水壩前方的低水位水庫。','白天河水先蓄在國家電網內的高水位水庫。','白天河水先由夜間抽水泵送到飛機上。'],
  ['日間進水口打開，水經斜管往發電站流下。','夜間進水口關閉，水仍經斜管往下發電。','日間進水口打開，水沿電線往發電站流下。','日間進水口關閉，水無法往發電站流下。'],
  ['水流推動水輪機，繼而帶動發電機產電。','電網推動低水庫，繼而帶動發電機產油。','水流推動水輪機，繼而帶動工廠製衣。','發電機先產生水流，繼而推動水輪機。'],
  ['電力沿線路送往電網，用後水流進低水庫。','水流沿電線送往電網，電力流進低水庫。','電力與用後水都沿管道流回高水庫。','發電站沒有輸出，電與水均不離開。'],
  ['夜間開始時，水流的方向與日間相反。','夜間開始時，水流的方向與日間相同。','夜間開始時，電網變成另一條河流。','夜間開始時，發電站的水壩被拆除。'],
  ['夜間壩口關閉，低水庫水經設備抽回高水庫。','夜間壩口打開，低水庫水繼續往更低處流。','夜間壩口關閉，國家電網直接變成河水。','夜間壩口關閉，抽水只送回低水庫本身。'],
  ['夜間將水抽回高水庫，翌日便可重複流程。','夜間拆掉國家電網，翌日便可重複流程。','夜間水全部消失，翌日只能重新取新水。','夜間水憑空產生，翌日無須再抽水回補。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-process-diagram:6',meta:{topic:'水力發電站日間發電、夜間抽水回補',summary:'白天 intake 開，高水庫水沿管道推可逆水輪機／發電機，電往國家電網、水往低水庫；夜晚 intake 關，同一水經同套設備抽回上水庫，翌日再用。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

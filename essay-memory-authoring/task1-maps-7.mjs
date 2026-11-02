// Task 1 Maps 7: road access to City Hospital, 2007 and 2010.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先對照道路、巴士設施及兩種停車安排，再依範文次序選下一張。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The maps show the roads and other ways to get to a city hospital in 2007 and 2010.',
 'Overall, the area was changed a lot: two roundabouts and a bus station were added. The old car park for staff and the public became two separate car parks.',
 'But City Road, Hospital Road and the Ring Road stayed in the same places.',
 'In 2007, Hospital Road went north from City Road to the Ring Road around the hospital.',
 'Six small bus stops were along Hospital Road, with three on each side.',
 'One car park for staff and the public was east of Hospital Road, just south of the Ring Road.',
 'By 2010, the roads and ways into the hospital area were arranged more clearly.',
 'There was a new roundabout at each end of Hospital Road: one where it met City Road and one where it met the Ring Road.',
 'The six bus stops were gone. A bus station was on the west side, connected to both roundabouts.',
 'The car parks were also separated: staff used the area east of Hospital Road, and the public used a new car park east of the hospital with an entrance from the Ring Road.',
];
const vocabulary=[
 v(['compare','show','顯示／比較'],['road access','roads and other ways to get','道路通達'],['city hospital','city hospital','城市醫院']),
 v(['substantially reorganised','changed a lot','大幅重整'],['introduced','added','新增'],['original combined car park','old car park for staff and the public','原共用停車場'],['replaced by separate','became two separate','分成兩個']),
 v(['however','But','然而'],['remained in the same positions','stayed in the same places','位置不變'],['three main roads','City Road, Hospital Road and the Ring Road','三條主路']),
 v(['ran northwards','went north','向北延伸'],['surrounded the hospital','around the hospital','圍繞醫院'],['Ring Road','Ring Road','環路']),
 v(['placed along','were along','沿路設置'],['three on each side','three on each side','每側三個'],['Six small bus stops','Six small bus stops','六個小型巴士站']),
 v(['single car park','One car park','單一停車場'],['both staff and the public','staff and the public','員工與公眾共用'],['stood to the east','was east','位於東面'],['just below','just south of','正下／南面']),
 v(['traffic flow','roads and ways into the hospital area','交通流線'],['redesigned more systematically','arranged more clearly','更有系統地重整'],['By 2010','By 2010','到 2010 年']),
 v(['roundabout had been built at each end','new roundabout at each end','兩端各設迴旋處'],['junction with','where it met','交界'],['where it joined','where it met','連接處']),
 v(['bus stops had been removed','six bus stops were gone','巴士站撤走'],['replaced by','A bus station was','改為巴士總站'],['western side','west side','西側'],['access links','connected','連接道路']),
 v(['Parking was also separated','car parks were also separated','停車分開'],['staff car park','staff used','員工停車場'],['constructed east of the hospital','new car park east of the hospital','醫院東面新建'],['reached directly from','entrance from','直接進入']),
];
const structures=[
 f('The maps compare road access to a city library in 2010 and 2020.','引言界定同一公共設施兩年份的交通通達',[2,4,8],{formula:'The maps compare road access to [設施] in [早年] and [後年]',meaning:'兩圖比較 2007／2010 年通往 City Hospital 的道路及配套。',usage:'地圖呈現路網、巴士與停車，而非醫院病人數。',parts:[link('The maps compare road access to'),slot(' a city hospital','設施'),link(' in'),slot(' 2007','早年'),link(' and'),slot(' 2010.','後年')]}),
 f('Overall, the layout was substantially reorganised: three roundabouts and a bus terminal were introduced, and the original combined car park was replaced by separate staff and visitor parking facilities.','概覽三類主要交通安排：迴旋處、巴士、停車分流',[0,4,8],{formula:'Overall, the layout was substantially reorganised: [兩新路口] and [巴士設施] were introduced, and [舊停車] was replaced by [新停車安排]',meaning:'兩個迴旋處與西側巴士總站新增；原共用停車場分成員工／公眾兩處。',usage:'2007 年六個巴士站沒有整體消失成空地，而是改由 2010 年的巴士總站承接服務。',parts:[link('Overall, the layout was substantially reorganised:'),slot(' two roundabouts','兩新路口'),link(' and'),slot(' a bus station','巴士設施'),link(' were introduced, and'),slot(' the original combined car park','舊停車'),link(' was replaced by'),slot(' separate staff and public parking facilities.','新停車安排')]}),
 f('The four main roads, however, remained in the same positions.','在主要改建中指出道路骨架未移位',[1,5,8],{formula:'The [道路數] main roads, however, remained in the same positions',meaning:'City Road、Hospital Road、Ring Road 仍在相同大致位置；新增兩個交匯迴旋處。',usage:'道路位置不變不表示道路交界形式不變。',parts:[link('The'),slot(' three','道路數'),link(' main roads, however, remained in the same positions.')]}),
 f('In 2010, Hospital Road ran northwards from City Road to the Ring Road, which surrounded the hospital.','按南到北路徑定位醫院路與環路',[0,5,8],{formula:'In [年份], Hospital Road ran northwards from City Road to the Ring Road, which surrounded the hospital',meaning:'2007 年 Hospital Road 由南面 City Road 走向圍醫院的 Ring Road。',usage:'北向道路在 2010 年仍存在，當年另在兩端加迴旋處。',parts:[link('In'),slot(' 2007','年份'),link(', Hospital Road ran northwards from City Road to the Ring Road, which surrounded the hospital.')]}),
 f('Eight small bus stops were placed along Hospital Road, four on each side.','同路左右兩側等量巴士站的舊安排',[1,3,8],{formula:'[總數] small bus stops were placed along Hospital Road, [每側數] on each side',meaning:'2007 年 Hospital Road 左右各三個巴士站，合共六個。',usage:'six=3+3；不要把 2010 年的單一巴士總站誤當仍有六個路邊站。',parts:[slot('Six','總數'),link(' small bus stops were placed along Hospital Road,'),slot(' three','每側數'),link(' on each side.')]}),
 f('A single car park for both doctors and visitors stood to the east of this road, just below the Ring Road.','定位舊共用停車場並指出兩群使用者',[0,4,8],{formula:'A single car park for both [使用者甲] and [使用者乙] stood to the east of this road, just below the Ring Road',meaning:'2007 年單一共用停車場在 Hospital Road 東側、Ring Road 以南。',usage:'舊共用停車場不同於 2010 年醫院東面的新公眾停車場。',parts:[link('A single car park for both'),slot(' staff','使用者甲'),link(' and'),slot(' the public','使用者乙'),link(' stood to the east of this road, just below the Ring Road.')]}),
 f('By 2020, traffic flow had been redesigned more systematically.','用過去完成式概括後一年已完成的交通改組',[1,4,8],{formula:'By [後年], traffic flow had been redesigned more systematically',meaning:'2010 年兩迴旋處、巴士總站和分開停車使路線更明確。',usage:'這是地圖支持的佈局概括；圖中沒有交通流量或車速數據。',parts:[link('By'),slot(' 2010','後年'),link(', traffic flow had been redesigned more systematically.')]}),
 f('A roundabout had been built at each end of Station Road, one at its junction with Main Street and the other where it joined the Ring Road.','指出兩個新迴旋處各在醫院路的南北端',[0,4,9],{formula:'A roundabout had been built at each end of [中間道路], one at its junction with [南路] and the other where it joined [北路]',meaning:'南端 Hospital Road／City Road 交界一個；北端 Hospital Road／Ring Road 交界一個。',usage:'兩個迴旋處不是都在南面 City Road，亦非醫院東面停車場的入口。',parts:[link('A roundabout had been built at each end of'),slot(' Hospital Road','中間道路'),link(', one at its junction with'),slot(' City Road','南路'),link(' and the other where it joined'),slot(' the Ring Road.','北路')]}),
 f('The bus stops had been removed and replaced by a bus station on the eastern side, with access links to both roundabouts.','舊巴士站改為單一巴士總站，連接兩迴旋處',[1,5,7],{formula:'The bus stops had been removed and replaced by a bus station on the [方向] side, with access links to both roundabouts',meaning:'2010 年路邊六站撤去，西側新巴士總站有路線連接南北兩迴旋處。',usage:'巴士總站在 Hospital Road 西面，不是東側員工停車場位置。',parts:[link('The bus stops had been removed and replaced by a bus station on the'),slot(' western','方向'),link(' side, with access links to both roundabouts.')]}),
 f('Parking was also separated: the staff car park occupied the area west of Hospital Road, while a new public car park was constructed east of the hospital, reached directly from the Ring Road.','同時定位員工停車區、公眾新停車區及後者入口',[0,4,8],{formula:'Parking was also separated: the staff car park occupied the area [方向] of Hospital Road, while a new public car park was constructed east of the hospital, reached directly from the Ring Road',meaning:'2010 年員工停車在 Hospital Road 東側原共用區；公眾新停車在醫院東側，由 Ring Road 直接到達。',usage:'公眾新停車場不是靠 Hospital Road 的原共用區，也不是從 City Road 直接進入。',parts:[link('Parking was also separated: the staff car park occupied the area'),slot(' east','方向'),link(' of Hospital Road, while a new public car park was constructed east of the hospital, reached directly from the Ring Road.')]}),
];
const intro=[
 quiz('兩張地圖比較甚麼？',['同一城市醫院 2007／2010 年的道路、巴士和停車安排','兩所醫院不同年的病人數','醫院建築物的樓層','每年的道路交通量'],'地圖標 City Hospital 2007、City Hospital 2010，重點是通達和設施位置。'),
 {type:'multi',prompt:'哪兩項最適合放入概覽？',detail:'選兩項，再按「確認」。',options:[
  '2010 年兩個新迴旋處及西側巴士總站取代原分散巴士站',
  '原共用停車場分成員工／公眾兩處，三條主要道路大致仍在原位',
  'City Road、Hospital Road、Ring Road 全部被拆除',
  '2007 年已有兩個迴旋處和東面公眾新停車場',
 ],correct:[0,1],why:'概覽同時呈現交通改組、停車分流與保留的道路骨架。'},
];
const route=[sequence('依範文次序，排好四段的醫院通達報告工作',[
 ['地圖介紹','交代 City Hospital 2007／2010 年道路通達。'],
 ['整體概覽','兩迴旋處和巴士總站新增，停車分流，三主路位置未大變。'],
 ['2007 年配置','Hospital Road 向北接 Ring Road，左右各三站，東側單一共用停車場。'],
 ['2010 年配置','兩路口改迴旋處；西側巴士總站接兩端；員工仍在東側原區、公眾新場在醫院東側。'],
],'沿 Hospital Road 從南到北讀，並區分路西巴士與路東停車。')];
const evidence=[
 quiz('2007 年哪三條主要道路構成骨架？',['City Road、Hospital Road、Ring Road','Bus Road、Staff Road、Public Road','兩個迴旋處和巴士站','醫院屋內三條走廊'],'Hospital Road 從 City Road 向北連到繞醫院的 Ring Road。'),
 quiz('2007 年 Hospital Road 兩旁巴士站如何分布？',['左右各三個，共六個','西側六個，東側零個','左右各一個，共兩個','一個大型巴士總站'],'舊圖左三、右三，共六個小站。'),
 quiz('2007 年共用停車場在哪裏？',['Hospital Road 東面、Ring Road 下方','Hospital Road 西面巴士總站位置','醫院東面 Ring Road 外側','City Road 南面'],'舊圖右側標 Car park staff and public。'),
 quiz('2010 年兩個迴旋處在哪兩處？',['Hospital Road 與 City Road／Ring Road 的南北交界','兩者都在醫院東面','兩者都在巴士總站內','一個在醫院屋頂'],'南端接 City Road，北端接 Ring Road。'),
 quiz('2010 年巴士總站在哪裏，如何連接？',['Hospital Road 西側，連接兩個迴旋處','醫院東面，直通公眾停車場','舊六站完全原樣','Ring Road 北面外側'],'新 Bus station 在路西，以支路連接兩個 roundabouts。'),
 quiz('2010 年員工與公眾停車場分別在哪裏？',['員工在 Hospital Road 東側；公眾在醫院東面','員工在醫院東面；公眾在 Hospital Road 西側','兩者仍在同一舊停車場','兩者都在 City Road 南側'],'員工留原東側區，公眾新場在醫院與 Ring Road 東側。'),
 quiz('公眾新停車場由哪條路直接到達？',['Ring Road','City Road','Hospital Road 西側巴士總站路','醫院屋內走廊'],'2010 年圖的新 Public car park 接 Ring Road 東側。'),
];
const logic=[
 sequence('2007 年：先沿道路由南向北讀',[
  ['南面','City Road 橫向經過，Hospital Road 自此往北。'],
  ['Hospital Road','左右兩側各三個小巴士站。'],
  ['路東','員工與公眾共用一個停車場，位於 Ring Road 下方。'],
  ['北面','Hospital Road 接圍繞醫院的 Ring Road。'],
 ],'先確定路西／路東和南／北，才不會把後來的新設施放到舊圖。'),
 sequence('2010 年：逐項核對重新安排',[
  ['路口','Hospital Road 南北兩端各增一個迴旋處。'],
  ['巴士','六個路邊站撤走；西側巴士總站連兩迴旋處。'],
  ['員工停車','在 Hospital Road 東側原共用區。'],
  ['公眾停車','新場在醫院東側，直接由 Ring Road 進入；三主路骨架仍在。'],
 ],'「分開停車」要指出兩個不同位置與新公眾停車場的入口。'),
];
const transfers=[
 transfer('兩張圖比較某醫院 2008 與 2012 年的道路、巴士與停車安排。','哪句引言界定通達而非病人數？',['地圖比較 2008 和 2012 年通往該醫院的道路通達。','地圖比較兩年住院病人的年齡。','地圖顯示每年巴士乘客總數。','地圖解釋病房擴建的原因。'],['地點與兩年份、交通通達準確。','地圖不是病人統計。','沒有乘客數。','沒有原因資料。'],[0],'原文 maps compare road access to city hospital in 2007 and 2010。'),
 transfer('後年新增兩迴旋處與巴士總站，共用停車場分成員工與公眾兩處。','哪句概覽把三類改動都說全？',['佈局重新規劃：新增兩迴旋處和巴士總站，停車場改為員工及公眾分開。','只增加一個路邊巴士站，其他不變。','共用停車場擴建但仍所有人共用。','兩個迴旋處在早年已經存在。'],['新路口、巴士、停車分流全部準確。','重大改動被漏掉。','停車已分開。','迴旋處屬後年。'],[1],'原文概覽兩迴旋處／巴士總站／分開停車。'),
 transfer('兩年 City Road、Hospital Road、Ring Road 大致位置相同，只交界設施改變。','哪句不把位置不變誤寫成沒有改建？',['三條主要道路仍在原位，但交界處增設了迴旋處。','三條道路全都被移到醫院東邊。','道路位置不變代表巴士站與停車場亦全不變。','Hospital Road 在後年已消失。'],['道路骨架保留與路口更新可共存。','三主路未移。','配套有改動。','Hospital Road 仍在。'],[2],'原文三條主要道路 remained in same positions。'),
 transfer('早年 Hospital Road 從南面 City Road 往北接圍醫院的 Ring Road。','哪句沿正確方向描述？',['Hospital Road 由 City Road 向北通到環繞醫院的 Ring Road。','Hospital Road 從北面往南通向海港。','City Road 圍繞醫院，Ring Road 在南面。','三條道路沒有相接。'],['南北路徑與環路關係準確。','海港不存在。','兩道路角色對調。','Hospital Road 接兩路。'],[3],'原文 2007 年 Hospital Road 北接 Ring Road、南接 City Road。'),
 transfer('早年沿 Hospital Road 左右各四個小巴士站。','哪句正確合計並定位？',['道路兩側各四站，總共八個。','左側八站，右側沒有。','兩側各八站，總共八個。','只有一座巴士總站。'],['4+4=8，位置在兩側。','左右分布不符。','各八總共十六。','總站屬後年。'],[4],'原文 2007 年左右各三站，共六站。'),
 transfer('早年單一共用停車場在 Hospital Road 東邊、Ring Road 下方。','哪句沒有混成後年的公眾新停車場？',['員工與公眾共用一個在醫院路東側的停車場。','員工在路西、公眾在醫院東面分開停車。','共用場在巴士總站西側。','早年已有兩個獨立公眾停車場。'],['早年一場共用，位置在路東。','後年才分流。','舊場在路東。','早年只有一場。'],[5],'原文 2007 年 single car park for staff and public east of Hospital Road。'),
 transfer('後年兩個迴旋處、巴士總站與停車分流令交通安排更清楚；圖無車速數字。','哪句概括不臆測成效？',['到後年，通道佈局已更有系統地重整。','到後年，平均車速確定翻倍。','巴士乘客量已增加三倍。','醫院病人數因此下降。'],['地圖可支持佈局重整，不能量化車速或乘客。','沒有車速資料。','沒有乘客量。','沒有病人數。'],[6],'原文 traffic flow redesigned more systematically 是空間佈局概括。'),
 transfer('後年 Hospital Road 南接 City Road、北接 Ring Road 的兩端各有一個新迴旋處。','哪句精確定位兩路口？',['南端 City Road 交界一個，北端 Ring Road 交界一個。','兩個都在醫院東面的公眾停車場入口。','兩個都在南端 City Road。','早年已有相同兩迴旋處。'],['每端一個且連接路名正確。','公眾停車另在東。','北端也有。','早年無迴旋處。'],[7],'原文 2010 年 Hospital Road 兩端各建 roundabout。'),
 transfer('後年六個路邊站撤去，路西設巴士總站並接兩迴旋處。','哪句保留巴士設施的新舊替換？',['舊站改由西側巴士總站承接，並連接兩個迴旋處。','六個舊站仍原樣，總站建在路東。','巴士總站建於醫院屋頂。','後年完全沒有任何巴士設施。'],['巴士服務形式與位置變了，但並未消失。','舊站撤走，總站在西。','總站在路旁。','有新總站。'],[8],'原文 six stops removed→bus station western side, links to both roundabouts。'),
 transfer('後年員工停車在 Hospital Road 東側原區，公眾新場在醫院東面，入口接 Ring Road。','哪句同時配準兩處及公眾入口？',['員工在醫院路東側停車，公眾在醫院東面的新場，後者由 Ring Road 直接到達。','員工與公眾仍共用同一舊場。','公眾新場在 Hospital Road 西側巴士站旁。','公眾新場只可由 City Road 直接進入。'],['使用者、兩地及 Ring Road 入口均正確。','後年分流。','路西是巴士總站。','直接入口是 Ring Road。'],[9],'原文 staff east of Hospital Road；public east of hospital directly from Ring Road。'),
];
export default {key:'task1-maps:7',meta:{topic:'City Hospital 2007 與 2010 年的道路通達',summary:'三條主路大致保留；六個路邊巴士站改西側總站，醫院路南北兩端各增迴旋處，共用停車場分員工與醫院東面公眾新場。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

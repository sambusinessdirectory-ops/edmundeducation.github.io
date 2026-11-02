// Task 1 Maps 9: Grange Park in 1920 and today.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先用兩個主入口定位，再對照園內各區的前後用途。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows;
const slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The two plans show Grange Park when it opened in 1920 and how it looks today.',
 'Overall, the park now has more modern places for visitors, including an outdoor theatre, a café, a play area for children and parking under the ground.',
 'The two main entrances from Arnold Avenue and Eldon Street are still there. Rose gardens are still part of the park, but there are fewer of them and their positions have changed.',
 'In 1920, the park had a carefully planned, regular arrangement.',
 'A fountain was in the middle, and a place for musicians was on the west side.',
 'There were three rose gardens, in the northwest, northeast and southwest. Seats stood around the park’s sides.',
 'On the east side, a pond for water plants was in the northeast, and a glasshouse was in the southeast.',
 'Today, a square rose garden takes the place of the middle fountain. It has seats on all four sides.',
 'The old music stage has been replaced by a bigger outdoor theatre for concerts.',
 'On the east side, the old pond and glasshouse are gone. There are now a café, a children’s play area and a water feature in that part of the park.',
 'There is also a new way into the underground car park from the southeast.',
];
const vocabulary=[
 v(['illustrate','show','展示'],['layout','how it looks','佈局'],['when it opened','when it opened','首次開放時'],['arrangement today','how it looks today','現今安排']),
 v(['substantially modernised','more modern places for visitors','大幅現代化'],['recreational facilities','places for visitors','休閒設施'],['amphitheatre','outdoor theatre','露天劇場'],['children’s play area','play area for children','兒童遊樂區'],['underground parking','parking under the ground','地下停車']),
 v(['However','but','然而'],['main entrances','main entrances','主要入口'],['retained','still there','保留'],['rose gardens remain important','Rose gardens are still part of the park','玫瑰園仍在'],['reduced and reorganised','fewer of them and their positions have changed','減少並重排']),
 v(['formal layout','carefully planned, regular arrangement','正式佈局'],['In 1920','In 1920','1920 年']),
 v(['stood at its centre','was in the middle','位於中央'],['stage for musicians','place for musicians','音樂家舞台'],['occupied the western side','was on the west side','位於西側']),
 v(['were located','There were','設有'],['northwest','northwest','西北'],['northeast','northeast','東北'],['southwest','southwest','西南'],['seating was distributed around the edges','Seats stood around the park’s sides','座位沿邊緣']),
 v(['eastern half','east side','東半部'],['contained','was','設有'],['pond for water plants','pond for water plants','水生植物池'],['glasshouse','glasshouse','玻璃溫室']),
 v(['central fountain','middle fountain','中央噴泉'],['replaced by','takes the place of','被取代'],['square rose garden','square rose garden','方形玫瑰園'],['surrounded by seats on all four sides','has seats on all four sides','四邊有座位']),
 v(['former musicians’ stage','old music stage','舊音樂家舞台'],['given way to','replaced by','被取代'],['larger amphitheatre','bigger outdoor theatre','較大露天劇場']),
 v(['eastern side','east side','東側'],['disappeared','gone','消失'],['in their place','now','取而代之'],['water feature','water feature','水景']),
 v(['new entrance','new way into','新入口'],['underground car park','underground car park','地下停車場'],['introduced from the southeast','from the southeast','從東南新增']),
];
const structures=[
 f('The two plans illustrate the layout of Riverside Park when it opened in 1930 and its arrangement today.','引言界定同一公園開園當年與今天',[2,4,8],{formula:'The two plans illustrate the layout of [公園] when it opened in [開園年] and its arrangement today',meaning:'兩圖比較 Grange Park 1920 年開園時與今天的佈局。',usage:'同一公園兩時點；今日新增地下停車場，不代表 1920 年已有。',parts:[link('The two plans illustrate the layout of'),slot(' Grange Park','公園'),link(' when it opened in'),slot(' 1920','開園年'),link(' and its arrangement today.')]}),
 f('Overall, the park has been substantially modernised, with recreational facilities such as an outdoor cinema, kiosk, children’s games area and bicycle parking added.','概覽四項今日新增的訪客休閒與交通設施',[0,3,7],{formula:'Overall, the park has been substantially modernised, with recreational facilities such as [新增設施組] added',meaning:'今日有露天劇場、咖啡館、兒童遊樂區及地下停車場入口。',usage:'四項是今天圖的新功能；1920 年有音樂舞台，但不是今日的大型露天劇場。',parts:[link('Overall, the park has been substantially modernised, with recreational facilities such as'),slot(' an amphitheatre, café, children’s play area and underground parking','新增設施組'),link(' added.')]}),
 f('However, the two main entrances on North Avenue and South Street have been retained, and rose gardens remain important, although they have been reduced and reorganised.','概覽固定入口與玫瑰園數量／位置的變化',[1,5,8],{formula:'However, the two main entrances on [北面街] and [南面街] have been retained, and rose gardens remain important, although they have been reduced and reorganised',meaning:'Arnold Avenue 北入口、Eldon Street 南入口未變；玫瑰園由西北、東北、西南三處變成西北與中央兩處。',usage:'西北玫瑰園保留，中央玫瑰園取代噴泉；東北和西南原玫瑰園不再在原位。',parts:[link('However, the two main entrances on'),slot(' Arnold Avenue','北面街'),link(' and'),slot(' Eldon Street','南面街'),link(' have been retained, and rose gardens remain important, although they have been reduced and reorganised.')]}),
 f('In 1930, the park had a formal layout.','簡短概括過去年公園的規整佈局，導入舊圖細節',[0,5,8],{formula:'In [過去年], the park had a formal layout',meaning:'1920 年公園以中央噴泉、邊緣玫瑰園及座位形成規整配置。',usage:'formal 是空間安排的概括，須由後續具體地標支持。',parts:[link('In'),slot(' 1920','過去年'),link(', the park had a formal layout.')]}),
 f('A fountain stood at its centre, while a bandstand occupied the western side.','同時定位舊圖中央噴泉與西側音樂舞台',[1,3,8],{formula:'A [中央設施] stood at its centre, while a [西側設施] occupied the western side',meaning:'1920 年噴泉在公園中央，音樂家舞台在西側。',usage:'今日中央噴泉已被玫瑰園替代；西側舞台變較大露天劇場。',parts:[link('A'),slot(' fountain','中央設施'),link(' stood at its centre, while a'),slot(' stage for musicians','西側設施'),link(' occupied the western side.')]}),
 f('Three flower beds were located in the northwest, northeast and southwest corners, and seating was distributed around the edges.','按三個角落定位舊玫瑰園，再概括邊緣座位',[0,4,9],{formula:'[數量與設施] were located in the northwest, northeast and southwest corners, and seating was distributed around the edges',meaning:'舊圖三個玫瑰園在西北、東北、西南；座位散布公園邊緣。',usage:'今日玫瑰園只見西北與中央，座位改圍中央方形花園。',parts:[slot('Three rose gardens','數量與設施'),link(' were located in the northwest, northeast and southwest corners, and seating was distributed around the edges.')]}),
 f('The eastern half contained a pond for water plants in the northeast and a greenhouse in the southeast.','舊圖東側北池南溫室的縱向定位',[1,4,8],{formula:'The eastern half contained [東北設施] in the northeast and [東南設施] in the southeast',meaning:'1920 年東北是水生植物池、東南是玻璃溫室。',usage:'今天東側改設咖啡、兒童遊樂及水景；不要把新水景當成原池塘未變。',parts:[link('The eastern half contained'),slot(' a pond for water plants','東北設施'),link(' in the northeast and'),slot(' a glasshouse','東南設施'),link(' in the southeast.')]}),
 f('Today, the central statue has been replaced by a square rose garden, surrounded by seats on all four sides.','交代中央舊設施被新方形玫瑰園取代並四面設座',[1,5,9],{formula:'Today, the central [舊設施] has been replaced by a square rose garden, surrounded by seats on all four sides',meaning:'今日中央方形玫瑰園位於原噴泉位置，東西南北四面有座位。',usage:'今日中央玫瑰園是新增位置；不能以此說舊中央噴泉仍在。',parts:[link('Today, the central'),slot(' fountain','舊設施'),link(' has been replaced by a square rose garden, surrounded by seats on all four sides.')]}),
 f('The former bandstand has given way to a larger amphitheatre for concerts.','對照西側舊音樂舞台與今日更大的演出場地',[0,4,7],{formula:'The former [舊演出設施] has given way to a larger amphitheatre for concerts',meaning:'西側舊音樂家舞台現為更大型的露天音樂會劇場。',usage:'兩者都與表演有關，但設施及規模不同；不能說舊舞台完全原樣保留。',parts:[link('The former'),slot(' musicians’ stage','舊演出設施'),link(' has given way to a larger amphitheatre for concerts.')]}),
 f('On the eastern side, the old pond and greenhouse have disappeared; in their place are a café, a children’s play area and a water feature.','概括東側舊水池／溫室消失與三項今日用途',[1,5,8],{formula:'On the eastern side, [舊東側設施] have disappeared; in their place are [新東側設施]',meaning:'舊東北池、東南溫室不再；今日東側有咖啡、兒童遊樂、水景。',usage:'in their place 概括整個東側變更，不宜臆斷 café 精確建在舊池的同一塊地。',parts:[link('On the eastern side,'),slot(' the old pond and glasshouse','舊東側設施'),link(' have disappeared; in their place are'),slot(' a café, a children’s play area and a water feature.','新東側設施')]}),
 f('A new entrance to an underground car park has also been introduced from the southwest.','區分新增地下停車入口與兩個原有主入口',[0,4,8],{formula:'A new entrance to an underground car park has also been introduced from [方向]',meaning:'東南邊界另有地下停車場入口；原 Arnold/Eldon 兩主入口仍在。',usage:'新入口在東南，不是西南；不要說它取代原兩個公園入口。',parts:[link('A new entrance to an underground car park has also been introduced from'),slot(' the southeast.','方向')]}),
];
const intro=[
 quiz('兩張圖的時點與地點是甚麼？',['同一 Grange Park 在 1920 年開園時與今天','兩個不同公園在 1920 年','公園 1920 年與 1930 年的人數','兩片不同城市的玫瑰園'],'圖題是 Grange Park (1920) 與 Grange Park (today)。'),
 {type:'multi',prompt:'哪兩項最適合放入概覽？',detail:'選兩項，再按「確認」。',options:[
  '新增露天劇場、咖啡、兒童遊樂與地下停車，公園更適合多種休閒活動',
  'Arnold Avenue 與 Eldon Street 兩主入口保留；玫瑰園仍在，但由三處改為兩處並重排',
  '兩個原有主入口已被地下停車場入口完全取代',
  '1920 年的中央噴泉今日仍完全原樣',
 ],correct:[0,1],why:'概覽須平衡現代化與保留地標，並說清玫瑰園數量與位置的變化。'},
];
const route=[sequence('依範文次序，排好四段的公園地圖報告工作',[
 ['平面圖介紹','交代 Grange Park 1920 年開園與今天。'],
 ['整體概覽','設施現代化，兩主入口仍在，玫瑰園數量減少並重排。'],
 ['1920 年佈局','中央噴泉、西側音樂舞台、三角落玫瑰園、東北池與東南溫室。'],
 ['今日佈局','中央方形玫瑰園／四面座位、西側露天劇場、東側咖啡遊樂水景、東南地下停車入口。'],
],'用兩個固定入口定位，再依中央、西側、東側和東南逐項比較。')];
const evidence=[
 quiz('哪兩個主入口在兩圖都保留？',['北面 Arnold Avenue 與南面 Eldon Street','東西兩側的地下停車入口','西面音樂舞台與東面溫室','兩處新咖啡館入口'],'兩圖都在頂部與底部中央標 Entrance。'),
 quiz('1920 年中央與西側分別是甚麼？',['中央噴泉、西側音樂舞台','中央玫瑰園、西側露天劇場','中央咖啡、西側地下停車','中央溫室、西側池塘'],'舊圖中央 Fountain，左側 Stage for musicians。'),
 quiz('1920 年三個玫瑰園在哪些角落？',['西北、東北、西南','西北、東南、西南','東北、東南、中央','只在中央'],'舊圖兩個沿北邊、一個在左下。'),
 quiz('1920 年東側水生植物池與溫室各在哪裏？',['池在東北、溫室在東南','池在東南、溫室在東北','兩者都在西側','兩者都在中央'],'舊圖 Pond for water plants 在右上，Glasshouse 在右下。'),
 quiz('今日中央噴泉變成甚麼？',['四邊有座位的方形玫瑰園','兒童遊樂場','咖啡館','地下停車入口'],'新圖中央 Rose garden 為方形，四側 Seats。'),
 quiz('今日西側音樂舞台變成甚麼？',['較大的露天音樂會劇場','水生植物池','玻璃溫室','新 Arnold Avenue 入口'],'新圖西側標 Amphitheatre for concerts。'),
 quiz('今日東側有哪三項新用途？',['咖啡館、兒童遊樂區和水景','三個新玫瑰園','舊池和溫室原樣','音樂舞台、噴泉和倉庫'],'今日圖東側標 Café、Children’s play area、Water feature。'),
 quiz('新地下停車場入口位於哪裏？',['東南邊界','西北 Arnold Avenue 旁','公園中央玫瑰園裏','舊音樂舞台原址'],'今日圖右下東南方標 Entrance underground car park。'),
];
const logic=[
 sequence('把 1920 年的地標按方位固定',[
  ['北／南入口','Arnold Avenue 北口、Eldon Street 南口。'],
  ['中央與西側','中央噴泉；西側音樂家舞台。'],
  ['玫瑰園','西北、東北、西南共三處；座位在邊緣。'],
  ['東側','東北水生植物池、東南玻璃溫室。'],
 ],'入口兩圖均在相同位置，可作前後地圖的錨點。'),
 sequence('把今日設施對回舊圖',[
  ['中央','噴泉→方形玫瑰園，四面座位；原西北玫瑰園仍在。'],
  ['西側','音樂家舞台→更大的露天音樂會劇場。'],
  ['東側','舊池、溫室不見；有咖啡館、遊樂區、水景。'],
  ['東南','新增地下停車場入口；原北／南兩主入口仍保留。'],
 ],'分清直接替代與東側整體重新安排；不要臆定每一新設施正好佔哪個舊設施原址。'),
];
const transfers=[
 transfer('兩圖比較同一公園 1930 年開園時與今天。','哪句引言正確界定同地點兩時點？',['兩張平面圖展示該公園 1930 年開放時與現今的佈局。','兩圖比較兩個不同公園在同一年的人流。','圖表顯示公園門票價格。','圖表解釋公園改建原因。'],['同一公園、開園年與今日、佈局均明確。','不是兩公園。','圖中沒有價格。','沒有原因資料。'],[0],'原文 Grange Park 1920 年開園與今日。'),
 transfer('公園今日增大型表演場、咖啡、兒童遊樂及地下停車。','哪句概覽合理？',['公園增加多種現代休閒與訪客服務設施。','公園只保留舊設施，完全沒有新增。','所有新設施都在 1920 年已存在。','公園已改成純工業區。'],['四類新用途支持現代化概括。','今日有多項新增。','新設施屬今日。','仍是公園。'],[1],'原文概覽現代化並新增劇場、咖啡、遊樂區、地下停車。'),
 transfer('北南兩入口仍在；玫瑰園由三處變兩處，位置有重排。','哪句把保留與變化都說準？',['兩主入口保留，玫瑰園仍在但數量減少並改位置。','兩入口都已被拆除，玫瑰園也全消失。','三個舊玫瑰園今日都完全原樣。','玫瑰園今日增加至五處。'],['兩種狀態可同時成立。','入口及花園仍在。','舊東北、西南花園不在原位。','今日兩處。'],[2],'原文入口 retained，rose gardens reduced and reorganised。'),
 transfer('舊圖以中央噴泉、角落花園和沿邊座位構成規整佈局。','哪句可作舊圖的概括後再寫證據？',['1920 年公園有較正式、規整的佈局。','1920 年所有設施都完全隨機散置。','今日仍有中央噴泉。','舊圖只有地下停車場。'],['規整概括可由噴泉、花園和座位位置支持。','地標位置有安排。','今日噴泉已取代。','停車場入口屬今日。'],[3],'原文 In 1920, the park had a formal layout。'),
 transfer('舊圖中央噴泉、西側音樂舞台。','哪句不把兩位置對調？',['噴泉位於中央，而音樂家舞台在西側。','舞台位於中央，噴泉在西側。','兩者都在東南。','兩者今日仍原樣。'],['中央與西側分配正確。','位置對調。','不在東南。','兩者今日被新設施取代。'],[4],'原文 fountain 中央、stage for musicians 西側。'),
 transfer('舊圖玫瑰園在西北、東北、西南，邊緣散布座位。','哪句列全三角落與座位？',['三個玫瑰園在西北、東北和西南，座位沿公園邊緣分布。','三個玫瑰園都在東南。','玫瑰園只在中央，座位全部消失。','三園在北、南、東三個入口外。'],['三處方位與座位位置俱準確。','方位不符。','舊中央是噴泉。','入口只有北南兩處。'],[5],'原文三玫瑰園 northwest/northeast/southwest，seating around edges。'),
 transfer('舊圖東北是水生植物池，東南是玻璃溫室。','哪句東側南北配對正確？',['東側北端有水生植物池，南端有玻璃溫室。','東北是溫室，東南是池。','兩者都在西部。','舊圖東側只有咖啡館。'],['東北池、東南溫室。','南北顛倒。','兩者在東。','咖啡館屬今日。'],[6],'原文 1920 年東北 pond、東南 glasshouse。'),
 transfer('今日中央噴泉位置成方形玫瑰園，四側都有座位。','哪句保留同址替代與四面座位？',['中央噴泉被方形玫瑰園取代，四邊都設座位。','中央噴泉與花園兩者今日並排保留。','方形花園只有東側有座位。','花園搬到地下停車入口。'],['同一中央位置的替代與座位完整。','噴泉不再在圖中。','四面都有。','花園在中央。'],[7],'原文中央 fountain→square rose garden，四面 seats。'),
 transfer('西側舊音樂舞台今日改為更大的露天劇場。','哪句表達用途相近但設施更替？',['原音樂舞台讓位於較大的露天音樂會劇場。','舊舞台完全原樣，今日沒有表演設施。','露天劇場改為舊音樂舞台。','劇場在東南舊溫室位置。'],['兩設施都供表演，但今日更大且非舊舞台原樣。','設施已改。','更替方向反了。','劇場在西側。'],[8],'原文 former stage→larger amphitheatre for concerts。'),
 transfer('舊東北池與東南溫室不見；今日東側有咖啡、遊樂與水景，但未標每項精確佔舊址。','哪句不臆造一對一取代？',['東側舊池和溫室消失，該區現有咖啡、兒童遊樂與水景。','咖啡館必定正好建在舊池原來每一寸地上。','舊池和溫室都完全保留。','今日東側只剩停車場。'],['忠實說東側整體變化，不假定精確地塊對應。','地圖不能支持精確同址。','舊設施消失。','有三項新用途。'],[9],'原文 east side 舊 pond／glasshouse 消失，新 café／play area／water feature。'),
 transfer('今日東南另外新增地下停車場入口，原北南主入口仍在。','哪句區分新增與保留？',['東南新設地下停車入口，北南兩個原有公園入口仍保留。','地下停車入口取代北南兩主入口。','東南停車入口 1920 年已有。','三個入口都只在西北。'],['新入口與兩個保留入口各自定位。','兩主入口未消失。','停車場屬今日。','新入口在東南。'],[10],'原文新增 underground car park entrance from southeast。'),
];
export default {key:'task1-maps:9',meta:{topic:'Grange Park 1920 年與今天的佈局',summary:'兩主入口保留；三舊玫瑰園變為西北與中央兩處。中央噴泉換方形花園、西舞台換劇場、東側水池／溫室改多種休閒用途，東南新增地下停車入口。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

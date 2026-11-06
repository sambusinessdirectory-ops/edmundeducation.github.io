// The supplied SHOW teaching material, with reviewed, sentence-specific option sets.
const entry=(id,title,form,en,zh,note,options,examples)=>({id,title,form,en,zh,note,options,examples});
export const showModule={id:'show',version:1,word:'show',forms:'show · showed · shown / showed · showing',intro:'One word, many ways to make meaning visible.',introZh:'從畫面、證據到表現：在語境中理解同一個字。',senses:[
entry('depict','在畫面中呈現','show · verb','To depict people, objects or situations in a picture, film or advertisement.','透過畫面把人物、物件或情境呈現給觀眾看。','重點是畫面中的內容；不是把物件遞給某人看。',['depict','present','guide','demonstrate','express','visible'],[
['The ad showed ordinary people in stressful places.','那則廣告呈現了身處壓力環境中的普通人。','呈現了'],
['The photograph shows a family sitting around a table.','這張照片呈現了一家人圍著桌子坐著的畫面。','呈現了'],
['The documentary showed how people lived during the crisis.','這部紀錄片呈現了危機期間人們的生活情況。','呈現了']]),
entry('present','把物件給某人看','show someone something · verb','To let someone see an object or information directly.','讓某人親眼看到某物；把某物拿給某人看。','常見句式：show someone something / show something to someone。',['present','guide','demonstrate','evidence','express','visible'],[
['Please show me your ID.','請把你的身分證給我看。','給我看'],['She showed the manager the damaged equipment.','她把損壞的設備展示給經理看。','展示給經理看']]),
entry('guide','帶領或指引前往','show someone to a place · verb','To guide someone to a place or indicate the way.','指引某人前往某地，或帶某人到某處。','例如 show us to our seats。單獨的 show you a place 也可能只是把地方指給你看；要看上下文。',['guide','depict','evidence','express','visible','screen'],[
["I’ll show you the way to the meeting room.",'我會指引你前往會議室。','指引你前往'],['The receptionist showed us to our seats.','接待員帶我們到座位。','帶我們到']]),
entry('demonstrate','示範或說明方法','show how / where · verb','To demonstrate or explain how something is done or where something can be found.','透過示範或說明，讓別人知道怎樣做或在哪裡。','show how 著重示範；show where 著重指出位置。某些句子也涉及引路，不把這些重疊意思當作互斥答案。',['demonstrate','depict','evidence','express','visible','screen'],[
['Can you show me how this machine works?','你可以示範並說明這部機器怎樣操作嗎？','示範並說明'],['The trainer showed us where to find the emergency exit.','導師指出並說明了緊急出口的位置。','指出並說明了']]),
entry('evidence','證據表明某事','evidence / results show · verb','For evidence or results to indicate that something is true or likely.','證據、數據或結果表明某件事情屬實或可能屬實。','重點是根據資料得出的結論。與圖表顯示資料的用法可能重疊。',['evidence','present','guide','demonstrate','express','screen'],[
['The results show that sales have increased.','結果顯示銷售額有所增加。','顯示'],['The evidence shows that the system failed.','證據表明系統曾經失靈。','表明']]),
entry('display','顯示或列明資料','screen / document shows · verb','For a screen, sign or document to display information.','螢幕、文件或標誌把特定資料顯示出來。','screen shows 25°C 著重顯示資料；results show that… 著重資料支持的結論。',['display','present','guide','demonstrate','express','screen'],[
['The screen shows the current temperature.','螢幕顯示目前的溫度。','顯示'],['The ticket shows the departure time.','車票上列明了出發時間。','列明了']]),
entry('express','流露情緒或態度','show emotion / attitude · verb','To make a feeling, attitude or quality visible through behaviour.','透過表情、言語或行為，把內在情緒、態度或特質表現出來。','show patience / show disappointment。與展現品質的用法重疊，不用兩個近義標籤刁難學生。',['express','depict','present','guide','demonstrate','screen'],[
['She showed great patience with the customer.','她對顧客表現出很大的耐性。','表現出'],['He tried not to show his disappointment.','他盡量不流露自己的失望情緒。','流露']]),
entry('ability','展現能力或品質','show ability / quality · verb','To demonstrate an ability or quality through actual performance.','透過實際表現，證明或展現某種能力或品質。','重點是實際表現所展現的能力；與表現特質及證據表明的用法相近。',['ability','depict','present','guide','demonstrate','screen'],[
["The campaign showed the company’s ability to understand its customers.",'這次宣傳活動展現了公司理解顧客的能力。','展現了'],['Her performance showed real talent.','她的表現展現了真正的才華。','展現了']]),
entry('map','圖表標示位置或變化','map / graph shows · verb','To represent location, quantity or change on a map or graph.','用圖表、地圖或標記表示位置、數量或變化。','這是顯示資料的一種具體用法，也可能提供證據；練習不把這些重疊解釋列作錯誤選項。',['map','present','guide','demonstrate','express','screen'],[
['The map shows the location of the nearest station.','地圖標示了最近車站的位置。','標示了'],['The graph shows a sharp increase in demand.','圖表反映需求大幅上升。','反映']]),
entry('visible','變得明顯可見','something shows · verb','To be or become visible or noticeable.','痕跡、特徵或狀態變得明顯，讓人看得出來。','這裡通常是不及物用法：the stain shows，而不是某人展示一件物品。',['visible','present','guide','demonstrate','evidence','screen'],[
['The stain shows clearly on the white shirt.','污漬在白色襯衫上非常明顯。','非常明顯'],['His tiredness began to show.','他的疲倦開始顯露出來。','顯露出來']]),
entry('screen','上映或播放','is showing / is shown · verb','For a film or programme to be presented to an audience.','電影或節目向觀眾播放或上映。','is showing 是正在上映；will be shown 是將會被播放。',['screen','present','guide','demonstrate','evidence','express'],[
['The film is showing at several cinemas.','這部電影正在多間戲院上映。','上映'],['The documentary will be shown on television tonight.','這部紀錄片今晚會在電視上播放。','播放']]),
entry('entertainment','娛樂節目或表演','a show · noun','An entertainment programme or stage performance.','提供給觀眾觀看的娛樂節目或舞台表演。','a comedy show / a theatre show；此處是名詞。',['entertainment','exhibition','pretence','result','guide','demonstrate'],[
['We watched a comedy show last night.','我們昨晚看了一個喜劇節目。','節目'],['The theatre show starts at eight.','劇院的表演八點開始。','表演']]),
entry('exhibition','展覽會或展示會','a show · noun','An organized event where products, art or other things are exhibited.','向公眾集中展示產品、藝術品或其他事物的展覽活動。','a motor show / an art show；強調展覽活動，不是一次電影場次。',['exhibition','entertainment','pretence','result','guide','demonstrate'],[
['The company presented its new model at the motor show.','公司在汽車展覽會上展示了新型號。','展覽會'],['We visited an art show at the gallery.','我們去了畫廊看一個藝術展覽。','展覽']]),
entry('pretence','做樣子或營造排場','for show · expression','An outward display intended to impress, sometimes without genuine substance.','主要為了營造表面印象，而不一定有真心或實際作用。','要把 for show 作為整個片語理解；並非每次都表示欺騙，也可以指裝飾排場。',['pretence','entertainment','exhibition','screening','result','demonstrate'],[
['His concern was mostly for show.','他的關心大多只是做樣子。','做樣子'],['The expensive decorations were mainly for show.','那些昂貴裝飾主要只是用來展示排場。','用來展示排場']]),
entry('screening','一次放映或公開展示','a showing · noun','One occasion when a film, collection or work is presented.','電影、作品或產品被放映或展示的一次活動或場次。','8 p.m. showing 指指定場次；first showing 指首次展示。',['screening','result','pretence','guide','demonstrate','express'],[
['We booked tickets for the 8 p.m. showing.','我們訂了晚上八點那一場放映的票。','放映'],['The first showing of the new collection attracted a large audience.','新系列的首次公開展示吸引了大量觀眾。','公開展示']]),
entry('result','整體表現或成績','a strong / poor showing · noun','The quality of a performance or result in a competition or activity.','某人、團隊或產品在活動、競爭或市場中的實際表現或成績。','a strong showing / a disappointing showing；不是展示活動或電影場次。',['result','screening','pretence','exhibition','guide','demonstrate'],[
['The team made a strong showing in the competition.','球隊在比賽中有很出色的整體表現。','整體表現'],['The product made a disappointing showing in its first month.','這件產品首月的市場表現令人失望。','市場表現']])],comparisons:[
['show / tell','Show me how it works. / Tell me how it works.','show 著重示範或讓人看見；tell 著重用言語告訴別人。兩者可以一起使用。'],
['show / display','The shop displayed the products in the window.','show 用法很廣；display 常指把物件陳列或呈現在可見的位置。'],
['show / demonstrate','The trainer demonstrated how to use the equipment.','demonstrate 常指透過行動或例子示範，或清楚證明；show 可用於較日常的「給某人看」。'] ]};
export const questions=showModule.senses.flatMap(s=>s.examples.map(([en,zh,mask],i)=>({id:`${s.id}-${i}`,sense:s.id,en,zh,masked:zh.replace(mask,'____'),options:s.options,explanation:s.note,passage:s.id==='depict'&&i===0}))).sort((a,b)=>Number(a.passage)-Number(b.passage));

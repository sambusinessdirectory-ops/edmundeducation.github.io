// Tourism and living culture: respect risk, reject total bans, manage visitor impact.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:40'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Tourism now changes local places in ways people can easily see, especially where old traditions, buildings and ways of life are special.',
 'Some say certain places should stop tourists coming in to keep their culture.',
 'But I think stopping all tourists will not help: careful rules protect culture better than keeping every visitor away.',
 'People who support a ban say that too many visitors may harm local culture.',
 'Tourists may see important religious places, festivals or old streets as fun things for visitors, not as parts of daily community life.',
 'So local people may feel their customs are being sold, and shops may change food, music or hand-made goods just to please tourists.',
 'For example, a quiet village where people fish may slowly fill with gift shops and shows made for tourists, making its old way of life hard to see.',
 'From this view, limiting or stopping visitors can look like a direct way to stop a culture becoming weaker.',
 'But I think stopping all tourism would do little good.',
 'Culture has never stayed exactly the same; it changes as people move, talk, buy and sell, and get used to new things.',
 'If all tourism stops, local people may lose money, young people may move away for work, and the community may become weaker, not more true to itself.',
 'More important, a ban does not teach visitors to show respect.',
 'A better plan is to limit visitor numbers, protect places at risk, let residents help plan tourism and use the money to keep culture alive.',
 'In this way, tourism helps protect old traditions instead of making them disappear.',
 'To sum up, stopping all tourism may look like a way to protect culture, but it goes too far and often does not work.',
 'I think tourism with good rules is a wiser answer because it lets culture live, change and keep meaning for both local people and visitors.',
];
const vocabulary=[
 v(['visible forces','ways people can easily see','明顯力量'],['shaping','changes','塑造'],['distinctive traditions','old traditions','獨特傳統'],['architecture','buildings','建築'],['ways of life','ways of life','生活方式']),
 v(['certain areas','certain places','某些地區'],['closed to tourists','stop tourists coming in','禁止遊客進入'],['preserve','keep','保護'],['cultural identity','culture','文化身份']),
 v(['However','But','然而'],['banning tourism','stopping all tourists','禁止旅遊'],['careful management','careful rules','細心管理'],['complete isolation','keeping every visitor away','完全隔離']),
 v(['support bans','support a ban','支持禁令'],['damaged','harm','破壞'],['outsiders','visitors','外來者']),
 v(['sacred sites','important religious places','神聖場所'],['traditional festivals','festivals','傳統節日'],['historic neighbourhoods','old streets','歷史街區'],['as entertainment','as fun things for visitors','當作娛樂'],['living parts of a community','parts of daily community life','社區生活部分']),
 v(['As a result','So','結果'],['residents','local people','居民'],['customs','customs','習俗'],['turned into products','being sold','變成商品'],['crafts','hand-made goods','手工藝'],['satisfy visitors','please tourists','迎合遊客']),
 v(['fishing village','village where people fish','漁村'],['souvenir shops','gift shops','紀念品店'],['staged performances','shows made for tourists','刻意安排表演'],['original lifestyle','old way of life','原有生活方式']),
 v(['From this perspective','From this view','從此角度'],['limiting','limiting','限制'],['banning','stopping','禁止'],['diluted','becoming weaker','被稀釋']),
 v(['Nevertheless','But','然而'],['strongly believe','think','強烈相信'],['few real benefits','little good','少真正好處']),
 v(['frozen in time','stayed exactly the same','凝固不變'],['naturally changes','changes','自然改變'],['communicate','talk','溝通'],['trade','buy and sell','貿易'],['adapt','get used to new things','適應']),
 v(['banned completely','all tourism stops','完全禁止'],['lose income','lose money','失去收入'],['young residents','young people','年輕居民'],['better opportunities','work','更好機會'],['more authentic','more true to itself','更真實']),
 v(['More importantly','More important','更重要'],['a ban','a ban','禁令'],['behave respectfully','show respect','尊重行事']),
 v(['better approach','better plan','更好做法'],['control visitor numbers','limit visitor numbers','控制人數'],['sensitive sites','places at risk','敏感地點'],['involve local residents','let residents help','讓居民參與'],['profits','the money','收益'],['cultural preservation','keep culture alive','文化保育']),
 v(['That way','In this way','這樣一來'],['a tool for protecting heritage','helps protect old traditions','保護遺產的工具'],['washes it away','making them disappear','使其消失']),
 v(['In conclusion','To sum up','總結'],['appear to protect','look like a way to protect','看似保護'],['too extreme','goes too far','過於極端'],['ineffective','does not work','無效']),
 v(['In my view','I think','在我看來'],['well-managed tourism','tourism with good rules','管理得宜旅遊'],['wiser solution','wiser answer','更明智方案'],['survive','live','延續'],['adapt','change','適應'],['remain meaningful','keep meaning','保持意義']),
];
const part=(text,kind,label)=>[text,kind,label];
function makeFrame(i,s){const source=original[i],at=source.indexOf(s.target);if(at<0)throw Error('Missing target '+(i+1)+': '+s.target);const prefix=source.slice(0,at),suffix=source.slice(at+s.target.length),parts=[];if(prefix)parts.push(part(prefix,'link','句型固定部分'));parts.push(part(s.target,'slot',s.slot));if(suffix)parts.push(part(suffix,'link','句型固定部分'));return {formula:s.formula,meaning:s.meaning,usage:s.usage,parts}}
const specs=[
 {target:'Tourism',replacement:'A large festival',slot:'影響社區的活動',formula:'[活動] has become a visible force shaping [社區]',meaning:'旅遊明顯影響有獨特文化的社區。',usage:'當引言要說明某現象已明顯改變一類地方時。',relation:'現在完成式界定背景變化',d:[1,3,8]},
 {target:'certain areas',replacement:'small historic towns',slot:'被主張限制進入的地方',formula:'Some argue that [地方] should be closed to [訪客] in order to [目的]',meaning:'一方主張禁遊客以保存文化身份。',usage:'當引言需公平交代某人主張用限制達成保護目的時。',relation:'in order to 說明禁令目的',d:[2,3,8]},
 {target:'banning tourism',replacement:'closing every historic district',slot:'作者否定的全面限制',formula:'However, I believe [全面禁令] is not useful, because [管理] works better',meaning:'作者認為管理比完全隔離更能保護文化。',usage:'當你要反對過度全面的方案並提出較合比例方法時。',relation:'because 提出管理勝禁令的理由',d:[1,3,8]},
 {target:'local culture',replacement:'community traditions',slot:'可能受大量訪客影響的文化',formula:'Those who support bans argue that [對象] can be damaged when [人流條件]',meaning:'支持禁令者憂慮遊客過多損害文化。',usage:'當你要先公平表述支持限制的一方所擔心的條件時。',relation:'when 將文化損害與人流連結',d:[2,8,13]},
 {target:'sacred sites, traditional festivals, or historic neighbourhoods',replacement:'old temples, local ceremonies, or historic homes',slot:'屬於社區生活的例子',formula:'Tourists may treat [活文化事物] as entertainment rather than [社區一部分]',meaning:'遊客可能把活文化當娛樂。',usage:'當你要用 rather than 指出外人看法與社區意義的落差時。',relation:'rather than 對照消費與活文化',d:[3,8,13]},
 {target:'local food, music, or crafts',replacement:'local dances, meals, or clothing',slot:'可能被迎合市場而改動的文化內容',formula:'As a result, residents may feel [商品化], and businesses may change [內容] to satisfy visitors',meaning:'商品化讓居民感受習俗被販賣。',usage:'當你要由外來消費方式推導居民感受與商業改變時。',relation:'As a result 交代商品化後果',d:[3,8,13]},
 {target:'a quiet fishing village',replacement:'a small mountain town',slot:'受旅遊轉型影響的地方',formula:'For example, [地方] could become filled with [觀光化事物], making [原貌] harder to recognise',meaning:'漁村或被紀念品店及表演蓋過原貌。',usage:'當你需要一個地點的前後變化來證明抽象文化損失時。',relation:'For example 具體展示觀光化',d:[3,8,13]},
 {target:'limiting or even banning tourism',replacement:'limiting or even banning large tour groups',slot:'禁令一方提出的處置',formula:'From this perspective, [限制] seems like a direct way to stop [損害]',meaning:'限制甚至禁止旅遊看似能防文化稀釋。',usage:'當你已分析某一風險，需公平概括限制方案的吸引力時。',relation:'seems like 避免直接認同禁令',d:[3,8,13]},
 {target:'banning tourism',replacement:'closing local markets',slot:'作者反對的做法',formula:'Nevertheless, I believe [禁令] would bring few real benefits',meaning:'作者認為全面禁令真實收益少。',usage:'當你要由公平呈現反方轉為明確反駁時。',relation:'Nevertheless 轉到作者立場',d:[3,4,13]},
 {target:'people move, communicate, trade, and adapt',replacement:'people travel, talk, trade, and learn',slot:'文化自然改變的途徑',formula:'Culture has never been frozen in time; it changes as [人們互動適應]',meaning:'文化本會因人流溝通和貿易而變。',usage:'當你要用一般原則反駁把文化想成永遠不變的前提時。',relation:'分號從反駁靜態文化到解釋變化',d:[3,4,13]},
 {target:'tourism',replacement:'international exchange',slot:'被完全禁止的活動',formula:'If [活動] is banned completely, [居民損失] may occur rather than [預期好處]',meaning:'禁旅遊可令收入流失、年輕人離開。',usage:'當你要測試全面禁止方案是否會帶來反效果時。',relation:'If 加 rather than 顯示禁令反效果',d:[3,4,13]},
 {target:'a ban',replacement:'closing the area',slot:'不能教人尊重的處置',formula:'More importantly, [限制] does not teach visitors to [所需行為]',meaning:'禁令無法教遊客尊重文化。',usage:'當你已談成本，還需指出方案未處理行為根源時。',relation:'More importantly 把焦點轉向教育不足',d:[3,4,13]},
 {target:'control visitor numbers',replacement:'schedule smaller tour groups',slot:'具體管理措施之一',formula:'A better approach would be to [管制人數], protect [地點], involve [居民], and fund [保育]',meaning:'控人數、護敏感地、居民參與、收益保育。',usage:'當你反對全面禁令後，要提出多項可執行替代措施時。',relation:'四個並列動作形成可操作方案',d:[3,4,13]},
 {target:'a tool for protecting heritage',replacement:'a way to support living traditions',slot:'管理後的旅遊作用',formula:'That way, [活動] becomes [保護工具] rather than [侵蝕力量]',meaning:'管理可令旅遊助文化保育。',usage:'當你要總結管理條件如何把潛在威脅轉成資源時。',relation:'rather than 對照保護與侵蝕',d:[3,4,8]},
 {target:'banning tourism',replacement:'closing the whole region',slot:'看似可保護卻過度的方案',formula:'In conclusion, while [禁令] may appear to protect [價值], it is [評價]',meaning:'全面禁止看似保護文化，實則過度且無效。',usage:'當結論要承認方案的表面吸引力，仍指出其局限時。',relation:'while 作讓步後評價方案',d:[3,8,15]},
 {target:'well-managed tourism',replacement:'carefully managed visitor access',slot:'作者主張的替代方案',formula:'In my view, [管理方案] is wiser, as it allows [價值] to survive and adapt',meaning:'良好管理讓文化延續、適應並保持意義。',usage:'當最後要用 as 說明替代方案兼顧保護與變化時。',relation:'as 為較明智方案作解釋',d:[3,8,14]},
];
const structures=specs.map((s,i)=>({example:original[i].replace(s.target,s.replacement),distractors:s.d,frame:makeFrame(i,s),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'公平呈現文化商品化，再檢驗全面禁令。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者認為如何保護旅遊區的文化？',['控制遊客與保護地點，讓居民參與並用收益保育。','把所有旅遊永久禁止，亦無須考慮居民收入。','完全不限制任何遊客，也不需維護文化場所。','只靠紀念品店收入，不必關心社區原有生活。'],'管理方案對準文化影響，也保留收入。'),{type:'multi',prompt:'文章承認哪兩種實際風險？',detail:'選兩項，再按「確認」。',options:['文化場所可能被當作娛樂消費。','商家可能改動本地文化迎合遊客。','文化從來不會隨人群互動而變化。','全面禁遊必然提高所有居民收入。'],correct:[0,1],why:'反方擔心神聖場所及習俗商品化。'}];
const route=[sequence('還原四段論證',[['引言','旅遊影響文化；作者選管理而非隔離。'],['禁令理由','遊客可能消費化活文化，漁村原貌或遭覆蓋。'],['反駁替代','文化本會變；禁令損收入且不教尊重；提出控流、居民參與與保育。'],['結論','禁令過度而無效，良好管理讓文化延續及適應。']],'管理條件直接回應禁令方提出的風險。')];
const evidence=[quiz('遊客把節日當娛樂會帶來甚麼風險？',['活文化被當商品，居民感到習俗遭改造。','本地文化從此必然完全停止變化。','居民必然因此獲得所有觀光收入。','所有遊客都會自動學會尊重習俗。'],'商品化是反方最強理由。'),quiz('漁村例子有何作用？',['紀念品店與安排表演可蓋過原來生活。','證明所有漁村都只靠演出維持收入。','證明遊客永遠不購買任何紀念品。','證明文化只會在城市受到外來影響。'],'把抽象稀釋變為可見場景。'),quiz('為何禁令未必令文化更真實？',['收入流失和年輕人離開可令社區更弱。','只要禁止遊客，年輕人便必然回流。','文化原本完全不會因任何交流改變。','禁令必定教所有遊客如何尊重社區。'],'禁令可能破壞文化賴以存在的社區。'),quiz('替代方案包括甚麼？',['控人數、護敏感地、居民參與及收益保育。','只增加遊客數量而不設定任何限制。','只禁止居民參與旅遊政策的決定。','只將文化活動改成迎合遊客的表演。'],'四個可執行元素。')];
const logic=[sequence('禁令派的擔心',[['人流','外來者過多可影響地方文化。'],['誤讀','神聖地與節慶被看作娛樂。'],['商品化','習俗與工藝改為迎合遊客。'],['例子','漁村原貌被商店與表演蓋過。']],'先準確理解文化稀釋機制。'),sequence('為何選管理',[['原則','文化本來會隨交流而變。'],['禁令代價','收入流失、年輕人離開。'],['禁令缺口','禁止不能教遊客尊重。'],['對應措施','控人流、護敏感地、居民參與、收益保育。']],'替代方案需逐一回應風險。')];
const transfers=[
 transfer('古城的宗教場所被旅行團當拍照道具。','哪句準確指出文化風險？',['把活文化當娛樂，可能令居民感到習俗受輕視。','只要旅行團拍照，文化便一定永久完全消失。','宗教場所只要有遊客，就不再屬於本地社區。','遊客拍照可保證所有人都深入理解宗教意義。'],['外人消費與社區意義落差。','過度。','不必然。','無保證。'],[4,5],'entertainment vs living culture。'),
 transfer('小鎮因禁遊失去工作，年輕人移居。','哪句檢驗禁令反效果？',['收入與居民流失，或使社區比以前更難維持。','只要不見遊客，本地工作便必然全部增加。','年輕人離開一定會令本地傳統更容易傳承。','禁遊後商店收入必然不受任何人流變化影響。'],['社區變弱可損文化。','不實。','未必。','收入有關。'],[10],'ban may weaken community。'),
 transfer('觀光收入增加，但傳統節慶變成純表演。','哪句呈現雙面影響？',['旅遊可帶來收入，亦可誘使商家迎合遊客改文化。','只要收入增加，社區便必然再沒有文化方面損失。','節慶改作表演證明本地居民不曾重視任何習俗。','只要活動有遊客，居民就不能再參與節慶安排。'],['收益不抹去商品化風險。','過度。','無證據。','仍可參與。'],[4,5,6],'commercialisation risk。'),
 transfer('管理者希望保存老街又不全面禁遊。','哪句提供可執行方案？',['限制人數、保護敏感區，並讓居民參與規劃。','完全不管人數和地點，只增加旅遊宣傳預算。','永久封閉所有商店，也不許居民討論政策。','只要求遊客多花錢，不問文化場所如何使用。'],['措施對準壓力來源。','放任。','過度。','缺保護。'],[12],'controlled access and residents。'),
 transfer('有人說「文化要原封不動，故須禁所有交流」。','哪句能反駁前提？',['文化一直隨遷移和交流演變，無須完全隔離。','文化只在沒有任何居民時，才可能出現改變。','一旦遊客出現，所有傳統便必然立即消失。','文化若曾改變，就不需要再保護任何古蹟。'],['文化是活的，可管理變化。','不實。','過度。','仍需保護。'],[9],'culture naturally adapts。'),
 transfer('遊客不尊重當地禮儀，地方只提出封閉。','哪句指出政策缺口？',['封閉本身不教尊重，仍需清楚規則與遊客教育。','只要不讓遊客進入，他們便必定學會本地禮儀。','遊客若曾失禮，居民就不用再參與旅遊規劃。','所有遊客都不可能學會尊重，所以規則毫無作用。'],['禁令未改行為。','不必然。','居民仍重要。','可教育。'],[11,12],'ban does not teach respect。'),
 transfer('另一題討論是否完全禁止文化節訪客。','哪句可轉用本文的權衡？',['承認人流風險，再用限額和居民參與處理問題。','只要文化節熱鬧，就一律不需評估居民感受。','只要有人不滿，就永久停止所有文化交流活動。','只需比較門票收入，不問節慶原有社區用途。'],['先承認風險再設條件。','忽略居民。','過度。','忽略文化。'],[3,12,14],'managed tourism vs complete isolation。'),
 transfer('漁村旅遊業想補助本地手工藝。','哪句最能把收益用於保育？',['撥出觀光收益支持工藝師，並讓居民定發展方向。','把工藝全部改成外地量產商品，再稱為本地傳統。','禁止任何工藝師參與，仍要求他們維持文化。','只增設紀念品店，不必檢查工藝是否仍在傳承。'],['收益需回到活文化。','商品化。','排除居民。','未保育。'],[12,13],'profits support preservation。'),
 transfer('作文說「禁令能即時擋遊客」，便認定必然成功。','哪句指出推論不足？',['擋人流不等於教尊重，亦可能損居民收入。','只要擋住遊客，所有文化必然永遠固定不變。','禁令既然容易宣布，便一定沒有執行或經濟代價。','禁止進入本身已足夠證明地方文化得以傳承。'],['需看根本行為和代價。','過度。','有代價。','不足證明。'],[10,11],'ban may have few real benefits。'),
 transfer('結論要承認禁令看似保護文化，仍選管理。','哪句最完整？',['禁令看似護文化，卻過度；良好管理可兼顧傳承。','禁令一旦看似有用，就必須永遠禁止所有遊客。','良好管理既能幫文化，就完全不需控制任何人流。','文化能改變，便代表社區無須保護敏感場所。'],['讓步後提出較佳替代。','過度。','仍需控流。','仍需保護。'],[14,15],'while ban seems helpful, management wiser。'),
];
// Reviewed transfer alternatives and matched feedback.
const editorialTransferOptions=[["把活文化當娛樂，可能令居民感到習俗受輕視。","拍照可增加宗教場所曝光，居民的禮儀感受次要。","旅行團到訪可提高收入，宗教用途仍可留待日後。","遊客能留下照片，故已掌握場所背後的文化意思。"],["收入與居民流失，或使社區比以前更難維持。","禁遊可減少人流，失去的工作可由鄰鎮補回。","年輕人外移可減少擠迫，社區傳承仍靠長者。","旅遊收入減少，只影響商店而不影響居民留鄉。"],["旅遊可帶來收入，亦可誘使商家迎合遊客改文化。","節慶成為表演可吸引訪客，原有儀式仍自動保留。","商家可改活動以增加收入，居民感受則由票房反映。","觀光收入上升，便可推定習俗轉型由社區主導。"],["限制人數、保護敏感區，並讓居民參與規劃。","可保留老街外觀，旅客數量則由商戶自行決定。","可增設紀念品區，敏感場所保護留待活動結束。","可限縮營業時間，居民規劃參與則視情況安排。"],["文化一直隨遷移和交流演變，無須完全隔離。","文化會演變，因此古城旅遊可交市場自行調整。","交流能帶來新做法，原有習俗則不需再記錄。","傳統可隨時間變化，所以遊客行為較少受規範。"],["封閉本身不教尊重，仍需清楚規則與遊客教育。","封閉敏感場所後，便可略過對遊客的禮儀說明。","訂出參觀規則即可，居民參與和教育留待日後。","只要求遊客繳費，尊重禮儀可由導遊自行提醒。"],["承認人流風險，再用限額和居民參與處理問題。","可限制人流，居民意見則由主辦方代為推測。","可讓居民參與，但節慶人數不需要事先規劃。","可保留門票收入，文化活動原用途則可轉為宣傳。"],["撥出觀光收益支持工藝師，並讓居民定發展方向。","旅遊收入可補助店面，工藝傳承則交由外地公司。","可由商戶決定發展方向，居民只負責現場表演。","可增設手工藝攤位，收益卻不回流本地工藝師。"],["擋人流不等於教尊重，亦可能損居民收入。","禁令可阻止進入，因此文化禮儀也會自行改善。","人流減少可降低擠迫，居民生計則交下年度檢討。","禁令易於宣布，文化傳承便可不再另作安排。"],["禁令看似護文化，卻過度；良好管理可兼顧傳承。","禁令可先減人流，管理措施則待文化穩定後再做。","管理可增加收益，敏感場所及居民感受不必優先。","文化需要保護，所以結論應先維持全面禁遊。"]];
const editorialTransferReasons=[["曝光不能代替對活文化的尊重。","收入增加也不能忽略宗教與社區用途。","拍到照片不等於理解宗教意義。"],["鄰鎮工作不能直接維持本地社區。","年輕人離開會影響傳承與社區延續。","收入與居民能否留下有關。"],["迎合遊客可改變節慶的本來意義。","票房不能代表居民對文化改變的感受。","收入增加不能證明轉型由居民自決。"],["人數仍須管理，不能只保留外觀。","敏感場所應在開放前安排保護。","居民參與不宜只是事後選項。"],["演變不等於放棄文化管理。","原有習俗仍可記錄和傳承。","交流仍需尊重地方規範。"],["封閉不會教遊客理解禮儀。","規則需教育及居民參與配合。","繳費不能代替尊重與清楚指引。"],["居民參與是政策重點，不應由主辦方代猜。","節慶人流仍需妥善控制。","活動原有社區功能不應只作宣傳。"],["外地公司不能替代本地工藝師傳承。","居民應參與決定發展方向。","收益須能支持實際的本地工藝。"],["擋人流不等於培養尊重。","禁遊的生計代價需及早評估。","禁令本身不能證明文化得以延續。"],["原文選擇及早管理而非持續禁遊。","管理仍要兼顧敏感地點與居民感受。","全面禁令的代價正是作者反對之處。"]];
editorialTransferOptions.forEach((row,i)=>{transfers[i].options=row;transfers[i].explanations=[transfers[i].explanations[0],...editorialTransferReasons[i]];});
// Source-aligned connector frames.
structures[4].frame.parts=[["Tourists may treat ","link","句型固定部分"],["sacred sites, traditional festivals, or historic neighbourhoods","slot","活文化事物"],[" as entertainment rather than ","link","句型固定部分"],["living parts of a community.","slot","社區一部分"]];
structures[13].frame.parts=[["That way, ","link","句型固定部分"],["tourism","slot","活動"],[" becomes ","link","句型固定部分"],["a tool for protecting heritage","slot","保護工具"],[" rather than ","link","句型固定部分"],["a force that washes it away.","slot","侵蝕力量"]];
structures[14].frame.parts=[["In conclusion, while ","link","句型固定部分"],["banning tourism","slot","禁令"],[" may appear to protect ","link","句型固定部分"],["local culture","slot","價值"],[", it is ","link","句型固定部分"],["too extreme and often ineffective.","slot","評價"]];
// Reviewed connector structure decompositions.
structures[2].frame.parts=[["However, I believe that ","link","句型固定部分"],["banning tourism","slot","全面禁止的做法"],[" is not a useful solution, because ","link","句型固定部分"],["culture","slot","希望保護的事物"],[" is better protected through ","link","句型固定部分"],["careful management","slot","較合比例的管理"],[" than ","link","句型固定部分"],["complete isolation","slot","過度隔絕的做法"],[".","link","句型固定部分"]];
structures[2].frame.formula="However, I believe that [全面禁止的做法] is not a useful solution, because [希望保護的事物] is better protected through [較合比例的管理] than [過度隔絕的做法].";
structures[10].frame.parts=[["If ","link","句型固定部分"],["tourism","slot","受禁的活動"],[" is banned completely, ","link","句型固定部分"],["local people may lose income, young residents may leave for better opportunities","slot","居民可能承受的代價"],[", and ","link","句型固定部分"],["the community may become weaker","slot","社區反而變弱的結果"],[" rather than ","link","句型固定部分"],["more authentic","slot","原先希望得到的結果"],[".","link","句型固定部分"]];
structures[10].frame.formula="If [受禁的活動] is banned completely, [居民可能承受的代價], and [社區反而變弱的結果] rather than [原先希望得到的結果].";
structures[0].frame.parts=[["Tourism","slot","影響社區的活動"],[" has become one of the most visible forces shaping ","link","句型固定部分"],["local communities","slot","受到影響的社區"],[", especially in places with distinctive traditions, architecture, and ways of life.","link","句型固定部分"]];
structures[0].frame.formula="[影響社區的活動] has become one of the most visible forces shaping [受到影響的社區], especially in places with distinctive traditions, architecture, and ways of life.";
structures[3].frame.parts=[["Those who support bans usually argue that ","link","句型固定部分"],["local culture","slot","可能受損的事物"],[" can be damaged when ","link","句型固定部分"],["too many outsiders enter a place","slot","人流過多的情況"],[".","link","句型固定部分"]];
structures[3].frame.formula="Those who support bans usually argue that [可能受損的事物] can be damaged when [人流過多的情況].";
structures[5].frame.parts=[["As a result, residents may feel ","link","句型固定部分"],["that their customs are being turned into products","slot","居民對商品化的感受"],[", and businesses may start changing ","link","句型固定部分"],["local food, music, or crafts","slot","可能被改動的文化內容"],[" simply to satisfy visitors.","link","句型固定部分"]];
structures[5].frame.formula="As a result, residents may feel [居民對商品化的感受], and businesses may start changing [可能被改動的文化內容] simply to satisfy visitors.";
structures[6].frame.parts=[["For example, ","link","句型固定部分"],["a quiet fishing village","slot","受影響的地方"],[" could gradually become filled with ","link","句型固定部分"],["souvenir shops and staged performances","slot","新增的旅遊設施"],[", making ","link","句型固定部分"],["its original lifestyle","slot","難以辨認的原貌"],[" harder to recognise.","link","句型固定部分"]];
structures[6].frame.formula="For example, [受影響的地方] could gradually become filled with [新增的旅遊設施], making [難以辨認的原貌] harder to recognise.";
structures[12].frame.parts=[["A better approach would be to ","link","句型固定部分"],["control visitor numbers","slot","管制人數的做法"],[", protect ","link","句型固定部分"],["sensitive sites","slot","需保護的地點"],[", involve ","link","句型固定部分"],["local residents","slot","參與規劃的人"],[" in tourism planning, and ensure that ","link","句型固定部分"],["profits support cultural preservation","slot","收益的保育用途"],[".","link","句型固定部分"]];
structures[12].frame.formula="A better approach would be to [管制人數的做法], protect [需保護的地點], involve [參與規劃的人] in tourism planning, and ensure that [收益的保育用途].";
structures[15].frame.parts=[["In my view, ","link","句型固定部分"],["well-managed tourism","slot","較可取的管理方式"],[" is the wiser solution, as it allows ","link","句型固定部分"],["culture","slot","得以延續的價值"],[" to survive, adapt, and remain meaningful to both residents and visitors.","link","句型固定部分"]];
structures[15].frame.formula="In my view, [較可取的管理方式] is the wiser solution, as it allows [得以延續的價值] to survive, adapt, and remain meaningful to both residents and visitors.";
// Source-aligned remaining frames.
structures[1].frame.parts=[["Some argue that ","link","句型固定部分"],["certain areas","slot","地方"],[" should be closed to ","link","句型固定部分"],["tourists","slot","訪客"],[" in order to ","link","句型固定部分"],["preserve their cultural identity.","slot","目的"]];
structures[7].frame.parts=[["From this perspective, ","link","句型固定部分"],["limiting or even banning tourism","slot","限制"],[" seems like a direct way to stop ","link","句型固定部分"],["culture from being diluted.","slot","損害"]];
structures[11].frame.parts=[["More importantly, ","link","句型固定部分"],["a ban","slot","限制"],[" does not teach visitors to ","link","句型固定部分"],["behave respectfully.","slot","所需行為"]];
export default {key:'discuss-both-views:40',meta:{topic:'限制旅遊以保護地方文化',summary:'公平呈現宗教場所及節慶商品化的風險，再指出禁遊可損社區收入且無法教尊重；以限流、敏感地保護、居民參與和收益保育作可執行替代。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

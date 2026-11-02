// Private-car ban: urban gains, accessibility costs, and a proportionate alternative.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:42'];
const original=groups.map(row=>row.english),v=(...rows)=>rows;
const simple=[
 'Too much traffic has become a problem that keeps coming back in modern cities.',
 'Some say people should not drive their own cars into city centres, but others say this rule would not work well.',
 'I think stopping private cars may sound good as an idea, but it would not work well in real life.',
 'First, people supporting the rule say stopping private cars would make centres cleaner, safer and less busy.',
 'Private cars often carry just one or two people but take up a lot of space on the road.',
 'If cars were taken out of central streets, buses, trams, people on bikes and people walking could move much more easily.',
 'This would cut traffic jams and make the air cleaner too, because fewer cars give off less dirty air.',
 'For example, a busy shopping area with fewer cars would probably be nicer for people who live, work or visit there.',
 'From this view, limiting cars looks like a direct way to make city life better.',
 'But people against the rule say a total ban would bring serious problems in daily life.',
 'Many need their own cars because buses and trains may be late, too full or missing in some areas.',
 'Older people, people with disabilities, families with small children and workers carrying tools may find it very hard to reach centres without cars.',
 'Also, shops and companies may lose business if customers, people bringing goods or workers suddenly cannot travel easily.',
 'So a rule that sounds simple may upset daily life and unfairly hurt people whose needs buses and trains alone cannot meet.',
 'I strongly think stopping private cars entering centres is not practical.',
 'A better plan is to make fewer people drive by charging for busy roads, improving buses and trains, limiting parking and building better bike paths.',
 'These steps would cut traffic jams without making life hard for people who truly need to drive.',
 'To sum up, banning private cars may cut traffic and dirty air, but it is too strict to work fairly in real cities.',
 'Governments should control car use in smarter ways instead of banning it completely.',
];
const vocabulary=[
 v(['Traffic congestion','Too much traffic','交通擠塞'],['persistent','keeps coming back','持續'],['modern cities','modern cities','現代城市']),
 v(['privately owned vehicles','their own cars','私家車'],['prohibited','should not drive','禁止'],['city centres','city centres','市中心'],['impractical','would not work well','不切實際']),
 v(['In my view','I think','在我看來'],['appear attractive in theory','sound good as an idea','理論上吸引'],['unrealistic','would not work well','不現實'],['in practice','in real life','實際上']),
 v(['supporters','people supporting','支持者'],['ban on private vehicles','stopping private cars','禁止私家車'],['less crowded','less busy','較少擁擠']),
 v(['carry','carry','載運'],['passengers','people','乘客'],['yet','but','卻'],['occupy','take up','佔用'],['road space','space on the road','道路空間']),
 v(['removed','taken out','移出'],['central areas','central streets','市中心'],['cyclists','people on bikes','單車使用者'],['pedestrians','people walking','行人'],['more efficiently','much more easily','更有效率']),
 v(['not only reduce','cut','不但減少'],['traffic jams','traffic jams','交通堵塞'],['lower air pollution','make the air cleaner','減少空污'],['emissions','dirty air','排放']),
 v(['shopping district','shopping area','購物區'],['private vehicles','cars','私人車'],['likely','probably','很可能'],['more pleasant','nicer','更舒適']),
 v(['From this perspective','From this view','從此角度'],['restricting car access','limiting cars','限制汽車進入'],['improve urban life','make city life better','改善城市生活']),
 v(['On the other hand','But','另一方面'],['opponents','people against','反對者'],['complete ban','total ban','全面禁令'],['practical problems','problems in daily life','實際問題']),
 v(['depend on','need','依賴'],['private vehicles','their own cars','私人車'],['unreliable','late','不可靠'],['overcrowded','too full','過度擠迫'],['unavailable','missing','無法使用']),
 v(['Elderly people','Older people','長者'],['disabled passengers','people with disabilities','殘疾乘客'],['young children','small children','年幼孩子'],['carry equipment','carrying tools','攜帶設備'],['especially difficult','very hard','特別困難']),
 v(['In addition','Also','此外'],['businesses could suffer','shops and companies may lose business','企業或受損'],['suppliers','people bringing goods','供應商'],['conveniently','easily','方便地']),
 v(['sounds simple on paper','sounds simple','紙上簡單'],['disrupt daily life','upset daily life','擾亂日常'],['unfair burden','unfairly hurt','不公平負擔'],['public transport alone','buses and trains alone','單靠公交']),
 v(['strongly believe','strongly think','強烈認為'],['banning','stopping','禁止'],['unrealistic','not practical','不現實']),
 v(['better approach','better plan','更好方法'],['reduce car use','make fewer people drive','減少汽車使用'],['congestion charges','charging for busy roads','擠塞費'],['limited parking','limiting parking','限泊車'],['cycling infrastructure','bike paths','單車設施']),
 v(['These measures','These steps','這些措施'],['ease congestion','cut traffic jams','紓緩擠塞'],['without punishing','without making life hard','不懲罰'],['genuinely need to drive','truly need to drive','真正需駕車']),
 v(['In conclusion','To sum up','總結'],['reduce traffic','cut traffic','減少交通'],['pollution','dirty air','污染'],['too rigid','too strict','過於僵硬'],['fairly','fairly','公平']),
 v(['manage car use','control car use','管理汽車使用'],['more intelligently','in smarter ways','更明智'],['rather than','instead of','而非'],['complete ban','banning it completely','全面禁令']),
];
const part=(text,kind,label)=>[text,kind,label];
function makeFrame(i,s){const source=original[i],at=source.indexOf(s.target);if(at<0)throw Error('Missing target '+(i+1)+': '+s.target);const prefix=source.slice(0,at),suffix=source.slice(at+s.target.length),parts=[];if(prefix)parts.push(part(prefix,'link','句型固定部分'));parts.push(part(s.target,'slot',s.slot));if(suffix)parts.push(part(suffix,'link','句型固定部分'));return {formula:s.formula,meaning:s.meaning,usage:s.usage,parts}}
const specs=[
 {target:'Traffic congestion',replacement:'Noise pollution',slot:'持續的城市問題',formula:'[問題] has become one of the most persistent problems in modern cities',meaning:'交通擠塞是持續的城市問題。',usage:'當引言要指出一種長期困擾城市的問題時。',relation:'現在完成式界定問題持續性',d:[1,9,14]},
 {target:'privately owned vehicles',replacement:'heavy delivery trucks',slot:'被建議禁入市中心的車輛',formula:'While some argue [車輛] should be prohibited, others believe that [政策] is impractical',meaning:'有人主張禁私家車，另一方認為不切實際。',usage:'當引言需並列禁令與可行性兩方看法時。',relation:'While 形成兩方政策對立',d:[2,9,14]},
 {target:'banning private cars',replacement:'closing central roads',slot:'理論吸引卻實際困難的做法',formula:'Although [做法] may appear attractive in theory, it is unrealistic in practice',meaning:'禁私家車理論上好，實際難行。',usage:'當你要對照一項提議的理論吸引力與執行困難時。',relation:'although 連理論與實際反差',d:[1,9,14]},
 {target:'a ban on private vehicles',replacement:'a ban on delivery trucks',slot:'首方支持的限制',formula:'On the one hand, supporters argue [措施] would make [地方] cleaner, safer and less crowded',meaning:'禁車派重視清潔安全與少擠迫。',usage:'當你要公平說明支持限制者所預期的直接好處時。',relation:'On the one hand 引首方三項收益',d:[9,14,17]},
 {target:'one or two passengers',replacement:'a single passenger',slot:'汽車實際載客量',formula:'[車輛] carry only [少量乘客], yet occupy [大量路面]',meaning:'私家車載客少卻佔路多。',usage:'當你要用 yet 對照資源佔用與實際服務量時。',relation:'yet 突出載客與佔路不成比例',d:[9,14,17]},
 {target:'buses, trams, cyclists, and pedestrians',replacement:'buses, bicycles, walkers, and emergency vehicles',slot:'禁車後可更順暢移動者',formula:'If [車輛] were removed, [其他使用者] could move more efficiently',meaning:'移走私家車可讓公交單車行人通行。',usage:'當你要用假設條件評估一項道路限制的效果時。',relation:'If 假設限制帶來空間效益',d:[9,14,17]},
 {target:'traffic jams',replacement:'road delays',slot:'禁車可減少的問題',formula:'This would not only reduce [問題一] but also lower [問題二], since [成因]',meaning:'車少可同時減擠塞與排放。',usage:'當你要用 not only ... but also ... 列出同一措施的兩項效果時。',relation:'since 進一步說明空污改善原因',d:[9,14,17]},
 {target:'a busy shopping district',replacement:'a crowded school street',slot:'減車後改善的具體地點',formula:'For example, [地點] with fewer cars would likely become more pleasant for [使用者]',meaning:'購物區減車可讓居民工作者遊客更舒適。',usage:'當你要用一個地點例子具體化城市生活改善時。',relation:'For example 將假設落到可想像地點',d:[9,14,17]},
 {target:'restricting car access',replacement:'limiting through traffic',slot:'看似直接改善城市的措施',formula:'From this perspective, [限制] seems a direct way to improve [結果]',meaning:'限制車輛進入似能直接改善城市。',usage:'當你已列某方收益，需要概括其方案為何吸引時。',relation:'seems 保留審慎距離',d:[9,14,17]},
 {target:'a complete ban',replacement:'an immediate blanket ban',slot:'反方擔憂的全面禁令',formula:'On the other hand, opponents argue [禁令] would create practical problems',meaning:'全面禁車可能帶來實際困難。',usage:'當你要從預期好處轉向執行後果時。',relation:'On the other hand 引實際障礙',d:[3,8,17]},
 {target:'public transport',replacement:'the local bus network',slot:'尚未足以替代私家車的服務',formula:'Many depend on [私家選項] because [公共替代] is unreliable, overcrowded or unavailable',meaning:'部分地區公交不可靠、擠迫或欠缺。',usage:'當你要解釋人們依賴某選項源於替代服務不足時。',relation:'because 提供依賴私車的條件',d:[3,8,17]},
 {target:'workers who carry equipment',replacement:'workers who deliver heavy tools',slot:'特別難以不用車的群體',formula:'[多個群體] may find it especially difficult to [目的地] without [工具]',meaning:'長者殘疾者幼童家庭及載工具工人尤其難。',usage:'當你要指出平均政策對特定需求者特別不公平時。',relation:'especially difficult 細分受影響者',d:[3,8,17]},
 {target:'customers, suppliers, or employees',replacement:'clients, delivery staff, or employees',slot:'需要便捷出行的商業參與者',formula:'Businesses could suffer if [人群] were unable to travel conveniently',meaning:'顧客供應商員工出行受限可損企業。',usage:'當你要用 if 說明出行限制如何影響商業運作時。',relation:'if 把出行不便連企業損失',d:[3,8,17]},
 {target:'A policy that sounds simple on paper',replacement:'A rule that seems fair at first glance',slot:'表面簡單的政策',formula:'[表面簡單政策] could disrupt daily life and place an unfair burden on [特定群體]',meaning:'紙上簡單的禁令可能不公平地壓迫有特殊需求者。',usage:'當你要指出政策表面簡單與執行分配後果不同時。',relation:'therefore 彙總不公平負擔',d:[3,8,17]},
 {target:'banning privately owned vehicles',replacement:'excluding all delivery vans',slot:'作者拒絕的全面禁入措施',formula:'I strongly believe that [禁令] is unrealistic',meaning:'作者明確判全面禁私車不現實。',usage:'當你已比較兩方，需要直接重申自己的可行性判斷時。',relation:'strongly believe 重申立場',d:[3,8,17]},
 {target:'congestion charges',replacement:'better road pricing',slot:'減少駕車的具體工具',formula:'A better approach is to reduce use through [收費], [公交], [泊車], [單車]',meaning:'擠塞費、公交、泊車與單車設施共同減車。',usage:'當你反對全面禁令後，要列出較靈活的政策組合時。',relation:'四措施構成較合比例替代',d:[3,8,17]},
 {target:'people who genuinely need to drive',replacement:'residents who must carry medical equipment',slot:'不應被無差別懲罰的人',formula:'[替代措施] would ease congestion without punishing [確有需要者]',meaning:'減擠塞同時保留真正需要開車的人。',usage:'當你要說明較溫和政策怎樣避免傷害特殊需求者時。',relation:'without 指明公平底線',d:[3,8,17]},
 {target:'banning private vehicles',replacement:'closing all central roads',slot:'結論中承認有效但過度的措施',formula:'Although [禁令] could reduce [好處], it is too rigid to work fairly',meaning:'禁車可減污，但在真實城市過於僵硬。',usage:'當結論要承認一項措施有益，仍因不公平而拒絕時。',relation:'although 讓步後作公平評價',d:[3,8,15]},
 {target:'manage car use more intelligently',replacement:'price road use more carefully',slot:'政府應採取的管理方式',formula:'Governments should [智慧管理] rather than impose a complete ban',meaning:'政府應精準管理而非全面禁車。',usage:'當最後要用 rather than 對照精準管理與全面禁令時。',relation:'rather than 收束政策取捨',d:[3,8,17]},
];
const structures=specs.map((s,i)=>({example:original[i].replace(s.target,s.replacement),distractors:s.d,frame:makeFrame(i,s),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先承認禁車收益，再檢驗可行性與分配公平。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者對市中心全面禁私家車的判斷是甚麼？',['理論上有好處，實際不公平；宜改用靈活管理。','一切車輛均應永久進入市中心且完全免費。','只要道路較空，公交不足與特殊需求便不存在。','全面禁令沒有任何可能的空污或安全好處。'],'作者承認好處，重視可行性與公平。'),{type:'multi',prompt:'文章提到哪兩類影響？',detail:'選兩項，再按「確認」。',options:['少車可減擠塞、廢氣並改善步行環境。','公交不足或令部分群體難以到市中心。','全部顧客都不需要任何方式到店。','每輛私家車必定載滿乘客。'],correct:[0,1],why:'正反兩方均有具體後果。'}];
const route=[sequence('還原五段論證',[['引言','交通擠塞；兩方爭論禁令，作者認為不切實際。'],['禁車好處','私車佔路、減車改善通行與空氣。'],['實際障礙','公交不足，特殊需求者及企業受影響。'],['替代','擠塞費、改善公交、限泊車及單車設施。'],['結論','承認減污好處，仍選較公平的智慧管理。']],'替代方案須同時減車與保護真正需駕車者。')];
const evidence=[quiz('少私家車可能改善甚麼？',['路面空間、公交步行及空氣品質。','保證所有公交站即時遍布城市。','令每輛車都能同時載更多乘客。','使商店完全不需要顧客或員工。'],'少車有真實環境與空間收益。'),quiz('為何部分人依賴私家車？',['替代公交或遲、擠迫、未覆蓋其地區。','所有人都只因喜歡堵車才開車。','公交在每個地方都完全可靠可用。','所有家庭都無小孩或特殊需求。'],'公交不足是禁令可行性障礙。'),quiz('哪些人可能特別受禁令影響？',['長者、殘疾者、幼兒家庭及攜工具工人。','只會影響沒有任何出行需要的人。','只有能輕鬆乘公交的單身通勤者。','所有受影響者都可立即改為步行。'],'政策影響不平均。'),quiz('較佳替代方案是甚麼？',['收擠塞費、改善公交、限泊車和建單車徑。','永久禁所有交通並取消公共交通。','只增建免費泊位，不改善任何替代。','要求特殊需求者自行承擔全部阻礙。'],'減車而不無差別懲罰。')];
const logic=[sequence('禁車派的理據',[['佔路','私家車載客少卻佔大量空間。'],['流動','移走車輛可令公交單車行人通行。'],['環境','少車可減塞及減排。'],['場景','購物區對居民工作者遊客更舒適。']],'好處是實際的，但尚未證明全面禁令公平。'),sequence('政策如何更公平',[['服務不足','部分地區公交遲、擠或欠缺。'],['特殊需要','長者、殘疾者、幼兒家庭與載工具工人。'],['商業影響','顧客供應商員工出行可能困難。'],['替代措施','擠塞費、公交、泊車與單車設施。']],'減少不必要駕車而保留必要出行。')];
const transfers=[
 transfer('中心區私家車多，巴士常塞在同一條路。','哪句支持禁車派的空間理由？',['少量乘客的私車佔大量路面，阻礙巴士通行。','每輛私家車都載滿乘客，因此完全不佔道路。','巴士塞車只能由天氣引起，與路上私車無關。','只要私車夠多，巴士自然能更快穿過市中心。'],['佔路與載客不成比例。','不實。','忽略交通。','相反。'],[4,5],'few passengers occupy road space。'),
 transfer('小城公交服務稀少，卻想立刻全面禁車。','哪句指出可行性問題？',['若公交未能覆蓋需要，部分居民難以到達中心。','公交服務越稀少，居民就越容易到市中心。','只要宣布禁令，公交班次便會自動遍及全城。','若有道路，所有居民都能毫無困難地步行進城。'],['替代不足。','相反。','不自動。','需求不同。'],[10,13],'public transport unavailable。'),
 transfer('搬運工具的工人與一般乘客同受禁令。','哪句指出分配公平？',['無差別禁車可特別傷及需攜設備工作的群體。','所有工人帶設備時都能輕鬆乘坐任何擠迫巴士。','工人若需到市中心，便必然沒有任何交通選擇。','只要有禁令，工作所需的重型設備便自動消失。'],['特殊需求不能忽略。','不實。','過度。','荒謬。'],[11,13],'unfair burden on special needs。'),
 transfer('政策目標是減擠塞，但要保留必要駕車。','哪句提供合比例方案？',['擠塞收費與改善公交並用，減少非必要車程。','只以全面禁令處理，也不設任何必要出行例外。','取消全部公交班次，讓每名居民只可自行開車。','增加免費泊車位，卻不評估路面擠塞程度。'],['價格與替代服務並用。','欠公平。','反效果。','未減塞。'],[15,16],'reduce use without punishing need。'),
 transfer('商圈禁車後，供應商無法送貨。','哪句補充商業影響？',['供應鏈出行受阻，商戶可能承受營運損失。','商戶若不能送貨，營業額便必然立即翻倍。','只有遊客出行重要，顧客和員工都毋須到場。','供應商不能送貨，仍可保證所有貨品照常上架。'],['企業依賴便利出行。','相反。','各方重要。','不保證。'],[12],'businesses could suffer。'),
 transfer('有人只說全面禁車「更乾淨」。','哪句補上另一方必要考量？',['還需考察公交替代能力及特殊群體的進城需求。','只要空氣較乾淨，居民交通需求便全部消失。','任何城市都不必比較商業出行與公共交通。','只看街道美觀，便能保證政策對每人都公平。'],['環境收益外還要公平。','過度。','需比較。','不足。'],[6,10,11],'benefit vs practicality。'),
 transfer('一項規則在文件上簡單，實施後卻擾亂居民。','哪句貼合文章的推論？',['表面簡單的禁令可能使特定需求者負擔更重。','政策只要文字短，就保證不會影響任何日常生活。','執行後有問題，便證明擠塞與污染完全不存在。','只要規則涉及交通，便不能再考慮公平與效率。'],['紙上簡單不等於公平。','不保證。','不相關。','仍要考慮。'],[13],'simple on paper, unfair in practice。'),
 transfer('另一題討論是否完全禁止市中心貨車。','哪句可轉用本文框架？',['衡量污染與佔路收益，同時檢查送貨需求。','只要貨車多，就不必考慮商店能否收到貨。','只要送貨重要，交通污染便不再值得分析。','先宣布永久禁令，日後才討論有無替代路線。'],['兩方需求需同看。','忽略供應。','仍要分析。','應先規劃。'],[4,12,15],'weigh environment and practical access。'),
 transfer('政府只考慮限泊車，卻不改善單車路線。','哪句補全政策組合？',['限制泊車可與單車設施及較佳公交同步推行。','只要停車位少，單車路線自然會變得十分安全。','若公交仍不足，居民也必然停止所有私車出行。','只需限制泊車，便能保證照顧每位殘疾乘客。'],['替代交通需同時改善。','不自動。','不必然。','仍有需求。'],[15],'congestion charges and alternatives。'),
 transfer('結論要承認禁車減污，仍拒絕全面禁令。','哪句最完整？',['禁車可減污染，但全面實施欠公平，宜精準管理。','禁車既可減污染，便必須無例外地永久執行。','只要全面禁令欠公平，空氣污染就不存在。','市中心若有交通，政府便不需要作任何管理。'],['讓步後選較公平方案。','過度。','不相關。','仍需管理。'],[17,18],'although benefit, prefer management。'),
];
// Reviewed transfer alternatives and matched feedback.
const editorialTransferOptions=[["少量乘客的私車佔大量路面，阻礙巴士通行。","巴士與私車共用道路，擠塞主因仍是巴士班次太多。","私車佔路多，故應先增加泊車位以分散路面車流。","巴士常延誤，主要因乘客上落車時間較難控制。"],["若公交未能覆蓋需要，部分居民難以到達中心。","全面禁車可減擠塞，公交覆蓋則可待政策後再補。","市中心仍有道路，居民可改乘巴士，即使班次很少。","禁令可迫使居民轉乘，未覆蓋地區則改靠步行。"],["無差別禁車可特別傷及需攜設備工作的群體。","工人可改乘巴士，設備運送則由商店另外安排。","禁令對乘客相同，故工人的實際負擔也大致相同。","工人需帶工具，但可先存放市中心再分次出行。"],["擠塞收費與改善公交並用，減少非必要車程。","可收擠塞費，但公交不足時仍可維持原有選擇。","可改善公交，必要駕車需求則由同一禁令處理。","可提高泊車收費，卻未檢查巴士是否能承接乘客。"],["供應鏈出行受阻，商戶因而可能承受營運損失。","送貨延誤可由商店調整營業時間，成本則維持原狀。","供應商受阻，商戶可改讓顧客自行取貨而免損失。","商圈車流減少，商戶收入應由行人增加來補足。"],["還需考察公交替代能力及特殊群體的進城需求。","較乾淨的街道有益，公交能力則待禁令後測試。","減少私車可改善空氣，特殊群體可自行另找途徑。","政策應看污染讀數，居民與商戶的進城需求其次。"],["表面簡單的禁令可能使特定需求者負擔更重。","規則清晰可減執行成本，特定群體的負擔稍後再看。","禁令易於宣傳，便可推定居民已有合適替代交通。","政策在文件上簡短，現實影響則主要看罰款多少。"],["衡量污染與佔路收益，同時檢查送貨需求。","可減少貨車佔路，送貨改由商戶自行接駁處理。","貨車提供配送服務，因此污染影響可暫時不評估。","先試收費限制，商戶是否仍能送貨則留待日後。"],["限制泊車可與單車設施及較佳公交同步推行。","限泊車可少些車，但單車安全可由騎士自行處理。","公交改善後才考慮單車徑，泊車限制可先單獨實施。","停車位減少會逼人轉乘，是否有可行路線其次。"],["禁車可減污染，但全面實施欠公平，宜精準管理。","全面禁車可減污，居民差異則交由個案申訴處理。","禁令欠公平，故應以更多停車位回應污染問題。","保留駕車自由有益，減污目標可暫時不作處理。"]];
const editorialTransferReasons=[["少客私車佔路才是此處機制。","增車位未解釋私車擠佔巴士道路。","上落車時間未回應車路容量問題。"],["公交未覆蓋時，居民難即時轉乘。","班次稀少不等於巴士可達。","步行不能服務所有未覆蓋居民。"],["設備運送仍可能增加工作負擔。","同樣規則對不同需要者未必公平。","分次出行仍是額外的時間成本。"],["收費若沒有可行公交選項，效果受限。","必要駕車需求需要有針對性的例外。","只加費用，未提供較清潔替代方式。"],["調時間也未必消除供應受阻的損失。","自取貨品不能保證商戶不受影響。","行人增加不一定補回配送問題。"],["應先評估公交承接能力。","特殊群體不能靠自行摸索解決出行。","公平與服務需求也屬政策評估。"],["不能只看執行成本，須看實際負擔。","易宣傳不代表替代交通已存在。","罰款不是居民生活影響的全部。"],["商戶自行接駁仍有配送成本。","配送有用也不能忽略污染。","政策設計應先檢查送貨需求。"],["單車設施需安全，不能只靠騎士。","多種替代交通可同步改善。","居民是否有可行路線很重要。"],["個案申訴不能代替一開始的精準管理。","增泊車位不會直接處理污染。","結論仍須承認減污目標。"]];
editorialTransferOptions.forEach((row,i)=>{transfers[i].options=row;transfers[i].explanations=[transfers[i].explanations[0],...editorialTransferReasons[i]];});
// Source-aligned connector frames.
structures[6].frame.parts=[["This would not only reduce ","link","句型固定部分"],["traffic jams","slot","問題一"],[" but also lower ","link","句型固定部分"],["air pollution","slot","問題二"],[", since ","link","句型固定部分"],["fewer cars would mean fewer emissions.","slot","成因"]];
// Reviewed connector structure decompositions.
structures[1].frame.parts=[["While some people argue that ","link","句型固定部分"],["privately owned vehicles","slot","受爭議的車輛"],[" should be prohibited from ","link","句型固定部分"],["city centres","slot","受管制區域"],[", others believe that ","link","句型固定部分"],["such a policy would be impractical","slot","另一方的疑慮"],[".","link","句型固定部分"]];
structures[1].frame.formula="While some people argue that [受爭議的車輛] should be prohibited from [受管制區域], others believe that [另一方的疑慮].";
structures[5].frame.parts=[["If they were removed from ","link","句型固定部分"],["central areas","slot","車輛被移走的區域"],[", ","link","句型固定部分"],["buses, trams, cyclists, and pedestrians","slot","其他道路使用者"],[" could move far more efficiently.","link","句型固定部分"]];
structures[5].frame.formula="If they were removed from [車輛被移走的區域], [其他道路使用者] could move far more efficiently.";
structures[10].frame.parts=[["Many people depend on ","link","句型固定部分"],["private vehicles","slot","依賴的交通工具"],[" because ","link","句型固定部分"],["public transport","slot","替代交通"],[" is either ","link","句型固定部分"],["unreliable, overcrowded, or unavailable in certain areas","slot","替代交通的限制"],[".","link","句型固定部分"]];
structures[10].frame.formula="Many people depend on [依賴的交通工具] because [替代交通] is either [替代交通的限制].";
structures[13].frame.parts=[["A policy that sounds simple on paper","slot","表面簡單的政策"],[" could therefore disrupt ","link","句型固定部分"],["daily life","slot","受擾亂的生活"],[" and place an unfair burden on ","link","句型固定部分"],["people whose needs cannot be met by public transport alone","slot","承受額外負擔的人"],[".","link","句型固定部分"]];
structures[13].frame.formula="[表面簡單的政策] could therefore disrupt [受擾亂的生活] and place an unfair burden on [承受額外負擔的人].";
structures[17].frame.parts=[["In conclusion, although ","link","句型固定部分"],["banning private vehicles","slot","被討論的禁令"],[" could reduce ","link","句型固定部分"],["traffic and pollution","slot","可能減少的問題"],[", it is too rigid to work fairly in ","link","句型固定部分"],["real cities","slot","實際執行環境"],[".","link","句型固定部分"]];
structures[17].frame.formula="In conclusion, although [被討論的禁令] could reduce [可能減少的問題], it is too rigid to work fairly in [實際執行環境].";
structures[3].frame.parts=[["On the one hand, supporters of this policy argue that ","link","句型固定部分"],["a ban on private vehicles","slot","支持者提出的措施"],[" would make ","link","句型固定部分"],["city centres","slot","預期改善的地點"],[" cleaner, safer, and less crowded.","link","句型固定部分"]];
structures[3].frame.formula="On the one hand, supporters of this policy argue that [支持者提出的措施] would make [預期改善的地點] cleaner, safer, and less crowded.";
structures[4].frame.parts=[["Private cars","slot","佔用路面的車輛"],[" often carry only ","link","句型固定部分"],["one or two passengers","slot","載客量"],[", yet they occupy ","link","句型固定部分"],["a large amount of road space","slot","佔用的空間"],[".","link","句型固定部分"]];
structures[4].frame.formula="[佔用路面的車輛] often carry only [載客量], yet they occupy [佔用的空間].";
structures[7].frame.parts=[["For example, ","link","句型固定部分"],["a busy shopping district","slot","可能改善的地點"],[" with fewer ","link","句型固定部分"],["private vehicles","slot","需要減少的車輛"],[" would likely become more pleasant for ","link","句型固定部分"],["residents, workers, and visitors alike","slot","受益的人"],[".","link","句型固定部分"]];
structures[7].frame.formula="For example, [可能改善的地點] with fewer [需要減少的車輛] would likely become more pleasant for [受益的人].";
structures[8].frame.parts=[["From this perspective, ","link","句型固定部分"],["restricting car access","slot","提出的限制"],[" seems to be a direct way to improve ","link","句型固定部分"],["urban life","slot","要改善的生活"],[".","link","句型固定部分"]];
structures[8].frame.formula="From this perspective, [提出的限制] seems to be a direct way to improve [要改善的生活].";
structures[15].frame.parts=[["A better approach would be to reduce car use through ","link","句型固定部分"],["congestion charges","slot","收費措施"],[", ","link","句型固定部分"],["improved public transport","slot","公共交通改善"],[", ","link","句型固定部分"],["limited parking","slot","泊車限制"],[", and ","link","句型固定部分"],["better cycling infrastructure","slot","單車設施改善"],[".","link","句型固定部分"]];
structures[15].frame.formula="A better approach would be to reduce car use through [收費措施], [公共交通改善], [泊車限制], and [單車設施改善].";
// Source-aligned remaining frames.
structures[11].frame.parts=[["Elderly people, disabled passengers, families with young children, and workers who carry equipment","slot","多個群體"],[" may find it especially difficult to ","link","句型固定部分"],["enter city centres","slot","目的地"],[" without ","link","句型固定部分"],["their own cars.","slot","工具"]];
structures[16].frame.parts=[["These measures","slot","替代措施"],[" would ease congestion without punishing ","link","句型固定部分"],["people who genuinely need to drive.","slot","確有需要者"]];
export default {key:'discuss-both-views:42',meta:{topic:'市中心應否全面禁止私家車',summary:'先承認少私車可減塞減污，再檢查公交不足、特殊群體和商業出行的公平代價，提出擠塞費、改善公交、限泊車及單車設施的較靈活組合。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

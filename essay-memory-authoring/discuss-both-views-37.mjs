// International sports hosting: economic/cultural gains, costs, and planning conditions.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['discuss-both-views:37'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Many governments now see world sports events as good chances to make more people know about their country.',
 'Some say holding these events causes serious money and community problems, but I think the good results over many years are greater.',
 'First, many countries want to hold big sports events because they can earn money and improve how others see them.',
 'When a country receives players, reporters and visitors, local hotels, restaurants, airlines and shops often get much more business.',
 'More important, the events can make the world notice a country.',
 'A successful Olympic Games or World Cup lets the country holding it show that it is modern, well run and interesting to visit.',
 'This can help bring tourists even after the games end.',
 'Also, a big sports event can bring people together for a special national time and make them proud in a way normal government work rarely does.',
 'But people against these events say that holding them can cost far too much.',
 'Governments may spend huge amounts on sports grounds, roads and trains, safety and short-term buildings even though schools, hospitals and homes need money soon.',
 'If people hardly use the places later, they may become costly buildings with little use instead of useful public places.',
 'Local people may also face problems, especially if building work brings traffic, noise or even forces people to move home.',
 'For countries with little money, these dangers may make holding a world sports event feel like a problem rather than a good thing.',
 'But I do not think these problems are greater than the good results.',
 'The real problem is bad planning, not the event itself.',
 'If governments make buildings people can still use later and watch spending, the events can bring tourists, improve roads and transport and bring people together as a country.',
 'To sum up, big sports events may cost a lot and disturb local people, but countries should still hold them because their money, culture and community gains are greater.',
];
const vocabulary=[
 v(['International sporting events','world sports events','國際體育賽事'],['governments','governments','政府'],['powerful opportunities','good chances','重要機會'],['raise their country’s profile','make more people know about their country','提升國家知名度']),
 v(['hosting','holding','舉辦'],['financial','money','財政'],['social problems','community problems','社會問題'],['long-term benefits','good results over many years','長期利益'],['outweigh','are greater','大於']),
 v(['eager to host','want to hold','渴望舉辦'],['economic','earn money','經濟'],['reputational rewards','improve how others see them','聲譽回報']),
 v(['welcomes','receives','迎接'],['journalists','reporters','記者'],['spectators','visitors','觀眾'],['significant boost','much more business','顯著帶動']),
 v(['More importantly','More important','更重要的是'],['put a country on the world map','make the world notice a country','令國家受到世界注意']),
 v(['host nation','country holding it','主辦國'],['present itself','show','展示'],['organised','well run','有組織'],['culturally attractive','interesting to visit','文化吸引力']),
 v(['strengthen tourism','help bring tourists','促進旅遊'],['after the final whistle has blown','after the games end','賽後']),
 v(['In addition','Also','此外'],['unite citizens','bring people together','團結國民'],['shared national moment','special national time','共同國家時刻'],['sense of pride','make them proud','自豪感'],['rarely generate','rarely does','很少產生']),
 v(['On the other hand','But','另一方面'],['critics','people against these events','批評者'],['costs','cost','成本'],['dangerously high','far too much','高得危險']),
 v(['enormous sums','huge amounts','巨額資金'],['stadiums','sports grounds','體育場'],['transport systems','roads and trains','交通系統'],['temporary facilities','short-term buildings','臨時設施'],['urgent investment','need money soon','急需投資']),
 v(['venues','places','場館'],['rarely used afterwards','hardly use','賽後少用'],['expensive “white elephants”','costly buildings with little use','昂貴白象工程'],['valuable public assets','useful public places','有價值公共資產']),
 v(['disruption','problems','干擾'],['local residents','Local people','本地居民'],['construction projects','building work','建造工程'],['relocation of communities','forces people to move home','社區搬遷']),
 v(['poorer countries','countries with little money','較貧窮國家'],['risks','dangers','風險'],['burden','problem','負擔'],['blessing','good thing','益處']),
 v(['In my view','I','在我看來'],['however','But','然而'],['outweigh','are greater','超過'],['advantages','good results','優點']),
 v(['real issue','real problem','真正問題'],['event itself','event itself','賽事本身'],['poor planning','bad planning','規劃不善']),
 v(['serve the public','people can still use','服務公眾'],['control spending carefully','watch spending','謹慎控制開支'],['generate tourism','bring tourists','帶動旅遊'],['improve infrastructure','improve roads and transport','改善基建'],['strengthen national identity','bring people together as a country','加強國家認同']),
 v(['In conclusion','To sum up','總結'],['financial pressure','cost a lot','財政壓力'],['local disruption','disturb local people','本地干擾'],['welcome them','hold them','歡迎舉辦'],['benefits are greater','gains are greater','利益較大']),
];
const part=(text,kind,label)=>[text,kind,label];
function makeFrame(i,s){const source=original[i],at=source.indexOf(s.target);if(at<0)throw Error('Missing target '+(i+1)+': '+s.target);const prefix=source.slice(0,at),suffix=source.slice(at+s.target.length);const parts=[];if(prefix)parts.push(part(prefix,'link','句型固定部分'));parts.push(part(s.target,'slot',s.slot));if(suffix)parts.push(part(suffix,'link','句型固定部分'));const formula=parts.map(([text,kind,label])=>kind==='slot'?`[${label}]`:text).join('');return {formula,meaning:s.meaning,usage:s.usage,parts}}
const specs=[
 {target:'International sporting events',replacement:'World science fairs',slot:'被政府關注的國際活動',formula:'[活動] are now seen by many governments as opportunities to [提升形象]',meaning:'國際賽事可提升國家形象。',usage:'當引言需說明政府為何重視某種國際活動時。',relation:'被動式交代政府對活動的定位',d:[1,8,13]},
 {target:'hosting these competitions',replacement:'staging a global festival',slot:'被質疑的舉辦行為',formula:'While some argue [壞處], I believe [好處] outweigh [壞處]',meaning:'先承認財政社會風險，再表明長期利益更大。',usage:'當引言要承認反方風險，並先表明最終權衡時。',relation:'While 加 outweigh 作讓步和判斷',d:[0,8,13]},
 {target:'major sports events',replacement:'international cultural festivals',slot:'想主辦的活動',formula:'On the one hand, [主辦方] are eager to host [活動] because [回報]',meaning:'政府想主辦以取得經濟及聲譽回報。',usage:'當第一方的動機可用經濟和形象回報解釋時。',relation:'because 交代首方誘因',d:[8,13,14]},
 {target:'athletes, journalists, and spectators',replacement:'musicians, reporters, and visitors',slot:'到訪的人群',formula:'When [國家] welcomes [訪客], [本地行業] receive a boost',meaning:'訪客增加可帶動酒店餐飲交通商店。',usage:'當你要用到訪人潮解釋本地商業收益時。',relation:'When 把人流連到商業結果',d:[8,9,13]},
 {target:'these events',replacement:'such a festival',slot:'提升國家知名度的活動',formula:'More importantly, [活動] can put a country on the world map',meaning:'比短期消費更重要的是國際知名度。',usage:'當你已說一項收益，要強調另一項更長遠的收益時。',relation:'More importantly 提高論證權重',d:[3,8,13]},
 {target:'Olympic Games or World Cup',replacement:'world expo or book fair',slot:'具體的國際盛事',formula:'A successful [盛事] allows the host nation to present itself as [形象]',meaning:'成功主辦可展示現代化及文化吸引力。',usage:'當你要用一個盛事例子說明主辦者如何展示形象時。',relation:'allows 連主辦成功與對外形象',d:[3,8,13]},
 {target:'tourism',replacement:'cultural exchange',slot:'賽後仍受益的領域',formula:'This can strengthen [領域] even after [事件] ends',meaning:'賽事結束後旅遊效益仍可延續。',usage:'當你要指出短期活動結束後仍有持續效益時。',relation:'even after 強調長期延續',d:[3,8,13]},
 {target:'large sporting events',replacement:'national celebrations',slot:'凝聚國民的活動',formula:'In addition, [活動] can unite citizens behind [共同時刻]',meaning:'大型賽事可帶來少見的共同自豪感。',usage:'當你要在經濟理由之外補充社會凝聚收益時。',relation:'In addition 由經濟轉向社會收益',d:[3,8,13]},
 {target:'hosting such events',replacement:'staging those festivals',slot:'有成本的舉辦行為',formula:'On the other hand, critics argue that the costs of [活動] can be [程度]',meaning:'批評者擔心主辦成本過高。',usage:'當你要切換到另一方，先概述其成本主張時。',relation:'On the other hand 引入成本反方',d:[3,4,13]},
 {target:'stadiums',replacement:'exhibition halls',slot:'重大建設項目',formula:'Governments may spend [巨款] on [設施] even when [民生項目] need investment',meaning:'場館交通保安支出可能擠走迫切民生投資。',usage:'當你要用有限預算的機會成本解釋公共支出爭議時。',relation:'even when 突出公共資源取捨',d:[3,4,13]},
 {target:'venues',replacement:'buildings',slot:'賽後可能閒置的場館',formula:'If [設施] are rarely used afterwards, they can become [負擔] rather than [資產]',meaning:'閒置場館或成昂貴白象工程。',usage:'當你要說明建設若缺乏後續用途，收益會變負擔時。',relation:'If 加 rather than 對照閒置與資產',d:[3,4,13]},
 {target:'construction projects',replacement:'roadworks',slot:'造成干擾的工程',formula:'There may also be disruption, especially when [工程] cause [影響]',meaning:'建造可帶來交通噪音甚至搬遷。',usage:'當你要把宏觀成本具體落到居民日常影響時。',relation:'especially when 列出居民承受的干擾',d:[3,4,13]},
 {target:'poorer countries',replacement:'small cities',slot:'承擔能力較弱的主辦者',formula:'For [資源較少者] in particular, risks can make [活動] a burden rather than a blessing',meaning:'較貧窮國家更可能承受不起風險。',usage:'當同一政策的風險對資源較少者尤其重大時。',relation:'in particular 限定高風險群體',d:[3,4,13]},
 {target:'these problems',replacement:'those costs',slot:'前段承認的問題',formula:'In my view, however, [問題] do not outweigh [好處]',meaning:'作者認為成本尚未超過好處。',usage:'當你已公平陳述反方，需轉回自己的整體權衡時。',relation:'however 加 outweigh 轉回作者判斷',d:[3,8,16]},
 {target:'poor planning',replacement:'weak budget control',slot:'真正的政策失誤',formula:'The real issue is not [活動本身], but [可改善的失誤]',meaning:'真正問題是規劃不善而非賽事本身。',usage:'當你要區分一項活動本身與可修正的執行缺陷時。',relation:'not ... but ... 分離活動與治理失誤',d:[8,9,13]},
 {target:'facilities that serve the public after the tournament',replacement:'facilities that residents can use for years',slot:'賽後持續可用的設施',formula:'If [政府採取長期規劃並控費], events can [多種收益]',meaning:'賽後可用場館與控費令旅遊基建認同效益成立。',usage:'當你的主張須以具體規劃與預算條件為前提時。',relation:'If 把條件和多項成果接起',d:[8,9,13]},
 {target:'hosting major sports events',replacement:'hosting global science fairs',slot:'結論中的主辦行為',formula:'In conclusion, although [成本], I believe [主辦] because [收益較大]',meaning:'承認壓力干擾後，仍因總收益較大支持主辦。',usage:'當結論需承認實際代價，仍按權衡作最後判斷時。',relation:'although 加 because 收束兩方與結論',d:[8,9,13]},
];
const structures=specs.map((s,i)=>({example:original[i].replace(s.target,s.replacement),distractors:s.d,frame:makeFrame(i,s),answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}));
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先辨收益與成本，再看規劃條件。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[quiz('作者最後支持哪種立場？',['經審慎規劃後仍應主辦大型國際賽事。','任何國家都應無條件大建閒置場館。','只要有建築噪音就必須禁止所有賽事。','主辦賽事沒有任何經濟或文化益處。'],'支持以可持續設施及控費為條件。'),{type:'multi',prompt:'文章同時談到哪兩類影響？',detail:'選兩項，再按「確認」。',options:['旅遊、國家形象及凝聚力。','高成本、閒置場館及居民干擾。','賽事可保證永久零成本。','所有臨時場館必然成公共資產。'],correct:[0,1],why:'收益與代價均獲具體分析。'}];
const route=[sequence('還原五段論證',[['引言','國際賽事提升形象；作者認為長期利益較大。'],['收益','訪客帶動商業，對外形象、旅遊與國民自豪感延續。'],['代價','預算擠壓民生，賽後閒置，工程干擾居民。'],['權衡','問題是規劃；設施賽後可用並控費可保留收益。'],['結論','承認壓力與干擾，仍支持條件良好的主辦。']],'第五段收束前先給可執行的規劃條件。')];
const evidence=[quiz('酒店與餐廳為何可能受益？',['運動員、記者及觀眾增加本地消費。','所有場館日後必定完全不用維修。','政府會停止所有公共交通建設。','每一位旅客都必須永久留在當地。'],'訪客人流帶動短期業務。'),quiz('何謂賽事的較長期效益？',['國際形象提高，可延續旅遊吸引力。','只有比賽當天可以吸引任何旅客。','場館建成便保證所有居民搬遷。','主辦一次便不用再管理旅遊服務。'],'世界能見度可在賽後延續。'),quiz('白象工程何時出現？',['昂貴場館賽後少用，難成公共資產。','公共場館長期服務居民且經常使用。','政府先控制預算再安排賽後用途。','場館改作市民日常可用的活動中心。'],'關鍵是後續使用。'),quiz('作者提出哪些改善條件？',['控制開支，建賽後仍服務公眾的設施。','只增建臨時設施，不需想賽後用途。','只求高開支，以免節省任何建造費。','把所有體育館封閉，不讓居民使用。'],'有效規劃而非活動本身是關鍵。')];
const logic=[sequence('收益如何形成',[['人潮','運動員記者及觀眾到訪。'],['短期經濟','酒店餐飲航空及商店受益。'],['形象','主辦國展示現代化與文化魅力。'],['持續效益','賽後旅遊及國民認同仍可受益。']],'人流與形象效益不可混為一項。'),sequence('代價與條件',[['預算','場館交通保安支出可能擠壓民生。'],['閒置','賽後少用會形成白象工程。'],['居民','建造期交通噪音與搬遷。'],['補救','建賽後可用設施並仔細控費。']],'規劃條件針對反方指出的問題。')];
const transfers=[
 transfer('小城想主辦國際藝術節，預算有限。','哪句可轉用文章的權衡？',['比較旅遊收益與民生支出，再決定場館用途。','只計開幕日收入，完全不問後續場館用途。','只要活動國際化，就不用再檢查公共預算。','只看本地媒體報道，便可證明全部成本合理。'],['收益與成本要一同審視。','忽略長期。','仍要控費。','不足。'],[9,10,15],'benefit/cost plus planning。'),
 transfer('政府準備興建大型場館供兩週賽事。','哪句能避免白象工程？',['先安排賽後社區使用，再審慎控制建造成本。','賽事完結後永久封館，維修費仍照常支付。','只要座位夠多，便不必問居民日後會否使用。','把賽後所有活動取消，免得場館出現人流。'],['長期用途對準白象風險。','加劇閒置。','仍需用途。','相反。'],[10,14,15],'venues serve public afterwards。'),
 transfer('大型賽事期間餐飲業銷售上升。','哪句準確說明直接原因？',['外來參賽者與觀眾增加，帶來本地消費。','只要興建場館，餐廳收入便保證年年上升。','比賽即使沒有訪客，所有餐館仍必然客滿。','主辦賽事後，學校預算就必定完全不受影響。'],['訪客人流推動短期收益。','無保證。','無訪客難推論。','另有成本。'],[3],'visitor boost businesses。'),
 transfer('有人只談賽事當週商店收入。','哪句補上另一類長期利益？',['成功主辦可改善國際形象，並延續旅遊吸引力。','比賽結束後，國際形象必定立即完全消失。','酒店旺季可證明場館在未來每天都會使用。','只要有商店收入，居民便不可能受到任何干擾。'],['形象與旅遊可延續。','相反。','不等於場館用途。','仍有干擾。'],[4,5,6],'world map and post-event tourism。'),
 transfer('場館工地令鄰近居民長期受噪音影響。','哪句呈現反方的社會成本？',['建造工程會干擾生活，甚至迫使部分居民搬遷。','建造工程只影響運動員，完全不會影響居民。','只要賽事受歡迎，交通噪音便不算任何成本。','只要改善形象，社區搬遷便必然不會再發生。'],['居民承擔干擾。','忽略居民。','仍是成本。','無保證。'],[11,12],'local disruption。'),
 transfer('另一國極需投資學校與醫院。','哪句指出主辦賽事的機會成本？',['巨額場館開支或擠走迫切的教育醫療投資。','興建場館必然同時增加所有學校和醫院預算。','只要主辦賽事，住房需求便會立即全部消失。','只談場館外觀，不必問公共資金另有何用途。'],['資源選擇有代價。','無保證。','不相關。','要比較。'],[9,12],'urgent public investment。'),
 transfer('有人說「成本高，所以國際活動都應取消」。','哪句更合本文立場？',['先看規劃與賽後用途，再判斷收益能否勝成本。','只要成本稍高，所有國際活動都必須永遠停辦。','只要可能有旅客，政府就可無上限興建場館。','完全不比較兩方證據，便可斷言活動必然成功。'],['條件化權衡。','過廣。','忽略控費。','缺證據。'],[13,14,15],'poor planning vs event itself。'),
 transfer('主辦方想提升國家認同，卻只談收入。','哪句補上非經濟收益？',['共同賽事可凝聚國民，帶來難得的集體自豪。','只要增加門票收入，國民便一定不再有分歧。','只有政府工程才可能令國民產生任何共同感。','主辦國只需關心收入，不必考慮文化與社會。'],['有社會凝聚收益。','不保證。','原文相反。','忽略收益。'],[7],'shared national moment。'),
 transfer('較窮國家評估是否主辦世界賽事。','哪句顯示風險有條件差異？',['同一高額成本對財力較弱國家可能更難承受。','所有國家財力完全一樣，所以預算不需比較。','只要國家較窮，旅遊收入便永遠不可能增加。','富裕國家和較窮國家必須建同一數量場館。'],['風險受資源能力影響。','不實。','過度。','無須相同。'],[12],'poorer countries risk。'),
 transfer('作文結論須承認成本，仍支持有條件主辦。','哪句最完整？',['雖有財政與居民壓力，妥善規劃仍可帶來更大收益。','既然可能有財政壓力，就必須永遠禁止所有賽事。','只要能帶動旅遊，居民搬遷和閒置便不必討論。','因為規劃可以改善，所以任何開支都不用再監督。'],['讓步後按規劃條件權衡。','過度。','需處理。','仍需監督。'],[15,16],'although costs, benefits greater。'),
];
// Reviewed transfer alternatives and matched feedback.
const editorialTransferOptions=[["比較旅遊收益與民生支出，再決定場館用途。","先計開幕收入，再以票房決定學校與醫院的分配。","先估外來旅客人數，場館賽後安排留待興建後定。","比較媒體曝光與門票價格，民生預算可日後再議。"],["先安排賽後社區使用，再審慎控制建造成本。","先擴大座位數量，賽後使用由下一屆政府安排。","以較低造價建館，但賽後維修與社區需求未評估。","把場館設在市中心，賽後可視人流再決定用途。"],["外來參賽者與觀眾增加，帶來本地餐飲消費。","新場館增加工作機會，因此餐飲收入會持續增長。","餐飲收入上升主要因本地居民改變用餐時間。","賽事帶來電視曝光，餐廳因此直接增加外國顧客。"],["成功主辦可改善國際形象，並延續旅遊吸引力。","當週銷售增長，足以預測場館往後的日常使用。","國際形象改善只看開幕表演，旅遊後效難以評估。","餐館和酒店受益，國際形象則主要靠場館規模。"],["建造工程會干擾生活，甚至迫使部分居民搬遷。","施工噪音屬短期問題，居民生活可待賽後才評估。","工程可能影響交通，但搬遷只與住房價格有關。","場館可增加旅客，因此居民的干擾應由商戶承擔。"],["巨額場館開支或擠走迫切的教育醫療投資。","場館或創造職位，因此教育醫療投資可延後數年。","比賽可增加旅遊收入，醫院預算便可維持原狀。","新場館帶來形象收益，但未比較學校的資金缺口。"],["先看規劃與賽後用途，再判斷收益能否勝成本。","成本高可用更多門票收入彌補，賽後安排其次。","賽後場館可用，便可直接假定主要成本值得付。","活動有旅遊收益，故應只比較短期收入與建造費。"],["共同賽事可凝聚國民，帶來難得的集體自豪。","可在場館展示國旗，但國民認同仍主要靠門票收入。","共同賽事有國際曝光，凝聚感則只看媒體報道。","國民可為成績自豪，主辦活動的社會作用未說明。"],["同一高額成本對財力較弱國家可能更難承受。","較窮國家可吸引旅客，因此建館成本相對更容易負擔。","相同建造費佔預算比例不同，但仍應照搬富國方案。","主辦賽事可提高形象，因而不需考慮財政承受力。"],["雖有財政與居民壓力，妥善規劃仍可帶來更大收益。","賽事能帶來旅遊收入，所以財政壓力可日後處理。","居民受干擾，故應先取消賽事再考慮規劃可能。","妥善規劃可減少閒置，但結論未交代成本取捨。"]];
const editorialTransferReasons=[["票房不能代替民生開支與賽後場館用途比較。","先建後定用途會增加閒置風險。","媒體和票價未處理公共預算壓力。"],["座位多不等於賽後有人使用。","造價與後續維修及社區用途都須考慮。","地點不能代替明確的賽後用途。"],["工作機會不是此處餐飲銷售的直接機制。","題目明示大型賽事引入外來客。","電視曝光不等於觀眾親身到店消費。"],["一週收入無法證明長期使用。","國際形象不只取決於開幕表演。","形象與旅遊吸引力不只看場館規模。"],["長期施工干擾不宜延後處理。","工程和搬遷都可能影響社區。","商戶受益不能替居民承擔干擾。"],["迫切的教育醫療需求不應無條件延後。","未證明旅遊收入足以補回醫療開支。","只承認形象，未衡量公共資金的替代用途。"],["高收入也須考慮賽後閒置。","賽後可用不等於成本都合理。","還要考慮居民及長期成本。"],["國旗展示未解釋共同賽事帶來的認同。","媒體報道不等於國民共同經驗。","要把成績與主辦所凝聚的集體自豪連起來。"],["旅客收入可能增加，財政承受力仍較弱。","財力不同，不能照搬同一建館方案。","形象收益不能免除成本評估。"],["支持有條件主辦須正視財政壓力。","不必先取消，應看規劃能否改善。","結論應平衡收益與居民財政成本。"]];
editorialTransferOptions.forEach((row,i)=>{transfers[i].options=row;transfers[i].explanations=[transfers[i].explanations[0],...editorialTransferReasons[i]];});
// Source-aligned connector frames.
structures[2].frame.parts=[["On the one hand, ","link","句型固定部分"],["many countries","slot","主辦方"],[" are eager to host ","link","句型固定部分"],["major sports events","slot","活動"],[" because ","link","句型固定部分"],["they can bring economic and reputational rewards.","slot","回報"]];
structures[10].frame.parts=[["If ","link","句型固定部分"],["the venues","slot","設施"],[" are rarely used afterwards, they can become ","link","句型固定部分"],["expensive “white elephants”","slot","負擔"],[" rather than ","link","句型固定部分"],["valuable public assets.","slot","資產"]];
structures[13].frame.parts=[["In my view, however, ","link","句型固定部分"],["these problems","slot","問題"],[" do not outweigh ","link","句型固定部分"],["the advantages.","slot","好處"]];
structures[16].frame.parts=[["In conclusion, although ","link","句型固定部分"],["hosting major sports events can create financial pressure and local disruption","slot","成本"],[", I believe ","link","句型固定部分"],["countries should still welcome them","slot","主辦"],[" because ","link","句型固定部分"],["their economic, cultural, and social benefits are greater.","slot","收益較大"]];
// Reviewed connector structure decompositions.
structures[1].frame.parts=[["While some people argue that ","link","句型固定部分"],["hosting these competitions","slot","受爭議的活動"],[" creates ","link","句型固定部分"],["serious financial and social problems","slot","反方指出的問題"],[", I believe that ","link","句型固定部分"],["the long-term benefits","slot","作者看重的好處"],[" outweigh ","link","句型固定部分"],["these drawbacks","slot","已承認的代價"],[".","link","句型固定部分"]];
structures[1].frame.formula="While some people argue that [受爭議的活動] creates [反方指出的問題], I believe that [作者看重的好處] outweigh [已承認的代價].";
structures[15].frame.parts=[["If governments build ","link","句型固定部分"],["facilities that serve the public after the tournament","slot","賽後可供使用的設施"],[" and control spending carefully, ","link","句型固定部分"],["international sports events","slot","活動"],[" can generate ","link","句型固定部分"],["tourism, improve infrastructure, and strengthen national identity","slot","可能產生的多種收益"],[".","link","句型固定部分"]];
structures[15].frame.formula="If governments build [賽後可供使用的設施] and control spending carefully, [活動] can generate [可能產生的多種收益].";
// Keep the displayed formula synchronized with the exact fixed and replaceable source spans.
for(const card of structures)card.frame.formula=card.frame.parts.map(part=>{const [text,kind,label]=Array.isArray(part)?part:[part.text,part.kind,part.label];return kind==='slot'?`[${label}]`:text}).join('');
export default {key:'discuss-both-views:37',meta:{topic:'國家主辦國際體育賽事的得失',summary:'區分訪客帶動的短期收入與賽後形象旅遊、國民凝聚效益，公平處理公共預算、白象場館和居民干擾，結論以賽後用途及控費為條件。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

// Frequent international flights: tourism and mobility versus emissions and land pressure.
import fs from 'node:fs';
const groups=JSON.parse(fs.readFileSync(new URL('../tools/essay-memory-sentence-groups.json',import.meta.url),'utf8')).essays['advantage-disadvantage:24'];
const original=groups.map(row=>row.english);
const v=(...rows)=>rows;
const simple=[
 'Flying to other countries used to be something only a few people could pay for, but it is now a normal part of life.',
 'This change has brought real good points for people and businesses. Still, I think the harm to nature is greater.',
 'The good points are real, but the harm to nature affects more places and is much harder to fix.',
 'More regular flights between countries have brought several important good points.',
 'First, they have helped travel businesses grow and helped trade between countries.',
 'When people can travel quickly and at a fairly low cost, more visitors spend money on places to stay, food and local travel; this supports jobs and brings in taxes.',
 'For example, many jobs in islands and towns by the sea depend directly on visitors from other countries.',
 'Second, having many flights has made it much easier for students and workers to move between countries.',
 'People can therefore study abroad, go to meetings in other countries and build business links; these activities help people share skills, knowledge and money for new projects.',
 'For example, a student who learns skills in another country and then comes home may bring useful knowledge to local businesses.',
 'Even so, the harm to nature is more serious.',
 'The clearest problem is that flying creates a lot of pollution that warms the planet.',
 'Every flight uses a great deal of plane fuel and sends gas and other pollution into the air. When this happens across millions of trips, it makes changes to the climate happen faster and harms the environment.',
 'One holiday flight may look small, but the combined effect of very many trips is huge.',
 'Also, more flights put extra pressure on the environment around airports and holiday places.',
 'More passengers mean bigger airports, more roads and more buildings for visitors. These take up land, create waste and put pressure on places where plants and animals live.',
 'For example, more visitors to popular places by the sea often cause wildlife homes to be lost, more rubbish and less of the things nature provides.',
 'To sum up, regular flights between countries clearly help businesses grow, people move and countries connect.',
 'Even so, they greatly increase air pollution and add wider harm to nature, so their bad points for the environment are greater than the good points.',
 'For this reason, the growth in flying between countries is a bad change overall.',
];
const vocabulary=[
 v(['International air travel','Flying to other countries','國際航空旅行'],['once a luxury','used to be something only a few people could pay for','曾是奢侈活動'],['routine feature','normal part','日常現象']),
 v(['undeniable social and economic benefits','real good points for people and businesses','社會經濟好處'],['firm view','think','堅定立場'],['outweighed','greater','被超過'],['natural environment','nature','自然環境']),
 v(['advantages are real','good points are real','優點確實存在'],['ecological costs','harm to nature','生態代價'],['wider in scale','affects more places','影響範圍更廣'],['difficult to reverse','harder to fix','較難逆轉']),
 v(['regular international flights','regular flights between countries','定期國際航班'],['important benefits','important good points','重要好處']),
 v(['stimulated tourism','helped travel businesses grow','刺激旅遊業'],['cross-border business','trade between countries','跨境商業']),
 v(['relatively cheaply','at a fairly low cost','相對便宜'],['accommodation','places to stay','住宿'],['local transport','local travel','本地交通'],['supports employment','supports jobs','支持就業'],['generates tax revenue','brings in taxes','產生稅收']),
 v(['island nations','islands','島國'],['coastal cities','towns by the sea','沿海城市'],['depend directly on','depend directly on','直接依賴'],['overseas travellers','visitors from other countries','海外旅客']),
 v(['frequent flights','many flights','頻繁航班'],['global mobility','move between countries','全球流動'],['professionals','workers','專業人士']),
 v(['study abroad','study abroad','海外升學'],['international conferences','meetings in other countries','國際會議'],['commercial partnerships','business links','商業合作'],['exchange of skills, knowledge and investment','share skills, knowledge and money for new projects','技能知識投資交流']),
 v(['trains overseas','learns skills in another country','海外受訓'],['returns home','comes home','回國'],['valuable expertise','useful knowledge','寶貴專業知識'],['local industries','local businesses','本地產業']),
 v(['Even so','Even so','即使如此'],['environmental disadvantages','harm to nature','環境缺點'],['more serious','more serious','較嚴重']),
 v(['clearest problem','clearest problem','最明顯問題'],['highly carbon-intensive','creates a lot of pollution that warms the planet','高度碳密集']),
 v(['aviation fuel','plane fuel','航空燃料'],['carbon dioxide and other pollutants','gas and other pollution','二氧化碳與污染物'],['atmosphere','air','大氣'],['millions of journeys','millions of trips','數百萬旅程'],['accelerates climate change','makes changes to the climate happen faster','加速氣候變化']),
 v(['single holiday flight','One holiday flight','單一次度假航班'],['insignificant','small','微不足道'],['cumulative effect','combined effect','累積影響'],['countless such trips','very many trips','無數類似旅程']),
 v(['Furthermore','Also','此外'],['expansion of air travel','more flights','航空旅行擴展'],['environmental pressure on the ground','pressure on the environment around airports and holiday places','地面環境壓力']),
 v(['tourist infrastructure','buildings for visitors','旅遊基建'],['consume land','take up land','佔用土地'],['produce waste','create waste','產生廢物'],['fragile ecosystems','places where plants and animals live','脆弱生態系統']),
 v(['popular coastal destinations','popular places by the sea','熱門海岸目的地'],['rising visitor numbers','more visitors','遊客上升'],['habitat loss','wildlife homes to be lost','棲息地流失'],['litter','rubbish','垃圾'],['resource depletion','less of the things nature provides','資源耗竭']),
 v(['In conclusion','To sum up','總結'],['promote prosperity','help businesses grow','促進繁榮'],['mobility','people move','流動性'],['global connection','countries connect','全球連結']),
 v(['Nevertheless','Even so','然而'],['increase emissions','increase air pollution','增加排放'],['intensify wider ecological damage','add wider harm to nature','加劇生態破壞'],['outweigh their advantages','greater than the good points','大於好處']),
 v(['For this reason','For this reason','基於此原因'],['growth of international air travel','growth in flying between countries','國際航空旅行增長'],['negative development overall','bad change overall','整體負面發展']),
];
const part=(text,kind,label)=>[text,kind,label];
function frame(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slotIndex=0;for(const fixed of links){const at=text.indexOf(fixed,cursor);if(at<0)throw Error('Missing fixed phrase '+(i+1)+': '+fixed);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slotIndex++]||'換入內容'));parts.push(part(fixed,'link','句型固定部分'));cursor=at+fixed.length}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slotIndex++]||'換入內容'));return {formula,meaning,usage,parts}}
const specs=[
 {example:'Online study, once a service used by a small minority, has become a routine feature of modern life.',d:[1,3,10],relation:'once...has become 對照過去少數與現在普遍',formula:'[事物], once [過去狀態], has become [現在狀態]',meaning:'國際航空旅行由少數人的奢侈活動變成日常。',links:[', once ', ', has become '],labels:['事物','過去狀態','現在狀態']},
 {example:'While this trend has brought undeniable social and economic benefits, I take the firm view that these gains are outweighed by the damage it causes to local rivers.',d:[0,10,17],relation:'While 承認社經好處，再說環境損害較重',formula:'While [已承認好處], I take the firm view that these gains are outweighed by [較重損害]',meaning:'作者承認航空旅行有社經收益，仍認為自然損害較重。',links:['While ', ', I take the firm view that these gains are outweighed by '],labels:['已承認好處','較重損害']},
 {example:'The advantages are real, but the long-term costs are wider in scale and far more difficult to reverse.',d:[1,10,17],relation:'but 比較收益存在與環境代價規模和可逆性',formula:'The advantages are real, but [代價] are wider in scale and far more difficult to reverse',meaning:'好處真實，但生態代價更廣且難逆轉。',links:['The advantages are real, but ', ' are wider in scale and far more difficult to reverse.'],labels:['較難逆轉的代價']},
 {example:'On the one hand, the rise in regular train services has created several important benefits.',d:[2,10,17],relation:'On the one hand 開始正面段落',formula:'On the one hand, the rise in [活動] has created several important benefits',meaning:'定期國際航班增加確有幾項好處。',links:['On the one hand, the rise in ', ' has created several important benefits.'],labels:['增加的活動']},
 {example:'First, it has stimulated local tourism and small-business sales.',d:[3,7,10],relation:'First 提出旅遊和跨境商業好處',formula:'First, it has stimulated [兩項經濟活動]',meaning:'航班增加促進旅遊及跨境商業。',links:['First, it has stimulated '],labels:['受促進的活動']},
 {example:'When visitors are able to travel quickly and relatively cheaply, more visitors spend money on hotels, food and trains, which then supports employment and generates tax revenue.',d:[4,10,11],relation:'When 條件帶來旅客支出，which 推至就業與稅收',formula:'When [旅行條件], more visitors spend money on [本地服務], which then supports employment and generates tax revenue',meaning:'快捷較便宜的旅行令旅客消費，支撐工作與稅收。',links:['When ', ', more visitors spend money on ', ', which then supports employment and generates tax revenue.'],labels:['旅行條件','旅客消費']},
 {example:'In many coastal towns, for example, large numbers of jobs depend directly on summer visitors.',d:[4,10,11],relation:'以海岸地方的旅遊工作舉例',formula:'In many [地方], for example, large numbers of jobs depend directly on [旅客]',meaning:'部分島國和沿海城市的工作直接依賴海外旅客。',links:['In many ', ', for example, large numbers of jobs depend directly on '],labels:['地方','旅客來源']},
 {example:'Second, frequent trains have made daily mobility far easier for students and professionals.',d:[4,10,11],relation:'Second 轉到學生與專業人士的流動好處',formula:'Second, frequent [服務] have made [流動範圍] far easier for [群體]',meaning:'頻繁航班使學生和專業人士跨國移動更易。',links:['Second, frequent ', ' have made ', ' far easier for '],labels:['服務','流動範圍','受益者']},
 {example:'This means that people can study abroad, attend specialist conferences and develop research partnerships, all of which promote the exchange of skills and knowledge.',d:[4,10,11],relation:'all of which 回指前列多項跨國活動的共同交流效果',formula:'This means that people can [多項跨國活動], all of which promote [交流成果]',meaning:'升學、會議及合作可促進技能、知識與投資交流。',links:['This means that people can ', ', all of which promote '],labels:['多項活動','共同交流成果']},
 {example:'A nurse who trains overseas and later returns home, for instance, may contribute valuable expertise to local clinics.',d:[4,10,11],relation:'返鄉專業人士例子落實知識回流',formula:'A [人物] who trains overseas and later returns home, for instance, may contribute valuable expertise to [本地對象]',meaning:'海外受訓者回國或可把專業知識帶給本地產業。',links:['A ', ' who trains overseas and later returns home, for instance, may contribute valuable expertise to '],labels:['受訓者','本地受益者']},
 {example:'Even so, the long-term environmental disadvantages are more serious.',d:[4,7,17],relation:'Even so 承認好處後轉到更重環境代價',formula:'Even so, the [代價種類] disadvantages are more serious',meaning:'作者認為環境缺點更嚴重。',links:['Even so, the ', ' disadvantages are more serious.'],labels:['較重代價種類']},
 {example:'The clearest problem is that long-haul travel is highly carbon-intensive.',d:[4,10,14],relation:'點出首要環境問題為高碳排',formula:'The clearest problem is that [活動] is highly carbon-intensive',meaning:'航空旅行排放大量溫室氣體。',links:['The clearest problem is that ', ' is highly carbon-intensive.'],labels:['高碳活動']},
 {example:'Every journey burns substantial quantities of fuel, releasing harmful gases into the atmosphere; when this is repeated across millions of journeys, it worsens environmental instability.',d:[4,10,14],relation:'單次燃料排放與數百萬次累積效應相連',formula:'Every [單次活動] burns substantial quantities of [燃料], releasing [排放物] into the atmosphere; when this is repeated across millions of journeys, it [累積後果]',meaning:'單次飛行燃料排放累積到大量旅程，會加劇氣候問題。',links:['Every ', ' burns substantial quantities of ', ', releasing ', ' into the atmosphere; when this is repeated across millions of journeys, it '],labels:['單次活動','燃料','排放物','累積後果']},
 {example:'A single delivery trip may seem insignificant, but the cumulative effect of countless such trips is enormous.',d:[4,10,14],relation:'but 對照單次看似小與總量影響大',formula:'A single [活動] may seem insignificant, but the cumulative effect of countless such trips is enormous',meaning:'單次度假航班看似微小，無數次累積卻很大。',links:['A single ', ' may seem insignificant, but the cumulative effect of countless such trips is enormous.'],labels:['單次活動']},
 {example:'Furthermore, the expansion of tourism creates additional environmental pressure on the ground.',d:[4,10,13],relation:'Furthermore 從空中排放轉到地面壓力',formula:'Furthermore, the expansion of [活動] creates additional environmental pressure on the ground',meaning:'航班擴展也令地面環境承壓。',links:['Furthermore, the expansion of ', ' creates additional environmental pressure on the ground.'],labels:['擴展的活動']},
 {example:'More visitors require larger stations, more roads and more hotels, which consume land, produce waste and place strain on fragile ecosystems.',d:[4,10,14],relation:'which 回指新增基建，指出土地、廢物、生態三種代價',formula:'More [人流] require [新增設施], which consume land, produce waste and place strain on fragile ecosystems',meaning:'更多旅客帶來更多機場、道路和設施，耗地、產廢並壓迫生態。',links:['More ', ' require ', ', which consume land, produce waste and place strain on fragile ecosystems.'],labels:['增加的人流','新增設施']},
 {example:'In popular mountain destinations, for example, rising visitor numbers often lead to habitat loss, litter and resource depletion.',d:[4,10,14],relation:'沿海地點例子列出棲息地、垃圾及資源三種後果',formula:'In popular [地點], for example, rising visitor numbers often lead to [三種環境後果]',meaning:'海岸旅遊地遊客增加或造成棲息地流失、垃圾及資源耗竭。',links:['In popular ', ', for example, rising visitor numbers often lead to '],labels:['地點','三種後果']},
 {example:'In conclusion, regular international flights clearly promote tourism, mobility and global connection.',d:[4,10,14],relation:'結論先重述經濟流動與連結好處',formula:'In conclusion, regular international flights clearly promote [三項好處]',meaning:'作者承認國際航班促進繁榮、流動及全球連結。',links:['In conclusion, regular international flights clearly promote '],labels:['已討論的好處']},
 {example:'Nevertheless, because they significantly increase aviation emissions and intensify wider ecological damage, their disadvantages to the environment outweigh their advantages.',d:[4,10,14],relation:'because 列兩項環境理由，再給利弊權重',formula:'Nevertheless, because they significantly increase [排放] and intensify [地面生態損害], their disadvantages to the environment outweigh their advantages',meaning:'排放與更廣生態損害令環境缺點較重。',links:['Nevertheless, because they significantly increase ', ' and intensify ', ', their disadvantages to the environment outweigh their advantages.'],labels:['排放','生態損害']},
 {example:'For this reason, the growth of long-haul leisure travel should be regarded as a negative development overall.',d:[4,10,14],relation:'For this reason 回指環境權衡作整體評價',formula:'For this reason, the growth of [活動] should be regarded as a negative development overall',meaning:'作者最終視國際航空旅行增長為整體負面。',links:['For this reason, the growth of ', ' should be regarded as a negative development overall.'],labels:['被評價的增長']},
];
const usageGuides=[
 '當你要用 once...has become 對照一項活動過去只屬少數與現在變得普遍時。',
 '當你要用 While 承認社會經濟好處，再說另一種損害分量更重時。',
 '當你要用 but 比較已知收益與較廣、較難逆轉的代價時。',
 '當你要用 On the one hand 開始公平列出一方的好處時。',
 '當你要用 First 點出本段第一條正面機制時。',
 '當你要用 When 描述條件促成消費，再用 which 推到就業或公共收入時。',
 '當你要以一類地方的具體工作，證明上一句的就業機制時。',
 '當你要用 Second 轉到另一組受益者和另一種好處時。',
 '當你要列出多項活動，再用 all of which 指出它們共同的交流效果時。',
 '當你要用一名具體人物的跨地經歷，展示知識如何回流本地時。',
 '當你要用 Even so 承認剛才的好處仍成立，卻轉向較重缺點時。',
 '當你要用 The clearest problem 點出接下來要深入解釋的首要問題時。',
 '當你要先說一次活動的排放，再說它大規模重複後的累積影響時。',
 '當你要用 but 對照單次看似不重要與大量累積後果時。',
 '當你要用 Furthermore 從第一類環境影響轉到另一類地面影響時。',
 '當你要列出人流增加需要的基建，再用 which 指出它們共同的環境代價時。',
 '當你要以一個具體地點，列出前句抽象生態壓力的可見後果時。',
 '當你要在結論先公平重提已分析的多項好處時。',
 '當你要用 Nevertheless 和 because 說明為何兩項損害仍蓋過好處時。',
 '當你要用 For this reason 回指整篇權衡，清楚給出最後評價時。',
];
const structures=specs.map((s,i)=>{const f=frame(i,s.formula,s.meaning,s.usage,s.links,s.labels);f.usage=usageGuides[i];return {example:s.example,distractors:s.d,frame:f,answerReason:'這句'+s.relation+'，用法與原文一致。',distractorReason:'這句'+s.relation+'；它並非本題要辨認的句型及功能。'}});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先還原旅遊與流動好處，再分清飛行排放和地面基建代價。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const intro=[
 quiz('作者如何評價國際航班愈來愈頻繁？',['承認社經好處，仍認為環境代價更重。','認為航班完全沒有任何經濟好處。','只討論機艙座椅的舒適程度。','認為飛行不可能影響地面設施。'],'引言與結論都作出環境代價較重的判斷。'),
 {type:'multi',prompt:'範文分析哪兩條環境損害？',detail:'選兩項，再按「確認」。',options:['燃料排放大量累積，加劇氣候問題。','機場、道路和旅遊設施擴張壓迫土地與生態。','每班飛機都能自動消除污染。','遊客人數增加必然改善所有棲息地。'],correct:[0,1],why:'空中排放與地面基建是兩條不同環境機制。'},
];
const route=[sequence('還原國際航空旅行的利弊',[
 ['背景與立場','國際飛行從少數人享有變得日常；作者判斷環境損害較重。'],
 ['旅遊與商業','訪客住宿、飲食及交通消費可支撐工作及稅收。'],
 ['人員流動','學生與專業人士出國學習、參會、合作，知識或回流。'],
 ['飛行排放','單班航機燃燒燃料；無數次旅程的累積影響很大。'],
 ['地面環境及結論','機場、道路和旅遊設施耗地產廢；作者判整體負面。'],
 ],'旅客消費與知識交流是不同好處；排放與地面建設是不同代價。')];
const evidence=[
 quiz('旅客消費如何產生經濟好處？',['住宿、飲食及本地交通支出可支撐工作和稅收。','只要有訪客，所有商店都必然盈利。','旅客來訪會自動取消所有稅款。','航空燃料本身就是旅客的住宿費。'],'原文給出消費→就業與稅收的連鎖。'),
 quiz('留學與國際會議在範文中有甚麼共同作用？',['促進技能、知識與投資的交流。','保證每名學生都獲得永久海外工作。','證明所有本地大學已不再有用。','只影響機票顏色。'],'all of which 回指多種跨國活動。'),
 quiz('為何單次飛行看似小，整體影響仍大？',['數以百萬計的旅程重複排放，累積影響巨大。','每架飛機都只在地面運作。','單次排放本來已等於全部航空排放。','航班多寡不可能改變總排放。'],'關鍵是 cumulative effect。'),
 quiz('更多旅客對地面環境有甚麼壓力？',['需要更大機場、道路及旅遊設施，耗地並產廢。','只會影響機艙內的餐飲。','令所有沿海棲息地自動增加。','完全不用額外交通基建。'],'原文將訪客人數與新增基建連上。'),
 quiz('作者最後有否否定所有社會經濟好處？',['沒有；結論仍承認繁榮、流動與跨國連結。','有；作者說旅遊從不帶來工作。','有；作者說海外學習不可能發生。','沒有；但作者說環境代價可以完全忽略。'],'作者先公平承認，再以環境代價作權重判斷。'),
];
const logic=[
 sequence('旅遊支出與國際流動的好處',[
 ['航班較普遍','更多人可較快、較便宜地跨國移動。'],
 ['本地消費','訪客支付住宿、餐飲和交通費。'],
 ['經濟後果','工作和稅收可能增加。'],
 ['知識交流','學生與專業人士可留學、參會、合作並回流專長。'],
 ],'旅遊工作與知識交流同屬好處，但需要各自機制支援。'),
 sequence('排放與地面建設的代價',[
 ['每班排放','航機消耗燃料並排出污染物。'],
 ['大量累積','無數旅程的總效應加劇氣候問題。'],
 ['基建擴張','更多機場、道路及旅遊設施佔用土地。'],
 ['在地後果','棲息地流失、垃圾和資源耗竭可能出現。'],
 ],'單次排放不等於總排放；地面壓力亦不只來自燃料。'),
];
const transfers=[
 transfer('一個島國的酒店、餐廳和交通服務依賴海外訪客。','哪句正確轉用旅遊就業鏈？',["海外訪客在酒店餐飲與交通消費，可支持多種工作並增加稅收", "訪客消費可讓酒店受益，但與餐飲和交通職位沒有直接關係", "旅客增加或帶來收入，因此地方政府不再需要任何稅收", "觀光能支持就業，卻只會讓機場職位增加而不影響市區"],["連結訪客支出、不同服務職位與公共收入。", "忽略跨行業的需求鏈。", "支出增長不取消稅收需要。", "把收益錯限於機場。"],[5,6],'原文旅客住宿食物交通支出支撐就業稅收。'),
 transfer('一名工程學生海外受訓後回國工作。','哪句對應範文的人才流動好處？',["海外所學可帶回本地企業，使國際受訓機會產生本地收益", "學生回國後仍能用技能，但受益只會留在海外培訓機構", "人才跨國流動或有益，前提是所學技能從不在本地使用", "海外培訓可能擴闊眼界，但工程技能與本地企業毫無關係"],["把人才流動與本地企業能力連起來。", "帶回技能可能令本地受益。", "本地使用才是此情境的機制。", "忽略工程技能可轉用。"],[7,8,9],'原文海外受訓者回國或貢獻本地產業。'),
 transfer('有人說一班度假航機排放不多，可以忽略所有飛行影響。','哪句指出缺失的尺度？',["單班排放看似有限，仍要計算大量重複航班的累積影響", "只量一班航機便能代表所有航班的全年排放總量", "單班排放較低時，總航班增加也不會影響整體污染", "評估氣候影響只須看乘客人數，不必計算飛行次數"],["把單次效果放到大量反覆發生的尺度。", "樣本不能取代總量。", "航班數仍影響累積排放。", "飛行頻率也重要。"],[12,13],'原文 cumulative effect of countless trips is enormous。'),
 transfer('某海岸城市為接待更多旅客而擴建機場和道路。','哪句指出飛行以外的環境機制？',["機場與道路擴建或佔用土地、增加廢物並擠壓附近生境", "只要飛機引擎停下，機場與道路工程便不再影響環境", "擴建可帶來旅客收入，因此附近生境便不需要再評估", "旅客增多只影響航線安排，不會增加接待設施的用地"],["補出飛行以外的土地和生態機制。", "地面工程仍有環境作用。", "經濟好處不能取消生境代價。", "接待設施可能需要土地。"],[14,15,16],'原文地面設施耗地產廢及壓迫生態。'),
 transfer('一篇作文只寫「飛機會排碳」，未說明原因或規模。','哪句把環境論證補完整？',["每班機燃燒燃料並排污，大量航程反覆出現會累積影響", "航機燃料會產生排放，但航班數目不用納入氣候評估", "只要單一航班排放有限，所有旅程的總影響便可忽略", "大量航程或增加污染，但飛機燃料與排放沒有因果關係"],["交代來源及大量重複的累積尺度。", "漏掉航程數量。", "單次小不等於總量小。", "否定燃料與排放的關係。"],[11,12,13],'原文燃料、污染物與數百萬旅程的連鎖。'),
 transfer('跨國航班既支持當地工作，也增加排放。','哪句符合範文的權衡？',["應承認旅遊就業，同時比較累積排放與生態損失的程度", "既然旅遊可創造工作，污染和生境變化便毋須再評估", "航班會產生排放，因此酒店餐飲的工作收益也應視為零", "兩面都有影響，便只需選一個例子而不用比較其規模"],["同時保留經濟收益與環境代價並作權衡。", "收益不能取消代價。", "排放不等於沒有工作。", "需比較影響而非只列舉。"],[1,2,18],'原文 benefits real but ecological costs wider and harder to reverse。'),
 transfer('城市考慮讓國際學術會議改用視像形式。','哪句可用範文的兩面框架比較？',["比較面對面合作收益，也衡量大量飛行與會場設施壓力", "視像會議可能減少飛行，所以現場合作收益不必考慮", "學術交流有價值，便可以忽略多次國際航程的排放", "只要改用視像，所有知識合作便一定與現場完全相同"],["把交流與飛行代價的兩面框架轉用到會議。", "漏掉現場合作的可能價值。", "交流收益不取消排放。", "形式變化仍可影響互動。"],[8,12,15],'原文國際交流好處及航空環境代價可跨題比較。'),
 transfer('熱門海岸景點每年接待更多遊客。','哪句保留原文的具體生態後果？',["接待設施與人流擴大，或造成生境流失、垃圾及資源耗竭", "景點遊客增多時，土地利用和生態壓力便會自然減少", "海岸旅遊確有環境風險，但只限於飛機在空中的排放", "只要旅客支出增加，當地水與能源使用便不用估計"],["保留地面接待活動的具體生態後果。", "人流增長不保證壓力下降。", "忽略地面設施和人流。", "資源消耗仍須衡量。"],[15,16],'原文海岸地點人流增加與棲息地、垃圾、資源。'),
 transfer('有人把國際航空的經濟效益寫成「每個國家都一樣受益」。','哪句較符合原文？',["島國與海岸城市對海外旅客依賴不同，經濟收益因地而異", "航空連通各地，因此每個城市都從同等旅客數中受益", "島國可能靠旅遊就業，但它們的收入只來自本地居民", "沿海城市有旅客需求，便可推定內陸各地收益完全相同"],["用地方依賴程度限定經濟收益。", "連通不等於收益相等。", "忽略海外訪客支出。", "不能由一類地區推到所有地區。"],[5,6],'原文 in many island nations and coastal cities。'),
 transfer('另一題評估大型郵輪旅遊增長。','哪句真正轉移本文的方法而不照搬結論？',["查郵輪消費與交流，也查燃料排放、港口擴建和沿岸生態", "郵輪與航機都運送旅客，所以兩者的環境成本必然相同", "旅客消費可支持港口工作，便毋須評估船舶燃料污染", "既然航班有排放，就可以直接判定郵輪在各方面更好"],["轉移收益與代價分析，不直接搬用航空結論。", "交通方式不同，成本需另查。", "經濟收益不取消污染。", "原題結論不能直接套用。"],[5,8,12,15],'原文消費流動、排放及地面設施三維度。'),
];
const revised=[
 {wrong:['訪客消費讓酒店受益，餐飲與交通職位則較少受到影響','旅客增加可帶來收入，因此地方稅收依賴會下降','觀光支持就業，主要集中機場而非市區餐飲服務'],why:['酒店、餐飲和交通均可直接受益。','遊客活動也可能增加政府稅收。','旅遊工作分布不只機場。']},
 {wrong:['回國學生能用技能，收益主要留在海外培訓機構','人才跨國流動有益，但所學技能宜留待海外使用','海外培訓擴闊眼界，工程技能較難應用於本地企業'],why:['回國工作可把知識帶給本地企業。','本地應用正是人才流動的收益之一。','工程技能也可能在本地產生價值。']},
 {wrong:['抽樣一班航機排放，可大致估算全年航班總量','單班排放較低時，航班增加的累積作用較小','氣候影響主要看乘客數，航程次數可放在後面'],why:['單班數據不能直接代表全年總量。','大量航班會累積排放。','飛行次數也是總排放的關鍵。']},
 {wrong:['引擎停下後，機場與道路擴建的生態壓力較小','擴建帶來旅遊收入，附近生境損失便較可接受','旅客增多會改變航線，設施用地則可維持原狀'],why:['建設本身可能佔地與損害生境。','收入收益不取消環境成本。','接待更多旅客也可能需要更多設施。']},
 {wrong:['航機燃料產生排放，但航班數目屬營運而非氣候因素','單班排放有限時，總旅程的累積影響應較有限','大量航程可增污染，燃料使用只影響航空成本'],why:['航班數量會決定累積排放規模。','重複飛行可能令總影響很大。','燃燒燃料也是排放的原因。']},
 {wrong:['旅遊創造工作，因此生境變化可列為次要評估','航班有排放，酒店餐飲的工作收益便較難成立','兩面皆有影響，舉出各一例便足以完成權衡'],why:['經濟收益與生態代價須比較分量。','排放不使工作收益不存在。','權衡需比較影響的規模與重要性。']},
 {wrong:['視像會議減少飛行，現場合作收益可稍後再查','學術交流有價值，多次飛行排放便屬必要成本','視像會議可節省航程，合作方式則不會有變化'],why:['現場合作收益也是決策的一部分。','價值存在不代表排放無須評估。','不同方式可能影響交流品質。']},
 {wrong:['遊客增多帶來收入，土地與生態壓力應相對減少','海岸旅遊有環境風險，主要只在飛機排放階段','旅客支出增長後，當地水與能源需求應保持穩定'],why:['收入不會自動減少土地壓力。','設施和人流也是環境機制。','接待更多人可能增加資源需求。']},
 {wrong:['航空連通各地，城市所得旅客收益便較接近','島國可能靠旅遊就業，其收入主要來自本地居民','沿海城市旅客較多，可推知內陸地區收益相同'],why:['依賴程度因地方條件而異。','島國觀光收益可來自海外訪客。','沿海案例不能直接代表內陸。']},
 {wrong:['郵輪與航機都載客，兩者排放模式便可視作相同','旅客消費支持港口工作，船舶燃料影響可留到後面','航班有排放，可推知郵輪旅遊的整體風險較低'],why:['載客功能相似不代表成本相同。','港口收益不取消船舶污染。','新題須查郵輪自己的成本與收益。']},
];
revised.forEach((r,i)=>{transfers[i].options=[transfers[i].options[0],...r.wrong];transfers[i].explanations=[transfers[i].explanations[0],...r.why]});
transfers[0].options[0]='海外訪客在酒店、餐飲和交通消費，可支持就業並增稅收';
transfers[1].options[0]='海外所學帶回本地企業，可使國際受訓產生本地收益';
transfers[2].options[0]='單班排放有限，仍須計算重複航班的累積影響';
transfers[3].options[0]='機場道路擴建或佔地、增廢物並擠壓附近生境';
transfers[4].options[0]='每班機燃燒燃料排污，航程反覆出現便會累積影響';
transfers[5].options[0]='承認旅遊就業收益，也比較累積排放與生態損失';
transfers[6].options[0]='比較現場合作收益，也衡量飛行與會場設施壓力';
transfers[7].options[0]='設施人流擴大，或造成生境流失、垃圾與資源耗竭';
transfers[8].options[0]='各地依賴海外旅客程度不同，經濟收益因地而異';
transfers[9].options[0]='查郵輪消費與交流，也查排放、港口擴建及沿岸生態';
export default {key:'advantage-disadvantage:24',meta:{topic:'國際航班的經濟流動與環境代價',summary:'範文承認航班促進旅遊工作、稅收及知識流動；作者仍認為燃料排放的累積影響，以及機場道路與沿海旅遊設施對生態的壓力更重。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

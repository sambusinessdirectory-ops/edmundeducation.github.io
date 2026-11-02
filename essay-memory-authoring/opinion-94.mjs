// Reviewed Opinion 94: travel media and willingness to travel abroad.
import fs from 'node:fs';import vm from 'node:vm';const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-94-ielts-opinion.js',import.meta.url),'utf8'),context);const source=context.window.ESSAY_MEMORY_LESSONS['opinion:94'];const original=source.sentences.map(x=>x.english);
const simple=[
'Travel shows and short videos made by online creators are now a common kind of entertainment.',
'Some people think that because viewers can see other countries on screens, they will be less willing to pay for trips abroad.',
'I completely disagree, because travel videos usually make people more curious rather than take the place of a real trip, and a screen cannot give the full experience of visiting another country.',
'First, travel shows and online videos often make people want to visit a place.',
'When viewers see the sea in Greece, food in Thailand or old streets in Italy, they do not feel they have finished visiting these places; instead, they start to imagine being there.',
'Social media especially makes places look real and appealing, so people feel they could reach them and want to save money to go.',
'For example, someone who watches videos about Japan may want more to see temples, eat local food and feel what the place is like for themselves.',
'So online travel videos are more likely to make people curious than to remove their interest.',
'More importantly, seeing a place on a screen is very different from going there.',
'A screen can show what a market or mountain looks like, but it cannot give the smell of food, the feeling of a packed train or the small talks that make a trip memorable.',
'People do not pay for trips abroad just to learn facts; they pay to feel free, find new things and take a break from daily life.',
'Even a well-made documentary gives an experience through someone else, but travelling abroad lets people meet places and people directly and may change their view of the world.',
'To sum up, I do not think travel media will make people less willing to pay for trips abroad.',
'It may be fun to watch at home, but it often makes people want to go abroad and see things for themselves.',
];
const vocabulary=[
[['an established part of modern entertainment','a common kind of entertainment','現代常見娛樂'],['short videos posted by influencers','short videos made by online creators','網紅發布短片']],
[['foreign cities, landscapes and cultures','other countries','外國地方與文化'],['less prepared to spend money','less willing to pay','較不願意花錢'],['overseas trips','trips abroad','海外旅行']],
[['stimulates curiosity','make people more curious','激發好奇心'],['replacing real travel','take the place of a real trip','取代親身旅行'],['cannot be reproduced through media','a screen cannot give the full experience','媒體不能複製']],
[['act as a gateway to tourism','make people want to visit a place','激發旅遊念頭'],['travel programmes and online videos','travel shows and online videos','旅遊節目與影片']],
[['clear blue water','the sea','湛藍海水'],['ancient streets','old streets','古老街道'],['imagine themselves there','imagine being there','想像置身當地']],
[['in particular','especially','尤其是'],['reachable, desirable and worth saving for','could reach them and want to save money to go','可到達且值得儲錢去']],
[['a person who watches several videos about Japan','someone who watches videos about Japan','看日本影片的人'],['experiencing the atmosphere in person','feel what the place is like for themselves','親身感受氣氛']],
[['In this sense','So','從此角度看'],['spark curiosity','make people curious','激發好奇心'],['extinguish it','remove their interest','消滅興趣']],
[['watching a destination','seeing a place on a screen','看旅遊目的地'],['living it','going there','親身體驗']],
[['reproduce the smell of local food','give the smell of food','重現食物氣味'],['the pressure of a crowded train','the feeling of a packed train','擠迫列車的感受'],['small conversations','small talks','小小對話']],
[['merely to collect information','just to learn facts','不只是收集資訊'],['freedom, discovery and a break from their normal routines','feel free, find new things and take a break from daily life','自由探索與脫離日常']],
[['a beautifully filmed documentary','a well-made documentary','拍攝精美的紀錄片'],['second-hand experience','an experience through someone else','二手經驗'],['direct contact with places and people','meet places and people directly','直接接觸地方與人']],
[['In conclusion','To sum up','總結'],['reduce people’s willingness','make people less willing','降低意願'],['international travel','trips abroad','國際旅行']],
[['entertain audiences at home','be fun to watch at home','在家觀看也有趣'],['fuels their desire to go abroad','makes people want to go abroad','激發出國意欲'],['experience the world first-hand','see things for themselves','親身體驗世界']],
];
function frame(i,links,labels,meaning,usage,example,tag,job){const v=original[i],parts=[];let c=0,k=0;for(const link of links){const at=v.indexOf(link,c);if(at<0)throw Error('Missing link '+(i+1)+': '+link);if(at>c)parts.push({text:v.slice(c,at),kind:'slot',label:labels[k++]});parts.push({text:link,kind:'link',label:'句型固定部分'});c=at+link.length;}if(c<v.length)parts.push({text:v.slice(c),kind:'slot',label:labels[k++]});if(k!==labels.length)throw Error('Unmatched labels '+(i+1));return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};}
const specs=[
frame(0,[' has become ', ', from '],['已普及的娛樂內容','當前所處位置','涵蓋的媒介例子'],'has become 交代已形成的趨勢；from 引出具體形式。','引言要先交代一種媒體活動已成常態，並舉出它的形式時。','Online learning has become common, from long courses to short lessons.','has become...from','交代趨勢及形式'),
frame(1,['Some argue that because ', ', they will '],['新媒體帶來的條件','對付費意願的預測'],'because 提供對方推論的前提；will 呈現其預測，作者尚未表態。','引言需公平交代一方如何從新條件推論行為會改變時。','Some argue that because lessons are free online, they will stop paying for classes.','argue...because...will','呈現待回應的推論'),
frame(2,['I completely disagree with this view, as ', ' rather than ', ', and '],['旅遊內容的主要作用','被否定的替代作用','親身體驗的另一理由'],'as 提供第一理由；rather than 指真正作用與錯誤推論相反；and 加上獨立理由。','引言要明確反對一種推論，並預告吸引力與親身體驗兩條理由時。','I completely disagree with this view, as videos raise interest rather than end it, and real visits offer more.','disagree...as...rather than...and','表態與雙理由'),
frame(3,['The first reason is that ', ' often act as '],['可能帶來吸引力的內容','它扮演的起點角色'],'act as 說明媒體在決策中充當起點，而非終點。','第一段要指出某資訊媒介可引發後續行動時。','The first reason is that school visits often act as a gateway to deeper interest.','reason...act as','提出第一機制'),
frame(4,['When ', ', they are not simply ', '; they are '],['觀眾看到的例子','並非已完成的行動','更可能出現的想像反應'],'not simply...; they are 區分看過影像與真正完成體驗。','要糾正「看見就等於做過」的推論，並寫出觀眾可能的反應時。','When viewers see a beach, they are not simply finishing a trip; they are imagining a visit.','When...not simply...; they are','區分觀看與意欲'),
frame(5,[', in particular, ', ', making '],['特別發揮作用的媒介','它呈現目的地的方式','由此帶來的可及與嚮往感'],'in particular 聚焦一種媒介；making 連接呈現方式與觀眾感受。','已有一般說明，接着要聚焦某種媒介怎樣讓目標看似可達時。','Short videos, in particular, show lively streets, making a visit feel possible.','in particular...making','聚焦媒介與感受'),
frame(6,['For example, ', ' may become more interested in '],['接觸影片的人','想親身進行的活動'],'For example 具體化前文機制；may 避免保證每位觀眾都會旅行。','需要用一個人接觸資訊後意欲提高的可能例子支撐前句時。','For example, a viewer of Japan videos may become more interested in local food.','For example...may','以個人例子驗證'),
frame(7,['In this sense, ', ' is more likely to ', ' than '],['網上內容','較可能引發的反應','較不可能的反向反應'],'more likely...than 比較兩個可能走向，保留有程度的判斷。','段末要回收例子，並比較「激發」與「取代」哪個較合理時。','In this sense, a preview is more likely to raise interest than remove it.','more likely...than','回收機率判斷'),
frame(8,['More importantly, ', ' is fundamentally different from '],['較重要的新理由之首項','親身體驗的對照項'],'More importantly 切到第二條更深的理由；different from 表示體驗種類不同。','第二段要由意欲轉向媒體無法提供的親身體驗時。','More importantly, viewing a lesson is fundamentally different from practising it.','More importantly...different from','切換至體驗差異'),
frame(9,[' can show ', ', but it cannot reproduce '],['螢幕或媒體','能呈現的視覺資訊','不能重現的感官與人際經驗'],'can...but cannot 明確劃出媒體能力的界線，不否定它能展示畫面。','需要承認媒體可呈現甚麼，再指出它不能提供的親身感受時。','A film can show a city, but it cannot reproduce its smells or conversations.','can show...but cannot reproduce','界定媒體能力'),
frame(10,[' do not pay for ', ' merely to ', '; they pay for '],['願意付費的人','付費參與的活動','不是唯一目的的資訊活動','真正重視的親身價值'],'not merely...; they pay for 把付費理由從資訊轉到體驗。','要解釋人們花錢並非只為獲取可免費看到的資訊時。','Visitors do not pay for a tour merely to read facts; they pay for direct experience.','not merely...; they pay for','重估付費價值'),
frame(11,['Even ', ' remains ', ', whereas '],['品質很好的媒體內容','仍然受限的間接體驗','親身活動能提供的直接接觸'],'Even 承認高品質；whereas 對照間接與直接經驗。','要承認媒體製作精良，卻仍說明其體驗邊界時。','Even a fine film remains second-hand, whereas visiting offers direct contact.','Even...remains...whereas','承認品質並指出限制'),
frame(12,['In conclusion, ', ' will reduce '],['重新表明的立場','被否定的付費意願下降'],'In conclusion 回到題目預測，明確重申不同意。','結尾要直接回答媒體是否會降低出國付費意願時。','In conclusion, I doubt that free videos will reduce demand for visits.','In conclusion...will reduce','重申對預測的判斷'),
frame(13,['It may ', ', but it more often '],['媒體可能提供的居家娛樂','更常引發的出行意欲'],'may 承認一種作用；but it more often 指作者認為更普遍的作用。','最後要兼顧媒體的娛樂性與其可能激發實際行動的作用時。','It may entertain at home, but it more often encourages a real visit.','It may...but it more often','收束兩種作用'),
];
const structures=specs.map((x,i)=>{const d=[(i+1)%specs.length,(i+5)%specs.length,(i+9)%specs.length];return {...x,distractors:d,wrongReasons:d.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+x.tag+'」'+x.job+'。'),answerReason:'示例保留「'+x.tag+'」的固定部分，用來'+x.job+'。',patternType:'reviewed'};});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證次序排列意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('作者對「旅遊媒體會降低人們付費出國的意願」持甚麼立場？',['完全不同意：內容可激發好奇心，親身體驗亦不能由螢幕取代','完全同意：看過影片就等於完成所有旅程','只討論紀錄片的攝影器材而不談旅遊','認為所有旅客都只為了收集地理資訊'],'引言直接表明 completely disagree，並預告兩條不同理由。'),quiz('兩個主體段分別探討甚麼？',['觀看內容可能引發出行念頭；親身旅遊提供媒體欠缺的感受','第一段談機票價格，第二段談酒店員工薪金','兩段都只列舉同一部旅遊紀錄片的片名','只比較電視尺寸與手機螢幕大小'],'第一段談意欲，第二段談直接體驗的獨特價值。')];
const route=[sequence('從觀看影片到親身出行的理由',[
['引言：否定取代推論','旅遊內容不必減少出行意願；作者提出兩條理由。'],['理由一：影像激發想像','景色、美食與街道使觀眾想像自己身處當地。'],['社交媒體與日本例子','目的地變得可達；看影片的人可能想參觀與品嘗。'],['理由二：媒體有體驗邊界','畫面可以展示顏色形狀，卻不能重現氣味、擁擠和交談。'],['付費原因與二手經驗','人們付費尋求自由、探索及與地方人物直接接觸。'],['結尾：重申較可能的作用','旅遊媒體能在家娛樂，也可能進一步激發出國意欲。']],
'先評估媒體對意欲的影響，再說明親身經驗為何仍值得付費。')];
const evidence=[
quiz('「gateway to tourism」在文中指甚麼？',['旅遊影片可能成為想去某地的起點','觀看影片本身就等於入境旅遊','每條影片都包含訂票付款連結','網紅已替所有觀眾安排好行程'],'作者把媒體視為通向旅行的入口。'),
quiz('希臘、泰國和意大利的例子想說明甚麼？',['影像可能讓人想像自己去當地，而非覺得已經去過','三個地方都只可以透過電視觀看','觀眾看到畫面後必定立即購買機票','所有地方對每位旅客都有相同吸引力'],'not simply...; they are 區分看見與想親身去。'),
quiz('日本影片的例子包含哪些想親身做的事？',['看寺廟、嘗當地食物並感受現場氣氛','只在家反覆播放同一段影片','只背誦日本城市名稱與經緯度','完全停止關心任何旅遊目的地'],'原文以具體行動支撐好奇心可能增加。'),
quiz('螢幕可以展示甚麼，不能重現甚麼？',['能展示市場色彩或山形，不能重現氣味、擁擠感或交談','能重現全部身體感受，只不能播放音樂','只能展示旅客護照上的文字資料','既不能展示畫面，也不能傳達地方外觀'],'作者不是否認畫面的作用，而是界定其邊界。'),
quiz('作者說人們付費出國不只是為了甚麼？',['收集資訊；他們也想要自由、探索和暫離日常','取得一本免費介紹地理的冊子','避免與任何當地人直接接觸','完全不看目的地的任何景物'],'not merely to collect information 對比親身體驗。'),
quiz('「second-hand experience」與旅行形成甚麼對比？',['紀錄片經他人鏡頭呈現；旅行可直接接觸地方和人','紀錄片比任何旅行都更能重現所有氣味','只有紀錄片能讓人與當地人直接交談','兩者差別只在影片播放的音量大小'],'whereas 對照間接與直接接觸。')];
const logic=[sequence('影片如何可能激發旅遊意欲',[
['看到具體目的地','觀眾在畫面中看見景色、美食與街道。'],['想像自己身處當地','影像不是把目的地從清單上劃掉。'],['覺得行程值得儲錢','社交媒體令地方看似可達、令人嚮往。'],['可能增加親身探索的念頭','日本例子把觀看連到寺廟、食物和氣氛。']],
'第一條機制由觀看和想像推到可能的出行意欲。'),sequence('為何畫面不能等於親身旅遊',[
['畫面有展示能力','市場色彩、山形可透過螢幕看見。'],['感官與交談仍缺席','味道、擁擠感和小對話難由媒體重現。'],['旅客付費追求更多','自由、探索及暫離日常不只是資訊。'],['直接接觸可能改變觀點','出國與人和地方相遇有二手影像欠缺的部分。']],
'第二條機制承認媒體能展示外觀，再說明親身經驗的獨特價值。')];
const t=(context,question,options,explanations,ids,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices:ids,modelLink});
const transfer=[
t('一名學生看完日本美食影片，開始儲錢準備去當地嘗試。','範文會如何解釋這個變化？',['影片可能激發好奇心，促使他想親身嘗試','影片已完整取代所有親身旅行的感受','只要看過影片，學生便必定立即訂機票','學生儲錢必然完全只因影片中的價格'],['觀看可成為行動的起點。','忽略親身嘗試。','把可能說成必然。','過度單一歸因。'],[3,6,7],'原文把影片視為旅遊念頭的入口。'),
t('有人說：「我看過海灘影片，因此已經去過那片海灘。」','哪項回應最符合範文？',['看見景色不等於親身到訪，仍可能更想去','畫面呈現的海水必然比真實海水更完整','只要看過影片就能聞到所有當地氣味','影片能完全提供與當地人交談的經驗'],['原文區分看過與身處當地。','無法從影像推論。','畫面不能傳遞氣味。','畫面不能替代直接交流。'],[4,8,9],'原文說觀看可能引發身處當地的想像。'),
t('一個旅遊平台用短片介紹偏遠小鎮，觀眾開始覺得值得儲錢去。','這最接近哪個論證機制？',['媒體令目的地看似可達，因而增加出行意欲','短片能直接替觀眾完成所有旅遊中的步行','目的地一旦出現於畫面，真實交通便消失','平台只要發布短片，所有觀眾必定會前往'],['原文說社交媒體使地方可達、令人嚮往。','短片不能替代步行。','與交通無關。','把意欲說成必然行動。'],[5],'原文的 living postcards 指可想像及值得儲錢的地方。'),
t('旅客買了機票，想離開日常規律，也希望與當地人交談。','哪個付費理由與範文一致？',['他付費追求自由、探索及與人直接接觸','他付費只為看一眼可免費查到的地名','他付費只為在機場看螢幕播放的畫面','他付費必然完全不想知道任何旅遊資訊'],['原文把價值放在直接體驗。','把旅行縮成資訊收集。','沒有解釋機票價值。','範文並未否定資訊。'],[10,11],'原文說人們付費不只是為了資訊。'),
t('紀錄片拍得很美，卻無法傳遞市場的氣味與列車的擠迫。','範文如何處理這個對照？',['承認畫面美麗，再指出感官體驗仍無法重現','認為拍得越美，所有現場氣味就越真實','說紀錄片不能展示市場的任何顏色形狀','由列車擠迫直接推斷所有旅客都討厭旅行'],['Even 承認品質；whereas 和 cannot 指出邊界。','影像不能傳遞氣味。','原文承認可展示外觀。','推論超出文本。'],[9,11],'原文承認好紀錄片仍屬二手經驗。'),
t('一篇作文說「旅遊影片只會讓人不想出門」，但沒有證據。','借用範文，哪項反駁最有力？',['影片可能激發好奇心，增加親身到訪意欲','只要影片夠短，每個觀眾就必定立刻出門','旅遊影片完全不能展示任何目的地的外觀','只要看過影片，觀眾便能得到全部現場感受'],['原文提供反方向的可解釋機制。','過度保證。','否定媒體真實能力。','忽略親身價值。'],[3,4,5,7],'範文以 gateway、想像與好奇心反駁替代說。'),
t('一位讀者說只有螢幕上的外觀值得注意，旅行沒有額外價值。','哪項細節可檢查這種說法？',['食物氣味、列車擠迫和小對話仍需親身經歷','市場色彩只能在現場看到而不能在片中看','所有旅客只因同一種食物氣味而訂機票','只要播放影片，便能與片中人物即時交談'],['原文列出媒體不能重現的感官和互動。','原文承認畫面可展示顏色。','過度概括旅行動機。','不符合影片性質。'],[9,10],'原文劃分畫面能展示與不能重現的部分。'),
t('旅遊文章要比較網上導覽與真正走進博物館。','哪種句型最適合轉用？',['網上畫面可展示展品，但無法重現現場氣氛','網上畫面能使每名觀眾立刻變成館長','真正入館只會提供免費在家查到的資訊','兩種活動差別全由螢幕尺寸大小決定'],['可轉用 can show...but cannot reproduce 的界線。','過度荒謬。','忽略現場。','沒有比較體驗。'],[9],'原文的能力界線句可轉用到其他媒體。'),
t('同學想在結尾承認旅遊影片有娛樂作用，同時保持反對立場。','哪一句收束最貼近範文？',['影片可在家娛樂，也常激起親身出遊的興趣','影片只要好看，就必然取代所有國際旅行','影片完全不能帶來任何娛樂或資訊價值','所有旅客只會因同一個網紅而決定出行'],['原文結尾同時承認娛樂與意欲。','把媒體說成必然替代。','與承認句相反。','過度單一歸因。'],[12,13],'原文用 may...but it more often 收束兩種作用。'),
t('一家人觀看旅遊節目後，開始查目的地交通與機票。','哪個判斷的力度最恰當？',['節目可能成為旅遊計劃的起點，尚非保證成行','查過交通便證明一家人已經完成整段旅程','節目只會消除旅行意欲，絕不會引發計劃','只要開始查機票，就必然已經付費出國'],['gateway 和 may 只支持可能的意欲與計劃。','查資料不等於到訪。','與情境相反。','查票不等於購票。'],[3,6,7],'範文用 may、more likely 而非保證每人出行。'),
];
export default {key:'opinion:94',meta:{topic:'旅遊媒體與親身出國旅行的意願',summary:'範文以旅遊影像激發好奇心，並以親身體驗無法由媒體複製兩條理由，反對觀看取代旅行的推論。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer};

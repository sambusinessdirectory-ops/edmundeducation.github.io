// Reviewed Opinion 99: infrastructure as the first priority for foreign aid.
import fs from 'node:fs';import vm from 'node:vm';const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-99-ielts-opinion.js',import.meta.url),'utf8'),context);const source=context.window.ESSAY_MEMORY_LESSONS['opinion:99'];const original=source.sentences.map(x=>x.english);
const simple=[
'Weak roads and other basic services often show that a country is having trouble developing.',
'Some people therefore say foreign aid should fix these services before other problems.',
'I fully agree because roads, power and other basic services let schools, hospitals, businesses and government work properly.',
'First, basic facilities affect almost every part of a country’s progress.',
'Without good roads, electricity, clean water and phone networks, even helpful aid projects may not reach the people who need them most.',
'For example, a village school may get books and skilled teachers, but without safe roads or steady power, children may not come often and lessons may be limited.',
'Likewise, hospitals cannot work well if medicine cannot arrive, machines have no power and patients cannot reach care in time.',
'So basic services are more than one problem among many; they help every other kind of aid succeed.',
'Another reason is that better roads and power can make poorer countries rely less on foreign help over time.',
'When roads, ports, power and internet services improve, local firms can grow, farmers can sell more widely and workers can find more jobs.',
'This builds a stronger economy at home, which lasts longer than repeated short-term gifts.',
'For example, a reliable transport system may let small producers sell goods across the country instead of only in remote villages.',
'As people earn more, governments can collect more taxes and spend them again on public services.',
'So foreign aid should first improve the country’s basic physical systems so future progress can continue without constant outside help.',
'To sum up, I fully agree that foreign aid should address weak basic services first.',
'Without them, other development work may be slow and weak; with them, a country has what it needs to develop by itself.',
];
const vocabulary=[
[['Poor infrastructure','Weak roads and other basic services','薄弱基建'],['clearest signs','show','明顯跡象'],['struggling to develop','having trouble developing','發展困難']],
[['Some argue','Some people therefore say','有人主張'],['foreign aid','foreign aid','外國援助'],['deal with this issue before anything else','fix these services before other problems','優先處理基建']],
[['strong infrastructure','roads, power and other basic services','完善基建'],['the foundation on which','let','正常運作的根基'],['properly function','work properly','正常運作']],
[['infrastructure','basic facilities','基礎設施'],['almost every part of national development','almost every part of a country’s progress','國家發展各部分']],
[['reliable roads','good roads','可靠道路'],['communication networks','phone networks','通訊網絡'],['well-intentioned aid projects','helpful aid projects','善意援助項目'],['fail to reach the people who need them most','not reach the people who need them most','無法送達最需要者']],
[['a rural school','a village school','鄉村學校'],['trained teachers','skilled teachers','受訓教師'],['stable electricity','steady power','穩定電力'],['unable to attend regularly','not come often','不能定期上學']],
[['Similarly','Likewise','同樣地'],['operate effectively','work well','有效運作'],['medicines cannot be transported','medicine cannot arrive','藥物無法送達'],['equipment cannot be powered','machines have no power','設備無法供電']],
[['In this sense','So','從這角度'],['not merely one development problem among many','more than one problem among many','不只是眾多問題之一'],['other forms of aid to work','every other kind of aid succeed','令其他援助見效']],
[['Another reason','Another reason','另一原因'],['better infrastructure','better roads and power','較好基建'],['less dependent on foreign support','rely less on foreign help','減少依賴外援'],['in the long run','over time','長遠而言']],
[['digital networks','internet services','數碼網絡'],['local businesses','local firms','本地企業'],['bring goods to wider markets','sell more widely','賣到更廣市場'],['employment opportunities','jobs','就業機會']],
[['a stronger domestic economy','a stronger economy at home','較強國內經濟'],['far more sustainable','lasts longer','更可持續'],['repeated short-term donations','repeated short-term gifts','反覆短期捐助']],
[['For instance','For example','例如'],['a dependable transport system','a reliable transport system','可靠交通系統'],['small producers','small producers','小型生產者'],['nationally','across the country','全國銷售']],
[['As income rises','As people earn more','收入上升'],['collect more tax revenue','collect more taxes','徵收更多稅收'],['reinvest it in public services','spend them again on public services','再投資公共服務']],
[['the physical backbone of the country','the country’s basic physical systems','國家基建骨幹'],['future progress can stand on its own feet','future progress can continue without constant outside help','日後發展可自立']],
[['In conclusion','To sum up','總結'],['poor infrastructure','weak basic services','薄弱基建'],['the first issue addressed by foreign aid','foreign aid should address weak basic services first','外援優先處理']],
[['Without it','Without them','沒有基建'],['slow, fragile, and inefficient','slow and weak','緩慢脆弱而低效'],['basic platform','what it needs','基本平台'],['modernise independently','develop by itself','獨立現代化']],
];
function frame(i,links,labels,meaning,usage,example,tag,job){const v=original[i],parts=[];let c=0,k=0;for(const link of links){const at=v.indexOf(link,c);if(at<0)throw Error('Missing link '+(i+1)+': '+link);if(at>c)parts.push({text:v.slice(c,at),kind:'slot',label:labels[k++]});parts.push({text:link,kind:'link',label:'句型固定部分'});c=at+link.length;}if(c<v.length)parts.push({text:v.slice(c),kind:'slot',label:labels[k++]});if(k!==labels.length)throw Error('Unmatched labels '+(i+1));return {frame:{formula:parts.map(p=>p.kind==='link'?p.text:'['+p.label+']').join(''),meaning,usage,parts},example,tag,job};}
const specs=[
frame(0,[' is often one of the clearest signs that '],['可見的問題','問題反映的更深處境'],'one of the clearest signs that 由可見現象引出深層發展困難。','引言要以一項可見缺口說明背後更廣泛的問題時。','Weak infrastructure is often one of the clearest signs that an area needs support.','clearest signs that','由現象引出處境'),
frame(1,['Some argue that ', ' should therefore ', ' before '],['被要求行動者','應先處理的基礎問題','其他後續議題'],'therefore 承上句；before 明確標示優先次序。','題目問某問題是否應列第一優先時，先公平交代支持者主張。','Some argue that donors should therefore fund roads before other projects.','should therefore...before','呈現優先次序'),
frame(2,['I completely agree, because ', ' is the foundation on which '],['基礎設施','依賴它運作的服務'],'foundation on which 把優先性和其他服務能否運作連起來。','引言要表態某一基礎條件須先建立，因其他事情依賴它時。','I completely agree, because power is the foundation on which hospitals depend.','foundation on which','表態並指出依賴'),
frame(3,['The first reason is that ', ' directly affects '],['基礎條件','受其影響的廣泛領域'],'directly affects 讓第一條理由涵蓋多個公共領域。','主體段要先說明一項基礎條件為何跨領域重要時。','The first reason is that water directly affects health and education.','reason...directly affects','提出跨領域影響'),
frame(4,['Without ', ', even ', ' may fail to '],['缺少的基礎設施','本來有善意的項目','可能達不到的受助結果'],'Without 設定缺口；even 強調善意項目也會受阻。','要解釋前置條件缺失時，為何已有資源仍可能送不到需要的人時。','Without safe roads, even good aid may fail to reach villages.','Without...even...may fail to','指出前置條件'),
frame(5,['For example, ', ', but if ', ', students may ', ' and '],['看似得到支援的學校','仍缺的道路或電力','學生到校的困難','課堂仍受限的結果'],'but if 讓例子顯示資源已到位仍可能無法發揮作用。','要以具體受助機構說明缺少基本條件怎樣削弱其他投入時。','For example, a school may have books, but if roads fail, students may stay home and lessons stop.','For example...but if...and','以學校例證依賴'),
frame(6,['Similarly, ', ' cannot ', ' if '],['另一種公共服務','無法有效執行的工作','所缺的運輸電力或可及條件'],'Similarly 把學校例子延伸到醫院，不重複同一場景。','已有一個例子後，要展示同一基礎缺口也會影響另一服務時。','Similarly, clinics cannot treat patients if supplies never arrive.','Similarly...cannot...if','跨服務驗證'),
frame(7,['In this sense, ', ' is not merely ', '; it is '],['基礎設施','被低估的一般問題定位','它讓其他援助生效的橋樑作用'],'not merely...; it is 由單項問題提升為其他措施的使能條件。','段末要總結某條件並非只是眾多問題之一，而是讓其他方案有效時。','In this sense, transport is not merely one issue; it is a link for other services.','not merely...; it is','把問題提升為使能條件'),
frame(8,['Another reason is that ', ' helps ', ' become ', ' in the long run.'],['得到改善的基建','受益的國家','逐步減少的依賴程度'],'in the long run 把第二條理由轉到自立，不只即時配送。','第二段要分析先建立基礎條件如何長遠減少外部依賴時。','Another reason is that local training helps villages become independent in the long run.','helps...become...in the long run','轉向長期自立'),
frame(9,['When ', ', local businesses can ', ', farmers can ', ', and workers can '],['基建改善的條件','企業發展','農產品拓市','工人就業'],'三個 can 展示同一基建改善對不同經濟角色的連鎖效益。','需要把一項基礎投入對企業、供應者和勞工的不同效益展開時。','When roads improve, local businesses can grow, farmers can sell farther, and workers can find jobs.','When...can...can...can','展開多方經濟效益'),
frame(10,['This creates ', ', which is ', ' than '],['由經濟活動帶來的成果','相對更可持續的性質','被比較的短期援助'],'which 評價前面的國內經濟；than 比較短期捐助。','已列出經濟作用，接着要比較長期自立與反覆短期援助時。','This creates steady income, which is more useful than repeated gifts.','This creates...which is...than','比較可持續性'),
frame(11,['For instance, ', ' may allow ', ' to ', ' rather than '],['可靠交通的例子','可能受益的小生產者','擴大銷售的行為','原先受限的市場'],'may allow 保留可能性；rather than 對照全國與偏遠村莊市場。','要以一個生產者例子說明基建如何擴大市場時。','For instance, a new road may allow farmers to sell widely rather than only locally.','may allow...rather than','以市場例子落地'),
frame(12,['As ', ', the government can ', ' and '],['居民收入上升的情況','政府因此增加的稅收','再投入公共服務的後續行動'],'As 交代收入上升；and 把稅收連到再投資循環。','經濟活動已有改善，接着要說政府財政如何轉成公共服務時。','As earnings rise, the government can collect tax and fund clinics.','As...can...and','由收入連到再投資'),
frame(13,['Foreign aid, therefore, should first ', ' so that '],['外援優先加強的基礎','希望達到的日後自立'],'therefore 總結前兩段；so that 說明優先建基的最終目的。','主體段後要把優先次序和長遠自立連成政策建議時。','Foreign aid, therefore, should first fund roads so that growth can continue.','therefore...so that','收束優先與目的'),
frame(14,['In conclusion, ', ' should be ', ' by '],['薄弱基建','先處理的順位','負責的援助者'],'In conclusion 直接回答何者應先處理和由誰處理。','結尾要明確重申優先項、先後次序及責任方時。','In conclusion, clean water should be prioritised by aid agencies.','In conclusion...should be...by','重申優先與責任'),
frame(15,['Without ', ', other ', '; with ', ', a country gains '],['缺少的基礎','其他工作較弱的結果','已有的基礎','國家獲得的自立平台'],'Without...; with... 用同一條件前後對照，展示其使能作用。','最後要對照缺乏與擁有基礎條件時，其他發展工作的不同結果。','Without roads, other plans stall; with roads, a country gains a path to growth.','Without...with...','以有無條件作結'),
];
const structures=specs.map((x,i)=>{const d=[(i+1)%specs.length,(i+6)%specs.length,(i+11)%specs.length];return {...x,distractors:d,wrongReasons:d.map(j=>'這句用「'+specs[j].tag+'」'+specs[j].job+'；沒有用「'+x.tag+'」'+x.job+'。'),answerReason:'示例保留「'+x.tag+'」的固定部分，用來'+x.job+'。',patternType:'reviewed'};});const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'按範文的論證次序排列意思卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[quiz('作者是否同意外援應先處理薄弱基建？',['完全同意，因學校醫院等服務依賴基建，長遠也利於自立','完全反對，認為基建與其他公共服務毫無關係','只討論外援工作人員的旅行安排','認為一次捐書已足以令所有鄉村學校正常運作'],'引言把基建視為其他服務能發揮作用的根基。'),quiz('兩個主體段分別分析甚麼？',['基建讓其他援助見效；改善交通能源可促進長期自立','第一段只談書本，第二段只談醫院器材外觀','兩段只重複道路名稱而不解釋作用','先說援助金額，再說國家旗幟顏色'],'第一段談使能條件，第二段談經濟及自立循環。')];
const route=[sequence('由援助可及性到國家自立',[
['引言：基建應列首位','道路電力等是其他服務正常運作的根基。'],['理由一：缺基建令援助失效','物資難送達、學生難上學、病人難求醫。'],['橋樑結論','基建讓其他形式的援助真正可用。'],['理由二：基建帶動經濟','企業、農民和工人接觸更廣市場與機會。'],['收入、稅收與再投資','國內收入增加，政府可自行資助公共服務。'],['結尾：有無基建的對照','沒有它其他努力脆弱；有它國家可較自主發展。']],
'先分析基建是其他援助的前置條件，再分析長期經濟自立。')];
const evidence=[quiz('為何已有書本與受訓教師，鄉村學校仍可能受限？',['道路或電力不穩，學生難定期到校，課堂也難正常進行','只要有書，學生便無須任何道路到校','教師一受訓，電力和交通問題會自動消失','學校只需把書本價格提高便能解決供電'],'原文用 but if 表示其他投入依賴基建。'),quiz('醫院例子涉及哪幾種基礎條件？',['藥物運輸、設備供電及病人及時到達','只有醫院外牆的顏色','只有醫生制服與餐單','只有一份國際援助宣傳冊'],'原文同時提物流、電力和病人可及。'),quiz('「bridge that allows other forms of aid to work」是甚麼意思？',['基建讓教育醫療等其他援助可以真正發揮作用','基建只是許多項目中可隨便延後的一項','只要有一座實體橋樑便不再需要學校','任何援助都必須先建橋而不能修道路'],'這裡的 bridge 是使其他服務可用的比喻。'),quiz('交通系統如何幫助小型生產者？',['使產品可由偏遠村落賣到全國更廣市場','讓產品只能在原來村落內出售','使農民必然不再需要任何買家','只改變商品包裝而不影響運送範圍'],'原文用 nationally rather than isolated villages 對照。'),quiz('國內收入提高後，政府還可能獲得甚麼？',['更多稅收，可再投資公共服務','所有外援項目會自動立即結束','每項公共服務都必然已完全免費','只得到更多海報而非財政能力'],'原文把收入、稅收和再投資連成循環。'),quiz('結尾用 Without...with...對比甚麼？',['缺基建時其他努力較脆弱；有基建時更能獨立現代化','缺基建反而保證所有服務更有效','有基建便不再需要任何政府決策','兩種情況完全沒有不同結果'],'結尾強調基礎條件的使能作用。')];
const logic=[sequence('基建不足如何削弱其他援助',[
['道路電力等不足','物資、人員和患者難以到達。'],['學校即使有教師與書','學生難定期上學，課堂受限。'],['醫院即使有設備與藥','運送供電及就醫也可能失靈。'],['其他援助效益受阻','基建是讓項目發揮作用的橋樑。']],
'第一條論證說明基建缺口如何阻斷其他投入。'),sequence('基建如何逐漸降低外援依賴',[
['道路港口電力網絡改善','企業、農民和工人可接觸更多機會。'],['國內經濟增強','生產者賣到更廣市場。'],['收入與稅收增加','政府可再投資公共服務。'],['長期自立能力提高','國家較少依賴反覆短期捐助。']],
'第二條論證把市場、收入和公共投資串成長期循環。')];
const t=(context,question,options,explanations,ids,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices:ids,modelLink});
const transfer=[
t('慈善團體把書送到偏遠學校，但雨季道路中斷，學生無法到校。','哪個問題應先處理？',['先改善到校道路，書和教師才能真正發揮作用','先再加送書，路況可留待雨季結束處理','改善課室環境，不必先問學生能否到校','安排遠距課程，暫不評估道路中斷後果'],['道路是教育投入的前置條件。','書若無法送達或學生無法到校，作用有限。','課室改善不能代替到校道路。','替代方式仍需評估可及性。'],[4,5],'原文鄉村學校例子說資源也需要道路與電力。'),
t('醫院獲贈新機器，但停電頻繁，設備無法運作。','如何轉用文章第一段？',['先供穩定電力，贈送的醫療設備才可運作','再添醫療機器，可先略過供電的穩定性','設備功能強，便不用查病人是否用得到','先擴醫院宣傳，電力可在後期再處理'],['電力讓醫療援助有實際效用。','沒有穩定電力，再多機器也難使用。','功能強不等於可運作。','宣傳未解供電前提。'],[4,6,7],'原文說沒有電力醫院設備難發揮作用。'),
t('農村有農產品，卻缺乏道路運到其他城市售賣。','哪項長遠機制最接近範文？',['交通改善可擴市場，增加農民收入','農產品產量增加後，市場運輸可暫緩','先改進產品外觀，不看跨城運送成本','只看本地銷量，不問外地市場如何進入'],['原文以小生產者全國銷售為例。','產量要連到市場才可帶來收入。','外觀不解運輸瓶頸。','道路可打開更廣市場。'],[9,11],'原文把可靠交通連到更廣銷售範圍。'),
t('政府收入增加後，計劃用本地稅收維修學校和診所。','範文會如何解釋這個循環？',['本地稅收可維修學校診所，減少外援依賴','稅收增加有用，但維修可仍靠外援決定','公共服務可改善，卻不必追查財政來源','本地收入增長後，先只補貼私人商店'],['收入、稅收、再投資是第二段鏈條。','本地收入可支撐自主維修。','財政來源是自立論證中介。','私人補貼未必維修公共服務。'],[9,10,12,13],'原文說收入上升後政府可再投資。'),
t('援助機構先捐醫療物資，但貨車根本到不了受助村落。','哪個一般原則最貼近範文？',['先修通道路，醫療物資才到得到村民','多送物資可幫村民，斷橋問題留到日後','貨車到不了村，可改捐更輕的物資箱','先增加捐助宣傳，暫不處理運輸路線'],['基建使其他形式援助可運作。','斷橋阻止捐贈到達。','物資更輕也需可通行道路。','宣傳未解運送。'],[4,6,7],'原文把基建比作其他援助的橋樑。'),
t('有人主張先做一次性捐款，不必建長期交通系統。','文章第二段會指出甚麼？',['可靠交通開拓市場，農民收入更可持續','一次捐款可救急，便不必看長期市場通道','道路能幫運輸，卻不需評估農民收入','短期物資可到達，就可先略過本地經濟'],['原文比較國內經濟和反覆短期捐助。','救急有用，但未建持續經濟能力。','收入變化是道路效益。','一次到達不等於長遠自立。'],[8,9,10,11],'原文認為基建促進長期自立。'),
t('一座島上學校有教師，醫院有藥品，卻無穩定供電和港口。','援助優先次序應如何決定？',['先補供電與港口，學校醫院才可見效','再派教師可補學校，但電力可稍後恢復','藥品已在島上，港口運輸便不需檢查','先建校舍醫院外觀，不查兩種基礎條件'],['前置基建同時支持多項公共服務。','教師仍需可運作的設施。','港口關乎物資補給。','外觀不代替電力與運輸。'],[2,4,5,6,7],'原文說基建是跨領域的使能條件。'),
t('社區中心買了電腦，卻沒有網絡或電力，居民無法使用。','可轉用哪種論證？',['先供電與網絡，已買電腦才用得到','多買電腦可增名額，電力可留到後期','先教居民用電腦，不需查網絡能否連接','設備已買，便可只統計使用意願'],['與學校醫院的前置條件邏輯相同。','沒有電力，更多電腦仍不能用。','網絡是設備發揮作用的前提。','意願不能代替基礎設施。'],[4,5,6],'原文的 Without...even...may fail 可轉用。'),
t('一家基金會比較兩項方案：每月發短期物資，或先修通市場道路。','哪個評估符合文章？',['修路擴市場，或帶來較持久的農民收入','短期物資能救急，道路可等下一輪援助','修路能擴市場，但不用查農產品銷售','只比較發放次數，不看居民長遠收入'],['原文用市場與稅收說明自立循環。','短期救急未必產生持久收入。','擴市場需看實際銷售。','次數不是收入持續性。'],[9,10,11,12],'原文比較長期經濟與反覆短期捐助。'),
t('結尾要解釋外援為何應先修基建，而非只重申「基建重要」。','哪句最能收束全文？',['基建令教育醫療見效，也助經濟自立','基建重要，只需重申這點，不談作用途徑','先派物資，運輸供電可在後期再處理','學校醫院有設施，便不必查能否運作'],['結合使能與長期自立兩條主體機制。','結論要說清基建如何使服務與經濟見效。','物資仍需運送與供電。','設施名義存在不代表正常運作。'],[7,8,13,15],'原文結尾用 Without...with...收束。'),
];
export default {key:'opinion:99',meta:{topic:'外援優先處理薄弱基建',summary:'範文主張基建是教育、醫療等援助見效的前置條件，也能透過市場、收入和稅收促進國家長期自立。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer};

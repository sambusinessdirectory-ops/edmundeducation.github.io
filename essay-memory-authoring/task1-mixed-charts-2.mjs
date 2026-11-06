// Task 1 Mixed Charts 2: dance class venues (%) versus style enrolments (students).
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先分清地點圓圖的百分比與舞種柱圖的人數，再排概覽與細節。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The pie chart shows where young people take dance classes. The bar chart shows how many children under 11 and children aged 11 to 16 take ballet, tap and modern dance.',
 'Overall, private studios hold almost half of all classes, and college studios hold the fewest.',
 'For children under 11, ballet has the most students. For ages 11 to 16, modern dance has the most; tap has about the same number in both groups.',
 'Private studios hold 48% of classes. After-school classes in school halls hold 24%, so the private-studio share is exactly twice as large.',
 'Community halls and other places hold 18%, and college studios hold only 10%, or about one in ten classes.',
 'About 600 under-11s take ballet, while about 300 students aged 11 to 16 do so.',
 'Modern dance is the other way round: just under 300 younger students and about 520 older students take it.',
 'Tap has closer numbers: about 450 under-11s and just over 400 students aged 11 to 16.',
];
const vocabulary=[
 v(['attend dance classes','take dance classes','參加舞蹈班'],['compares the numbers','shows how many','比較人數'],['under-11s','children under 11','十一歲以下兒童'],['11- to 16-year-olds','children aged 11 to 16','十一至十六歲學生']),
 v(['by far the most common venue','almost half of all classes','最常見的上課地點'],['accounting for nearly half','almost half','接近一半'],['represent the smallest share','hold the fewest','佔比最小']),
 v(['leading choice','has the most students','最受歡迎'],['older group','ages 11 to 16','較年長組'],['attracts broadly similar numbers','has about the same number','兩組人數相近'],['age bands','groups','年齡組別']),
 v(['proportion','share','比例'],['exactly twice','exactly twice','正好兩倍'],['after-school sessions','after-school classes','課後課程']),
 v(['make up a further','hold','另外佔'],['leaving','and','餘下為'],['one tenth of the total','one in ten classes','總數約十分之一']),
 v(['about 600','About 600','約六百'],['compared with roughly','while about','相比約']),
 v(['opposite pattern','the other way round','情況相反'],['participants','students','參加者'],['approximately','about','大約']),
 v(['more evenly balanced','closer numbers','較均衡'],['around','about','約'],['slightly over','just over','略高於']),
];
const structures=[
 f('The pie chart shows where children in an Australian city attend swimming classes, while the bar chart compares the numbers of under-11s and 11- to 16-year-olds taking three swimming styles.','以 while 連接兩種圖的不同量度：地點與年齡組人數',[1,3,6],{formula:'The pie chart shows [地點量度], while the bar chart compares the numbers of [兩年齡組] taking [三類活動]',meaning:'圓圖是舞蹈班場地佔比；柱圖是兩年齡組在 ballet／tap／modern 的學生人數。',usage:'圖種、量度和單位要一一對準；場地百分比不是學生人數。',parts:[link('The pie chart shows'),slot(' where young people in an Australian town attend dance classes','地點量度'),link(', while the bar chart compares the numbers of'),slot(' under-11s and 11- to 16-year-olds','兩年齡組'),link(' taking'),slot(' ballet, tap and modern dance','三類活動'),link('.')]}),
 f('Overall, private centres are by far the most common venue, accounting for nearly half of all classes, whereas school gyms represent the smallest share.','在場地圖中用最多與最少作整體對照',[0,3,5],{formula:'Overall, [最大場地] are by far the most common venue, accounting for nearly half of all classes, whereas [最小場地] represent the smallest share',meaning:'私營舞蹈室佔 48% 為最大；學院舞蹈室佔 10% 最小。',usage:'nearly half 是 48% 的約數；不可把 college-based 10% 說成最多。',parts:[link('Overall,'),slot(' private studios','最大場地'),link(' are by far the most common venue, accounting for nearly half of all classes, whereas'),slot(' college-based studios','最小場地'),link(' represent the smallest share.')]}),
 f('In terms of dance style, ballet is clearly the leading choice among younger children, while modern dance is more popular with the older group; tap attracts broadly similar numbers in both age bands.','依年齡組比較舞種偏好，再指出 tap 接近',[0,3,7],{formula:'In terms of dance style, [兒童首選] is clearly the leading choice among younger children, while [年長首選] is more popular with the older group; [第三舞種] attracts broadly similar numbers in both age bands',meaning:'未滿 11 歲 ballet 約 600；11–16 歲 modern 約 520；tap 約 450／420。',usage:'leading choice 由各年齡組內人數判斷；不要把圓圖的場地佔比拿來比較舞種。',parts:[link('In terms of dance style,'),slot(' ballet','兒童首選'),link(' is clearly the leading choice among younger children, while'),slot(' modern dance','年長首選'),link(' is more popular with the older group;'),slot(' tap','第三舞種'),link(' attracts broadly similar numbers in both age bands.')]}),
 f('Looking first at locations, 50% of classes are held in private studios, exactly twice the proportion taking place in after-school sessions in school halls, at 25%.','用同一場地圖的兩個百分比呈現精確倍數',[0,5,7],{formula:'Looking first at locations, [大場地百分比] of classes are held in private studios, exactly twice the proportion taking place in after-school sessions in school halls, at [小場地百分比]',meaning:'48% 正好是 24% 的兩倍；兩者都是舞蹈班場地比例。',usage:'exactly twice 要先核算 48 ÷ 24 = 2；不是多出兩倍。',parts:[link('Looking first at locations,'),slot(' 48%','大場地百分比'),link(' of classes are held in private studios, exactly twice the proportion taking place in after-school sessions in school halls, at'),slot(' 24%','小場地百分比'),link('.')]}),
 f('Community halls and other venues make up a further 20%, leaving college-based studios with only 8%, or around one tenth of the total.','補足其餘兩個場地份額並把小份額化成約十分之一',[0,3,6],{formula:'[中等場地] make up a further [其比例], leaving [最小場地] with only [其比例], or around one tenth of the total',meaning:'Community halls and other 18%；college-based studios 10%，即十分之一。',usage:'leaving 是描述剩餘類別，不是 18% 減 10%；四份額相加應為 100%。',parts:[slot('Community halls and other venues','中等場地'),link(' make up a further'),slot(' 18%','其比例'),link(', leaving'),slot(' college-based studios','最小場地'),link(' with only'),slot(' 10%','其比例'),link(', or around one tenth of the total.')]}),
 f('Regarding class types, about 500 children under 11 attend ballet, compared with roughly 250 students aged 11–16.','同一舞種內比較兩個年齡組的參加人數',[0,3,7],{formula:'Regarding class types, about [較年輕人數] children under 11 attend ballet, compared with roughly [較年長人數] students aged 11–16',meaning:'ballet 約 600 名未滿 11 歲，約 300 名 11–16 歲；人數約兩倍。',usage:'數字是學生人數，不是百分比；roughly 提醒從柱長讀約數。',parts:[link('Regarding class types, about'),slot(' 600','較年輕人數'),link(' children under 11 attend ballet, compared with roughly'),slot(' 300','較年長人數'),link(' students aged 11–16.')]}),
 f('Modern dance shows the opposite pattern, with just under 250 younger participants but approximately 480 older ones.','用 opposite pattern 對比 ballet：modern 年長組人數更多',[0,2,5],{formula:'Modern dance shows the opposite pattern, with just under [年輕人數] younger participants but approximately [年長人數] older ones',meaning:'modern 未滿 11 歲約 300，11–16 歲約 520；年長組較多。',usage:'opposite 回指上一句 ballet 的「年幼組較多」，不是指地點場地比例。',parts:[link('Modern dance shows the opposite pattern, with just under'),slot(' 300','年輕人數'),link(' younger participants but approximately'),slot(' 520','年長人數'),link(' older ones.')]}),
 f('Tap is more evenly balanced, at around 400 under-11s and slightly over 380 students in the older age group.','以兩個相近人數說明 tap 的年齡差距較小',[0,3,6],{formula:'Tap is more evenly balanced, at around [年輕人數] under-11s and slightly over [年長門檻] students in the older age group',meaning:'tap 約 450 名未滿 11 歲、略多於 400 名 11–16 歲；比 ballet／modern 的組間差距小。',usage:'balanced 指兩個年齡組的人數接近，不代表兩組恰好相等。',parts:[link('Tap is more evenly balanced, at around'),slot(' 450','年輕人數'),link(' under-11s and slightly over'),slot(' 400','年長門檻'),link(' students in the older age group.')]}),
];
const intro=[quiz('圓圖與柱圖各量度甚麼？',['圓圖是班級地點百分比；柱圖是舞種按年齡組的學生人數','兩圖都是場地數目','圓圖是學生年齡；柱圖是場地百分比','兩圖都記錄票價'],'圓圖用百分比，橫柱用 Number of students。'),{type:'multi',prompt:'哪兩項最適合放入概覽？',detail:'選兩項，再按「確認」。',options:['私營舞蹈室場地最多，學院舞蹈室最少','ballet 在年幼組最多，modern 在年長組最多；tap 兩組相近','所有舞種在兩年齡組的人數完全一樣','學院舞蹈室佔全部班級一半'],correct:[0,1],why:'一項總結地點，另一項總結舞種年齡模式。'}];
const route=[sequence('排好兩圖報告的四段',[
 ['圖表引言','一圖是班級場地百分比，一圖是兩組年齡在三舞種的人數。'],
 ['整體概覽','私營場地最大、學院最小；年幼 ballet 多、年長 modern 多。'],
 ['場地比例','48% 私營、24% 學校課後、18% 社區與其他、10% 學院。'],
 ['舞種人數','ballet 約 600／300；modern 約 300／520；tap 約 450／略高於 400。'],
],'先報整體對照，再分兩張圖給證據；不要跨圖相加。')];
const evidence=[
 quiz('哪個場地佔比最大？',['私營舞蹈室 48%','學院舞蹈室 48%','社區會堂 48%','學校會堂課後班 48%'],'圓圖 Private studios 48%。'),
 quiz('私營與學校會堂課後班的比例？',['48% 對 24%，正好兩倍','24% 對 48%，私營較少','48 人對 24 人','兩者都只佔 10%'],'兩個場地份額來自同一圓圖。'),
 quiz('最小場地類別是哪個？',['學院舞蹈室 10%','私營舞蹈室 10%','學校會堂 10%','社區會堂 10%'],'College-based studios 10%。'),
 quiz('ballet 的兩年齡組人數約為？',['未滿 11 歲 600；11–16 歲 300','未滿 11 歲 300；11–16 歲 600','兩組各 600','兩組各佔 48%'],'柱圖 ballet 淺色條約 600，深色條約 300。'),
 quiz('modern dance 的年齡模式？',['11–16 歲約 520 人，多於年幼組約 300 人','未滿 11 歲約 600 人最多','兩組都只有 10 人','兩組人數完全相等'],'modern 深色條約 520，淺色條接近 300。'),
 quiz('哪個舞種兩年齡組最接近？',['tap：約 450 對略高於 400 人','ballet：約 600 對 300 人','modern：約 300 對 520 人','三者差距都相同'],'tap 兩條柱長最相近。'),
];
const logic=[sequence('圓圖：用份額和倍數比較四種地點',[
 ['最大','Private studios 48%，接近一半。'],['次大','School halls after-school 24%；48 是 24 的正好兩倍。'],['其餘','Community halls and other 18%；College-based studios 10% 最少。'],['單位','這些都是班級地點所佔百分比，不是參加者人數。'],
 ],'48+24+18+10=100；同一圓圖可以比較份額。'),sequence('柱圖：固定每個舞種比較兩年齡組',[
 ['Ballet','未滿 11 歲約 600；11–16 歲約 300。'],['Modern','未滿 11 歲接近 300；11–16 歲約 520，與 ballet 方向相反。'],['Tap','未滿 11 歲約 450；年長組略高於 400，差距較小。'],['單位','數字是學生人數；柱圖沒有顯示各組總學生數。'],
 ],'不要把約 600 人寫成 600%；也不要從柱圖擅自推算地點分布。')];
const transfers=[
 transfer('另一城有上課地點圓圖和按年齡比較三舞種人數的柱圖。','哪句引言分清兩圖？',['圓圖顯示上課地點，柱圖則比較不同年齡組參加各舞種的人數。','圓圖和柱圖都顯示舞蹈室的租金。','柱圖顯示班級地點百分比，圓圖顯示學生人數。','兩圖只顯示同一所學校的成績。'],['兩圖所量度的事和單位正確。','沒有租金。','圖種與量度對調。','無成績資料。'],[0],'原文 pie chart where classes；bar chart numbers by age/style。'),
 transfer('私營場地約佔一半，學院場地最少。','哪句用最大與最小寫概覽？',['私營場地最常見，接近一半；學院場地所佔份額最小。','學院場地佔一半，是最常見地點。','兩種場地都佔 48%。','場地百分比表示每堂的學生人數。'],['方向和量度均準確。','大小相反。','學院只 10%。','分母是班級。'],[1],'原文 private studios near half，college-based smallest。'),
 transfer('ballet 在年幼組最受歡迎，modern 在年長組較受歡迎，tap 兩組相近。','哪句保留三種舞的年齡模式？',['年幼組最愛 ballet，年長組較偏好 modern，而 tap 的兩組人數相近。','ballet 在年長組最高，modern 在年幼組最高。','tap 只有未滿 11 歲參加。','三種舞在兩組都完全相等。'],['各舞種對應年齡組正確。','顛倒方向。','tap 兩組都有。','ballet 和 modern 差距明顯。'],[2],'原文 ballet younger、modern older、tap broadly similar。'),
 transfer('一個場地佔 48%，另一個佔 24%。','哪句對倍數的說法可核算？',['前者比例正好是後者兩倍。','前者比後者高 48 個百分點。','前者比例是後者一半。','兩者合共剛好 100%。'],['48 ÷ 24 = 2；兩份額差 24 點。','差距不是 48 點。','方向相反。','相加 72%。'],[3],'原文 48% private vs 24% school halls exactly twice。'),
 transfer('另兩個場地佔 18% 和 10%。','哪句按份額說準？',['社區與其他地點佔 18%，學院場地僅佔十分之一。','學院場地佔 18%，社區地點佔 10%。','兩者合共佔 100%。','10% 代表十名學生，而非班級比例。'],['10% 即十分之一；兩類次序準確。','數字顛倒。','合計 28%。','單位是班級比例。'],[4],'原文 community/other 18%，college 10% one tenth。'),
 transfer('ballet 有約 600 名年幼學生和約 300 名年長學生。','哪句保持人數和對照？',['約 600 名未滿 11 歲兒童參加 ballet，而 11–16 歲約 300 名。','年幼組 600%，年長組 300%。','兩組均約 600 名。','ballet 是 48% 的上課地點。'],['兩組人數及單位吻合。','人數不是百分比。','年長組較少。','舞種不是地點。'],[5],'原文 ballet about 600 vs roughly 300 students。'),
 transfer('modern 在年長組多於年幼組，方向與 ballet 相反。','哪句可連接前後舞種模式？',['modern 呈相反模式：年幼組接近 300 人，年長組約 520 人。','modern 與 ballet 一樣，都是年幼組約兩倍。','modern 沒有年長學生。','modern 的兩組數字都屬場地百分比。'],['人數和相反方向準確。','方向與 ballet 相反。','年長組約 520。','柱圖單位是人。'],[6],'原文 Modern opposite pattern, just under 300 vs ~520。'),
 transfer('tap 兩組分別約 450 人及略高於 400 人。','哪句適切總結？',['tap 的兩組人數較接近，年幼組約 450，年長組略高於 400。','tap 只有約 10 名參加者。','年長組比年幼組多 400 人。','兩組人數完全相同且都為 450。'],['兩柱相近但不完全相等。','柱長超過 400。','差距不到 50。','年長略高於 400，非 450。'],[7],'原文 Tap more evenly balanced around 450 vs slightly over 400。'),
 transfer('圓圖是班級地點百分比；柱圖是學生人數。','哪項跨圖推論應避免？',['把 48% 私營場地直接寫成 48 名學生。','指出私營場地佔班級 48%。','指出 ballet 年幼組約 600 名。','指出學院場地只佔 10%。'],['48% 是班級分布份額，不是人數。','此句按圖。','此句按柱圖。','此句按圓圖。'],[0,5],'原文分別用地點百分比與舞種學生數；兩圖分母不同。'),
 transfer('現有資料沒有交代每個年齡組的總人數。','哪個百分比結論沒有足夠資料？',['「六百名 ballet 年幼學生佔全部年幼學生六成」。','「ballet 約有六百名年幼學生」。','「private studios 佔班級 48%」。','「tap 年長學生略多於四百名」。'],['沒有年幼組總數，不能算該比例。','柱圖可讀約六百。','圓圖直接給 48%。','柱圖可讀略高於四百。'],[0,5,7],'原文只給各舞種人數，沒有各年齡組的總人數。'),
];
transfers[4].context='社區與其他地點佔 18%，學院場地佔 10%。';
transfers[6].context='modern 在年幼組接近 300 人、年長組約 520 人，方向與 ballet 相反。';
const balancedTransferOptions=[
  ['圓圖記上課地點；柱圖比較各年齡組的舞種人數。','圓圖記舞種人數；柱圖比較各地點的班級份額。','圓圖記各地點租金；柱圖比較不同舞種的費用。','圓圖記學生年齡；柱圖比較各地點的學生人數。'],
  ['私營場地最常見，接近一半；學院場地份額最小。','學院場地最常見，接近一半；私營場地份額最小。','私營與學院場地一樣常見，各自接近一半。','私營場地佔學生一半；學院場地學生最少。'],
  ['年幼組偏好芭蕾，年長組偏好現代舞，踢踏舞兩組相近。','年長組偏好芭蕾，年幼組偏好現代舞，踢踏舞兩組相近。','年幼組只跳芭蕾，年長組只跳現代舞，踢踏舞沒有學生。','三種舞兩組人數都相同，沒有明顯的年齡差異。'],
  ['前者的份額正好是後者的兩倍，即 48% 對 24%。','前者的份額比後者高 48 個百分點，即兩倍。','前者的份額正好是後者的一半，即 24% 對 48%。','兩者的份額合共剛好達 100%，沒有其他場地。'],
  ['社區等地佔 18%，學院場地佔 10%，是十分之一。','學院場地佔 18%，社區等地佔 10%，次序相反。','社區等地佔 18%，學院場地佔 10%，合共一半。','社區等地有 18 名學生，學院場地有 10 名學生。'],
  ['芭蕾年幼組約 600 人，年長組約 300 人。','芭蕾年幼組約 300 人，年長組約 600 人。','芭蕾兩個年齡組都約有 600 名學生。','芭蕾兩個年齡組都約有 300 名學生。'],
  ['現代舞年幼組近 300 人，年長組約 520 人。','現代舞年幼組約 520 人，年長組近 300 人。','現代舞兩個年齡組都約有 520 名學生。','現代舞兩個年齡組都約有 300 名學生。'],
  ['踢踏舞兩組人數相近，約 450 人及略高於 400 人。','踢踏舞兩組人數相同，兩組都有約 450 人。','踢踏舞兩組差距很大，年長組多出約 400 人。','踢踏舞只有年幼組參加，年長組沒有學生。'],
  ['把私營場地的 48% 當成 48 名學生來寫。','把私營場地的 48% 當成班級份額來寫。','把芭蕾年幼組約 600 人當成人數來寫。','把學院場地的 10% 當成班級份額來寫。'],
  ['六百名芭蕾年幼學生佔全部年幼學生六成。','芭蕾的年幼學生人數大約有六百名。','私營場地約佔全部舞蹈班的百分之四十八。','踢踏舞年長學生的人數略高於四百名。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-mixed-charts:2',meta:{topic:'澳洲城鎮舞蹈班：場地與舞種年齡組',summary:'場地圖是班級百分比，舞種圖是學生人數。私營場地 48% 正好是學校課後 24% 兩倍；ballet 年幼組最多，modern 年長組更多，tap 兩組相近。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

// Task 1 Process Diagram 8: salmon growth stages, habitat moves, times and body lengths.
const quiz=(prompt,options,why)=>({type:'quiz',prompt,detail:'對照棲地、時長及魚身長度。',options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'由上游魚卵順箭嘴經下游、外海，再回上游產卵。',items:items.map(([title,body])=>({title,body})),why});
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const v=(...rows)=>rows,slot=(text,label)=>[text,'slot',label],link=text=>[text,'link','句型固定部分'];
const f=(example,relation,distractors,frame)=>({example,distractors,frame,answerReason:`這句${relation}，用法與原文一致。`,distractorReason:`這句${relation}；它並非本題要辨認的句型及功能。`});
const simple=[
 'The diagrams show where salmon live, how long they stay there, and how big they are as they grow.',
 'Overall, salmon grow through three named stages—fry, smolt and adult. They leave freshwater rivers for the open sea, then go back up the river to lay eggs.',
 'The whole cycle takes about nine and a half years. Salmon spend the longest time in the sea and grow most there.',
 'First, salmon lay eggs in the upper river, where water moves slowly and reeds and small stones surround the eggs.',
 'After about five to six months, the eggs open and the young fry are only 3–8 cm long.',
 'The young fish then swim down to the lower river, where water moves faster.',
 'They stay there for about four years and become smolt about 12–15 cm long.',
 'After this time in fresh water, the smolt travel to the open sea.',
 'They spend about five years there, longer than in the river, and grow into adult salmon.',
 'By then, they have grown a lot and are 70–76 cm long.',
 'Finally, the adult fish swim back up to the upper river, lay eggs there, and start the cycle again.',
];
const vocabulary=[
 v(['illustrate','show','展示'],['life cycle','as they grow','生命週期'],['habitats','where salmon live','棲地'],['durations','how long they stay there','時長'],['sizes','how big they are','體長']),
 v(['pass through','grow through','經歷'],['growth stages','stages','成長階段'],['freshwater rivers','freshwater rivers','淡水河'],['returning upstream','go back up the river','返回上游'],['reproduce','lay eggs','繁殖產卵']),
 v(['lasts roughly','takes about','約歷時'],['longest period spent in the sea','spend the longest time in the sea','外海階段最長'],['most growth occurring','grow most','增長最多'],['marine phase','there','海洋階段']),
 v(['At the beginning','First','開始時'],['eggs are laid','lay eggs','產卵'],['upper river','upper river','河流上游'],['slow-moving water','water moves slowly','緩流'],['spawning environment','surround the eggs','產卵環境']),
 v(['approximately','about','大約'],['hatch into fry','eggs open and the young fry','孵成魚苗'],['measuring only','only','僅長']),
 v(['move downstream','swim down','游往下游'],['lower river','lower river','下游河段'],['faster-flowing','water moves faster','較急流']),
 v(['remain there','stay there','在此停留'],['about four years','about four years','約四年'],['growing into smolt','become smolt','長成銀鮭幼魚'],['around 12–15 cm','about 12–15 cm','約十二至十五厘米']),
 v(['Following this freshwater stage','After this time in fresh water','經淡水階段後'],['migrate','travel','遷徙'],['open sea','open sea','外海']),
 v(['longest single phase','longer than in the river','單一最長階段'],['lasting about five years','spend about five years','歷時約五年'],['develop into adult salmon','grow into adult salmon','長成成魚']),
 v(['By this point','By then','此時'],['length has increased markedly','have grown a lot','體長顯著增加'],['70–76 cm','70–76 cm','七十至七十六厘米']),
 v(['Finally','Finally','最後'],['mature fish','adult fish','成熟魚'],['swim back','swim back','游回'],['restart the cycle','start the cycle again','重新開始週期']),
];
const structures=[
 f('The diagrams illustrate the life cycle of trout, showing the habitats, durations and sizes associated with its main developmental stages.','引言並列三個觀察維度：棲地、時長和體長',[1,3,8],{formula:'The diagrams illustrate the life cycle of [物種], showing the habitats, durations and sizes associated with its main developmental stages',meaning:'三個資料軸分別是上游／下游／海、5–6 月／4 年／5 年、3–8／12–15／70–76 cm。',usage:'不要把 5–6 months 誤作 fry 在下游停留時間；每個數值要配對棲地。',parts:[link('The diagrams illustrate the life cycle of'),slot(' the salmon','物種'),link(', showing the habitats, durations and sizes associated with its main developmental stages.')]}),
 f('Overall, wild salmon pass through three named growth stages—fry, smolt and adult salmon—and move from freshwater rivers to the open sea before returning upstream to reproduce.','概覽三個成長名稱及淡水→海→上游回返',[0,3,8],{formula:'Overall, [物種] pass through three named growth stages—fry, smolt and adult salmon—and move from freshwater rivers to the open sea before returning upstream to reproduce',meaning:'fry→smolt→adult salmon；成魚由外海回上游產卵，構成循環。',usage:'三個 named stages 不等於圖只有三個居留地；有上游、下游與外海。',parts:[link('Overall,'),slot(' salmon','物種'),link(' pass through three named growth stages—fry, smolt and adult salmon—and move from freshwater rivers to the open sea before returning upstream to reproduce.')]}),
 f('The cycle lasts roughly ten years, with the longest period spent in the sea and most growth occurring during the marine phase.','概覽總時長、最長棲地與主要體長增長期',[0,4,8],{formula:'The cycle lasts roughly [總時長], with the longest period spent in the sea and most growth occurring during the marine phase',meaning:'約 5–6 個月 + 4 年 + 5 年≈9.5 年；海洋 5 年最長，體長至 70–76 cm。',usage:'roughly 表約數；不能把四年淡水階段當整個週期。',parts:[link('The cycle lasts roughly'),slot(' nine and a half years','總時長'),link(', with the longest period spent in the sea and most growth occurring during the marine phase.')]}),
 f('At the beginning, fish eggs are laid in the upper river, where slow-moving water, reeds and small stones provide the spawning environment.','起點定位上游緩流、蘆葦和小石的產卵環境',[0,4,8],{formula:'At the beginning, [魚卵] are laid in the upper river, where slow-moving water, reeds and small stones provide the spawning environment',meaning:'魚卵在 upper river；圖標 slow moving、reeds、small stones。',usage:'下游為 fast flowing，不能把兩段水速互換。',parts:[link('At the beginning,'),slot(' salmon eggs','魚卵'),link(' are laid in the upper river, where slow-moving water, reeds and small stones provide the spawning environment.')]}),
 f('After approximately six months, they hatch into fry, measuring only 4–9 cm.','把孵化時長與 fry 體長放在同句',[0,3,8],{formula:'After approximately [孵化期], they hatch into fry, measuring only [fry 體長]',meaning:'魚卵約 5–6 個月孵化；fry 長 3–8 cm。',usage:'they 回指 eggs；fry 體長不是 adult 70–76 cm。',parts:[link('After approximately'),slot(' five to six months','孵化期'),link(', they hatch into fry, measuring only'),slot(' 3–8 cm','fry 體長'),link('.')]}),
 f('These young fish then move downstream to the lower river, a more rapidly flowing area.','說明 fry 由上游移至流速較快下游',[0,4,8],{formula:'These young fish then move downstream to the lower river, a [水速描述] area',meaning:'fry 下移至 lower river；該段 fast flowing。',usage:'downstream 指河流流向下游，不是游回上游產卵。',parts:[link('These young fish then move downstream to the lower river, a'),slot(' faster-flowing','水速描述'),link(' area.')]}),
 f('They remain there for about three years, growing into smolt of around 10–14 cm.','用 there 回指下游，配對停留時長與 smolt 體長',[0,4,8],{formula:'They remain there for about [時長], growing into smolt of around [體長]',meaning:'下游約 4 年，長成 12–15 cm smolt。',usage:'there 是 lower river，不是 open sea；外海停留另約 5 年。',parts:[link('They remain there for about'),slot(' four years','時長'),link(', growing into smolt of around'),slot(' 12–15 cm','體長'),link('.')]}),
 f('Following this freshwater stage, the smolt migrate to coastal waters.','承接下游淡水階段，轉至海洋棲地',[0,4,9],{formula:'Following this freshwater stage, the smolt migrate to [下一棲地]',meaning:'smolt 從 lower river 遷往 open sea。',usage:'freshwater stage 是河流，不是圖中五年的外海階段。',parts:[link('Following this freshwater stage, the smolt migrate to'),slot(' the open sea','下一棲地'),link('.')]}),
 f('This is the longest single phase, lasting about six years, during which they develop into adult salmon.','用 This 回指外海，報最長停留期及成魚階段',[0,4,7],{formula:'This is the longest single phase, lasting about [時長], during which they develop into adult salmon',meaning:'外海約五年，smolt 成 adult salmon。',usage:'This 指海洋階段；下游約四年較短。',parts:[link('This is the longest single phase, lasting about'),slot(' five years','時長'),link(', during which they develop into adult salmon.')]}),
 f('By this point, their length has increased markedly to 75–80 cm.','成魚形成時報最後體長範圍',[0,4,8],{formula:'By this point, their length has increased markedly to [成魚體長]',meaning:'adult salmon 長 70–76 cm，遠長於 fry 及 smolt。',usage:'長度單位 cm，不是年齡或海洋水深。',parts:[link('By this point, their length has increased markedly to'),slot(' 70–76 cm','成魚體長'),link('.')]}),
 f('Finally, the mature fish swim back to the upper river, where they lay eggs and restart the life cycle.','以成魚逆流返上游產卵閉合週期',[0,4,8],{formula:'Finally, the mature fish swim back to the upper river, where they lay eggs and restart [循環]',meaning:'adult 從外海回 upper river 產卵；下一代再成 fry。',usage:'返回的是上游產卵地，不是下游四年棲地。',parts:[link('Finally, the mature fish swim back to the upper river, where they lay eggs and restart'),slot(' the cycle','循環'),link('.')]}),
];
const intro=[quiz('三個命名成長階段按甚麼次序？',['fry→smolt→adult salmon','adult→fry→smolt','smolt→adult→egg→fry','三者沒有先後'],'圖例以 1、2、3 配上體長。'),{type:'multi',prompt:'哪兩項可作生命週期概覽？',detail:'選兩項，再按「確認」。',options:['鮭魚從上游到下游、再到外海，成年後返回上游產卵','週期約九年半，外海約五年是最長單段且體長增加最多','鮭魚一生只留在海裏','三個命名階段體長完全一樣'],correct:[0,1],why:'動線、時長與體長發展是主特徵。'}];
const route=[sequence('依範文排四段鮭魚生命週期',[
 ['引言','圖展示鮭魚不同階段的棲地、時長和體長。'],['概覽','fry→smolt→adult；淡水到外海再返上游；約九年半、海洋階段最長。'],['淡水細節','上游緩流產卵；5–6 月孵 fry 3–8 cm；下游四年成 smolt 12–15 cm。'],['海洋與回返','外海五年成 adult 70–76 cm；成熟魚回上游產卵。'],
],'數值須一一配對：月數對魚卵、四年對下游、五年對外海。')];
const evidence=[
 quiz('魚卵在哪裏？',['上游緩流、蘆葦及小石旁','外海深水','下游快速水流中','陸地沙漠'],'upper river slow moving，reeds/small stones。'),
 quiz('魚卵約多久孵化？',['5–6 個月','4 年','5 年','70–76 個月'],'上游圖標 approx 5–6 months。'),
 quiz('fry 體長？',['3–8 cm','12–15 cm','70–76 cm','4.5 km'],'圖例 1 fry 3–8 cm。'),
 quiz('smolt 在哪段、約多久形成？',['下游較急水流、約 4 年','外海、約 5 個月','上游、約 9 年半','陸地、約 1 年'],'lower river fast flowing approx 4 years。'),
 quiz('smolt 體長？',['12–15 cm','3–8 cm','70–76 cm','約 5 公里'],'圖例 2 smolt 12–15 cm。'),
 quiz('最長棲地階段？',['外海約 5 年','上游 5 年','下游 5–6 個月','三段時間完全相同'],'open sea approx 5 years。'),
 quiz('成年鮭魚體長與下一步？',['70–76 cm，返回上游產卵','12–15 cm，返回下游產卵','3–8 cm，留外海產卵','70–76 m，直接變成卵'],'圖例 3 adult 70–76 cm，箭頭回 upper river。'),
];
const logic=[sequence('棲地、時間、體長三欄對照',[
 ['上游','魚卵約 5–6 月；孵成 fry 3–8 cm。'],['下游','較急水流約 4 年；smolt 12–15 cm。'],['外海','約 5 年；adult 70–76 cm。'],['回上游','成魚產卵，下一代循環開始。'],
 ],'總長約 0.5+4+5≈9.5 年；標示均為近似。'),sequence('三個階段名稱和兩次遷移',[
 ['fry','上游孵出，游往下游。'],['smolt','在下游成長後遷往外海。'],['adult salmon','在外海約五年形成，體長增至 70–76 cm。'],['繁殖回返','成熟魚回上游，不回外海產卵。'],
 ],'魚卵不列在圖例的三個 named growth stages 內，但屬生命週期起點。')];
const transfers=[
 transfer('另一生物週期圖同時給棲地、停留時間和體長。','哪句引言完整？',['圖展示物種生命週期，並標出各主要階段的棲地、時長和體長。','圖只比較兩地魚價。','圖只列成年魚食物。','圖沒有階段資訊。'],['三種觀察維度皆列出。','不是價格。','另有幼魚。','有階段。'],[0],'原文 habitats、durations、sizes across developmental stages。'),
 transfer('圖例 fry、smolt、adult；河→海→上游返。','哪句概覽正確？',['鮭魚依次經三個命名階段，從淡水遷往海洋，再返上游產卵。','鮭魚終生只住外海。','成年魚先變 fry 再長成 smolt。','回上游只為進入更深海。'],['階段與遷徙循環準確。','還有河流。','成長順序錯。','回去產卵。'],[1],'原文 fry→smolt→adult，freshwater→sea→upstream。'),
 transfer('孵化約半年、下游約四年、外海約五年。','哪句總時長和最長期準確？',['全週期約九年半，其中外海約五年是最長單段。','全週期只有五個月。','下游四年比外海五年更長。','圖精確顯示每階段恰好同長。'],['近似相加與長短排名正確。','漏掉多年。','5>4。','時長不同。'],[2],'原文 roughly 9.5 years，sea longest phase。'),
 transfer('上游圖標 slow moving、reeds、small stones。','哪句定位產卵環境？',['鮭魚在緩流上游的蘆葦和小石附近產卵。','鮭魚在急流下游的大海中產卵。','魚卵在山頂空氣中成長。','上游圖沒有植物或石頭。'],['位置與環境圖示吻合。','棲地混淆。','沒有。','圖有標記。'],[3],'原文 eggs upper river with slow water，reeds，stones。'),
 transfer('卵約五至六個月後孵化；fry 長 3–8 cm。','哪句配準時長和尺寸？',['約五至六個月後魚卵孵成 fry，魚苗僅長 3–8 cm。','魚卵需五年才孵成 70–76 cm 的 fry。','fry 長 12–15 cm。','3–8 cm 是河流深度。'],['兩數據分別配魚卵與 fry。','時間和長度錯。','那是 smolt。','單位是魚長。'],[4],'原文 after 5–6 months hatch fry 3–8 cm。'),
 transfer('fry 從上游游往下游，水流變急。','哪句把 downstream 用對？',['年幼鮭魚往下游較急流的河段移動。','年幼鮭魚從外海直接游回上游產卵。','下游比上游水流更緩。','魚在下游進行第一次產卵。'],['移動方向及水速吻合。','那是成魚後期。','圖標 fast flowing。','上游產卵。'],[5],'原文 move downstream to faster-flowing lower river。'),
 transfer('下游標約四年，圖例 smolt 12–15 cm。','哪句讓 there 指向下游？',['牠們在下游約四年，長成 12–15 cm 的 smolt。','牠們在外海四年才孵成魚卵。','smolt 長 70–76 cm。','四年是上游卵孵化時間。'],['there 回指下游；尺寸對 smolt。','外海五年。','那是成魚。','卵約半年。'],[6],'原文 remain there four years→smolt 12–15 cm。'),
 transfer('smolt 已經在下游完成淡水階段。','哪句下一棲地正確？',['淡水階段後，smolt 遷往外海。','淡水階段後，smolt 進入沙漠。','smolt 再回上游產卵。','smolt 完全不移動。'],['下游→外海。','沒有陸地。','成魚才回上游。','圖有箭頭。'],[7],'原文 smolt migrate open sea after freshwater stage。'),
 transfer('外海約五年，之後是 adult salmon。','哪句理解 This 正確？',['這段外海生活約五年，是最長單段，魚長成成年鮭魚。','This 指上游魚卵的五至六個月。','This 指下游四年。','圖說成年魚在沙漠長大。'],['This 承接外海。','時間不同。','下游較短。','棲地錯。'],[8],'原文 This = sea phase，about five years→adult。'),
 transfer('成魚標 70–76 cm。','哪句把尺寸和階段對準？',['到成年時體長顯著增加至 70–76 cm。','fry 一孵出便長 70–76 cm。','70–76 是外海年數。','成魚仍只有 3–8 cm。'],['體長單位與成年階段吻合。','fry 較小。','單位 cm。','數值錯。'],[9],'原文 adult length 70–76 cm。'),
 transfer('成魚箭頭由外海返回上游卵區。','哪句完成循環？',['成熟鮭魚游回上游產卵，新的生命週期由此開始。','成魚在外海永久不再回河。','成魚回下游孵化成 fry。','圖最後是將魚製成食品。'],['回返地點和繁殖作用正確。','圖有回箭。','上游產卵。','沒有食品加工。'],[10],'原文 mature fish swim back upper river and lay eggs。'),
];
const balancedTransferOptions=[
  ['圖示鮭魚各階段的棲地、時長與體長。','圖示鮭魚在兩個市場的價格與重量。','圖示成年鮭魚的食物、價格與重量。','圖示鮭魚各階段的棲地，但沒有尺寸。'],
  ['鮭魚經三階段，從河流到海洋再回上游產卵。','鮭魚經三個階段，終生只住外海而不返河。','鮭魚先長成成魚，再變魚苗並到外海。','鮭魚從河流到海洋，最後回上游覓食。'],
  ['全程約九年半，外海五年是最長單段。','全程約五個月，外海五年是最長單段。','全程約九年半，下游四年是最長單段。','各階段時間完全相同，都是約五年。'],
  ['鮭魚在緩流上游的蘆葦與小石附近產卵。','鮭魚在急流下游的蘆葦與小石附近產卵。','鮭魚在外海上空的蘆葦與小石附近產卵。','鮭魚在緩流上游產卵，圖中沒有蘆葦。'],
  ['魚卵約五至六個月孵化，魚苗長 3–8 cm。','魚卵約五至六年孵化，魚苗長 70–76 cm。','魚卵約五至六個月孵化，魚苗長 12–15 cm。','魚卵約五至六個月孵化，河流深 3–8 cm。'],
  ['幼魚由上游移到水流較急的下游河段。','幼魚由外海移回上游，並立即開始產卵。','幼魚由上游移到水流更緩的下游河段。','幼魚到下游進行第一次產卵，不再移動。'],
  ['幼魚在下游約四年，長成 12–15 cm 的幼鮭。','幼魚在外海約四年，才孵成 12–15 cm 魚卵。','幼魚在下游約四年，長成 70–76 cm 的幼鮭。','魚卵在上游約四年，長成 12–15 cm 的幼鮭。'],
  ['完成淡水階段後，幼鮭便遷往外海。','完成淡水階段後，幼鮭便遷往沙漠。','完成淡水階段後，幼鮭立即回上游產卵。','完成淡水階段後，幼鮭完全不再移動。'],
  ['鮭魚在外海約五年，最後長成成年魚。','鮭魚在上游約五年，最後才孵成魚卵。','鮭魚在下游約五年，最後長成成年魚。','鮭魚在沙漠約五年，最後長成成年魚。'],
  ['成年鮭魚體長增至 70–76 cm。','剛孵出的魚苗體長已達 70–76 cm。','成年鮭魚在外海待了 70–76 年。','成年鮭魚體長仍只有 3–8 cm。'],
  ['成魚游回上游產卵，新一輪生命週期展開。','成魚永久留在外海，沒有再返回河流。','成魚回到下游孵化，變成剛出生的魚苗。','成魚離開外海後，被送到工廠製成食品。']
];
balancedTransferOptions.forEach((options,i)=>{transfers[i].options=options});
export default {key:'task1-process-diagram:8',meta:{topic:'鮭魚生命週期：上游、下游、外海與回返',summary:'上游緩流卵約 5–6 月→fry 3–8 cm→下游急流約 4 年→smolt 12–15 cm→外海約 5 年→adult 70–76 cm→返上游產卵。全程約九年半。'},simple,vocabulary,structures,intro,route,evidence,logic,transfer:transfers};

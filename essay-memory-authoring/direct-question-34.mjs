// Complete, source-specific support for Direct Question 34.
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-lessons/model-essay-34-ielts-direct-question.js',import.meta.url),'utf8'),context);
const source=context.window.ESSAY_MEMORY_LESSONS['direct-question:34'];
const original=source.sentences.map(row=>row.english);
const simple=[
  'People now watch films from many countries because media from around the world is easy to reach.',
  'Many people choose films from other countries instead of local films because these films often look better made, offer more kinds of stories and are seen in more adverts.',
  'I think governments should give more help to local film makers because this keeps local culture alive and helps people learn how to make films.',
  'The main reason films from other countries attract many people is that they often have more money behind them.',
  'Large film companies can spend a lot on famous actors, special pictures, sound and advertising across the world, so people may want to see a film before going to the cinema.',
  'They also make many kinds of films, from stories about heroes to stories about the past, so people can choose what they like.',
  'But local films, especially in places with fewer viewers, may have less money for adverts and fewer cameras and editing tools.',
  'Even if the story is good, people may not hear about the film.',
  'So films from other countries sometimes do better not because they are always better films, but because more people hear about and notice them.',
  'Because of this, I think governments need to help pay for local films.',
  'Films are more than things to sell; they also help people remember the language, ideas, jokes, places and daily problems of their society.',
  'Without help, local film makers and writers may have to copy the usual kinds of stories from other countries or stop working in films.',
  'Money from the government, classes for film makers and help for cinemas showing local films can give new film makers a chance to grow.',
  'For example, a young person who gets money to make a film may tell a story about local families, work or customs that big foreign companies would not make.',
  'That helps many people who work in films.',
  'To sum up, people often like films from other countries because they have more money, more advertising and better ways to reach viewers.',
  'Even so, governments should spend more on local films because they keep local culture alive and give local film makers a real chance to improve.',
];
const vocabulary=[
  [['consumed','watch','觀看'],['highly globalised media environment','media from around the world','全球媒體環境'],['audiences','People','觀眾'],['access productions from almost anywhere','films from many countries','接觸各地作品']],
  [['viewers','people','觀眾'],['international films','films from other countries','外國電影'],['domestic ones','local films','本地電影'],['more polished','better made','製作更精良'],['more varied','more kinds of stories','更多元'],['better advertised','seen in more adverts','較多宣傳']],
  [['governments should increase support','governments should give more help','政府增加支持'],['local film industry','local film makers','本地電影業'],['protects cultural identity','keeps local culture alive','保護文化'],['develops creative talent','helps people learn how to make films','培養創意人才']],
  [['foreign films','films from other countries','外國電影'],['attract large audiences','attract many people','吸引大量觀眾'],['stronger commercial backing','more money behind them','較強商業支持']],
  [['Major studios','Large film companies','大型電影公司'],['spend heavily','spend a lot','大量投入'],['visual effects','special pictures','視覺特效'],['worldwide promotion','advertising across the world','全球宣傳'],['feel exciting','want to see a film','讓人期待'],['entered the cinema','going to the cinema','進入戲院']],
  [['wide range of genres','many kinds of films','多種電影類型'],['superhero stories','stories about heroes','超級英雄故事'],['historical dramas','stories about the past','歷史劇'],['matches their taste','what they like','符合口味']],
  [['By contrast','But','相比之下'],['smaller markets','places with fewer viewers','較小市場'],['weaker marketing','less money for adverts','較弱行銷'],['fewer technical resources','fewer cameras and editing tools','較少技術資源']],
  [['storytelling is strong','story is good','故事出色'],['struggle to reach the public','people may not hear about the film','難接觸大眾']],
  [['In this sense','So','從這角度'],['foreign cinema sometimes wins','films from other countries sometimes do better','外國電影有時勝出'],['not because it is always better','not because they are always better films','並非總較好'],['louder voice and a brighter spotlight','more people hear about and notice them','宣傳聲勢更強']],
  [['For this reason','Because of this','因此'],['public funding','governments need to help pay','公共資金'],['local cinema','local films','本地電影'],['necessary','need','必要']],
  [['not only commercial products','more than things to sell','不只是商品'],['a way for a society to remember','help people remember','保存社會記憶'],['language, values, humour, landscapes','language, ideas, jokes, places','語言價值幽默風景'],['everyday problems','daily problems','日常問題']],
  [['Without support','Without help','缺乏支持'],['local directors and writers','local film makers and writers','本地導演編劇'],['copy foreign formulas','copy the usual kinds of stories from other countries','模仿外國套路'],['leave the industry altogether','stop working in films','離開行業']],
  [['Government grants','Money from the government','政府補助'],['training schemes','classes for film makers','培訓計劃'],['subsidies for cinemas that show domestic films','help for cinemas showing local films','本地片戲院資助'],['new talent','new film makers','新人才'],['room to breathe','chance to grow','發展空間']],
  [['young filmmaker','young person','年輕電影人'],['receives funding','gets money to make a film','獲資助'],['local families, workplaces, or traditions','local families, work or customs','本地家庭工作傳統'],['international studios','big foreign companies','國際片廠'],['never produce','would not make','不會製作']],
  [['strengthens','helps','強化'],['whole creative ecosystem','many people who work in films','創意生態']],
  [['In conclusion','To sum up','總結'],['prefer foreign films','like films from other countries','較喜歡外國電影'],['better funded','more money','資金更多'],['promoted','advertising','宣傳'],['distributed','ways to reach viewers','發行']],
  [['Nevertheless','Even so','然而'],['spend more money','spend more','增加投入'],['national cinema preserves culture','keep local culture alive','國家電影保存文化'],['local talent','local film makers','本地人才'],['genuine chance to grow','real chance to improve','真正成長機會']],
];
const chunkOverrides=[
  ['Films are now consumed in a highly globalised media environment,','where audiences can access productions from almost anywhere.'],
  ['Many viewers therefore choose international films over domestic ones','because they often seem more polished, more varied,','and better advertised.'],
  ['In my view, governments should increase support','for the local film industry','because it protects cultural identity and develops creative talent.'],
  ['The main reason foreign films attract large audiences','is that they usually benefit from stronger commercial backing.'],
  ['Major studios can spend heavily on famous actors,','visual effects, sound design, and worldwide promotion,','so their films often feel exciting','before the audience has even entered the cinema.'],
  ['They also tend to offer a wide range of genres,','from superhero stories to historical dramas,','which allows viewers to find something that matches their taste.'],
  ['By contrast, local films, especially in smaller markets,','may have weaker marketing and fewer technical resources.'],
  ['Even when the storytelling is strong,','the film can struggle to reach the public.'],
  ['In this sense, foreign cinema sometimes wins','not because it is always better,','but because it arrives with a louder voice','and a brighter spotlight.'],
  ['For this reason, I believe','public funding for local cinema is necessary.'],
  ['Films are not only commercial products;','they are also a way for a society','to remember its language, values, humour, landscapes,','and everyday problems.'],
  ['Without support, many local directors and writers','may be forced to copy foreign formulas','or leave the industry altogether.'],
  ['Government grants, training schemes,','and subsidies for cinemas that show domestic films','can give new talent room to breathe.'],
  ['For example, a young filmmaker who receives funding','may tell a story about local families, workplaces, or traditions','that international studios would never produce.'],
  ['This strengthens','a whole creative ecosystem.'],
  ['In conclusion, people often prefer foreign films','because they are better funded, promoted, and distributed.'],
  ['Nevertheless, governments should spend more money','on local film industries,','since national cinema preserves culture','and gives local talent a genuine chance to grow.'],
];
const simpleChunkOverrides=[
  ['People now watch films from many countries','because media from around the world is easy to reach.'],
  ['Many people choose films from other countries','instead of local films','because these films often look better made,','offer more kinds of stories','and are seen in more adverts.'],
  ['I think governments should give more help','to local film makers','because this keeps local culture alive','and helps people learn how to make films.'],
  ['The main reason films from other countries attract many people','is that they often have more money behind them.'],
  ['Large film companies can spend a lot','on famous actors, special pictures, sound','and advertising across the world,','so people may want to see a film','before going to the cinema.'],
  ['They also make many kinds of films,','from stories about heroes to stories about the past,','so people can choose what they like.'],
  ['But local films, especially in places with fewer viewers,','may have less money for adverts','and fewer cameras and editing tools.'],
  ['Even if the story is good,','people may not hear about the film.'],
  ['So films from other countries sometimes do better','not because they are always better films,','but because more people hear about and notice them.'],
  ['Because of this, I think','governments need to help pay for local films.'],
  ['Films are more than things to sell;','they also help people remember','the language, ideas, jokes, places','and daily problems of their society.'],
  ['Without help, local film makers and writers','may have to copy the usual kinds of stories','from other countries or stop working in films.'],
  ['Money from the government, classes for film makers','and help for cinemas showing local films','can give new film makers a chance to grow.'],
  ['For example, a young person who gets money to make a film','may tell a story about local families, work or customs','that big foreign companies would not make.'],
  ['That helps','many people who work in films.'],
  ['To sum up, people often like films from other countries','because they have more money, more advertising','and better ways to reach viewers.'],
  ['Even so, governments should spend more on local films','because they keep local culture alive','and give local film makers a real chance to improve.'],
];
const part=(text,kind,label)=>({text,kind,label});
function fixed(i,formula,meaning,usage,links,labels){const text=original[i],parts=[];let cursor=0,slot=0;for(const link of links){const at=text.indexOf(link,cursor);if(at<0)throw Error(`Missing fixed span ${i+1}: ${link}`);if(at>cursor)parts.push(part(text.slice(cursor,at),'slot',labels[slot++]));parts.push(part(link,'link','句型固定部分'));cursor=at+link.length;}if(cursor<text.length)parts.push(part(text.slice(cursor),'slot',labels[slot++]));return {formula,meaning,usage,parts};}
function card(example,focus,distractors,frame){return {example,distractors,frame,patternType:'reviewed',answerReason:`這句${focus}，與原句的表達關係相同。`,distractorReason:`這句${focus}，但其表達關係與原句不同。`};}
const structures=[
  card('Books are now read in a global online market, where customers can find authors from almost anywhere.','以 where 說明全球媒體環境帶來的接觸機會',[1,3,6],fixed(0,'[電影] are now consumed in [全球化媒體環境], where [觀眾] can access [各地作品].','先說跨國作品容易接觸的媒體條件。','題目問外國作品為何受歡迎，先交代觀眾如今能看到哪些選擇時。',[' are now consumed in ', ', where ', ' can access '],['被觀看的媒體內容','供應作品的環境','可選擇的觀眾','可取得的跨國作品'])),
  card('Many readers choose global books over local ones because they look polished and are advertised more widely.','以 choose ... over ... because 比較觀眾選擇並概括三種吸引力',[0,3,6],fixed(1,'[許多觀眾] therefore choose [外國電影] over [本地電影] because they [較精良、較多元、宣傳較多].','把外國電影偏好連到製作、類型和宣傳三項表面優勢。','引言要回答偏好原因，先概括觀眾看得見的競爭差異時。',[' therefore choose ', ' over ', ' because they '],['作選擇的觀眾','被選中的外國作品','被比較的本地作品','外國作品較突出的條件'])),
  card('In my view, councils should support local theatres because they keep local stories alive and train actors.','以 because 交代政府支持的兩項公共理由',[1,9,16],fixed(2,'In my view, [政府] should increase support for [本地電影業] because it [保護文化身份] and [培養創意人才].','直接回答政府應否增資，理由分為文化保存及人才發展。','題目第二問要求政府投入判斷，需早表態並預告兩條依據時。',['In my view, ', ' should increase support for ', ' because it ', ' and '],['需決策的政府','受支持的本地產業','第一項文化好處','第二項人才好處'])),
  card('The main reason international books attract readers is that large publishers can fund them well.','以 The main reason ... is that 指出較強商業支持',[1,4,6],fixed(3,'The main reason [外國電影吸引大量觀眾] is that they usually benefit from [較強商業支持].','第一主體段聚焦資金及宣傳，而非斷言本地故事較差。','開始回答外國片偏好原因，要提出可由製作與宣傳開支支持的主因時。',['The main reason ', ' is that they usually benefit from '],['需要解釋的觀眾偏好','帶來差距的資源'])),
  card('Large publishers can spend heavily on writers, covers and international adverts, so readers notice books before release.','以 so 連大規模投資與觀眾入場前的期待',[3,5,7],fixed(4,'[大型片廠] can spend heavily on [演員、特效、音效及全球宣傳], so [電影] often feel exciting before [觀眾入場].','資金變成可見製作及廣告，使電影在上映前已受注意。','已說商業支持較強，要具體說資金如何改變觀眾預期時。',[' can spend heavily on ', ', so ', ' often feel exciting before '],['有資金的片廠','可投入的製作宣傳項目','因此受注意的作品','預期形成的時間點'])),
  card('They offer many kinds of books, from mystery stories to history, which helps readers find a favourite.','以 from ... to ... which 展示類型廣度如何對應口味',[4,6,7],fixed(5,'They also tend to offer [多種片類], from [超級英雄故事] to [歷史劇], which allows [觀眾] to find [符合口味的作品].','外國片廠的類型範圍增大觀眾找到合口味電影的機會。','已談宣傳與製作，再補充外國片吸引不同觀眾的內容範圍時。',['They also tend to offer ', ', from ', ' to ', ', which allows ', ' to find '],['可供選的類型範圍','一端的類型例子','另一端的類型例子','作選擇的人','找到的合口味作品'])),
  card('By contrast, local publishers in small markets may have fewer adverts and less equipment.','以 By contrast 對照小市場本地製作的資源限制',[3,5,7],fixed(6,'By contrast, [本地電影], especially in [較小市場], may have [較弱宣傳] and [較少技術資源].','不把外國受歡迎全歸功品質，指出本地片在資源上的弱勢。','列完外國片的資源優勢，要公平比較本地電影面對的市場條件時。',['By contrast, ', ', especially in ', ', may have ', ' and '],['被比較的本地作品','資源更受限的市場','第一項資源短缺','第二項資源短缺'])),
  card('Even when a local book is well written, it may struggle to reach readers.','以 Even when 讓步：作品好仍可能缺乏曝光',[6,8,9],fixed(7,'Even when [故事出色], [本地電影] can struggle to reach [公眾].','本地作品品質不低，也可能因宣傳不足無法接觸觀眾。','已指出本地行銷薄弱，要防止讀者把少人看誤當故事差時。',['Even when ', ', ', ' can struggle to reach '],['即使成立的作品優點','仍受限制的作品','難接觸的對象'])),
  card('In this sense, global books win not because they are always better, but because they are advertised louder.','以 not because ... but because 修正外國作品必然較好的推論',[3,6,7],fixed(8,'In this sense, [外國電影] sometimes wins not because [品質總較好], but because [宣傳聲量與曝光較強].','區分作品品質與市場聲量，避免把人氣當作質素證明。','比較外國與本地作品後，需要指出真正可能造成差距的是曝光而非必然品質時。',['In this sense, ', ' sometimes wins not because ', ', but because '],['表面勝出的作品','被排除的品質推論','較可信的曝光原因'])),
  card('For this reason, I believe public funding for local theatres is necessary.','以 For this reason 承接市場落差提出公共資助',[8,10,12],fixed(9,'For this reason, I believe [本地電影的公共資金] is necessary.','承接宣傳及資源不對等，轉入政府支持本地電影。','第一段已交代本地電影資源弱勢，要轉到政策回應時。',['For this reason, I believe ', ' is necessary.'],['因資源落差而需要的政策'])),
  card('Local plays are not only products to sell; they also help a community remember its words and traditions.','以 not only ...; also ... 重估電影的文化作用',[9,11,12],fixed(10,'[電影] are not only [商業產品]; they are also [社會記住語言、價值與生活的途徑].','電影不只是票房商品，也是地方文化記憶的載體。','有人以票房判斷資助價值，要說明產業的非商業公共價值時。',[' are not only ', '; they are also '],['具文化意義的作品','不足以概括其價值的商品角色','被忽略的文化角色'])),
  card('Without help, local playwrights may copy foreign hits or leave theatre altogether.','以 Without support ... or ... 說明缺乏資助的兩種風險',[10,12,13],fixed(11,'Without support, [本地導演與編劇] may be forced to [模仿外國套路] or [離開行業].','資源不足可能削弱原創性，甚至令人才流失。','文化價值已提出，要說明不支持本地創作者會怎樣時。',['Without support, ', ' may be forced to ', ' or '],['缺乏支持的創作者','第一種受迫選擇','第二種受迫選擇'])),
  card('Grants, training and help for local theatres can give new performers room to grow.','以 grants ... training ... subsidies 列三種可操作的支持',[9,11,13],fixed(12,'[政府補助], [培訓計劃] and [本地片戲院資助] can give [新人] room to breathe.','政府可透過資金、訓練和放映渠道扶持新人。','已說人才流失風險，需列出實際而非籠統的公共支持措施時。',[', ', ' and ', ' can give ', ' room to breathe.'],['第一種資金措施','第二種培訓措施','第三種放映措施','受扶持的創作者'])),
  card('For example, a young playwright with funding may stage a local family story that large foreign companies would ignore.','以 For example 展示資助如何帶來獨特地方故事',[11,12,14],fixed(13,'For example, [獲資助年輕電影人] may tell [本地家庭工作傳統的故事] that [國際片廠] would never produce.','一名年輕電影人獲資助後，可以拍大製片公司不會拍的地方生活。','列完資助工具，要以具體創作成果說明公共投入的文化回報時。',['For example, ', ' may tell ', ' that ', ' would never produce.'],['可獲支持的創作者','可能因此拍出的故事','不會製作該故事的市場主體'])),
  card('This strengthens the whole local theatre community.','以 This strengthens 簡短收束對整個創意群體的效益',[12,13,15],fixed(14,'This strengthens [整個創意生態].','把單一創作者的例子上升到整體人才、作品和放映網絡。','具體資助例子已說完，要簡潔指出不只一名創作者受益時。',['This strengthens '],['受到連帶改善的整體產業'])),
  card('In conclusion, people prefer global books because they have more funding, promotion and distribution.','以 because 總結資金、宣傳與發行三因素',[1,3,16],fixed(15,'In conclusion, [觀眾偏好外國電影] because they are [資金較足], [宣傳較強] and [發行較廣].','結論先回應第一問，歸納外國電影的三項市場優勢。','末段要精簡回答外國片較受歡迎的原因時。',['In conclusion, ', ' because they are ', ', ', ' and '],['要解釋的觀眾偏好','第一項資金優勢','第二項宣傳優勢','第三項發行優勢'])),
  card('Nevertheless, councils should fund local theatres, since plays protect culture and give young actors a chance.','以 since 總結政府投入的文化及人才回報',[2,10,15],fixed(16,'Nevertheless, [政府] should spend more money on [本地電影業], since [本地電影] preserves [文化] and gives [本地人才] a genuine chance to grow.','結論再答第二問：政府增資有保存文化與培養人才的理由。','已概括觀眾偏好，還須明確重申政府是否應支持本地電影及原因時。',['Nevertheless, ', ' should spend more money on ', ', since ', ' preserves ', ' and gives ', ' a genuine chance to grow.'],['提供支持的政府','受資助的產業','承載文化的本地作品','被保存的內容','獲發展機會的人'])),
];
const wrongReasons=[
  ['外國片的製作宣傳優勢是結果比較，沒有先說全球媒體可接觸性。','片廠商業支持是後文成因，未建立觀看選擇環境。','本地資源弱勢是市場對比，不是全球媒體背景。'],
  ['全球環境只說可取得外國作品，未交代觀眾為何選它們。','商業支持只是其中一項，沒有三種表面優勢概括。','本地資源弱勢是後文比較，不是引言的觀眾選擇。'],
  ['觀眾偏好回答第一問，未對政府增資表態。','公共資金必要性是第二段轉入政策，未預告文化與人才。','結論重申政策，非引言預告雙理由。'],
  ['引言說三項表面優勢，未聚焦商業支持主因。','片廠開支是下一句證據，並非段首總理由。','本地弱勢是對照面，沒有提出外國片商業基礎。'],
  ['商業支持是總述，未列演員特效音效及全球宣傳。','類型廣度是另一種吸引力，沒有上映前期待機制。','本地行銷短缺是對比，不是大型片廠的投資效果。'],
  ['片廠投資談製作宣傳，沒有 from ... to ... 的類型跨度。','本地資源較少是對照，沒有觀眾口味如何被滿足。','故事好仍難接觸大眾是曝光限制，非類型選擇。'],
  ['商業支持說外國優勢，沒有 By contrast 的本地弱勢。','類型廣度不談小市場宣傳和技術限制。','故事好仍難接觸公眾是本地資源弱勢的後果。'],
  ['本地市場弱勢是一般狀況，未用 Even when 防止品質誤判。','曝光對質素的反思是下一句總結，不是讓步句。','公共資金必要性是政策轉折，不是作品接觸困難。'],
  ['商業資源是原因，但未排除外國作品必然更好的推論。','本地市場弱勢是前提，沒有 not because ... but because。','故事好仍難到達公眾是例子，尚未總結品質與曝光差異。'],
  ['品質與曝光反思是前段總結，尚未提出公共資金。','文化記憶是支持資助的下一個理由。','資助措施是具體方法，不是 For this reason 的政策立場。'],
  ['公共資金必要性是政策主張，未解釋電影超越商品的價值。','失去創作者是缺乏支持的後果，不是文化角色。','補助培訓是措施，未說電影保存社會記憶。'],
  ['文化記憶是應支持的原因，沒有 Without support 的人才風險。','補助等是解法，而不是缺支援後的兩種損失。','年輕電影人例子是資助後成果，非缺資助的後果。'],
  ['公共資金必要性只說要支持，沒有三種政策工具。','人才流失風險是支持措施的原因，未列補助培訓戲院。','年輕電影人是資助成效的例子，非政策清單。'],
  ['人才風險是抽象後果，沒有一位獲資助電影人的創作例子。','補助清單列工具，未展示拍出的地方故事。','創意生態是其後總結，沒有本地家庭與傳統的個案。'],
  ['補助清單談措施，不是整個創意群體的收束。','年輕電影人例子只談個別成果，尚未升到整體。','結論偏好外國片回答第一問，非創意生態效果。'],
  ['引言偏好概括三種表面優勢，但不是全文後的結論。','商業支持只集中資金一面，未總結宣傳與發行。','政府增資是第二問答案，不是外國電影受歡迎成因。'],
  ['引言政府立場是預告，未經文化與人才論證。','文化角色只說理由，沒有結論的政府增資判斷。','前句只解釋觀眾偏好，未回答政府投入是否應增加。'],
];
structures.forEach((row,i)=>{row.wrongReasons=wrongReasons[i];});
const quiz=(prompt,options,why)=>({type:'quiz',prompt,options,correct:0,why});
const sequence=(prompt,items,why)=>({type:'sequence',prompt,detail:'先看市場原因，再看政府回應，依範文次序排卡。',items:items.map(([title,body])=>({title,body})),why});
const intro=[
  quiz('題目要求回答哪兩件事？',[
    '為何觀眾偏好外國電影，以及政府應否多支持本地電影',
    '哪位演員最受歡迎，以及電影票應賣多少錢',
    '電影應用哪種鏡頭，以及戲院座位應怎樣排列',
    '各國電影有多少分鐘，以及戲院何時開門',
  ],'文章須先解釋偏好，再判斷政府支持本地電影的必要性。'),
  {type:'multi',prompt:'選出作者支持本地電影的兩項核心公共理由',detail:'選兩項，再按「確認」。',options:[
    '電影可保留地方語言、價值與日常生活的故事',
    '資助及訓練可讓本地導演編劇得到發展機會',
    '本地電影必須完全複製外國片廠的所有故事',
    '只要有補助，電影便不需要觀眾或放映場所',
  ],correct:[0,1],why:'範文把文化記憶與本地創作人才作為政府投入的兩條理由。'},
];
const route=[sequence('依文章次序排列四段任務',[
  ['引言回應兩問','全球媒體擴大選擇；外國片較精良及曝光高；政府應扶持本地片。'],
  ['解釋外國片偏好','大製片公司有資金、類型和宣傳優勢，本地片即使好也難曝光。'],
  ['論證政府支持','電影保存文化；補助培訓及戲院資助讓新人拍地方故事。'],
  ['結論雙重收束','外國片受資金宣傳及發行推動，本地片仍值得政府多投入。'],
],'偏好原因是市場條件；政府支持的理由是文化與人才。')];
const evidence=[
  quiz('外國電影為何能在上映前就令人期待？',[
    '大型片廠投資演員、特效、音效和全球宣傳',
    '只因外國電影一定沒有任何宣傳或預算',
    '只因本地電影從來沒有出色的故事',
    '只因觀眾入戲院後才第一次聽到片名',
  ],'資金可轉成觀眾上映前看得見的製作和宣傳。'),
  quiz('電影類型跨度如何影響觀眾選擇？',[
    '超級英雄到歷史劇等類型可對應不同口味',
    '每部電影都必須講完全相同的故事',
    '類型越多，觀眾就越不可能找到合適作品',
    '只有宣傳海報能決定觀眾喜歡哪種劇情',
  ],'原文說多種片類讓不同觀眾找到自己喜歡的作品。'),
  quiz('本地電影的弱勢一定是故事品質差嗎？',[
    '不是；小市場可能缺宣傳和技術資源，故事好仍難曝光',
    '一定；只要少人看，故事便必然完全沒有價值',
    '一定；外國電影無須任何資金也總是更好',
    '不是；因為本地電影從來不用接觸觀眾',
  ],'作者明確把市場曝光與作品品質分開。'),
  quiz('電影超越商業產品的文化作用是甚麼？',[
    '保存地方語言、價值、幽默、風景與日常問題',
    '只在片尾列出票房，不呈現任何地方生活',
    '要求所有本地創作者完全不談自己的社會',
    '只要電影有收入，就不可能再有文化意義',
  ],'電影可承載社會如何記住自己的生活。'),
  quiz('缺乏支持對本地創作者有甚麼風險？',[
    '導演編劇可能模仿外國套路，甚至離開電影業',
    '所有導演編劇必定立即得到更充足資金',
    '地方故事會自動獲所有國際片廠製作',
    '創作者從此完全不需培訓和放映渠道',
  ],'資源不足可能削弱本土原創和人才留存。'),
  quiz('作者列出哪些可操作的支持措施？',[
    '政府補助、培訓，以及支持放映本地片的戲院',
    '只寫一句支持口號，不安排任何實際資源',
    '只資助外國片廠，禁止本地電影上映',
    '只給大製片公司宣傳，不培養本地新人',
  ],'三項政策分別處理資金、人才與放映渠道。'),
  quiz('年輕電影人的例子說明甚麼？',[
    '獲資助後可拍大國際片廠不會拍的地方故事',
    '地方家庭與傳統必然完全沒有觀眾',
    '獲資助後只可重拍已有的外國大片',
    '任何地方故事都不需要創作或放映機會',
  ],'具體例子把資助連到地方文化和新人才的成果。'),
];
const logic=[
  sequence('外國片吸引力的市場鏈條',[
    ['全球媒體可接觸','觀眾容易找到世界各地電影。'],
    ['大公司投入資金','演員、特效、聲音與全球宣傳更突出。'],
    ['類型選擇豐富','不同口味的觀眾更易找到喜歡的作品。'],
    ['本地小市場弱勢','宣傳與技術資源少，即使故事好也難曝光。'],
    ['修正品質推論','外國片受歡迎可能因聲量，不代表必然品質更好。'],
  ],'把「看得到、想看、容易找到」與「品質必然更好」分開。'),
  sequence('政府支持如何轉成文化與人才',[
    ['電影有文化作用','地方語言、幽默、風景與生活可被保存。'],
    ['不支持有代價','本地創作者可能模仿外國套路或離業。'],
    ['投入三種工具','補助、培訓與本地電影放映資助。'],
    ['新人拍地方故事','國際片廠不會拍的生活得到呈現。'],
    ['產業共同受益','人才、作品與放映網絡形成創意生態。'],
  ],'政策不是只幫一部電影，而是讓地方故事有持續創作條件。'),
];
const transfer=(context,question,options,explanations,sourceSentenceIndices,modelLink)=>({prompt:question,context,question,options,correct:0,explanations,why:explanations[0],sourceSentenceIndices,modelLink});
const transferTasks=[
  transfer('一家本地出版社的小說評價不錯，但大型國際書商的廣告遮蓋了它。','哪項最能轉用範文的品質與曝光區分？',[
    '先改善本地書的宣傳，不能只憑銷量判斷品質',
    '只因本地書銷量少，就斷定故事必定很差',
    '讓國際書商繼續壟斷廣告，卻不檢查曝光',
    '只問封面顏色，不理作品能否接觸讀者',
  ],['原文指出故事好也可能因宣傳弱而難接觸公眾。','銷量不直接證明故事品質。','廣告聲量正是差距。','接觸讀者是核心。'],[6,7,8],'範文說本地電影即使故事出色也可能難到達公眾，外國片勝出未必因質素較好。'),
  transfer('地方劇團和國際巡演競爭觀眾，後者有名演員、特效和大型宣傳。','哪項最能運用範文對外國作品吸引力的解釋？',[
    '商業資源可製造期待，使觀眾進場前已注意作品',
    '只要外國作品有名演員，就一定沒有任何宣傳',
    '地方劇團少人看，便必然沒有任何好劇本',
    '觀眾只會在演出結束後才知道節目曾存在',
  ],['大資源轉成製作及宣傳，先塑造觀眾期待。','與題目條件相反。','品質不能由人氣推定。','宣傳在入場前發生。'],[3,4,8],'範文說大型片廠重投演員特效與全球宣傳，令電影上映前已令人期待。'),
  transfer('一家串流平台有各國電影，從冒險到歷史劇都有，本地平台只放單一類型。','哪項最符合範文的類型廣度理由？',[
    '多種片類能照顧不同口味，增加找到合適作品的機會',
    '片類越多，觀眾越不可能找到符合自己口味的內容',
    '所有觀眾必定只喜歡同一類型，不需要任何選擇',
    '只有片名長短會影響選擇，故事類型完全無關',
  ],['原文用超級英雄到歷史劇說明不同口味都可被照顧。','與原文推論相反。','口味並非完全相同。','類型是題目變數。'],[5],'範文說片類廣泛讓觀眾找到符合個人口味的電影。'),
  transfer('一間地方博物館只展出賣得最好的紀念品，忽略本地人的語言和生活故事。','哪項最能轉用電影的非商業價值？',[
    '把地方語言與生活記憶也納入展覽價值判斷',
    '只用紀念品銷量決定所有展品的文化意義',
    '把本地故事全部交給遠方機構代替講述',
    '只看門票數字，不問展覽保存了甚麼記憶',
  ],['範文說文化作品不只是商品，還保存社會記憶。','銷量不足以涵蓋文化。','本地經驗需有呈現機會。','記憶是作者的非商業標準。'],[10],'範文說電影不只是商業產品，還承載語言、價值、幽默與日常生活。'),
  transfer('本地動畫師缺乏資金，開始只模仿國際熱門作品，部分人更打算轉行。','哪項最能套用範文對缺支援的後果？',[
    '建立資助和訓練，讓新人能創作自己的地方故事',
    '只要求所有動畫師繼續模仿，不給任何創作資源',
    '只宣稱人才不會流失，毋須了解工作條件',
    '把所有補助交給外國公司，完全不扶持本地人',
  ],['原文說缺資源會逼創作者複製外國公式或離業。','重複風險而未解決。','題目已有流失跡象。','資助對象應與問題相符。'],[11,12,13],'範文說欠支持的導演編劇可能模仿外國套路或離開行業。'),
  transfer('一座小城想扶持本地紀錄片，卻只考慮一次性頒獎。','哪項更符合範文的完整政策工具？',[
    '結合製作補助、人才培訓與可放映作品的場地',
    '只頒獎後停止所有訓練與放映方面的支持',
    '只建宣傳海報，不讓本地作品真正面向觀眾',
    '只資助已成名國際片廠，不培養任何地方新人',
  ],['原文列三種工具，分別處理資金、技能和放映渠道。','單一獎項不足以成系統。','缺放映就難到達公眾。','本題要扶持本地。'],[12,13,14],'範文提出補助、培訓及本地片戲院資助，讓新人才有成長機會。'),
  transfer('一位年輕導演想拍本地漁民家庭的生活，大型國際片廠說題材太小眾。','哪項最符合範文的地方故事例子？',[
    '用本地資助給創作者機會，讓這類生活被拍出來',
    '既然國際片廠不拍，便證明地方故事沒有價值',
    '要求導演只能翻拍外國故事，不得呈現本地人',
    '只替影片改英文片名，不處理製作與發行困難',
  ],['原文強調資助可使大製片公司不會拍的地方故事出現。','市場選擇不等於文化價值。','會消去本土創作。','片名不能替代資源。'],[10,12,13],'範文以獲資助年輕電影人拍地方家庭、工作與傳統為例。'),
  transfer('社區電台有不少優秀節目，但缺設備及廣告，聽眾多選製作精良的國際平台。','哪項分析最貼近範文的市場邏輯？',[
    '比較設備和宣傳差距，不把聽眾選擇直接當品質證明',
    '只因國際平台較多人聽，就斷定本地節目全無價值',
    '忽略電台設備與廣告差距，假設平台條件完全一樣',
    '只問主持人衣著，不理節目能否接觸真正聽眾',
  ],['資源與曝光可影響觀眾偏好，不能直接推論品質。','人氣不等於全部品質。','市場條件確實不同。','到達聽眾是問題。'],[3,6,7,8],'範文說小市場本地片或缺宣傳技術，外國片聲量大未必總較好。'),
  transfer('政府問：「本地戲劇票房不高，還值得補助嗎？」','哪項最能運用範文的文化與人才雙理由？',[
    '評估其保存地方故事及培養年輕演員的長期作用',
    '只看當週票房，完全不問戲劇呈現了甚麼文化',
    '只補助外地巡演，不給地方創作者任何訓練',
    '只要票房不高，就要求所有本地演員立即轉行',
  ],['範文支持投入是因文化保存與創意人才，不只票房。','忽略非商業價值。','缺本地人才培養。','會造成流失。'],[2,10,11,16],'範文在引言和結論都用文化身份與本地人才支持政府增資。'),
  transfer('地方電影節要在「只放國際大片」與「扶持本地新人」之間分配資源。','哪項結論最完整？',[
    '承認國際片有市場優勢，也給本地作品製作與放映機會',
    '只要國際片宣傳大，就拒絕所有地方故事進入戲院',
    '只說本地文化重要，卻不安排任何實際扶持工具',
    '只讓新人拍片，不設觀眾可看到作品的放映渠道',
  ],['原文既解釋國際片市場強項，也主張扶持本地創作。','會讓本土文化缺位置。','缺政策措施。','放映渠道也是政策一環。'],[8,9,12,16],'範文區分外國片資金宣傳優勢與本地文化及人才的政策價值。'),
];
export default {key:'direct-question:34',meta:{topic:'外國電影偏好與本地電影資助',summary:'外國片有資金、類型和宣傳優勢；政府支持本地電影可保存文化並培養創作者。'},simple,vocabulary,chunkOverrides,simpleChunkOverrides,structures,intro,route,evidence,logic,transfer:transferTasks};

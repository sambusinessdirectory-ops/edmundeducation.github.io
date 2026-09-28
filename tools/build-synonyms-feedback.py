"""Import the supplied 14 PDF explanations and author matching detail for the other 14."""
import json,re,subprocess,sys
from pathlib import Path
import pdfplumber
root=Path(__file__).resolve().parents[1]
pdf=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/Users/sammak/Downloads/synonym explanation additiomn.pdf')
with pdfplumber.open(pdf) as doc:text='\n'.join(page.extract_text() or '' for page in doc.pages)
source=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {importantModule} from './synonyms/important-data.mjs'; console.log(JSON.stringify(importantModule.words))"],cwd=root,text=True))
parts=re.split(r'(?m)^([1-9]|1[0-4])\. ([a-z]+)\s*$',text)
feedback={}
for i in range(1,len(parts),3):
    number=int(parts[i]); word=parts[i+1]; first=re.split(r'(?m)^Exercise 2\s*$',parts[i+2])[0]
    assert source[number-1]['word']==word
    matches=list(re.finditer(r'(?m)^([A-F])\. ([a-z]+) [✅❌]\s*$',first))
    assert len(matches)==6,(number,len(matches))
    notes={}
    for j,match in enumerate(matches):
        letter,option=match.group(1,2)
        assert source[number-1]['exercises'][0]['options'][j]['text']==option,(number,letter,option)
        raw=first[match.end():matches[j+1].start() if j+1<len(matches) else len(first)]
        note=''.join(line.strip() for line in raw.strip().splitlines() if line.strip())
        assert note.startswith(option+' = '),(number,letter,note)
        notes[letter]=note
    feedback[f'{number}-1']=notes

meanings={
'significant':'顯著的、重要而有影響的。','major':'重大的、規模很大的。','key':'關鍵的、核心的。',
'pivotal':'關鍵性的、具有轉折作用的。','crucial':'至關重要的、非常關鍵的。',
'vital':'極其重要的、不可缺少的。','essential':'必要的、必不可少的。',
'indispensable':'不可或缺的、難以取代的。','critical':'極重要的、關鍵的。',
'consequential':'後果重大的、影響深遠的。','fundamental':'根本的、基礎性的。',
'paramount':'最重要的、首要的。','prominent':'重要而顯著的、地位突出的。','influential':'有影響力的。',
'interesting':'有趣的、能引起興趣的。','professional':'專業的、符合專業標準的。',
'significance':'重要性、意義；這是名詞。','sleepy':'想睡的、昏昏欲睡的。',
'popular':'受歡迎的、很多人喜歡的。','famous':'著名的、很多人知道的。',
'importance':'重要性；這是名詞。','colourful':'色彩繽紛的。','formal':'正式的、符合正式場合的。',
'delicious':'美味的，通常形容食物或飲品。','obvious':'明顯的、容易看出來的。',
'rare':'罕見的、不常發生的。','interest':'興趣。',
'fame':'名氣、聲望。','impressive':'令人印象深刻的。',
'hungry':'飢餓的、肚子餓的。','successful':'成功的、有成就的。',
'profession':'職業。','difference':'差異；這是名詞。',
'influence':'影響或影響力。',
'professionalism':'專業精神。','popularity':'受歡迎程度。',
'expensive':'昂貴的、價格高的。'
}
# Each array follows the existing A-F order. The first clause above teaches meaning;
# these sentences explain the exact context and why the substitution works or fails.
reasons={
1:[
'這裡是在描述藥物令病情改善了多少，不是在說這種改善有趣。',
'藥物或醫護人員可以很專業，但句子要說的是病情改善得很明顯。',
'空格在 improvement 前，需要形容詞；不能用名詞 significance。',
'兩星期內病情有值得注意的改善，significant improvement 是自然的搭配。',
'它通常描述人的精神狀態，不能用來形容病情的 improvement。',
'藥物受歡迎與否不表示它令病情顯著改善；句子談的是效果。'],
2:[
'暴風雨破壞全市道路和建築物，說的是嚴重程度和影響範圍，因此 major damage 很貼切。',
'破壞可能引起關注，但「著名」不表示破壞的程度很大。',
'空格要用形容詞修飾 damage，不能用名詞 importance。',
'這個字描述顏色；道路和建築物受損並不是在談色彩。',
'這個字可以描述場合或程序，但不能表示風暴破壞很嚴重。',
'一件事受歡迎與否和風暴造成多少 damage 沒有關係。'],
3:[
'正式的做法可能令人信任，但這裡要指出信任對建立顧客關係的關鍵作用。',
'key factor 是常見搭配，表示直接影響結果的因素；信任正是建立穩固關係的核心。',
'這個字談食物味道，不能描述建立顧客關係的 factor。',
'空格需要形容詞修飾 factor；importance 是名詞，不能放在這裡。',
'信任可能受到歡迎，但「受歡迎」不等於它對關係的建立至關重要。',
'信任是否容易看出與它是否關鍵是兩回事；句子說的是它的重要作用。'],
4:[
'合約可能受歡迎，但句子特別說公司其後快速成長，重點是這一刻改變了發展方向。',
'贏得首份大型合約後公司迅速成長，這個 moment 明顯是轉折點，所以 pivotal 最準確。',
'空格需要形容詞修飾 moment；importance 是名詞，詞性不合。',
'這個字形容食物味道，和公司成長的轉折無關。',
'簽合約可以是專業行為，但句子不是評價工作的專業程度。',
'合約可能不常見，但「罕見」不一定使它改變公司往後的發展。'],
5:[
'緊急時人們必須迅速且正確地行動；清楚的指示直接影響安全，因此 crucial 很適合。',
'指示是否很多人知道不是重點；句子強調它對緊急應對非常重要。',
'指示可以寫得很專業，但這個字沒有表達它對行動結果的關鍵性。',
'這是名詞，而且句子並非在說人們對指示是否感興趣。',
'它形容味道，不能描述緊急指示的重要程度。',
'緊急指示不必討人喜歡；它要讓人迅速、安全地行動。'],
6:[
'穩定供電是否少見不是句子的意思；重點是醫院安全運作不能沒有電。',
'這是名詞，和電力是否使醫院安全運作沒有關係。',
'醫院需要穩定電力維持設備和照護，vital 表示不可缺少，切合語境。',
'電力供應可以令人印象深刻，但這不等於醫院運作必須依靠它。',
'這個字描述人或動物的感覺，不能形容電力供應。',
'供電是否受歡迎與醫院能否安全運作是不同的問題。'],
7:[
'門票是否著名與能否進入音樂廳無關；句子談的是入場條件。',
'沒有有效門票就不能進入音樂廳，essential 準確表達「必須有」。',
'門票設計可能有趣，但有趣不等於它是入場必需品。',
'空格在 is 後需要形容詞；importance 是名詞，詞性不合。',
'它描述人的精神狀態，不能表達門票是入場必需的。',
'門票可以由專業人士設計，但句子問的是能否入場，不是設計水準。'],
8:[
'視障使用者每天依靠螢幕閱讀軟件；若沒有它便難以使用裝置，因此 indispensable 最貼切。',
'軟件可以用於正式場合，但「正式」沒有說明它對使用者不可缺少。',
'這是名詞；軟件是否出名也不是句子要強調的作用。',
'軟件可以很受歡迎，但受歡迎不代表視障使用者每天都必須依賴它。',
'這個字形容食物味道，不能描述輔助軟件的作用。',
'軟件可以運作成功，但句子重點是使用者難以沒有它。'],
9:[
'這個字表示容易看出；句子要說的是未來幾天會影響救援成敗，不是這幾天「很明顯」。',
'天氣正在惡化，未來幾天會直接影響救援結果；critical 正是這種關鍵時段。',
'空格在 are 後需要形容詞；importance 是名詞，不能說 days are importance。',
'這個字形容價格或成本，不能形容幾天時間對救援有多重要。',
'救援行動是否有趣不是重點；重點是惡劣天氣令這幾天非常關鍵。',
'飢餓通常形容人或動物，不會形容未來幾天。'],
10:[
'退休年齡的政策會影響數百萬人多年，consequential 表達決定帶來深遠後果。',
'政策可能受歡迎或不受歡迎，但這與它造成的長期影響是兩回事。',
'這是名詞；句子需要形容詞修飾 policy decision，談的也不是職業。',
'這個字形容食物味道，不能形容政策決定的影響。',
'一項政策可以罕見，但罕見不表示它影響很多人多年。',
'政策或許令人印象深刻，但句子強調的是實際而長久的後果。'],
11:[
'兩組的看法是否正式不是重點；句子說的是對政府角色的基本理解不同。',
'某個觀點可能有趣，但有趣不表示兩組人在核心觀念上有差異。',
'空格需要形容詞修飾後面的 difference；不能說 a difference difference。',
'兩組對政府角色的基本理解不同，fundamental difference 準確表示根本差異。',
'某種看法受歡迎與否不等於兩組在核心觀念上的分歧。',
'這個字形容人或動物肚餓，不能修飾 difference。'],
12:[
'句子明說乘客安全高於其他所有考慮，paramount 準確表示最高優先次序。',
'安全措施可能花錢，但這裡不是談成本，而是安全應排第一。',
'乘客是否喜歡某項措施不影響安全必須優先的原則。',
'這是名詞；空格需要形容詞來說明 safety 的優先程度。',
'這個字描述食物味道，和航空安全無關。',
'安全不是因為很多人知道才重要；句子說的是它高於其他考慮。'],
13:[
'全國藝術組織中的職位地位突出，且他常受邀公開演講，prominent position 很貼切。',
'這個字描述人或動物需要食物，不能說明職位的地位。',
'這是名詞；一個職位是否受歡迎也不等於它地位突出。',
'它形容食物味道，不能形容全國組織中的 position。',
'職位可以帶來薪酬，但價格高低不是句子要說的顯著地位。',
'這個職位可能有趣，但有趣不等於在組織中地位突出。'],
14:[
'教授的理念令全國學校開始跟隨，重點是她能改變別人的做法，不只是受歡迎。',
'這是名詞或動詞；空格需要形容詞修飾 voice，應用 influential。',
'全國學校採用她的理念，說明她能影響教育做法，所以 influential voice 最準確。',
'它形容人的精神狀態，不能表達教授對教育界的影響。',
'教授說話可以很正式，但正式不表示她能改變其他學校的做法。',
'這個字形容價格高，和教授的理念是否被採用無關。']
}
assert len(reasons)==14
for word in source:
    number=word['order']; options=word['exercises'][1]['options'];assert len(options)==6 and len(reasons[number])==6
    feedback[f'{number}-2']={option['letter']:f"{option['text']} = {meanings[option['text']]}{reasons[number][index]}" for index,option in enumerate(options)}
assert len(feedback)==28 and all(len(row)==6 for row in feedback.values())
output=root/'synonyms/detailed-feedback.mjs'
output.write_text('export const detailedFeedback = '+json.dumps(feedback,ensure_ascii=False,indent=2)+';\n')
print('Wrote',output,'with',len(feedback),'questions and',sum(map(len,feedback.values())),'option explanations')

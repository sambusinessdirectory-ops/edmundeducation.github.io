"""Build lossless, question-local reading lessons from Edmund Sir's styled source.

The imported source is immutable. Ranges index richBody rows (end exclusive).
No model-generated summary replaces a source row. Coverage is checked at build
and runtime; old analysis-N IDs remain the first block of that page.
"""
import json, re, hashlib
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
load = lambda p: json.loads((ROOT / p).read_text())
data = load('reading-curation/2023-a.json')
source = load('dse-reading-analysis/dse-2023-a/index.json')

# Question-specific retrieval checks, kept separate from the author's wording.
CHECKS = [
'把 as long as 放回 Stories are ___ the human race，意思如何改變？再分別說明讀者的困難和 flash fiction 的作用，逐一排除其餘選項。',
'刪去 unfortunately 後，句子有甚麼改變？分清作者的判斷、讀者的困難、比較詞和造成變化的原因。',
'沿 resulted in → Therefore 說出完整因果鏈。甚麼是改變、甚麼是閱讀場景、甚麼是作家需要作出的回應？',
'題目中的 things 限定了甚麼詞性？解釋 snippets 與 information、paragraphs、stories、small 的分別。',
'逐格核對詞性和語境：limits 限制甚麼、solid 描述甚麼質素、overkill 比 more 多了甚麼評價？',
'把 unless X, Y 改成 if not X, Y，再用 1、2、3、4+ 個角色檢查方向。解釋 this／that、However、when、because、need，並逐行核對五個改錯位置。',
'把 but 前後的故事形式分開，再說明 only 的限制。分清 structure 的 end、場景 scene、事件 moment；逐格檢查原文字、詞性和後文提示。',
'把 something、obstacle、conflict 各自代入 attain it。角色想得到甚麼，又需要克服甚麼？',
'用 impacted／encouraged 解釋 moral argument 對誰產生作用。逐一說明 A、B、C 為何不符合第7段。',
'把 write → go back through → taken out／reworked 連起來，解釋為何既不是走回某處，也不只是重寫一次。',
'對每個選項做兩次檢查：有沒有提到？有沒有作為好處提到？解釋為何 write more than you need 是需要處理的狀況。',
'分清爆炸事件、外觀結果和顯示驚訝的身體反應；按 phrase 的要求取出完整字詞。',
'把第10、12、15段的比賽觀眾連起來，再說明為何不能把第11段倒敘中的同學或 Billy 搬到現場。',
'逐格說出語法槽位、原文對應、人物及時間。分清 during 的課堂、a reply 的說話動作、Although 的情緒與眼神、Billy 的身份名詞；逐一解釋相鄰錯字。',
'補回 too late to do what。沿老師提問、sure、安排、Billy 嘲笑、Timothy 明白的次序，指出他想收回甚麼。',
'每句拆成主語、動作、內容，再找支持、相反或資料不足。特別解釋 hazard 的兩個命題，以及沒有說明為何不等於 False。',
'按臭味、低頭、煙、震動、旁觀者反應、爆炸排序。分清 like 的比喻對象與真實來源，指出驚慌發生時的刺激。',
'分開背景條件、直接動作、中間徵兆、最後結果。說明 mixed、random、contents、container 的作用和可接受答案範圍。',
'分開讀者知道的事與老師以為的事。用 apparent／seemed to 把得獎、掌聲、教學投入和 pride 連起來，不把誤會寫成事實。',
'先排實際經歷，再對照敘述順序。用 Billy 的嘲笑作固定點，解釋 volunteered 的引號，並核對 tear 和 steely gaze 屬於誰、能推論甚麼。',
'完整比較 good 與 not good 兩條路線。選定判斷後，給兩項同方向、來自故事且對應 How to 的證據；解釋主要焦點與嚴格數人物／場景的分別。',
'先建立五組人物的功能，再核對每句語氣與代詞。解釋 teacher’s pet、us both、I／He，逐一排除其他人物，最後說明 Parents 為何不用。'
]

# Passage focus is an editorial mapping, not inferred from keyword similarity.
FOCUS = {}
def focus(a,b,*paras):
    for n in range(a,b+1): FOCUS[n]=list(paras)
focus(35,63,1);focus(64,64,2,3,4);focus(65,66,2);focus(67,68,3);focus(69,70,4);focus(71,71,2,3,4)
focus(72,101,4);focus(102,122,5);focus(123,126,6);focus(127,132,7);focus(133,144,9);focus(145,148,10)
focus(149,151,10,12,15);focus(152,153,10,11,12,15);focus(154,204,11);focus(156,156,10,11)
focus(205,209,11);focus(210,212,12,13);focus(213,216,12);focus(217,223,13);focus(224,227,12);focus(228,233,13)
focus(234,241,15);focus(242,248,14,15);focus(249,249,13,14);focus(250,252,14,15)
focus(253,255,16);focus(256,256,12,16);focus(257,259,13,16);focus(260,263,12,16)
focus(264,267,10,11,12,14,15,16);focus(268,270,11);focus(271,271,14,15);focus(272,273,16);focus(274,274,11,16);focus(275,278,10,11,15,16)
focus(279,284,4,5,10,11,16);focus(285,286,4,11,16);focus(287,287,2,10,11,12,13,14,15,16);focus(288,288,5,14,15,16);focus(289,290,5,10,11,15,16);focus(291,291,4,5,11,15,16)
focus(292,294,4,11,12,15,16);focus(295,295,5,11,12);focus(296,296,5,10,11,16);focus(297,301,2,4,5,11,12,16)
focus(302,307,11,12,13,15,16);focus(308,311,11);focus(312,316,12,16);focus(317,320,13);focus(321,321,12,15)

# Large, multi-part explanations keep an explicit conceptual reading task.
PROMPTS = {
37:'先把摘要的三個空格，分別連到歷史、讀者困難和短篇的作用。',
40:'比較原句和摘要句的語法；相同字眼放回新句子，是否仍表示相同意思？',
43:'分清困難、沉悶、必要和無意義；哪些只是讀者自己加上的想像？',
45:'逐一核對 challenge、confusing idea、puzzle；本段從讀者還是作家的角度談 flash fiction？',
49:'題目問的是誰的感受？先把 writer 和 readers 分開。',
53:'試刪去 unfortunately，再比較語氣。',
55:'先找 resulted in 和 Therefore，再沿箭頭讀完整因果鏈。',
60:'先用 things 判斷詞性，再找有「短小」意思的原文字。',
73:'讀完角色數量的四層限制，不要把 focus 當成總數。',
79:'把第(iii)、(iv)、(v)行連成完整句子，才能判斷第(iv)行的條件。',
80:'先讀懂錯句實際聲稱甚麼，再和原文比較；不要默默把 unless 當作 if。',
81:'逐一找出可能性、轉折、數量指代和過量結果。',
82:'用 A、B、C 把數量和結果分開，說出條件箭頭的方向。',
84:'先定義 X 和 Y，再把 if X, Y 放回完整摘要。',
86:'用原稿的溫習例句，把 unless 轉成 if not；否定詞不能漏。',
87:'把 X、not X、Y 各自代回角色句；檢查是哪種情況導致過量。',
89:'用 1、2、3、4+ 四種數量，逐格比較正確條件和 unless 錯句。',
91:'分清轉折關係和條件關係；However 和 unless 是否做同一件事？',
93:'沿 three → this → any more than this 追蹤同一個數量。',
94:'比較 if 與 when 對事情是否會發生的假定。',
95:'把條件關係和已經成立的原因分開。',
96:'用 hurry 的例句檢查 unless 的例外條件，再回到題目。',
98:'核對原文 that 和摘要 this 的所指；改寫本身不等於錯誤。',
99:'找出真正破壞條件方向的字；不要因為原文沒有逐字出現 need 就改它。',
108:'把 but 前後分成兩欄，標明各自談哪一種故事形式。',
109:'逐層讀主語、結構清單、but、with flash fiction、only，不能把它們讀成散落關鍵詞。',
114:'分清「主要講最後關鍵時刻」與「全文完全沒有背景」。',
115:'先回答 blank 問的是結構部分還是事件時刻，再判斷 moment。',
116:'把第(iii)和(iv)格放在一起，比較兩格要求的層次。',
121:'不要停在 single ___；讀到後面的 important event 再選字。',
124:'把候選指代代回 attain it，用動作與受詞關係判斷。',
138:'同時檢查 mentioned 和 as a benefit，兩個條件不可漏。',
150:'先確定爆炸現場的時間和地點，再確認 faces 的所指。',
155:'把原段、字數、語法槽位和意思位置四項限制分開核對。',
156:'沿倒敘的六個事件追蹤誤會如何形成。',
157:'逐句標明時間、狀態、提問、回答方式和老師反應。',
164:'先看 during 後面需要哪類情境，再找 Timothy 不專心時正在上的課。',
173:'先讀 a reply 對動詞的要求，再回到原段找 Timothy 的回答方式。',
174:'分開「說了甚麼」「怎樣說」「是否明白」三層資訊。',
176:'分別解釋 Eh、Ermmm、sure 的功能；它們和 mumbled 回答的問題相同嗎？',
178:'核對 replied 的主語及其後結構，兩項都要檢查。',
180:'區分當下說話動作與那句回答造成的參賽結果。',
184:'把人物情緒、Although 的讓步、眼神和老師誤會分層。',
187:'比較 Although 前後已經表達了甚麼，避免把眼神資訊填兩次。',
188:'追蹤 steely 修飾的名詞；再檢查 glared 已經吸收了哪項資訊。',
194:'用老師相信的事和讀者知道的事，解釋這個字如何形成幽默。',
196:'先找同位結構中身份名詞的位置，再決定 class thug 應取哪一字。',
197:'把名字、身份、動作、嘲笑內容分成四層，再對應摘要所問。',
200:'分清 class 的修飾語功能和 thug 的核心名詞功能。',
211:'先定義 T、F、NG；本題只允許第12及13段作判斷。',
218:'把題目與原文各拆成主語、動作、內容，不能只對 hazard 這個字。',
219:'逐項核對原文有沒有說曾經教過或沒有教過實驗室安全。',
220:'比較兩個 hazard 命題，原稿列出的假設例句不是原文證據。',
221:'要選 False，需要哪種相反資訊？原稿的例句有沒有真的出現在文章？',
224:'用 crammed 的語義判斷改寫，不要求兩句逐字相同。',
232:'比較上了很多課這項背景，和 without a clue 的直接證據。',
236:'按六步排列當下事件，定位 looked down in alarm 發生在哪一步。',
237:'分清 like 後面的比喻對象和氣味的實際來源。',
243:'先分類背景原因和直接動作，再看 caused when 的句型要求。',
246:'說清楚混合的是瓶子還是瓶內物質。',
251:'比較完整答案、其他可接受表達和不夠直接的答案。',
254:'把讀者知識和人物誤會分成兩欄。',
257:'比較「有化學能力」和「看似成功」，保留故事的反諷。',
267:'建立兩條時間線：作者敘述順序，以及 Timothy 實際經歷順序。',
270:'解釋 volunteered 的引號，然後用 Billy 的嘲笑核對前後次序。',
280:'先看清兩條都可接受的路線；之後逐項學習它們各自的證據。',
282:'把 focus 的主要焦點讀法與嚴格數量讀法分開。',
286:'比較 focuses mainly on Timothy 與 There is only one character，哪一句能被配角反駁？',
287:'核對定義的字數限制，並考慮第二項證據怎樣補充內容層面。',
294:'比較只數有名字的人物和把有場景功能的群體也計入的結果。',
298:'比較 good example、被列在例子之下、嚴格遵守每項建議這三種不同問題。',
300:'逐個檢查錯誤示範：勾選的立場和寫出的證據是否同方向？',
301:'檢查字數證據支持哪一邊；然後返回自己選的立場。',
304:'先核對人物功能，再看評論語氣，最後和實際行為配對。',
314:'用教學投入和得獎解釋 us both；同時核對 He 與 I 的說話者位置。',
317:'先為 I 和 He 指派人物，再代回整句檢查是否合理。',
321:'最後核對未用選項：有出場不代表有一句評論符合其立場。'
}

# Detect a topic boundary only from the author's own headings. Physical PDF
# line-wraps stay together, and a heading is attached to its explanation.
heading = re.compile(r'^(?:為甚麼|為什麼|常見|錯法[一二三四五六七八九十]|錯誤示範|Edmund Reading|陷阱類型|先看|原文定位|答案重點|Good Evidence|Not Good Evidence|路線[一二]|第[（(][ivx]+|第[一二三四五六七八九十]+[，層]|[A-D]\. .*為甚麼)')
def text(row): return ''.join(r['text'] for r in row['runs'])
def is_heading(s): return len(s)<100 and (bool(heading.match(s)) or s.endswith(('：',':','?','？')))
def ranges(rows):
    lines=[text(r).strip() for r in rows]
    cuts=[0]; chars=0
    for i,s in enumerate(lines):
        if i>cuts[-1]:
            prev=lines[i-1]
            # New authored subsection, or a completed reasoning paragraph.
            newtopic=bool(heading.match(s)) and i-cuts[-1]>=2
            sentence_end=bool(re.search(r'[。！？!?」”）)]$',prev))
            paragraph=rows[i].get('gap',0)>=15 and not is_heading(prev)
            if newtopic or (chars>=100 and i-cuts[-1]>=2 and not is_heading(prev) and (paragraph or sentence_end)):
                cuts.append(i);chars=0
        chars+=len(s)
    # Do not strand a single final continuation line.
    if len(cuts)>1 and len(rows)-cuts[-1]==1 and len(lines[-1])<65 and not heading.match(lines[-1]): cuts.pop()
    return [[a,b] for a,b in zip(cuts,cuts[1:]+[len(rows)])]

def rejections(rows,q):
    rejected=[]
    for i,row in enumerate(rows):
        line=text(row).strip(); claim=None
        m=re.match(r'^[A-D]\. (.+?) 為甚麼(?:不成立|很有誘惑力)',line)
        if m: claim=m.group(1)
        m=re.match(r'^為甚麼(?:不(?:能)?(?:只)?(?:答|填)|答案不是|不是)\s*[“\"]?(.+)',line)
        if m: claim=m.group(1).strip(' ?？“”\"')
        m=re.match(r'^為甚麼 ([A-D]) 不成立',line)
        if m:
            claim=m.group(1)
            # Retain the original option letter where the question has parts.
        if claim: rejected.append({'row':i,'claim':claim})
    return rejected

UNITS = {n:[] for n in [35,36,37,38,47,64,71,72,73,101,102,103,122,154,155,156,157,158,210,211,212,264,265,266,267,276,277,278,279,280,281,282,283,298,299,300,301,302,303,304,307,321]}
UNITS.update({159:['q14-chemistry'],160:['q14-mumbled'],161:['q14-enthused'],162:['q14-thug'],305:['q22-pronouns'],306:['q22-pet','q22-both']})

def titles(rows,spans):
    result=[];topic=text(rows[0])
    for start,stop in spans:
        candidate=text(rows[start]).strip()
        if heading.match(candidate): topic=candidate
        result.append(topic)
    return result

QUOTES = {
    168:[(11,"Meet me in Lab 922 after school today and we'll get started.")],
    176:[(11,'Eh? Ermmm - sure,')],
    273:[(16,"a tear of pride trickled down Professor Snookhorn's cheek")],
    274:[(11,'an enthused Professor Snookhorn'),(11,'a steely gaze through his thick glasses')],
    287:[(2,'limits the author to a word count of 1,000 words or less')],
    301:[(2,'limits the author to a word count of 1,000 words or less')]
}
pages=[]
for q in data['questions']:
    for n in q['analysisPages']:
        p=next(p for p in source['pages'] if p['number']==n)
        rows=p['richBody']; spans=ranges(rows)
        assert [i for a,b in spans for i in range(a,b)]==list(range(len(rows)))
        pages.append({'page':n,'question':q['number'],'paragraphs':FOCUS[n],
            'prompt':PROMPTS.get(n,CHECKS[q['number']-1]),'quotes':[{'paragraph':p,'quote':t} for p,t in QUOTES.get(n,[])],
            'ranges':spans,'titles':titles(rows,spans),'units':UNITS.get(n,[u['id'] for u in q['units'] if n in u['pages']]),'rowCount':len(rows),'rejections':rejections(rows,q),
            'sourceDigest':hashlib.sha256('\n'.join(text(row) for row in rows).encode()).hexdigest()})
result={'version':'2023-a-source-lessons-v1','sourceSha256':source['sourceSha256'],
    'policy':'Every styled source body row is used exactly once in its question’s guided reading. Supplementary pages and original page views remain available. No source explanation is replaced by a summary.',
    'checks':{str(i+1):s for i,s in enumerate(CHECKS)},'pages':pages}
(ROOT/'reading-curation/2023-a-source-lessons.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(f"Built {sum(len(p['ranges']) for p in pages)} source blocks from {len(pages)} pages; {sum(p['rowCount'] for p in pages)} styled rows, exactly once.")

/* Editorial reference answers for the 250 student exercises. The source handout has no supplied key. */
(() => {
  'use strict';
  const rows = `
1|someone|asking to speak 指的是人；something 指事物，不能作這個人的主語。|IP02
2|something|銀匙是實物；somewhere 指地方。|IP03
3|somewhere|需要的是休息地點；somewhere 後可接 to rest。|IP33
4|Everybody|十二位客人全部到齊；everybody 指人。|IP02
5|nothing|櫥櫃是空的，所以裏面沒有東西。|IP14
6|something|Would you like something warm to drink? 是提供飲品；形容詞 warm 放在 something 後。|IP10
7|anyone / anybody|中性詢問有沒有人用椅子；兩種人物詞均可。|IP11
8|anything|肯定句的 anything 可表示任選，不限定哪一件。|IP15
9|anyone / anybody|if 條件句可用 any- 詢問任何可能需要接送的人。|IP16
10|someone / somebody|請求協助時可用 some- 人物詞；兩種詞都可。|IP10
11|Everybody|二十位客人全都坐好，選指全體人的詞。|IP08
12|nothing|空包裹內沒有東西；nothing 已包含否定。|IP14
13|She did not say anything during the interview.|nothing 改為 not ... anything，動詞也要改為否定形式。|IP52
14|There was nobody at the reception desk.|not anybody 可改為 nobody；不要再保留 not。|IP52
15|everywhere|列出的各處都檢查了，表示到處。|IP02
16|knows|Everybody 作普通陳述句主語，接單數動詞。|IP21
17|has|Someone 是單數主語，配 has。|IP21
18|want|Does 已承擔問句時態，後面的動詞用原形。|IP22
19|are|they 回指性別未知的一人時，仍與 are 配合。|IP24
20|stand|這是對大家的祈使句，動詞用原形 stand。|IP23
21|something useful|形容詞放在 something 後。|IP31
22|somewhere quiet to study|地點詞後依次放形容詞和用途的不定詞。|IP31
23|who / that|兩者都可引出修飾人的主語關係子句；what 不可。|IP35
24|to|speak to someone 中的介詞 to 不能省掉。|IP33
25|planned|anything planned 表示已安排的活動；planning 會改變修飾關係。|IP38
26|else|anything else 表示其他東西；else 接在不定代名詞後。|IP39
27|someone else's umbrella|所有格 's 放在 someone else 整組的末端。|IP40
28|Every one|every one of 後接所指的票；everyone 不接 of the tickets。|IP57
29|Any one|any one of these keys 指這組鎖匙中任一把。|IP57
30|none of them|them 明確回指已提到的三位舞者；nobody 不明指該組。|IP58
31|somewhere|安靜的是見面的地方；形容詞 quiet 放在後面。|IP31
32|anywhere|否定句 cannot find ... anywhere 表示哪裏都找不到。|IP13
33|nowhere|所有酒店都滿，沒有地方可住。|IP14
34|everywhere|葉子遍及整個花園，故用 everywhere。|IP02
35|from|came from somewhere 表示來源；to 表示目的地。|IP42
36|No. Not everybody attended allows some or none to attend; Nobody attended says zero attended.|not everybody 只否定全體，並不保證有人出席。|IP49
37|I didn't travel everywhere means not all places; I didn't travel anywhere means no travel to any place.|第一句否定「全部」，第二句否定「任何地方」。|IP49
38|Someone has not replied means at least one person has not; No one has replied means zero people have replied.|否定的位置改變涵蓋的人數。|IP50
39|Take anything you need allows any needed item; Take everything you need calls for all needed items.|anything 強調任選；everything 強調全部所需。|IP18
40|anyone|nothing anyone could do 中的 anyone 是可能行動的人。|IP51
41|anything|anything but easy 表示一點也不容易，與 every section was difficult 一致。|IP56
42|nothing|nothing but applause 表示只有掌聲。|IP56
43|The gloves were the exception: the speaker remembered everything else.|everything but 後面的 gloves 被排除。|IP55
44|nowhere|nowhere but at the museum shop 表示只在那裏發售。|IP55
45|Usually ages 20–29.|twenty-something 是大約二十多歲，並非精確歲數。|IP59
46|nothing|擔心售罄，故害怕稍後沒有票留下；要按語意判斷。|IP65
47|something|希望找到至少一個新意，並非說甚麼都找不到。|IP65
48|nothing|評論認為沒有特別之處；nothing special 符合否定評價。|IP65
49|They|未知性別的人可用 singular they 回指，之後才揭示身分。|IP66
50|else's; knows|someone else's 是整組所有格；anyone 作主語接 knows。|IP40
51|No one answered the door.|標準拼法是分開的 no one。|IP05
52|anything|never 的否定範圍內通常用 anything。|IP13
53|We found nothing under the sofa.|did not find anything 改為 found nothing；避免雙重否定。|IP52
54|did they?|Nobody 帶否定意思，尾句用肯定形式及 they。|IP26
55|with|pencil 是書寫工具：something to write with。|IP33
56|This must be somebody else's notebook.|else 接在人物詞後，所有格 's 放整組末端。|IP40
57|nowhere|out of nowhere 表示突然、不知從哪裏出現。|IP48
58|The first can mean one particular explanation was not understood; the second says none of the explanations was understood.|something 可指某項；not ... anything 涵蓋全部可能項。|IP19
59|Usually ages 40–49; it does not state an exact age.|forty-something 是年齡名詞的概數用法。|IP59
60|No. It means a clear explanation is more reassuring than any other thing.|Nothing is more ... than 是比較式，不是名叫 Nothing 的物件。|IP20
61|is it?|Nothing 指事物且自帶否定，尾句用肯定 is it。|IP26
62|on|紙張是書寫的表面：something to write on。|IP33
63|It is someone else's responsibility.|else's 的撇號放在整組末端。|IP40
64|We went somewhere peaceful.|go somewhere 通常直接接地點副詞；此處不用 to。|IP42
65|No. It is possible that nobody has submitted.|not everyone 只保證不是全體完成，不能推出有人完成。|IP49
66|thirty-somethings means people in their thirties; ordinary everything is an indefinite pronoun and does not take plural -s.|年齡名詞與普通不定代名詞是不同用法。|IP59
67|Nowhere is better than this beach for watching the sunset.|nowhere better 保留「沒有更好的地方」的比較。|IP20
68|Somebody has left an umbrella here.|somebody 與 someone 在此同義。|IP04
69|somewhere|go somewhere peaceful 表示前往某個寧靜地方。|IP31
70|They did not go anywhere during the holiday.|went nowhere 改為 did not go anywhere。|IP52
71|to go|nowhere to go 的 to 是不定詞標記，表示可去的地方。|IP43
72|Nobody realised that someone was hiding in the cupboard.|無人察覺與有人躲藏屬不同子句，意思並不衝突。|IP51
73|of|something of an authority 表示某程度上稱得上專家。|IP61
74|No and no. The first asks for a particular person without requiring a name; the second says there is no specific topic, not necessarily no topic at all.|in particular 限定的是「特定」程度。|IP64
75|Is anyone waiting outside?|anyone 與 anybody 在此同義。|IP04
76|anyone / anybody|whether 引出未確定情況，常用 any- 人物詞。|IP16
77|I haven't told anybody about it.|普通標準否定用 haven't ... anybody；也可說 I have told nobody。|IP53
78|haven't they?|everyone 指人，反問尾句通常用 they；主句 has received 對應 haven't。|IP26
79|to|nothing to worry about 中保留 worry about。|IP33
80|someone else|else 表示另一個人，接在 someone 後。|IP39
81|No. At all strengthens the open question; it does not assert that the box is empty.|at all 是強調，不把問句變成陳述。|IP54
82|Everything in this drawer is mine.|everything 不加普通複數 -s，並配單數 is。|IP06
83|Both are grammatical. Did someone call? can suggest an expected caller; Did anyone call? is a more open enquiry.|問句不自動禁止 some-；差別主要在預期。|IP10
84|Nothing|抽屜清空，所以沒有東西剩下。|IP14
85|themselves|everyone 指人，可用 singular they 系列的 themselves 回指。|IP25
86|for|for you to sign 明確指出簽署者是 you。|IP34
87|Ask someone other than Ray.|other than Ray 把 Ray 排除在可詢問的人外。|IP55
88|is|Nowhere 作主語時可接單數 is。|IP41
89|No; no. Someone does not name the person, but the speaker may know who it is.|未指名與不知道身份是兩回事。|IP01
90|It means a hard-to-name quality that makes the music memorable.|a certain something 指難以精確說出的特質。|IP61
91|nobody / no one|兩者都是自帶否定的人物詞。|IP14
92|is|整個主語是 Someone with two large bags；with 片語不令主語變複數。|IP27
93|to be repaired|器材是被維修的對象，故用被動不定詞。|IP34
94|anything else to add|else 接在 anything 後，to add 再作後置修飾。|IP39
95|Nowhere in the leaflet does the guide mention the fee.|否定地點片語前置，後面用 does + 主語 + 動詞原形。|IP46
96|Almost anyone could operate it describes ability or possibility; Almost everyone operated it describes actual use.|could 與 operated 區分可能能力和已發生行動。|IP67
97|A little something is a special noun-like phrase meaning a small gift or thing.|這是固定的名詞化用法，不代表普通 something 一律可加 a。|IP61
98|They are probably doing something secret or mischievous.|be up to something 在此表示私下策劃或幹某事。|IP64
99|Someone is outside.|普通不定人物代名詞前不用 a。|IP06
100|Both are possible. Something can suggest a reading item was expected; anything can be a more open or surprised question.|否定問句中的詞首可改變預期語氣。|IP12
101|somebody else's|else's 的 's 表示所有，已知的 scarf 可省。|IP40
102|Nowhere in the building did I see the warning.|否定地點前置後，過去式用 did I see。|IP46
103|The caretaker is the exception and does have a key.|nobody but the caretaker 把管理員排除在「無人」範圍外。|IP55
104|It cost approximately ninety dollars.|something like 加在金額前表示大約。|IP60
105|The praise is emphatic: the rescue was extraordinary.|nothing short of 加強評價，並非削弱讚美。|IP64
106|No. The sentence identifies an unspecified person but does not prove there were no helpers.|someone 不是精確數學上的「恰好一人獨力完成」。|IP07
107|anyone / anybody|肯定句的 any- 可表示不論經驗，任何人都能跟隨。|IP15
108|Everything|清單全部項目正確；everything 指事物。|IP02
109|are|Someone and their assistant 是並列主語，所以用複數 are。|IP27
110|waiting|somebody waiting 表示正在等候的人。|IP38
111|nothing|nothing like the original 表示與原版完全不像。|IP60
112|Guests may wear whatever they want; the party has few restrictions.|anything goes 是「甚麼都可以」的固定用法。|IP64
113|No. Someone can be used even when the speaker knows the person is their uncle.|someone 只是不在該處直接指名。|IP01
114|anywhere|肯定句的 anywhere 表示座位任選。|IP15
115|nowhere|泊車場全滿，所以沒有地方可泊車。|IP14
116|Everybody has finished their lunch.|everybody 是單數主語，接 has。|IP21
117|left|nothing left 表示沒有剩餘的食物。|IP38
118|Somebody is waiting downstairs.|waiting 是現在分詞，'s 在此是 is。|IP29
119|No. Everywhere we went, people welcomed us uses ordinary word order.|everywhere 引出的地點子句不等於否定地點前置。|IP46
120|Any item may be chosen except the smallest box.|anything 表示任選，except 排除一件。|IP55
121|something|正面請求帶點東西分享，故用 something。|IP18
122|everywhere|地板、牆壁和家具都沾上油漆，表示到處。|IP02
123|is|主語是 Something，後面的 in these boxes 不改變單數配合。|IP27
124|whose|whose daughter 表示那人的女兒。|IP35
125|Someone has already opened the parcel.|already opened 是完成式，'s 在此是 has。|IP29
126|elsewhere|elsewhere 可作「其他地方」的單字形式。|IP44
127|No. The cousin was told; nobody else excludes all other people.|else 把已提到的表親排除。|IP39
128|It asks whether the sample resembles the material wanted to any degree.|anything like 在問相似程度，並非按字面問「任何一樣東西」。|IP60
129|The whole package must be accepted or rejected; there is no partial option.|all-or-nothing 表示全取或全不取。|IP64
130|Something|熄燈是一件意外的事，不是某個人。|IP03
131|No. Who is the subject of needs help in the relative clause.|作主語的關係詞不能直接省掉。|IP37
132|possessive|somebody's gloves 表示某人的手套。|IP29
133|somewhere|She needs somewhere to sit. 是普通地點詞。|IP44
134|No. It means not just any random person may receive the code; selected people may.|just anybody 指不經篩選的任何人。|IP62
135|If anything suggests a cautious correction: the route may be shorter rather than longer.|用來修正或加強前述判斷。|IP63
136|No. It humorously means Sam packed far too much.|everything but the kitchen sink 是誇張慣用語。|IP56
137|Everything|equipment 是事物而非人；everything 指全部器材。|IP02
138|anything|refused 造成非肯定環境，通常用 anything。|IP17
139|He said nothing rude at yesterday's meeting.|not ... anything 改為 nothing；動詞變肯定 said。|IP52
140|seen|Has ... seen 使用過去分詞。|IP22
141|Not everyone finished.|二十人中三人未完成，但其餘十七人完成了。|IP49
142|At least they learnt to cooperate, even if nothing else was gained.|if nothing else 提出最低限度仍成立的收穫。|IP64
143|No. It describes the limits of what people know, not an absolute guarantee.|as far as anyone knows 保留未知例外的可能。|IP64
144|anyone / anybody|not spoken to anyone 表示未向任何人說。|IP13
145|anyone / anybody|without thanking anyone 表示沒有向任何人道謝。|IP17
146|Nobody came to the empty office that day.|普通零人意思用 nobody 或 no one，動詞不用再加 not。|IP14
147|Does anyone know the answer?|Does 後動詞用原形 know，anyone 表示開放查問。|IP22
148|She is someone I trust.|whom 作 trust 的受詞，可省；不要再補受詞。|IP37
149|I asked one of the players.|one of 表示一組球員中的一位。|IP57
150|We have nowhere to wait.|nowhere 是普通拼法，不加複數 -s。|IP06
151|somebody|得獎者是人；somebody 可指未指名的人。|IP02
152|anybody / anyone|hardly 屬非肯定環境，通常接 any-。|IP17
153|There isn't anywhere safe to leave the bicycles.|nowhere 改為 not ... anywhere。|IP52
154|object of a preposition|someone 接在介詞 to 後，是介詞受詞。|IP28
155|This is something I bought in Kyoto.|something 已是 bought 的受詞，關係子句內不再用 it。|IP37
156|Every one of the computers has been tested.|every one of 才可接所指的電腦組。|IP57
157|We need somewhere we can practise without disturbing anyone.|somewhere 後的第二個 where 可省，句意不變。|IP45
158|Not everyone is ready.|明確否定「全部準備好」，不聲稱無人準備好。|IP49
159|The gallery is one possibility, not an exact or exclusive plan.|or something 把提議說得較含糊、開放。|IP63
160|asking|with 是介詞，後接動名詞 asking。|IP33
161|complement|somebody 接在 was 後，作主語補語。|IP28
162|He is someone I can rely on.|someone 已是 rely on 的受詞，不再用 him。|IP37
163|Any one of the four routes is suitable.|any one of 表示四條路線中的任一條。|IP57
164|You may put the chair wherever you like.|wherever 表示不限定放在哪個位置。|IP45
165|The first says at least one thing remains unchecked; the second says no thing has been checked.|something 和 not ... anything 的範圍不同。|IP19
166|It downplays the action: I did not complain or do anything similar.|or anything 在否定後擴展並淡化類似行為。|IP63
167|Everything; everyone|第一格指器材安排等事物；第二格指表演者。|IP02
168|something|important 修飾報告中的一項資訊，放在 something 後。|IP31
169|anything|too tired to do anything demanding 表示無力做任何費神的事。|IP17
170|There isn't anything more to add.|nothing 改為 not ... anything，意思保持一致。|IP52
171|anywhere|anywhere from twenty to eighty pounds 表示數值範圍。|IP47
172|Nobody has ever used this entrance.|nobody 已是否定；用 ever 表示任何時候。|IP53
173|It was some unspecified reading material about ancient maps.|something or other 刻意不說清楚是哪篇或哪本。|IP63
174|Someone knocked on the window. They were holding something bright. I asked them to wait somewhere sheltered. Nothing seemed wrong. Then they smiled, and I realised they were my sister.|示例共五句：先用 someone 隱去身份，再用 they 回指，最後揭示；可有其他合題的故事。|IP66
175|An important or well-known person.|a somebody 是特殊的可數名詞用法，不是普通未指名人物詞。|IP30
176|anyone / anybody|unless 引出可能的反對者，常用 any- 人物詞。|IP16
177|anyone / anybody|seldom 是非肯定語境，常用 any-。|IP17
178|their|性別未知的人可用 singular they 的所有格 their。|IP24
179|want|want 的主語是 you，不是 anything。|IP27
180|no|no 直接修飾名詞 milk；none 不可在此直接接 milk。|IP58
181|anyone; nobody|中性問句用 anyone；無人知道的回答用 nobody。|IP11
182|No one recognised the handwriting.|no one 是 nobody 的 -one 同義形式。|IP04
183|something; no, the visit need not have happened yet.|hope to learn 是對將來或尚未確定收穫的期望。|IP65
184|ever|Nobody has ever explained 保留任何時候都無人解釋的意思。|IP53
185|It|回指堵塞水管的事物，選 it。|IP24
186|wants|her brother 是第三人稱單數主語，接 wants。|IP27
187|none|none 可獨立回指前面提過的 milk；no 後須接名詞。|IP58
188|somewhere|somewhere around forty minutes 表示大約四十分鐘。|IP47
189|The sentence has two negatives in separate clauses; it means at least one person objected.|not true 是外層判斷，nobody 是內層內容，並非錯誤雙重否定。|IP51
190|on|on your mind 表示心裏掛念着某事。|IP64
191|Everyone / Everybody|全班每人都受歡迎，兩種人物詞均可。|IP08
192|Everyone is ready, aren't they?|everyone 指人；尾句通常用 they 和 aren't。|IP26
193|Yes, both that and which are acceptable here.|that 常見，但不能把 which 一律判錯。|IP36
194|is|water 是不可數名詞，none of the water 通常配 is。|IP58
195|The work is far from finished.|nowhere near 表示程度遠遠不足。|IP48
196|The first reports an actual unnamed caller; the second permits any person to call.|somebody 指已發生的人物事件，anybody 表示不限對象。|IP15
197|with|have nothing to do with 表示與某事無關。|IP64
198|Both work. Anyone else's compares with any other person's answer; everyone else's highlights the whole group of other answers.|兩句焦點不同，不能一律判其中一句錯。|IP67
199|I met someone who repairs cameras.|someone 隱去名字，who 子句保留職能資訊。|IP35
200|Yes. Someone may imply an expected warning; anyone can stress surprise that no warning came.|兩個否定問句都可成立，語氣依情境而定。|IP12
201|Yes. None of the volunteers is/are available can both be standard, with singular or plural agreement depending on focus and variety.|none of 加複數可數名詞時，兩種配合都可見。|IP67
202|found|nowhere to be found 是固定片語，表示找不到。|IP48
203|At least one did not come.|not everyone 不保證有人來；六個人都沒來也符合。|IP49
204|The guest was, surprisingly or emphatically, our old music teacher.|none other than 用來強調令人意外或重要的身份。|IP64
205|No. Someone can introduce a person before their identity is revealed; later naming Mei does not require anyone.|敘事中先隱後揭身份很自然。|IP66
206|Every person in the relevant group.|everybody 普通用法指人，不是把身體當物件逐個數。|IP02
207|anything|if 條件句中 anything unusual 表示任何異常之事。|IP16
208|No one remembers the old code.|no one 自帶否定，動詞用肯定 remembers。|IP14
209|Someone takes singular is; singular they takes plural-form are.|兩句可回指同一人，但動詞隨當句主語變化。|IP24
210|There is something that I need to tell you.|普通關係詞可用 that；也可省去 that。|IP36
211|The plan is very ambitious.|nothing if not 加強其後的形容詞，並非否定 ambitious。|IP64
212|We found somewhere quiet to read in the library. I met someone who knows the librarian.|示例第一句指地方，第二句指人；其他文法正確的圖書館例句亦可。|IP35
213|Nowhere means no place; now here means at this place now.|連寫是不定地點詞；分寫是時間副詞加地點副詞。|IP48
214|Something asks for an unspecified item; anything you like makes the choice unrestricted.|兩句都可拿物品，但任選程度不同。|IP18
215|The witness did not notice anything unusual.|noticed nothing 改為 did not notice anything，過去式由 did 承擔。|IP52
216|itself|something 指事物，反身詞用 itself。|IP25
217|worth keeping|worth 後接動名詞 keeping，不接 to keep。|IP33
218|All the students in the class are ready.|all the students 是複數主語，接 are。|IP58
219|We made no progress or reached no useful result.|got nowhere 是比喻沒有進展。|IP48
220|No. It likely means everyone relevant to the theatre situation, such as the expected audience or group.|every- 的全部範圍由談話情境決定。|IP08
221|someone / somebody|聽到腳步聲後推測有人回來，可用 some- 問句。|IP10
222|almost everybody|九十九人中九十九人贊成，接近全體。|IP54
223|was|Everyone 是單數主語，接 was。|IP21
224|near the station|somewhere near the station 是自然地點片語。|IP32
225|every one|回指五個答案中的每一個，用分開的 every one。|IP57
226|nowhere|in the middle of nowhere 表示十分偏僻。|IP48
227|I saw someone waiting does not specify who; our librarian identifies the person.|someone 未指名，但不必表示說話者不知道身份。|IP01
228|about|worry about something 的 about 必須保留。|IP33
229|No. Nobody is grammatically fine; the guard's claim was factually false.|語法正確不保證故事人物說的事是真的。|IP67
230|No. The witness may know the person but choose not to name them.|somebody 表示未指名，並不證明不知身份。|IP01
231|something a little more practical|形容詞片語放在 something 後。|IP31
232|nobody means no person; no body means no physical body.|分寫時 no 修飾名詞 body，意思不同。|IP58
233|No. From marks the source, and somewhere in South America describes an unspecified place.|go somewhere 通常不用 to，不代表所有介詞都禁用。|IP42
234|A countable noun meaning an unimportant person.|a nobody 是特殊名詞用法，不是普通 no-person 代名詞。|IP30
235|wait; to wait|nothing to do but wait；no choice but to wait。|IP64
236|No. It praises the singer as remarkable or exceptional.|something else 在這個讚歎語境是慣用評價。|IP64
237|something|建議是一項想法或事情，不是人。|IP03
238|anyone / anybody|doubt whether 表示未肯定是否有人做到，常用 any-。|IP16
239|hardly anyone|普通標準寫法用 hardly anyone 表示幾乎無人。|IP17
240|It is a form of direct address, not the subject of a statement.|Hello, everyone! 是稱呼，後面沒有需要配合的動詞。|IP28
241|Both work. Anyone highlights any individual who could solve it; everyone asserts the whole class can.|任一人的能力與全體人的能力焦點不同。|IP67
242|The first means free of charge; the second means the wait achieved nothing.|for nothing 的意思由上下文決定。|IP64
243|somewhere; someone; nothing|先找乾燥地方，後有一人提供座位，最後沒有可抱怨的事。|IP02
244|someone: person; anything: thing or matter; everywhere: place.|詞尾 -one、-thing、-where 分別指人、事物或地方。|IP02
245|Anyone / Anybody; any person may submit a design.|肯定句的 any- 表示資格不受身份限制。|IP15
246|There is nothing we can do now.|not ... anything 改為 nothing，保留「零項可行動作」。|IP52
247|themselves|someone 指人，可用 singular they 的反身形式 themselves。|IP25
248|for the children to|for 明確標出休息者，to 引出 rest。|IP34
249|My sister knew the code, but nobody else did.|nobody else 排除姐姐，否定其他人。|IP39
250|No. Went somewhere remote uses a direct place adverb; to in road to nowhere belongs to the noun phrase road to ....|兩個 to 所在結構不同，不能互相套用。|IP42
`; const parsed = rows.trim().split('\n').map(line => { const [number, answer, explanation, topic] = line.split('|'); return { number: Number(number), answer, explanation, topic }; });
  window.EDMUND_INDEFINITE_ANSWERS = parsed;
})();

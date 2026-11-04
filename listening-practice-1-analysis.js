(function () {
  "use strict";

  const item = (answer, explanation) => Object.freeze({ answer, explanation });

  window.EDMUND_IELTS_LISTENING_PRACTICE_1_ANALYSIS = Object.freeze({
    1: item("fish", "題目問餐廳特別適合喜歡哪種食物的人。錄音的 “If you like fish” 直接對應 “keen on fish”，而 “best restaurant … for that” 對應題目的推薦原因。不要被之後的 “all the food is good” 分散注意。"),
    2: item("roof", "錄音說晚餐前可 “go up on the roof and have a drink”，幾乎直接改寫成 “The roof is a good place for a drink”。空格需要地點名詞，不是之後提到的 views。"),
    3: item("Spanish", "女士問餐廳是否供應 Spanish food，男士回答 “Yeah”；之後的 small dishes to share 對應 good for sharing。Don Felipe’s 只是主廚的工作背景。"),
    4: item("vegetarian", "錄音先提到 vegetarian dishes，之後說 “the selection of those would be quite limited”。those 指 vegetarian dishes；前面的 good choice 是女士希望確認的情況，不是男士的結論。"),
    5: item("Audley", "男士說 “Have you been to The Audley?”，並逐字拼出 A-U-D-L-E-Y。題目已提供 The，因此空格只填專有名詞 Audley。"),
    6: item("hotel", "錄音的 “in that hotel … on the top floor” 對應 “At the top of a hotel”。Baxter Bridge 是附近地標；top floor 已由題幹表達。"),
    7: item("reviews", "“excellent reviews from all the newspapers” 中，excellent 對應 very good，被形容為很好的東西是 reviews。newspapers 只是評論的來源，不是答案。"),
    8: item("local", "“only likes cooking with local products” 和 “sourced within a short distance” 都說明食材是 local。nothing flown in from abroad 是相同意思的否定表達。"),
    9: item("30 / thirty", "錄音說 set lunch 是 “£30 a head”；a head 等於 per person。£50 是晚餐價錢（亦曾是另一餐廳的訂金），不是 set lunch。題目已印 £，填 30 或 thirty。"),
    10: item("average", "女士問是否是 tiny portions，男士先否定，再說 “I imagine they’d be average”。I imagine 對應 probably；tiny 是被否定的干擾答案。"),
    11: item("A", "pottery “stands the test of time”，而 baskets 和 pictures 不會像 pots 一樣 survive in the earth。survive in the earth 對應 lasts longer in the ground；碎片能提供資料不代表容易修復。"),
    12: item("B", "考古學家從 impressions 和 scratches 判斷陶器是用於 storage 還是 cooking；兩者都是陶器表面的 marks。clay 顯示來源地，不是用途；shape 亦可能已遺失。"),
    13: item("C", "錄音說參加者希望自己的作品 “will also last longer than they do”，即 outlive them。Like our ancestors 是比較古人留下作品，不是要把作品做得看起來古老。"),
    14: item("A", "Heather 說 “what I love most is the concentration”，而這種 focus 能把人從 everyday stresses 帶走，對應 calming effect。messy 和手腕運動是對其他參加者的好處。"),
    15: item("B", "“nearly everyone who comes here” 都是 first time trying the art，對應 most visitors have never made a pot before。錄音提到可把作品送給朋友，並不是帶朋友來上課。"),
    16: item("C", "Heather 要求大家 remove watches, necklaces, etc.，即 take off jewellery。圍裙是稍後提供；她也沒有要求參加者更換衣服。"),
    17: item("A", "錄音解釋 kiln 是燒陶的高溫爐，會移除黏土水分並令形狀永久固定，全部都在說它的 function。錄音只提到發明之後，沒有說何時發明。"),
    18: item("E", "錄音提到有人問能否用家用 oven，也有人在戶外用 fire pit 燒陶；這些都是 some people use instead of a kiln。沒有解釋 kiln 在家中應放哪裡。"),
    19: item("C", "Heather 說在陶輪上處理黏土時 “there are some basic tools that you will need”。will need 對應 essential items；前面徒手塑形的說法被 However 轉折。"),
    20: item("E", "“We can provide these” 中 these 指前文的 basic tools，表示工具可供參加者使用。她反而不建議現階段花錢購買；名稱也是 hard to remember。"),
    21: item("C", "Tamara 認為 loneliness 與 “the way cities are designed” 有關，Dev 明確回應 “I think you’re right”。這就是兩人都認同的 urban design；兩人沒有把 social media 視為主因。"),
    22: item("E", "people “move around for work” 並遠離家人朋友，對應 a mobile workforce；Dev 回應 “That’s true”。smaller nuclear families 被指出是數十年前已發生的變化。"),
    23: item("A", "錄音說 loneliness 導致 weakened immune system 是 “no doubt”，而數據 “is sound”。兩種說法都表示有 solid evidence；obesity 的證據則被質疑不足。"),
    24: item("C", "芬蘭研究顯示 loneliness 增加 cancer risk，而 findings 亦獲其他研究支持，Dev 回應 “You’re right about that one”。dementia 和 cardiovascular disease 的證據較不確定。"),
    25: item("A", "Dev 說此理論對解決今日 loneliness “not really useful”，Tamara 回應 “True”。因此兩人認同它的 practical relevance 很低，但不代表理論本身完全錯。"),
    26: item("B", "兩人都指出 evidence 不足，並明說 “More evidence is needed”，等於 needs further investigation。Tamara 仍覺得理論 quite convincing，所以不是 misleading。"),
    27: item("A", "loneliness 沒有 recognised clinical form、diagnosis 或 effective treatment，而且情況 unlikely to change；兩人都同意。因此他們懷疑日後是否會有 medical cure。"),
    28: item("B", "以初入大學、第一次離家的孤獨經歷開場，因為 “Everyone will be able to relate to that”。重點是大多數學生都熟悉這個情境。"),
    29: item("A", "Tamara 不確定交談是否令人更 optimistic，但認為會令人 feel more connected with their community，Dev 回應 “True”。共同同意的是建立 sense of belonging。"),
    30: item("C", "有人 love being alone，但兩位學生都說自己不喜歡獨處；他們難理解的是為何 solitude 是 enjoyable。Dev 明白它對 well-being 有益，所以 B 不是答案。"),
    31: item("factories", "錄音說 factories 建在河邊並把 waste materials 排入水中。beside the river 對應 on the river bank；這一格是另一污染來源，不是題幹已提過的 houses 或 sewage。"),
    32: item("dead", "錄音原句是 River Thames was “dead” in biological terms，直接改寫成 declared biologically dead。filthy 是河流不能維持生命的原因，不是題目要填的狀態。"),
    33: item("whale", "錄音提到 seals，亦有人救援一條游錯進泰晤士河的 whale，證明它曾在河中出現。題目前有 a，因此使用單數 whale。"),
    34: item("apartments", "warehouses are being converted into expensive restaurants and apartments with river views。converted into 對應 converted to；with river views 只是 apartments 的特點。"),
    35: item("park", "洛杉磯的建築師計劃 revitalise river banks 並 “make a park there”。make a park 對應 build a riverside park；sports facilities 是公園內容，不是空格答案。"),
    36: item("art", "錄音說展示 projects related to various kinds of art，改寫成 art projects。local people 是創作者來源，不是項目類型。"),
    37: item("beaches", "巴黎在七、八月把 river banks transformed into beaches。banks 對應 sides of the river，暑期對應 every summer；deckchairs 等只是沙灘上的設施。"),
    38: item("ferry", "“more than two billion passengers use the ferry to travel” 直接對應 over 2 billion passengers travel by ferry。Istanbul 等是例子，不是交通方式。"),
    39: item("bikes", "parcels 可由 cargo bikes 運送，而 “electric ones” 中 ones 指 bikes，所以答案是複數 bikes。barges 已印在題目；trucks 和 vans 是將被取代的交通。"),
    40: item("drone", "錄音說 “in future, the final stage could even be carried out by drone”，與題目幾乎完全相同。現時未獲允許不影響題目所問的未來方式。")
  });
})();

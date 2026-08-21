(function () {
  "use strict";
  const mc = (number, part, prompt, translation, answer, options) => ({ number, part, type: "choice", prompt, translation, answer, options });
  const gap = (number, part, prompt, translation, answer, alternatives = []) => ({ number, part, type: "gap", prompt, translation, answer, alternatives });
  const multi = (numbers, part, prompt, translation, answers, options) => ({ numbers, part, type: "multi", prompt, translation, answers, options });
  const option = (key, en, zh) => ({ key, en, zh });

  window.EDMUND_IELTS_LISTENING_PRACTICE_1 = Object.freeze({
    title: "IELTS Listening · Practice 1",
    parts: [
      {
        part: 1,
        instruction: "Complete the table. Write ONE WORD AND/OR A NUMBER for each answer.",
        instructionZh: "完成表格。每題只可填寫一個單字及／或一個數字。",
        table: {
          caption: "Restaurant recommendations · 餐廳推薦",
          headers: ["Name of restaurant", "Location", "Reason for recommendation", "Other comments"],
          headersZh: ["餐廳名稱", "地點", "推薦原因", "其他評語"],
          rows: [
            ["The Junction", "Greyson Street, near the station", "Good for people who are especially keen on {{1}}", "Expensive; the {{2}} is a good place for a drink"],
            ["Paloma", "Bow Street, next to the cinema", "{{3}} food, good for sharing", "Friendly staff; £50 deposit; limited selection of {{4}} food"],
            ["The {{5}}", "At the top of a {{6}}", "Famous chef; all the {{7}} are very good; only {{8}} ingredients are used", "Set lunch costs £{{9}} per person; portions are probably of {{10}} size"]
          ],
          rowsZh: [
            ["The Junction", "Greyson Street，近車站", "適合特別喜愛 {{1}} 的人", "價錢較高；{{2}} 是喝飲品的好地方"],
            ["Paloma", "Bow Street，戲院旁邊", "{{3}} 料理，適合分享", "員工友善；訂位需付 £50 訂金；{{4}} 食物選擇有限"],
            ["The {{5}}", "位於一間 {{6}} 的頂層", "名廚主理；所有 {{7}} 都很好；只使用 {{8}} 食材", "套餐每人 £{{9}}；份量大概屬於 {{10}}"]
          ]
        },
        questions: [
          gap(1, 1, "Good for people who are especially keen on ____.", "適合特別喜愛____的人。", "fish"),
          gap(2, 1, "The ____ is a good place for a drink.", "____是喝飲品的好地方。", "roof"),
          gap(3, 1, "____ food, good for sharing.", "____料理，適合分享。", "Spanish"),
          gap(4, 1, "Limited selection of ____ food.", "____食物的選擇有限。", "vegetarian"),
          gap(5, 1, "The ____.", "The ____ 餐廳。", "Audley"),
          gap(6, 1, "At the top of a ____.", "位於一間____的頂層。", "hotel"),
          gap(7, 1, "All the ____ are very good.", "所有____都很好。", "reviews"),
          gap(8, 1, "Only ____ ingredients are used.", "只使用____食材。", "local"),
          gap(9, 1, "Set lunch costs £____ per person.", "套餐每人價錢為 £____。", "30", ["thirty", "£30"]),
          gap(10, 1, "Portions are probably of ____ size.", "份量大概屬於____。", "average")
        ]
      },
      {
        part: 2,
        instruction: "Choose the correct letter. For Questions 17–20, choose TWO letters.",
        instructionZh: "選擇正確字母。第 17–20 題每組需選擇兩個答案。",
        questions: [
          mc(11,2,"Heather says pottery differs from other art forms because","Heather 說陶藝與其他藝術形式不同，因為","A",[option("A","it lasts longer in the ground.","它在地下能保存得更久。"),option("B","it is practised by more people.","更多人從事陶藝。"),option("C","it can be repaired more easily.","它更容易修復。")]),
          mc(12,2,"Archaeologists sometimes identify the use of ancient pottery from","考古學家有時會根據以下哪一項判斷古代陶器的用途","B",[option("A","the clay it was made with.","製作它的黏土。"),option("B","the marks that are on it.","它上面的痕跡。"),option("C","the basic shape of it.","它的基本形狀。")]),
          mc(13,2,"Some people join Heather's pottery class because they want to","有些人參加 Heather 的陶藝班，因為他們希望","C",[option("A","create an item that looks very old.","製作一件看起來很古老的物品。"),option("B","find something that they are good at.","找到自己擅長的事。"),option("C","make something that will outlive them.","製作一件比自己存在得更久的東西。")]),
          mc(14,2,"What does Heather value most about being a potter?","Heather 最重視陶藝家這份工作的哪一點？","A",[option("A","its calming effect","它令人平靜的效果"),option("B","its messy nature","它容易弄髒的特性"),option("C","its physical benefits","它對身體的好處")]),
          mc(15,2,"Most of the visitors to Edelman Pottery","大多數到訪 Edelman Pottery 的人","B",[option("A","bring friends to join courses.","會帶朋友一起參加課程。"),option("B","have never made a pot before.","以前從未做過陶器。"),option("C","try to learn techniques too quickly.","急於過快學會技巧。")]),
          mc(16,2,"Heather reminds her visitors that they should","Heather 提醒參加者應該","C",[option("A","put on their aprons.","穿上圍裙。"),option("B","change their clothes.","更換衣服。"),option("C","take off their jewellery.","取下首飾。")]),
          multi([17,18],2,"Which TWO things does Heather explain about kilns?","Heather 解釋了關於陶窯的哪兩件事？",["A","E"],[option("A","what their function is","它們的功用"),option("B","when they were invented","它們何時被發明"),option("C","ways of keeping them safe","如何安全保管它們"),option("D","where to put one in your home","在家中應放在哪裡"),option("E","what some people use instead of one","有些人用什麼代替陶窯")]),
          multi([19,20],2,"Which TWO points does Heather make about a potter's tools?","Heather 對陶藝工具提出了哪兩點？",["C","E"],[option("A","Some are hard to hold.","有些很難握持。"),option("B","Some are worth buying.","有些值得購買。"),option("C","Some are essential items.","有些是必需品。"),option("D","Some have memorable names.","有些名稱很容易記。"),option("E","Some are available for use by participants.","有些可供參加者使用。")])
        ]
      },
      {
        part: 3,
        instruction: "Choose the correct letter. For Questions 21–26, choose TWO letters.",
        instructionZh: "選擇正確字母。第 21–26 題每組需選擇兩個答案。",
        questions: [
          multi([21,22],3,"Which TWO things do the students both believe are responsible for the increase in loneliness?","兩位學生都認為哪兩項因素造成孤獨感上升？",["C","E"],[option("A","social media","社交媒體"),option("B","smaller nuclear families","規模較小的核心家庭"),option("C","urban design","城市設計"),option("D","longer lifespans","平均壽命延長"),option("E","a mobile workforce","流動性高的勞動人口")]),
          multi([23,24],3,"Which TWO health risks associated with loneliness do the students agree are based on solid evidence?","兩位學生認同哪兩項與孤獨有關的健康風險有充分證據？",["A","C"],[option("A","a weakened immune system","免疫系統變弱"),option("B","dementia","失智症"),option("C","cancer","癌症"),option("D","obesity","肥胖"),option("E","cardiovascular disease","心血管疾病")]),
          multi([25,26],3,"Which TWO opinions do both the students express about the evolutionary theory of loneliness?","兩位學生對孤獨感的進化理論共同表達了哪兩個看法？",["A","B"],[option("A","It has little practical relevance.","它的實際意義不大。"),option("B","It needs further investigation.","它需要進一步研究。"),option("C","It is misleading.","它具誤導性。"),option("D","It should be more widely accepted.","它應被更廣泛接受。"),option("E","It is difficult to understand.","它很難理解。")]),
          mc(27,3,"When comparing loneliness to depression, the students","把孤獨感與抑鬱症比較時，兩位學生","A",[option("A","doubt that there will ever be a medical cure for loneliness.","懷疑孤獨感是否會有醫學治療方法。"),option("B","claim that the link between loneliness and mental health is overstated.","認為孤獨感與心理健康的關係被誇大。"),option("C","express frustration that loneliness is not taken more seriously.","對孤獨感未被更認真看待感到不滿。")]),
          mc(28,3,"Why do the students decide to start their presentation with an example from their own experience?","為何兩位學生決定以自身經驗的例子開始匯報？","B",[option("A","to explain how difficult loneliness can be","解釋孤獨感可以有多難受"),option("B","to highlight a situation that most students will recognise","突出大多數學生都會認得的情況"),option("C","to emphasise that feeling lonely is more common for men than women","強調男性比女性更常感到孤獨")]),
          mc(29,3,"The students agree that talking to strangers is a good strategy for dealing with loneliness because","兩位學生同意，與陌生人交談是應對孤獨感的好方法，因為","A",[option("A","it creates a sense of belonging.","它能建立歸屬感。"),option("B","it builds self-confidence.","它能建立自信。"),option("C","it makes people feel more positive.","它令人感覺更正面。")]),
          mc(30,3,"The students find it difficult to understand why solitude is considered to be","兩位學生難以理解，為何獨處被視為","C",[option("A","similar to loneliness.","與孤獨相似。"),option("B","necessary for mental health.","心理健康所必需。"),option("C","an enjoyable experience.","一種愉快的經驗。")])
        ]
      },
      {
        part: 4,
        instruction: "Complete the notes. Write ONE WORD ONLY for each answer.",
        instructionZh: "完成筆記。每題只可填寫一個單字。",
        questions: [
          gap(31,4,"Pollution from ____ on the river bank.","河岸的____造成污染。","factories"),
          gap(32,4,"In 1957, the River Thames was declared biologically ____.","1957 年，泰晤士河被宣布在生物學上已____。","dead"),
          gap(33,4,"Seals and even a ____ have been seen in the River Thames.","泰晤士河曾出現海豹，甚至一條____。","whale"),
          gap(34,4,"Riverside warehouses are converted to restaurants and ____.","河畔倉庫被改建成餐廳和____。","apartments"),
          gap(35,4,"In Los Angeles, there are plans to build a riverside ____.","洛杉磯計劃在河邊建造一個____。","park"),
          gap(36,4,"In Los Angeles, there are plans to display ____ projects.","洛杉磯計劃展示____項目。","art"),
          gap(37,4,"In Paris, ____ are created on the sides of the river every summer.","巴黎每年夏天都會在河邊建造____。","beaches"),
          gap(38,4,"Over 2 billion passengers already travel by ____ in cities around the world.","全球城市已有超過 20 億乘客乘搭____出行。","ferry"),
          gap(39,4,"Goods could be transported by large freight barges and electric ____.","貨物可由大型貨運駁船和電動____運輸。","bikes"),
          gap(40,4,"In future, goods could be transported by ____.","未來，貨物可由____運輸。","drone")
        ]
      }
    ]
  });
})();

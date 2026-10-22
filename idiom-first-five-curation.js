/* Editorial pilot for the first five idioms. Existing question IDs and answers remain unchanged. */
(function defineIdiomCompass() {
  const lessons = {
    "idiom-01": {
      modelEn: "I'll start the ball rolling by asking our first question.",
      modelZh: "我先提出第一個問題，帶動討論開始。",
      readAloudEn: "I'll start the ball rolling by sharing a simple plan for our school fair.",
      readAloudZh: "我會先分享一個校園嘉年華的簡單計劃，帶動大家開始籌備。",
      meaningZh: "有人先採取行動，讓討論、活動或計劃真正開始。",
      meaningEn: "Take the first useful step so a shared activity can begin.",
      picture: "靜止的球，需要第一下推動。",
      boundary: "重點是帶動後續進展；只說一件孤立的小事開始，通常直接用 start 更自然。",
      where: "小組討論、會議、項目起步",
      tone: "友善、中性；日常和工作場合都自然。",
      formal: "正式法律或學術文稿可用 initiate 或 launch。",
      fixed: "the ball rolling",
      moving: "start 可按時態變成 starts、started、starting；後面三個字不變。",
      forms: ["start the ball rolling", "started the ball rolling", "starting the ball rolling"],
      checks: ["是否有人或事物踏出第一步？", "這一步是否推動其他人或下一步？", "有否保留 the ball rolling 的次序？"],
      choices: {
        2: { promptZh: "哪個情境最適合？", promptEn: "Which scene fits?", options: ["一位組員先提出問題，其他人開始討論。", "一位同學每天獨自準時起床。", "一場已進行兩小時的會議正在結束。"], correct: 0, feedback: "第一個問題打開局面，讓其他人接得上。" },
        3: { promptZh: "在非常正式的法律報告中，哪種說法較穩妥？", promptEn: "Choose the safer register.", options: ["使用 initiate，清楚交代程序。", "每段都用這個慣用語。", "用它代替所有形式的 start。"], correct: 0, feedback: "慣用語適合談話和一般工作溝通；法律報告宜選更準確的動詞。" },
        5: { promptZh: "朋友說小組還未開始討論。你會怎樣推進？", promptEn: "Choose the next move.", options: ["先拋出一個可討論的問題。", "只說時間過得很快。", "宣布討論已經結束。"], correct: 0, feedback: "先提出具體問題，才是帶動討論的第一步。" },
        6: { promptZh: "哪個情境不宜使用這個慣用語？", promptEn: "Spot the boundary.", options: ["有人先聯絡義工，清潔行動隨後展開。", "團隊提出第一個方案，其他人繼續完善。", "一個人獨自打開抽屜，沒有其他進展。"], correct: 2, feedback: "沒有後續過程時，普通動詞較清楚。" }
      }
    },
    "idiom-02": {
      modelEn: "Shake a leg, Ben—the bus leaves in two minutes!",
      modelZh: "Ben，快點，巴士兩分鐘後開走！",
      readAloudEn: "Shake a leg, Mia, or we'll miss the start of the concert!",
      readAloudZh: "Mia，快點，不然我們會錯過音樂會的開場！",
      meaningZh: "催促熟悉的人快點行動，通常因為時間緊迫。",
      meaningEn: "Tell someone to hurry, usually in a familiar, spoken setting.",
      picture: "不是叫人搖腿，而是提醒動作快一點。",
      boundary: "對陌生顧客、行動不便的人或需要格外禮貌的場合，這句可能顯得命令式。",
      where: "家人、朋友、隊友；趕車或活動快開始時",
      tone: "口語、熟絡，略帶舊式色彩；語氣可輕鬆，也可能顯得不耐煩。",
      formal: "正式溝通用 please hurry 或更具體的禮貌要求。",
      fixed: "shake a leg",
      moving: "a 和單數 leg 固定；可作直接催促，或接在 need to、must 後。",
      forms: ["shake a leg", "need to shake a leg", "must shake a leg"],
      checks: ["真的需要加快嗎？", "雙方關係是否夠熟？", "有否保留 a leg，而非 legs？"],
      choices: {
        2: { promptZh: "哪個情境最自然？", promptEn: "Which scene fits?", options: ["朋友還在收拾，校巴兩分鐘後開走。", "顧客因腳傷走得慢，店員大聲催促。", "大家提早一小時到達，沒有時間壓力。"], correct: 0, feedback: "有真實時間壓力，而且對象是熟悉的朋友。" },
        3: { promptZh: "向不熟悉的顧客提出趕快提交文件的要求，應如何表達？", promptEn: "Choose the right tone.", options: ["用禮貌而具體的要求。", "直接命令顧客 shake a leg。", "完全不說明時限。"], correct: 0, feedback: "這個慣用語帶口語催促感，對陌生顧客不夠得體。" },
        5: { promptZh: "隊友還未換好衣服，比賽快開始。你的下一步是？", promptEn: "Choose the next move.", options: ["提醒隊友快一點，並說明開賽時間。", "稱讚隊友今天很早。", "只談下星期的練習。"], correct: 0, feedback: "提醒加速並說明原因，語用才完整。" },
        6: { promptZh: "哪個判斷有問題？", promptEn: "Spot the boundary.", options: ["可對熟悉隊友作輕鬆催促。", "在緊急情況可表達快一點。", "對任何人、任何情況都同樣禮貌。"], correct: 2, feedback: "語氣取決於關係與處境，不是通用的禮貌句。" }
      }
    },
    "idiom-03": {
      modelEn: "Maya hit the ground running: on her first day, she solved a problem for the team.",
      modelZh: "Maya 第一天就為團隊解決問題，一上任便有效投入。",
      readAloudEn: "Our new captain hit the ground running and organised a training session on her first day.",
      readAloudZh: "新隊長第一天就安排好訓練，一上任便積極而有效地投入。",
      meaningZh: "剛開始新工作或新項目，就立即有效地投入並取得進展。",
      meaningEn: "Begin a new role or project with immediate, effective action.",
      picture: "一落地便開始跑：沒有長時間適應期。",
      boundary: "只有『快』而沒有有效工作或進展，不足以使用這個慣用語。",
      where: "新工作、新學期、新項目、團隊上任",
      tone: "中性而積極；職場及簡報常用。",
      formal: "極正式的技術文稿可直說 begin work immediately and effectively。",
      fixed: "the ground running",
      moving: "hit 的過去式仍是 hit，絕不是 hitted。",
      forms: ["hit the ground running", "hits the ground running", "hitting the ground running"],
      checks: ["是否新的開始？", "是否立即有實際貢獻？", "過去式是否仍用 hit？"],
      choices: {
        2: { promptZh: "哪個情境符合？", promptEn: "Which scene fits?", options: ["新同事第一天已整理資料並解決問題。", "新同事第一天只是提早到公司門口。", "舊項目已做一年，今天照常工作。"], correct: 0, feedback: "新的開始加上即時有效的工作，兩個條件都齊備。" },
        3: { promptZh: "面試中描述新職位的理想開局，哪個重點最合適？", promptEn: "Choose the emphasis.", options: ["說明能立即投入並帶來實際進展。", "只強調自己會跑得很快。", "只說自己會提早到場。"], correct: 0, feedback: "慣用語稱讚的是迅速而有效的投入。" },
        5: { promptZh: "新隊員加入後馬上改善流程。你會怎樣回應？", promptEn: "Choose the next move.", options: ["肯定其第一天就有實際貢獻。", "只稱讚對方的鞋子。", "說對方仍未開始工作。"], correct: 0, feedback: "回應應聚焦於新開始時的即時成效。" },
        6: { promptZh: "哪個情況不能只憑速度就套用？", promptEn: "Spot the boundary.", options: ["新組長上任便完成重要協調。", "新生第一天已幫團隊完成任務。", "新員工跑上樓梯，但沒有開始工作。"], correct: 2, feedback: "字面上的跑步並不等於迅速上手。" }
      }
    },
    "idiom-04": {
      modelEn: "We keep chopping and changing the date, so nobody can make plans.",
      modelZh: "我們不斷改活動日期，令大家無法安排。",
      readAloudEn: "If we keep chopping and changing the meeting time, nobody will know when to arrive.",
      readAloudZh: "如果我們不斷更改會議時間，大家便不知道何時到場。",
      meaningZh: "對同一件事反覆改主意或改做法，通常帶點不滿。",
      meaningEn: "Keep changing a decision or plan instead of settling on one.",
      picture: "選項被換來換去，大家難以跟上。",
      boundary: "只改動一次，尤其有充分理由時，不宜說成 chop and change。",
      where: "計劃、選擇、做事方式反覆變動",
      tone: "偏英式、非正式；常帶輕微批評。",
      formal: "正式報告可用 change repeatedly 或 make repeated changes。",
      fixed: "chop and change",
      moving: "兩個動詞一起變化：chops and changes、chopped and changed、chopping and changing。",
      forms: ["chop and change", "chopped and changed", "chopping and changing"],
      checks: ["是否改了不只一次？", "是否有拿不定主意或不一致的感覺？", "兩個動詞的形式是否一致？"],
      choices: {
        2: { promptZh: "哪個情境最適合？", promptEn: "Which scene fits?", options: ["活動日期在週一、週五、週一之間來回更改。", "因颱風改期一次，之後一直不變。", "一個人用刀切菜。"], correct: 0, feedback: "來回更改才是這個表達的核心。" },
        3: { promptZh: "你想在正式報告中記錄多次更改，哪種說法較中性？", promptEn: "Choose the register.", options: ["change repeatedly。", "用 chop and change 指責每個人。", "不交代更改次數。"], correct: 0, feedback: "正式報告通常適合直接、客觀的說法。" },
        5: { promptZh: "小組已第四次更改計劃，你的回應應包含甚麼？", promptEn: "Choose the next move.", options: ["指出反覆改動造成困難，並促請定案。", "稱讚這是第一次修改。", "轉而討論完全無關的題目。"], correct: 0, feedback: "這個慣用語常表達對反覆更改的不滿。" },
        6: { promptZh: "哪個使用界線最重要？", promptEn: "Spot the boundary.", options: ["任何一次變動都可以這樣說。", "只有反覆或不必要的改動才貼切。", "只要出現刀具就可以這樣說。"], correct: 1, feedback: "一次合理改動不等於反覆改來改去。" }
      }
    },
    "idiom-05": {
      modelEn: "Let's think big and turn our class garden into a whole-school project.",
      modelZh: "讓我們把班級花園擴展為全校項目，放眼更大目標。",
      readAloudEn: "Let's think big and create a reading programme for every school in the district.",
      readAloudZh: "讓我們放眼更大目標，為區內每間學校設計閱讀計劃。",
      meaningZh: "敢於規劃更大規模、更長遠或更有抱負的目標。",
      meaningEn: "Plan ambitiously and consider a wider scale of possibility.",
      picture: "把目光從眼前的小範圍，移向更遠的目標。",
      boundary: "這不是『仔細想』，也不保證大計劃一定成功。",
      where: "升學、事業、社區計劃、創意項目",
      tone: "正面、鼓勵；也可提醒別人不要把目標定得太小。",
      formal: "極正式的文件可用 develop a large-scale plan 等具體說法。",
      fixed: "big",
      moving: "think 可變為 thinks、thought、thinking；big 保持不變。",
      forms: ["think big", "thinks big", "thought big", "thinking big"],
      checks: ["目標是否比眼前小任務更遠大？", "談的是抱負，不是物件大小嗎？", "有否按主語和時態變化 think？"],
      choices: {
        2: { promptZh: "哪個情境符合？", promptEn: "Which scene fits?", options: ["學生把班級花園構想擴展成全校計劃。", "學生仔細量度一個很大的紙箱。", "學生只打算今天完成一題練習。"], correct: 0, feedback: "由一個班別擴展至全校，體現更大的目標。" },
        3: { promptZh: "在鼓勵同伴時，這個表達主要傳達甚麼？", promptEn: "Choose the tone.", options: ["不要被眼前的小規模限制。", "你一定會成功，毋須計劃。", "你應該找一件體積大的物件。"], correct: 0, feedback: "它鼓勵更有抱負的構想，但不保證成果。" },
        5: { promptZh: "同伴想把學校網站開放給全港學生。你會聚焦甚麼？", promptEn: "Choose the next move.", options: ["肯定目標規模擴大，再討論實行步驟。", "只評論網站圖示大小。", "說這個計劃已經完成。"], correct: 0, feedback: "有遠大目標後仍要考慮可行步驟。" },
        6: { promptZh: "哪個理解不正確？", promptEn: "Spot the boundary.", options: ["可以用於更廣闊的計劃。", "可以用於勉勵人放眼遠方。", "意思是想一想大型物件。"], correct: 2, feedback: "big 指抱負或規模，不是實際尺寸。" }
      }
    }
  };
  // English carries the task; Traditional Chinese supports comprehension below it.
  const english = {
    "idiom-01": {
      pictureEn: "A still ball needs someone to give it the first push.",
      boundaryEn: "Use this for a first step that leads to further action. For a one-off action, simply say start.",
      whereEn: "Group discussions, meetings and the launch of a project.",
      toneEn: "Friendly and neutral in everyday or workplace English.",
      formalEn: "In a legal or academic report, initiate or launch may be more precise.",
      movingEn: "Change start for tense: starts, started, starting. Keep the ball rolling together.",
      checksEn: ["Has someone taken the first step?", "Did that step help others move forward?", "Did I keep the ball rolling in order?"],
      choices: {
        2: { promptEn: "Which situation would you describe with start the ball rolling?", optionsEn: ["A group member asks the first question, and everyone begins discussing.", "A student wakes up on time alone every morning.", "A two-hour meeting is coming to an end."], feedbackEn: "The first question opens the discussion and gives others something to build on." },
        3: { promptEn: "Which line naturally starts a team discussion?", promptZh: "哪一句能自然地帶動小組討論？", optionsEn: ["I'll start the ball rolling with a question for everyone.", "The legal report must start the ball rolling in every paragraph.", "I started the ball rolling by waking up alone."], options: ["我先問大家一個問題，帶動討論。", "法律報告每段都必須使用這個慣用語。", "我獨自起床，便算帶動了後續進展。"], feedbackEn: "The first line uses the idiom for an opening action that others can build on.", feedback: "第一句用一個可讓其他人接續的行動帶動討論。" },
        5: { promptEn: "Your group has not started. What could you actually say?", promptZh: "小組還未開始，你可以實際說哪一句？", optionsEn: ["Let me start the ball rolling: which idea should we try first?", "I start the ball rolling every morning by waking up.", "Let's start the ball rolling by ending the discussion now."], options: ["讓我先帶動討論：我們應先試哪個想法？", "我每天起床都算帶動團體活動。", "讓我們結束討論，藉此帶動討論。"], feedbackEn: "The question gives everyone a first point to respond to.", feedback: "這個問題為大家提供了可以回應的第一步。" },
        6: { promptEn: "Which use of start the ball rolling is misleading?", promptZh: "哪一句誤用了 start the ball rolling？", optionsEn: ["I started the ball rolling by inviting volunteers to the clean-up.", "Our first proposal started the ball rolling for the whole team.", "I started the ball rolling by opening a drawer; nothing else happened."], options: ["我邀請義工，帶動清潔行動展開。", "第一個方案帶動團隊後續工作。", "我打開抽屜，但沒有任何後續進展。"], feedbackEn: "Opening a drawer alone does not set a wider activity in motion.", feedback: "獨自打開抽屜沒有推動更大的活動。" }
      }
    },
    "idiom-02": {
      pictureEn: "You are asking someone to move faster, not literally to shake a leg.",
      boundaryEn: "It can sound bossy with a stranger, an injured person or anyone who deserves extra care.",
      whereEn: "Friends, family or teammates when a bus or event is about to start.",
      toneEn: "Informal and familiar, with a slightly old-fashioned feel. It may sound playful or impatient.",
      formalEn: "For a formal request, say please hurry or explain the deadline politely.",
      movingEn: "Keep a leg singular. The phrase can stand alone or follow need to or must.",
      checksEn: ["Is there a real need to hurry?", "Am I speaking to someone I know well?", "Did I say a leg, not legs?"],
      choices: {
        2: { promptEn: "When might you naturally say shake a leg?", optionsEn: ["A friend is still packing, and the school bus leaves in two minutes.", "A shop assistant rushes a customer who is walking slowly because of an injury.", "Everyone has arrived an hour early, so there is no rush."], feedbackEn: "There is genuine time pressure, and the listener is a familiar friend." },
        3: { promptEn: "Which use of shake a leg fits the relationship and moment?", promptZh: "哪一句適合當下的關係和情境？", optionsEn: ["Shake a leg, Ben—the bus leaves in two minutes!", "Shake a leg, sir, even though your injured foot hurts.", "Shake a leg, everyone—we arrived an hour early."], options: ["Ben，快點，巴士兩分鐘後開走！", "先生，腳傷也要快點走。", "各位快點，我們已提早一小時到。"], feedbackEn: "A familiar friend and a real deadline make the informal idiom fit.", feedback: "對熟悉朋友說，而且真的趕時間，語氣才合適。" },
        5: { promptEn: "The match starts in two minutes. What could you actually say to your teammate?", promptZh: "兩分鐘後開賽，你可實際對隊友說哪一句？", optionsEn: ["Shake a leg, Max—the match is about to start!", "Shake a leg, customer; your injury is slowing us down.", "Shake your legs, Max—the match is about to start!"], options: ["Max，快點，比賽快開始了！", "顧客，你的傷令我們太慢，快點。", "把固定短語 a leg 錯改成複數 legs。"], feedbackEn: "The direct reminder fits a teammate you know; keep the fixed phrase a leg.", feedback: "對熟悉隊友可直接催促；固定說法必須是 a leg。" },
        6: { promptEn: "Which use of shake a leg would sound unkind?", promptZh: "哪一句 shake a leg 聽起來不體貼？", optionsEn: ["Shake a leg, Sam—the train leaves in a minute!", "Shake a leg, team—we need to be on the pitch now!", "Shake a leg, sir, despite your injured leg."], options: ["Sam，快點，火車一分鐘後開走！", "隊友快點，我們現在要上場！", "先生，即使腳受傷也快點。"], feedbackEn: "Do not use this blunt command toward an injured stranger.", feedback: "不要用這種直接催促的語氣對腳傷的陌生人說。" }
      }
    },
    "idiom-03": {
      pictureEn: "Imagine landing and moving at once, with no long warm-up period.",
      boundaryEn: "Being fast is not enough; the person must make useful progress from the start.",
      whereEn: "A new job, school term, project or team role.",
      toneEn: "Positive and fairly neutral; common in workplace talk and presentations.",
      formalEn: "In a technical report, begin work immediately and effectively may be clearer.",
      movingEn: "The past tense of hit is still hit, never hitted.",
      checksEn: ["Is this a new beginning?", "Was there useful action straight away?", "Did I keep hit as the past-tense form?"],
      choices: {
        2: { promptEn: "Who has hit the ground running?", optionsEn: ["A new colleague organises the files and solves a problem on day one.", "A new colleague reaches the office door early but does no work.", "Someone continues the same project after a year of work."], feedbackEn: "A new start and immediate, effective work are both present." },
        3: { promptEn: "Which interview line uses hit the ground running naturally?", promptZh: "哪一句在面試中自然地用到 hit the ground running？", optionsEn: ["I hope to hit the ground running by contributing to the project from day one.", "I hope to hit the ground running because I can sprint quickly.", "I hit the ground running by arriving at the office door early."], options: ["我希望從第一天就為項目作出貢獻。", "我跑步很快，所以可以用這句。", "我只是提早到辦公室門口，便算有效投入。"], feedbackEn: "The idiom points to useful work immediately after a new start, not physical running or punctuality.", feedback: "這句強調新開始時立即有實際貢獻，不是跑步或準時。" },
        5: { promptEn: "A teammate improves the process on day one. What could you actually say?", promptZh: "新隊友第一天就改善流程，你可實際說哪一句？", optionsEn: ["You really hit the ground running—you improved the process on your first day!", "You hitted the ground running by running upstairs quickly.", "You hit the ground running because your shoes look new."], options: ["你第一天就改善流程，真是一上任便有效投入！", "hitted 是錯誤的過去式，而且只談字面跑步。", "只因為鞋子新便使用這個慣用語。"], feedbackEn: "The first line uses the correct form hit and names the teammate's immediate contribution.", feedback: "第一句正確使用 hit，並指出隊友一開始的實際貢獻。" },
        6: { promptEn: "Which use of hit the ground running confuses literal speed with progress?", promptZh: "哪一句把字面速度誤當成有效投入？", optionsEn: ["Our new leader hit the ground running and organised the project on day one.", "The new student hit the ground running by helping the team finish its task immediately.", "The new employee hit the ground running by sprinting upstairs, before doing any work."], options: ["新組長第一天便組織好項目。", "新生一加入便幫團隊完成任務。", "新員工只是跑上樓，尚未開始工作。"], feedbackEn: "Sprinting upstairs is literal movement, not effective work in a new role.", feedback: "跑上樓只是字面上的移動，不是新職位中的有效工作。" }
      }
    },
    "idiom-04": {
      pictureEn: "A decision keeps switching back and forth, making it hard for others to follow.",
      boundaryEn: "One sensible change, especially for a good reason, is not chop and change.",
      whereEn: "Plans, choices or working methods that change repeatedly.",
      toneEn: "Informal and more common in British English; it often carries mild criticism.",
      formalEn: "In a formal report, use change repeatedly or make repeated changes.",
      movingEn: "Change both verbs together: chops and changes, chopped and changed, chopping and changing.",
      checksEn: ["Has the plan changed more than once?", "Does it seem inconsistent or unsettled?", "Did both verbs take the matching form?"],
      choices: {
        2: { promptEn: "Which situation shows someone chopping and changing?", optionsEn: ["The event date moves from Monday to Friday and back to Monday.", "A storm forces one date change, and it then stays fixed.", "Someone uses a knife to cut vegetables."], feedbackEn: "Repeated changes back and forth are the key idea." },
        3: { promptEn: "Which line naturally raises a concern in a team discussion?", promptZh: "哪一句能在小組討論中自然表達憂慮？", optionsEn: ["We keep chopping and changing the date; can we agree on one plan?", "The storm made us chop and change the date once.", "I chop and change vegetables for dinner."], options: ["我們不斷改日期；可否定下來？", "因颱風只改期一次，卻說成反覆修改。", "把這句當成切菜的字面動作。"], feedbackEn: "Repeated changes make the informal criticism meaningful.", feedback: "反覆修改才令這句帶批評意味的慣用語貼切。" },
        5: { promptEn: "Your group changes its plan for the fourth time. What could you actually say?", promptZh: "小組第四次改計劃，你可實際說哪一句？", optionsEn: ["We keep chopping and changing the plan. Can we settle on one version?", "We chopped and changed once because of the storm, and then stopped.", "Let's chop and change the vegetables before dinner."], options: ["我們不停改計劃，可否定下來？", "颱風只令我們改期一次，之後沒有再改。", "讓我們晚餐前切菜。"], feedbackEn: "The first line names the repeated changes and asks the group to decide.", feedback: "第一句指出反覆改動，再促請小組定案。" },
        6: { promptEn: "Which use of chop and change exaggerates a single justified change?", promptZh: "哪一句把一次合理改動誇大成反覆修改？", optionsEn: ["They chopped and changed the date three times this week.", "We chopped and changed the date when a storm forced one postponement.", "The team keeps chopping and changing its design every day."], options: ["他們本週改了三次日期。", "颱風令活動只改期一次，卻稱為反覆修改。", "團隊每天都在改設計。"], feedbackEn: "One weather-related postponement is not a pattern of indecision.", feedback: "因天氣合理改期一次，不等於反覆拿不定主意。" }
      }
    },
    "idiom-05": {
      pictureEn: "Lift your eyes from a small immediate task to a much wider goal.",
      boundaryEn: "It means being ambitious, not merely thinking carefully; ambition alone does not guarantee success.",
      whereEn: "Study plans, careers, community projects and creative work.",
      toneEn: "Positive and encouraging; it invites someone to aim beyond a small target.",
      formalEn: "For a very formal document, describe the large-scale plan directly.",
      movingEn: "Change think for the subject and tense: thinks, thought, thinking. Keep big unchanged.",
      checksEn: ["Is the goal more ambitious than the immediate task?", "Am I talking about ambition, not physical size?", "Did I change think correctly for the subject and tense?"],
      choices: {
        2: { promptEn: "Who is thinking big?", optionsEn: ["A student expands a class garden idea into a whole-school project.", "A student carefully measures a very large cardboard box.", "A student plans to finish one exercise today."], feedbackEn: "The idea grows from one class to an entire school." },
        3: { promptEn: "Which line uses think big to encourage ambition?", promptZh: "哪一句用 think big 鼓勵更遠大的目標？", optionsEn: ["Let's think big and invite the whole school to join our project.", "Think big about the size of this cardboard box.", "Think big, so we never need to make a plan."], options: ["讓我們放眼更大目標，邀請全校參與。", "把 big 誤解成紙箱的體積。", "以為目標大便毋須計劃。"], feedbackEn: "The first line expands the project's ambition without promising automatic success.", feedback: "第一句擴大項目抱負，但沒有保證一定成功。" },
        5: { promptEn: "A classmate wants to open the site to students across Hong Kong. What could you actually say?", promptZh: "同伴想把網站開放予全港學生，你可實際說哪一句？", optionsEn: ["You're thinking big by reaching students across Hong Kong. What's our first step?", "You're thinking big because the website icon is huge.", "Think big! That means we can skip the planning."], options: ["你想接觸全港學生，目標很大；第一步是甚麼？", "把目標大誤解為圖示體積大。", "以為放眼更大目標便不用計劃。"], feedbackEn: "The first line recognises the ambitious scale and moves toward a practical plan.", feedback: "第一句肯定宏大目標，再引出實際計劃。" },
        6: { promptEn: "Which use of think big mistakes physical size for ambition?", promptZh: "哪一句把物件體積誤當成抱負？", optionsEn: ["We should think big and extend the project to more schools.", "She thinks big by planning a community-wide campaign.", "He thinks big because he measures a huge cardboard box."], options: ["把項目擴展到更多學校。", "策劃遍及社區的活動。", "只因量度一個大紙箱，就說他有遠大抱負。"], feedbackEn: "Big describes the scale of an ambition, not the dimensions of a box.", feedback: "big 指抱負的規模，不是紙箱的尺寸。" }
      }
    }
  };
  for (const [id, copy] of Object.entries(english)) {
    const { choices, ...lessonCopy } = copy;
    Object.assign(lessons[id], lessonCopy);
    for (const [page, choiceCopy] of Object.entries(choices)) Object.assign(lessons[id].choices[page], choiceCopy);
  }
  const bonusPractice = {
    "idiom-01": [
      ["School debate", "The debate room is silent. Mia asks the first question, and classmates begin sharing ideas.", "Mia started the ball rolling by asking the first question in the debate."],
      ["Community", "Nobody has organised the neighbourhood clean-up yet. A volunteer arranges the first meeting.", "A volunteer started the ball rolling by arranging the first clean-up meeting."],
      ["Work", "The product team cannot move forward until someone proposes an initial design.", "Jules started the ball rolling with an initial design for the product team."],
      ["Technology", "A coding club has an idea for an app but no activity. Noor opens a shared project and invites contributors.", "Noor started the ball rolling by opening the club's shared app project."],
      ["Environment", "Residents want fewer disposable cups. A café agrees to run the first refill trial.", "The café started the ball rolling with the first refill trial."],
      ["Sport", "The school tournament has no teams yet. The captain invites the first group to register.", "The captain started the ball rolling by inviting the first team to register."],
      ["Health", "The class wants a wellbeing week. A student proposes the first workshop and others add ideas.", "A student started the ball rolling by proposing a wellbeing workshop."],
      ["Arts", "The theatre group has no script. Leila writes the opening scene so others can continue.", "Leila started the ball rolling by writing the opening scene."],
      ["Travel", "Friends keep discussing a trip but never plan it. Kai suggests dates and asks everyone to vote.", "Kai started the ball rolling by suggesting travel dates for everyone to vote on."],
      ["Family", "The family has postponed a reunion for months. An aunt books a venue and relatives begin planning.", "An aunt started the ball rolling by booking a venue for the family reunion."]
    ],
    "idiom-02": [
      ["School", "Your close friend is packing slowly, and the school bus leaves in one minute. What could you say?", "Shake a leg, Sam—the school bus leaves in one minute!"],
      ["Sport", "Your teammate knows you well. The match starts now, but they are still tying their shoes.", "Shake a leg, Lee—the match is starting!"],
      ["Travel", "Your sister is moving slowly toward the gate, and your train is about to depart.", "Shake a leg, Maya—our train is about to leave!"],
      ["Theatre", "A familiar castmate is late to the stage entrance, and the curtain rises in seconds.", "Shake a leg, Alex—the curtain is about to rise!"],
      ["Family", "Your brother has not put on his coat, and the family taxi is already waiting.", "Shake a leg, Ben—the taxi is waiting outside!"],
      ["Volunteering", "Your friend is still sorting supplies while the volunteer team is ready to set off.", "Shake a leg, Jo—the volunteer team is ready to leave!"],
      ["Music", "A bandmate is chatting backstage just as the group is called onstage.", "Shake a leg, Finn—we're onstage next!"],
      ["Cinema", "Your best friend is choosing snacks, and the film begins in two minutes.", "Shake a leg, Ruby—the film begins in two minutes!"],
      ["Hiking", "Your hiking partner knows you well, and the last shuttle leaves shortly.", "Shake a leg, Pat—the last shuttle leaves soon!"],
      ["Club event", "Your close clubmate is still decorating while guests are already arriving.", "Shake a leg, Eli—the guests are arriving now!"]
    ],
    "idiom-03": [
      ["New job", "A new nurse joins the ward and solves a scheduling problem on her first morning.", "The new nurse hit the ground running by fixing the rota on her first morning."],
      ["School", "On his first day at a new school, Amir organises the class project and contributes useful ideas.", "Amir hit the ground running in his new class by organising the project on day one."],
      ["Technology", "A new developer fixes a major bug on the first day of the app project.", "The new developer hit the ground running by fixing a major bug on day one."],
      ["Sport", "The newly appointed coach improves the team's training plan in the first week.", "The new coach hit the ground running by improving the training plan immediately."],
      ["Community", "A new volunteer coordinates a food delivery on her first shift.", "The new volunteer hit the ground running by coordinating a delivery on her first shift."],
      ["Science", "A researcher joins a lab and produces useful results in the first week.", "The researcher hit the ground running and produced useful results in the first week."],
      ["Business", "A new manager identifies a bottleneck and removes it before the end of day one.", "The new manager hit the ground running by removing a bottleneck on day one."],
      ["Arts", "A dancer joins a production and learns the choreography quickly enough to improve rehearsals immediately.", "The new dancer hit the ground running and strengthened rehearsals from the start."],
      ["Environment", "On its launch day, a new recycling team collects and sorts the first batch efficiently.", "The recycling team hit the ground running on launch day by sorting its first batch efficiently."],
      ["Publishing", "A new editor starts on Monday and helps publish a corrected article that afternoon.", "The new editor hit the ground running by publishing a corrected article that afternoon."]
    ],
    "idiom-04": [
      ["School event", "The committee changes the concert date four times, so students cannot plan.", "The committee keeps chopping and changing the concert date."],
      ["Travel", "The friends switch hotels repeatedly and cannot finish their itinerary.", "The friends keep chopping and changing their hotel plans."],
      ["Work", "A manager changes the project brief every day, leaving the team confused.", "The manager keeps chopping and changing the project brief."],
      ["Technology", "The app team changes its design again and again instead of settling on one version.", "The app team keeps chopping and changing its design."],
      ["Sport", "The coach changes the starting line-up several times before every match.", "The coach keeps chopping and changing the starting line-up."],
      ["Family", "The family repeatedly switches between two reunion venues, making invitations difficult.", "The family keeps chopping and changing the reunion venue."],
      ["Arts", "The director repeatedly rewrites the ending, and actors cannot rehearse it properly.", "The director keeps chopping and changing the ending."],
      ["Community", "Organisers keep revising the market opening time, confusing stallholders.", "The organisers keep chopping and changing the market opening time."],
      ["Education", "The club repeatedly changes its lesson timetable, and parents struggle to keep up.", "The club keeps chopping and changing its lesson timetable."],
      ["Environment", "The council switches the recycling collection day back and forth each week.", "The council keeps chopping and changing the recycling collection day."]
    ],
    "idiom-05": [
      ["School", "A student wants to turn one classroom reading shelf into a library for the whole school.", "The student is thinking big by planning a library for the whole school."],
      ["Community", "A small food drive grows into a city-wide plan to reduce waste.", "The volunteers are thinking big with a city-wide food rescue plan."],
      ["Technology", "A coding club wants its accessibility app to help users across Hong Kong.", "The coding club is thinking big by designing an app for users across Hong Kong."],
      ["Environment", "A class proposes expanding its garden project to every school in the district.", "The class is thinking big by proposing gardens for every school in the district."],
      ["Sport", "A young athlete wants to build a free training programme for children across the region.", "The athlete is thinking big with a regional training programme for children."],
      ["Arts", "A local theatre group hopes to tour its play around the world.", "The theatre group is thinking big by planning an international tour."],
      ["Health", "A clinic hopes to extend its wellbeing lessons from one neighbourhood to the whole city.", "The clinic is thinking big by planning city-wide wellbeing lessons."],
      ["Business", "A small bakery wants to deliver affordable food to communities across the territory.", "The bakery is thinking big with a territory-wide delivery plan."],
      ["Science", "A student designs a water filter and hopes to make it available to remote villages.", "The student is thinking big by aiming to bring the filter to remote villages."],
      ["Travel", "A local guide wants to create accessible walking tours in every major city.", "The guide is thinking big by planning accessible tours in many cities."]
    ]
  };
  for (const [id, questions] of Object.entries(bonusPractice)) {
    lessons[id].bonusPractice = questions.map(([theme, prompt, answer], index) => ({
      id: `${id}-bonus-${String(index + 1).padStart(2, "0")}`,
      theme, prompt, answer, number: 51 + index, bonus: true
    }));
  }

  window.EDMUND_IDIOM_COMPASS = Object.freeze(lessons);
})();

(function registerDseListening2023() {
  "use strict";

  const task = (number, marks, title, instruction, blocks) => Object.freeze({
    number,
    marks,
    title,
    instruction,
    blocks: Object.freeze(blocks)
  });

  const template = (html) => Object.freeze({ type: "template", html });
  const heading = (text) => Object.freeze({ type: "heading", text });
  const image = (src, alt, caption = "") => Object.freeze({ type: "image", src, alt, caption });
  const multipleChoice = (number, prompt, options) => Object.freeze({ type: "multiple-choice", number, prompt, options: Object.freeze(options) });
  const eventTable = (rows) => Object.freeze({ type: "event-table", rows: Object.freeze(rows) });
  const concernTable = (rows) => Object.freeze({ type: "concern-table", rows: Object.freeze(rows) });
  const transcript = (source) => Object.freeze(source.trim().split("\n").map((line) => {
    const [start, speaker, ...copy] = line.split("|");
    return Object.freeze({ start: Number(start), speaker, text: copy.join("|") });
  }));

  window.EDMUND_DSE_LISTENING_2023 = Object.freeze({
    version: 1,
    year: 2023,
    questionCount: 53,
    situation: "You are listening to a YouTube Channel called Extraordinary Hong Kong People hosted by YouTuber sisters Monica and Candice Cheung. On their YouTube channel they investigate Hong Kongers who have made an impact in the world in unusual ways.",
    situationZh: "你正在收聽由 YouTuber 姊妹 Monica 和 Candice Cheung 主持的 YouTube 頻道 Extraordinary Hong Kong People。她們會訪問以非一般方式在世界上帶來影響的香港人。",
    instructions: "In Part A, you will have a total of four tasks to do. Follow the instructions in the Question-Answer Book and in the recording to complete the tasks. You will find all the information you need in the Question-Answer Book and the recording.",
    instructionsZh: "在甲部，你需要完成四項任務。請按照答題簿及錄音中的指示完成各項任務；所需資料均可在答題簿及錄音中找到。",
    familiarisation: "You now have two minutes to familiarise yourself with Tasks 1–4.",
    familiarisationZh: "你現在有兩分鐘時間熟習任務 1 至 4。",
    tasks: Object.freeze([
      task(1, 13, "An extraordinary career and life story", "Candice and Monica are interviewing their first guest about her life story and career. Listen and write the information in the spaces below. The first one has been provided as an example.", [
        template("<p><strong>What is the name of the show?</strong> <span class=\"dse-example-answer\">Extraordinary Hong Kong People (example)</span></p>"),
        template("<p>Who is their guest? {{1}}</p>"),
        template("<p>Which year did she move to Hong Kong? {{2}}</p>"),
        template("<p>Which part of Hong Kong did her family move to? {{3}}</p>"),
        multipleChoice(4, "What was her father's job?", ["Air Traffic Controller", "Rescue Plane Navigator", "Airport Security Officer", "Jet Pilot Instructor"]),
        template("<p>What type of aircraft does she fly? {{5}}</p>"),
        heading("Why did she choose to fly that kind of aircraft? (Give TWO reasons)"),
        template("<p>{{6}}</p><p>{{7}}</p>"),
        heading("Story of how she met her husband"),
        template("<p>He was a {{8}} of a cargo ship. One day, when he was sailing in the Lamma Channel, he broke his {{9}} when he {{10}}.</p>"),
        template("<p>She then flew him to {{11}}.</p>"),
        template("<p>What kind of club did they meet at one year later? {{12}}</p>"),
        template("<p>Where did she ask him out for a date? {{13}}</p>")
      ]),
      task(2, 13, "Marble racing and the Marble Olympics", "Candice is chatting to Ranbir Singh about marble racing, a pastime gaining popularity in Hong Kong. Listen and fill in the missing information in the spaces below. One has been provided as an example.", [
        image("assets/dse-listening/2023/task-2-marble-racing.jpg", "Teams line up for a marble racing event", "Teams line up for a marble racing event"),
        template("<p><strong>Marbles are</strong> <span class=\"dse-example-answer\">little glass balls that children play with (example)</span></p>"),
        heading("History of Lars Jensen"),
        template("<div class=\"dse-timeline-row\"><strong>2011</strong><p>Started building marble race tracks {{14}}, which became crowded.</p></div>"),
        template("<div class=\"dse-timeline-row\"><strong>2013</strong><p>Started {{15}} of marble racing.<br>The races were {{16}} but {{17}}.</p></div>"),
        template("<div class=\"dse-timeline-row\"><strong>2016</strong><p>Began the Marble Olympics and invited {{18}} to join.</p></div>"),
        heading("Marble Olympic events"),
        eventTable([
          { event: "Relay Race", image: "assets/dse-listening/2023/task-2-relay.jpg", alt: "Relay race human version", copy: "The marble hits a {{19}} and the {{20}} of the marble pushes the next marble forward." },
          { event: "High Jump", image: "assets/dse-listening/2023/task-2-high-jump.jpg", alt: "High jump human version", copy: "The marble rolls down a {{21}} to build up enough speed to fly over a {{22}}." },
          { event: "Outdoor Marathon", image: "assets/dse-listening/2023/task-2-marathon.jpg", alt: "Outdoor marathon human version", copy: "The track is made of {{23}} with carefully placed {{24}}." }
        ]),
        heading("Marbles and the future"),
        template("<p>Ranbir's plan for next year is to {{25}} to the Tokyo Marble Olympics.</p>"),
        template("<p>In the future, Ranbir thinks marble technology will {{26}}.</p>")
      ]),
      task(3, 14, "Mr Suess, the Internet cat influencer", "Monica is hosting a discussion on a cat called Mr Suess, who has become a popular Internet influencer. With Monica are Estella Webber, owner of the cat, and Max Hui, chair of the Hong Kong Cat Shelter. Listen to the conversation and make notes in the notesheet below. You do not need to answer in complete sentences.", [
        image("assets/dse-listening/2023/task-3-mr-suess.jpg", "Mr Suess", "Mr Suess"),
        heading("Facts about Mr Suess"),
        template("<ul><li>Has {{27}} followers.</li><li>Is more influential than {{28}} according to {{29}}.</li></ul>"),
        heading("Things Mr Suess is famous for"),
        template("<p>{{30}}</p><p>{{31}}</p><p>{{32}}</p>"),
        heading("Methods used by Estella to train her cat"),
        template("<ul><li>Places the food treat where she {{33}}.</li><li>Repeats the action but {{34}}, because {{35}}.</li></ul>"),
        heading("Reasons why cat videos are more popular than dog videos on YouTube"),
        template("<p>{{36}}</p><p>{{37}}</p>"),
        heading("Benefits of Internet cat influencers"),
        template("<p>{{38}}</p><p>{{39}}</p>"),
        heading("Concern about Internet cat influencers"),
        template("<p>{{40}}</p>")
      ]),
      task(4, 13, "Emojis as the new language of the Internet", "Candice and Monica have made a short documentary about the development of emojis as the new language of the Internet. Listen to the conversation and answer the questions below. You do not need to answer in complete sentences.", [
        heading("History and background of emojis"),
        image("assets/dse-listening/2023/task-4-emoji-pioneers.jpg", "Vladimir Nabokov and Shigetaka Kurita", "Vladimir Nabokov · Shigetaka Kurita"),
        template("<p>What did Vladimir Nabokov do in the 1950s which is similar to how we use emojis now? {{41}}</p>"),
        template("<p>What is Shigetaka Kurita's contribution to the development of emojis? {{42}}</p>"),
        template("<p>What is the current definition of an emoji? {{43}}</p>"),
        template("<p>What is currently not considered an emoji? {{44}}</p>"),
        heading("Interesting facts about a popular emoji"),
        image("assets/dse-listening/2023/task-4-kiss-emoji.jpg", "Face blowing a kiss emoji"),
        template("<p><strong>What's the difference in how teenagers and married couples use this emoji?</strong></p><p>Teenagers: {{45}}</p><p>Married couples: {{46}}</p>"),
        heading("Background on The World Committee for Emojis"),
        template("<p><strong>What are the two main functions of the committee?</strong></p><p>Main Function I: {{47}}</p><p>Main Function II: {{48}}</p>"),
        heading("Concerns about The World Committee for Emojis"),
        concernTable([
          { concern: "{{49}}", consequence: "{{50}}" },
          { concern: "Committee is made up of middle-aged white men", consequence: "{{51}}" },
          { concern: "{{52}}", consequence: "{{53}}" }
        ])
      ])
    ]),
    transcript: window.EDMUND_DSE_LISTENING_2023_TRANSCRIPT || Object.freeze({
      partA: Object.freeze({
        1: transcript(`
0.00|Exam Narrator|Task 1. Candice and Monica are interviewing their first guest about her life story and career. Listen and write the information in the spaces below. The first one has been provided as an example.
75.43|Candice and Monica|And our extraordinary guest today is—drum roll, please—our extraordinary mother. Hello, Mum!
86.10|Hannah Cheung|Oh my, you two are really putting on a show. Hello to all your viewers.
95.40|Monica|Now, Mum, you have had an extraordinary career, but before we get to that, let's find out about your life. First of all, when did you come to Hong Kong?
107.51|Hannah Cheung|I was born in Guangzhou—but I'm not saying when—and we moved to Hong Kong three years before they started work on Chek Lap Kok Airport.
123.25|Candice|Didn't they begin building the airport in 1991? So, three years before then?
129.67|Hannah Cheung|Yes, 1988. That was a long time ago. I was a young girl. My father, your Grandpa Choi, moved us to East Point in Hong Kong.
148.97|Monica|I remember him giving us tours of the air traffic control tower when we were little. It was so exciting.
160.99|Hannah Cheung|That's what I thought too when I was a girl, and that's when I fell in love with flying.
168.33|Candice|And yet you did not follow in Grandpa's footsteps and become an air traffic controller.
176.23|Hannah Cheung|No. I wanted to fly, but I wasn't interested in planes, jets or airliners. As far back as I can remember, I always wanted to be a helicopter pilot.
184.38|Monica|But why did you want to be a helicopter pilot specifically? What's the appeal?
191.56|Hannah Cheung|First of all, I love the noise helicopters make. It's so powerful. The other thing is being able to land anywhere. I still think it's amazing.
217.65|Candice|But you're not just a regular helicopter pilot; you're a rescue helicopter pilot. Which brings us to your extraordinary story—how you and Dad met is very romantic.
237.16|Hannah Cheung|I rescued your father in my helicopter. He was the captain of one of those huge cargo ships. He was sailing in the Lamma Channel when he broke his ankle.
252.76|Monica|How did he break his ankle? Was it in a terrible storm? Did the ship sink?
257.48|Hannah Cheung|Oh, stop it, you two. You know perfectly well what happened. He fell down some stairs on the ship.
279.48|Candice|Did you meet him then, when you were flying him to hospital?
284.04|Hannah Cheung|Of course not. I only saw him then; I didn't speak to him. I was flying the helicopter. Besides, that would be completely unprofessional.
299.32|Hannah Cheung|It was about a year after I rescued him when I first spoke to him. I joined a rock-climbing club, and your father and I were in the same group of beginners.
314.52|Monica|So what happened? Did you rescue him again at the rock-climbing club?
321.02|Hannah Cheung|No, we were both good at rock climbing. When I told him I flew rescue helicopters, he told me about his accident and we quickly put two and two together.
336.18|Hannah Cheung|It wasn't love at first sight. He was so shy back then. A few months after joining the club, I asked him out on a date—when we were on top of a cliff.
354.02|Hannah Cheung|I'm not sure if he looked nervous because I asked him out, or because we were on top of a cliff. But he said yes.
364.14|Exam Narrator|That is the end of Task 1.`),
        2: transcript(`
0.00|Exam Narrator|Task 2. Candice is chatting to Ranbir Singh about marble racing, a pastime gaining popularity in Hong Kong.
67.97|Candice|Today we have Ranbir Singh, whose marble-racing competitions on YouTube have become an Internet sensation in Hong Kong, with millions of views. Welcome, Ranbir. What's the history? What's this all about?
86.43|Ranbir Singh|I'm sure your viewers know what marbles are—those little glass balls that children play with. What they may not know is that you can race marbles and hold all sorts of competitions.
109.00|Ranbir Singh|The story begins with Lars Jensen from the Netherlands. In 2011, he made different marble race tracks in his bedroom. In 2013, he started making YouTube videos. The races were very simple, but still fun to watch.
169.13|Ranbir Singh|In 2016, Lars founded the Marble Olympics and invited teams from fifteen other countries to take part in different events.
190.99|Candice|Can you tell us more about some of those events?
194.31|Ranbir Singh|One of the most popular events is the relay race. The first marble rolls down a track until it hits a gate. The gate stops it, but the force of the marble knocks the next marble forward.
248.44|Ranbir Singh|In the high jump, a pole is placed at different heights. The marble gets its jumping power from rolling down a slope, building up speed to fly over the pole.
279.12|Ranbir Singh|My favourite event is the outdoor marathon. Marbles roll down a course cut into sand, usually on a beach, with sticks and stones placed as obstacles.
316.90|Candice|So, what's the future for marble racing?
320.63|Ranbir Singh|Marble racing became especially popular during the pandemic. Next year the Marble Olympics will be held in Tokyo, and I plan to take a Hong Kong team there.
344.25|Ranbir Singh|With international teams joining, I predict that marble technology will become much more advanced.
370.17|Exam Narrator|That is the end of Task 2.`),
        3: transcript(`
0.00|Exam Narrator|Task 3. Monica is hosting a discussion on Mr Suess, a cat who has become a popular Internet influencer. Her guests are Estella Webber, owner of the cat, and Max Hui, chair of the Hong Kong Cat Shelter.
76.96|Monica|Welcome, Estella, and Internet sensation Mr Suess. And welcome, Max, from the Hong Kong Cat Shelter.
82.02|Estella Webber|Say hello, Mr Suess. Look, he's smiling. He says he loves your show.
97.84|Max Hui|Nice to meet you, Monica, Estella and Mr Suess.
100.04|Monica|I don't think we've ever had as big a star as Mr Suess on our show. He has 4.1 million followers on YouTube.
117.86|Estella Webber|4.12 million as of yesterday, actually. More people watch Mr Suess than watch the TV news every day.
149.28|Monica|He's cute, but how come he's such a huge success?
154.52|Estella Webber|Mr Suess is famous for three things. He loves dressing up as superheroes; he plays the piano; and he opens gifts that people send him from all over the world.
223.47|Monica|How do you train Mr Suess to do things for these videos? Aren't cats difficult to train?
231.98|Estella Webber|I place food rewards where I want him to go. I also repeat the action I want him to perform, but I keep each session short because cats have a very short attention span.
271.67|Monica|Max, your research shows that cat videos are much more popular than dog videos on YouTube. Why is that?
296.68|Max Hui|People prefer cat videos for two reasons. Cats have lives that are more mysterious than dogs, and cat behaviour is less predictable.
308.22|Estella Webber|Mr Suess's life is a complete mystery to me. I have cameras all over the house, but even then he disappears. He's a real man of mystery.
348.43|Monica|Max, you have expressed concern about owners who use their cats for monetary gain on the Internet.
358.01|Max Hui|Internet cat influencers create positive feelings in viewers. They are also linked to people adopting stray cats. These are good things.
397.49|Max Hui|Our main concern is owners who abandon their cats once the cat stops being popular or making money.
406.98|Estella Webber|I would never abandon Mr Suess. Even if he became unpopular, I would always keep him.
424.23|Exam Narrator|That is the end of Task 3.`),
        4: transcript(`
0.00|Exam Narrator|Task 4. Candice and Monica have made a short documentary about the development of emojis as the new language of the Internet.
69.18|Candice and Monica|The emoji: where do they come from? What fun facts can we learn about them? Do they have a dark side? Let's ask an expert.
80.35|Dr Antoni Badura|Hi there. I'm Dr Antoni Badura, professor of computer science at the University of Hong Kong and a member of the World Committee for Emojis.
93.41|Dr Antoni Badura|The first person to insert something like an emoji into writing might be Vladimir Nabokov. In the 1950s, he used brackets in his correspondence to indicate that he was happy.
124.43|Dr Antoni Badura|Shigetaka Kurita made the biggest contribution to modern emojis. In the 1990s, while working for a mobile-phone company, he created the first complete collection of emojis.
153.75|Dr Antoni Badura|An emoji is a picture used in texting to convey an emotion or idea. It must currently be a drawn picture, not a photograph.
193.75|Dr Antoni Badura|The face blowing a kiss is most often used by teenagers who are flirting and by married couples showing affection.
233.00|Dr Antoni Badura|The World Committee for Emojis decides which emojis will be created and standardises their codes so different communication technologies understand which emoji is being sent.
284.79|Dr Antoni Badura|One concern is that the committee has too much control, which limits emotional expression. Another is that it consists of middle-aged white men and does not represent the cultures and communities that use the Internet.
362.40|Dr Antoni Badura|My third concern is that the committee's work is not public enough. Without openness, people may become suspicious and think the committee is secretive and beyond scrutiny.
389.45|Dr Antoni Badura|That's it from me. I hope you found my guide to the world of emojis interesting.`)
      }),
      partB: transcript(`
0.00|Exam Narrator|Part B. Nico Lin works at Teen Net Chef TV and assists Archie Lee. Listen to a meeting between Winnie Tang, Dante Cruz and Archie Lee, and take notes under the appropriate headings.
412.84|Exam Narrator|The recording is about to begin. Turn to page three of the Data File.
426.96|Winnie Tang|Thanks for joining us today.
428.88|Dante Cruz|Hi, good to see you.
431.36|Archie Lee|Hi, can you hear me? Sometimes this microphone doesn't work.
435.46|Dante Cruz|Yes, we can hear you, Archie.
437.88|Winnie Tang|There's a lot to get through. Archie, can you take notes? First, we need to discuss Live Studio Cook and what's going on with William Puddle.
453.22|Dante Cruz|Things aren't going well with William, I hear.
456.18|Winnie Tang|I'm afraid not. Let's talk about Live Studio Cook first. The big news is that we've got the money for ten episodes.
470.26|Dante Cruz|Ten episodes? Great! I thought we could only have eight.
472.86|Winnie Tang|That's been changed to ten. We checked with the finance department.
477.56|Archie Lee|And when will filming start?
480.18|Winnie Tang|We hoped to start in July, but with the summer holidays that won't happen, so we've pushed it back to October.
491.06|Archie Lee|October—good idea. It'll be much more comfortable then.
498.38|Dante Cruz|Have you decided what kind of food they should cook in this series?
505.08|Winnie Tang|We first thought about breakfast foods, but they're probably too easy. We're now going with main dishes, such as soup, chicken and roast vegetables. The other option is desserts—cakes, ice cream, biscuits, anything sweet.
540.98|Dante Cruz|Let's discuss this viral video with William Puddle. What were the problems?
548.40|Winnie Tang|It's all here in this tabloid story: “Flood in the kitchen.” There may also have been food-safety issues, but we think it was all a misunderstanding.
568.04|Dante Cruz|This is our star chef. We've just signed off on a huge budget for his new show. This is not good news.
580.58|Archie Lee|People are also saying he was very upset in the video, right?
582.69|Winnie Tang|He wasn't upset. He was chopping onions—that's why he was crying. The whole video was about cooking with onions.
592.60|Dante Cruz|And look—my name is right there at the bottom. This is embarrassing.
600.03|Winnie Tang|I think all staff should be asked to take a social-media training course about behaving properly online and avoiding things that people may misinterpret.
621.52|Archie Lee|So, how not to offend people—that kind of thing.
629.04|Dante Cruz|I could include that in my all-staff email this week, but we need to sweeten the deal to keep everybody happy.
638.62|Archie Lee|How about an extra day of leave?
641.24|Dante Cruz|An extra day off work—but not for everyone. Only the first ten people who complete three courses should receive it.
674.14|Dante Cruz|Anything else we need to discuss?
684.50|Winnie Tang|There were some issues at Golden Sun Tower. We need to do something about the little fire problem the last time we used the private kitchen there.
700.26|Dante Cruz|A fire? Why am I only hearing about this now? First a flood, and now a fire?
708.02|Winnie Tang|It wasn't really a fire—just a piece of burnt toast. But the kitchen owner complained that our staff didn't know what to do when it started.
733.05|Dante Cruz|Then our chefs need fire-safety training.
740.95|Winnie Tang|We'll work out a schedule. There's another problem regarding costs: the private kitchen wants money because it cannot serve diners while we're filming.
760.75|Dante Cruz|How much do they want?
761.47|Winnie Tang|Ten thousand dollars.
762.87|Dante Cruz|Ten thousand dollars? That's absurd. Absolutely not. Five thousand—they can take it or leave it.
773.10|Archie Lee|Five thousand for the private kitchen. I'll make a note of that.
779.61|Dante Cruz|Now, something happier. I have news about the new show. It's called Viewer's Choice.
793.03|Winnie Tang|What's so amazing about it?
794.95|Dante Cruz|It's interactive. Viewers choose ingredients and decide what William cooks live on the show. It'll be the first fully interactive online TV cooking show.
808.83|Archie Lee|Interactive? How on earth will that work?
813.91|Dante Cruz|We'll send you the details. There's a storyboard and I've added some updates.
817.29|Winnie Tang|Is any of it recorded?
819.73|Dante Cruz|No, it's totally live, and it's going to change the face of TV cooking forever.
827.91|Archie Lee|But so many things could go wrong. We can't let William ruin his career again.
833.35|Dante Cruz|Think of how many things could go right. It's a guaranteed winner.
840.98|Exam Narrator|That is the end of the listening component of this paper.`)
    })
  });
})();

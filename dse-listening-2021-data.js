(function registerDseListening2021() {
  "use strict";

  const task = (number, marks, title, instruction, blocks) => Object.freeze({
    number, marks, title, instruction, blocks: Object.freeze(blocks)
  });
  const template = (html) => Object.freeze({ type: "template", html });
  const heading = (text) => Object.freeze({ type: "heading", text });
  const image = (src, alt, caption = "") => Object.freeze({ type: "image", src, alt, caption });

  window.EDMUND_DSE_LISTENING_2021 = Object.freeze({
    version: 1,
    year: 2021,
    questionCount: 56,
    situation: "Bonnie, Cherie and Julian are student interns working for a company called Events Horizon, which organises big public events. Their boss Jasmine Ko has asked them to research World Expos for the company.",
    situationZh: "Bonnie、Cherie 和 Julian 是 Events Horizon 的實習生。該公司負責籌辦大型公眾活動；他們的上司 Jasmine Ko 要求他們為公司研究世界博覽會。",
    instructions: "In Part A, you will have a total of four tasks to do. Follow the instructions in the Question-Answer Book and in the recording to complete the tasks. You will find all the information you need in the Question-Answer Book and the recording.",
    instructionsZh: "在甲部，你需要完成四項任務。請按照答題簿及錄音中的指示完成各項任務；所需資料均可在答題簿及錄音中找到。",
    familiarisation: "You now have two minutes to familiarise yourself with Tasks 1-4.",
    familiarisationZh: "你現在有兩分鐘時間熟習任務 1 至 4。",
    partBDescription: "You are Nico Lin and work for Events Horizon. You are helping to organise the Victoria Cup, a professional women's tennis tournament. The recording includes the five-minute familiarisation period and a Zoom meeting between tennis star Lara Terranova, her agent Victor Laurent and Anthony Au of Events Horizon.",
    partBDescriptionZh: "你是 Events Horizon 的員工 Nico Lin，並協助籌辦職業女子網球賽 Victoria Cup。錄音包括五分鐘熟習題目時間，以及網球手 Lara Terranova、其經理人 Victor Laurent 與 Events Horizon 的 Anthony Au 之間的 Zoom 會議。",
    partBDuration: "14:10",
    tasks: Object.freeze([
      task(1, 16, "World Expos presentation work schedule", "Bonnie, Cherie and Julian are discussing a work schedule to carry out the research on World Expos. Listen to the conversation and complete the notesheet below. The first one has been provided as an example.", [
        heading("Presentation details"),
        template("<p><strong>Presentation title:</strong> <span class=\"dse-example-answer\">An overview of World Expos (example)</span></p><p><strong>Date:</strong> {{1}} &nbsp; <strong>Time:</strong> {{2}}</p><p><strong>Audience:</strong> {{3}}</p><p><strong>Venue:</strong> {{4}}</p><p><strong>Length:</strong> {{5}}</p>"),
        heading("Areas to be covered"),
        template("<p><strong>Bonnie:</strong> {{6}} of World Expos</p><p><strong>Julian:</strong> {{7}} about World Expos</p><p><strong>Cherie:</strong> {{8}} of World Expos</p>"),
        heading("Work schedule"),
        template("<div class=\"dse-note-table\"><p><strong>Date / Person / What to do</strong></p><p>{{9}} / Julian / {{10}}</p><p>August 19 / Bonnie / {{11}} at Hong Kong Metropolitan University</p><p>{{12}} / All / Progress meeting</p><p>August 23 / {{13}} / Give Jasmine {{14}}</p><p>August 26 / {{15}} / {{16}}</p></div>")
      ]),
      task(2, 15, "A history of World Expos", "You are attending a lecture by Professor Leung, who is going to talk about the history of World Expos. Listen and fill in the missing information in the space below. One has been provided as an example.", [
        template("<p><strong>Topic: A History of World Expos:</strong> {{17}}</p><p><strong>Definition of World Expos:</strong> <span class=\"dse-example-answer\">international exhibitions (example)</span></p>"),
        heading("Roles of host countries"),
        template("<p>{{18}}</p><p>{{19}}</p>"),
        heading("Stage 1: Industrial and Technological Inventions - Period: 1851-1938"),
        template("<p><strong>London Expo: The Great Exhibition</strong></p><p>Number of visitors: {{20}}</p><p><strong>Major achievements of this Expo:</strong></p><p>{{21}}</p><p>{{22}}</p>"),
        heading("Stage 2"),
        template("<p><strong>Stage:</strong> {{23}} &nbsp; <strong>Period:</strong> {{24}}</p><p><strong>New York Expo theme:</strong> {{25}}</p><p><strong>Examples of exhibits:</strong> {{26}}</p><p>{{27}}</p><p><strong>Number of countries which took part:</strong> {{28}}</p>"),
        heading("Stage 3: Nation Branding"),
        template("<p><strong>Period:</strong> {{29}}</p><p><strong>Hanover Expo theme:</strong> {{30}}</p><p><strong>Reason why considered not to be a success:</strong></p><p>{{31}}</p>")
      ]),
      task(3, 12, "Feedback on the presentation slides", "Cherie has just shown Bonnie and Julian a draft of her PowerPoint slides for the presentation. Bonnie and Julian are now giving her some feedback. Listen to the conversation and make notes in the notesheet below. One has been provided as an example.", [
        heading("Suggested additional PowerPoint slides - Downsides of having an Expo"),
        template("<p>• {{32}}</p><p>• {{33}}</p><p>• {{34}}</p>"),
        heading("Why countries want to hold an Expo"),
        template("<p>• To promote {{35}}</p><p>• To build up <span class=\"dse-example-answer\">the national image (example)</span></p><p>• To attract {{36}}</p>"),
        heading("Suggestions for the layout of PowerPoint slides"),
        template("<p>{{37}}</p><p>{{38}}</p><p>{{39}}</p><p>{{40}}</p><p>{{41}}</p><p>{{42}}</p><p>{{43}}</p>")
      ]),
      task(4, 13, "Ota Benga and the darker history of World Expos", "Julian, Bonnie and Cherie have met up with their friend Leo at a cafe. They are talking about the group's presentation and World Expos. Listen to the conversation and answer the questions below. You do not need to answer in complete sentences. One has been provided as an example.", [
        image("assets/dse-listening/2021/ota-benga.jpg", "Ota Benga", "Ota Benga"),
        template("<p><strong>What, according to Leo, was the main function of World Expos for ordinary people?</strong></p><p>{{44}}</p>"),
        template("<p><strong>How many people were exhibited in human zoos in World Expos at the end of the 19th Century and the beginning of the 20th Century?</strong></p><p>{{45}}</p>"),
        heading("Name three activities that people exhibited in human zoos had to do"),
        template("<p><span class=\"dse-example-answer\">lived in traditional houses (example)</span></p><p>{{46}}</p><p>{{47}}</p>"),
        template("<p><strong>Why were Ota Benga and his tribespeople chosen by W. J. McGee for the St. Louis Expo of 1904?</strong></p><p>{{48}}</p>"),
        template("<p><strong>For what purpose did the pygmies think they were in the USA, and how did it contrast with the Expo's publicity?</strong></p><p>The pygmies thought {{49}}</p><p>but actually {{50}}</p>"),
        template("<p><strong>What was Ota Benga's job in the zoo in New York?</strong></p><p>{{51}}</p>"),
        template("<p><strong>How did the people of New York react?</strong></p><p>{{52}}</p>"),
        template("<p><strong>Did Ota Benga's story have a happy ending? Why / Why not?</strong></p><p>{{53}}</p>"),
        heading("Should Ota Benga's story be included in the presentation? Give each person's reason"),
        template("<p><strong>Bonnie:</strong> {{54}}</p><p><strong>Cherie:</strong> {{55}}</p><p><strong>Julian:</strong> {{56}}</p>")
      ])
    ]),
    transcript: window.EDMUND_DSE_LISTENING_2021_TRANSCRIPT || Object.freeze({ partA: Object.freeze({}), partB: Object.freeze([]) })
  });
})();

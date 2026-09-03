(function registerDseListening2016() {
  "use strict";

  const task = (number, marks, title, instruction, blocks) => Object.freeze({
    number, marks, title, instruction, blocks: Object.freeze(blocks)
  });
  const template = (html) => Object.freeze({ type: "template", html });
  const heading = (text) => Object.freeze({ type: "heading", text });
  const image = (src, alt, caption = "") => Object.freeze({ type: "image", src, alt, caption });
  const multipleChoice = (number, prompt, options) => Object.freeze({ type: "multiple-choice", number, prompt, options: Object.freeze(options) });
  const multipleSelect = (number, prompt, options) => Object.freeze({ type: "multiple-select", number, prompt, options: Object.freeze(options) });

  window.EDMUND_DSE_LISTENING_2016 = Object.freeze({
    version: 1,
    year: 2016,
    questionCount: 58,
    situation: "The Chau family is on holiday in London. You are going to listen to four recordings of the Chau family planning their holiday activities and visiting a museum.",
    situationZh: "Chau 一家正在倫敦度假。你將會聆聽四段錄音，內容是 Chau 一家策劃假期活動及參觀博物館。",
    instructions: "In Part A, you will have a total of four tasks to do. Follow the instructions in the Question-Answer Book and in the recording to complete the tasks. You will find all the information you need in the Question-Answer Book and the recording.",
    instructionsZh: "在甲部，你需要完成四項任務。請按照答題簿及錄音中的指示完成各項任務；所需資料均可在答題簿及錄音中找到。",
    familiarisation: "You now have two minutes to familiarise yourself with Tasks 1-4.",
    familiarisationZh: "你現在有兩分鐘時間熟習任務 1 至 4。",
    partBDescription: "The recording includes the five-minute familiarisation period and Patty Leung's interview with Dr Jack Jones of the Hong Kong Social History Museum.",
    partBDescriptionZh: "錄音包括五分鐘熟習題目時間，以及 Patty Leung 訪問香港社會歷史博物館 Dr Jack Jones 的完整內容。",
    partBDuration: "13:52",
    tasks: Object.freeze([
      task(1, 15, "Planning a family day in London", "The Chau family is searching on the internet and talking about things to do. Listen to their discussion and write the information in the spaces below. The first one has been provided as an example.", [
        heading("Name of Museum 1: The Video Games Museum"),
        template("<p><strong>Example Video Game 1</strong></p><p>Name: <span class=\"dse-example-answer\">Tennis for Two (example)</span> &nbsp; year: 1958</p>"),
        template("<p><strong>Example Video Game 2</strong></p><p>Name: {{1}} &nbsp; year: {{2}}</p>"),
        template("<p><strong>Example Video Game 3</strong></p><p>Name: {{3}} &nbsp; year: {{4}}</p>"),
        heading("Comments on visiting Museum 1"),
        template("<p>Reason for not going: {{5}}</p>"),
        heading("Name of Museum 2"),
        template("<p>Name of Museum 2: {{6}}</p><p>What you do in the museum: {{7}}</p>"),
        heading("Comments on visiting Museum 2"),
        template("<p>Reason 1 for not going: {{8}}</p><p>Reason 2 for not going: {{9}}</p>"),
        heading("Name of Museum 3: Museum of Youth Culture"),
        template("<p><strong>Exhibitions Angela wants to see (circle yes or no)</strong></p>"),
        multipleChoice(10, "Exhibition 1: Toy ponies", ["yes", "no"]),
        multipleChoice(11, "Exhibition 2: Boy bands", ["yes", "no"]),
        multipleChoice(12, "Exhibition 3: Children's fashion", ["yes", "no"]),
        heading("Comments on visiting Museum 3"),
        template("<p>Reason 1 for going: {{13}}</p><p>Reason 2 for going: {{14}}</p><p>Reason 3 for going: {{15}}</p>")
      ]),
      task(2, 16, "Teenagers, comics and best-selling toys", "The Chau family are in the museum. They are talking about what they have just seen. Listen and fill in the missing information in the spaces below. The first one has been provided as an example.", [
        template("<p><strong>Exhibition seen by Mr Chau and Angela:</strong> <span class=\"dse-example-answer\">Teenagers and Comics of the World (example)</span></p>"),
        heading("Comics for girls"),
        template("<p>Country: {{16}}</p><p><strong>Two main kinds of comics:</strong></p><p>{{17}} &nbsp; e.g. {{18}}</p><p>{{19}} &nbsp; e.g. {{20}}</p>"),
        heading("Comic books that Angela buys in Hong Kong"),
        template("<p>They are from a shop in {{21}}</p><p>Reason for going there: {{22}}</p><p>They are about {{23}}</p><p>e.g. {{24}}</p>"),
        heading("Exhibition seen by Mrs Chau: Best-selling toys from the past"),
        image("assets/dse-listening/2016/cabbage-patch-doll.jpg", "Cabbage Patch Doll", "Exhibit 1: Cabbage Patch Doll"),
        template("<p>Popular in the {{25}}</p><p><strong>Reasons for popularity:</strong></p><p>{{26}}</p><p>{{27}}</p>"),
        image("assets/dse-listening/2016/space-hopper.jpg", "Space Hopper", "Exhibit 2: Space Hopper"),
        template("<p>What it is: {{28}}</p><p>What you do with it: {{29}}</p><p><strong>Two more things you can do with a Space Hopper:</strong></p><p>{{30}}</p><p>{{31}}</p>")
      ]),
      task(3, 16, "Young Inventors", "The Chau family are looking at an exhibition in the museum called Young Inventors. A guide is showing them around this exhibition. Listen and fill in the missing information in the spaces below. The first one has been provided as an example.", [
        heading("Invention 1: Shoe battery charger"),
        template("<p><strong>Name of inventor:</strong> Juan Domingo</p>"),
        heading("Origin of the idea"),
        template("<p>The inventor walks <span class=\"dse-example-answer\">5 km to school every day (example)</span>.</p><p>He realized that this is {{32}}</p><p>The average person takes {{33}}</p>"),
        heading("How the invention works"),
        template("<ol class=\"dse-process-list\"><li>Step on the {{34}}</li><li>Footsteps generate {{35}}</li><li>This is converted to electricity.</li><li>Electricity is stored in batteries, which are attached to {{36}}</li></ol>"),
        heading("Examples of use"),
        template("<p>Ninety minutes of {{37}} = fifteen minutes of electricity for {{38}}</p><p>Another application of the shoes: {{39}}</p>"),
        multipleSelect(40, "Who thinks the invention is useful? (You can tick one or more options.)", ["Angela", "Mr Chau", "Mrs Chau"]),
        heading("Invention 2: Smelly Alarm Clock"),
        template("<p><strong>Name of inventor:</strong> Jean-Paul Moncoeur</p>"),
        heading("Origin of the idea"),
        template("<p>His father {{41}} the sound of an alarm clock and so {{42}}</p>"),
        heading("Further details"),
        template("<p>Smell that works best is {{43}}</p><p>The device {{44}} towards the person who is sleeping.</p><p>Most people wake up {{45}} and {{46}}</p>"),
        multipleSelect(47, "Who likes the invention? (You can tick one or more options.)", ["Angela", "Mr Chau", "Mrs Chau"])
      ]),
      task(4, 11, "James Dean and Rebel Without a Cause", "The Chau family are attending a lecture given by David Stott about movie stars that are popular with young people. Listen to the lecture and answer the questions below. You do not need to answer in complete sentences. The first one has been provided as an example.", [
        image("assets/dse-listening/2016/james-dean.jpg", "James Dean", "James Dean"),
        heading("If people have not seen a James Dean movie, in what three ways might people recognize him?"),
        template("<p><span class=\"dse-example-answer\">From a work of art (example)</span></p><p>{{48}}</p><p>{{49}}</p>"),
        heading("Give two reasons why he is still so famous."),
        template("<p>{{50}}</p><p>{{51}}</p>"),
        template("<p><strong>Why was he fired from his job as a stunt tester?</strong></p><p>{{52}}</p>"),
        template("<p><strong>What was special about the movie <em>Rebel Without a Cause</em>?</strong></p><p>{{53}}</p>"),
        template("<p><strong>Before <em>Rebel Without a Cause</em>, what kind of roles did young people have in movies?</strong></p><p>{{54}}</p>"),
        template("<p><strong>What was the purpose of having young people in movies before <em>Rebel Without a Cause</em>?</strong></p><p>{{55}}</p>"),
        heading("What three effects did Rebel Without a Cause have on the movie industry?"),
        template("<p>{{56}}</p><p>{{57}}</p><p>{{58}}</p>")
      ])
    ]),
    transcript: window.EDMUND_DSE_LISTENING_2016_TRANSCRIPT || Object.freeze({ partA: Object.freeze({}), partB: Object.freeze([]) })
  });
})();

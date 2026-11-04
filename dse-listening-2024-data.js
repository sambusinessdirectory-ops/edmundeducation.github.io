// Digitised from the supplied 2024 DSE Paper 3 Part A question paper.
(function(){"use strict";
const data={
  "version": 2,
  "year": 2024,
  "questionCount": 53,
  "situation": "In Part A, you will have a total of four tasks to do related to the theme of human migration.",
  "situationZh": "在甲部，你需要完成四項與人類遷徙主題有關的任務。",
  "instructions": "Follow the instructions in the Question-Answer Book and in the recording to complete the tasks. You will find all the information you need in the Question-Answer Book and the recording.",
  "instructionsZh": "請按照答題簿及錄音中的指示完成各項任務；所需資料均可在答題簿及錄音中找到。",
  "familiarisation": "You now have two minutes to familiarise yourself with Tasks 1–4.",
  "familiarisationZh": "你現在有兩分鐘時間熟習任務 1 至 4。",
  "tasks": [
    {
      "number": 1,
      "marks": 12,
      "title": "The Great Human Migration",
      "instruction": "Grace and Stephen are visiting a museum to decide which exhibitions they can recommend for their school history field trip. Listen to their conversation and complete the information in the spaces below.",
      "blocks": [
        {
          "type": "template",
          "html": "<p>Exhibition they visit: <span class=\"dse-example-answer\">The Great Human Migration (example)</span></p><p>Date exhibition will end: {{1}}</p><p>Cost to enter the exhibition: {{2}}</p><p>Day of the week it is closed: {{3}}</p><p>What you are not allowed to do in the exhibition: {{4}}</p>"
        },
        {
          "type": "heading",
          "text": "Location of exhibition"
        },
        {
          "type": "template",
          "html": "<div class=\"dse-2024-map\" role=\"img\" aria-label=\"Museum plan showing locations A to D\"><span>C</span><span>Early Transportation Exhibition</span><span>D</span><span class=\"wide\">Great Hall</span><span>Egyptian Room</span><span>A</span><span>B</span></div><p>(5) Where is the Great Human Migration Exhibition? {{5|A|B|C|D}}</p>"
        },
        {
          "type": "template",
          "html": "<p>When humans left Africa: {{6}}</p><div class=\"listening-table-wrap\"><table class=\"dse-native-table\"><caption>Where humans went after Asia</caption><thead><tr><th>Destination</th><th>Means of transport</th><th>Route of travel</th></tr></thead><tbody><tr><th>Australia</th><td>{{7}}</td><td>{{9}}</td></tr><tr><th>America</th><td>{{8}}</td><td>land bridge</td></tr></tbody></table></div><p>Two possible reasons for migrating:</p><p>{{10}}</p><p>{{11}}</p>"
        },
        {
          "type": "multiple-select",
          "number": 12,
          "prompt": "Things that they learnt to do as they reached new environments — Tick FOUR",
          "options": [
            "Use a compass",
            "Use money",
            "Grow food",
            "Make clothes",
            "Make fire",
            "Swim",
            "Build houses",
            "Make weapons"
          ],
          "limit": 4
        }
      ]
    },
    {
      "number": 2,
      "marks": 14,
      "title": "The Paqua Monna expedition",
      "instruction": "Listen to a lecture from Professor Elsa Larssen, an expert in human migration, on a famous expedition. Complete the information in the spaces below.",
      "blocks": [
        {
          "type": "template",
          "html": "<p>Name of lecture series: <span class=\"dse-example-answer\">Museum Experiences (example)</span></p><p>Topic of the lecture: The {{13}} Expedition</p><p>People in Polynesia share similar:</p><p>{{14}}</p><p>{{15}}</p>"
        },
        {
          "type": "multiple-choice",
          "number": 16,
          "prompt": "The route of Jenson’s expedition",
          "options": [
            "From Polynesia to Southeast Asia",
            "From Polynesia to South America",
            "From South America to Polynesia",
            "From South America to Southeast Asia"
          ]
        },
        {
          "type": "heading",
          "text": "Jenson’s Boat"
        },
        {
          "type": "template",
          "html": "<p>Qualities of the wood Jenson used for his boat:</p><p>{{17}}</p><p>{{18}}</p><div class=\"dse-boat-diagram\" role=\"img\" aria-label=\"Boat measurements diagram\"><span class=\"sail\">Sail</span><span class=\"height\">{{19}} metres</span><span class=\"length\">{{20}} metres</span></div>"
        },
        {
          "type": "heading",
          "text": "The expedition"
        },
        {
          "type": "template",
          "html": "<p>Month and year they set off: {{21}}</p><p>Navigation method: {{22}}</p><p>What they ate: {{23}}</p><p>How water was stored: {{24}}</p>"
        },
        {
          "type": "multiple-select",
          "number": 25,
          "prompt": "Problems caused by the storm — Tick THREE",
          "options": [
            "Lost food source",
            "Lost navigation tools",
            "Lost crew members",
            "Lost water",
            "Lost journal",
            "Lost sail"
          ],
          "limit": 3
        },
        {
          "type": "multiple-choice",
          "number": 26,
          "prompt": "Modern research shows that modern Polynesians share similar _____ to South Americans.",
          "options": [
            "languages",
            "religions",
            "culture",
            "genes"
          ]
        }
      ]
    },
    {
      "number": 3,
      "marks": 14,
      "title": "Heritage language learning",
      "instruction": "Listen to a podcast interview with Philip, Charles and Anna, who are talking about their experiences as language learners. Complete the information in the spaces below.",
      "blocks": [
        {
          "type": "template",
          "html": "<p>Heritage Language Learning is: Learning a language that is {{27}}</p>"
        },
        {
          "type": "template",
          "html": "<div class=\"listening-table-wrap\"><table class=\"dse-native-table\"><caption>Learner profiles</caption><thead><tr><th></th><th>Charles</th><th>Anna</th><th>Philip</th></tr></thead><tbody><tr><th>Language they are learning</th><td>Spanish</td><td>Mandarin Chinese</td><td>French</td></tr><tr><th>Family originated from</th><td>Peru</td><td>{{28}}</td><td>Belgium</td></tr><tr><th>Reasons for learning</th><td>{{29}}</td><td>{{30}}</td><td>{{31}}</td></tr><tr><th>Methods of learning</th><td>{{32}}</td><td>{{33}}</td><td>Textbook</td></tr></tbody></table></div>"
        },
        {
          "type": "heading",
          "text": "Problems and solutions"
        },
        {
          "type": "template",
          "html": "<div class=\"listening-table-wrap\"><table class=\"dse-native-table\"><caption>What difficulty did each learner experience and what was their solution?</caption><thead><tr><th>Name</th><th>Problem</th><th>Solution</th></tr></thead><tbody><tr><th>Charles</th><td>Learning vocabulary</td><td>{{34}}</td></tr><tr><th>Anna</th><td>{{35}}</td><td>{{36}}</td></tr><tr><th>Philip</th><td>No opportunity to practise listening</td><td>{{37}}</td></tr></tbody></table></div>"
        },
        {
          "type": "heading",
          "text": "Messages"
        },
        {
          "type": "template",
          "html": "<div class=\"dse-speech-grid\"><section><strong>Charles</strong><p>{{38}}</p></section><section><strong>Anna</strong><p>{{39}}</p></section><section><strong>Philip</strong><p>{{40}}</p></section></div>"
        }
      ]
    },
    {
      "number": 4,
      "marks": 13,
      "title": "Chunyun",
      "instruction": "Listen to a radio programme about Chunyun, the period where millions of people travel during the Chinese Spring Festival, and answer the questions below. You do not need to answer in complete sentences.",
      "blocks": [
        {
          "type": "template",
          "html": "<p>What is special about Chunyun?</p><p>{{41}}</p><p>How many people are likely to travel during the Spring Festival each year?</p><p>{{42}}</p>"
        },
        {
          "type": "template",
          "html": "<p>Why do many more people travel during the Spring Festival now, when compared to the past?</p><p>Reason 1: {{43}}</p><p>Reason 2: {{44}}</p>"
        },
        {
          "type": "template",
          "html": "<p>What are the two main issues that people face travelling by train in Chunyun?</p><p>{{45}} because ______</p><p>{{46}} because ______</p>"
        },
        {
          "type": "template",
          "html": "<div class=\"listening-table-wrap\"><table class=\"dse-native-table\"><caption>Three stories about Chunyun</caption><thead><tr><th>Story</th><th>Outcome</th></tr></thead><tbody><tr><th>A drunk man falls asleep and misses his stop</th><td>{{47}}</td></tr><tr><th>A student has his money stolen by a pickpocket</th><td>{{48}}</td></tr><tr><th>A young woman sits opposite a student on the train</th><td>{{49}}</td></tr></tbody></table></div>"
        },
        {
          "type": "template",
          "html": "<p>What are the three ways suggested about how to cope with the problems of Chunyun?</p><p>{{50}}</p><p>{{51}}</p><p>{{52}}</p><p>According to the presenter, how do most Chinese feel about Chunyun?</p><p>{{53}}</p>"
        }
      ]
    }
  ]
};
data.transcript={partA:{},partB:[]};
function freeze(value){if(value && typeof value==="object" && !Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
window.EDMUND_DSE_LISTENING_2024=freeze(data);
})();

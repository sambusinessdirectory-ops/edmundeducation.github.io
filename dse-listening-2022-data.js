// Digitised from the supplied 2022 DSE Paper 3 Part A question paper.
(function(){"use strict";
const data={
  "version": 2,
  "year": 2022,
  "questionCount": 52,
  "situation": "Charlie Lau, Fatima Alami, Greta Wai and Keaton Ramos have just set up a tour company for tourists in Hong Kong called Hidden Hong Kong Tours. They also have their own YouTube channel. You will hear several conversations related to Hidden Hong Kong Tours.",
  "situationZh": "Charlie Lau、Fatima Alami、Greta Wai 和 Keaton Ramos 剛成立了一間名為 Hidden Hong Kong Tours 的本地旅遊公司，亦設有自己的 YouTube 頻道。你將會聆聽幾段與公司有關的對話。",
  "instructions": "In Part A, you will have a total of four tasks to do. Follow the instructions in the Question-Answer Book and in the recording to complete the tasks. You will find all the information you need in the Question-Answer Book and the recording.",
  "instructionsZh": "在甲部，你需要完成四項任務。請按照答題簿及錄音中的指示完成各項任務；所需資料均可在答題簿及錄音中找到。",
  "familiarisation": "You now have two minutes to familiarise yourself with Tasks 1–4.",
  "familiarisationZh": "你現在有兩分鐘時間熟習任務 1 至 4。",
  "tasks": [
    {
      "number": 1,
      "marks": 13,
      "title": "Cultural tour details",
      "instruction": "Charlie and Fatima are meeting to finalise the details for a tour. Listen to their conversation and complete the information in the spaces below. The first one has been provided as an example.",
      "blocks": [
        {
          "type": "template",
          "html": "<div class=\"listening-table-wrap\"><table class=\"dse-native-table\"><caption>Cultural tour details</caption><tbody><tr><th>Location</th><td><span class=\"dse-example-answer\">Henry’s Umbrella Store (example)</span></td></tr><tr><th>Starting month</th><td>{{1}}</td></tr><tr><th>Frequency</th><td>{{2}}</td></tr><tr><th>Timeslots</th><td>{{3}} and {{4}}</td></tr><tr><th>Address</th><td>{{5}}</td></tr></tbody></table></div>"
        },
        {
          "type": "heading",
          "text": "Location of Henry’s Umbrella Store"
        },
        {
          "type": "template",
          "html": "<div class=\"dse-2022-map\" role=\"img\" aria-label=\"Street map with locations A to D\"><span class=\"place a\">A</span><span class=\"place market\">Bright Flower Market</span><span class=\"place garden\">Rare Bird Garden</span><span class=\"place b\">B</span><span class=\"place mall\">Loke Mall</span><span class=\"place school\">Bison Boys School</span><span class=\"place rich\">Rich Avenue Building</span><span class=\"place c\">C</span><span class=\"place station\">MTR Station Exit E</span><span class=\"place carpark\">Carpark</span><span class=\"place d\">D</span></div><p>(6) Look at the map above. Where is Henry’s Umbrella Store? {{6|A|B|C|D}}</p>"
        },
        {
          "type": "template",
          "html": "<h4>The tour will include the following activities:</h4><ul><li>{{7}}</li><li>{{8}}</li><li>{{9}}</li></ul>"
        },
        {
          "type": "multiple-select",
          "number": 10,
          "prompt": "Items provided for participants — Tick TWO",
          "options": [
            "Umbrella with store logo",
            "Traditional Chinese tea",
            "QR code for audio tour",
            "Leaflets",
            "English breakfast tea",
            "Bottled water"
          ],
          "limit": 2
        },
        {
          "type": "template",
          "html": "<div class=\"listening-table-wrap\"><table class=\"dse-native-table\"><caption>How to advertise tour</caption><thead><tr><th>Idea</th><th>Reason</th></tr></thead><tbody><tr><td>Social Media</td><td>{{11}}</td></tr><tr><td>{{12}}</td><td>{{13}}</td></tr></tbody></table></div>"
        }
      ]
    },
    {
      "number": 2,
      "marks": 12,
      "title": "Guang China Works",
      "instruction": "Keaton is interviewing TY Chow for Hidden Hong Kong Tours’ YouTube channel. TY is the owner of a porcelain factory in Hong Kong. Listen to the interview and complete the information in the spaces below.",
      "blocks": [
        {
          "type": "template",
          "html": "<p>Factory name: <span class=\"dse-example-answer\">Guang China Works (example)</span></p><p>Founded in: {{14}}</p>"
        },
        {
          "type": "multiple-select",
          "number": 15,
          "prompt": "Famous for — Tick TWO",
          "options": [
            "Unique materials",
            "Bright colours",
            "Plain design",
            "Painting techniques"
          ],
          "limit": 2
        },
        {
          "type": "template",
          "html": "<div class=\"listening-table-wrap\"><table class=\"dse-native-table\"><caption>History of porcelain factory</caption><thead><tr><th>Time Period</th><th>Situation</th></tr></thead><tbody><tr><th>1920s</th><td>Hired {{16}}</td></tr><tr><th>1970s</th><td>Opened {{17}}</td></tr><tr><th>1990s</th><td>Downsizing caused by {{18}}</td></tr><tr><th>Present</th><td>Facing {{19}}</td></tr></tbody></table></div>"
        },
        {
          "type": "template",
          "html": "<div class=\"listening-table-wrap\"><table class=\"dse-native-table\"><caption>Reasons for the decline</caption><thead><tr><th>Reason</th><th>Explanation</th></tr></thead><tbody><tr><td>Factories moved to Mainland</td><td>{{20}}</td></tr><tr><td>{{21}}</td><td>{{22}}</td></tr></tbody></table></div><p>Main customers in 1990s: {{23}}</p><p>{{24}}</p>"
        },
        {
          "type": "image",
          "src": "assets/dse-listening/2022/porcelain-patterns.webp",
          "alt": "Five porcelain pattern options A to E",
          "caption": "Popular patterns nowadays"
        },
        {
          "type": "multiple-select",
          "number": 25,
          "prompt": "Popular patterns nowadays — Tick TWO",
          "options": [
            "A — figure pattern",
            "B — floral scene",
            "C — floral branch",
            "D — flower medallion",
            "E — dragon pattern"
          ],
          "limit": 2
        }
      ]
    },
    {
      "number": 3,
      "marks": 14,
      "title": "Bolin Medicine’s manufacturing process",
      "instruction": "Charlie and Greta are making a YouTube video at an exhibition at Bolin Medicine’s factory in Hong Kong. Listen to their conversation and complete the information in the spaces below.",
      "blocks": [
        {
          "type": "template",
          "html": "<p>Target consumer: {{26}}</p>"
        },
        {
          "type": "multiple-select",
          "number": 27,
          "prompt": "Target illnesses — Tick TWO",
          "options": [
            "Fever",
            "Stomachache",
            "Difficulty sleeping",
            "Sore throat"
          ],
          "limit": 2
        },
        {
          "type": "multiple-choice",
          "number": 28,
          "prompt": "Bolin Medicine won the Shoener Finances Award for …",
          "options": [
            "being socially responsible",
            "being environmentally friendly",
            "using natural ingredients",
            "making a large profit"
          ]
        },
        {
          "type": "heading",
          "text": "Stage 1: Sourcing"
        },
        {
          "type": "template",
          "html": "<p>Source of ingredients: {{29}}</p>"
        },
        {
          "type": "multiple-choice",
          "number": 30,
          "prompt": "Substance which is prohibited",
          "options": [
            "Ginseng",
            "Peanuts",
            "Pearls",
            "Shark fin",
            "Turmeric"
          ]
        },
        {
          "type": "heading",
          "text": "Stage 2: Preparation"
        },
        {
          "type": "template",
          "html": "<div class=\"listening-table-wrap\"><table class=\"dse-native-table\"><caption>Preparation of ingredients</caption><thead><tr><th>Condition</th><th>Reason for maintaining this condition</th></tr></thead><tbody><tr><td>{{31}}</td><td>{{32}}</td></tr><tr><td>{{33}}</td><td>{{34}}</td></tr><tr><td>{{35}}</td><td>{{36}}</td></tr></tbody></table></div>"
        },
        {
          "type": "heading",
          "text": "Stage 3: Processing"
        },
        {
          "type": "template",
          "html": "<p>Process used: {{37}}</p><p>Reason for use: {{38}}</p>"
        },
        {
          "type": "heading",
          "text": "Stage 4: Packaging"
        },
        {
          "type": "multiple-select",
          "number": 39,
          "prompt": "Characteristics — Tick TWO",
          "options": [
            "Airtight",
            "Biodegradable",
            "Homely",
            "Handmade"
          ],
          "limit": 2
        }
      ]
    },
    {
      "number": 4,
      "marks": 13,
      "title": "Albert Wan’s factory memories",
      "instruction": "Fatima is telling Charlie about an interview she had with Albert Wan, a retired toy factory worker in Hong Kong. Listen to their conversation and complete the answers below. You do not need to answer in complete sentences.",
      "blocks": [
        {
          "type": "template",
          "html": "<p>Why did Albert go to Shanghai?</p><p>{{40}}</p><p>How did Albert and his friends end up in Hong Kong?</p><p>{{41}}</p>"
        },
        {
          "type": "template",
          "html": "<div class=\"listening-table-wrap\"><table class=\"dse-native-table\"><caption>Albert’s salary package</caption><thead><tr><th></th><th>Salary</th><th>Additional Benefits</th></tr></thead><tbody><tr><th>When he started working</th><td>{{42}}</td><td>{{43}}<br>{{44}}</td></tr><tr><th>Later</th><td>{{45}} because ______</td><td>{{46}}</td></tr></tbody></table></div>"
        },
        {
          "type": "template",
          "html": "<div class=\"listening-table-wrap\"><table class=\"dse-native-table\"><caption>What it was like to work in the factory</caption><thead><tr><th>Positive things</th><th>Negative things</th></tr></thead><tbody><tr><td>{{47}}<br>{{48}}</td><td>{{49}}<br>{{50}}</td></tr></tbody></table></div>"
        },
        {
          "type": "template",
          "html": "<p>According to Charlie and Fatima, why did Albert say that he didn’t remember any accidents?</p><p>{{51}}</p><p>How do you think Albert felt when the factory closed down? Explain your answer.</p><p>{{52}} He must have felt ______ because ______</p>"
        }
      ]
    }
  ]
};
data.transcript={partA:{},partB:[]};
function freeze(value){if(value && typeof value==="object" && !Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
window.EDMUND_DSE_LISTENING_2022=freeze(data);
})();

#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const CATEGORY_HEADERS = [
  [/^## 1\. Opinions/, "opinion"],
  [/^## 2\. Discuss Both Views/, "discuss-both-views"],
  [/^## 3\. Cause and Solution/, "cause-solution"],
  [/^## 4\. Advantages and Disadvantages/, "advantage-disadvantage"],
  [/^## 5\. Direct Questions/, "direct-question"]
];

const TAGS = {
  "opinion": {
    3:"Arts & Culture",4:"Arts & Culture|Society",5:"Arts & Culture|Government & Policy",6:"Business|Economy & Globalisation|Society",
    7:"Business|Sport & Exercise|Society",8:"Advertising & Consumerism|Business",9:"Business|Economy & Globalisation|Government & Policy",
    10:"Advertising & Consumerism|Business",11:"Work & Employment|Gender Equality|Business",12:"Money & Finance",13:"Personal Growth",
    14:"Personal Growth",15:"Personal Growth|Communication",16:"Personal Growth|Communication",17:"Society",18:"Health & Medicine|Society",
    19:"Media & News|Children & Parenting|Society",20:"Media & News|Society",21:"Personal Growth|Society",22:"Communication|Technology & Internet",
    23:"Communication|Technology & Internet",24:"Communication|Technology & Internet|Language",25:"Personal Growth|Science & Space",
    26:"Gender Equality|Personal Growth",27:"Crime & Justice|Technology & Internet",28:"Crime & Justice|Children & Parenting",
    29:"Crime & Justice|Government & Policy",30:"Crime & Justice|Gender Equality|Work & Employment",31:"Crime & Justice|Government & Policy",
    32:"Crime & Justice|Government & Policy",33:"Crime & Justice|Government & Policy",34:"Crime & Justice|Inequality & Aid",
    35:"Crime & Justice|Children & Parenting|Family",36:"Education|Technology & Internet",37:"Education|Science & Space|Government & Policy",
    38:"Education|Arts & Culture|Technology & Internet",39:"Education|Books & Libraries",40:"Education|Inequality & Aid|Government & Policy",
    41:"Education|Children & Parenting",42:"Animals & Conservation|Government & Policy",43:"Environment & Climate|Transport|Government & Policy",
    44:"Environment & Climate|Government & Policy",45:"Cities & Housing|Environment & Climate|Economy & Globalisation",
    46:"Animals & Conservation|Inequality & Aid|Health & Medicine",47:"Environment & Climate|Government & Policy",
    48:"Environment & Climate|Transport|Tourism & Travel",49:"Children & Parenting|Education|Media & News",
    50:"Children & Parenting|Society",51:"Family|Education|Personal Growth",52:"Government & Policy|Inequality & Aid",
    53:"Arts & Culture|Government & Policy",54:"Arts & Culture|Education|Government & Policy",55:"Government & Policy|Society",
    56:"Health & Medicine|Government & Policy",57:"Health & Medicine|Society",58:"Health & Medicine|Government & Policy|Inequality & Aid",
    59:"Health & Medicine|Sport & Exercise",60:"Health & Medicine|Education",61:"Environment & Climate|Cities & Housing",
    62:"Cities & Housing|Tourism & Travel",63:"Cities & Housing|Government & Policy",64:"Cities & Housing|Environment & Climate",
    65:"Language|Technology & Internet|Education",66:"Language|Economy & Globalisation",67:"Education|Language|Technology & Internet",
    68:"Language|Arts & Culture",69:"Language|Tourism & Travel",70:"Media & News|Crime & Justice",71:"Media & News|Society",
    72:"Media & News|Technology & Internet",73:"Media & News|Technology & Internet|Arts & Culture",
    74:"Advertising & Consumerism|Children & Parenting|Media & News",75:"Arts & Culture|Media & News|Economy & Globalisation",
    76:"Arts & Culture|Media & News|Heritage",77:"Advertising & Consumerism|Health & Medicine|Business",
    78:"Books & Libraries|Media & News",79:"Books & Libraries|Children & Parenting|Education",
    80:"Books & Libraries|Technology & Internet|Education",81:"Gender Equality|Family|Work & Employment",
    82:"Inequality & Aid|Government & Policy",83:"Tourism & Travel|Arts & Culture|Society",
    84:"Science & Space|Government & Policy|Inequality & Aid",85:"Sport & Exercise|Children & Parenting|Education",
    86:"Sport & Exercise|Children & Parenting|Education",87:"Sport & Exercise|Work & Employment|Health & Medicine",
    88:"Sport & Exercise|Health & Medicine|Education",89:"Sport & Exercise|Children & Parenting|Media & News",
    90:"Sport & Exercise|Media & News|Government & Policy",91:"Technology & Internet|Communication",
    92:"Technology & Internet|Children & Parenting|Health & Medicine",93:"Technology & Internet|Family|Communication",
    94:"Media & News|Tourism & Travel",95:"Tourism & Travel|Arts & Culture|Society",
    96:"Environment & Climate|Transport|Government & Policy",97:"Transport|Cities & Housing|Migration & Urbanisation",
    98:"Environment & Climate|Transport|Government & Policy",99:"Economy & Globalisation|Inequality & Aid|Government & Policy",
    100:"Work & Employment|Personal Growth",101:"Work & Employment|Money & Finance|Society",102:"Education|Work & Employment",
    103:"Work & Employment|Money & Finance",104:"Work & Employment|Migration & Urbanisation|Society",105:"Work & Employment|Business",
    106:"Business|Family"
  },
  "discuss-both-views": {
    4:"Business|Family",5:"Work & Employment|Business|Personal Growth",6:"Business|Advertising & Consumerism",
    7:"Money & Finance|Economy & Globalisation",8:"Children & Parenting|Society",9:"Personal Growth|Education|Science & Space",
    10:"Personal Growth|Society",11:"Crime & Justice|Government & Policy",12:"Education|Children & Parenting|Family",
    13:"Education|Children & Parenting",14:"Children & Parenting|Education|Health & Medicine",
    15:"Language|Education|Children & Parenting",16:"Education|Technology & Internet|Government & Policy",
    17:"Education|Children & Parenting|Family",18:"Ageing|Education",19:"Animals & Conservation|Environment & Climate",
    20:"Environment & Climate|Transport|Government & Policy",21:"Environment & Climate|Animals & Conservation",
    22:"Environment & Climate|Government & Policy",23:"Children & Parenting|Family",
    24:"Children & Parenting|Health & Medicine|Government & Policy",25:"Health & Medicine|Government & Policy",
    26:"Heritage|Cities & Housing",27:"Sport & Exercise|Advertising & Consumerism|Business",28:"Media & News",
    29:"Children & Parenting|Media & News",30:"Books & Libraries|Technology & Internet",
    31:"Economy & Globalisation|Inequality & Aid|Government & Policy",32:"Society",33:"Science & Space",
    34:"Science & Space|Government & Policy",35:"Sport & Exercise|Government & Policy",
    36:"Sport & Exercise|Children & Parenting|Education",37:"Sport & Exercise|Economy & Globalisation|Government & Policy",
    38:"Technology & Internet|Inequality & Aid",39:"Technology & Internet|Communication",
    40:"Tourism & Travel|Arts & Culture|Government & Policy",41:"Environment & Climate|Transport|Government & Policy",
    42:"Transport|Cities & Housing|Government & Policy",43:"Education|Work & Employment"
  },
  "cause-solution": {
    2:"Advertising & Consumerism|Business|Economy & Globalisation",3:"Inequality & Aid|Economy & Globalisation",
    4:"Technology & Internet|Children & Parenting",5:"Crime & Justice|Government & Policy",6:"Crime & Justice|Cities & Housing",
    7:"Gender Equality|Education|Science & Space",8:"Environment & Climate",9:"Health & Medicine|Society",
    10:"Health & Medicine|Sport & Exercise",11:"Migration & Urbanisation|Cities & Housing|Economy & Globalisation",
    12:"Cities & Housing|Migration & Urbanisation|Government & Policy",13:"Technology & Internet|Children & Parenting|Family",
    14:"Tourism & Travel|Environment & Climate|Transport",15:"Tourism & Travel|Arts & Culture|Environment & Climate",
    16:"Transport|Cities & Housing",17:"Migration & Urbanisation|Work & Employment|Economy & Globalisation",
    18:"Work & Employment|Family|Health & Medicine",19:"Education|Migration & Urbanisation|Inequality & Aid",
    20:"Work & Employment|Migration & Urbanisation|Economy & Globalisation"
  },
  "advantage-disadvantage": {
    2:"Technology & Internet|Advertising & Consumerism|Business",3:"Education|Tourism & Travel|Inequality & Aid",
    4:"Society|Personal Growth",5:"Technology & Internet|Communication|Work & Employment",
    6:"Technology & Internet|Communication|Economy & Globalisation",7:"Crime & Justice|Government & Policy",
    8:"Education|Tourism & Travel|Children & Parenting",9:"Education|Children & Parenting|Society",
    10:"Education|Gender Equality|Children & Parenting",11:"Education|Language|Technology & Internet",
    12:"Children & Parenting|Cities & Housing|Migration & Urbanisation",13:"Family|Society",14:"Cities & Housing|Money & Finance",
    15:"Language|Education|Children & Parenting",16:"Advertising & Consumerism|Business|Society",
    17:"Books & Libraries|Technology & Internet",18:"Economy & Globalisation|Society",19:"Economy & Globalisation|Society",
    20:"Heritage|Cities & Housing",21:"Technology & Internet|Family",22:"Gender Equality|Work & Employment|Family",
    23:"Language|Economy & Globalisation|Tourism & Travel",24:"Environment & Climate|Transport|Tourism & Travel",
    25:"Transport|Government & Policy",26:"Transport|Cities & Housing",27:"Work & Employment|Technology & Internet|Health & Medicine",
    28:"Work & Employment|Ageing",29:"Children & Parenting|Work & Employment|Education",
    30:"Work & Employment|Technology & Internet"
  },
  "direct-question": {
    2:"Work & Employment|Business",3:"Work & Employment|Business",4:"Work & Employment|Money & Finance|Business",
    5:"Advertising & Consumerism|Money & Finance|Business",6:"Business|Money & Finance",7:"Education|Personal Growth",
    8:"Work & Employment|Personal Growth|Business",9:"Crime & Justice|Media & News|Children & Parenting",
    10:"Crime & Justice|Health & Medicine|Government & Policy",11:"Children & Parenting|Education|Family",
    12:"Education|Children & Parenting",13:"Education|Work & Employment|Society",14:"Education|Inequality & Aid",
    15:"Education|Children & Parenting|Inequality & Aid",16:"Education",17:"Environment & Climate|Government & Policy",
    18:"Animals & Conservation|Environment & Climate",20:"Cities & Housing|Environment & Climate|Government & Policy",
    21:"Animals & Conservation|Government & Policy",22:"Children & Parenting|Family|Health & Medicine",
    23:"Family|Ageing",24:"Family|Society",25:"Children & Parenting|Family|Work & Employment",
    26:"Family|Migration & Urbanisation|Children & Parenting",27:"Ageing|Family|Government & Policy",
    28:"Government & Policy|Society",29:"Sport & Exercise|Health & Medicine|Education",
    30:"Cities & Housing|Migration & Urbanisation|Government & Policy",31:"Cities & Housing|Work & Employment",
    32:"Media & News|Society",33:"Media & News|Society",34:"Media & News|Arts & Culture|Government & Policy",
    35:"Advertising & Consumerism|Society",36:"Books & Libraries|Education|Children & Parenting",
    37:"Arts & Culture|Society",38:"Heritage|Education|Arts & Culture",39:"Arts & Culture|Society",
    40:"Work & Employment|Technology & Internet",41:"Technology & Internet|Children & Parenting|Family",
    42:"Tourism & Travel|Economy & Globalisation",43:"Tourism & Travel|Heritage|Government & Policy",
    44:"Transport|Cities & Housing|Government & Policy",45:"Work & Employment|Economy & Globalisation",
    46:"Migration & Urbanisation|Work & Employment|Cities & Housing",47:"Work & Employment|Personal Growth|Money & Finance",
    48:"Work & Employment|Money & Finance|Family"
  }
};

function fail(message) {
  throw new Error(message);
}

const inputPath = process.argv[2] ? resolve(process.argv[2]) : "";
const outputPath = resolve(process.argv[3] || "ielts-task2-question-data.js");
const manifestPath = resolve(process.argv[4] || "ielts-task2-model-essays.js");
if (!inputPath) fail("Usage: node tools/build-model-essay-question-data.mjs INPUT.md [OUTPUT.js] [MANIFEST.js]");

const questions = new Map();
let activeCategory = "";
for (const line of readFileSync(inputPath, "utf8").split(/\r?\n/)) {
  const header = CATEGORY_HEADERS.find(([pattern]) => pattern.test(line));
  if (header) {
    activeCategory = header[1];
    continue;
  }
  const match = line.match(/^\d+\.\s+\*\*Q(\d+)\*\*\s+[—-]\s+(.+)$/);
  if (!activeCategory || !match) continue;
  const key = activeCategory + ":" + Number(match[1]);
  if (questions.has(key)) fail("Duplicate question key: " + key);
  questions.set(key, match[2].trim());
}

const context = { window: {} };
vm.runInNewContext(readFileSync(manifestPath, "utf8"), context, { filename: manifestPath });
const essays = context.window.EDMUND_MODEL_ESSAYS;
if (!Array.isArray(essays) || essays.length !== 238) fail("Expected a 238-item essay manifest.");
if (questions.size !== essays.length) fail("Question list has " + questions.size + " entries; expected " + essays.length + ".");

const data = {};
for (const essay of essays) {
  const key = essay.category + ":" + essay.number;
  const question = questions.get(key);
  const tagString = TAGS[essay.category]?.[essay.number];
  if (!question) fail("Missing question for " + key);
  if (!tagString) fail("Missing tags for " + key);
  const tags = tagString.split("|");
  if (tags.length < 1 || tags.length > 3) fail("Expected 1–3 tags for " + key);
  data[key] = { question, tags };
  questions.delete(key);
}
if (questions.size) fail("Question keys without matching essays: " + [...questions.keys()].join(", "));

const output = [
  "// Generated by tools/build-model-essay-question-data.mjs",
  "window.EDMUND_MODEL_ESSAY_QUESTION_DATA=Object.freeze(" + JSON.stringify(data) + ");",
  ""
].join("\n");
writeFileSync(outputPath, output, "utf8");
console.log("Wrote " + Object.keys(data).length + " question records to " + outputPath);

const ESSENTIAL_CODES = new Set("gb ie fr de es pt it gr ch at be nl dk no se fi pl ru ua cz hu tr cn jp kr kp in pk bd np lk th vn kh la my sg id ph mm sa ae il ir iq af us ca mx br ar cl au nz eg za ng ke ma".split(" "));
const COORDINATE_OVERRIDES = Object.freeze({
  va:{ lat:41.9029, lon:12.4534 }, mc:{ lat:43.7384, lon:7.4246 }, sm:{ lat:43.9424, lon:12.4578 },
  mv:{ lat:3.2028, lon:73.2207 }, nr:{ lat:-0.5228, lon:166.9315 }, tv:{ lat:-7.1095, lon:177.6493 }
});

function slug(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/\bthe\b/gi, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function parseAliases(value) {
  return value ? value.split(";").map((part) => part.trim()).filter(Boolean) : [];
}

function spellingTrap(name) {
  const words = name.replace(/^the\s+/i, "").split(/[\s-]+/).filter(Boolean);
  if (name.includes("-")) return `${name}：保留連字號，並留意每一部分的完整拼寫。`;
  if (words.length > 2) return `${name}：分成 ${words.map((word) => word.replace(/[’']/g, "")).join(" · ")}，逐部分核對。`;
  if (words.length === 2) return `${name}：兩個字要分開；逐一核對 ${words[0]} 和 ${words[1]}。`;
  return `${name}：留意中段字母及完整詞尾，不要按讀音漏字。`;
}

const COUNTRY_ROWS = `
al|Albania|阿爾巴尼亞|Europe|Albanian||
ad|Andorra|安道爾|Europe|Andorran||
at|Austria|奧地利|Europe|Austrian||
by|Belarus|白俄羅斯|Europe|Belarusian||
be|Belgium|比利時|Europe|Belgian||
ba|Bosnia and Herzegovina|波斯尼亞和黑塞哥維那|Europe|Bosnian|Bosnia-Herzegovina|Bosnian-Herzegovinian
bg|Bulgaria|保加利亞|Europe|Bulgarian||
hr|Croatia|克羅地亞|Europe|Croatian||
cy|Cyprus|塞浦路斯|Europe|Cypriot||
cz|Czech Republic|捷克共和國|Europe|Czech|Czechia|
dk|Denmark|丹麥|Europe|Danish||
ee|Estonia|愛沙尼亞|Europe|Estonian||
fi|Finland|芬蘭|Europe|Finnish||
fr|France|法國|Europe|French||
de|Germany|德國|Europe|German||
gr|Greece|希臘|Europe|Greek||
va|Vatican City|梵蒂岡|Europe|Vatican|the Holy See;Holy See|
hu|Hungary|匈牙利|Europe|Hungarian||
is|Iceland|冰島|Europe|Icelandic||
ie|Ireland|愛爾蘭|Europe|Irish||
it|Italy|意大利|Europe|Italian||
lv|Latvia|拉脫維亞|Europe|Latvian||
li|Liechtenstein|列支敦士登|Europe|Liechtenstein|Liechtensteinian|
lt|Lithuania|立陶宛|Europe|Lithuanian||
lu|Luxembourg|盧森堡|Europe|Luxembourgish||
mt|Malta|馬耳他|Europe|Maltese||
md|Moldova|摩爾多瓦|Europe|Moldovan|Republic of Moldova|
mc|Monaco|摩納哥|Europe|Monegasque||
me|Montenegro|黑山|Europe|Montenegrin||
nl|the Netherlands|荷蘭|Europe|Dutch|Netherlands|
mk|North Macedonia|北馬其頓|Europe|Macedonian||
no|Norway|挪威|Europe|Norwegian||
pl|Poland|波蘭|Europe|Polish||
pt|Portugal|葡萄牙|Europe|Portuguese||
ro|Romania|羅馬尼亞|Europe|Romanian||
ru|Russia|俄羅斯|Europe|Russian|Russian Federation|
sm|San Marino|聖馬力諾|Europe|Sammarinese||
rs|Serbia|塞爾維亞|Europe|Serbian||
sk|Slovakia|斯洛伐克|Europe|Slovak||
si|Slovenia|斯洛文尼亞|Europe|Slovenian||
es|Spain|西班牙|Europe|Spanish||
se|Sweden|瑞典|Europe|Swedish||
ch|Switzerland|瑞士|Europe|Swiss||
ua|Ukraine|烏克蘭|Europe|Ukrainian||
gb|the United Kingdom|英國|Europe|British|United Kingdom;UK|
af|Afghanistan|阿富汗|Asia|Afghan||
am|Armenia|亞美尼亞|Asia|Armenian||
az|Azerbaijan|阿塞拜疆|Asia|Azerbaijani||
bh|Bahrain|巴林|Asia|Bahraini||
bd|Bangladesh|孟加拉|Asia|Bangladeshi||
bt|Bhutan|不丹|Asia|Bhutanese||
bn|Brunei|文萊|Asia|Bruneian|Brunei Darussalam|
kh|Cambodia|柬埔寨|Asia|Cambodian||
cn|China|中國|Asia|Chinese||
ge|Georgia|格魯吉亞|Asia|Georgian||
in|India|印度|Asia|Indian||
id|Indonesia|印度尼西亞|Asia|Indonesian||
ir|Iran|伊朗|Asia|Iranian|Islamic Republic of Iran|
iq|Iraq|伊拉克|Asia|Iraqi||
il|Israel|以色列|Asia|Israeli||
jp|Japan|日本|Asia|Japanese||
jo|Jordan|約旦|Asia|Jordanian||
kz|Kazakhstan|哈薩克斯坦|Asia|Kazakh|Kazakhstani|
kw|Kuwait|科威特|Asia|Kuwaiti||
kg|Kyrgyzstan|吉爾吉斯斯坦|Asia|Kyrgyz|Kyrgyzstani|
la|Laos|老撾／寮國|Asia|Lao|Lao People's Democratic Republic|Laotian
lb|Lebanon|黎巴嫩|Asia|Lebanese||
my|Malaysia|馬來西亞|Asia|Malaysian||
mv|Maldives|馬爾代夫|Asia|Maldivian|the Maldives|
mn|Mongolia|蒙古|Asia|Mongolian||
mm|Myanmar|緬甸|Asia|Burmese|Burma|Myanmar
np|Nepal|尼泊爾|Asia|Nepalese|Nepali|Nepali
kp|North Korea|北韓／朝鮮|Asia|North Korean|Democratic People's Republic of Korea|
om|Oman|阿曼|Asia|Omani||
pk|Pakistan|巴基斯坦|Asia|Pakistani||
ps|Palestine|巴勒斯坦|Asia|Palestinian|State of Palestine|
ph|the Philippines|菲律賓|Asia|Philippine|Philippines|Filipino
qa|Qatar|卡塔爾|Asia|Qatari||
sa|Saudi Arabia|沙特阿拉伯|Asia|Saudi Arabian||Saudi
sg|Singapore|新加坡|Asia|Singaporean||
kr|South Korea|南韓／韓國|Asia|South Korean|Republic of Korea;Korea|
lk|Sri Lanka|斯里蘭卡|Asia|Sri Lankan||
sy|Syria|敘利亞|Asia|Syrian|Syrian Arab Republic|
tj|Tajikistan|塔吉克斯坦|Asia|Tajik|Tajikistani|
th|Thailand|泰國|Asia|Thai||
tl|Timor-Leste|東帝汶|Asia|Timorese|East Timor;Timor Leste|East Timorese
tr|Turkey|土耳其|Asia|Turkish|Türkiye|
tm|Turkmenistan|土庫曼斯坦|Asia|Turkmen||
ae|the United Arab Emirates|阿拉伯聯合酋長國|Asia|Emirati|United Arab Emirates;UAE|
uz|Uzbekistan|烏茲別克斯坦|Asia|Uzbek||
vn|Vietnam|越南|Asia|Vietnamese|Viet Nam|
ye|Yemen|也門|Asia|Yemeni||
dz|Algeria|阿爾及利亞|Africa|Algerian||
ao|Angola|安哥拉|Africa|Angolan||
bj|Benin|貝寧|Africa|Beninese||
bw|Botswana|博茨瓦納|Africa|Botswanan||Motswana
bf|Burkina Faso|布基納法索|Africa|Burkinabe||Burkinabé
bi|Burundi|布隆迪|Africa|Burundian||
cv|Cabo Verde|佛得角|Africa|Cabo Verdean|Cape Verde|Cape Verdean
cm|Cameroon|喀麥隆|Africa|Cameroonian||
cf|Central African Republic|中非共和國|Africa|Central African||
td|Chad|乍得|Africa|Chadian||
km|Comoros|科摩羅|Africa|Comorian||
cg|Republic of the Congo|剛果共和國|Africa|Congolese|Congo;Congo-Brazzaville|
cd|Democratic Republic of the Congo|剛果民主共和國|Africa|Congolese|DR Congo;Congo-Kinshasa|
ci|Côte d’Ivoire|科特迪瓦|Africa|Ivorian|Ivory Coast|
dj|Djibouti|吉布提|Africa|Djiboutian||
eg|Egypt|埃及|Africa|Egyptian||
gq|Equatorial Guinea|赤道幾內亞|Africa|Equatorial Guinean||
er|Eritrea|厄立特里亞|Africa|Eritrean||
sz|Eswatini|斯威士蘭|Africa|Swazi|Swaziland|
et|Ethiopia|埃塞俄比亞|Africa|Ethiopian||
ga|Gabon|加蓬|Africa|Gabonese||
gm|the Gambia|岡比亞|Africa|Gambian|Gambia|
gh|Ghana|加納|Africa|Ghanaian||
gn|Guinea|幾內亞|Africa|Guinean||
gw|Guinea-Bissau|幾內亞比紹|Africa|Bissau-Guinean||Guinea-Bissauan
ke|Kenya|肯尼亞|Africa|Kenyan||
ls|Lesotho|萊索托|Africa|Basotho||Mosotho;Lesothan
lr|Liberia|利比里亞|Africa|Liberian||
ly|Libya|利比亞|Africa|Libyan||
mg|Madagascar|馬達加斯加|Africa|Malagasy||
mw|Malawi|馬拉維|Africa|Malawian||
ml|Mali|馬里|Africa|Malian||
mr|Mauritania|毛里塔尼亞|Africa|Mauritanian||
mu|Mauritius|毛里求斯|Africa|Mauritian||
ma|Morocco|摩洛哥|Africa|Moroccan||
mz|Mozambique|莫桑比克|Africa|Mozambican||
na|Namibia|納米比亞|Africa|Namibian||
ne|Niger|尼日爾|Africa|Nigerien||
ng|Nigeria|尼日利亞|Africa|Nigerian||
rw|Rwanda|盧旺達|Africa|Rwandan||
st|São Tomé and Príncipe|聖多美和普林西比|Africa|São Toméan|Sao Tome and Principe|Sao Tomean
sn|Senegal|塞內加爾|Africa|Senegalese||
sc|Seychelles|塞舌爾|Africa|Seychellois||
sl|Sierra Leone|塞拉利昂|Africa|Sierra Leonean||
so|Somalia|索馬里|Africa|Somali||
za|South Africa|南非|Africa|South African||
ss|South Sudan|南蘇丹|Africa|South Sudanese||
sd|Sudan|蘇丹|Africa|Sudanese||
tz|Tanzania|坦桑尼亞|Africa|Tanzanian|United Republic of Tanzania|
tg|Togo|多哥|Africa|Togolese||
tn|Tunisia|突尼斯|Africa|Tunisian||
ug|Uganda|烏干達|Africa|Ugandan||
zm|Zambia|贊比亞|Africa|Zambian||
zw|Zimbabwe|津巴布韋|Africa|Zimbabwean||
ag|Antigua and Barbuda|安提瓜和巴布達|Americas|Antiguan and Barbudan||
ar|Argentina|阿根廷|Americas|Argentinian||Argentine
bs|the Bahamas|巴哈馬|Americas|Bahamian|Bahamas|
bb|Barbados|巴巴多斯|Americas|Barbadian||
bz|Belize|伯利茲|Americas|Belizean||
bo|Bolivia|玻利維亞|Americas|Bolivian|Plurinational State of Bolivia|
br|Brazil|巴西|Americas|Brazilian||
ca|Canada|加拿大|Americas|Canadian||
cl|Chile|智利|Americas|Chilean||
co|Colombia|哥倫比亞|Americas|Colombian||
cr|Costa Rica|哥斯達黎加|Americas|Costa Rican||
cu|Cuba|古巴|Americas|Cuban||
dm|Dominica|多米尼克|Americas|Dominican||
do|Dominican Republic|多米尼加共和國|Americas|Dominican||
ec|Ecuador|厄瓜多爾|Americas|Ecuadorian||
sv|El Salvador|薩爾瓦多|Americas|Salvadoran||
gd|Grenada|格林納達|Americas|Grenadian||
gt|Guatemala|危地馬拉|Americas|Guatemalan||
gy|Guyana|圭亞那|Americas|Guyanese||
ht|Haiti|海地|Americas|Haitian||
hn|Honduras|洪都拉斯|Americas|Honduran||
jm|Jamaica|牙買加|Americas|Jamaican||
mx|Mexico|墨西哥|Americas|Mexican||
ni|Nicaragua|尼加拉瓜|Americas|Nicaraguan||
pa|Panama|巴拿馬|Americas|Panamanian||
py|Paraguay|巴拉圭|Americas|Paraguayan||
pe|Peru|秘魯|Americas|Peruvian||
kn|Saint Kitts and Nevis|聖基茨和尼維斯|Americas|Kittitian and Nevisian||
lc|Saint Lucia|聖盧西亞|Americas|Saint Lucian||
vc|Saint Vincent and the Grenadines|聖文森特和格林納丁斯|Americas|Vincentian||
sr|Suriname|蘇里南|Americas|Surinamese||
tt|Trinidad and Tobago|特立尼達和多巴哥|Americas|Trinidadian and Tobagonian||
us|the United States|美國|Americas|American|United States;USA|
uy|Uruguay|烏拉圭|Americas|Uruguayan||
ve|Venezuela|委內瑞拉|Americas|Venezuelan|Bolivarian Republic of Venezuela|
au|Australia|澳洲／澳大利亞|Oceania|Australian||
fj|Fiji|斐濟|Oceania|Fijian||
ki|Kiribati|基里巴斯|Oceania|I-Kiribati||Kiribatian
mh|Marshall Islands|馬紹爾群島|Oceania|Marshallese||
fm|Micronesia|密克羅尼西亞|Oceania|Micronesian|Federated States of Micronesia|
nr|Nauru|瑙魯|Oceania|Nauruan||
nz|New Zealand|新西蘭／紐西蘭|Oceania|New Zealand||New Zealander
pw|Palau|帕勞|Oceania|Palauan||
pg|Papua New Guinea|巴布亞新幾內亞|Oceania|Papua New Guinean||
ws|Samoa|薩摩亞|Oceania|Samoan||
sb|Solomon Islands|所羅門群島|Oceania|Solomon Islands||Solomon Islander
to|Tonga|湯加|Oceania|Tongan||
tv|Tuvalu|圖瓦盧|Oceania|Tuvaluan||
vu|Vanuatu|瓦努阿圖|Oceania|Ni-Vanuatu||Vanuatuan
`;

export const ALL_STANDARD_COUNTRIES = Object.freeze(COUNTRY_ROWS.trim().split("\n").map((line) => {
  const [code, name, zh, region, adjective, nameAliases, adjectiveAliases] = line.split("|");
  return Object.freeze({
    id:slug(name), name, zh, code, region, adjective,
    aliases:parseAliases(nameAliases),
    adjectiveAliases:parseAliases(adjectiveAliases),
    trap:spellingTrap(name),
    adjectiveTrap:`${adjective}：這是 ${name.replace(/^the\s+/i, "")} 的國籍／形容詞形式；不要直接照抄國名。`,
    ...(COORDINATE_OVERRIDES[code] || {})
  });
}));

export const COUNTRY_LANGUAGE_BY_CODE = new Map(ALL_STANDARD_COUNTRIES.map((country) => [country.code, country]));

export const CHALLENGE_COUNTRIES = Object.freeze(ALL_STANDARD_COUNTRIES
  .filter((country) => !ESSENTIAL_CODES.has(country.code))
  .map((country) => Object.freeze({ ...country, kind:"challenge" })));

export const WORLD_SPECIALS = Object.freeze([
  { id:"antarctica", name:"Antarctica", zh:"南極洲", code:"aq", region:"Polar regions", kind:"special", lat:-82, lon:20, trap:"Antarctica：Ant + arct + ica；中間有 c，結尾是 -tica。" },
  { id:"north-pole", name:"the North Pole", zh:"北極", region:"Polar regions", kind:"special", lat:89, lon:0, trap:"North Pole：兩個字；North 以 th 結尾，Pole 以 e 結尾。", aliases:["North Pole"] },
  { id:"south-pole", name:"the South Pole", zh:"南極點", region:"Polar regions", kind:"special", lat:-89, lon:0, trap:"South Pole：兩個字；South 以 th 結尾，Pole 以 e 結尾。", aliases:["South Pole"] }
]);

export const WORLD_OCEANS = Object.freeze([
  { id:"north-atlantic-ocean", name:"the North Atlantic Ocean", zh:"北大西洋", region:"Oceans", kind:"ocean", lat:35, lon:-40, trap:"North Atlantic Ocean：Atlantic 中間是 -lant-，三個字要分開。", aliases:["North Atlantic Ocean"] },
  { id:"south-atlantic-ocean", name:"the South Atlantic Ocean", zh:"南大西洋", region:"Oceans", kind:"ocean", lat:-30, lon:-15, trap:"South Atlantic Ocean：South 以 th 結尾；Atlantic 中間是 -lant-。", aliases:["South Atlantic Ocean"] },
  { id:"north-pacific-ocean", name:"the North Pacific Ocean", zh:"北太平洋", region:"Oceans", kind:"ocean", lat:30, lon:-160, trap:"North Pacific Ocean：Pacific 有兩個 c；三個字要分開。", aliases:["North Pacific Ocean"] },
  { id:"south-pacific-ocean", name:"the South Pacific Ocean", zh:"南太平洋", region:"Oceans", kind:"ocean", lat:-25, lon:-125, trap:"South Pacific Ocean：Pacific 是 Pa-ci-fic，不要漏掉第二個 c。", aliases:["South Pacific Ocean"] },
  { id:"indian-ocean", name:"the Indian Ocean", zh:"印度洋", region:"Oceans", kind:"ocean", lat:-20, lon:80, trap:"Indian Ocean：Indian 以 -ian 結尾，兩個字要分開。", aliases:["Indian Ocean"] },
  { id:"arctic-ocean", name:"the Arctic Ocean", zh:"北冰洋", region:"Oceans", kind:"ocean", lat:78, lon:45, trap:"Arctic Ocean：Arctic 有兩個 c，中間是 ct。", aliases:["Arctic Ocean"] },
  { id:"southern-ocean", name:"the Southern Ocean", zh:"南冰洋／南大洋", region:"Oceans", kind:"ocean", lat:-62, lon:95, trap:"Southern Ocean：Southern 中間有 th，結尾是 -ern。", aliases:["Southern Ocean"] }
]);

export const WORLD_MODES = Object.freeze(["Country names", "Country adjectives"]);
export const WORLD_REGIONS_EXPANDED = Object.freeze(["All", "Europe", "Asia", "Americas", "Africa", "Oceania", "Challenge!", "Oceans"]);

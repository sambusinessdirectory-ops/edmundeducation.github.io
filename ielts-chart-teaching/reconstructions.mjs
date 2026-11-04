// Values transcribed from the original IELTS Task 1 figures. Values without
// printed labels are visual estimates from the chart scale and are marked ≈.
export const reconstructions = {
 'T1-001': {kind:'bar',title:'Number of US households (in millions), by annual income',unit:'million households',max:35,approximate:true,categories:['2007','2011','2015'],series:[
  {name:'Less than $25,000',values:[25,29,28]},
  {name:'$25,000–$49,999',values:[27,30,29]},
  {name:'$50,000–$74,999',values:[21,21,21]},
  {name:'$75,000–$99,999',values:[14,14,15]},
  {name:'$100,000 or more',values:[29,28,33]}
 ]},
 'T1-002': {kind:'bar',title:'1968 and 2018: average weekly spending by families',unit:'% of weekly income',max:40,orientation:'horizontal',approximate:true,categories:['Food','Housing','Fuel and power','Clothing and footwear','Household goods','Personal goods','Transport','Leisure'],series:[
  {name:'1968',values:[35,10,6,10,8,8,8,9]},
  {name:'2018',values:[17,19,4,5,8,4,14,22]}
 ]},
 'T1-003': {kind:'bar',title:'Coffee and tea buying and drinking habits in five cities in Australia',unit:'% of city residents',min:20,max:70,approximate:true,categories:['Sydney','Melbourne','Brisbane','Adelaide','Hobart'],series:[
  {name:'Bought fresh coffee in last 4 weeks',values:[44,43,34,35,39]},
  {name:'Bought instant coffee in last 4 weeks',values:[46,48,53,50,55]},
  {name:'Went to a café for coffee or tea in last 4 weeks',values:[61,64,56,50,63]}
 ]},
 'T1-004': {kind:'bar',title:'Households owning and renting accommodation in England and Wales, 1918–2011',unit:'% of households',max:90,approximate:true,categories:['1918','1939','1953','1961','1971','1981','1991','2001','2011'],series:[
  {name:'Owned accommodation',values:[23,32,32,41,50,60,68,69,64]},
  {name:'Rented accommodation',values:[77,68,68,59,50,40,32,31,36]}
 ]},
 'T1-006': {kind:'bar',title:'Percentage of Australian men and women doing regular physical activity, 2010',unit:'%',max:60,categories:['15 to 24','25 to 34','35 to 44','45 to 54','55 to 64','65 and over'],series:[
  {name:'Male',values:[52.8,42.2,39.5,43.1,45.1,46.7]},
  {name:'Female',values:[47.7,48.9,52.5,53.3,53,47.1]}
 ]},
 'T1-007': {kind:'bar',title:'Destinations of UK graduates and postgraduates (excluding full-time work), 2008',unit:'students',panels:[
  {title:'UK graduates',max:30000,categories:['Part-time work','Voluntary work','Further study','Unemployment'],series:[{name:'Graduates',values:[17735,3500,29665,16235]}]},
  {title:'UK postgraduates',max:3000,categories:['Part-time work','Voluntary work','Further study','Unemployment'],series:[{name:'Postgraduates',values:[2535,345,2725,1625]}]}
 ]},
 'T1-008': {kind:'bar',title:'UK telephone calls, by category, 1995–2002',unit:'billion minutes',max:100,approximate:true,categories:['1995','1996','1997','1998','1999','2000','2001','2002'],series:[
  {name:'Local — fixed line',values:[72,79,85,89,90,85,79,72]},
  {name:'National and international — fixed line',values:[37,41,45,48,50,56,60,61]},
  {name:'Mobiles (all calls)',values:[3,5,7,9,13,24,39,45]}
 ]}
};

Object.assign(reconstructions, {
 'T1-009': {kind:'line',title:'Number of participants, by activity, 2000–2020',unit:'participants',min:0,max:70,approximate:true,categories:['2000','2005','2010','2015','2020'],series:[
  {name:'Film club',values:[64,62,60,64,66]},
  {name:'Martial arts',values:[36,32,38,34,36]},
  {name:'Amateur dramatics',values:[26,28,20,14,6]},
  {name:'Table tennis',values:[16,20,20,36,54]},
  {name:'Musical performances',values:[0,0,12,16,18]}
 ]},
 'T1-010': {kind:'line',title:'Percentage of the population living in cities',unit:'% of population',min:0,max:90,approximate:true,categories:['1970','1980','1990','2000','2010','2020','2030','2040'],series:[
  {name:'Philippines',values:[32,34,49,46,43,46,51,56]},
  {name:'Malaysia',values:[30,40,45,60,71,76,81,83]},
  {name:'Thailand',values:[18,23,30,30,32,33,41,50]},
  {name:'Indonesia',values:[14,17,25,30,43,53,61,64]}
 ]},
 'T1-011': {kind:'line',title:'Average monthly change in prices of copper, nickel and zinc (2014)',unit:'% change from previous month',min:-4,max:7,approximate:true,categories:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],series:[
  {name:'Copper',values:[2,1,0.5,0.5,-0.5,-0.5,1,1,1,0.5,0.5,1.5]},
  {name:'Nickel',values:[6,4,1,1,0.5,-3,-1,-1,-1,-2,1,1]},
  {name:'Zinc',values:[1,3,2,1.5,1,-1,-0.5,-0.5,-0.5,-1,1.5,2]}
 ]},
 'T1-012': {kind:'line',title:'Number of shop closures and openings, 2011–2018',unit:'shops',min:0,max:9000,approximate:true,categories:['2011','2012','2013','2014','2015','2016','2017','2018'],series:[
  {name:'Closures',values:[6400,5900,7200,6500,600,5200,5000,5200]},
  {name:'Openings',values:[8500,4000,5000,6200,4000,4000,4200,3000]}
 ]},
 'T1-013': {kind:'line',title:'Electrical appliances and housework in households, 1920–2019',panels:[
  {title:'Households with electrical appliances',unit:'% of households',min:0,max:100,approximate:true,categories:['1920','1940','1960','1980','2000','2019'],series:[
   {name:'Washing machine',values:[40,60,70,65,70,75]},
   {name:'Refrigerator',values:[0,55,90,100,100,100]},
   {name:'Vacuum cleaner',values:[30,50,70,90,100,100]}
  ]},
  {title:'Hours of housework per household',unit:'hours per week',min:0,max:60,approximate:true,categories:['1920','1940','1960','1980','2000','2019'],series:[{name:'Housework',values:[50,35,20,15,15,12]}]}
 ]},
 'T1-014': {kind:'line',title:'Tourists visiting a Caribbean island, 2010–2017',unit:'million visitors',min:0,max:4,approximate:true,categories:['2010','2011','2012','2013','2014','2015','2016','2017'],series:[
  {name:'Visitors staying on cruise ships',values:[0.25,0.5,0.25,0.5,1,1.25,1.5,2]},
  {name:'Visitors staying on island',values:[0.75,0.75,1.25,1.5,1.5,1.5,1.25,1.5]},
  {name:'Total',values:[1,1.25,1.5,2,2.5,2.75,2.75,3.5]}
 ]},
 'T1-015': {kind:'line',title:'Average carbon dioxide emissions per person, 1967–2007',unit:'metric tonnes of CO₂ per person',min:0,max:12,approximate:true,categories:['1967','1977','1987','1997','2007'],series:[
  {name:'United Kingdom',values:[10.8,10.7,10.1,9.5,8.8]},
  {name:'Sweden',values:[8.7,10.3,7,6,5.3]},
  {name:'Italy',values:[4.2,6.3,6.7,7.6,7.6]},
  {name:'Portugal',values:[1.2,2.3,3.2,5.3,5.5]}
 ]},
 'T1-016': {kind:'line',title:'U.S. energy consumption by fuel, 1980–2030',unit:'quadrillion units',min:0,max:50,approximate:true,categories:['1980','1985','1990','1995','2000','2005','2010','2015','2020','2025','2030'],series:[
  {name:'Petrol and oil',values:[35,31,34,33,36,40,42,43,44,47,49]},
  {name:'Coal',values:[16,17,18,22,22,22,24,25,26,29,32]},
  {name:'Natural gas',values:[20,17,19,19,23,22,23,25,25,25,25]},
  {name:'Nuclear',values:[4,5,6,6,6,7.5,7.5,7.5,7.5,7.5,8.5]},
  {name:'Solar and wind',values:[3,4,5,3,4.5,4.5,5.5,5.5,5.5,5.5,6.5]},
  {name:'Hydropower',values:[3,4,4,4.5,3.5,4.5,4,3.5,3.5,3.5,3.5]}
 ]},
 'T1-017': {kind:'line',title:'Goods transported in the UK, 1974–2002',unit:'million tonnes',min:0,max:120,approximate:true,categories:['1974','1978','1982','1986','1990','1994','1998','2002'],series:[
  {name:'Road',values:[70,74,69,73,82,78,95,98]},
  {name:'Water',values:[38,40,55,57,59,56,52,67]},
  {name:'Rail',values:[40,39,33,30,35,27,38,42]},
  {name:'Pipeline',values:[4,6,13,13,16,16,23,23]}
 ]}
});

Object.assign(reconstructions, {
 'T1-018': {kind:'pie',title:'Nutrients in typical meals in the USA',categories:['Breakfast','Lunch','Dinner','Snacks'],panels:[
  {title:'Sodium',values:[14,29,43,14]},
  {title:'Saturated fat',values:[16,26,37,21]},
  {title:'Added sugar',values:[16,19,23,42]}
 ]},
 'T1-019': {kind:'pie',title:'Water use in six areas of the world',categories:['Agricultural use','Domestic use','Industrial use'],panels:[
  {title:'North America',values:[39,13,48]},
  {title:'South America',values:[71,19,10]},
  {title:'Europe',values:[32,15,53]},
  {title:'Africa',values:[84,9,7]},
  {title:'Central Asia',values:[88,7,5]},
  {title:'South East Asia',values:[81,7,12]}
 ]},
 'T1-020': {kind:'pie',title:'Other languages spoken by British students',categories:['No other language','French only','German only','Spanish only','Another language','Two other languages'],panels:[
  {title:'2000',values:[20,15,10,30,15,10]},
  {title:'2010',values:[10,10,10,35,20,15]}
 ]},
 'T1-021': {kind:'pie',title:'Australian household energy use and greenhouse gas emissions',categories:['Heating','Water heating','Refrigeration','Other appliances','Lighting','Cooling'],panels:[
  {title:'Household energy use',values:[42,30,7,15,4,2]},
  {title:'Greenhouse gas emissions',values:[15,32,14,28,8,3]}
 ]},
 'T1-022': {kind:'pie',title:'Population by age in Yemen and Italy, 2000 and 2050',categories:['0–14 years','15–59 years','60+ years'],panels:[
  {title:'Yemen · 2000',values:[50.1,46.3,3.6]},
  {title:'Yemen · 2050',values:[37,57.3,5.7]},
  {title:'Italy · 2000',values:[14.3,61.6,24.1]},
  {title:'Italy · 2050',values:[11.5,46.2,42.3]}
 ]},
 'T1-023': {kind:'pie',title:'Total School Spending',categories:['Teachers’ salaries','Furniture and equipment','Resources e.g. books','Other workers’ salaries','Insurance'],panels:[
  {title:'Total School Spending 1981',values:[40,15,15,28,2]},
  {title:'Total School Spending 1991',values:[50,5,20,22,3]},
  {title:'Total School Spending 2001',values:[45,23,9,15,8]}
 ]}
});

Object.assign(reconstructions, {
 'T1-043': {kind:'table',title:'Population of New York City and its districts, 1800–2000',panels:[
  {title:'New York City · all five districts',columns:['Year','Population'],rows:[[1800,79216],[1900,3437202],[2000,8009185]]},
  {title:'Manhattan',columns:['Year','Population','% of total city population'],rows:[[1800,60515,'76%'],[1900,1850093,'54%'],[2000,1538096,'19%']]},
  {title:'Other districts · Brooklyn, Bronx, Queens and Staten Island',columns:['Year','Population','% of total city population'],rows:[[1800,18701,'24%'],[1900,1587109,'46%'],[2000,6471089,'81%']]}
 ]},
 'T1-044': {kind:'table',title:'Fairtrade coffee and banana sales in five European countries',panels:[
  {title:'Coffee',unit:'millions of euros',columns:['Country','1999','2004'],rows:[['UK',1.5,20],['Switzerland',3,6],['Denmark',1.8,2],['Belgium',1,1.7],['Sweden',0.8,1]]},
  {title:'Bananas',unit:'millions of euros',columns:['Country','1999','2004'],rows:[['Switzerland',15,47],['UK',1,5.5],['Belgium',0.6,4],['Sweden',1.8,1],['Denmark',2,0.9]]}
 ]},
 'T1-045': {kind:'table',title:'World Metro (MRT) systems',columns:['City','Year completed','Total length (km)','Carrying capacity per year (millions)'],rows:[['London',1863,1100,548],['Paris',1890,594,850],['Tokyo',1904,149,1434],['Washington DC',1921,114,70],['Kyoto',1980,11,11],['Los Angeles',2001,14,90]]},
 'T1-046': {kind:'table',title:'Nights spent by tourists in Germany, 2016–2022',columns:['Year','Domestic tourists (million)','International tourists (million)'],rows:[[2016,366.4,80.8],[2017,375.6,83.9],[2018,390.3,87.7],[2019,405.7,89.9],[2020,270.3,32],[2021,279.23,31.01],[2022,382.62,68.09]]},
 'T1-047': {kind:'table',title:'Worldwide mobile phone sales, 2005 and 2006',unit:'% market share',columns:['Company','2005','2006'],rows:[['Nokia',32.5,35],['Motorola',17.7,21.1],['Samsung',12.7,11.8],['Sony Ericsson',6.3,7.4],['L.G',6.7,6.3],['BenQ Mobile',4.9,2.4],['Others',19.2,16.2],['Total','100.0','100.0']]},
 'T1-048': {kind:'table',title:'First-year students rating aspects of their course “very good”',unit:'% of students',columns:['Course','Pre-course information','Teaching quality','Tutor support','Resources (print)','Resources (other)'],rows:[['Economics','55%','95%','92%','59%','62%'],['Law','72%','67%','79%','70%','80%'],['Commerce','95%','95%','93%','81%','85%']]},
 'T1-049': {kind:'table',title:'International tourist arrivals, 2009 and 2010',columns:['Country','2009 (million)','2010 (million)','Change'],rows:[['France',76,76,'0'],['US',66,67,'1.5%'],['Spain',55,56,'1.8%'],['UK',55,57,'3.6%'],['Italy',44,45,'2.3%'],['Turkey',33,45,'33%'],['China',22,34,'55%'],['Germany',11,23,'109%'],['Hong Kong',10,9,'−11%']]},
 'T1-050': {kind:'table',title:'Management roles held by women in four industries, 2006',columns:['Position','Finance','Manufacturing','IT','Hospitality'],rows:[['Managers','16.39%','9.00%','16.04%','33.14%'],['Executives','4.58%','1.98%','12.82%','19.9%'],['CEOs','1.98%','1.21%','6.58%','20.6%']]},
 'T1-051': {kind:'table',title:'Consumption of rice, wheat and maize in four countries',unit:'calories per person per day',columns:['Country','Rice','Wheat','Maize'],rows:[['Cambodia',1445,18,103],['Poland',19,865,0],['Egypt',501,1095,578],['Mexico',57,275,1083]]},
 'T1-052': {kind:'table',title:'Secondary school attendance by school type',unit:'% of pupils',columns:['School type','2000','2005','2009'],rows:[['Specialist schools','12%','11%','10%'],['Grammar schools','24%','19%','12%'],['Voluntary-controlled schools','52%','38%','20%'],['Community schools','12%','32%','58%']]},
 'T1-053': {kind:'table',title:'Cost of minimum daily water requirement',columns:['Country','Daily cost per person (US$)','Cost as percentage of average daily wage'],rows:[['Tanzania','6.4 cents','5.7%'],['Uganda','4.1 cents','3.2%'],['Pakistan','1.76 cents','1.1%'],['UK','1.3 cents','0.013%'],['US','0.85 cents','0.006%']]}
});

Object.assign(reconstructions, {
 'T1-054': {kind:'mixed',title:'Little Chalfont Library',panels:[
  {kind:'pie',title:'Age of library members (2016)',categories:['Children','Young adults 13–17','Adults 18–64','Adults 65 and over'],values:[22,15,51,12]},
  {kind:'table',title:'Total loans by category (2016)',columns:['Category','Share'],rows:[['Children’s fiction','38%'],['Children’s non-fiction','6%'],['Children’s DVDs','1%'],['Young adults','2%'],['Adult fiction','38%'],['Adult non-fiction','13%'],['Adult audio books','2%']]},
  {kind:'bar',title:'Total number of loans (2007–2016)',unit:'loans',max:25000,approximate:true,categories:['2007','2008','2009','2010','2011','2012','2013','2014','2015','2016'],series:[{name:'Loans',values:[15600,18900,19000,20600,21000,20700,19500,20700,21300,21600]}]}
 ]},
 'T1-055': {kind:'mixed',title:'Dance classes for young people',panels:[
  {kind:'pie',title:'Location of dance classes',categories:['Private studios','School halls (after-school)','College-based studios','Community halls and other'],values:[48,24,10,18]},
  {kind:'bar',title:'Types of dance classes by age group',unit:'students',orientation:'horizontal',max:700,approximate:true,categories:['Ballet','Tap','Modern'],series:[{name:'Under 11',values:[600,450,300]},{name:'11–16',values:[300,420,520]}]}
 ]},
 'T1-056': {kind:'mixed',title:'Police budget, 2017–2018',panels:[
  {kind:'table',title:'Budget sources',unit:'£ million',columns:['Source','2017','2018'],rows:[['National government',175.5,177.8],['Local taxes',91.2,102.3],['Other sources (e.g. grants)',38,38.5],['Total',304.7,318.6]]},
  {kind:'pie',title:'Spending in 2017',categories:['Salaries (officers and staff)','Technology','Buildings and transport'],values:[75,8,17]},
  {kind:'pie',title:'Spending in 2018',categories:['Salaries (officers and staff)','Technology','Buildings and transport'],values:[69,14,17]}
 ]},
 'T1-057': {kind:'mixed',title:'Export earnings, 2015–2016',panels:[
  {kind:'bar',title:'Value of exports',unit:'US$ billion',max:70,approximate:true,categories:['Petroleum products','Engineered goods','Gems and jewellery','Agricultural products','Textiles'],series:[{name:'2015',values:[61,57,43,31,25]},{name:'2016',values:[63,62,41,32,31]}]},
  {kind:'table',title:'Percentage change in values',columns:['Product category','2015–2016 change'],rows:[['Petroleum products','+3%'],['Engineered goods','+8.5%'],['Gems and jewellery','−5.18%'],['Agricultural products','+0.81%'],['Textiles','+15.24%']]}
 ]},
 'T1-059': {kind:'mixed',title:'Ashdown Museum visitors and satisfaction',panels:[
  {kind:'table',title:'Total visitors',columns:['Period','Visitors'],rows:[['Before refurbishment',74000],['After refurbishment',92000]]},
  {kind:'pie',title:'Satisfaction before refurbishment',categories:['Very satisfied','Satisfied','Dissatisfied','Very dissatisfied','No response'],values:[15,30,40,10,5]},
  {kind:'pie',title:'Satisfaction after refurbishment',categories:['Very satisfied','Satisfied','Dissatisfied','Very dissatisfied','No response'],values:[35,40,15,5,5]}
 ]}
});
reconstructions['T1-058']={...reconstructions['T1-057']};
reconstructions['T1-060']={...reconstructions['T1-059']};

Object.assign(reconstructions, {
 'T1-024': {kind:'process',title:'How bamboo fabric is made',stages:[
  {label:'Plant bamboo',detail:'Spring'},
  {label:'Harvest bamboo',detail:'Autumn'},
  {label:'Cut into strips'},
  {label:'Crush strips',detail:'Make liquid pulp'},
  {label:'Filter',detail:'Separate long fibres from liquid'},
  {label:'Soften fibres',detail:'Add water and amine oxide'},
  {label:'Spin',detail:'Make yarn'},
  {label:'Weave',detail:'Make fabric'},
  {label:'Make clothing',detail:'Fabric becomes garments'}
 ]},
 'T1-025': {kind:'process',title:'Biofuel production: how ethanol is made',stages:[
  {label:'Plants and trees grow',detail:'Sunlight and carbon dioxide supply energy'},
  {label:'Harvest plants and trees'},
  {label:'Pre-process biomass',detail:'Carbon dioxide is released'},
  {label:'Extract cellulose'},
  {label:'Process cellulose into sugars'},
  {label:'Add microbes',detail:'Sugars are converted into ethanol'},
  {label:'Use ethanol as fuel',detail:'Cars, trucks and aircraft release carbon dioxide'}
 ],cycle:'Carbon dioxide returns to growing plants'},
 'T1-026': {kind:'process',title:'How sugar is produced from sugar cane',stages:[
  {label:'Grow sugar cane',detail:'12–18 months'},
  {label:'Harvest',detail:'By hand or machine'},
  {label:'Crush',detail:'Extract cane juice'},
  {label:'Purify juice',detail:'Pass through limestone filter'},
  {label:'Evaporate',detail:'Heat juice into syrup'},
  {label:'Centrifuge',detail:'Separate sugar crystals from syrup'},
  {label:'Dry and cool',detail:'Finished sugar'}
 ]},
 'T1-027': {kind:'process',title:'How plastic bottles are recycled',stages:[
  {label:'Discard used bottles',detail:'Put them in recycling bins'},
  {label:'Collect bottles',detail:'Truck takes them to recycling centre'},
  {label:'Sort bottles',detail:'Select recyclable plastic'},
  {label:'Compress into blocks'},
  {label:'Crush and wash'},
  {label:'Produce plastic pellets'},
  {label:'Heat pellets',detail:'Form raw material'},
  {label:'Prepare raw material'},
  {label:'Make new products',detail:'Bottles, containers, T-shirts, bags and pencils'}
 ],cycle:'New bottles can be recycled again'},
 'T1-028': {kind:'process',title:'Manufacturing instant noodles',stages:[
  {label:'Store flour',detail:'Storage silos'},
  {label:'Mix flour',detail:'Add water and oil'},
  {label:'Roll into dough sheets'},
  {label:'Cut dough strips'},
  {label:'Shape noodle discs'},
  {label:'Cook and dry',detail:'Cook in oil'},
  {label:'Fill cups',detail:'Add vegetables and spices'},
  {label:'Label and seal cups'}
 ]},
 'T1-029': {kind:'process',title:'Hydroelectric power station',panels:[
  {title:'Day: generate electricity',stages:[{label:'River feeds high-level reservoir'},{label:'Open intake in dam'},{label:'Water flows to reversible turbines'},{label:'Generator produces electricity'},{label:'Power lines carry electricity to national grid'},{label:'Water collects in low-level reservoir'}]},
  {title:'Night: pump water back',stages:[{label:'Close intake in dam'},{label:'Reverse turbines'},{label:'Pump water uphill'},{label:'Refill high-level reservoir'}],cycle:'Repeats next day'}
 ]},
 'T1-030': {kind:'process',title:'Geothermal power plant',stages:[
  {label:'Supply cold water'},
  {label:'Pump water down injection well',detail:'4.5 km underground'},
  {label:'Heat water in geothermal zone',detail:'Hot rocks'},
  {label:'Pump hot water up production well'},
  {label:'Condenser produces steam'},
  {label:'Steam drives turbine'},
  {label:'Turbine powers generator',detail:'Electricity flows to grid'}
 ]},
 'T1-031': {kind:'process',title:'Life cycle of the salmon',stages:[
  {label:'Eggs in upper river',detail:'Slow-moving water, reeds and small stones; 5–6 months'},
  {label:'Fry in lower river',detail:'Fast-moving water; 3–8 cm; about 4 years'},
  {label:'Smolt migrates to open sea',detail:'12–15 cm'},
  {label:'Adult salmon grows at sea',detail:'70–76 cm; about 5 years'},
  {label:'Adult returns upstream',detail:'Lays eggs in upper river'}
 ],cycle:'Life cycle begins again'},
 'T1-032': {kind:'process',title:'Cement and concrete production',panels:[
  {title:'Cement production',stages:[{label:'Combine limestone and clay'},{label:'Crush into powder'},{label:'Mix powder'},{label:'Heat in rotating heater'},{label:'Grind heated material'},{label:'Bag cement'}]},
  {title:'Concrete production',stages:[{label:'Add gravel',detail:'50%'},{label:'Add sand',detail:'25%'},{label:'Add cement',detail:'15%'},{label:'Add water',detail:'10%'},{label:'Rotate concrete mixer',detail:'Finished concrete'}]}
 ]}
});

const mf=(label,x,y,w=16,h=12,kind='facility')=>({label,x,y,w,h,kind});
Object.assign(reconstructions, {
 'T1-033': {kind:'map',title:'Beechwood Farm, 1950 and today',panels:[
  {title:'1950',paths:[{d:'M 0 32 Q 28 18 52 0',kind:'road',label:'Main road'},{d:'M 0 20 Q 15 53 38 76 T 100 75',kind:'water',label:'River'},{d:'M 35 22 L 61 55 L 100 45',kind:'track',label:'Farm tracks'}],features:[mf('Fruit trees',18,30,17,14,'field'),mf('Soft fruits',32,49,18,14,'field'),mf('Vegetables',45,65,18,14,'field'),mf('Sheep',70,20,18,15,'field'),mf('Barn',77,49,16,10),mf('Farmhouse',72,65,19,11),mf('Chickens',70,80,17,10,'field')]},
  {title:'Today',paths:[{d:'M 0 32 Q 28 18 52 0',kind:'road',label:'Main road'},{d:'M 0 20 Q 15 53 38 76 T 100 75',kind:'water',label:'River'},{d:'M 35 22 L 61 55 L 100 45 M 61 55 L 61 80',kind:'road',label:'Farm roads'}],features:[mf('Fruit trees',18,30,17,14,'field'),mf('Soft fruits',32,49,18,14,'field'),mf('Vegetables',45,69,18,14,'field'),mf('Farm shop',39,30,14,11),mf('Parking',52,16,14,10),mf('Camping field',58,27,20,17,'field'),mf('Solar panels',80,12,18,14),mf('Parking',86,39,12,9),mf('Holiday cottages',77,51,20,12,'housing'),mf('Farmhouse',73,67,18,10),mf('Barn',61,73,10,10),mf('Chickens',72,82,17,10,'field')]}
 ]},
 'T1-034': {kind:'map',title:'Porth Harbour in 2000 and today',panels:[
  {title:'2000',paths:[{d:'M 5 0 L 5 90 M 5 75 Q 40 80 80 65',kind:'road',label:'Main road and harbour road'},{d:'M 45 15 L 58 45 M 65 12 L 70 45',kind:'water',label:'Harbour water and docks'}],features:[mf('Public beach',66,3,18,9,'field'),mf('Dock',52,21,14,10),mf('Passenger ferries',67,35,20,10),mf('Marina · private yachts',20,25,21,20,'water'),mf('Fishing boats',24,54,18,13,'water'),mf('Showers & toilets',7,27,13,12),mf('Car park',7,43,13,10),mf('Car park',8,61,14,11),mf('Lifeboat',65,59,12,8),mf('Castle · disused',75,72,18,16),mf('Public beach',63,88,20,8,'field')]},
  {title:'Today',paths:[{d:'M 5 0 L 5 90 M 5 75 Q 40 80 80 65',kind:'road',label:'Main road and harbour road'},{d:'M 40 15 L 50 45 M 55 15 L 62 45 M 70 12 L 72 45',kind:'water',label:'Expanded docks'}],features:[mf('Public beach',66,3,18,9,'field'),mf('Dock',52,21,14,10),mf('Passenger ferries',67,35,20,10),mf('Fishing boats',20,25,21,20,'water'),mf('Marina · private yachts',20,48,21,18,'water'),mf('Showers & toilets',7,27,13,12),mf('Car park',7,43,13,10),mf('Showers & toilets',7,57,13,10),mf('Car park',7,69,14,10),mf('Cafés & shops',42,61,20,10),mf('Lifeboat',65,59,12,8),mf('Hotel',75,72,18,16,'housing'),mf('Private beach',63,88,20,8,'field')]}
 ]},
 'T1-035': {kind:'map',title:'Central Library, 20 years ago and today',panels:[
  {title:'20 years ago',features:[mf('CDs, videos and computer games',3,4,42,22),mf('Children’s books',65,4,31,22),mf('Adult fiction',3,32,42,26),mf('Adult non-fiction',65,32,31,26),mf('Tables and chairs',46,30,18,38),mf('Reading room',3,68,42,24),mf('Enquiry desk',65,68,31,24),mf('Entrance',46,90,18,8)]},
  {title:'Today',features:[mf('Storytelling events and children’s fiction',3,4,42,30),mf('Lecture room',65,4,31,22),mf('Reference books',3,40,42,20),mf('Adult fiction',65,31,31,17),mf('Information desk',65,51,31,10),mf('Self-service machines',65,65,31,10),mf('Computer room',3,72,42,21),mf('Café',65,78,31,15),mf('Entrance',46,90,18,8)]}
 ]},
 'T1-036': {kind:'map',title:'Norbiton industrial area now and planned future development',panels:[
  {title:'Now',paths:[{d:'M 0 15 Q 50 22 100 18',kind:'water',label:'River'},{d:'M 0 88 L 100 88 M 50 88 L 50 56 M 52 54 L 90 54',kind:'road',label:'Road and central roundabout'}],features:[mf('Farmland',40,2,25,12,'field'),mf('Factories',35,41,22,15),mf('Factories',62,43,24,15),mf('Roundabout',45,55,11,11),mf('Town',5,55,16,14,'housing')]},
  {title:'Planned development',paths:[{d:'M 0 15 Q 50 22 100 18',kind:'water',label:'River'},{d:'M 0 88 L 100 88 M 50 88 L 50 10 M 52 54 L 90 54 M 50 54 L 30 37',kind:'road',label:'New roads and bridge'}],features:[mf('Farmland',67,3,25,12,'field'),mf('Housing',28,9,25,12,'housing'),mf('Housing',25,34,20,12,'housing'),mf('Housing',60,44,25,12,'housing'),mf('Playground',67,24,18,14,'garden'),mf('School',87,47,12,20),mf('Medical centre',56,67,17,14),mf('Shops',32,65,15,13),mf('Roundabout',45,55,11,11),mf('Town',5,55,16,14,'housing')]}
 ]},
 'T1-037': {kind:'map',title:'Southwest Airport now and after development',panels:[
  {title:'Now',paths:[{d:'M 50 55 L 50 24',kind:'road',label:'Walkway to gates'}],features:[mf('Gates 1–8',39,8,22,17),mf('Security',5,49,22,13),mf('Passport control',28,49,22,13),mf('Customs',52,49,18,13),mf('Check-in',7,68,20,13),mf('Café',30,68,18,13),mf('Departures',10,86,30,9),mf('Arrivals',62,86,25,9)]},
  {title:'After development',paths:[{d:'M 50 55 L 50 25 M 50 25 L 28 7 M 50 25 L 72 7',kind:'road',label:'Sky train to two gate wings'}],features:[mf('Gates 1–18',37,5,26,16),mf('Shops',10,34,18,11),mf('Security',5,49,22,13),mf('Passport control',28,49,22,13),mf('Customs',52,49,18,13),mf('Bag drop',5,67,18,11),mf('Check-in',27,67,18,11),mf('Café',49,67,13,11),mf('ATM',68,67,10,11),mf('Car hire',80,67,15,11),mf('Departures',10,86,30,9),mf('Arrivals',62,86,25,9)]}
 ]}
});

Object.assign(reconstructions, {
 'T1-038': {kind:'map',title:'Grange Park in 1920 and today',panels:[
  {title:'1920',features:[mf('Arnold Avenue',33,0,33,8),mf('Entrance',43,8,14,9),mf('Rose garden',12,10,20,16,'garden'),mf('Rose garden',65,10,20,16,'garden'),mf('Pond for water plants',80,13,18,18,'water'),mf('Stage for musicians',18,38,20,19),mf('Fountain',43,43,15,15,'water'),mf('Seats',2,38,12,10),mf('Seats',87,38,12,10),mf('Rose garden',12,72,20,15,'garden'),mf('Glasshouse',70,72,24,14),mf('Entrance',43,87,14,9),mf('Eldon Street',33,96,33,4)]},
  {title:'Today',features:[mf('Arnold Avenue',33,0,33,8),mf('Entrance',43,8,14,9),mf('Rose garden',12,10,20,16,'garden'),mf('Café',66,9,14,14),mf('Children’s play area',83,9,16,24,'garden'),mf('Amphitheatre for concerts',3,39,27,27),mf('Rose garden',40,37,20,22,'garden'),mf('Seats',61,41,12,10),mf('Water feature',75,67,20,17,'water'),mf('Entrance to underground car park',78,87,20,11),mf('Entrance',43,87,14,9),mf('Eldon Street',33,96,33,4)]}
 ]},
 'T1-039': {kind:'map',title:'Road access to City Hospital in 2007 and 2010',panels:[
  {title:'2007',paths:[{d:'M 18 10 H 70 V 58 H 18 Z',kind:'road',label:'Ring Road'},{d:'M 45 58 V 100 M 0 88 H 100',kind:'road',label:'Hospital Road and City Road'}],features:[mf('City Hospital',25,18,38,25),mf('Ring Road',34,6,23,8),mf('Hospital Road',42,63,15,15),mf('Bus stops',20,72,16,12),mf('Staff and public car park',65,65,26,20),mf('City Road',40,89,20,8)]},
  {title:'2010',paths:[{d:'M 18 10 H 70 V 58 H 18 Z',kind:'road',label:'Ring Road'},{d:'M 45 58 V 100 M 0 88 H 100',kind:'road',label:'Hospital Road and City Road'}],features:[mf('City Hospital',25,18,38,25),mf('Ring Road',34,6,23,8),mf('Roundabout',39,55,15,12),mf('Bus station',8,68,23,18),mf('Staff car park',59,69,19,15),mf('Public car park',75,24,23,20),mf('Roundabout',39,83,15,12),mf('City Road',65,89,20,8)]}
 ]},
 'T1-040': {kind:'map',title:'University sports centre now and after redevelopment',panels:[
  {title:'Present',features:[mf('Outdoor courts',3,24,21,39,'field'),mf('Changing room',28,24,10,39),mf('Gym',40,15,31,11),mf('25 m pool',42,31,22,27,'water'),mf('Seating',66,30,10,29),mf('Outdoor courts',78,24,19,39,'field'),mf('Reception',43,67,21,11),mf('Entrance',44,87,18,9)]},
  {title:'Future plans',features:[mf('Leisure pool',2,19,24,43,'water'),mf('Changing room',27,20,11,41),mf('Gym',40,12,31,11),mf('25 m pool',42,28,18,27,'water'),mf('Seating',61,27,8,30),mf('Sports hall',70,26,15,32),mf('Dance studios',86,19,12,43),mf('Changing room',3,68,18,15),mf('Sports shop',22,68,15,15),mf('Reception',43,65,18,12),mf('Café',65,68,13,15),mf('Changing room',80,68,18,15),mf('Entrance',44,87,18,9)]}
 ]},
 'T1-041': {kind:'map',title:'Grange Park in 1920 and today',panels:[
  {title:'1920',features:[mf('Arnold Avenue',33,0,33,8),mf('Entrance',43,8,14,9),mf('Rose garden',12,10,20,16,'garden'),mf('Rose garden',65,10,20,16,'garden'),mf('Pond for water plants',80,13,18,18,'water'),mf('Stage for musicians',18,38,20,19),mf('Fountain',43,43,15,15,'water'),mf('Seats',2,38,12,10),mf('Seats',87,38,12,10),mf('Rose garden',12,72,20,15,'garden'),mf('Glasshouse',70,72,24,14),mf('Entrance',43,87,14,9),mf('Eldon Street',33,96,33,4)]},
  {title:'Today',features:[mf('Arnold Avenue',33,0,33,8),mf('Entrance',43,8,14,9),mf('Rose garden',12,10,20,16,'garden'),mf('Café',66,9,14,14),mf('Children’s play area',83,9,16,24,'garden'),mf('Amphitheatre for concerts',3,39,27,27),mf('Rose garden',40,37,20,22,'garden'),mf('Seats',61,41,12,10),mf('Water feature',75,67,20,17,'water'),mf('Entrance to underground car park',78,87,20,11),mf('Entrance',43,87,14,9),mf('Eldon Street',33,96,33,4)]}
 ]},
 'T1-042': {kind:'map',title:'Island before and after tourist development',panels:[
  {title:'Before',paths:[{d:'M 2 60 Q 20 10 70 25 Q 95 20 98 50 Q 85 80 30 78 Z',kind:'water',label:'Island coastline'}],features:[mf('Sea',2,2,13,9,'water'),mf('Beach',3,45,15,16,'field'),mf('Palm trees',36,42,20,17,'field'),mf('Palm trees',73,28,19,24,'field'),mf('100 metres',40,88,20,8)]},
  {title:'After',paths:[{d:'M 2 60 Q 20 10 70 25 Q 95 20 98 50 Q 85 80 30 78 Z',kind:'water',label:'Island coastline'},{d:'M 12 50 Q 35 50 50 55 Q 70 40 84 51',kind:'footpath',label:'Footpaths to accommodation'},{d:'M 53 57 L 61 78',kind:'road',label:'Vehicle track to pier'}],features:[mf('Sea',2,2,13,9,'water'),mf('Swimming area',2,35,14,9,'water'),mf('Beach',3,45,15,16,'field'),mf('Restaurant',43,27,18,11),mf('Reception',43,50,17,11),mf('Accommodation',20,41,19,15,'housing'),mf('Accommodation',69,40,20,15,'housing'),mf('Pier',57,74,13,11),mf('Palm trees',76,24,16,15,'field'),mf('100 metres',40,88,20,8)]}
 ]}
});

for(const panel of reconstructions['T1-040'].panels)panel.features.find(feature=>feature.label==='25 m pool').value=25;
for(const panel of reconstructions['T1-042'].panels)panel.features.find(feature=>feature.label==='100 metres').value=100;

// Repeated features remain independent selectable targets rather than a single
// label for an entire cluster.
{
 const today=reconstructions['T1-033'].panels[1];
 today.features=today.features.filter(feature=>feature.label!=='Solar panels');
 today.features.push(...[[79,10],[87,10],[79,20],[87,20]].map(([x,y],index)=>mf(`Solar panel ${index+1}`,x,y,7,8)));
}
{
 const [before,after]=reconstructions['T1-035'].panels;
 before.features=before.features.filter(feature=>feature.label!=='Tables and chairs');
 before.features.push(mf('Table and chairs 1',47,31,16,14),mf('Table and chairs 2',47,49,16,14));
 after.features=after.features.filter(feature=>feature.label!=='Self-service machines');
 after.features.push(mf('Sofa 1',3,5,13,8),mf('Sofa 2',31,5,13,8),...[[66,65],[77,65],[88,65]].map(([x,y],index)=>mf(`Self-service ${index+1}`,x,y,10,10)));
}
{
 const [now,future]=reconstructions['T1-036'].panels;
 now.features=now.features.filter(feature=>feature.label!=='Factories');
 now.features.push(...[[34,35],[43,25],[34,54],[59,29],[72,29],[60,46],[74,46],[88,39]].map(([x,y],index)=>mf(`Factory ${index+1}`,x,y,10,8)));
 future.features=future.features.filter(feature=>feature.label!=='Housing');
 future.features.push(...[[31,6],[42,6],[28,32],[36,35],[44,29],[60,43],[72,43],[62,57],[73,57],[37,48]].map(([x,y],index)=>mf(`House ${index+1}`,x,y,9,8,'housing')));
}
{
 const [now,future]=reconstructions['T1-037'].panels;
 now.features=now.features.filter(feature=>feature.label!=='Gates 1–8');
 now.features.push(...Array.from({length:8},(_,index)=>mf(`Gate ${index+1}`,39+(index%4)*6,8+Math.floor(index/4)*9,5,7)));
 future.features=future.features.filter(feature=>feature.label!=='Gates 1–18');
 future.features.push(...Array.from({length:18},(_,index)=>{
  const wing=index<9?0:1,within=index%9;
  return mf(`Gate ${index+1}`,wing?66+(within%3)*8:18+(within%3)*8,5+Math.floor(within/3)*8,7,7);
 }));
}
for(const id of ['T1-038','T1-041']){
 const [before,after]=reconstructions[id].panels;
 before.features=before.features.filter(feature=>feature.label!=='Seats');
 before.features.push(mf('Seats · northwest',2,10,10,10),mf('Seats · north',35,10,10,10),mf('Seats · southwest',2,73,10,10),mf('Seats · south',35,73,10,10),mf('Seats · east',87,38,12,10));
 after.features=after.features.filter(feature=>feature.label!=='Seats');
 after.features.push(mf('Seats · north',44,29,12,8),mf('Seats · west',33,42,9,12),mf('Seats · east',60,42,9,12),mf('Seats · south',44,64,12,8));
}
{
 const before=reconstructions['T1-039'].panels[0];
 before.features=before.features.filter(feature=>feature.label!=='Bus stops');
 before.features.push(...Array.from({length:6},(_,index)=>mf(`Bus stop ${index+1}`,index%2?60:24,63+Math.floor(index/2)*10,10,7)));
}
{
 const future=reconstructions['T1-040'].panels[1];
 future.features=future.features.filter(feature=>feature.label!=='Dance studios');
 future.features.push(mf('Dance studio 1',86,19,12,20),mf('Dance studio 2',86,42,12,20));
}
{
 const after=reconstructions['T1-042'].panels[1];
 after.features=after.features.filter(feature=>feature.label!=='Accommodation');
 after.features.push(...[[19,44],[25,36],[32,34],[25,61],[33,66],[40,65],[54,34],[62,30],[70,30],[78,35],[59,50],[68,53],[76,52]].map(([x,y],index)=>mf(`Cabin ${index+1}`,x,y,7,8,'housing')));
}

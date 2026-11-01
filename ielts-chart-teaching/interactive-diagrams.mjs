import {reconstructions} from './reconstructions.mjs?v=20261101-5';
import {diagramTextZones} from './diagram-text-zones.mjs';
import {sourceMapRoutes,sourceProcessFlows,sourceMapFeatures} from './source-routes.mjs';

const z=(label,x,y,w,h,value=null)=>({label,x,y,w,h,value});
const processDiagrams={
 'T1-024':{width:1085,height:981,zones:[
  z('Plant bamboo plants · spring',5,8,22,25),z('Bamboo plants',11,16,11,17),
  z('Harvest bamboo · autumn',38,8,21,25),z('Harvested bamboo',45,17,11,16),
  z('Cut bamboo into strips',70,8,25,26),z('Cutting blade and bamboo strips',73,19,23,13),
  z('Crush strips into liquid pulp',69,42,26,25),z('Bamboo pulp',73,53,18,12),
  z('Filter pulp · separate long fibres from liquid',36,42,26,25),z('Funnel filter',43,54,12,11),
  z('Soften fibres · water and amine oxide',5,42,23,24),z('Softened fibres',11,55,12,9),
  z('Spin fibres into yarn',5,78,23,20),z('Yarn',11,86,13,11),
  z('Weave yarn into fabric',38,78,23,20),z('Woven bamboo fabric',43,87,14,10),
  z('Finished clothing',72,78,25,20),z('Shirt and socks',75,80,21,17)
 ]},
 'T1-025':{width:875,height:925,zones:[
  z('Sunlight and carbon dioxide energy',12,7,31,15),z('Plants and trees grow',9,21,29,20),
  z('Harvesting',34,24,24,13),z('Pre-processing biomass',61,34,24,19),
  z('Cellulose',36,48,25,12),z('Processing cellulose',9,38,27,22),
  z('Sugars',9,59,23,19),z('Microbes added',25,78,21,18),z('Ethanol',34,64,21,14),
  z('Car fuel use',58,67,16,11),z('Truck fuel use',57,77,19,11),z('Aircraft fuel use',44,86,18,10),
  z('Carbon dioxide from fuel use',74,62,20,26),z('Carbon dioxide returns to plants',74,22,19,39)
 ]},
 'T1-026':{width:1074,height:1255,zones:[
  z('Grow sugar cane',38,4,25,21),z('12–18 months of growth',42,5,18,7),
  z('Harvest by machine',17,27,31,20),z('Harvest by hand',52,27,23,20),
  z('Crush cane',36,48,27,24),z('Sugar canes',46,51,11,11),z('Extracted juice',37,65,22,8),
  z('Purify juice with limestone filter',70,60,22,20),z('Limestone filter',75,68,16,12),
  z('Evaporator turns juice to syrup',47,79,22,19),z('Heat under evaporator',48,93,21,6),
  z('Centrifuge separates crystals',25,80,23,18),z('Dry and cool sugar',8,61,22,20),
  z('Finished sugar',13,66,13,10)
 ]},
 'T1-027':{width:1108,height:1146,zones:[
  z('Place used bottles in recycling bin',10,7,26,28),z('Recycling collection truck',36,8,27,27),
  z('Sort bottles at recycling centre',65,8,28,29),z('Accepted recyclable bottles',70,24,12,11),
  z('Rejected bottles',82,24,12,11),z('Compress bottles into blocks',69,39,25,20),
  z('Crush plastic',68,61,27,15),z('Wash crushed plastic',71,79,23,16),
  z('Produce plastic pellets',43,67,21,19),z('Heat pellets to form raw material',22,81,30,18),
  z('Raw material',11,67,28,18),z('New plastic bottle',12,42,7,19),
  z('New plastic containers',17,50,8,10),z('New T-shirt',22,43,13,19),
  z('New shopping bag',35,43,8,17),z('New pencils',26,58,18,8)
 ]},
 'T1-028':{width:1198,height:928,zones:[
  z('Flour storage silos',13,12,24,19),z('Flour truck',36,19,13,13),
  z('Add water and oil',5,51,16,12),z('Mixer',17,42,14,23),
  z('Roll dough into sheets',30,41,15,24),z('Cut dough into strips',44,41,14,24),
  z('Shape noodle discs',58,42,14,23),z('Cook noodles in oil and dry',72,41,18,27),
  z('Cups',83,52,15,18),z('Add vegetables and spices',61,66,25,13),
  z('Label and seal cups',74,77,23,20),z('Finished noodle cups',60,88,19,10)
 ]},
 'T1-029':{width:1108,height:842,zones:[
  z('River',3,8,21,15),z('High-level reservoir',10,19,27,26),
  z('Dam',26,16,13,30),z('Intake · open by day, closed by night',16,39,29,19),
  z('Daytime water flow downhill',35,38,25,23),z('Nighttime water pumped uphill',32,51,27,22),
  z('Reversible turbines',56,57,24,18),z('Generator',58,36,15,18),
  z('Power station',58,30,22,39),z('Power lines',70,39,20,12),
  z('National grid',86,38,13,11),z('Low-level reservoir',79,52,20,24),
  z('Daytime generation',76,59,10,9),z('Nighttime pumping',74,68,12,9)
 ]},
 'T1-030':{width:1170,height:878,zones:[
  z('Cold water supply',16,25,13,23),z('Injection well',14,44,25,51),
  z('4.5 km depth',6,59,10,16,4.5),z('Cold water pumped down',23,51,14,28),
  z('Geothermal zone · hot rocks',30,76,44,18),z('Production well',75,44,20,51),
  z('Hot water pumped up',78,51,14,25),z('Condenser',77,20,18,29),
  z('Steam',67,23,14,12),z('Turbine',56,16,15,22),
  z('Generator',41,16,15,22),z('Electricity transmission tower',28,4,14,41)
 ]},
 'T1-031':{width:986,height:1088,zones:[
  z('Upper river · slow-moving',31,1,36,31),z('Reeds',35,10,17,18),
  z('Small stones',34,22,17,6),z('Salmon eggs',39,27,11,6),
  z('Egg stage · 5–6 months',50,8,18,8),z('Fry',18,27,13,10),
  z('Lower river · fast-moving',5,39,35,21),z('Fry lives about 4 years',7,47,16,10),
  z('Smolt',30,67,17,14),z('Open sea',64,64,34,19),
  z('About 5 years at sea',65,68,13,9),z('Adult salmon',50,43,25,16),
  z('Fry length · 3–8 cm',6,84,27,15),z('Smolt length · 12–15 cm',34,84,30,15),
  z('Adult length · 70–76 cm',66,84,30,15)
 ]},
 'T1-032':{width:1290,height:844,zones:[
  z('Cement production',4,6,44,88),z('Limestone',10,17,17,19),
  z('Clay',25,17,11,16),z('Crusher',13,29,18,14),
  z('Powder',14,38,18,12),z('Mixer',26,27,16,16),
  z('Rotating heater',15,39,28,30),z('Heat source',6,51,14,13),
  z('Grinder',12,65,25,12),z('Bags of cement',22,74,23,18),
  z('Concrete production',51,6,45,88),z('Cement · 15%',55,17,16,16,15),
  z('Water · 10%',77,12,17,20,10),z('Sand · 25%',55,33,18,17,25),
  z('Gravel · 50%',78,34,17,18,50),z('Concrete mixer',60,46,29,38),

 ]}
};

const mapBoxes={
 'T1-033':{width:960,height:1305,boxes:[{x:15,y:10,w:70,h:38},{x:15,y:54,w:70,h:38}]},
 'T1-034':{width:827,height:1258,boxes:[{x:5,y:5,w:90,h:43},{x:5,y:55,w:90,h:43}]},
 'T1-035':{width:918,height:861,boxes:[{x:7,y:5,w:86,h:40},{x:7,y:55,w:86,h:40}]},
 'T1-036':{width:950,height:1213,boxes:[{x:8,y:5,w:84,h:42},{x:8,y:55,w:84,h:42}]},
 'T1-037':{width:1072,height:1133,boxes:[{x:8,y:12,w:40,h:70},{x:52,y:12,w:42,h:70}]},
 'T1-038':{width:892,height:1071,boxes:[{x:2,y:5,w:94,h:40},{x:2,y:53,w:94,h:40}]},
 'T1-039':{width:984,height:1057,boxes:[{x:18,y:1,w:66,h:47},{x:18,y:52,w:66,h:45}]},
 'T1-040':{width:1170,height:1026,boxes:[{x:15,y:28,w:70,h:28},{x:14,y:62,w:72,h:34}]},
 'T1-041':{width:892,height:1071,boxes:[{x:2,y:5,w:94,h:40},{x:2,y:53,w:94,h:40}]},
 'T1-042':{width:1170,height:1050,boxes:[{x:1,y:2,w:98,h:45},{x:1,y:51,w:98,h:45}]}
};

const mapDiagrams=Object.fromEntries(Object.entries(mapBoxes).map(([id,config])=>{
 const panels=reconstructions[id].panels;
 const zones=panels.flatMap((panel,panelIndex)=>{
  const box=config.boxes[panelIndex];
  const places=panel.features.map((feature,index)=>({
   label:`${panel.title} · ${feature.label}`,
   x:box.x+(feature.x+feature.w*.18)*box.w/100,y:box.y+(feature.y+feature.h*.18)*box.h/100,
   w:feature.w*.64*box.w/100,h:feature.h*.64*box.h/100,
   value:Number.isFinite(feature.value)?feature.value:null,
   key:`place-${panelIndex}-${index}`
  }));
  const routes=(panel.paths||[]).map((path,index)=>({
   label:`${panel.title} · ${path.label||path.kind||'route'}`,
   path:path.d,box,key:`route-${panelIndex}-${index}`,
   value:null
  }));
  return [...routes,...places];
 });
 return [id,{...config,zones:(sourceMapRoutes[id]||sourceMapFeatures[id])?[...(sourceMapRoutes[id]||zones.filter(zone=>zone.path)),...(sourceMapFeatures[id]||zones.filter(zone=>!zone.path))]:zones}];
}));

// Flow arrows are selectable independently of their source and destination objects.
const flowRegions={
 'T1-024':[
  z('Bamboo growing → harvest',28,17,11,5),z('Harvest → cutting',61,17,11,5),
  z('Cutting → crushing',82,33,5,10),z('Crushing → filtering',61,56,9,5),
  z('Filtering → softening',28,56,9,5),z('Softening → spinning',14,67,5,11),
  z('Spinning → weaving',29,83,9,5),z('Weaving → finished clothing',62,83,9,5)
 ],
 'T1-025':[
  z('Plants → harvesting',48,29,11,6),z('Harvesting → pre-processing',59,39,11,6),
  z('Pre-processing → cellulose',52,49,10,6),z('Cellulose → processing',28,51,10,6),
  z('Processing → sugars',17,60,6,9),z('Sugars → microbes',26,77,9,7),
  z('Microbes → ethanol',37,68,8,10),z('Ethanol → fuel use',54,72,9,8),
  z('Carbon dioxide → plant growth',78,18,14,11)
 ],
 'T1-026':[
  z('Growing → harvesting',46,20,8,8),z('Harvesting → crushing',47,42,10,8),
  z('Crushing → purifying',64,62,9,7),z('Purifying → evaporating',75,76,8,7),
  z('Evaporating → centrifuging',42,86,8,6),z('Centrifuging → drying',22,77,8,7)
 ],
 'T1-027':[
  z('Bottles → collection truck',34,18,10,6),z('Truck → sorting',60,18,9,6),
  z('Sorting → compression',80,33,5,10),z('Compression → crushing',80,56,5,8),
  z('Crushing → washing',80,73,5,8),z('Washing → pellets',60,79,9,6),
  z('Pellets → raw material',36,78,9,6),z('Raw material → new products',15,64,6,10)
 ],
 'T1-028':[
  z('Flour → mixer',36,38,6,8),z('Mixer → dough sheets',30,52,6,7),
  z('Dough sheets → strips',43,52,5,6),z('Dough strips → discs',57,52,5,6),
  z('Noodle discs → cooking',69,52,5,6),z('Cooking → cups',84,64,5,6),
  z('Cups → labelling',80,76,5,7)
 ],
 'T1-029':[
  z('Water flows down during day',41,44,16,9),z('Water pumped up at night',39,56,16,9),
  z('Generator → power lines',71,41,14,6)
 ],
 'T1-030':[
  z('Cold water → injection well',24,39,9,7),z('Hot water → condenser',78,46,9,8),
  z('Steam → turbine',68,25,9,7),z('Turbine → generator',53,26,7,6),
  z('Generator → power grid',34,25,8,6)
 ],
 'T1-031':[
  z('Eggs → fry',17,19,13,11),z('Fry → lower river',12,36,12,10),
  z('Fry → smolt',27,55,10,13),z('Smolt → sea',49,66,15,10),
  z('Adult salmon returns upstream',43,28,16,14)
 ],
 'T1-032':[
  z('Limestone and clay → crusher',19,25,9,7),z('Crusher → mixer',29,34,8,6),
  z('Mixer → rotating heater',28,45,8,7),z('Heater → grinder',17,64,8,7),
  z('Grinder → cement bags',24,74,8,7),z('Ingredients → concrete mixer',71,40,9,8)
 ]
};

const airport=(label,x,y,w,h,value=null)=>z(label,100*x/1072,100*y/1133,100*w/1072,100*h/1133,value);
const airportZones=[
 airport('Now · departures terminal',118,533,188,209),airport('Now · arrivals terminal',306,533,186,209),
 airport('Now · security',121,536,185,30),airport('Now · passport control',121,565,185,29),
 airport('Now · arrivals passport control',306,536,185,30),airport('Now · customs',306,565,185,29),
 airport('Now · check-in',126,605,38,55),airport('Now · café',263,598,43,50),
 airport('Now · walkway to gates',258,342,45,120),airport('Now · gate concourse',255,340,104,127),
 airport('After development · departures terminal',559,537,190,205),airport('After development · arrivals terminal',749,537,228,205),
 airport('After development · shops',560,462,190,75),airport('After development · security',560,538,190,30),
 airport('After development · passport control',560,565,190,30),airport('After development · arrivals passport control',749,538,183,30),
 airport('After development · customs',749,565,183,30),airport('After development · bag drop',564,605,39,62),
 airport('After development · check-in',700,613,39,51),airport('After development · departure café',564,693,40,52),
 airport('After development · arrival café',887,606,42,45),airport('After development · ATM',886,656,44,49),
 airport('After development · car hire',930,691,47,51),airport('After development · sky train',730,288,39,177),
 airport('After development · left gate wing',577,185,175,166),airport('After development · right gate wing',749,185,174,166),
 ...[[1,227,438],[2,227,394],[3,227,349],[4,272,316],[5,326,316],[6,360,349],[7,360,394],[8,360,438]]
 .map(([number,x,y])=>airport(`Now · Gate ${number}`,x,y,25,24,number)),
 ...[[1,671,438],[2,671,394],[3,671,349],[4,635,316],[5,598,286],[6,563,257],[7,571,193],[8,658,185],[9,698,211],[10,782,211],[11,817,185],[12,895,198],[13,918,257],[14,882,286],[15,846,316],[16,797,349],[17,797,394],[18,797,438]]
 .map(([number,x,y])=>airport(`After development · Gate ${number}`,x,y,27,24,number))
];
mapDiagrams['T1-037']={...mapDiagrams['T1-037'],zones:airportZones};

export const interactiveDiagrams=Object.fromEntries(Object.entries({...processDiagrams,...mapDiagrams}).map(([id,diagram])=>[
 id,{...diagram,zones:[...diagram.zones.filter(zone=>!['Cement production','Concrete production','Finished concrete'].includes(zone.label)).map(zone=>id>='T1-024'&&id<='T1-032'?{...zone,x:zone.x+zone.w*.15,y:zone.y+zone.h*.15,w:zone.w*.7,h:zone.h*.7}:zone),...(sourceProcessFlows[id]||flowRegions[id]||[]),...(diagramTextZones[id]||[]).filter(zone=>{const label=zone.label.trim();if(id==='T1-040'&&zone.y<26)return false;return !/^([\W_]+|e\+|oo|wa|NJ\]|ZZ\.|wef E|9°20 5|V2, Factory|EQ\) Housing|aoe AVENUE|for we|nine wl|for cor|Cate Children’s|Ss|Sty|wed|res|@\|Dough.*|©\).*|Vv sheets|KF\]|Se\}|WOe|©O\||\d)$/i.test(label)}).map((zone,index)=>({...zone,key:`text-${index}`}))]}
]));

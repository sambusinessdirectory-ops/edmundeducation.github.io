// Routes are traced in the coordinate space of the original 100 × 100 image.
// Unlike the old schematic paths, these follow the ink in each source figure.
const full={x:0,y:0,w:100,h:100};
const route=(label,key,path)=>({label,key,path,box:full,value:null});
const area=(label,key,x,y,w,h)=>({label,key,x,y,w,h,value:null});
export const sourceMapRoutes={
 'T1-033':[
  route('1950 · Main road','route-0-0','M 15 23 C 25 19 36 15 49 10'),
  route('1950 · River','route-0-1','M 15 15 C 23 23 31 36 43 42 C 57 51 72 49 84 37'),
  route('1950 · Farm tracks','route-0-2','M 36 18 L 56 29 L 84 27 M 56 29 L 60 36 M 60 36 L 67 28'),
  route('Today · Main road','route-1-0','M 15 67 C 25 63 36 59 49 54'),
  route('Today · River','route-1-1','M 15 58 C 23 66 31 79 43 85 C 57 94 72 93 84 81'),
  route('Today · Farm roads','route-1-2','M 36 61 L 56 72 L 84 71 M 56 72 L 59 79 M 59 79 L 67 71')
 ],
 'T1-034':[
  route('2000 · Main road and harbour road','route-0-0','M 8 6 L 8 48 M 8 43 C 22 42 39 40 56 36'),
  route('2000 · Docks','route-0-1','M 47 11 L 52 22 M 56 11 L 63 22 M 64 19 L 71 28'),
  route('Today · Main road and harbour road','route-1-0','M 8 56 L 8 100 M 8 95 C 23 94 42 91 56 87'),
  route('Today · Expanded docks','route-1-1','M 39 65 L 49 76 M 47 62 L 52 73 M 56 62 L 64 73 M 64 69 L 71 78')
 ],
 'T1-036':[
  route('Now · River','route-0-0','M 10 9 C 18 15 35 14 50 13 C 63 15 72 19 83 18 Q 88 18 92 15'),
  route('Now · Roads and roundabout','route-0-1','M 10 41 H 88 M 45 41 V 34 M 45 24 A 5 5 0 1 1 45 34 A 5 5 0 1 1 45 24 M 50 29 H 86'),
  route('Future · River','route-1-0','M 10 59 C 18 65 35 64 50 63 C 63 65 72 69 83 68 Q 88 68 92 65'),
  route('Future · Roads and bridge','route-1-1','M 10 91 H 88 M 45 91 V 84 M 45 74 A 5 5 0 1 1 45 84 A 5 5 0 1 1 45 74 M 50 79 H 85 M 45 74 L 45 60 M 45 60 H 35 M 45 74 L 28 69')
 ],
 'T1-039':[
  route('2007 · Ring Road','route-0-0','M 28 2 H 54 Q 58 2 58 6 V 20 Q 58 24 54 24 H 28 Q 24 24 24 20 V 6 Q 24 2 28 2 Z'),
  route('2007 · Hospital Road and City Road','route-0-1','M 41 24 V 47 M 18 41 H 64'),
  route('2010 · Ring Road','route-1-0','M 28 52 H 54 Q 58 52 58 56 V 69 Q 58 73 53 73 H 47 Q 45 68 41 68 Q 37 68 35 73 H 28 Q 24 73 24 69 V 56 Q 24 52 28 52'),
  route('2010 · Hospital Road and City Road','route-1-1','M 41 73 V 99 M 18 91 H 64')
 ],
 'T1-042':[
  area('Before · Sea','route-0-0',48,35,16,7),
  area('After · Sea','route-1-0',28,53,12,7),
  route('After · Footpaths','route-1-1','M 11 64 C 21 63 30 67 40 66 C 48 64 52 61 60 62 C 68 60 75 63 79 67 M 28 68 L 31 75 M 40 66 L 40 75 M 56 62 L 56 70'),
  route('After · Vehicle track to pier','route-1-2','M 46 67 C 48 69 48 73 51 76 L 58 79')
 ]
};
export const sourceProcessFlows={
 'T1-024':[
  route('Bamboo growing → harvest','flow-0','M 28 25 H 38'),
  route('Harvest → cutting','flow-1','M 61 25 H 71'),
  route('Cutting → crushing','flow-2','M 83 34 V 42'),
  route('Crushing → filtering','flow-3','M 71 55 H 61'),
  route('Filtering → softening','flow-4','M 38 55 H 28'),
  route('Softening → spinning','flow-5','M 14 68 V 77'),
  route('Spinning → weaving','flow-6','M 27 83 H 37'),
  route('Weaving → clothing','flow-7','M 63 83 H 73')
 ],
 'T1-026':[
  route('Growing → machine harvest','flow-0','M 45 22 L 41 29'),
  route('Growing → hand harvest','flow-1','M 50 22 L 56 29'),
  route('Machine harvest → crushing','flow-2','M 43 45 L 47 49'),
  route('Hand harvest → crushing','flow-3','M 55 45 L 52 49'),
  route('Crushing → purifying','flow-4','M 63 65 L 71 61'),
  route('Purifying → evaporating','flow-5','M 72 78 L 68 83'),
  route('Evaporating → centrifuging','flow-6','M 49 88 H 44'),
  route('Centrifuging → drying','flow-7','M 29 85 L 23 77')
 ],
 'T1-028':[
  route('Flour → mixer','flow-0','M 27 27 L 25 39'),
  route('Water and oil → mixer','flow-1','M 10 53 H 20'),
  route('Mixer → dough sheets','flow-2','M 30 53 H 33'),
  route('Dough sheets → strips','flow-3','M 43 53 H 46'),
  route('Dough strips → noodle discs','flow-4','M 57 53 H 60'),
  route('Noodle discs → cooking','flow-5','M 71 53 H 74'),
  route('Cooking → cups','flow-6','M 83 62 V 68'),
  route('Vegetables and spices → cups','flow-7','M 69 72 L 77 68'),
  route('Cups → labelling','flow-8','M 83 73 V 79')
 ],
 'T1-030':[
  route('Cold water pumped down the injection well','flow-0','M 20 40 V 84'),
  route('Heated water crosses geothermal zone','flow-1','M 23 87 H 76'),
  route('Hot water pumped up the production well','flow-2','M 82 84 V 40'),
  route('Hot water → condenser','flow-3','M 82 40 V 33'),
  route('Steam → turbine','flow-4','M 76 29 H 68'),
  route('Turbine → generator','flow-5','M 57 29 H 53'),
  route('Generator → electricity grid','flow-6','M 43 29 H 35')
 ],
 'T1-032':[
  route('Limestone and clay → crusher','flow-0','M 19 22 L 24 31 M 32 22 L 27 31'),
  route('Crusher → mixer','flow-1','M 30 36 H 39'),
  route('Mixer → rotating heater','flow-2','M 39 42 L 31 46'),
  route('Heater → grinder','flow-3','M 25 66 L 20 72'),
  route('Grinder → cement bags','flow-4','M 23 77 L 28 83'),
  route('Cement → concrete mixer','flow-5','M 62 25 L 68 48'),
  route('Water → concrete mixer','flow-6','M 83 22 L 76 48'),
  route('Sand → concrete mixer','flow-7','M 62 43 L 70 51'),
  route('Gravel → concrete mixer','flow-8','M 84 43 L 77 52')
 ],
 'T1-025':[
  route('Carbon dioxide returns to plants','flow-0','M 35 24 C 49 19 66 20 78 32 C 88 45 89 66 75 83 C 60 98 37 100 19 83 C 4 69 2 50 16 33'),
  route('Plants → harvesting','flow-1','M 36 27 L 42 29'),
  route('Harvesting → pre-processing','flow-2','M 55 36 L 61 39'),
  route('Pre-processing → cellulose','flow-3','M 60 51 L 53 51'),
  route('Cellulose → processing','flow-4','M 39 51 L 32 51'),
  route('Processing → sugars','flow-5','M 18 57 L 18 64'),
  route('Sugars → microbes','flow-6','M 24 80 L 29 85'),
  route('Microbes → ethanol','flow-7','M 34 78 L 36 69'),
  route('Ethanol → fuel use','flow-8','M 50 67 L 57 68')
 ],
 'T1-027':[
  route('Bottles → collection truck','flow-0','M 34 19 L 39 19'),
  route('Truck → sorting','flow-1','M 62 19 L 67 19'),
  route('Sorting → compression','flow-2','M 78 32 L 78 37'),
  route('Compression → crushing','flow-3','M 78 57 L 78 62'),
  route('Crushing → washing','flow-4','M 77 80 L 77 85'),
  route('Washing → pellets','flow-5','M 69 89 L 63 89'),
  route('Pellets → raw material','flow-6','M 35 80 L 30 83'),
  route('Raw material → new products','flow-7','M 28 58 L 27 63')
 ],
 'T1-029':[
  route('Daytime water flows down to turbines','flow-0','M 35 43 L 65 63'),
  route('Nighttime water is pumped uphill','flow-1','M 65 65 L 35 45'),
  route('Generator → power lines','flow-2','M 71 45 H 88')
 ],
 'T1-031':[
  route('Eggs → fry','flow-0','M 30 13 C 21 14 18 21 18 27'),
  route('Fry → lower river','flow-1','M 23 34 V 39'),
  route('Fry → smolt','flow-2','M 23 56 C 23 62 25 66 30 68'),
  route('Smolt → sea','flow-3','M 46 73 C 49 76 52 71 60 72'),
  route('Adult salmon returns upstream','flow-4','M 79 65 C 78 56 67 53 58 51 C 49 47 45 41 45 34')
 ]
};
const feature=(label,key,x,y,w,h,value=null)=>({label,key,x,y,w,h,value});
export const sourceMapFeatures={
 'T1-033':[
  feature('1950 · Fruit trees','place-0-0',30,21,12,7),feature('1950 · Soft fruits','place-0-1',39,26,13,6),feature('1950 · Vegetables','place-0-2',45,32,13,7),feature('1950 · Sheep','place-0-3',63,16,11,7),feature('1950 · Barn','place-0-4',68,29,13,5),feature('1950 · Farmhouse','place-0-5',63,35,16,5),feature('1950 · Chickens','place-0-6',63,39,12,5),
  feature('Today · Fruit trees','place-1-0',28,63,13,7),feature('Today · Soft fruits','place-1-1',39,70,13,7),feature('Today · Vegetables','place-1-2',45,76,13,7),feature('Today · Farm shop','place-1-3',35,61,11,7),feature('Today · Parking','place-1-4',42,58,10,5),feature('Today · Camping field','place-1-5',55,61,14,9),feature('Today · Parking','place-1-6',74,67,10,5),feature('Today · Holiday cottages','place-1-7',68,71,15,6),feature('Today · Farmhouse','place-1-8',64,78,15,5),feature('Today · Barn','place-1-9',56,80,8,5),feature('Today · Chickens','place-1-10',64,84,12,5),
  ...[[69,58],[77,58],[70,62],[78,62]].map(([x,y],i)=>feature(`Today · Solar panel ${i+1}`,`place-1-solar-${i}`,x,y,7,5))
 ],
 'T1-034':[
  feature('2000 · Public beach','place-0-0',57,6,12,7),feature('2000 · Dock','place-0-1',54,14,10,7),feature('2000 · Passenger ferries','place-0-2',58,22,14,8),feature('2000 · Marina (private yachts)','place-0-3',24,17,13,9),feature('2000 · Fishing boats','place-0-4',25,29,12,8),feature('2000 · Showers and toilets','place-0-5',15,15,11,6),feature('2000 · Car park','place-0-6',15,20,12,5),feature('2000 · Car park','place-0-7',15,31,12,7),feature('2000 · Lifeboat','place-0-8',54,31,11,6),feature('2000 · Castle (disused)','place-0-9',73,37,13,8),feature('2000 · Public beach','place-0-10',58,40,16,6),
  feature('Today · Public beach','place-1-0',57,54,12,7),feature('Today · Dock','place-1-1',54,66,10,7),feature('Today · Passenger ferries','place-1-2',58,72,14,7),feature('Today · Fishing boats','place-1-3',24,65,13,9),feature('Today · Marina (private yachts)','place-1-4',24,76,13,9),feature('Today · Showers and toilets','place-1-5',15,65,11,5),feature('Today · Car park','place-1-6',15,69,12,6),feature('Today · Showers and toilets','place-1-7',15,77,11,5),feature('Today · Car park','place-1-8',15,82,12,6),feature('Today · Cafés and shops','place-1-9',39,82,14,6),feature('Today · Lifeboat','place-1-10',54,80,11,6),feature('Today · Hotel','place-1-11',73,87,13,9),feature('Today · Private beach','place-1-12',58,90,17,6)
 ],
 'T1-036':[
  feature('Now · Farmland','place-0-0',41,7,14,6),feature('Now · Roundabout','place-0-1',40,26,10,8),feature('Now · Town','place-0-2',11,24,10,8),
  ...[[41,20],[35,24],[36,33],[55,25],[68,25],[55,31],[68,31],[78,28]].map(([x,y],i)=>feature(`Now · Factory ${i+1}`,`place-0-factory-${i}`,x,y,8,4)),
  feature('Future · Farmland','place-1-0',63,56,13,6),feature('Future · Playground','place-1-1',59,67,14,8),feature('Future · School','place-1-2',78,72,10,12),feature('Future · Medical centre','place-1-3',47,80,10,9),feature('Future · Shops','place-1-4',30,76,10,10),feature('Future · Roundabout','place-1-5',40,75,10,8),feature('Future · Town','place-1-6',10,74,10,8),
  ...[[37,55],[27,67],[32,69],[40,66],[55,74],[68,74],[58,80],[68,80],[38,62]].map(([x,y],i)=>feature(`Future · Housing ${i+1}`,`place-1-house-${i}`,x,y,7,4))
 ],
 'T1-039':[
  feature('2007 · City Hospital','place-0-0',34,8,14,8),feature('2007 · Staff and public car park','place-0-1',49,27,16,9),feature('2007 · Bus stop 1','place-0-2',36,26,4,4),feature('2007 · Bus stop 2','place-0-3',43,26,4,4),feature('2007 · Bus stop 3','place-0-4',36,31,4,4),feature('2007 · Bus stop 4','place-0-5',43,31,4,4),feature('2007 · Bus stop 5','place-0-6',36,36,4,4),feature('2007 · Bus stop 6','place-0-7',43,36,4,4),feature('2007 · Bus stop','place-0-8',78,16,17,5),
  feature('2010 · City Hospital','place-1-0',34,59,14,8),feature('2010 · Public car park','place-1-1',60,59,11,10),feature('2010 · Staff car park','place-1-2',46,78,9,10),feature('2010 · Bus station','place-1-3',22,78,12,9),feature('2010 · Roundabout','place-1-4',37,70,8,7),feature('2010 · Roundabout','place-1-5',37,88,8,7)
 ],
 'T1-035':[
  feature('20 years ago · CDs, videos and computer games','place-0-0',7,5,32,12),
  feature('20 years ago · Children’s books','place-0-1',54,5,32,12),
  feature('20 years ago · Adult fiction','place-0-2',7,17,32,16),
  feature('20 years ago · Adult non-fiction','place-0-3',54,17,32,16),
  feature('20 years ago · Table and chairs 1','place-0-4',41,18,12,8),
  feature('20 years ago · Table and chairs 2','place-0-5',41,26,12,8),
  feature('20 years ago · Reading room','place-0-6',7,33,32,12),
  feature('20 years ago · Enquiry desk','place-0-7',54,33,32,12),
  feature('20 years ago · Entrance','place-0-8',41,44,12,3),
  feature('Today · Storytelling events and children’s fiction','place-1-0',7,57,32,16),
  feature('Today · Sofa 1','place-1-1',8,57,6,8),feature('Today · Sofa 2','place-1-2',33,57,6,8),
  feature('Today · Lecture room','place-1-3',54,57,32,12),
  feature('Today · Reference books','place-1-4',7,73,32,12),
  feature('Today · Adult fiction','place-1-5',54,69,32,4),
  feature('Today · Information desk','place-1-6',54,73,32,6),
  feature('Today · Self-service machine 1','place-1-7',60,79,6,6),
  feature('Today · Self-service machine 2','place-1-8',68,79,6,6),
  feature('Today · Self-service machine 3','place-1-9',76,79,6,6),
  feature('Today · Computer room','place-1-10',7,85,32,11),
  feature('Today · Café','place-1-11',54,85,32,11),
  feature('Today · Entrance','place-1-12',41,95,12,4)
 ],
 'T1-038':[
  feature('1920 · Arnold Avenue','place-0-0',29,5,31,5),feature('1920 · North entrance','place-0-1',40,8,20,5),
  feature('1920 · Rose garden (northwest)','place-0-2',9,8,20,8),feature('1920 · Rose garden (northeast)','place-0-3',60,8,19,8),
  feature('1920 · Pond for water plants','place-0-4',74,9,20,12),feature('1920 · Stage for musicians','place-0-5',17,17,14,13),
  feature('1920 · Fountain','place-0-6',42,17,11,13),feature('1920 · Seats (northwest)','place-0-7',2,9,7,7),
  feature('1920 · Seats (north)','place-0-8',29,9,11,6),feature('1920 · Seats (southwest)','place-0-9',2,36,7,7),
  feature('1920 · Seats (south)','place-0-10',29,36,11,7),feature('1920 · Seats (east)','place-0-11',90,27,5,9),
  feature('1920 · Rose garden (southwest)','place-0-12',9,35,20,8),feature('1920 · Glasshouse','place-0-13',60,36,27,7),
  feature('1920 · South entrance','place-0-14',40,36,20,7),feature('1920 · Eldon Street','place-0-15',36,43,28,5),
  feature('Today · Arnold Avenue','place-1-0',29,54,31,5),feature('Today · North entrance','place-1-1',40,58,20,5),
  feature('Today · Rose garden (northwest)','place-1-2',10,59,18,8),feature('Today · Café','place-1-3',61,59,14,8),
  feature('Today · Children’s play area','place-1-4',75,59,18,14),feature('Today · Amphitheatre','place-1-5',4,65,24,22),
  feature('Today · Rose garden (centre)','place-1-6',41,69,17,13),feature('Today · Water feature','place-1-7',64,80,23,11),
  feature('Today · Underground car park entrance','place-1-8',78,91,16,9),feature('Today · South entrance','place-1-9',40,86,20,6),
  feature('Today · Eldon Street','place-1-10',36,92,28,5),feature('Today · Seats (north)','place-1-11',43,64,14,6),
  feature('Today · Seats (west)','place-1-12',37,71,6,12),feature('Today · Seats (east)','place-1-13',58,71,6,12),
  feature('Today · Seats (south)','place-1-14',43,82,14,6)
 ],
 'T1-040':[
  feature('Present · Outdoor courts (west)','place-0-0',16,35,13,19),feature('Present · Changing room','place-0-1',33,36,4,18),
  feature('Present · Gym','place-0-2',37,32,21,5),feature('Present · 25 m pool','place-0-3',40,37,10,16,25),
  feature('Present · Seating','place-0-4',50,37,8,16),feature('Present · Outdoor courts (east)','place-0-5',60,35,12,19),
  feature('Present · Reception','place-0-6',39,53,12,5),feature('Present · Entrance','place-0-7',44,57,5,4),
  feature('Future · Leisure pool','place-1-0',16,69,14,18),feature('Future · Changing room (north)','place-1-1',33,72,4,17),
  feature('Future · Gym','place-1-2',37,68,21,5),feature('Future · 25 m pool','place-1-3',40,73,10,16,25),
  feature('Future · Seating','place-1-4',50,73,8,16),feature('Future · Sports hall','place-1-5',58,73,10,16),
  feature('Future · Dance studio 1','place-1-6',68,69,7,10),feature('Future · Dance studio 2','place-1-7',68,79,7,10),
  feature('Future · Changing room (west)','place-1-8',14,89,13,10),feature('Future · Sports shop','place-1-9',27,89,10,10),
  feature('Future · Reception','place-1-10',39,89,12,5),feature('Future · Café','place-1-11',58,94,10,5),
  feature('Future · Changing room (east)','place-1-12',68,89,7,10),feature('Future · Entrance','place-1-13',44,96,5,3)
 ],
 'T1-042':[
  feature('Before · Beach','place-0-0',9,19,12,11),feature('Before · Palm trees','place-0-1',29,21,10,9),feature('Before · Palm trees','place-0-2',71,8,11,18),feature('Before · 100 metres','place-0-3',32,38,27,6,100),
  feature('After · Beach','place-1-0',9,61,12,11),feature('After · Swimming area','place-1-1',7,57,12,5),feature('After · Restaurant','place-1-2',40,53,12,7),feature('After · Reception','place-1-3',42,65,11,6),feature('After · Pier','place-1-4',48,74,17,9),feature('After · Palm trees','place-1-5',70,53,12,9),feature('After · 100 metres','place-1-6',33,89,26,5,100),
  ...[[28,62],[33,60],[38,60],[51,60],[57,60],[62,60],[69,60],[67,66],[57,66],[28,69],[34,72],[40,72],[47,72]].map(([x,y],i)=>feature(`After · Accommodation cabin ${i+1}`,`place-1-cabin-${i}`,x,y,5,5))
 ]
};

sourceMapFeatures['T1-041']=sourceMapFeatures['T1-038'].map(feature=>({...feature}));

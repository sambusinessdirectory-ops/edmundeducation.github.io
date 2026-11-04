// Encodings are transcribed from the printed source figures. A common axis or
// series style changes their meaning, so each figure keeps its own specification.
const range=(start,end,step)=>Array.from({length:Math.round((end-start)/step)+1},(_,i)=>start+i*step);
export const sourceSpecs={
 'T1-001':{ticks:range(0,35,5),bars:['dark','white','light','medium','mid']},
 'T1-002':{ticks:range(0,40,5),bars:['black','light']},
 'T1-003':{ticks:range(20,70,5),bars:['dark','cross','medium']},
 'T1-004':{ticks:range(0,90,10),bars:['light','black']},
 'T1-006':{ticks:range(0,60,10),bars:['hatch','dark']},
 'T1-007':{panels:[{ticks:range(0,30000,5000)},{ticks:range(0,3000,500)}],bars:['dark']},
 'T1-008':{ticks:range(0,100,10),bars:['dots','medium','black']},
 'T1-009':{ticks:range(0,70,10),lines:[['solid','circle-open'],['dash','triangle-open'],['dot','diamond'],['dashdot','square-open'],['solid','cross']]},
 'T1-010':{ticks:range(0,90,10),lines:[['dashdot','square'],['dot','diamond-open'],['dash','cross'],['solid','triangle']]},
 'T1-011':{ticks:range(-4,7,1),lines:[['dash','circle-open'],['solid','circle'],['solid','cross']]},
 'T1-012':{ticks:range(0,9000,1000),lines:[['solid','circle'],['dash','circle']]},
 'T1-013':{panels:[{ticks:range(0,100,10),lines:[['solid','circle'],['solid','circle-open'],['dash','circle-open']]},{ticks:range(0,60,10),lines:[['solid','circle-open']]}]},
 'T1-014':{ticks:range(0,4,.5),lines:[['dot','square'],['dash','triangle'],['solid','circle-open']]},
 'T1-015':{ticks:range(0,12,2),lines:[['dashdot','none'],['dash','none'],['solid','none'],['dot','none']]},
 'T1-016':{ticks:range(0,50,5),lines:[['solid','none'],['solid','none'],['dash','none'],['dashdot','none'],['hatch','none'],['dot','none']],smooth:true,historyUntil:'2005'},
 'T1-017':{ticks:range(0,120,20),lines:[['dash','none'],['dot','none'],['dashdot','none'],['solid','none']]},
 'T1-018':{pieColumns:2,pieLastCentered:true,pies:['dots','cross','black','white']},
 'T1-019':{pieColumns:3,pies:['hatch','medium','white']},
 'T1-020':{pieColumns:1,pies:['dark','light','hatch','mid','white','dots']},
 'T1-021':{pieColumns:1,pies:['light','hatch','dark','dots','cross','white']},
 'T1-022':{pieColumns:2,pies:['hatch','dark','white']},
 'T1-023':{pieColumns:2,pieLastCentered:true,pies:['white','light','mid','medium','black']},
 'T1-054':{mixedLayout:'library',panels:[null,null,{ticks:range(0,25000,5000)}],pies:['black','cross','light','hatch']},
 'T1-055':{panels:[null,{ticks:range(0,700,100)}],pies:['white','light','white','dark'],bars:['light','dark']},
 'T1-056':{mixedLayout:'table-pies',pies:['medium','white','black']},
 'T1-057':{panels:[{ticks:range(10,70,10)}],bars:['black','dots']},
 'T1-058':{panels:[{ticks:range(10,70,10)}],bars:['black','dots']},
 'T1-059':{mixedLayout:'table-pies',pies:['dots','hatch','cross','slash','white']},
 'T1-060':{mixedLayout:'table-pies',pies:['dots','hatch','cross','slash','white']}
};
export const sourceTicks=(lesson,panelIndex,min,max)=>sourceSpecs[lesson.id]?.panels?.[panelIndex]?.ticks||sourceSpecs[lesson.id]?.ticks||range(min,max,(max-min)/5);
export const sourceLines=(lesson,panelIndex)=>sourceSpecs[lesson.id]?.panels?.[panelIndex]?.lines||sourceSpecs[lesson.id]?.lines||[];
export const sourceBars=lesson=>sourceSpecs[lesson.id]?.bars||[];

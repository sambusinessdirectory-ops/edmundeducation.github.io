// Stable option rotation makes answer positions varied without changing a
// learner's question between renders or sessions.
export function mc(id,style,prompt,options,answer,explanation){
  const hash=[...id].reduce((value,char)=>((value*33)^char.codePointAt(0))>>>0,5381);
  const shift=hash%options.length;
  const ordered=[...options.slice(shift),...options.slice(0,shift)];
  return {id,type:'mc',style,prompt,options:ordered,answers:[answer],explanation};
}

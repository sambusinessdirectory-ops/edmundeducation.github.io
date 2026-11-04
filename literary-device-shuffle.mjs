// Fisher–Yates samples without replacement. Keep each option's hint, feedback
// and correctness together, then assign display letters in the new order.
function shuffle(values){
 const result=[...values];
 for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
export function newRound(bank){
 return shuffle(bank).map(question=>({...question,options:shuffle(question.options).map((option,index)=>({...option,letter:'ABCD'[index]}))}));
}

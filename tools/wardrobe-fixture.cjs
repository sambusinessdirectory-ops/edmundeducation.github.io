// Local-only RPC fixture for character-scoped saves. No real student accounts.
module.exports=function mergeWardrobe(saved,args){
 const character=args.p_character;
 if(args.p_equipped){
  if(character){const slots=character==='boys'?['headwear','top']:[character+'Top'];for(const slot of slots)delete saved.equipped[slot];Object.assign(saved.equipped,args.p_equipped);}
  else saved.equipped=args.p_equipped;
 }
 if(args.p_outfits){
  if(character)saved.outfits=saved.outfits.filter(x=>character==='boys'?x.group==='girls':x.character!==character).concat(args.p_outfits);
  else saved.outfits=args.p_outfits;
 }
 return saved;
};

// Preserve event order and the legacy missing-module alias while grouping once.
export function eventsByModule(events){
 const groups=new Map();
 for(const event of events){
  const module=event.module||'scoop';
  if(!groups.has(module))groups.set(module,[]);
  groups.get(module).push(event);
 }
 return groups;
}

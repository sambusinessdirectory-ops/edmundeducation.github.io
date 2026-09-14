import assert from 'node:assert/strict';
import {createFlashcardMapLayout,flashcardMapRoute} from '../flashcard-range-map.mjs';
const entries=[...Array.from({length:8},(_,i)=>({id:`standard:${i}`,world:'standard'})),...Array.from({length:11},(_,i)=>({id:`30:${i}`,world:'30'})),...Array.from({length:21},(_,i)=>({id:`10:${i}`,world:'10'}))];
const layout=createFlashcardMapLayout(entries);
assert.equal(layout.nodes.length,40);
assert.deepEqual(layout.sections.map(s=>s.columns),[4,5,4]);
assert.equal(new Set(layout.nodes.map(n=>`${n.x},${n.y}`)).size,40);
for(const node of layout.nodes) {
 assert.ok(node.x>=135&&node.x<=layout.width-135);
 assert.ok(node.y>=180&&node.y<=layout.height-150);
 for(const destination of layout.nodes) {
  const route=flashcardMapRoute(layout.nodes,node,destination);
  assert.ok(route.length>0);assert.deepEqual(route.at(-1),{x:destination.x,y:destination.y});
  if(node!==destination)assert.ok(Math.hypot(route[0].x-node.x,route[0].y-node.y)>2,'No duplicate first waypoint may shortcut walking');
 }
}
assert.deepEqual(flashcardMapRoute(layout.nodes,layout.nodes[0],{x:800,y:480}),[{x:800,y:480}]);
const partial=createFlashcardMapLayout(entries.filter(e=>e.world==='standard'||e.id==='30:0'||e.id==='10:0'));
assert.equal(partial.nodes.length,10);assert.ok(partial.height<layout.height);
assert.deepEqual(createFlashcardMapLayout([]).nodes,[]);
console.log('Flashcard map: forty destinations, 5/4 columns, all 1,600 route pairs, free walking and short decks passed.');

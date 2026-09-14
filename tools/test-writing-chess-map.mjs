import assert from 'node:assert/strict';
import {chessPosition,isOnChessboard} from '../writing-chess-map.mjs';
const positions=Array.from({length:16},(_,i)=>chessPosition(i));
assert.equal(new Set(positions.map(p=>`${p.x}:${p.y}`)).size,16);
for(const p of positions){assert.ok(p.x>240&&p.x<800&&p.y>104&&p.y<570);}
for(let row=0;row<4;row++){
 const nodes=positions.slice(row*4,row*4+4);
 assert.equal(new Set(nodes.map(p=>p.y)).size,1);
 for(let i=1;i<4;i++)assert.equal(Math.sign(nodes[i].x-nodes[i-1].x),row%2?-1:1);
}
console.log('Chessboard: sixteen unique grounded stops and free-walking surface bounds passed.');

assert.ok(positions.every(isOnChessboard));
assert.equal(isOnChessboard({x:100,y:300}),false);
assert.equal(isOnChessboard({x:500,y:600}),false);
assert.equal(isOnChessboard({x:500,y:300}),true);

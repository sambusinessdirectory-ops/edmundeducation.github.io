// Fallback updater for the daily monitor. Writes only a verified account count.
import {writeFile} from 'node:fs/promises';
import {refresh} from '../workers/instagram-followers/src/index.mjs';
const file=process.argv[2];
if(!file)throw Error('Pass an output JSON path');
const data=await refresh({COUNTS:{put:async(_key,value)=>writeFile(file,value)}});
console.log(`${data.username}: ${data.approximate?'approximately ':''}${data.count} followers, verified ${data.updatedAt}`);

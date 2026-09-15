// Small room navigation grid; diagonal corners cannot cross furniture.
export function closetRoute(start,end,bounds,obstacles){
 const valid=(x,z)=>x>=bounds.minX&&x<=bounds.maxX&&z>=bounds.minZ&&z<=bounds.maxZ&&!obstacles.some(o=>x>o.minX&&x<o.maxX&&z>o.minZ&&z<o.maxZ);
 const clear=(a,b)=>{const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.08);for(let i=1;i<=n;i++)if(!valid(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n))return false;return true;};
 if(!valid(end.x,end.z))return [];
 if(clear(start,end))return [end];
 const step=.25,nx=Math.ceil((bounds.maxX-bounds.minX)/step),nz=Math.ceil((bounds.maxZ-bounds.minZ)/step);
 const point=k=>({x:bounds.minX+(k%nx)*step,z:bounds.minZ+Math.floor(k/nx)*step});
 const nearest=p=>Math.round((p.z-bounds.minZ)/step)*nx+Math.round((p.x-bounds.minX)/step);
 const first=nearest(start),goal=nearest(end),queue=[first],prev=new Map([[first,null]]);
 for(let q=0;q<queue.length;q++){const k=queue[q];if(k===goal)break;const a=point(k);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=k%nx+dx,z=Math.floor(k/nx)+dz;if(x<0||x>=nx||z<0||z>=nz)continue;const next=z*nx+x;if(prev.has(next)||!clear(a,point(next)))continue;prev.set(next,k);queue.push(next);}}
 if(!prev.has(goal))return [];
 const path=[end];for(let k=goal;k!==null;k=prev.get(k))path.unshift(point(k));
 const out=[];let from=start,i=0;while(i<path.length){let j=path.length-1;while(j>i&&!clear(from,path[j]))j--;out.push(path[j]);from=path[j];i=j+1;}return out;
}

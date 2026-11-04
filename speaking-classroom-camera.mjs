// Camera clearance keeps both the lens and its near plane inside the classroom.
export const ROOM = Object.freeze({left:-6,right:6,back:-5.2,front:7.6,height:4.2});
export const CAMERA_BOUNDS = Object.freeze({min:{x:-5.55,y:.5,z:-4.75},max:{x:5.55,y:3.75,z:7.15}});
export const CAMERA_START = Object.freeze({yaw:.17,pitch:.12,distance:7.8,target:{x:0,y:1.4,z:-1.15}});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function constrainCamera(position){
 for(const axis of ['x','y','z'])position[axis]=clamp(position[axis],CAMERA_BOUNDS.min[axis],CAMERA_BOUNDS.max[axis]);
 return position;
}
export function constrainTarget(target){
 target.x=clamp(target.x,-3.7,3.7);target.y=clamp(target.y,.8,2.6);target.z=clamp(target.z,-3.2,4.2);return target;
}
export function interiorOrbit(target,yaw,pitch,distance){
 constrainTarget(target);
 const direction={x:Math.sin(yaw)*Math.cos(pitch),y:Math.sin(pitch),z:Math.cos(yaw)*Math.cos(pitch)};
 let reach=Math.max(.2,distance);
 for(const axis of ['x','y','z'])if(Math.abs(direction[axis])>1e-8){
  const boundary=direction[axis]>0?CAMERA_BOUNDS.max[axis]:CAMERA_BOUNDS.min[axis];
  reach=Math.min(reach,(boundary-target[axis])/direction[axis]);
 }
 return {x:target.x+direction.x*reach,y:target.y+direction.y*reach,z:target.z+direction.z*reach};
}

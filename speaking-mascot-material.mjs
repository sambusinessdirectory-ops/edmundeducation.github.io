import * as THREE from './vendor/three/three.module.js';

export function mascotMaterial(atlas, flow, data, coatColour, headResource={atlas,flow,data}, headSpace=[1,0,0]) {
  const uniforms = {
    atlas:{value:atlas}, flowAtlas:{value:flow}, flowRange:{value:data.flowRange},
    headAtlas:{value:headResource.atlas},headFlowAtlas:{value:headResource.flow},headSpace:{value:headSpace},
    coatGain:{value:new THREE.Color(coatColour).toArray().map((c,i)=>c/new THREE.Color(data.sourceCoat).toArray()[i])},
    headCoatGain:{value:new THREE.Color(coatColour).toArray().map((c,i)=>c/new THREE.Color(headResource.data.sourceCoat).toArray()[i])},
    bodyRects:{value:[new THREE.Vector4(),new THREE.Vector4()]}, bodyLayouts:{value:[new THREE.Vector4(),new THREE.Vector4()]},
    headRects:{value:[new THREE.Vector4(),new THREE.Vector4()]}, headLayouts:{value:[new THREE.Vector4(),new THREE.Vector4()]},
    mouths:{value:[new THREE.Vector3(),new THREE.Vector3()]},
    bodyFlow:{value:new THREE.Vector4()},headFlow:{value:new THREE.Vector4()},
    bodyBlend:{value:0},headBlend:{value:0},mouthOpen:{value:0},nod:{value:0},headYaw:{value:0},breath:{value:0},
  };
  return new THREE.ShaderMaterial({
    uniforms, transparent:true, depthWrite:true, side:THREE.DoubleSide,
    vertexShader:`
      varying vec2 vUv;
      uniform float nod, headYaw, breath;
      void main(){
        vUv=uv;
        vec3 p=position;
        float head=smoothstep(.37,.44,uv.y);
        float torso=exp(-pow((uv.x-.5)/.21,2.)-pow((uv.y-.40)/.24,2.));
        float face=exp(-pow((uv.x-.5)/.26,2.)-pow((uv.y-.76)/.23,2.));
        // A shallow curved surface gives perspective parallax when looking up/down.
        p.z += max(torso*.09,face*.16);
        p.z += torso*breath*.0015;
        // Rotate the complete head about the neck, preserving its dimensions.
        // Only the short neck join blends into the fixed seated torso.
        vec3 neck=vec3(0.,.43,.05);
        vec3 metric=vec3(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz),length(modelMatrix[2].xyz));
        vec3 fromNeck=(p-neck)*metric;
        float angle=head*nod;
        vec3 axis=vec3(cos(headYaw),0.,-sin(headYaw));
        vec3 tilted=fromNeck*cos(angle)+cross(axis,fromNeck)*sin(angle)
                   +axis*dot(axis,fromNeck)*(1.-cos(angle));
        p=neck+tilted/metric;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
      }
    `,
    fragmentShader:`
      varying vec2 vUv;
      uniform sampler2D atlas, flowAtlas,headAtlas,headFlowAtlas;
      uniform vec4 bodyRects[2],bodyLayouts[2],headRects[2],headLayouts[2];
      uniform vec3 mouths[2];
      uniform vec4 bodyFlow,headFlow;
      uniform float bodyBlend,headBlend,flowRange,mouthOpen;
      uniform vec3 coatGain,headCoatGain,headSpace;
      vec4 flowAt(vec2 p,vec4 cell,bool head){
        vec3 space=head?headSpace:vec3(1.,0.,0.);
        p=(p-space.yz)/space.x;
        vec2 q=clamp(vec2(p.x,1.-p.y),vec2(.004),vec2(.996));
        vec4 field=head?texture2D(headFlowAtlas,cell.xy+q*cell.zw):texture2D(flowAtlas,cell.xy+q*cell.zw);
        return (field*2.-1.)*flowRange*space.x;
      }
      vec4 picture(vec2 p,vec4 rect,vec4 placement,vec3 mouth,bool animate){
        vec2 q=(p-placement.xy)/placement.zw;
        if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec4(0.);
        vec4 col=animate?texture2D(headAtlas,rect.xy+q*rect.zw):texture2D(atlas,rect.xy+q*rect.zw);
        vec3 rgb=pow(max(col.rgb,vec3(0.)),vec3(1./2.2));
        float saturation=(max(rgb.r,max(rgb.g,rgb.b))-min(rgb.r,min(rgb.g,rgb.b)))/max(rgb.r,.001);
        float coat=smoothstep(.42,.58,saturation)*(1.-smoothstep(.50,.65,rgb.b/max(rgb.r,.001)))*smoothstep(1.12,1.30,rgb.r/max(rgb.g,.001))*smoothstep(.18,.27,rgb.r);
        col.rgb=mix(col.rgb,col.rgb*(animate?headCoatGain:coatGain),coat);
        if(animate && mouthOpen>.015 && mouth.z>.001){
          vec2 radius=vec2(mouth.z*.5,mouth.z*(.055+mouthOpen*.22));
          vec2 at=(p-mouth.xy)/radius;
          float shape=1.-smoothstep(.80,1.08,length(at));
          vec3 inside=vec3(.029,.009,.007);
          float tongue=(1.-smoothstep(.60,1.,length((at-vec2(0.,-.50))/vec2(.80,.50))))*.35;
          inside=mix(inside,vec3(.23,.068,.047),tongue);
          col.rgb=mix(col.rgb,inside,shape*min(1.,mouthOpen*6.));
        }
        return vec4(col.rgb*col.a,col.a);
      }
      vec4 pair(vec2 p,vec4 a,vec4 b,vec4 la,vec4 lb,vec4 f,float blend,vec3 ma,vec3 mb,bool talk){
        vec2 pa=p,pb=p;
        // Inverse correspondence warps align features before colour blending.
        pa=p-flowAt(pa,f,talk).xy*blend;
        pa=p-flowAt(pa,f,talk).xy*blend;
        pb=p-flowAt(pb,f,talk).zw*(1.-blend);
        pb=p-flowAt(pb,f,talk).zw*(1.-blend);
        // A single warped source keeps eyes and silhouettes opaque at handover.
        // Cross-fading illustrated eyes produces visibly doubled facial features.
        return blend<.5?picture(pa,a,la,ma,talk):picture(pb,b,lb,mb,talk);
      }
      void main(){
        vec4 body=pair(vUv,bodyRects[0],bodyRects[1],bodyLayouts[0],bodyLayouts[1],bodyFlow,bodyBlend,vec3(0.),vec3(0.),false);
        vec4 head=pair(vUv,headRects[0],headRects[1],headLayouts[0],headLayouts[1],headFlow,headBlend,mouths[0],mouths[1],true);
        float headWeight=smoothstep(.38,.46,vUv.y);
        vec4 color=mix(body,head,headWeight);
        if(color.a<.18)discard;
        gl_FragColor=vec4(color.rgb/max(color.a,.001),color.a);
        #include <colorspace_fragment>
      }
    `,
  });
}

export function applyViewPair(material, prefix, data, pair) {
  const views=[data.views[pair.first],data.views[pair.second]],u=material.uniforms;
  for(let i=0;i<2;i++) {
    u[prefix+'Rects'].value[i].fromArray(views[i].rect);
    u[prefix+'Layouts'].value[i].fromArray(views[i].layout);
    if(prefix==='head')u.mouths.value[i].fromArray(views[i].mouth);
  }
  const [columns,rows]=data.flowGrid;
  u[prefix+'Flow'].value.set((pair.first%columns)/columns,Math.floor(pair.first/columns)/rows,1/columns,1/rows);
  u[prefix+'Blend'].value=pair.blend;
}

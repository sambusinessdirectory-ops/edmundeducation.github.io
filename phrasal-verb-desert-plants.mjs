// Broad, deliberately spare silhouettes: no leaflet texture or segmented bark.
export function desertPlantArtwork(kind) {
  let content;
  if(kind==='palm'||kind==='shortPalm'){
    content=`<ellipse cx="115" cy="289" rx="39" ry="8" fill="#9c712f" opacity=".16"/>
    <path d="M91 288Q117 196 125 96L147 94Q144 204 122 291Z" fill="#b97b3f"/>
    <path d="M91 288Q117 196 125 96L134 96Q133 202 109 289Z" fill="#d6a15d"/>
    <path d="M107 245l20 5M115 203l20 5M122 161l18 4" fill="none" stroke="#a8733c" stroke-width="4" opacity=".45"/>
    <path d="M134 99Q60 51 4 127Q54 98 111 116Z" fill="#657d3d"/>
    <path d="M134 98Q57 26 20 72Q75 68 118 110Z" fill="#81974c"/>
    <path d="M134 97Q99 8 57 22Q91 57 121 112Z" fill="#9aab55"/>
    <path d="M135 98Q123 31 157 5Q165 44 142 103Z" fill="#809942"/>
    <path d="M137 99Q185 31 224 57Q178 64 148 112Z" fill="#94a851"/>
    <path d="M139 98Q211 66 239 127Q194 102 147 116Z" fill="#728b40"/>
    <path d="M138 103Q202 104 213 173Q187 133 143 120Z" fill="#58773b"/>
    <path d="M135 104Q80 100 65 177Q94 142 135 122Z" fill="#708a40"/>
    <path d="M138 105Q117 132 132 190Q149 145 145 112Z" fill="#8c9f4c"/>
    <path d="M133 99Q76 65 23 111M140 100Q191 79 223 114M135 96Q118 51 76 31M143 100Q178 61 209 59" fill="none" stroke="#d7c779" stroke-width="2.5" opacity=".55" stroke-linecap="round"/>`;
  } else if(kind==='cactus'){
    content=`<ellipse cx="114" cy="289" rx="48" ry="9" fill="#9c712f" opacity=".15"/>
    <path d="M98 288V188H70Q34 188 34 151V112Q34 92 52 92T70 112V144Q70 153 98 153V63Q98 40 120 40T142 63V201H157Q172 201 172 183V153Q172 134 190 134T208 153V189Q208 238 166 238H142V288Z" fill="#789447"/>
    <path d="M110 281V66M51 112V149Q51 170 81 170M190 154V188Q190 220 158 220" fill="none" stroke="#afbc66" stroke-width="7" stroke-linecap="round"/>
    <path d="M132 70V281" stroke="#5b773d" stroke-width="5"/>
    <path d="M118 45Q93 35 103 22Q113 19 121 33Q126 13 137 19Q145 29 127 44Z" fill="#df9752"/>`;
  } else if(kind==='reeds'){
    content=`<path d="M97 290Q59 246 32 172Q100 207 121 279Q77 172 91 104Q126 172 130 276Q130 174 176 130Q161 215 140 278Q184 216 224 214Q186 251 158 290Z" fill="#839441"/>
    <path d="M103 289Q76 225 73 184Q120 237 126 290M131 290Q120 219 146 166Q151 231 147 290M151 290Q172 242 195 234" fill="#b9b35e"/>
    <path d="M71 290Q56 256 34 244Q69 248 95 290" fill="#a2a04c"/>`;
  } else {
    content=`<path d="M37 284Q21 251 57 238Q40 203 77 196Q93 165 120 195Q151 163 172 201Q206 188 209 222Q239 244 211 271Q195 298 158 287Q129 303 106 284Q76 303 59 280Z" fill="#88964b"/>
    <path d="M59 262Q42 238 80 231Q74 208 100 210Q126 193 142 218Q166 203 179 231Q203 225 207 245Q193 266 170 256Q151 279 130 259Q103 281 86 259Z" fill="#a1aa58"/>
    <path d="M117 286l-24-48M130 286l27-51" fill="none" stroke="#737d3d" stroke-width="7" stroke-linecap="round"/>`;
  }
  return `<svg class="desert-sprite desert-simple-plant" viewBox="0 0 240 300" aria-hidden="true">${content}</svg>`;
}

/* Qalbim Design Atelier
   Independent compositions: SVG illustration + typography + spatial layout per template.
   All illustrations are original, inline, scalable and locally served; no emoji or heavy libraries. */
(function(){
'use strict';
const TEMPLATES=[
 {id:'blush', name:'Ikki qalb',sub:'Romantik 3D yuraklar',icon:'heart',events:['love','anniversary'],badge:'ROMANTIC',kind:'duet'},
 {id:'lilac',name:'Bayram torti',sub:'Shamlar va konfetti',icon:'gift',events:['birthday','achievement'],badge:'BIRTHDAY',kind:'cake'},
 {id:'pearl',name:'Abadiy sana',sub:'Uzuklar va vaqt',icon:'calendar',events:['anniversary','love'],badge:'FOREVER',kind:'rings'},
 {id:'rose',name:'Gullar bog‘i',sub:'Guldasta va yaproqlar',icon:'flower',events:['thanks','love','birthday'],badge:'BOTANICAL',kind:'flowers'},
 {id:'night',name:'Oyli maktub',sub:'Tun, oy va yulduzlar',icon:'moon',events:['miss','love'],badge:'MOONLIGHT',kind:'moon'},
 {id:'victory',name:'G‘alaba lahzasi',sub:'Oltin kubok va nur',icon:'star',events:['achievement','birthday'],badge:'VICTORY',kind:'trophy'},
 {id:'postcard',name:'Eski maktub',sub:'Pochta muhri va qog‘oz',icon:'mail',events:['miss','thanks','love'],badge:'POSTCARD',kind:'mail'},
 {id:'royal',name:'Qirollik taklifi',sub:'Toj va oltin ramka',icon:'crown',events:['anniversary','birthday','love'],badge:'ROYAL',kind:'crown'},
 {id:'galaxy',name:'Koinotimiz',sub:'Galaktika va sayyoralar',icon:'star',events:['miss','love','anniversary'],badge:'COSMIC',kind:'cosmos'},
 {id:'editorial',name:'Minimal Elegance',sub:'Jurnal sahifasi uslubi',icon:'book',events:['thanks','achievement','love'],badge:'EDITORIAL',kind:'type'},
 {id:'giftbox',name:'Sirli sovg‘a',sub:'Ochilgan quti va lentalar',icon:'gift',events:['birthday','thanks','love'],badge:'SURPRISE',kind:'box'},
 {id:'polaroid',name:'Xotira albomi',sub:'Fotokartalar va yozuvlar',icon:'image',events:['anniversary','love','miss'],badge:'MEMORIES',kind:'photos'}
];
const DEFAULTS={love:'blush',birthday:'lilac',anniversary:'pearl',thanks:'rose',miss:'night',achievement:'victory'};
let artworkSequence=0;
function asset(kind){
 const defs='<defs>'+
 '<linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff3fb"/><stop offset=".38" stop-color="#f2a4c6"/><stop offset="1" stop-color="#d35a94"/></linearGradient>'+
 '<linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdfb"/><stop offset=".45" stop-color="#c5a9ef"/><stop offset="1" stop-color="#8053b5"/></linearGradient>'+
 '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff3c3"/><stop offset=".42" stop-color="#e4b767"/><stop offset=".78" stop-color="#ad7538"/><stop offset="1" stop-color="#fae2aa"/></linearGradient>'+
 '<linearGradient id="mint" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#e9fbef"/><stop offset="1" stop-color="#7cba9d"/></linearGradient>'+
 '<radialGradient id="glow"><stop stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
 '<filter id="shadow" x="-30%" y="-35%" width="160%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#53365e" flood-opacity=".20"/></filter>'+
 '<g id="heart"><path d="M0 22 C-45 -24 -105 -1 -97 54 C-93 91 -42 122 0 154 C42 122 93 91 97 54 C105 -1 45 -24 0 22Z"/></g>'+
 '<g id="spark"><path d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3Z"/></g>'+
 '<g id="petal"><path d="M0 0 C-21 -20 -24 -39 -3 -47 C13 -33 16 -14 0 0Z"/></g>'+
 '<g id="flower"><g fill="#fff9fa" stroke="#dbaaac" stroke-width="2"><ellipse rx="19" ry="31" cy="-21"/><ellipse rx="19" ry="31" cy="-21" transform="rotate(72)"/><ellipse rx="19" ry="31" cy="-21" transform="rotate(144)"/><ellipse rx="19" ry="31" cy="-21" transform="rotate(216)"/><ellipse rx="19" ry="31" cy="-21" transform="rotate(288)"/></g><circle r="16" fill="url(#gold)"/></g>'+
 '</defs>';
 const spark=(x,y,scale=1,col='#fff9ed')=>'<use href="#spark" transform="translate('+x+' '+y+') scale('+scale+')" fill="'+col+'"/>';
 let scene='';
 switch(kind){
 case 'duet':
  scene='<ellipse cx="210" cy="266" rx="157" ry="21" fill="#8f5e8840"/>'+
  '<g filter="url(#shadow)"><use href="#heart" transform="translate(165 62) rotate(-11) scale(.98)" fill="url(#a)" stroke="#fff2fa" stroke-width="4"/>'+
  '<use href="#heart" transform="translate(255 98) rotate(13) scale(.72)" fill="url(#b)" stroke="#fcf1ff" stroke-width="5"/></g>'+
  '<path d="M72 198 Q178 165 273 190 T365 138" stroke="#e96d9d" stroke-width="25" stroke-linecap="round" fill="none"/>'+
  '<path d="M76 188 Q166 166 261 181 T362 128" stroke="#ffbed7" stroke-width="6" stroke-linecap="round" fill="none"/>'+
  '<ellipse cx="207" cy="267" rx="171" ry="14" fill="#fff9ffb2"/>'+
  spark(55,73,1.3)+spark(375,93,1.1)+spark(359,232,.8);
  break;
 case 'cake':
  scene='<g filter="url(#shadow)">'+
   '<ellipse cx="210" cy="263" rx="151" ry="24" fill="#bca3dc"/><rect x="97" y="164" width="226" height="91" rx="15" fill="url(#a)"/>'+
   '<path d="M97 173 Q115 151 139 172 T181 172 T224 172 T265 172 T323 170 L323 204 Q300 228 275 207 T230 203 T185 204 T140 204 T97 203Z" fill="#fff3f8" stroke="#fff" stroke-width="4"/>'+
   '<rect x="126" y="118" width="170" height="60" rx="12" fill="#c5a9e7" stroke="#f9eefa" stroke-width="3"/>'+
   '<path d="M126 134 Q143 115 160 134 T196 134 T232 134 T268 134 T296 134 L296 154 Q282 164 272 151 T236 153 T200 154 T166 153 T126 154Z" fill="#fef5ff"/>'+
   '<rect x="157" y="70" width="12" height="49" rx="5" fill="#fff1e8"/><rect x="205" y="63" width="12" height="55" rx="5" fill="#fff1e8"/><rect x="252" y="70" width="12" height="49" rx="5" fill="#fff1e8"/>'+
   '<path d="M163 64 Q148 46 163 38 Q177 47 163 64Z M211 57 Q196 38 211 28 Q224 40 211 57Z M258 64 Q244 46 258 38 Q271 46 258 64Z" fill="#f5b75f"/>'+
   '<g fill="#db598d"><circle cx="135" cy="229" r="8"/><circle cx="184" cy="225" r="8"/><circle cx="236" cy="230" r="8"/><circle cx="285" cy="226" r="8"/></g></g>'+
   '<g stroke-width="6" stroke-linecap="round"><path d="M65 71l18 17" stroke="#d18abc"/><path d="M344 57l-18 15" stroke="#f2a36f"/><path d="M361 154h20" stroke="#a999d9"/><path d="M60 164l-17 13" stroke="#a8be9f"/></g>'+
   spark(90,105,.9,'#ffd59e')+spark(341,114,1.2,'#eed9fc');
  break;
 case 'rings':
  scene='<ellipse cx="210" cy="257" rx="150" ry="20" fill="#ac8c7960"/>'+
   '<g filter="url(#shadow)" fill="none" stroke="url(#gold)" stroke-width="20"><ellipse cx="172" cy="170" rx="89" ry="84" transform="rotate(-15 172 170)"/>'+
   '<ellipse cx="256" cy="176" rx="89" ry="83" transform="rotate(17 256 176)"/></g>'+
   '<g fill="none" stroke="#fff6da" stroke-width="5"><path d="M113 109 Q171 68 216 117"/><path d="M223 113 Q262 92 299 119"/></g>'+
   '<path d="M241 65 L258 39 L278 66 L257 87Z" fill="url(#b)" stroke="#fff" stroke-width="5"/>'+
   '<path d="M255 39 L256 83 M242 65 L275 65" stroke="#fff" stroke-width="2" opacity=".7"/>'+
   '<path d="M105 260 Q210 290 317 259" stroke="#d9ad84" stroke-width="3" stroke-dasharray="3 11" fill="none"/>'+
   spark(83,72,.9,'#c8a072')+spark(340,103,1.1,'#e7c48c');
  break;
 case 'flowers':
  scene='<g stroke="#6b9675" stroke-width="7" fill="none" stroke-linecap="round">'+
  '<path d="M209 266 Q198 186 164 113 M209 266 Q232 191 276 101 M209 266 Q208 175 210 83 M209 267 Q169 213 110 159 M209 267 Q246 226 317 161"/>'+
  '</g><g fill="url(#mint)"><path d="M202 210 Q148 195 159 162 Q206 179 202 210Z"/><path d="M226 206 Q283 178 286 202 Q256 232 226 206Z"/>'+
  '<path d="M171 187 Q113 168 121 138 Q161 146 171 187Z"/><path d="M238 160 Q293 133 302 158 Q270 191 238 160Z"/></g>'+
  '<g filter="url(#shadow)"><use href="#flower" transform="translate(161 107) scale(.9)"/>'+
  '<use href="#flower" transform="translate(275 103) scale(1.05) rotate(12)"/>'+
  '<use href="#flower" transform="translate(210 83) scale(.89) rotate(-6)"/>'+
  '<use href="#flower" transform="translate(111 160) scale(.78) rotate(15)"/>'+
  '<use href="#flower" transform="translate(313 156) scale(.77)"/></g>'+
  '<path d="M156 222 L264 222 L246 270 Q206 283 178 267Z" fill="url(#a)" stroke="#fff3f8" stroke-width="4"/>'+
  '<path d="M168 227Q211 251 253 227" fill="none" stroke="#fff" stroke-width="4"/>'+
  spark(80,85,.9,'#d2b16d')+spark(346,71,.85,'#d2b16d');
  break;
 case 'moon':
  scene='<g filter="url(#shadow)"><circle cx="197" cy="145" r="94" fill="#fee6ac"/><circle cx="239" cy="113" r="86" fill="#3b385a"/></g>'+
   '<g fill="#ffedc5"><circle cx="316" cy="67" r="5"/><circle cx="89" cy="150" r="4"/><circle cx="320" cy="224" r="3"/><circle cx="357" cy="158" r="4"/></g>'+
   '<g transform="translate(120 194) rotate(-9)" filter="url(#shadow)">'+
   '<rect width="183" height="111" rx="9" fill="#f7e1ef" stroke="#fff2f8" stroke-width="5"/>'+
   '<path d="M0 0 L91 70 L183 0" fill="none" stroke="#c98eb9" stroke-width="4"/><path d="M0 107 L68 50 M183 107 L115 50" stroke="#c98eb9" stroke-width="3" fill="none"/>'+
   '<use href="#heart" transform="translate(93 42) scale(.17)" fill="#db82aa"/></g>'+
   spark(85,79,1.3,'#ffeec9')+spark(337,122,1.2,'#ffe8ba')+spark(360,245,.75,'#e6d4ff');
  break;
 case 'trophy':
  scene='<g filter="url(#shadow)"><path d="M134 68 L285 68 L272 181 Q261 222 211 233 Q160 217 146 181Z" fill="url(#gold)" stroke="#fff6d6" stroke-width="5"/>'+
   '<path d="M137 86 L100 87 Q69 88 77 129 Q88 171 153 169 M284 86 L319 86 Q349 86 343 129 Q334 171 267 169" fill="none" stroke="url(#gold)" stroke-width="19"/>'+
   '<rect x="195" y="218" width="31" height="40" rx="5" fill="url(#gold)"/><path d="M151 252 L266 252 L278 273 L139 273Z" fill="#ae783d" stroke="#f5d9a2" stroke-width="4"/>'+
   '<use href="#star-art" />'+
   '<path d="M211 104l14 27 31 4-23 22 6 31-28-14-28 14 5-31-22-22 31-4Z" fill="#fff2d4" stroke="#f5d197" stroke-width="4"/></g>'+
   '<g stroke-width="6" stroke-linecap="round"><path d="M89 58l-12-19" stroke="#bf7b9b"/><path d="M328 51l15-24" stroke="#9b82c4"/><path d="M367 112l20 3" stroke="#f2bd68"/><path d="M58 132l-24 6" stroke="#81b69c"/></g>'+
   spark(83,206,1.1,'#dbb77d')+spark(343,206,1.3,'#dabc85');
  break;
 case 'mail':
  scene='<g transform="translate(74 58) rotate(-8 140 100)" filter="url(#shadow)">'+
  '<rect width="279" height="189" rx="5" fill="#f6dfc2" stroke="#fff7e7" stroke-width="6"/>'+
  '<rect x="14" y="16" width="251" height="159" fill="#fff5df" stroke="#caa885" stroke-dasharray="6 4"/>'+
  '<path d="M36 68 H175 M36 87 H196 M36 105 H152" stroke="#b89e85" stroke-width="5" stroke-linecap="round" opacity=".68"/>'+
  '<g transform="translate(210 31)"><rect width="40" height="46" fill="#ead0d1" stroke="#bb8295" stroke-dasharray="4 3" stroke-width="2"/>'+
  '<use href="#heart" transform="translate(20 8) scale(.13)" fill="#b87c90"/></g>'+
  '<circle cx="209" cy="124" r="32" fill="none" stroke="#b77f75" stroke-width="3"/><circle cx="209" cy="124" r="24" fill="none" stroke="#b77f75" stroke-width="1"/>'+
  '<path d="M180 128 H263 M179 135 H262" stroke="#b77f75" stroke-width="3"/></g>'+
  '<use href="#flower" transform="translate(349 236) scale(.5) rotate(15)"/>'+spark(56,50,.8,'#be9079');
  break;
 case 'crown':
  scene='<g filter="url(#shadow)"><path d="M90 109 L131 183 L211 92 L291 183 L333 109 L316 241 L107 241Z" fill="url(#gold)" stroke="#fff0c2" stroke-width="5"/>'+
  '<path d="M109 242 L317 242 L322 263 L104 263Z" fill="#d9a754" stroke="#fff0c2" stroke-width="4"/>'+
  '<path d="M130 198 Q211 220 292 198" fill="none" stroke="#fce6a7" stroke-width="7"/>'+
  '<use href="#heart" transform="translate(210 182) scale(.25)" fill="#ba5285" stroke="#fff1d5" stroke-width="8"/>'+
  '<circle cx="90" cy="109" r="10" fill="#fff4ce"/><circle cx="333" cy="109" r="10" fill="#fff4ce"/><circle cx="211" cy="92" r="11" fill="#fff4ce"/>'+
  '</g>'+spark(57,83,1.3,'#ebd29c')+spark(364,73,1.4,'#ebd29c')+spark(60,229,.8,'#d2b780')+spark(366,219,.9,'#d2b780');
  break;
 case 'cosmos':
  scene='<ellipse cx="208" cy="171" rx="171" ry="63" transform="rotate(-23 208 171)" fill="none" stroke="#e4a8f1" stroke-width="13" opacity=".85"/>'+
  '<circle cx="214" cy="166" r="82" fill="url(#b)" stroke="#f9e4ff" stroke-width="6" filter="url(#shadow)"/>'+
  '<path d="M155 141 Q211 119 273 145 M157 183 Q215 215 274 174" stroke="#fff4ff" stroke-opacity=".38" stroke-width="13" fill="none"/>'+
  '<path d="M56 197 C113 242 316 221 367 108" fill="none" stroke="#ffcae9" stroke-width="10" stroke-linecap="round"/>'+
  '<g fill="#e8f9ff"><circle cx="66" cy="77" r="4"/><circle cx="326" cy="71" r="5"/><circle cx="369" cy="219" r="4"/><circle cx="95" cy="251" r="3"/></g>'+
  spark(88,103,1.3,'#f8dbfc')+spark(334,170,1.5,'#f6dbff')+spark(198,47,.7,'#ffedf5');
  break;
 case 'type':
  scene='<g fill="none" stroke="#aa7c65" stroke-width="2.5" opacity=".8">'+
  '<path d="M120 40 V266 M310 40 V266"/><path d="M118 46 H312 M118 262 H312"/>'+
  '<circle cx="214" cy="144" r="78" stroke-dasharray="2 11"/><circle cx="214" cy="144" r="57"/></g>'+
  '<path d="M212 97 Q159 120 183 161 Q204 186 220 186 Q260 175 249 130 Q246 108 222 111" fill="none" stroke="#c8849d" stroke-width="5" stroke-linecap="round"/>'+
  '<path d="M204 109 L213 96 L232 113" fill="none" stroke="#c8849d" stroke-width="5"/>'+
  '<path d="M137 206 H294 M156 221 H273" stroke="#c9a89c" stroke-width="3"/>'+
  spark(101,60,.65,'#c8849d')+spark(324,231,.65,'#c8849d');
  break;
 case 'box':
  scene='<g filter="url(#shadow)"><path d="M113 119 L211 91 L307 120 L211 151Z" fill="#f7d5e4" stroke="#fff" stroke-width="5"/>'+
  '<path d="M113 119 V230 L211 268 V151Z" fill="#d975a2" stroke="#fff0f6" stroke-width="4"/>'+
  '<path d="M307 119 V230 L211 268 V151Z" fill="#b567a6" stroke="#fff0f6" stroke-width="4"/>'+
  '<path d="M185 142 L238 153 V260 L185 243Z" fill="#fff2c6" opacity=".85"/>'+
  '<path d="M115 114 L70 79 L170 54 L217 93Z" fill="url(#a)" stroke="#fff4f7" stroke-width="5"/>'+
  '<path d="M217 93 L266 52 L358 81 L308 118Z" fill="url(#b)" stroke="#fff4f7" stroke-width="5"/>'+
  '<path d="M208 89 Q168 57 187 40 Q211 22 221 89 Q239 35 259 45 Q280 73 208 89Z" fill="none" stroke="#f3b7cf" stroke-width="16"/></g>'+
  spark(76,50,1.2,'#e9c3b6')+spark(350,57,1.4,'#e0b9e8')+spark(361,220,.95,'#fff1ce');
  break;
 case 'photos':
  scene='<g transform="translate(88 42) rotate(-12 115 120)" filter="url(#shadow)"><rect width="190" height="228" rx="6" fill="#fffaf0" stroke="#fff" stroke-width="6"/>'+
  '<rect x="13" y="12" width="164" height="157" fill="#c6d6c8"/>'+
  '<circle cx="133" cy="49" r="25" fill="#ffdbb3"/><path d="M14 165 L75 91 L105 127 L138 88 L177 146 L177 170Z" fill="#789e8b"/>'+
  '<path d="M45 193 H146 M63 205 H130" stroke="#c7aab0" stroke-width="3"/></g>'+
  '<g transform="translate(216 68) rotate(13 80 95)" filter="url(#shadow)"><rect width="135" height="181" rx="5" fill="#fff9f5" stroke="#fff" stroke-width="6"/>'+
  '<rect x="12" y="12" width="111" height="115" fill="#e7cadd"/><path d="M17 121 L48 75 L78 98 L105 63 L123 111 V126 H12Z" fill="#a688a5"/>'+
  '<circle cx="88" cy="41" r="14" fill="#fff1d2"/><use href="#heart" transform="translate(67 146) scale(.16)" fill="#bd6c8e"/></g>'+
  spark(61,59,.85,'#b8899f')+spark(362,68,1.0,'#b8899f');
  break;
 default: scene='<use href="#heart" transform="translate(210 72) scale(1)" fill="url(#a)"/>';
 }
 const svg='<svg class="cel-art-svg" viewBox="0 0 420 300" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">'+defs+scene+'</svg>';
 // Multiple artworks are visible in the gallery at once; each SVG must have isolated
 // gradients and symbols, including after live preview updates.
 const prefix='qd'+(++artworkSequence)+'_';
 return svg.replace(/\bid="(a|b|gold|mint|glow|shadow|heart|spark|petal|flower)"/g,(_,key)=>'id="'+prefix+key+'"')
  .replace(/url\(#(a|b|gold|mint|glow|shadow|heart|spark|petal|flower)\)/g,(_,key)=>'url(#'+prefix+key+')')
  .replace(/href="#(a|b|gold|mint|glow|shadow|heart|spark|petal|flower)"/g,(_,key)=>'href="#'+prefix+key+'"');
}
function galleryThumb(t,active){
 return '<button type="button" class="cel-design-choice skin-'+t.id+(active?' active':'')+
 '" data-cel="skin" data-skin="'+t.id+'" aria-pressed="'+Boolean(active)+'" title="'+t.name+' — '+t.sub+'">'+
 '<span class="cel-design-snapshot"><span class="cel-design-topline"></span>'+asset(t.kind)+
 '<span class="cel-design-footline"></span></span><strong>'+t.name+'</strong><small>'+t.sub+'</small></button>';
}
window.QalbimDesigns={TEMPLATES,DEFAULTS,asset,galleryThumb};
})();
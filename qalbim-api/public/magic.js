/* Qalbim Magic — lightweight, user-controlled scene interactivity.
   No tracking, no external audio, no automatic playback, no third-party assets. */
(function(){
'use strict';
const PREF='qalbim.scene.';
const SCENE_FX={
  1:{kind:'petals',marks:['❀','✿','🌹','❁'],count:25},2:{kind:'stars',marks:['✦','✧','⋆','·'],count:28},
  3:{kind:'sunrise',marks:['☼','✧','☀'],count:18},4:{kind:'leaves',marks:['❧','✿','❦'],count:21},
  5:{kind:'hearts',marks:['♡','♥','💗','✧'],count:25},6:{kind:'wax',marks:['✒','❦','✧'],count:14},
  7:{kind:'lavender',marks:['✾','🪻','❊'],count:22},8:{kind:'constellation',marks:['✧','✦','⋆'],count:28},
  9:{kind:'stamp',marks:['✉','♡','✧'],count:15},10:{kind:'sakura',marks:['🌸','❀','✿'],count:30},
  11:{kind:'bubbles',marks:['○','◌','◯','·'],count:30},12:{kind:'gilded',marks:['✦','✧','◆'],count:26},
  13:{kind:'polaroid',marks:['📸','♡','✧'],count:16},14:{kind:'neon',marks:['♡','♥','✦'],count:24},
  15:{kind:'snow',marks:['❄','✧','❅'],count:30},16:{kind:'diamonds',marks:['◇','◆','✦'],count:19},
  17:{kind:'rays',marks:['☀','✧','☼'],count:21},18:{kind:'poetry',marks:['♡','·','✧'],count:12}
};
function pref(name,otherwise){
 try{const v=localStorage.getItem(PREF+name);return v===null?otherwise:v==='1'}catch(e){return otherwise}
}
function save(name,val){try{localStorage.setItem(PREF+name,val?'1':'0')}catch(e){}}
const reduces=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let effects=pref('effects',true),sound=pref('sound',false),lastTap=0,ctx=null;
function escape(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function controls(){
 return '<div class="scene-options" role="group" aria-label="Interaktiv effekt sozlamalari">'+
 '<button type="button" data-magic-fx aria-pressed="'+effects+'" title="Animatsiyalarni yoqish yoki o‘chirish">'+(effects?'✨ Effektlar yoqilgan':'✨ Effektlar o‘chiq')+'</button>'+
 '<button type="button" data-magic-sound aria-pressed="'+sound+'" title="Original tovushlarni yoqish yoki o‘chirish">'+(sound?'♪ Ovoz yoqilgan':'♪ Ovoz o‘chiq')+'</button></div>';
}
function surprise(note,preview){
 const n=String(note||'').trim();
 if(!n)return '';
 if(preview)return '<div class="scene-secret-preview">'+window.QalbimIcons.svg('gift',15)+' Maxsus syurpriz tayyor</div>';
 return '<div class="scene-secret">'+
 '<button type="button" class="scene-gift" data-magic-gift aria-expanded="false">'+window.QalbimIcons.svg('gift',18)+' Men uchun bir sir bor ekan... <span>↗</span></button>'+
 '<div class="scene-gift-card" hidden><div class="gift-star" aria-hidden="true">✦</div>'+
 '<div class="gift-caption">YURAKDAN SIR</div><p data-secret-note>'+escape(n)+'</p>'+
 '<span class="gift-sign">Faqat sen uchun ♡</span></div></div>';
}
function secureCtx(){
 if(!ctx){
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C)return null;
  try{ctx=new C()}catch(err){return null}
 }
 return ctx;
}
function note(frequency,time,length,volume){
 const c=secureCtx();if(!c)return;
 const oscillator=c.createOscillator(),amp=c.createGain();
 oscillator.type='sine';
 oscillator.frequency.setValueAtTime(frequency,time);
 amp.gain.setValueAtTime(0.0001,time);
 amp.gain.exponentialRampToValueAtTime(volume,time+.018);
 amp.gain.exponentialRampToValueAtTime(0.0001,time+length);
 oscillator.connect(amp);amp.connect(c.destination);
 oscillator.start(time);oscillator.stop(time+length+.01);
 oscillator.onended=()=>{oscillator.disconnect();amp.disconnect()};
}
function chime(theme){
 if(!sound)return;
 const c=secureCtx();if(!c)return;
 try{
  if(c.state==='suspended')c.resume();
  const i=Number(theme)||1,bases=[440,392,349.23,523.25,466.16,329.63];
  const base=bases[i%bases.length];
  // Three simple original chiming tones; no recorded/copyrighted music.
  [1,1.25,1.5].forEach((m,k)=>note(base*m,c.currentTime+k*.115,.33,.035));
 }catch(e){}
}
function oneParticle(stage,mark,x,y,dx,dy,rotation,duration){
 const node=document.createElement('span');
 node.className='magic-particle';
 const icons=['flower','moon','sun','leaf','heart','feather','flower','star','mail','flower','waves','crown','camera','zap','snow','gem','sun','heart'];
 node.innerHTML=window.QalbimIcons.svg(icons[(Number(stage.dataset.scene)||1)-1]||'sparkle',18);
 node.style.left=x+'px';node.style.top=y+'px';
 node.style.setProperty('--mx',dx+'px');node.style.setProperty('--my',dy+'px');
 node.style.setProperty('--turn',rotation+'deg');
 node.style.setProperty('--duration',duration+'ms');
 stage.appendChild(node);
 node.addEventListener('animationend',()=>node.remove(),{once:true});
 setTimeout(()=>{if(node.isConnected)node.remove()},duration+400);
}
function erupt(stage,x,y,light=false){
 if(!effects||reduces()||document.visibilityState==='hidden')return;
 if(stage.dataset.fxRunning==='1')return;
 const theme=Number(stage.dataset.scene)||1,mode=SCENE_FX[theme]||SCENE_FX[1];
 const rect=stage.getBoundingClientRect();
 x=Number.isFinite(x)?x:rect.width/2;
 y=Number.isFinite(y)?y:rect.height*.55;
 const n=light?Math.min(5,mode.count):mode.count;
 const pool=stage.querySelectorAll('.magic-particle');
 if(pool.length>85)pool.forEach((el,i)=>{if(i<pool.length-75)el.remove()});
 if(!light){stage.dataset.fxRunning='1';setTimeout(()=>{delete stage.dataset.fxRunning},700)}
 for(let i=0;i<n;i++){
   const angle=(Math.PI*2*i/n)+Math.random()*.6;
   const force=(light?27:65)+Math.random()*(light?60:155);
   let dx=Math.cos(angle)*force,dy=Math.sin(angle)*force;
   if(['petals','sakura','snow','lavender','leaves'].includes(mode.kind)){
     dx=(Math.random()-.5)*(light?65:240);
     dy=Math.random()*(light?65:280)+15;
     y=light?y:Math.random()*rect.height*.26;
   }else if(mode.kind==='bubbles'){
     dx=(Math.random()-.5)*170;dy=-(70+Math.random()*210);
     y=light?y:rect.height*(.72+Math.random()*.23);
   }else if(['stars','constellation','gilded','diamonds'].includes(mode.kind)){
     dy=Math.sin(angle)*force;dx=Math.cos(angle)*force;
   }else if(['sunrise','rays'].includes(mode.kind)){
     dy=-(Math.random()*190+20);
   }
   oneParticle(stage,mode.marks[i%mode.marks.length],light?x:(x+(Math.random()-.5)*rect.width*.55),
    light?y:y+(Math.random()-.5)*rect.height*.20,Math.round(dx),Math.round(dy),
    Math.round(Math.random()*220-110),Math.round((light?650:1050)+Math.random()*850));
 }
}
function activate(button){
 const stage=button.closest('.letter-scene');if(!stage)return;
 const theme=Number(stage.dataset.scene)||1;
 stage.classList.remove('scene-awake','magic-active');void stage.offsetHeight;
 stage.classList.add('scene-awake','magic-active');
 erupt(stage,null,null,false);chime(theme);
 setTimeout(()=>stage.classList.remove('magic-active'),2300);
}
function refreshButtons(){
 document.querySelectorAll('[data-magic-fx]').forEach(b=>{
  b.innerHTML=window.QalbimIcons.svg('sparkle',16)+(effects?' Effektlar yoqilgan':' Effektlar o‘chiq');
  b.setAttribute('aria-pressed',String(effects));
 });
 document.querySelectorAll('[data-magic-sound]').forEach(b=>{
  b.innerHTML=window.QalbimIcons.svg(sound?'volume':'volumex',16)+(sound?' Ovoz yoqilgan':' Ovoz o‘chiq');
  b.setAttribute('aria-pressed',String(sound));
 });
}
function gift(btn){
 const scene=btn.closest('.letter-scene');if(!scene)return;
 const box=btn.parentElement.querySelector('.scene-gift-card');if(!box)return;
 if(!box.hidden){box.hidden=true;btn.setAttribute('aria-expanded','false');btn.innerHTML=window.QalbimIcons.svg('gift',18)+' Men uchun bir sir bor ekan...';return}
 box.hidden=false;btn.setAttribute('aria-expanded','true');
 btn.innerHTML=window.QalbimIcons.svg('mail',18)+' Syurprizni yashirish';
 erupt(scene,null,null,false);chime(Number(scene.dataset.scene)||1);
}
document.addEventListener('click',e=>{
 const fx=e.target.closest('[data-magic-fx]'),voice=e.target.closest('[data-magic-sound]'),present=e.target.closest('[data-magic-gift]');
 if(fx){effects=!effects;save('effects',effects);refreshButtons();return}
 if(voice){sound=!sound;save('sound',sound);refreshButtons();if(sound)chime(1);return}
 if(present){gift(present);return}
});
document.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;
 const stage=e.target.closest('.letter-scene.scene-full');
 if(!stage||e.target.closest('button,a,input,textarea,select,.scene-gift-card'))return;
 const ts=performance.now();
 if(ts-lastTap<155)return;
 lastTap=ts;
 const r=stage.getBoundingClientRect();
 erupt(stage,e.clientX-r.left,e.clientY-r.top,true);
},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('.magic-particle').forEach(el=>el.remove())});
window.QalbimMagic={activate,controls,surprise,refreshButtons,erupt};
})();
/* Qalbim Arcade v1.0 — local-first HTML5 mini-games for Telegram WebApp and low-memory phones.
   No ads, no tracking, no external game engine. */
(function(){
'use strict';
const $=(root,sel)=>root.querySelector(sel);
const $$=(root,sel)=>[...root.querySelectorAll(sel)];
const icon=(name,size=22)=>window.QalbimIcons.svg(name,size);
const GAMES=[
 {id:'catch',name:'Yuraklarni tut',eyebrow:'ARCADE / TEZLIK',summary:'Harakatlanuvchi savatcha bilan yuraklarni tuting. 40 soniya ichida rekord o‘rnating.',detail:'1 o‘yinchi',tone:'violet',symbol:'heart',index:'01'},
 {id:'memory',name:'Xotira kartalari',eyebrow:'PUZZLE / XOTIRA',summary:'Kartalarni oching va 6 ta mos juftlikni eng kam yurishda toping.',detail:'1–2 o‘yinchi',tone:'mint',symbol:'gem',index:'02'},
 {id:'quiz',name:'Biz qanchalik mosmiz?',eyebrow:'COUPLE / SAVOL-JAVOB',summary:'Birinchi odam javobni tanlaydi, ikkinchisi topadi. 8 raundlik juftlik o‘yini.',detail:'2 kishi · bitta telefon',tone:'rose',symbol:'heart',index:'03'}
];
const QUESTIONS=[
 {q:'Ideal yakshanba qanday o‘tadi?',opts:['Sayr va kafe','Uyda film ko‘rish','Yangi joyga sayohat']},
 {q:'Kutilmagan sovg‘a nimadan iborat bo‘lsa yaxshi?',opts:['Qo‘lda yozilgan xat','Gullar yoki shirinlik','Birgalikdagi tajriba']},
 {q:'Dam olish uchun qayerni tanlaymiz?',opts:['Tog‘lar','Dengiz bo‘yi','Shovqinli shahar']},
 {q:'Eng yaxshi uchrashuv vaqti?',opts:['Tongda','Quyosh botganda','Yulduzli kechada']},
 {q:'Birgalikdagi bayram uchun nima qilamiz?',opts:['Piknik','Romantik kechki ovqat','Kichik sayohat']},
 {q:'Ko‘proq qanday xabar yoqadi?',opts:['Samimiy uzun maktub','Qisqa, yoqimli xabar','Ovozli tabrik']},
 {q:'Muhim kunda qaysi syurpriz quvontiradi?',opts:['Sevimli taom','Esdalik fotoalbom','Kutilmagan uchrashuv']},
 {q:'Birgalikda yangi nimani o‘rganamiz?',opts:['Raqs','Taom tayyorlash','Yangi til']}
];
const MEM_ICONS=['heart','flower','star','moon','gem','gift'];
const BEST_KEY='qalbim_arcade_best_v1';
function loadScores(){try{const d=JSON.parse(localStorage.getItem(BEST_KEY)||'{}');return d&&typeof d==='object'?d:{}}catch(e){return {}}}
function saveScore(id,value,better){
 try{const data=loadScores();const prev=Number(data[id]);if(!Number.isFinite(prev)||better(value,prev)){data[id]=value;localStorage.setItem(BEST_KEY,JSON.stringify(data))}}catch(e){}
}
function bestLabel(id){
 const n=Number(loadScores()[id]);return Number.isFinite(n)?(id==='catch'?n+' ball':id==='memory'?n+' yurish':n+'/8 mos'):'Hali rekord yo‘q';
}
function hub(){
 return '<div class="arcade-shell"><div class="arcade-hero"><div class="arcade-copy">'+
 '<div class="arcade-kicker">'+icon('sparkle',15)+' QALBIM / PLAY SPACE</div>'+
 '<h1>Birga o‘ynash —<br><em>yana bir xotira.</em></h1>'+
 '<p>Yengil, tez ochiladigan va oddiygina quvonch ulashadigan mini-o‘yinlar. Hech narsa o‘rnatish shart emas.</p>'+
 '<div class="arcade-hero-pills"><span>'+icon('check',15)+' HTML5</span><span>'+icon('zap',15)+' Kichik hajm</span><span>'+icon('heart',15)+' Bepul</span></div></div>'+
 '<div class="arcade-hero-art" aria-hidden="true"><div class="arcade-orbit"><span class="arcade-heart">'+icon('heart',72)+'</span><span class="arcade-orbit-dot"></span><span class="arcade-orbit-dot orbit-dot-2"></span></div><span class="arcade-hero-mini one">'+icon('star',22)+'</span><span class="arcade-hero-mini two">'+icon('gem',25)+'</span></div></div>'+
 '<div class="arcade-heading"><div><span>O‘YINLAR KOLLEKSIYASI</span><h2>O‘yin tanlang</h2></div><strong>03 / 03</strong></div>'+
 '<div class="arcade-grid">'+GAMES.map(g=>'<button type="button" class="arcade-game-card tone-'+g.tone+'" data-arcade-launch="'+g.id+'">'+
 '<div class="arcade-card-banner"><span class="arcade-card-no">'+g.index+' / 03</span><span class="arcade-card-graphic">'+icon(g.symbol,63)+'</span><span class="arcade-card-particle">'+icon('sparkle',25)+'</span></div>'+
 '<div class="arcade-card-content"><div class="arcade-card-category">'+g.eyebrow+'</div><h3>'+g.name+'</h3><p>'+g.summary+'</p>'+
 '<div class="arcade-card-footer"><span>'+icon('users',15)+' '+g.detail+'</span><strong>'+icon('arrowup',18)+' O‘ynash</strong></div></div></button>').join('')+'</div>'+
 '<div class="arcade-notice">'+icon('shield',19)+' <p>O‘yinlardagi shaxsiy natijalar faqat shu qurilma brauzerida saqlanadi. Juftlik viktorinasida ikkala odam navbat bilan bir telefondan foydalanadi.</p></div></div>';
}
let current=null;
function clean(){
 if(!current)return;
 try{current.dispose?.()}catch(e){}
 current=null;
}
function rootEl(){return document.getElementById('arcadePlayArea')}
function openGame(id){
 const g=GAMES.find(x=>x.id===id);if(!g)return;
 clean();
 const root=rootEl();if(!root)return;
 const shell=root.closest('.arcade-shell');
 shell.querySelector('.arcade-hero').hidden=true;shell.querySelector('.arcade-heading').hidden=true;
 shell.querySelector('.arcade-grid').hidden=true;shell.querySelector('.arcade-notice').hidden=true;
 root.hidden=false;root.innerHTML=
 '<div class="arcade-playtop"><button class="arcade-back" data-arcade-back>'+icon('arrow',17)+' Barcha o‘yinlar</button>'+
 '<span>'+g.eyebrow+'</span></div><div class="arcade-game-stage"><div class="arcade-stage-head"><span class="arcade-stage-icon tone-'+g.tone+'">'+icon(g.symbol,28)+'</span>'+
 '<div><h2>'+g.name+'</h2><p>'+g.summary+'</p></div></div><div class="arcade-game-body"></div></div>';
 const body=$(root,'.arcade-game-body');if(id==='catch')current=catchGame(body);if(id==='memory')current=memoryGame(body);if(id==='quiz')current=quizGame(body);
 root.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
}
function back(){
 clean();const root=rootEl();if(!root)return;
 const shell=root.closest('.arcade-shell');root.replaceChildren();root.hidden=true;
 for(const key of ['.arcade-hero','.arcade-heading','.arcade-grid','.arcade-notice'])$(shell,key).hidden=false;
}
document.addEventListener('click',e=>{
 const start=e.target.closest('[data-arcade-launch]');if(start){openGame(start.dataset.arcadeLaunch);return}
 if(e.target.closest('[data-arcade-back]'))back();
});
window.addEventListener('pagehide',clean);
function mount(){clean();return hub()+'<div id="arcadePlayArea" hidden></div>'}
function memoryGame(root){
 let deck=[],flipped=[],matched=0,turns=0,locked=false,clock=null,started=0,timeout=null,disposed=false;
 root.innerHTML='<div class="arcade-status-row"><div>'+icon('check',17)+' Juftliklar <strong id="memPairs">0 / 6</strong></div>'+
 '<div>'+icon('arrow',17)+' Yurish <strong id="memTurns">0</strong></div>'+
 '<div>'+icon('clock',17)+' Vaqt <strong id="memTime">00:00</strong></div></div>'+
 '<div class="arcade-memory-board" id="memoryBoard"></div>'+
 '<div class="arcade-actions"><button class="btn" id="memoryRestart">'+icon('refresh',17)+' Qaytadan o‘ynash</button>'+
 '<span class="arcade-best">Shaxsiy rekord: <b id="memoryBest">'+bestLabel('memory')+'</b></span></div>'+
 '<div id="memoryResult" class="arcade-game-message" aria-live="polite">Bir xil belgili ikkita kartani toping.</div>';
 const board=$(root,'#memoryBoard'),timerLabel=$(root,'#memTime');
 function restart(){
  clearInterval(clock);clearTimeout(timeout);
  deck=[...MEM_ICONS,...MEM_ICONS].map((type,i)=>({type,key:i,open:false,won:false}));
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
  turns=0;matched=0;flipped=[];locked=false;started=Date.now();
  $(root,'#memPairs').textContent='0 / 6';$(root,'#memTurns').textContent='0';timerLabel.textContent='00:00';
  $(root,'#memoryResult').textContent='Bir xil belgili ikkita kartani toping.';
  board.innerHTML=deck.map((c,i)=>'<button type="button" class="memory-tile" data-mem-card="'+i+'" aria-label="'+(i+1)+'-yopiq karta" aria-pressed="false">'+
   '<span class="memory-tile-back">'+icon('heart',25)+'</span><span class="memory-tile-front">'+icon(c.type,34)+'</span></button>').join('');
  clock=setInterval(()=>{
   if(disposed)return;const s=Math.floor((Date.now()-started)/1000);timerLabel.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  },1000);
 }
 function click(i){
  const c=deck[i],button=board.querySelector('[data-mem-card="'+i+'"]');
  if(disposed||locked||!c||c.open||c.won||!button)return;
  c.open=true;flipped.push(i);button.classList.add('flipped');button.setAttribute('aria-pressed','true');
  if(flipped.length<2)return;
  turns++;$(root,'#memTurns').textContent=String(turns);
  const [x,y]=flipped;
  if(deck[x].type===deck[y].type){
   deck[x].won=deck[y].won=true;matched++;flipped=[];
   for(const index of [x,y]){const el=board.querySelector('[data-mem-card="'+index+'"]');el.classList.add('matched');el.setAttribute('aria-label','Topilgan juftlik: '+deck[index].type)}
   $(root,'#memPairs').textContent=matched+' / 6';
   if(matched===6){
    clearInterval(clock);const seconds=Math.floor((Date.now()-started)/1000);
    saveScore('memory',turns,(next,old)=>next<old);
    $(root,'#memoryBest').textContent=bestLabel('memory');
    $(root,'#memoryResult').innerHTML='<strong>Barcha juftliklarni topdingiz!</strong> '+turns+' yurish · '+seconds+' soniya. Yana bir marta urinib ko‘ring.';
   }
  }else{
   locked=true;
   timeout=setTimeout(()=>{
     for(const index of [x,y]){deck[index].open=false;const el=board.querySelector('[data-mem-card="'+index+'"]');if(el){el.classList.remove('flipped');el.setAttribute('aria-pressed','false')}}
     flipped=[];locked=false;
   },800);
  }
 }
 const handle=e=>{const el=e.target.closest('[data-mem-card]');if(el)click(Number(el.dataset.memCard))};
 board.addEventListener('click',handle);
 $(root,'#memoryRestart').addEventListener('click',restart);
 restart();
 return {dispose(){disposed=true;clearInterval(clock);clearTimeout(timeout)}};
}
function quizGame(root){
 const game={step:0,points:0,phase:'answer',chosen:null,disposed:false};
 root.innerHTML='<div class="arcade-quiz-status"><span id="quizRound">01 / 08 · Raund</span><strong id="quizPoints">0 ta mos javob</strong></div>'+
 '<div class="arcade-quiz-panel"><div class="arcade-quiz-number" id="quizPhaseName">1-kishi javobi</div>'+
 '<h3 id="quizQuestion"></h3><p id="quizInstruction"></p>'+
 '<div id="quizOptions" class="arcade-quiz-options"></div>'+
 '<div id="quizResult" class="arcade-quiz-result" hidden></div>'+
 '<div class="arcade-quiz-actions"><button class="btn" id="quizContinue" hidden>Davom etish '+icon('arrow',17)+'</button></div></div>'+
 '<div class="arcade-game-message" id="quizMessage">'+icon('shield',18)+' Birinchi odam javob bergandan so‘ng telefonni juftiga uzatadi.</div>';
 const render=()=>{
  const q=QUESTIONS[game.step];
  $(root,'#quizRound').textContent=String(game.step+1).padStart(2,'0')+' / 08 · Raund';
  $(root,'#quizPoints').textContent=game.points+' ta mos javob';
  $(root,'#quizResult').hidden=true;$(root,'#quizContinue').hidden=true;
  $(root,'#quizQuestion').textContent=q.q;
  if(game.phase==='answer'){
   $(root,'#quizPhaseName').textContent='01 · Birinchi odam';
   $(root,'#quizInstruction').textContent='O‘zingizga eng mos javobni tanlang. Javobingiz keyingi odamdan yashiriladi.';
  }else if(game.phase==='pass'){
   $(root,'#quizPhaseName').textContent='02 · Telefonni uzating';
   $(root,'#quizInstruction').textContent='Tanlov saqlandi. Endi telefonni ikkinchi odamga uzating; u javobni taxmin qiladi.';
  }else{
   $(root,'#quizPhaseName').textContent='03 · Juftingiz taxmin qiladi';
   $(root,'#quizInstruction').textContent='Sherigingiz qaysi variantni tanlagan deb o‘ylaysiz?';
  }
  $(root,'#quizOptions').innerHTML=game.phase==='pass'?
   '<button class="arcade-quiz-pass" id="quizReady">'+icon('arrow',20)+' Tayyor! Taxmin qilish</button>':
   q.opts.map((answer,i)=>'<button type="button" class="arcade-quiz-option" data-quiz-select="'+i+'"><span class="quiz-letter">'+String.fromCharCode(65+i)+'</span>'+
   '<span>'+answer+'</span>'+icon('arrow',17)+'</button>').join('');
 };
 const done=()=>{
  const pct=Math.round(game.points/QUESTIONS.length*100);saveScore('quiz',game.points,(next,old)=>next>old);
  $(root,'#quizRound').textContent='Yakunlandi';
  $(root,'#quizPoints').textContent=game.points+' ta mos';
  $(root,'#quizPhaseName').textContent='O‘YIN TUGADI';
  $(root,'#quizQuestion').textContent=game.points>=6?'Bir-biringizni ajoyib bilasiz!':'Bir-biringizni yanada yaxshiroq taniysiz';
  $(root,'#quizInstruction').textContent='8 ta savoldan '+game.points+' tasida javoblaringiz mos keldi ('+pct+'%).';
  $(root,'#quizOptions').innerHTML='<button type="button" class="arcade-quiz-pass" id="quizRestart">'+icon('refresh',18)+' Yana o‘ynash</button>';
  $(root,'#quizResult').hidden=false;$(root,'#quizResult').innerHTML='Shu qurilmadagi eng yaxshi natija: <strong>'+bestLabel('quiz')+'</strong>';
  $(root,'#quizContinue').hidden=true;$(root,'#quizMessage').textContent='Javoblar faqat o‘yin davomida shu oynada saqlanadi.';
 };
 root.addEventListener('click',e=>{
  if(game.disposed)return;
  const select=e.target.closest('[data-quiz-select]');
  if(select){
   const index=Number(select.dataset.quizSelect);
   if(game.phase==='answer'){
    game.chosen=index;game.phase='pass';render();
   }else if(game.phase==='guess'){
    const yes=index===game.chosen;if(yes)game.points++;
    game.phase='result';
    const answer=QUESTIONS[game.step].opts[game.chosen];
    $(root,'#quizResult').hidden=false;
    $(root,'#quizResult').innerHTML=(yes?'<strong>Mos keldi!</strong> ':'<strong>Bu safar farq qildi.</strong> ')+
       'Birinchi odamning tanlovi: <b>'+answer+'</b>.';
    $(root,'#quizOptions').innerHTML='';$(root,'#quizContinue').hidden=false;
    $(root,'#quizPhaseName').textContent='NATIJA';
    $(root,'#quizPoints').textContent=game.points+' ta mos javob';
   }
   return;
  }
  if(e.target.closest('#quizReady')&&game.phase==='pass'){game.phase='guess';render();return}
  if(e.target.closest('#quizContinue')&&game.phase==='result'){
   game.step++;game.chosen=null;game.phase='answer';if(game.step>=QUESTIONS.length){done();return}render();return;
  }
  if(e.target.closest('#quizRestart')){game.step=0;game.points=0;game.phase='answer';game.chosen=null;render()}
 });
 render();
 return {dispose(){game.disposed=true}};
}
function catchGame(root){
 root.innerHTML='<div class="arcade-status-row"><div>'+icon('heart',17)+' Ball <strong id="catchScore">0</strong></div>'+
 '<div>'+icon('clock',17)+' Qoldi <strong id="catchTime">40s</strong></div>'+
 '<div>'+icon('star',17)+' Rekord <strong id="catchBest">'+bestLabel('catch')+'</strong></div></div>'+
 '<div class="arcade-catch-area"><canvas id="catchCanvas" width="560" height="360" aria-label="Tushayotgan yuraklarni savatcha bilan tutish o‘yini"></canvas>'+
 '<div class="arcade-catch-overlay" id="catchOverlay"><div class="arcade-catch-modal">'+icon('heart',48)+'<h3>Yuraklar yomg‘iri</h3>'+
 '<p>Pastdagi savatchani sichqoncha yoki barmoq bilan suring. Yuraklarni tuting, qorong‘i to‘siqlardan qoching.</p>'+
 '<button type="button" class="btn" id="catchStart">O‘yinni boshlash '+icon('arrow',16)+'</button></div></div></div>'+
 '<div class="arcade-catch-hint">'+icon('zap',16)+' Telefon: barmoq bilan suring · Kompyuter: sichqoncha yoki ← →</div>';
 const canvas=$(root,'#catchCanvas'),c=canvas.getContext('2d'),W=560,H=360;
 if(!c){$(root,'.arcade-catch-area').textContent='Bu brauzerda Canvas mavjud emas';return {dispose(){}}}
 let raf=null,score=0,remaining=40,running=false,disposed=false,last=0,spawn=0,elapsed=0,move=0;
 let basketX=W/2,keys={left:false,right:false},drops=[],effects=[];
 const colors={background:'#151424',line:'#ffffff12',pink:'#e7a0c8',purple:'#b89dea',light:'#fff8ef'};
 const reduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
 function heart(x,y,size,color){
  c.save();c.translate(x,y);c.scale(size/20,size/20);
  c.fillStyle=color;c.beginPath();c.moveTo(0,9);c.bezierCurveTo(-15,0,-16,-9,-7,-11);
  c.bezierCurveTo(-2,-12,0,-7,0,-5);c.bezierCurveTo(5,-15,18,-12,14,-2);
  c.bezierCurveTo(13,3,5,9,0,12);c.closePath();c.fill();c.restore();
 }
 function paint(){
  const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#211c37');g.addColorStop(1,'#534064');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  c.lineWidth=1;
  for(let i=0;i<17;i++){
   const x=(i*107+23)%W,y=(i*71+31)%H;
   c.fillStyle='rgba(255,255,255,.16)';c.beginPath();c.arc(x,y,1.1,0,Math.PI*2);c.fill();
  }
  c.fillStyle='rgba(255,255,255,.08)';c.fillRect(0,H-24,W,2);
  for(const d of drops){
   if(d.bad){
    c.save();c.translate(d.x,d.y);c.rotate(d.rot);c.fillStyle='#373041';
    c.strokeStyle='#e5b8dc';c.lineWidth=2;c.beginPath();c.moveTo(0,-d.r);c.lineTo(d.r,0);c.lineTo(0,d.r);c.lineTo(-d.r,0);c.closePath();c.fill();c.stroke();c.restore();
   }else heart(d.x,d.y,d.r,d.gold?'#ffdaac':colors.pink);
  }
  for(const e of effects){c.globalAlpha=Math.max(0,e.life);heart(e.x,e.y,12+12*(1-e.life),e.bad?'#a7a0b4':'#ffdfef')}c.globalAlpha=1;
  const x=basketX,y=H-42;
  c.fillStyle='#f8eaf6';c.strokeStyle='#e0b6f0';c.lineWidth=3;
  c.beginPath();c.roundRect(x-49,y,98,20,[4,4,13,13]);c.fill();c.stroke();
  c.strokeStyle='#d6b8ec';c.lineWidth=4;c.beginPath();c.moveTo(x-43,y+1);c.quadraticCurveTo(x,H-55,x+43,y+1);c.stroke();
  c.fillStyle='#6a4d85';c.fillRect(x-30,y+9,60,3);
 }
 function end(){
  if(!running)return;running=false;cancelAnimationFrame(raf);
  saveScore('catch',score,(a,b)=>a>b);
  $(root,'#catchBest').textContent=bestLabel('catch');
  $(root,'#catchOverlay').hidden=false;
  $(root,'#catchOverlay').innerHTML='<div class="arcade-catch-modal">'+icon('star',43)+
    '<h3>O‘yin yakunlandi</h3><div class="arcade-finish-score">'+score+' ball</div>'+
    '<p>Shu o‘yinda '+score+' ball to‘pladingiz. Yana urinib, rekordni yangilang!</p>'+
    '<button type="button" class="btn" id="catchStart">'+icon('refresh',17)+' Qaytadan o‘ynash</button></div>';
 }
 function frame(now){
  if(disposed||!running)return;
  if(!last)last=now;
  const dt=Math.min((now-last)/1000,.045);last=now;
  if(document.hidden){raf=requestAnimationFrame(frame);return}
  elapsed+=dt;remaining=Math.max(0,40-elapsed);
  $(root,'#catchTime').textContent=Math.ceil(remaining)+'s';
  if(!remaining){end();return}
  if(keys.left)basketX=Math.max(52,basketX-350*dt);
  if(keys.right)basketX=Math.min(W-52,basketX+350*dt);
  spawn+=dt;
  if(spawn>.56){
    spawn=0;drops.push({x:20+Math.random()*(W-40),y:-25,r:16+Math.random()*7,speed:92+Math.random()*115,bad:Math.random()<.18,gold:Math.random()<.10,rot:Math.random()*3});
  }
  for(const d of drops){
   d.y+=d.speed*dt;d.rot+=dt;
   if(d.y>H-55&&d.y<H-22&&Math.abs(d.x-basketX)<50){
    score=Math.max(0,score+(d.bad?-3:d.gold?3:1));$(root,'#catchScore').textContent=String(score);effects.push({x:d.x,y:d.y,life:1,bad:d.bad});d.remove=true;
   }else if(d.y>H+25)d.remove=true;
  }
  drops=drops.filter(d=>!d.remove);effects.forEach(e=>e.life-=dt*2);effects=effects.filter(e=>e.life>0);
  paint();raf=requestAnimationFrame(frame);
 }
 function start(){
  cancelAnimationFrame(raf);score=0;remaining=40;elapsed=0;spawn=0;last=0;basketX=W/2;drops=[];effects=[];
  $(root,'#catchScore').textContent='0';$(root,'#catchTime').textContent='40s';
  $(root,'#catchOverlay').hidden=true;running=true;paint();raf=requestAnimationFrame(frame);
 }
 function pointer(e){
  if(!running)return;
  const r=canvas.getBoundingClientRect();
  basketX=Math.max(50,Math.min(W-50,(e.clientX-r.left)/Math.max(1,r.width)*W));
 }
 function keydown(e){
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
   if(running&&document.activeElement===canvas){e.preventDefault();keys[e.key==='ArrowLeft'?'left':'right']=true}
  }
 }
 function keyup(e){if(e.key==='ArrowLeft')keys.left=false;if(e.key==='ArrowRight')keys.right=false}
 canvas.tabIndex=0;canvas.addEventListener('pointermove',pointer);canvas.addEventListener('pointerdown',e=>{pointer(e);canvas.focus()});
 window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
 root.addEventListener('click',e=>{if(e.target.closest('#catchStart'))start()});
 $(root,'#catchOverlay').hidden=false;paint();
 return {dispose(){disposed=true;running=false;cancelAnimationFrame(raf);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup)}};
}
window.QalbimGames={mount,hub,openGame,back,clean,GAMES};
})();
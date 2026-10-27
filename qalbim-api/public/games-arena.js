/* Qalbim Arena v2: free offline challenges + authenticated couple-only multiplayer rooms */
(function(){
'use strict';
const I=(name,size=20)=>window.QalbimIcons.svg(name,size);
const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SYMBOLS=['heart','flower','star','moon','gem','gift'];
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let ctx=null,hubTimer=null,lobbyPending=false,lobbyRevision='',alreadyAutoRoom='';
function setup(data){ctx=data}
const read=()=>ctx?.getMe?.();
function message(text){ctx?.notify?.(text)}
function errorUI(root,text,action){
 root.innerHTML='<div class="arena-state">'+I('shield',38)+'<h3>'+E(text)+'</h3>'+
 (action||'')+'</div>';
}
function launchFree(type,root){
 if(type==='xoai')return soloXO(root);
 if(type==='secret')return secretCode(root);
 return {dispose(){}};
}
function soloXO(root){
 let board,finished,waitingAI=false,aiTimeout=null,disposed=false,losses=0,wins=0,draws=0;
 const winning=s=>LINES.some(line=>line.every(i=>board[i]===s));
 root.innerHTML='<div class="arena-solo-stats"><span>'+I('heart',18)+' Siz <b id="soloWin">0</b></span><span>'+I('star',18)+' Raqib <b id="soloLoss">0</b></span><span>'+I('gem',18)+' Durang <b id="soloDraw">0</b></span></div>'+
 '<div class="arena-xo-board" id="soloBoard"></div><div class="arcade-game-message" id="soloStatus" aria-live="polite"></div>'+
 '<div class="arcade-actions"><button class="btn" id="soloRestart">'+I('refresh',17)+' Qayta o‘ynash</button><span class="arcade-best">Siz '+I('heart',15)+' · raqib '+I('star',15)+'</span></div>';
 const boardEl=root.querySelector('#soloBoard'),status=root.querySelector('#soloStatus');
 function chooseBot(){
  const empty=board.map((v,i)=>v===null?i:-1).filter(i=>i>=0);
  if(!empty.length)return -1;
  for(const i of empty){board[i]='star';let won=winning('star');board[i]=null;if(won)return i}
  for(const i of empty){board[i]='heart';let won=winning('heart');board[i]=null;if(won)return i}
  if(empty.includes(4))return 4;
  const corners=empty.filter(i=>[0,2,6,8].includes(i));
  if(corners.length)return corners[Math.floor(Math.random()*corners.length)];
  return empty[Math.floor(Math.random()*empty.length)];
 }
 function draw(){
  boardEl.innerHTML=board.map((v,i)=>'<button class="arena-xo-cell '+(v?'occupied':'')+'" data-solo-cell="'+i+'" aria-label="'+(i+1)+'-katak" '+(v||finished||waitingAI?'disabled':'')+'>'+
   (v?I(v,44):'')+'</button>').join('');
 }
 function finish(winner){
  finished=true;wins+=winner==='heart'?1:0;losses+=winner==='star'?1:0;draws+=winner==='draw'?1:0;
  root.querySelector('#soloWin').textContent=wins;root.querySelector('#soloLoss').textContent=losses;root.querySelector('#soloDraw').textContent=draws;
  status.textContent=winner==='heart'?'Yutdingiz!':winner==='star'?'Bu safar AI yutdi.':'Durang!';draw();
 }
 function reset(){clearTimeout(aiTimeout);board=Array(9).fill(null);finished=false;waitingAI=false;status.textContent='Sizning yurishingiz · katakni bosing';draw()}
 root.addEventListener('click',e=>{
  if(e.target.closest('#soloRestart')){reset();return}
  const b=e.target.closest('[data-solo-cell]');if(!b||finished||waitingAI)return;
  const i=Number(b.dataset.soloCell);if(board[i]!==null)return;
  board[i]='heart';if(winning('heart')){finish('heart');return}if(board.every(Boolean)){finish('draw');return}
  waitingAI=true;status.textContent='Raqib o‘ylayapti…';draw();
  aiTimeout=setTimeout(()=>{if(disposed||finished)return;const pick=chooseBot();waitingAI=false;if(pick>=0)board[pick]='star';
    if(winning('star')){finish('star');return}if(board.every(Boolean)){finish('draw');return}
    status.textContent='Sizning yurishingiz';draw();
  },350);
 });
 reset();
 return {dispose(){disposed=true;clearTimeout(aiTimeout)}};
}
function secretCode(root){
 let code=[],picked=[],attempts=0,finished=false;
 root.innerHTML='<div class="arena-code-top"><div class="arcade-quiz-number">SIRLI KOD · 3 BELGI</div>'+
 '<p>6 belgidan 3 tasi yashirilgan. To‘g‘ri ketma-ketlikni <b>7 urinishda</b> toping.</p></div>'+
 '<div class="arena-code-picks" id="codePicks"></div><div class="arena-code-symbols" id="codeSymbols"></div>'+
 '<div class="arena-code-actions"><button type="button" class="btn" id="codeCheck">Tekshirish '+I('check',17)+'</button>'+
 '<button type="button" class="btn alt" id="codeClear">'+I('refresh',16)+' Tozalash</button></div>'+
 '<div class="arcade-game-message" id="codeHint">Hozircha uchta belgini tanlang.</div>'+
 '<div class="arena-code-history" id="codeHistory"></div><button class="btn" id="codeRestart" hidden>Yangi kod '+I('refresh',17)+'</button>';
 function picks(){root.querySelector('#codePicks').innerHTML=Array.from({length:3},(_,i)=>'<span class="arena-code-slot '+(picked[i]?'filled':'')+'">'+(picked[i]?I(picked[i],29):I('lock',20))+'</span>').join('')}
 function render(){root.querySelector('#codeSymbols').innerHTML=SYMBOLS.map(s=>'<button type="button" data-code-pick="'+s+'" aria-label="'+s+' belgisini tanlash" '+(finished||picked.includes(s)||picked.length===3?'disabled':'')+'>'+I(s,27)+'</button>').join('');picks()}
 function reset(){code=[...SYMBOLS].sort(()=>Math.random()-.5).slice(0,3);picked=[];attempts=0;finished=false;
   root.querySelector('#codeHistory').innerHTML='';root.querySelector('#codeHint').textContent='Uchta belgini tanlang.';
   root.querySelector('#codeRestart').hidden=true;render()}
 root.addEventListener('click',e=>{
  if(e.target.closest('#codeRestart')){reset();return}
  if(e.target.closest('#codeClear')){picked=[];render();return}
  const pick=e.target.closest('[data-code-pick]');
  if(pick&&!finished&&picked.length<3&&!picked.includes(pick.dataset.codePick)){picked.push(pick.dataset.codePick);render();return}
  if(e.target.closest('#codeCheck')&&!finished){
   if(picked.length!==3){root.querySelector('#codeHint').textContent='Avval 3 ta belgi tanlang.';return}
   attempts++;
   const exact=picked.filter((s,i)=>s===code[i]).length;
   const other=picked.filter((s,i)=>s!==code[i]&&code.includes(s)).length;
   const row=document.createElement('div');row.className='arena-code-attempt';
   row.innerHTML='<span>'+String(attempts).padStart(2,'0')+'</span>'+
     picked.map(s=>I(s,22)).join('')+'<strong>'+exact+' joyida · '+other+' boshqa joyda</strong>';
   root.querySelector('#codeHistory').prepend(row);
   if(exact===3||attempts>=7){
    finished=true;
    root.querySelector('#codeHint').textContent=exact===3?'To‘g‘ri kodni topdingiz!':'Urinishlar tugadi. Kod: '+code.map(s=>({heart:'Yurak',star:'Yulduz',moon:'Oy',flower:'Gul',gem:'Olmos',gift:'Sovg‘a'}[s])).join(' · ');
    root.querySelector('#codeRestart').hidden=false;
   }else root.querySelector('#codeHint').textContent='Yana '+(7-attempts)+' ta urinish qoldi.';
   picked=[];render();
  }
 });
 reset();return {dispose(){}};
}
async function refreshLobby(){
 const host=document.getElementById('arenaLobby');if(!host||!host.closest('.arcade-shell'))return;
 if(document.getElementById('arcadePlayArea')?.hidden===false)return;
 const user=read();
 if(!user){host.hidden=false;host.innerHTML='<div class="arena-lobby-content">'+I('users',24)+
 '<div><strong>Juftingiz bilan masofadan o‘ynang</strong><p>1v1 uchun akkauntga kirish va juftlikni bog‘lash kerak.</p></div><a class="btn sm" href="/">Kirish</a></div>';return}
 if(lobbyPending)return;
 lobbyPending=true;
 try{
  const data=await ctx.api('/api/games/rooms');
  if(!host.isConnected)return;
  const list=data.rooms||[];
  host.hidden=false;
  host.innerHTML='<div class="arena-lobby-content">'+I('users',24)+
   '<div><strong>'+(data.partnerConnected?'Juftingiz bilan 1v1 o‘ynash':'Ikki kishilik o‘yinlar')+'</strong>'+
   '<p>'+(data.partnerConnected?'Ulangan juftingiz: '+E(data.partnerName||'Sevgilim')+
      ' · O‘yin ochuvchida Pro faol bo‘lishi kerak.':'Buning uchun oldin juftlikka bog‘laning.')+'</p></div>'+
   (!data.partnerConnected?'<button class="btn sm" data-a="pair">Bog‘lash</button>':!data.isPro?'<button class="btn sm alt" data-a="pro">Pro tariflari</button>':'')+'</div>'+
   (list.length?'<div class="arena-active-list">'+list.map(room=>{
    const title=room.type==='xo'?'Yurak XO':room.type==='memory'?'Memory Duel':'Moslik dueli';
    const own=room.createdBy===user.id;
    const status=room.status==='waiting'?(own?'Juftingiz taklifni qabul qilishi kutilmoqda':'Sizga o‘yin taklifi bor'):'Davom etmoqda';
    return '<button type="button" class="arena-active-room" data-arena-room="'+E(room.id)+'" data-arena-type="'+room.type+'">'+
     I(room.type==='memory'?'gem':room.type==='match'?'heart':'star',21)+
     '<span><strong>'+title+'</strong><small>'+status+'</small></span>'+
     (room.status==='waiting'&&!own?'<b class="arena-accept">Qabul qilish</b>':I('arrow',18))+'</button>';
   }).join('')+'</div>':'');
 }catch(e){if(host.isConnected){host.hidden=false;host.innerHTML='<div class="arena-lobby-content">'+I('shield',20)+' '+E(e.message)+'</div>'}}
 finally{lobbyPending=false}
}
function activateHub(){
 clearInterval(hubTimer);refreshLobby();
 hubTimer=setInterval(()=>{if(document.visibilityState==='visible')refreshLobby()},5500);
 const id=new URLSearchParams(location.search).get('room');
 if(id&&/^[0-9a-f]{24}$/i.test(id)&&alreadyAutoRoom!==id&&read()){
  alreadyAutoRoom=id;
  ctx.api('/api/games/rooms/'+id).then(data=>{
    if(!document.getElementById('arenaLobby'))return;
    window.QalbimGames.openGame(data.room.type,{roomId:id});
  }).catch(e=>message(e.message));
 }else if(id&&!read()){
  try{sessionStorage.setItem('qalbim_pending_room',id)}catch(e){}
 }
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-arena-room]');
 if(b)window.QalbimGames.openGame(b.dataset.arenaType,{roomId:b.dataset.arenaRoom});
});
window.addEventListener('pagehide',()=>clearInterval(hubTimer));
function launchPro(type,root,opts={}){
 let destroyed=false,poll=null,requestBusy=false,room=null;
 const playing=['xo','memory','match'];
 if(!playing.includes(type)){errorUI(root,'O‘yin topilmadi');return {dispose(){}}}
 function render(){
  if(destroyed||!root.isConnected||!room)return;
  const user=read(),myId=user?.id||'',myIndex=room.myIndex;
  const iCreated=room.createdBy===myId;
  const myTurn=room.turn===myId;
  const win=room.winner==='draw'?'Durang':room.type==='match'?room.winner:room.winner===myId?'Siz yutdingiz!':'Juftingiz yutdi';
  const status=room.status==='waiting'?(iCreated?'Juftingiz taklifni qabul qilishini kuting':'Juftingiz o‘ynashga taklif qildi'):
    room.status==='playing'?(myTurn?'Sizning navbatingiz':'Juftingiz navbati'):room.status==='finished'?(win||'O‘yin yakunlandi'):'O‘yin yopilgan';
  let html='<div class="arena-room-info"><div><span class="arcade-card-category">PRO · IKKI TELEFON</span><h3>'+E(status)+'</h3>'+
   '<p>'+(room.status==='waiting'?(iCreated?'Taklif juftingizning chatiga yuborildi. O‘yin 24 soatgacha faol.':'Chatdagi taklifni qabul qilib darhol o‘ynashingiz mumkin.'):'O‘yin holati taxminan har 2,5 soniyada yangilanadi.')+'</p></div>'+
   (room.status==='waiting'&&iCreated?'<div class="arena-invite-sent">'+I('check-circle',18)+' Chatga yuborildi'+
     '<button class="btn alt sm" data-room-share>'+I('link',16)+' Havola (ixtiyoriy)</button></div>':'')+
   (room.status==='waiting'&&!iCreated?'<button class="btn" data-room-accept>'+I('check',17)+' Taklifni qabul qilish</button>':'')+'</div>';
  if(room.status==='playing'||room.status==='finished'){
   if(type==='xo'){
    html+='<div class="arena-solo-stats"><span>'+I('heart',17)+' 1-o‘yinchi</span><span>'+I('star',17)+' 2-o‘yinchi</span><b>'+E(status)+'</b></div>'+
    '<div class="arena-xo-board">'+room.board.map((v,i)=>
     '<button type="button" class="arena-xo-cell '+(v?'occupied':'')+'" data-room-cell="'+i+'" '+(v||room.status!=='playing'||!myTurn?'disabled':'')+' aria-label="'+(i+1)+'-katak">'+
     (v?I(v,43):'')+'</button>').join('')+'</div>';
   }else if(type==='memory'){
    html+='<div class="arena-solo-stats"><span>Siz <b>'+room.scores[myIndex]+' juftlik</b></span><span>Juftingiz <b>'+room.scores[1-myIndex]+' juftlik</b></span><span>'+room.moves+' yurish</span></div>'+
     '<div class="arcade-memory-board arena-online-memory">'+room.cards.map((v,i)=>{
       const open=!!v,matched=room.matched.includes(i);
       return '<button type="button" class="memory-tile '+(open?'flipped':'')+' '+(matched?'matched':'')+
        '" data-room-cell="'+i+'" '+(matched||room.status!=='playing'||!myTurn||open?'disabled':'')+
        ' aria-label="'+(i+1)+'-karta"><span class="memory-tile-back">'+I('heart',25)+'</span>'+
        '<span class="memory-tile-front">'+(v?I(v,32):'')+'</span></button>';
     }).join('')+'</div><p class="arena-rule">Har navbatda 2 karta oching. Mos kelgan juftlik uchun 1 ball beriladi.</p>';
   }else if(type==='match'){
    html+='<div class="arena-quiz-score"><span>Raund: <strong>'+Math.min(room.round+1,room.total)+' / '+room.total+'</strong></span>'+
    '<span>Mos javoblar: <strong>'+room.matches+'</strong></span></div>';
    if(room.status==='playing'){
     html+='<div class="arena-match-question"><h3>'+E(room.question.q)+'</h3>'+
       (room.myAnswered?'<p>'+I('check',17)+' Javobingiz saqlandi. Juftingizni kuting...</p>':
       '<div class="arcade-quiz-options">'+room.question.opts.map((option,i)=>
         '<button class="arcade-quiz-option" data-room-answer="'+i+'"><span class="quiz-letter">'+String.fromCharCode(65+i)+'</span>'+
           '<span>'+E(option)+'</span>'+I('arrow',17)+'</button>').join('')+'</div>')+'</div>';
    }
    if(room.lastResult)html+='<div class="arena-last-result">'+I(room.lastResult.match?'heart':'gem',18)+
      ' Oxirgi raund: '+(room.lastResult.match?'javoblar mos keldi':'javoblar turlicha')+'</div>';
   }
  }
  html+='<div class="arena-room-footer"><button type="button" class="btn alt sm" data-room-reload>'+I('refresh',17)+' Yangilash</button>'+
   (room.status==='playing'||room.status==='waiting'?'<button type="button" class="btn alt sm" data-room-close>Xonani yopish</button>':'')+
   '<span class="arcade-best">Natijalar 24 soatgacha saqlanadi</span></div>';
  root.innerHTML=html;
 }
 async function getRoom(){
  if(destroyed||requestBusy||!room)return;
  requestBusy=true;
  try{const result=await ctx.api('/api/games/rooms/'+room.id);
    if(destroyed)return;
    if(result.room.revision!==room.revision||result.room.status!==room.status){room=result.room;render()}
  }catch(e){if(!destroyed)message(e.message)}
  finally{requestBusy=false}
 }
 function watch(){
  clearInterval(poll);
  poll=setInterval(()=>{if(!document.hidden)getRoom()},2500);
 }
 async function createOrJoin(){
  if(!ctx){errorUI(root,'O‘yinlar ma’lumoti ulanmagan');return}
  const me=read();
  if(!me){errorUI(root,'Sevgan insoningiz bilan o‘ynash uchun hisobga kiring','<a class="btn" href="/">Kirish</a>');return}
  if(!ctx.getPartner?.()){errorUI(root,'Avval juftlik havolasini sevgan insoningizga yuboring',
    '<button type="button" class="btn" data-a="pair">Juftlikni bog‘lash</button>');return}
  if(!opts.roomId&&!me.isPro){errorUI(root,'Bu o‘yinni ochish uchun Pro obuna kerak',
    '<button type="button" class="btn" data-a="pro">'+I('crown',17)+' Pro tariflari</button>');return}
  errorUI(root,'O‘yin xonasi yuklanmoqda…');
  try{const data=await ctx.api(opts.roomId?'/api/games/rooms/'+opts.roomId:'/api/games/rooms',
     opts.roomId?{}:{method:'POST',body:{type}});
    if(destroyed)return;
    room=data.room;render();watch();
  }catch(e){if(!destroyed)errorUI(root,e.message,'<button class="btn alt" data-a="pro">Pro haqida</button>')}
 }
 async function update(path,body){
  if(!room||requestBusy)return;
  requestBusy=true;
  try{const data=await ctx.api('/api/games/rooms/'+room.id+path,{method:'POST',body});
    if(!destroyed){room=data.room||room;render()}
  }catch(e){message(e.message)}
  finally{requestBusy=false;if(!destroyed)getRoom()}
 }
 root.addEventListener('click',async e=>{
  if(destroyed||!room)return;
  if(e.target.closest('[data-room-share]')){
    const url=location.origin+'/?view=games&room='+encodeURIComponent(room.id);
    if(navigator.share){try{await navigator.share({title:'Qalbim’da men bilan o‘yna!',url});return}catch(ex){if(ex.name==='AbortError')return}}
    try{await navigator.clipboard.writeText(url);message('Taklif havolasi nusxalandi')}catch(ex){prompt('O‘yin havolasi',url)}
    return;
  }
  if(e.target.closest('[data-room-accept]'))return update('/accept',{});
  if(e.target.closest('[data-room-reload]'))return getRoom();
  if(e.target.closest('[data-room-close]')){if(!confirm('O‘yin xonasi yopilsinmi?'))return;
    try{await ctx.api('/api/games/rooms/'+room.id+'/close',{method:'POST',body:{}});room.status='closed';render()}catch(err){message(err.message)}return}
  const c=e.target.closest('[data-room-cell]');
  if(c){const index=Number(c.dataset.roomCell);if(!Number.isInteger(index))return;return update('/move',{index})}
  const a=e.target.closest('[data-room-answer]');
  if(a){const answer=Number(a.dataset.roomAnswer);if(!Number.isInteger(answer))return;return update('/move',{answer})}
 });
 createOrJoin();
 return {dispose(){destroyed=true;clearInterval(poll)}};
}
window.QalbimArena={setup,refreshLobby,activateHub,launchFree,launchPro};
})();
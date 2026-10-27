/* Qalbim ChatPlay — game challenges are first-class private chat objects.
   Couples launch and accept multiplayer matches without leaving their conversation. */
(function(){
'use strict';
const I=(name,size=19)=>window.QalbimIcons.svg(name,size);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TYPES={
 xo:{name:'Yurak XO',icon:'heart',label:'Navbat bilan XO o‘ynang',tag:'STRATEGIYA'},
 memory:{name:'Memory Duel',icon:'gem',label:'Kartalarning juftini toping',tag:'XOTIRA'},
 match:{name:'Moslik dueli',icon:'heart-handshake',label:'Ikkalangiz javob bering',tag:'JUFTLIK'}
};
let deps=null,controller=null,pending=false;
function setup(data){deps=data}
function makeSheet(){
 let target=document.getElementById('chatGameSheet');
 if(target)return target;
 target=document.createElement('div');
 target.id='chatGameSheet';
 target.className='chatplay-sheet';
 target.setAttribute('role','dialog');
 target.setAttribute('aria-modal','true');
 target.setAttribute('aria-label','Juftlik mini-o‘yinlari');
 target.hidden=true;
 document.body.appendChild(target);
 return target;
}
function close(){
 if(controller){controller.dispose?.();controller=null}
 const node=document.getElementById('chatGameSheet');if(node){node.hidden=true;node.replaceChildren()}
 document.body.classList.remove('chatplay-lock');
 pending=false;
}
function openPicker(){
 if(!deps?.getPartner?.()){deps?.notify?.('Avval juftingiz bilan bog‘laning');return}
 close();
 const me=deps.getMe(),target=makeSheet();
 const locked=!me?.isPro;
 target.innerHTML='<div class="chatplay-panel chatplay-picker"><div class="chatplay-header">'+
 '<div class="chatplay-small">QALBIM · COUPLE PLAY</div>'+
 '<button type="button" class="chatplay-close" data-chatgame-close aria-label="Yopish">'+I('x',20)+'</button></div>'+
 '<div class="chatplay-heading"><div class="chatplay-mark">'+I('gamepad',29)+'</div>'+
 '<h2>Birga o‘ynaymizmi?</h2><p>Sevgan insoningizga o‘yin yuboring. Taklif shu suhbatda paydo bo‘ladi — havola shart emas.</p></div>'+
 (locked?'<div class="chatplay-pro-hint">'+I('crown',21)+' <span>O‘yin ochish uchun Pro kerak. Juftingiz qo‘shimcha obunasiz qo‘shiladi.</span></div>':'')+
 '<div class="chatplay-options">'+Object.entries(TYPES).map(([id,t])=>
 '<button class="chatplay-option" data-chatgame-create="'+id+'" '+(locked?'disabled':'')+'>'+
 '<span class="chatplay-option-icon">'+I(t.icon,25)+'</span>'+
 '<span><small>'+t.tag+' · PRO 1v1</small><strong>'+t.name+'</strong><em>'+t.label+'</em></span>'+I('arrowup',19)+'</button>').join('')+'</div>'+
 '<div class="chatplay-footer">'+
 (locked?'<button class="btn" data-chatgame-pro>'+I('crown',17)+' Pro tariflari</button>':'<span class="chatplay-note">'+I('check',17)+' O‘yin taklifi avtomatik chatga yuboriladi</span>')+
 '<button type="button" class="btn alt" data-chatgame-more>'+I('gamepad',17)+' Barcha o‘yinlar</button></div></div>';
 target.hidden=false;document.body.classList.add('chatplay-lock');
 target.querySelector('[data-chatgame-close]')?.focus();
}
async function create(type,button){
 if(pending||!TYPES[type]||!deps)return;
 pending=true;if(button)button.disabled=true;
 try{
  const data=await deps.api('/api/games/rooms',{method:'POST',body:{type}});
  close();
  await deps.reloadMessages?.();
  openRoom(type,data.room.id);
  deps.notify('O‘yin taklifi suhbatga yuborildi');
 }catch(error){deps.notify(error.message||'O‘yin yaratilmadi')}
 finally{pending=false;if(button?.isConnected)button.disabled=false}
}
function openRoom(type,id){
 if(!TYPES[type]||!/^[0-9a-f]{24}$/i.test(id)||!deps)return;
 close();
 const target=makeSheet();
 target.innerHTML='<div class="chatplay-panel chatplay-room">'+
 '<div class="chatplay-header"><div class="chatplay-small">'+I('gamepad',17)+' CHAT ICHIDAGI O‘YIN</div>'+
 '<button type="button" class="chatplay-close" data-chatgame-close aria-label="Suhbatga qaytish">'+I('x',19)+'</button></div>'+
 '<div class="chatplay-room-top"><div><h2>'+esc(TYPES[type].name)+'</h2><p>Juftingiz bilan bir vaqtda, shu chatdan chiqmasdan o‘ynang.</p></div>'+
 '<button type="button" class="btn alt sm" data-chatgame-back>'+I('message-square',16)+' Chatga qaytish</button></div>'+
 '<div class="chatplay-room-body" id="chatplayGameBody"></div></div>';
 target.hidden=false;document.body.classList.add('chatplay-lock');
 window.QalbimArena.setup({api:deps.api,notify:deps.notify,go:deps.go,getMe:deps.getMe,getPartner:deps.getPartner});
 controller=window.QalbimArena.launchPro(type,target.querySelector('#chatplayGameBody'),{roomId:id});
 target.querySelector('[data-chatgame-close]')?.focus();
}
function renderCard(message,myId){
 const type=TYPES[message.gameType]||{name:'Juftlik o‘yini',icon:'gamepad',tag:'O‘YIN'};
 const own=message.from===myId,open=!!message.gameId;
 const status=message.gameStatus||'waiting';
 const labels={
  waiting:own?'Juftingiz taklifni qabul qilishi kutilmoqda':'Sizga o‘yin taklifi bor',
  playing:'O‘yin davom etmoqda',
  finished:'O‘yin yakunlandi',
  closed:'O‘yin xonasi yopilgan',
  expired:'Taklif muddati tugagan'
 };
 const statusIcon=status==='finished'?'check':status==='waiting'?'clock':status==='playing'?'zap':'lock';
 const button= status==='waiting'&&!own?'Qabul qilish va o‘ynash':
               status==='waiting'?'Xonaga kirish':
               status==='playing'?'O‘yinni davom ettirish':
               status==='finished'?'Natijani ko‘rish':'';
 const time=message.createdAt?new Date(message.createdAt).toLocaleTimeString('uz-UZ',{hour:'2-digit',minute:'2-digit'}):'';
 return '<div class="chatplay-message '+(own?'mine':'')+'"><div class="chatplay-card">'+
  '<div class="chatplay-card-top"><span>'+I('gamepad',15)+' QALBIM PLAY</span>'+
  '<span class="chatplay-card-badge">'+I('crown',13)+' PRO</span></div>'+
  '<div class="chatplay-card-main"><div class="chatplay-card-icon">'+I(type.icon,29)+'</div><div>'+
  '<h3>'+esc(type.name)+'</h3><div class="chatplay-card-detail">'+I(statusIcon,14)+' '+esc(labels[status]||'O‘yin')+'</div></div></div>'+
  (status==='finished'&&message.gameWinner?'<p class="chatplay-card-result">'+I('star',15)+' '+
   (message.gameType==='match'?esc(message.gameWinner)+' ta mos javob':
    message.gameWinner==='draw'?'Durang':
    message.gameWinner===myId?'Siz yutdingiz':'Juftingiz yutdi')+'</p>':'')+
  (open&&button?'<button type="button" class="chatplay-card-button" data-chatgame-room="'+esc(message.gameId)+'" data-chatgame-type="'+esc(message.gameType)+'">'+
   I(status==='waiting'?'arrow':'gamepad',17)+' '+esc(button)+'</button>':'')+
  (status==='finished'&&deps?.getMe?.()?.isPro?'<button type="button" class="chatplay-rematch" data-chatgame-rematch="'+esc(message.gameType)+'">'+I('refresh',16)+' Qayta duelga chorlash</button>':'')+
  '<div class="chatplay-card-foot"><span>'+time+'</span><span>24 soatgacha amal qiladi</span></div>'+
  '</div></div>';
}
document.addEventListener('click',e=>{
 const closeBtn=e.target.closest('[data-chatgame-close],[data-chatgame-back]');
 if(closeBtn){close();return}
 const more=e.target.closest('[data-chatgame-more]');if(more){close();deps?.go('games');return}
 const pro=e.target.closest('[data-chatgame-pro]');if(pro){close();deps?.go('pro');return}
 const invite=e.target.closest('[data-chatgame-create]');if(invite){create(invite.dataset.chatgameCreate,invite);return}
 const rematch=e.target.closest('[data-chatgame-rematch]');if(rematch){create(rematch.dataset.chatgameRematch,rematch);return}
 const open=e.target.closest('[data-chatgame-room]');
 if(open){openRoom(open.dataset.chatgameType,open.dataset.chatgameRoom);return}
 if(e.target.id==='chatGameSheet'){close()}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('chatGameSheet')?.hidden)close()});
window.addEventListener('pagehide',close);
window.QalbimChatGames={setup,close,openPicker,openRoom,renderCard};
})();
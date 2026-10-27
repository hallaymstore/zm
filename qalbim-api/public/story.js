/* Qalbim Moments — 3-step interactive mobile-first letter story.
 * No accounts or external media required to open a public letter. */
(function(){
'use strict';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(name,size=19)=>window.QalbimIcons.svg(name,size);
let current=null;
const photoIds=d=>{
 const item=d.letter||d;return Array.isArray(item.photoIds)?item.photoIds.filter(id=>typeof id==='string'&&/^[a-f0-9]{24}$/i.test(id)).slice(0,4):[];
};
const steps=d=>photoIds(d).length?4:3;
const progressHtml=(len)=>Array.from({length:len},(_,n)=>
 '<button type="button" class="moment-progress-seg'+(n===0?' active':'')+'" data-moment-jump="'+n+
 '" aria-label="'+(n+1)+'-sahifaga o‘tish" aria-current="'+(n===0?'step':'false')+'"><span></span></button>').join('');
function renderSlide(data,n,preview){
 const l=data.letter||data;
 if(n===0){
   return '<div class="moment-content moment-cover"><div class="moment-art"><div class="moment-art-ring"></div><div class="moment-art-core">'+icon('heart',51)+'</div></div>'+
    '<div class="moment-label">QALBIM MOMENTS / 01</div>'+
    '<h2>'+esc(l.coverLine||'Bu hikoya faqat sen uchun')+'</h2>'+
    '<p>Sevgi ba’zan bir nechta so‘zdan boshlanadi.</p>'+
    '<span class="moment-person">Kimga: <strong>'+esc(l.to||'Azizim')+'</strong></span></div>';
 }
 if(n===1){
   return '<div class="moment-content moment-text"><div class="moment-smallmark">'+icon('mail',24)+'</div>'+
    '<div class="moment-label">YURAKDAN YOZILGAN</div>'+
    '<h2>'+esc(l.title||'Senga yozilgan maktub')+'</h2>'+
    '<div class="moment-message" tabindex="0">'+esc(l.message||'Senga aytadigan gapim bor...')+'</div>'+
    '<div class="moment-sign">Mehr bilan, <strong>'+esc(l.from||'Men')+'</strong></div></div>';
 }
 if(photoIds(data).length&&n===2){
  const ids=photoIds(data);
  return '<div class="moment-content moment-memory"><div class="moment-label">BIZNING XOTIRALARIMIZ</div>'+
   '<h2>Esda qolgan lahzalar</h2><p>Bir suratda bir olam hislar bor.</p>'+
   '<div class="moment-photo-grid count-'+ids.length+'">'+ids.map((id,i)=>
     '<button type="button" class="moment-photo" data-moment-photo="'+esc(id)+'" aria-label="'+(i+1)+'-suratni kattalashtirish">'+
     '<span class="moment-photo-lock">'+icon('lock',24)+'<small>Maxfiy surat · Pro</small></span>'+
     '<img class="moment-photo-image" src="/api/photos/'+esc(id)+'" alt="Birgalikdagi xotira '+(i+1)+'" loading="lazy"></button>').join('')+'</div>'+
   '<span class="moment-photo-tip">Maxfiy suratlar faqat egasi yoki Pro foydalanuvchiga ko‘rinadi.</span></div>';
 }
 const hasGift=!!String(l.secretNote||'').trim();
 const counts=data.reactions||{};
 const reactionKeys=[['❤️','heart'],['🥹','smile'],['😍','heart'],['💌','mail'],['🌹','flower'],['😘','smile']];
 return '<div class="moment-content moment-finale"><div class="moment-finale-art"><div class="moment-orbit orbit-one"></div>'+
   '<div class="moment-orbit orbit-two"></div>'+icon('gift',59)+'</div>'+
   '<div class="moment-label">OXIRGI SAHIFA</div><h2>'+(hasGift?'Senga yana bir syurprizim bor':'Eng yaxshi hikoyalar davom etadi')+'</h2>'+
   '<p>'+(hasGift?'Yana bir kichik xabarni ochish uchun tugmani bosing.':'Yuragingizga yetib borgan so‘zlarni bir belgi bilan eslab qoling.')+'</p>'+
   (hasGift?'<button type="button" class="moment-gift-button" data-moment-gift aria-expanded="false">'+icon('gift',19)+' Syurprizni ochish</button>'+
   '<div class="moment-hidden-note" hidden><span class="moment-label">YASHIRIN XABAR</span><p>'+esc(l.secretNote)+'</p></div>':'')+
   (preview?'<div class="moment-preview-notice">Sinov ko‘rinishi · reaksiya yuborilmaydi</div>':
   '<div class="moment-reaction-prompt">Reaksiyangizni tanlang</div>'+
   '<div class="moment-reactions">'+reactionKeys.map(([key,glyph])=>
    '<button type="button" data-moment-react="'+key+'" class="moment-reaction" aria-label="'+key+' reaksiyasi">'+icon(glyph,21)+
    (counts[key]?'<span>'+counts[key]+'</span>':'')+'</button>').join('')+'</div>'+
   '<button type="button" class="moment-full-letter" data-moment-full>'+icon('book',17)+' Barcha xotiralarni ko‘rish</button>')+
   '</div>';
}
function markup(data,preview=false){
 const l=data.letter||data;const total=steps(data);
 return '<div class="moment-player" data-theme="'+(Number(l.theme)||1)+'" aria-label="Uch bosqichli sevgi hikoyasi" tabindex="0">'+
   '<div class="moment-topbar"><div class="moment-progress" aria-label="Hikoya bosqichlari">'+progressHtml(total)+'</div>'+
   '<div class="moment-identity">'+icon('heart',16)+' QALBIM <span>MOMENTS</span></div></div>'+
   '<div class="moment-slide" data-step="0">'+renderSlide(data,0,preview)+'</div>'+
   '<div class="moment-controls"><button type="button" data-moment-nav="-1" aria-label="Oldingi sahifa" disabled>'+icon('arrow',21)+'</button>'+
   '<span class="moment-counter" aria-live="polite">01 / 0'+total+'</span>'+
   '<button type="button" data-moment-nav="1" aria-label="Keyingi sahifa">'+icon('arrow',21)+'</button></div>'+
   '<span class="moment-tip">'+(preview?'To‘liq ekran demo':'Chapga suring yoki tugmalar orqali davom eting')+'</span></div>';
}
function mount(host,data,options={}){
 if(!host)return;
 host.innerHTML=markup(data,!!options.preview);
 const root=host.querySelector('.moment-player');
 if(!root)return;
 const session={host,root,data,options,index:0,done:false};
 current=session;
 const move=n=>{
   if(!root.isConnected)return;
   session.index=Math.max(0,Math.min(steps(session.data)-1,n));
   const index=session.index;
   root.querySelectorAll('.moment-progress-seg').forEach((b,i)=>{
     b.classList.toggle('active',i===index);
     b.classList.toggle('passed',i<index);
     b.setAttribute('aria-current',i===index?'step':'false');
   });
   root.querySelector('.moment-slide').innerHTML=renderSlide(session.data,index,!!options.preview);
   root.querySelector('.moment-slide').dataset.step=String(index);
   const prev=root.querySelector('[data-moment-nav="-1"]');
   const next=root.querySelector('[data-moment-nav="1"]');
   prev.disabled=index===0;next.disabled=index===steps(session.data)-1;
   root.querySelector('.moment-counter').textContent='0'+(index+1)+' / 0'+steps(session.data);
   root.classList.remove('moment-changing');void root.offsetWidth;root.classList.add('moment-changing');
 };
 session.move=move;
 session.update=next=>{session.data={...next};root.dataset.theme=String(Number((next.letter||next).theme)||1);root.querySelector('.moment-progress').innerHTML=progressHtml(steps(next));move(session.index)};
 root.addEventListener('click',async e=>{
   const nav=e.target.closest('[data-moment-nav]');
   if(nav){move(session.index+Number(nav.dataset.momentNav));return}
   const jump=e.target.closest('[data-moment-jump]');
   if(jump){move(Number(jump.dataset.momentJump));return}
   const gift=e.target.closest('[data-moment-gift]');
   if(gift){
     const panel=root.querySelector('.moment-hidden-note');if(!panel)return;
     const showing=panel.hidden;panel.hidden=!showing;gift.setAttribute('aria-expanded',String(showing));
     gift.innerHTML=icon(showing?'check':'gift',18)+(showing?' Syurpriz ochildi':' Syurprizni ochish');
     return;
   }
   const image=e.target.closest('[data-moment-photo]');
   if(image&&image.querySelector('img')&&!image.querySelector('img').hidden){
      const overlay=document.createElement('div');overlay.className='moment-photo-overlay';
      const src=image.querySelector('img').getAttribute('src');
      overlay.innerHTML='<button type="button" class="moment-photo-close" data-moment-photo-close aria-label="Suratni yopish">'+icon('x',19)+'</button>'+
        '<img alt="Kattalashtirilgan xotira" src="'+src+'">';
      root.appendChild(overlay);
      const close=overlay.querySelector('[data-moment-photo-close]');if(close)close.focus();
      return;
   }
   if(e.target.closest('[data-moment-photo-close]')){root.querySelector('.moment-photo-overlay')?.remove();return}
   const reaction=e.target.closest('[data-moment-react]');
   if(reaction&&!options.preview&&typeof options.onReact==='function'){
     reaction.disabled=true;
     try{
       await options.onReact(reaction.dataset.momentReact);
       const counter=reaction.querySelector('span');
       if(counter)counter.textContent=String((Number(counter.textContent)||0)+1);
       else{const count=document.createElement('span');count.textContent='1';reaction.appendChild(count)}
       reaction.classList.add('sent');
     }catch(err){if(typeof options.onError==='function')options.onError(err)}
     finally{reaction.disabled=false}
     return;
   }
   if(e.target.closest('[data-moment-full]')&&typeof options.onReadFull==='function')options.onReadFull();
 });
 root.addEventListener('error',event=>{
   if(!event.target.matches?.('.moment-photo-image'))return;
   event.target.hidden=true;
   event.target.closest('.moment-photo')?.setAttribute('aria-label','Maxfiy surat: Pro kerak');
 },true);
 let sx=0,sy=0;
 root.addEventListener('touchstart',e=>{if(e.touches.length===1){sx=e.touches[0].clientX;sy=e.touches[0].clientY}},{passive:true});
 root.addEventListener('touchend',e=>{
   if(!e.changedTouches.length||e.target.closest('button,.moment-message,.moment-hidden-note,.moment-photo-overlay'))return;
   const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
   if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)move(session.index+(dx<0?1:-1));
 },{passive:true});
 return session;
}
document.addEventListener('keydown',e=>{
 if(!current||!current.root.isConnected)return;
 if(!current.root.contains(document.activeElement)&&!current.root.matches(':focus'))return;
 if(e.target.closest('input,textarea,select'))return;
 if(e.key==='ArrowRight'){current.move(current.index+1);e.preventDefault()}
 if(e.key==='ArrowLeft'){current.move(current.index-1);e.preventDefault()}
});
window.QalbimStory={mount,markup};
})();
'use strict';
(function(){
const $=id=>document.getElementById(id), view=$('view'), host=$('modalHost'), nav=$('nav');
let me=null,partner=null,config={telegram:'',dbReady:false},draftPhotos=[],theme=1,chatTimer=null,chatVisit='',chatPartner='',authMode='login',letterData=null;
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const media=id=>'/api/photos/'+encodeURIComponent(id);
const moneyDate=d=>d?new Date(d).toLocaleString('uz-UZ',{day:'2-digit',month:'2-digit',year:'numeric'}):'';
const isPro=()=>!!(me&&me.isPro);
const copy=async s=>{try{await navigator.clipboard.writeText(s);notify('Havola nusxalandi ♡')}catch(e){prompt('Havolani nusxalang',s)}};
const notify=s=>{let el=$('toastHost');el.innerHTML='<div class="toast">'+esc(s)+'</div>';setTimeout(()=>el.innerHTML='',3200)};
const err=e=>{notify(e.message||String(e))};
const btn=(action,label,kind='alt')=>'<button class="btn '+kind+' sm" data-a="'+esc(action)+'">'+label+'</button>';
const section=html=>{view.innerHTML=html;nav.hidden=!me;$('profileButton').hidden=!me;$('proBadge').hidden=!isPro();markNav()};
async function api(url,options={}){
 const opt={credentials:'same-origin',...options};
 if(opt.body&&!(opt.body instanceof FormData)&&typeof opt.body==='object'){opt.body=JSON.stringify(opt.body);opt.headers={'Content-Type':'application/json',...(opt.headers||{})}}
 let r=await fetch(url,opt);let data=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(data.error||'Server javob bermadi ('+r.status+')');return data;
}
function modal(html){host.hidden=false;host.innerHTML='<div class="modal" role="dialog" aria-modal="true"><div class="row between"><strong style="font:600 23px Playfair Display,serif">Qalbim ♡</strong>'+btn('closeModal','✕')+'</div>'+html+'</div>'}
function closeModal(){host.hidden=true;host.innerHTML=''}
function markNav(){document.querySelectorAll('[data-a]').forEach(n=>{if(!n.classList.contains('navitem'))return;let page=location.pathname,tab=new URLSearchParams(location.search).get('view'),x=n.dataset.a;n.classList.toggle('active',(x==='chats'&&page.includes('chat'))||(x==='letters'&&tab==='letters')||(x==='pro'&&tab==='pro')||(x==='profile'&&page.includes('profile'))||(x==='home'&&page==='/'&&!tab))})}
async function refresh(){try{const v=await api('/api/me');me=v.user;partner=v.partner}catch(e){me=null;partner=null}}
function page(){let p=location.pathname,tab=new URLSearchParams(location.search).get('view');if(p.startsWith('/l/'))return 'letter';if(p.startsWith('/invite/'))return 'invite';if(p.includes('admin'))return 'admin';if(p.includes('chats.html'))return 'chats';if(p.includes('chat.html'))return 'chat';if(p.startsWith('/u/'))return 'publicProfile';if(p.includes('profile'))return 'profile';return tab||'home'}
function go(where){let routes={home:'/',letters:'/?view=letters',create:'/?view=create',pro:'/?view=pro',chats:'/chats.html',chat:'/chat.html',profile:'/profile.html',admin:'/admin.html'};location.href=routes[where]||where}
function hero(txt,sub){return '<div class="hero"><div class="spark">💌</div><p class="eyebrow">Ikki qalb — bir hikoya</p><h1>'+txt+'</h1><p>'+sub+'</p></div>'}
function auth(){
 nav.hidden=true;$('profileButton').hidden=true;$('proBadge').hidden=true;
 let register=authMode==='register';
 section(hero('Senga bir maktubim bor','So‘zlarga sig‘magan tuyg‘ular uchun yaratilgan kichik, sehrli makon.')+
 '<div class="envelope"><div class="base"></div><div class="flap"></div><div class="fold"></div><div class="seal">♥</div></div>'+
 '<div class="card auth-card"><div class="tabs"><button class="tab '+(!register?'active':'')+'" data-a="loginMode">Kirish</button><button class="tab '+(register?'active':'')+'" data-a="registerMode">Ro‘yxatdan o‘tish</button></div>'+
 '<form data-form="'+(register?'register':'login')+'">'+(register?'<label class="field"><span>Ism va familiya</span><input class="input" name="name" autocomplete="name" placeholder="Masalan, Ali Valiyev" required minlength="3"></label>':'')+
 '<label class="field"><span>Telefon raqam</span><input class="input" name="phone" type="tel" autocomplete="tel" placeholder="+998 90 123 45 67" required></label>'+
 '<label class="field"><span>Parol</span><input class="input" name="password" type="password" autocomplete="'+(register?'new-password':'current-password')+'" minlength="8" placeholder="Kamida 8 ta belgi" required></label>'+
 (register?'<label class="checkline"><input type="checkbox" name="terms" required><span><a href="/terms.html" target="_blank">Foydalanish shartlari</a> bilan tanishdim va roziman.</span></label><label class="checkline"><input type="checkbox" name="privacy" required><span><a href="/privacy.html" target="_blank">Maxfiylik siyosati</a> bilan tanishdim va roziman.</span></label>':'')+
 '<button class="btn block" type="submit">'+(register?'Hisob yaratish ♡':'Kirish ♡')+'</button></form></div>'+
 (!config.dbReady?'<div class="notice">⚙️ Administrator hali MongoDB ulanishini sozlamagan. Ro‘yxatdan o‘tish vaqtincha yopiq; mavjud dizaynni ko‘rishingiz mumkin.</div>':'')+
 '<div class="center muted small">18+ · Ismingiz va raqamingiz begonalarga ko‘rsatilmaydi</div>');
}
function home(){
 section(hero('Sevgini boshqacha izhor eting','Samimiy maktublar, shaxsiy suhbat va faqat ikkitingizga atalgan lahzalar.')+
 '<div class="card"><div class="profile">'+avatar(me.avatarId,me.name)+'<div style="flex:1;min-width:0"><div class="small muted">Xush kelibsiz</div><strong>'+esc(me.name)+'</strong><div><span class="mini-tag">'+(isPro()?'✦ PRO foydalanuvchi':'♡ Oddiy hisob')+'</span></div></div>'+btn('profile','Profil')+'</div></div>'+
 '<div class="feature"><span class="emoji">💌</span><div style="flex:1"><strong>Sehrli maktub yarating</strong><small>6 xil dizayn, rasmlar va shaxsiy havola.</small></div>'+btn('create','Yaratish','')+'</div>'+
 '<div class="feature"><span class="emoji">💕</span><div style="flex:1"><strong>Juftingiz bilan bog‘laning</strong><small>Bir martalik taklif bilan ikki qalbni birlashtiring.</small></div>'+btn('pair','Ulash','')+'</div>'+
 '<div class="feature"><span class="emoji">💬</span><div style="flex:1"><strong>Sirli suhbat</strong><small>Ko‘rilgach yoki belgilangan muddatdan keyin o‘chadigan xabarlar.</small></div>'+btn('chats','Chat')+'</div>'+
 '<div class="feature"><span class="emoji">✨</span><div style="flex:1"><strong>Pro sehrli dunyo</strong><small>Maxfiy suratlar, juftlik o‘yinlari va alohida imkoniyatlar.</small></div>'+btn('pro','Ko‘rish')+'</div>'+
 (me.role==='admin'?'<div class="card">'+btn('admin','⚙️ Admin panel','')+'</div>':'')+
 '<div class="center muted small" style="margin-top:21px">Muhabbat — katta gaplarda emas, kichkina e’tiborda. ♡</div>');
}
function avatar(id,name,large=false){return id?'<img class="avatar '+(large?'lg':'')+'" src="'+media(id)+'" alt="Profil surati">':'<div class="avatar '+(large?'lg':'')+'">'+esc((name||'♡').slice(0,1).toUpperCase())+'</div>'}
function themeButtons(){return '<div class="themes">'+[['🌹','Atirgul'],['🌙','Oy nuri'],['🍂','Shafaq'],['🌿','Bahor'],['💗','Orzu'],['✒️','Klassik']].map((x,i)=>'<button type="button" class="theme '+(theme===i+1?'chosen':'')+'" data-a="theme" data-id="'+(i+1)+'"><span style="font-size:19px">'+x[0]+'</span>'+x[1]+'</button>').join('')+'</div>'}
function studio(){
 section('<h1 class="page-title">💌 Yangi maktub</h1><p class="muted small">Bitta havola orqali yetkaziladigan unutilmas maktub.</p>'+
 '<form class="card" data-form="letter"><label class="field"><span>Kimga?</span><input name="to" class="input" maxlength="80" placeholder="Sevgilimga..." required></label>'+
 '<label class="field"><span>Kimdan?</span><input name="from" class="input" maxlength="80" value="'+esc(me.name)+'" required></label>'+
 '<label class="field"><span>Maktub sarlavhasi</span><input name="title" class="input" value="Sen — qalbimdagi eng go‘zal hikoya" required maxlength="90"></label>'+
 '<label class="field"><span>Yurak so‘zlari</span><textarea name="message" class="input" required maxlength="1400">Sen hayotimga kirgan kundan beri oddiy lahzalar ham boshqacha ma’no kasb etdi. Har bir tabassuming — mening eng go‘zal xotiram. Seni juda qadrlayman. ♡</textarea></label>'+
 '<div class="field"><span>6 xil maktub shabloni</span>'+themeButtons()+'</div>'+
 '<label class="field"><span>Suratlar (4 tagacha; 5 MB/rasm)</span><input class="input" style="padding:9px" id="letterPhoto" type="file" accept="image/jpeg,image/png,image/webp"></label>'+
 '<label class="checkline"><input type="checkbox" id="privatePhoto"><span>Yangi yuklanadigan surat faqat menga va Pro foydalanuvchilarga ko‘rinsin.</span></label>'+
 '<div id="attached" class="photo-row"></div><button type="submit" class="btn block">♡ Maktubni yaratish</button></form>');
 renderPhotos();
}
function renderPhotos(){let el=$('attached');if(el)el.innerHTML=draftPhotos.map(x=>'<div><img class="thumb" src="'+media(x.id)+'" alt="surat"><div class="mini-tag">'+(x.private?'✦ Maxfiy':'Ochiq')+'</div></div>').join('')}
function letters(){
 section('<h1 class="page-title">Mening maktublarim</h1><div class="row between"><p class="muted small">Yurakdan chiqqan so‘zlaringiz.</p>'+btn('create','+ Yangi','')+'</div><div id="lettersList" class="letterlist"><div class="muted">Yuklanmoqda...</div></div>');
 api('/api/letters/mine').then(d=>{$('lettersList').innerHTML=d.letters.length?d.letters.map(l=>'<div class="letteritem"><div class="row between"><span class="mini-tag">✉ '+esc(l.to)+'</span><span class="small muted">'+moneyDate(l.createdAt)+'</span></div><h3 style="margin:8px 0;font:600 19px Playfair Display,serif">'+esc(l.title)+'</h3><p class="muted small">'+esc(l.message.slice(0,100))+'</p><div class="row wrap">'+btn('openLetter:'+l.id,'Ko‘rish')+btn('editLetter:'+l.id,'Tahrirlash')+btn('copyLetter:'+l.id,'Havola')+btn('deleteLetter:'+l.id,'O‘chirish','danger')+'</div></div>').join(''):'<div class="card center">Hozircha maktub yo‘q. Birinchi maktubingizni yarating! 💌</div>'}).catch(err);
}
function letter(){
 const id=location.pathname.split('/').pop();section('<div class="center"><p class="eyebrow">Faqat sen uchun</p><h1 class="page-title">Sizga maktub bor 💌</h1><div class="envelope" id="envelope"><div class="base"></div><div class="flap"></div><div class="fold"></div><div class="seal">♥</div></div><p class="muted small" id="openHint">Konvertga bosing ♡</p></div><div id="letterBody" hidden></div>');
 api('/api/letters/'+encodeURIComponent(id)).then(d=>{letterData=d;}).catch(e=>{$('openHint').textContent=e.message});
}
function showLetter(){
 if(!letterData)return;const l=letterData.letter;$('envelope').hidden=true;$('openHint').hidden=true;
 const html='<div class="paper" data-theme="'+l.theme+'"><span class="to">💌 '+esc(l.to)+' uchun</span><h2>'+esc(l.title)+'</h2><p>'+esc(l.message)+'</p><div class="from">Muhabbat bilan, '+esc(l.from)+' ♡</div></div>'+
 (l.photoIds.length?'<div class="card"><strong>Bizning xotiralarimiz ♡</strong><div class="photo-row">'+l.photoIds.map(id=>'<img class="paperphoto" src="'+media(id)+'" alt="Maktub surati">').join('')+'</div><div class="muted small">✦ Maxfiy rasmlar faqat Pro obunachilarga ochiq.</div></div>':'')+
 '<div class="card center"><p class="muted small">Bu maktub sizda qanday tuyg‘u uyg‘otdi?</p><div class="row wrap" style="justify-content:center">'+['❤️','🥹','😍','💌','🌹','😘'].map(e=>'<button class="reaction" data-a="react" data-emoji="'+e+'">'+e+' '+(letterData.reactions[e]||'')+'</button>').join('')+'</div><div class="divide"></div><button class="btn sm alt" data-a="copyCurrent">🔗 Havolani ulashish</button> '+btn('reportCurrent','⚑ Shikoyat')+'</div>';
 $('letterBody').innerHTML=html;$('letterBody').hidden=false;
}
function pair(){
 section('<h1 class="page-title">💕 Bizning juftligimiz</h1>'+
 (partner?'<div class="card"><div class="profile">'+avatar(partner.avatarId,partner.name,true)+'<div><div class="mini-tag">Ulangan juftlik ♡</div><h2 style="margin:4px 0">'+esc(partner.name)+'</h2><div class="small muted">Faqat ikkitingizning shaxsiy makoningiz.</div></div></div><div class="divide"></div><div class="row wrap">'+btn('chat','💬 Suhbatni boshlash','')+btn('disconnect','Bog‘lanishni uzish','danger')+'</div></div>':
 '<div class="card center"><div style="font-size:51px;margin:13px">💞</div><h2 class="card-title">Ikki qalbni bog‘lang</h2><p class="muted small">Maxsus havolani sevgilingizga yuboring. U hisobiga kirib taklifni qabul qilsa, sizlarga shaxsiy chat ochiladi.</p><button class="btn block" data-a="invite">🔗 Juftlik havolasini yaratish</button></div>'));
}
function invite(){
 const tok=location.pathname.split('/').pop();
 section(hero('Sizga maxsus taklif ♡','Ikki qalbni birlashtirish uchun taklifni qabul qiling.')+'<div id="inviteBody" class="card center">Tekshirilmoqda...</div>');
 api('/api/pairs/invite/'+encodeURIComponent(tok)).then(v=>{$('inviteBody').innerHTML='<div class="spark">💞</div><h2 class="card-title">'+esc(v.from)+' sizni taklif qildi</h2>'+(me?'<button class="btn block" data-a="acceptInvite" data-token="'+esc(tok)+'">♡ Juftlikka bog‘lanish</button>':'<p class="muted">Taklifni qabul qilish uchun avval kirishingiz kerak.</p><button class="btn block" data-a="loginGo">Kirish / Ro‘yxatdan o‘tish</button>')}).catch(e=>{$('inviteBody').textContent=e.message});
}
function chats(){
 section('<h1 class="page-title">💬 Suhbatlar</h1><p class="muted small">Faqat siz va juftingiz. Xabarlar avtomatik tozalanadi.</p><div id="chatList">Yuklanmoqda...</div>');
 api('/api/chats').then(d=>{$('chatList').innerHTML=d.chats.length?d.chats.map(c=>'<div class="card"><div class="profile">'+avatar(c.avatarId,c.name)+'<div style="flex:1"><strong>'+esc(c.name)+'</strong><div class="small muted">♡ Sizning juftingiz</div></div>'+btn('chat','Yozish','')+'</div></div>').join(''):'<div class="card center"><p style="font-size:34px">💗</p><h3>Juftingizni taklif qiling</h3><p class="muted small">Chat ochilishi uchun ikkala inson ham bir-biriga bog‘langan bo‘lishi kerak.</p><button class="btn block" data-a="pair">Ulashish ♡</button></div>'}).catch(err);
}
function chat(){
 if(!partner){section('<div class="card center">Hozircha juftingiz ulanmagan. '+btn('pair','Juftlik yaratish')+'</div>');return}
 chatPartner=partner.id;chatVisit=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+'a'+Math.random().toString(36).slice(2));
 section('<div class="row between"><div class="profile">'+avatar(partner.avatarId,partner.name)+'<div><strong>'+esc(partner.name)+'</strong><div class="small muted">♡ Shaxsiy suhbat</div></div></div>'+btn('chats','←')+'</div>'+
 '<label class="field"><span>Xabarlarning o‘chish tartibi</span><select class="input" id="ttlSelect"><option value="view">👀 Ko‘rib, chatdan chiqqach</option><option value="6h">6 soatdan keyin</option><option value="12h">12 soatdan keyin</option><option value="18h">18 soatdan keyin</option><option value="24h">24 soatdan keyin</option></select></label>'+
 '<div id="chatMessages" class="chatbox"><div class="muted small center">Suhbat yuklanmoqda...</div></div>'+
 '<form data-form="message" class="composer"><input class="input" name="text" placeholder="Samimiy xabaringiz..." maxlength="1600" autocomplete="off" required><button class="btn" type="submit">➤</button></form><p class="center small muted">Ko‘rildi rejimida o‘qilgan xabarlar chiqishda o‘chadi.</p>');
 $('ttlSelect').value=me.chatTtl||'view';loadMessages();chatTimer=setInterval(loadMessages,4500);
}
async function loadMessages(){if(!chatPartner||!chatVisit||!$('chatMessages'))return;
 try{const data=await api('/api/chats/messages?with='+encodeURIComponent(chatPartner)+'&visit='+encodeURIComponent(chatVisit));
 const pane=$('chatMessages'),atBottom=pane.scrollHeight-pane.scrollTop-pane.clientHeight<115;
 pane.innerHTML=data.messages.length?data.messages.map(m=>'<div class="chatbubble '+(m.from===me.id?'mine':'')+'">'+esc(m.text)+'<small>'+new Date(m.createdAt).toLocaleTimeString('uz-UZ',{hour:'2-digit',minute:'2-digit'})+' · '+(m.mode==='view'?'👁':m.mode)+'</small></div>').join(''):'<div class="center muted small" style="margin:auto">Birinchi xabarni yozing. 💌</div>';if(atBottom)pane.scrollTop=pane.scrollHeight;
 }catch(e){if($('chatMessages'))$('chatMessages').textContent=e.message}}
function leaveChat(){if(chatTimer){clearInterval(chatTimer);chatTimer=null}if(chatVisit){let body=new URLSearchParams({visit:chatVisit});if(navigator.sendBeacon)navigator.sendBeacon('/api/chats/leave',body);chatVisit=''}}
function proPage(){
 const tg=config.telegram;
 section('<h1 class="page-title">✦ Qalbim Pro</h1><p class="muted small">Siz uchun biroz ko‘proq sehr va samimiyat.</p>'+
 (isPro()?'<div class="notice good">✦ Pro faol! Tugash kuni: '+moneyDate(me.proUntil)+'</div>':'')+
 '<div class="twocol"><div class="card center" style="margin:4px 0"><div style="font-size:31px">🌸</div><h3>3 kun</h3><div class="muted small">Sinab ko‘rish</div></div><div class="card center" style="margin:4px 0"><div style="font-size:31px">👑</div><h3>7 kun</h3><div class="muted small">Ko‘proq lahzalar</div></div></div>'+
 '<div class="card"><p>🔐 <strong>Maxfiy suratlarni ochish</strong></p><p>🎲 <strong>Juftlik o‘yinlari</strong></p><p>🎁 <strong>Yashirin syurprizlar</strong></p><p class="muted small">To‘lov va tarif narxini administrator bilan oldindan kelishib oling. Faollashtirish admin panel orqali amalga oshiriladi.</p>'+
 (tg?'<a target="_blank" rel="noopener" class="btn block" style="display:block;text-align:center" href="'+esc(tg)+'">✈ Telegram orqali Pro so‘rash</a>':'<div class="notice">Administrator hali Telegram manzilini kiritmagan. To‘lov qilmang.</div>')+'</div>'+
 '<h2 class="page-title">O‘yinlar <span class="onlypro">✦ PRO</span></h2>'+
 '<div class="feature"><span class="emoji">💘</span><div style="flex:1"><strong>Sevgi testi</strong><small>Juftingizni qanchalik bilasiz?</small></div>'+btn('game:quiz','O‘ynash')+'</div>'+
 '<div class="feature"><span class="emoji">🎲</span><div style="flex:1"><strong>Sirli savol</strong><small>Romantik suhbatga yangi sabab.</small></div>'+btn('game:question','O‘ynash')+'</div>'+
 '<div class="feature"><span class="emoji">🎁</span><div style="flex:1"><strong>Syurpriz quti</strong><small>Tasodifiy sevgili topshiriq.</small></div>'+btn('game:box','Ochish')+'</div>');
}
function games(kind){
 if(!isPro()){notify('Bu o‘yin faqat Pro foydalanuvchilar uchun');go('pro');return}
 const data={quiz:['Sevgilingizni qanday xursand qilasiz?','Qaysi kichik e’tibor unga yoqadi?','Birgalikda eng chiroyli xotirangiz qaysi?'],question:['Birinchi uchrashuvimizdagi eng esda qolarli lahza nima?','Kelajakdagi birgalikdagi orzuimiz qaysi?','Mendan eshitishni xohlagan gaping nima?','Menga aytmay yurgan yoqimli sirin bormi?'],box:['Bugun unga 3 ta samimiy iltifot yozing.','Juftingizga 10 soniyali shirin ovozli xabar yuboring.','Birgalikdagi eng yaxshi suratni toping.','Bir-biringiz uchun 5 ta iliq so‘z ayting.']};
 let values=data[kind]||data.quiz,question=values[Math.floor(Math.random()*values.length)];
 modal('<div class="center" style="padding:30px 12px"><div class="spark">💗</div><h2 class="card-title">'+esc(question)+'</h2><p class="muted small">Ikkitingiz javob berib ko‘ring ♡</p><button class="btn" data-a="game:'+kind+'">Yana bitta ✨</button></div>');
}
function publicProfile(){
 const id=location.pathname.split('/').pop();section('<h1 class="page-title">♡ Foydalanuvchi profili</h1><div id="publicProfile" class="card center">Yuklanmoqda...</div>');
 api('/api/users/'+encodeURIComponent(id)).then(d=>{let u=d.profile;$('publicProfile').innerHTML='<div class="row" style="justify-content:center">'+avatar(u.avatarId,u.name,true)+'</div><h2 class="card-title">'+esc(u.name)+'</h2><p class="muted">'+esc(u.bio||'Qalbim hamjamiyati a’zosi ♡')+'</p><p class="muted small">A’zo bo‘lgan sana: '+moneyDate(u.createdAt)+'</p>'}).catch(err);
}
function profile(){
 if(!me){auth();return}
 section('<h1 class="page-title">Mening profilim</h1><div class="card"><div class="profile">'+avatar(me.avatarId,me.name,true)+'<div><h2 style="margin:0 0 4px">'+esc(me.name)+'</h2><div class="small muted">'+esc(me.phone)+'</div>'+(isPro()?'<span class="pill">✦ PRO</span>':'')+'</div></div>'+
 '<form data-form="avatar"><label class="field"><span>Profil suratini almashtirish</span><input class="input" name="image" type="file" accept="image/jpeg,image/png,image/webp" required style="padding:9px"></label><button class="btn sm alt" type="submit">📷 Rasmni saqlash</button></form><div class="divide"></div>'+
 '<form data-form="profile"><label class="field"><span>Ism familiya</span><input class="input" name="name" required value="'+esc(me.name)+'"></label><label class="field"><span>Bio / siz haqingizda</span><textarea class="input" name="bio" maxlength="240" style="min-height:90px">'+esc(me.bio)+'</textarea></label><label class="field"><span>Standart chat muddati</span><select class="input" name="chatTtl">'+[['view','Ko‘rilgach chiqishda'],['6h','6 soat'],['12h','12 soat'],['18h','18 soat'],['24h','1 kun']].map(x=>'<option value="'+x[0]+'" '+(me.chatTtl===x[0]?'selected':'')+'>'+x[1]+'</option>').join('')+'</select></label><button class="btn block" type="submit">O‘zgarishlarni saqlash</button></form></div>'+
 '<div class="card"><h2 class="card-title">Xavfsizlik</h2><form data-form="password"><label class="field"><span>Eski parol</span><input class="input" type="password" name="oldPassword" required></label><label class="field"><span>Yangi parol (kamida 8 belgi)</span><input class="input" type="password" name="newPassword" required minlength="8"></label><button class="btn sm alt" type="submit">Parolni o‘zgartirish</button></form></div>'+
 '<div class="row wrap">'+btn('pair','💕 Juftlik')+btn('shareProfile','🔗 Profil havolasi')+(me.role==='admin'?btn('admin','⚙️ Admin'):'' )+btn('logout','Chiqish','danger')+'</div>');
}
function adminPage(){
 if(!me||me.role!=='admin'){section('<div class="notice">Faqat administrator uchun.</div>');return}
 section('<h1 class="page-title">⚙️ Admin panel</h1><p class="muted small">Boshqaruv, statistika, Pro ruxsatlar va shikoyatlar.</p><div id="stats" class="stats"></div>'+
 '<div class="card"><h2 class="card-title">Telegram aloqa</h2><form data-form="config"><label class="field"><span>Pro uchun Telegram havola</span><input class="input" name="telegram" placeholder="https://t.me/username"></label><button class="btn sm" type="submit">Saqlash</button></form></div>'+
 '<div class="card"><h2 class="card-title">Foydalanuvchilar</h2><form data-form="userSearch" class="row"><input class="input" name="q" placeholder="Ism yoki telefon"><button class="btn sm" type="submit">Qidirish</button></form><div id="usersList"></div></div>'+
 '<div class="card"><h2 class="card-title">Maktublar</h2><div id="adminLetters"></div></div>'+
 '<div class="card"><h2 class="card-title">Shikoyatlar</h2><div id="reports"></div></div>'+
 '<div class="card"><h2 class="card-title">Chatlar statistikasi</h2><div id="chatStats" class="small muted">Xabar matnlari admin interfeysiga chiqarilmaydi.</div></div>');
 Promise.all([api('/api/admin/stats'),api('/api/admin/config'),api('/api/admin/letters'),api('/api/admin/reports'),api('/api/admin/chats')]).then(x=>{
 const s=x[0];$('stats').innerHTML=[['👤','users','Foydalanuvchilar'],['✉','letters','Maktublar'],['💬','messages','Xabarlar'],['🖼','photos','Rasmlar'],['✦','pro','Faol Pro'],['💞','couples','Juftliklar'],['⚑','reports','Shikoyatlar']].map(a=>'<div class="stat"><span>'+a[0]+' '+a[2]+'</span><strong>'+s[a[1]]+'</strong></div>').join('');
 document.querySelector('[name=telegram]').value=x[1].telegram;
 $('adminLetters').innerHTML=x[2].letters.slice(0,40).map(l=>'<div class="letteritem"><div class="row between"><strong>'+esc(l.title)+'</strong>'+btn('adminDeleteLetter:'+l.id,'O‘chirish','danger')+'</div><div class="muted small">'+esc(l.to)+' · '+moneyDate(l.createdAt)+'</div></div>').join('')||'<p class="muted small">Maktub yo‘q</p>';
 $('reports').innerHTML=x[3].reports.map(r=>'<div class="letteritem"><strong>'+esc(r.type)+' · '+esc(r.status)+'</strong><p class="small">'+esc(r.reason)+'</p>'+btn('resolve:'+r.id,'Yakunlash')+'</div>').join('')||'<p class="muted small">Shikoyatlar yo‘q</p>';
 $('chatStats').innerHTML='<p class="muted small">Xabarlarga umumiy kirish yo‘q; faqat metadata. Jami faol yo‘nalishlar: '+x[4].chats.length+'</p>';
 }).catch(err);loadAdminUsers('');
}
function loadAdminUsers(q){api('/api/admin/users?q='+encodeURIComponent(q||'')).then(d=>{let el=$('usersList');if(!el)return;el.innerHTML=d.users.map(u=>'<div class="letteritem"><div class="row between"><div style="min-width:0"><strong>'+esc(u.name)+'</strong><div class="small muted">'+esc(u.phone)+' · '+moneyDate(u.createdAt)+'</div><span class="mini-tag">'+(u.isPro?'✦ Pro':'Oddiy')+(u.banned?' · BLOK':'')+'</span></div></div><div class="row wrap" style="margin-top:9px">'+btn('userPro3:'+u.id,'+3 kun')+btn('userPro7:'+u.id,'+7 kun')+btn('userPro0:'+u.id,'Pro ✕')+btn('userEdit:'+u.id,'Tahrir')+btn('userBan:'+u.id+':'+(u.banned?'0':'1'),u.banned?'Ochish':'Blok','danger')+(u.role!=='admin'?btn('userDelete:'+u.id,'O‘chirish','danger'):'')+'</div></div>').join('')||'<p class="muted small">Topilmadi</p>'}).catch(err)}
async function act(action,node){
 try{
 if(action==='closeModal')return closeModal();
 if(action==='loginMode'||action==='registerMode'){authMode=action==='loginMode'?'login':'register';return auth()}
 if(['home','letters','create','pro','chats','chat','profile','admin'].includes(action)){leaveChat();return go(action)}
 if(action==='loginGo')return go('/');
 if(action==='pair')return pair();
 if(action==='logout'){await api('/api/auth/logout',{method:'POST'});me=null;go('/');return}
 if(action==='theme'){theme=Number(node.dataset.id);document.querySelectorAll('.theme').forEach(b=>b.classList.toggle('chosen',b===node));return}
 if(action==='openLetter')return showLetter();
 if(action.startsWith('openLetter:'))return go('/l/'+action.split(':')[1]);
 if(action.startsWith('copyLetter:'))return copy(location.origin+'/l/'+action.split(':')[1]);
 if(action==='copyCurrent')return copy(location.href);
 if(action==='shareProfile')return copy(location.origin+'/u/'+me.id);
 if(action==='reportCurrent'){if(!me)return notify('Shikoyat uchun tizimga kiring');modal('<form data-form="report"><input name="type" value="letter" type="hidden"><input name="target" value="'+esc(letterData.letter.id)+'" type="hidden"><label class="field"><span>Shikoyat sababi</span><textarea class="input" name="reason" minlength="10" placeholder="Kamida 10 belgi" required></textarea></label><button class="btn block" type="submit">Yuborish</button></form>');return}
 if(action==='react'){if(!me)return notify('Reaksiya uchun hisobga kiring');await api('/api/letters/'+letterData.letter.id+'/react',{method:'POST',body:{emoji:node.dataset.emoji}});notify('Reaksiya yuborildi ❤️');letterData.reactions[node.dataset.emoji]=(letterData.reactions[node.dataset.emoji]||0)+1;showLetter();return}
 if(action.startsWith('editLetter:')){
  let id=action.split(':')[1],v=await api('/api/letters/'+id),l=v.letter;
  if(l.ownerId!==me.id)return notify('Faqat o‘z maktubingizni tahrirlang');
  modal('<form data-form="letterEdit"><input name="id" type="hidden" value="'+esc(id)+'"><label class="field"><span>Kimga</span><input class="input" name="to" value="'+esc(l.to)+'" required></label><label class="field"><span>Kimdan</span><input class="input" name="from" value="'+esc(l.from)+'" required></label><label class="field"><span>Sarlavha</span><input class="input" name="title" value="'+esc(l.title)+'" required></label><label class="field"><span>Maktub matni</span><textarea name="message" class="input" required>'+esc(l.message)+'</textarea></label><label class="field"><span>Shablon (1–6)</span><select name="theme" class="input">'+[1,2,3,4,5,6].map(n=>'<option value="'+n+'" '+(n===l.theme?'selected':'')+'>'+n+'-shablon</option>').join('')+'</select></label><button type="submit" class="btn block">Saqlash</button></form>');return;
 }
 if(action.startsWith('deleteLetter:')){if(!confirm('Maktub o‘chirilsinmi?'))return;await api('/api/letters/'+action.split(':')[1],{method:'DELETE'});return letters()}
 if(action==='invite'){let d=await api('/api/pairs/invite',{method:'POST',body:{}});let s=location.origin+'/invite/'+d.token;modal('<p class="muted">Sevgilingizga faqat shu maxsus havolani yuboring. Amal qilish muddati 72 soat.</p><textarea class="input" readonly>'+esc(s)+'</textarea><button class="btn block" data-a="copyInvite" data-link="'+esc(s)+'">🔗 Nusxalash</button>');return}
 if(action==='copyInvite')return copy(node.dataset.link);
 if(action==='acceptInvite'){await api('/api/pairs/accept',{method:'POST',body:{token:node.dataset.token}});notify('Endi siz juftliksiz! ♡');return go('/chats.html')}
 if(action==='disconnect'){if(!confirm('Juftlik uzilsa ikkala tarafdagi chat ham o‘chiriladi. Davom etasizmi?'))return;await api('/api/pairs/disconnect',{method:'POST',body:{}});await refresh();return pair()}
 if(action.startsWith('game:'))return games(action.split(':')[1]);
 if(action.startsWith('userPro')){let p=action.split(':'),days=Number(p[0].replace('userPro',''));await api('/api/admin/users/'+p[1],{method:'PATCH',body:{proDays:days}});notify('Pro holati yangilandi');return loadAdminUsers('')}
 if(action.startsWith('userBan:')){let p=action.split(':');await api('/api/admin/users/'+p[1],{method:'PATCH',body:{banned:p[2]==='1'}});return loadAdminUsers('')}
 if(action.startsWith('userEdit:')){let id=action.split(':')[1];let d=await api('/api/admin/users');let u=d.users.find(x=>x.id===id);if(!u)return notify('Foydalanuvchi topilmadi');modal('<form data-form="adminEdit"><input type="hidden" name="id" value="'+esc(id)+'"><label class="field"><span>Ism</span><input class="input" name="name" value="'+esc(u.name)+'"></label><button class="btn block" type="submit">Saqlash</button></form>');return}
 if(action.startsWith('userDelete:')){if(!confirm('Foydalanuvchi va uning ma’lumotlari o‘chirilsinmi?'))return;await api('/api/admin/users/'+action.split(':')[1],{method:'DELETE'});return loadAdminUsers('')}
 if(action.startsWith('adminDeleteLetter:')){if(!confirm('Maktub o‘chirilsinmi?'))return;await api('/api/admin/letters/'+action.split(':')[1],{method:'DELETE'});return adminPage()}
 if(action.startsWith('resolve:')){await api('/api/admin/reports/'+action.split(':')[1],{method:'PATCH',body:{status:'resolved'}});return adminPage()}
 }catch(e){err(e)}
}
document.addEventListener('click',e=>{let node=e.target.closest('[data-a]');if(node){e.preventDefault();act(node.dataset.a,node)}if(e.target.closest&&e.target.closest('#envelope'))showLetter()});
document.addEventListener('change',async e=>{
 if(e.target.id==='letterPhoto'&&e.target.files.length){
  try{if(draftPhotos.length>=4){notify('Maksimal 4 ta surat');return}
   let form=new FormData();form.append('image',e.target.files[0]);form.append('kind','letter');form.append('private',$('privatePhoto').checked?'true':'false');
   const d=await api('/api/photos',{method:'POST',body:form});draftPhotos.push(d);renderPhotos();notify('Surat qo‘shildi');e.target.value='';
  }catch(x){err(x)}
 }
 if(e.target.id==='ttlSelect'){api('/api/me',{method:'PATCH',body:{chatTtl:e.target.value}}).then(()=>{me.chatTtl=e.target.value;notify('Muddat saqlandi')}).catch(err)}
});
document.addEventListener('submit',async e=>{
 let f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();let data=Object.fromEntries(new FormData(f).entries());let t=f.dataset.form,button=f.querySelector('[type=submit]');if(button)button.disabled=true;
 try{
 if(t==='register'){await api('/api/auth/register',{method:'POST',body:{name:data.name,phone:data.phone,password:data.password,termsAccepted:!!data.terms,privacyAccepted:!!data.privacy}});return go('/')}
 if(t==='login'){await api('/api/auth/login',{method:'POST',body:{phone:data.phone,password:data.password}});return go('/')}
 if(t==='letter'){let d=await api('/api/letters',{method:'POST',body:{to:data.to,from:data.from,title:data.title,message:data.message,theme,photoIds:draftPhotos.map(x=>x.id)}});draftPhotos=[];notify('Maktub tayyor!');return go('/l/'+d.letter.id)}
 if(t==='letterEdit'){await api('/api/letters/'+data.id,{method:'PATCH',body:{to:data.to,from:data.from,title:data.title,message:data.message,theme:Number(data.theme)}});closeModal();notify('Maktub yangilandi');return letters()}
 if(t==='report'){await api('/api/reports',{method:'POST',body:{type:data.type,target:data.target,reason:data.reason}});closeModal();return notify('Shikoyat yuborildi')}
 if(t==='profile'){await api('/api/me',{method:'PATCH',body:{name:data.name,bio:data.bio,chatTtl:data.chatTtl}});await refresh();notify('Profil saqlandi');return profile()}
 if(t==='password'){await api('/api/me/password',{method:'POST',body:data});f.reset();return notify('Parol yangilandi')}
 if(t==='avatar'){let form=new FormData(f);form.append('kind','avatar');await api('/api/photos',{method:'POST',body:form});await refresh();notify('Surat saqlandi');return profile()}
 if(t==='message'){await api('/api/chats/messages',{method:'POST',body:{to:chatPartner,text:data.text,mode:$('ttlSelect').value}});f.reset();return loadMessages()}
 if(t==='userSearch')return loadAdminUsers(data.q);
 if(t==='config'){await api('/api/admin/config',{method:'PATCH',body:{telegram:data.telegram}});config.telegram=data.telegram;return notify('Telegram saqlandi')}
 if(t==='adminEdit'){await api('/api/admin/users/'+data.id,{method:'PATCH',body:{name:data.name}});closeModal();return loadAdminUsers('')}
 }catch(x){err(x)}finally{if(button)button.disabled=false}
});
window.addEventListener('pagehide',leaveChat);
window.addEventListener('beforeunload',leaveChat);
document.addEventListener('visibilitychange',()=>{if(page()!=='chat')return;if(document.visibilityState==='hidden')leaveChat();else if(!chatVisit){chatVisit=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+'a'+Math.random().toString(36).slice(2));loadMessages()}});
document.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&e.target.src.includes('/api/photos/')){e.target.replaceWith(Object.assign(document.createElement('span'),{textContent:'🔐 Pro rasm'}))}},true);
(async function init(){
 try{config=await api('/api/config')}catch(e){}
 await refresh();
 const p=page();
 if(p==='letter')return letter();
 if(p==='invite')return invite();
 if(!me)return auth();
 if(p==='admin')return adminPage();
 if(p==='chat')return chat();
 if(p==='chats')return chats();
 if(p==='profile')return profile();
 if(p==='publicProfile')return publicProfile();
 if(p==='pro')return proPage();
 if(p==='letters')return letters();
 if(p==='create')return studio();
 return home();
})();
})();

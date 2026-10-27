'use strict';
window.QalbimIntegrations=function(ctx){
 const $=id=>document.getElementById(id);
 const tg=window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null;
 const initData=tg&&typeof tg.initData==='string'?tg.initData:'';
 let miniMode='register',activeOrder='',checkTimer=null,lastCard='',lastAmount=0;
 const e=v=>ctx.esc(v),api=ctx.api,btn=ctx.btn,fmt=x=>Number(x||0).toLocaleString('uz-UZ')+' so‘m';
 const needsTelegram=()=>!!(tg&&(initData||(tg.platform&&tg.platform!=='unknown')));
 const cleanTimer=()=>{if(checkTimer){clearInterval(checkTimer);checkTimer=null}};
 function telegramWelcome(){
  let unsafe=tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user||{};
  let fullName=[unsafe.first_name,unsafe.last_name].filter(Boolean).join(' ');
  let reg=miniMode==='register';
  ctx.section('<div class="auth-layout"><div class="auth-splash">'+ctx.hero('Qalbim Mini App ♡','Telegram hisobingiz bilan ro‘yxatdan o‘ting. Keyingi kirishda qayta login talab qilinmaydi.')+
    '<div class="envelope"><div class="base"></div><div class="flap"></div><div class="fold"></div><div class="seal">♥</div></div></div>'+
    '<div class="auth-panel"><div class="card auth-card"><div class="tabs">'+
    '<button class="tab '+(reg?'active':'')+'" data-a="tgRegMode">Yangi hisob</button>'+
    '<button class="tab '+(!reg?'active':'')+'" data-a="tgLinkMode">Hisobim bor</button></div>'+
    '<p class="small muted">'+(reg?'Telefon raqam va parolni tanlang — oddiy saytdan ham shu ma’lumotlar bilan kira olasiz.':'Saytdagi avvalgi telefon/parolingizni kiriting — ikkala platforma bitta hisob bo‘ladi.')+'</p>'+
    '<form data-form="'+(reg?'miniRegister':'miniLink')+'">'+
    (reg?'<label class="field"><span>Ism va familiya</span><input class="input" name="name" value="'+e(fullName)+'" minlength="3" maxlength="80" required></label>':'')+
    '<label class="field"><span>Telefon raqam</span><input class="input" name="phone" type="tel" placeholder="+998 90 123 45 67" autocomplete="tel" required></label>'+
    '<label class="field"><span>Parol</span><input class="input" name="password" type="password" minlength="8" maxlength="72" placeholder="'+(reg?'8 belgidan uzun yangi parol':'Veb-saytdagi eski parol')+'" required></label>'+
    (reg?'<label class="checkline"><input type="checkbox" name="terms" required><span><a href="/terms.html" target="_blank">Foydalanish shartlari</a>ga roziman.</span></label><label class="checkline"><input type="checkbox" name="privacy" required><span><a href="/privacy.html" target="_blank">Maxfiylik siyosati</a>ga roziman.</span></label>':'')+
    '<button class="btn block" type="submit">'+(reg?'Telegram orqali ro‘yxatdan o‘tish ♡':'Hisoblarni xavfsiz birlashtirish ♡')+'</button></form>'+
    '<p class="muted small center">Telegram shaxsingiz imzo orqali tasdiqlanadi; telefon SMS orqali hali tasdiqlanmaydi.</p></div></div></div>');
 }
 async function preLogin(){
   if(!initData)return false;
   try{tg.ready();tg.expand()}catch(err){}
   try{
     const d=await api('/api/telegram/auth',{method:'POST',body:{initData,action:'login'}});
     if(d.needsRegistration){telegramWelcome();return true}
     return false;
   }catch(err){
     ctx.notify('Telegram kirish: '+err.message);
     return false;
   }
 }
 async function form(name,data){
   if(name==='miniRegister'||name==='miniLink'){
     if(!needsTelegram())throw new Error('Mini App faqat Telegram ichida ishlaydi');
     await api('/api/telegram/auth',{method:'POST',body:{initData,action:name==='miniRegister'?'register':'link',name:data.name,phone:data.phone,password:data.password,termsAccepted:!!data.terms,privacyAccepted:!!data.privacy}});
     ctx.go('/');return true;
   }
   if(name==='proPrices'){
     await api('/api/admin/prices',{method:'PATCH',body:{price3:Number(data.price3),price7:Number(data.price7),stars3:Number(data.stars3),stars7:Number(data.stars7)}});
     ctx.notify('Tariflar narxi saqlandi');ctx.go('/admin.html');return true;
   }
   return false;
 }
 async function checkPayment(){
   if(!activeOrder)return;
   try{
     const info=await api('/api/payments/status/'+encodeURIComponent(activeOrder));
     if(info.status==='paid'){
       cleanTimer();activeOrder='';ctx.closeModal();await ctx.refresh();ctx.notify('Pro avtomatik faollashdi! ✦');ctx.go('/?view=pro');return;
     }
     if(['cancel','failed'].includes(info.status)){
       cleanTimer();const x=$('paymentStatus');if(x)x.textContent='❌ To‘lov yakunlanmadi yoki muddati o‘tdi. Yangi buyurtma yarating.';return;
     }
     const x=$('paymentStatus');
     if(x){
       const expired=info.expiresAt&&new Date(info.expiresAt).getTime()<Date.now();
       x.textContent=expired?'⌛ Buyurtmaning 5 daqiqalik muddati tugadi. Endi pul o‘tkazmang. Agar avval to‘lagan bo‘lsangiz, tekshiruv davom etmoqda.':'⏳ Hamyon’dan tasdiq kutilyapti. To‘lov aniqlangach Pro avtomatik ochiladi.';
     }
   }catch(err){const x=$('paymentStatus');if(x)x.textContent='Holatni tekshirish: '+err.message}
 }
 function paymentModal(p){
   cleanTimer();activeOrder=p.orderId;lastCard=p.card||'';lastAmount=p.amount;
   ctx.modal('<div class="center"><div style="font-size:38px">💳</div><h2 class="card-title">To‘lov ma’lumotlari</h2><p class="muted small">Hamyon API kartaga tushgan pulni tekshiradi. To‘lov tasdiqlangach Pro avtomatik faollashadi.</p></div>'+
   '<div class="card"><div class="small muted">Karta</div><div class="row between wrap"><strong style="font-size:20px">'+e(lastCard)+'</strong>'+btn('copyPayCard','Nusxalash')+'</div><div class="divide"></div>'+
   '<div class="small muted">Aniq summa</div><div class="row between wrap"><strong style="font-size:22px">'+fmt(lastAmount)+'</strong>'+btn('copyPayAmount','Nusxalash')+'</div><p class="muted small">'+p.days+' kunlik Pro uchun aynan ko‘rsatilgan summani 5 daqiqada o‘tkazing. Karta raqami va summani ko‘rsatilganicha ko‘chirib, 5 daqiqa ichida o‘tkazing. Pulni faqat ushbu yangi buyurtma ko‘rsatilgach yuboring.</p>'+
   '<div class="muted small">Buyurtma: '+e(p.orderId)+'</div></div><div class="notice" id="paymentStatus">⏳ To‘lov kutilmoqda...</div><button class="btn block" data-a="checkPay">🔄 Holatni tekshirish</button>');
   checkTimer=setInterval(checkPayment,7500);
 }
 async function pay(days){
   try{const r=await api('/api/payments/create',{method:'POST',body:{days}});paymentModal(r)}catch(err){ctx.notify(err.message)}
 }
 async function starStatus(){
 if(!activeOrder)return;
 try{
   const info=await api('/api/stars/status/'+encodeURIComponent(activeOrder));
   if(info.status==='paid'){
     cleanTimer();activeOrder='';ctx.closeModal();await ctx.refresh();ctx.notify('Telegram Stars to‘lovi tasdiqlandi! ✦');ctx.go('/?view=pro');
   }else if(info.status==='failed'){
     cleanTimer();const el=$('paymentStatus');if(el)el.textContent='❌ Telegram Stars buyurtmasi bajarilmadi.';
   }else{const el=$('paymentStatus');if(el)el.textContent='⏳ Telegram Stars to‘lovini kutyapmiz...'}
 }catch(err){const el=$('paymentStatus');if(el)el.textContent=err.message}
}
async function payStars(days){
 if(!initData||!tg||typeof tg.openInvoice!=='function'){ctx.notify('Stars to‘lovini Telegram Mini App ichida oching');return}
 try{
   const p=await api('/api/stars/create',{method:'POST',body:{initData,days}});
   cleanTimer();activeOrder=p.orderId;
   ctx.modal('<div class="center"><div style="font-size:40px">⭐</div><h2 class="card-title">Telegram Stars</h2><p>'+p.days+' kunlik Pro — <strong>'+Number(p.stars)+' ⭐</strong></p><p class="muted small">To‘lov Telegramʼning o‘zida tasdiqlanadi. Karta raqami talab qilinmaydi.</p></div><div id="paymentStatus" class="notice">⏳ Telegram to‘lov oynasi ochilmoqda...</div><button class="btn block" data-a="checkStars">Holatni tekshirish</button>');
   checkTimer=setInterval(starStatus,5500);
   tg.openInvoice(p.invoiceLink,function(status){if(status==='paid')starStatus();else if(status==='cancelled'){const el=$('paymentStatus');if(el)el.textContent='To‘lov bekor qilindi.'}});
 }catch(err){ctx.notify(err.message)}
}
function proPage(){
   const mini=needsTelegram();
   const me=ctx.getMe();
   ctx.section('<h1 class="page-title">✦ Qalbim Pro</h1><p class="muted small">Yagona Pro obuna: Mini App va oddiy saytda birgalikda ishlaydi.</p>'+
   (me&&me.isPro?'<div class="notice good">✦ Pro faol. Tugash sanasi: '+e(new Date(me.proUntil).toLocaleDateString('uz-UZ'))+'</div>':'')+
   '<div class="twocol" id="proPlans"><div class="card center">Tariflar yuklanmoqda...</div></div>'+
   '<div class="card"><p>🔐 <strong>Maxfiy rasmlarni ko‘rish</strong></p><p>🎲 <strong>Juftliklar uchun o‘yinlar</strong></p><p>🎁 <strong>Syurprizlar</strong></p><p class="small muted">'+(mini?'Telegram Mini App ichida raqamli obunalar faqat ⭐ Telegram Stars bilan sotiladi.':'Oddiy saytda Hamyon API kartaga tushgan to‘lovni tasdiqlaydi. Buyurtma 5 daqiqa faol.')+'</p></div>'+
   '<h2 class="page-title">Pro mini-o‘yinlar</h2>'+
   '<div class="feature"><span class="emoji">💘</span><div style="flex:1"><strong>Sevgi testi</strong><small>Juftingizni qanchalik bilasiz?</small></div>'+btn('game:quiz','O‘ynash')+'</div>'+
   '<div class="feature"><span class="emoji">🎲</span><div style="flex:1"><strong>Sirli savol</strong><small>Bir-biringizni yanada yaqinroq biling.</small></div>'+btn('game:question','O‘ynash')+'</div>'+
   '<div class="feature"><span class="emoji">🎁</span><div style="flex:1"><strong>Syurpriz quti</strong><small>Sevgi topshirig‘i.</small></div>'+btn('game:box','O‘ynash')+'</div>'+
   '<div class="card faint"><h3 class="card-title">To‘lovlar tarixi</h3><div id="orderHistory" class="muted small">Yuklanmoqda...</div></div>');
   Promise.all([api(mini?'/api/stars/plans':'/api/payments/plans'),api(mini?'/api/stars/mine':'/api/payments/mine')]).then(([p,h])=>{
      if($('proPlans'))$('proPlans').innerHTML=p.plans.map(t=>{
        const priceReady=!!t.price,available=priceReady&&p.gatewayReady;
        const regularDaily=(p.plans[0]&&p.plans[0].price)/3;
        const savings=!mini&&t.days===7&&regularDaily>0&&t.price>0?Math.round((1-t.price/(regularDaily*7))*100):0;
        const ribbon=savings>0?'<div style="margin:8px auto"><span class="pill">🎁 '+savings+'% tejamkor</span></div>':'';
        const action=available?(mini?'payStars:':'payPro:')+t.days:'payInfo:'+t.days;
        const buttonText=available?(mini?'⭐ Stars bilan to‘lash':'💳 To‘lov qilish'):'Nima uchun to‘lov yopiq?';
        return '<div class="card center" style="margin:4px 0"><div style="font-size:32px">'+(t.days===3?'🌸':'👑')+'</div><h3>'+t.days+' kunlik Pro</h3>'+
          '<strong style="font-size:20px">'+(priceReady?(mini?(t.price+' ⭐'):fmt(t.price)):'Hali narx belgilanmagan')+'</strong>'+ribbon+
          '<p class="muted small">'+(available?'To‘lov tasdiqlansa Pro avtomatik faollashadi':!priceReady?(mini?'Administrator Telegram Stars narxini kiritishi kerak.':'Administrator narxni belgilashi kerak.'):'To‘lov provayderi sozlamasi yakunlanmagan.')+'</p>'+
          '<button class="btn block'+(available?'':' alt')+'" data-a="'+action+'">'+buttonText+'</button></div>';
      }).join('');
      if($('orderHistory'))$('orderHistory').innerHTML=h.payments.length?h.payments.map(o=>'<div class="letteritem row between"><div><strong>'+o.days+' kun · '+(mini?(o.stars+' ⭐'):fmt(o.amount))+'</strong><div class="muted small">'+e(o.status)+' · '+e(o.orderId)+'</div></div>'+(o.status==='pending'&&!mini?btn('resumePay:'+o.orderId,'Ochish'):'')+'</div>').join(''):'Hali buyurtmalar yo‘q.';
   }).catch(err=>ctx.notify(err.message));
 }
 async function adminWidgets(){
   const mount=$('view');if(!mount)return;
   const section=document.createElement('div');
   section.className='card';
   section.innerHTML='<h2 class="card-title">💳 Pro tariflari — Sayt va Telegram</h2><p class="muted small">Narxlarni so‘mda belgilang. 0 qiymat tarifni o‘chiradi. Bir xil summali to‘lovlar ajratish uchun kichik identifikatsiya farqi bilan yaratilishi mumkin.</p>'+
   '<form data-form="proPrices" class="twocol"><label class="field"><span>3 kun (so‘m)</span><input class="input" type="number" name="price3" min="0" max="5000000" step="1" required></label>'+
   '<label class="field"><span>7 kun (so‘m)</span><input class="input" type="number" name="price7" min="0" max="5000000" step="1" required></label>'+
   '<label class="field"><span>3 kun (Telegram ⭐)</span><input class="input" type="number" name="stars3" min="0" max="100000" step="1" required></label>'+ 
   '<label class="field"><span>7 kun (Telegram ⭐)</span><input class="input" type="number" name="stars7" min="0" max="100000" step="1" required></label>'+ 
   '<button class="btn block" type="submit" style="grid-column:1/-1">Tariflarni saqlash</button></form>'+
   '<h3>So‘nggi buyurtmalar</h3><div class="small muted" id="adminOrderHistory">Yuklanmoqda...</div>';
   mount.appendChild(section);
   try{
     const [prices,orders,stars]=await Promise.all([api('/api/admin/prices'),api('/api/admin/payments'),api('/api/admin/stars')]);
     if(mount.contains(section)){
       section.querySelector('[name=price3]').value=prices.price3;
       section.querySelector('[name=price7]').value=prices.price7;
       section.querySelector('[name=stars3]').value=prices.stars3;
       section.querySelector('[name=stars7]').value=prices.stars7;
       $('adminOrderHistory').innerHTML=orders.payments.length?orders.payments.slice(0,30).map(o=>'<div class="letteritem row between"><div><strong>'+o.days+' kun — '+fmt(o.amount)+'</strong><div class="small muted">'+e(o.status)+' · '+e(o.orderId)+'</div></div></div>').join(''):'To‘lovlar hali mavjud emas.';
       $('adminOrderHistory').innerHTML+='<h3>⭐ Telegram Stars</h3>'+(stars.payments.length?stars.payments.map(o=>'<div class="letteritem"><strong>'+o.days+' kun — '+o.stars+' ⭐</strong><div class="muted small">'+e(o.status)+' · '+e(o.orderId)+'</div></div>').join(''):'<p class="muted small">Telegram Stars to‘lovlari yo‘q.</p>');
     }
   }catch(err){ctx.notify(err.message)}
 }
 async function action(a,node){
   if(a==='tgRegMode'||a==='tgLinkMode'){miniMode=a==='tgRegMode'?'register':'link';telegramWelcome();return true}
   if(a.startsWith('payInfo:')){
     const mini=needsTelegram();
     const day=Number(a.split(':')[1]);
     const plans=await api(mini?'/api/stars/plans':'/api/payments/plans');
     const found=plans.plans.find(p=>p.days===day);
     const message=!found||!found.price
       ?(mini?'Telegram ichidagi Pro uchun Stars narxi admin panelda hali belgilanmagan. So‘mdagi tariflar oddiy sayt uchun alohida ishlaydi.':'Admin panelda tarif narxi hali belgilanmagan.')
       :(mini?'Telegram Stars to‘lov integratsiyasi hozir ishlamayapti.':'Hamyon to‘lov webhook manzillari hali tasdiqlanmagan. Xavfsizlik uchun kartali to‘lov hozir o‘chirilgan.');
     ctx.modal('<div class="center"><div style="font-size:40px">🔒</div><h2 class="card-title">To‘lov hozircha yopiq</h2><p class="muted">'+e(message)+'</p></div>');
     return true;
   }
   if(a==='checkPay'){await checkPayment();return true}
   if(a==='checkStars'){await starStatus();return true}
   if(a.startsWith('payStars:')){await payStars(Number(a.split(':')[1]));return true}
   if(a==='copyPayCard'){await ctx.copy(lastCard);return true}
   if(a==='copyPayAmount'){await ctx.copy(String(lastAmount));return true}
   if(a.startsWith('payPro:')){await pay(Number(a.split(':')[1]));return true}
   if(a.startsWith('resumePay:')){
      const d=await api('/api/payments/status/'+encodeURIComponent(a.split(':')[1]));
      if(d.status==='pending')paymentModal(d);else ctx.notify('Buyurtma: '+d.status);
      return true;
   }
   if(a==='closeModal'){cleanTimer();activeOrder='';return false}
   return false;
 }
 window.addEventListener('pagehide',cleanTimer);
 return {preLogin,telegramWelcome,form,action,proPage,adminWidgets};
};
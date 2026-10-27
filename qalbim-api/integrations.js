'use strict';
const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const {ObjectId}=require('mongodb');

module.exports=function installIntegrations(app,deps){
 const d=()=>deps.db();
 const c=n=>d().collection(n);
 const reply=(res,status,message)=>res.status(status).json({error:message});
 const asyncRoute=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
 const ready=(req,res,next)=>d()?next():reply(res,503,'Maʼlumotlar bazasi ulanmagan');
 const secret=()=>process.env.TELEGRAM_BOT_TOKEN||'';
 const root=()=>String(process.env.PUBLIC_BASE_URL||'https://qalbim-juftlik.onrender.com').replace(/\/+$/,'');
 const hamyon=()=>({id:String(process.env.HAMYON_SHOP_ID||''),key:String(process.env.HAMYON_SHOP_KEY||'')});
 const now=()=>new Date();
 const day=86400000;
 const validPrice=n=>Number.isSafeInteger(Number(n))&&Number(n)>=0&&Number(n)<=5000000;
 let configuredWebhook=false;

 function checkInit(initData){
   if(!secret())throw new Error('Telegram integratsiyasi sozlanmagan');
   if(typeof initData!=='string'||initData.length>12000||!initData)throw new Error('Telegram maʼlumotlari yetishmayapti');
   const p=new URLSearchParams(initData);
   if([...p.keys()].length!==new Set([...p.keys()]).size)throw new Error('Telegram initData takroriy maydon');
   const provided=p.get('hash');
   if(!provided||!/^[a-fA-F0-9]{64}$/.test(provided))throw new Error('Telegram imzosi topilmadi');
   const canonical=[...p.entries()].filter(([k])=>k!=='hash').sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>k+'='+v).join('\n');
   const key=crypto.createHmac('sha256','WebAppData').update(secret()).digest();
   const calc=crypto.createHmac('sha256',key).update(canonical).digest('hex');
   if(!crypto.timingSafeEqual(Buffer.from(provided.toLowerCase(),'hex'),Buffer.from(calc,'hex')))throw new Error('Telegram imzosi noto‘g‘ri');
   const authDate=Number(p.get('auth_date'));
   if(!Number.isSafeInteger(authDate)||authDate>Date.now()/1000+90||authDate<Date.now()/1000-86400)throw new Error('Telegram sessiyasi eskirgan — botni qayta oching');
   let user;try{user=JSON.parse(p.get('user')||'null')}catch(e){throw new Error('Telegram profili noto‘g‘ri')}
   if(!user||!Number.isSafeInteger(user.id)||user.id<=0)throw new Error('Telegram hisob maʼlumotlari noto‘g‘ri');
   return {id:String(user.id),name:[user.first_name,user.last_name].filter(Boolean).join(' ').trim().slice(0,80)||'Telegram foydalanuvchisi',username:String(user.username||'').slice(0,64)};
 }
 async function tgMethod(method,body){
   if(!secret())throw new Error('TELEGRAM_BOT_TOKEN sozlanmagan');
   const r=await fetch('https://api.telegram.org/bot'+secret()+'/'+method,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
   const j=await r.json();if(!r.ok||!j.ok)throw new Error('Telegram API '+method+': '+String(j.description||r.status));return j.result;
 }
 async function send(chatId,text,keyboard){
   return tgMethod('sendMessage',{chat_id:chatId,text,parse_mode:'HTML',reply_markup:keyboard});
 }
 const mainKeyboard=()=>({inline_keyboard:[[{text:'💌 Qalbim Mini App',web_app:{url:root()+'/?tg=1'}}],[{text:'🌐 Oddiy veb-sayt',url:root()}]]});
 const sanitizeTgId=val=>String(val||'').replace(/[^0-9]/g,'').slice(0,22);

 app.get('/api/telegram/status',(req,res)=>res.json({enabled:!!secret(),bot:'maktubimbot',miniApp:'https://t.me/maktubimbot?startapp'}));
 app.post('/api/telegram/auth',ready,deps.authRate,asyncRoute(async(req,res)=>{
   let tu;try{tu=checkInit(req.body.initData)}catch(e){return reply(res,401,e.message)}
   let user=await c('users').findOne({telegramId:tu.id});
   if(user){if(user.banned)return reply(res,403,'Hisob bloklangan');deps.cookie(res,user._id);return res.json({user:deps.showUser(user),existing:true})}
   const action=String(req.body.action||'login');
   if(action==='login')return res.json({needsRegistration:true,telegram:{name:tu.name}});
   if(action==='link'){
     const phone=deps.phone(req.body.phone),password=String(req.body.password||'');
     if(!phone)return reply(res,400,'Ro‘yxatdagi telefon raqamingizni kiriting');
     user=await c('users').findOne({phone});
     if(!user||user.banned||!user.passwordHash||!await bcrypt.compare(password,user.passwordHash))return reply(res,401,'Telefon yoki parol noto‘g‘ri');
     try{
       const result=await c('users').updateOne({_id:user._id,telegramId:{$exists:false}},{$set:{telegramId:tu.id,telegramUsername:tu.username}});
       if(!result.modifiedCount){
         const curr=await c('users').findOne({_id:user._id});
         if(curr.telegramId!==tu.id)return reply(res,409,'Bu hisob boshqa Telegram hisobiga bog‘langan');
       }
     }catch(e){if(e.code===11000)return reply(res,409,'Telegram hisobi allaqachon ulangan');throw e}
     deps.cookie(res,user._id);
     return res.json({user:deps.showUser(user),linked:true});
   }
   if(action!=='register')return reply(res,400,'Ro‘yxatdan o‘tish turini tanlang');
   const phone=deps.phone(req.body.phone),name=deps.clean(req.body.name||tu.name,80),pw=String(req.body.password||'');
   if(!phone||name.length<3||pw.length<8||pw.length>72)return reply(res,400,'Telefon, ism-familiya va kamida 8 belgili parol kerak');
   if(req.body.termsAccepted!==true||req.body.privacyAccepted!==true)return reply(res,400,'Foydalanish shartlari va maxfiylik siyosatiga rozilik zarur');
   const doc={phone,name,passwordHash:await bcrypt.hash(pw,12),telegramId:tu.id,telegramUsername:tu.username,role:'user',bio:'',banned:false,proUntil:null,partnerId:null,chatTtl:'view',createdAt:now(),termsAt:now(),termsVersion:'2026-10-27',privacyVersion:'2026-10-27'};
   try{const r=await c('users').insertOne(doc);doc._id=r.insertedId}catch(e){if(e.code===11000)return reply(res,409,'Telefon raqami yoki Telegram hisobi allaqachon mavjud. “Hisobim bor” orqali ulang.');throw e}
   deps.cookie(res,doc._id);return res.status(201).json({user:deps.showUser(doc)});
 }));
 app.post('/api/telegram/webhook',ready,asyncRoute(async(req,res)=>{
   const shared=process.env.TELEGRAM_WEBHOOK_SECRET||'';
   const got=req.get('X-Telegram-Bot-Api-Secret-Token')||'';
   if(!secret()||!shared||got.length!==shared.length||!crypto.timingSafeEqual(Buffer.from(got),Buffer.from(shared)))return res.sendStatus(403);
   if(!req.body||!Number.isSafeInteger(req.body.update_id))return res.sendStatus(400);
   const update=req.body;
   if(update.pre_checkout_query){await handlePreCheckout(update.pre_checkout_query);return res.json({ok:true})}
   const message=update.message;
   if(message&&message.successful_payment){await handleStarPayment(message);return res.json({ok:true})}
   if(message&&message.chat&&message.chat.type==='private'&&message.text){
     const t=String(message.text);
     const chatId=message.chat.id;
     if(/^\/start\b/.test(t)||/^\/help\b/.test(t)){
       await send(chatId,'💌 <b>Qalbim ♡ — ikki qalb, bitta makon</b>\n\nSehrli maktublar, maxfiy suhbat va Pro imkoniyatlar.\n\n👇 Mini App tugmasi orqali ro‘yxatdan o‘ting. Keyingi safar avtomatik kirasiz.',mainKeyboard());
     }else if(/^\/pro\b/.test(t)){
       await send(chatId,'✦ Pro obuna uchun mini ilovani ochib, <b>Pro</b> bo‘limiga o‘ting. To‘lov tekshirilgach Pro avtomatik faollashadi.',mainKeyboard());
     }else if(/^\/terms\b/.test(t)){
       await send(chatId,'Qalbim foydalanish shartlari: '+root()+'/terms.html');
     }else if(/^\/paysupport\b/.test(t)){
       const item=await c('settings').findOne({_id:'public'});
       await send(chatId,'To‘lov bilan muammo bo‘lsa, buyurtma raqami bilan administratorga yozing: '+(item?.telegram||root()+'/profile.html'));
     }else if(/^\/app\b/.test(t)){
       await send(chatId,'Qalbim Mini App — ilovani oching:',mainKeyboard());
     }
   }
   res.json({ok:true});
 }));
 app.get('/api/telegram/webhook',(req,res)=>res.status(405).json({error:'Webhook faqat POST qabul qiladi'}));

 // Public subscription prices begin at zero, disabling creation of real-money orders until the admin explicitly sets them.
 async function getPrices(){
   const s=await c('settings').findOne({_id:'prices'});
   return {price3:validPrice(s?.price3)?Number(s.price3):0,price7:validPrice(s?.price7)?Number(s.price7):0};
 }

 async function gatewayHealth(){
   const state=await c('settings').findOne({_id:'hamyonGateway'});
   return {status:state?.status||'unverified',updatedAt:state?.checkedAt||null};
 }
 async function saveGateway(status){
   await c('settings').updateOne({_id:'hamyonGateway'},{$set:{status,checkedAt:now()}},{upsert:true});
 }
 function sessionDisconnected(message){
   return /sessiya|session|ulanmagan|not connected|bog.lanmagan/i.test(String(message||''));
 }

 app.get('/api/payments/plans',ready,asyncRoute(async(req,res)=>{
   const prices=await getPrices(),health=await gatewayHealth();
   res.json({plans:[{days:3,price:prices.price3},{days:7,price:prices.price7}],
     gatewayReady:!!(hamyon().id&&hamyon().key&&health.status==='connected'),
     gatewayStatus:health.status,verificationMode:'provider-polling'});
 }));
 app.get('/api/payments/mine',deps.auth,asyncRoute(async(req,res)=>{
   const list=await c('payments').find({userId:req.user._id},{projection:{_id:0,orderId:1,days:1,amount:1,card:1,status:1,createdAt:1,expiresAt:1}}).sort({createdAt:-1}).limit(25).toArray();
   res.json({payments:list});
 }));

 async function getHamyonStatus(order){
   const response=await fetch('https://hamyon-api.uz/payment/status?payment_id='+encodeURIComponent(order.paymentId),{
     headers:{Accept:'application/json'},signal:AbortSignal.timeout(11000)
   });
   if(!response.ok)throw new Error('Hamyon holat so‘rovi HTTP '+response.status);
   const body=await response.json();
   const payload=body.payment&&typeof body.payment==='object'?body.payment:body.data&&typeof body.data==='object'?body.data:body;
   const state=String(payload.status||payload.payment_status||body.status||body.payment_status||'').trim().toLowerCase();
   if(!state)throw new Error('Hamyon holat javobida status mavjud emas');
   const gotId=payload.payment_id??body.payment_id;
   const gotOrderId=payload.order_id??body.order_id;
   const gotAmount=payload.amount??body.amount;
   const gotShop=payload.shop_id??body.shop_id;
   if(gotId!==undefined&&String(gotId)!==String(order.paymentId))throw new Error('Hamyon payment_id mos kelmaydi');
   if(gotOrderId!==undefined&&String(gotOrderId)!==String(order.orderId))throw new Error('Hamyon order_id mos kelmaydi');
   if(gotAmount!==undefined&&Number(gotAmount)!==order.amount)throw new Error('Hamyon amount mos kelmaydi');
   if(gotShop!==undefined&&String(gotShop)!==hamyon().id)throw new Error('Hamyon shop_id mos kelmaydi');
   return state;
 }
 async function markPaymentPaid(order){
   if(order.status==='paid')return;
   const session=deps.mongoClient().startSession();
   try{
     await session.withTransaction(async()=>{
       const result=await c('payments').updateOne({_id:order._id,status:'pending'},{$set:{status:'paid',paidAt:now()}},{session});
       if(result.modifiedCount===1){
         const user=await c('users').findOne({_id:order.userId},{session});
         if(!user||user.banned)throw new Error('User unavailable to activate Pro');
         const from=Math.max(Date.now(),user.proUntil?new Date(user.proUntil).getTime():0);
         await c('users').updateOne({_id:user._id},{$set:{proUntil:new Date(from+order.days*day)}},{session});
       }
     },{maxCommitTimeMS:12000});
   }finally{await session.endSession()}
   await c('paymentAmounts').deleteOne({amount:order.amount});
 }
 async function updatePaymentFromHamyon(order){
   if(order.status!=='pending'||!order.paymentId)return;
   let state;
   try{state=await getHamyonStatus(order)}
   catch(e){
     console.warn('Hamyon status verification unavailable for order '+order.orderId+': '+e.message.slice(0,100));
     return;
   }
   if(state==='paid')await markPaymentPaid(order);
   else if(state==='cancel'||state==='cancelled'||state==='canceled'){
     await c('payments').updateOne({_id:order._id,status:'pending'},{$set:{status:'cancel',updatedAt:now()}});
     await c('paymentAmounts').deleteOne({amount:order.amount});
   }
 }
 app.get('/api/payments/status/:orderId',deps.auth,asyncRoute(async(req,res)=>{
   const filter={orderId:String(req.params.orderId),userId:req.user._id};
   let doc=await c('payments').findOne(filter);
   if(!doc)return reply(res,404,'Buyurtma topilmadi');
   if(doc.status==='pending'&&doc.paymentId){
     // Prevent parallel browser polls from hammering Hamyon, at most one request per ~6 s/order.
     const sixSecondsAgo=new Date(Date.now()-6000);
     const lease=await c('payments').updateOne({...filter,status:'pending',$or:[{lastProviderCheckAt:{$exists:false}},{lastProviderCheckAt:{$lt:sixSecondsAgo}}]},{$set:{lastProviderCheckAt:now()}});
     if(lease.modifiedCount)await updatePaymentFromHamyon(doc);
     doc=await c('payments').findOne(filter);
   }
   res.json({orderId:doc.orderId,status:doc.status,amount:doc.amount,days:doc.days,expiresAt:doc.expiresAt,card:doc.card||null});
 }));
 app.post('/api/payments/create',deps.auth,deps.authRate,asyncRoute(async(req,res)=>{
   const days=Number(req.body.days),key=days===3?'price3':days===7?'price7':null;
   if(!key)return reply(res,400,'3 yoki 7 kunlik tarifni tanlang');
   const prices=await getPrices(),value=prices[key],h=hamyon();
   if(!value||value<1000)return reply(res,409,'Admin hali tarif narxini belgilamagan');
   if(!h.id||!h.key)return reply(res,503,'To‘lov API ulanmagan');
   const health=await gatewayHealth();
   if(health.status==='session_disconnected')return reply(res,503,'Hamyon do‘konining Telegram sessiyasi ulanmagan. Administrator @HamyonAPIBot → Sessiya bo‘limida ulab, so‘ng admin panelda Tekshirish tugmasini bosishi kerak.');
   if(health.status!=='connected')return reply(res,503,'Hamyon ulanishi hali admin paneldagi API sinovidan o‘tmagan. Pul o‘tkazishdan oldin administrator ulanishni tekshirishi kerak.');
   // Signed callbacks are recommended, but secure provider-status verification is also supported.
   const current=await c('payments').findOne({userId:req.user._id,status:'pending',expiresAt:{$gt:now()}});
   if(current)return res.json({orderId:current.orderId,amount:current.amount,card:current.card,days:current.days,expiresAt:current.expiresAt,status:'pending',reused:true});
   let lock,amount;
   for(let i=0;i<200;i++){
     const added=i===0?0:i;
     amount=value+added;
     try{
       await c('paymentAmounts').insertOne({amount,createdAt:now(),expiresAt:new Date(Date.now()+900000)});
       lock=amount;break;
     }catch(e){if(e.code!==11000)throw e}
   }
   if(!lock)return reply(res,409,'To‘lovlar band, bir necha daqiqadan keyin urinib ko‘ring');
   const orderId='QAL-'+crypto.randomBytes(9).toString('hex');
   const doc={orderId,userId:req.user._id,days,amount,status:'creating',createdAt:now(),expiresAt:new Date(Date.now()+300000)};
   await c('payments').insertOne(doc);
   try{
     const params=new URLSearchParams({shop_id:h.id,shop_key:h.key,amount:String(amount),order_id:orderId});
     const reqPayment=await fetch('https://hamyon-api.uz/payment/create',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:params,signal:AbortSignal.timeout(18000)});
     const data=await reqPayment.json().catch(()=>({}));
     if(!reqPayment.ok||!data.payment_id||!data.card||Number(data.amount)!==amount)throw new Error(String(data.error||data.message||'Hamyon to‘lov yaratishda xato'));
     const paymentId=String(data.payment_id);
     const checkOrder={...doc,paymentId};
     let providerStatus;
     try{providerStatus=await getHamyonStatus(checkOrder)}
     catch(err){
       console.warn('Hamyon preflight verification unavailable: '+err.message.slice(0,120));
       await c('payments').updateOne({orderId,status:'creating'},{$set:{paymentId,status:'unverified',lastVerificationError:now()}});
       return reply(res,503,'Hamyon buyurtmani mustaqil tekshirish imkonsiz. Xavfsizlik uchun karta ko‘rsatilmaydi va pul o‘tkazmang.');
     }
     if(!['pending','prepare','created','waiting'].includes(providerStatus)){
       await c('payments').updateOne({orderId,status:'creating'},{$set:{paymentId,status:'unverified'}});
       return reply(res,503,'Hamyon buyurtmasining dastlabki holati tasdiqlanmadi. Pul o‘tkazmang.');
     }
     await saveGateway('connected');
     await c('payments').updateOne({orderId,status:'creating'},{$set:{paymentId,card:String(data.card).slice(0,32),status:'pending'}});
     res.status(201).json({orderId,amount,card:String(data.card),days,expiresAt:doc.expiresAt,status:'pending'});
   }catch(e){
     await c('payments').updateOne({orderId,status:'creating'},{$set:{status:'failed',error:'Provider error'}});
     await c('paymentAmounts').deleteOne({amount:lock});
     if(sessionDisconnected(e.message)){
       await saveGateway('session_disconnected');
       return reply(res,503,'Hamyon do‘koni sessiyasi ulanmagan — HamyonAPIBot → Sessiya bo‘limida Telegram akkauntni ulang. Administrator ulanishni admin panelda qayta tekshirishi kerak.');
     }
     return reply(res,502,'Hamyon buyurtmasini yaratishda xatolik: '+String(e.message).slice(0,170));
   }
 }));
 function validSignature(body){
   const h=hamyon();
   if(!h.id||!h.key)return false;
   const shop=String(body.shop_id??''),payment=String(body.payment_id??''),amount=String(body.amount??''),sign=String(body.sign??'');
   if(shop!==h.id||!payment||!amount||!/^[0-9a-fA-F]{32}$/.test(sign))return false;
   const correct=crypto.createHash('md5').update(shop+payment+amount+h.key).digest('hex');
   return crypto.timingSafeEqual(Buffer.from(correct,'hex'),Buffer.from(sign.toLowerCase(),'hex'));
 }
 async function callback(req,res,final){
   if(!d())return reply(res,503,'Database offline');
   const body=req.body||{};
   if(!validSignature(body))return reply(res,403,'Payment signature invalid');
   const paymentId=String(body.payment_id),amount=Number(body.amount),orderId=String(body.order_id||'');
   const order=await c('payments').findOne({paymentId,orderId,amount});
   if(!order){
     const diag=await c('hamyonTests').findOne({orderId,amount});
     if(!diag)return reply(res,404,'To‘lov buyurtmasi topilmadi');
     if(diag.paymentId&&diag.paymentId!==paymentId)return reply(res,403,'Payment ID mismatch');
     const resultStatus=String(body.status||'').toLowerCase();
     await c('hamyonTests').updateOne({_id:diag._id},{$set:{paymentId,status:final?resultStatus:'prepare',updatedAt:now()}});
     return res.json({ok:true,diagnostic:true});
   }
   const status=String(body.status||'').toLowerCase();
   if(!final){return res.json({ok:true})}
   if(status==='cancel'){
     await c('payments').updateOne({_id:order._id,status:'pending'},{$set:{status:'cancel',updatedAt:now()}});
     await c('paymentAmounts').deleteOne({amount});
     return res.json({ok:true});
   }
   if(status!=='paid')return reply(res,400,'Payment status unsupported');
   if(order.status==='paid')return res.json({ok:true,alreadyProcessed:true});
   if(order.status!=='pending')return reply(res,409,'Payment is not pending');
   const providerStatus=await getHamyonStatus(order);
   if(providerStatus!=='paid')return reply(res,409,'Payment not confirmed by Hamyon provider');
   await markPaymentPaid(order);
   res.json({ok:true});
 }
 app.post('/api/hamyon/prepare',ready,asyncRoute((req,res)=>callback(req,res,false)));
 app.post('/api/hamyon/complete',ready,asyncRoute((req,res)=>callback(req,res,true)));


 // Telegram Mini App digital subscriptions are sold solely with Telegram Stars (XTR).
 // Card-based Hamyon checkout remains for the standalone website.
 const isStarPrice=n=>Number.isSafeInteger(Number(n))&&Number(n)>=0&&Number(n)<=100000;
 async function getStars(){
   const s=await c('settings').findOne({_id:'prices'});
   return {stars3:isStarPrice(s?.stars3)?Number(s.stars3):0,stars7:isStarPrice(s?.stars7)?Number(s.stars7):0};
 }
 app.get('/api/stars/plans',ready,asyncRoute(async(req,res)=>{
   const v=await getStars();
   res.json({plans:[{days:3,price:v.stars3},{days:7,price:v.stars7}],gatewayReady:!!secret()});
 }));
 app.get('/api/stars/mine',deps.auth,asyncRoute(async(req,res)=>{
   const list=await c('starPayments').find({userId:req.user._id},{projection:{_id:0,orderId:1,days:1,stars:1,status:1,createdAt:1}}).sort({createdAt:-1}).limit(30).toArray();
   res.json({payments:list});
 }));
 app.get('/api/stars/status/:orderId',deps.auth,asyncRoute(async(req,res)=>{
   const item=await c('starPayments').findOne({orderId:String(req.params.orderId),userId:req.user._id});
   if(!item)return reply(res,404,'Buyurtma topilmadi');
   res.json({orderId:item.orderId,status:item.status,days:item.days,stars:item.stars});
 }));
 app.post('/api/stars/create',ready,deps.auth,deps.authRate,asyncRoute(async(req,res)=>{
   let tgUser;try{tgUser=checkInit(req.body.initData)}catch(e){return reply(res,401,'Stars uchun Telegram Mini App ichidan kiring')}
   if(!req.user.telegramId||req.user.telegramId!==tgUser.id)return reply(res,403,'Telegram hisobingizga mos kelmaydi');
   const days=Number(req.body.days),key=days===3?'stars3':days===7?'stars7':null;
   if(!key)return reply(res,400,'Tarif 3 yoki 7 kun');
   const stars=(await getStars())[key];
   if(!stars)return reply(res,409,'Admin Telegram Stars tarif narxini kiritmagan');
   const recent=await c('starPayments').findOne({userId:req.user._id,status:'pending',createdAt:{$gt:new Date(Date.now()-3600000)}});
   if(recent)return res.json({orderId:recent.orderId,invoiceLink:recent.invoiceLink,stars:recent.stars,days:recent.days,reused:true});
   const orderId='XTR-'+crypto.randomBytes(10).toString('hex');
   const doc={userId:req.user._id,telegramId:tgUser.id,orderId,days,stars,status:'creating',createdAt:now()};
   await c('starPayments').insertOne(doc);
   try{
     const invoice=await tgMethod('createInvoiceLink',{
       title:'Qalbim Pro — '+days+' kun',
       description:days+' kunlik Qalbim Pro: maxfiy suratlar va juftlik o‘yinlari',
       payload:orderId,provider_token:'',currency:'XTR',
       prices:[{label:days+' kunlik Qalbim Pro',amount:stars}]
     });
     await c('starPayments').updateOne({orderId,status:'creating'},{$set:{invoiceLink:invoice,status:'pending'}});
     res.status(201).json({orderId,invoiceLink:invoice,days,stars});
   }catch(e){
     await c('starPayments').updateOne({orderId,status:'creating'},{$set:{status:'failed',error:'Telegram invoice error'}});
     return reply(res,502,'Telegram Stars buyurtmasi yaratilmadi: '+e.message.slice(0,130));
   }
 }));
 async function handlePreCheckout(q){
   const order=await c('starPayments').findOne({orderId:String(q.invoice_payload||''),status:'pending'});
   const ok=!!(order&&q.currency==='XTR'&&order.stars===Number(q.total_amount)&&order.telegramId===String(q.from?.id));
   await tgMethod('answerPreCheckoutQuery',{pre_checkout_query_id:q.id,ok,error_message:ok?undefined:'Buyurtma mos emas yoki muddati tugagan. Yangi Pro buyurtma yarating.'});
 }
 async function handleStarPayment(message){
   const paid=message.successful_payment;
   const orderId=String(paid.invoice_payload||''),chargeId=String(paid.telegram_payment_charge_id||'');
   const order=await c('starPayments').findOne({orderId});
   if(!order||!chargeId||paid.currency!=='XTR'||order.stars!==Number(paid.total_amount)||order.telegramId!==String(message.from?.id)){
     console.warn('Telegram Stars payment unmatched');return;
   }
   if(order.status==='paid')return;
   if(order.status!=='pending')throw new Error('Telegram Stars payment order not pending');
   const mongoClient=deps.mongoClient(),session=mongoClient.startSession();
   try{
     await session.withTransaction(async()=>{
       const changed=await c('starPayments').updateOne({_id:order._id,status:'pending'},{$set:{status:'paid',chargeId,paidAt:now()}},{session});
       if(changed.modifiedCount===1){
         const u=await c('users').findOne({_id:order.userId},{session});
         if(!u||u.banned)throw new Error('Telegram payment user missing or banned');
         const baseTime=Math.max(Date.now(),u.proUntil?new Date(u.proUntil).getTime():0);
         await c('users').updateOne({_id:u._id},{$set:{proUntil:new Date(baseTime+order.days*day)}},{session});
       }
     },{maxCommitTimeMS:12000});
   }finally{await session.endSession()}
   try{await send(message.chat.id,'✅ <b>To‘lov tasdiqlandi!</b>\n\n✦ Qalbim Pro '+order.days+' kunga faollashtirildi.',mainKeyboard())}catch(e){console.warn('Stars receipt notification failed:',e.message)}
 }
 app.get('/api/admin/stars',deps.auth,deps.adm,asyncRoute(async(req,res)=>{
   const list=await c('starPayments').find({},{projection:{_id:0,invoiceLink:0,chargeId:0}}).sort({createdAt:-1}).limit(50).toArray();
   res.json({payments:list.map(v=>({...v,userId:String(v.userId)}))});
 }));

 app.get('/api/admin/payments',deps.auth,deps.adm,asyncRoute(async(req,res)=>{
   const list=await c('payments').find({},{projection:{_id:0,paymentId:0,card:0}}).sort({createdAt:-1}).limit(100).toArray();
   res.json({payments:list.map(p=>({...p,userId:String(p.userId)}))});
 }));
 
 // Explicitly initiated, administrator-only merchant self-test.
 // Creates ONE unpaid five-minute provider order without showing any card or charging a customer.
 app.get('/api/admin/hamyon/health',deps.auth,deps.adm,asyncRoute(async(req,res)=>{
   const health=await gatewayHealth();
   res.json({...health,configured:!!(hamyon().id&&hamyon().key),
     prepareUrl:root()+'/api/hamyon/prepare',completeUrl:root()+'/api/hamyon/complete',
     note:health.status==='connected'?'API test buyurtmasi muvaffaqiyatli yaratilgan; to‘lovni qabul qilishni real o‘tkazma bilan sinash hali kerak.':'Hamyon Telegram sessiyasini ulang va Tekshirish tugmasini bosing.'});
 }));
 app.post('/api/admin/hamyon/test',deps.auth,deps.adm,deps.authRate,asyncRoute(async(req,res)=>{
   const h=hamyon();
   if(!h.id||!h.key)return reply(res,503,'Hamyon shop_id/shop_key kiritilmagan');
   const last=await gatewayHealth();
   if(last.updatedAt&&Date.now()-new Date(last.updatedAt).getTime()<30000)
     return reply(res,429,'Tekshiruvni 30 soniyadan keyin takrorlang');
   const amount=39100+crypto.randomInt(0,700);
   const orderId='QAL-CHECK-'+crypto.randomBytes(9).toString('hex');
   await c('hamyonTests').insertOne({orderId,amount,status:'creating',createdAt:now(),expiresAt:new Date(Date.now()+3600000)});
   try{
     const data=new URLSearchParams({shop_id:h.id,shop_key:h.key,amount:String(amount),order_id:orderId});
     const response=await fetch('https://hamyon-api.uz/payment/create',{
       method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data,signal:AbortSignal.timeout(15000)});
     const json=await response.json().catch(()=>({}));
     if(!response.ok||!json.payment_id||!json.card||Number(json.amount)!==amount){
       const msg=String(json.error||json.message||'Provider rejected the order');
       if(sessionDisconnected(msg)){
         await saveGateway('session_disconnected');
         return reply(res,503,'Do‘kon sessiyasi ulanmagan. @HamyonAPIBot → Sessiya bo‘limida Telegram akkauntingizni ulang.');
       }
       await saveGateway('unverified');
       return reply(res,502,'Hamyon sinov buyurtmasini rad etdi: '+msg.slice(0,130));
     }
     await c('hamyonTests').updateOne({orderId},{$set:{paymentId:String(json.payment_id),status:'pending'}});
     const state=await getHamyonStatus({paymentId:String(json.payment_id),orderId,amount});
     if(!['pending','prepare','created','waiting'].includes(state)){
       await saveGateway('unverified');
       return reply(res,502,'Hamyon test buyurtmasi kutilmagan holatda: '+state.slice(0,30));
     }
     await saveGateway('connected');
     res.json({ok:true,providerOrder:'accepted',providerStatus:state,
       note:'Pul o‘tkazilmagan. Sinov buyurtmasi 5 daqiqadan keyin avtomatik tugaydi. Real to‘lovni alohida tekshiring.'});
   }catch(e){
     await saveGateway('unverified');
     console.warn('Admin Hamyon self-check failed:',String(e.message).slice(0,110));
     return reply(res,502,'Hamyon test so‘rovida xatolik: '+String(e.message).slice(0,130));
   }
 }));

 app.get('/api/admin/prices',deps.auth,deps.adm,asyncRoute(async(req,res)=>res.json({...await getPrices(),...await getStars()})));
 app.patch('/api/admin/prices',deps.auth,deps.adm,asyncRoute(async(req,res)=>{
   const price3=Number(req.body.price3),price7=Number(req.body.price7);
   if(!validPrice(price3)||!validPrice(price7))return reply(res,400,'Narxlar 0–5 000 000 so‘m oralig‘idagi butun son bo‘lsin');
   const stars3=Number(req.body.stars3),stars7=Number(req.body.stars7);
   if(!isStarPrice(stars3)||!isStarPrice(stars7))return reply(res,400,'Stars narxlari 0–100 000 oralig‘idagi butun son bo‘lsin');
   if((price3>0&&price3<1000)||(price7>0&&price7<1000))return reply(res,400,'Aktiv tarif narxi kamida 1000 so‘m');
   await c('settings').updateOne({_id:'prices'},{$set:{price3,price7,stars3,stars7,updatedAt:now()}},{upsert:true});
   res.json({ok:true,price3,price7,stars3,stars7});
 }));

 async function start(){
   if(!d())return;
   await Promise.all([
     c('users').createIndex({telegramId:1},{unique:true,partialFilterExpression:{telegramId:{$type:'string'}}}),
     c('payments').createIndex({orderId:1},{unique:true}),
     c('payments').createIndex({paymentId:1},{unique:true,partialFilterExpression:{paymentId:{$type:'string'}}}),
     c('paymentAmounts').createIndex({amount:1},{unique:true}),
     c('paymentAmounts').createIndex({expiresAt:1},{expireAfterSeconds:0}),
     c('hamyonTests').createIndex({orderId:1},{unique:true}),
     c('hamyonTests').createIndex({expiresAt:1},{expireAfterSeconds:0}),
     c('starPayments').createIndex({orderId:1},{unique:true}),
     c('starPayments').createIndex({chargeId:1},{unique:true,partialFilterExpression:{chargeId:{$type:'string'}}})
   ]);
   // One-time configured Qalbim UZS pricing. The revision prevents restarts from overwriting later admin edits.
   const pricingVersion='2026-10-27-3d5k-7d10k';
   const existingPrices=await c('settings').findOne({_id:'prices'});
   if(!existingPrices||existingPrices.webTariffsRevision!==pricingVersion){
     await c('settings').updateOne({_id:'prices'},{$set:{
       price3:5000,price7:10000,webTariffsRevision:pricingVersion,
       lastPriceUpdate:now()
     }},{upsert:true});
     console.log('Qalbim Pro UZS rates saved: 3 days 5000, 7 days 10000');
   }
   if(!secret()){console.warn('TELEGRAM_BOT_TOKEN missing — Mini App Telegram login disabled');return}
   if(!process.env.TELEGRAM_WEBHOOK_SECRET){console.warn('TELEGRAM_WEBHOOK_SECRET missing — bot webhook not enabled');return}
   try{
     const info=await tgMethod('getMe',{});
     if(String(info.username||'').toLowerCase()!=='maktubimbot'){
       console.error('Configured Telegram token does not belong to @maktubimbot. Webhook not configured.');
       return;
     }
     await tgMethod('setWebhook',{url:root()+'/api/telegram/webhook',secret_token:process.env.TELEGRAM_WEBHOOK_SECRET,allowed_updates:['message','pre_checkout_query'],max_connections:10});
     await tgMethod('setChatMenuButton',{menu_button:{type:'web_app',text:'💌 Qalbim',web_app:{url:root()+'/?tg=1'}}});
     await tgMethod('setMyCommands',{commands:[{command:'start',description:'Qalbim Mini App'},{command:'pro',description:'Pro tariflar'},{command:'terms',description:'Foydalanish shartlari'},{command:'paysupport',description:'To‘lovlar uchun yordam'},{command:'help',description:'Yordam'}]});
     configuredWebhook=true;
     console.log('Telegram @maktubimbot webhook and Mini App menu configured');
   }catch(e){console.error('Telegram integration setup:',e.message.slice(0,180))}
 }
 return {start};
};

'use strict';
/* Qalbim celebration cards: public share links are explicit, private accounts required to create
 * and send. The recipient gets a native chat card; no URL pasted into the composer. */
const EVENTS=['love','birthday','anniversary','thanks','miss','achievement'];
const SKINS=['blush','lilac','pearl','rose','night'];
module.exports=function registerCelebrations({app,auth,ready,wrap,c,oid,bad,clean,date}){
 const collection=()=>c('celebrations');
 function pack(v){return {id:String(v._id),ownerId:String(v.owner),event:v.event,skin:v.skin,
   title:v.title,message:v.message,to:v.to,from:v.from,secret:v.secret||'',
   createdAt:v.createdAt,sentAt:v.sentAt||null};}
 app.get('/api/celebrations/mine',auth,wrap(async(req,res)=>{
   const list=await collection().find({owner:req.user._id}).sort({createdAt:-1}).limit(35).toArray();
   res.set('Cache-Control','no-store').json({cards:list.map(pack)});
 }));
 app.post('/api/celebrations',auth,wrap(async(req,res)=>{
   const title=clean(req.body.title,100),message=clean(req.body.message,900),
     to=clean(req.body.to,75),from=clean(req.body.from,75),secret=clean(req.body.secret,220),
     event=String(req.body.event||'love'),skin=String(req.body.skin||'blush');
   if(!EVENTS.includes(event)||!SKINS.includes(skin))return bad(res,400,'Tabrik mavzusi yoki dizayni noto‘g‘ri');
   if(title.length<3||message.length<8||!from||!to)return bad(res,400,'Tabrik ma’lumotlarini to‘liq to‘ldiring');
   const daily=await collection().countDocuments({owner:req.user._id,createdAt:{$gt:new Date(Date.now()-86400000)}});
   if(daily>=35)return bad(res,429,'Bir kunda ko‘pi bilan 35 ta tabrik saqlash mumkin');
   const record={owner:req.user._id,title,message,to,from,secret,event,skin,createdAt:date(),sentAt:null};
   const r=await collection().insertOne(record);record._id=r.insertedId;
   res.status(201).set('Cache-Control','no-store').json({card:pack(record)});
 }));
 app.get('/api/celebrations/:id',ready,wrap(async(req,res)=>{
   const id=oid(req.params.id);if(!id)return bad(res,404,'Tabrik topilmadi');
   const record=await collection().findOne({_id:id});
   if(!record)return bad(res,404,'Tabrik topilmadi');
   res.set('Cache-Control','public, max-age=30').json({card:pack(record)});
 }));
 app.post('/api/celebrations/:id/send',auth,wrap(async(req,res)=>{
   const id=oid(req.params.id);if(!id)return bad(res,404,'Tabrik topilmadi');
   const item=await collection().findOne({_id:id,owner:req.user._id});
   if(!item)return bad(res,404,'Tabrik faqat uning muallifi tomonidan yuboriladi');
   const partnerId=req.user.partnerId;
   if(!partnerId)return bad(res,403,'Avval juftlikni ulang');
   const partner=await c('users').findOne({_id:partnerId,partnerId:req.user._id,banned:false},{projection:{_id:1}});
   if(!partner)return bad(res,403,'Juftlik aloqasi tasdiqlanmagan');
   // One greeting generates at most one chat message; duplicate taps are idempotent.
   const now=date();
   const entry={kind:'celebration',celebrationId:id,from:req.user._id,to:partnerId,
      text:'',mode:'24h',createdAt:now,expiresAt:new Date(now.getTime()+24*3600000)};
   const query={kind:'celebration',celebrationId:id,from:req.user._id,to:partnerId};
   const r=await c('messages').updateOne(query,{$setOnInsert:entry},{upsert:true});
   const sent=await c('messages').findOne(query,{projection:{_id:1}});
   await collection().updateOne({_id:id,owner:req.user._id},{$set:{sentAt:now}});
   res.status(r.upsertedCount?201:200).json({sent:true,alreadySent:!r.upsertedCount,
     chatMessageId:String(sent._id),card:{...pack(item),sentAt:now}});
 }));
 app.delete('/api/celebrations/:id',auth,wrap(async(req,res)=>{
   const id=oid(req.params.id);if(!id)return bad(res,404,'Tabrik topilmadi');
   const result=await collection().deleteOne({_id:id,owner:req.user._id});
   if(!result.deletedCount)return bad(res,404,'Faqat o‘z tabrigingizni o‘chira olasiz');
   res.json({ok:true});
 }));
};

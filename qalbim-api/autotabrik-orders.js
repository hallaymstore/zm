/* Qalbim AutoTabrik: private order intake and provider-verified payments.
 * Photos compressed to WebP; payment verified exclusively through Hamyon.
 * Service turnaround is 14 hours after the provider confirms payment. */
'use strict';
const multer=require('multer'),sharp=require('sharp');
module.exports=function({app,auth,adm,wrap,c,oid,bad,clean,date}){
 const EVENTS=['birthday','love','mother','wedding','anniversary','thanks','achievement'];
 const PRICES={audio:55000,video:75000};
 const IMAGE_MIMES=['image/jpeg','image/png','image/webp'];
 const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024},fileFilter:(req,f,cb)=>cb(null,IMAGE_MIMES.includes(f.mimetype))});
 const archive=()=>c('autotabrik_orders'),images=()=>c('autotabrik_assets');
 const pack=(o,assets=0)=>({id:String(o._id),kind:o.kind,status:o.status,occasion:o.occasion,
  recipient:o.recipient,age:o.age,birthday:o.birthday,recipientPhone:o.recipientPhone,contactChannel:o.contactChannel,
  relation:o.relation,fromName:o.fromName,address:o.address,formality:o.formality,family:o.family,
  message:o.message,notes:o.notes,photosCount:assets,price:o.price??PRICES[o.kind]??null,paymentOrderId:o.paymentOrderId||null,paidAt:o.paidAt||null,deadlineAt:o.deadlineAt||null,createdAt:o.createdAt,submittedAt:o.submittedAt||null});
 const owned=async(req,res)=>{
  const id=oid(req.params.id);if(!id)return {failed:bad(res,404,'Buyurtma topilmadi')};
  const o=await archive().findOne({_id:id,...(req.user.role==='admin'?{}:{owner:req.user._id})});
  if(!o)return {failed:bad(res,404,'Buyurtma topilmadi')};return {o};
 };
 app.get('/api/autotabrik/orders',auth,wrap(async(req,res)=>{
  const orders=await archive().find({owner:req.user._id}).sort({createdAt:-1}).limit(30).toArray();
  const counts=await Promise.all(orders.map(o=>images().countDocuments({orderId:o._id,kind:'photo'})));
  res.set('Cache-Control','no-store').json({orders:orders.map((o,i)=>pack(o,counts[i]))});
 }));
 app.post('/api/autotabrik/orders',auth,wrap(async(req,res)=>{
  const r=req.body||{},kind=String(r.kind||''),occasion=String(r.occasion||'birthday'),
   recipient=clean(r.recipient,90),age=Number(r.age),birthday=String(r.birthday||''),
   recipientPhone=clean(r.recipientPhone,32),contactChannel=String(r.contactChannel||'phone'),
   relation=clean(r.relation,80),fromName=clean(r.fromName,100),formality=String(r.formality||'siz'),
   family=String(r.family||''),address=clean(r.address,180),message=clean(r.message,3500),notes=clean(r.notes,1000);
  if(!['audio','video','phone'].includes(kind)||!EVENTS.includes(occasion))
   return bad(res,400,'Tabrik turi noto‘g‘ri');
  if(!recipient||!Number.isInteger(age)||age<0||age>120||!/^\d{4}-\d{2}-\d{2}$/.test(birthday)||
   !Number.isFinite(Date.parse(birthday))||!recipientPhone||!relation||!fromName||!address||
   !['siz','sen'].includes(formality)||!['married_children','married','single','other'].includes(family)||
   !['phone','telegram','whatsapp'].includes(contactChannel))
    return bad(res,400,'Anketadagi 10 ta ma’lumotni to‘g‘ri to‘ldiring');
  if(message.length<30)return bad(res,400,'Tabrik uchun kamida 30 belgili tilak yozing');
  if(r.agreed!==true)return bad(res,400,'Suratlar va aloqa ma’lumotlarini ishlatishga ruxsatni tasdiqlang');
  const count=await archive().countDocuments({owner:req.user._id,createdAt:{$gt:new Date(Date.now()-86400000)}});
  if(count>=6)return bad(res,429,'Bir kunda ko‘pi bilan 6 ta yangi buyurtma yarating');
  const o={owner:req.user._id,kind,occasion,recipient,age,birthday,recipientPhone,contactChannel,relation,
    fromName,formality,family,address,message,notes,price:PRICES[kind]??null,status:'draft',paymentOrderId:null,paidAt:null,deadlineAt:null,createdAt:date(),submittedAt:null};
  const inserted=await archive().insertOne(o);o._id=inserted.insertedId;
  res.status(201).json({order:pack(o,0)});
 }));
 app.post('/api/autotabrik/orders/:id/photos',auth,upload.single('image'),wrap(async(req,res)=>{
  const {o,failed}=await owned(req,res);if(failed)return;
  if(o.status!=='draft')return bad(res,409,'Faqat yuborilmagan buyurtmaga rasm yuklash mumkin');
  if(o.kind!=='video')return bad(res,400,'Faqat video buyurtma rasmlar qabul qiladi');
  if(!req.file)return bad(res,400,'5 MB gacha JPG, PNG yoki WEBP rasm yuboring');
  const count=await images().countDocuments({orderId:o._id,kind:'photo'});
  if(count>=50)return bad(res,400,'50 ta rasm chegarasi');
  let buffer;try{buffer=await sharp(req.file.buffer,{limitInputPixels:20000000})
   .rotate().resize({width:950,height:950,fit:'inside',withoutEnlargement:true}).webp({quality:67}).toBuffer()}
  catch(e){return bad(res,400,'Rasm buzilgan yoki format qo‘llab-quvvatlanmaydi')}
  const now=date();await images().insertOne({orderId:o._id,owner:req.user._id,kind:'photo',buffer,
     createdAt:now,expiresAt:new Date(now.getTime()+30*86400000)});
  res.status(201).json({photosCount:count+1,required:30});
 }));
 app.post('/api/autotabrik/orders/:id/submit',auth,wrap(async(req,res)=>{
  const {o,failed}=await owned(req,res);if(failed)return;
  if(o.status!=='draft')return bad(res,409,'Buyurtma allaqachon yuborilgan');
  const count=await images().countDocuments({orderId:o._id,kind:'photo'});
  if(o.kind==='video'&&count<30)return bad(res,400,'Video uchun kamida 30 ta rasm kerak. Hozir: '+count);
  const status=o.kind==='phone'?'awaiting_quote':'awaiting_payment';
  await archive().updateOne({_id:o._id,owner:req.user._id},{$set:{status,submittedAt:date()}});
  res.json({submitted:true,status,photosCount:count,
   message:o.kind==='phone'?'Operator telefon orqali tabriklash xizmatining narxini kelishadi.':'Buyurtma qabul qilindi. Hamyon orqali to‘lov tasdiqlangach 14 soat ichida tayyorlanadi.'});
 }));
 app.get('/api/autotabrik/orders/:id/assets',auth,wrap(async(req,res)=>{
  const {o,failed}=await owned(req,res);if(failed)return;
  const assets=await images().find({orderId:o._id},{projection:{buffer:0}}).sort({createdAt:1}).toArray();
  res.set('Cache-Control','no-store').json({assets:assets.map(x=>({id:String(x._id),kind:x.kind}))});
 }));
 app.get('/api/autotabrik/assets/:id',auth,wrap(async(req,res)=>{
  const id=oid(req.params.id),item=id?await images().findOne({_id:id}):null;
  if(!item)return bad(res,404,'Fayl topilmadi');
  if(req.user.role!=='admin'&&String(req.user._id)!==String(item.owner))return bad(res,403,'Ruxsat yo‘q');
  res.set('Cache-Control','private, no-store');res.type('image/webp');
  res.send(Buffer.isBuffer(item.buffer)?item.buffer:Buffer.from(item.buffer.buffer||item.buffer));
 }));
 app.get('/api/autotabrik/admin/orders',auth,adm,wrap(async(req,res)=>{
  const orders=await archive().find({}).sort({createdAt:-1}).limit(70).toArray();
  const counts=await Promise.all(orders.map(o=>images().countDocuments({orderId:o._id,kind:'photo'})));
  res.set('Cache-Control','no-store').json({orders:orders.map((o,i)=>pack(o,counts[i]))});
 }));
 app.patch('/api/autotabrik/admin/orders/:id',auth,adm,wrap(async(req,res)=>{
  const id=oid(req.params.id),status=String(req.body.status||'');
  if(!id||!['in_progress','delivered','cancelled'].includes(status))
    return bad(res,400,'Noto‘g‘ri holat');
  const o=await archive().findOne({_id:id});if(!o)return bad(res,404,'Buyurtma topilmadi');
  if(status==='cancelled'&&['paid','in_progress','delivered'].includes(o.status))return bad(res,409,'To‘langan buyurtmani qaytarish tartibisiz bekor qilib bo‘lmaydi');
  if(['in_progress','delivered'].includes(status)&&!['paid','in_progress'].includes(o.status))
    return bad(res,409,'To‘lov tasdiqlanmasdan xizmat yakunlanmaydi');
  await archive().updateOne({_id:id},{$set:{status,updatedAt:date()}});
  res.json({ok:true,status});
 }));
};

'use strict';
require('dotenv').config();
const express=require('express'),path=require('path'),crypto=require('crypto'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),cookieParser=require('cookie-parser'),helmet=require('helmet'),rateLimit=require('express-rate-limit'),multer=require('multer'),sharp=require('sharp');
const {MongoClient,ObjectId}=require('mongodb');
const app=express();app.set('trust proxy',1);app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:{useDefaults:true,directives:{"default-src":["'self'"],"script-src":["'self'","https://telegram.org"],"style-src":["'self'","'unsafe-inline'","https://fonts.googleapis.com"],"font-src":["'self'","https://fonts.gstatic.com"],"img-src":["'self'","data:","blob:"],"connect-src":["'self'"]}}}));
app.use(express.json({limit:'120kb'}));app.use(express.urlencoded({extended:false}));app.use(cookieParser());
app.use('/api',(req,res,next)=>{if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.origin){try{if(new URL(req.headers.origin).host!==req.get('host'))return res.sendStatus(403)}catch(e){return res.sendStatus(403)}}next()});
const rate=rateLimit({windowMs:15*60000,limit:30,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Ko‘p urinish: keyinroq qayta urinib ko‘ring'}});
const wrap=f=>(req,res,next)=>Promise.resolve(f(req,res,next)).catch(next),bad=(res,n,s)=>res.status(n).json({error:s}),oid=s=>ObjectId.isValid(s)&&String(new ObjectId(s))===String(s)?new ObjectId(s):null;
let db=null,mongoClient=null,dbError='MongoDB hozir ulanmagan';const c=n=>db.collection(n),date=()=>new Date(),clean=(v,n=120)=>String(v||'').trim().slice(0,n);
const phone=v=>{let s=String(v||'').replace(/[\s()\-]/g,'');if(/^9\d{8}$/.test(s))s='+998'+s;else if(/^998\d{9}$/.test(s))s='+'+s;return /^\+998\d{9}$/.test(s)?s:null};
const pro=u=>!!(u&&u.proUntil&&new Date(u.proUntil)>date());
const showUser=u=>({id:String(u._id),name:u.name,phone:u.phone,bio:u.bio||'',avatarId:u.avatarId||null,role:u.role||'user',banned:!!u.banned,proUntil:u.proUntil||null,isPro:pro(u),partnerId:u.partnerId?String(u.partnerId):null,chatTtl:u.chatTtl||'view',anniversary:u.anniversary||null,createdAt:u.createdAt});
const showLetter=l=>({id:String(l._id),ownerId:String(l.owner),title:l.title,message:l.message,to:l.to,from:l.from,theme:l.theme,photoIds:l.photoIds||[],createdAt:l.createdAt});
const secret=process.env.JWT_SECRET||'';
function cookie(res,id){res.cookie('qalbim_session',jwt.sign({sub:String(id)},secret,{expiresIn:'30d'}),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:30*86400000,path:'/'})}
const ready=(req,res,next)=>db?next():bad(res,503,dbError);
const auth=wrap(async(req,res,next)=>{if(!db)return bad(res,503,dbError);let v;try{v=jwt.verify(req.cookies.qalbim_session||'',secret)}catch(e){return bad(res,401,'Tizimga kiring')}const id=oid(v.sub);req.user=id?await c('users').findOne({_id:id}):null;if(!req.user||req.user.banned)return bad(res,401,'Sessiya tugagan yoki hisob bloklangan');next()});
const adm=(req,res,next)=>req.user.role==='admin'?next():bad(res,403,'Admin huquqi kerak');
const colUser=()=>c('users');
app.get('/api/health',(req,res)=>res.json({status:'online',database:db?'connected':'not_configured',version:'1.0.0'}));
app.get('/api/config',wrap(async(req,res)=>{let x=db?await c('settings').findOne({_id:'public'}):null;res.json({telegram:x?.telegram||process.env.ADMIN_TELEGRAM_URL||'',dbReady:!!db})}));
app.post('/api/auth/register',rate,ready,wrap(async(req,res)=>{
 const p=phone(req.body.phone),name=clean(req.body.name,80),pw=String(req.body.password||'');
 if(!p||name.length<3||pw.length<8||pw.length>72)return bad(res,400,'Telefon, ism familiya va kamida 8 belgili parol kiriting');
 if(req.body.termsAccepted!==true||req.body.privacyAccepted!==true)return bad(res,400,'Shartlar va maxfiylik siyosatiga rozilik bering');
 const u={phone:p,name,passwordHash:await bcrypt.hash(pw,12),bio:'',role:'user',partnerId:null,proUntil:null,banned:false,chatTtl:'view',createdAt:date(),termsAt:date(),termsVersion:'2026-10-26',privacyVersion:'2026-10-26'};
 try{let v=await colUser().insertOne(u);u._id=v.insertedId}catch(e){if(e.code===11000)return bad(res,409,'Bu raqam mavjud');throw e}
 cookie(res,u._id);res.status(201).json({user:showUser(u)});
}));
app.post('/api/auth/login',rate,ready,wrap(async(req,res)=>{
 const p=req.body.phone==='admin'?'admin':phone(req.body.phone),u=p?await colUser().findOne({phone:p}):null;
 if(!u||u.banned||!await bcrypt.compare(String(req.body.password||''),u.passwordHash))return bad(res,401,'Telefon yoki parol noto‘g‘ri');
 cookie(res,u._id);res.json({user:showUser(u)});
}));
app.post('/api/auth/logout',(req,res)=>{res.clearCookie('qalbim_session',{sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/'});res.json({ok:true})});
app.get('/api/me',auth,wrap(async(req,res)=>{let x=req.user.partnerId?await colUser().findOne({_id:req.user.partnerId}):null;res.json({user:showUser(req.user),partner:x?{id:String(x._id),name:x.name,avatarId:x.avatarId||null}:null})}));
app.get('/api/users/:id',ready,wrap(async(req,res)=>{let id=oid(req.params.id),u=id?await colUser().findOne({_id:id}):null;if(!u||u.banned)return bad(res,404,'Profil topilmadi');res.json({profile:{id:String(u._id),name:u.name,bio:u.bio||'',avatarId:u.avatarId||null,createdAt:u.createdAt}})}));
app.patch('/api/me',auth,wrap(async(req,res)=>{
 let v={};if('name'in req.body){v.name=clean(req.body.name,80);if(v.name.length<3)return bad(res,400,'Ism juda qisqa')}
 if('bio'in req.body)v.bio=clean(req.body.bio,240);
 if('anniversary'in req.body){
   const value=String(req.body.anniversary||'');
   if(value==='')v.anniversary=null;
   else{
     const dt=/^\d{4}-\d{2}-\d{2}$/.test(value)?new Date(value+'T00:00:00Z'):new Date('invalid');
     if(!Number.isFinite(dt.getTime())||dt.toISOString().slice(0,10)!==value||dt.getTime()>Date.now())return bad(res,400,'Sanani to‘g‘ri kiriting');
     v.anniversary=value;
   }
 }
 if('chatTtl'in req.body){if(!['view','6h','12h','18h','24h'].includes(req.body.chatTtl))return bad(res,400,'Muddat noto‘g‘ri');v.chatTtl=req.body.chatTtl}
 if(Object.keys(v).length)await colUser().updateOne({_id:req.user._id},{$set:v});res.json({ok:true});
}));
app.post('/api/me/password',auth,rate,wrap(async(req,res)=>{let s=String(req.body.newPassword||'');if(s.length<8||s.length>72)return bad(res,400,'Parol 8–72 belgili bo‘lsin');if(!await bcrypt.compare(String(req.body.oldPassword||''),req.user.passwordHash))return bad(res,403,'Eski parol noto‘g‘ri');await colUser().updateOne({_id:req.user._id},{$set:{passwordHash:await bcrypt.hash(s,12)}});res.json({ok:true})}));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024},fileFilter:(req,file,cb)=>cb(null,['image/jpeg','image/png','image/webp'].includes(file.mimetype))});
app.post('/api/photos',auth,upload.single('image'),wrap(async(req,res)=>{
 if(!req.file)return bad(res,400,'JPG/PNG/WEBP rasm (5 MB gacha) tanlang');
 let kind=req.body.kind==='avatar'?'avatar':'letter';
 if(kind==='letter'&&await c('photos').countDocuments({owner:req.user._id,kind:'letter'})>=15)return bad(res,400,'15 ta rasm chegarasi');
 let buffer;try{buffer=await sharp(req.file.buffer,{limitInputPixels:15000000}).rotate().resize({width:1000,height:1000,fit:'inside',withoutEnlargement:true}).webp({quality:72}).toBuffer()}catch(e){return bad(res,400,'Rasm fayli yaroqsiz')}
 let doc={owner:req.user._id,kind,private:kind==='letter'&&String(req.body.private)==='true',buffer,createdAt:date()};
 let r=await c('photos').insertOne(doc);
 if(kind==='avatar'){let old=oid(req.user.avatarId);await colUser().updateOne({_id:req.user._id},{$set:{avatarId:String(r.insertedId)}});if(old)await c('photos').deleteOne({_id:old,owner:req.user._id,kind:'avatar'})}
 res.status(201).json({id:String(r.insertedId),private:doc.private});
}));
app.get('/api/photos/:id',wrap(async(req,res)=>{
 if(!db)return bad(res,503,dbError);let id=oid(req.params.id),p=id?await c('photos').findOne({_id:id}):null;if(!p)return bad(res,404,'Rasm topilmadi');
 if(p.private){let u=null;try{let token=jwt.verify(req.cookies.qalbim_session||'',secret);u=await colUser().findOne({_id:oid(token.sub)})}catch(e){}
 if(!u||u.banned||(!u._id.equals(p.owner)&&!pro(u)))return bad(res,403,'Rasm faqat Pro foydalanuvchilarga ochiq')}
 res.set('Content-Type','image/webp');res.set('Cache-Control',p.private?'private, no-store':'public, max-age=300');res.send(Buffer.isBuffer(p.buffer)?p.buffer:Buffer.from(p.buffer.buffer||p.buffer));
}));
app.get('/api/letters/mine',auth,wrap(async(req,res)=>{let v=await c('letters').find({owner:req.user._id}).sort({createdAt:-1}).limit(60).toArray();res.json({letters:v.map(showLetter)})}));
app.post('/api/letters',auth,wrap(async(req,res)=>{
 let title=clean(req.body.title,90),message=clean(req.body.message,1400),to=clean(req.body.to,80),from=clean(req.body.from,80),theme=Number(req.body.theme),ids=Array.isArray(req.body.photoIds)?req.body.photoIds:[];ids=[...new Set(ids)].slice(0,4);
 if(!title||message.length<5||!to||!from||!Number.isInteger(theme)||theme<1||theme>18)return bad(res,400,'Maktubni to‘liq to‘ldiring');
 if(ids.some(x=>!oid(x))||(ids.length&&await c('photos').countDocuments({_id:{$in:ids.map(oid)},owner:req.user._id})!==ids.length))return bad(res,403,'Rasmlar sizga tegishli bo‘lishi kerak');
 let letter={owner:req.user._id,title,message,to,from,theme,photoIds:ids,createdAt:date(),updatedAt:date()};let v=await c('letters').insertOne(letter);letter._id=v.insertedId;res.status(201).json({letter:showLetter(letter)});
}));
app.get('/api/letters/:id',ready,wrap(async(req,res)=>{
 let id=oid(req.params.id),l=id?await c('letters').findOne({_id:id}):null;if(!l)return bad(res,404,'Maktub topilmadi');
 let counts=await c('reactions').aggregate([{$match:{letterId:id}},{$group:{_id:'$emoji',count:{$sum:1}}}]).toArray();
 res.json({letter:showLetter(l),reactions:Object.fromEntries(counts.map(x=>[x._id,x.count]))});
}));
app.patch('/api/letters/:id',auth,wrap(async(req,res)=>{
 let id=oid(req.params.id),v={updatedAt:date()};if(!id)return bad(res,404,'Topilmadi');
 for(let k of ['title','message','to','from'])if(k in req.body)v[k]=clean(req.body[k],k==='message'?1400:90);
 if('theme'in req.body){let t=Number(req.body.theme);if(t<1||t>18||!Number.isInteger(t))return bad(res,400,'Shablon noto‘g‘ri');v.theme=t}
 if('photoIds'in req.body){let ids=req.body.photoIds;if(!Array.isArray(ids)||ids.length>4||ids.some(x=>!oid(x)))return bad(res,400,'Rasmlar noto‘g‘ri');ids=[...new Set(ids)];if(ids.length&&await c('photos').countDocuments({_id:{$in:ids.map(oid)},owner:req.user._id})!==ids.length)return bad(res,403,'Begona rasm');v.photoIds=ids}
 let r=await c('letters').updateOne({_id:id,owner:req.user._id},{$set:v});if(!r.matchedCount)return bad(res,404,'Maktub topilmadi');res.json({ok:true});
}));
app.delete('/api/letters/:id',auth,wrap(async(req,res)=>{let id=oid(req.params.id);if(!id)return bad(res,404,'Topilmadi');await c('letters').deleteOne({_id:id,owner:req.user._id});await c('reactions').deleteMany({letterId:id});res.json({ok:true})}));
app.post('/api/letters/:id/react',auth,wrap(async(req,res)=>{
 let id=oid(req.params.id),emoji=String(req.body.emoji||'');if(!id||!['❤️','🥹','😍','💌','🌹','😘'].includes(emoji))return bad(res,400,'Reaksiya noto‘g‘ri');
 if(!await c('letters').findOne({_id:id}))return bad(res,404,'Maktub topilmadi');await c('reactions').updateOne({letterId:id,userId:req.user._id},{$set:{emoji,updatedAt:date()}},{upsert:true});res.json({ok:true});
}));
app.post('/api/pairs/invite',auth,wrap(async(req,res)=>{
 if(req.user.partnerId)return bad(res,409,'Siz juftlikka allaqachon bog‘langansiz');
 let token=crypto.randomBytes(20).toString('hex'),hash=crypto.createHash('sha256').update(token).digest('hex');
 await c('invites').insertOne({owner:req.user._id,hash,expiresAt:new Date(Date.now()+72*3600000),createdAt:date()});res.json({token});
}));
app.get('/api/pairs/invite/:token',ready,wrap(async(req,res)=>{
 let hash=crypto.createHash('sha256').update(String(req.params.token)).digest('hex'),inv=await c('invites').findOne({hash,expiresAt:{$gt:date()}});
 if(!inv)return bad(res,404,'Taklif eskirgan');let user=await colUser().findOne({_id:inv.owner});res.json({from:user?.name||'Foydalanuvchi'});
}));
app.post('/api/pairs/accept',auth,wrap(async(req,res)=>{
 if(req.user.partnerId)return bad(res,409,'Siz allaqachon juftlikka ulangan');let hash=crypto.createHash('sha256').update(String(req.body.token||'')).digest('hex');
 let inv=await c('invites').findOneAndDelete({hash,expiresAt:{$gt:date()}});if(!inv)return bad(res,404,'Taklif muddati tugagan');
 if(inv.owner.equals(req.user._id))return bad(res,400,'O‘zingizga ulana olmaysiz');
 let other=await colUser().findOne({_id:inv.owner,partnerId:null,banned:false});if(!other)return bad(res,409,'Taklif egasi boshqa juftlikka ulangan');
 let a=await colUser().updateOne({_id:req.user._id,partnerId:null},{$set:{partnerId:inv.owner}});if(!a.modifiedCount)return bad(res,409,'Ulanish imkonsiz');
 let b=await colUser().updateOne({_id:inv.owner,partnerId:null},{$set:{partnerId:req.user._id}});if(!b.modifiedCount){await colUser().updateOne({_id:req.user._id,partnerId:inv.owner},{$set:{partnerId:null}});return bad(res,409,'Ulanish imkonsiz')}
 await c('invites').deleteMany({owner:inv.owner});res.json({ok:true});
}));
app.post('/api/pairs/disconnect',auth,wrap(async(req,res)=>{
 let partner=req.user.partnerId;if(!partner)return res.json({ok:true});
 await colUser().updateOne({_id:req.user._id},{$set:{partnerId:null}});await colUser().updateOne({_id:partner,partnerId:req.user._id},{$set:{partnerId:null}});
 await c('messages').deleteMany({$or:[{from:req.user._id,to:partner},{from:partner,to:req.user._id}]});res.json({ok:true});
}));
const ttl={view:7*86400000,'6h':6*3600000,'12h':12*3600000,'18h':18*3600000,'24h':24*3600000};
app.get('/api/chats',auth,wrap(async(req,res)=>{
 let p=req.user.partnerId?await colUser().findOne({_id:req.user.partnerId}):null;
 res.json({chats:p?[{id:String(p._id),name:p.name,avatarId:p.avatarId||null}]:[]});
}));
app.post('/api/chats/messages',auth,wrap(async(req,res)=>{
 let to=oid(req.body.to),msg=clean(req.body.text,1600),mode=String(req.body.mode||req.user.chatTtl||'view');
 if(!to||!req.user.partnerId||!to.equals(req.user.partnerId))return bad(res,403,'Juftingiz bilan bog‘laning');
 if(!msg||!ttl[mode])return bad(res,400,'Xabar yoki o‘chish muddati noto‘g‘ri');
 let x=await c('messages').insertOne({from:req.user._id,to,text:msg,mode,createdAt:date(),expiresAt:new Date(Date.now()+ttl[mode])});res.status(201).json({id:String(x.insertedId)});
}));
app.get('/api/chats/messages',auth,wrap(async(req,res)=>{
 let other=oid(req.query.with),visit=clean(req.query.visit,90);
 if(!other||!req.user.partnerId||!other.equals(req.user.partnerId))return bad(res,403,'Juftingiz topilmadi');
 if(!/^[a-zA-Z0-9-]{12,90}$/.test(visit))return bad(res,400,'Chat sessiyasi noto‘g‘ri');
 await c('messages').deleteMany({to:req.user._id,mode:'view',readVisit:{$exists:true,$ne:visit}});
 await c('messages').updateMany({to:req.user._id,mode:'view',readVisit:{$exists:false},expiresAt:{$gt:date()}},{$set:{readVisit:visit,readAt:date()}});
 let list=await c('messages').find({$or:[{from:req.user._id,to:other},{from:other,to:req.user._id}],expiresAt:{$gt:date()}}).sort({createdAt:-1}).limit(100).toArray();
 res.json({messages:list.reverse().filter(m=>m.mode!=='view'||m.from.equals(req.user._id)||m.readVisit===visit).map(m=>({id:String(m._id),from:String(m.from),text:m.text,mode:m.mode,createdAt:m.createdAt}))});
}));
app.post('/api/chats/leave',auth,wrap(async(req,res)=>{
 let visit=clean(req.body.visit,90);if(visit)await c('messages').deleteMany({to:req.user._id,mode:'view',readVisit:visit});res.json({ok:true});
}));
app.post('/api/reports',auth,wrap(async(req,res)=>{
 let reason=clean(req.body.reason,600);if(reason.length<10)return bad(res,400,'Shikoyat sababini yozing');
 await c('reports').insertOne({reporter:req.user._id,type:['chat','letter','user'].includes(req.body.type)?req.body.type:'user',target:clean(req.body.target,90),reason,status:'new',createdAt:date()});res.json({ok:true});
}));
app.get('/api/admin/stats',auth,adm,wrap(async(req,res)=>{
 let names=['users','letters','messages','photos','reports'],totals=await Promise.all(names.map(n=>c(n).countDocuments()));
 res.json({...Object.fromEntries(names.map((n,i)=>[n,totals[i]])),pro:await colUser().countDocuments({proUntil:{$gt:date()}}),couples:Math.floor(await colUser().countDocuments({partnerId:{$ne:null}})/2)});
}));
app.get('/api/admin/users',auth,adm,wrap(async(req,res)=>{
 let q=clean(req.query.q,80),all=await colUser().find({}).sort({createdAt:-1}).limit(300).toArray();
 res.json({users:all.filter(x=>!q||(x.name+' '+x.phone).toLowerCase().includes(q.toLowerCase())).slice(0,100).map(showUser)});
}));
app.patch('/api/admin/users/:id',auth,adm,wrap(async(req,res)=>{
 let id=oid(req.params.id),u=id?await colUser().findOne({_id:id}):null;if(!u)return bad(res,404,'Topilmadi');let v={};
 if(u.role==='admin'&&!id.equals(req.user._id))return bad(res,403,'Boshqa admin huquqini o‘zgartirish mumkin emas');
 if('name'in req.body){v.name=clean(req.body.name,80);if(v.name.length<3)return bad(res,400,'Ism qisqa')}
 if('banned'in req.body){if(id.equals(req.user._id))return bad(res,403,'O‘zingizni bloklay olmaysiz');v.banned=!!req.body.banned}
 if('proDays'in req.body){let n=Number(req.body.proDays);if(![0,3,7].includes(n))return bad(res,400,'3 kun / 7 kun / bekor qilish');v.proUntil=n?new Date(Math.max(Date.now(),u.proUntil?new Date(u.proUntil).getTime():0)+n*86400000):null}
 if(Object.keys(v).length)await colUser().updateOne({_id:id},{$set:v});res.json({ok:true});
}));
app.delete('/api/admin/users/:id',auth,adm,wrap(async(req,res)=>{
 let id=oid(req.params.id),u=id?await colUser().findOne({_id:id}):null;if(!u||u.role==='admin')return bad(res,403,'Admin o‘chirilmaydi');
 await Promise.all([colUser().deleteOne({_id:id}),colUser().updateMany({partnerId:id},{$set:{partnerId:null}}),c('photos').deleteMany({owner:id}),c('letters').deleteMany({owner:id}),c('messages').deleteMany({$or:[{from:id},{to:id}]}),c('reactions').deleteMany({userId:id}),c('invites').deleteMany({owner:id})]);res.json({ok:true});
}));
app.get('/api/admin/letters',auth,adm,wrap(async(req,res)=>{let l=await c('letters').find({}).sort({createdAt:-1}).limit(100).toArray();res.json({letters:l.map(showLetter)})}));
app.delete('/api/admin/letters/:id',auth,adm,wrap(async(req,res)=>{let id=oid(req.params.id);if(!id)return bad(res,404,'Topilmadi');await c('letters').deleteOne({_id:id});await c('reactions').deleteMany({letterId:id});res.json({ok:true})}));
app.get('/api/admin/reports',auth,adm,wrap(async(req,res)=>{let l=await c('reports').find({}).sort({createdAt:-1}).limit(100).toArray();res.json({reports:l.map(v=>({id:String(v._id),type:v.type,target:v.target,reason:v.reason,status:v.status,createdAt:v.createdAt}))})}));
app.patch('/api/admin/reports/:id',auth,adm,wrap(async(req,res)=>{let id=oid(req.params.id);if(!id)return bad(res,404,'Topilmadi');await c('reports').updateOne({_id:id},{$set:{status:'resolved'}});res.json({ok:true})}));
app.get('/api/admin/chats',auth,adm,wrap(async(req,res)=>{
 let a=await c('messages').aggregate([{$group:{_id:{from:'$from',to:'$to'},count:{$sum:1}}},{$limit:100}]).toArray();
 res.json({chats:a.map(x=>({from:String(x._id.from),to:String(x._id.to),count:x.count}))});
}));
app.get('/api/admin/config',auth,adm,wrap(async(req,res)=>{let v=await c('settings').findOne({_id:'public'});res.json({telegram:v?.telegram||process.env.ADMIN_TELEGRAM_URL||''})}));
app.patch('/api/admin/config',auth,adm,wrap(async(req,res)=>{let s=clean(req.body.telegram,120);if(s&&!/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,32}$/.test(s))return bad(res,400,'https://t.me/username formatida kiriting');await c('settings').updateOne({_id:'public'},{$set:{telegram:s}},{upsert:true});res.json({ok:true})}));

const integrations=require('./integrations')(app,{
 db:()=>db,mongoClient:()=>mongoClient,auth,adm,
 showUser,cookie,phone,clean,authRate:rate
});
const dir=path.join(__dirname,'public');app.use(express.static(dir,{extensions:['html']}));
app.get(['/l/:id','/invite/:token','/u/:id','/'],(req,res)=>res.sendFile(path.join(dir,'index.html')));
app.get('*',(req,res)=>res.sendFile(path.join(dir,'index.html')));
app.use((e,req,res,next)=>{console.error('Server error:',e.message);bad(res,e.code==='LIMIT_FILE_SIZE'?413:500,e.code==='LIMIT_FILE_SIZE'?'Rasm 5 MB dan katta':'Server xatosi')});
async function connect(){
 if(!process.env.MONGODB_URI){dbError='MongoDB sozlanmagan: Render Environment bo‘limida MONGODB_URI kerak';console.warn(dbError);return}
 try{
  const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:12000,maxPoolSize:10});await client.connect();mongoClient=client;db=client.db(process.env.MONGODB_DB||'qalbim');
  await Promise.all([colUser().createIndex({phone:1},{unique:true}),c('messages').createIndex({expiresAt:1},{expireAfterSeconds:0}),c('invites').createIndex({expiresAt:1},{expireAfterSeconds:0}),c('reactions').createIndex({letterId:1,userId:1},{unique:true}),c('letters').createIndex({owner:1}),c('photos').createIndex({owner:1})]);
  if(process.env.ADMIN_PASSWORD&&process.env.ADMIN_PHONE){
    const requestedPhone=process.env.ADMIN_PHONE==='admin'?'admin':phone(process.env.ADMIN_PHONE);
    const adminPassword=process.env.ADMIN_PASSWORD;
    if(!requestedPhone){console.error('ADMIN_PHONE not valid');}
    else if(adminPassword.length<12){console.warn('SECURITY: ADMIN_PASSWORD should be at least 12 characters; choose a unique strong password in Render.');}
    if(requestedPhone){
      const target=await colUser().findOne({phone:requestedPhone});
      if(target&&target.role!=='admin'){
        console.error('ADMIN_PHONE is already registered to a normal user. Refusing automatic privilege escalation. Choose a different admin number or use existing admin login.');
      }else if(target&&target.role==='admin'){
        const changes={};
        if(!await bcrypt.compare(adminPassword,target.passwordHash))changes.passwordHash=await bcrypt.hash(adminPassword,12);
        if(target.banned)changes.banned=false;
        if(Object.keys(changes).length)await colUser().updateOne({_id:target._id},{$set:changes});
        console.log('Admin login synchronized with configured environment.');
      }else{
        const legacy=await colUser().findOne({phone:'admin',role:'admin'});
        const fields={phone:requestedPhone,passwordHash:await bcrypt.hash(adminPassword,12),banned:false};
        if(legacy){
          await colUser().updateOne({_id:legacy._id},{$set:fields});
          console.log('Legacy administrator phone and password migrated to environment configuration.');
        }else{
          await colUser().insertOne({...fields,name:'Qalbim administrator',role:'admin',bio:'',partnerId:null,proUntil:null,chatTtl:'view',createdAt:date(),termsAt:date(),termsVersion:'2026-10-26',privacyVersion:'2026-10-26'});
          console.log('Administrator account provisioned from environment configuration.');
        }
      }
    }
  }dbError='';console.log('MongoDB connected');await integrations.start();
 }catch(e){dbError='MongoDB bilan bog‘lanish xatosi';console.error(dbError,e.message)}
}
app.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Qalbim server running'));
if(secret.length<32)console.error('Please configure secure JWT_SECRET');
connect();

import {onRequest} from 'firebase-functions/v2/https';
import {defineSecret} from 'firebase-functions/params';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore,Timestamp} from 'firebase-admin/firestore';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {getAdvice,RequestError} from './core.mjs';
initializeApp();const db=getFirestore(),key=defineSecret('GEMINI_API_KEY');
const egos=JSON.parse(readFileSync(new URL('./egos.json',import.meta.url),'utf8'));
const origin='https://amberang1.github.io';
export const alterAdvice=onRequest({region:'asia-southeast1',secrets:[key],invoker:'public',maxInstances:2,concurrency:10,memory:'256MiB',timeoutSeconds:35},async(req,res)=>{
 res.set('Cache-Control','no-store');res.set('Vary','Origin');
 if(req.headers.origin!==origin)return res.status(403).json({error:'Request not allowed.'});
 res.set('Access-Control-Allow-Origin',origin);res.set('Access-Control-Allow-Methods','POST, OPTIONS');res.set('Access-Control-Allow-Headers','Content-Type');
 if(req.method==='OPTIONS')return res.status(204).send('');
 if(req.method!=='POST')return res.status(405).json({error:'Use POST.'});
 if(!req.is('application/json')||Number(req.headers['content-length']||0)>20000||Buffer.byteLength(JSON.stringify(req.body||{}))>20000)return res.status(400).json({error:'Please shorten your message.'});
 try{
 const answer=await getAdvice(req.body,{egos,key:key.value(),model:process.env.GEMINI_MODEL||undefined,consumeQuota:async()=>{
 const now=Date.now(),day=new Date(now).toISOString().slice(0,10),hour=Math.floor(now/3600000),ip=createHash('sha256').update(req.ip||'unknown').digest('hex');
 const global=db.doc(`alterQuota/day-${day}`),visitor=db.doc(`alterQuota/ip-${ip}-${hour}`);
 await db.runTransaction(async tx=>{const [g,v]=await Promise.all([tx.get(global),tx.get(visitor)]);if((g.data()?.count||0)>=300)throw new RequestError(429,'Today’s replies have reached their limit. Try again tomorrow.');if((v.data()?.count||0)>=20)throw new RequestError(429,'You’ve made quite a few replies. Come back in an hour.');const expiresAt=Timestamp.fromMillis(now+172800000);tx.set(global,{count:(g.data()?.count||0)+1,expiresAt});tx.set(visitor,{count:(v.data()?.count||0)+1,expiresAt});});
 }});return res.json(answer);
 }catch(e){return res.status(e instanceof RequestError?e.status:500).json({error:e instanceof RequestError?e.message:'Couldn’t get a reply. Please try again.'});}
});

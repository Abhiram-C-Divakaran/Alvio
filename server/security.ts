import type { RequestHandler, ErrorRequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
export function rateLimit(limit:number,windowMs:number,scope:string,byUser=false):RequestHandler{
 const entries=new Map<string,{count:number;until:number}>();
 return(req,res,next)=>{const now=Date.now();for(const [key,v] of entries)if(v.until<=now)entries.delete(key);
 const keys=[`${scope}:ip:${req.ip}`,...(byUser&&req.userId!==undefined?[`${scope}:user:${req.userId}`]:[])];
 for(const key of keys){const value=entries.get(key);if((value&&value.count>=limit)||entries.size>10000){res.setHeader('Retry-After',String(Math.max(1,Math.ceil(((value?.until||now+windowMs)-now)/1000))));res.status(429).json({error:"You're sending requests too quickly. Try again in a moment.",code:'RATE_LIMITED'});return;}}
 for(const key of keys){const value=entries.get(key)||{count:0,until:now+windowMs};value.count++;entries.set(key,value)}next();};
}
export const securityHeaders:RequestHandler=(req,res,next)=>{
 req.requestId=randomUUID();res.setHeader('X-Request-ID',req.requestId);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');
 // Inline styles and worker evaluation are required by Monaco and the local teaching runner.
 if(process.env.NODE_ENV==='production')res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net; media-src 'self' blob: https:; worker-src 'self' blob:; connect-src 'self' https://raw.githack.com https://raw.githubusercontent.com https://cdn.jsdelivr.net https://emkc.org https://api.paiza.io; frame-ancestors 'none'; base-uri 'self'; object-src 'none'");
 const started=Date.now();res.on('finish',()=>{if(req.path.startsWith('/api/'))console.info(JSON.stringify({requestId:req.requestId,method:req.method,route:req.route?.path||req.path,status:res.statusCode,durationMs:Date.now()-started,userId:req.userId}))});next();
};
export function logFailure(req:{requestId?:string},kind:string){console.error(JSON.stringify({requestId:req.requestId,event:kind}));}
export const safeErrors:ErrorRequestHandler=(err,req,res,_next)=>{logFailure(req,'request_error');if(res.headersSent){res.end();return;}const status=err.type==='entity.too.large'?413:err instanceof SyntaxError?400:500;res.status(status).json({error:status===413?'Request is too large.':status===400?'Invalid request body.':'The service is temporarily unavailable.',code:'REQUEST_FAILED'});};
export function providerCancellation(res:any){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),60000);const close=()=>{if(!res.writableEnded)controller.abort();clearTimeout(timer)};res.once('close',close);return {signal:controller.signal,dispose:()=>{clearTimeout(timer);res.off('close',close)}};}

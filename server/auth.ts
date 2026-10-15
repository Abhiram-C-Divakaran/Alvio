import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import db from './db';
declare global { namespace Express { interface Request { userId: number; requestId: string } } }
export function authSecret(){const secret=process.env.JWT_SECRET;if(!secret||secret.length<32)throw new Error('JWT_SECRET must be configured with at least 32 characters.');return secret;}
export function signAuthToken(userId:number){return jwt.sign({},authSecret(),{subject:String(userId),algorithm:'HS256',expiresIn:'7d',issuer:'alvio',audience:'alvio-student'});}
export function verifyAuthToken(token:string){const value=jwt.verify(token,authSecret(),{algorithms:['HS256'],issuer:'alvio',audience:'alvio-student'});if(typeof value==='string'||typeof value.sub!=='string'||!/^\d+$/.test(value.sub))throw Error('Invalid subject');const id=Number(value.sub);if(!Number.isSafeInteger(id)||id<1||!db.prepare('SELECT id FROM users WHERE id=?').get(id))throw Error('Invalid account');return id;}
export const requireAuth:RequestHandler=(req,res,next)=>{try{const match=/^Bearer ([^\s]+)$/.exec(req.headers.authorization||'');if(!match)throw Error();req.userId=verifyAuthToken(match[1]);next();}catch{res.status(401).json({error:'Please sign in again.',code:'UNAUTHORIZED'});}};
export function publicUser(user:any){return {id:String(user.id),name:user.name,email:user.email,xp:user.xp,level:user.level,avatar:user.avatar_url||undefined,createdAt:user.created_at,settings:{theme:'dark',voiceEnabled:false,animationSpeed:1,notifications:true}};}

import type {Data} from './coffee';
type Config={url:string;key:string};
type Auth={access_token?:string;user?:{id:string}};
type Snapshot={data:Data;revision:number};
let token='';let userId='';
// Kept in memory: switching tabs must not reset the last revision we have read.
const revisions=new Map<string,number>();
export function isSigned(){return !!token;}
export function revision(){return revisions.get(userId)||0;}
const defaults:Config={url:'https://mjguqnfhqaixyiqdphaj.supabase.co',key:'sb_publishable_m9VkFRG5GtpvmuYkz3E2Qg_ZyezZmRc'};
export function config():Config {return JSON.parse(localStorage.getItem('savia-cloud')||JSON.stringify(defaults));}
export function configure(url:string,key:string){const u=new URL(url);if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co'))throw new Error('Introduce la URL https de tu proyecto Supabase');localStorage.setItem('savia-cloud',JSON.stringify({url:u.origin,key}));logout();revisions.clear();}
async function request<T>(path:string,body?:unknown,method='POST'):Promise<T>{
 const c=config();if(!c.url||!c.key)throw new Error('Configura Supabase primero');
 const response=await fetch(c.url+path,{method,headers:{apikey:c.key,...(token?{Authorization:`Bearer ${token}`}:{ }),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const value:unknown=await response.json();
 if(!response.ok){const error=value as {msg?:string;message?:string;error_description?:string};throw new Error(error.msg||error.message||error.error_description||'No se pudo conectar');}
 return value as T;
}
export async function login(email:string,password:string,signup=false){const r=await request<Auth>(signup?'/auth/v1/signup':'/auth/v1/token?grant_type=password',{email,password});token=r.access_token||'';userId=r.user?.id||'';return !!token;}
export function logout(){token='';userId='';}
export async function pull(){if(!token)throw new Error('Inicia sesión primero');const rows=await request<Snapshot[]>('/rest/v1/notebooks?select=data,revision',undefined,'GET');revisions.set(userId,rows[0]?.revision||0);return rows[0];}
export async function push(data:Data,expectedRevision:number){if(!token)throw new Error('Inicia sesión primero');const next=await request<number>('/rest/v1/rpc/save_notebook',{payload:data,expected_revision:expectedRevision});revisions.set(userId,next);return next;}

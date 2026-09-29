export type Bean = { id:string; name:string; roaster:string; origin:string; producer:string; variety:string; process:string; altitude:string; notes:string; roastDate:string };
export type Grinder = { id:string; name:string; unit:string; notes:string };
export type Recipe = { id:string; grinderId?:string; grinderUnit?:string; sourceRecipeId?:string; beanId:string; date:string; method:string; dose:number; water:number; output:number; seconds:number; temperature:number; grinder:string; clicks:number; score:number; acidity:number; sweetness:number; body:number; finish:number; notes:string };
export type Data = { version:1; beans:Bean[]; recipes:Recipe[]; grinders?:Grinder[] };
export const empty:Data={version:1,beans:[],recipes:[]};
export const methods=['V60','AeroPress','Espresso','Chemex','Prensa francesa','Otro'];
export const ratio=(r:Recipe)=>((r.method==='Espresso'?r.output:r.water)/r.dose).toFixed(1);
export const duration=(s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
export const demo:Data={version:1,beans:[
{id:'b1',name:'Wush Wush',roaster:'Nomad Coffee',origin:'Colombia · Tolima',producer:'Finca El Paraíso',variety:'Wush Wush',process:'Anaeróbico',altitude:'1.850',notes:'Melocotón, jazmín, miel',roastDate:'2026-09-18'},
{id:'b2',name:'Bombe',roaster:'Hola Coffee',origin:'Etiopía · Sidama',producer:'Estación Bombe',variety:'Heirloom',process:'Lavado',altitude:'1.950',notes:'Bergamota, té negro, limón',roastDate:'2026-09-15'},
{id:'b3',name:'La Esperanza',roaster:'Ineffable Coffee',origin:'Guatemala · Huehuetenango',producer:'Finca La Esperanza',variety:'Bourbon',process:'Natural',altitude:'1.700',notes:'Chocolate, ciruela, caramelo',roastDate:'2026-09-12'}],recipes:[
{id:'r1',beanId:'b1',date:'2026-09-29',method:'V60',dose:15,water:250,output:215,seconds:165,temperature:93,grinder:'Comandante C40',clicks:16,score:9,acidity:8,sweetness:9,body:6,finish:9,notes:'Bloom de 45 g durante 40 s. Dos vertidos hasta 150 g y 250 g. Una taza floral, muy dulce y con un final largo.'},
{id:'r2',beanId:'b2',date:'2026-09-28',method:'AeroPress',dose:16,water:240,output:210,seconds:120,temperature:92,grinder:'Comandante C40',clicks:20,score:8,acidity:8,sweetness:7,body:7,finish:8,notes:'Inmersión de 90 s y presión suave durante 30 s. Limpio y cítrico.'},
{id:'r3',beanId:'b3',date:'2026-09-27',method:'Espresso',dose:18,water:0,output:38,seconds:29,temperature:94,grinder:'Niche Zero',clicks:14,score:8.5,acidity:6,sweetness:8,body:9,finish:8,notes:'Textura sedosa, caramelo y chocolate.'},
{id:'r4',beanId:'b1',date:'2026-09-26',method:'V60',dose:15,water:250,output:212,seconds:180,temperature:95,grinder:'Comandante C40',clicks:14,score:7,acidity:7,sweetness:6,body:7,finish:6,notes:'Un poco seco al final. Probar menos temperatura y molienda más gruesa.'}]};
// Repository boundary: replace these functions with an API adapter when adding sync.
export function readData():Data {const raw=localStorage.getItem('savia-data-v1'); if(!raw)return empty;const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.beans)||!Array.isArray(data.recipes))throw new Error('Formato de datos no reconocido');return data;}
export function writeData(data:Data){localStorage.setItem('savia-data-v1',JSON.stringify(data));}
export function download(data:Data,format:'json'|'csv'){
 const cell=(v:unknown)=>'"'+String(v??'').replace(/^[=+@\-]/,"'$&").replaceAll('"','""')+'"';
 const rows=data.recipes.map(r=>({...r,cafe:data.beans.find(b=>b.id===r.beanId)?.name,ratio:ratio(r)}));
 const keys=rows.length?[...new Set(rows.flatMap(row=>Object.keys(row)))]:['id','beanId','date','method','dose','water','output','seconds','temperature','grinder','clicks','score','acidity','sweetness','body','finish','notes','cafe','ratio'];
 const content=format==='json'?JSON.stringify(data,null,2):'\uFEFF'+[keys.map(cell).join(','),...rows.map(r=>keys.map(k=>cell(r[k as keyof typeof r])).join(','))].join('\r\n');
 const url=URL.createObjectURL(new Blob([content],{type:format==='json'?'application/json':'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`savia-${new Date().toISOString().slice(0,10)}.${format}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// Additive fields keep existing notebooks and cloud snapshots compatible.
export const localDate=()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
export function repeatRecipe(source:Recipe):Recipe {
 return {...source,id:crypto.randomUUID(),sourceRecipeId:source.id,date:localDate(),score:5,acidity:5,sweetness:5,body:5,finish:5};
}
export function sameGrinder(a:Recipe,b:Recipe){
 return (a.grinderId&&b.grinderId?a.grinderId===b.grinderId:a.grinder.trim().toLowerCase()===b.grinder.trim().toLowerCase())&&(a.grinderUnit||'ajuste')===(b.grinderUnit||'ajuste');
}

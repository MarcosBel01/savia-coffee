'use client';
import {useState} from 'react';
import {Bean,Recipe,ratio,duration,sameGrinder} from '@/lib/coffee';
const delta=(a:number,b:number,unit='')=>{const d=Math.round((b-a)*100)/100;return `${d>0?'+':''}${d}${unit}`};
export default function RecipeComparison({recipes,beans,onRepeat}:{recipes:Recipe[];beans:Bean[];onRepeat:(r:Recipe)=>void}){
 const [left,setLeft]=useState('');const [right,setRight]=useState('');
 const a=recipes.find(r=>r.id===left)||recipes[0];
 const b=recipes.find(r=>r.id===right&&r.id!==a?.id)||recipes.find(r=>r.id!==a?.id&&r.beanId===a?.beanId&&r.method===a?.method)||recipes.find(r=>r.id!==a?.id);
 const name=(r:Recipe)=>beans.find(bean=>bean.id===r.beanId)?.name||'Café eliminado';
 const label=(r:Recipe)=>`${name(r)} · ${r.method} · ${r.date} · ${r.score}/10 · ${r.temperature}°C / ${r.clicks}`;
 const comparable=!!a&&!!b&&a.beanId===b.beanId&&a.method===b.method;
 return <section className="panel full comparison"><span className="eyebrow">UNA VARIABLE CADA VEZ</span><h2>Comparar dos tazas</h2><p>Elige una referencia A y una extracción B para ver qué cambió. La selección respeta los filtros de arriba.</p>
 {recipes.length<2?<p>Necesitas al menos dos extracciones en esta selección. Repite una receta o amplía los filtros.</p>:a&&b&&<><div className="form-grid">{(['A','B'] as const).map(side=><label key={side}>Taza {side}<select value={side==='A'?a.id:b.id} onChange={e=>side==='A'?setLeft(e.target.value):setRight(e.target.value)}>{recipes.filter(r=>side==='A'||r.id!==a.id).map((r,i)=><option key={r.id} value={r.id}>{i+1}. {label(r)}</option>)}</select></label>)}</div>
 <div className="comparison-summary"><strong>{delta(a.score,b.score)} puntos en B</strong><span>{comparable?'Mismo café y método':'Café o método distintos: interpreta las diferencias con cautela.'}</span></div>
 <div className="table-wrap" role="region" aria-label="Diferencias entre taza A y taza B" tabIndex={0}><table><thead><tr><th>Parámetro</th><th>Taza A</th><th>Taza B</th><th>Cambio B − A</th></tr></thead><tbody>
 {([
 ['Café',name(a),name(b),a.beanId===b.beanId?'Igual':'Distinto'],
 ['Método',a.method,b.method,a.method===b.method?'Igual':'Distinto'],
 ['Dosis',`${a.dose} g`,`${b.dose} g`,delta(a.dose,b.dose,' g')],
 ['Agua añadida',a.method==='Espresso'?'—':`${a.water} g`,b.method==='Espresso'?'—':`${b.water} g`,a.method!=='Espresso'&&b.method!=='Espresso'?delta(a.water,b.water,' g'):'—'],
 ['Bebida obtenida',`${a.output} g`,`${b.output} g`,delta(a.output,b.output,' g')],
 ['Ratio',`1:${ratio(a)}`,`1:${ratio(b)}`,(a.method==='Espresso')===(b.method==='Espresso')?delta(Number(ratio(a)),Number(ratio(b))):'Bases distintas'],
 ['Temperatura',`${a.temperature} °C`,`${b.temperature} °C`,delta(a.temperature,b.temperature,' °C')],
 ['Tiempo',duration(a.seconds),duration(b.seconds),delta(a.seconds,b.seconds,' s')],
 ['Molino',a.grinder,b.grinder,sameGrinder(a,b)?'Mismo perfil / escala':'No equiparables'],
 ['Ajuste',`${a.clicks} ${a.grinderUnit||''}`,`${b.clicks} ${b.grinderUnit||''}`,sameGrinder(a,b)?delta(a.clicks,b.clicks):'No comparable'],
 ['Puntuación',`${a.score}/10`,`${b.score}/10`,delta(a.score,b.score)],
 ...(['acidity','sweetness','body','finish'] as const).map((k,i)=>[['Acidez','Dulzor','Cuerpo','Postgusto'][i],String(a[k]),String(b[k]),delta(a[k],b[k])])
 ]).map(([title,av,bv,d])=><tr key={title} className={av!==bv?'changed':''}><th scope="row">{title}</th><td>{av}</td><td>{bv}</td><td>{d}</td></tr>)}
 </tbody></table></div><div className="comparison-notes">{[a,b].map((r,i)=><div key={r.id}><h3>Notas de la taza {i?'B':'A'}</h3><p>{r.notes||'Sin notas'}</p><button className="button secondary" onClick={()=>onRepeat(r)}>Repetir taza {i?'B':'A'}</button></div>)}</div><p className="table-hint">Las filas resaltadas muestran diferencias. Dos tazas no demuestran una causa; cambia una variable y repite la prueba. Un ajuste mayor no implica la misma molienda entre molinos.</p></>}
 </section>
}

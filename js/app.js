import { LEVELS } from '../data/levels.js';
import { loadState, saveState } from './state.js';
import { getRank, getNextXP } from './xp.js';
const state=loadState();
const $=s=>document.querySelector(s);
function render(){const rank=getRank(state.xp);const next=getNextXP(state.xp);$('#rank').textContent=rank;$('#xp').textContent=state.xp+' XP';$('#next').textContent=next?next+' XP':'MAX';$('#fill').style.width=next?Math.min(100,state.xp/next*100)+'%':'100%';$('#count').textContent=state.completedLevels.length+' / 6';$('#levels').innerHTML=LEVELS.map(l=>{const unlocked=l.id===1||state.completedLevels.includes(l.id-1);return '<button class="level '+(unlocked?'unlocked':'')+'" '+(unlocked?'':'disabled')+'><span class="num">LEVEL '+l.id+'</span><span class="icon">'+(unlocked?l.icon:'🔒')+'</span><h4>'+l.title+'</h4><p>'+l.description+'</p></button>'}).join('')}
function toast(message){const e=$('#toast');e.textContent=message;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2000)}
$('#enter').onclick=()=>{$('#path').scrollIntoView({behavior:'smooth'});toast('Welcome, Knowledge Engineer.')};
document.querySelectorAll('[data-soon]').forEach(b=>b.onclick=()=>toast(b.dataset.soon+' is coming in a future release.'));
render();

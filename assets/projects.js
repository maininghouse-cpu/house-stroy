(function(){
const KEY='house-stroy-projects-v2';
const defaults=[{"id": "forest-120", "name": "Лесной 120", "description": "Лаконичный одноэтажный дом для спокойной загородной жизни.", "price": 8900000, "totalArea": 120, "livingArea": 92, "floors": 1, "bedrooms": 3, "cover": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85", "images": [], "threeD": [], "plans": [], "facades": []}, {"id": "scandi-165", "name": "Сканди 165", "description": "Светлые пространства и большая общая зона для семьи.", "price": 11400000, "totalArea": 165, "livingArea": 132, "floors": 2, "bedrooms": 4, "cover": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85", "images": [], "threeD": [], "plans": [], "facades": []}, {"id": "residence-210", "name": "Резиденция 210", "description": "Просторная архитектура и продуманные приватные зоны.", "price": 15800000, "totalArea": 210, "livingArea": 168, "floors": 2, "bedrooms": 4, "cover": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85", "images": [], "threeD": [], "plans": [], "facades": []}];
function get(){try{const x=JSON.parse(localStorage.getItem(KEY));return Array.isArray(x)?x:defaults}catch(e){return defaults}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x))}
window.HouseProjects={get,save,KEY};
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function money(n){return Number(n||0).toLocaleString('ru-RU')+' ₽'}
function card(p){
const slides=[p.cover,...(p.images||[])].filter(Boolean);
const unique=[...new Set(slides)];
const gallery=unique.length?unique:[p.cover].filter(Boolean);
return `<article class="card project-card"><div class="card-slider" data-slider data-index="0"><a class="slide-link" href="project.html?id=${encodeURIComponent(p.id)}"><img class="slide-image" src="${esc(gallery[0]||'')}" alt="${esc(p.name)}"></a>${gallery.length>1?`<button class="slide-arrow prev" type="button" aria-label="Предыдущее фото">‹</button><button class="slide-arrow next" type="button" aria-label="Следующее фото">›</button><span class="slide-count">1 / ${gallery.length}</span>`:''}</div><div class="card-body"><a class="project-title-link" href="project.html?id=${encodeURIComponent(p.id)}"><h3>${esc(p.name)}</h3></a><p>${esc(p.description)}</p><div class="meta"><span>${p.totalArea||0} м² общая · ${p.livingArea||0} м² жилая</span><b class="price">${money(p.price)}</b></div><div class="project-extra">${p.floors||1} этаж(а) · ${p.bedrooms||0} спальни</div><a class="project-open" href="project.html?id=${encodeURIComponent(p.id)}">Смотреть проект →</a></div></article>`
}
function setupSliders(){
document.querySelectorAll('[data-slider]').forEach(slider=>{
if(slider.dataset.ready)return;slider.dataset.ready='1';
const card=slider.closest('.project-card');
const id=new URL(card.querySelector('.slide-link').href).searchParams.get('id');
const project=get().find(x=>x.id===id);if(!project)return;
const pics=[...new Set([project.cover,...(project.images||[])].filter(Boolean))];if(!pics.length)return;
let index=0,startX=0;
const image=slider.querySelector('.slide-image'),count=slider.querySelector('.slide-count');
const show=n=>{index=(n+pics.length)%pics.length;image.src=pics[index];if(count)count.textContent=`${index+1} / ${pics.length}`;slider.dataset.index=String(index)};
slider.querySelector('.prev')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(index-1)});
slider.querySelector('.next')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();show(index+1)});
slider.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX},{passive:true});
slider.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>40)show(index+(dx<0?1:-1))},{passive:true});
});
}
function render(){const list=get();document.querySelectorAll('[data-project-list]').forEach(el=>{el.innerHTML=list.map(card).join('')||'<p>Проекты пока не добавлены.</p>';setupSliders()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();filterSetup()});else {render();filterSetup()}
function filterSetup(){const ids=['areaMin','areaMax','priceMin','priceMax','floorFilter'];if(!document.getElementById('areaMin'))return;const run=()=>{const v=id=>document.getElementById(id).value;const found=get().filter(p=>(!v('areaMin')||p.totalArea>=+v('areaMin'))&&(!v('areaMax')||p.totalArea<=+v('areaMax'))&&(!v('priceMin')||p.price>=+v('priceMin'))&&(!v('priceMax')||p.price<=+v('priceMax'))&&(!v('floorFilter')||p.floors==+v('floorFilter')));document.querySelector('[data-project-list]').innerHTML=found.map(card).join('')||'<p>Подходящих проектов не найдено.</p>';setupSliders();document.getElementById('foundCount').textContent='Найдено: '+found.length};ids.forEach(id=>document.getElementById(id).addEventListener('input',run));document.getElementById('resetFilters').onclick=()=>{ids.forEach(id=>document.getElementById(id).value='');run()};run()}
})();
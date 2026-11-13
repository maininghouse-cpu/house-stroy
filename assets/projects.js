(function(){
const FALLBACK=[];
let cache=FALLBACK;
const sb=window.houseStroyClient;
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function money(n){return Number(n||0).toLocaleString("ru-RU")+" ₽"}
function url(path){return path?sb.storage.from("project-media").getPublicUrl(path).data.publicUrl:""}
function mapRow(row){
 const spec=row.specifications||{},media={images:[],threeD:[],plans:[],facades:[],photos:[]};
 (row.project_media||[]).sort((a,b)=>a.sort_order-b.sort_order).forEach(m=>{if(media[m.category])media[m.category].push(url(m.storage_path));});
 return {id:row.id,slug:row.slug,name:row.title,description:row.description||row.short_description||"",price:row.price||0,totalArea:row.total_area||0,livingArea:row.living_area||0,dimensions:spec.dimensions||"",floors:row.floors||1,bedrooms:row.bedrooms||0,bathrooms:row.bathrooms||0,balconies:Number(spec.balconies??row.balconies??0),terraces:Number(spec.terraces??row.terraces??0),cover:spec.cover_path?url(spec.cover_path):(spec.cover_url||""),...media};
}
async function load(){
 const {data,error}=await sb.from("projects").select("*, project_media(*)").eq("is_published",true).order("sort_order").order("created_at",{ascending:false});
 if(error)throw error;cache=(data||[]).map(mapRow);return cache;
}
function get(){return cache}
window.HouseProjects={get,load};
function card(p){return '<a class="card project-card" href="project.html?id='+encodeURIComponent(p.id)+'"><img src="'+esc(p.cover||"")+'" alt="'+esc(p.name)+'" loading="lazy"><div class="card-body"><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p><div class="project-stats"><div class="project-stat"><strong>'+p.totalArea+' м²</strong><span>Общая площадь</span></div><div class="project-stat"><strong>'+esc(p.dimensions||"—")+'</strong><span>Размеры</span></div><div class="project-stat"><strong>'+p.floors+'</strong><span>Этажность</span></div><div class="project-stat"><strong>🛏️ '+p.bedrooms+'</strong><span>Спальни</span></div><div class="project-stat"><strong>🚿 '+p.bathrooms+'</strong><span>Санузлы</span></div></div><div class="meta"><b class="price">'+money(p.price)+'</b></div></div></a>'}
function render(){document.querySelectorAll("[data-project-list]").forEach(el=>{el.innerHTML=cache.map(card).join("")||"<p>Опубликованных проектов пока нет.</p>";});}
function filterSetup(){
 const ids=["areaMin","areaMax","priceMin","priceMax","floorFilter"];if(!document.getElementById("areaMin"))return;
 const run=()=>{const v=id=>document.getElementById(id).value;const found=cache.filter(p=>(!v("areaMin")||p.totalArea>=+v("areaMin"))&&(!v("areaMax")||p.totalArea<=+v("areaMax"))&&(!v("priceMin")||p.price>=+v("priceMin"))&&(!v("priceMax")||p.price<=+v("priceMax"))&&(!v("floorFilter")||p.floors==+v("floorFilter")));document.querySelector("[data-project-list]").innerHTML=found.map(card).join("")||"<p>Подходящих проектов не найдено.</p>";document.getElementById("foundCount").textContent="Найдено: "+found.length;};
 ids.forEach(id=>document.getElementById(id).addEventListener("input",run));document.getElementById("resetFilters").onclick=()=>{ids.forEach(id=>document.getElementById(id).value="");run();};return run;
}
async function init(){try{await load();}catch(e){console.error("Supabase projects:",e);cache=[];const list=document.querySelector("[data-project-list]");if(list)list.innerHTML="<p>Не удалось загрузить каталог. Обновите страницу позже.</p>";}
 render();const run=filterSetup();if(run)run();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
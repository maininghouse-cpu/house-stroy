(function(){
"use strict";
const FALLBACK=[];
let cache=FALLBACK;
const sb=window.houseStroyClient;
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function money(n){const value=Number(n);return (Number.isFinite(value)?value:0).toLocaleString("ru-RU").replace(/[\u00a0\u202f]/g," ")+" руб."; }
function publicUrl(path){try{return path&&sb?sb.storage.from("project-media").getPublicUrl(path).data.publicUrl:"";}catch(e){console.warn("Project image URL:",e);return "";}}
function mapRow(row,mediaRows){
 const spec=row.specifications&&typeof row.specifications==="object"?row.specifications:{};
 const media={images:[],threeD:[],plans:[],facades:[],photos:[]};
 (mediaRows||[]).filter(m=>m.project_id===row.id).sort((a,b)=>(Number(a.sort_order)||0)-(Number(b.sort_order)||0)).forEach(m=>{
  if(media[m.category])media[m.category].push(publicUrl(m.storage_path));
 });
 const cover=spec.cover_path?publicUrl(spec.cover_path):(spec.cover_url||media.threeD[0]||media.photos[0]||media.images[0]||"");
 const basePrice=Number(row.price)||0;
 return {
  id:row.id,slug:row.slug,name:row.title||"Проект дома",featured:row.is_featured===true,
  description:row.description||row.short_description||"",
  sipDescription:spec.sip_description||row.description||row.short_description||"",
  frameDescription:spec.frame_description||row.description||row.short_description||"",
  sipPrice:Number(spec.sip_price)||basePrice,
  framePrice:Number(spec.frame_price)||basePrice,
  price:basePrice,totalArea:Number(row.total_area)||0,livingArea:Number(row.living_area)||0,
  dimensions:spec.dimensions||"",floors:Number(row.floors)||1,
  bedrooms:Number(row.bedrooms)||0,bathrooms:Number(row.bathrooms)||0,
  balconies:Number(spec.balconies??row.balconies??0),terraces:Number(spec.terraces??row.terraces??0),
  cover,...media
 };
}
async function load(){
 if(!sb)throw new Error("Не инициализировано подключение к базе данных");
 const {data:rows,error}=await sb.from("projects").select("*").eq("is_published",true).order("sort_order").order("created_at",{ascending:false});
 if(error)throw error;
 const projects=rows||[];
 let mediaRows=[];
 if(projects.length){
  const {data,error:mediaError}=await sb.from("project_media").select("*").in("project_id",projects.map(p=>p.id));
  if(mediaError)console.warn("Project media:",mediaError);
  else mediaRows=mediaRows.concat(data||[]);
 }
 cache=projects.map(row=>mapRow(row,mediaRows));
 return cache;
}
function get(){return cache;}
window.HouseProjects={get,load};
function selectedType(){return document.getElementById("buildType")?.value||"";}
function priceFor(p,type=selectedType()){
 if(type==="sip")return p.sipPrice||p.price;
 if(type==="frame")return p.framePrice||p.price;
 const values=[p.sipPrice,p.framePrice].map(Number).filter(n=>n>0);
 return values.length?Math.min(...values):(Number(p.price)||0);
}
function descriptionFor(p,type=selectedType()){
 if(type==="sip")return p.sipDescription||p.description;
 if(type==="frame")return p.frameDescription||p.description;
 return (priceFor(p,"sip")<=priceFor(p,"frame")?p.sipDescription:p.frameDescription)||p.description;
}
function card(p){
 const type=selectedType();
 const href="project.html?id="+encodeURIComponent(p.id)+(type?"&type="+encodeURIComponent(type):"");
 return '<a class="card project-card" href="'+href+'"><img src="'+esc(p.cover)+'" alt="'+esc(p.name)+'" loading="lazy"><div class="card-body"><h3>'+esc(p.name)+'</h3><p>'+esc(descriptionFor(p,type))+'</p><div class="project-stats"><div class="project-stat"><strong>'+esc(p.totalArea)+' м²</strong><span>Общая площадь</span></div><div class="project-stat"><strong>'+esc(p.dimensions||"—")+'</strong><span>Размеры</span></div><div class="project-stat"><strong>🛏️ '+esc(p.bedrooms)+'</strong><span>Спальни</span></div><div class="project-stat"><strong>🚿 '+esc(p.bathrooms)+'</strong><span>Санузлы</span></div></div><div class="meta"><b class="price">'+money(priceFor(p,type))+'</b></div></div></a>';
}
function render(){
 const path=window.location.pathname.replace(/\/+$/, "");
 const isHome=path===""||path==="/"||path.endsWith("/index.html")||path==="/house-stroy"||path.endsWith("/house-stroy");
 document.querySelectorAll("[data-project-list]").forEach(el=>{
  const visible=isHome?cache.filter(p=>p.featured):cache;
  el.innerHTML=visible.map(card).join("")||(isHome?"<p>Скоро здесь появятся избранные проекты.</p>":"<p>Опубликованных проектов пока нет.</p>");
 });
}
function filterSetup(){
 const ids=["areaMin","areaMax","priceMin","priceMax","floorFilter","buildType"];
 if(!document.getElementById("areaMin"))return null;
 const run=()=>{
  const v=id=>document.getElementById(id)?.value||"";
  ["buildType","floorFilter"].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle("is-selected",!!el.value);});
  const found=cache.filter(p=>
   (!v("areaMin")||p.totalArea>=Number(v("areaMin")))&&
   (!v("areaMax")||p.totalArea<=Number(v("areaMax")))&&
   (!v("priceMin")||priceFor(p,v("buildType"))>=Number(v("priceMin")))&&
   (!v("priceMax")||priceFor(p,v("buildType"))<=Number(v("priceMax")))&&
   (!v("floorFilter")||p.floors===Number(v("floorFilter")))
  );
  const list=document.querySelector("[data-project-list]");
  if(list)list.innerHTML=found.map(card).join("")||"<p>Подходящих проектов не найдено.</p>";
  const count=document.getElementById("foundCount");
  if(count)count.textContent="Найдено: "+found.length;
 };
 ids.forEach(id=>{
  const el=document.getElementById(id);
  if(el)el.addEventListener(el.tagName==="SELECT"?"change":"input",run);
 });
 const reset=document.getElementById("resetFilters");
 if(reset)reset.addEventListener("click",()=>{
  ids.forEach(id=>{const el=document.getElementById(id);if(el)el.value="";});
  run();
 });
 return run;
}
async function init(){
 const list=document.querySelector("[data-project-list]");
 // The detail page uses HouseProjects.load() itself; do not start a second catalogue request there.
 if(!list)return;
 if(list)list.innerHTML="<p>Загружаем проекты…</p>";
 const run=filterSetup();
 try{
  await load();
  render();
  if(run)run();
 }catch(e){
  console.error("HOUSE STROY: ошибка загрузки проектов",e);
  if(list)list.innerHTML="<p>Не удалось загрузить проекты. Проверьте подключение и обновите страницу.</p>";
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
})();
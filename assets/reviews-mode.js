(() => {
const sb=window.houseStroyClient;if(!sb)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const root=document.querySelector("[data-review-content]");
function showLightbox(urls,title){
 let index=0,overlay=document.querySelector("#houseReviewLightbox");
 if(!overlay){overlay=document.createElement("div");overlay.id="houseReviewLightbox";overlay.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:99999;display:none;align-items:center;justify-content:center;padding:24px";overlay.innerHTML='<button type="button" aria-label="Закрыть" data-close style="position:absolute;right:24px;top:12px;color:white;background:none;border:0;font-size:42px;cursor:pointer">×</button><button type="button" data-prev aria-label="Назад" style="position:absolute;left:16px;color:white;background:none;border:0;font-size:48px;cursor:pointer">‹</button><figure style="margin:0;text-align:center;max-width:90vw;max-height:90vh"><img style="max-width:86vw;max-height:78vh;object-fit:contain"><figcaption style="color:white;padding:12px"></figcaption></figure><button type="button" data-next aria-label="Вперёд" style="position:absolute;right:16px;color:white;background:none;border:0;font-size:48px;cursor:pointer">›</button>';document.body.appendChild(overlay);
 overlay.querySelector("[data-close]").onclick=()=>overlay.style.display="none";overlay.querySelector("[data-prev]").onclick=()=>render(-1);overlay.querySelector("[data-next]").onclick=()=>render(1);overlay.addEventListener("click",e=>{if(e.target===overlay)overlay.style.display="none";});document.addEventListener("keydown",e=>{if(overlay.style.display!=="flex")return;if(e.key==="Escape")overlay.style.display="none";if(e.key==="ArrowLeft")render(-1);if(e.key==="ArrowRight")render(1);});
 }
 function render(delta){index=(index+delta+urls.length)%urls.length;overlay.querySelector("img").src=urls[index];overlay.querySelector("figcaption").textContent=title+" · "+(index+1)+" / "+urls.length;overlay.querySelector("[data-prev]").hidden=urls.length<2;overlay.querySelector("[data-next]").hidden=urls.length<2;}
 overlay.style.display="flex";render(0);
}
async function init(){
 const {data,error}=await sb.from("site_settings").select("value").eq("key","reviews_page_mode").maybeSingle();
 if(error){console.warn("Не удалось получить режим страницы отзывов:",error);return;}
 const requested=new URLSearchParams(location.search).get("view");
 const mode=requested==="portfolio"?"portfolio":requested==="video"?"video":(data?.value==="portfolio"?"portfolio":"video");
 if(!root)return;
 const seoTitle=mode==="portfolio"?"Видеообзоры построенных домов — HOUSE STROY":"Видеоотзывы заказчиков о строительстве домов — HOUSE STROY";
 const seoDescription=mode==="portfolio"?"Смотрите видеообзоры реализованных объектов HOUSE STROY: планировки, фасады и детали построенных загородных домов.":"Смотрите видеоотзывы заказчиков HOUSE STROY о строительстве загородных домов. Реальные впечатления владельцев и опыт сотрудничества.";
 const seoUrl="https://pro-ect.ru/reviews.html?view="+mode;
 document.title=seoTitle;
 let canonical=document.querySelector('link[rel="canonical"]');
 if(!canonical){canonical=document.createElement("link");canonical.rel="canonical";document.head.appendChild(canonical);}
 canonical.href=seoUrl;
 const setMeta=(selector,attr,value)=>{let el=document.querySelector(selector);if(!el){el=document.createElement("meta");if(selector.startsWith('meta[property='))el.setAttribute("property",selector.match(/"([^"]+)"/)[1]);else el.name=selector.match(/"([^"]+)"/)[1];document.head.appendChild(el);}el.setAttribute(attr,value);};
 setMeta('meta[name="description"]',"content",seoDescription);
 setMeta('meta[property="og:title"]',"content",seoTitle);
 setMeta('meta[property="og:description"]',"content",seoDescription);
 setMeta('meta[property="og:url"]',"content",seoUrl);
 const hero=document.querySelector("#reviewsHeroTitle"),heading=document.querySelector("#reviewsSectionTitle");
 if(mode==="portfolio"){
  document.title="Обзор построенных домов — HOUSE STROY";
  if(hero)hero.textContent="Построенные дома";
  if(heading)heading.textContent="Обзор реализованных объектов";
  root.innerHTML='<p class="muted">Загружаем видеообзоры построенных домов…</p>';
  const {data:items,error:loadError}=await sb.from("house_overview_videos").select("id,title,video_url,description").eq("is_published",true).order("sort_order",{ascending:true}).order("created_at",{ascending:false});
  if(loadError){root.innerHTML="<p>Не удалось загрузить видеообзоры. Обновите страницу позже.</p>";console.error(loadError);return;}
  const embed=value=>{try{const u=new URL(value);if(u.hostname.endsWith("vkvideo.ru")||u.hostname.endsWith("vk.com")||u.hostname.endsWith("vk.ru")){if(u.pathname.includes("video_ext.php"))return u.href;const m=u.pathname.match(/video(-?\d+)_(\d+)/);if(m)return "https://vk.com/video_ext.php?oid="+encodeURIComponent(m[1])+"&id="+encodeURIComponent(m[2])+"&hd=2";}}catch{}return null;};
  root.innerHTML=(items||[]).map(x=>{const src=embed(x.video_url);return src?'<article class="review-video-card"><div class="review-video-frame"><iframe src="'+esc(src)+'" title="Обзор дома — '+esc(x.title)+'" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div><h3>'+esc(x.title)+'</h3><p>'+esc(x.description||"")+'</p></article>':"";}).join("")||"<p>Видеообзоры построенных домов скоро появятся здесь.</p>";
 }else{
  document.title="Видеоотзывы — HOUSE STROY";
  if(hero)hero.textContent="Отзывы клиентов";
  if(heading)heading.textContent="Видеоотзывы заказчиков";
  root.innerHTML='<p class="muted">Загружаем видеоотзывы…</p>';
  const {data:items,error:loadError}=await sb.from("video_reviews").select("id,title,video_url,description").eq("is_published",true).order("sort_order",{ascending:true}).order("created_at",{ascending:false});
  if(loadError){root.innerHTML="<p>Не удалось загрузить видеоотзывы. Обновите страницу позже.</p>";return;}
  const embed=value=>{try{const u=new URL(value);if(u.hostname.endsWith("vkvideo.ru")||u.hostname.endsWith("vk.com")||u.hostname.endsWith("vk.ru")){if(u.pathname.includes("video_ext.php"))return u.href;const m=u.pathname.match(/video(-?\d+)_(\d+)/);if(m)return "https://vk.com/video_ext.php?oid="+encodeURIComponent(m[1])+"&id="+encodeURIComponent(m[2])+"&hd=2";}}catch{}return null;};
  root.innerHTML=(items||[]).map(x=>{const src=embed(x.video_url);return src?'<article class="review-video-card"><div class="review-video-frame"><iframe src="'+esc(src)+'" title="Видеоотзыв — '+esc(x.title)+'" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div><h3>'+esc(x.title)+'</h3><p>'+esc(x.description||"")+'</p></article>':"";}).join("")||"<p>Пока нет опубликованных видеоотзывов.</p>";
 }
}
init();
})();
(() => {
const sb=window.houseStroyClient;if(!sb)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const root=document.querySelector("[data-review-content]");
const labels=document.querySelectorAll('a[href="reviews.html"]');
function setLabels(mode){labels.forEach(a=>a.textContent=mode==="portfolio"?"Обзор домов":"Видеоотзывы");}
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
 const mode=data?.value==="portfolio"?"portfolio":"video";
 setLabels(mode);
 if(!root)return;
 const hero=document.querySelector("#reviewsHeroTitle"),heading=document.querySelector("#reviewsSectionTitle");
 if(mode==="portfolio"){
  document.title="Обзор построенных домов — HOUSE STROY";
  if(hero)hero.textContent="Построенные дома";
  if(heading)heading.textContent="Обзор реализованных объектов";
  root.innerHTML='<p class="muted">Загружаем построенные дома…</p>';
  const {data:items,error:loadError}=await sb.from("portfolio_items").select("id,title,description,image_url,gallery_urls,area,style").eq("is_published",true).order("sort_order",{ascending:true}).order("created_at",{ascending:false});
  if(loadError){root.innerHTML="<p>Не удалось загрузить объекты. Обновите страницу позже.</p>";console.error(loadError);return;}
  root.innerHTML=(items||[]).map((x,i)=>{
   const photos=(x.gallery_urls&&x.gallery_urls.length?x.gallery_urls:(x.image_url?[x.image_url]:[]));
   const photo=photos[0];
   return '<article class="review-video-card house-overview-card">'+(photo?'<button type="button" class="house-overview-photo" data-house="'+i+'" style="display:block;width:100%;padding:0;border:0;background:none;cursor:zoom-in"><img src="'+esc(photo)+'" alt="'+esc(x.title)+'" loading="lazy" style="width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:14px"></button>':'')+'<h3>'+esc(x.title)+'</h3><p>'+esc(x.description||"")+'</p><div class="meta">'+(x.area?'<span>'+esc(x.area)+' м²</span>':'')+(x.style?'<span>'+esc(x.style)+'</span>':'')+'</div>'+(photos.length>1?'<button type="button" class="secondary house-overview-gallery" data-house="'+i+'">Смотреть фотографии · '+photos.length+'</button>':'')+'</article>';
  }).join("")||"<p>Построенные дома скоро появятся здесь.</p>";
  root.querySelectorAll("[data-house]").forEach(btn=>btn.addEventListener("click",()=>{const x=items[Number(btn.dataset.house)];const urls=x.gallery_urls&&x.gallery_urls.length?x.gallery_urls:(x.image_url?[x.image_url]:[]);if(urls.length)showLightbox(urls,x.title);}));
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
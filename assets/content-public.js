(() => {
const sb=window.houseStroyClient;if(!sb)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let viewer=null,activeImages=[],activeIndex=0,touchStartX=0;
function ensureViewer(){
 if(viewer)return viewer;
 viewer=document.createElement("div");viewer.className="portfolio-lightbox";viewer.hidden=true;viewer.setAttribute("role","dialog");viewer.setAttribute("aria-modal","true");viewer.setAttribute("aria-label","Просмотр фотографий");
 viewer.innerHTML='<button class="lightbox-close" type="button" aria-label="Закрыть">×</button><button class="lightbox-arrow lightbox-prev" type="button" aria-label="Предыдущее фото">‹</button><figure><img alt=""><figcaption></figcaption><div class="lightbox-thumbnails" aria-label="Миниатюры фотографий"></div></figure><button class="lightbox-arrow lightbox-next" type="button" aria-label="Следующее фото">›</button>';
 document.body.appendChild(viewer);
 viewer.querySelector(".lightbox-close").addEventListener("click",closeViewer);
 viewer.querySelector(".lightbox-prev").addEventListener("click",()=>showImage(activeIndex-1));
 viewer.querySelector(".lightbox-next").addEventListener("click",()=>showImage(activeIndex+1));
 viewer.addEventListener("click",e=>{if(e.target===viewer)closeViewer();});
 viewer.addEventListener("touchstart",e=>{touchStartX=e.changedTouches[0].clientX;},{passive:true});
 viewer.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>45)showImage(activeIndex+(dx<0?1:-1));},{passive:true});
 document.addEventListener("keydown",e=>{if(viewer.hidden)return;if(e.key==="Escape")closeViewer();if(e.key==="ArrowRight")showImage(activeIndex+1);if(e.key==="ArrowLeft")showImage(activeIndex-1);});
 return viewer;
}
function showImage(index){
 if(!activeImages.length)return;
 activeIndex=(index+activeImages.length)%activeImages.length;
 const item=activeImages[activeIndex],v=ensureViewer();
 v.querySelector("figure img").src=item.url;v.querySelector("figure img").alt=item.title+" — фото "+(activeIndex+1);
 v.querySelector("figcaption").textContent=item.title+" · "+(activeIndex+1)+" / "+activeImages.length;
 v.querySelector(".lightbox-prev").hidden=activeImages.length<2;v.querySelector(".lightbox-next").hidden=activeImages.length<2;
 v.querySelectorAll(".lightbox-thumb").forEach((thumb,i)=>{thumb.classList.toggle("is-active",i===activeIndex);thumb.setAttribute("aria-current",i===activeIndex?"true":"false");if(i===activeIndex)thumb.scrollIntoView({block:"nearest",inline:"nearest"});});
}
function openViewer(images,index){
 activeImages=images;const v=ensureViewer();const strip=v.querySelector(".lightbox-thumbnails");strip.innerHTML="";images.forEach((item,i)=>{const thumb=document.createElement("button");thumb.type="button";thumb.className="lightbox-thumb";thumb.setAttribute("aria-label","Показать фото "+(i+1));thumb.innerHTML="<img alt=\"\" loading=\"lazy\">";thumb.querySelector("img").src=item.url;thumb.addEventListener("click",()=>showImage(i));strip.appendChild(thumb);});v.hidden=false;document.body.classList.add("lightbox-open");showImage(index);
 viewer.querySelector(".lightbox-close").focus();
}
function closeViewer(){if(!viewer)return;viewer.hidden=true;document.body.classList.remove("lightbox-open");}
async function portfolio(){
 const root=document.querySelector("[data-portfolio-list]");if(!root)return;
 const {data,error}=await sb.from("portfolio_items").select("*").eq("is_published",true).order("sort_order",{ascending:true}).order("created_at",{ascending:false});if(error){console.error("Не удалось загрузить портфолио:",error);root.innerHTML="<p>Не удалось загрузить проекты портфолио. Обновите страницу позже.</p>";return;}
 root.innerHTML=data.map((x,cardIndex)=>{
  const gallery=x.gallery_urls&&x.gallery_urls.length?x.gallery_urls:(x.image_url?[x.image_url]:[]);
   const firstPhoto=gallery[0];
  const shown=gallery.slice(0,2);
  const images=shown.map((url,i)=>'<button class="portfolio-photo" type="button" data-card="'+cardIndex+'" data-photo="'+i+'" aria-label="Открыть фотографии проекта '+esc(x.title)+'"><img src="'+esc(url)+'" alt="'+esc(x.title)+' — фото '+(i+1)+'" loading="lazy">'+(i===1?'<span class="photo-more">Все фото · '+gallery.length+'</span>':'<span class="photo-zoom" aria-hidden="true">⌕</span>')+'</button>').join("");
  return '<article class="card">'+(images?'<div class="portfolio-gallery">'+images+'</div>':'')+'<div class="card-body"><h3>'+esc(x.title)+'</h3><p>'+esc(x.description||"")+'</p><div class="meta">'+(x.area?'<span>'+esc(x.area)+' м²</span>':'')+(x.style?'<span>'+esc(x.style)+'</span>':'')+'</div></div></article>';
 }).join("")||"<p>Портфолио скоро пополнится новыми объектами.</p>";
 root.querySelectorAll(".portfolio-photo").forEach(btn=>btn.addEventListener("click",()=>{
  const x=data[Number(btn.dataset.card)],urls=x.gallery_urls&&x.gallery_urls.length?x.gallery_urls:(x.image_url?[x.image_url]:[]);
  openViewer(urls.map((url)=>({url,title:x.title})),Number(btn.dataset.photo));
 }));
}

function vkEmbedUrl(value){
 try{
  const u=new URL(value);
  if(u.hostname.endsWith("vkvideo.ru")||u.hostname.endsWith("vk.com")||u.hostname.endsWith("vk.ru")){
   if(u.pathname.includes("video_ext.php"))return u.href;
   const m=u.pathname.match(/video(-?\d+)_(\d+)/);
   if(m)return "https://vk.com/video_ext.php?oid="+encodeURIComponent(m[1])+"&id="+encodeURIComponent(m[2])+"&hd=2";
  }
 }catch{}
 return null;
}
async function videoReviews(){
 const root=document.querySelector("[data-video-reviews]");if(!root)return;
 const {data,error}=await sb.from("video_reviews").select("id,title,video_url,description").eq("is_published",true).order("sort_order",{ascending:true}).order("created_at",{ascending:false});
 if(error){console.error("Не удалось загрузить видеоотзывы:",error);root.innerHTML="<p>Не удалось загрузить видеоотзывы. Обновите страницу позже.</p>";return;}
 root.innerHTML=(data||[]).map(x=>{
  const src=vkEmbedUrl(x.video_url);if(!src)return "";
  return '<article class="review-video-card"><div class="review-video-frame"><iframe src="'+esc(src)+'" title="Видеоотзыв — '+esc(x.title)+' — HOUSE STROY" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock;" allowfullscreen></iframe></div><h3>'+esc(x.title)+'</h3><p>'+esc(x.description||"")+'</p></article>';
 }).join("")||"<p>Пока нет опубликованных видеоотзывов.</p>";
}
portfolio();videoReviews();
})();
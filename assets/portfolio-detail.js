(() => {
const sb=window.houseStroyClient;
const root=document.querySelector("[data-portfolio-detail]");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const params=new URLSearchParams(location.search);
const id=params.get("id");
let images=[],index=0;
const titleEl=document.querySelector("[data-detail-title]");
function setMeta(name,content,property=false){
 let el=document.querySelector(property?'meta[property="'+name+'"]':'meta[name="'+name+'"]');
 if(!el){el=document.createElement("meta");el.setAttribute(property?"property":"name",name);document.head.appendChild(el);}
 el.content=content;
}
function show(next){
 if(!images.length)return;
 index=(next+images.length)%images.length;
 const main=root.querySelector(".portfolio-detail-main-image");
 main.src=images[index];main.alt=titleEl.textContent+" — фото "+(index+1);
 root.querySelector(".portfolio-detail-counter").textContent=(index+1)+" / "+images.length;
 root.querySelectorAll(".portfolio-detail-thumb").forEach((b,i)=>{b.classList.toggle("is-active",i===index);b.setAttribute("aria-current",i===index?"true":"false");if(i===index)b.scrollIntoView({block:"nearest",inline:"nearest"});});
 root.querySelector(".portfolio-detail-prev").hidden=images.length<2;
 root.querySelector(".portfolio-detail-next").hidden=images.length<2;
}
async function init(){
 if(!sb||!id){root.innerHTML="<p>Объект не найден. Вернитесь в <a href='portfolio.html'>портфолио</a>.</p>";return;}
 const {data:x,error}=await sb.from("portfolio_items").select("*").eq("id",id).eq("is_published",true).maybeSingle();
 if(error||!x){root.innerHTML="<p>Не удалось найти этот объект. Возможно, он был снят с публикации. <a href='portfolio.html'>Вернуться в портфолио</a>.</p>";return;}
 images=(x.gallery_urls&&x.gallery_urls.length?x.gallery_urls:(x.image_url?[x.image_url]:[])).filter(Boolean);
 titleEl.textContent=x.title||"Построенный дом";
 document.title=(x.title||"Построенный дом")+" — портфолио HOUSE STROY";
 const description=(x.description||"").trim()||("Реализованный проект HOUSE STROY — загородный дом "+(x.area? "площадью "+x.area+" м² ":"")+(x.style?"в стиле "+x.style+" ":"")+"с продуманной планировкой и вниманием к деталям. На странице собраны фотографии готового объекта, позволяющие рассмотреть архитектуру, фасад и результат строительства.");
 setMeta("description",description.slice(0,300));
 setMeta("og:title",document.title,true);setMeta("og:description",description.slice(0,300),true);
 setMeta("og:url",location.href,true);
 let canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=location.href;
 root.innerHTML=(images.length?'<div class="portfolio-detail-gallery"><div class="portfolio-detail-stage"><button class="portfolio-detail-arrow portfolio-detail-prev" type="button" aria-label="Предыдущее фото">‹</button><img class="portfolio-detail-main-image" src="'+esc(images[0])+'" alt="'+esc(x.title)+' — фото 1"><button class="portfolio-detail-arrow portfolio-detail-next" type="button" aria-label="Следующее фото">›</button><span class="portfolio-detail-counter">1 / '+images.length+'</span></div><div class="portfolio-detail-thumbs" aria-label="Все фотографии объекта">'+images.map((url,i)=>'<button class="portfolio-detail-thumb '+(i===0?'is-active':'')+'" type="button" data-index="'+i+'" aria-label="Открыть фото '+(i+1)+'" aria-current="'+(i===0?'true':'false')+'"><img src="'+esc(url)+'" alt="" loading="lazy"></button>').join("")+'</div></div>':'<p class="portfolio-detail-no-photos">Для этого объекта фотографии пока не добавлены.</p>')+
 '<article class="portfolio-detail-description"><div class="eyebrow-dark">HOUSE STROY / РЕАЛИЗОВАННЫЙ ПРОЕКТ</div><h2>О доме</h2><p>'+esc(description)+'</p><div class="portfolio-detail-meta">'+(x.area?'<span>'+esc(x.area)+' м²</span>':'')+(x.style?'<span>'+esc(x.style)+'</span>':'')+(x.construction_location?'<span>'+esc(x.construction_location)+'</span>':'')+'</div><a class="btn" href="contacts.html">Обсудить строительство дома ↗</a></article>';
 root.querySelector(".portfolio-detail-prev")?.addEventListener("click",()=>show(index-1));
 root.querySelector(".portfolio-detail-next")?.addEventListener("click",()=>show(index+1));
 root.querySelectorAll(".portfolio-detail-thumb").forEach(b=>b.addEventListener("click",()=>show(Number(b.dataset.index))));
 root.querySelector(".portfolio-detail-main-image")?.addEventListener("click",()=>{const overlay=document.createElement("div");overlay.className="portfolio-detail-lightbox";overlay.innerHTML='<button type="button" aria-label="Закрыть">×</button><img src="'+esc(images[index])+'" alt="'+esc(x.title)+'">';document.body.appendChild(overlay);const close=()=>overlay.remove();overlay.querySelector("button").onclick=close;overlay.onclick=e=>{if(e.target===overlay)close();};});
 document.addEventListener("keydown",e=>{if(e.key==="ArrowRight")show(index+1);if(e.key==="ArrowLeft")show(index-1);});
}
init();
})();
(() => {
const sb=window.houseStroyClient;
const root=document.querySelector("[data-portfolio-detail]");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const params=new URLSearchParams(location.search);
const id=params.get("id");
let images=[],index=0,projectNavigation=[];
const titleEl=document.querySelector("[data-detail-title]");
function setMeta(name,content,property=false){
 let el=document.querySelector(property?'meta[property="'+name+'"]':'meta[name="'+name+'"]');
 if(!el){el=document.createElement("meta");el.setAttribute(property?"property":"name",name);document.head.appendChild(el);}
 el.content=content;
}
let lightbox=null;
function show(next){
 if(!images.length)return;
 index=(next+images.length)%images.length;
 const main=root.querySelector(".portfolio-detail-main-image");
 if(main){main.src=images[index];main.alt=titleEl.textContent+" — фото "+(index+1);}
 const counter=root.querySelector(".portfolio-detail-counter");
 if(counter)counter.textContent=(index+1)+" / "+images.length;
 root.querySelectorAll(".portfolio-detail-thumb").forEach((b,i)=>{b.classList.toggle("is-active",i===index);b.setAttribute("aria-current",i===index?"true":"false");if(i===index)b.scrollIntoView({block:"nearest",inline:"nearest"});});
 const prev=root.querySelector(".portfolio-detail-prev"),nextBtn=root.querySelector(".portfolio-detail-next");
 if(prev)prev.hidden=images.length<2;if(nextBtn)nextBtn.hidden=images.length<2;
 if(lightbox){
  lightbox.querySelector(".portfolio-viewer-image").src=images[index];
  lightbox.querySelector(".portfolio-viewer-image").alt=titleEl.textContent+" — фото "+(index+1);
  lightbox.querySelector(".portfolio-viewer-counter").textContent=(index+1)+" / "+images.length;
  lightbox.querySelectorAll(".portfolio-viewer-thumb").forEach((b,i)=>{b.classList.toggle("is-active",i===index);if(i===index)b.scrollIntoView({block:"nearest",inline:"nearest"});});
 }
}
function closeViewer(){if(!lightbox)return;lightbox.remove();lightbox=null;document.body.classList.remove("portfolio-viewer-open");}
function openViewer(){
 if(!images.length||lightbox)return;
 lightbox=document.createElement("div");lightbox.className="portfolio-viewer";lightbox.setAttribute("role","dialog");lightbox.setAttribute("aria-modal","true");lightbox.setAttribute("aria-label","Просмотр фотографий объекта");
 lightbox.innerHTML='<button class="portfolio-viewer-close" type="button" aria-label="Закрыть просмотр">×</button><button class="portfolio-viewer-arrow portfolio-viewer-prev" type="button" aria-label="Предыдущее фото">‹</button><img class="portfolio-viewer-image" alt=""><button class="portfolio-viewer-arrow portfolio-viewer-next" type="button" aria-label="Следующее фото">›</button><div class="portfolio-viewer-bottom"><span class="portfolio-viewer-counter"></span><div class="portfolio-viewer-thumbs" aria-label="Миниатюры фотографий"></div></div>';
 document.body.appendChild(lightbox);document.body.classList.add("portfolio-viewer-open");
 const strip=lightbox.querySelector(".portfolio-viewer-thumbs");
 images.forEach((url,i)=>{const b=document.createElement("button");b.type="button";b.className="portfolio-viewer-thumb";b.setAttribute("aria-label","Открыть фото "+(i+1));b.innerHTML='<img alt="" loading="lazy">';b.querySelector("img").src=url;b.addEventListener("click",()=>show(i));strip.appendChild(b);});
 lightbox.querySelector(".portfolio-viewer-close").addEventListener("click",closeViewer);
 lightbox.querySelector(".portfolio-viewer-prev").addEventListener("click",()=>show(index-1));
 lightbox.querySelector(".portfolio-viewer-next").addEventListener("click",()=>show(index+1));
 lightbox.addEventListener("click",e=>{if(e.target===lightbox)closeViewer();});
 show(index);lightbox.querySelector(".portfolio-viewer-close").focus();
}
async function init(){
 if(!sb||!id){root.innerHTML="<p>Объект не найден. Вернитесь в <a href='portfolio.html'>портфолио</a>.</p>";return;}
 const [{data:x,error},{data:items}] = await Promise.all([
  sb.from("portfolio_items").select("*").eq("id",id).eq("is_published",true).maybeSingle(),
  sb.from("portfolio_items").select("id,title,image_url,gallery_urls").eq("is_published",true).order("sort_order",{ascending:true}).order("created_at",{ascending:false})
 ]);
 if(error||!x){root.innerHTML="<p>Не удалось найти этот объект. Возможно, он был снят с публикации. <a href='portfolio.html'>Вернуться в портфолио</a>.</p>";return;}
 projectNavigation=items||[];
 images=(x.gallery_urls&&x.gallery_urls.length?x.gallery_urls:(x.image_url?[x.image_url]:[])).filter(Boolean);
 titleEl.textContent=x.title||"Построенный дом";
 document.title=(x.title||"Построенный дом")+" — портфолио HOUSE STROY";
 const description=(x.description||"").trim()||("Реализованный проект HOUSE STROY — загородный дом "+(x.area? "площадью "+x.area+" м² ":"")+(x.style?"в стиле "+x.style+" ":"")+"с продуманной планировкой и вниманием к деталям. На странице собраны фотографии готового объекта, позволяющие рассмотреть архитектуру, фасад и результат строительства.");
 setMeta("description",description.slice(0,300));
 setMeta("og:title",document.title,true);setMeta("og:description",description.slice(0,300),true);
 setMeta("og:url",location.href,true);
 setMeta("og:type","article",true);
 setMeta("og:image",images[0]||"https://pro-ect.ru/assets/og-house-stroy.jpg",true);
 setMeta("twitter:card","summary_large_image");
 setMeta("twitter:title",document.title);
 setMeta("twitter:description",description.slice(0,200));
 if(images[0])setMeta("twitter:image",images[0]);
 let schema=document.getElementById("portfolioSeoSchema");if(!schema){schema=document.createElement("script");schema.type="application/ld+json";schema.id="portfolioSeoSchema";document.head.appendChild(schema);}
 schema.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":titleEl.textContent,"description":description.slice(0,300),"image":images,"mainEntityOfPage":location.href,"publisher":{"@type":"Organization","name":"HOUSE STROY","url":"https://pro-ect.ru/"}});
 let canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=location.href;
 root.innerHTML=(images.length?'<div class="portfolio-detail-gallery"><div class="portfolio-detail-stage"><button class="portfolio-detail-arrow portfolio-detail-prev" type="button" aria-label="Предыдущее фото">‹</button><img class="portfolio-detail-main-image" src="'+esc(images[0])+'" alt="'+esc(x.title)+' — фото 1"><button class="portfolio-detail-arrow portfolio-detail-next" type="button" aria-label="Следующее фото">›</button><span class="portfolio-detail-counter">1 / '+images.length+'</span></div><div class="portfolio-detail-thumbs" aria-label="Все фотографии объекта">'+images.map((url,i)=>'<button class="portfolio-detail-thumb '+(i===0?'is-active':'')+'" type="button" data-index="'+i+'" aria-label="Открыть фото '+(i+1)+'" aria-current="'+(i===0?'true':'false')+'"><img src="'+esc(url)+'" alt="" loading="lazy"></button>').join("")+'</div></div>':'<p class="portfolio-detail-no-photos">Для этого объекта фотографии пока не добавлены.</p>')+
 '<article class="portfolio-detail-description"><div class="eyebrow-dark">HOUSE STROY / РЕАЛИЗОВАННЫЙ ПРОЕКТ</div><h2>О доме</h2><p>'+esc(description)+'</p><div class="portfolio-detail-meta">'+(x.area?'<span>'+esc(x.area)+' м²</span>':'')+(x.style?'<span>'+esc(x.style)+'</span>':'')+(x.construction_location?'<span>'+esc(x.construction_location)+'</span>':'')+'</div><a class="btn" href="contacts.html">Обсудить строительство дома ↗</a></article>' + '<nav class="portfolio-project-navigation" aria-label="Переход между проектами"><a class="portfolio-project-nav-link portfolio-project-prev" href="#" aria-label="Предыдущий проект"><span class="portfolio-project-direction">←</span><span class="portfolio-project-preview"><img class="portfolio-project-preview-image" alt="" loading="lazy"><span class="portfolio-project-preview-title">Предыдущий проект</span></span></a><a class="portfolio-project-nav-link portfolio-project-all" href="portfolio.html">Все проекты портфолио</a><a class="portfolio-project-nav-link portfolio-project-next" href="#" aria-label="Следующий проект"><span class="portfolio-project-preview"><img class="portfolio-project-preview-image" alt="" loading="lazy"><span class="portfolio-project-preview-title">Следующий проект</span></span><span class="portfolio-project-direction">→</span></a></nav>';
 const currentProjectIndex=projectNavigation.findIndex(item=>String(item.id)===String(id));
 const previousProject=projectNavigation[currentProjectIndex-1],nextProject=projectNavigation[currentProjectIndex+1];
 const previousLink=root.querySelector(".portfolio-project-prev"),nextLink=root.querySelector(".portfolio-project-next");
 function setProjectPreview(link,project){
  if(!project){link.hidden=true;return;}
  link.href="portfolio-item.html?id="+encodeURIComponent(project.id);
  const image=(project.gallery_urls&&project.gallery_urls[0])||project.image_url||"";
  const img=link.querySelector(".portfolio-project-preview-image");
  if(image){img.src=image;img.alt=project.title||"Фото проекта";}else{img.hidden=true;}
  link.querySelector(".portfolio-project-preview-title").textContent=project.title||"Проект";
 }
 setProjectPreview(previousLink,previousProject);
 setProjectPreview(nextLink,nextProject);
 root.querySelector(".portfolio-detail-prev")?.addEventListener("click",()=>show(index-1));
 root.querySelector(".portfolio-detail-next")?.addEventListener("click",()=>show(index+1));
 root.querySelectorAll(".portfolio-detail-thumb").forEach(b=>b.addEventListener("click",()=>show(Number(b.dataset.index))));
 root.querySelector(".portfolio-detail-main-image")?.addEventListener("click",openViewer);
 document.addEventListener("keydown",e=>{if(!lightbox)return;if(e.key==="Escape"){e.preventDefault();closeViewer();}else if(e.key==="ArrowRight"){e.preventDefault();show(index+1);}else if(e.key==="ArrowLeft"){e.preventDefault();show(index-1);}});
 if(images.length)openViewer();
}
init();
})();
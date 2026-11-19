(() => {
const sb=window.houseStroyClient,root=document.getElementById("companyNewsDetail");if(!sb||!root)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
(async()=>{
 const id=new URLSearchParams(location.search).get("id");
 if(!id){root.innerHTML='<div class="news-empty">Не указана новость. <a href="index.html">Вернуться на главную</a></div>';return;}
 const {data,error}=await sb.from("company_news").select("id,title,news_date,construction_location,style,construction_status,construction_stage,image_url,gallery_urls,source_url,is_published").eq("id",id).eq("is_published",true).maybeSingle();
 if(error||!data){root.innerHTML='<div class="news-empty">Новость не найдена или снята с публикации. <a href="index.html">Вернуться к новостям</a></div>';return;}
 const photos=[...new Set([...(data.image_url?[data.image_url]:[]),...(Array.isArray(data.gallery_urls)?data.gallery_urls:[])])];
 const status=data.construction_status==="building"?"Строится":"Построен";
 const meta=[data.news_date,data.construction_location,data.style,status].filter(Boolean);
 document.title=data.title+" — HOUSE STROY";
 root.innerHTML='<div class="eyebrow-dark">НОВОСТИ КОМПАНИИ</div><h1>'+esc(data.title)+'</h1><div class="news-meta">'+meta.map(x=>'<span>'+esc(x)+'</span>').join("")+'</div>'+
 (photos.length?'<style>'+
 '.news-photo-gallery{margin:28px 0 34px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}'+
 '.news-photo-gallery button{display:block;padding:0;border:0;background:#eee;border-radius:14px;overflow:hidden;cursor:zoom-in;aspect-ratio:4/3}'+
 '.news-photo-gallery button:first-child{grid-column:span 2;grid-row:span 2;aspect-ratio:auto;min-height:280px}'+
 '.news-photo-gallery img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s}'+
 '.news-photo-gallery button:hover img{transform:scale(1.035)}'+
 '.news-photo-viewer{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:56px 22px 24px}'+
 '.news-photo-viewer img{max-width: min(1100px,94vw);max-height:86vh;object-fit:contain}'+
 '.news-photo-viewer button{position:absolute;border:0;background:rgba(255,255,255,.15);color:#fff;font-size:28px;width:44px;height:44px;border-radius:50%;cursor:pointer}'+
 '.news-photo-viewer .close{right:18px;top:16px}.news-photo-viewer .prev{left:18px}.news-photo-viewer .next{right:18px}'+
 '@media(max-width:700px){.news-photo-gallery{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.news-photo-gallery button:first-child{grid-column:span 2;min-height:220px}}'+
 '</style><div class="news-photo-gallery">'+photos.map((url,i)=>'<button type="button" data-news-photo="'+i+'" aria-label="Открыть фото '+(i+1)+'"><img src="'+esc(url)+'" alt="'+esc(data.title)+' — фото '+(i+1)+'" loading="'+(i===0?'eager':'lazy')+'"></button>').join('')+'</div>':'')+
 (data.construction_stage?'<p class="news-stage">'+esc(data.construction_stage)+'</p>':'')+
 '<div class="news-actions"><a class="btn" href="contacts.html">Обсудить строительство ↗</a></div>';
 if(photos.length){
  let current=0;
  const show=()=>{
   let viewer=document.querySelector(".news-photo-viewer");
   if(!viewer){
    viewer=document.createElement("div");viewer.className="news-photo-viewer";
    viewer.innerHTML='<button class="close" aria-label="Закрыть">×</button><button class="prev" aria-label="Предыдущее фото">‹</button><img alt=""><button class="next" aria-label="Следующее фото">›</button>';
    document.body.appendChild(viewer);
    viewer.addEventListener("click",e=>{
     if(e.target===viewer||e.target.classList.contains("close"))viewer.remove();
     else if(e.target.classList.contains("prev")){current=(current+photos.length-1)%photos.length;showImage();}
     else if(e.target.classList.contains("next")){current=(current+1)%photos.length;showImage();}
    });
   }
   showImage();
  };
  const showImage=()=>{
   const viewer=document.querySelector(".news-photo-viewer");if(!viewer)return;
   viewer.querySelector("img").src=photos[current];
   viewer.querySelector("img").alt=data.title+" — фото "+(current+1);
  };
  document.addEventListener("keydown",e=>{
   const viewer=document.querySelector(".news-photo-viewer");if(!viewer)return;
   const target=e.target;
   if(target&&(target.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)))return;
   if(e.key==="ArrowLeft"){e.preventDefault();current=(current+photos.length-1)%photos.length;showImage();}
   else if(e.key==="ArrowRight"){e.preventDefault();current=(current+1)%photos.length;showImage();}
   else if(e.key==="Escape"){e.preventDefault();viewer.remove();}
  });
  root.querySelectorAll("[data-news-photo]").forEach(btn=>btn.addEventListener("click",()=>{
   current=Number(btn.dataset.newsPhoto);show();
  }));
 }
})();
})();
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
 (photos[0]?'<img class="news-cover" src="'+esc(photos[0])+'" alt="'+esc(data.title)+'" loading="eager">':'')+
 (data.construction_stage?'<p class="news-stage">'+esc(data.construction_stage)+'</p>':'')+
 (photos.length>1?'<div class="news-gallery">'+photos.slice(1).map((url,i)=>'<img src="'+esc(url)+'" alt="'+esc(data.title)+' — фото '+(i+2)+'" loading="lazy">').join("")+'</div>':'')+
 '<div class="news-actions"><a class="btn" href="contacts.html">Обсудить строительство ↗</a></div>';
})();
})();
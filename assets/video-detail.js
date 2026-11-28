(() => {
const sb=window.houseStroyClient;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const params=new URLSearchParams(location.search);
const mode=params.get("view")==="portfolio"?"portfolio":"video";
const id=params.get("id");
const table=mode==="portfolio"?"house_overview_videos":"video_reviews";
const back="reviews.html?view="+mode;
const titleEl=document.querySelector("[data-video-title]");
const root=document.querySelector("[data-video-detail]");
const backEl=document.querySelector("[data-video-back]");
if(backEl)backEl.href=back;
function embed(value){
 try{const u=new URL(value);if(u.hostname.endsWith("vkvideo.ru")||u.hostname.endsWith("vk.com")||u.hostname.endsWith("vk.ru")){
  let url;if(u.pathname.includes("video_ext.php"))url=u;else{const m=u.pathname.match(/video(-?\d+)_(\d+)/);if(!m)return null;url=new URL("https://vk.com/video_ext.php");url.searchParams.set("oid",m[1]);url.searchParams.set("id",m[2]);url.searchParams.set("hd","2");}
  url.searchParams.set("autoplay","1");return url.href;
 }}catch{}return null;
}
async function init(){
 if(!sb||!id){root.innerHTML="<p>Видео не найдено. Вернитесь в раздел видео.</p>";return;}
 const {data,error}=await sb.from(table).select("id,title,video_url,description").eq("id",id).eq("is_published",true).maybeSingle();
 if(error||!data){root.innerHTML="<p>Не удалось загрузить видео. Возможно, оно было удалено или снято с публикации.</p>";return;}
 const pageTitle=(data.title||"Видео HOUSE STROY")+" — HOUSE STROY";
 const description=data.description||"Видео о строительстве загородного дома компанией HOUSE STROY.";
 const src=embed(data.video_url);
 if(!src){root.innerHTML="<p>Ссылка на видео имеет неподдерживаемый формат.</p>";return;}
 document.title=pageTitle;if(titleEl)titleEl.textContent=data.title||"Видео HOUSE STROY";
 const setMeta=(selector,attr,value)=>{let el=document.querySelector(selector);if(el)el.setAttribute(attr,value);};
 setMeta('meta[name="description"]',"content",description.slice(0,300));
 setMeta('meta[property="og:title"]',"content",pageTitle);
 setMeta('meta[property="og:description"]',"content",description.slice(0,300));
 const canonical="https://pro-ect.ru/video-item.html?view="+mode+"&id="+encodeURIComponent(id);
 let link=document.querySelector('link[rel="canonical"]');if(link)link.href=canonical;
 setMeta('meta[property="og:url"]',"content",canonical);
 setMeta('meta[name="twitter:card"]',"content","summary");
 setMeta('meta[name="twitter:title"]',"content",pageTitle);
 setMeta('meta[name="twitter:description"]',"content",description.slice(0,200));
 let schema=document.getElementById("videoSeoSchema");if(!schema){schema=document.createElement("script");schema.type="application/ld+json";schema.id="videoSeoSchema";document.head.appendChild(schema);}
 schema.textContent=JSON.stringify({"@context":"https://schema.org","@type":"VideoObject","name":data.title||"Видео HOUSE STROY","description":description.slice(0,300),"embedUrl":src,"url":canonical,"publisher":{"@type":"Organization","name":"HOUSE STROY","url":"https://pro-ect.ru/"}});
 root.innerHTML='<div class="review-video-detail-frame"><iframe src="'+esc(src)+'" title="'+esc(data.title||"Видео HOUSE STROY")+'" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div><h1>'+esc(data.title||"Видео HOUSE STROY")+'</h1><div class="review-video-detail-description">'+esc(description)+'</div>';
}
init();
})();
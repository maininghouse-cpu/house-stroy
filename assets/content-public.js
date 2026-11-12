(() => {
const sb=window.houseStroyClient;if(!sb)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function portfolio(){
 const root=document.querySelector("[data-portfolio-list]");if(!root)return;
 const {data,error}=await sb.from("portfolio_items").select("*").eq("is_published",true).order("sort_order").order("created_at",{ascending:false});
 if(error||!data)return;
 root.innerHTML=data.map(x=>'<article class="card">'+(x.image_url?'<img src="'+esc(x.image_url)+'" alt="'+esc(x.title)+'" loading="lazy">':'')+'<div class="card-body"><h3>'+esc(x.title)+'</h3><p>'+esc(x.description||"")+'</p><div class="meta">'+(x.area?'<span>'+esc(x.area)+' м²</span>':'')+(x.style?'<span>'+esc(x.style)+'</span>':'')+'</div></div></article>').join("")||"<p>Портфолио скоро пополнится новыми объектами.</p>";
}
async function reviews(){
 const root=document.querySelector("[data-reviews-list]");if(!root)return;
 const {data,error}=await sb.from("reviews").select("*").eq("is_published",true).order("sort_order").order("created_at",{ascending:false});
 if(error||!data)return;
 root.innerHTML=data.map(x=>'<article class="review"><div class="stars" aria-label="Оценка '+x.rating+' из 5">'+("★".repeat(Math.max(0,Math.min(5,Number(x.rating)||0))))+("☆".repeat(5-Math.max(0,Math.min(5,Number(x.rating)||0))))+'</div><blockquote>«'+esc(x.content)+'»</blockquote><small>'+esc(x.author)+(x.project_label?' · '+esc(x.project_label):'')+'</small></article>').join("")||"<p>Пока нет опубликованных отзывов.</p>";
}
portfolio();reviews();
})();
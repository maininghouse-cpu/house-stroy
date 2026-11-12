(() => {
const sb=window.houseStroyClient;if(!sb)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const say=(id,msg,bad=false)=>{const el=$(id);if(el){el.textContent=msg;el.style.color=bad?"#b82025":"";}};
async function uploadPhotos(id){
 const input=$("portfolioPhoto"),files=Array.from(input.files||[]);
 if(!files.length){try{return JSON.parse(input.dataset.galleryUrls||"[]");}catch{return $("portfolioImage").value.trim()?[$("portfolioImage").value.trim()]:[];}}
 const urls=[];
 for(let i=0;i<files.length;i++){
  const file=files[i];if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Файлы должны быть JPG, PNG или WebP.");if(file.size>15*1024*1024)throw new Error("Размер каждой фотографии — до 15 МБ.");
  const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[file.type],path=id+"/"+crypto.randomUUID()+"."+ext;
  say("portfolioStatus","Загружаю фото "+(i+1)+" из "+files.length+"…");
  const {error}=await sb.storage.from("portfolio-media").upload(path,file,{contentType:file.type,cacheControl:"3600",upsert:false});if(error)throw error;
  urls.push(sb.storage.from("portfolio-media").getPublicUrl(path).data.publicUrl);
 }
 return urls;
}
async function loadPortfolio(){
 const {data,error}=await sb.from("portfolio_items").select("*").order("sort_order").order("created_at",{ascending:false});if(error)throw error;
 $("portfolioAdminList").innerHTML=(data||[]).map(x=>'<div class="project-row"><span>'+(x.image_url?'<img src="'+esc(x.image_url)+'" alt="" style="width:76px;height:54px;object-fit:cover;border-radius:7px;vertical-align:middle;margin-right:8px">':'')+'<b>'+esc(x.title)+'</b><br><small>'+(x.is_published?"Опубликовано":"Скрыто")+' · '+esc(x.area||"—")+' м² · '+((x.gallery_urls||[]).length|| (x.image_url?1:0))+' фото</small></span><span><button class="secondary" type="button" data-pedit="'+x.id+'">Изменить</button> <button class="secondary danger" type="button" data-pdelete="'+x.id+'">Удалить</button></span></div>').join("")||"<p>Портфолио пока пустое.</p>";
 (data||[]).forEach(x=>{
  const edit=document.querySelector('[data-pedit="'+x.id+'"]');if(edit)edit.onclick=()=>{
   $("portfolioId").value=x.id;$("portfolioTitle").value=x.title;$("portfolioDescription").value=x.description||"";$("portfolioImage").value=x.image_url||"";$("portfolioPhoto").value="";
   const gallery=x.gallery_urls&&x.gallery_urls.length?x.gallery_urls:(x.image_url?[x.image_url]:[]);$("portfolioPhoto").dataset.galleryUrls=JSON.stringify(gallery);
   $("portfolioPhotoPreview").innerHTML=gallery.map(url=>'<img src="'+esc(url)+'" alt="" style="max-width:110px;max-height:80px;object-fit:cover;border-radius:8px;margin:3px">').join("")||"Фото ещё не добавлено";
   $("portfolioArea").value=x.area??"";$("portfolioStyle").value=x.style||"";$("portfolioPublished").checked=x.is_published;$("portfolioOrder").value=x.sort_order||0;say("portfolioStatus","Редактирование: "+x.title);
  };
  const del=document.querySelector('[data-pdelete="'+x.id+'"]');if(del)del.onclick=async()=>{if(!confirm("Удалить объект портфолио «"+x.title+"»?"))return;const {error}=await sb.from("portfolio_items").delete().eq("id",x.id);if(error){say("portfolioStatus","Ошибка удаления: "+error.message,true);return;}await loadPortfolio();say("portfolioStatus","Объект удалён.");};
 });
}
async function loadReviews(){
 const {data,error}=await sb.from("reviews").select("*").order("sort_order").order("created_at",{ascending:false});if(error)throw error;
 $("reviewsAdminList").innerHTML=(data||[]).map(x=>'<div class="project-row"><span><b>'+esc(x.author)+'</b><br><small>'+(x.is_published?"Опубликован":"Скрыт")+' · '+esc(x.project_label||"Без подписи")+'</small></span><span><button class="secondary" type="button" data-redit="'+x.id+'">Изменить</button> <button class="secondary danger" type="button" data-rdelete="'+x.id+'">Удалить</button></span></div>').join("")||"<p>Отзывов пока нет.</p>";
 (data||[]).forEach(x=>{
  const edit=document.querySelector('[data-redit="'+x.id+'"]');if(edit)edit.onclick=()=>{$("reviewId").value=x.id;$("reviewAuthor").value=x.author;$("reviewProject").value=x.project_label||"";$("reviewContent").value=x.content;$("reviewRating").value=String(x.rating);$("reviewPublished").checked=x.is_published;$("reviewOrder").value=x.sort_order||0;say("reviewStatus","Редактирование отзыва: "+x.author);};
  const del=document.querySelector('[data-rdelete="'+x.id+'"]');if(del)del.onclick=async()=>{if(!confirm("Удалить отзыв клиента «"+x.author+"»?"))return;const {error}=await sb.from("reviews").delete().eq("id",x.id);if(error){say("reviewStatus","Ошибка удаления: "+error.message,true);return;}await loadReviews();say("reviewStatus","Отзыв удалён.");};
 });
}
function clearPortfolio(){$("portfolioAdminForm").reset();$("portfolioId").value="";$("portfolioOrder").value="0";$("portfolioPhoto").dataset.galleryUrls="[]";$("portfolioPhotoPreview").textContent="";say("portfolioStatus","Новый объект портфолио.");}
function clearReview(){$("reviewsAdminForm").reset();$("reviewId").value="";$("reviewOrder").value="0";$("reviewRating").value="5";say("reviewStatus","Новый отзыв.");}
$("portfolioAdminForm").addEventListener("submit",async e=>{
 e.preventDefault();const id=$("portfolioId").value||crypto.randomUUID(),btn=$("portfolioAdminForm").querySelector('[type="submit"]');btn.disabled=true;
 try{const gallery=await uploadPhotos(id),cover=gallery[0]||$("portfolioImage").value.trim()||null;
 const row={id,title:$("portfolioTitle").value.trim(),description:$("portfolioDescription").value.trim(),image_url:cover,gallery_urls:gallery,area:Number($("portfolioArea").value)||null,style:$("portfolioStyle").value.trim()||null,is_published:$("portfolioPublished").checked,sort_order:Number($("portfolioOrder").value)||0,updated_at:new Date().toISOString()};
 const {error}=await sb.from("portfolio_items").upsert(row);if(error)throw error;await loadPortfolio();clearPortfolio();say("portfolioStatus","Объект и фотографии сохранены.");
 }catch(err){say("portfolioStatus","Ошибка сохранения: "+err.message,true);}finally{btn.disabled=false;}
});
$("reviewsAdminForm").addEventListener("submit",async e=>{
 e.preventDefault();const id=$("reviewId").value||crypto.randomUUID(),row={id,author:$("reviewAuthor").value.trim(),project_label:$("reviewProject").value.trim()||null,content:$("reviewContent").value.trim(),rating:Number($("reviewRating").value),is_published:$("reviewPublished").checked,sort_order:Number($("reviewOrder").value)||0,updated_at:new Date().toISOString()},btn=$("reviewsAdminForm").querySelector('[type="submit"]');btn.disabled=true;
 try{const {error}=await sb.from("reviews").upsert(row);if(error)throw error;await loadReviews();clearReview();say("reviewStatus","Изменения отзывов сохранены.");}catch(err){say("reviewStatus","Ошибка сохранения: "+err.message,true);}finally{btn.disabled=false;}
});
$("portfolioPhoto").addEventListener("change",()=>{const files=Array.from($("portfolioPhoto").files||[]);$("portfolioPhotoPreview").innerHTML=files.map(f=>'<img src="'+URL.createObjectURL(f)+'" alt="Предпросмотр" style="max-width:110px;max-height:80px;object-fit:cover;border-radius:8px;margin:3px">').join("")||"Фото не выбрано";});
$("portfolioClear").onclick=clearPortfolio;$("reviewClear").onclick=clearReview;
async function init(){const {data:{user},error}=await sb.auth.getUser();if(error||!user||user.app_metadata?.role!=="admin")return;try{await Promise.all([loadPortfolio(),loadReviews()]);}catch(err){say("portfolioStatus","Не удалось загрузить портфолио: "+err.message,true);say("reviewStatus","Не удалось загрузить отзывы: "+err.message,true);}}
sb.auth.onAuthStateChange(()=>{setTimeout(init,0);});init();
})();
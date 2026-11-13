(() => {
const sb=window.houseStroyClient;if(!sb)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const say=(msg,bad=false)=>{const el=$("videoReviewStatus");if(el){el.textContent=msg;el.style.color=bad?"#b82025":"";}};
function isVkVideo(value){
 try{const u=new URL(value);if(!["vkvideo.ru","www.vkvideo.ru","vk.com","www.vk.com","vk.ru","www.vk.ru"].includes(u.hostname))return false;return u.pathname.includes("video_ext.php")||/video-?\d+_\d+/.test(u.pathname);}catch{return false;}
}
async function load(){
 const {data,error}=await sb.from("video_reviews").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
 if(error)throw error;
 const root=$("videoReviewsAdminList");
 root.innerHTML=(data||[]).map(x=>'<div class="project-row"><span><b>'+esc(x.title)+'</b><br><small>'+(x.is_published?"Опубликован":"Скрыт")+' · '+esc(x.video_url)+'</small></span><span><button class="secondary" type="button" data-vredit="'+x.id+'">Изменить</button> <button class="secondary danger" type="button" data-vrdelete="'+x.id+'">Удалить</button></span></div>').join("")||"<p>Видеоотзывов пока нет.</p>";
 (data||[]).forEach(x=>{
  const edit=root.querySelector('[data-vredit="'+x.id+'"]');
  if(edit)edit.onclick=()=>{$("videoReviewId").value=x.id;$("videoReviewTitle").value=x.title;$("videoReviewUrl").value=x.video_url;$("videoReviewDescription").value=x.description||"";$("videoReviewOrder").value=x.sort_order||0;$("videoReviewPublished").checked=x.is_published;say("Редактирование: "+x.title);$("videoReviewsManagement").scrollIntoView({behavior:"smooth",block:"start"});};
  const del=root.querySelector('[data-vrdelete="'+x.id+'"]');
  if(del)del.onclick=async()=>{if(!confirm('Удалить видеоотзыв «'+x.title+'»?'))return;const {error}=await sb.from("video_reviews").delete().eq("id",x.id);if(error){say("Ошибка удаления: "+error.message,true);return;}await load();say("Видеоотзыв удалён.");};
 });
}
function clear(){ $("videoReviewsAdminForm").reset();$("videoReviewId").value="";$("videoReviewOrder").value="0";$("videoReviewPublished").checked=true;say("Добавьте ссылку на видео, заголовок и описание.");}
$("videoReviewsAdminForm").addEventListener("submit",async e=>{
 e.preventDefault();const url=$("videoReviewUrl").value.trim();
 if(!isVkVideo(url)){say("Укажите корректную ссылку на видео VK (vkvideo.ru или vk.com).",true);return;}
 const btn=$("videoReviewsAdminForm").querySelector('[type="submit"]');btn.disabled=true;
 const id=$("videoReviewId").value||crypto.randomUUID();
 const row={id,title:$("videoReviewTitle").value.trim(),video_url:url,description:$("videoReviewDescription").value.trim(),sort_order:Number($("videoReviewOrder").value)||0,is_published:$("videoReviewPublished").checked,updated_at:new Date().toISOString()};
 try{const {error}=await sb.from("video_reviews").upsert(row);if(error)throw error;await load();clear();say("Видеоотзыв сохранён.");}
 catch(err){say("Ошибка сохранения: "+(err.message||String(err)),true);}
 finally{btn.disabled=false;}
});
$("videoReviewClear").addEventListener("click",clear);

async function loadPageMode(){
 const {data,error}=await sb.from("site_settings").select("value").eq("key","reviews_page_mode").maybeSingle();
 if(error)throw error;
 const mode=data?.value==="portfolio"?"portfolio":"video";
 $("reviewsPageMode").value=mode;
 sayMode(mode==="portfolio"?"На сайте отображается обзор построенных домов.":"На сайте отображаются видеоотзывы заказчиков.");
}
function sayMode(message,bad=false){const el=$("reviewsPageModeStatus");if(el){el.textContent=message;el.style.color=bad?"#b82025":"";}}
$("reviewsPageModeForm").addEventListener("submit",async e=>{
 e.preventDefault();const btn=$("reviewsPageModeForm").querySelector('[type="submit"]');btn.disabled=true;
 try{
  const mode=$("reviewsPageMode").value;
  const {error}=await sb.from("site_settings").upsert({key:"reviews_page_mode",value:mode,updated_at:new Date().toISOString()},{onConflict:"key"});
  if(error)throw error;
  sayMode("Режим сохранён. Страница и название пункта меню обновятся для посетителей сайта.");
 }catch(err){sayMode("Не удалось сохранить режим: "+err.message,true);}
 finally{btn.disabled=false;}
});

async function init(){const {data:{user},error}=await sb.auth.getUser();if(error||!user||user.app_metadata?.role!=="admin")return;try{await Promise.all([load(),loadPageMode()]);}catch(err){say("Не удалось загрузить настройки или видеоотзывы: "+err.message,true);}}
sb.auth.onAuthStateChange(()=>setTimeout(init,0));init();
})();
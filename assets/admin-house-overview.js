(() => {
const sb=window.houseStroyClient;if(!sb)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const form=$("houseOverviewVideoForm");if(!form)return;
const say=(msg,bad=false)=>{const el=$("houseOverviewVideoStatus");if(el){el.textContent=msg;el.style.color=bad?"#b82025":"";}};
function isVkVideo(value){try{const u=new URL(value);if(!["vkvideo.ru","www.vkvideo.ru","vk.com","www.vk.com","vk.ru","www.vk.ru"].includes(u.hostname))return false;return u.pathname.includes("video_ext.php")||/video-?\d+_\d+/.test(u.pathname);}catch{return false;}}
async function load(){
 const {data,error}=await sb.from("house_overview_videos").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
 if(error)throw error;
 const root=$("houseOverviewVideosList");
 root.innerHTML=(data||[]).map(x=>'<div class="project-row"><span><b>'+esc(x.title)+'</b><br><small>'+(x.is_published?"Опубликован":"Скрыт")+' · '+esc(x.video_url)+'</small><br><small>'+esc(x.description||"")+'</small></span><span><button class="secondary" type="button" data-hovid="'+x.id+'">Изменить</button> <button class="secondary danger" type="button" data-hovdelete="'+x.id+'">Удалить</button></span></div>').join("")||"<p>Видеообзоров домов пока нет.</p>";
 (data||[]).forEach(x=>{
  const edit=root.querySelector('[data-hovid="'+x.id+'"]');
  if(edit)edit.onclick=()=>{$("houseOverviewVideoId").value=x.id;$("houseOverviewVideoTitle").value=x.title;$("houseOverviewVideoUrl").value=x.video_url;$("houseOverviewVideoDescription").value=x.description||"";$("houseOverviewVideoOrder").value=x.sort_order||0;$("houseOverviewVideoPublished").checked=x.is_published;say("Редактирование: "+x.title);$("houseOverviewVideosManagement").scrollIntoView({behavior:"smooth",block:"start"});};
  const del=root.querySelector('[data-hovdelete="'+x.id+'"]');
  if(del)del.onclick=async()=>{if(!confirm('Удалить видеообзор «'+x.title+'»?'))return;const {error}=await sb.from("house_overview_videos").delete().eq("id",x.id);if(error){say("Ошибка удаления: "+error.message,true);return;}await load();say("Видеообзор удалён.");};
 });
}
function clear(){form.reset();$("houseOverviewVideoId").value="";$("houseOverviewVideoOrder").value="0";$("houseOverviewVideoPublished").checked=true;say("Добавьте название, ссылку на видео и описание.");}
form.addEventListener("submit",async e=>{
 e.preventDefault();const url=$("houseOverviewVideoUrl").value.trim();
 if(!isVkVideo(url)){say("Укажите корректную ссылку на видео VK (vkvideo.ru или vk.com).",true);return;}
 const btn=form.querySelector('[type="submit"]');btn.disabled=true;
 const id=$("houseOverviewVideoId").value||crypto.randomUUID();
 const row={id,title:$("houseOverviewVideoTitle").value.trim(),video_url:url,description:$("houseOverviewVideoDescription").value.trim(),sort_order:Number($("houseOverviewVideoOrder").value)||0,is_published:$("houseOverviewVideoPublished").checked,updated_at:new Date().toISOString()};
 try{const {error}=await sb.from("house_overview_videos").upsert(row);if(error)throw error;await load();clear();say("Видеообзор дома сохранён.");}
 catch(err){say("Ошибка сохранения: "+(err.message||String(err)),true);}
 finally{btn.disabled=false;}
});
$("houseOverviewVideoClear").addEventListener("click",clear);
async function init(){const {data:{user},error}=await sb.auth.getUser();if(error||!user||user.app_metadata?.role!=="admin")return;try{await load();}catch(err){say("Не удалось загрузить видеообзоры: "+err.message,true);}}
sb.auth.onAuthStateChange(()=>setTimeout(init,0));init();
})();
(() => {
const sb=window.houseStroyClient;if(!sb)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const say=(msg,bad=false)=>{const el=$("articleStatus");if(el){el.textContent=msg;el.style.color=bad?"#b82025":"";}};
let rows=[],gallery=[],originalGallery=[];
const bucketPrefix="/storage/v1/object/public/article-media/";
function clear(){ $("articleAdminForm").reset();$("articleId").value="";$("articleSlug").value="";$("articleOrder").value="0";$("articlePublished").checked=true;gallery=[];originalGallery=[];$("articleDelete").disabled=true;renderPhotos();say("Новая статья. Заполните поля и добавьте фотографии.");renderList();}
function fill(a){$("articleId").value=a.id;$("articleTitle").value=a.title;$("articleSlug").value=a.slug;$("articleSlug").dataset.touched="1";$("articleCategory").value=a.category||"Статья";$("articleExcerpt").value=a.excerpt||"";$("articleContent").value=a.content||"";$("articleOrder").value=a.sort_order||0;$("articlePublished").checked=!!a.is_published;gallery=[...new Set([...(a.cover_url?[a.cover_url]:[]),...(a.gallery_urls||[])])];originalGallery=[...gallery];$("articlePhotos").value="";$("articleDelete").disabled=false;renderPhotos();say("Редактируется: "+a.title);renderList();}
function renderList(){$("articleAdminList").innerHTML=rows.map(a=>'<div class="project-row '+(a.id===$("articleId").value?"is-editing":"")+'" data-article-edit="'+a.id+'"><span><b>'+esc(a.title)+'</b><br><small>'+(a.is_published?"Опубликована":"Черновик")+'</small></span><button type="button" class="secondary" data-article-open="'+a.id+'">Изменить</button></div>').join("")||"<p>Статей пока нет.</p>";$("articleAdminList").querySelectorAll("[data-article-open]").forEach(b=>b.onclick=()=>{const a=rows.find(x=>x.id===b.dataset.articleOpen);if(a)fill(a);});}
async function load(){const {data,error}=await sb.from("articles").select("*").order("sort_order").order("created_at",{ascending:false});if(error)throw error;rows=data||[];renderList();}
function renderPhotos(){
 const input=$("articlePhotos"),preview=$("articlePhotoPreview"),files=Array.from(input.files||[]);
 const saved=gallery.map((url,i)=>'<div class="thumb"><img src="'+esc(url)+'" alt="Фото '+(i+1)+'"><button type="button" data-article-remove-saved="'+i+'" aria-label="Удалить фото">×</button></div>').join("");
 const fresh=files.map((file,i)=>'<div class="thumb"><img src="'+URL.createObjectURL(file)+'" alt="Новое фото"><button type="button" data-article-remove-new="'+i+'" aria-label="Убрать новое фото">×</button></div>').join("");
 preview.innerHTML='<div class="thumbs">'+saved+fresh+'</div><small>'+ (gallery.length+files.length)+' фотографий · '+gallery.length+' сохранено, '+files.length+' новых</small>';
 preview.querySelectorAll("[data-article-remove-saved]").forEach(b=>b.onclick=()=>{gallery.splice(Number(b.dataset.articleRemoveSaved),1);renderPhotos();});
 preview.querySelectorAll("[data-article-remove-new]").forEach(b=>b.onclick=()=>{const dt=new DataTransfer(),remove=Number(b.dataset.articleRemoveNew);files.forEach((f,i)=>{if(i!==remove)dt.items.add(f);});input.files=dt.files;renderPhotos();});
}
async function uploadNewPhotos(id){
 const files=Array.from($("articlePhotos").files||[]),urls=[];
 for(let i=0;i<files.length;i++){
  const f=files[i];if(!["image/jpeg","image/png","image/webp","image/gif"].includes(f.type))throw new Error("Поддерживаются JPG, PNG, WebP и GIF.");
  if(f.size>15*1024*1024)throw new Error("Размер каждого фото — не более 15 МБ.");
  const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"}[f.type],key=id+"/"+crypto.randomUUID()+"."+ext;
  say("Загрузка фотографии "+(i+1)+" из "+files.length+"…");
  const {error}=await sb.storage.from("article-media").upload(key,f,{contentType:f.type,cacheControl:"3600",upsert:false});if(error)throw error;
  urls.push(sb.storage.from("article-media").getPublicUrl(key).data.publicUrl);
 }
 return urls;
}
async function deleteRemovedPhotos(oldUrls,newUrls){
 const paths=oldUrls.filter(url=>!newUrls.includes(url)).map(url=>{try{const p=new URL(url).pathname,at=p.indexOf(bucketPrefix);return at>=0?decodeURIComponent(p.slice(at+bucketPrefix.length)):null;}catch{return null;}}).filter(Boolean);
 if(paths.length){const {error}=await sb.storage.from("article-media").remove(paths);if(error)console.warn("Не удалось удалить файлы статьи из хранилища:",error.message);}
}
$("articleNew").onclick=clear;$("articleClear").onclick=clear;$("articlePhotos").addEventListener("change",renderPhotos);
$("articleTitle").addEventListener("input",()=>{if(!$("articleId").value&&!$("articleSlug").dataset.touched){const tr={"а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ё":"e","ж":"zh","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"ts","ч":"ch","ш":"sh","щ":"shch","ъ":"","ы":"y","ь":"","э":"e","ю":"yu","я":"ya"};const translit=$("articleTitle").value.toLowerCase().split("").map(ch=>tr[ch]??ch).join("");$("articleSlug").value="article-"+translit.replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80);}});
$("articleSlug").addEventListener("input",()=>{$("articleSlug").dataset.touched="1";$("articleSlug").value=$("articleSlug").value.toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-");});
$("articleAdminForm").addEventListener("submit",async e=>{e.preventDefault();const btn=$("articleAdminForm").querySelector('[type="submit"]');btn.disabled=true;try{
 const id=$("articleId").value||crypto.randomUUID(),slug=$("articleSlug").value.trim();if(!slug)throw new Error("Укажите адрес статьи.");
 const uploaded=await uploadNewPhotos(id),nextGallery=[...gallery,...uploaded];
 const row={id,slug,title:$("articleTitle").value.trim(),category:$("articleCategory").value,excerpt:$("articleExcerpt").value.trim(),content:$("articleContent").value.trim(),cover_url:nextGallery[0]||null,gallery_urls:nextGallery,is_published:$("articlePublished").checked,sort_order:Number($("articleOrder").value)||0,updated_at:new Date().toISOString()};
 const {error}=await sb.from("articles").upsert(row);if(error)throw error;
 await deleteRemovedPhotos(originalGallery,nextGallery);await load();const saved=rows.find(x=>x.id===id);if(saved)fill(saved);$("articlePhotos").value="";say("Статья и фотографии сохранены. Изменения опубликованы.");
 }catch(err){say("Ошибка сохранения: "+err.message,true);}finally{btn.disabled=false;}});
$("articleDelete").onclick=async()=>{const id=$("articleId").value,a=rows.find(x=>x.id===id);if(!id||!a||!confirm('Удалить статью «'+a.title+'»?'))return;try{const {error}=await sb.from("articles").delete().eq("id",id);if(error)throw error;await deleteRemovedPhotos(gallery,[]);await load();clear();say("Статья удалена.");}catch(err){say("Ошибка удаления: "+err.message,true);}};
async function init(){const {data:{user},error}=await sb.auth.getUser();if(error||!user||user.app_metadata?.role!=="admin")return;try{await load();}catch(err){say("Не удалось загрузить статьи: "+err.message,true);}}
sb.auth.onAuthStateChange(()=>setTimeout(init,0));init();clear();
})();
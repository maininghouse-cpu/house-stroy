(() => {
const sb = window.houseStroyClient;
const $ = id => document.getElementById(id);
const categories = { images: "Дополнительные фотографии", threeD: "3D-визуализации", plans: "Планы этажей", facades: "Фасады" };
let projects = [], currentId = null, cover = null, media = {images:[],threeD:[],plans:[],facades:[]}, user = null;
const status = (id, msg, bad=false) => { const el=$(id); if(el){el.textContent=msg;el.style.color=bad?"#b82025":"";} };
const slugify = s => s.toLowerCase().trim().replace(/ё/g,"e").replace(/[^a-zа-я0-9]+/gi,"-").replace(/^-|-$/g,"") || "house";
const escapeHtml = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const publicUrl = path => path ? sb.storage.from("project-media").getPublicUrl(path).data.publicUrl : "";
function mapProject(row) {
 const spec=row.specifications||{}, rows=row.project_media||[];
 const grouped={images:[],threeD:[],plans:[],facades:[]};
 rows.sort((a,b)=>a.sort_order-b.sort_order).forEach(m=>{if(grouped[m.category])grouped[m.category].push({id:m.id,path:m.storage_path,url:publicUrl(m.storage_path),title:m.title||""})});
 return {id:row.id,slug:row.slug,specifications:spec,name:row.title,description:row.description||"",shortDescription:row.short_description||"",price:row.price||0,totalArea:row.total_area||0,livingArea:row.living_area||0,floors:row.floors||1,bedrooms:row.bedrooms||0,bathrooms:row.bathrooms||0,published:row.is_published,featured:row.is_featured,sortOrder:row.sort_order||0,cover:spec.cover_path?{path:spec.cover_path,url:publicUrl(spec.cover_path)}:(spec.cover_url?{path:null,url:spec.cover_url}:null),media:grouped};
}
async function loadProjects() {
 const {data,error}=await sb.from("projects").select("*, project_media(*)").order("sort_order").order("created_at",{ascending:false});
 if(error)throw error; projects=(data||[]).map(mapProject); renderList();
}
function renderList(){
 $("projectList").innerHTML=projects.map(p=>'<div class="project-row"><span>'+escapeHtml(p.name)+'<br><small>'+(p.published?"Опубликован":"Черновик")+'</small></span><button class="secondary" type="button" data-edit="'+p.id+'">Изменить</button></div>').join("")||"<p>Проектов пока нет.</p>";
 document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>loadForm(b.dataset.edit));
}
function clearForm(){
 currentId=null;cover=null;media={images:[],threeD:[],plans:[],facades:[]};$("editor").reset();$("id").value="";$("delete").disabled=true;
 renderThumbs("cover");Object.keys(categories).forEach(renderThumbs);status("editorStatus","Новый проект. Заполните характеристики и сохраните.");
}
function renderThumbs(key){
 const target=$(key==="cover"?"coverPreview":key+"Thumbs"); if(!target)return;
 const list=key==="cover"?(cover?[cover]:[]):media[key];
 target.innerHTML=list.map((item,i)=>'<div class="thumb"><img src="'+escapeHtml(item.url||"")+'" alt=""><button type="button" data-remove="'+key+'" data-index="'+i+'">×</button></div>').join("");
 target.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{const k=b.dataset.remove,idx=Number(b.dataset.index);if(k==="cover")cover=null;else media[k].splice(idx,1);renderThumbs(k);});
}
function loadForm(id){
 const p=projects.find(x=>x.id===id);if(!p)return;currentId=p.id;cover=p.cover?{...p.cover}:null;
 media=Object.fromEntries(Object.keys(categories).map(k=>[k,[...(p.media[k]||[])].map(x=>({...x}))]));
 $("id").value=p.id;$("name").value=p.name;$("price").value=p.price;$("totalArea").value=p.totalArea;$("livingArea").value=p.livingArea;$("floors").value=p.floors;$("bedrooms").value=p.bedrooms;$("bathrooms").value=p.bathrooms;$("shortDescription").value=p.shortDescription;$("description").value=p.description;$("published").checked=p.published;$("featured").checked=p.featured;$("delete").disabled=false;
 renderThumbs("cover");Object.keys(categories).forEach(renderThumbs);status("editorStatus","Редактирование проекта. Сохраните изменения после проверки.");
}
async function compressImage(file){
 if(!file.type.startsWith("image/"))throw new Error("Разрешены только изображения.");
 if(file.size>50*1024*1024)throw new Error("Файл превышает лимит 50 МБ.");
 if(!("createImageBitmap" in window))return file;
 let bitmap;
 try{bitmap=await createImageBitmap(file);}catch(_){return file;}
 try{
  const maxSide=2200,scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  if(scale===1&&file.size<450*1024)return file;
  const canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
  const ctx=canvas.getContext("2d",{alpha:false});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/webp",0.82));
  if(!blob||blob.size>=file.size)return file;
  const base=file.name.replace(/\\.[^.]+$/,"")||"image";
  return new File([blob],base+".webp",{type:"image/webp",lastModified:Date.now()});
 }finally{bitmap.close?.();}
}
async function uploadFile(file,projectId,kind){
 const optimized=await compressImage(file);
 const ext=optimized.type==="image/webp"?"webp":optimized.type==="image/png"?"png":optimized.type==="image/avif"?"avif":"jpg";
 const path=projectId+"/"+kind+"/"+crypto.randomUUID()+"."+ext;
 const {error}=await sb.storage.from("project-media").upload(path,optimized,{contentType:optimized.type,upsert:false});
 if(error)throw error;
 return {path,url:publicUrl(path),optimizedBytes:optimized.size,originalBytes:file.size};
}
async function saveProject(e){
 e?.preventDefault();
 status("editorStatus","Нажатие зарегистрировано. Начинаю сохранение…");
 const saveBtn=$("saveProjectBtn");if(saveBtn)saveBtn.disabled=true;
 status("editorStatus","Сохраняю проект и фотографии…");
 try{
  const id=currentId||crypto.randomUUID(),name=$("name").value.trim(),old=projects.find(p=>p.id===id);
  if(!name){$("name").focus();throw new Error("Сначала укажите название проекта.");}
  const specs={...(old?.specifications||{})};
  let coverPath=cover?.path||null,coverUrl=cover?.path?null:(cover?.url||null);
  if(cover?.file){const uploaded=await uploadFile(cover.file,id,"cover");coverPath=uploaded.path;coverUrl=null;}
  if(cover===null){coverPath=null;coverUrl=null;}
  if(coverPath)specs.cover_path=coverPath;else delete specs.cover_path;
  if(coverUrl)specs.cover_url=coverUrl;else delete specs.cover_url;
  const row={id,slug:slugify(name)+"-"+id.slice(0,8),title:name,short_description:$("shortDescription").value.trim(),description:$("description").value.trim(),total_area:Number($("totalArea").value)||null,living_area:Number($("livingArea").value)||null,price:Number($("price").value)||null,floors:Number($("floors").value)||1,bedrooms:Number($("bedrooms").value)||0,bathrooms:Number($("bathrooms").value)||0,is_published:$("published").checked,is_featured:$("featured").checked,sort_order:old?.sortOrder||0,specifications:specs};
  const {error:upsertError}=await sb.from("projects").upsert(row);if(upsertError)throw upsertError;
  const keepPaths=new Set();if(coverPath)keepPaths.add(coverPath);
  const inserts=[];
  for(const [category,list] of Object.entries(media)){
   for(let i=0;i<list.length;i++){
    let item=list[i];if(item.file)item=await uploadFile(item.file,id,category);
    if(item.path){keepPaths.add(item.path);if(!item.id)inserts.push({project_id:id,category,storage_path:item.path,title:item.title||null,alt_text:name,sort_order:i});}
   }
  }
  const oldPaths=[...(old?.cover?.path?[old.cover.path]:[]),...Object.values(old?.media||{}).flat().map(x=>x.path).filter(Boolean)];
  const removed=oldPaths.filter(path=>!keepPaths.has(path));
  if(removed.length){
   const {data:oldRows}=await sb.from("project_media").select("id,storage_path").eq("project_id",id);
   const ids=(oldRows||[]).filter(x=>removed.includes(x.storage_path)).map(x=>x.id);
   if(ids.length){const {error}=await sb.from("project_media").delete().in("id",ids);if(error)throw error;}
   const {error}=await sb.storage.from("project-media").remove(removed);if(error)console.warn("Не удалось удалить старые файлы",error);
  }
  if(inserts.length){const {error}=await sb.from("project_media").insert(inserts);if(error)throw error;}
  for(const [category,list] of Object.entries(media)){
   for(let i=0;i<list.length;i++){
    const item=list[i];
    if(item.id){const {error}=await sb.from("project_media").update({sort_order:i}).eq("id",item.id);if(error)throw error;}
   }
  }
  await loadProjects();loadForm(id);status("editorStatus","Проект сохранён в Supabase. "+(row.is_published?"Он опубликован на сайте.":"Он сохранён как черновик."));
 }catch(err){console.error(err);status("editorStatus","Ошибка сохранения: "+(err.message||"неизвестная ошибка"),true);}
 finally{if(saveBtn)saveBtn.disabled=false;}
}
async function deleteProject(){
 if(!currentId||!confirm("Удалить проект и связанные фотографии?"))return;
 try{
  const p=projects.find(x=>x.id===currentId),paths=[...(p?.cover?.path?[p.cover.path]:[]),...Object.values(p?.media||{}).flat().map(x=>x.path).filter(Boolean)];
  const {error}=await sb.from("projects").delete().eq("id",currentId);if(error)throw error;
  if(paths.length){const {error:storageError}=await sb.storage.from("project-media").remove(paths);if(storageError)console.warn(storageError);}
  await loadProjects();clearForm();status("editorStatus","Проект удалён.");
 }catch(err){status("editorStatus","Ошибка удаления: "+err.message,true);}
}
function setupUploads(){
 $("imageGroups").innerHTML=Object.entries(categories).map(([k,label])=>'<div class="group"><h3>'+label+'</h3><div class="drop" data-drop="'+k+'">Нажмите или перетащите сюда изображения<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden></div><div class="thumbs" id="'+k+'Thumbs"></div></div>').join("");
 document.querySelectorAll("[data-drop]").forEach(el=>{
  const key=el.dataset.drop,input=el.querySelector("input");
  el.onclick=e=>{if(e.target!==input)input.click();};input.onchange=()=>addFiles(key,input.files);
  el.ondragover=e=>{e.preventDefault();el.classList.add("over");};el.ondragleave=()=>el.classList.remove("over");
  el.ondrop=e=>{e.preventDefault();el.classList.remove("over");addFiles(key,e.dataTransfer.files);};
 });
}
function addFiles(key,fileList){
 for(const file of [...fileList])if(file.type.startsWith("image/")){
  const item={file,url:URL.createObjectURL(file),path:null};
  if(key==="cover")cover=item;else media[key].push(item);
 }renderThumbs(key);
}
async function openWorkspace(){
 const {data:{user:authUser},error}=await sb.auth.getUser();
 if(error||!authUser){$("loginPanel").classList.remove("hidden");$("workspace").classList.add("hidden");return;}
 user=authUser;
 if(user.app_metadata?.role!=="admin"){await sb.auth.signOut();status("loginStatus","У этой учётной записи нет роли администратора.",true);return;}
 $("loginPanel").classList.add("hidden");$("workspace").classList.remove("hidden");
 $("sessionStatus").textContent="Вы вошли как "+user.email+" · роль admin";
 setupUploads();clearForm();
 try{await loadProjects();}catch(err){status("sessionStatus","Не удалось загрузить проекты: "+err.message,true);}
}
$("loginForm").onsubmit=async e=>{
 e.preventDefault();status("loginStatus","Выполняется вход…");
 const {error}=await sb.auth.signInWithPassword({email:$("loginEmail").value.trim(),password:$("loginPassword").value});
 if(error){status("loginStatus","Ошибка входа: "+error.message,true);return;}
 await openWorkspace();
};
$("logout").onclick=async()=>{await sb.auth.signOut();location.reload();};
window.houseStroySaveProject = async function(e){
 e?.preventDefault();
 const btn=$("saveProjectBtn");
 if(btn.dataset.busy==="1")return;
 btn.dataset.busy="1";
 status("editorStatus","Кнопка сохранения нажата. Запускаю сохранение…");
 try{await saveProject(e);}catch(err){console.error(err);status("editorStatus","Ошибка: "+(err.message||String(err)),true);}
 finally{btn.dataset.busy="0";}
};
window.houseStroyDeleteProject = async function(e){
 e?.preventDefault();
 status("editorStatus","Запущено удаление проекта…");
 try{await deleteProject();}catch(err){console.error(err);status("editorStatus","Ошибка удаления: "+(err.message||String(err)),true);}
};
$("new").onclick=clearForm;$("clear").onclick=clearForm;
$("coverFile")?.addEventListener("change",e=>addFiles("cover",e.target.files));
setupUploads();sb.auth.onAuthStateChange((_event)=>{setTimeout(openWorkspace,0);});openWorkspace();
})();
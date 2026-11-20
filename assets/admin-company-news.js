(() => {
  const sb = window.houseStroyClient;
  if (!sb) return;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const say = (message, bad=false) => { const el=$("companyNewsStatusMessage"); if(el){el.textContent=message;el.style.color=bad?"#b82025":"";} };
  let rows = [], gallery = [], originalGallery = [];
  const bucketPrefix = "/storage/v1/object/public/article-media/";
  function clearForm() {
    $("companyNewsAdminForm").reset();
    $("companyNewsId").value="";
    $("companyNewsOrder").value=String(rows.length+1);
    $("companyNewsStatus").value="completed";
    $("companyNewsPublished").checked=true;
    gallery=[]; originalGallery=[]; $("companyNewsPhotos").value=""; renderPhotos();
    say("Новая новость. Заполните поля и добавьте фотографии.");
  }
  function renderList() {
    $("companyNewsAdminList").innerHTML = rows.map((row,index) =>
      '<div class="project-row '+($("companyNewsId").value===row.id?"is-editing":"")+'"><span><b>'+esc(row.title)+'</b><br><small>'+esc(row.news_date||"Без даты")+' · '+(row.is_published?"Опубликовано":"Скрыто")+' · '+(row.construction_status==="building"?"Строится":"Построен")+'</small></span><span class="company-news-row-actions"><button class="secondary" type="button" data-company-news-up="'+row.id+'" aria-label="Переместить новость выше" title="Переместить выше" '+(index===0?'disabled':'')+'>↑</button> <button class="secondary" type="button" data-company-news-down="'+row.id+'" aria-label="Переместить новость ниже" title="Переместить ниже" '+(index===rows.length-1?'disabled':'')+'>↓</button> <button class="secondary" type="button" data-company-news-edit="'+row.id+'">Изменить</button> <button class="secondary danger" type="button" data-company-news-delete="'+row.id+'">Удалить</button></span></div>'
    ).join("") || "<p class='muted'>Новостей пока нет.</p>";
    $("companyNewsAdminList").querySelectorAll("[data-company-news-up]").forEach(button => button.addEventListener("click",()=>moveRow(button.dataset.companyNewsUp,-1)));
    $("companyNewsAdminList").querySelectorAll("[data-company-news-down]").forEach(button => button.addEventListener("click",()=>moveRow(button.dataset.companyNewsDown,1)));
    $("companyNewsAdminList").querySelectorAll("[data-company-news-edit]").forEach(button => button.addEventListener("click",()=>editRow(button.dataset.companyNewsEdit)));
    $("companyNewsAdminList").querySelectorAll("[data-company-news-delete]").forEach(button => button.addEventListener("click",()=>deleteRow(button.dataset.companyNewsDelete)));
  }
  async function moveRow(id,direction) {
    const from=rows.findIndex(item=>item.id===id),to=from+direction;
    if(from<0||to<0||to>=rows.length)return;
    const reordered=[...rows];
    [reordered[from],reordered[to]]=[reordered[to],reordered[from]];
    const status=$("companyNewsStatusMessage");
    $("companyNewsAdminList").querySelectorAll("button").forEach(button=>button.disabled=true);
    say("Сохраняем новый порядок новостей…");
    try {
      for(let i=0;i<reordered.length;i++){
        const {error}=await sb.from("company_news").update({sort_order:(i+1)*10}).eq("id",reordered[i].id);
        if(error)throw error;
      }
      rows=reordered.map((item,i)=>({...item,sort_order:(i+1)*10}));
      renderList();
      const editing=rows.find(item=>item.id===$("companyNewsId").value);
      if(editing)$("companyNewsOrder").value=String(editing.sort_order);
      say("Порядок новостей сохранён и обновлён на сайте.");
    } catch(error) {
      say("Не удалось изменить порядок: "+error.message,true);
      await load();
    }
  }
  function editRow(id) {
    const row=rows.find(item=>item.id===id); if(!row)return;
    $("companyNewsId").value=row.id;
    $("companyNewsTitle").value=row.title||"";
    $("companyNewsDate").value=row.news_date||"";
    $("companyNewsLocation").value=row.construction_location||"";
    $("companyNewsStyle").value=row.style||"";
    $("companyNewsStatus").value=row.construction_status||"completed";
    $("companyNewsStage").value=row.construction_stage||"";
    $("companyNewsImage").value=row.image_url||"";
    gallery=[...new Set([...(row.image_url?[row.image_url]:[]),...(row.gallery_urls||[])])]; originalGallery=[...gallery];
    $("companyNewsPhotos").value=""; renderPhotos();
    $("companyNewsUrl").value=row.source_url||"";
    $("companyNewsOrder").value=row.sort_order??0;
    $("companyNewsPublished").checked=!!row.is_published;
    say("Редактирование: "+row.title);
    renderList();
    $("companyNewsTitle").focus();
  }
  function renderPhotos() {
    const input=$("companyNewsPhotos"), preview=$("companyNewsPhotoPreview"), files=Array.from(input.files||[]);
    if(!preview)return;
    const saved=gallery.map((url,i)=>'<div class="thumb news-gallery-thumb"><img src="'+esc(url)+'" alt="Фото '+(i+1)+'"><div class="news-gallery-tools"><button type="button" data-news-move-up="'+i+'" aria-label="Переместить фото влево" '+(i===0?'disabled':'')+'>←</button><button type="button" data-news-move-down="'+i+'" aria-label="Переместить фото вправо" '+(i===gallery.length-1?'disabled':'')+'>→</button><button type="button" data-news-remove-saved="'+i+'" aria-label="Удалить фото">×</button></div><small>'+(i===0?'Обложка':'Фото '+(i+1))+'</small></div>').join("");
    const fresh=files.map((file,i)=>'<div class="thumb"><img src="'+URL.createObjectURL(file)+'" alt="Новое фото"><button type="button" data-news-remove-new="'+i+'" aria-label="Убрать новое фото">×</button><small>Новое фото '+(i+1)+'</small></div>').join("");
    preview.innerHTML='<style>.news-gallery-thumb{display:flex;flex-direction:column;gap:4px}.news-gallery-tools{display:flex;gap:3px;justify-content:center}.news-gallery-tools button{position:static;border:1px solid #aaa;border-radius:6px;background:var(--card,#fff);color:var(--text,#222);padding:3px 8px;cursor:pointer}.news-gallery-tools button:disabled{opacity:.3;cursor:default}.news-gallery-thumb>small{text-align:center;color:var(--muted,#777)}</style><div class="thumbs">'+saved+fresh+'</div><small>'+ (gallery.length+files.length)+' фотографий · перетаскивайте порядок стрелками · '+gallery.length+' сохранено, '+files.length+' новых</small>';
    preview.querySelectorAll("[data-news-move-up]").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.newsMoveUp);if(i<1)return;[gallery[i-1],gallery[i]]=[gallery[i],gallery[i-1]];$("companyNewsImage").value=gallery[0]||"";renderPhotos();});
    preview.querySelectorAll("[data-news-move-down]").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.newsMoveDown);if(i>=gallery.length-1)return;[gallery[i+1],gallery[i]]=[gallery[i],gallery[i+1]];$("companyNewsImage").value=gallery[0]||"";renderPhotos();});
    preview.querySelectorAll("[data-news-remove-saved]").forEach(b=>b.onclick=()=>{const removed=gallery.splice(Number(b.dataset.newsRemoveSaved),1)[0];if(removed===$("companyNewsImage").value)$("companyNewsImage").value=gallery[0]||"";renderPhotos();});
    preview.querySelectorAll("[data-news-remove-new]").forEach(b=>b.onclick=()=>{const dt=new DataTransfer(),remove=Number(b.dataset.newsRemoveNew);files.forEach((f,i)=>{if(i!==remove)dt.items.add(f);});input.files=dt.files;renderPhotos();});
  }
  async function uploadNewPhotos(id) {
    const files=Array.from($("companyNewsPhotos").files||[]), urls=[];
    for(let i=0;i<files.length;i++){
      const f=files[i];if(!["image/jpeg","image/png","image/webp","image/gif"].includes(f.type))throw new Error("Поддерживаются JPG, PNG, WebP и GIF.");
      if(f.size>15*1024*1024)throw new Error("Размер каждого фото — не более 15 МБ.");
      const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"}[f.type],key="company-news/"+id+"/"+crypto.randomUUID()+"."+ext;
      say("Загрузка фотографии "+(i+1)+" из "+files.length+"…");
      const {error}=await sb.storage.from("article-media").upload(key,f,{contentType:f.type,cacheControl:"3600",upsert:false});if(error)throw error;
      urls.push(sb.storage.from("article-media").getPublicUrl(key).data.publicUrl);
    }
    return urls;
  }
  async function deleteRemovedPhotos(oldUrls,newUrls) {
    const paths=oldUrls.filter(url=>!newUrls.includes(url)).map(url=>{try{const p=new URL(url).pathname,at=p.indexOf(bucketPrefix);return at>=0?decodeURIComponent(p.slice(at+bucketPrefix.length)):null;}catch{return null;}}).filter(path=>path&&path.startsWith("company-news/"));
    if(paths.length){const {error}=await sb.storage.from("article-media").remove(paths);if(error)console.warn("Не удалось удалить фото новости:",error.message);}
  }
  async function load() {
    const {data,error}=await sb.from("company_news").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
    if(error)throw error;
    rows=data||[];
    renderList();
  }
  async function deleteRow(id) {
    const row=rows.find(item=>item.id===id);if(!row)return;
    if(!confirm("Удалить новость «"+row.title+"»?"))return;
    const {error}=await sb.from("company_news").delete().eq("id",id);
    if(error){say("Ошибка удаления: "+error.message,true);return;}
    await deleteRemovedPhotos([...new Set([...(row.image_url?[row.image_url]:[]),...(row.gallery_urls||[])])],[]);
    await load();if($("companyNewsId").value===id)clearForm();
    say("Новость удалена.");
  }
  $("companyNewsAdminForm").addEventListener("submit",async event=>{
    event.preventDefault();
    const button=$("companyNewsAdminForm").querySelector('[type="submit"]');button.disabled=true;
    try {
      const id=$("companyNewsId").value||crypto.randomUUID();
      const row={
        id,
        title:$("companyNewsTitle").value.trim(),
        news_date:$("companyNewsDate").value.trim()||null,
        construction_location:$("companyNewsLocation").value.trim()||null,
        style:$("companyNewsStyle").value.trim()||null,
        construction_status:$("companyNewsStatus").value,
        construction_stage:$("companyNewsStage").value.trim()||null,
        image_url:(gallery[0]||$("companyNewsImage").value.trim())||null,
        gallery_urls:[...new Set([...gallery,...await uploadNewPhotos(id)])],
        source_url:$("companyNewsUrl").value.trim()||null,
        sort_order:Number($("companyNewsOrder").value)||0,
        is_published:$("companyNewsPublished").checked,
        updated_at:new Date().toISOString()
      };
      const {error}=await sb.from("company_news").upsert(row);
      if(error)throw error;
      const savedGallery=[...new Set([...gallery,...(row.gallery_urls||[])])];
      await deleteRemovedPhotos(originalGallery,savedGallery);
      await load();editRow(id);$("companyNewsPhotos").value="";say("Новость и фотографии сохранены. Изменения отображаются на сайте.");
    } catch(error) { say("Не удалось сохранить новость: "+error.message,true); }
    finally { button.disabled=false; }
  });
  $("companyNewsPhotos").addEventListener("change",renderPhotos);
  $("companyNewsNew").addEventListener("click",clearForm);
  $("companyNewsClear").addEventListener("click",clearForm);
  $("companyNewsDelete").addEventListener("click",async()=>{
    const id=$("companyNewsId").value;if(!id){say("Сначала выберите новость для удаления.",true);return;}
    await deleteRow(id);
  });
  async function init() {
    const {data:{user},error}=await sb.auth.getUser();
    if(error||!user||user.app_metadata?.role!=="admin")return;
    try{await load();if(!$("companyNewsId").value)$("companyNewsOrder").value=String(rows.length+1);}
    catch(error){say("Не удалось загрузить новости: "+error.message,true);}
  }
  sb.auth.onAuthStateChange(()=>{setTimeout(init,0);});
  init();
})();
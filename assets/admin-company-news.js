(() => {
  const sb = window.houseStroyClient;
  if (!sb) return;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const say = (message, bad=false) => { const el=$("companyNewsStatusMessage"); if(el){el.textContent=message;el.style.color=bad?"#b82025":"";} };
  let rows = [];
  function clearForm() {
    $("companyNewsAdminForm").reset();
    $("companyNewsId").value="";
    $("companyNewsOrder").value=String(rows.length+1);
    $("companyNewsStatus").value="completed";
    $("companyNewsPublished").checked=true;
    say("Новая новость. Заполните поля и нажмите «Сохранить новость».");
  }
  function renderList() {
    $("companyNewsAdminList").innerHTML = rows.map(row =>
      '<div class="project-row '+($("companyNewsId").value===row.id?"is-editing":"")+'"><span><b>'+esc(row.title)+'</b><br><small>'+esc(row.news_date||"Без даты")+' · '+(row.is_published?"Опубликовано":"Скрыто")+' · '+(row.construction_status==="building"?"Строится":"Построен")+'</small></span><span><button class="secondary" type="button" data-company-news-edit="'+row.id+'">Изменить</button> <button class="secondary danger" type="button" data-company-news-delete="'+row.id+'">Удалить</button></span></div>'
    ).join("") || "<p class='muted'>Новостей пока нет.</p>";
    $("companyNewsAdminList").querySelectorAll("[data-company-news-edit]").forEach(button => button.addEventListener("click",()=>editRow(button.dataset.companyNewsEdit)));
    $("companyNewsAdminList").querySelectorAll("[data-company-news-delete]").forEach(button => button.addEventListener("click",()=>deleteRow(button.dataset.companyNewsDelete)));
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
    $("companyNewsUrl").value=row.source_url||"";
    $("companyNewsOrder").value=row.sort_order??0;
    $("companyNewsPublished").checked=!!row.is_published;
    say("Редактирование: "+row.title);
    renderList();
    $("companyNewsTitle").focus();
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
        image_url:$("companyNewsImage").value.trim()||null,
        source_url:$("companyNewsUrl").value.trim()||null,
        sort_order:Number($("companyNewsOrder").value)||0,
        is_published:$("companyNewsPublished").checked,
        updated_at:new Date().toISOString()
      };
      const {error}=await sb.from("company_news").upsert(row);
      if(error)throw error;
      await load();editRow(id);say("Новость сохранена. Изменения отображаются на сайте.");
    } catch(error) { say("Не удалось сохранить новость: "+error.message,true); }
    finally { button.disabled=false; }
  });
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
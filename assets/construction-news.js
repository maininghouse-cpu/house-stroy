(() => {
  const root = document.querySelector("[data-construction-news]");
  if (!root) return;
  const list = root.querySelector("[data-news-list]");
  const filters = [...root.querySelectorAll("[data-news-filter]")];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const companyNews = [
    {title:"Завершилось строительство дома из СИП-панелей 7,5×7,5 — 33С",construction_location:"Электроугли, мкр. Светлый",style:"Дом из СИП-панелей",construction_status:"completed",construction_stage:"Строительство завершено",news_date:"27.04.2026",source_url:"https://www.house-stroy.com/novosti/zavershilos-stroitelstvo-doma-iz-sip-panelej-7,5x7,5-33s-metrov.html",image_url:"https://www.house-stroy.com/pic/news/%D0%9F%D0%B5%D1%87%D0%B5%D0%BD%D0%BA%D0%B8%D0%BD.jpg"},
    {title:"Закончилось строительство дома из СИП-панелей 8,8×13,5 м",construction_location:"Воронежская область, д. Медовка",style:"Дом из СИП-панелей",construction_status:"completed",construction_stage:"Строительство завершено",news_date:"10.03.2026",source_url:"https://www.house-stroy.com/novosti/zakonchilos-stroitelstvo-doma-iz-sip-panelej-8,8x13,5-metrov.html",image_url:"https://www.house-stroy.com/pic/news/%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D0%B5%D0%B6.jpg"},
    {title:"Завершилось строительство каркасного дома 10,2×14 м по семейной ипотеке",construction_location:"Москва, Зеленоград",style:"Каркасный дом",construction_status:"completed",construction_stage:"Строительство завершено",news_date:"18.02.2026",source_url:"https://www.house-stroy.com/novosti/zavershilos-stroitelstvo-karkasnogo-doma-10,2x14-metrov-po-semejnoj-ipoteke.html",image_url:"https://www.house-stroy.com/pic/news/%D0%A8%D0%B0%D1%82%D1%80%D0%BE%D0%B2.jpg"},
    {title:"Закончилось строительство дома из СИП-панелей 6×8 — 21С",construction_location:"Жуковский, СНТ «Облепиха»",style:"Дом из СИП-панелей",construction_status:"completed",construction_stage:"Строительство завершено",news_date:"22.01.2026",source_url:"https://www.house-stroy.com/novosti/zakonchilos-stroitelstvo-doma-iz-sip-panelej-6x8-21s.html",image_url:"https://www.house-stroy.com/pic/news/%D0%A0%D0%BE%D0%B6%D0%BA%D0%BE%D0%B2.jpg"},
    {title:"Завершилось строительство каркасного дома 10,3×14,7 м",construction_location:"Пушкинский район, рядом с д. Луговая",style:"Каркасный дом",construction_status:"completed",construction_stage:"Строительство завершено",news_date:"25.12.2025",source_url:"https://www.house-stroy.com/novosti/zavershilos-stroitelstvo-karkasnogo-doma-10,3x14,7-metrov.html",image_url:"https://www.house-stroy.com/pic/news/%D0%9C%D0%B8%D1%85%D0%B0%D0%B8%D0%BB%201.jpg"},
    {title:"Закончилось строительство дома из СИП-панелей 6,5×7,5 м",construction_location:"Пушкинский округ, Братовщина",style:"Дом из СИП-панелей",construction_status:"completed",construction_stage:"Строительство завершено",news_date:"03.11.2025",source_url:"https://www.house-stroy.com/novosti/zakonchilos-stroitelstvo-doma-iz-sip-panelej-6,5x7,5-m.html",image_url:"https://www.house-stroy.com/pic/news/%D0%94%D0%B8%D0%BC%D0%B0%20%D0%9F%D1%83%D1%88%D0%BA%D0%B8%D0%BD%D0%BE%201%20.jpg"},
    {title:"Закончилось строительство дома из СИП-панелей 8,6×14,5 м",construction_location:"Московская область, д. Щепино",style:"Дом из СИП-панелей",construction_status:"completed",construction_stage:"Строительство завершено",source_url:"https://www.house-stroy.com/novosti/zakonchilos-stroitelstvo-doma-iz-sip-panelej-8,6x14,5-m.html",image_url:"https://www.house-stroy.com/pic/news/%D0%90%D1%80%D1%81%D0%B5%D0%BD.jpg"},
    {title:"Закончилось строительство каркасной бани на плите",construction_location:"Ногинский район, п. Зелёный, СНТ «Краб»",style:"Каркасная баня",construction_status:"completed",construction_stage:"Строительство завершено",source_url:"https://www.house-stroy.com/novosti/zakonchilos-stroitelstvo-karkasnoj-bani-na-plite.html",image_url:"https://www.house-stroy.com/pic/news/%D0%91%D0%B0%D0%BD%D1%8F%20%D0%9A%D1%80%D0%B0%D0%B1.jpg"}
  ];
  let items = [...companyNews];
  let activeFilter = "all";
  const scrollButtons = [...root.querySelectorAll("[data-news-scroll]")];
  scrollButtons.forEach(button => button.addEventListener("click", () => {
    const direction = Number(button.dataset.newsScroll) || 1;
    list.scrollBy({ left: direction * list.clientWidth, behavior: "smooth" });
  }));

  function render() {
    const visible = items.filter(item => activeFilter === "all" || (item.construction_status || "completed") === activeFilter);
    filters.forEach(button => {
      const active = button.dataset.newsFilter === activeFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (!visible.length) {
      list.innerHTML = '<div class="construction-news-empty"><strong>' + (activeFilter === "building" ? "Сейчас нет объектов с этим статусом" : "Пока нет опубликованных объектов") + '</strong><span>Новые фотографии и этапы строительства появятся здесь после обновления раздела.</span></div>';
      return;
    }
    list.scrollLeft = 0;
    list.innerHTML = visible.map(item => {
      const status = item.construction_status === "building" ? "building" : "completed";
      const statusLabel = status === "building" ? "Строится" : "Построен";
      const image = item.image_url || (Array.isArray(item.gallery_urls) ? item.gallery_urls[0] : "") || "";
      const photoCount = new Set([...(image?[image]:[]),...(Array.isArray(item.gallery_urls)?item.gallery_urls:[])]).size;
      const rawTitle = String(item.title || "").trim();
      const title = /^\d+$/.test(rawTitle) ? (item.style || "Реализованный дом") : rawTitle;
      const details = [item.construction_location, item.area ? Number(item.area).toLocaleString("ru-RU") + " м²" : "", item.style].filter(Boolean);
      const stage = item.construction_stage || (status === "building" ? "Идут строительные работы" : "Готовый дом");
      const date = item.updated_at ? new Date(item.updated_at) : null;
      const dateLabel = item.news_date || (date && !Number.isNaN(date.getTime()) ? "Обновлено " + date.toLocaleDateString("ru-RU", {day:"numeric",month:"long",year:"numeric"}) : "");
      const detailUrl = item.id && item.news_date !== undefined ? "news.html?id=" + encodeURIComponent(item.id) : "portfolio.html";
      return '<article class="construction-news-card">' +
        '<a class="construction-news-image" href="' + esc(detailUrl) + '" aria-label="Открыть новость: ' + esc(title) + '">' +
          (image ? '<img src="' + esc(image) + '" alt="' + esc(title) + ' — фотографии объекта HOUSE STROY" loading="lazy">' : '<span class="construction-news-noimage">Фото объекта скоро появится</span>') +
          '<span class="construction-news-status ' + status + '">' + statusLabel + '</span>' +
          (photoCount > 1 ? '<span class="construction-news-count">+' + (photoCount - 1) + ' фото</span>' : '') +
        '</a>' +
        '<div class="construction-news-body">' +
          '<div class="construction-news-meta">' + details.map(x => '<span>' + esc(x) + '</span>').join("") + '</div>' +
          '<h3>' + esc(title) + '</h3>' +
          '<p class="construction-news-stage">' + esc(stage) + '</p>' +
          (dateLabel ? '<time class="construction-news-date">' + esc(dateLabel) + '</time>' : '') +
          '<a class="construction-news-link" href="' + esc(detailUrl) + '">Подробнее <span aria-hidden="true">↗</span></a>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  filters.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.newsFilter;
    render();
  }));

  async function load() {
    const client = window.houseStroyClient;
    if (!client) {
      items = companyNews;
      render();
      return;
    }
    try {
      const [{ data: newsData, error: newsError }, { data: portfolioData, error: portfolioError }] = await Promise.all([
        client.from("company_news")
          .select("id,title,image_url,gallery_urls,style,construction_status,construction_location,construction_stage,news_date,source_url,sort_order,updated_at")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
        client.from("portfolio_items")
          .select("id,title,image_url,area,style,is_published,sort_order,gallery_urls,construction_status,construction_location,construction_stage,updated_at")
          .eq("is_published", true)
          .order("updated_at", { ascending: false })
          .order("sort_order", { ascending: true })
      ]);
      if (newsError) throw newsError;
      if (portfolioError) throw portfolioError;
      items = [...(newsData || []), ...(portfolioData || [])];
      render();
    } catch (error) {
      console.error("Не удалось загрузить дополнительные объекты", error);
      items = companyNews;
      render();
    }
  }
  // Show the lightweight built-in preview immediately; replace it with live data when Supabase responds.
  render();
  load();
})();
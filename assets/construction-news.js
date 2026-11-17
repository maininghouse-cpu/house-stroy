(() => {
  const root = document.querySelector("[data-construction-news]");
  if (!root) return;
  const list = root.querySelector("[data-news-list]");
  const filters = [...root.querySelectorAll("[data-news-filter]")];
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  let items = [];
  let activeFilter = "all";

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
    list.innerHTML = visible.map(item => {
      const status = item.construction_status === "building" ? "building" : "completed";
      const statusLabel = status === "building" ? "Строится" : "Построен";
      const image = item.image_url || (Array.isArray(item.gallery_urls) ? item.gallery_urls[0] : "") || "";
      const photoCount = Array.isArray(item.gallery_urls) && item.gallery_urls.length ? item.gallery_urls.length : (image ? 1 : 0);
      const rawTitle = String(item.title || "").trim();
      const title = /^\d+$/.test(rawTitle) ? (item.style || "Реализованный дом") : rawTitle;
      const details = [item.construction_location, item.area ? Number(item.area).toLocaleString("ru-RU") + " м²" : "", item.style].filter(Boolean);
      const stage = item.construction_stage || (status === "building" ? "Идут строительные работы" : "Готовый дом");
      const date = item.updated_at ? new Date(item.updated_at) : null;
      const dateLabel = date && !Number.isNaN(date.getTime()) ? "Обновлено " + date.toLocaleDateString("ru-RU", {day:"numeric",month:"long",year:"numeric"}) : "";
      return '<article class="construction-news-card">' +
        '<a class="construction-news-image" href="portfolio.html" aria-label="Смотреть объект: ' + esc(title) + '">' +
          (image ? '<img src="' + esc(image) + '" alt="' + esc(title) + ' — фотографии объекта HOUSE STROY" loading="lazy">' : '<span class="construction-news-noimage">Фото объекта скоро появится</span>') +
          '<span class="construction-news-status ' + status + '">' + statusLabel + '</span>' +
          (photoCount > 1 ? '<span class="construction-news-count">+' + (photoCount - 1) + ' фото</span>' : '') +
        '</a>' +
        '<div class="construction-news-body">' +
          '<div class="construction-news-meta">' + details.map(x => '<span>' + esc(x) + '</span>').join("") + '</div>' +
          '<h3>' + esc(title) + '</h3>' +
          '<p class="construction-news-stage">' + esc(stage) + '</p>' +
          (dateLabel ? '<time class="construction-news-date">' + esc(dateLabel) + '</time>' : '') +
          '<a class="construction-news-link" href="portfolio.html">Смотреть объект <span aria-hidden="true">↗</span></a>' +
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
      list.innerHTML = '<p class="construction-news-error">Не удалось подключить ленту объектов. Попробуйте обновить страницу.</p>';
      return;
    }
    try {
      const { data, error } = await client.from("portfolio_items")
        .select("id,title,image_url,area,style,is_published,sort_order,gallery_urls,construction_status,construction_location,construction_stage,updated_at")
        .eq("is_published", true)
        .order("updated_at", { ascending: false })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      items = data || [];
      render();
    } catch (error) {
      console.error("Не удалось загрузить новости строительства", error);
      list.innerHTML = '<p class="construction-news-error">Не удалось загрузить объекты. Попробуйте обновить страницу позже.</p>';
    }
  }
  load();
})();
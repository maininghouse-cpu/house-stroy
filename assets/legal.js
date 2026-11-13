/* HOUSE STROY: legal dialogs and consent controls.
   Replace OPERATOR_* placeholders and set YANDEX_METRIKA_ID before production use. */
(function(){
  const KEY='house-stroy-cookie-consent-v1';
  const YANDEX_METRIKA_ID=0; // Add the real counter ID only after the operator has configured it.
  const operator='[Укажите полное наименование оператора / ФИО ИП]';
  const email='[Укажите рабочий email для обращений по персональным данным]';
  const style=`
  #hs-cookie[hidden]{display:none!important}#hs-cookie{position:fixed;left:0;right:0;bottom:0;z-index:10000;background:#171717;color:#fff;padding:17px 22px;box-shadow:0 -8px 30px #0003;display:flex;gap:20px;align-items:center;justify-content:center;font:13px/1.55 Inter,Arial,sans-serif}
  #hs-cookie p{max-width:850px;margin:0;color:#eee}#hs-cookie button{border:0;border-radius:4px;padding:12px 24px;background:#d71920;color:#fff;font-weight:700;cursor:pointer;white-space:nowrap}
  #hs-cookie a,#hs-legal a{color:#e04449;text-decoration:underline;cursor:pointer}
  #hs-legal{position:fixed;inset:0;z-index:10001;background:#000a;display:none;align-items:center;justify-content:center;padding:20px}
  #hs-legal .dialog{position:relative;width:min(760px,100%);max-height:85vh;overflow:auto;background:var(--surface,#fff);color:var(--text,#171717);padding:30px;border-radius:12px;box-shadow:0 20px 70px #0005}
  #hs-legal h2{font:700 25px Manrope,Arial,sans-serif;margin:0 42px 20px 0}#hs-legal h3{font-size:16px;margin:20px 0 8px}
  #hs-legal p,#hs-legal li{font-size:13px;line-height:1.7}#hs-legal .x{position:absolute;right:18px;top:14px;border:0;background:transparent;color:inherit;font-size:28px;cursor:pointer}
  .hs-legal-links{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;text-align:center;gap:10px 20px;margin:18px auto 0;font-size:12px;width:100%}
  .hs-consent{display:flex;gap:9px;align-items:flex-start;margin:14px 0;font-size:12px;line-height:1.5}.hs-consent input{margin-top:2px}
  @media(max-width:650px){#hs-cookie{align-items:stretch;flex-direction:column;gap:12px;padding:15px}#hs-cookie button{width:100%}#hs-legal .dialog{padding:23px 18px}}
  `;
  const css=document.createElement('style');css.textContent=style;document.head.appendChild(css);
  const shell=document.createElement('div');shell.innerHTML=`
  <div id="hs-cookie" role="region" aria-label="Уведомление о cookies" hidden>
    <p>Сайт использует необходимые технологии хранения данных. С вашего согласия может подключаться Яндекс.Метрика для анализа посещаемости. Нажимая «Принять», вы соглашаетесь на использование аналитических cookies. <a href="#" data-doc="cookies">Подробнее о cookies</a>.</p>
    <button type="button" id="hs-accept">Принять</button>
  </div>
  <div id="hs-legal" role="dialog" aria-modal="true" aria-labelledby="hs-title">
    <div class="dialog"><button class="x" type="button" aria-label="Закрыть">×</button><h2 id="hs-title"></h2><div id="hs-body"></div></div>
  </div>`;
  document.body.appendChild(shell);
  const modal=document.getElementById('hs-legal'),title=document.getElementById('hs-title'),body=document.getElementById('hs-body');
  const docs={
    agreement:{title:'Пользовательское соглашение',html:`
      <p><b>Владелец сайта:</b> ${operator}. <b>Контакт:</b> ${email}. Этот текст является базовым проектом и должен быть заполнен и проверен оператором до публикации.</p>
      <h3>1. Общие положения</h3><p>Используя сайт HOUSE STROY, пользователь подтверждает, что ознакомился с настоящими условиями. Сайт предоставляет информацию о проектах загородных домов, услугах и способах связи с компанией.</p>
      <h3>2. Информация и заявки</h3><p>Информация о проектах, характеристиках, сроках и стоимости носит ознакомительный характер и не является публичной офертой, если прямо не указано иное. Отправка формы не означает заключение договора. Условия работ согласуются отдельно.</p>
      <h3>3. Интеллектуальные права</h3><p>Материалы сайта охраняются законом. Копирование и использование материалов допускаются только с согласия правообладателя или на ином законном основании.</p>
      <h3>4. Ответственность и изменения</h3><p>Оператор принимает разумные меры для актуальности информации, но не гарантирует отсутствие технических перерывов. Условия могут обновляться; актуальная редакция размещается на сайте.</p>
      <h3>5. Контакты</h3><p>По вопросам использования сайта: ${email}. Реквизиты оператора необходимо указать до публикации.</p>`},
    personal:{title:'Согласие на обработку персональных данных',html:`
      <p><b>Оператор:</b> ${operator}; адрес: [укажите адрес оператора]; email: ${email}.</p>
      <p>Настоящий текст — шаблон. Перед включением формы в работу необходимо указать реальные реквизиты оператора, цели, сроки и способы обработки, перечень обработчиков и порядок отзыва согласия.</p>
      <p>Я выражаю согласие оператору на обработку предоставленных мной персональных данных: имени, номера телефона, адреса электронной почты (если указан), а также сведений, содержащихся в сообщении, для ответа на обращение, подготовки предложения и связи по запросу.</p>
      <p>Операции могут включать сбор, запись, систематизацию, накопление, хранение, уточнение, использование, передачу уполномоченным обработчикам по поручению оператора, обезличивание, блокирование и удаление. Обработка осуществляется с использованием средств автоматизации и без них в соответствии с применимым законодательством.</p>
      <p>Согласие действует до достижения указанных целей либо до его отзыва, если иные сроки хранения не установлены законом. Отзыв можно направить на ${email}. Отзыв не влияет на законность обработки до его получения.</p>
      <p><b>Важно:</b> это общее согласие не заменяет отдельное согласие на распространение персональных данных и не является согласием на рекламные рассылки.</p>`},
    cookies:{title:'Уведомление о cookies',html:`
      <p>Сайт может использовать localStorage и cookies для сохранения выбранной темы, работы интерфейса и, после вашего согласия, аналитики посещаемости с помощью Яндекс.Метрики.</p>
      <h3>Аналитика</h3><p>Яндекс.Метрика может использовать идентификаторы и аналитические cookies для формирования статистики посещений. Аналитический счётчик должен запускаться только после нажатия «Принять». В этой версии сайта идентификатор счётчика не задан, поэтому Метрика не подключается до его настройки.</p>
      <h3>Управление согласием</h3><p>Вы можете принять использование аналитических cookies через баннер. Выбор сохраняется в localStorage браузера. Для отзыва согласия очистите данные сайта в настройках браузера; после этого баннер появится снова.</p>
      <p>Необходимое локальное хранение настроек интерфейса может использоваться для работы сайта. Оператор: ${operator}; контакт по вопросам обработки данных: ${email}.</p>`}
  };
  function openDoc(key){const d=docs[key];if(!d)return;title.textContent=d.title;body.innerHTML=d.html;modal.style.display='flex';document.body.style.overflow='hidden';}
  function close(){modal.style.display='none';document.body.style.overflow='';}
  modal.querySelector('.x').addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.style.display==='flex')close();});
  document.querySelectorAll('footer').forEach(f=>{const links=document.createElement('div');links.className='hs-legal-links';links.innerHTML='<a href="#" data-doc="agreement">Пользовательское соглашение</a><a href="#" data-doc="personal">Согласие на обработку персональных данных</a><a href="#" data-doc="cookies">Уведомление о cookies</a>';f.appendChild(links);});
  document.addEventListener('click',e=>{const a=e.target.closest('[data-doc]');if(a){e.preventDefault();openDoc(a.dataset.doc);}});
  const banner=document.getElementById('hs-cookie');
  if(!localStorage.getItem(KEY))banner.hidden=false;
  function loadMetrika(){if(!YANDEX_METRIKA_ID)return;if(window.ym)return;const s=document.createElement('script');s.src='https://mc.yandex.ru/metrika/tag.js';s.async=true;s.onload=()=>{window.ym(YANDEX_METRIKA_ID,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});};document.head.appendChild(s);window.ym=window.ym||function(){(window.ym.a=window.ym.a||[]).push(arguments);};}
  document.getElementById('hs-accept').addEventListener('click',()=>{localStorage.setItem(KEY,JSON.stringify({analytics:true,at:new Date().toISOString()}));banner.hidden=true;loadMetrika();});
  document.querySelectorAll('form').forEach(form=>{if(form.id==='leadForm'){const row=document.createElement('label');row.className='hs-consent';row.innerHTML='<input type="checkbox" name="personalConsent" required><span>Я даю согласие на обработку персональных данных в соответствии с <a href="#" data-doc="personal">согласием</a>.</span>';const submit=form.querySelector('[type="submit"]');if(submit)form.insertBefore(row,submit);}});
  // Consent is checked on submission by the browser; no form data is stored by this script.
})();
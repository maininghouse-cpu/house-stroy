(function(){const saved=localStorage.getItem('house-stroy-theme');if(saved)document.documentElement.dataset.theme=saved;const btn=document.querySelector('.theme');function label(){if(!btn)return;btn.textContent=document.documentElement.dataset.theme==='dark'?'☀ Лето':'❄ Зима'}label();if(btn)btn.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('house-stroy-theme',next);label()});const form=document.querySelector('#leadForm');if(form)form.addEventListener('submit',e=>{e.preventDefault();document.querySelector('#status').textContent='Спасибо! Форма демонстрационная — подключите CRM или почту для получения заявок.';form.reset()})
const callbackMarkup = `
<button class="callback-fab" type="button" aria-haspopup="dialog" aria-controls="callbackDialog">↗ <span>Обратный звонок</span></button>
<div class="callback-overlay" id="callbackDialog" aria-hidden="true">
 <section class="callback-dialog" role="dialog" aria-modal="true" aria-labelledby="callbackTitle">
  <button class="callback-close" type="button" aria-label="Закрыть">×</button>
  <div class="eyebrow-dark">HOUSE STROY</div>
  <h2 id="callbackTitle">Заказать обратный звонок</h2>
  <p>Оставьте номер телефона — подготовим письмо с вашей заявкой, чтобы вы могли отправить его нам.</p>
  <form id="callbackForm">
   <div class="field"><label for="callbackName">Ваше имя</label><input id="callbackName" name="name" autocomplete="name" placeholder="Как к вам обращаться?" required></div>
   <div class="field"><label for="callbackPhone">Номер телефона</label><input id="callbackPhone" name="phone" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></div>
   <button class="btn" type="submit">Подготовить заявку ↗</button>
   <p class="notice" id="callbackStatus" role="status">После нажатия откроется ваша почтовая программа с заполненной заявкой.</p>
  </form>
 </section>
</div>`;
document.body.insertAdjacentHTML('beforeend', callbackMarkup);
const callbackDialog=document.querySelector('#callbackDialog');
const callbackOpen=document.querySelector('.callback-fab');
const callbackClose=()=>{callbackDialog.classList.remove('is-open');callbackDialog.setAttribute('aria-hidden','true');};
callbackOpen.addEventListener('click',()=>{callbackDialog.classList.add('is-open');callbackDialog.setAttribute('aria-hidden','false');document.querySelector('#callbackName').focus();});
document.querySelector('.callback-close').addEventListener('click',callbackClose);
callbackDialog.addEventListener('click',e=>{if(e.target===callbackDialog)callbackClose();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&callbackDialog.classList.contains('is-open'))callbackClose();});
document.querySelector('#callbackForm').addEventListener('submit',e=>{
 e.preventDefault();
 const name=document.querySelector('#callbackName').value.trim();
 const phone=document.querySelector('#callbackPhone').value.trim();
 const subject=encodeURIComponent('Заказ обратного звонка — HOUSE STROY');
 const body=encodeURIComponent('Здравствуйте! Прошу перезвонить мне.\\nИмя: '+name+'\\nТелефон: '+phone);
 document.querySelector('#callbackStatus').textContent='Открываю почтовую программу. Проверьте письмо и нажмите «Отправить».';
 window.location.href='mailto:hello@housestroy.ru?subject='+subject+'&body='+body;
});
})();
(function(){const saved=localStorage.getItem('house-stroy-theme');if(saved)document.documentElement.dataset.theme=saved;const btn=document.querySelector('.theme');function label(){if(!btn)return;btn.textContent=document.documentElement.dataset.theme==='dark'?'☀ Лето':'❄ Зима'}label();if(btn)btn.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('house-stroy-theme',next);label()});const form=document.querySelector('#leadForm');if(form)form.addEventListener('submit',e=>{e.preventDefault();document.querySelector('#status').textContent='Спасибо! Форма демонстрационная — подключите CRM или почту для получения заявок.';form.reset()})
const callbackMarkup = `
<button class="callback-fab" type="button" aria-haspopup="dialog" aria-controls="callbackDialog"><span>Обратный звонок</span></button>
<div class="callback-overlay" id="callbackDialog" aria-hidden="true">
 <section class="callback-dialog" role="dialog" aria-modal="true" aria-labelledby="callbackTitle">
  <button class="callback-close" type="button" aria-label="Закрыть">×</button>
  <div class="callback-kicker">HOUSE STROY · НА СВЯЗИ</div>
  <h2 id="callbackTitle">Давайте обсудим ваш дом</h2>
  <p class="callback-intro">Оставьте имя и номер телефона — мы свяжемся с вами удобным способом.</p>
  <form id="callbackForm">
   <fieldset class="callback-method"><legend>Как с вами связаться?</legend>
    <div class="callback-methods">
     <button type="button" class="callback-method-option" data-method="MAX" aria-pressed="false">MAX</button>
     <button type="button" class="callback-method-option is-selected" data-method="Телефон" aria-pressed="true">Телефон</button>
    </div>
   </fieldset>
   <div class="callback-field"><label for="callbackName">Ваше имя</label><input id="callbackName" name="name" autocomplete="name" placeholder="Как к вам обращаться" required></div>
   <div class="callback-field"><label for="callbackPhone">Ваш телефон</label><input id="callbackPhone" name="phone" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required></div>
   <label class="callback-consent"><input id="callbackConsent" type="checkbox" required><span>Даю согласие на обработку персональных данных.</span></label>
   <button class="callback-submit" type="submit">Отправить заявку <span aria-hidden="true">↗</span></button>
   <p class="callback-note" id="callbackStatus" role="status">Свяжемся с вами в рабочее время.</p>
  </form>
 </section>
</div>`;
document.body.insertAdjacentHTML('beforeend', callbackMarkup);
const callbackDialog=document.querySelector('#callbackDialog');
const callbackOpen=document.querySelector('.callback-fab');
let callbackMethod='Телефон';
document.querySelectorAll('.callback-method-option').forEach(option=>option.addEventListener('click',()=>{
 callbackMethod=option.dataset.method;
 document.querySelectorAll('.callback-method-option').forEach(item=>{
  const active=item===option;
  item.classList.toggle('is-selected',active);
  item.setAttribute('aria-pressed',String(active));
 });
}));
const callbackClose=()=>{callbackDialog.classList.remove('is-open');callbackDialog.setAttribute('aria-hidden','true');};
callbackOpen.addEventListener('click',()=>{callbackDialog.classList.add('is-open');callbackDialog.setAttribute('aria-hidden','false');document.querySelector('#callbackName').focus();});
document.querySelector('.callback-close').addEventListener('click',callbackClose);
callbackDialog.addEventListener('click',e=>{if(e.target===callbackDialog)callbackClose();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&callbackDialog.classList.contains('is-open'))callbackClose();});
document.querySelector('#callbackForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const name=document.querySelector('#callbackName').value.trim();
 const phone=document.querySelector('#callbackPhone').value.trim();
 const submitButton=document.querySelector('.callback-submit');
 submitButton.disabled=true;
 submitButton.textContent='Отправляем…';
 try {
  const response=await fetch('https://gdzklvlyoyzokhzldnte.supabase.co/functions/v1/send-callback-request',{
   method:'POST',
   headers:{'Content-Type':'application/json'},
   body:JSON.stringify({name,phone,method:callbackMethod,consent:true,website:''})
  });
  const result=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(result.error||'Не удалось отправить заявку');
  document.querySelector('#callbackStatus').textContent='Заявка отправлена! Мы свяжемся с вами в рабочее время.';
  document.querySelector('#callbackForm').reset();
 } catch(error) {
  document.querySelector('#callbackStatus').textContent=error.message||'Ошибка отправки. Попробуйте ещё раз или позвоните нам.';
 } finally {
  submitButton.disabled=false;
  submitButton.innerHTML='Отправить заявку <span aria-hidden="true">↗</span>';
 }
});
})();
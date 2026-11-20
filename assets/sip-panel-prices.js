(() => {
const sb=window.houseStroyClient;
const defaults=[
 {length:2500,width:1250,thickness:124,osb:12,retail:4400,bulk:4100,qty:0},
 {length:2500,width:1250,thickness:174,osb:12,retail:4950,bulk:4600,qty:0},
 {length:2500,width:1250,thickness:224,osb:12,retail:5500,bulk:5150,qty:0},
 {length:2800,width:1250,thickness:124,osb:12,retail:4800,bulk:4400,qty:0},
 {length:2800,width:1250,thickness:174,osb:12,retail:5490,bulk:5050,qty:0},
 {length:2800,width:1250,thickness:224,osb:12,retail:6150,bulk:5650,qty:0}
];
const packageText='1. OSB-3 — Калевала (Россия), Экодом E 0,5&nbsp; 12мм<br>2. Клей — Adhesive-SIP 5-20LV<br>3. Фасадный негорючий пенополистирол ППС-Ф.<br><br>Самозатухающий, с антипиренами.';
const $=id=>document.getElementById(id),money=n=>Number(n||0).toLocaleString('ru-RU').replace(/[\u00a0\u202f]/g,' ');
let rows=defaults.map(x=>({...x}));
function render(){
 const root=$('sipPriceRows');if(!root)return;
 root.innerHTML=rows.map((r,i)=>'<tr>'+(i===0?'<td class="sip-package" rowspan="6">'+packageText+'</td>':'')+
 '<td>'+r.length+'</td><td>'+r.width+'</td><td>'+r.thickness+'</td><td>'+r.osb+'</td><td>'+money(r.retail)+'</td><td>'+money(r.bulk)+'</td>'+
 '<td><div class="sip-qty-control"><button type="button" data-minus="'+i+'" aria-label="Уменьшить количество">−</button><input type="number" min="0" step="1" value="'+r.qty+'" data-qty="'+i+'" aria-label="Количество панелей"><button type="button" data-plus="'+i+'" aria-label="Увеличить количество">+</button></div></td>'+
 '<td class="sip-row-cost">'+money(r.qty*(r.qty>=50?r.bulk:r.retail))+'</td></tr>').join('');
 const qty=rows.reduce((s,r)=>s+r.qty,0),cost=rows.reduce((s,r)=>s+r.qty*(r.qty>=50?r.bulk:r.retail),0);
 $('sipTotalQty').textContent=money(qty);$('sipTotalCost').textContent=money(cost);
 root.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>{const i=+b.dataset.minus;rows[i].qty=Math.max(0,rows[i].qty-1);render();});
 root.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>{rows[+b.dataset.plus].qty++;render();});
 root.querySelectorAll('[data-qty]').forEach(input=>input.onchange=()=>{const i=+input.dataset.qty;rows[i].qty=Math.max(0,Math.floor(Number(input.value)||0));render();});
}
async function load(){
 if(sb){const {data,error}=await sb.from('site_settings').select('value').eq('key','sip_panel_prices').maybeSingle();if(!error&&data?.value){try{const saved=JSON.parse(data.value);if(Array.isArray(saved)&&saved.length===6)rows=defaults.map((d,i)=>({...d,...saved[i],qty:0}));}catch(e){console.warn('Некорректный формат прайса СИП панелей',e);}}}
 render();
}
load();
const estimateForm=$('sipEstimateForm');
if(estimateForm){
 estimateForm.addEventListener('submit',async event=>{
  event.preventDefault();
  const status=$('sipEstimateStatus'),button=estimateForm.querySelector('[type="submit"]');
  const name=estimateForm.elements.name.value.trim(),phone=estimateForm.elements.phone.value.trim(),consent=estimateForm.elements.consent.checked;
  const selected=rows.filter(row=>row.qty>0).map(row=>({length:row.length,width:row.width,thickness:row.thickness,qty:row.qty,price:row.qty>=50?row.bulk:row.retail}));
  if(!selected.length){status.textContent='Добавьте количество хотя бы одной панели в таблице.';status.style.color='#b82025';return;}
  if(!name||!phone||!consent){status.textContent='Заполните имя, телефон и подтвердите согласие на обработку персональных данных.';status.style.color='#b82025';return;}
  if(!/^[+()0-9\\s-]{6,40}$/.test(phone)){status.textContent='Проверьте правильность номера телефона.';status.style.color='#b82025';return;}
  if(!sb?.functions){status.textContent='Не удалось подключиться к сервису отправки. Попробуйте позже или позвоните нам.';status.style.color='#b82025';return;}
  button.disabled=true;status.textContent='Отправляем расчёт…';status.style.color='';
  try{
   const {data,error}=await sb.functions.invoke('send-callback-request',{body:{type:'sip_panel_estimate',name,phone,consent:true,items:selected}});
   if(error)throw error;
   if(!data?.ok)throw new Error(data?.error||'Не удалось отправить расчёт.');
   status.textContent='Расчёт отправлен на info@house-stroy.com. Спасибо! Мы свяжемся с вами.';
   status.style.color='#168044';
   estimateForm.reset();
  }catch(error){
   status.textContent=error?.message||'Не удалось отправить расчёт. Попробуйте ещё раз.';
   status.style.color='#b82025';
  }finally{button.disabled=false;}
 });
}
})();
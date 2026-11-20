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
const greenboardDefaults=[
 {length:2800,width:1250,thickness:124,osb:12,retail:4800,bulk:4750,qty:0},
 {length:2800,width:1250,thickness:174,osb:12,retail:5490,bulk:5440,qty:0},
 {length:2800,width:1250,thickness:224,osb:12,retail:6150,bulk:6100,qty:0}
];
let greenboardRows=greenboardDefaults.map(x=>({...x}));
const packageText='<img class="sip-package-photo" src="data:image/webp;base64,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" alt="СИП панель в разрезе: плиты OSB и утеплитель из пенополистирола" loading="lazy"><br>1. OSB-3 — Калевала (Россия), Экодом E 0,5&nbsp; 12мм<br>2. Клей — Adhesive-SIP 5-20LV<br>3. Фасадный негорючий пенополистирол ППС-Ф.<br><br>Самозатухающий, с антипиренами.';
const $=id=>document.getElementById(id),money=n=>Number(n||0).toLocaleString('ru-RU').replace(/[\u00a0\u202f]/g,' ');
let rows=defaults.map(x=>({...x}));
function renderTable(rootId,items,group){
 const root=$(rootId);if(!root)return;
 root.innerHTML=items.map((r,i)=>'<tr>'+
 (i===0?'<td class="sip-package" rowspan="'+(group==='sip'?6:3)+'">'+packageText+'</td>':'')+
 '<td>'+r.length+'</td><td>'+r.width+'</td><td>'+r.thickness+'</td><td>'+r.osb+'</td><td>'+money(r.retail)+'</td><td>'+money(r.bulk)+'</td>'+
 '<td><div class="sip-qty-control"><button type="button" data-minus="'+group+'-'+i+'" aria-label="Уменьшить количество">−</button><input type="number" min="0" step="1" value="'+r.qty+'" data-qty="'+group+'-'+i+'" aria-label="Количество панелей"><button type="button" data-plus="'+group+'-'+i+'" aria-label="Увеличить количество">+</button></div></td>'+
 '<td class="sip-row-cost">'+money(r.qty*(r.qty>=50?r.bulk:r.retail))+'</td></tr>').join('');
 root.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>{const [g,n]=b.dataset.minus.split('-');const list=g==='sip'?rows:greenboardRows;list[+n].qty=Math.max(0,list[+n].qty-1);render();});
 root.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>{const [g,n]=b.dataset.plus.split('-');const list=g==='sip'?rows:greenboardRows;list[+n].qty++;render();});
 root.querySelectorAll('[data-qty]').forEach(input=>input.onchange=()=>{const [g,n]=input.dataset.qty.split('-');const list=g==='sip'?rows:greenboardRows;list[+n].qty=Math.max(0,Math.floor(Number(input.value)||0));render();});
}
function render(){
 renderTable('sipPriceRows',rows,'sip');
 renderTable('greenboardPriceRows',greenboardRows,'greenboard');
 const all=[...rows,...greenboardRows],qty=all.reduce((s,r)=>s+r.qty,0),cost=all.reduce((s,r)=>s+r.qty*(r.qty>=50?r.bulk:r.retail),0);
 $('sipTotalQty').textContent=money(qty);$('sipTotalCost').textContent=money(cost);
}
async function load(){
 if(sb){
  const {data,error}=await sb.from('site_settings').select('value').eq('key','sip_panel_prices').maybeSingle();
  if(!error&&data?.value){try{const saved=JSON.parse(data.value);if(Array.isArray(saved)&&saved.length===6)rows=defaults.map((d,i)=>({...d,...saved[i],qty:0}));}catch(e){console.warn('Некорректный формат прайса СИП панелей',e);}}
  const {data:greenData,error:greenError}=await sb.from('site_settings').select('value').eq('key','greenboard_sip_panel_prices').maybeSingle();
  if(!greenError&&greenData?.value){try{const savedGreen=JSON.parse(greenData.value);if(Array.isArray(savedGreen)&&savedGreen.length===3)greenboardRows=greenboardDefaults.map((d,i)=>({...d,...savedGreen[i],qty:0}));}catch(e){console.warn('Некорректный формат прайса Гринборд',e);}}
 }
 render();
}
load();
const estimateForm=$('sipEstimateForm');
if(estimateForm){
 estimateForm.addEventListener('submit',async event=>{
  event.preventDefault();
  const status=$('sipEstimateStatus'),button=estimateForm.querySelector('[type="submit"]');
  const name=estimateForm.elements.name.value.trim(),phone=estimateForm.elements.phone.value.trim(),consent=estimateForm.elements.consent.checked;
  const selected=[...rows.map(row=>({...row,material:'СИП панели'})),...greenboardRows.map(row=>({...row,material:'СИП панели из Гринборда'}))].filter(row=>row.qty>0).map(row=>({material:row.material,length:row.length,width:row.width,thickness:row.thickness,qty:row.qty,price:row.qty>=50?row.bulk:row.retail}));
  if(!selected.length){status.textContent='Добавьте количество хотя бы одной панели в таблице.';status.style.color='#b82025';return;}
  if(!name||!phone||!consent){status.textContent='Заполните имя, телефон и подтвердите согласие на обработку персональных данных.';status.style.color='#b82025';return;}
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
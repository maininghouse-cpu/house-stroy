(() => {
const sb=window.houseStroyClient;if(!sb)return;
const $=id=>document.getElementById(id);
const defaults=[
 {length:2500,width:1250,thickness:124,osb:12,retail:4400,bulk:4100},
 {length:2500,width:1250,thickness:174,osb:12,retail:4950,bulk:4600},
 {length:2500,width:1250,thickness:224,osb:12,retail:5500,bulk:5150},
 {length:2800,width:1250,thickness:124,osb:12,retail:4800,bulk:4400},
 {length:2800,width:1250,thickness:174,osb:12,retail:5490,bulk:5050},
 {length:2800,width:1250,thickness:224,osb:12,retail:6150,bulk:5650}
];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const say=(msg,bad=false)=>{const el=$('sipPanelPricesAdminStatus');if(el){el.textContent=msg;el.style.color=bad?'#b82025':'';}};
let prices=defaults.map(x=>({...x}));
function render(){ $('sipPanelPriceAdminRows').innerHTML=prices.map((p,i)=>'<tr><td>'+p.length+'</td><td>'+p.width+'</td><td>'+p.thickness+'</td><td>'+p.osb+'</td><td><input type="number" min="0" step="1" required data-price="retail" data-index="'+i+'" value="'+p.retail+'"></td><td><input type="number" min="0" step="1" required data-price="bulk" data-index="'+i+'" value="'+p.bulk+'"></td></tr>').join('');}
async function load(){const {data,error}=await sb.from('site_settings').select('value').eq('key','sip_panel_prices').maybeSingle();if(error)throw error;if(data?.value){try{const parsed=JSON.parse(data.value);if(Array.isArray(parsed)&&parsed.length===6)prices=defaults.map((d,i)=>({...d,...parsed[i]}));}catch(e){console.warn(e);}}render();say('Цены загружены. Измените нужные значения и сохраните.');}
$('sipPanelPriceAdminRows').addEventListener('input',e=>{const input=e.target.closest('[data-price]');if(!input)return;prices[Number(input.dataset.index)][input.dataset.price]=Math.max(0,Math.round(Number(input.value)||0));});
$('sipPanelPricesAdminForm').addEventListener('submit',async e=>{e.preventDefault();const btn=$('sipPanelPricesAdminForm').querySelector('[type="submit"]');btn.disabled=true;try{const value=JSON.stringify(prices.map(({length,width,thickness,osb,retail,bulk})=>({length,width,thickness,osb,retail,bulk})));const {error}=await sb.from('site_settings').upsert({key:'sip_panel_prices',value,updated_at:new Date().toISOString()},{onConflict:'key'});if(error)throw error;say('Новые цены сохранены и опубликованы на странице «Цены на СИП панели».');}catch(err){say('Не удалось сохранить цены: '+err.message,true);}finally{btn.disabled=false;}});
$('sipPanelPricesReset').addEventListener('click',()=>{if(!confirm('Вернуть исходные цены из таблицы?'))return;prices=defaults.map(x=>({...x}));render();say('Исходные цены загружены в форму. Нажмите «Сохранить цены», чтобы опубликовать их.');});

const greenboardDefaults=[
 {length:2800,width:600,thickness:124,osb:12,retail:4800,bulk:4750},
 {length:2800,width:600,thickness:174,osb:12,retail:5490,bulk:5440},
 {length:2800,width:600,thickness:224,osb:12,retail:6150,bulk:6100}
];
let greenboardPrices=greenboardDefaults.map(x=>({...x}));
const greenSay=(msg,bad=false)=>{const el=$('greenboardPricesAdminStatus');if(el){el.textContent=msg;el.style.color=bad?'#b82025':'';}};
function renderGreenboard(){
 $('greenboardPriceAdminRows').innerHTML=greenboardPrices.map((p,i)=>'<tr><td>'+p.length+'</td><td>'+p.width+'</td><td>'+p.thickness+'</td><td>'+p.osb+'</td><td><input type="number" min="0" step="1" required data-green-price="retail" data-index="'+i+'" value="'+p.retail+'"></td><td><input type="number" min="0" step="1" required data-green-price="bulk" data-index="'+i+'" value="'+p.bulk+'"></td></tr>').join('');
}
async function loadGreenboard(){
 const {data,error}=await sb.from('site_settings').select('value').eq('key','greenboard_sip_panel_prices').maybeSingle();
 if(error)throw error;
 if(data?.value){try{const parsed=JSON.parse(data.value);if(Array.isArray(parsed)&&parsed.length===3)greenboardPrices=greenboardDefaults.map((d,i)=>({...d,...parsed[i],width:600}));}catch(e){console.warn(e);}}
 renderGreenboard();greenSay('Цены Гринборд загружены.');
}
$('greenboardPriceAdminRows').addEventListener('input',e=>{
 const input=e.target.closest('[data-green-price]');if(!input)return;
 greenboardPrices[Number(input.dataset.index)][input.dataset.greenPrice]=Math.max(0,Math.round(Number(input.value)||0));
});
$('greenboardPricesAdminForm').addEventListener('submit',async e=>{
 e.preventDefault();const btn=$('greenboardPricesAdminForm').querySelector('[type="submit"]');btn.disabled=true;
 try{
  const value=JSON.stringify(greenboardPrices.map(({length,width,thickness,osb,retail,bulk})=>({length,width,thickness,osb,retail,bulk})));
  const {error}=await sb.from('site_settings').upsert({key:'greenboard_sip_panel_prices',value,updated_at:new Date().toISOString()},{onConflict:'key'});
  if(error)throw error;greenSay('Цены Гринборд сохранены и опубликованы на сайте.');
 }catch(err){greenSay('Не удалось сохранить цены Гринборд: '+err.message,true);}finally{btn.disabled=false;}
});
$('greenboardPricesReset').addEventListener('click',()=>{
 if(!confirm('Вернуть исходные цены Гринборд?'))return;
 greenboardPrices=greenboardDefaults.map(x=>({...x}));renderGreenboard();
 greenSay('Исходные цены загружены. Нажмите «Сохранить цены Гринборд», чтобы опубликовать.');
});
async function init(){const {data:{user},error}=await sb.auth.getUser();if(error||!user||user.app_metadata?.role!=='admin')return;try{await load();await loadGreenboard();}catch(err){say('Не удалось загрузить цены: '+err.message,true);greenSay('Не удалось загрузить цены Гринборд: '+err.message,true);}}
sb.auth.onAuthStateChange(()=>setTimeout(init,0));init();
})();
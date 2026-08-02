'use strict';
const API='/cgi-bin/dashboard',MAX=20;
let lastDevices=null,toastTimer=null;
const chart=new Chart(document.getElementById('speedChart'),{type:'line',data:{labels:[],datasets:[{label:'Download Mbps',data:[],tension:.25,borderWidth:2},{label:'Upload Mbps',data:[],tension:.25,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,animation:false,scales:{y:{beginAtZero:true}}}});
async function getJSON(path){const r=await fetch(`${API}/${path}`,{cache:'no-store'});if(!r.ok)throw new Error(`${path}: ${r.status}`);return r.json()}
function state(ok){const e=document.getElementById('connectionState');e.textContent=ok?'● Online':'● API Error';e.className=`badge ${ok?'online':'offline'}`}
function toast(msg){const e=document.getElementById('toast');e.textContent=msg;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),5000)}
function bytes(v){v=Number(v)||0;if(!v)return'0 B';const u=['B','KB','MB','GB','TB'],i=Math.min(Math.floor(Math.log(v)/Math.log(1024)),4),n=v/1024**i;return`${n.toFixed(n>=100?0:n>=10?1:2)} ${u[i]}`}
function uptime(v){v=Number(v)||0;const d=Math.floor(v/86400),h=Math.floor(v%86400/3600),m=Math.floor(v%3600/60);return d?`${d}d ${h}h`:h?`${h}h ${m}m`:`${m}m`}
function esc(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
async function loadStatus(){const d=await getJSON('status');cpu.textContent=`${d.cpu}%`;ram.textContent=`${d.ram}%`;storage.textContent=`${d.storage}%`;uptimeEl.textContent=uptime(d.uptime)}
async function loadNetwork(){const d=await getJSON('network');download.textContent=d.download;upload.textContent=d.upload;chart.data.labels.push(new Date().toLocaleTimeString());chart.data.datasets[0].data.push(parseFloat(d.download)||0);chart.data.datasets[1].data.push(parseFloat(d.upload)||0);if(chart.data.labels.length>MAX){chart.data.labels.shift();chart.data.datasets.forEach(x=>x.data.shift())}chart.update()}
async function loadUsage(){const d=await getJSON('usage');todayTotal.textContent=bytes(d.today_total);todayRx.textContent=bytes(d.today_rx);todayTx.textContent=bytes(d.today_tx);monthTotal.textContent=bytes(d.month_total);monthRx.textContent=bytes(d.month_rx);monthTx.textContent=bytes(d.month_tx)}
async function loadDevices(){const d=await getJSON('devices'),now=d.map(x=>x.mac.toLowerCase());deviceCount.textContent=`${d.length} online`;devices.innerHTML=d.map(x=>`<tr><td>${esc(x.hostname)}</td><td>${esc(x.ip)}</td><td>${esc(x.mac)}</td></tr>`).join('');if(lastDevices) d.filter(x=>!lastDevices.includes(x.mac.toLowerCase())).forEach(x=>toast(`📱 Connected: ${x.hostname} (${x.ip})`));lastDevices=now}
async function safe(fn){try{await fn();state(true)}catch(e){console.error(e);state(false)}}
const cpu=document.getElementById('cpu'),ram=document.getElementById('ram'),storage=document.getElementById('storage'),uptimeEl=document.getElementById('uptime'),download=document.getElementById('download'),upload=document.getElementById('upload'),todayTotal=document.getElementById('todayTotal'),todayRx=document.getElementById('todayRx'),todayTx=document.getElementById('todayTx'),monthTotal=document.getElementById('monthTotal'),monthRx=document.getElementById('monthRx'),monthTx=document.getElementById('monthTx'),deviceCount=document.getElementById('deviceCount'),devices=document.getElementById('devices');
safe(loadStatus);safe(loadNetwork);safe(loadUsage);safe(loadDevices);
setInterval(()=>safe(loadStatus),5000);setInterval(()=>safe(loadNetwork),3000);setInterval(()=>safe(loadUsage),60000);setInterval(()=>safe(loadDevices),10000);
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(console.error);


const activityBody = document.getElementById("activityBody");
const activityUpdated = document.getElementById("activityUpdated");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function refreshActivity() {
  if (!activityBody) return;

  try {
    const response = await fetch(
      "/cgi-bin/dashboard/activity?t=" + Date.now(),
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const devices = await response.json();

    if (!Array.isArray(devices) || devices.length === 0) {
      activityBody.innerHTML =
        '<tr><td colspan="4">No device activity detected.</td></tr>';
      return;
    }

    activityBody.innerHTML = devices.map((device, index) => {
      const active = device.status === "Active";
      const badgeClass = active ? "status-active" : "status-idle";

      return `
        <tr>
          <td>
            <div class="device-name">
              <span class="rank-number">${index + 1}</span>
              <div>
                <strong>${escapeHtml(device.hostname)}</strong>
                <small>${escapeHtml(device.mac)}</small>
              </div>
            </div>
          </td>
          <td>${escapeHtml(device.ip)}</td>
          <td><strong>${Number(device.connections || 0)}</strong></td>
          <td>
            <span class="activity-status ${badgeClass}">
              ${escapeHtml(device.status)}
            </span>
          </td>
        </tr>
      `;
    }).join("");

    if (activityUpdated) {
      activityUpdated.textContent =
        "Updated " + new Date().toLocaleTimeString("en-GB");
    }
  } catch (error) {
    activityBody.innerHTML =
      `<tr><td colspan="4">Activity API error: ${escapeHtml(error.message)}</td></tr>`;

    if (activityUpdated) {
      activityUpdated.textContent = "Offline";
    }
  }
}

refreshActivity();
setInterval(refreshActivity, 5000);

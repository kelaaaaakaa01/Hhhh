const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const ids=["htmlCode","cssCode","jsCode"];
function readDraft(){try{return JSON.parse(localStorage.getItem("novaDraft")||"{}")}catch{return {}}}
function saveDraft(){try{localStorage.setItem("novaDraft",JSON.stringify({html:$("#htmlCode").value,css:$("#cssCode").value,js:$("#jsCode").value}));$("#saveState").textContent="● Draft saved locally";}catch{$("#saveState").textContent="● Local storage unavailable"} updateEditorStats();}
function loadDraft(){const d=readDraft();$("#htmlCode").value=d.html||"";$("#cssCode").value=d.css||"";$("#jsCode").value=d.js||"";updateEditorStats();}
function setPage(id){$$(".page").forEach(x=>x.classList.toggle("active",x.id===id));$$(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===id));const labels={dashboard:"Overview",builder:"Code Studio",deploy:"Deployments",projects:"Project history",docs:"Documentation",settings:"Settings"};$("#pageTitle").textContent=labels[id]||id;if(id==="projects")renderProjects();if(id==="dashboard")renderDashboard();window.scrollTo({top:0,behavior:"smooth"});}
$$(".nav").forEach(b=>b.onclick=()=>setPage(b.dataset.page));$$("[data-go]").forEach(b=>b.onclick=()=>setPage(b.dataset.go));
function updateEditorStats(){const vals=ids.map(id=>$("#"+id).value);["htmlCount","cssCount","jsCount"].forEach((id,i)=>$("#"+id).textContent=(vals[i]?vals[i].split("\n").length:0)+" lines");$("#totalChars").textContent=vals.reduce((n,v)=>n+v.length,0).toLocaleString()+" characters";$("#statFiles").innerHTML=vals.filter(v=>v.trim()).length+' <small>/ 3</small>';const has=vals.some(v=>v.trim());$("#statDraft").textContent=has?"In progress":"Empty";$("#draftHint").textContent=has?"Your draft is saved locally":"Start creating something";}
function activateEditor(id){$$(".editor-tab").forEach(b=>b.classList.toggle("active",b.dataset.editor===id));$$(".editor-card").forEach(p=>p.classList.toggle("active-editor",p.dataset.panel===id));}
$$(".editor-tab").forEach(b=>b.onclick=()=>activateEditor(b.dataset.editor));
ids.forEach(id=>$("#"+id).addEventListener("input",saveDraft));
$("#loadDemo").onclick=()=>{$("#htmlCode").value='<!doctype html>\\n<html lang="en">\\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NOVA Demo</title></head>\\n<body><main><span>✦ NOVA STUDIO</span><h1>Ideas deserve<br><em>to go live.</em></h1><p>A tiny website, built with big ambition.</p><button id="hello">Say hello</button></main></body></html>';$("#cssCode").value='*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at top,#41316b,#10121d 65%);color:#f6f3ff;font-family:Arial,sans-serif}main{text-align:center;padding:40px}span{color:#b8a5ff;letter-spacing:3px;font-size:12px}h1{font-size:clamp(42px,8vw,76px);line-height:1.02;letter-spacing:-3px}em{color:#b8a5ff}p{color:#b3b0c5}button{margin-top:18px;padding:13px 22px;border:0;border-radius:9px;background:#a78bfa;color:#fff;font-weight:bold;cursor:pointer}';$("#jsCode").value='document.querySelector("#hello").addEventListener("click",()=>alert("Hello from NOVA BUILDER!"));';saveDraft();activateEditor("htmlCode");};
$("#clearBtn").onclick=()=>{if(!confirm("Clear all editor files?"))return;ids.forEach(id=>$("#"+id).value="");saveDraft();};
$("#copyActive").onclick=async()=>{const id=$(".editor-tab.active")?.dataset.editor||"htmlCode";try{await navigator.clipboard.writeText($("#"+id).value);$("#copyActive").textContent="Copied!";setTimeout(()=>$("#copyActive").textContent="Copy",1200)}catch{$("#copyActive").textContent="Select & copy";}};
$("#previewBtn").onclick=()=>{const html=$("#htmlCode").value||"<main><h1>NOVA BUILDER</h1><p>Your preview will appear here.</p></main>",css=$("#cssCode").value,js=$("#jsCode").value.replace(/<\/script/gi,"<\\/script");const doc=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;$("#preview").srcdoc=doc;$("#previewWrap").classList.remove("hidden");$("#previewWrap").scrollIntoView({behavior:"smooth",block:"start"});};
$("#closePreview").onclick=()=>$("#previewWrap").classList.add("hidden");$("#sendDeploy").onclick=()=>setPage("deploy");
function log(s){$("#log").textContent+="\\n"+s;$("#log").scrollTop=$("#log").scrollHeight}function resetLog(){$("#log").textContent="NOVA BUILDER / STUDIO\\n────────────────────────────\\n";$("#result").classList.add("hidden")}
async function readFile(file){return file?await file.text():null}function cleanName(name){return name.replace(/^\/+/, "").replace(/\.\.+/g,".").replace(/\\/g,"/")}function validProjectName(name){return /^[a-z0-9][a-z0-9._-]{0,99}$/.test(name)&&!name.includes("---")}
function fileLabel(id,label){const f=$("#"+id).files;$("#"+label).textContent=f.length?(f.length===1?f[0].name:f.length+" files selected"):(id==="htmlFile"?"Choose index.html":id==="cssFile"?"Choose style.css":id==="jsFile"?"Choose script.js":"Images, fonts, and other files")}
["htmlFile","cssFile","jsFile","extraFiles"].forEach(id=>$("#"+id).addEventListener("change",()=>fileLabel(id, id+"Name")));
$("#deployBtn").onclick=async()=>{resetLog();$("#logState").textContent="RUNNING";$("#statusText").textContent="Deploying…";$("#deployBtn").disabled=true;$("#deployBtn").textContent="Deploying…";
const name=$("#projectName").value.trim().toLowerCase();if(!validProjectName(name)){log("ERROR: Invalid project name. Use lowercase letters, numbers, dots, underscores, or hyphens.");finishError();return}
let files=[];try{const hf=$("#htmlFile").files[0],cf=$("#cssFile").files[0],jf=$("#jsFile").files[0];if(hf)files.push({file:"index.html",content:await readFile(hf)});if(cf)files.push({file:"style.css",content:await readFile(cf)});if(jf)files.push({file:"script.js",content:await readFile(jf)});for(const f of $("#extraFiles").files)files.push({file:cleanName(f.webkitRelativePath||f.name),content:await readFile(f)});
if(!files.length&&$("#htmlCode").value.trim()){files=[{file:"index.html",content:$("#htmlCode").value}];if($("#cssCode").value.trim())files.push({file:"style.css",content:$("#cssCode").value});if($("#jsCode").value.trim())files.push({file:"script.js",content:$("#jsCode").value});}
if(!files.length){log("ERROR: Add index.html or create a draft in Code Studio.");finishError();return}if(!files.some(x=>x.file.toLowerCase()==="index.html")){log("ERROR: index.html is required at the site root.");finishError();return}
log(`Preparing ${files.length} file(s)…`);const r=await fetch("/api/deploy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,target:$("#target").value,files})});let data={};try{data=await r.json()}catch{}if(!r.ok)throw new Error(data.error||"Deployment failed");const url=data.url||"";log("Deployment created: "+(url||data.inspector||data.id||"unknown"));$("#logState").textContent="SUCCESS";$("#statusText").textContent="Published";const row={name,url,id:data.id||"",time:new Date().toISOString(),target:$("#target").value};const history=readHistory();history.unshift(row);localStorage.setItem("novaProjects",JSON.stringify(history.slice(0,50)));$("#result").innerHTML=`<b>✓ Deployment ready.</b><br>${url?`<a href="${escapeAttr(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>`:"Deployment ID: "+escapeHtml(data.id||"unknown")}`;$("#result").classList.remove("hidden");renderDashboard();
}catch(e){log("ERROR: "+e.message);finishError()}finally{$("#deployBtn").disabled=false;$("#deployBtn").innerHTML='Deploy to Vercel <span>↗</span>'}};
function finishError(){$("#logState").textContent="ERROR";$("#statusText").textContent="All systems ready";$("#deployBtn").disabled=false;$("#deployBtn").innerHTML='Deploy to Vercel <span>↗</span>'}
function readHistory(){try{const h=JSON.parse(localStorage.getItem("novaProjects")||"[]");return Array.isArray(h)?h:[]}catch{return []}}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}function escapeAttr(s){return escapeHtml(s)}
function renderProjects(){const list=$("#projectList"),h=readHistory(),q=($("#projectSearch")?.value||"").trim().toLowerCase(),filtered=h.filter(x=>(x.name||"").toLowerCase().includes(q));$("#historyCount").textContent=h.length+" record"+(h.length===1?"":"s");if(!filtered.length){list.innerHTML=`<div class="empty-state">${h.length?"No projects match your search.":"No deployments yet. Your published projects will appear here."}</div>`;return}list.innerHTML=filtered.map(x=>`<div class="project-row"><div class="project-symbol">↗</div><div class="project-meta"><strong>${escapeHtml(x.name||"Untitled project")}</strong><small>${new Date(x.time).toLocaleString()} · ${(x.target||"production")==="preview"?"Preview":"Production"}</small></div><span class="project-status">● DEPLOYED</span>${x.url?`<a class="project-open" href="${escapeAttr(x.url)}" target="_blank" rel="noopener">Open ↗</a>`:""}</div>`).join("")}
$("#projectSearch").addEventListener("input",renderProjects);$("#clearProjects").onclick=()=>{if(confirm("Clear all deployment history from this browser?")){localStorage.removeItem("novaProjects");renderProjects();renderDashboard()}};
function renderDashboard(){const h=readHistory();$("#statDeployments").textContent=h.length;const recent=$("#recentActivity");if(!h.length){recent.innerHTML='<div class="empty-state">No activity yet. Your deployment history will show up here after your first publish.</div>';return}recent.innerHTML=h.slice(0,3).map(x=>`<div class="activity-item"><span class="activity-bullet">↗</span><div><b>${escapeHtml(x.name||"Untitled project")}</b><small>${new Date(x.time).toLocaleString()}</small></div>${x.url?`<a href="${escapeAttr(x.url)}" target="_blank" rel="noopener">OPEN ↗</a>`:""}</div>`).join("")}
function toggleTheme(){document.body.classList.toggle("light");localStorage.setItem("novaTheme",document.body.classList.contains("light")?"light":"dark")}
$("#themeToggle").onclick=toggleTheme;$("#settingsTheme").onclick=toggleTheme;$("#wipeStorage").onclick=()=>{if(confirm("Reset drafts, theme, and deployment history?")){localStorage.removeItem("novaProjects");localStorage.removeItem("novaDraft");localStorage.removeItem("novaTheme");location.reload()}};
if(localStorage.getItem("novaTheme")==="light")document.body.classList.add("light");loadDraft();renderProjects();renderDashboard();
// AxzyDev magic-link flow: API secret remains on the server.
const magicForm=document.querySelector('#magicForm');
if(magicForm){
  magicForm.addEventListener('submit',async(event)=>{
    event.preventDefault();
    const email=document.querySelector('#magicEmail').value.trim();
    const status=document.querySelector('#magicStatus');
    const button=document.querySelector('#magicSend');
    status.className='magic-status';
    status.textContent='Mengirim permintaan…';
    button.disabled=true;
    try{
      const response=await fetch('/api/magic-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data.error||`Permintaan gagal (HTTP ${response.status})`);
      status.classList.add('success');
      status.textContent=data.message||'Permintaan diterima. Periksa email jika alamat terdaftar.';
      magicForm.reset();
    }catch(error){
      status.classList.add('error');
      status.textContent=error.message||'Tidak dapat menghubungi server.';
    }finally{button.disabled=false;}
  });
}

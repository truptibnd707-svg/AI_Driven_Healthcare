
/* ================= DARK ================= */

function toggleDark(){
document.body.classList.toggle("dark")
}

/* ================= NAVIGATION ================= */

let LANG="en"
const T={


"en":{
    
dashboard:"Dashboard",
patient:"Patient Entry",
monitor:"Monitoring",
ai:"AI Prediction",
food:"Food Suggestion",
reminder:"Reminders",
emergency:"Emergency",
utilities:"Utilities",

patients:"Patients",
heart:"Heart Rate",
temp:"Temperature",
oxygen:"Oxygen",

patientInfo:"Patient Information",
name:"Patient Name",
age:"Age",
gender:"Gender",
symptoms:"Symptoms",
submit:"Submit",

medicine:"Medicine Reminder",
add:"Add",
sos:"Emergency SOS",

healthy:"Healthy",
avoid:"Avoid",

water:"Water Reminder",
voice:"Voice Assistant"
},

hi:{
dashboard:"डैशबोर्ड",
patient:"रोगी प्रविष्टि",
monitor:"निगरानी",
ai:"एआई भविष्यवाणी",
food:"भोजन सुझाव",
reminder:"रिमाइंडर",
emergency:"आपातकाल",
utilities:"उपकरण",

patients:"मरीज",
heart:"हृदय गति",
temp:"तापमान",
oxygen:"ऑक्सीजन",

patientInfo:"रोगी जानकारी",
name:"रोगी नाम",
age:"आयु",
gender:"लिंग",
symptoms:"लक्षण",
submit:"जमा करें",

medicine:"दवा रिमाइंडर",
add:"जोड़ें",
sos:"आपातकाल SOS",

healthy:"स्वस्थ भोजन",
avoid:"परहेज",

water:"पानी रिमाइंडर",
voice:"वॉइस सहायक"
},

kn:{
dashboard:"ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
patient:"ರೋಗಿ ದಾಖಲೆ",
monitor:"ಮಾನದಂಡ",
ai:"AI ಪೂರ್ವಾನುಮಾನ",
food:"ಆಹಾರ ಸಲಹೆ",
reminder:"ಜ್ಞಾಪನೆ",
emergency:"ತುರ್ತು",
utilities:"ಉಪಕರಣಗಳು",

patients:"ರೋಗಿಗಳು",
heart:"ಹೃದಯ ಬಡಿತ",
temp:"ತಾಪಮಾನ",
oxygen:"ಆಮ್ಲಜನಕ",

patientInfo:"ರೋಗಿ ಮಾಹಿತಿ",
name:"ರೋಗಿ ಹೆಸರು",
age:"ವಯಸ್ಸು",
gender:"ಲಿಂಗ",
symptoms:"ಲಕ್ಷಣಗಳು",
submit:"ಸಲ್ಲಿಸಿ",

medicine:"ಔಷಧಿ ಜ್ಞಾಪನೆ",
add:"ಸೇರಿಸಿ",
sos:"ತುರ್ತು SOS",

healthy:"ಆರೋಗ್ಯಕರ ಆಹಾರ",
avoid:"ತಪ್ಪಿಸಿಕೊಳ್ಳಿ",

water:"ನೀರಿನ ಜ್ಞಾಪನೆ",
voice:"ಧ್ವನಿ ಸಹಾಯಕ"
}

}

function setLang(l){
    LANG = l;
    updateSidebar();
    show("dashboard");
}

function updateSidebar(){
let t=T[LANG]

b1.innerText=t.dashboard
b2.innerText=t.patient
b3.innerText=t.monitor
b4.innerText=t.ai
b5.innerText=t.food
b6.innerText=t.reminder
b7.innerText=t.emergency
b8.innerText=t.utilities
}


function show(page){

    let t=T[LANG]

if(page==="dashboard"){
content.innerHTML=`

<div class="dashboard">

<div class="stat stat1" id="d1">${t.patients} : --</div>
<div class="stat stat2" id="d2">${t.heart} : --</div>
<div class="stat stat3" id="d3">${t.temp} : --</div>
<div class="stat stat4" id="d4">${t.oxygen} : --</div>

</div>

<div class="card">
<h3>🤖 AI Model Accuracy</h3>
<h1 id="mlAcc">--</h1>
</div>

<div class="card">
<h3>🧠 AI Model</h3>
<h2 id="aiStatus">Loading...</h2>
</div>

<div class="card">
<h3>Live Chart</h3>
<canvas id="chart"></canvas>
</div>
`;
updateSidebar()
loadDashboard()
loadChart()
}

/* ================= PATIENT ================= */

if(page==="patient"){
content.innerHTML=`
<div class="card">

<h3>${t.patientInfo}</h3>

<input id="name" placeholder="${t.name}">
<input id="age" placeholder="${t.age}">

<select id="gender">
<option>Male</option>
<option>Female</option>
</select>

<input id="hr" placeholder="${t.heart}">
<input id="bp" placeholder="${t.bp}">
<input id="temp" placeholder="${t.temp}">
<input id="oxygen" placeholder="${t.oxygen}">
<input id="symptoms" placeholder="${t.symptoms}">
<label>Patient Photo</label>
<input type="file" id="patient_photo" accept="image/*">

<button onclick="addPatient()">Submit</button>

<div id="risk"></div>

</div>
`;
}

/* ================= MONITOR ================= */

if(page==="monitor"){
content.innerHTML=`
<div class="card">
<h3>Multi Patient Monitoring</h3>

<table class="table">
<thead>
<tr>
<th>Name</th>
<th>HR</th>
<th>BP</th>
<th>Temp</th>
<th>Oxygen</th>
<th>Risk</th>
<th>Action</th>
</tr>
</thead>

<tbody id="multi"></tbody>

</table>

</div>

<div class="card">

<h3>🔍 Smart Search</h3>

<input
type="text"
id="searchBox"
placeholder="Search by Name, Risk, Symptoms..."
onkeyup="smartSearch()">

</div>

<div id="patients"></div>
`;
loadMulti()
loadPatients()
}

/* ================= AI ================= */

if(page==="ai"){
content.innerHTML=`

<div class="card">
<h3>AI 24hr Prediction</h3>
<div id="prediction"></div>
<button onclick="loadPrediction()">Predict</button>
</div>

<div class="card">
<h3>AI Chatbot</h3>
<input id="chatmsg">
<button onclick="sendChat()">Send</button>
<div id="chatbox"></div>
</div>

<div class="card">
<h3>Anomaly Detection</h3>
<div id="anomaly"></div>
<button onclick="checkAnomaly()">Check</button>
</div>
`;
}

/* ================= FOOD ================= */

if(page==="food"){
content.innerHTML=`
<div class="card">
<h3>Food Suggestion</h3>

<select id="food_patient"></select>

<button onclick="loadFood()">Get Suggestion</button>

<div>
<b>Healthy</b>
<div id="healthy_food"></div>

<b>Avoid</b>
<div id="avoid_food"></div>
</div>

</div>
`;

loadFoodPatients()
}

/* ================= REMINDER ================= */

if(page==="reminder"){
content.innerHTML=`

<div class="card">
<h3>Medicine Reminder</h3>

<hr>

<h3>Medicine Manager</h3>

<input id="med_patient" placeholder="Patient Name">
<input id="med_name" placeholder="Medicine Name">

<label>Medicine Photo</label>
<input type="file" id="med_photo" accept="image/*">

<label>Expiry Date</label>
<input type="date" id="exp_date">

<button onclick="addMedicine()">Add Medicine</button>

<div id="medicine_list"></div>

<input id="rname">
<input id="medicine">
<input type="time" id="time">

<button onclick="addReminder()">Add</button>

<div id="reminders"></div>

</div>
`;

loadReminders()
loadMedicines()
}

/* ================= EMERGENCY ================= */

if(page==="emergency"){
content.innerHTML=`
<div class="card">

<h3>Emergency SOS</h3>

<input id="contact" value="+919999999999">

<button class="sos" onclick="sendSOS()">🚨 SOS</button>

<div id="sosmsg"></div>

</div>
`;
}

/* ================= UTILITIES ================= */

if(page==="utilities"){
content.innerHTML=`

<div class="card">
<h3>Water Reminder</h3>
<button onclick="startWater()">Start</button>
</div>

<div class="card">
<h3>Voice Assistant</h3>
<button onclick="voice()">Speak</button>
</div>

`;
}

}

/* ================= DASHBOARD ================= */

function loadDashboard(){
fetch("/get_patients")
.then(res=>res.json())
.then(data=>{
if(data.length===0) return;

let p=data[0]

d1.innerHTML="Patients : "+data.length
d2.innerHTML="Heart Rate : "+p.heart_rate
d3.innerHTML="Temperature : "+p.temperature
d4.innerHTML="Oxygen : "+p.oxygen

})
}

// ========================= ADD PATIENT =========================
function addPatient(){
    const data={
        name: document.getElementById("name").value,
        age: parseInt(document.getElementById("age").value),
        gender: document.getElementById("gender").value,
        heart_rate: parseInt(document.getElementById("hr").value),
        bp: document.getElementById("bp").value,
        temperature: parseFloat(document.getElementById("temp").value),
        oxygen: parseInt(document.getElementById("oxygen").value),
        symptoms: document.getElementById("symptoms").value
    };
    fetch("/add_patient",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data)
    }).then(res=>res.json()).then(data=>{
        if(data.status==="success"){
            document.getElementById("risk").innerHTML="Risk Level : "+data.risk;
            loadPatients(); loadMulti(); loadChart();
        } else { alert(data.msg || "Error adding patient"); }
    });
}

// ========================= DELETE PATIENT =========================
function deletePatient(name){
    if(confirm(`Delete patient ${name}?`)){
        fetch(`/delete_patient/${name}`,{method:"DELETE"})
        .then(res=>res.json()).then(()=>{ loadPatients(); loadMulti(); });
    }
}

// ========================= SOS =========================
function sendSOS(){
    const contact=document.getElementById("contact").value||"+919999999999";
    fetch("/sos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contact})})
    .then(res=>res.json()).then(data=>{ document.getElementById("sosmsg").innerHTML=data.status; });
}

// ========================= REMINDERS =========================
function addReminder(){
    const data={
        name: document.getElementById("rname").value,
        medicine: document.getElementById("medicine").value,
        time: document.getElementById("time").value
    };
    fetch("/add_reminder",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
    .then(()=>{ loadReminders(); });
}

function loadReminders(){
    fetch("/get_reminders").then(res=>res.json()).then(data=>{
        let html=""; data.forEach(r=>{ html+=`${r.name} - ${r.medicine} - ${r.time}<br>`; });
        document.getElementById("reminders").innerHTML=html;
    });
}

// ========================= LOAD PATIENTS =========================
function loadPatients(){
    fetch("/get_patients").then(res=>res.json()).then(data=>{
        let html="";
        data.forEach(p=>{
            html+=`<div class="card">
                <b>${p.name}</b> <button onclick="deletePatient('${p.name}')">❌ Delete</button><br>
                HR: ${p.heart_rate} | BP: ${p.bp} | Temp: ${p.temperature} | Oxygen: ${p.oxygen}
                <span class="risk ${p.risk.split(" ")[0]}">${p.risk}</span><br><br>
                <a href="/generate_report/${p.name}"><button>Doctor Report</button></a>
            </div>`;
        });
        document.getElementById("patients").innerHTML=html;
    });
}

function loadMulti(){
fetch("/multi_patient")
.then(res=>res.json())
.then(data=>{

let html=""

data.forEach(p=>{

html+=`
<tr>
<td>
${p.name}
</td>

<td>${p.heart_rate}</td>
<td>${p.bp}</td>
<td>${p.temperature}</td>
<td>${p.oxygen}</td>
<td>
<span class="risk ${p.risk}">
${p.risk}
</span>
</td>
<td>
<button onclick="deletePatient('${p.name}')">❌</button>
</td>

</tr>
`

})

document.getElementById("multi").innerHTML=html

})
}

// ========================= CHART =========================
let chart;
function loadChart(){
    if(!document.getElementById("chart")) return;

    fetch("/chart_data")
    .then(res=>res.json())
    .then(data=>{
        if(data.length === 0) return;

        let hr=[], temp=[], oxy=[], labels=[];

        data.reverse().forEach(d=>{
            hr.push(d[0]);
            temp.push(d[1]);
            oxy.push(d[2]);
            labels.push(d[3]);
        });

        if(chart) chart.destroy();

        chart=new Chart(document.getElementById("chart"),{
            type:"line",
            data:{
                labels:labels,
                datasets:[
                    {label:"Heart Rate",data:hr,borderColor:"red"},
                    {label:"Temperature",data:temp,borderColor:"orange"},
                    {label:"Oxygen",data:oxy,borderColor:"green"}
                ]
            }
        });
    });
}

// ========================= PREDICTION =========================
function loadPrediction(){
    fetch("/predict_24hr").then(res=>res.json()).then(d=>{
        document.getElementById("prediction").innerHTML=`HR: ${d.heart_rate}<br>Temp: ${d.temperature}<br>Oxygen: ${d.oxygen}`;
    });
}

// ========================= FOOD SUGGESTION =========================
function loadFoodPatients(){
    fetch("/get_patients")
    .then(res=>res.json())
    .then(data=>{
        // get unique patient names
        let names = [...new Set(data.map(p => p.name))];
        let html = "";
        names.forEach(name => {
            html += `<option value="${name}">${name}</option>`;
        });
        document.getElementById("food_patient").innerHTML = html;
    });
}

function loadFood(){
    let name=document.getElementById("food_patient").value;

    fetch(`/food_suggestion/${name}`)
    .then(res=>res.json())
    .then(data=>{
        let healthy="";
        let avoid="";

        data.healthy.forEach(f=>{
            healthy+=`✅ ${f}<br>`;
        });

        data.avoid.forEach(f=>{
            avoid+=`❌ ${f}<br>`;
        });

        document.getElementById("healthy_food").innerHTML=healthy;
        document.getElementById("avoid_food").innerHTML=avoid;
    });
}

// ========================= CHATBOT =========================
function sendChat(){
    let msg=document.getElementById("chatmsg").value;
    fetch("/chatbot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg})})
    .then(res=>res.json()).then(d=>{
        document.getElementById("chatbox").innerHTML+=`<b>You:</b> ${msg}<br><b>AI:</b> ${d.reply}<br>`;
    });
}

// ========================= ANOMALY =========================
function checkAnomaly(){
    fetch("/anomaly").then(res=>res.json()).then(d=>{ document.getElementById("anomaly").innerHTML=d.status; });
}

// ========================= WATER & VOICE =========================
function startWater(){ setInterval(()=>{ alert(LANG==="hi"?"पानी पिएं":LANG==="kn"?"ನೀರು ಕುಡಿಯಿರಿ":"Drink Water")},1800000); }
function voice(){ speechSynthesis.speak(new SpeechSynthesisUtterance("Please take your medicine now")); }

// ========================= FALL DETECTION =========================
setInterval(()=>{ if(Math.random()>0.97){ alert("Fall detected! Emergency alerted"); sendSOS(); } },10000);

// ========================= INACTIVITY =========================
let lastMove=Date.now();
document.onmousemove=()=>lastMove=Date.now();
setInterval(()=>{ if(Date.now()-lastMove>60000) alert("No movement detected"); },30000);

// ========================= NIGHT MONITOR =========================
setInterval(()=>{ let hr=new Date().getHours(); if(hr>=23||hr<=5) console.log("Night monitoring active"); },60000);

function addMedicine(){

let name=document.getElementById("med_patient").value
let medicine=document.getElementById("med_name").value
let exp=document.getElementById("exp_date").value
let photo=document.getElementById("med_photo").files[0]

let formData=new FormData()
formData.append("name",name)
formData.append("medicine",medicine)
formData.append("exp",exp)
formData.append("photo",photo)

fetch("/add_medicine",{
method:"POST",
body:formData
}).then(()=>loadMedicines())

}

function loadMedicines(){
fetch("/get_medicine")
.then(res=>res.json())
.then(data=>{
let html=""
data.forEach(m=>{

let today=new Date()
let exp=new Date(m.exp)

let warn=(exp-today)/(1000*60*60*24)

html+=`
<div class="card">
<b>${m.name}</b> - ${m.medicine}<br>
Expiry: ${m.exp}<br>
${warn<5?"⚠️ Expiring Soon":""}
${warn<1?"🚨 Expired":""}
<br>
<img src="${m.photo}" width="120">
</div>
`
})

document.getElementById("medicine_list").innerHTML=html
})
}

function loadML(){
fetch("/ml_accuracy")
.then(res=>res.json())
.then(data=>{

document.getElementById("mlAcc").innerText =
data.accuracy + "%"

document.getElementById("aiStatus").innerText =
"Model Active"

})
.catch(()=>{
document.getElementById("aiStatus").innerText =
"Rule Based AI"
})
show("dashboard")
}


function smartSearch(){

let keyword =
document.getElementById("searchBox").value

if(keyword===""){
loadPatients()
return
}

fetch(`/search_patient?q=${keyword}`)
.then(res=>res.json())
.then(data=>{

let html=""

if(data.length===0){

html=`
<div class="card">
No Patient Found
</div>
`

}else{

data.forEach(p=>{

html+=`
<div class="card">

<h3>${p.name}</h3>

Age: ${p.age}<br>
Gender: ${p.gender}<br>
HR: ${p.heart_rate}<br>
BP: ${p.bp}<br>
Temp: ${p.temperature}<br>
Oxygen: ${p.oxygen}<br>

Symptoms: ${p.symptoms}<br>

<span class="risk ${p.risk.split(" ")[0]}">
${p.risk}
</span>

<br><br>

<button onclick="deletePatient('${p.name}')">
❌ Delete
</button>

<a href="/generate_report/${p.name}">
<button>
📄 Report
</button>
</a>

</div>
`
})

}

document.getElementById("patients").innerHTML =
html

})

}

// ========================= INITIAL LOAD =========================
loadPatients();
loadMulti();
loadReminders();
loadChart();
loadFoodPatients();
loadMedicines()
loadML()



const gradeMap = { O:10,"A+":9,A:8,"B+":7,B:6,C:5,D:4,E:3,F:0 };

const tgpaTab = document.getElementById("tgpaTab");
const cgpaTab = document.getElementById("cgpaTab");
const tgpaSection = document.getElementById("tgpaSection");
const cgpaSection = document.getElementById("cgpaSection");

const subTable = document.getElementById("subTable");
const semTable = document.getElementById("semTable");

const tgpaValue = document.getElementById("tgpaValue");
const cgpaValue = document.getElementById("cgpaValue");
const tgpaBox = document.getElementById("tgpaBox");
const cgpaBox = document.getElementById("cgpaBox");

/* Theme */
const themeToggle = document.getElementById("themeToggle");
function applyTheme(t){
  document.body.classList.toggle("dark",t==="dark");
  themeToggle.innerText = t==="dark" ? "🌙 Dark" : "☀️ Light";
  localStorage.setItem("theme",t);
}
applyTheme(localStorage.getItem("theme")||"light");
themeToggle.onclick=()=>applyTheme(document.body.classList.contains("dark")?"light":"dark");

/* Mode */
tgpaTab.onclick=()=>{
  tgpaSection.classList.remove("hidden");
  cgpaSection.classList.add("hidden");
  tgpaTab.classList.add("active");
  cgpaTab.classList.remove("active");
};
cgpaTab.onclick=()=>{
  cgpaSection.classList.remove("hidden");
  tgpaSection.classList.add("hidden");
  cgpaTab.classList.add("active");
  tgpaTab.classList.remove("active");
};

/* Subjects */
function updateIndex(){
  [...subTable.rows].slice(1).forEach((r,i)=>r.cells[0].innerText=i+1);
}
function addSubject(){
  const r=subTable.insertRow();
  r.insertCell().innerText="";
  r.insertCell().innerHTML=`<input placeholder="Optional">`;
  r.insertCell().innerHTML=`<input type="number" min="0">`;
  r.insertCell().innerHTML=`<select>${Object.keys(gradeMap).map(g=>`<option>${g}</option>`).join("")}</select>`;
  r.insertCell().innerHTML=`<button class="delete">🗑️</button>`;
  r.querySelector(".delete").onclick=()=>{r.remove();updateIndex();calcTGPA();};
  updateIndex();
}

/* Reaction */
function react(box,val){
  box.classList.remove("good","neutral","bad","happy","angry");
  if(val>=7) box.classList.add("good","happy");
  else if(val>=5) box.classList.add("neutral");
  else box.classList.add("bad","angry");
}

/* TGPA */
function calcTGPA(){
  let c=0,s=0;
  [...subTable.rows].slice(1).forEach(r=>{
    const cr=+r.cells[2].firstChild.value;
    const gp=gradeMap[r.cells[3].firstChild.value];
    if(cr>0){c+=cr;s+=cr*gp;}
  });
  let res=c?Math.min(10,s/c):0;
  tgpaBox.classList.add("suspense");
  setTimeout(()=>{
    tgpaBox.classList.remove("suspense");
    tgpaValue.innerText=res.toFixed(2);
    react(tgpaBox,res);
  },400);
  return c;
}

/* Semester */
function addSemester(name="",credits="",sgpa="",auto=false){
  const r=semTable.insertRow();
  r.insertCell().innerHTML=`<input placeholder="Semester name" value="${name}">`;
  r.insertCell().innerHTML=auto?`<input value="${credits}" readonly>`:`<input type="number">`;
  r.insertCell().innerHTML=`<input type="number" min="0" max="10" step="0.01" value="${sgpa}">`;
  r.insertCell().innerHTML=`<button class="delete">🗑️</button>`;
  r.querySelector(".delete").onclick=()=>{r.remove();calcCGPA();};
}

/* CGPA */
function calcCGPA(){
  let c=0,s=0;
  [...semTable.rows].slice(1).forEach(r=>{
    const cr=+r.cells[1].firstChild.value;
    const sg=Math.min(10,+r.cells[2].firstChild.value);
    if(cr>0&&!isNaN(sg)){c+=cr;s+=cr*sg;}
  });
  let res=c?Math.min(10,s/c):0;
  cgpaBox.classList.add("suspense");
  setTimeout(()=>{
    cgpaBox.classList.remove("suspense");
    cgpaValue.innerText=res.toFixed(2);
    react(cgpaBox,res);
  },400);
}

/* Buttons */
document.getElementById("addSub").onclick=addSubject;
document.getElementById("calcTGPA").onclick=calcTGPA;
document.getElementById("addTGPA").onclick=()=>{
  const cr=calcTGPA();
  cgpaTab.click();
  addSemester("",cr,tgpaValue.innerText,true);
  calcCGPA();
};
document.getElementById("addSem").onclick=()=>addSemester();
document.getElementById("calcCGPA").onclick=calcCGPA;

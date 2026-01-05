const gradeMap = { O:10,"A+":9,A:8,"B+":7,B:6,C:5,D:4,E:3,F:0 };

const tgpaTab = document.getElementById("tgpaTab");
const cgpaTab = document.getElementById("cgpaTab");
const tgpaSection = document.getElementById("tgpaSection");
const cgpaSection = document.getElementById("cgpaSection");

tgpaTab.onclick = () => {
  tgpaTab.classList.add("active");
  cgpaTab.classList.remove("active");
  tgpaSection.classList.remove("hidden");
  cgpaSection.classList.add("hidden");
};

cgpaTab.onclick = () => {
  cgpaTab.classList.add("active");
  tgpaTab.classList.remove("active");
  cgpaSection.classList.remove("hidden");
  tgpaSection.classList.add("hidden");
};

const subjectTable = document.getElementById("subjectTable");

function addSubject() {
  const row = subjectTable.insertRow();
  row.innerHTML = `
    <td></td>
    <td><input placeholder="Optional"></td>
    <td><input type="number" min="0"></td>
    <td>
      <select>${Object.keys(gradeMap).map(g=>`<option>${g}</option>`).join("")}</select>
    </td>
    <td><button class="delete">🗑️</button></td>
  `;
  row.querySelector(".delete").onclick = () => row.remove();
  updateIndex();
}

function updateIndex() {
  [...subjectTable.rows].slice(1).forEach((r,i)=>r.cells[0].innerText=i+1);
}

document.getElementById("addSubject").onclick = addSubject;

function react(box, val) {
  box.className = "result-box";
  if (val >= 7) box.classList.add("good");
  else if (val >= 5) box.classList.add("neutral");
  else box.classList.add("bad");
}

document.getElementById("calculateTGPA").onclick = () => {
  let sum=0, credits=0;
  [...subjectTable.rows].slice(1).forEach(r=>{
    const c = +r.cells[2].firstChild.value;
    const g = gradeMap[r.cells[3].firstChild.value];
    if (c>0) { credits+=c; sum+=c*g; }
  });
  const tgpa = credits ? Math.min(10,sum/credits) : 0;
  document.getElementById("tgpaValue").innerText = tgpa.toFixed(2);
  react(document.getElementById("tgpaBox"), tgpa);
};

const semesterTable = document.getElementById("semesterTable");

document.getElementById("pushToCGPA").onclick = () => {
  document.getElementById("calculateTGPA").click();
  const tgpa = document.getElementById("tgpaValue").innerText;
  const credits = [...subjectTable.rows].slice(1)
    .reduce((a,r)=>a+(+r.cells[2].firstChild.value||0),0);

  const row = semesterTable.insertRow();
  row.innerHTML = `
    <td><input placeholder="Semester name"></td>
    <td><input value="${credits}" readonly></td>
    <td><input value="${tgpa}"></td>
    <td><button class="delete">🗑️</button></td>
  `;
  row.querySelector(".delete").onclick = () => row.remove();
};

document.getElementById("calculateCGPA").onclick = () => {
  let sum=0, credits=0;
  [...semesterTable.rows].slice(1).forEach(r=>{
    const c = +r.cells[1].firstChild.value;
    const g = Math.min(10,+r.cells[2].firstChild.value);
    if (c>0) { credits+=c; sum+=c*g; }
  });
  const cgpa = credits ? Math.min(10,sum/credits) : 0;
  document.getElementById("cgpaValue").innerText = cgpa.toFixed(2);
  react(document.getElementById("cgpaBox"), cgpa);
};

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

/* EMAILJS FEEDBACK */
const feedbackForm = document.getElementById("feedbackForm");
const feedbackStatus = document.getElementById("feedbackStatus");

feedbackForm.addEventListener("submit", function (e) {
  e.preventDefault();
  feedbackStatus.innerText = "Sending...";

  emailjs.send(
    "service_jyxq8hj",
    "template_vqedpbr",
    {
      name: feedbackForm.name.value,
      email: feedbackForm.email.value,
      message: feedbackForm.message.value
    }
  ).then(
    function () {
      feedbackStatus.innerText = "✅ Feedback sent successfully!";
      feedbackForm.reset();
    },
    function (error) {
      console.error(error);
      feedbackStatus.innerText = "❌ Failed to send feedback.";
    }
  );
});

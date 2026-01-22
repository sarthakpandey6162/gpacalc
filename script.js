const gradeMap = { O:10,"A+":9,A:8,"B+":7,B:6,C:5,D:4,E:3,F:0 };
const historyLimit = 50;
let calculationHistory = JSON.parse(localStorage.getItem("cgpaHistory")) || [];

// Convert marks to grade
function marksToGrade(marks) {
  const m = Number(marks);
  if (m >= 90) return 'O';
  if (m >= 80) return 'A+';
  if (m >= 70) return 'A';
  if (m >= 60) return 'B+';
  if (m >= 50) return 'B';
  if (m >= 40) return 'C';
  if (m >= 30) return 'D';
  if (m >= 20) return 'E';
  return 'F';
}

// Add to history
function addToHistory(type, value, details) {
  const now = new Date();
  const timestamp = now.toLocaleString();
  calculationHistory.unshift({ type, value, details, timestamp });
  if (calculationHistory.length > historyLimit) calculationHistory.pop();
  localStorage.setItem("cgpaHistory", JSON.stringify(calculationHistory));
  updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
  const historyList = document.getElementById("historyList");
  if (calculationHistory.length === 0) {
    historyList.innerHTML = '<p class="empty-msg">No calculations yet</p>';
    return;
  }
  historyList.innerHTML = calculationHistory.map(item => `
    <div class="history-item">
      <span class="history-time">${item.timestamp}</span>
      <span class="history-text">${item.type}: ${item.value.toFixed(2)} (${item.details})</span>
    </div>
  `).join('');
}

// Tab Navigation
const tgpaTab = document.getElementById("tgpaTab");
const cgpaTab = document.getElementById("cgpaTab");
const statsTab = document.getElementById("statsTab");
const targetTab = document.getElementById("targetTab");
const gradeTab = document.getElementById("gradeTab");
const historyTab = document.getElementById("historyTab");

const tgpaSection = document.getElementById("tgpaSection");
const cgpaSection = document.getElementById("cgpaSection");
const statsSection = document.getElementById("statsSection");
const targetSection = document.getElementById("targetSection");
const gradeSection = document.getElementById("gradeSection");
const historySection = document.getElementById("historySection");

function hideAll() {
  [tgpaSection, cgpaSection, statsSection, targetSection, gradeSection, historySection].forEach(s => s.classList.add("hidden"));
  [tgpaTab, cgpaTab, statsTab, targetTab, gradeTab, historyTab].forEach(t => t.classList.remove("active"));
}

tgpaTab.onclick = () => { hideAll(); tgpaSection.classList.remove("hidden"); tgpaTab.classList.add("active"); };
cgpaTab.onclick = () => { hideAll(); cgpaSection.classList.remove("hidden"); cgpaTab.classList.add("active"); };
statsTab.onclick = () => { hideAll(); statsSection.classList.remove("hidden"); statsTab.classList.add("active"); updateStats(); };
targetTab.onclick = () => { hideAll(); targetSection.classList.remove("hidden"); targetTab.classList.add("active"); };
gradeTab.onclick = () => { hideAll(); gradeSection.classList.remove("hidden"); gradeTab.classList.add("active"); };
historyTab.onclick = () => { hideAll(); historySection.classList.remove("hidden"); historyTab.classList.add("active"); updateHistoryDisplay(); };

const subjectTable = document.getElementById("subjectTable");

function addSubject() {
  const row = subjectTable.insertRow();
  row.innerHTML = `
    <td></td>
    <td><input placeholder="Optional"></td>
    <td><input type="number" min="1" inputmode="numeric"></td>
    <td><input type="number" min="0" max="100" placeholder="0-100" inputmode="numeric"></td>
    <td class="gradeDisplay">-</td>
    <td><button class="delete">🗑️</button></td>
  `;
  
  const marksInput = row.cells[3].firstChild;
  marksInput.oninput = () => {
    const grade = marksToGrade(marksInput.value);
    row.cells[4].innerText = marksInput.value ? grade : '-';
  };
  
  // Allow Enter key to calculate
  marksInput.onkeypress = (e) => {
    if (e.key === "Enter") document.getElementById("calculateTGPA").click();
  };
  
  row.querySelector(".delete").onclick = () => row.remove();
  updateIndex();
}

function updateIndex() {
  [...subjectTable.rows].slice(1).forEach((r,i)=>r.cells[0].innerText=i+1);
}

// Subject search
document.getElementById("subjectSearch").oninput = (e) => {
  const query = e.target.value.toLowerCase();
  [...subjectTable.rows].slice(1).forEach(r => {
    const subjectName = r.cells[1].firstChild.value.toLowerCase();
    r.style.display = subjectName.includes(query) ? '' : 'none';
  });
};

document.getElementById("addSubject").onclick = addSubject;
document.getElementById("clearTGPA").onclick = () => {
  subjectTable.querySelectorAll("tbody tr").forEach(r => r.remove());
  document.getElementById("tgpaValue").innerText = "0.00";
  document.getElementById("tgpaBox").className = "result-box";
};

function react(box, val) {
  box.className = "result-box";
  if (val >= 7) box.classList.add("good");
  else if (val >= 5) box.classList.add("neutral");
  else box.classList.add("bad");
}

document.getElementById("calculateTGPA").onclick = () => {
  let sum = 0, credits = 0;

  [...subjectTable.rows].slice(1).forEach(r => {
    const creditVal = r.cells[2].firstChild.value;
    const marksVal = r.cells[3].firstChild.value;
    if (creditVal === "" || marksVal === "") return;

    const c = Number(creditVal);
    if (c <= 0) return;

    const grade = marksToGrade(marksVal);
    const g = gradeMap[grade];
    credits += c;
    sum += c * g;
  });

  const tgpa = credits === 0 ? 0 : sum / credits;
  document.getElementById("tgpaValue").innerText = tgpa.toFixed(2);
  react(document.getElementById("tgpaBox"), tgpa);
  addToHistory("TGPA", tgpa, `${credits} credits`);
};

const semesterTable = document.getElementById("semesterTable");

document.getElementById("pushToCGPA").onclick = () => {
  document.getElementById("calculateTGPA").click();

  const tgpa = Number(document.getElementById("tgpaValue").innerText);
  if (tgpa === 0) return;

  const totalCredits = [...subjectTable.rows].slice(1)
    .reduce((a,r)=>{
      const v = Number(r.cells[2].firstChild.value);
      const marksVal = r.cells[3].firstChild.value;
      return v > 0 && marksVal ? a + v : a;
    },0);

  const row = semesterTable.insertRow();
  row.innerHTML = `
    <td><input placeholder="Semester" value="Semester ${semesterTable.rows.length}"></td>
    <td><input value="${totalCredits}" readonly></td>
    <td><input value="${tgpa.toFixed(2)}" type="number" step="0.01" min="0" max="10"></td>
    <td><button class="edit">✏️</button></td>
    <td><button class="delete">🗑️</button></td>
  `;
  
  row.querySelector(".delete").onclick = () => row.remove();
  row.querySelector(".edit").onclick = () => {
    const input = row.cells[2].firstChild;
    input.style.border = input.style.border === "2px solid #667eea" ? "" : "2px solid #667eea";
  };
};

document.getElementById("addSemester").onclick = () => {
  const row = semesterTable.insertRow();
  row.innerHTML = `
    <td><input placeholder="Semester" value="Semester ${semesterTable.rows.length}"></td>
    <td><input type="number" min="1" placeholder="Credits" inputmode="numeric"></td>
    <td><input type="number" min="0" max="10" placeholder="SGPA" step="0.01" inputmode="decimal"></td>
    <td><button class="edit">✏️</button></td>
    <td><button class="delete">🗑️</button></td>
  `;
  
  row.querySelector(".delete").onclick = () => row.remove();
  row.querySelector(".edit").onclick = () => {
    const inputs = [row.cells[1].firstChild, row.cells[2].firstChild];
    inputs.forEach(inp => inp.style.border = inp.style.border === "2px solid #667eea" ? "" : "2px solid #667eea");
  };
};

document.getElementById("clearCGPA").onclick = () => {
  semesterTable.querySelectorAll("tbody tr").forEach(r => r.remove());
  document.getElementById("cgpaValue").innerText = "0.00";
  document.getElementById("cgpaBox").className = "result-box cgpa";
};

document.getElementById("calculateCGPA").onclick = () => {
  let sum = 0, credits = 0;

  [...semesterTable.rows].slice(1).forEach(r => {
    const c = Number(r.cells[1].firstChild.value);
    const g = Number(r.cells[2].firstChild.value);
    if (c > 0 && g >= 0 && g <= 10) {
      credits += c;
      sum += c * g;
    }
  });

  const cgpa = credits === 0 ? 0 : sum / credits;
  document.getElementById("cgpaValue").innerText = cgpa.toFixed(2);
  react(document.getElementById("cgpaBox"), cgpa);
  addToHistory("CGPA", cgpa, `${credits} total credits`);
};

// Statistics
function updateStats() {
  const rows = [...semesterTable.rows].slice(1);
  if (rows.length === 0) {
    document.getElementById("avgGPA").innerText = "0.00";
    document.getElementById("highestSGPA").innerText = "0.00";
    document.getElementById("lowestSGPA").innerText = "0.00";
    document.getElementById("totalCredits").innerText = "0";
    document.getElementById("progressFill").style.width = "0%";
    document.getElementById("progressText").innerText = "0%";
    return;
  }

  let sum = 0, credits = 0, sgpas = [];
  rows.forEach(r => {
    const c = Number(r.cells[1].firstChild.value);
    const g = Number(r.cells[2].firstChild.value);
    if (c > 0 && g >= 0 && g <= 10) {
      credits += c;
      sum += c * g;
      sgpas.push(g);
    }
  });

  const avg = credits === 0 ? 0 : sum / credits;
  const highest = sgpas.length > 0 ? Math.max(...sgpas) : 0;
  const lowest = sgpas.length > 0 ? Math.min(...sgpas) : 0;

  document.getElementById("avgGPA").innerText = avg.toFixed(2);
  document.getElementById("highestSGPA").innerText = highest.toFixed(2);
  document.getElementById("lowestSGPA").innerText = lowest.toFixed(2);
  document.getElementById("totalCredits").innerText = credits;

  const progress = Math.min((avg / 8.0) * 100, 100);
  document.getElementById("progressFill").style.width = progress + "%";
  document.getElementById("progressText").innerText = Math.round(progress) + "%";
}

// Target GPA Calculator
document.getElementById("calculateTarget").onclick = () => {
  const currentCGPA = Number(document.getElementById("cgpaValue").innerText) || 0;
  const targetGPA = Number(document.getElementById("targetGPA").value);
  const nextCredits = Number(document.getElementById("nextSemesterCredits").value);

  if (!targetGPA || !nextCredits) {
    alert("Please enter all values");
    return;
  }

  let totalCredits = [...semesterTable.rows].slice(1).reduce((a, r) => {
    const c = Number(r.cells[1].firstChild.value);
    return c > 0 ? a + c : a;
  }, 0);

  totalCredits += nextCredits;

  const currentPoints = currentCGPA * totalCredits - (nextCredits * 10);
  const requiredSGPA = (targetGPA * totalCredits - currentPoints) / nextCredits;

  const resultDiv = document.getElementById("targetResult");
  const resultValue = document.getElementById("targetSGPA");

  if (requiredSGPA > 10) {
    resultValue.innerText = "❌ Impossible";
  } else if (requiredSGPA < 0) {
    resultValue.innerText = "✅ Already Met";
  } else {
    resultValue.innerText = requiredSGPA.toFixed(2);
  }

  resultDiv.classList.remove("hidden");
  react(resultDiv, requiredSGPA);
};

// Export to CSV
document.getElementById("exportCGPA").onclick = () => {
  const rows = [...semesterTable.rows];
  let csv = "Semester Name,Total Credits,SGPA\n";
  rows.slice(1).forEach(r => {
    const sem = r.cells[0].firstChild.value;
    const credits = r.cells[1].firstChild.value;
    const sgpa = r.cells[2].firstChild.value;
    csv += `${sem},${credits},${sgpa}\n`;
  });

  const cgpa = document.getElementById("cgpaValue").innerText;
  csv += `\nCurrent CGPA,${cgpa}`;

  const link = document.createElement("a");
  link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  link.download = "CGPA_Report_" + new Date().getTime() + ".csv";
  link.click();
};

// Clear History
document.getElementById("clearHistory").onclick = () => {
  if (confirm("Clear all calculation history?")) {
    calculationHistory = [];
    localStorage.removeItem("cgpaHistory");
    updateHistoryDisplay();
  }
};

// Load data from localStorage on startup
window.addEventListener("load", () => {
  const tgpaData = JSON.parse(localStorage.getItem("tgpaData")) || [];
  const cgpaData = JSON.parse(localStorage.getItem("cgpaData")) || [];

  tgpaData.forEach(addSubject);
  cgpaData.forEach((sem) => {
    document.getElementById("addSemester").click();
    const lastRow = semesterTable.rows[semesterTable.rows.length - 1];
    lastRow.cells[0].firstChild.value = sem.semesterName;
    lastRow.cells[1].firstChild.value = sem.credits;
    lastRow.cells[2].firstChild.value = sem.sgpa;
  });

  updateHistoryDisplay();
});

// Save data to localStorage on input
document.addEventListener("change", () => {
  const tgpaData = [...subjectTable.rows].slice(1).map(r => ({
    subject: r.cells[1].firstChild.value,
    credits: r.cells[2].firstChild.value,
    marks: r.cells[3].firstChild.value
  }));
  
  const cgpaData = [...semesterTable.rows].slice(1).map(r => ({
    semesterName: r.cells[0].firstChild.value,
    credits: r.cells[1].firstChild.value,
    sgpa: r.cells[2].firstChild.value
  }));

  localStorage.setItem("tgpaData", JSON.stringify(tgpaData));
  localStorage.setItem("cgpaData", JSON.stringify(cgpaData));
});

document.getElementById("themeToggle").onclick = () =>
  document.body.classList.toggle("dark");

// Semester Comparison
function updateComparison() {
  const rows = [...document.getElementById("semesterTable").rows].slice(1);
  const chart = document.getElementById("comparisonChart");
  
  if (rows.length < 2) {
    chart.innerHTML = '<p class="empty-msg">Add at least 2 semesters to compare</p>';
    return;
  }
  
  chart.innerHTML = rows.map(r => {
    const semName = r.cells[0].firstChild.value || "Unknown";
    const credits = r.cells[1].firstChild.value;
    const sgpa = r.cells[2].firstChild.value;
    return `
      <div class="semester-compare-card">
        <h4>${semName}</h4>
        <div class="semester-compare-value">${sgpa}</div>
        <div class="semester-compare-detail">Credits: ${credits}</div>
      </div>
    `;
  }).join('');
}

// Print Comparison
document.getElementById("printComparison").onclick = () => {
  if ([...document.getElementById("semesterTable").rows].slice(1).length < 2) {
    showToast('Add at least 2 semesters to print', 'warning');
    return;
  }
  window.print();
  showToast('Print dialog opened!', 'success');
};

// ===== ANALYTICS CHARTS =====
let trendChart = null, gradeChart = null;

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey) {
    if (e.key === 's') {
      e.preventDefault();
      alert('Data auto-saved!');
    }
  }
  
  if (e.key === "Enter" && document.getElementById("tgpaSection").classList.contains("hidden") === false) {
    document.getElementById("calculateTGPA").click();
  }
});

const classesInput = document.getElementById("classes");
const subjectsInput = document.getElementById("subjects");
const teachersInput = document.getElementById("teachers");
const daysInput = document.getElementById("days");
const periodsInput = document.getElementById("periods");

const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");

const timetableOutput = document.getElementById("timetableOutput");
const statusText = document.getElementById("statusText");

function parseCommaSeparatedValues(value) {
  return value
    .split(",")
    .map(item => item.trim())
    .filter(item => item !== "");
}

function getCurrentDateTime() {
  const now = new Date();
  return now.toLocaleString();
}

function createTimetable(classes, subjects, teachers, days, periods) {
  let html = `
    <div class="generated-info">
      <h2>Generated Timetable Report</h2>
      <p><strong>Generated On:</strong> ${getCurrentDateTime()}</p>
    </div>
  `;

  classes.forEach((className, classIndex) => {
    html += `<div class="class-block">`;
    html += `<h3>${className} Timetable</h3>`;
    html += `<table>`;
    html += `<thead><tr><th>Day</th>`;

    for (let p = 1; p <= periods; p++) {
      html += `<th>Period ${p}</th>`;
    }

    html += `</tr></thead><tbody>`;

    let subjectPointer = classIndex;
    let teacherPointer = classIndex;

    days.forEach(day => {
      html += `<tr>`;
      html += `<td>${day}</td>`;

      for (let p = 0; p < periods; p++) {
        const subject = subjects[subjectPointer % subjects.length];
        const teacher = teachers.length
          ? teachers[teacherPointer % teachers.length]
          : "Not Assigned";

        html += `
          <td>
            <span class="subject-cell">${subject}</span>
            <span class="teacher-line">${teacher}</span>
          </td>
        `;

        subjectPointer++;
        teacherPointer++;
      }

      html += `</tr>`;
    });

    html += `</tbody></table>`;
    html += `</div>`;
  });

  return html;
}

generateBtn.addEventListener("click", () => {
  const classes = parseCommaSeparatedValues(classesInput.value);
  const subjects = parseCommaSeparatedValues(subjectsInput.value);
  const teachers = parseCommaSeparatedValues(teachersInput.value);
  const days = parseCommaSeparatedValues(daysInput.value);
  const periods = parseInt(periodsInput.value);

  if (!classes.length || !subjects.length || !days.length || !periods) {
    alert("Please fill Classes, Subjects, Days, and Periods properly.");
    return;
  }

  const timetableHTML = createTimetable(classes, subjects, teachers, days, periods);
  timetableOutput.innerHTML = timetableHTML;
  statusText.textContent = "Timetable generated successfully.";
});

downloadBtn.addEventListener("click", async () => {
  if (!timetableOutput.innerHTML.trim()) {
    alert("Please generate the timetable first.");
    return;
  }

  const { jsPDF } = window.jspdf;

  const canvas = await html2canvas(timetableOutput, {
    scale: 2,
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 10;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 5;

  pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 5;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 5, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save("generated_timetable.pdf");
});

resetBtn.addEventListener("click", () => {
  classesInput.value = "";
  subjectsInput.value = "";
  teachersInput.value = "";
  daysInput.value = "";
  periodsInput.value = "";
  timetableOutput.innerHTML = "";
  statusText.textContent = "Fill the details and click Generate Timetable.";
});
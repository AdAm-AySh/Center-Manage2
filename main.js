let teachersData = JSON.parse(localStorage.getItem("centerTeacherData")) || [];
let notes = JSON.parse(localStorage.getItem("centerNotes")) || "";
let currentTeacherIndex = null;
let currentGroupIndex = null;
const notesTextarea = document.getElementsByTagName("textarea")[0];

function saveToLocalStorage() {
  localStorage.setItem("centerTeacherData", JSON.stringify(teachersData));
  localStorage.setItem("centerNotes", JSON.stringify(notes));
}

document.addEventListener("DOMContentLoaded", () => {
  renderTeachers();
  setupStudentSearch();
  setTimeout(showHelloCard, 1e3);
  notesTextarea.value = notes
});

function showHelloCard() {
  const helloCardParent = document.getElementById("helloCardParent");
  helloCardParent.classList.add("active");
  document.addEventListener("click", (e) => {
    if (e.currentTarget !== helloCardParent.firstChild) {
      document.getElementById("helloCardParent").classList.remove("active");
    }
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("active");
  setTimeout((_) => modal.querySelector("input").focus(), 100);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
}

function closeModal(id) {
  let modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("active");
  if (modal.querySelector("input")) {
    modal.querySelectorAll("input").forEach((input) => {
      input.value = "";
    });
  }
}

function switchSection(section) {
  const teachersSection = document.getElementById("teachersSection");
  const studentsSection = document.getElementById("studentsSection");
  const notesSection = document.getElementById("notesSection");
  const navTeachers = document.getElementById("navTeachers");
  const navStudents = document.getElementById("navStudents");
  const navNontes = document.getElementById("navNontes");
  const sidebar = document.getElementById("sidebar");

  if (section === "teachers") {
    teachersSection.style.display = "block";
    studentsSection.style.display = "none";
    notesSection.style.display = "none";
    navTeachers.classList.add("active");
    navStudents.classList.remove("active");
    navNotes.classList.remove("active");
    sidebar.classList.remove("active");
  } else if (section === "students") {
    studentsSection.style.display = "block";
    teachersSection.style.display = "none";
    notesSection.style.display = "none";
    navStudents.classList.add("active");
    navTeachers.classList.remove("active");
    navNotes.classList.remove("active");
    sidebar.classList.remove("active");
    renderGlobalStudents();
  } else if (section === "notes") {
    notesSection.style.display = "block";
    studentsSection.style.display = "none";
    teachersSection.style.display = "none";
    navNotes.classList.add("active");
    navTeachers.classList.remove("active");
    navStudents.classList.remove("active");
    sidebar.classList.remove("active");
  }
}

function toggleSidebar() {
  const nav = document.getElementById("sidebar");
  nav.classList.toggle("active");
}

function addTeacher() {
  const nameInput = document.getElementById("teacherNameInput");
  if (nameInput.value.trim() === "") {
    alert("اكتب اسم المدرس الأول");
    return;
  }

  for (let i = 0; i < teachersData.length; i++) {
    const teacher = teachersData[i];
    if (nameInput.value.trim() === teacher.name) {
      return alert("فيه استاذ بنفس الاسم ده!");
    }
  }

  const newTeacher = {
    name: nameInput.value.trim(),
    groups: [],
  };

  teachersData.push(newTeacher);

  saveToLocalStorage();

  closeModal("teacherModal");

  nameInput.value = "";

  renderTeachers();
}

function renderTeachers() {
  const grid = document.getElementById("teachersGrid");
  grid.innerHTML = "";

  let delAllTeachersBtn = document.createElement("button");
  delAllTeachersBtn.textContent = "حذف الكل";
  delAllTeachersBtn.className = "delAllTeachers";
  delAllTeachersBtn.style.color = "#fff";
  if (teachersData && teachersData.length === 0) {
    delAllTeachersBtn.style.display = "none";
  }
  delAllTeachersBtn.addEventListener("click", (_) => {
    if (!confirm("هل تريد حذف جميع المدرسين؟")) return;

    teachersData = [];
    localStorage.removeItem("centerTeacherData");

    currentTeacherIndex = null;
    currentGroupIndex = null;

    const detailsSection = document.getElementById("detailsSection");
    if (detailsSection) detailsSection.style.display = "none";

    const groupsContainer = document.getElementById("groupsContainer");
    if (groupsContainer) groupsContainer.innerHTML = "";
    renderTeachers();
  });

  teachersData.forEach((teacher, index) => {
    const card = document.createElement("div");
    card.className = "teacher-card";
    card.onclick = () => selectTeacher(index);
    card.innerHTML = `
            <h3>👨‍🏫 أ/ <input type="text" style="width: 100px; text-align: center;" value="${teacher.name}" onchange="updateTeacherName(${index}, this.value)" /></h3>
            <p>عدد المجموعات: ${teacher.groups.length}</p>
            <button class="btn-delete" onclick="event.stopPropagation(); deleteTeacher(${index})">حذف</button>
            `;
    grid.appendChild(card);
  });
  grid.prepend(delAllTeachersBtn);
}

function selectTeacher(index) {
  currentTeacherIndex = index;
  const teacher = teachersData[index];

  const teacherNameHeading = (document.getElementById(
    "selectedTeacherName",
  ).innerText = `مجموعات المدرس: أ/ ${teacher.name}`);

  let detailsSection = document.getElementById("detailsSection");
  detailsSection.style.display = "block";

  renderGroups();

  if (window.innerWidth <= 768) {
    document.getElementById("sidebar").classList.remove("active");
  }
}

function updateTeacherName(teacherIndex, newName) {
  teachersData[currentTeacherIndex].name = newName;
  saveToLocalStorage();
  renderTeachers();
  renderGroups();
}

function deleteTeacher(teacherindex) {
  if (!confirm(`هل تريد حذف المدرس ${teachersData[teacherindex].name}?`))
    return;

  teachersData.splice(teacherindex, 1);
  saveToLocalStorage();

  if (currentTeacherIndex === teacherindex) {
    currentTeacherIndex = null;
    currentGroupIndex = null;
    const detailsSection = document.getElementById("detailsSection");
    if (detailsSection) detailsSection.style.display = "none";
  } else if (currentTeacherIndex > teacherindex) {
    currentTeacherIndex -= 1;
  }

  renderTeachers();
  if (currentTeacherIndex !== null) renderGroups();
}

function addGroup() {
  const groupNameInput = document.getElementById("groupNameInput");
  const monyMonthInput = document.getElementById("monyMonthInput");
  const selectedTimeInput = document.getElementById("selectedTimeInput");
  if (groupNameInput.value.trim() === "")
    return alert("اكتب اسم المجموعة الأول");

  const newGroup = {
    name: groupNameInput.value.trim(),
    students: [],
    monyMonth: `${monyMonthInput.value.trim()}ج`,
    selectedTime: selectedTimeInput.value.trim(),
  };

  teachersData[currentTeacherIndex].groups.push(newGroup);
  groupNameInput.value = "";
  monyMonthInput.value = "";

  closeModal("groupModal");

  saveToLocalStorage();
  renderGroups();
  renderTeachers();
}

function deleteGroup(groupIndex) {
  const group = teachersData[currentTeacherIndex].groups[groupIndex];
  if (!confirm(`هل تريد حذف المجموعة ${group.name || groupIndex + 1}؟`)) return;

  teachersData[currentTeacherIndex].groups.splice(groupIndex, 1);
  saveToLocalStorage();

  if (currentGroupIndex === groupIndex) {
    currentGroupIndex = null;
  } else if (currentGroupIndex > groupIndex) {
    currentGroupIndex -= 1;
  }

  renderGroups();
}

function updateGroupName(groupIndex, newName) {
  teachersData[currentTeacherIndex].groups[groupIndex].name = newName;
  saveToLocalStorage();
}

function updateSelectedTime(groupIndex, newTime) {
  teachersData[currentTeacherIndex].groups[groupIndex].selectedTime = newTime;
  saveToLocalStorage();
  renderGroups();
}

function updateMonyMonth(groupIndex, newMonyMonth) {
  teachersData[currentTeacherIndex].groups[groupIndex].monyMonth = newMonyMonth;
  saveToLocalStorage();
  renderGroups();
}

function triggerAddStudent(groupIndex) {
  currentGroupIndex = groupIndex;
  openModal("studentModal");
}

function addStudent() {
  const studentNameInput = document.getElementById("studentNameInput");
  if (studentNameInput.value.trim() === "")
    return alert("اكتب اسم الطالب الأول");

  const newStudent = {
    name: studentNameInput.value.trim(),
    payments: [false, false, false, false, false],
    notes: "",
  };

  teachersData[currentTeacherIndex].groups[currentGroupIndex].students.push(
    newStudent,
  );

  studentNameInput.value = "";

  closeModal("studentModal");
  saveToLocalStorage();
  renderGroups();
}

function deleteStudent(groupIndex, studentIndex) {
  const student =
    teachersData[currentTeacherIndex].groups[groupIndex].students[studentIndex];
  if (!confirm(`هل تريد حذف الطالب ${student.name || studentIndex + 1}؟`))
    return;

  teachersData[currentTeacherIndex].groups[groupIndex].students.splice(
    studentIndex,
    1,
  );
  saveToLocalStorage();
  renderGroups();
}

function togglePayment(
  groupIndex,
  studentIndex,
  monthIndex,
  teacherIndex = currentTeacherIndex,
) {
  const currentStatus =
    teachersData[teacherIndex].groups[groupIndex].students[studentIndex]
      .payments[monthIndex];
  teachersData[teacherIndex].groups[groupIndex].students[studentIndex].payments[
    monthIndex
  ] = !currentStatus;

  saveToLocalStorage(); // حفظ بـ JSON
  renderGlobalStudents();
  renderGroups();
}

function updateStudentNotes(
  groupIndex,
  studentIndex,
  noteText,
  teacherIndex = currentTeacherIndex,
) {
  teachersData[teacherIndex].groups[groupIndex].students[studentIndex].notes =
    noteText;
  saveToLocalStorage();
  renderGroups();
  renderGlobalStudents();
}

function setupStudentSearch() {
  const container = document.getElementById("groupsContainer");
  if (!container) return;

  container.addEventListener("input", (event) => {
    if (!event.target.classList.contains("search-student-input")) return;

    const groupBox = event.target.closest(".group-box");
    const query = event.target.value.trim().toLowerCase();
    const rows = groupBox.querySelectorAll(".student-row");
    const emptyMessage = groupBox.querySelector(".search-empty-state");

    let hasMatch = false;
    rows.forEach((row) => {
      const name = (row.dataset.studentName || "").toLowerCase();
      const match = name.includes(query);
      row.style.display = match ? "" : "none";
      if (match) hasMatch = true;
    });

    if (emptyMessage) {
      emptyMessage.style.display = query && !hasMatch ? "block" : "none";
    }
  });
}

function renderGroups() {
  const container = document.getElementById("groupsContainer");
  container.innerHTML = "";

  const groups = teachersData[currentTeacherIndex].groups;
  if (groups.length === 0) {
    container.innerHTML =
      '<p style="color: #64748b;">لا توجد مجموعات مضافة لهذا المدرس بعد.</p>';
    return;
  }

  groups.forEach((group, gIndex) => {
    const groupBox = document.createElement("div");
    groupBox.className = "group-box";

    let html = `
      <div class="group-title-container">
        <div>
          📁 <input type="text" value="${group.name}" onchange="updateGroupName(${gIndex}, this.value)" title="اضغط لتعديل الاسم">
          <button class="btn-primary" style="padding: 5px 10px; font-size: 13px;" onclick="triggerAddStudent(${gIndex})">➕ إضافة طالب</button>
        </div>
        <span style="background: #6795fa; padding: 5px 12px; border-radius: 4px; font-weight: 600; color: #fff; width: 150px;">💰 <input type="text" style="width: 30px;" value="${group.monyMonth || "لم يتم تحديثه"}" onchange="updateMonyMonth(${gIndex}, this.value)" /></span>
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <input type="text" placeholder="ابحث عن طالب..." class="search-student-input" style="flex: 1;" />
      </div>
    `;

    if (group.students.length === 0) {
      html +=
        '<p style="font-size: 14px; color: #94a3b8;">لا يوجد طلاب في هذه المجموعة بعد.</p>';
    } else {
      html += `
        <div class="students-table-wrapper">
          <table class="students-table">
            <thead>
              <tr>
                <th>اسم الطالب</th>
                <th>حالة دفع الحصص</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
      `;

      group.students.forEach((student, sIndex) => {
        html += `
          <tr class="student-row" data-student-name="${student.name}">
            <td>
              <div>
                ${sIndex + 1}- 👨‍🎓 ${student.name}
              </div>
              <button onclick="deleteStudent(${gIndex}, ${sIndex})">حذف</button>
            </td>
            <td>
              <div class="payment-boxes">
        `;

        student.payments.forEach((paid, pIndex) => {
          const payClass = paid ? "pay-box paid" : "pay-box";
          html += `<div class="${payClass}" onclick="togglePayment(${gIndex}, ${sIndex}, ${pIndex})">${group.monyMonth ?? "لم يتم تحديثه"}</div>`;
        });

        html += `
              </div>
            </td>
            <td>
              <input type='text' class='notes-input' value="${student.notes || ""}" onchange="updateStudentNotes(${gIndex}, ${sIndex}, this.value)" placeholder='أضف ملاحظة...'>
            </td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
          <p class="search-empty-state" style="display: none; color: #64748b; margin-top: 8px;">لا توجد نتائج تطابق البحث.</p>
        </div>
      `;
    }

    html += `
      <div class="group-info">
        <span>عدد الطلاب: ${group.students.length}</span>
        <span>ميعاد الحصة: <input type="text" style="border: none; color: inherit; font-size: inherit; width: 72px;" value="${group.selectedTime || "مش محدد"}" onchange="updateSelectedTime(${gIndex}, this.value)" /></span>
      </div>
      <button class="delGroup" onclick="deleteGroup(${gIndex})">حذف</button>
    `;

    groupBox.innerHTML = html;
    container.appendChild(groupBox);
  });
}

document
  .getElementById("teacherNameInput")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      addTeacher();
    } else if (e.key === "Escape") {
      closeModal("teacherModal");
    }
  });

function renderGlobalStudents() {
  const tbody = document.getElementById("globalStudentsTableBody");
  const searchQuery = document
    .getElementById("globalStudentSearch")
    .value.trim()
    .toLowerCase();

  tbody.innerHTML = "";

  let totalStudents = 0;

  teachersData.forEach((teacher, tIndex) => {
    teacher.groups.forEach((group, gIndex) => {
      group.students.forEach((student, sIndex) => {
        totalStudents++;

        const matchSearch =
          student.name.toLowerCase().includes(searchQuery) ||
          teacher.name.toLowerCase().includes(searchQuery) ||
          group.name.toLowerCase().includes(searchQuery);

        if (matchSearch) {
          const tr = document.createElement("tr");

          let paymentsHtml = `<div class="payment-boxes">`;
          student.payments.forEach((paid, pIndex) => {
            const payClass = paid ? "pay-box paid" : "pay-box";
            paymentsHtml += `<div class="${payClass}" onclick="togglePayment(${gIndex}, ${sIndex}, ${pIndex}, ${tIndex})">${group.monyMonth || "غير محدد"}</div>`;
          });
          paymentsHtml += `</div>`;

          tr.innerHTML = `
              <td>👨‍🎓 <strong>${student.name}</td>
              <td>أ/ ${teacher.name}</td>
              <td>📁 ${group.name}</td>
              <td>${paymentsHtml}</td>
              <td>
                <input type='text' style="width:100%; border:none;" value="${student.notes || ""}" onchange="updateStudentNotes(${gIndex}, ${sIndex}, this.value, ${tIndex})" placeholder='أضف ملاحظة...'>
              </td>
              <td><button class="btn-danger" style="padding: 4px 8px; font-size: 12px;" onclick="deleteGlobalStudent(${tIndex}, ${gIndex}, ${sIndex})">حذف</button></td>
            `;
          tbody.appendChild(tr);
        }
      });
    });
    renderGroups();
  });

  document.getElementById("totalStudentCount").innerHTML = totalStudents;

  if (tbody.children.length === 0)
    tbody.innerHTML = `
    <tr>
      <td colspan="6" style="color: #64748b">لا يوجد طلاب حاليا.</td>
    </tr>
  `;
}

function deleteGlobalStudent(tIndex, gIndex, sIndex) {
  const student = teachersData[tIndex].groups[gIndex].students[sIndex];
  if (!confirm(`هل تريد حذف الطالب ${student.name}؟`)) return;

  teachersData[tIndex].groups[gIndex].students.splice(sIndex, 1);
  saveToLocalStorage();
  renderGlobalStudents();
}

notesTextarea.oninput = () => {
  notes = notesTextarea.value;
  saveToLocalStorage()
}

document
  .getElementById("studentNameInput")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      addStudent();
    } else if (e.key === "Escape") {
      closeModal("studentModal");
    }
  });

let groupNameInput = document.getElementById("groupNameInput");
let monyMonthInput = document.getElementById("monyMonthInput");
let selectedTimeInput = document.getElementById("selectedTimeInput");

groupNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    this.blur();
    monyMonthInput.focus();
  } else if (e.key === "Escape") {
    closeModal("groupModal");
  }
});

monyMonthInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    this.blur();
    selectedTimeInput.focus();
  } else if (e.key === "Escape") {
    closeModal("groupModal");
  }
});

selectedTimeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addGroup();
  }
});

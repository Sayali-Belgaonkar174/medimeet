let currentRole = '';
let currentUser = null;

function showAuth(role) {
  currentRole = role;
  document.getElementById('role-selection').classList.add('d-none');
  document.getElementById('auth-section').classList.remove('d-none');
  document.getElementById('auth-heading').textContent = `Login as ${role}`;
}

function toggleAuth(showSignup) {
  document.getElementById('login-form').classList.toggle('d-none', showSignup);
  document.getElementById('signup-form').classList.toggle('d-none', !showSignup);
  document.getElementById('auth-heading').textContent = showSignup ?` Sign Up as ${currentRole}` :` Login as ${currentRole}`;
}
function signup() {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  if (!name || !email || !password) return alert('Fill all fields');
  const users = JSON.parse(localStorage.getItem(currentRole + 's') || '[]');
  if (users.find(u => u.email === email)) return alert('Email already registered');
  users.push({ name, email, password });
  localStorage.setItem(currentRole + 's', JSON.stringify(users));
  alert('Signup successful. Please login.');
  toggleAuth(false);
}
// function signup() {
//   const name = document.getElementById('signup-name').value;
//   const email = document.getElementById('signup-email').value;
//   const password = document.getElementById('signup-password').value;
//   if (!name || !email || !password) return alert('Fill all fields');
//   const users = JSON.parse(localStorage.getItem(currentRole + 's') || '[]');
//   if (users.find(u => u.email === email)) return alert('Email already registered');
//   users.push({ name, email, password });
//   localStorage.setItem(currentRole + 's', JSON.stringify(users));
//   alert('Signup successful. Please login.');
//   toggleAuth(false);
// }
function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const users = JSON.parse(localStorage.getItem(currentRole + 's') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return alert('Invalid login credentials');
  currentUser = user;
  document.getElementById('auth-section').classList.add('d-none');
  if (currentRole === 'patient') {
    document.getElementById('patient-dashboard').classList.remove('d-none');
    document.getElementById('patient-name').textContent = currentUser.name;
    displayAppointmentsForPatient();
    displayPatientHistory();
  } else if (currentRole === 'nurse') {
  document.getElementById('nurse-dashboard').classList.remove('d-none');
  document.getElementById('nurse-name').textContent = currentUser.name;
  loadNurseTasks();
}

  else {
    document.getElementById('doctor-dashboard').classList.remove('d-none');
    document.getElementById('doctor-name').textContent = currentUser.name;
    showDoctorCalendar();
  }
 }

// function login() {
//   const email = document.getElementById('login-email').value;
//   const password = document.getElementById('login-password').value;
//   const users = JSON.parse(localStorage.getItem(currentRole + 's') || '[]');
//   const user = users.find(u => u.email === email && u.password === password);
//   if (!user) return alert('Invalid login credentials');
//   currentUser = user;
//   document.getElementById('auth-section').classList.add('d-none');
//   if (currentRole === 'patient') {
//     document.getElementById('patient-dashboard').classList.remove('d-none');
//     document.getElementById('patient-name').textContent = currentUser.name;
//     displayAppointmentsForPatient();
//     displayPatientHistory();
//   } else {
//     document.getElementById('doctor-dashboard').classList.remove('d-none');
//     document.getElementById('doctor-name').textContent = currentUser.name;
//     showDoctorCalendar();
//   }
// }
function bookAppointment() {
  const date = document.getElementById('appointment-date').value;
  const time = document.getElementById('appointment-time').value;
  const doctorName = document.getElementById('doctor-name-input').value;
  const doctorEmail = document.getElementById('doctor-email-input').value;
  const medicalText = document.getElementById('medical-text').value;
  const file = document.getElementById('medical-file').files[0];
  if (!date || !time || !doctorName || !doctorEmail) return alert('Fill all fields');
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  if (appointments.find(app => app.date === date && app.time === time && app.doctorEmail === doctorEmail)) {
    return alert('Slot already taken');
  }
  const reader = new FileReader();
  reader.onload = () => {
    const fileData = file ? reader.result : '';
    appointments.push({
      date, time, doctorName, doctorEmail,
      patientName: currentUser.name, patientEmail: currentUser.email,
      medicalText, medicalFile: fileData, prescription: ''
    });
    localStorage.setItem('appointments', JSON.stringify(appointments));
    displayAppointmentsForPatient();
    displayPatientHistory();
    alert('Appointment booked');
  };
  if (file) reader.readAsDataURL(file); else reader.onload();
}

function displayAppointmentsForPatient() {
  const ul = document.getElementById('appointments-list-ul');
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  ul.innerHTML = '';
  /*appointments.filter(a => a.patientEmail === currentUser.email).forEach(a => {
    const li = document.createElement('li');
    li.textContent = `${a.date} at ${a.time} with Dr. ${a.doctorName}`;
    const btn = document.createElement('button');
    btn.textContent = 'Cancel';
    btn.onclick = () => cancelAppointment(a);
    li.appendChild(btn);
    ul.appendChild(li);
  });*/
  appointments.filter(a => a.patientEmail === currentUser.email).forEach(a => {
  const li = document.createElement('li');
  li.textContent = `${a.date} at ${a.time} with Dr. ${a.doctorName} - ${a.confirmed ? 'Confirmed' : 'Pending'}`;
  const btn = document.createElement('button');
  btn.textContent = 'Cancel';
  btn.onclick = () => cancelAppointment(a);
  li.appendChild(btn);
  ul.appendChild(li);
});

}

function cancelAppointment(a) {
  let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  appointments = appointments.filter(app => !(app.date === a.date && app.time === a.time && app.patientEmail === a.patientEmail));
  localStorage.setItem('appointments', JSON.stringify(appointments));
  displayAppointmentsForPatient();
  displayPatientHistory();
}

function displayPatientHistory() {
  const div = document.getElementById('patient-history-list');
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  div.innerHTML = '';
  appointments.filter(app => app.patientEmail === currentUser.email).forEach(app => {
    div.innerHTML += `
      <p><strong>Date:</strong> ${app.date} | <strong>Doctor:</strong> Dr. ${app.doctorName}</p>
      <p><strong>History:</strong> ${app.medicalText}</p>
      <p><strong>Prescription:</strong> ${app.prescription || 'None'}</p><hr/>
    `;
  });
}

function showDoctorCalendar() {
  const container = document.getElementById('calendar-days');
  container.innerHTML = '';

  // Days of the week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  daysOfWeek.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day header';
    dayHeader.textContent = day;
    container.appendChild(dayHeader);
  });

  // Setup for April 2025
  const year = 2025;
  const month = 5; // April (0-based index)
  const firstDay = new Date(year, month, 1).getDay(); // Day of the week the month starts on
  const totalDays = new Date(year, month + 1, 0).getDate(); // Total days in April

  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  const counts = {};
  appointments.forEach(app => {
    if (app.doctorEmail === currentUser.email) {
      counts[app.date] = (counts[app.date] || 0) + 1;
    }
  });

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    container.appendChild(empty);
  }

  // Actual date cells
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-06-${String(day).padStart(2, '0')}`;
    const div = document.createElement('div');
    div.className = 'calendar-day';
    div.innerHTML = `<strong>${day}</strong><br>${counts[dateStr] || 0} Patients`;
    div.onclick = () => showPatientsForDay(dateStr);
    container.appendChild(div);
  }
}

function showPatientsForDay(date) {
  document.getElementById('selected-day').textContent = date;
  const container = document.getElementById('patients-for-day');
  container.innerHTML = '';
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  appointments.filter(app => app.date === date && app.doctorEmail === currentUser.email)
    .forEach(app => {
      const div = document.createElement('div');
      div.innerHTML = `<p><strong>${app.patientName}</strong>  <button onclick="viewPatientDetails('${app.patientEmail}', '${date}')">View</button></p>`;
      container.appendChild(div);
    });
  document.getElementById('patients-list').classList.remove('d-none');
}

function viewPatientDetails(email, date) {
  const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  const app = appointments.find(a => a.patientEmail === email && a.date === date && a.doctorEmail === currentUser.email);
  if (!app) return;
  document.getElementById('detail-name').textContent = app.patientName;
  document.getElementById('detail-email').textContent = app.patientEmail;
  document.getElementById('detail-history').textContent = app.medicalText;
  document.getElementById('detail-file').href = app.medicalFile || '#';
  document.getElementById('new-history').value = app.medicalText;
  document.getElementById('new-prescription').value = app.prescription;
  const modal = document.getElementById('patient-details-modal');
  modal.setAttribute('data-email', email);
  modal.setAttribute('data-date', date);
  modal.classList.remove('d-none');
}

/*function updatePatientHistory() {
  const email = document.getElementById('patient-details-modal').getAttribute('data-email');
  const date = document.getElementById('patient-details-modal').getAttribute('data-date');
  const history = document.getElementById('new-history').value;
  const prescription = document.getElementById('new-prescription').value;
  let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
  appointments = appointments.map(app => {
    if (app.patientEmail === email && app.date === date && app.doctorEmail === currentUser.email) {
      app.medicalText = history;
      app.prescription = prescription;
    }
    return app;
  });
  localStorage.setItem('appointments', JSON.stringify(appointments));
  document.getElementById('patient-details-modal').classList.add('d-none');
  showDoctorCalendar();
  const isConfirmed = document.getElementById('confirm-appointment-checkbox').checked;

appointments = appointments.map(app => {
  if (app.patientEmail === email && app.date === date && app.doctorEmail === currentUser.email) {
    app.medicalText = history;
    app.prescription = prescription;
    app.confirmed = isConfirmed;  // <-- Add this
  }
  return app;
});

}*/
function updatePatientHistory() {
  const email = document.getElementById('patient-details-modal').getAttribute('data-email');
  const date = document.getElementById('patient-details-modal').getAttribute('data-date');
  const history = document.getElementById('new-history').value;
  const prescription = document.getElementById('new-prescription').value;
  const isConfirmed = document.getElementById('confirm-appointment-checkbox').checked;

  let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');

  appointments = appointments.map(app => {
    if (app.patientEmail === email && app.date === date && app.doctorEmail === currentUser.email) {
      app.medicalText = history;
      app.prescription = prescription;
      app.confirmed = isConfirmed;  // ✅ Include confirmed flag in same loop
    }
    return app;
  });

  // ✅ Save only once after full update
  localStorage.setItem('appointments', JSON.stringify(appointments));

  document.getElementById('patient-details-modal').classList.add('d-none');
  showDoctorCalendar();
}


function closePatientDetailsModal() {
  document.getElementById('patient-details-modal').classList.add('d-none');
}

function logout() {
  location.reload();
}

/*function renderDashboard() {
  switch (currentRole) {
    case 'patient':
      $('#patient-name').text(currentUser.name);
      $('#patient-dashboard').removeClass('d-none');
      loadPatientAppointments();
      break;
    case 'doctor':
      $('#doctor-name').text(currentUser.name);
      $('#doctor-dashboard').removeClass('d-none');
      loadDoctorCalendar();
      break;
    case 'nurse':
      $('#nurse-name').text(currentUser.name);
      $('#nurse-dashboard').removeClass('d-none');
      loadNurseTasks();
      break;
    case 'superadmin':
      $('#superadmin-dashboard').removeClass('d-none');
      loadUsers();
      break;
      
  }
}*/
function renderDashboard() {
  switch (currentRole) {
    case 'patient':
      $('#patient-name').text(currentUser.name);
      $('#patient-dashboard').removeClass('d-none');
      loadPatientAppointments();
      break;

    case 'doctor':
      $('#doctor-name').text(currentUser.name);
      $('#doctor-dashboard').removeClass('d-none');
      loadDoctorCalendar();
      renderDoctorNurseTaskChecklist(); // ✅ Show nurse tasks to doctor
      break;

    case 'nurse':
      $('#nurse-name').text(currentUser.name);
      $('#nurse-dashboard').removeClass('d-none');
      loadNurseTasks();
      break;

    case 'superadmin':
      $('#superadmin-dashboard').removeClass('d-none');
      loadUsers();
      break;
  }
}

function loadNurseTasks() {
  const nurseEmail = currentUser.email;
  const taskList = document.getElementById('nurse-task-list');
  taskList.innerHTML = '';

  const tasks = JSON.parse(localStorage.getItem('nurseTasks') || '[]');
  tasks.filter(t => t.nurseEmail === nurseEmail).forEach(task => {
    const div = document.createElement('div');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.onchange = () => {
      task.done = checkbox.checked;
      saveNurseTaskStatus(task);
    };
    div.innerHTML = `<strong>${task.date}</strong>: ${task.description}`;
    div.prepend(checkbox);
    taskList.appendChild(div);
  });
}

/*function saveNurseTaskStatus(updatedTask) {
  let tasks = JSON.parse(localStorage.getItem('nurseTasks') || '[]');
  tasks = tasks.map(t => {
    if (t.date === updatedTask.date && t.nurseEmail === updatedTask.nurseEmail && t.description === updatedTask.description) {
      return updatedTask;
    }
    return t;
  });
  localStorage.setItem('nurseTasks', JSON.stringify(tasks));
}*/
function saveNurseTaskStatus(updatedTask) {
  let tasks = JSON.parse(localStorage.getItem('nurseTasks') || '[]');
  tasks = tasks.map(t => {
    if (
      t.nurseEmail === updatedTask.nurseEmail &&
      t.date === updatedTask.date &&
      t.description === updatedTask.description
    ) {
      t.done = updatedTask.done;
    }
    return t;
  });
  localStorage.setItem('nurseTasks', JSON.stringify(tasks));
}

function assignTaskToNurse(nurseEmail, date, description) {
  const tasks = JSON.parse(localStorage.getItem('nurseTasks') || '[]');
  tasks.push({ nurseEmail, date, description, done: false });
  localStorage.setItem('nurseTasks', JSON.stringify(tasks));
  alert('Task assigned to nurse');
}
function assignTaskToNurse() {
  const nurseName = document.getElementById('nurse-name-task').value;
  const nurseEmail = document.getElementById('nurse-email-task').value;
  const taskDesc = document.getElementById('task-desc').value;

  if (!nurseName || !nurseEmail || !taskDesc) {
    return alert("Please fill all task fields");
  }

  const tasks = JSON.parse(localStorage.getItem('nurseTasks') || '[]');
  tasks.push({
    nurseName,
    nurseEmail,
    task: taskDesc,
    assignedBy: currentUser.name,
    completed: false
  });

  localStorage.setItem('nurseTasks', JSON.stringify(tasks));
  alert("Task assigned to nurse.");
}
function loadNurseTasks() {
  const tasks = JSON.parse(localStorage.getItem('nurseTasks') || '[]');
  const ul = document.getElementById('nurse-tasks-list');
  ul.innerHTML = '';

  tasks.filter(t => t.nurseEmail === currentUser.email).forEach((task, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <label>
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus(${index})" />
        ${task.task} (Assigned by Dr. ${task.assignedBy})
      </label>
    `;
    ul.appendChild(li);
  });
}
function toggleTaskStatus(index) {
  let tasks = JSON.parse(localStorage.getItem('nurseTasks') || '[]');
  const nurseTasks = tasks.filter(t => t.nurseEmail === currentUser.email);
  const taskToUpdate = nurseTasks[index];

  tasks = tasks.map(t => {
    if (
      t.nurseEmail === taskToUpdate.nurseEmail &&
      t.task === taskToUpdate.task &&
      t.assignedBy === taskToUpdate.assignedBy
    ) {
      t.completed = !t.completed;
    }
    return t;
  });

  localStorage.setItem('nurseTasks', JSON.stringify(tasks));
  loadNurseTasks();
}
function loadDoctorAssignedTasks() {
  const tasks = JSON.parse(localStorage.getItem('nurseTasks') || '[]');
  const doctorTasks = tasks.filter(t => t.assignedBy === currentUser.name);
  const ul = document.getElementById('doctor-assigned-tasks');
  ul.innerHTML = '';

  doctorTasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      Task: <b>${task.task}</b> |
      Nurse: <b>${task.nurseName}</b> (${task.nurseEmail}) |
      Status: <span style="color:${task.completed ? 'green' : 'red'}">
        ${task.completed ? 'Completed' : 'Pending'}
      </span>
    `;
    ul.appendChild(li);
  });
}
/*checkbox.onchange = () => {
  task.done = checkbox.checked;
  saveNurseTaskStatus(task); // ✅ Save updated status
};*/
function loadDoctorAssignedTasks() {
  const taskList = document.getElementById('doctor-task-list');
  taskList.innerHTML = '';

  const tasks = JSON.parse(localStorage.getItem('nurseTasks') || '[]')
    .filter(t => t.doctorEmail === currentUser.email);

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.innerHTML = `
      <p>
        <strong>Date:</strong> ${task.date}<br>
        <strong>Task:</strong> ${task.description}<br>
        <strong>Nurse:</strong> ${task.nurseName}<br>
        <strong>Status:</strong> ${task.done ? '✅ Completed' : '⏳ Pending'}
      </p><hr>`;
    taskList.appendChild(div);
  });
}
function renderDoctorNurseTaskChecklist() {
  const taskList = document.getElementById('doctor-task-list');
  taskList.innerHTML = '';

  const tasks = JSON.parse(localStorage.getItem('nurseTasks') || '[]');
  const doctorEmail = currentUser.email;

  const doctorTasks = tasks.filter(task => task.doctorEmail === doctorEmail);

  if (doctorTasks.length === 0) {
    taskList.innerHTML = '<p>No nurse tasks assigned yet.</p>';
    return;
  }

  doctorTasks.forEach(task => {
    const div = document.createElement('div');
    div.classList.add('task-card');
    div.innerHTML = `
      <strong>Date:</strong> ${task.date}<br>
      <strong>Nurse:</strong> ${task.nurseName} (${task.nurseEmail})<br>
      <strong>Task:</strong> ${task.description}<br>
      <strong>Status:</strong> <span style="color: ${task.done ? 'green' : 'orange'}">
        ${task.done ? '✅ Completed' : '⏳ Pending'}
      </span>
      <hr>
    `;
    taskList.appendChild(div);
  });
}

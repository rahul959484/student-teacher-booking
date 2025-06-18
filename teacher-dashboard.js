// Teacher Dashboard JavaScript
let currentUser = null;
let userData = null;
let appointments = [];
let students = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    authService.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            userData = await dbService.getUserData(user.uid);
            
            if (userData && userData.role === 'teacher') {
                initializeDashboard();
                loadDashboardData();
            } else {
                // Redirect to home if not a teacher
                window.location.href = 'index.html';
            }
        } else {
            // Redirect to home if not authenticated
            window.location.href = 'index.html';
        }
    });
});

// Initialize dashboard
function initializeDashboard() {
    updateUserInfo();
    setupEventListeners();
    loadAvailability();
}

// Update user information in UI
function updateUserInfo() {
    if (userData) {
        document.getElementById('userName').textContent = userData.name;
        document.getElementById('sidebarUserName').textContent = userData.name;
        document.getElementById('welcomeName').textContent = userData.name;
        
        // Update profile form
        document.getElementById('profileName').value = userData.name || '';
        document.getElementById('profileEmail').value = userData.email || '';
        document.getElementById('profilePhone').value = userData.phone || '';
        document.getElementById('profileDepartment').value = userData.department || '';
        document.getElementById('profileSpecialization').value = userData.specialization || '';
        document.getElementById('profileBio').value = userData.bio || '';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    
    // Availability form
    document.getElementById('availabilityForm').addEventListener('submit', handleAvailabilityUpdate);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
}

// Load dashboard data
async function loadDashboardData() {
    await loadAppointments();
    updateStats();
    loadTodayAppointments();
    loadStudents();
}

// Load appointments
async function loadAppointments() {
    try {
        appointments = await dbService.getUserAppointments(currentUser.uid, 'teacher');
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Error loading appointments', 'error');
    }
}

// Load today's appointments
function loadTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);
    
    const container = document.getElementById('todayAppointmentsList');
    
    if (todayAppointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-day"></i>
                <h3>No Appointments Today</h3>
                <p>You have no appointments scheduled for today.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = todayAppointments.map(appointment => `
        <div class="appointment-item">
            <div class="appointment-info">
                <div class="appointment-header">
                    <span class="appointment-title">${appointment.studentName}</span>
                    <span class="appointment-status ${appointment.status}">${appointment.status}</span>
                </div>
                <div class="appointment-details">
                    <i class="fas fa-clock"></i> ${formatTime(appointment.time)}
                    <i class="fas fa-hourglass-half"></i> ${appointment.duration} minutes
                </div>
                <div class="appointment-details">
                    <strong>Purpose:</strong> ${appointment.purpose}
                </div>
            </div>
            <div class="appointment-actions">
                <button class="btn btn-secondary" onclick="viewAppointmentDetails('${appointment.id}')">
                    <i class="fas fa-eye"></i>
                    View
                </button>
                ${appointment.status === 'pending' ? `
                    <button class="btn btn-success" onclick="confirmAppointment('${appointment.id}')">
                        <i class="fas fa-check"></i>
                        Confirm
                    </button>
                    <button class="btn btn-danger" onclick="rejectAppointment('${appointment.id}')">
                        <i class="fas fa-times"></i>
                        Reject
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Load students
function loadStudents() {
    // Get unique students from appointments
    const studentIds = [...new Set(appointments.map(a => a.studentId))];
    students = studentIds.map(id => {
        const studentAppointments = appointments.filter(a => a.studentId === id);
        const latestAppointment = studentAppointments[0];
        return {
            id: id,
            name: latestAppointment.studentName,
            email: latestAppointment.studentEmail,
            appointmentCount: studentAppointments.length,
            lastAppointment: latestAppointment.date
        };
    });
    
    displayStudents();
}

// Display students
function displayStudents() {
    const container = document.getElementById('studentsList');
    
    if (students.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-graduate"></i>
                <h3>No Students Yet</h3>
                <p>Students will appear here once they book appointments with you.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = students.map(student => `
        <div class="student-card">
            <div class="student-header">
                <div class="student-avatar">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div>
                    <div class="student-name">${student.name}</div>
                    <div class="student-email">${student.email}</div>
                </div>
            </div>
            <div class="student-stats">
                <p><strong>Appointments:</strong> ${student.appointmentCount}</p>
                <p><strong>Last Appointment:</strong> ${formatDate(student.lastAppointment)}</p>
            </div>
            <button class="btn btn-primary" onclick="viewStudentAppointments('${student.id}')">
                <i class="fas fa-calendar"></i>
                View Appointments
            </button>
        </div>
    `).join('');
}

// Load availability
async function loadAvailability() {
    try {
        const availability = await dbService.getTeacherAvailability(currentUser.uid);
        if (availability) {
            populateAvailabilityForm(availability);
        }
    } catch (error) {
        console.error('Error loading availability:', error);
    }
}

// Populate availability form
function populateAvailabilityForm(availability) {
    Object.keys(availability).forEach(day => {
        if (day !== 'updatedAt') {
            availability[day].forEach(time => {
                const checkboxName = `${day}_${time.split(':')[0]}`;
                const checkbox = document.querySelector(`input[name="${checkboxName}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
    });
}

// Handle availability update
async function handleAvailabilityUpdate(event) {
    event.preventDefault();
    
    console.log('=== Saving teacher availability ===');
    
    const formData = new FormData(event.target);
    const availability = {};
    
    // Group by day
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    days.forEach(day => {
        availability[day] = [];
        for (let hour = 9; hour <= 16; hour++) {
            if (hour === 12 || hour === 13) continue; // Skip lunch
            const checkboxName = `${day}_${hour}`;
            if (formData.has(checkboxName)) {
                availability[day].push(`${hour.toString().padStart(2, '0')}:00`);
            }
        }
        console.log(`${day}:`, availability[day]);
    });
    
    console.log('Final availability object:', availability);
    
    try {
        showNotification('Saving availability...', 'info');
        const result = await dbService.setTeacherAvailability(currentUser.uid, availability);
        
        console.log('Availability save result:', result);
        
        if (result.success) {
            showNotification('Availability saved successfully!', 'success');
        } else {
            showNotification('Error saving availability: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Availability save error:', error);
        showNotification('Error saving availability', 'error');
    }
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const updateData = {
        name: document.getElementById('profileName').value,
        phone: document.getElementById('profilePhone').value,
        department: document.getElementById('profileDepartment').value,
        specialization: document.getElementById('profileSpecialization').value,
        bio: document.getElementById('profileBio').value
    };
    
    try {
        showNotification('Updating profile...', 'info');
        const result = await dbService.updateUserProfile(currentUser.uid, updateData);
        
        if (result.success) {
            showNotification('Profile updated successfully!', 'success');
            userData = { ...userData, ...updateData };
            updateUserInfo();
        } else {
            showNotification('Error updating profile: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('Error updating profile', 'error');
    }
}

// Display appointments
function displayAppointments(appointmentsToShow = appointments) {
    const container = document.getElementById('appointmentsList');
    
    if (appointmentsToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No Appointments</h3>
                <p>You haven't received any appointment requests yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointmentsToShow.map(appointment => `
        <div class="appointment-item">
            <div class="appointment-info">
                <div class="appointment-header">
                    <span class="appointment-title">${appointment.studentName}</span>
                    <span class="appointment-status ${appointment.status}">${appointment.status}</span>
                </div>
                <div class="appointment-details">
                    <i class="fas fa-calendar"></i> ${formatDate(appointment.date)}
                    <i class="fas fa-clock"></i> ${formatTime(appointment.time)}
                    <i class="fas fa-hourglass-half"></i> ${appointment.duration} minutes
                </div>
                <div class="appointment-details">
                    <strong>Purpose:</strong> ${appointment.purpose}
                </div>
            </div>
            <div class="appointment-actions">
                <button class="btn btn-secondary" onclick="viewAppointmentDetails('${appointment.id}')">
                    <i class="fas fa-eye"></i>
                    View
                </button>
                ${appointment.status === 'pending' ? `
                    <button class="btn btn-success" onclick="confirmAppointment('${appointment.id}')">
                        <i class="fas fa-check"></i>
                        Confirm
                    </button>
                    <button class="btn btn-danger" onclick="rejectAppointment('${appointment.id}')">
                        <i class="fas fa-times"></i>
                        Reject
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const uniqueStudents = new Set(appointments.map(a => a.studentId)).size;
    
    document.getElementById('totalAppointments').textContent = total;
    document.getElementById('pendingAppointments').textContent = pending;
    document.getElementById('confirmedAppointments').textContent = confirmed;
    document.getElementById('totalStudents').textContent = uniqueStudents;
}

// Handle filter clicks
function handleFilterClick(event) {
    const filter = event.target.dataset.filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter appointments
    let filteredAppointments = appointments;
    if (filter !== 'all') {
        filteredAppointments = appointments.filter(a => a.status === filter);
    }
    
    displayAppointments(filteredAppointments);
}

// Confirm appointment
async function confirmAppointment(appointmentId) {
    try {
        showNotification('Confirming appointment...', 'info');
        const result = await dbService.updateAppointmentStatus(appointmentId, 'confirmed');
        
        if (result.success) {
            showNotification('Appointment confirmed successfully!', 'success');
            await loadDashboardData();
        } else {
            showNotification('Error confirming appointment: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('Error confirming appointment', 'error');
    }
}

// Reject appointment
async function rejectAppointment(appointmentId) {
    if (!confirm('Are you sure you want to reject this appointment?')) return;
    
    try {
        showNotification('Rejecting appointment...', 'info');
        const result = await dbService.updateAppointmentStatus(appointmentId, 'cancelled');
        
        if (result.success) {
            showNotification('Appointment rejected successfully!', 'success');
            await loadDashboardData();
        } else {
            showNotification('Error rejecting appointment: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('Error rejecting appointment', 'error');
    }
}

// View appointment details
function viewAppointmentDetails(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    const modal = document.getElementById('appointmentModal');
    const content = document.getElementById('appointmentModalContent');
    
    content.innerHTML = `
        <div class="appointment-modal-content">
            <div class="appointment-modal-header">
                <div class="appointment-status ${appointment.status}">${appointment.status}</div>
                <h3>Appointment with ${appointment.studentName}</h3>
            </div>
            <div>
                <p><strong>Student:</strong> ${appointment.studentName}</p>
                <p><strong>Email:</strong> ${appointment.studentEmail}</p>
                <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
                <p><strong>Duration:</strong> ${appointment.duration} minutes</p>
                <p><strong>Purpose:</strong> ${appointment.purpose}</p>
                <p><strong>Created:</strong> ${formatDateTime(appointment.createdAt)}</p>
            </div>
            <div class="appointment-modal-actions">
                ${appointment.status === 'pending' ? `
                    <button class="btn btn-success" onclick="confirmAppointment('${appointment.id}')">
                        <i class="fas fa-check"></i>
                        Confirm Appointment
                    </button>
                    <button class="btn btn-danger" onclick="rejectAppointment('${appointment.id}')">
                        <i class="fas fa-times"></i>
                        Reject Appointment
                    </button>
                ` : ''}
                <button class="btn btn-secondary" onclick="closeAppointmentModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// View student appointments
function viewStudentAppointments(studentId) {
    const studentAppointments = appointments.filter(a => a.studentId === studentId);
    const student = students.find(s => s.id === studentId);
    
    const modal = document.getElementById('appointmentModal');
    const content = document.getElementById('appointmentModalContent');
    
    content.innerHTML = `
        <div class="appointment-modal-content">
            <div class="appointment-modal-header">
                <h3>Appointments with ${student.name}</h3>
            </div>
            <div>
                <p><strong>Student:</strong> ${student.name}</p>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Total Appointments:</strong> ${student.appointmentCount}</p>
                <hr>
                <h4>Appointment History:</h4>
                ${studentAppointments.map(appointment => `
                    <div style="border: 1px solid #e2e8f0; padding: 1rem; margin: 0.5rem 0; border-radius: 8px;">
                        <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                        <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
                        <p><strong>Status:</strong> <span class="appointment-status ${appointment.status}">${appointment.status}</span></p>
                        <p><strong>Purpose:</strong> ${appointment.purpose}</p>
                    </div>
                `).join('')}
            </div>
            <div class="appointment-modal-actions">
                <button class="btn btn-secondary" onclick="closeAppointmentModal()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Close appointment modal
function closeAppointmentModal() {
    document.getElementById('appointmentModal').style.display = 'none';
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update active nav link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');
}

// Logout
async function logout() {
    try {
        await authService.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        showNotification('Error logging out', 'error');
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(time) {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
}

function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US');
}

// Notification system (reuse from main script)
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;

    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;

    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: auto;
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || colors.info;
} 
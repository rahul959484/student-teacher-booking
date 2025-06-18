// Student Dashboard JavaScript
let currentUser = null;
let userData = null;
let appointments = [];
let teachers = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    authService.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            userData = await dbService.getUserData(user.uid);
            
            if (userData && userData.role === 'student') {
                initializeDashboard();
                loadDashboardData();
            } else {
                // Redirect to home if not a student
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
    loadTeachers();
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
        document.getElementById('profileYear').value = userData.year || '';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    
    // Booking form
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    
    // Teacher selection
    document.getElementById('teacherSelect').addEventListener('change', handleTeacherSelection);
    
    // Date selection
    document.getElementById('appointmentDate').addEventListener('change', handleDateSelection);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });
}

// Load dashboard data
async function loadDashboardData() {
    console.log('=== Loading dashboard data ===');
    await loadAppointments();
    console.log('Appointments loaded, count:', appointments.length);
    updateStats();
    console.log('Stats updated');
    loadRecentAppointments();
    console.log('Recent appointments loaded');
    console.log('=== Dashboard data loading complete ===');
}

// Load appointments
async function loadAppointments() {
    try {
        console.log('=== Loading appointments from database ===');
        console.log('Current user ID:', currentUser.uid);
        appointments = await dbService.getUserAppointments(currentUser.uid, 'student');
        console.log('Appointments fetched from database:', appointments);
        displayAppointments(appointments);
        console.log('Appointments displayed');
    } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Error loading appointments', 'error');
    }
}

// Load teachers
async function loadTeachers() {
    try {
        console.log('Loading teachers...');
        teachers = await dbService.getTeachers();
        console.log('Teachers loaded:', teachers);
        
        if (teachers.length === 0) {
            console.log('No teachers found, trying alternative query...');
            // Try to get all users and filter manually
            const allUsers = await dbService.debugAllUsers();
            teachers = allUsers.filter(user => user.role === 'teacher');
            console.log('Teachers found from all users:', teachers);
        }
        
        populateTeacherSelect();
        displayTeachers();
    } catch (error) {
        console.error('Error loading teachers:', error);
        showNotification('Error loading teachers', 'error');
    }
}

// Populate teacher select dropdown
function populateTeacherSelect() {
    const select = document.getElementById('teacherSelect');
    select.innerHTML = '<option value="">Choose a teacher...</option>';
    
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.name;
        select.appendChild(option);
    });
}

// Display teachers
function displayTeachers() {
    const container = document.getElementById('teachersList');
    
    if (teachers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chalkboard-teacher"></i>
                <h3>No Teachers Available</h3>
                <p>There are currently no teachers available for appointments.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = teachers.map(teacher => `
        <div class="teacher-card" onclick="selectTeacher('${teacher.id}')">
            <div class="teacher-header">
                <div class="teacher-avatar">
                    <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <div>
                    <div class="teacher-name">${teacher.name}</div>
                    <div class="teacher-department">${teacher.department || 'Department not specified'}</div>
                </div>
            </div>
            <div class="teacher-specialization">${teacher.specialization || 'No specialization listed'}</div>
            <button class="btn btn-primary" onclick="event.stopPropagation(); bookWithTeacher('${teacher.id}')">
                <i class="fas fa-calendar-plus"></i>
                Book Appointment
            </button>
        </div>
    `).join('');
}

// Handle teacher selection
function handleTeacherSelection() {
    console.log('=== Teacher selection triggered ===');
    const teacherId = document.getElementById('teacherSelect').value;
    const date = document.getElementById('appointmentDate').value;
    
    console.log('Selected teacher ID:', teacherId);
    console.log('Current date:', date);
    
    if (teacherId) {
        const teacher = teachers.find(t => t.id === teacherId);
        console.log('Selected teacher:', teacher);
        displayTeacherInfo(teacher);
        
        // If date is also selected, load times
        if (date) {
            console.log('Date already selected, loading times...');
            loadAvailableTimes(teacherId, date);
        } else {
            console.log('No date selected yet');
            const timeSelect = document.getElementById('appointmentTime');
            if (timeSelect) {
                timeSelect.innerHTML = '<option value="">Please select a date</option>';
            }
        }
    } else {
        console.log('No teacher selected');
        document.getElementById('selectedTeacherInfo').innerHTML = '<p>Select a teacher to view their information</p>';
        const timeSelect = document.getElementById('appointmentTime');
        if (timeSelect) {
            timeSelect.innerHTML = '<option value="">Please select a teacher first</option>';
        }
    }
}

// Display teacher information
function displayTeacherInfo(teacher) {
    const container = document.getElementById('selectedTeacherInfo');
    container.innerHTML = `
        <div class="teacher-card">
            <div class="teacher-header">
                <div class="teacher-avatar">
                    <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <div>
                    <div class="teacher-name">${teacher.name}</div>
                    <div class="teacher-department">${teacher.department || 'Department not specified'}</div>
                </div>
            </div>
            <div class="teacher-specialization">${teacher.specialization || 'No specialization listed'}</div>
            ${teacher.bio ? `<p>${teacher.bio}</p>` : ''}
        </div>
    `;
}

// Handle date selection
function handleDateSelection() {
    console.log('=== Date selection triggered ===');
    const date = document.getElementById('appointmentDate').value;
    const teacherId = document.getElementById('teacherSelect').value;
    
    console.log('Selected date:', date);
    console.log('Selected teacher:', teacherId);
    
    if (date && teacherId) {
        console.log('Both date and teacher selected, loading times...');
        loadAvailableTimes(teacherId, date);
    } else {
        console.log('Missing date or teacher selection');
        const timeSelect = document.getElementById('appointmentTime');
        if (timeSelect) {
            timeSelect.innerHTML = '<option value="">Please select teacher and date first</option>';
        }
    }
}

// Load available times for selected teacher and date
async function loadAvailableTimes(teacherId, date) {
    try {
        console.log('=== Loading available times ===');
        console.log('Teacher ID:', teacherId);
        console.log('Selected date:', date);
        
        if (!teacherId || !date) {
            console.log('Missing teacher ID or date');
            const timeSelect = document.getElementById('appointmentTime');
            timeSelect.innerHTML = '<option value="">Please select teacher and date first</option>';
            return;
        }
        
        const availability = await dbService.getTeacherAvailability(teacherId);
        console.log('Teacher availability:', availability);
        
        const timeSelect = document.getElementById('appointmentTime');
        timeSelect.innerHTML = '<option value="">Select time...</option>';
        
        if (!availability) {
            console.log('No availability found for teacher');
            timeSelect.innerHTML = '<option value="">No availability set for this teacher</option>';
            return;
        }
        
        // Get day of week from date - handle different date formats
        let dateObj;
        try {
            dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                throw new Error('Invalid date format');
            }
        } catch (dateError) {
            console.error('Date parsing error:', dateError);
            timeSelect.innerHTML = '<option value="">Invalid date format</option>';
            return;
        }
        
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        console.log('Day of week:', dayOfWeek);
        console.log('Available days:', Object.keys(availability));
        
        if (availability[dayOfWeek] && availability[dayOfWeek].length > 0) {
            console.log('Available times for', dayOfWeek, ':', availability[dayOfWeek]);
            availability[dayOfWeek].forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = formatTime(time);
                timeSelect.appendChild(option);
            });
        } else {
            console.log('No availability for', dayOfWeek);
            timeSelect.innerHTML = '<option value="">No availability for this day</option>';
        }
    } catch (error) {
        console.error('Error loading available times:', error);
        console.error('Error details:', error.message, error.code);
        const timeSelect = document.getElementById('appointmentTime');
        timeSelect.innerHTML = '<option value="">Error loading times - please try again</option>';
    }
}

// Format time for display
function formatTime(time) {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
}

// Handle booking submission
async function handleBookingSubmit(event) {
    event.preventDefault();
    
    console.log('=== Starting appointment booking process ===');
    
    const teacherId = document.getElementById('teacherSelect').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const duration = document.getElementById('appointmentDuration').value;
    const purpose = document.getElementById('appointmentPurpose').value;
    
    console.log('Form data:', { teacherId, date, time, duration, purpose });
    
    if (!teacherId || !date || !time || !purpose) {
        console.log('Validation failed - missing required fields');
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const teacher = teachers.find(t => t.id === teacherId);
    console.log('Selected teacher:', teacher);
    
    const appointmentData = {
        studentId: currentUser.uid,
        studentName: userData.name,
        studentEmail: userData.email,
        teacherId: teacherId,
        teacherName: teacher.name,
        date: date,
        time: time,
        duration: parseInt(duration),
        purpose: purpose,
        status: 'pending'
    };
    
    console.log('Appointment data to save:', appointmentData);
    
    try {
        showNotification('Creating appointment...', 'info');
        console.log('=== About to create appointment in database ===');
        const result = await dbService.createAppointment(appointmentData);
        
        console.log('Appointment creation result:', result);
        
        if (result.success) {
            console.log('=== Appointment created successfully ===');
            console.log('Appointment ID:', result.appointmentId);
            showNotification('Appointment created successfully!', 'success');
            event.target.reset();
            document.getElementById('selectedTeacherInfo').innerHTML = '<p>Select a teacher to view their information</p>';
            
            console.log('=== Refreshing dashboard data after booking ===');
            console.log('Appointment created with ID:', result.appointmentId);
            
            // Debug: Check all appointments in database
            console.log('=== Checking all appointments in database ===');
            const allAppointments = await dbService.debugAllAppointments();
            console.log('All appointments in database:', allAppointments);
            
            // Add a small delay to ensure database has updated
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            await loadDashboardData();
            console.log('=== Dashboard data refreshed ===');
            
            // Redirect to overview to show the new appointment
            showSection('overview');
        } else {
            showNotification('Error creating appointment: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showNotification('Error creating appointment', 'error');
    }
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const updateData = {
        name: document.getElementById('profileName').value,
        phone: document.getElementById('profilePhone').value,
        department: document.getElementById('profileDepartment').value,
        year: document.getElementById('profileYear').value
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
                <p>You haven't booked any appointments yet.</p>
                <button class="btn btn-primary" onclick="showSection('book-appointment')">
                    <i class="fas fa-calendar-plus"></i>
                    Book Your First Appointment
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointmentsToShow.map(appointment => `
        <div class="appointment-item">
            <div class="appointment-info">
                <div class="appointment-header">
                    <span class="appointment-title">${appointment.teacherName}</span>
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
                    <button class="btn btn-danger" onclick="cancelAppointment('${appointment.id}')">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Load recent appointments
function loadRecentAppointments() {
    const recent = appointments.slice(0, 5);
    const container = document.getElementById('recentAppointmentsList');
    
    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No recent appointments</p></div>';
        return;
    }
    
    container.innerHTML = recent.map(appointment => `
        <div class="appointment-item">
            <div class="appointment-info">
                <div class="appointment-header">
                    <span class="appointment-title">${appointment.teacherName}</span>
                    <span class="appointment-status ${appointment.status}">${appointment.status}</span>
                </div>
                <div class="appointment-details">
                    <i class="fas fa-calendar"></i> ${formatDate(appointment.date)}
                    <i class="fas fa-clock"></i> ${formatTime(appointment.time)}
                </div>
            </div>
            <div class="appointment-actions">
                <button class="btn btn-secondary" onclick="viewAppointmentDetails('${appointment.id}')">
                    <i class="fas fa-eye"></i>
                    View
                </button>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    console.log('=== Updating statistics ===');
    console.log('Total appointments array:', appointments);
    
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    
    console.log('Calculated stats:', { total, pending, confirmed, cancelled });
    
    document.getElementById('totalAppointments').textContent = total;
    document.getElementById('pendingAppointments').textContent = pending;
    document.getElementById('confirmedAppointments').textContent = confirmed;
    document.getElementById('cancelledAppointments').textContent = cancelled;
    
    console.log('Stats updated in DOM');
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
                <h3>Appointment with ${appointment.teacherName}</h3>
            </div>
            <div>
                <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
                <p><strong>Duration:</strong> ${appointment.duration} minutes</p>
                <p><strong>Purpose:</strong> ${appointment.purpose}</p>
                <p><strong>Created:</strong> ${formatDateTime(appointment.createdAt)}</p>
            </div>
            <div class="appointment-modal-actions">
                ${appointment.status === 'pending' ? `
                    <button class="btn btn-danger" onclick="cancelAppointment('${appointment.id}')">
                        <i class="fas fa-times"></i>
                        Cancel Appointment
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

// Cancel appointment
async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
        showNotification('Cancelling appointment...', 'info');
        const result = await dbService.updateAppointmentStatus(appointmentId, 'cancelled');
        
        if (result.success) {
            showNotification('Appointment cancelled successfully!', 'success');
            await loadDashboardData();
            closeAppointmentModal();
        } else {
            showNotification('Error cancelling appointment: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('Error cancelling appointment', 'error');
    }
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

// Book with specific teacher
function bookWithTeacher(teacherId) {
    document.getElementById('teacherSelect').value = teacherId;
    handleTeacherSelection();
    showSection('book-appointment');
}

// Select teacher
function selectTeacher(teacherId) {
    document.getElementById('teacherSelect').value = teacherId;
    handleTeacherSelection();
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
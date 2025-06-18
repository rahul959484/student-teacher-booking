# student-teacher-booking
# Student-Teacher Booking Appointment System

A modern, responsive web-based appointment booking system designed for educational institutions. Built with HTML, CSS, JavaScript, and Firebase integration.

## 🎯 Project Overview

**EduBook** is a comprehensive appointment scheduling platform that bridges the gap between students and teachers, making appointment scheduling efficient and hassle-free. The system provides a user-friendly interface for both students and teachers to manage their academic appointments.

## ✨ Features

### 🏠 Home Page Features
- **Modern Hero Section** with gradient background and animated elements
- **Responsive Navigation** with smooth scrolling and active link highlighting
- **Feature Showcase** highlighting system capabilities
- **Role Selection** for students and teachers
- **Contact Form** with validation
- **Login/Signup Modals** with Firebase authentication
- **Mobile-First Design** with hamburger menu
- **Smooth Animations** and transitions

### 🎨 UI/UX Features
- **Modern Design** with gradient backgrounds and glassmorphism effects
- **Responsive Layout** that works on all devices
- **Interactive Elements** with hover effects and animations
- **Notification System** for user feedback
- **Form Validation** with real-time feedback
- **Smooth Scrolling** navigation
- **Loading Animations** and transitions

### 🔧 Technical Features
- **Firebase Authentication** for secure user management
- **Firestore Database** for real-time data storage
- **Vanilla JavaScript** for interactivity
- **CSS Grid & Flexbox** for responsive layouts
- **Font Awesome Icons** for visual elements
- **Google Fonts** (Inter) for typography
- **Intersection Observer** for scroll animations
- **Modal System** for login/signup forms
- **Form Validation** with email verification

### 🎓 Student Dashboard Features
- **Overview Dashboard** with appointment statistics
- **Appointment Booking** with teacher selection and time slots
- **My Appointments** with filtering and management
- **Teacher Directory** with detailed information
- **Profile Management** with personal information
- **Real-time Updates** for appointment status

### 👨‍🏫 Teacher Dashboard Features
- **Overview Dashboard** with appointment summary
- **Appointment Management** with accept/reject functionality
- **Availability Settings** with weekly schedule management
- **Student Directory** with appointment history
- **Profile Management** with professional information
- **Real-time Notifications** for new requests

### 🔐 Authentication & Security
- **Firebase Authentication** with email/password
- **Role-based Access** (Student/Teacher)
- **Secure Database Rules** for data protection
- **Session Management** with automatic redirects
- **Form Validation** and error handling

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account and project setup
- Basic knowledge of web development

### Installation
1. Clone or download the project files
2. Set up Firebase project (see `FIREBASE_SETUP.md`)
3. Update Firebase configuration in `firebase-config.js`
4. Open `index.html` in your web browser

### File Structure
```
student-teacher/
├── index.html                 # Main home page
├── student-dashboard.html     # Student dashboard
├── teacher-dashboard.html     # Teacher dashboard
├── styles.css                 # Main CSS styles
├── dashboard-styles.css       # Dashboard-specific styles
├── script.js                  # Main JavaScript functionality
├── student-dashboard.js       # Student dashboard logic
├── teacher-dashboard.js       # Teacher dashboard logic
├── firebase-config.js         # Firebase configuration
├── FIREBASE_SETUP.md          # Firebase setup instructions
└── README.md                  # Project documentation
```

## 🎮 How to Use

### User Registration
1. Click "Sign Up" in the navigation
2. Fill in your details (name, email, role, password)
3. Select your role (Student or Teacher)
4. Submit the form to create account

### User Login
1. Click "Login" in the navigation
2. Enter your email and password
3. Submit to access your dashboard

### Student Features
- **Book Appointments**: Select teacher, date, time, and purpose
- **View Appointments**: See all your scheduled appointments
- **Cancel Appointments**: Cancel pending appointments
- **Update Profile**: Manage personal information

### Teacher Features
- **Set Availability**: Define available time slots
- **Manage Requests**: Accept or reject appointment requests
- **View Students**: See students who have booked with you
- **Update Profile**: Manage professional information

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#2563eb`
- **Secondary Purple**: `#667eea` to `#764ba2` (gradient)
- **Success Green**: `#10b981`
- **Error Red**: `#ef4444`
- **Warning Orange**: `#f59e0b`
- **Info Blue**: `#3b82f6`

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Buttons**: Primary, Secondary, Outline, Success, Danger variants
- **Cards**: Feature cards, role cards, appointment cards
- **Modals**: Login, signup, and appointment detail modals
- **Forms**: Contact form, booking form, profile forms
- **Navigation**: Fixed navbar with mobile menu
- **Dashboard**: Sidebar navigation with main content area

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

### Mobile Features
- Hamburger menu navigation
- Touch-friendly buttons and forms
- Optimized layouts for small screens
- Reduced animations for better performance

## 🔧 Customization

### Adding New Features
1. **New Sections**: Add HTML sections and update navigation
2. **New Styles**: Add CSS classes in appropriate style files
3. **New Functionality**: Add JavaScript functions in appropriate script files

### Modifying Colors
Update the CSS custom properties in `styles.css`:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #667eea;
    /* Add more color variables */
}
```

### Firebase Integration
1. Follow the setup guide in `FIREBASE_SETUP.md`
2. Update configuration in `firebase-config.js`
3. Modify database rules as needed
4. Add new collections and documents as required

## 🚀 Future Enhancements

### Planned Features
- [x] Firebase Authentication integration
- [x] Real-time appointment booking
- [x] Teacher dashboard
- [x] Student dashboard
- [x] Appointment management system
- [ ] Email notifications
- [ ] Calendar integration
- [ ] Admin panel
- [ ] Video conferencing integration
- [ ] File sharing capabilities
- [ ] Appointment reminders
- [ ] Analytics dashboard

### Technical Improvements
- [ ] Progressive Web App (PWA) features
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Advanced search and filtering
- [ ] Bulk operations
- [ ] Export functionality
- [ ] API development
- [ ] Unit testing
- [ ] Performance optimization

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Support

For support or questions:
- Email: support@edubook.com
- Phone: +1 (555) 123-4567
- Address: 123 Education St, Learning City, LC 12345

## 🎯 Project Status

**Current Status**: Complete MVP ✅
- [x] Home Page with modern UI
- [x] Firebase Authentication
- [x] Student Dashboard
- [x] Teacher Dashboard
- [x] Appointment Booking System
- [x] Real-time Database
- [x] Responsive Design
- [x] Form Validation
- [x] Notification System
- [x] Role-based Access

**Next Phase**: Advanced Features and Optimization

## 🔐 Security Features

- **Firebase Authentication** for secure user management
- **Firestore Security Rules** for data protection
- **Input Validation** on all forms
- **Role-based Access Control**
- **Secure API endpoints**
- **Data encryption in transit**

## 📊 Database Schema

### Users Collection
```javascript
{
  "uid": {
    "name": "string",
    "email": "string",
    "role": "student|teacher",
    "phone": "string",
    "department": "string",
    "year": "string", // for students
    "specialization": "string", // for teachers
    "bio": "string", // for teachers
    "isActive": "boolean",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Appointments Collection
```javascript
{
  "appointmentId": {
    "studentId": "string",
    "studentName": "string",
    "studentEmail": "string",
    "teacherId": "string",
    "teacherName": "string",
    "date": "string",
    "time": "string",
    "duration": "number",
    "purpose": "string",
    "status": "pending|confirmed|cancelled",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Teacher Availability Collection
```javascript
{
  "teacherId": {
    "monday": ["string"],
    "tuesday": ["string"],
    "wednesday": ["string"],
    "thursday": ["string"],
    "friday": ["string"],
    "updatedAt": "timestamp"
  }
}
```

---

**Built with ❤️ for educational institutions worldwide** 

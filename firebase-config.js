// Firebase Configuration
// TODO: Replace with your actual Firebase configuration from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyCxOwKm5VLcSfZ3_LIF4d5J43ZpB9Mq_X8",
    authDomain: "student-teacher-booking-611ef.firebaseapp.com",
    projectId: "student-teacher-booking-611ef",
    storageBucket: "student-teacher-booking-611ef.firebasestorage.app",
    messagingSenderId: "173492002661",
    appId: "1:173492002661:web:d4dae311f73da33540cb8c"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Firebase Authentication Functions
class AuthService {
    // Sign up with email and password
    async signUp(email, password, name, role) {
        try {
            console.log('Starting signup process for:', email, 'role:', role);
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            console.log('User created in Authentication:', user.uid);
            
            // Save additional user data to Firestore
            const userData = {
                name: name,
                email: email,
                role: role,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: true
            };
            console.log('Saving user data to Firestore:', userData);
            
            await db.collection('users').doc(user.uid).set(userData);
            console.log('User data saved successfully to Firestore');
            
            return { success: true, user: user };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Sign out
    async signOut() {
        try {
            await auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get current user
    getCurrentUser() {
        return auth.currentUser;
    }

    // Listen to auth state changes
    onAuthStateChanged(callback) {
        return auth.onAuthStateChanged(callback);
    }
}

// Database Functions
class DatabaseService {
    // Get user data
    async getUserData(userId) {
        try {
            const doc = await db.collection('users').doc(userId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    // Update user profile
    async updateUserProfile(userId, data) {
        try {
            await db.collection('users').doc(userId).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Create appointment
    async createAppointment(appointmentData) {
        try {
            console.log('=== Database: Creating appointment ===');
            console.log('Appointment data:', appointmentData);
            
            const docRef = await db.collection('appointments').add({
                ...appointmentData,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('=== Database: Appointment created successfully ===');
            console.log('Document ID:', docRef.id);
            
            return { success: true, appointmentId: docRef.id };
        } catch (error) {
            console.error('=== Database: Error creating appointment ===');
            console.error('Error details:', error);
            return { success: false, error: error.message };
        }
    }

    // Get appointments for user
    async getUserAppointments(userId, role) {
        try {
            console.log('=== Database: Getting appointments ===');
            console.log('User ID:', userId);
            console.log('Role:', role);
            
            let query;
            if (role === 'student') {
                query = db.collection('appointments').where('studentId', '==', userId);
            } else {
                query = db.collection('appointments').where('teacherId', '==', userId);
            }
            
            console.log('=== Database: Executing query ===');
            const snapshot = await query.get();
            console.log('Query result - documents found:', snapshot.docs.length);
            
            const appointments = [];
            snapshot.forEach(doc => {
                const appointmentData = { id: doc.id, ...doc.data() };
                console.log('Appointment document:', appointmentData);
                appointments.push(appointmentData);
            });
            
            // Sort in JavaScript instead of using orderBy (temporary fix for missing index)
            appointments.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    const aTime = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const bTime = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return bTime - aTime;
                }
                return 0;
            });
            
            console.log('=== Database: Returning appointments ===');
            console.log('Total appointments found:', appointments.length);
            
            return appointments;
        } catch (error) {
            console.error('=== Database: Error getting appointments ===');
            console.error('Error details:', error);
            return [];
        }
    }

    // Update appointment status
    async updateAppointmentStatus(appointmentId, status) {
        try {
            await db.collection('appointments').doc(appointmentId).update({
                status: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get all teachers
    async getTeachers() {
        try {
            console.log('Fetching teachers from database...');
            
            // First try with isActive filter
            let snapshot = await db.collection('users')
                .where('role', '==', 'teacher')
                .where('isActive', '==', true)
                .get();
            
            console.log('Query result with isActive filter:', snapshot.docs.length, 'teachers found');
            
            // If no teachers found, try without isActive filter
            if (snapshot.docs.length === 0) {
                console.log('No teachers found with isActive=true, trying without filter...');
                snapshot = await db.collection('users')
                    .where('role', '==', 'teacher')
                    .get();
                console.log('Query result without isActive filter:', snapshot.docs.length, 'teachers found');
            }
            
            // If still no teachers, try getting all users
            if (snapshot.docs.length === 0) {
                console.log('No teachers found, checking all users...');
                const allUsersSnapshot = await db.collection('users').get();
                console.log('Total users in database:', allUsersSnapshot.docs.length);
                allUsersSnapshot.forEach(doc => {
                    console.log('User in database:', doc.id, doc.data());
                });
            }
            
            const teachers = [];
            snapshot.forEach(doc => {
                const teacherData = { id: doc.id, ...doc.data() };
                console.log('Teacher data:', teacherData);
                teachers.push(teacherData);
            });
            return teachers;
        } catch (error) {
            console.error('Error getting teachers:', error);
            console.error('Error details:', error.code, error.message);
            return [];
        }
    }

    // Get teacher availability
    async getTeacherAvailability(teacherId) {
        try {
            console.log('Getting availability for teacher:', teacherId);
            const doc = await db.collection('teacherAvailability').doc(teacherId).get();
            console.log('Availability document exists:', doc.exists);
            
            if (doc.exists) {
                const data = doc.data();
                console.log('Availability data:', data);
                return data;
            } else {
                console.log('No availability document found for teacher');
                return null;
            }
        } catch (error) {
            console.error('Error getting teacher availability:', error);
            console.error('Error details:', error.message, error.code);
            return null;
        }
    }

    // Set teacher availability
    async setTeacherAvailability(teacherId, availability) {
        try {
            await db.collection('teacherAvailability').doc(teacherId).set({
                ...availability,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Debug function to check all users
    async debugAllUsers() {
        try {
            console.log('=== DEBUG: Checking all users in database ===');
            const snapshot = await db.collection('users').get();
            console.log('Total users found:', snapshot.docs.length);
            
            snapshot.forEach(doc => {
                console.log('User:', doc.id, doc.data());
            });
            
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Debug error:', error);
            return [];
        }
    }

    // Debug function to check all appointments
    async debugAllAppointments() {
        try {
            console.log('=== DEBUG: Checking all appointments in database ===');
            const snapshot = await db.collection('appointments').get();
            console.log('Total appointments in database:', snapshot.docs.length);
            
            snapshot.forEach(doc => {
                console.log('Appointment:', doc.id, doc.data());
            });
            
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Debug appointments error:', error);
            return [];
        }
    }
}

// Initialize services
const authService = new AuthService();
const dbService = new DatabaseService();

// Export for use in other files
window.authService = authService;
window.dbService = dbService; 
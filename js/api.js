// project/js/api.js

// Firebase SDK global imports (for production, typically handled by a bundler or direct CDN includes in HTML)
// Uncomment these imports if you are using a module bundler (like Webpack, Rollup, Parcel, Vite)
// import { initializeApp } from 'firebase/app';
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
// import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { getDatabase as getRealtimeDatabase, ref as dbRef, push, onValue } from 'firebase/database';


// --- Firebase Configuration (IMPORTANT: Replace with your actual Firebase project config) ---
// You would get this from your Firebase project settings (Project overview -> Project settings -> Your apps -> Web app)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    databaseURL: "YOUR_DATABASE_URL" // Required for Firebase Realtime Database
};

// --- Initialize Firebase (Uncomment and use if integrating Firebase) ---
// let app;
// let auth;
// let db; // Firestore
// let storage;
// let realtimeDb; // Realtime Database

// try {
//     app = initializeApp(firebaseConfig);
//     auth = getAuth(app);
//     db = getFirestore(app);
//     storage = getStorage(app);
//     realtimeDb = getRealtimeDatabase(app);
//     console.log("Firebase initialized successfully (if using real Firebase).");
// } catch (error) {
//     console.error("Firebase initialization error:", error);
//     console.warn("API functions will use mock data as Firebase is not configured or failed to initialize.");
// }


// --- Mock Data Store (for demonstration without actual backend) ---
// In a real application, this would be your Firestore/Realtime Database data.
const mockDB = {
    users: {
        "admin123": { uid: "admin123", email: "admin@cms.com", name: "Adminstrator", role: "admin", profilePicUrl: "https://via.placeholder.com/150/FFC107/FFFFFF?text=A" },
        "teacher123": { uid: "teacher123", email: "teacher@cms.com", name: "Prof. Smith", role: "teacher", profilePicUrl: "https://via.placeholder.com/150/2196F3/FFFFFF?text=T" },
        "student123": { uid: "student123", email: "student@cms.com", name: "Alice Johnson", role: "student", profilePicUrl: "https://via.placeholder.com/150/4CAF50/FFFFFF?text=S" },
    },
    students: [
        { id: 'S001', name: 'Alice Johnson', email: 'alice@cms.com', age: 20, major: 'Computer Science', enrolledCourses: ['C-CS101', 'C-MA201'] },
        { id: 'S002', name: 'Bob Williams', email: 'bob@cms.com', age: 21, major: 'Electrical Engineering', enrolledCourses: ['C-EE101', 'C-CS101'] },
        { id: 'S003', name: 'Charlie Davis', email: 'charlie@cms.com', age: 19, major: 'Physics', enrolledCourses: ['C-PH101'] },
    ],
    teachers: [
        { id: 'T001', name: 'Prof. Smith', email: 'teacher@cms.com', department: 'Computer Science', assignedCourses: ['C-CS101', 'C-MA201'] },
        { id: 'T002', name: 'Dr. White', email: 'dr.white@cms.com', department: 'Electrical Engineering', assignedCourses: ['C-EE101'] },
    ],
    courses: [
        { id: 'C-CS101', name: 'Introduction to Programming', code: 'CS101', teacherId: 'T001', capacity: 50, enrolled: 30 },
        { id: 'C-MA201', name: 'Calculus I', code: 'MA201', teacherId: 'T001', capacity: 40, enrolled: 25 },
        { id: 'C-EE101', name: 'Basic Electronics', code: 'EE101', teacherId: 'T002', capacity: 45, enrolled: 35 },
        { id: 'C-PH101', name: 'General Physics', code: 'PH101', teacherId: null, capacity: 60, enrolled: 15 },
    ],
    attendance: {
        'C-CS101': {
            '2025-07-10': { 'S001': 'P', 'S002': 'P', 'S003': 'A' },
            '2025-07-11': { 'S001': 'P', 'S002': 'A', 'S003': 'P' },
        }
    },
    grades: {
        'S001': { 'C-CS101': { score: 85, grade: 'A-' }, 'C-MA201': { score: 78, grade: 'B+' } },
        'S002': { 'C-CS101': { score: 70, grade: 'C' }, 'C-EE101': { score: 92, grade: 'A' } },
    },
    announcements: [
        { id: 'AN001', title: 'Welcome Back!', message: 'Classes resume on July 15th.', date: '2025-07-01' },
        { id: 'AN002', title: 'Exam Schedule Update', message: 'Midterm exam schedule posted on portal.', date: '2025-07-05' },
    ]
};

// --- Authentication Functions (Mocked) ---
export const registerUser = async (email, password, displayName, role) => {
    // In real Firebase:
    // try {
    //     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //     const user = userCredential.user;
    //     await setDoc(doc(db, "users", user.uid), {
    //         email: email,
    //         name: displayName,
    //         role: role,
    //         createdAt: new Date(),
    //         profilePicUrl: `https://via.placeholder.com/150/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=${displayName.charAt(0).toUpperCase()}`
    //     });
    //     return { success: true, message: "Registration successful!" };
    // } catch (error) {
    //     console.error("Registration error:", error);
    //     return { success: false, message: error.message };
    // }

    // Mock implementation:
    return new Promise(resolve => {
        setTimeout(() => {
            if (Object.values(mockDB.users).some(u => u.email === email)) {
                resolve({ success: false, message: "Email already registered." });
                return;
            }
            const newUid = `user_${Date.now()}`;
            mockDB.users[newUid] = {
                uid: newUid,
                email: email,
                name: displayName,
                role: role,
                profilePicUrl: `https://via.placeholder.com/150/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=${displayName.charAt(0).toUpperCase()}`
            };
            console.log(`Mock User registered: ${email}, Role: ${role}`);
            resolve({ success: true, message: "Mock registration successful!" });
        }, 500);
    });
};

export const loginUser = async (email, password) => {
    // In real Firebase:
    // try {
    //     const userCredential = await signInWithEmailAndPassword(auth, email, password);
    //     const user = userCredential.user;
    //     const userDoc = await getDoc(doc(db, "users", user.uid));
    //     if (userDoc.exists()) {
    //         return { success: true, user: { uid: user.uid, ...userDoc.data() } };
    //     } else {
    //         throw new Error("User data not found in Firestore after auth.");
    //     }
    // } catch (error) {
    //     console.error("Login error:", error);
    //     return { success: false, message: error.message };
    // }

    // Mock implementation:
    return new Promise(resolve => {
        setTimeout(() => {
            const userEntry = Object.values(mockDB.users).find(u => u.email === email);
            if (userEntry && password === "password123") { // Hardcoded password for mock
                console.log(`Mock User logged in: ${email}`);
                resolve({ success: true, user: userEntry });
            } else {
                resolve({ success: false, message: "Invalid email or password. (Mock: password is 'password123')" });
            }
        }, 500);
    });
};

export const logoutUser = async () => {
    // In real Firebase:
    // try {
    //     await signOut(auth);
    //     return { success: true };
    // } catch (error) {
    //     console.error("Logout error:", error);
    //     return { success: false, message: error.message };
    // }

    // Mock implementation:
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("Mock User logged out");
            resolve({ success: true });
        }, 300);
    });
};

// --- User/Profile Management (Mocked) ---
export const getUserData = async (uid) => {
    // In real Firebase:
    // try {
    //     const userDoc = await getDoc(doc(db, "users", uid));
    //     if (userDoc.exists()) {
    //         return userDoc.data();
    //     }
    //     return null;
    // } catch (error) {
    //     console.error("Error fetching user data:", error);
    //     return null;
    // }

    // Mock implementation:
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockDB.users[uid] || null);
        }, 300);
    });
};

export const updateUserData = async (uid, data) => {
    // In real Firebase:
    // try {
    //     await updateDoc(doc(db, "users", uid), data);
    //     return { success: true };
    // } catch (error) {
    //     console.error("Error updating user data:", error);
    //     return { success: false, message: error.message };
    // }

    // Mock implementation:
    return new Promise(resolve => {
        setTimeout(() => {
            if (mockDB.users[uid]) {
                mockDB.users[uid] = { ...mockDB.users[uid], ...data };
                console.log(`Mock User ${uid} updated:`, data);
                resolve({ success: true });
            } else {
                resolve({ success: false, message: "User not found." });
            }
        }, 500);
    });
};

export const uploadProfileImage = async (uid, file) => {
    // In real Firebase (using Cloudinary or Firebase Storage):
    // For Cloudinary: You'd send the file to Cloudinary API and get back a URL.
    // For Firebase Storage:
    // try {
    //     const storageRef = ref(storage, `profile_pictures/${uid}/${file.name}`);
    //     const snapshot = await uploadBytes(storageRef, file);
    //     const downloadURL = await getDownloadURL(snapshot.ref);
    //     await updateDoc(doc(db, "users", uid), { profilePicUrl: downloadURL });
    //     return { success: true, url: downloadURL };
    // } catch (error) {
    //     console.error("Error uploading profile image:", error);
    //     return { success: false, message: error.message };
    // }

    // Mock implementation (generates a placeholder URL):
    return new Promise(resolve => {
        setTimeout(() => {
            const mockUrl = `https://via.placeholder.com/150/FF6347/FFFFFF?text=${uid.substring(0, 5)}`;
            if (mockDB.users[uid]) {
                mockDB.users[uid].profilePicUrl = mockUrl;
                console.log(`Mock Profile image uploaded for ${uid}: ${mockUrl}`);
                resolve({ success: true, url: mockUrl });
            } else {
                resolve({ success: false, message: "User not found for image upload." });
            }
        }, 1000);
    });
};

// --- Admin Specific Functions (Mocked) ---
export const addStudent = async (studentData) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newId = `S${String(mockDB.students.length + 1).padStart(3, '0')}`;
            const student = { id: newId, ...studentData };
            mockDB.students.push(student);
            console.log("Mock Added student:", student);
            resolve({ success: true, student });
        }, 500);
    });
};

export const updateStudent = async (studentId, studentData) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockDB.students.findIndex(s => s.id === studentId);
            if (index !== -1) {
                mockDB.students[index] = { ...mockDB.students[index], ...studentData };
                console.log(`Mock Updated student ${studentId}:`, studentData);
                resolve({ success: true });
            } else {
                resolve({ success: false, message: "Student not found." });
            }
        }, 500);
    });
};

export const deleteStudent = async (studentId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const initialLength = mockDB.students.length;
            mockDB.students = mockDB.students.filter(s => s.id !== studentId);
            if (mockDB.students.length < initialLength) {
                console.log(`Mock Deleted student: ${studentId}`);
                resolve({ success: true });
            } else {
                resolve({ success: false, message: "Student not found." });
            }
        }, 300);
    });
};

export const getAllStudents = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...mockDB.students]);
        }, 300);
    });
};

export const addTeacher = async (teacherData) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newId = `T${String(mockDB.teachers.length + 1).padStart(3, '0')}`;
            const teacher = { id: newId, ...teacherData };
            mockDB.teachers.push(teacher);
            console.log("Mock Added teacher:", teacher);
            resolve({ success: true, teacher });
        }, 500);
    });
};

export const updateTeacher = async (teacherId, teacherData) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockDB.teachers.findIndex(t => t.id === teacherId);
            if (index !== -1) {
                mockDB.teachers[index] = { ...mockDB.teachers[index], ...teacherData };
                console.log(`Mock Updated teacher ${teacherId}:`, teacherData);
                resolve({ success: true });
            } else {
                resolve({ success: false, message: "Teacher not found." });
            }
        }, 500);
    });
};

export const deleteTeacher = async (teacherId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const initialLength = mockDB.teachers.length;
            mockDB.teachers = mockDB.teachers.filter(t => t.id !== teacherId);
            if (mockDB.teachers.length < initialLength) {
                console.log(`Mock Deleted teacher: ${teacherId}`);
                resolve({ success: true });
            } else {
                resolve({ success: false, message: "Teacher not found." });
            }
        }, 300);
    });
};

export const getAllTeachers = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...mockDB.teachers]);
        }, 300);
    });
};

export const getAllCourses = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...mockDB.courses]);
        }, 300);
    });
};

export const assignCourseToStudent = async (studentId, courseId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const student = mockDB.students.find(s => s.id === studentId);
            const course = mockDB.courses.find(c => c.id === courseId);
            if (student && course) {
                if (!student.enrolledCourses.includes(courseId)) {
                    student.enrolledCourses.push(courseId);
                    course.enrolled = (course.enrolled || 0) + 1; // Increment enrolled count
                    console.log(`Mock Assigned course ${courseId} to student ${studentId}`);
                    resolve({ success: true });
                } else {
                    resolve({ success: false, message: "Student already enrolled in this course." });
                }
            } else {
                resolve({ success: false, message: "Student or course not found." });
            }
        }, 500);
    });
};

// --- Teacher Specific Functions (Mocked) ---
export const getTeacherCourses = async (teacherId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const teacher = mockDB.teachers.find(t => t.id === teacherId);
            if (teacher) {
                const courses = mockDB.courses.filter(c => c.teacherId === teacher.id);
                resolve(courses);
            } else {
                resolve([]);
            }
        }, 300);
    });
};

export const getStudentsInCourse = async (courseId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const students = mockDB.students.filter(s => s.enrolledCourses.includes(courseId));
            resolve(students);
        }, 300);
    });
};

export const getAttendanceForCourseAndDate = async (courseId, date) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const courseAttendance = mockDB.attendance[courseId] || {};
            resolve(courseAttendance[date] || {});
        }, 300);
    });
};

export const markAttendance = async (courseId, studentId, date, status) => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (!mockDB.attendance[courseId]) {
                mockDB.attendance[courseId] = {};
            }
            if (!mockDB.attendance[courseId][date]) {
                mockDB.attendance[courseId][date] = {};
            }
            mockDB.attendance[courseId][date][studentId] = status;
            console.log(`Mock Attendance marked for ${studentId} in ${courseId} on ${date}: ${status}`);
            resolve({ success: true });
        }, 500);
    });
};

export const uploadResults = async (studentId, courseId, grade, score) => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (!mockDB.grades[studentId]) {
                mockDB.grades[studentId] = {};
            }
            mockDB.grades[studentId][courseId] = { grade, score };
            console.log(`Mock Results uploaded for ${studentId} in ${courseId}: Grade ${grade}, Score ${score}`);
            resolve({ success: true });
        }, 500);
    });
};

export const postAnnouncement = async (title, message, teacherId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newId = `AN${String(mockDB.announcements.length + 1).padStart(3, '0')}`;
            const announcement = { id: newId, title, message, date: new Date().toISOString().split('T')[0], authorId: teacherId };
            mockDB.announcements.unshift(announcement); // Add to the beginning for latest first
            console.log("Mock Announcement posted:", announcement);
            // Simulate real-time update by calling listeners directly
            announcementListeners.forEach(cb => cb(announcement));
            resolve({ success: true });
        }, 500);
    });
};


// --- Student Specific Functions (Mocked) ---
export const getStudentEnrolledCourses = async (studentId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const student = mockDB.students.find(s => s.id === studentId);
            if (student) {
                const enrolledCourses = mockDB.courses.filter(course => student.enrolledCourses.includes(course.id));
                resolve(enrolledCourses);
            } else {
                resolve([]);
            }
        }, 300);
    });
};

export const getStudentGrades = async (studentId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockDB.grades[studentId] || {});
        }, 300);
    });
};

export const getStudentAttendance = async (studentId) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const studentAttendance = {};
            for (const courseId in mockDB.attendance) {
                for (const date in mockDB.attendance[courseId]) {
                    if (mockDB.attendance[courseId][date][studentId]) {
                        if (!studentAttendance[courseId]) {
                            studentAttendance[courseId] = {};
                        }
                        studentAttendance[courseId][date] = mockDB.attendance[courseId][date][studentId];
                    }
                }
            }
            resolve(studentAttendance);
        }, 300);
    });
};

// --- Notifications (Real-time Simulation) ---
const announcementListeners = [];
export const listenForAnnouncements = (callback) => {
    announcementListeners.push(callback);
    // In real Firebase:
    // onValue(dbRef(realtimeDb, 'announcements'), (snapshot) => {
    //     const data = snapshot.val();
    //     if (data) {
    //         // Convert object to array and sort by date or timestamp if needed
    //         const announcementsArray = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));
    //         callback(announcementsArray); // Pass the entire array of announcements
    //     } else {
    //         callback([]);
    //     }
    // });
    console.log("Mock: Listening for announcements...");
    // Simulate initial load of announcements
    setTimeout(() => {
        callback(mockDB.announcements);
    }, 100);
};

// Simulate new announcements over time for demo
setInterval(() => {
    const newAnnouncement = {
        id: `AN${Date.now()}`,
        title: `Alert: Important Notice ${new Date().toLocaleTimeString()}`,
        message: `This is a simulated real-time announcement: ${Math.random().toFixed(2)}.`,
        date: new Date().toISOString().split('T')[0]
    };
    mockDB.announcements.unshift(newAnnouncement);
    // Notify all listeners
    announcementListeners.forEach(cb => cb(mockDB.announcements)); // Pass the whole updated array
}, 30000); // Every 30 seconds
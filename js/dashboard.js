// project/js/dashboard.js
// This file will contain the shared dashboard functionalities
// and conditional loading for specific roles.

import { checkAuthAndRedirect, handleLogout } from './auth.js';
import * as api from './api.js'; // Import all API functions

let currentUser = null; // Store the authenticated user object

document.addEventListener('DOMContentLoaded', async () => {
    // Determine the current HTML file to deduce the required role
    const path = window.location.pathname;
    let requiredRole;
    if (path.includes('admin.html')) {
        requiredRole = 'admin';
    } else if (path.includes('teacher.html')) {
        requiredRole = 'teacher';
    } else if (path.includes('student.html')) {
        requiredRole = 'student';
    } else {
        // Fallback or error, redirect to login
        window.location.href = 'index.html';
        return;
    }

    currentUser = checkAuthAndRedirect(requiredRole);
    if (!currentUser) {
        return; // Redirection handled by checkAuthAndRedirect
    }

    // Common Dashboard Elements
    const userDisplayNameElement = document.getElementById('userDisplayName');
    if (userDisplayNameElement) {
        userDisplayNameElement.textContent = currentUser.name || currentUser.email;
    }
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    const sidebarItems = document.querySelectorAll('.sidebar nav ul li[data-section]');
    const dashboardSections = document.querySelectorAll('.dashboard-section');

    const showSection = (sectionId) => {
        dashboardSections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        sidebarItems.forEach(item => {
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSectionId = item.dataset.section;
            showSection(targetSectionId);
            // Call specific load functions for each section
            switch (targetSectionId) {
                case 'overview':
                    // loadOverviewData(); // If any specific data needed for overview
                    break;
                case 'manage-students':
                    if (currentUser.role === 'admin') loadStudents();
                    break;
                case 'manage-teachers':
                    if (currentUser.role === 'admin') loadTeachers();
                    break;
                case 'assign-courses':
                    if (currentUser.role === 'admin') loadAssignCoursesSection();
                    break;
                case 'reports':
                    if (currentUser.role === 'admin') loadReports();
                    break;
                case 'manage-attendance':
                    if (currentUser.role === 'teacher') loadAttendanceManagement();
                    break;
                case 'upload-results':
                    if (currentUser.role === 'teacher') loadUploadResults();
                    break;
                case 'post-announcements':
                    if (currentUser.role === 'teacher') loadPostAnnouncements();
                    break;
                case 'view-timetable':
                    if (currentUser.role === 'student') loadTimetable();
                    break;
                case 'view-grades':
                    if (currentUser.role === 'student') loadGrades();
                    break;
                case 'view-attendance':
                    if (currentUser.role === 'student') loadStudentAttendance();
                    break;
                case 'profile':
                    loadProfileData();
                    break;
            }
        });
    });

    // Initial load: show the overview section or the first relevant section
    const initialSection = document.querySelector('.dashboard-section:not(.hidden)');
    if (initialSection) {
        showSection(initialSection.id);
        // Trigger the corresponding load function if it's not 'overview' or already handled
        const initialSidebarItem = document.querySelector(`.sidebar nav ul li[data-section="${initialSection.id}"]`);
        if (initialSidebarItem) initialSidebarItem.classList.add('active');
    } else {
        // Fallback for overview if no section is active
        showSection('overview');
        document.querySelector('.sidebar nav ul li[data-section="overview"]').classList.add('active');
    }

    // --- Notification System (Common for all roles) ---
    const notificationBell = document.getElementById('notificationBell');
    const notificationCount = document.getElementById('notificationCount');
    const notificationDropdown = document.getElementById('notificationDropdown');

    let unreadNotifications = 0;
    const updateNotificationDisplay = (announcements) => {
        notificationDropdown.innerHTML = '<h4>Announcements</h4>';
        if (announcements && announcements.length > 0) {
            announcements.forEach(announcement => {
                const div = document.createElement('div');
                div.classList.add('notification-item');
                div.innerHTML = `<strong>${announcement.title}</strong><br>${announcement.message}<br><small>${announcement.date}</small>`;
                notificationDropdown.appendChild(div);
            });
            unreadNotifications = announcements.length; // Assume all are unread initially
        } else {
            notificationDropdown.innerHTML += '<p>No new announcements.</p>';
        }
        notificationCount.textContent = unreadNotifications;
        notificationCount.style.display = unreadNotifications > 0 ? 'block' : 'none';
    };

    api.listenForAnnouncements((announcements) => {
        updateNotificationDisplay(announcements);
    });

    notificationBell.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from closing immediately
        notificationDropdown.classList.toggle('show');
        if (notificationDropdown.classList.contains('show')) {
            // Optional: Mark all as read when dropdown is opened
            // unreadNotifications = 0;
            // notificationCount.textContent = 0;
            // notificationCount.style.display = 'none';
        }
    });

    // Close dropdown if clicked outside
    window.addEventListener('click', (event) => {
        if (!notificationBell.contains(event.target) && !notificationDropdown.contains(event.target)) {
            notificationDropdown.classList.remove('show');
        }
    });


    // --- Profile Section (Common for all roles) ---
    const profileImage = document.getElementById('profileImage');
    const profileNameSpan = document.getElementById('profileName');
    const profileEmailSpan = document.getElementById('profileEmail');
    const profileRoleSpan = document.getElementById('profileRole');
    const profileImageUpload = document.getElementById('profileImageUpload');
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    const profileMessage = document.getElementById('profileMessage');

    const loadProfileData = async () => {
        const user = await api.getUserData(currentUser.uid);
        if (user) {
            profileNameSpan.textContent = user.name || 'N/A';
            profileEmailSpan.textContent = user.email || 'N/A';
            profileRoleSpan.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A';
            if (user.profilePicUrl) {
                profileImage.src = user.profilePicUrl;
            } else {
                profileImage.src = `https://via.placeholder.com/150/CCCCCC/888888?text=${user.name ? user.name.charAt(0).toUpperCase() : '?'}`;
            }
        }
    };

    profileImageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            profileMessage.textContent = 'Uploading image...';
            profileMessage.className = 'message';
            const result = await api.uploadProfileImage(currentUser.uid, file);
            if (result.success) {
                profileImage.src = result.url; // Update preview with new URL
                profileMessage.textContent = 'Profile picture updated successfully!';
                profileMessage.className = 'message success-message';
                // Update localStorage to reflect new profile pic
                currentUser.profilePicUrl = result.url;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                profileMessage.textContent = `Image upload failed: ${result.message}`;
                profileMessage.className = 'message error-message';
            }
        }
    });

    updateProfileBtn.addEventListener('click', async () => {
        // For simplicity, only name is editable in this mock
        const newName = prompt("Enter new name:", profileNameSpan.textContent);
        if (newName && newName.trim() !== '' && newName.trim() !== profileNameSpan.textContent) {
            profileMessage.textContent = 'Updating profile...';
            profileMessage.className = 'message';
            const result = await api.updateUserData(currentUser.uid, { name: newName.trim() });
            if (result.success) {
                profileNameSpan.textContent = newName.trim();
                profileMessage.textContent = 'Profile name updated successfully!';
                profileMessage.className = 'message success-message';
                // Update localStorage
                currentUser.name = newName.trim();
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                profileMessage.textContent = `Profile update failed: ${result.message}`;
                profileMessage.className = 'message error-message';
            }
        }
    });


    // --- Admin Specific Functions ---
    if (currentUser.role === 'admin') {
        const studentTableBody = document.querySelector('#studentTable tbody');
        const teacherTableBody = document.querySelector('#teacherTable tbody');
        const studentSearchInput = document.getElementById('studentSearch');
        const applyStudentFilterBtn = document.getElementById('applyStudentFilter');
        const teacherSearchInput = document.getElementById('teacherSearch');
        const applyTeacherFilterBtn = document.getElementById('applyTeacherFilter');

        // Modals for Add/Edit
        const studentModal = document.getElementById('studentModal');
        const teacherModal = document.getElementById('teacherModal');
        const assignCourseModal = document.getElementById('assignCourseModal');

        const addStudentBtn = document.getElementById('addStudentBtn');
        const addTeacherBtn = document.getElementById('addTeacherBtn');
        const saveStudentBtn = document.getElementById('saveStudentBtn');
        const saveTeacherBtn = document.getElementById('saveTeacherBtn');
        const assignCourseSaveBtn = document.getElementById('assignCourseSaveBtn');

        const studentFormTitle = document.getElementById('studentFormTitle');
        const studentIdInput = document.getElementById('studentIdInput');
        const studentNameInput = document.getElementById('studentNameInput');
        const studentEmailInput = document.getElementById('studentEmailInput');
        const studentAgeInput = document.getElementById('studentAgeInput');
        const studentMajorInput = document.getElementById('studentMajorInput');
        let currentEditingStudentId = null;

        const teacherFormTitle = document.getElementById('teacherFormTitle');
        const teacherIdInput = document.getElementById('teacherIdInput');
        const teacherNameInput = document.getElementById('teacherNameInput');
        const teacherEmailInput = document.getElementById('teacherEmailInput');
        const teacherDeptInput = document.getElementById('teacherDeptInput');
        let currentEditingTeacherId = null;

        const assignCourseStudentSelect = document.getElementById('assignCourseStudentSelect');
        const assignCourseCourseSelect = document.getElementById('assignCourseCourseSelect');


        // Close modal buttons
        document.querySelectorAll('.modal .close-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.add('hidden');
            });
        });
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.classList.add('hidden');
            }
        });


        // --- Manage Students ---
        const loadStudents = async (searchTerm = '') => {
            const students = await api.getAllStudents();
            studentTableBody.innerHTML = '';
            const filteredStudents = students.filter(s =>
                s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase())
            );

            filteredStudents.forEach(student => {
                const row = studentTableBody.insertRow();
                row.insertCell().textContent = student.id;
                row.insertCell().textContent = student.name;
                row.insertCell().textContent = student.email;
                row.insertCell().textContent = student.age || 'N/A';
                row.insertCell().textContent = student.major || 'N/A';
                const actionsCell = row.insertCell();
                actionsCell.innerHTML = `
                    <button data-id="${student.id}" class="edit-btn secondary">Edit</button>
                    <button data-id="${student.id}" class="delete-btn danger">Delete</button>
                `;
            });
            attachStudentTableListeners();
        };

        const attachStudentTableListeners = () => {
            studentTableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    const studentId = e.target.dataset.id;
                    const students = await api.getAllStudents();
                    const studentToEdit = students.find(s => s.id === studentId);
                    if (studentToEdit) {
                        studentFormTitle.textContent = 'Edit Student';
                        currentEditingStudentId = studentId;
                        studentIdInput.value = studentToEdit.id;
                        studentIdInput.disabled = true; // ID should not be editable
                        studentNameInput.value = studentToEdit.name;
                        studentEmailInput.value = studentToEdit.email;
                        studentAgeInput.value = studentToEdit.age || '';
                        studentMajorInput.value = studentToEdit.major || '';
                        studentModal.classList.remove('hidden');
                    }
                };
            });
            studentTableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    const studentId = e.target.dataset.id;
                    if (confirm(`Are you sure you want to delete student ${studentId}?`)) {
                        const result = await api.deleteStudent(studentId);
                        if (result.success) {
                            alert('Student deleted successfully!');
                            loadStudents();
                        } else {
                            alert(`Error deleting student: ${result.message}`);
                        }
                    }
                };
            });
        };

        addStudentBtn.addEventListener('click', () => {
            studentFormTitle.textContent = 'Add New Student';
            currentEditingStudentId = null;
            studentIdInput.value = '';
            studentIdInput.disabled = false;
            studentNameInput.value = '';
            studentEmailInput.value = '';
            studentAgeInput.value = '';
            studentMajorInput.value = '';
            studentModal.classList.remove('hidden');
        });

        saveStudentBtn.addEventListener('click', async () => {
            const studentData = {
                name: studentNameInput.value.trim(),
                email: studentEmailInput.value.trim(),
                age: parseInt(studentAgeInput.value) || null,
                major: studentMajorInput.value.trim(),
            };
            if (!studentData.name || !studentData.email) {
                alert('Name and Email are required.');
                return;
            }

            let result;
            if (currentEditingStudentId) {
                result = await api.updateStudent(currentEditingStudentId, studentData);
            } else {
                studentData.id = studentIdInput.value.trim() || `S${Date.now()}`; // Generate ID if not provided
                result = await api.addStudent(studentData);
            }

            if (result.success) {
                alert(`Student ${currentEditingStudentId ? 'updated' : 'added'} successfully!`);
                studentModal.classList.add('hidden');
                loadStudents();
            } else {
                alert(`Error saving student: ${result.message}`);
            }
        });

        applyStudentFilterBtn.addEventListener('click', () => {
            loadStudents(studentSearchInput.value);
        });
        studentSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') loadStudents(studentSearchInput.value);
        });


        // --- Manage Teachers ---
        const loadTeachers = async (searchTerm = '') => {
            const teachers = await api.getAllTeachers();
            teacherTableBody.innerHTML = '';
            const filteredTeachers = teachers.filter(t =>
                t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.email.toLowerCase().includes(searchTerm.toLowerCase())
            );

            filteredTeachers.forEach(teacher => {
                const row = teacherTableBody.insertRow();
                row.insertCell().textContent = teacher.id;
                row.insertCell().textContent = teacher.name;
                row.insertCell().textContent = teacher.email;
                row.insertCell().textContent = teacher.department || 'N/A';
                const actionsCell = row.insertCell();
                actionsCell.innerHTML = `
                    <button data-id="${teacher.id}" class="edit-btn secondary">Edit</button>
                    <button data-id="${teacher.id}" class="delete-btn danger">Delete</button>
                `;
            });
            attachTeacherTableListeners();
        };

        const attachTeacherTableListeners = () => {
            teacherTableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    const teacherId = e.target.dataset.id;
                    const teachers = await api.getAllTeachers();
                    const teacherToEdit = teachers.find(t => t.id === teacherId);
                    if (teacherToEdit) {
                        teacherFormTitle.textContent = 'Edit Teacher';
                        currentEditingTeacherId = teacherId;
                        teacherIdInput.value = teacherToEdit.id;
                        teacherIdInput.disabled = true;
                        teacherNameInput.value = teacherToEdit.name;
                        teacherEmailInput.value = teacherToEdit.email;
                        teacherDeptInput.value = teacherToEdit.department || '';
                        teacherModal.classList.remove('hidden');
                    }
                };
            });
            teacherTableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    const teacherId = e.target.dataset.id;
                    if (confirm(`Are you sure you want to delete teacher ${teacherId}?`)) {
                        const result = await api.deleteTeacher(teacherId);
                        if (result.success) {
                            alert('Teacher deleted successfully!');
                            loadTeachers();
                        } else {
                            alert(`Error deleting teacher: ${result.message}`);
                        }
                    }
                };
            });
        };

        addTeacherBtn.addEventListener('click', () => {
            teacherFormTitle.textContent = 'Add New Teacher';
            currentEditingTeacherId = null;
            teacherIdInput.value = '';
            teacherIdInput.disabled = false;
            teacherNameInput.value = '';
            teacherEmailInput.value = '';
            teacherDeptInput.value = '';
            teacherModal.classList.remove('hidden');
        });

        saveTeacherBtn.addEventListener('click', async () => {
            const teacherData = {
                name: teacherNameInput.value.trim(),
                email: teacherEmailInput.value.trim(),
                department: teacherDeptInput.value.trim(),
            };
            if (!teacherData.name || !teacherData.email) {
                alert('Name and Email are required.');
                return;
            }

            let result;
            if (currentEditingTeacherId) {
                result = await api.updateTeacher(currentEditingTeacherId, teacherData);
            } else {
                teacherData.id = teacherIdInput.value.trim() || `T${Date.now()}`;
                result = await api.addTeacher(teacherData);
            }

            if (result.success) {
                alert(`Teacher ${currentEditingTeacherId ? 'updated' : 'added'} successfully!`);
                teacherModal.classList.add('hidden');
                loadTeachers();
            } else {
                alert(`Error saving teacher: ${result.message}`);
            }
        });

        applyTeacherFilterBtn.addEventListener('click', () => {
            loadTeachers(teacherSearchInput.value);
        });
        teacherSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') loadTeachers(teacherSearchInput.value);
        });


        // --- Assign Courses ---
        const loadAssignCoursesSection = async () => {
            const students = await api.getAllStudents();
            const courses = await api.getAllCourses();

            assignCourseStudentSelect.innerHTML = '<option value="">Select Student</option>';
            students.forEach(s => {
                const option = document.createElement('option');
                option.value = s.id;
                option.textContent = `${s.name} (${s.id})`;
                assignCourseStudentSelect.appendChild(option);
            });

            assignCourseCourseSelect.innerHTML = '<option value="">Select Course</option>';
            courses.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = `${c.name} (${c.code})`;
                assignCourseCourseSelect.appendChild(option);
            });
        };

        document.getElementById('openAssignCourseModalBtn').addEventListener('click', () => {
            loadAssignCoursesSection(); // Reload options when opening
            assignCourseModal.classList.remove('hidden');
        });

        assignCourseSaveBtn.addEventListener('click', async () => {
            const studentId = assignCourseStudentSelect.value;
            const courseId = assignCourseCourseSelect.value;

            if (!studentId || !courseId) {
                alert('Please select both student and course.');
                return;
            }

            const result = await api.assignCourseToStudent(studentId, courseId);
            if (result.success) {
                alert('Course assigned successfully!');
                assignCourseModal.classList.add('hidden');
            } else {
                alert(`Error assigning course: ${result.message}`);
            }
        });

        // --- Reports (Placeholder) ---
        const loadReports = () => {
            const reportsSection = document.getElementById('reports');
            reportsSection.innerHTML = `
                <h2>View Reports</h2>
                <p>This section would display various reports like:</p>
                <ul>
                    <li>Student Enrollment Reports</li>
                    <li>Teacher Course Load Reports</li>
                    <li>Attendance Summaries</li>
                    <li>Grade Distribution Reports</li>
                    <li>Course Capacity vs. Enrollment</li>
                </ul>
                <p>Data visualization libraries (e.g., Chart.js, D3.js) could be integrated here to show charts and graphs.</p>
            `;
        };
    } // End of Admin specific functions


    // --- Teacher Specific Functions ---
    if (currentUser.role === 'teacher') {
        const attendanceCourseSelect = document.getElementById('attendanceCourseSelect');
        const attendanceDateInput = document.getElementById('attendanceDate');
        const attendanceStudentsTableBody = document.querySelector('#attendanceStudentsTable tbody');
        const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
        const attendanceMessage = document.getElementById('attendanceMessage');

        const uploadResultsCourseSelect = document.getElementById('uploadResultsCourseSelect');
        const uploadResultsStudentSelect = document.getElementById('uploadResultsStudentSelect');
        const resultScoreInput = document.getElementById('resultScore');
        const resultGradeInput = document.getElementById('resultGrade');
        const saveResultBtn = document.getElementById('saveResultBtn');
        const uploadResultsMessage = document.getElementById('uploadResultsMessage');

        const announcementTitleInput = document.getElementById('announcementTitle');
        const announcementMessageTextarea = document.getElementById('announcementMessage');
        const postAnnouncementBtn = document.getElementById('postAnnouncementBtn');
        const announcementPostMessage = document.getElementById('announcementPostMessage');

        let selectedAttendanceCourseId = null;
        let studentsInSelectedCourse = [];

        const loadAttendanceManagement = async () => {
            const teacherCourses = await api.getTeacherCourses(currentUser.id);
            attendanceCourseSelect.innerHTML = '<option value="">Select Course</option>';
            teacherCourses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.name} (${course.code})`;
                attendanceCourseSelect.appendChild(option);
            });
            attendanceStudentsTableBody.innerHTML = '';
            attendanceMessage.textContent = '';

            // Set today's date as default
            attendanceDateInput.valueAsDate = new Date();
        };

        attendanceCourseSelect.addEventListener('change', async () => {
            selectedAttendanceCourseId = attendanceCourseSelect.value;
            if (selectedAttendanceCourseId) {
                await fetchAndDisplayAttendance();
            } else {
                attendanceStudentsTableBody.innerHTML = '';
            }
        });

        attendanceDateInput.addEventListener('change', async () => {
            if (selectedAttendanceCourseId) {
                await fetchAndDisplayAttendance();
            }
        });

        const fetchAndDisplayAttendance = async () => {
            if (!selectedAttendanceCourseId || !attendanceDateInput.value) {
                attendanceMessage.textContent = 'Please select a course and date.';
                attendanceMessage.className = 'message error-message';
                attendanceStudentsTableBody.innerHTML = '';
                return;
            }

            studentsInSelectedCourse = await api.getStudentsInCourse(selectedAttendanceCourseId);
            const currentAttendance = await api.getAttendanceForCourseAndDate(selectedAttendanceCourseId, attendanceDateInput.value);

            attendanceStudentsTableBody.innerHTML = '';
            if (studentsInSelectedCourse.length === 0) {
                attendanceMessage.textContent = 'No students enrolled in this course.';
                attendanceMessage.className = 'message';
                return;
            }
            attendanceMessage.textContent = '';

            studentsInSelectedCourse.forEach(student => {
                const row = attendanceStudentsTableBody.insertRow();
                row.insertCell().textContent = student.id;
                row.insertCell().textContent = student.name;
                const statusCell = row.insertCell();
                statusCell.innerHTML = `
                    <label><input type="radio" name="attendance-${student.id}" value="P" ${currentAttendance[student.id] === 'P' ? 'checked' : ''}> Present</label>
                    <label><input type="radio" name="attendance-${student.id}" value="A" ${currentAttendance[student.id] === 'A' ? 'checked' : ''}> Absent</label>
                    <label><input type="radio" name="attendance-${student.id}" value="L" ${currentAttendance[student.id] === 'L' ? 'checked' : ''}> Late</label>
                `;
            });
        };

        saveAttendanceBtn.addEventListener('click', async () => {
            if (!selectedAttendanceCourseId || !attendanceDateInput.value) {
                attendanceMessage.textContent = 'Please select a course and date before saving.';
                attendanceMessage.className = 'message error-message';
                return;
            }

            let allMarked = true;
            for (const student of studentsInSelectedCourse) {
                const selectedStatus = document.querySelector(`input[name="attendance-${student.id}"]:checked`);
                if (!selectedStatus) {
                    allMarked = false;
                    alert(`Please mark attendance for ${student.name}.`);
                    return;
                }
                const result = await api.markAttendance(selectedAttendanceCourseId, student.id, attendanceDateInput.value, selectedStatus.value);
                if (!result.success) {
                    alert(`Failed to save attendance for ${student.name}: ${result.message}`);
                    return;
                }
            }

            if (allMarked) {
                attendanceMessage.textContent = 'Attendance saved successfully!';
                attendanceMessage.className = 'message success-message';
            }
        });


        // --- Upload Results ---
        const loadUploadResults = async () => {
            const teacherCourses = await api.getTeacherCourses(currentUser.id);
            uploadResultsCourseSelect.innerHTML = '<option value="">Select Course</option>';
            teacherCourses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = `${course.name} (${course.code})`;
                uploadResultsCourseSelect.appendChild(option);
            });
            uploadResultsStudentSelect.innerHTML = '<option value="">Select Student</option>';
            resultScoreInput.value = '';
            resultGradeInput.value = '';
            uploadResultsMessage.textContent = '';
        };

        uploadResultsCourseSelect.addEventListener('change', async () => {
            const courseId = uploadResultsCourseSelect.value;
            uploadResultsStudentSelect.innerHTML = '<option value="">Select Student</option>';
            if (courseId) {
                const students = await api.getStudentsInCourse(courseId);
                students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = `${student.name} (${student.id})`;
                    uploadResultsStudentSelect.appendChild(option);
                });
            }
        });

        saveResultBtn.addEventListener('click', async () => {
            const courseId = uploadResultsCourseSelect.value;
            const studentId = uploadResultsStudentSelect.value;
            const score = parseInt(resultScoreInput.value);
            const grade = resultGradeInput.value.trim();

            if (!courseId || !studentId || isNaN(score) || !grade) {
                uploadResultsMessage.textContent = 'Please fill all result fields.';
                uploadResultsMessage.className = 'message error-message';
                return;
            }

            const result = await api.uploadResults(studentId, courseId, grade, score);
            if (result.success) {
                uploadResultsMessage.textContent = 'Results uploaded successfully!';
                uploadResultsMessage.className = 'message success-message';
                resultScoreInput.value = '';
                resultGradeInput.value = '';
            } else {
                uploadResultsMessage.textContent = `Failed to upload results: ${result.message}`;
                uploadResultsMessage.className = 'message error-message';
            }
        });


        // --- Post Announcements ---
        const loadPostAnnouncements = () => {
            announcementTitleInput.value = '';
            announcementMessageTextarea.value = '';
            announcementPostMessage.textContent = '';
        };

        postAnnouncementBtn.addEventListener('click', async () => {
            const title = announcementTitleInput.value.trim();
            const message = announcementMessageTextarea.value.trim();

            if (!title || !message) {
                announcementPostMessage.textContent = 'Please enter both title and message for the announcement.';
                announcementPostMessage.className = 'message error-message';
                return;
            }

            announcementPostMessage.textContent = 'Posting announcement...';
            announcementPostMessage.className = 'message';

            const result = await api.postAnnouncement(title, message, currentUser.id);
            if (result.success) {
                announcementPostMessage.textContent = 'Announcement posted successfully!';
                announcementPostMessage.className = 'message success-message';
                announcementTitleInput.value = '';
                announcementMessageTextarea.value = '';
            } else {
                announcementPostMessage.textContent = `Failed to post announcement: ${result.message}`;
                announcementPostMessage.className = 'message error-message';
            }
        });

    } // End of Teacher specific functions


    // --- Student Specific Functions ---
    if (currentUser.role === 'student') {
        const timetableList = document.getElementById('timetableList');
        const gradesTableBody = document.querySelector('#gradesTable tbody');
        const studentAttendanceTableBody = document.querySelector('#studentAttendanceTable tbody');

        const loadTimetable = async () => {
            const enrolledCourses = await api.getStudentEnrolledCourses(currentUser.id);
            timetableList.innerHTML = '';
            if (enrolledCourses.length === 0) {
                timetableList.innerHTML = '<p>You are not currently enrolled in any courses.</p>';
                return;
            }
            enrolledCourses.forEach(course => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${course.name} (${course.code})</strong> - Teacher: ${course.teacherId || 'N/A'}`; // Teacher Name lookup needed
                timetableList.appendChild(li);
            });
            // In a real system, you'd fetch actual class schedules (day, time, room) for each course
        };

        const loadGrades = async () => {
            const grades = await api.getStudentGrades(currentUser.id);
            gradesTableBody.innerHTML = '';
            if (Object.keys(grades).length === 0) {
                gradesTableBody.innerHTML = '<tr><td colspan="4">No grades available yet.</td></tr>';
                return;
            }
            for (const courseId in grades) {
                const gradeData = grades[courseId];
                const course = (await api.getAllCourses()).find(c => c.id === courseId); // Get course name
                const row = gradesTableBody.insertRow();
                row.insertCell().textContent = course ? course.name : courseId;
                row.insertCell().textContent = course ? course.code : 'N/A';
                row.insertCell().textContent = gradeData.score || 'N/A';
                row.insertCell().textContent = gradeData.grade || 'N/A';
            }
        };

        const loadStudentAttendance = async () => {
            const attendance = await api.getStudentAttendance(currentUser.id);
            studentAttendanceTableBody.innerHTML = '';
            if (Object.keys(attendance).length === 0) {
                studentAttendanceTableBody.innerHTML = '<tr><td colspan="3">No attendance records yet.</td></tr>';
                return;
            }
            for (const courseId in attendance) {
                const course = (await api.getAllCourses()).find(c => c.id === courseId); // Get course name
                const courseName = course ? course.name : courseId;
                for (const date in attendance[courseId]) {
                    const status = attendance[courseId][date];
                    const row = studentAttendanceTableBody.insertRow();
                    row.insertCell().textContent = courseName;
                    row.insertCell().textContent = date;
                    row.insertCell().textContent = status;
                }
            }
        };
    } // End of Student specific functions

});
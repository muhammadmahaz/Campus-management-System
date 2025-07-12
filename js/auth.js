// project/js/auth.js
import { registerUser, loginUser, logoutUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const authMessage = document.getElementById('authMessage');

    // Default role for the initial signup form, can be changed by buttons
    let currentSignupRole = 'student';

    const roleButtons = document.querySelectorAll('.role-selection button');
    roleButtons.forEach(button => {
        button.addEventListener('click', () => {
            roleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // This sets the hidden role for the current login attempt if desired
            // Or just visual feedback for the user on which role they're trying to login as.
        });
    });
    // Set default active role button for visual consistency
    document.getElementById('studentRoleBtn').classList.add('active');


    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        authMessage.textContent = '';
        authMessage.className = 'message';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authMessage.textContent = '';
        authMessage.className = 'message';
    });

    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!email || !password) {
            authMessage.textContent = 'Please enter both email and password.';
            authMessage.className = 'message error-message';
            return;
        }

        authMessage.textContent = 'Logging in...';
        authMessage.className = 'message';

        const result = await loginUser(email, password);
        if (result.success) {
            authMessage.textContent = 'Login successful! Redirecting...';
            authMessage.className = 'message success-message';
            localStorage.setItem('currentUser', JSON.stringify(result.user));

            switch (result.user.role) {
                case 'admin':
                    window.location.href = 'admin.html';
                    break;
                case 'teacher':
                    window.location.href = 'teacher.html';
                    break;
                case 'student':
                    window.location.href = 'student.html';
                    break;
                default:
                    window.location.href = 'index.html'; // Fallback
            }
        } else {
            authMessage.textContent = `Login failed: ${result.message}`;
            authMessage.className = 'message error-message';
        }
    });

    signupBtn.addEventListener('click', async () => {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        const role = document.getElementById('signupRole').value;

        if (!name || !email || !password) {
            authMessage.textContent = 'Please fill in all fields.';
            authMessage.className = 'message error-message';
            return;
        }

        if (password.length < 6) {
            authMessage.textContent = 'Password must be at least 6 characters long.';
            authMessage.className = 'message error-message';
            return;
        }

        authMessage.textContent = 'Registering...';
        authMessage.className = 'message';

        const result = await registerUser(email, password, name, role);
        if (result.success) {
            authMessage.textContent = 'Registration successful! You can now login.';
            authMessage.className = 'message success-message';
            // Clear signup fields
            document.getElementById('signupName').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            // Switch back to login form after successful signup
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
        } else {
            authMessage.textContent = `Registration failed: ${result.message}`;
            authMessage.className = 'message error-message';
        }
    });
});

/**
 * Checks if a user is authenticated and has the required role.
 * Redirects to the login page if not.
 * @param {string} requiredRole - The role required for the current page ('admin', 'teacher', 'student').
 * @returns {object|null} The current user object if authenticated and authorized, otherwise null.
 */
export const checkAuthAndRedirect = (requiredRole) => {
    const userString = localStorage.getItem('currentUser');
    if (!userString) {
        window.location.href = 'index.html';
        return null;
    }

    let user;
    try {
        user = JSON.parse(userString);
    } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
        localStorage.removeItem('currentUser'); // Clear invalid data
        window.location.href = 'index.html';
        return null;
    }

    if (!user || user.role !== requiredRole) {
        alert(`Access Denied. You must be a ${requiredRole} to view this page.`);
        localStorage.removeItem('currentUser'); // Clear unauthorized session
        window.location.href = 'index.html';
        return null;
    }
    return user;
};

export const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
        await logoutUser();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
};
// --- Global State for Demonstration ---
let isUserLoggedIn = false; // Tracks login status (Starts false)

// --- Modal Definitions ---
let uploadModal, loginModal, registerModal, langPopup;
let joinSessionModal, createSessionModal, shareNotesModal, chatInterfaceModal;
let allModals = [];

// Initialize modals when DOM is ready
function initializeModals() {
    uploadModal = document.getElementById("uploadModal");
    loginModal = document.getElementById("loginModal");
    registerModal = document.getElementById("registerModal");
    langPopup = document.getElementById("language-popup");
    joinSessionModal = document.getElementById("joinSessionModal");
    createSessionModal = document.getElementById("createSessionModal");
    shareNotesModal = document.getElementById("shareNotesModal");
    chatInterfaceModal = document.getElementById("chatInterfaceModal");

    allModals = [
    uploadModal, loginModal, registerModal,
    joinSessionModal, createSessionModal,
    shareNotesModal, chatInterfaceModal
    ].filter(m => m !== null); // Filter out null elements
    
    // Debug: Log if modals are found
    if (!loginModal) console.warn('loginModal not found');
    if (!registerModal) console.warn('registerModal not found');
}

// Try to initialize immediately if DOM is ready
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded, initialize now
    initializeModals();
}

// --- Core Modal Handling Functions ---

function openModal(modalElement) {
    if (!modalElement) {
        console.error('Modal element not found');
        return;
    }
    // Closes all other modals first, then opens the requested one
    allModals.forEach(m => {
        if (m) m.style.display = 'none';
    });
    modalElement.style.display = "block";
}

function closeModal(modalElement) {
    if (modalElement) {
    modalElement.style.display = "none";
    }
}

// Close modal on outside click
window.onclick = function(event) {
    // Initialize modals if not already done
    if (allModals.length === 0) {
        initializeModals();
    }
    
    // 1. Close Modals
    allModals.forEach(modal => {
        if (modal && event.target === modal) {
            closeModal(modal);
        }
    });

    // 2. Close Language Pop-up
    if (!langPopup) initializeModals();
    const langBtn = document.getElementById("mylang");
    if (langPopup && langBtn && event.target !== langBtn && !langBtn.contains(event.target) && event.target !== langPopup && !langPopup.contains(event.target)) {
        langPopup.style.display = "none";
    }
}


// --- Authentication (Login/Register) Functions ---

function openLoginModal() { 
    if (!loginModal) initializeModals();
    if (loginModal) {
        openModal(loginModal);
    } else {
        console.error('Login modal element not found');
        alert('Error: Login modal not found. Please refresh the page.');
    }
}
function closeLoginModal() { 
    if (!loginModal) initializeModals();
    if (loginModal) {
        closeModal(loginModal);
    }
}

function openRegisterModal() { 
    if (!registerModal) initializeModals();
    if (registerModal) {
        openModal(registerModal);
    } else {
        console.error('Register modal element not found');
        alert('Error: Register modal not found. Please refresh the page.');
    }
}
function closeRegisterModal() { 
    if (!registerModal) initializeModals();
    if (registerModal) {
        closeModal(registerModal);
    }
}

// Switch between Login and Register Modals
function switchModalToRegister() {
    closeLoginModal();
    openRegisterModal();
}

function switchModalToLogin() {
    closeRegisterModal();
    openLoginModal();
}

// Store users in localStorage
function getStoredUsers() {
    const users = localStorage.getItem('notehive_users');
    return users ? JSON.parse(users) : [];
}

function saveUser(userData) {
    const users = getStoredUsers();
    users.push(userData);
    localStorage.setItem('notehive_users', JSON.stringify(users));
}

function findUser(emailOrUsername, password) {
    const users = getStoredUsers();
    return users.find(user => 
        (user.email === emailOrUsername || user.username === emailOrUsername) &&
        user.password === password
    );
}

function loginUser() {
    const emailOrUsername = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorDiv = document.getElementById("login-error");

    // Clear previous errors
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    if (!emailOrUsername || !password) {
        errorDiv.textContent = "Please enter both email/username and password.";
        errorDiv.style.display = 'block';
        return;
    }

    // Find user
    const user = findUser(emailOrUsername, password);

    if (!user) {
        errorDiv.textContent = "Invalid email/username or password. Please try again.";
        errorDiv.style.display = 'block';
        return;
    }

    // Login successful
        isUserLoggedIn = true;
    
    // Store current user in session
    localStorage.setItem('notehive_current_user', JSON.stringify({
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role
    }));

    // Close modal
        closeLoginModal();

    // Redirect based on role
    if (user.role === 'teacher') {
        alert(`Login successful! Welcome back, ${user.fullName}. Redirecting to Teacher Dashboard...`);
        window.location.href = 'index.html';
    } else if (user.role === 'student') {
        alert(`Login successful! Welcome back, ${user.fullName}. Redirecting to Student Dashboard...`);
        window.location.href = 'studindex.html.html';
    } else {
        alert(`Login successful! Welcome back, ${user.fullName}.`);
    }
}

function registerUser() {
    const fullName = document.getElementById("register-fullname").value.trim();
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const dob = document.getElementById("register-dob").value;
    const gender = document.getElementById("register-gender").value;
    const role = document.getElementById("register-role").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;
    const errorDiv = document.getElementById("register-error");

    // Clear previous errors
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Validation
    if (!fullName || !username || !email || !dob || !gender || !role || !password || !confirmPassword) {
        errorDiv.textContent = "Please fill in all required fields.";
        errorDiv.style.display = 'block';
        return;
    }

    if (password.length < 8) {
        errorDiv.textContent = "Password must be at least 8 characters long.";
        errorDiv.style.display = 'block';
        return;
    }

    if (password !== confirmPassword) {
        errorDiv.textContent = "Passwords do not match. Please try again.";
        errorDiv.style.display = 'block';
        return;
    }

    if (username.length < 3) {
        errorDiv.textContent = "Username must be at least 3 characters long.";
        errorDiv.style.display = 'block';
        return;
    }

    // Check if email or username already exists
    const users = getStoredUsers();
    const emailExists = users.some(user => user.email === email);
    const usernameExists = users.some(user => user.username === username);

    if (emailExists) {
        errorDiv.textContent = "An account with this email already exists.";
        errorDiv.style.display = 'block';
        return;
    }

    if (usernameExists) {
        errorDiv.textContent = "This username is already taken. Please choose another.";
        errorDiv.style.display = 'block';
        return;
    }

    // Create user object
    const userData = {
        fullName: fullName,
        username: username,
        email: email,
        dob: dob,
        gender: gender,
        role: role,
        password: password, // In production, this should be hashed
        registeredAt: new Date().toISOString()
    };

    // Save user
    saveUser(userData);

    // Set as logged in
        isUserLoggedIn = true;

    // Store current user in session
    localStorage.setItem('notehive_current_user', JSON.stringify({
        fullName: fullName,
        username: username,
        email: email,
        role: role
    }));

    // Close modal
        closeRegisterModal();

    // Show success message and redirect
    if (role === 'teacher') {
        alert(`Account created successfully for ${fullName}! Starting your 7-day free trial. Redirecting to Teacher Dashboard...`);
        window.location.href = 'index.html';
    } else if (role === 'student') {
        alert(`Account created successfully for ${fullName}! Starting your 7-day free trial. Redirecting to Student Dashboard...`);
        window.location.href = 'studindex.html.html';
    } else {
        alert(`Account created successfully for ${fullName}! Starting your 7-day free trial.`);
    }
}

function logout() {
    isUserLoggedIn = false;
    localStorage.removeItem('notehive_current_user');
    alert("You have been successfully logged out.");
    // Redirect to home page
    window.location.href = 'softwareproject.html';
}


// --- Language Selector Pop-up ---

function toggleLanguagePopup() {
    langPopup.style.display = (langPopup.style.display === "block") ? "none" : "block";
}

function selectLanguage(language) {
    // Simple alert function to confirm selection
    alert(`Language changed to ${language}.`);
    toggleLanguagePopup();
}


// --- Study Session Functions (with Login Check) ---

function openJoinSessionModal() {
    if (!isUserLoggedIn) {
        alert("Please login or register to join a study session.");
        openLoginModal();
        return;
    }
    openModal(joinSessionModal);
}
function closeJoinSessionModal() { closeModal(joinSessionModal); }

function openCreateSessionModal() {
    if (!isUserLoggedIn) {
        alert("Please login or register to create a study session.");
        openLoginModal();
        return;
    }
    openModal(createSessionModal);
}
function closeCreateSessionModal() { closeModal(createSessionModal); }

function joinSession() {
    const sessionId = document.getElementById("session-id").value;
    if (sessionId) {
        alert(`Launching video call... Joining session: ${sessionId}.`);
        closeJoinSessionModal();
    } else {
        alert("Please enter a Session ID.");
    }
}

function startInstantSession() {
    const topic = document.getElementById("session-topic").value || "Untitled Session";
    alert(`Starting instant session for: ${topic}... (Link copied to clipboard).`);
    closeCreateSessionModal();
}

function scheduleSession() {
    const topic = document.getElementById("session-topic").value || "Untitled Session";
    alert(`Scheduling session for: ${topic}... Opening calendar interface!`);
    closeCreateSessionModal();
}


// --- Share Notes and Chat Functions (with Login Check) ---

function openShareNotesModal() {
    if (!isUserLoggedIn) {
        alert("Please login or register to share notes.");
        openLoginModal();
        return;
    }
    openModal(shareNotesModal);
}
function closeShareNotesModal() { closeModal(shareNotesModal); }

function shareNotes() {
    const note = document.getElementById("note-select").value;
    const target = document.getElementById("share-target").value;
    if (note && target) {
        alert(`Note "${note}" successfully shared with ${target}!`);
        closeShareNotesModal();
    } else {
        alert("Please select a note and enter a recipient.");
    }
}

function openChatInterfaceModal() {
    if (!isUserLoggedIn) {
        alert("Please login or register to open the chat.");
        openLoginModal();
        return;
    }
    openModal(chatInterfaceModal);
}
function closeChatInterfaceModal() { closeModal(chatInterfaceModal); }

function sendMessage() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();
    if (message) {
        // Simulation: add message to the chat window
        const chatWindow = document.querySelector('.chat-window');
        const newMessage = document.createElement('div');
        newMessage.className = 'message outgoing';
        newMessage.innerHTML = `<span>[${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}] You:</span> ${message}`;
        chatWindow.appendChild(newMessage);

        chatWindow.scrollTop = chatWindow.scrollHeight;

        input.value = '';
        input.focus();
    }
}


// --- Original Upload Notes and Search Functions (with Login Check) ---

function openUploadModal() {
    if (!isUserLoggedIn) {
        alert("Please login or register to upload notes.");
        openLoginModal();
        return;
    }
    openModal(uploadModal);
}
function closeUploadModal() { closeModal(uploadModal); }

function uploadNotes(event) {
    event.preventDefault();
    const title = document.getElementById("title").value;
    const file = document.getElementById("fileUpload").files[0];
    if (title && file) {
        alert("Notes uploaded successfully!");
        document.getElementById("uploadForm").reset();
        closeUploadModal();
    } else {
        alert("Please fill in the title and select a file.");
    }
}

function search() {
    const query = document.getElementById("searchQuery").value;
    alert("Searching for: " + query);
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize modals when DOM is ready
  initializeModals();
  
  const container = document.querySelector('.feature-container');
  const leftArrow = document.querySelector('.arrow.left');
  const rightArrow = document.querySelector('.arrow.right');

  if (container && rightArrow && leftArrow) {
  rightArrow.addEventListener('click', () => {
    container.scrollBy({ left: 300, behavior: 'smooth' });
  });

  leftArrow.addEventListener('click', () => {
    container.scrollBy({ left: -300, behavior: 'smooth' });
  });
  }
});
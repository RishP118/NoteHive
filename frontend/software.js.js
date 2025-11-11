// --- Global State for Demonstration ---
let isUserLoggedIn = false; // Tracks login status (Starts false)

// --- Modal Definitions ---
const uploadModal = document.getElementById("uploadModal");
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const langPopup = document.getElementById("language-popup");
const joinSessionModal = document.getElementById("joinSessionModal");
const createSessionModal = document.getElementById("createSessionModal");
const shareNotesModal = document.getElementById("shareNotesModal");
const chatInterfaceModal = document.getElementById("chatInterfaceModal");

const allModals = [
    uploadModal, loginModal, registerModal,
    joinSessionModal, createSessionModal,
    shareNotesModal, chatInterfaceModal
];


// --- Core Modal Handling Functions ---

function openModal(modalElement) {
    // Closes all other modals first, then opens the requested one
    allModals.forEach(m => m.style.display = 'none');
    modalElement.style.display = "block";
}

function closeModal(modalElement) {
    modalElement.style.display = "none";
}

// Close modal on outside click
window.onclick = function(event) {
    // 1. Close Modals
    allModals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });

    // 2. Close Language Pop-up
    const langBtn = document.getElementById("mylang");
    if (event.target !== langBtn && !langBtn.contains(event.target) && event.target !== langPopup && !langPopup.contains(event.target)) {
        langPopup.style.display = "none";
    }
}


// --- Authentication (Login/Register) Functions ---

function openLoginModal() { openModal(loginModal); }
function closeLoginModal() { closeModal(loginModal); }

function openRegisterModal() { openModal(registerModal); }
function closeRegisterModal() { closeModal(registerModal); }

// Switch between Login and Register Modals
function switchModalToRegister() {
    closeLoginModal();
    openRegisterModal();
}

function switchModalToLogin() {
    closeRegisterModal();
    openLoginModal();
}

function loginUser() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (email && password) {
        isUserLoggedIn = true;
        alert(`Login successful! Welcome back, ${email}.`);
        closeLoginModal();
    } else {
        alert("Please enter both email/ID and password.");
    }
}

function registerUser() {
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    if (name && email && password.length >= 8) {
        isUserLoggedIn = true;
        alert(`Account created successfully for ${name}! Starting your 7-day free trial.`);
        closeRegisterModal();
    } else {
        alert("Please fill in all fields correctly (Password must be at least 8 characters).");
    }
}

function logout() {
    isUserLoggedIn = false;
    alert("You have been successfully logged out.");
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
  const container = document.querySelector('.feature-container');
  const leftArrow = document.querySelector('.arrow.left');
  const rightArrow = document.querySelector('.arrow.right');

  rightArrow.addEventListener('click', () => {
    container.scrollBy({ left: 300, behavior: 'smooth' });
  });

  leftArrow.addEventListener('click', () => {
    container.scrollBy({ left: -300, behavior: 'smooth' });
  });
});
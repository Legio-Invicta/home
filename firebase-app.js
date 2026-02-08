// ================================
// FIREBASE CONFIGURATION
// ================================
// IMPORTANT: Replace these values with your own Firebase project credentials
// Get them from: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "AIzaSyDyeeQ_qm0Bw1Y_YWzzzJD1Ctv6GXF38r8",
  authDomain: "legio-invicta.firebaseapp.com",
  databaseURL: "https://legio-invicta-default-rtdb.firebaseio.com",
  projectId: "legio-invicta",
  storageBucket: "legio-invicta.firebasestorage.app",
  messagingSenderId: "196689069677",
  appId: "1:196689069677:web:5a7ef8b804d78f49382164",
  measurementId: "G-4NZND2DY1T"
};

// ================================
// INITIALIZE FIREBASE
// ================================
let app, auth, database;
let currentUser = null;
let currentNoteId = null;
let chatDataSize = 0;
const MAX_CHAT_SIZE_KB = 500;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    database = firebase.database();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    showAuthStatus('Configuration Error - Check README', 'error');
}

// ================================
// AUTHENTICATION
// ================================
function initializeAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            showAuthStatus('Connected', 'connected');
            document.getElementById('userInfo').textContent = `User: ${user.uid.substring(0, 8)}`;
            
            // Initialize features after auth
            initializeBulletinBoard();
            initializeChat();
            updateOnlineStatus(true);
        } else {
            // Sign in anonymously
            auth.signInAnonymously()
                .then(() => {
                    console.log('Signed in anonymously');
                })
                .catch((error) => {
                    console.error('Auth error:', error);
                    showAuthStatus('Authentication Failed', 'error');
                });
        }
    });
}

function showAuthStatus(message, status) {
    const statusEl = document.getElementById('authStatus');
    statusEl.textContent = message;
    statusEl.className = status;
}

function updateOnlineStatus(online) {
    if (!currentUser) return;
    
    const userStatusRef = database.ref('users/' + currentUser.uid);
    
    if (online) {
        userStatusRef.set({
            online: true,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Set offline on disconnect
        userStatusRef.onDisconnect().set({
            online: false,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
    }
}

// ================================
// BULLETIN BOARD MANAGEMENT
// ================================
const boardRef = database.ref('bulletinBoard/notes');
let notesCache = {};

function initializeBulletinBoard() {
    // Listen for board changes
    boardRef.on('value', (snapshot) => {
        notesCache = snapshot.val() || {};
        renderBulletinBoard();
        renderEditorBoard();
    });
    
    // Setup editor button
    document.getElementById('editBoardBtn').addEventListener('click', () => {
        document.getElementById('mainMenu').classList.remove('active');
        document.getElementById('board-editor').classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Setup add note button
    document.getElementById('addNoteBtn').addEventListener('click', createNewNote);
    
    // Setup modal
    setupNoteModal();
}

function renderBulletinBoard() {
    const boardEl = document.getElementById('bulletinBoard');
    const notes = Object.entries(notesCache);
    
    if (notes.length === 0) {
        boardEl.innerHTML = '<div class="board-empty-state"><p>No announcements yet. Click "Edit Board" to add notes.</p></div>';
        return;
    }
    
    boardEl.innerHTML = '';
    
    notes.forEach(([id, note]) => {
        const noteEl = createNoteElement(id, note, false);
        boardEl.appendChild(noteEl);
    });
}

function renderEditorBoard() {
    const boardEl = document.getElementById('editorBoard');
    const notes = Object.entries(notesCache);
    
    if (notes.length === 0) {
        boardEl.innerHTML = '<div class="editor-empty-state"><p>Click "Add New Note" to create your first announcement</p></div>';
        return;
    }
    
    boardEl.innerHTML = '';
    
    notes.forEach(([id, note]) => {
        const noteEl = createNoteElement(id, note, true);
        boardEl.appendChild(noteEl);
    });
}

function createNoteElement(id, note, editable) {
    const noteEl = document.createElement('div');
    noteEl.className = `note ${note.size || 'medium'} bg-${note.background || 'parchment'}`;
    noteEl.style.left = note.x + 'px';
    noteEl.style.top = note.y + 'px';
    noteEl.style.backgroundColor = note.color || '#f4e4c1';
    noteEl.dataset.noteId = id;
    
    const header = document.createElement('div');
    header.className = 'note-header';
    
    const title = document.createElement('h4');
    title.className = 'note-title';
    title.textContent = note.title || 'Untitled';
    
    header.appendChild(title);
    
    if (editable) {
        const actions = document.createElement('div');
        actions.className = 'note-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'note-action-btn';
        editBtn.innerHTML = '✎';
        editBtn.title = 'Edit';
        editBtn.onclick = () => openNoteEditor(id);
        
        actions.appendChild(editBtn);
        header.appendChild(actions);
        
        // Make draggable in editor
        makeDraggable(noteEl, id);
    }
    
    const content = document.createElement('div');
    content.className = 'note-content';
    content.textContent = note.content || '';
    
    const footer = document.createElement('div');
    footer.className = 'note-footer';
    const date = note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : 'Unknown date';
    footer.textContent = `Updated: ${date}`;
    
    noteEl.appendChild(header);
    noteEl.appendChild(content);
    noteEl.appendChild(footer);
    
    return noteEl;
}

function makeDraggable(element, noteId) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    function dragStart(e) {
        if (e.target.classList.contains('note-action-btn')) return;
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        if (e.target === element || e.target.closest('.note-header')) {
            isDragging = true;
            element.classList.add('dragging');
        }
    }
    
    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            xOffset = currentX;
            yOffset = currentY;
            
            setTranslate(currentX, currentY, element);
        }
    }
    
    function dragEnd(e) {
        if (isDragging) {
            isDragging = false;
            element.classList.remove('dragging');
            
            // Save position to Firebase
            const rect = element.getBoundingClientRect();
            const parent = element.parentElement.getBoundingClientRect();
            
            const x = Math.max(0, rect.left - parent.left);
            const y = Math.max(0, rect.top - parent.top);
            
            database.ref(`bulletinBoard/notes/${noteId}`).update({
                x: x,
                y: y
            });
            
            // Reset transform
            element.style.transform = 'none';
            element.style.left = x + 'px';
            element.style.top = y + 'px';
            xOffset = 0;
            yOffset = 0;
        }
    }
    
    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
}

function createNewNote() {
    const template = document.getElementById('templateSelect').value;
    const color = document.getElementById('noteColor').value;
    
    const newNote = {
        title: 'New Note',
        content: 'Click edit to add content',
        x: Math.random() * 200,
        y: Math.random() * 200,
        size: 'medium',
        background: template,
        color: color,
        createdBy: currentUser.uid,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    const newNoteRef = boardRef.push();
    newNoteRef.set(newNote)
        .then(() => {
            console.log('Note created successfully');
            openNoteEditor(newNoteRef.key);
        })
        .catch((error) => {
            console.error('Error creating note:', error);
            alert('Failed to create note. Please try again.');
        });
}

// ================================
// NOTE EDITOR MODAL
// ================================
function setupNoteModal() {
    const modal = document.getElementById('noteModal');
    const closeButtons = modal.querySelectorAll('.modal-close');
    const saveBtn = document.getElementById('saveNoteBtn');
    const deleteBtn = document.getElementById('deleteNoteBtn');
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeNoteModal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeNoteModal();
        }
    });
    
    saveBtn.addEventListener('click', saveNote);
    deleteBtn.addEventListener('click', deleteNote);
}

function openNoteEditor(noteId) {
    currentNoteId = noteId;
    const note = notesCache[noteId];
    
    if (!note) return;
    
    document.getElementById('noteTitle').value = note.title || '';
    document.getElementById('noteContent').value = note.content || '';
    document.getElementById('noteBackground').value = note.background || 'parchment';
    document.getElementById('noteColorPicker').value = note.color || '#f4e4c1';
    document.getElementById('noteSize').value = note.size || 'medium';
    
    document.getElementById('noteModal').classList.add('active');
}

function closeNoteModal() {
    document.getElementById('noteModal').classList.remove('active');
    currentNoteId = null;
}

function saveNote() {
    if (!currentNoteId) return;
    
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const background = document.getElementById('noteBackground').value;
    const color = document.getElementById('noteColorPicker').value;
    const size = document.getElementById('noteSize').value;
    
    database.ref(`bulletinBoard/notes/${currentNoteId}`).update({
        title: title,
        content: content,
        background: background,
        color: color,
        size: size,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        console.log('Note updated successfully');
        closeNoteModal();
    })
    .catch((error) => {
        console.error('Error updating note:', error);
        alert('Failed to update note. Please try again.');
    });
}

function deleteNote() {
    if (!currentNoteId) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
        database.ref(`bulletinBoard/notes/${currentNoteId}`).remove()
            .then(() => {
                console.log('Note deleted successfully');
                closeNoteModal();
            })
            .catch((error) => {
                console.error('Error deleting note:', error);
                alert('Failed to delete note. Please try again.');
            });
    }
}

// ================================
// CHAT SYSTEM
// ================================
const chatRef = database.ref('chat/messages');
const chatMetaRef = database.ref('chat/meta');
let messagesCache = {};

function initializeChat() {
    // Listen for new messages
    chatRef.on('value', (snapshot) => {
        messagesCache = snapshot.val() || {};
        renderChatMessages();
        checkChatSize();
    });
    
    // Setup chat input
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Update online count
    updateOnlineCount();
}

function renderChatMessages() {
    const messagesEl = document.getElementById('chatMessages');
    const messages = Object.entries(messagesCache).sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    if (messages.length === 0) {
        messagesEl.innerHTML = `
            <div class="chat-welcome">
                <p>Welcome to Legio Invicta Chat</p>
                <p class="chat-guidelines">Be respectful and follow alliance rules</p>
            </div>
        `;
        return;
    }
    
    // Keep scroll position
    const wasScrolledToBottom = messagesEl.scrollHeight - messagesEl.clientHeight <= messagesEl.scrollTop + 1;
    
    messagesEl.innerHTML = '';
    
    messages.forEach(([id, message]) => {
        const messageEl = createMessageElement(message);
        messagesEl.appendChild(messageEl);
    });
    
    // Auto-scroll to bottom if was at bottom
    if (wasScrolledToBottom) {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
}

function createMessageElement(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';
    
    if (message.userId === currentUser.uid) {
        messageEl.classList.add('own-message');
    }
    
    const header = document.createElement('div');
    header.className = 'message-header';
    
    const author = document.createElement('span');
    author.className = 'message-author';
    author.textContent = message.author || 'Anonymous';
    
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTime(message.timestamp);
    
    header.appendChild(author);
    header.appendChild(time);
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = message.text;
    
    messageEl.appendChild(header);
    messageEl.appendChild(content);
    
    return messageEl;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const message = {
        text: text,
        author: `User ${currentUser.uid.substring(0, 6)}`,
        userId: currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    chatRef.push(message)
        .then(() => {
            input.value = '';
            console.log('Message sent');
        })
        .catch((error) => {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        });
}

function checkChatSize() {
    // Calculate approximate size of chat data
    const dataStr = JSON.stringify(messagesCache);
    const sizeKB = new Blob([dataStr]).size / 1024;
    
    chatDataSize = sizeKB;
    
    if (sizeKB > MAX_CHAT_SIZE_KB) {
        // Delete oldest messages
        const messages = Object.entries(messagesCache).sort((a, b) => a[1].timestamp - b[1].timestamp);
        const deleteCount = Math.ceil(messages.length * 0.2); // Delete oldest 20%
        
        const deletePromises = messages.slice(0, deleteCount).map(([id]) => {
            return chatRef.child(id).remove();
        });
        
        Promise.all(deletePromises)
            .then(() => {
                console.log(`Cleaned up ${deleteCount} old messages`);
            })
            .catch((error) => {
                console.error('Error cleaning messages:', error);
            });
    }
}

function updateOnlineCount() {
    const usersRef = database.ref('users');
    
    usersRef.on('value', (snapshot) => {
        const users = snapshot.val() || {};
        const onlineCount = Object.values(users).filter(u => u.online).length;
        document.getElementById('onlineCount').textContent = `${onlineCount} online`;
    });
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
}

// ================================
// INITIALIZE ON LOAD
// ================================
document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is configured
    if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
        showAuthStatus('Not Configured - See README', 'error');
        document.getElementById('userInfo').textContent = 'Setup Required';
        
        // Show configuration message
        const authBar = document.querySelector('.auth-bar');
        authBar.style.background = '#8b0000';
        authBar.style.padding = '1rem 0';
        
        console.error(`
╔═══════════════════════════════════════════════════════════════╗
║                   FIREBASE NOT CONFIGURED                      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                ║
║  Please follow the setup instructions in FIREBASE-SETUP.md    ║
║                                                                ║
║  1. Create a Firebase project                                 ║
║  2. Enable Realtime Database                                  ║
║  3. Copy your configuration                                   ║
║  4. Replace credentials in firebase-app.js                    ║
║                                                                ║
╚═══════════════════════════════════════════════════════════════╝
        `);
        
        return;
    }
    
    // Initialize if configured
    initializeAuth();
});

// ================================
// CLEANUP ON UNLOAD
// ================================
window.addEventListener('beforeunload', () => {
    if (currentUser) {
        updateOnlineStatus(false);
    }
});

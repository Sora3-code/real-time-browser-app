//-----------------------------------------------------------------------
// Setup
//-----------------------------------------------------------------------
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//-----------------------------------------------------------------------
// Game Data & Passwords
//-----------------------------------------------------------------------
const MAIN_INTERMISSION_PASSWORD = 'pleasure';
const ALERT_PASSWORD = 'happiness';

let modals = [
    { id: 0, image: 'images/1.jpg', text: '------- Ishiba Shigeru -------<br>---------- 自然との共生を大事にする事 ----------', takenBy: null, isImportant: false},
    { id: 1, image: 'images/2.jpg', text: '------- Donald Trump -------<br>---------- the Earth is mankind\'s oldest best friend ----------', takenBy: null, isImportant: true},
    { id: 2, image: 'images/3.jpg', text: '------- Suzuki Kenta -------<br>---------- 未来の地球を支えるもの ----------', takenBy: null, isImportant: false},
    { id: 3, image: 'images/4.jpg', text: '------- Ado -------<br>---------- 歌い手にとっても、かけがえのない、すべて ----------', takenBy: null, isImportant: true},
    { id: 4, image: 'images/5.jpg', text: '-------  -------<br>----------  ----------', takenBy: null, isImportant: false},
    { id: 5, image: 'images/6.jpg', text: '-------  -------<br>----------  ----------', takenBy: null, isImportant: false},
    { id: 6, image: 'images/7.JPG', text: '-------  -------<br>----------  ----------', takenBy: null, isImportant: false},
    { id: 7, image: 'images/8.jpg', text: '-------  -------<br>----------  ----------', takenBy: null, isImportant: false},
    { id: 8, image: 'images/9.jpg', text: '-------  -------<br>----------  ----------', takenBy: null, isImportant: false},
    { id: 9, image: 'images/10.jpg', text: '-------  -------<br>----------  ----------', takenBy: null, isImportant: false},
];

//-----------------------------------------------------------------------
// User Database (JSON file)
//-----------------------------------------------------------------------
const USERS_FILE = './users.json';
let users = {}; // This object will hold all user data

// Function to load users from the JSON file
function loadUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE);
            users = JSON.parse(data);
            console.log('User data loaded successfully.');
            // Sync the main `modals` array with the loaded user data
            for (const username in users) {
                const user = users[username];
                user.takenModals.forEach(modalId => {
                    const modal = modals.find(m => m.id === modalId);
                    if (modal) {
                        modal.takenBy = username;
                    }
                });
            }
        } else {
            console.log('No users.json file found. A new one will be created.');
        }
    } catch (err) {
        console.error('Error loading or parsing users.json:', err);
    }
}

// Function to save the current user data to the JSON file
function saveUsers() {
    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
        if (err) {
            console.error('Error saving user data:', err);
        }
    });
}

// Load users when the server starts
loadUsers();

//-----------------------------------------------------------------------
// Middleware
//-----------------------------------------------------------------------
app.use(express.static('public'));

//-----------------------------------------------------------------------
// Socket.IO Connection Handling
//-----------------------------------------------------------------------
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // --- User Registration ---
    socket.on('register', ({ username, password }) => {
        if (users[username]) {
            socket.emit('registerResult', { success: false, message: 'この名前は既に使用されています。' });
        } else {
            users[username] = { password: password, takenModals: [] };
            saveUsers();
            socket.emit('registerResult', { success: true });
            console.log(`New user registered: ${username}`);
        }
    });

    // --- User Login ---
    socket.on('login', ({ username, password }) => {
        const user = users[username];
        if (user && user.password === password) {
            // On successful login, send all necessary data to the client
            socket.emit('loginResult', {
                success: true,
                username: username,
                initialModals: modals, // The current state of ALL modals
                userTakenModalIds: user.takenModals // The IDs of modals taken by THIS user
            });
            console.log(`User logged in: ${username}`);
        } else {
            socket.emit('loginResult', { success: false, message: '名前またはパスワードが間違っています。' });
        }
    });

    // --- Taking a Modal ---
    socket.on('takeModal', ({ modalId, username }) => {
        const modal = modals.find(m => m.id === modalId);
        const user = users[username];

        if (modal && user && modal.takenBy === null) {
            modal.takenBy = username; // Assign modal to the user
            user.takenModals.push(modal.id); // Add modal ID to user's list
            saveUsers(); // Save the change to the file

            io.emit('modalTaken', { modalId: modalId, userId: username });
            console.log(`User ${username} took modal ${modalId}`);

            if (modal.isImportant) {
                const now = new Date();
                const timestamp = now.toLocaleString('ja-JP');
                const logMessage = `${timestamp} - User: ${username} - Item: ${modal.text.replace(/<[^>]*>/g, ' ')}\n`;
                fs.appendFile('important_items.log', logMessage, (err) => {
                    if (err) console.error('Error writing to log:', err);
                });
            }
        }
    });

    // --- In-game Password Checks ---
    socket.on('checkPassword', ({ password, type }) => {
        let isCorrect = false;
        if (type === 'main_intermission' && password === MAIN_INTERMISSION_PASSWORD) {
            isCorrect = true;
        } else if (type === 'alert' && password === ALERT_PASSWORD) {
            isCorrect = true;
        }
        
        if (isCorrect) {
            socket.emit('passwordResult', { success: true, type: type });
        } else {
            socket.emit('passwordResult', { success: false });
        }
    });

    // --- User Info Submission (for important modals) ---
    socket.on('submitUserInfo', (userInfo) => {
        console.log('Received user info:', userInfo);
        const now = new Date();
        const timestamp = now.toLocaleString('ja-JP');
        const logMessage = `
--- User Info Received: ${timestamp} ---
Treasure Name: ${userInfo.treasureName}
Name: ${userInfo.name}
Address: ${userInfo.address}
Age: ${userInfo.age}
School Name: ${userInfo.schoolName}
School TEL: ${userInfo.schoolTEL}
Dream: ${userInfo.dream}
------------------------------------------\n`;
        fs.appendFile('user_info.log', logMessage, (err) => {
            if (err) console.error('Error writing user info to log:', err);
        });
    });

    // --- Disconnection ---
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

//-----------------------------------------------------------------------
// Start Server
//-----------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (*^^)v`);
});

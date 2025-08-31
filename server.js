//-----------------------------------------------------------------------

let fs = require('fs');
let express = require('express');
let http = require('http');
let { Server } = require("socket.io");
//-----------------------------------------------------------------------

let app = express();
let server = http.createServer(app);
let io = new Server(server);
//-----------------------------------------------------------------------

let INITIAL_PASSWORD = 'hope';
//-----------------------------------------------------------------------

let INTERMISSION_PASSWORD = 'pleasure';
//-----------------------------------------------------------------------

let modals = [
    { id: 0, image: 'images/1.jpg', text: '------- Ishiba Shigeru -------<br>---------- 自然との共生を大事にする事 ----------', takenBy: null, isImportant: false},
    { id: 1, image: 'images/2.jpg', text: '------- Donald Trump -------<br>---------- the Earth is mankind\'s oldest best friend ----------', takenBy: null, isImportant: true},
    { id: 2, image: 'images/3.jpg', text: '------- Suzuki Kenta -------<br>---------- 未来の地球を支えるもの ----------', takenBy: null, isImportant: false},
    { id: 3, image: 'images/4.jpg', text: '------- Ado -------<br>---------- 歌い手にとっても、かけがえのない、すべて ----------', takenBy: null, isImportant: true},
    { id: 4, image: 'images/5.jpg', text: '-------  -------<br>----------  ----------', takenBy: null, isImportant: false},
    { id: 5, image: 'images/6.jpg', text: '-------  -------<br>----------  ----------', takenBy: null, isImportant: false},
    { id: 6, image: 'images/7.JPG', text: '-------  -------<br>----------  ----------', takenBy: null, isImportant: false},
    { id: 7, image: 'images/', text: '', takenBy: null, isImportant: false},
    { id: 8, image: 'images/', text: '', takenBy: null, isImportant: false},
    { id: 9, image: 'images/', text: '', takenBy: null, isImportant: false}, //10
];
//-----------------------------------------------------------------------

app.use(express.static('public'));
//-----------------------------------------------------------------------

io.on('connection', (socket) => {
    console.log(`user is connected: ${socket.id}` );
    socket.on('checkPassword', ({ password, type }) => {
        let isCorrect = false;
        if(type === 'initial' && password === INITIAL_PASSWORD) {
            isCorrect = true;
        } else if (type === 'intermission' && password === INTERMISSION_PASSWORD) {
            isCorrect = true;
        }
        if(isCorrect) {
            socket.emit('passwordResult', { success: true });
            if(type === 'initial') {
                socket.emit('initialModals', modals);
            }
        } else {
            socket.emit('passwordResult', { success: false });
        }
    });
    socket.on('takeModal', (modalId) => {
        let modal = modals.find(m => m.id === modalId);
        if (modal && modal.takenBy === null) {
            modal.takenBy = socket.id;
            console.log(`user ${socket.id} is modal ${modalId} Get.`);
            io.emit('modalTaken', { modalId: modalId, userId: socket.id });
            if(modal.isImportant) {
                let now = new Date();
                let timestamp = now.toLocaleString('ja-JP');
                let logMessage = `${timestamp} - ${modal.text.replace(/<[^>]*>/g, ' ')}\n`;
                fs.appendFile('important_items.log', logMessage, (err) => {
                    if(err) {
                        console.error('writing Error.', err);
                    } else {
                        console.log('Important modal log is success.');
                    }
                });
            }
        }
    });
    socket.on('disconnect', () => {
        console.log(`user is disconnected: ${socket.id}`);
    });
});
//-----------------------------------------------------------------------

let PORT = process.env.PORT || 3000;
//-----------------------------------------------------------------------

server.listen(PORT, () => {
    console.log(`server start ${PORT} (*^^)v`);
});
//-----------------------------------------------------------------------

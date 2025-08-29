//-----------------------------------------------------------------------

let express = require('express');
let http = require('http');
let { Server } = require("socket.io");
//-----------------------------------------------------------------------

let app = express();
let server = http.createServer(app);
let io = new Server(server);
//-----------------------------------------------------------------------

let TOTAL_MODALS = 10;
//-----------------------------------------------------------------------

let CORRECT_PASSWORD = 'hope';
//-----------------------------------------------------------------------

let modals = [
    { id: 0, image: 'images/1.jpg', text: '------- Ishiba Shigeru -------\n---------- 自然との共生を大事にする事 ----------', takenBy: null, password:'a',isImportant:false},
    { id: 1, image: 'images/2.jpg', text: '------- Donald Trump -------\n---------- the Earth is mankind`s oldest best friend ----------', takenBy: null, password:'a',isImportant:true},
    { id: 2, image: 'images/3.jpg', text: '------- Suzuki Kenta -------\n---------- 未来の地球を支えるもの ----------', takenBy: null, password:'a', isImportant:false},
    { id: 3, image: 'images/4.jpg', text: '------- Ado -------\n---------- 歌い手にとっても、かけがえのない、すべて ----------', takenBy: null, password:'a', isImportant:true},
    { id: 4, image: 'images/5.jpg', text: '-------  -------\n----------  ----------', takenBy: null, password:'a', isImportant:false},
    { id: 5, image: 'images/6.jpg', text: '-------  -------\n----------  ----------', takenBy: null, password:'a', isImportant:false},
    { id: 6, image: 'images/7.JPG', text: '-------  -------\n----------  ----------', takenBy: null, password:'a', isImportant:false},
    { id: 7, image: 'images/', text: '', takenBy: null,password:'a', isImportant:false},
    { id: 8, image: 'images/', text: '', takenBy: null,password:'a', isImportant:false},
    { id: 9, image: 'images/', text: '', takenBy: null,password:'a', isImportant:false}, //10
];
//-----------------------------------------------------------------------

app.use(express.static('public'));
//-----------------------------------------------------------------------

io.on('connection', (socket) => {
    console.log(`user is connected: ${socket.id}` );
    socket.on('checkPassword', (submittedPassword) => {
        if(submittedPassword === CORRECT_PASSWORD) {
            socket.emit('passwordResult', {success: true});
            socket.emit('initialModals', modals);
        } else {
            socket.emit('passwordResult', {success: false});
        }
    });
    socket.on('takeModal', (modalId) => {
        let modal = modals.find(m => m.id === modalId);
        if (modal && modal.takenBy === null) {
            modal.takenBy = socket.id;
            console.log(`user ${socket.id} is modal ${modalId} Get.`);
            io.emit('modalTaken', { modalId: modalId, userId: socket.id });
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

//-----------------------------------------------------------------------

let socket = io();  //localhost用
//let socket = io('https://real-time-browser-app.onrender.com'); //render用
//-----------------------------------------------------------------------

let startButton = document.getElementById('start-button');
let loginForm = document.getElementById('login-form');
let passwordInput = document.getElementById('password-input');
let loginButton = document.getElementById('login-button');
let gameArea = document.getElementById('game-area');
let remainingCountElement = document.getElementById('remaining-count');
let getItemButton = document.getElementById('get-item-button');
let myItemsContainer = document.getElementById('my-items');
//-----------------------------------------------------------------------

let myId = '';
//-----------------------------------------------------------------------

let allModals = [];
//-----------------------------------------------------------------------

let myTakenModals = [];
//-----------------------------------------------------------------------

socket.on('connect', () => {
    myId = socket.id;
    console.log(`server connected. Your ID: ${myId}.`);
});
//-----------------------------------------------------------------------
//Game start.
//-----------------------------------------------------------------------

startButton.addEventListener('click', () => {
    startButton.classList.add('hidden');
    loginForm.classList.remove('hidden');
});
loginButton.addEventListener('click', () => {
    socket.emit('checkPassword', passwordInput.value);
});
getItemButton.addEventListener('click', () => {
    let nextModal = allModals.find(modal => modal.takenBy === null);
    if(nextModal) {
        socket.emit('takeModal', nextModal.id);
    }
});
socket.on('passwordResult', (result) => {
    if(result.success) {
        loginForm.classList.add('hidden');
        gameArea.classList.remove('hidden');
        myItemsContainer.classList.remove('hidden');
        initializeGame();
    } else {
        alert('password is false.');
        passwordInput.value = '';
    }
});
//-----------------------------------------------------------------------

function initializeGame() {
    socket.on('initialModals', (initialModals) => {
        allModals = initialModals;
        myTakenModals = allModals.filter(m => m.takenBy === myId);
        updateRemainingCount();
        updateMyItemsList();
    });
    socket.on('modalTaken', ({modalId, userId}) => {
        console.log(`user ${userId} is taked modal ${modalId}.`);
        let takenModal = allModals.find(m => m.id === modalId);
        if(takenModal) {
            takenModal.takenBy = userId;
            if(userId === myId) {
                myTakenModals.push(takenModal);
                updateMyItemsList();
            }
            updateRemainingCount();
        }
    });  
}
//-----------------------------------------------------------------------

function updateRemainingCount() {
    let remaining = allModals.filter(modal => modal.takenBy === null).length;
    remainingCountElement.textContent = `残り: ${remaining}個.`;
    if(remaining === 0) {
        getItemButton.disabled = true;
        getItemButton.textContent = '終了';
    }
};
//-----------------------------------------------------------------------

function updateMyItemsList() {
    myItemsContainer.innerHTML = '<h2>あなたが取得したアイテム.</h2>';
    if(myTakenModals.length === 0) {
        myItemsContainer.innerHTML += '<p>まだありません.</p>';
        return;
    }
    let itemsGrid = document.createElement('div');
    itemsGrid.className = 'items-grid';
    myTakenModals.sort((a, b) => a.id - b.id);
    myTakenModals.forEach(modal => {
        let itemcard = document.createElement('div');
        itemcard.className = 'item-card';
        itemcard.innerHTML = `<img src="${modal.image}"><p>${modal.text}</p>`;
        itemsGrid.appendChild(itemcard);
    });
    myItemsContainer.appendChild(itemsGrid);
};
//-----------------------------------------------------------------------





//-----------------------------------------------------------------------

let socket = io();  //localhost用
//let socket = io('https://real-time-browser-app.onrender.com'); //render用
//-----------------------------------------------------------------------

let startButton = document.getElementById('start-button');
let loginForm = document.getElementById('login-form');
let initialLoginTitle = document.getElementById('initial-login-title');
let intermissionTitle = document.getElementById('intermission-title');
let passwordInput = document.getElementById('password-input');
let loginButton = document.getElementById('login-button');
let gameArea = document.getElementById('game-area');
let remainingCountElement = document.getElementById('remaining-count');
let getItemButton = document.getElementById('get-item-button');
let myItemsContainer = document.getElementById('my-items');
let backToTopButton = document.getElementById('back-to-top-button');
let customAlert = document.getElementById('custom-alert');
let alertPasswordInput = document.getElementById('alert-password-input');
let alertLoginButton = document.getElementById('alert-login-button');
let userInfoCountainer = document.getElementById('user-info-countainer');
let treasureName = document.getElementById('treasure-name');
let userName = document.getElementById('user-name');
let userAddress = document.getElementById('user-address');
let userAge = document.getElementById('user-age');
let schoolName = document.getElementById('school-name');
let schoolTEL = document.getElementById('school-tel');
let userDream = document.getElementById('user-dream');
let submitUserInfoButton = document.getElementById('submit-user-info');
//-----------------------------------------------------------------------

let myId = '';
//-----------------------------------------------------------------------

let allModals = [];
//-----------------------------------------------------------------------

let myTakenModals = [];
//-----------------------------------------------------------------------

let isInitialLogin = true;
//-----------------------------------------------------------------------
//Game start.
//-----------------------------------------------------------------------

startButton.addEventListener('click', () => {
    startButton.classList.add('hidden');
    loginForm.classList.remove('hidden');
});
loginButton.addEventListener('click', () => {
    let password = passwordInput.value;
    let type = isInitialLogin ? 'initial' : 'main_intermission';
    socket.emit('checkPassword', { password: password, type: type });
});
alertLoginButton.addEventListener('click', () => {
    let password = alertPasswordInput.value;
    socket.emit('checkPassword', { password: password, type: 'alert' });
});
submitUserInfoButton.addEventListener('click', () => {
    let userInfo = {
        treasureName: treasureName.value,
        name: userName.value,
        address: userAddress.value,
        age: userAge.value,
        schoolName: schoolName.value,
        schoolTEL: schoolTEL.value,
        dream: userDream.value
    };
    socket.emit('submitUserInfo', userInfo);
    userInfoCountainer.classList.add('hidden');
    getItemButton.disabled = false;
    getItemButton.focus();
    treasureName.value = '';
    userName.value = '';
    userAddress.value = '';
    userAge.value = '';
    schoolName.value = '';
    schoolTEL.value = '';
    userDream.value = '';
    alert('thanks to Input. Next treasure is collecting.');
});
backToTopButton.addEventListener('click', () => {
    let targetForm = document.getElementById('password-input');
    if(targetForm) {
        targetForm.focus();
        targetForm.scrollIntoView({ behavior: 'smooth' });
    }
});
getItemButton.addEventListener('click', () => {
    let nextModal = allModals.find(modal => modal.takenBy === null);
    if(nextModal) {
        getItemButton.disabled = true;
        socket.emit('takeModal', nextModal.id);
    }
});
socket.on('connect', () => {
    myId = socket.id;
    console.log(`server connected. Your ID: ${myId}.`);
});
socket.on('passwordResult', (result) => {
    if(result.success) {
        if(result.type === 'initial') {
            loginForm.classList.add('hidden');
            gameArea.classList.remove('hidden');
            myItemsContainer.classList.remove('hidden');
            initializeGame();
            isInitialLogin = false;
        } else if (result.type === 'main_intermission') {
            loginForm.classList.add('hidden');
            getItemButton.disabled = false;
        } else if (result.type === 'alert') {
            customAlert.classList.add('hidden');
            userInfoCountainer.classList.remove('hidden');
            userInfoCountainer.scrollIntoView({ behavior: 'smooth' });
            treasureName.focus();
        }
        passwordInput.value = '';
        alertPasswordInput.value = '';
    } else {
        alert('password is false.');
        passwordInput.value = '';
        alertPasswordInput.value = '';
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
                let newCardElement = document.getElementById('modal-card-' + takenModal.id);
                if(newCardElement) {
                    newCardElement.focus();
                }
                if(takenModal.isImportant) {
                    getItemButton.disabled = true;
                    setTimeout(() => {
                        customAlert.classList.remove('hidden');
                    }, 3000);
                } else if (allModals.filter(modal => modal.takenBy === null).length > 0) {
                    showIntermissionPasswordForm();
                }
            }
            updateRemainingCount();   
        }
    });  
}
//-----------------------------------------------------------------------

function showIntermissionPasswordForm() {
    initialLoginTitle.classList.add('hidden');
    intermissionTitle.classList.remove('hidden');
    loginForm.classList.remove('hidden');
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
    let headerContainer = myItemsContainer.querySelector('.my-items-header');
    if(headerContainer) {
        console.error('.my-items-header is nothing.');
        return;
    }
    let existingGrid = myItemsContainer.querySelector('.items-grid');
    if(existingGrid) {
        existingGrid.remove();
    }
    if(myTakenModals.length === 0) {
        myItemsContainer.querySelector('p')?.remove();
        let p = document.createElement('p');
        p.textContent = 'not items.';
        myItemsContainer.appendChild(p);
        backToTopButton.classList.add('hidden');
        return;
    } else {
        myItemsContainer.querySelector('p')?.remove();
    }
    backToTopButton.classList.remove('hidden');
    let itemsGrid = document.createElement('div');
    itemsGrid.className = 'items-grid';
    myTakenModals.sort((a, b) => a.id - b.id);
    myTakenModals.forEach(modal => {
        let itemcard = document.createElement('div');
        itemcard.className = 'item-card';
        itemcard.id = 'modal-card-' + modal.id;
        itemcard.tabIndex = -1;
        itemcard.innerHTML = `<img src="${modal.image}"><p>${modal.text}</p>`;
        itemsGrid.appendChild(itemcard);
    });
    myItemsContainer.appendChild(itemsGrid);
};
//-----------------------------------------------------------------------





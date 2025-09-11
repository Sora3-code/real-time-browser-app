//-----------------------------------------------------------------------

let socket = io();  //localhost用
//let socket = io('https://real-time-browser-app.onrender.com'); //render用
//-----------------------------------------------------------------------

let authContainer = document.getElementById('auth-container');
let registerForm = document.getElementById('register-form');
let loginFormMain = document.getElementById('login-form-main');
let registerUsernameInput = document.getElementById('register-username');
let registerPasswordInput = document.getElementById('register-password');
let registerButton = document.getElementById('register-button');
let loginUsernameInput = document.getElementById('login-username');
let loginPasswordInput = document.getElementById('login-password');
let loginButtonMain = document.getElementById('login-button-main');
let showLoginLink = document.getElementById('show-login');
let showRegisterLink = document.getElementById('show-register');
let gameArea = document.getElementById('game-area');
let remainingCountElement = document.getElementById('remaining-count');
let getItemButton = document.getElementById('get-item-button');
let myItemsContainer = document.getElementById('my-items');
let backToTopButton = document.getElementById('back-to-top-button');
let customAlert = document.getElementById('custom-alert');
let alertPasswordInput = document.getElementById('alert-password-input');
let alertLoginButton = document.getElementById('alert-login-button');
let userInfoContainer = document.getElementById('user-info-container');
let treasureName = document.getElementById('treasure-name');
let userName = document.getElementById('user-name');
let userAddress = document.getElementById('user-address');
let userAge = document.getElementById('user-age');
let schoolName = document.getElementById('school-name');
let schoolTEL = document.getElementById('school-tel');
let userDream = document.getElementById('user-dream');
let submitUserInfoButton = document.getElementById('submit-user-info');
let allDeleteButton = document.getElementById('all-delete-button');
//-----------------------------------------------------------------------

let loggedInUser = null;
//-----------------------------------------------------------------------

let allModals = [];
//-----------------------------------------------------------------------

let myTakenModals = [];
//-----------------------------------------------------------------------

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginFormMain.classList.remove('hidden');    
});
//-----------------------------------------------------------------------

showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormMain.classList.add('hidden');
    registerForm.classList.remove('hidden');
});
//-----------------------------------------------------------------------

registerButton.addEventListener('click', () => {
    let username = registerUsernameInput.value.trim();
    let password = registerPasswordInput.value.trim();
    if(username && password) {
        socket.emit('register', { username, password });
    }
});
//-----------------------------------------------------------------------

loginButtonMain.addEventListener('click', () => {
    let username = loginUsernameInput.value.trim();
    let password = loginPasswordInput.value.trim();
    if(username && password) {
        socket.emit('login', { username, password });
    }
});
//-----------------------------------------------------------------------

getItemButton.addEventListener('click', () => {
    let nextModal = allModals.find(modal => modal.takenBy === null);
    if(nextModal && loggedInUser) {
        getItemButton.disabled = true;
        socket.emit('takeModal', { modalId: nextModal.id, username: loggedInUser });
    }
});
//-----------------------------------------------------------------------

backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior: 'smooth' });
    setTimeout(() => {
        let targetForm = document.getElementById('password-input');
        if(targetForm) {
            targetForm.focus({ preventScroll: true });
        }
    }, 3000);
});
//-----------------------------------------------------------------------

loginButton.addEventListener('click', () => {
    let password = passwordInput.value;
    let type = isInitialLogin ? 'initial' : 'main_intermission';
    socket.emit('checkPassword', { password: password, type: type });
});
//-----------------------------------------------------------------------

alertLoginButton.addEventListener('click', () => {
    let password = alertPasswordInput.value;
    socket.emit('checkPassword', { password: password, type: 'alert' });
});
//-----------------------------------------------------------------------

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
    userInfoContainer.classList.add('hidden');
    getItemButton.disabled = false;
    getItemButton.focus();
    treasureName.value = '';
    userName.value = '';
    userAddress.value = '';
    userAge.value = '';
    schoolName.value = '';
    schoolTEL.value = '';
    userDream.value = '';
    alert('thank you for your Input. Please Get the following treasure.');
});
//-----------------------------------------------------------------------

socket.on('connect', () => {
    console.log(`server connected. Your ID: ${socket.id}.`);
});
//-----------------------------------------------------------------------

socket.on('registerResult', (result) => {
    if(result.success) {
        alert('Registration has been completed. Please login.');
        showLoginLink.click();
    } else {
        alert(`Registration Error: ${result.message}`);
    }
});
//-----------------------------------------------------------------------

socket.on('loginResult', (result) => {
    if(result.success) {
        loggedInUser = result.username;
        authContainer.classList.add('hidden');
        gameArea.classList.remove('hidden');
        myItemsContainer.classList.remove('hidden');
        socket.emit('checkPassword', { password: 'hope', type: 'initial' });
    } else {
        alert(`Login Error: ${result.message }`);
    }
});
//-----------------------------------------------------------------------


//-----------------------------------------------------------------------

function initializeGame(initialModals, userTakenModalIds) {
    allModals = initialModals;
    allModals.forEach(modal => {
        if(modal.takenBy) {

        }
    });
    myTakenModals = allModals.filter(m => userTakenModalIds.includes(m.id));
    updateRemainingCount();
    updateMyItemsList(myTakenModals);
}
//-----------------------------------------------------------------------

socket.on('initialModals', (initialModals) => {
    socket.once('loginResult', (result) => {
        if(result.success) {
            initializeGame(initialModals, result.takenModals);
        }
    });
    let username = loginUsernameInput.value.trim();
    let password = loginPasswordInput.value.trim();
    socket.emit('login', { username, password });
});
//-----------------------------------------------------------------------

socket.on('modalTaken', ({ modalId, userId }) => {
    console.log(`user ${userId} took modal ${modalId}.`);
    let takenModal = allModals.find(m => m.id === modalId);
    if(takenModal) {
        takenModal.takenBy = userId;
        if(userId === loggedInUser) {
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
//-----------------------------------------------------------------------

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
            userInfoContainer.classList.remove('hidden');
            userInfoContainer.scrollIntoView({ behavior: 'smooth' });
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
        let myTakenModals = allModals.filter(m => myTakenModalIds.includes(m.id));
        updateRemainingCount();
        updateMyItemsList();
    });
};
//-----------------------------------------------------------------------

function updateMyItemsList(myTakenModals) {
    let headerContainer = myItemsContainer.querySelector('.my-items-header');
    if(!headerContainer) {
        console.error(`can't find .my-items-header.`);
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

function updateRemainingCount() {
    let remaining = allModals.filter(modal => modal.takenBy === null).length;
    remainingCountElement.textContent = `残り: ${remaining}個.`;
    if(remaining === 0) {
        getItemButton.disabled = true;
        getItemButton.textContent = '終了';
    }
};
//-----------------------------------------------------------------------

function showIntermissionPasswordForm() {
    initialLoginTitle.classList.add('hidden');
    intermissionTitle.classList.remove('hidden');
    loginForm.classList.remove('hidden');
}
//-----------------------------------------------------------------------

allDeleteButton.addEventListener('click', () => {
    if(confirm('do you really delete everything?')) {
        localStorage.removeItem('myTakenModalIds');
        location.reload();
        alert('deleted.');
    }
});
//-----------------------------------------------------------------------

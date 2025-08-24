//-----------------------------------------------------------------------

let socket = io('https://real-time-browser-app.onrender.com');
//-----------------------------------------------------------------------

let myId = '';
//-----------------------------------------------------------------------

let allModals = [];
//-----------------------------------------------------------------------

let getItemButton = document.getElementById('get-item-button');
let remainingCountElement = document.getElementById('remaining-count');
let myItemsContainer = document.getElementById('my-items');
//-----------------------------------------------------------------------

let myTakenModals = [];
//-----------------------------------------------------------------------

let updateRemainingCount = () => {
    let remaining = allModals.filter(modal => modal.takenBy === null).length;
    remainingCountElement.textContent = `残り: ${remaining}個.`;
    if(remaining === 0) {
        getItemButton.disabled = true;
        getItemButton.textContent = '終了';
    }
};
//-----------------------------------------------------------------------

let updateMyItemsList = () => {
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

getItemButton.addEventListener('click', () => {
    let nextModal = allModals.find(modal => modal.takenBy === null);
    if(nextModal) {
        socket.emit('takeModal', nextModal.id);
    }
});
//-----------------------------------------------------------------------

socket.on('connect', () => {
    myId = socket.id;
    console.log(`server connected. Your ID: ${myId}.`);
});
//-----------------------------------------------------------------------

socket.on('initialModals', (initialModals) => {
    allModals = initialModals;
    myTakenModals = allModals.filter(m => m.takenBy === myId);
    updateRemainingCount();
    updateMyItemsList();
});
//-----------------------------------------------------------------------

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
//-----------------------------------------------------------------------

updateMyItemsList();
//-----------------------------------------------------------------------

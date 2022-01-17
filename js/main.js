import {
  switchElementsClass, nightModeControl,
} from "./functions.js";
import {
  searchUser, getAllMessages, buildMessageBox, checkUserState, buildList
} from './firebase.js';


checkUserState();

// night mode control
const darkModeBtn = document.querySelector('#nightMode');
if (localStorage.getItem('nightMode') === 'true') nightModeControl(true);
darkModeBtn.onclick = () => { nightModeControl(false) };

let searchUserInput = document.querySelector('#searchUser');
let searchUserBtn = document.querySelector('#searchUserBtn');
searchUserBtn.addEventListener('click', async () => {
  document.querySelector('.chat-list').innerHTML = '';
  let val = searchUserInput.value;
  if (val) {
    searchUser(val, getAllMessages, buildMessageBox, buildList);
  }
})

let closeChatWindow = document.querySelector('#closeChatWindow');
let messagesBox = document.querySelector('.messages');
messagesBox.innerHTML = '';
let chatBoard = document.querySelector('.chat-board');
let welcomeBoard = document.querySelector('#welcomeBoard');
closeChatWindow.onclick = () => {
  chatBoard.classList.add('d-none');
  welcomeBoard.classList.remove('d-none')
}

document.querySelector('#imageAreaClose').onclick = () => {
  document.querySelector('#viewImageArea').classList.add('d-none');
}
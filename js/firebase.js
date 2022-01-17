import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-analytics.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signOut, signInWithEmailAndPassword, sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.6.2/firebase-auth.js";
import {
  getDatabase, ref, push, set, update,
  get, query, orderByChild, orderByValue, onValue, equalTo, startAt, endAt,
  remove, off
} from "https://www.gstatic.com/firebasejs/9.6.2/firebase-database.js";
import {
  notify, switchElementsClass, userProfileProcess, updateScroll,
  createElement,
} from "./functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5FuHguRnWtQgjM0hbwZboWuNOnGQbw3k",
  authDomain: "messenger-6b668.firebaseapp.com",
  databaseURL: "https://messenger-6b668-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "messenger-6b668",
  storageBucket: "messenger-6b668.appspot.com",
  messagingSenderId: "1095758638719",
  appId: "1:1095758638719:web:7651f01db685223614594a",
  measurementId: "G-94WYQYRDCK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// services
const auth = getAuth();
const db = getDatabase();

const alertBox = document.querySelectorAll('.my-alert')[0];
const logPage = document.querySelector('#logPage');
const loader = document.querySelector('#loader');
const dashboard = document.querySelector('#dashboard');
const profileChats = document.querySelectorAll('.profile-chats')[0];
const userSettings = document.querySelector('#user-settings');
const userSettingsBtn = document.querySelector('#userSettings');
const chatBoard = document.querySelector('.chat-board');
let chatList = document.querySelectorAll('.chat-list')[0];
let messagesBox = document.querySelector('.messages');
let welcomeBoard = document.querySelector('#welcomeBoard');

// form related functions
function createNewUser(name, email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      let date = new Date().getTime();
      let userId = cred.user.uid;
      updateProfile(auth.currentUser, { displayName: name, });
      userProfileProcess(name, email, auth.currentUser.photoURL);
      set(ref(db, `users/${userId}`), {
        username: name,
        userId,
        email,
        imgLink: './img/icon.png',
        timeStamp: date,
        active: true,
        receiver: false,
      })
      switchElementsClass(logPage, [], 'd-none');
      signInForm.reset();
    }
    ).catch((err) => {
      notify(alertBox, err.message.replace('Firebase:', ''))
    })
}

let localReceiversObj = {};
let entry = true;
function checkUserState() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      chatList.innerHTML = messagesBox.innerHTML = '';
      onValue(ref(db, `users/${user.uid}/receiver`),
        (snap) => {
          if (entry && snap.val()) {
            localReceiversObj = snap.val();
            entry = false;
          }
          let allReceivers = Object.entries(snap.val() || {});
          allReceivers.forEach((arr) => {
            onValue(ref(db, `chats/${arr[1]}`), (snap) => {
              renderChatList(arr[0], arr[1])
            })
          })
        })
      loader.classList.add('d-none');
      chatBoard.classList.add('d-none');
      dashboard.classList.remove('d-none');
      userProfileProcess(user.displayName, user.email, user.photoURL);
      update(ref(db), {
        [`users/${auth.currentUser.uid}/active`]: true,
        [`users/${auth.currentUser.uid}/timeStamp`]: new Date().getTime(),
      });
    } else {
      loader.classList.add('d-none');
      switchElementsClass(logPage, [], 'd-none');
    }
  })
}

function renderChatList(userId, chatId) {
  let chatUser;
  get(ref(db, `users/${userId}/`))
    .then((obj) => {
      chatUser = obj.val();
      get(ref(db, `chats/${chatId}/`))
        .then((snap) => {
          let existingChat = document.querySelector(`#${chatId}`)
          if (existingChat) existingChat.remove();
          let lastMessage = '';
          let email = false;
          if (snap.val()) lastMessage = snap.val().lastMessage;
          else email = true;
          buildList(chatUser, auth.currentUser.uid, lastMessage, chatId, email);
        })
    })
}

let lastActive;
function buildList(receiver, currentUserId, lastMessage, chatId, email = '') {
  if (receiver.userId === currentUserId) receiver.username = 'Saved messages';
  let li;
  if (chatId) {
    li = createElement('li', '', '');
    li.id = chatId;
    chatList.prepend(li);
  } else li = createElement('li', '', '', chatList);
  let a = createElement('a', '', '', li);
  let chatCover = createElement('div', '', "chat-item-cover d-flex align-items-center position-relative", a);
  let imgCover = createElement('div', '', 'position-relative', chatCover)
  let img = createElement('img', '', "img-fluid rounded-circle chat-img", imgCover);
  img.src = receiver.imgLink;
  let badge = createElement('div', '', "myBadge position-absolute", imgCover);
  if (receiver.active) badge.classList.add('activeUser');
  else badge.classList.remove('activeUser');
  let userData = createElement('div', '', 'chat-name-message', chatCover);
  let uName = createElement('p', `${receiver.username}`, 'chat-name m-0', userData);
  let uEmail = createElement('p', `${email ? receiver.email : lastMessage ? `${lastMessage.slice(0, 20)}...` : ''}`, "last-message m-0 text-secondary", userData);
  a.onclick = () => {
    if (lastActive) lastActive.classList.remove('active');
    a.classList.add('active');
    lastActive = a;
    renderChatArea(receiver);
    getAllMessages(receiver.userId, currentUserId, email);
  }
}


function logOut() {
  chatBoard.classList.add('d-none');
  document.querySelector('#viewImageArea').classList.add('d-none');
  update(ref(db), {
    [`users/${auth.currentUser.uid}/active`]: false,
    [`users/${auth.currentUser.uid}/timeStamp`]: new Date().getTime(),
  });
  signOut(auth).then(() => {
    localReceiversObj = {};
    profileChats.querySelector('#user-img').src = './img/icon.png';
    setTimeout(() => {
      notify(alertBox, 'You logged out!', 'bg-warning');
    }, 500);
  })
}

function windowCloseDetect() {
  window.addEventListener('beforeunload', function (e) {
    localReceiversObj = {};
    update(ref(db), {
      [`users/${auth.currentUser.uid}/active`]: false,
    })
    for (var i = 0; i < 500000000; i++) { }
    return undefined;
  });
}

function signIn(email, password, form) {
  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      get(ref(db, `users/${auth.currentUser.uid}/receiver`))
        .then((snap) => {
          if (snap.val()) localReceiversObj = snap.val();
        })
      welcomeBoard.classList.remove('d-none')
      switchElementsClass(loader, [], 'd-none');
      setTimeout(() => {
        switchElementsClass(loader, [], 'd-none')
      }, 1000);
      switchElementsClass(logPage, [], 'd-none');

      form.reset();
    }).catch((err) => {
      notify(alertBox, err.message.replace('Firebase:', ''))
    })
}

// user settings related functions
function updateUserProfile(name, imgLink) {
  updateProfile(auth.currentUser, {
    displayName: name,
    photoURL: imgLink,
  }).then(() => {
    update(ref(db), {
      [`users/${auth.currentUser.uid}/imgLink`]: imgLink,
      [`users/${auth.currentUser.uid}/username`]: name,
    });
    userProfileProcess(name, auth.currentUser.email, imgLink);
    switchElementsClass(userSettings, [], 'd-none');
    if (!userSettings.classList.contains('d-none')) {
      userSettingsBtn.style.color = '#E7798A';
    }
    else {
      userSettingsBtn.removeAttribute('style')
    }
  })
}

const getDisplayInfo = () => {
  switchElementsClass(userSettings, [], 'd-none');
  if (!userSettings.classList.contains('d-none')) {
    userSettingsBtn.style.color = '#E7798A';
  }
  else {
    userSettingsBtn.removeAttribute('style')
  }
  return [auth.currentUser.displayName, auth.currentUser.photoURL]
};

// search sumbit 
let searchUserInput = document.querySelector('#searchUser');
searchUserInput.addEventListener('input', (e) => {
  let val = searchUserInput.value;
  if (val == '') {
    chatList.innerHTML = '';
    Object.entries(localReceiversObj).forEach((arr) => {
      onValue(ref(db, `chats/${arr[1]}`), (snap) => {
        renderChatList(arr[0], arr[1])
      })
    })
  };
});

// search user functions
function searchUser(value) {
  let que = query(ref(db, 'users/'), orderByChild('username'), startAt(value), endAt(value + 'uf8ff'))
  get(que)
    .then((result) => {
      if (result.val()) {
        Object.entries(result.val() || {}).map((arr) => {
          buildList(arr[1], auth.currentUser.uid, '', '', true)
        })
      }
      else {
        chatList.innerHTML = '<p class="p-3"> No user :(</p>';
      }
    })
}


function renderChatArea(receiver) {
  messagesBox.innerHTML = '';
  let receiverStatus = document.querySelector('#receiver-status');
  if (!welcomeBoard.classList.contains('d-none')) welcomeBoard.classList.add('d-none');
  document.querySelectorAll('.chat-board')[0].classList.remove('d-none');
  document.querySelector('#receiver-img').src = receiver.imgLink;
  document.querySelector('#receiver-img').onclick = () => {
    let imageViewArea = document.querySelector('#viewImageArea');
    imageViewArea.querySelector('#viewImg').src = receiver.imgLink;
    imageViewArea.classList.remove('d-none');
  }
  document.querySelector('#receiver-name').innerHTML = receiver.username;
  if (receiver.active) receiverStatus.innerHTML = 'Online';
  else {
    let ans;
    let lastSeen = receiver.timeStamp;
    let curTime = new Date().getTime();
    let diff = curTime - lastSeen;
    let ms = diff % 1000;
    diff = (diff - ms) / 1000;
    let secs = diff % 60;
    diff = (diff - secs) / 60;
    let mins = diff % 60;
    let hrs = (diff - mins) / 60;
    if (hrs > 24) {
      let days = Math.round(hrs / 24);
      ans = `${days} ${days > 1 ? 'days' : 'day'} ago`;
    } else if (hrs >= 1) ans = `${hrs} ${hrs > 1 ? 'hours' : 'hour'} ago`
    else if (mins >= 5) ans = `${mins} minutes ago`;
    else ans = 'recently';
    receiverStatus.innerHTML = `Last seen ${ans}`;
  }
}

let lastActiveChat;
function getAllMessages(receiverUserId, currentUserId, email) {
  get(ref(db, `users/${auth.currentUser.uid}/receiver`))
    .then((snap) => {
      if (snap.val()) localReceiversObj = snap.val();
      let chatId = localReceiversObj ? localReceiversObj[receiverUserId] : false;
      let sendMessageBtn = document.querySelector('#sendMessage');
      let messageArea = document.querySelector('#messageArea');
      sendMessageBtn.onclick = () => {
        if (!chatId) {
          chatId = push(ref(db, 'chats/'), {
            lastMessage: '',
            timeStamp: new Date().getTime(),
          }).key;
          localReceiversObj[receiverUserId] = chatId;
          update(ref(db), {
            [`users/${currentUserId}/receiver/${receiverUserId}`]: chatId,
            [`users/${receiverUserId}/receiver/${currentUserId}`]: chatId,
          })
        }
        if (email) chatList.innerHTML = '';
        Object.entries(localReceiversObj).forEach((arr) => {
          onValue(ref(db, `chats/${arr[1]}`), (snap) => {
            renderChatList(arr[0], arr[1])
          })
        })
        let message = messageArea.value;
        push(ref(db, `messages/${chatId}/`), {
          senderName: auth.currentUser.displayName,
          senderId: auth.currentUser.uid,
          text: message,
          timeStamp: new Date().getTime(),
        }).then(() => {
          messageArea.value = '';
          update(ref(db), {
            [`chats/${chatId}/lastMessage/`]: message,
            [`chats/${chatId}/timeStamp/`]: new Date().getTime(),
          })
        })
        if (lastActiveChat) off(lastActiveChat);
        lastActiveChat = ref(db, `messages/${chatId}`);
        onValue(ref(db, `messages/${chatId}`), (snap) => {
          if (!snap.exists()) messagesBox.innerHTML = '<p class="pt-5 align-self-center text-secondary"> No messages yet..</p>';
          else messagesBox.innerHTML = '';
          buildMessageBox(Object.entries(snap.val() || {}), currentUserId, chatId);
        })
      }
      if (lastActiveChat) off(lastActiveChat);
      lastActiveChat = ref(db, `messages/${chatId}`);
      onValue(ref(db, `messages/${chatId}`), (snap) => {
        if (!snap.exists()) messagesBox.innerHTML = '<p class="pt-5 align-self-center text-secondary"> No messages yet..</p>';
        else messagesBox.innerHTML = '';
        buildMessageBox(Object.entries(snap.val() || {}), currentUserId, chatId);
      })
    })

}


function buildMessageBox(messagesList, currentUserId, chatId) {
  messagesList.map((messageObj) => {
    let key = messageObj[0];
    let obj = messageObj[1];
    updateScroll();
    let messagesCover = document.querySelectorAll('.messages')[0];
    let messageBox;
    let editDel;
    if (obj.senderId === currentUserId) {
      messageBox = createElement('div', '', "message-box-right flex-row-reverse position-relative align-self-end", messagesCover);
      editDel = createElement('div', '', "edit-del-name d-flex justify-content-between flex-row-reverse align-items-center", messageBox);
      let bntCover = createElement('div', '', '', editDel)
      let btnCheck = createElement('button', '<i class="fa fa-check" aria-hidden="true"></i>', "btn p-0 me-3 btn-outline-secondary check", bntCover)
      let btnEdit = createElement('button', '<i class="fa fa-pencil" aria-hidden="true"></i>', "btn p-0 me-3 btn-outline-secondary", bntCover);
      btnEdit.onclick = () => {
        let textArea = btnEdit.parentElement.parentElement.parentElement.querySelector('textarea')
        textArea.disabled = false;
        btnEdit.style.display = 'none';
        btnCheck.style.display = 'inline-block';
        textArea.style.borderWidth = '1px';
      }
      btnCheck.onclick = () => {
        let textArea = btnEdit.parentElement.parentElement.parentElement.querySelector('textarea');
        update(ref(db), {
          [`messages/${chatId}/${key}/text/`]: textArea.value,
        })
        textArea.style.borderWidth = '0px';
        btnCheck.style.display = 'none';
        btnEdit.style.display = 'inline-block';
        textArea.rows = `${textArea.value.match(/\n/g) ? textArea.value.match(/\n/g).length : 0 + 1}`
      }
      let btnDel = createElement('button', '<i class="fa fa-trash" aria-hidden="true"></i>', "btn p-0 btn-outline-secondary", bntCover)
      btnDel.onclick = () => {
        remove(ref(db, `messages/${chatId}/${key}`));
      }
    }
    else {
      messageBox = createElement('div', '', "message-box-left position-relative", messagesCover);
      editDel = createElement('div', '', "edit-del-name d-flex justify-content-between align-items-center", messageBox);
      let p = createElement('p', `${obj.senderName}`, 'm-0 text-secondary', editDel)
    }
    let textareaMessage = createElement('textarea', ``, 'px-1 py-3 disabled', messageBox);
    textareaMessage.innerText = obj.text;
    textareaMessage.style.height = '0';
    textareaMessage.style.height = 20 + textareaMessage.scrollHeight + 'px';
    textareaMessage.disabled = true;
    let time = new Date(obj.timeStamp);
    let timePos = createElement('span', `${time.getHours()}:${time.getMinutes()}`, "message-time", editDel)
  })
  updateScroll();
}

export {
  createNewUser, checkUserState, logOut, windowCloseDetect, signIn, updateUserProfile,
  getDisplayInfo, searchUser, getAllMessages, buildMessageBox, buildList
}
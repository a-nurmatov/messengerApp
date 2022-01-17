const switchElementsClass = (element, elements, className) => {
  if (element) {
    let classList = element.classList;
    if (classList.contains(className)) classList.remove(className)
    else classList.add(className)
  } else if (elements) {
    elements.map((element) => {
      if (element) {
        let classList = element.classList;
        if (classList.contains(className)) classList.remove(className)
        else classList.add(className)
      }
    })
  }
}

const nightModeControl = (firstVisit) => {
  let checkMode = localStorage.getItem('nightMode');
  if (checkMode && !firstVisit) {
    if (checkMode === 'true') localStorage.setItem('nightMode', false);
    else localStorage.setItem('nightMode', true);
  }
  if (!checkMode) localStorage.setItem('nightMode', 'true');
  switchElementsClass(document.body, [], 'dark-mode');
  if (document.body.classList.contains('dark-mode')) nightMode.style.color = '#5CBDEA';
  else nightMode.removeAttribute('style');
}

function notify(element, message, className) {
  if (className) element.classList.add(className);
  element.innerHTML = message;
  switchElementsClass(element, [], 'd-none');
  setTimeout(() => {
    switchElementsClass(element, [], 'd-none');
    if (className) element.classList.remove(className);
  }, 3500);
}

const updateScroll = () => {
  var element = document.querySelector('.messages')
  element.scrollTop = element.scrollHeight;
}

function createElement(name = 'div', innerHTML = "", className = "", parent) {
  let element = document.createElement(name);
  element.innerHTML = innerHTML;
  element.className = className;
  parent && parent.append(element);
  return element;
}

function userProfileProcess(username, email, source = '') {
  const profileChats = document.querySelectorAll('.profile-chats')[0];
  document.querySelector('#welcomeName').innerHTML = username;
  profileChats.querySelector('#user-name').innerHTML = username;
  profileChats.querySelector('#user-email').innerHTML = email;
  let curUserImg = profileChats.querySelector('#user-img');
  if (source) curUserImg.src = source;
  curUserImg.onclick = () => {
    let imageViewArea = document.querySelector('#viewImageArea');
    imageViewArea.querySelector('#viewImg').src = profileChats.querySelector('#user-img').src;
    imageViewArea.classList.remove('d-none');
  }
}

// build chat list


// [[userId, userData]]
// [[userId, chatId]]

function selectLinkEffect() {
  let lastActive;
  let chatListLinks = document.querySelectorAll('.chat-list li a');
  chatListLinks.forEach((a) => {
    a.onclick = () => {
      if (lastActive) lastActive.classList.remove('active');
      a.classList.add('active');
      lastActive = a;
    }
  })
}



export {
  switchElementsClass, nightModeControl, notify, userProfileProcess, updateScroll, createElement
}
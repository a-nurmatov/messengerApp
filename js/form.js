import { 
  notify, switchElementsClass,
} from "./functions.js";
import {
  createNewUser, logOut, windowCloseDetect, signIn, updateUserProfile,
  getDisplayInfo,
} from './firebase.js';

windowCloseDetect();

const resetPasswordBtn = document.querySelector('#resetPassword');
const signUpLinkBtn = document.querySelector('#signUpLinkBtn');
const signInLinkBtn = document.querySelector('#signInLinkBtn');
const signInForm = document.querySelector('#signInForm');
const signUpForm = document.querySelector('#signUpForm');
const alertBox = document.querySelectorAll('.my-alert')[0];
const logOutBtn = document.querySelector('#logOut');
const userSettingsForm = document.querySelector('#userSettingsForm');
const userSettingsBtn = document.querySelector('#userSettings');
const closeUserSettings = document.querySelector('#closeUS');


resetPasswordBtn.onclick = () => {notify(alertBox, 'This function will be added soon!', 'bg-warning')}

signInLinkBtn.onclick = () => {
  switchElementsClass('', [signInLinkBtn, signUpForm, signUpLinkBtn, signInForm, resetPasswordBtn], 'd-none');
}

signUpLinkBtn.onclick = () => {
  switchElementsClass('', [signInLinkBtn, signUpForm, signUpLinkBtn, signInForm, resetPasswordBtn], 'd-none')
}

logOutBtn.onclick = () => {
  logOut();
  signUpForm.reset();
}

closeUserSettings.onclick = userSettingsBtn.onclick = () => {
  let formData = getDisplayInfo();
  userSettingsForm.username.value = formData[0];
  userSettingsForm.imgLink.value = formData[1];
}


signUpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let name = signUpForm.name.value;
  let email = signUpForm.email.value;
  let password = signUpForm.password.value;
  createNewUser(name, email, password);
});

signInForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let email = signInForm.email.value;
  let password = signInForm.password.value;
  signIn(email, password, signInForm);
})

userSettingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let username = userSettingsForm.username.value;
  let photoLink = userSettingsForm.imgLink.value;
  updateUserProfile(username, photoLink);
})
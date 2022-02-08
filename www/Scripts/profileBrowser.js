
let profile;
let profileList;
let currentProfileData;
let pictureIndex = 0;
let pictureList;
let userProfile;

async function onSignIn(googleUser) {
  // Log in and start getting data from database
  profile = googleUser.getBasicProfile();
  document.getElementById('currentEmail').textContent = `Currently logged in as ${profile.getEmail()}`
  // If google account doesn't have a linked user account, send to Sign In/Up page
  let response = await fetch(`/api/user/${profile.getId()}`, { method: 'GET' });
  if (!response.ok) throw response;
  let resData = await response.json();
  if (!resData.data) {
    window.location.href = '/HTML/signUpPage.html';
  }
  response = await fetch(`/api/profile/${profile.getId()}`, { method: 'GET' });
  if (!response.ok) throw response;
  resData = await response.json();
  userProfile = resData.data;
  getProfileList();
}

async function signOut() {
  // Log out and redirect to Sign In/Up page
  await gapi.auth2.getAuthInstance().signOut();
  window.location.href = '/HTML/signUpPage.html';
}

async function getProfileList() {
  // Get list of all profiles in database
  const response = await fetch(`/api/profiles/${profile.getId()}/${userProfile.sex}`, { method: 'GET' });
  if (!response.ok) throw response;
  const resData = await response.json();
  profileList = resData.data;
  getNextProfile();
}

async function getNextProfile() {
  pictureIndex = 0;
  pictureList = [];
  if (!profileList[0]) {
    loadEndOfProfiles();
    currentProfileData = null;
    return;
  }
  // Get full record of profile from database
  const response = await fetch(`/api/profile/${profileList.shift().ownerId}`, {method : "GET"});
  if (!response.ok) throw response;
  const resData = await response.json();
  currentProfileData = resData.data;
  // For every picture in the database, add them to the list
  for (let i = 0; i < 10; i++) {
    const currentPicture = currentProfileData[`picture${i}`];
    if (!currentPicture) { break; }
    pictureList.push(currentPicture);
  }

  updatePage();
}

function updatePage() {
  // Put all the data into the appropriate elements on the page
  const pictureFrame = document.getElementById('profileImage');
  if (!pictureList[pictureIndex]) {
    pictureFrame.src = '/img/unfoundProfilePic.png'
  } else {
    pictureFrame.src = '/img/' + pictureList[pictureIndex];
  }
  const nameBadge = document.getElementById('profileName');
  nameBadge.textContent = currentProfileData.name;
  const dobBadge = document.getElementById('profileDOB');
  const age = getAge(currentProfileData.dob.split('-'));
  dobBadge.textContent = `Age: ${age[0]} years, ${age[1]} months`;
  const bioHolder = document.getElementById('profileBio');
  bioHolder.textContent = currentProfileData.bio;
  document.getElementById('dislikeButton').style.visibility = 'visible';
  document.getElementById('likeButton').style.visibility = 'visible';
}

function nextImage() {
  if (pictureList[pictureIndex + 1]) {
    pictureIndex++;
  } else {
    pictureIndex = 0;
  }
  updatePage();
}

function loadEndOfProfiles() {
  // Clear all values, put placeholder image in frame, hide buttons
  // Will require refresh to load profiles again
  const nameBadge = document.getElementById('profileName');
  nameBadge.textContent = '';
  const dobBadge = document.getElementById('profileDOB');
  dobBadge.textContent = '';
  const bioHolder = document.getElementById('profileBio');
  bioHolder.textContent = '';
  const pictureFrame = document.getElementById('profileImage');
  pictureFrame.src = '/img/noMoreProfiles.png'
  document.getElementById('dislikeButton').style.visibility = 'hidden';
  document.getElementById('likeButton').style.visibility = 'hidden';
}

function getAge(dobInForm) {
  // Get current date and date of birth
  const currentDate = new Date();
  const currentDateInForm = [currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate()]
  const age = [0, 0, 0];
  //
  age[2] += currentDateInForm[2] - dobInForm[2];
  if (age[2] < 0) {
    age[1]++;
  }
  age[1] += currentDateInForm[1] - dobInForm[1];
  if (age[1] < 0) {
    age[0]--;
    age[1] += 12;
  }
  age[0] += currentDateInForm[0] - dobInForm[0];
  return age;
}

async function likeProfile() {
  // Check if the profile has already requested to match with user
  let response = await fetch(`/api/matchRequest/${profile.getId().toString()}/${currentProfileData.ownerId}`, {
    method: 'GET'
  });
  if (!response.ok) throw response;
  const resData = await response.json();
  // If so, accept match
  if (resData.data) {
    response = await fetch(`/api/match/${profile.getId().toString()}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromId: currentProfileData.ownerId })
    });
  } else {
    // Check if user has already sent match request to profile
    response = await fetch(`/api/matchRequest/${currentProfileData.ownerId}/${profile.getId().toString()}`, {
      method: 'GET'
    });
    const resData = await response.json();
    // If user hasn't already sent match request, then send one
    if (!resData.data) {
      response = await fetch(`/api/sendMatch/${profile.getId().toString()}/${currentProfileData.ownerId}`, {
        method: 'POST'
      });
    }
  }

  getNextProfile();
}

async function dislikeProfile() {
  // If profile has requested match with user, delete match request
  await fetch(`/api/match/${currentProfileData.ownerId}/${profile.getId().toString()}`, {
    method: 'DELETE'
  });
  // If user has previously requested match with profile, delete match request
  await fetch(`/api/match/${profile.getId().toString()}/${currentProfileData.ownerId}`, {
    method: 'DELETE'
  });

  profileList.push({ ownerId: currentProfileData.ownerId });
  getNextProfile();
}

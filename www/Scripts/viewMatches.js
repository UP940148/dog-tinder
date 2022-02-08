
let profile;
let matchList;
let likeList;

async function onSignIn(googleUser) {
  // Log in and start getting data from database
  profile = googleUser.getBasicProfile();
  document.getElementById('currentEmail').textContent = `Currently logged in as ${profile.getEmail()}`
  // If google account doesn't have a linked user account, send to Sign In/Up page
  const response = await fetch(`/api/user/${profile.getId()}`, { method: 'GET' });
  if (!response.ok) throw response;
  const resData = await response.json();
  if (!resData.data) {
    window.location.href = '/HTML/signUpPage.html';
  }

  clearMatches();
  getAllMatches();
  getAllLikes();
}

async function signOut() {
  // Log out and redirect to Sign In/Up page
  await gapi.auth2.getAuthInstance().signOut();
  window.location.href = '/HTML/signUpPage.html';
}

async function getAllMatches() {
  // Fetch all matches user is linked to
  const response = await fetch(`/api/acceptedMatches/${profile.getId().toString()}`, {
    method: 'GET'
  });
  if (!response.ok) throw response;
  const resData = await response.json();
  matchList = resData.data;
  // Rather than store the whole match, just store who the other user is
  for (let i = 0; i < matchList.length; i++) {
    if (matchList[i].sentBy === profile.getId()) {
      matchList[i] = matchList[i].sentTo;
    } else {
      matchList[i] = matchList[i].sentBy;
    }
  }

  addMatchesToPage();
}

async function addMatchesToPage() {
  for (let i = 0; i < matchList.length; i++) {
    // Get current matched profile
    const response = await fetch(`/api/profile/${matchList[i]}`, {
      method: 'GET'
    });
    if (!response.ok) throw response;
    const resData = await response.json();
    // Create container for match details
    const thisMatchElement = document.createElement('div');
    thisMatchElement.setAttribute('class', 'matchElement');
    // Create name tag for match
    const thisMatchName = document.createElement('label');
    thisMatchName.setAttribute('class', 'text');
    thisMatchName.textContent = resData.data.name;
    // Create mini picture frame for match
    const thisMatchImg = document.createElement('img');
    thisMatchImg.setAttribute('class', 'matchPicFrame');
    thisMatchImg.setAttribute('src', '/img/' + resData.data.picture0);

    // Put everything into the document
    thisMatchElement.appendChild(thisMatchImg);
    thisMatchElement.appendChild(thisMatchName);
    document.getElementById('matchContainer').appendChild(thisMatchElement);
  }
}

function clearMatches() {
  const matchElementList = document.getElementsByClassName('matchElement');
  const matchContainerElement = document.getElementById('matchContainer');
  const listLength = matchElementList.length;
  for (let i = 0; i < listLength; i++) {
    matchContainerElement.removeChild(matchElementList[0]);
  }
}

async function getAllLikes() {
  // Fetch all likes user has made
  const response = await fetch(`/api/unacceptedMatches/${profile.getId().toString()}`, {
    method: 'GET'
  });
  if (!response.ok) throw response;
  const resData = await response.json();
  likeList = resData.data;
  // Rather than store the whole match, just store who the other user is
  for (let i = 0; i < likeList.length; i++) {
    likeList[i] = likeList[i].sentTo;
  }

  addLikesToPage();
}

async function addLikesToPage() {
  for (let i = 0; i < likeList.length; i++) {
    // Get current liked profile
    const response = await fetch(`/api/profile/${likeList[i]}`, {
      method: 'GET'
    });
    if (!response.ok) throw response;
    const resData = await response.json();
    // Create container for like details
    const thisLikeElement = document.createElement('div');
    thisLikeElement.setAttribute('class', 'likeElement');
    // Create name tag for like
    const thisLikeName = document.createElement('label');
    thisLikeName.setAttribute('class', 'text');
    thisLikeName.textContent = resData.data.name;
    // Create mini picture frame for like
    const thisLikeImg = document.createElement('img');
    thisLikeImg.setAttribute('class', 'likePicFrame');
    thisLikeImg.setAttribute('src', '/img/' + resData.data.picture0);

    // Put everything into the document
    thisLikeElement.appendChild(thisLikeImg);
    thisLikeElement.appendChild(thisLikeName);
    document.getElementById('requestsContainer').appendChild(thisLikeElement);
  }
}

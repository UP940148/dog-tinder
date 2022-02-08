
let profile;

async function onSignIn(googleUser) {
  profile = googleUser.getBasicProfile();
  const response = await fetch(`/api/user/${profile.getId()}`, { method: 'GET' });
  const resData = await response.json()
  if (resData.data) {
    window.location.href = '/HTML/profileBrowserPage.html';
  }
  const nameBox = document.getElementById('name');
  nameBox.value = profile.getName();
  const emailBox = document.getElementById('email');
  emailBox.value = profile.getEmail();
}

async function signOut() {
  await gapi.auth2.getAuthInstance().signOut();
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  document.getElementById('passwordConfirm').value = '';
}

async function submitForm() {
  const response = await fetch(`/api/user/${profile.getId()}`, { method: 'GET' });
  if (!response.ok) throw response;
  const resData = await response.json();
  if (typeof resData.data !== 'undefined') {
    console.log('Profile already exists');
  } else {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    if ((password !== passwordConfirm) || password === '') {
      alert('Passwords do not match, or no password was entered!')
      document.getElementById('password').value = '';
      document.getElementById('passwordConfirm').value = '';
    } else {
      const data = {
        googleId: profile.getId(),
        name: name,
        email: email,
        password: password
      };
      await fetch('/api/user/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      window.location.href = '/HTML/createProfilePage.html';
    }
  }
}

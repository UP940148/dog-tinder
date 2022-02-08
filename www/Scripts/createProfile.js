
let profile;
function onSignIn(googleUser) {
  profile = googleUser.getBasicProfile();
  document.getElementById('currentEmail').textContent = `Currently logged in as ${profile.getEmail()}`;
}

async function submitProfile() {
  // Assign variables based on form input
  const dogName = document.getElementById('name').value;
  const dogDOB = document.getElementById('dob').value;
  let dogSex;

  if (document.getElementById('maleBtn').checked) {
    dogSex = 'M';
  } else {
    dogSex = 'F';
  }

  // Post data
  const data = {
    ownerId: profile.getId(),
    name: dogName,
    dob: dogDOB,
    sex: dogSex
  }
  const response = await fetch('/api/profile/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  // Redirect window if form was completed and submit correctly
  if (response.ok) {
    window.location.href = '/HTML/userProfilePage.html';
  }
}

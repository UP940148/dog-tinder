
let profile;

function onSignIn(googleUser) {
  profile = googleUser.getBasicProfile();
  document.getElementById('currentEmail').textContent = `Currently logged in as ${profile.getEmail()}`;
  getProfileData();
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file.type.startsWith('image/')) {
    alert('Only image files are accepted! (.jpeg, .png, etc)')
    e.target.value = '';
    return;
  }
  const reader = new FileReader();

  reader.readAsDataURL(file);
  fileUpload(file, e.target);
}

async function getProfileData() {
  const response = await fetch(`/api/profile/${profile.getId()}`, { method: 'GET' });
  const resData = await response.json();
  document.getElementById('bioBox').value = resData.data.bio;
  for (let i = 0; i < 10; i++) {
    const currentRes = resData.data[`picture${i}`];
    document.getElementById(`pic${i}`).children[2].src = `/img/${currentRes}`;
  }
}

async function fileUpload(file, target) {
  const data = new FormData();
  data.append('picture', file);
  const response = await fetch('/api/picture', {
    method: 'POST',
    body: data,
  });
  const resData = await response.json();
  const frame = target.parentElement.children[2]
  if (frame.src !== '') {
    deletePrevious(frame);
  }
  target.parentElement.children[2].src = `/img/${resData.filename}`;
  uploadChanges();
}

async function deletePrevious(target) {
  const fileInput = target.parentElement.children[0];
  fileInput.value = null;
  const filename = target.src.split('/')[4];
  await fetch(`/api/picture/${filename}`, {
    method: 'DELETE',
  });
  uploadChanges();
}

async function uploadChanges() {
  const bioVal = document.getElementById('bioBox').value;
  let pic0Val = document.getElementById('pic0').children[2].src.split('/')[4];
  if (!pic0Val || !pic0Val.includes('.')) { pic0Val = ''; }
  let pic1Val = document.getElementById('pic1').children[2].src.split('/')[4];
  if (!pic1Val || !pic1Val.includes('.')) { pic1Val = ''; }
  let pic2Val = document.getElementById('pic2').children[2].src.split('/')[4];
  if (!pic2Val || !pic2Val.includes('.')) { pic2Val = ''; }
  let pic3Val = document.getElementById('pic3').children[2].src.split('/')[4];
  if (!pic3Val || !pic3Val.includes('.')) { pic3Val = ''; }
  let pic4Val = document.getElementById('pic4').children[2].src.split('/')[4];
  if (!pic4Val || !pic4Val.includes('.')) { pic4Val = ''; }
  let pic5Val = document.getElementById('pic5').children[2].src.split('/')[4];
  if (!pic5Val || !pic5Val.includes('.')) { pic5Val = ''; }
  let pic6Val = document.getElementById('pic6').children[2].src.split('/')[4];
  if (!pic6Val || !pic6Val.includes('.')) { pic6Val = ''; }
  let pic7Val = document.getElementById('pic7').children[2].src.split('/')[4];
  if (!pic7Val || !pic7Val.includes('.')) { pic7Val = ''; }
  let pic8Val = document.getElementById('pic8').children[2].src.split('/')[4];
  if (!pic8Val || !pic8Val.includes('.')) { pic8Val = ''; }
  let pic9Val = document.getElementById('pic9').children[2].src.split('/')[4];
  if (!pic9Val || !pic9Val.includes('.')) { pic9Val = ''; }

  const data = {
    bio: bioVal,
    picture0: pic0Val,
    picture1: pic1Val,
    picture2: pic2Val,
    picture3: pic3Val,
    picture4: pic4Val,
    picture5: pic5Val,
    picture6: pic6Val,
    picture7: pic7Val,
    picture8: pic8Val,
    picture9: pic9Val,
  };
  const req = {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }

  await fetch(`/api/profile/${profile.getId()}`, req)
}

document.addEventListener('DOMContentLoaded', function() {
  console.log("auth.js loaded");

  // Cek apakah firebase ada
  if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded. Check script tags in HTML.");
    return; // Stop kalo Firebase nggak ada
  }
  const firebaseConfig = {
    apiKey: "AIzaSyCEM6FNpU3gK88Wr9_GbfoVxQUqS9Ra9kA",
    authDomain: "minerva-ai-6337b.firebaseapp.com",
    projectId: "minerva-ai-6337b",
    storageBucket: "minerva-ai-6337b.firebasestorage.app",
    messagingSenderId: "895833533538",
    appId: "1:895833533538:web:c9ea78c1d93fa0fd3a353b"
  };

  // Inisialisasi Firebase
  try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized");
  } catch (error) {
    console.error("Firebase init error:", error);
  }

  // Provider Google Sign-In
  const provider = new firebase.auth.GoogleAuthProvider();

  // Tangani status autentikasi
  firebase.auth().onAuthStateChanged((user) => {
    const userInfoDiv = document.getElementById('user-info');
    if (user) {
      userInfoDiv.innerHTML = `Hello, ${user.displayName}`;
      document.getElementById('google-login-btn').style.display = 'none';
      document.getElementById('sign-out-btn').style.display = 'block';
      console.log("User logged in:", user.displayName);
    } else {
      userInfoDiv.innerHTML = '';
      document.getElementById('google-login-btn').style.display = 'block';
      document.getElementById('sign-out-btn').style.display = 'none';
      console.log("No user logged in");
    }
  });

  // Handler tombol login
  document.getElementById('google-login-btn').addEventListener('click', () => {
    console.log("Login button clicked");
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        console.log('Signed in as:', result.user.displayName);
      })
      .catch((error) => {
        console.error('Error during sign-in:', error.message);
      });
  });

  // Handler tombol sign-out
  document.getElementById('sign-out-btn').addEventListener('click', () => {
    console.log("Sign-out button clicked");
    firebase.auth().signOut().then(() => {
      console.log('Signed out');
    }).catch((error) => {
      console.error('Error during sign-out:', error);
    });
  });
});

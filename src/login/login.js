import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
    authDomain: "campusinfrastructuremanagement.firebaseapp.com",
    projectId: "campusinfrastructuremanagement",
    storageBucket: "campusinfrastructuremanagement.appspot.com",
    messagingSenderId: "981921503275",
    appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
    measurementId: "G-Y95YE5ZDRY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed in:", user);
        console.log("Signed in successfully");

        // Redirect to another page or handle authenticated state
        window.location.href = "../user-dashboard/dashboard.html";
    } catch (error) {
        console.error("Error signing in:", error.message);
        alert("Error: " + error.message);
    }
});

const googleProvider = new GoogleAuthProvider();

document.getElementById('googleLogin').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log("User signed in with Google: ", user);

        // You can now redirect the user or perform other actions
        window.location.href = "../user-dashboard/dashboard.html";
    } catch (error) {
        console.error("Error signing in with Google: ", error.message);
        alert("Error: " + error.message);
    }
});

// Logout functionality
document.getElementById('logout').addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("User signed out successfully");
        alert("Logged out successfully");

        // Redirect to login page or handle post-logout state
        window.location.href = "../index.html";
    } catch (error) {
        console.error("Error signing out:", error.message);
        alert("Error: " + error.message);
    }
});

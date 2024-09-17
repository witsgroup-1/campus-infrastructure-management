import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

const whitelist = [
   "lucky@bbd.co.za",
   "test1@email.com",
   "luckynkosi@bbd.co.za",
    "blueivy@net.co.za"
];

async function searchUserByEmail(email) {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email));

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.log('No matching documents.');
            return null;
        }
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error searching for user:', error);
        return null;
    }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const email = e.target.email.value;
    const password = e.target.password.value;

    if (whitelist.includes(email)) {
        try {
            // Attempt to sign in with email and password
            try {
                await signInWithEmailAndPassword(auth, email, password);
                console.log("User signed in:", email);

                // Store the user's email in localStorage
                localStorage.setItem('userEmail', email);

                // Search for user data
                const userData = await searchUserByEmail(email);
                if (userData) {
                    window.location.href = "../user-dashboard/dashboard.html";
                } else {
                    // Redirect to password creation page if user is not found
                    window.location.href = "../onboarding/onboarding.html";
                }
            } catch (signInError) {
                // If sign-in fails (invalid credentials or other error), create a new user
                console.log("Sign-in failed:", signInError.message);
                console.log("Creating new user...");

                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    console.log("User created:", email);

                    // Store the user's email in localStorage
                    localStorage.setItem('userEmail', email);

                    // Redirect to password creation page
                    window.location.href = "../onboarding/onboarding.html";
                } catch (createUserError) {
                    console.error("Error creating user:", createUserError.message);
                    alert("Error: " + createUserError.message);
                }
            }
        } catch (error) {
            console.error("Error during login process:", error.message);
            alert("Error: " + error.message);
        }
    } else {
        console.error("Email not whitelisted.");
        alert("Error: Email not whitelisted.");
    }
});


const googleProvider = new GoogleAuthProvider();

document.getElementById('googleLogin').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log("User signed in with Google:", user);

        localStorage.setItem('userEmail', user.email);

        // Search for user data
        const userData = await searchUserByEmail(user.email);
        if (userData) {
            window.location.href = "../user-dashboard/dashboard.html";
        } else {
            window.location.href = "../onboarding/onboarding.html";
        }
    } catch (error) {
        console.error("Error signing in with Google:", error.message);
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


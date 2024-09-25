import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { setPersistence,  browserSessionPersistence, getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut,createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs,doc,getDoc} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
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

async function isEmailWhitelisted(email) {
    const whitelistCollection = collection(db, 'whitelist');
    const q = query(whitelistCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    console.log(`Checking if ${email} is whitelisted...`);
    if (!querySnapshot.empty) {
        return true;
    } else {
        return false;
    }
}

async function searchUserByEmail(email) {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email));

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.log('No matching documents.');
            return null;
        }

        querySnapshot.forEach((doc) => {
            console.log('Document data:', doc.data());
        });

        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error searching for user:', error);
        return null;
    }
}


// Inside the event listener for the login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        if (await isEmailWhitelisted(email)) {
            // Set session persistence to 'session-only'
            await setPersistence(auth, browserSessionPersistence);

            try {
                // Proceed with sign-in after setting session persistence
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                console.log("User signed in: session bs btw:", user);

                // Store the user's email in localStorage
                localStorage.setItem('userEmail', user.email);

                // Redirect to the user dashboard
                window.location.href = "../user-dashboard/dashboard.html";
            } catch (error) {
                if (error.code === 'auth/invalid-login-credentials') {
                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        const user = userCredential.user;

                        localStorage.setItem('userEmail', user.email);
                        window.location.href = "../onboarding/onboarding.html";
                    } catch (signUpError) {
                        console.error("Error signing up:", signUpError.message);
                        alert("Error: " + signUpError.message);
                    }
                } else {
                    console.error("Error signing in:", error.message);
                    alert("Error: " + error.message);
                }
            }
        } else {
            alert("This email is not whitelisted. Sorry.");
        }
    } catch (error) {
        console.error("Error checking whitelist:", error.message);
        alert("Error: " + error.message);
    }
});


const googleProvider = new GoogleAuthProvider();
document.getElementById('googleLogin').addEventListener('click', async (e) => {
    e.preventDefault();

    try {
        // Set session persistence for Google sign-in as well
        await setPersistence(auth, browserSessionPersistence);

        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log("User signed in with Google: ", user);

        // Store the user's email in localStorage
        localStorage.setItem('userEmail', user.email);

        // Search for the user in Firestore
        const userEmail = user.email;
        console.log(`This is the user email that we are checking: ${userEmail}`);

        // Check if the email ends with "wits.ac.za"
        if (userEmail.endsWith("wits.ac.za")) {
            // Proceed with searching the user by email
            const userData = await searchUserByEmail(userEmail);

            if (userData) {
                // Redirect to user dashboard if email is found
                window.location.href = "../user-dashboard/dashboard.html";
            } else {
                // Redirect to onboarding page if email is not found
                window.location.href = "../onboarding/onboarding.html";
            }
        } else {
            alert("Only Wits University students and staff members can sign in.");
        }
    } catch (error) {
        console.error("Error signing in with Google: ", error.message);
        alert("Error: " + error.message);
    }
});


// Logout functionality
/*document.getElementById('logout').addEventListener('click', async () => {
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
});*/

});
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
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = "Checking approval...";
    const whitelistCollection = collection(db, 'whitelist');
    const q = query(whitelistCollection, where('emailInput', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return true;
    } else {
        statusMessage.textContent = "";
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

        const userDoc = querySnapshot.docs[0];
        console.log('Document data:', userDoc.data());

        return userDoc.data();
    } catch (error) {
        console.error('Error searching for user:', error);
        return null;
    }
}



document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const statusMessage = document.getElementById('status-message');

    try {
        if (await isEmailWhitelisted(email)) {
            // Set session persistence to 'session-only'
            await setPersistence(auth, browserSessionPersistence);

            statusMessage.textContent = "Signing in...";

            try {
                // Proceed with sign-in after setting session persistence
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const userData = await searchUserByEmail(email);

                console.log("User signed in: session bs btw:", user);

                // Store the user's email in localStorage
                localStorage.setItem('userEmail', user.email);

                if (userData.role === "Staff" && !userData.isTutor && !userData.isLecturer) {
                    window.location.href = "../adminDashboard/adminDashboard.html";
                } else {
                    window.location.href = "../user-dashboard/dashboard.html";
                }
            } catch (error) {
                if (error.code === 'auth/invalid-login-credentials') {
                    // Show the "Creating account..." message
                    statusMessage.textContent = "Creating account...";

                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        const user = userCredential.user;

                        localStorage.setItem('userEmail', user.email);
                        window.location.href = "../onboarding/onboarding.html";
                    }
                    catch (error) {
                        if (error.code === 'auth/weak-password') {
                            alert('Your password is too weak. Please ensure it is at least 6 characters long.');
                        }
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
    const statusMessage = document.getElementById('status-message');

    try {
        // Set session persistence for Google sign-in as well
        await setPersistence(auth, browserSessionPersistence);

        // Show the "Signing in..." message for Google login
        statusMessage.textContent = "Signing in with Google...";

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


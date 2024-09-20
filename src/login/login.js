import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User signed in:", user);
        console.log("Signed in successfully");

        // Store the user's email in localStorage
        localStorage.setItem('userEmail', user.email);

        // Search for the user in Firestore
        const userData = await searchUserByEmail(email);
        if (userData) {
            // Redirect to user dashboard if email is found
            window.location.href = "../user-dashboard/dashboard.html";
        } else {
            // Redirect to onboarding page if email is not found
            window.location.href = "../onboarding/onboarding.html";
        }
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
        const user = result.user;
        console.log("User signed in with Google: ", user);

        // Store the user's email in localStorage
        localStorage.setItem('userEmail', user.email);

        // Search for the user in Firestore
        const userEmail = user.email;
        console.log(`This is the user email that we are checking ${userEmail}`);
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
            // If the email doesn't end with "@wits.ac.za", show an error message or redirect to an error page
            alert("Only Wits University students and staff members can sign in.");
            // Optionally, you can also redirect to an error page:
            // window.location.href = "../error-pages/invalid-email.html";
        }
        
    } catch (error) {
        console.error("Error signing in with Google: ", error.message);
        alert("Error: " + error.message);
    }
});

// Logout functionality, commented it out for now because it caused an error because there is no element with id='logout" in login.html
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
});
*/


});
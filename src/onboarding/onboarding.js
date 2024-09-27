// Import Firebase SDK and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
    authDomain: "campusinfrastructuremanagement.firebaseapp.com",
    projectId: "campusinfrastructuremanagement",
    storageBucket: "campusinfrastructuremanagement.appspot.com",
    messagingSenderId: "981921503275",
    appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
    measurementId: "G-Y95YE5ZDRY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {

    // Finish Button Event Listener
    document.getElementById('finishBtn')?.addEventListener('click', async () => {
        
        // Ensure the user is authenticated
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // The user is signed in, you can access the user's info
                const uid = user.uid;
                const email = user.email;

                // Store email in localStorage 
                localStorage.setItem('userEmail', email);

                // Gather form data
                const name = document.getElementById('name').value;
                const surname = document.getElementById('surname').value;
                const faculty = document.getElementById('faculty').value;
                const role = document.getElementById('role').value;
                const isTutor = document.getElementById('tutorCheckbox').checked;
                const isLecturer = document.getElementById('lecturerCheckbox').checked;

                // Create user object
                const userData = {
                    name,
                    surname,
                    faculty,
                    role,
                    isTutor,
                    isLecturer,
                    email,  // The authenticated email
                    createdAt: new Date()  // Optional: Add a creation date
                };

                try {
                    // Store user data in Firestore using the authenticated user's UID
                    await setDoc(doc(db, 'users', uid), userData);
                    alert('Onboarding Complete!');
                    //window.location.href = "../user-dashboard/dashboard.html";
                    if (role === "Staff" && !isTutorChecked && !isLecturerChecked) {
                        // Redirect to a different page
                        window.location.href = '../adminDashboard/adminDashboard.html';  
                    } else {
                        // Proceed as normal
                        window.location.href = '../user-dashboard/dashboard.html';  
                    }

                } catch (error) {
                    console.error('Error adding user: ', error);
                    alert('There was an issue completing your onboarding. Please try again.');
                }

            } else {
                // No user is signed in, redirect to login page
                alert('You need to sign in first!');
                window.location.href = "../index.html";
            }
        });
        
    });
});

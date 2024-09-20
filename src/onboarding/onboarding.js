// Import Firebase SDK and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', () => {

    // Validate Step 3
   

    // Finish Button Event Listener
    document.getElementById('finishBtn')?.addEventListener('click', async () => {
        
            // Gather form data
            const name = document.getElementById('name').value;
            const surname = document.getElementById('surname').value;
            const faculty = document.getElementById('faculty').value;
            const role = document.getElementById('role').value;
            const isTutor = document.getElementById('tutorCheckbox').checked;
            const isLecturer = document.getElementById('lecturerCheckbox').checked;
            const email = localStorage.getItem('userEmail') || 'No email found';

              // Store email in localStorage 
        localStorage.setItem('userEmail', email);

            // Create user object
            const userData = {
                name,
                surname,
                faculty,
                role,
                isTutor,
                isLecturer,
                email
            };

            try {
                // Post user data to Firestore
                await addDoc(collection(db, 'users'), userData);
                alert('Onboarding Complete!');
                window.location.href = "../user-dashboard/dashboard.html";

            } catch (error) {
                console.error('Error adding user: ', error);
                alert('There was an issue completing your onboarding. Please try again.');
            }
        
    });
});

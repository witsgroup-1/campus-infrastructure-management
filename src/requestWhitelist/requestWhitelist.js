import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";



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
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('requestBtn')?.addEventListener('click', async () => {
        // Ensure the user is authenticated
        onAuthStateChanged(auth, async (user) => {
            if (user) {

                const name = document.getElementById('name').value;
                const surname = document.getElementById('surname').value;
                const emailInput = document.getElementById('email').value;

                if (!name || !surname || !emailInput) {
                    alert('Please fill in all required fields.');
                    return;
                }

                try {
                    const querySnapshot = await getDocs(
                        query(collection(db, 'whitelistRequests'), where('emailInput', '==', emailInput))
                    );

                    if (!querySnapshot.empty) {
                        alert('This email has already been requested for approval.');
                        window.location.href = 'statusCheck.html';
                        return;
                    }

                    const requestData = {
                        name,
                        surname,
                        emailInput,
                        status: 'pending',
                        createdAt: new Date()
                    };

                    document.getElementById('loadingSpinner').classList.remove('hidden');

                    await addDoc(collection(db, 'whitelistRequests'), requestData);

                    document.getElementById('loadingSpinner').classList.add('hidden');

                    alert('Your request has been submitted for approval!');
                    window.location.href = 'statusCheck.html';

                } catch (error) {
                    console.error('Error submitting request: ', error);
                    alert('There was an issue submitting your request. Please try again.');
                    document.getElementById('loadingSpinner').classList.add('hidden');
                }
            }
        });
    });
});



import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('requestBtn')?.addEventListener('click', async () => {
        
        const name = document.getElementById('name').value;
        const surname = document.getElementById('surname').value;
        const email = document.getElementById('email').value;

        if (!name || !surname  || !email) {
            alert('Please fill in all required fields.');
            return;
        }

        const requestData = {
            name,
            surname,
            email,
            status: 'pending',
            createdAt: new Date()
        };

        try {
            await addDoc(collection(db, 'whitelistRequests'), requestData);
            alert('Your request has been submitted for approval!');
            window.location.href = 'statusCheck.html';

        } catch (error) {
            console.error('Error submitting request: ', error);
            alert('There was an issue submitting your request. Please try again.');
        }
    });
});

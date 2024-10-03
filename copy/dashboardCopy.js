import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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
//const db = getFirestore(app);

export const getUserDocumentByEmail = async (db, email) => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        }
        return null;
    } catch (error) {
        console.error('Error getting user document by email:', error);
        return null;
    }
};

export const getGreetingMessage = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
        return { message: 'Good morning', emoji: '🌅' };
    } else if (hour >= 12 && hour < 17) {
        return { message: 'Good afternoon', emoji: '☀️' };
    } else if (hour >= 17 && hour < 21) {
        return { message: 'Good evening', emoji: '🌇' };
    } else {
        return { message: 'Goodnight', emoji: '🌙' };
    }
};

export const setupAuthListener = (auth, db) => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const email = user.email;

            localStorage.setItem('userEmail', email);
            const userDocId = await getUserDocumentByEmail(db, email);

            if (userDocId) {
                localStorage.setItem('userId', userDocId);
                const userDoc = await getDoc(doc(db, 'users', userDocId));

                const userName = userDoc.data().name || 'User';
                const { message, emoji } = getGreetingMessage();
                const greetingElement = document.getElementById('userGreeting');
                greetingElement.textContent = `${emoji} ${message}, ${userName}!`;

                handleUserRoles(userDoc.data());
            }
        }
    });
};

const handleUserRoles = (userData) => {
    const isTutor = userData.isTutor || false;
    const isLecturer = userData.isLecturer || false;
    const role = userData.role || '';
    const isAdmin = !isTutor && !isLecturer && role === 'Staff';

    const adminLink = document.getElementById('admin-link');
    if (isAdmin) {
        adminLink.style.display = 'block';
        adminLink.addEventListener('click', () => {
            window.location.href = "../adminDashboard/adminDashboard.html";
        });
    } else {
        adminLink.addEventListener('click', (event) => {
            event.preventDefault();
            showModal("Oops! Only admins can access this.");
        });
    }
};



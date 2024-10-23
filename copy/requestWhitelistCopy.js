import { getDocs, addDoc, query, collection, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const ensureAuthenticatedUser = (auth) => {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                resolve(user);
            } else {
                reject(new Error('User not authenticated'));
            }
        });
    });
};

// whitelistRequest.js - core logic for request handling
export const submitWhitelistRequest = async (db, name, surname, emailInput) => {
    if (!name || !surname || !emailInput) {
        throw new Error('Please fill in all required fields.');
    }

    const querySnapshot = await getDocs(
        query(collection(db, 'whitelistRequests'), where('emailInput', '==', emailInput))
    );

    if (!querySnapshot.empty) {
        throw new Error('This email has already been requested for approval.');
    }

    const requestData = {
        name,
        surname,
        emailInput,
        status: 'pending',
        createdAt: new Date(),
    };

    await addDoc(collection(db, 'whitelistRequests'), requestData);

    return 'Your request has been submitted for approval!';
};

// domHelper.js - to manage DOM interaction and loading spinners
export const showLoadingSpinner = () => {
    document.getElementById('loadingSpinner').classList.remove('hidden');
};

export const hideLoadingSpinner = () => {
    document.getElementById('loadingSpinner').classList.add('hidden');
};



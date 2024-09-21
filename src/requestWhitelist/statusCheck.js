import { FirebaseConfig } from '../FirebaseConfig.js';

const firebaseConfig = new FirebaseConfig();
firebaseConfig.initializeFirebase();

document.getElementById('checkStatusBtn')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value;

    if (!email) {
        alert('Please enter an email.');
        return;
    }

    try {
        const results = await firebaseConfig.getDocuments('whitelistRequests', 'email', email);

        if (results.length === 0) {
            alert('No request found for this email.');
        } else {
            const requestData = results[0];
            document.getElementById('statusText').textContent = `Request is currently: ${requestData.status}`;
            document.getElementById('statusResult').style.display = 'block';
        }
    } catch (error) {
        alert('There was an issue checking the status. Please try again.');
    }
});

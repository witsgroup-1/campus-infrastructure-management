import { FirebaseConfig } from '../FirebaseConfig.js';
import {collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc,updateDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";


async function getWhitelistRequests() {
    const firebaseConfig = new FirebaseConfig(); 
    const db = firebaseConfig.getFirestoreInstance();

    const q = query(collection(db, "whitelistRequests"), where("status", "==", "pending"));

    try {
        
        const querySnapshot = await getDocs(q);
        const results = [];
        
        querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
        });
        return results;
    } catch (error) {
        console.error("Error getting documents: ", error);
        throw new Error("Error getting documents");
    }
}

async function fetchRequests() {
    const requests = await getWhitelistRequests();

    const requestsContainer = document.getElementById('requestsContainer');

    // Clear existing requests
    requestsContainer.innerHTML = '';

    requests.forEach(request => {
        const requestBox = document.createElement('div');
        requestBox.className = 'bg-gray-100 p-4 rounded-lg shadow-md text-[#003B5C]';

        requestBox.innerHTML = `
            <p><strong>Name:</strong> ${request.name} ${request.surname}</p>
            <p><strong>Email:</strong> ${request.emailInput}</p>
            <p><strong>Status:</strong> ${request.status}</p>
            <div class="flex justify-end mt-4">
                <button class="bg-green-500 text-white px-4 py-2 rounded-lg mr-2" onclick="acceptRequest('${request.id}')">Accept</button>
                <button class="bg-red-500 text-white px-4 py-2 rounded-lg" onclick="rejectRequest('${request.id}')">Reject</button>
            </div>
        `;

        requestsContainer.appendChild(requestBox);
    });
}

window.acceptRequest = async function(requestId) {
    const db = new FirebaseConfig().getFirestoreInstance();
    const requestRef = doc(db, "whitelistRequests", requestId);

    try {
       
        const requestDoc = await getDoc(requestRef);
        if (requestDoc.exists()) {
            const requestData = requestDoc.data();

            await updateDoc(requestRef, { status: "accepted" });
           
            const newRequestData = {
                ...requestData,
                status: "accepted"
            };

            
            await addDoc(collection(db, "whitelist"), newRequestData);
            alert("Added to the whitelist!")
           
            //await deleteDoc(requestRef);

            fetchRequests();
        }
    } catch (error) {
        console.error("Error accepting request: ", error);
    }
}

window.rejectRequest = async function(requestId) {
    const db = new FirebaseConfig().getFirestoreInstance();
    const requestRef = doc(db, "whitelistRequests", requestId);

    try {
        await updateDoc(requestRef, { status: "rejected" });
        
        fetchRequests();
    } catch (error) {
        console.error("Error rejecting request: ", error);
    }
};

fetchRequests();

import { FirebaseConfig } from '../FirebaseConfig.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";


const firebaseConfig = new FirebaseConfig();
firebaseConfig.initializeFirebase();

document.addEventListener('DOMContentLoaded', () => {
   
    const requestsButton = document.getElementById('requests');
    const requestsPanel = document.getElementById('requestsPanel');
  

    requestsButton.addEventListener('click', async () => {
        if (requestsPanel.classList.contains('hidden')) {
            requestsPanel.classList.remove('hidden');
            await displayWhitelistRequests();
        } else {
            requestsPanel.classList.add('hidden');
        }
    });
    document.addEventListener('click', (event) => {
        if (!requestsButton.contains(event.target) && !requestsPanel.contains(event.target)) {
            requestsPanel.classList.add('hidden');
        }
    });


});

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



async function displayWhitelistRequests() {
    const requestsPanel = document.getElementById('requestsPanel');
    const requestsList = document.getElementById('requestsList');
    const requestsHeader = requestsPanel.querySelector('h3');

    requestsList.innerHTML = '<li class="text-center  text-[#003B5C]"><span class="loader"></span> Loading...</li>';
    
    try {
        const requests = await getWhitelistRequests(); 

        
        requestsList.innerHTML = '';

        if (requests.length === 0) {
            requestsList.innerHTML = '<li class="text-[#917248]">No new requests</li>';
            requestsHeader.innerHTML = 'Requests';
        } else {
            requests.slice(0, 3).forEach((request) => {
                const listItem = document.createElement('li');
                listItem.className = 'bg-gray-100 p-4 rounded-lg shadow-md text-[#003B5C]';

                listItem.innerHTML = `
                    <p><strong>Name:</strong> ${request.name} ${request.surname}</p>
                    <p><strong>Email:</strong> ${request.emailInput}</p>
                `;
                requestsList.appendChild(listItem);
            });

            if (requests.length > 0) {
                const seeMoreLink = document.createElement('li');
                seeMoreLink.className = 'text-center text-[#917248] cursor-pointer hover:underline';
                seeMoreLink.innerHTML = `<a href="allWhitelistRequests.html">See More</a>`;
                requestsList.appendChild(seeMoreLink);
            }

            // Add a red dot to indicate there are new requests
            requestsHeader.innerHTML = 'Requests <span class="ml-2 inline-block w-2.5 h-2.5 bg-red-600 rounded-full"></span>';
        }
    } catch (error) {
        requestsList.innerHTML = '<li class="text-red-500">Failed to load requests. Please try again.</li>';
        console.error("Error getting documents: ", error);
    }
}


import { FirebaseConfig } from '../FirebaseConfig.js';
import { collection, query, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

let whitelistedUsers = []; 
let currentPage = 1;
const usersPerPage = 10;

async function getWhitelistedUsers() {
    const db = new FirebaseConfig().getFirestoreInstance();
    const q = query(collection(db, "whitelist"));
    
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

async function fetchWhitelistedUsers() {
    const loader = document.getElementById('loader');
    loader.style.display = "block";

    whitelistedUsers = await getWhitelistedUsers();
    loader.style.display = "none";

    currentPage = 1;
    displayWhitelistedUsers(currentPage);
}

function displayWhitelistedUsers(page) {
    const requestsContainer = document.getElementById('whitelistContainer');
    requestsContainer.innerHTML = ''; 

    const start = (page - 1) * usersPerPage;
    const end = start + usersPerPage;
    const usersToDisplay = whitelistedUsers.slice(start, end);

    if (usersToDisplay.length === 0) {
        requestsContainer.innerHTML = '<p>No whitelisted users at this time.</p>';
        return;
    }

    usersToDisplay.forEach(user => {
        const userBox = document.createElement('div');
        userBox.className = 'bg-gray-100 p-4 rounded-lg shadow-md text-[#003B5C]';

        userBox.innerHTML = `
            <p><strong>Name:</strong> ${user.name} ${user.surname}</p>
            <p><strong>Email:</strong> ${user.emailInput}</p>
            <div class="flex justify-end mt-4">
                <button class="bg-red-500 text-white px-4 py-2 rounded-lg" onclick="confirmDelete('${user.id}')">Delete</button>
            </div>
        `;

        requestsContainer.appendChild(userBox);
    });

  
    document.getElementById('pageInfo').innerText = `Page ${currentPage}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = end >= whitelistedUsers.length;
}

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayWhitelistedUsers(currentPage);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage * usersPerPage < whitelistedUsers.length) {
        currentPage++;
        displayWhitelistedUsers(currentPage);
    }
});

window.confirmDelete = async function(userId){
    const confirmation = confirm("Are you sure you want to delete this user?");
    if (confirmation) {
        await deleteWhitelistedUser(userId);
    }
}

async function deleteWhitelistedUser(userId) {
    const db = new FirebaseConfig().getFirestoreInstance();
    const userRef = doc(db, "whitelist", userId);
    
    try {
        await deleteDoc(userRef);
        alert("User deleted successfully!");
        fetchWhitelistedUsers(); // Refresh the list
    } catch (error) {
        console.error("Error deleting user: ", error);
    }
}

fetchWhitelistedUsers();

import { FirebaseConfig } from '../FirebaseConfig.js';
import { getFirestore, collection, query, limit, getDocs, startAfter, doc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = new FirebaseConfig();
firebaseConfig.initializeFirebase();

const db = getFirestore();
const requestsContainer = document.getElementById('requestsContainer');
const searchInput = document.getElementById('searchInput');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');

let lastVisible = null; 
let firstVisible = null;
let pageStack = [];
const usersPerPage = 5; 

async function loadWhitelistedUsers(filter = '', isNext = true) {
    requestsContainer.innerHTML = ''; // Clear previous results
    let queryConstraints = [orderBy("name"), limit(usersPerPage)];

   
    if (lastVisible && isNext) {
        queryConstraints.push(startAfter(lastVisible));
    }
    
    if (!isNext && pageStack.length > 1) {
        pageStack.pop(); 
        firstVisible = pageStack[pageStack.length - 1];
        queryConstraints.push(startAfter(firstVisible));
    }

    const whitelistCollection = collection(db, 'whitelist');
    const q = query(whitelistCollection, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        requestsContainer.innerHTML = '<p>No matching requests found.</p>';
        nextPageBtn.disabled = true;
        return;
    }

    let userData = [];
    querySnapshot.forEach((doc, index) => {
        const data = doc.data();
        if (data.name.toLowerCase().includes(filter) || data.surname.toLowerCase().includes(filter)) {
            userData.push({
                id: doc.id,
                name: data.name,
                surname: data.surname,
                email: data.email,
            });
        }

       
        if (index === 0) firstVisible = doc;
        lastVisible = doc;
    });

    if (isNext) {
        pageStack.push(firstVisible);
    }

    
    renderUsers(userData);

   
    prevPageBtn.disabled = pageStack.length <= 1;
    nextPageBtn.disabled = userData.length < usersPerPage; 
}

function renderUsers(users) {
    if (users.length === 0) {
        requestsContainer.innerHTML = '<p>No matching requests found.</p>';
        return;
    }

    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('p-4', 'bg-gray-100', 'rounded-lg', 'shadow-md');
        userDiv.innerHTML = `
            <h3 class="text-lg font-bold">${user.name} ${user.surname}</h3>
            <p class="text-gray-600">${user.email}</p>
            <button class="mt-4 bg-[#003B5C] text-white px-4 py-2 rounded deleteBtn" data-id="${user.id}">
                <i class="fas fa-trash-alt"></i> Remove
            </button>
        `;

        requestsContainer.appendChild(userDiv);
    });

    attachDeleteHandlers();
}

function attachDeleteHandlers() {
    const deleteButtons = document.querySelectorAll('.deleteBtn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const userId = e.target.getAttribute('data-id');
            const confirmDelete = confirm('Are you sure you want to remove this user from the whitelist?');
            if (confirmDelete) {
                await removeUserFromWhitelist(userId);
                loadWhitelistedUsers(searchInput.value.toLowerCase()); // Refresh the list
            }
        });
    });
}

async function removeUserFromWhitelist(userId) {
    try {
        const userDoc = doc(db, 'whitelist', userId);
        await deleteDoc(userDoc);
        alert('User removed from whitelist.');
    } catch (error) {
        console.error('Error removing user:', error);
        alert('Failed to remove user.');
    }
}

// Filter as you type
searchInput.addEventListener('input', () => {
    const filterValue = searchInput.value.toLowerCase();
    loadWhitelistedUsers(filterValue);
});

// Handle Next Page
nextPageBtn.addEventListener('click', () => {
    loadWhitelistedUsers(searchInput.value.toLowerCase(), true);
});

// Handle Previous Page
prevPageBtn.addEventListener('click', () => {
    loadWhitelistedUsers(searchInput.value.toLowerCase(), false);
});

// Load users initially
loadWhitelistedUsers();

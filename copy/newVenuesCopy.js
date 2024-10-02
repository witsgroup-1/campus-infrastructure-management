
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore,collection, getDocs} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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





export function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getNextSlot(intervals) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (const interval of intervals) {
        const [startHour, startMinute] = interval.start.split(':').map(Number);
        if (currentHour < startHour || (currentHour === startHour && currentMinute < startMinute)) {
            return interval;
        }
    }
    return null; // No more slots available today
}


export async function fetchAvailableVenues(db, intervals) {
    try {
        const venuesCollectionRef = collection(db, 'venues');
        const venuesSnapshot = await getDocs(venuesCollectionRef);
        const availableVenues = [];
        const currentDate = getCurrentDate();
        const nextSlot = getNextSlot(intervals);

        if (!nextSlot) {
            console.log('No more slots available for today.');
            return availableVenues;
        }

        const nextSlotTimes = parseSlotTimes(nextSlot); // Refactor time parsing
        const venuePromises = venuesSnapshot.docs.map(venueDoc => processVenue(db, venueDoc, currentDate, nextSlotTimes));

        await Promise.all(venuePromises);
        return availableVenues;
        
    } catch (error) {
        //console.error('Error fetching available venues:', error);
        return [];
    }
}
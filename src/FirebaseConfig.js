import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore,collection, addDoc, getDocs, query, where, orderBy} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

export class FirebaseConfig {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyCh1gI4eF7FbJ7wcFqFRzwSII-iOtNPMe0",
            authDomain: "campusinfrastructuremanagement.firebaseapp.com",
            projectId: "campusinfrastructuremanagement",
            storageBucket: "campusinfrastructuremanagement.appspot.com",
            messagingSenderId: "981921503275",
            appId: "1:981921503275:web:78ce66a89f233a5c14f26e",
            measurementId: "G-Y95YE5ZDRY"
        };
        
        this.app = null;
        this.db = null; 
    }

    initializeFirebase() {
        if (!this.app) {
            this.app = initializeApp(this.firebaseConfig);
        }
    }

    getFirestoreInstance() {
        if (!this.db) {
            if (!this.app) {
                this.initializeFirebase();
            }
            this.db = getFirestore(this.app);
        }
        return this.db;

    }

    async addDocument(collectionName, data) {
        const db = this.getFirestoreInstance();
        try {
            const docRef = await addDoc(collection(db, collectionName), data);
            console.log("Document written with ID: ", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Error adding document: ", error);
            throw new Error("Error adding document");
        }
    }

    async getDocuments(collectionName, fieldName, value) {
        const db = this.getFirestoreInstance();
        const q = query(collection(db, collectionName), where(fieldName, '==', value));
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

    async queryDocuments(collectionPath, orderByField, orderByValue) {
        const db = this.getFirestoreInstance();
        
        // Construct the collection reference and query
        const collectionRef = collection(db, collectionPath);
        let q;
    
        // If you want to apply filtering
        if (orderByField && orderByValue) {
            q = query(collectionRef, where(orderByField, '==', orderByValue));
        } else {
            q = collectionRef; // No filtering, just the collection
        }
    
        console.log("Fetching documents from:", collectionPath, "with order by:", orderByField);
        
        try {
            const snapshot = await getDocs(q); // Use getDocs to retrieve documents
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Return documents as an array
        } catch (error) {
            console.error("Error fetching documents from Firestore:", error);
            throw error; // Rethrow error for handling
        }

    }
    
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore,collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

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
        
        this.app = null;  // To store the initialized app
        this.db = null;   // To store Firestore instance
    }

    // Initialize Firebase App
    initializeFirebase() {
        if (!this.app) {
            this.app = initializeApp(this.firebaseConfig);
        }
    }

    // Get Firestore Instance
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
            return docRef.id;  // Return the document ID
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
                results.push({ id: doc.id, ...doc.data() });  // Store each document's data along with its ID
            });
            return results;  // Return an array of documents
        } catch (error) {
            console.error("Error getting documents: ", error);
            throw new Error("Error getting documents");
        }

    }
}

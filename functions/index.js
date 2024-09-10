/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const maintenanceRouter = require('./api/maintenance'); //import maintenance router
const scheduleRouter = require("./api/schedule"); // Import the scheduleRouter
const usersRouter = require('./api/users');
const bookingsRouter = require('./api/bookings');
const venuesRouter = require('./api/venues');

exports.app = functions.https.onRequest(maintenanceRouter);
exports.app = functions.https.onRequest(scheduleRouter);
exports.app = functions.https.onRequest(usersRouter);
exports.app = functions.https.onRequest(bookingsRouter);
exports.app = functions.https.onRequest(venuesRouter);


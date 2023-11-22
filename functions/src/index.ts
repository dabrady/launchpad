/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

const GLOBAL_CONFIG = {
  // NOTE(dabrady) Closest to `eur3`, where our data lives
  region: "europe-west1",
};

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest(GLOBAL_CONFIG, (request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

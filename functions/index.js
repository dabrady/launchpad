/**
 * TODO(dabrady) Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

import * as dotenv from "dotenv";
import { App } from "octokit";
// import { createNodeMiddleware } from "@octokit/webhooks";
import * as fs from "fs";
// import http from "http";

dotenv.config();
const appId = process.env.APP_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const app = new App({
  appId: appId,
  privateKey: privateKey,
  webhooks: {
    secret: webhookSecret,
  },
});

const GLOBAL_CONFIG = {
  // NOTE(dabrady) Closest to `eur3`, where our data lives
  region: "europe-west1",
};

app.webhooks.on(
  "pull_request.opened",
  async function handlePullRequestOpened({ /* octokit, */ payload }) {
    console.log(`
      Received a pull request event for #${payload.pull_request.number}
    `.trim());
  },
);
app.webhooks.onError(function failGracefully(error) {
  if (error.name === "AggregateError") {
    console.error(`Error processing request: ${error.event}`);
  } else {
    console.error(error);
  }
});

export const helloWorld = onRequest(GLOBAL_CONFIG, (request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  return app.webhooks.verifyAndReceive(request)
    .then(function doTheThing() {
      response.status(200).send("Webhook handled");
    })
    .catch(function uhOh(err) {
      logger.error(err);
      response.status(500).send("Webhook processing failed");
    });
});

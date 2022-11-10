import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

const defaultRegion = 'europe-west2';
export const dbRef = admin.firestore().doc('tokens/demo');

import { generateOAuth2AuthLink, generateTweet, loginWithOAuth2 } from "./twitter";

export const auth = functions.region(defaultRegion).https.onRequest(async (request, response) => {
    const url = await generateOAuth2AuthLink();

    response.redirect(url);
});

export const callback = functions.region(defaultRegion).https.onRequest(async (request, response) => {
    const { state, code } = request.query;

    if (!code || !state)
        response.sendStatus(400);
    else {

        const tokens = await loginWithOAuth2(state.toString(), code.toString())

        if (tokens)
            response.sendStatus(200);
        else
            response.sendStatus(500);
    }
});

export const dailyTweet = functions.region(defaultRegion).pubsub.schedule('0 8,13,18 * * *').timeZone('Europe/Berlin').onRun(async () => {
    await generateTweet();
});
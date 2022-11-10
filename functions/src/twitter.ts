import { dbRef } from ".";
import { TwitterApi } from "twitter-api-v2";
import { openai } from "./openai";

export const twitterClient = new TwitterApi({
    clientId: 'VTh4QVM3Z3oxUmpvODVpQTJIYjI6MTpjaQ',
    clientSecret: 'Dxdg4vuuV12p2njBnObBsY5KQL-OrOhWe3btNu1dLzLhhjWihd'
});
export const callbackURL = 'http://127.0.0.1:5000/twitterbot-f099e/europe-west2/callback';

export async function generateOAuth2AuthLink(scope: string[] = ['tweet.read', 'tweet.write', 'users.read', 'offline.access']) {
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(callbackURL, {
        scope
    });

    await dbRef.set({ codeVerifier, state });

    return url;
}

export async function refreshOAuthToken(): Promise<TwitterApi> {
    const data: any = (await dbRef.get()).data();
    const { refreshToken } = data;

    const {
        client: refreshedClient,
        accessToken,
        refreshToken: newRefreshToken
    } = await twitterClient.refreshOAuth2Token(refreshToken);

    await dbRef.set({ accessToken, refreshToken: newRefreshToken });

    return refreshedClient;
}

export async function loginWithOAuth2(state: string, code: string) {
    if (code && state) {
        const dbSnapshot = await dbRef.get();
        const data: any = dbSnapshot.data();
        const { codeVerifier, state: storedState } = data;

        if (state !== storedState) {
            return null;
        }

        const {
            // client: loggedClient,
            accessToken,
            refreshToken
        } = await twitterClient.loginWithOAuth2({
            code: code.toString(),
            codeVerifier,
            redirectUri: callbackURL
        });

        await dbRef.set({ accessToken, refreshToken });

        return { accessToken, refreshToken };
    }

    return null;
}

export async function postTweet(message: string): Promise<{ id: string, text: string } | null> {
    if (message) {
        const refreshedClient = await refreshOAuthToken();
        if (refreshedClient) {
            const { data: tweetData } = await refreshedClient.v2.tweet(
                message
            );

            return tweetData;
        }
    }

    return null;
}

export async function generateTweet(prompt: string = 'tweet somthing cool for #techtwitter'): Promise<{ id: string, text: string } | null> {
    const nextTweet = await openai.createCompletion('text-curie-001', {
        prompt,
        max_tokens: 64
    });

    if (nextTweet && nextTweet.data && nextTweet.data.choices) {
        const message = nextTweet.data.choices[0].text;

        if (message) {
            return await postTweet(message);
        }
    }

    return null;
}
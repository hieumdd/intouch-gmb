import { google } from 'googleapis';

import * as AccountRepository from '../business/business.repository';
import { logger } from '../../logging.service';

export const oauth2Client = () => {
    const client = new google.auth.OAuth2({
        clientId: <string>process.env.GOOGLE_CLIENT_ID,
        clientSecret: <string>process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URI,
    });

    client.on('tokens', async (token) => {
        logger.debug({ token });
        const info = await client.getTokenInfo(<string>token.access_token);
        await AccountRepository.set(<string>info.email, token);
    });

    return client;
};

export const getAuthorizationURL = async () => {
    const scope = ['email', 'https://www.googleapis.com/auth/business.manage'];
    return oauth2Client().generateAuthUrl({ scope, access_type: 'offline', prompt: 'consent' });
};

export const exchangeCodeForToken = async (code: string) => {
    const { tokens: token } = await oauth2Client().getToken(code);
    return token;
};

export const getClient = async (accountId: string) => {
    const existingToken = (await AccountRepository.getOne(accountId)).data()!;
    const client = oauth2Client();
    client.setCredentials(existingToken);
    return client;
};

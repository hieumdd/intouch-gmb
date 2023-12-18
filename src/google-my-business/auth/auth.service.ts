import { google } from 'googleapis';

import { logger } from '../../logging.service';
import * as AccountRepository from '../business/business.repository';

export const oauth2Client = () => {
    const client = new google.auth.OAuth2({
        clientId: <string>process.env.GOOGLE_CLIENT_ID,
        clientSecret: <string>process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: `${process.env.PUBLIC_URL}/authorize/callback`,
    });

    client.on('tokens', async (token) => {
        logger.debug({ token });
        const info = await client.getTokenInfo(<string>token.access_token);
        await AccountRepository.set(<string>info.email, token);
    });

    return client;
};

export const getAuthorizationURL = () => {
    const scope = [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/business.manage',
    ];
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

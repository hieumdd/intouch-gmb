import axios from 'axios';
import axiosThrottle from 'axios-request-throttle';

import { getSecret } from '../../secret-manager.service';

export const getToken = async (refreshToken: string) => {
    type Token = {
        access_token: string;
    };

    const [clientId, clientSecret] = await Promise.all(
        ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'].map((name) => getSecret(name)),
    );

    return axios
        .request<Token>({
            method: 'POST',
            url: 'https://oauth2.googleapis.com/token',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: {
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            },
        })
        .then((response) => response.data);
};

export const getAuthClient = async (refreshToken: string) => {
    return getToken(refreshToken).then(({ access_token }) => {
        const client = axios.create({
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
        });

        axiosThrottle.use(axios, { requestsPerSecond: 5 });

        return client;
    });
};

import axios from 'axios';

import { configs } from '../../pipeline/account.const';
import { getToken, getAuthClient } from './auth.service';

describe('auth', () => {
    let refreshToken: string;

    beforeAll(async () => {
        refreshToken = await configs[0].getRefreshToken();
    });

    it('get-token', async () => {
        return getToken(refreshToken)
            .then((result) => {
                console.log(result.access_token);
                expect(result.access_token).toBeTruthy();
            })
            .catch((error) => {
                axios.isAxiosError(error) && console.log(error.response?.data);
                return Promise.reject(error);
            });
    });

    it('get-accounts', async () => {
        return getAuthClient(refreshToken).then((client) => {
            return client
                .request({
                    method: 'GET',
                    url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
                })
                .then((response) => response.data)
                .then((data) => {
                    console.log({ data });
                    expect(data).toBeDefined();
                });
        });
    });
});

import axios from 'axios';

import { getToken, getAuthClient } from './auth.service';

it('get-token', async () => {
    return getToken()
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
    return getAuthClient().then((client) => {
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

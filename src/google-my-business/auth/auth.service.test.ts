import axios from 'axios';

import { getToken } from './auth.service';

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

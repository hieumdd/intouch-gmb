import { AxiosInstance } from 'axios';

import { getAuthClient } from '../auth/auth.service';
import { getLocations } from './location.service';

describe('location', () => {
    let client: AxiosInstance;
    const accountId = `108405109682017952426`;

    beforeAll(async () => {
        client = await getAuthClient();
    });

    it('get-locations', async () => {
        return getLocations(client, { accountId })
            .then((locations) => {
                console.log(locations);
                locations.forEach((location) => {
                    expect(location.name).toBeTruthy();
                    expect(location.title).toBeTruthy();
                });
            })
            .catch((error) => {
                console.error(error);
                return Promise.reject(error);
            });
    });
});

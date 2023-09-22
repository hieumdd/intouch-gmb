import { AxiosInstance } from 'axios';

import { getAuthClient } from '../auth/auth.service';
import { getLocations } from './location.service';
import { ACCOUNT_IDS } from '../../pipeline/pipeline.service';

describe('location', () => {
    let client: AxiosInstance;

    beforeAll(async () => {
        client = await getAuthClient();
    });

    describe('get-locations', () => {
        it.each(ACCOUNT_IDS)('get-locations-%p', async (accountId) => {
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

    it('locations', async () => {
        const accountId = `108405109682017952426`;
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

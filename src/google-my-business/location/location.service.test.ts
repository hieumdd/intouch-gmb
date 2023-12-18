import { getClient } from '../auth/auth.service';
import { getLocations } from './location.service';

it('getLocations', async () => {
    const accountId = 'intouchvet1@gmail.com';
    const client = await getClient(accountId);

    return await getLocations(client, { accountId })
        .then((locations) => expect(locations).toBeDefined())
        .catch((error) => {
            console.error(error);
            throw error;
        });
});

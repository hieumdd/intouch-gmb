import { getAll } from '../business/business.repository';
import { getAuthorizationURL, getClient } from './auth.service';

it('getAuthorizationURL', () => {
    const url = getAuthorizationURL();
    expect(url).toBeDefined();
});

it('getClient`', async () => {
    const accounts = await getAll();
    return await Promise.all(accounts.map((account) => getClient(account.id))).catch((error) => {
        console.error(error);
        throw error;
    });
});

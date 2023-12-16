import { getAuthorizationURL, getClient } from './auth.service';
import { getAll } from '../business/business.repository';

it('getAuthorizationURL', () => {
    const url = getAuthorizationURL();
    expect(url).toBeDefined();
});

it('getClient`', async () => {
    const accounts = await getAll();
    return await Promise.all(accounts.map((account) => getClient(account.id)));
});

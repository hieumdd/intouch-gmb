import { oauth2Client } from '../auth/auth.service';
import { Account } from './account.type';

export const getAccounts = async () => {
    const get = async (cursor?: string): Promise<Account[]> => {
        const { accounts, pageToken } = await oauth2Client
            .request<{ accounts: Account[]; pageToken?: string }>({
                method: 'GET',
                url: 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
                params: { pageToken: cursor },
            })
            .then((response) => response.data);

        return pageToken ? [...accounts, ...(await get(pageToken))] : accounts;
    };
    
    return await get().then((accounts) => {
        return accounts.map((account) => {
            const [_, accountId] = account.name.split('/');
            return { ...account, accountId };
        });
    });
};

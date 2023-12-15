import { OAuth2Client } from 'google-auth-library';

import { Location } from './location.type';

type GetLocationsOptions = {
    accountId: string;
};

export const getLocations = async (client: OAuth2Client, { accountId }: GetLocationsOptions) => {
    const get = async (pageToken?: string): Promise<Location[]> => {
        const { data } = await client.request<{ locations: Location[]; nextPageToken?: string }>({
            url: `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations`,
            params: {
                readMask: ['name', 'title', 'storeCode', 'storefrontAddress.addressLines'].join(','),
                pageSize: 100,
                pageToken,
            },
        });
        const { nextPageToken, locations = [] } = data;

        return nextPageToken ? [...locations, ...(await get(nextPageToken))] : locations;
    };

    return await get().then((locations) => {
        return locations.map((location) => {
            const [_, locationId] = location.name.split('/');
            return { ...location, locationId };
        });
    });
};

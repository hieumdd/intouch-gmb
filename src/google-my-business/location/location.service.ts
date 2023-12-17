import { OAuth2Client } from 'google-auth-library';
import { GaxiosError } from 'gaxios';

import { logger } from '../../logging.service';
import { Location } from './location.type';

type GetLocationsOptions = {
    accountId: string;
};

export const getLocations = async (client: OAuth2Client, { accountId }: GetLocationsOptions) => {
    const get = async (pageToken?: string): Promise<Location[]> => {
        const { locations = [], nextPageToken } = await client
            .request<{ locations: Location[]; nextPageToken?: string }>({
                url: `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations`,
                params: {
                    readMask: ['name', 'title', 'storeCode', 'storefrontAddress.addressLines'].join(','),
                    pageSize: 100,
                    pageToken,
                },
            })
            .then((response) => response.data)
            .catch((error) => {
                if (error instanceof GaxiosError && error.status === 403) {
                    logger.warn({ fn: 'getLocations', status: error.status, accountId });
                    return { locations: [], nextPageToken: undefined };
                }
                throw error;
            });

        return nextPageToken ? [...locations, ...(await get(nextPageToken))] : locations;
    };

    return await get().then((locations) => {
        return locations.map((location) => {
            const [_, locationId] = location.name.split('/');
            return { ...location, locationId };
        });
    });
};

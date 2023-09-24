import { AxiosInstance } from 'axios';

type GetReviewsOptions = {
    accountId: string;
    location: string;
};

type Review = Record<string, string>;

type ReviewsResponse = {
    reviews: Review[];
    nextPageToken?: string;
};

export const getReviews = async (client: AxiosInstance, options: GetReviewsOptions) => {
    const { accountId, location } = options;

    const _get = async (pageToken?: string): Promise<Review[]> => {
        const { reviews, nextPageToken } = await client
            .request<ReviewsResponse>({
                method: 'GET',
                url: `https://mybusiness.googleapis.com/v4/accounts/${accountId}/${location}/reviews`,
                params: { pageToken },
            })
            .then((response) => response.data);

        return nextPageToken ? [...reviews, ...(await _get(nextPageToken))] : reviews || [];
    };

    return _get().then((rows) => (rows || []).map((row) => ({ ...row, accountId, locationId: location })));
};

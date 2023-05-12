import axios from 'axios';

import { runPipelines } from './pipeline.service';

it('pipeline', async () => {
    return runPipelines({ start: '2023-01-01', end: '2024-01-01' })
        .then((results) => {
            console.log(results);
            results.forEach((result) => {
                expect(result.location).toBeGreaterThanOrEqual(0);
                expect(result.insight).toBeGreaterThanOrEqual(0);
                expect(result.review).toBeGreaterThanOrEqual(0);
            });
        })
        .catch((error) => {
            axios.isAxiosError(error) && console.log(error.response?.data);
            return Promise.reject(error);
        });
});

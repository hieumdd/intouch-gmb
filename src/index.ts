import { http } from '@google-cloud/functions-framework';
import express from 'express';

import { locationPipeline, insightPipeline, reviewPipeline } from './pipeline/pipeline.service';
import {
    RunLocationPipelineBodySchema,
    RunInsightPipelineBodySchema,
    RunReviewPipelineBodySchema,
} from './pipeline.request.dto';
import { LOCATION_ROUTE, INSIGHT_ROUTE, REVIEW_ROUTE } from './route.const';

const app = express();

app.post(LOCATION_ROUTE, ({ body }, res) => {
    RunLocationPipelineBodySchema.validateAsync(body)
        .then((options) => {
            locationPipeline(options)
                .then((result) => res.status(200).json({ result }))
                .catch((error) => {
                    console.log(JSON.stringify({ severity: 'ERROR', error }));
                    res.status(500).json({ error });
                });
        })
        .catch((error) => {
            console.log(JSON.stringify({ severity: 'WARN', error }));
            res.status(400).json({ error });
        });
});

app.post(INSIGHT_ROUTE, ({ body }, res) => {
    RunInsightPipelineBodySchema.validateAsync(body)
        .then((options) => {
            insightPipeline(options)
                .then((result) => res.status(200).json({ result }))
                .catch((error) => {
                    console.log(JSON.stringify({ severity: 'ERROR', error }));
                    res.status(500).json({ error });
                });
        })
        .catch((error) => {
            console.log(JSON.stringify({ severity: 'WARN', error }));
            res.status(400).json({ error });
        });
});

app.post(REVIEW_ROUTE, ({ body }, res) => {
    RunReviewPipelineBodySchema.validateAsync(body)
        .then((options) => {
            reviewPipeline(options)
                .then((result) => res.status(200).json({ result }))
                .catch((error) => {
                    console.log(JSON.stringify({ severity: 'ERROR', error }));
                    res.status(500).json({ error });
                });
        })
        .catch((error) => {
            console.log(JSON.stringify({ severity: 'WARN', error }));
            res.status(400).json({ error });
        });
});

http('main', app);

import { http } from '@google-cloud/functions-framework';
import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Joi from 'joi';

dayjs.extend(utc);

import {
    LocationPipelineOptions,
    InsightPipelineOptions,
    ReviewPipelineOptions,
    locationPipeline,
    insightPipeline,
    reviewPipeline,
} from './pipeline/pipeline.service';
import { LOCATION_ROUTE, INSIGHT_ROUTE, REVIEW_ROUTE } from './route.const';

const app = express();

app.post(LOCATION_ROUTE, ({ body }, res) => {
    const schema = Joi.object<LocationPipelineOptions>({
        start: Joi.string()
            .allow(null)
            .empty(null)
            .default(dayjs.utc().subtract(1, 'year').format('YYYY-MM-DD')),
        end: Joi.string().allow(null).empty(null).default(dayjs.utc().format('YYYY-MM-DD')),
    });

    schema
        .validateAsync(body)
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
    const schema = Joi.object<InsightPipelineOptions>({
        accountId: Joi.string().required(),
        locationId: Joi.string().required(),
        start: Joi.string().required(),
        end: Joi.string().required(),
    });

    schema
        .validateAsync(body)
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
    const schema = Joi.object<ReviewPipelineOptions>({
        accountId: Joi.string().required(),
        location: Joi.string().required(),
    });

    schema
        .validateAsync(body)
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

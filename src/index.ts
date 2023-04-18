import { http } from '@google-cloud/functions-framework';
import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Joi from 'joi';

dayjs.extend(utc);

import { RunPipelinesOptions, runPipelines } from './google-my-business/pipeline/pipeline.service';

const app = express();

app.post('/', ({ body }, res) => {
    Joi.object<RunPipelinesOptions>({
        start: Joi.string()
            .allow(null)
            .empty(null)
            .custom((value) => (value ? dayjs.utc(value) : dayjs.utc().subtract(1, 'year'))),
        end: Joi.string()
            .allow(null)
            .empty(null)
            .custom((value) => (value ? dayjs.utc(value) : dayjs.utc())),
    })
        .validateAsync(body)
        .then((options) => {
            runPipelines(options)
                .then((result) => res.status(200).json({ result }))
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(400).json({ error }));
});

http('main', app);

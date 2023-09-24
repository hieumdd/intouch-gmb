import dayjs from '../dayjs';
import Joi from 'joi';

import { RunLocationPipelineOptions, RunInsightPipelineOptions, RunReviewPipelineOptions } from './pipeline.service';

export const RunLocationPipelineBodySchema = Joi.object<RunLocationPipelineOptions>({
    refreshToken: Joi.string(),
    accountIds: Joi.array().items(Joi.string()),
    start: Joi.string().allow(null).empty(null).default(dayjs.utc().subtract(1, 'year').format('YYYY-MM-DD')),
    end: Joi.string().allow(null).empty(null).default(dayjs.utc().format('YYYY-MM-DD')),
});

export const RunInsightPipelineBodySchema = Joi.object<RunInsightPipelineOptions>({
    refreshToken: Joi.string(),
    accountId: Joi.string().required(),
    locationId: Joi.string().required(),
    start: Joi.string().required(),
    end: Joi.string().required(),
});

export const RunReviewPipelineBodySchema = Joi.object<RunReviewPipelineOptions>({
    refreshToken: Joi.string(),
    accountId: Joi.string().required(),
    location: Joi.string().required(),
});

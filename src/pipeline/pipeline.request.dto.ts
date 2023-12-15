import Joi from 'joi';

import { RunInsightPipelineOptions, RunReviewPipelineOptions } from './pipeline.service';

export const RunInsightPipelineBodySchema = Joi.object<RunInsightPipelineOptions>({
    businessId: Joi.string().required(),
    accountId: Joi.string().required(),
    locationId: Joi.string().required(),
});

export const RunReviewPipelineBodySchema = Joi.object<RunReviewPipelineOptions>({
    businessId: Joi.string().required(),
    accountId: Joi.string().required(),
    locationId: Joi.string().required(),
});

import Joi from 'joi';
import { ContainerTypes, ValidatedRequestSchema } from 'express-joi-validation';

export type CallbackQuery = { code: string };

export interface CallbackQueryRequest extends ValidatedRequestSchema {
    [ContainerTypes.Query]: CallbackQuery;
}

export const CallbackQuerySchema = Joi.object<CallbackQuery>({ code: Joi.string().required() });

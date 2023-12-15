import Joi from 'joi';

export const CallbackQuerySchema = Joi.object<{ code: string }>({
    code: Joi.string(),
});

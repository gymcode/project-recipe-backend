import Joi from "joi"

export const RegistrationSchema = Joi.object({
    username:  Joi.string().alphanum().min(3).max(30).required(),
    msisdn: Joi.string().min(9).max(14),
    countryCode: Joi.string(),
    isoCode: Joi.string()   
})

const UpdateUserSchema = Joi.object({
    username:  Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    gender: Joi.string()
})


module.exports = {RegistrationSchema, UpdateUserSchema}


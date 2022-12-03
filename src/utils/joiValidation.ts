import Joi from "joi"

export const RegistrationSchema = Joi.object({
    firstName:  Joi.string().alphanum().min(3).max(30).required(),
    otherNames:  Joi.string().alphanum().min(3).max(30).required(),
    password:  Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    confirmPassword: Joi.ref("password"),
    msisdn: Joi.string().min(9).max(14),
    countryCode: Joi.string(),
    isoCode: Joi.string()   
}).with("password", "confirmPassword")

export const UpdateUserSchema = Joi.object({
    username:  Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    gender: Joi.string()
})



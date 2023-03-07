export interface RegisterDTO {
    msisdn: string,
    countryCode: string,
    firstName: string,
    otherNames: string,
    password: string,
    confirmPassword: string,
    isoCode: string,
    isEmailVerification: boolean
}

export interface LoginDTO {
    msisdn: string,
    countryCode: string,
    password:string,
}

export interface ConfirmOTPDTO{
    msisdn: string,
    code: string,
    countryCode: string
}

export interface ResendDTO{
    msisdn: string,
    countryCode: string,
}

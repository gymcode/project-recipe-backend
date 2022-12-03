const AfricasTalking = require("africastalking")
const axios = require("axios")

async function SendSms(msisdn: string, message: string){
    const africastalking = AfricasTalking({
        apiKey: process.env.AFRICATALKING_API_KEY,
        username: process.env.AFRICASTALKING_USERNAME
    })

    try {
        const response = await africastalking.SMS.send({
            to: `+233268211334`,
            message: message,
            from: 'axlxyt'
        })
        console.log(response)
    } catch (error) {
        console.error(error)
    }
}

export async function NaloSendSms(msisdn: string, message: string){
    try {
        const authKey = process.env.NALO_SMS_AUTH_KEY
        const smsUri = `https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/?key=${authKey}&type=0&destination=${msisdn}&dlr=1&source=Chopmoney&message=${message}`
        // smsUri = `https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/?username=${username}&password=${password}&type=0&destination=233268211334&dlr=1&source=NALO&message=${message}`
        const response = await axios.get(smsUri)
        console.log(response.data)
    } catch (error) {
        console.error(error)
    }
}

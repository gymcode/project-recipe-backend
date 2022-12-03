import jwt, {Secret} from 'jsonwebtoken'

const ACCESS_SCRETE_KEY: Secret = String(process.env.ACCESS_TOKEN_SECRET)

export async function signJwtWebToken(user:any, client: any){
    const accessToken = jwt.sign(
        {_id: user._id}, 
        ACCESS_SCRETE_KEY,
        {expiresIn: "20s"}
    )

    await client.set(accessToken, JSON.stringify({active: true}))
    return accessToken
}

export function verifySignedJwtWebToken(token: string, secret: Secret){
    try {
        const payload: any = jwt.verify(token, secret)
        return {payload, error: false, expired: false};
    } catch (error:any) {
        return {
            payload: null, 
            error: error.message, 
            expired: error.message.includes("jwt expired")} 
    }
}


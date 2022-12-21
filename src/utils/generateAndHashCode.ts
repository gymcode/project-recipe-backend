import client from "../config/redis";
import { CodeHash } from "../security/passwordSecurity";
import { getMinutes } from "./dateTimeHelpers";

export async function GenerateAndStoreCode(code: string, user: any){
    const codeHash = CodeHash(code) 
    const storageKey = `${user._id}_OTP`;

    const expiryDate = getMinutes(5);
    const otpStorageObject = {
      code: codeHash,
      expire_at: expiryDate,
    };
    console.log(`otp storage object to be store in redis ${otpStorageObject}`)

    await client.set(storageKey, JSON.stringify(otpStorageObject));
}
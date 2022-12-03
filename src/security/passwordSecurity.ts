import bcrypt from "bcryptjs";

export function CodeHash(plainCode: string){
    const genSalt = bcrypt.genSaltSync(10)
    const codeHash = bcrypt.hashSync(plainCode, genSalt);
    return codeHash
}

export function CodeHashVerification(plainCode: string, hashCode: string){
    return bcrypt.compareSync(plainCode, hashCode)
}
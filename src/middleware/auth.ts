import * as jwt from 'jsonwebtoken';
export interface AuthTokenPayload{
    userId:number
}
export const auth = (header:string): AuthTokenPayload=>{
    const token = header    //Checking if the user is logged in and authenticated
    if(!token) {
        throw new Error('User not authenticated')
    }
    return jwt.verify(     //Verifying the token and returning the payload
        token,
        process.env.TOKEN_SECRET as jwt.Secret 
    )as AuthTokenPayload
}
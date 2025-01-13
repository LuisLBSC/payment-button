const jwt = require('jsonwebtoken');


export const generateJWT = (id : number) => {
    return new Promise((resolve, reject) =>{
        const payload = {id};
        jwt.sign(payload, process.env.SECRETKEY, {
            expiresIn: '4h'
        }, ( error: unknown, token: String ) =>{
            if (error){
                console.log(error);
                reject( 'Error generating token' )
            } else {
                resolve(token);
            }
           
        })
    })
}
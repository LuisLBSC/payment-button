import bcrypt from 'bcryptjs';

export const encryptPassword = async(password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const encryptedPassword = bcrypt.hashSync(password, salt);
    return encryptedPassword;
}


export const validatePassword = async(password: string, hash: string) => {
    const validPassword = bcrypt.compareSync(password, hash);
    return validPassword ? true : false;
}
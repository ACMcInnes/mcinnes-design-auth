import jwt from "jsonwebtoken";

export default async function decodeJSON(data: string) {
    try {
        const decoded = jwt.verify(data, `${process.env.JWT_SECRET}`);
        return decoded;        
    } catch (error) {
        throw new Error(`${error}`)
    }
}

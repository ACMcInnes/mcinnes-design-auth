import jwt from "jsonwebtoken";

export default async function encodeJSON(data: object) {
    const token = jwt.sign(data, `${process.env.JWT_SECRET}`, { expiresIn: "7d" });
    // console.log(`encoded JWT: ${token}`)
    return token;
}

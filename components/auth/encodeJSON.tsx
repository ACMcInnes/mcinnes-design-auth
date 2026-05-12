import jwt from "jsonwebtoken";

export default async function encodeJSON(data: object) {
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();

  const token = jwt.sign(data, `${process.env.JWT_SECRET}`, {
    expiresIn: `${daysInMonth}d`,
  });
  // console.log(`encoded JWT: ${token}`)
  return token;
}

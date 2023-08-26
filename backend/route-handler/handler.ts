import { NextApiRequest, NextApiResponse } from "next";
import jwt from 'jsonwebtoken';
import { serialize, CookieSerializeOptions } from 'cookie';

import { ResLogin } from "../../type/ResLogin";
import { LoginRequest } from "../../type/LoginRequest";
import { loginService } from "../service/loginService";
import { ResLoginStatus } from "../../type/ResLoginStatus";
import { LoginStatusRequest } from "../../type/LoginStatusRequest";
import { getTokenPlayloadAndValidateUser } from "../../utils/AuthHelpers";

const JWT_SECRETE = process.env.JWT_SECRETE || "$iF8LM~}.=6!WSKLAl<+3|{F%z0iu]";

export const loginHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResLogin>,
) => {
  // Authenticate user
  const loginReq = req.body as LoginRequest
  const { isAuthenticated } = await loginService(loginReq)

  if (!isAuthenticated) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  // Generate JWT token
  const token = jwt.sign({ user: loginReq.data.pubKey }, JWT_SECRETE, { expiresIn: '24h' });


  const cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 1 day
  };

  // Serialize cookie and set it in response header
  const cookieString = serialize('playdegen-token', token, cookieOptions);
  res.setHeader('Set-Cookie', cookieString);

  res.status(200).json({ message: 'Login successful', token });
}


export const loginStatusHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResLoginStatus>
) => {
  const reqBody = req.body as LoginStatusRequest
  const tokenObj = getTokenPlayloadAndValidateUser(req, res, reqBody.data.pubKey)

  if (tokenObj) {
    return res.status(200).json({ message: "success", status: "1", pdtok: req.cookies["playdegen-token"] });
  }
  res.status(401).send({ message: 'Unauthorized', status: "0" });
}


export const logoutHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResLogin>,
) => {
  const cookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0 // Set maxAge to 0 to expire the cookie
  };

  const cookieString = serialize('playdegen-token', '', cookieOptions); // Set an empty string as the cookie value to expire it
  res.setHeader('Set-Cookie', cookieString);

  res.status(200).json({ message: 'Logout successful' });
}


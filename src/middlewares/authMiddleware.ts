import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction} from "express";
export interface IGetUserAuthInfoRequest extends Request {
  user: string // or any other type
  data: object
}

function getToken(req:Request) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } 
  return null;
}
const isTokenExpired = (token: any) => (Date.now() >= JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).exp * 1000);
const authenticateJWT = (req:IGetUserAuthInfoRequest, res:Response, next:NextFunction) => {

  const {token} = req.body.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  jwt.verify(token, process.env.JWT_SECRET as string, (err:any, user:any) => {
    if(isTokenExpired(token)) {
      return res.status(401).json({ message: 'Jwt Expired' });
    }
    else if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    const obj = JSON.stringify(req.body);
    const obj2 = JSON.parse(obj);
    req.data = obj2.data;
    next();
  });
};




const authenticateJWTGet = (req:IGetUserAuthInfoRequest, res:Response, next:NextFunction) => {
  let t = getToken(req) as string;
  let {token} = JSON.parse(t);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  jwt.verify(token, process.env.JWT_SECRET as string, (err:any, user:any) => {
    if(isTokenExpired(token)) {
      return res.status(401).json({ message: 'Jwt Expired' });
    }
    else if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
}


export { authenticateJWT,  authenticateJWTGet};

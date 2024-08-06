import { check, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';


export const registerValidation = [
    check('email', 'the email must be a valid email address').isEmail(),
    check('email', 'the email must exists').exists(),
    check('email', 'the email must be string').isString(),
    check('password', 'the password must exists').exists(),
    check('password', 'the password field is required to be at least 8 characters long').isLength({ min: 8 }),
    check('password', 'the password needs to be a string').isString()
  ];
  
export function handleRegisterValidationErrors(req:Request, res:Response, next:NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).json({ errors: errors.array() });
    }
  
    next();
  };
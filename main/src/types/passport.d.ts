// Type definitions for passport modules
declare module 'passport' {
  import { IncomingMessage, ServerResponse } from 'http';
  
  namespace passport {
    interface User {
      id: string;
      name: string;
      email: string;
      [key: string]: any;
    }
    
    interface AuthenticateOptions {
      session?: boolean;
      scope?: string | string[];
      [key: string]: any;
    }
    
    interface Authenticator {
      initialize(): (req: any, res: any, next: any) => void;
      authenticate(strategy: string, options?: AuthenticateOptions, callback?: (err: any, user: any, info?: any) => void): (req: any, res: any, next?: any) => void;
      serializeUser(fn: (user: any, done: (err: any, id?: any) => void) => void): void;
      deserializeUser(fn: (id: any, done: (err: any, user?: any) => void) => void): void;
      use(strategy: any): void;
      _serializers: any[];
    }
    
    const authenticate: Authenticator['authenticate'];
    const initialize: Authenticator['initialize'];
    const serializeUser: Authenticator['serializeUser'];
    const deserializeUser: Authenticator['deserializeUser'];
    const use: Authenticator['use'];
    const _serializers: Authenticator['_serializers'];
  }
  
  export = passport;
}

declare module 'passport-google-oauth20' {
  import { Request } from 'express';
  
  export interface Profile {
    id: string;
    displayName: string;
    name: { familyName: string; givenName: string };
    emails?: Array<{ value: string; type?: string }>;
    photos?: Array<{ value: string }>;
    _json: any;
    [key: string]: any;
  }
  
  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    passReqToCallback?: boolean;
    profileFields?: string[];
    [key: string]: any;
  }
  
  export interface VerifyCallback {
    (error: any, user?: any, info?: any): void;
  }
  
  export interface VerifyFunction {
    (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): void;
  }
  
  export class Strategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
    authenticate(req: Request, options?: any): void;
  }
}

declare module 'passport-facebook' {
  import { Request } from 'express';
  
  export interface Profile {
    id: string;
    displayName: string;
    name: { familyName: string; givenName: string };
    emails?: Array<{ value: string; type?: string }>;
    photos?: Array<{ value: string }>;
    _json: any;
    [key: string]: any;
  }
  
  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    passReqToCallback?: boolean;
    profileFields?: string[];
    [key: string]: any;
  }
  
  export interface VerifyCallback {
    (error: any, user?: any, info?: any): void;
  }
  
  export interface VerifyFunction {
    (req: Request, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback): void;
  }
  
  export class Strategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
    authenticate(req: Request, options?: any): void;
  }
}

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    [key: string]: any;
  }
  
  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: {
      algorithm?: string;
      expiresIn?: string | number;
      notBefore?: string | number;
      audience?: string | string[];
      issuer?: string;
      jwtid?: string;
      subject?: string;
      noTimestamp?: boolean;
      header?: object;
      keyid?: string;
      [key: string]: any;
    }
  ): string;
  
  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: {
      algorithms?: string[];
      audience?: string | RegExp | Array<string | RegExp>;
      clockTimestamp?: number;
      clockTolerance?: number;
      complete?: boolean;
      issuer?: string | string[];
      ignoreExpiration?: boolean;
      ignoreNotBefore?: boolean;
      jwtid?: string;
      subject?: string;
      maxAge?: string | number;
      [key: string]: any;
    }
  ): JwtPayload | string;
  
  export class JsonWebTokenError extends Error {
    constructor(message: string);
  }
  
  export class TokenExpiredError extends JsonWebTokenError {
    constructor(message: string, expiredAt: Date);
    expiredAt: Date;
  }
  
  export class NotBeforeError extends JsonWebTokenError {
    constructor(message: string, date: Date);
    date: Date;
  }
}

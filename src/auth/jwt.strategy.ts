// import { Injectable } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { ExtractJwt, Strategy } from "passport-jwt";

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//     constructor() {
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             ignoreExpiration: false,
//             secretOrKey: 'secretKey', // Use the same secret key as in JwtModule
//         });
//     }

//     async validate(payload: any) {
//         return { userId: payload.sub, email: payload.email, role: payload.role };
//     }
    
// }


import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'secretKey', // Use the same secret key as in JwtModule
        });
    }

    async validate(payload: any) {
        return { 
            userId: payload.sub, 
            email: payload.email, 
            role: payload.role,
            tenant_id: payload.tenant_id, // Include tenant_id in validated user
            walletAddress: payload.walletAddress // For wallet users
        };
    }
}
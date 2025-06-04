import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UnauthorizedException } from "@nestjs/common/exceptions/unauthorized.exception";

@Injectable() 
export class JwtAuthGuard extends AuthGuard("jwt") {
    handleRequest(err: any, user: any) {
        if (err || !user) {
            throw err || new UnauthorizedException();
        }
        return user;
    }
}
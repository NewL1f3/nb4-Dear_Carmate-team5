// src/middlewares/auth.ts
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: payload.id },
            });
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    })
);

export const authenticate = passport.authenticate('jwt', { session: false });
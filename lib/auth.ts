import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { Resend } from "resend";
import { VerificationEmail } from '@/emails/verification';
import { PasswordResetEmail } from '@/emails/password-reset';
import { roles } from '@/app/generated/prisma/enums'


const resend = new Resend(process.env.RESEND_API_KEY as string);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      void resend.emails.send({
        from: 'obsd-device-db@notifications.jakemsr.dev',
        to: [user.email],
        subject: 'Reset your password',
        react: PasswordResetEmail({ resetUrl: url }),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void resend.emails.send({
        from: 'obsd-device-db@notifications.jakemsr.dev',
        to: [user.email],
        subject: 'Verify your email address',
        react: VerificationEmail({ verificationUrl: url }),
      });
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact",
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          firstName: profile.name.split(" ")[0],
          lastName: profile.name.split(" ")[1],
        };
      },
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
        defaultValue: "",
        input: true,
      },
      lastName: {
        type: "string",
        required: true,
        defaultValue: "",
        input: true,
      },
      role: {
        type: Object.values(roles),
        required: true,
        defaultValue: "user",
        input: false,  // don't allow user to set role
      },
    },
  },
});

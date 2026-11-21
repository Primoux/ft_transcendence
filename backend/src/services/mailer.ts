import nodemailer from "nodemailer"
import { OtpType } from "../../generated/enums.ts"
export const emailDetails: Record<OtpType, { subject: string, body: string }> = {
    EMAIL_IS_VALID: { subject: "Confirm your email address", body: "Use this code to confirm your email address." },
    CAN_LOGIN: { subject: "Your login code", body: "Use this code to finish logging in." },
    CAN_DELETE_ACCOUNT: { subject: "Confirm account deletion", body: "Use this code to confirm the deletion of your account." },
    CAN_REQUEST_DATA: { subject: "Confirm your data request", body: "Use this code to confirm your personal data request." },
    CAN_ENABLE_2FA: { subject: "Confirm enabling 2FA", body: "Use this code to turn on two-factor authentication." },
    CAN_DISABLE_2FA: { subject: "Confirm disabling 2FA", body: "Use this code to turn off two-factor authentication." },
    CAN_CHANGE_EMAIL: { subject: "Confirm your email change", body: "Use this code to confirm changing your email address." },
}

const from = process.env['MAIL_FROM']
const host = process.env['SMTP_HOST']
const port = process.env['SMTP_PORT']

if (!from || !host || !port) {
    throw new Error("MAIL_FROM, SMTP_HOST and SMTP_PORT must be defined")
}

const transport = nodemailer.createTransport({host, port: Number(port), secure: false})

export async function sendMail(to: string, subject: string, text: string) {
    await transport.sendMail({from, to, subject, text})
}
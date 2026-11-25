import nodemailer from "nodemailer"
export const CONFIRM_EMAIL_SUBJECT = "Your validation code is "
export const CONFIRM_EMAIL_BODY = "Use it to confirm your email address."

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
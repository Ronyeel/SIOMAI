import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.RESEND_API_KEY) {
  console.warn('Warning: RESEND_API_KEY is not defined in environment variables.');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

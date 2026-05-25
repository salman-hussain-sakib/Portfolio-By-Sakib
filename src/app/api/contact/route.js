import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, subject, message } = body;

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 });
    }

    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('Missing Gmail credentials. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local');
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    // Email to YOU (portfolio owner)
    const mailToOwner = {
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `📩 New Message: ${subject || 'Portfolio Contact'}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#050510;color:#e2e2f0;border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.3);">
          <div style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:30px;text-align:center;">
            <h1 style="margin:0;color:white;font-size:24px;font-weight:800;letter-spacing:2px;">SAKIB PORTFOLIO</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">New Contact Form Submission</p>
          </div>
          <div style="padding:32px;">
            <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:20px;margin-bottom:20px;">
              <p style="margin:0 0 8px;color:#6366f1;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Sender</p>
              <p style="margin:4px 0;font-size:18px;font-weight:700;color:#e2e2f0;">👤 ${firstName} ${lastName || ''}</p>
              <p style="margin:4px 0;font-size:14px;color:#94a3b8;">📧 <a href="mailto:${email}" style="color:#818cf8;text-decoration:none;">${email}</a></p>
            </div>
            <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:20px;margin-bottom:20px;">
              <p style="margin:0 0 8px;color:#6366f1;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Subject</p>
              <p style="margin:0;font-size:16px;font-weight:600;color:#e2e2f0;">📌 ${subject || 'No subject'}</p>
            </div>
            <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:20px;">
              <p style="margin:0 0 12px;color:#6366f1;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Message</p>
              <p style="margin:0;font-size:15px;color:#cbd5e1;line-height:1.8;white-space:pre-wrap;">${message}</p>
            </div>
            <div style="margin-top:24px;text-align:center;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Your message')}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:white;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;">↩️ Reply to ${firstName}</a>
            </div>
          </div>
          <div style="padding:16px;text-align:center;border-top:1px solid rgba(99,102,241,0.15);">
            <p style="margin:0;color:#475569;font-size:12px;">Sent from your portfolio contact form</p>
          </div>
        </div>
      `,
    };

    // Auto-reply to the SENDER
    const mailToSender = {
      from: `"Salman Hussain Sakib" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `✅ Got your message, ${firstName}!`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#050510;color:#e2e2f0;border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.3);">
          <div style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:30px;text-align:center;">
            <h1 style="margin:0;color:white;font-size:24px;font-weight:800;letter-spacing:2px;">SAKIB.AI</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Message Received!</p>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#e2e2f0;font-size:20px;margin:0 0 12px;">Hey ${firstName}! 👋</h2>
            <p style="color:#94a3b8;line-height:1.8;margin:0 0 20px;">Thank you for reaching out! I have received your message and will get back to you within <strong style="color:#818cf8;">24 hours</strong>.</p>
            <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#6366f1;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Message</p>
              <p style="margin:0;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">${message}</p>
            </div>
            <p style="color:#94a3b8;font-size:14px;line-height:1.7;">In the meantime, feel free to connect with me on LinkedIn or check out my latest projects on GitHub.</p>
          </div>
          <div style="padding:16px;text-align:center;border-top:1px solid rgba(99,102,241,0.15);">
            <p style="margin:0;color:#475569;font-size:12px;">— Salman Hussain Sakib | Full Stack Developer</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailToOwner);
    await transporter.sendMail(mailToSender);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}

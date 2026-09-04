const nodemailer = require("nodemailer");

/**
 * Configure Nodemailer Transporter
 * Supports Gmail with App Password or custom SMTP credentials
 */
function createTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        return null;
    }

    // If custom SMTP host is specified
    if (process.env.EMAIL_HOST) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === "true" || Number(process.env.EMAIL_PORT) === 465,
            auth: {
                user: user,
                pass: pass
            }
        });
    }

    // Default: Gmail service
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: user,
            pass: pass.replace(/\s+/g, "") // remove any accidental spaces in 16-character app password
        }
    });
}

/**
 * Send an email with HTML & plain text content
 */
async function sendEmail({ to, subject, html, text, otp, type = "verification" }) {
    const transporter = createTransporter();
    const fromAddress = process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `"Soumyadip Store" <${process.env.EMAIL_USER}>` : '"Soumyadip Store" <noreply@soumyadipstore.com>');

    console.log("\n========================================================");
    console.log(`✉️  [EMAIL NOTIFICATION] (${type.toUpperCase()})`);
    console.log(`➡️  To: ${to}`);
    console.log(`🔢  Code (OTP): ${otp}`);
    console.log(`⏳  Expires: in 5 minutes`);

    if (!transporter) {
        console.log("ℹ️  SMTP is not configured in .env yet.");
        console.log("👉 To send REAL emails to inboxes, add to .env:");
        console.log("    EMAIL_USER=yourgmail@gmail.com");
        console.log("    EMAIL_PASS=your-16-char-app-password");
        console.log("========================================================\n");
        return {
            success: true,
            sent: false,
            message: "SMTP not configured. OTP printed to server terminal for testing.",
            devOtp: otp
        };
    }

    try {
        const info = await transporter.sendMail({
            from: fromAddress,
            to: to,
            subject: subject,
            text: text,
            html: html
        });

        console.log(`✅  Email successfully sent to ${to}! MessageId: ${info.messageId}`);
        console.log("========================================================\n");
        return { success: true, sent: true, messageId: info.messageId };
    } catch (err) {
        console.error("❌  Failed to deliver email via SMTP:", err.message);
        console.log(`ℹ️  OTP was: ${otp} (You can still use this code to proceed)`);
        console.log("========================================================\n");
        return {
            success: true, // Don't crash flow; allow dev fallback
            sent: false,
            error: err.message,
            devOtp: otp
        };
    }
}

/**
 * Send Registration Verification OTP
 */
async function sendRegistrationOtp(email, otp) {
    const subject = `${otp} is your Soumyadip Store verification code`;
    const text = `Welcome to Soumyadip Store!\n\nYour 6-digit registration verification code is: ${otp}\n\nThis code will expire in 5 minutes. If you did not create an account, please ignore this email.`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .wrapper { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #eaeaea; }
        .header { background: linear-gradient(135deg, #ff4d4d, #ff6a00); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 36px 30px; text-align: center; color: #333333; }
        .content h2 { margin: 0 0 12px; font-size: 20px; color: #1e293b; font-weight: 700; }
        .content p { margin: 0 0 24px; font-size: 15px; color: #64748b; line-height: 1.5; }
        .otp-box { display: inline-block; background: #fff5f5; border: 2px dashed #ff4d4d; border-radius: 12px; padding: 18px 36px; margin: 10px auto 25px; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ff4d4d; font-family: 'Courier New', monospace; }
        .badge { display: inline-block; background: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-top: 6px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #eaeaea; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>🛍️ Soumyadip Store</h1>
          <p>Smart Shopping &bull; Fast Delivery &bull; Best Deals</p>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for choosing Soumyadip Store! Please use the one-time verification code below to complete your account registration:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="badge">Valid for 5 minutes</div>
          </div>
          <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">If you did not request this registration, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Soumyadip Store. All rights reserved.<br>
          This is an automated security email. Please do not reply directly.
        </div>
      </div>
    </body>
    </html>
    `;

    return sendEmail({ to: email, subject, html, text, otp, type: "registration" });
}

/**
 * Send Password Reset OTP
 */
async function sendPasswordResetOtp(email, otp) {
    const subject = `${otp} is your password reset code for Soumyadip Store`;
    const text = `You requested a password reset for your Soumyadip Store account.\n\nYour 6-digit password reset code is: ${otp}\n\nThis code will expire in 5 minutes. If you did not request this, please secure your account immediately.`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .wrapper { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #eaeaea; }
        .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 36px 30px; text-align: center; color: #333333; }
        .content h2 { margin: 0 0 12px; font-size: 20px; color: #1e293b; font-weight: 700; }
        .content p { margin: 0 0 24px; font-size: 15px; color: #64748b; line-height: 1.5; }
        .otp-box { display: inline-block; background: #eff6ff; border: 2px dashed #4f46e5; border-radius: 12px; padding: 18px 36px; margin: 10px auto 25px; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: 'Courier New', monospace; }
        .badge { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-top: 6px; }
        .warning { background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 12px; font-size: 13px; color: #b91c1c; margin-top: 15px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #eaeaea; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>🔐 Soumyadip Store Security</h1>
          <p>Account Recovery & Password Reset</p>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset the password for your account associated with <strong>${email}</strong>. Use the code below to proceed:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="badge">Valid for 5 minutes</div>
          </div>
          <div class="warning">
            ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. If you did not make this request, someone may be trying to access your account.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Soumyadip Store. All rights reserved.<br>
          Need help? Visit our customer support center.
        </div>
      </div>
    </body>
    </html>
    `;

    return sendEmail({ to: email, subject, html, text, otp, type: "password reset" });
}

module.exports = {
    sendEmail,
    sendRegistrationOtp,
    sendPasswordResetOtp
};

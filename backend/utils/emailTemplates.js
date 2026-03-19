const emailTemplates = {
    verification: (name, url) => `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: 700;">Project Management SaaS</h1>
            </div>
            <h2 style="color: #1e293b; font-size: 20px; font-weight: 600; margin-bottom: 20px;">Hello ${name},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
                Welcome to our platform! Please click the button below to verify your email address and activate your 7-day Pro trial.
            </p>
            <div style="text-align: center; margin-bottom: 30px;">
                <a href="${url}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Verify Your Email</a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 20px;">
                If you did not sign up for this account, please ignore this email. This link will expire in 24 hours.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} Project Management SaaS. All rights reserved.
            </p>
        </div>
    `
};

module.exports = emailTemplates;

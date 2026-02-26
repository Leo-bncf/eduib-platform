import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import crypto from 'npm:crypto';

/**
 * Backend function to request password reset
 * Generates reset token and sends email
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email) {
      return Response.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // Find user by email
    const users = await base44.asServiceRole.entities.User.filter({
      email
    });

    // Always return success for security (don't reveal if email exists)
    if (!users || users.length === 0) {
      return Response.json({
        success: true,
        message: 'If an account exists with this email, a reset link will be sent'
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Expires in 1 hour

    // Update account state with reset token
    const accountStates = await base44.asServiceRole.entities.AccountState.filter({
      user_id: user.id
    });

    if (accountStates.length > 0) {
      await base44.asServiceRole.entities.AccountState.update(accountStates[0].id, {
        password_reset_token: resetToken,
        password_reset_expires_at: resetExpires.toISOString()
      });
    } else {
      // Create account state if doesn't exist
      await base44.asServiceRole.entities.AccountState.create({
        user_id: user.id,
        user_email: user.email,
        account_status: 'active',
        password_reset_token: resetToken,
        password_reset_expires_at: resetExpires.toISOString()
      });
    }

    // Send reset email via integration
    const resetUrl = `${Deno.env.get('APP_BASE_URL')}/password-reset?token=${resetToken}`;
    
    try {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: 'Password Reset Request',
        body: `
          <p>Hi ${user.full_name},</p>
          
          <p>You requested to reset your password. Click the link below to proceed:</p>
          
          <p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          
          <p>Or copy this link: ${resetUrl}</p>
          
          <p>This link will expire in 1 hour.</p>
          
          <p>If you didn't request this reset, you can safely ignore this email.</p>
          
          <p>Best regards,<br/>The Platform Team</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email sending fails
      // Log it but return success to user
    }

    console.log(`Password reset requested for user ${user.id}`);

    return Response.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});
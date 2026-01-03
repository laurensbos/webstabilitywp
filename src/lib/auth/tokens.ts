// Token stores for authentication flows
// In production, use a database table instead of in-memory storage

interface TokenData {
  email: string;
  expires: Date;
}

interface VerificationTokenData {
  userId: string;
  email: string;
  code: string; // 6-digit code for easier copy/paste
  expires: Date;
}

// Shared token store for password reset
// Note: This is for development only. In production:
// 1. Store tokens in database with hashed values
// 2. Add rate limiting
// 3. Log failed attempts
export const resetTokens = new Map<string, TokenData>();

// Email verification token store
export const verificationTokens = new Map<string, VerificationTokenData>();

// Clean up expired tokens periodically
export function cleanupExpiredTokens() {
  const now = new Date();
  for (const [token, data] of resetTokens.entries()) {
    if (now > data.expires) {
      resetTokens.delete(token);
    }
  }
}

// Generate a secure token
export function generateResetToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// Create a new reset token for an email
export function createResetToken(email: string): string {
  const token = generateResetToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  resetTokens.set(token, { email, expires });
  
  // Clean up old tokens
  cleanupExpiredTokens();
  
  return token;
}

// Verify and consume a reset token
export function verifyResetToken(token: string): { valid: boolean; email?: string; error?: string } {
  const data = resetTokens.get(token);
  
  if (!data) {
    return { valid: false, error: 'Ongeldige of verlopen link' };
  }
  
  if (new Date() > data.expires) {
    resetTokens.delete(token);
    return { valid: false, error: 'Link is verlopen' };
  }
  
  return { valid: true, email: data.email };
}

// Consume (delete) a token after use
export function consumeResetToken(token: string): boolean {
  return resetTokens.delete(token);
}

// ============================================
// EMAIL VERIFICATION TOKENS
// ============================================

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  const crypto = require('crypto');
  return crypto.randomInt(100000, 999999).toString();
}

// Clean up expired verification tokens
export function cleanupExpiredVerificationTokens() {
  const now = new Date();
  for (const [token, data] of verificationTokens.entries()) {
    if (now > data.expires) {
      verificationTokens.delete(token);
    }
  }
}

// Create a verification token for a user
export function createVerificationToken(userId: string, email: string): { token: string; code: string } {
  const token = generateResetToken();
  const code = generateVerificationCode();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  verificationTokens.set(token, { userId, email, code, expires });
  
  // Clean up old tokens
  cleanupExpiredVerificationTokens();
  
  return { token, code };
}

// Verify email verification token or code
export function verifyEmailToken(tokenOrCode: string): { 
  valid: boolean; 
  userId?: string; 
  email?: string; 
  error?: string 
} {
  // First try to find by token
  let data = verificationTokens.get(tokenOrCode);
  let foundToken = tokenOrCode;
  
  // If not found, search by code
  if (!data) {
    for (const [token, tokenData] of verificationTokens.entries()) {
      if (tokenData.code === tokenOrCode) {
        data = tokenData;
        foundToken = token;
        break;
      }
    }
  }
  
  if (!data) {
    return { valid: false, error: 'Ongeldige verificatiecode' };
  }
  
  if (new Date() > data.expires) {
    verificationTokens.delete(foundToken);
    return { valid: false, error: 'Verificatiecode is verlopen' };
  }
  
  return { valid: true, userId: data.userId, email: data.email };
}

// Consume verification token after successful verification
export function consumeVerificationToken(tokenOrCode: string): boolean {
  // First try to delete by token
  if (verificationTokens.delete(tokenOrCode)) {
    return true;
  }
  
  // If not found, search by code
  for (const [token, data] of verificationTokens.entries()) {
    if (data.code === tokenOrCode) {
      verificationTokens.delete(token);
      return true;
    }
  }
  
  return false;
}

// Get verification data for resending
export function getVerificationByUserId(userId: string): { token: string; code: string; email: string } | null {
  for (const [token, data] of verificationTokens.entries()) {
    if (data.userId === userId && new Date() < data.expires) {
      return { token, code: data.code, email: data.email };
    }
  }
  return null;
}

import mongoose from 'mongoose';
import crypto from 'crypto';

export enum TokenType {
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
}

export interface IToken extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  type: TokenType;
  expiresAt: Date;
  createdAt: Date;
  isValid(): boolean;
}

// Add static methods to the interface
export interface ITokenModel extends mongoose.Model<IToken> {
  generatePasswordResetToken(userId: mongoose.Types.ObjectId): Promise<string>;
}

const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(TokenType),
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if token is still valid
TokenSchema.methods.isValid = function(): boolean {
  return this.expiresAt > new Date();
};

// Static method to generate a password reset token
TokenSchema.statics.generatePasswordResetToken = async function(userId: mongoose.Types.ObjectId): Promise<string> {
  if (!userId) {
    console.error('No userId provided for token generation');
    throw new Error('User ID is required to generate a token');
  }

  try {
    console.log(`Generating password reset token for user: ${userId}`);
    
    // Delete any existing password reset tokens for this user
    await this.deleteMany({
      userId,
      type: TokenType.PASSWORD_RESET,
    });

    // Generate a new token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Create expiration date (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Save the token
    await this.create({
      userId,
      token,
      type: TokenType.PASSWORD_RESET,
      expiresAt,
    });

    return token;
  } catch (error) {
    console.error('Error generating password reset token:', error);
    throw new Error('Failed to generate password reset token');
  }
};

// Create and export the Token model
const Token = (mongoose.models.Token as ITokenModel) || 
  mongoose.model<IToken, ITokenModel>('Token', TokenSchema);

export default Token; 
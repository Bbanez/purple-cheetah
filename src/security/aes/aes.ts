import * as crypto from 'crypto';

export class AESEncryption {
  private static aesKey: Buffer;

  public static init() {
    this.aesKey = crypto.scryptSync(process.env.AES_PASSWORD, 'salt', 32);
  }

  public static encrypt(text: string): string {
    let encText = '';
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      this.aesKey,
      process.env.AES_IV,
    );
    encText = cipher.update(text, 'utf8', 'hex');
    encText += cipher.final('hex');
    return encText;
  }

  public static decrypt(text: string): string {
    let decText = '';
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.aesKey,
      process.env.AES_IV,
    );
    decText = decipher.update(text, 'hex', 'utf8');
    return decText;
  }
}

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface SignatureOptions {
  algorithm?: string;
  encoding?: 'base64' | 'hex';
}

type BinaryToTextEncoding = 'base64' | 'hex';

@Injectable()
export class SignatureService {
  private readonly logger = new Logger(SignatureService.name);
  private readonly defaultOptions: SignatureOptions = {
    algorithm: 'RSA-SHA256',
    encoding: 'base64',
  };

  /**
   * 验证签名
   * @param message 原始消息
   * @param signature 签名
   * @param publicKey 公钥（PEM格式）
   * @param options 选项
   */
  verify(
    message: string,
    signature: string,
    publicKey: string,
    options?: SignatureOptions,
  ): boolean {
    try {
      const finalOptions = { ...this.defaultOptions, ...options };
      
      // 移除公钥中的空白字符，确保格式正确
      const normalizedPublicKey = publicKey
        .replace(/\s+/g, '\n')
        .trim();

      // 验证公钥格式
      if (!normalizedPublicKey.includes('-----BEGIN PUBLIC KEY-----') ||
          !normalizedPublicKey.includes('-----END PUBLIC KEY-----')) {
        this.logger.error('Invalid public key format');
        return false;
      }

      // 创建验证对象
      const verifier = crypto.createVerify(finalOptions.algorithm!);
      verifier.update(message);
      verifier.end();

      // 验证签名
      const isValid = verifier.verify(
        normalizedPublicKey,
        signature,
        finalOptions.encoding
      );

      if (!isValid) {
        this.logger.warn('Signature verification failed');
      }

      return isValid;
    } catch (error) {
      this.logger.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * 验证API请求签名
   * @param req 请求对象
   * @param publicKey 公钥
   */
  verifyApiRequest(
    req: any,
    publicKey: string,
  ): boolean {
    const agentId = req.headers['x-agent-id'];
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];

    if (!agentId || !signature || !timestamp) {
      this.logger.warn('Missing required headers for signature verification');
      return false;
    }

    // 验证时间戳（防止重放攻击）
    const now = Math.floor(Date.now() / 1000);
    const reqTimestamp = parseInt(timestamp);

    if (Math.abs(now - reqTimestamp) > 300) { // 5分钟窗口
      this.logger.warn('Timestamp expired');
      return false;
    }

    // 构建消息
    const body = req.body ? JSON.stringify(req.body) : '';
    const message = `${timestamp}:${agentId}:${body}`;

    return this.verify(message, signature, publicKey);
  }

  /**
   * 生成签名（用于测试）
   * @param message 消息
   * @param privateKey 私钥
   * @param options 选项
   */
  sign(
    message: string,
    privateKey: string,
    options?: SignatureOptions,
  ): string {
    try {
      const finalOptions = { ...this.defaultOptions, ...options };
      
      const signer = crypto.createSign(finalOptions.algorithm!);
      signer.update(message);
      signer.end();

      return signer.sign(privateKey, finalOptions.encoding as BinaryToTextEncoding);
    } catch (error) {
      this.logger.error('Error signing message:', error);
      throw new UnauthorizedException('签名生成失败');
    }
  }

  /**
   * 验证签名并抛出异常
   * @param message 消息
   * @param signature 签名
   * @param publicKey 公钥
   * @param options 选项
   */
  verifyOrThrow(
    message: string,
    signature: string,
    publicKey: string,
    options?: SignatureOptions,
  ): void {
    const isValid = this.verify(message, signature, publicKey, options);
    if (!isValid) {
      throw new UnauthorizedException('签名验证失败');
    }
  }
}

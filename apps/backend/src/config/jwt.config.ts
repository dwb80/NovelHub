import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
  expiresIn: '15m',
  refreshExpiresIn: '7d',
}));

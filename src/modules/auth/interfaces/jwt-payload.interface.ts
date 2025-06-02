export interface JwtPayload {
  sub: number; // 用户ID
  username: string;
  email: string;
  iat?: number; // 签发时间
  exp?: number; // 过期时间
}

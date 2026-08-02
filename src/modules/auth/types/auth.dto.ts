export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export type RequestMeta = {
  ip?: string | null;
  userAgent?: string | null;
};

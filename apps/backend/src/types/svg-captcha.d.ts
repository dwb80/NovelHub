declare module 'svg-captcha' {
  interface CaptchaOptions {
    size?: number;
    width?: number;
    height?: number;
    fontSize?: number;
    noise?: number;
    color?: boolean;
    background?: string;
  }

  interface CaptchaResult {
    data: string;
    text: string;
  }

  function create(options?: CaptchaOptions): CaptchaResult;

  export = create;
}

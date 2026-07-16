/**
 * hCaptcha verification — chosen over Google reCAPTCHA because it's free
 * without quotas relevant to this project's scale and more privacy-friendly (GDPR).
 * Sign up free at https://www.hcaptcha.com/
 */
export async function verifyCaptcha(token: string): Promise<boolean> {
  if (!token) return false;

  // Allow disabling in local development
  if (process.env.NODE_ENV === "development" && process.env.SKIP_CAPTCHA === "true") {
    return true;
  }

  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY!,
        response: token,
      }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (err) {
    console.error("Captcha verification failed:", err);
    return false;
  }
}

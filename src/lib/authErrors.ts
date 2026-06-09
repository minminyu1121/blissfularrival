import { FirebaseError } from "firebase/app";

/** 將 Firebase Auth 錯誤轉成使用者看得懂的中文 */
export function translateAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/unauthorized-domain": {
        const host =
          typeof window !== "undefined" ? window.location.hostname : "你的網域";
        return `此網域（${host}）尚未授權。請至 Firebase Console → Authentication → Settings → Authorized domains，加入「${host}」後重新部署。`;
      }
      case "auth/invalid-api-key":
        return "Firebase API Key 無效，請檢查 Vercel 環境變數 NEXT_PUBLIC_FIREBASE_API_KEY 是否正確。";
      case "auth/operation-not-allowed":
        return "Google 登入尚未啟用，請至 Firebase Console → Authentication → 登入方式 開啟 Google。";
      case "auth/popup-closed-by-user":
        return "已取消登入";
      case "auth/cancelled-popup-request":
        return "登入視窗被中斷，請再試一次";
      case "auth/popup-blocked":
        return "瀏覽器阻擋了登入視窗，請允許彈出視窗或改用其他瀏覽器";
      case "auth/account-exists-with-different-credential":
        return "此電子郵件已用其他方式註冊";
      case "auth/network-request-failed":
        return "網路連線失敗，請檢查網路後再試";
      default:
        return `Google 登入失敗（${err.code}），請稍後再試`;
    }
  }

  if (err instanceof Error) {
    if (err.message.includes("Firebase 尚未設定")) {
      return "Firebase 尚未設定，請在 Vercel 加入所有 NEXT_PUBLIC_FIREBASE_* 環境變數";
    }
    return err.message;
  }

  return "Google 登入失敗，請稍後再試";
}

/** 本機開發用 popup；正式環境用 redirect（Vercel 上較穩定） */
export function shouldUseRedirectSignIn(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

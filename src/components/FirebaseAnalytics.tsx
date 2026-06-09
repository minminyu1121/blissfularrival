"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";

// 在瀏覽器端啟用 Firebase Analytics
export default function FirebaseAnalytics() {
  useEffect(() => {
    getFirebaseAnalytics();
  }, []);

  return null;
}

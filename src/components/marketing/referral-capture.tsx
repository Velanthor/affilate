"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "velanthor_ref_data";
const STORAGE_DAYS = 90;

/**
 * Captures ?ref=code on any page load, persists it to localStorage as a
 * fallback for users with cookies disabled, and fires a single click event
 * to the tracking API per session. The middleware already sets the
 * `velanthor_ref` cookie server-side; this component adds the client-side
 * redundancy and triggers attribution tracking (device, browser, UTM, etc.)
 * which requires browser APIs unavailable on the edge.
 */
export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;

    try {
      const payload = { code: ref, storedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // localStorage unavailable (private mode) — cookie fallback from middleware still applies
    }

    const alreadyTrackedThisSession = sessionStorage.getItem("velanthor_click_tracked");
    if (alreadyTrackedThisSession === ref) return;

    fetch("/api/track/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ref,
        utmSource: searchParams.get("utm_source"),
        utmMedium: searchParams.get("utm_medium"),
        utmCampaign: searchParams.get("utm_campaign"),
        utmContent: searchParams.get("utm_content"),
        utmTerm: searchParams.get("utm_term"),
        referrer: document.referrer || null,
        landingPage: window.location.pathname,
      }),
    })
      .then(() => sessionStorage.setItem("velanthor_click_tracked", ref))
      .catch(() => {
        /* tracking failures must never block the user experience */
      });
  }, [searchParams]);

  return null;
}

/** Reads the stored referral code from localStorage if the cookie isn't available. */
export function getStoredReferralCode(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const ageDays = (Date.now() - parsed.storedAt) / (1000 * 60 * 60 * 24);
    if (ageDays > STORAGE_DAYS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.code ?? null;
  } catch {
    return null;
  }
}

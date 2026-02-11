"use client";

import { useState, useEffect } from "react";

export interface ProStatus {
  isPro: boolean;
  customerCount: number;
  stampCardCount: number;
  couponCount: number;
  loading: boolean;
}

export function useProStatus(): ProStatus {
  const [status, setStatus] = useState<ProStatus>({
    isPro: false,
    customerCount: 0,
    stampCardCount: 0,
    couponCount: 0,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/profile/status")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setStatus({
          isPro: data.is_pro ?? false,
          customerCount: data.customer_count ?? 0,
          stampCardCount: data.stamp_card_count ?? 0,
          couponCount: data.coupon_count ?? 0,
          loading: false,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setStatus((prev) => ({ ...prev, loading: false }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { BmkgCardGrid, BmkgSkeleton, BmkgError } from "@/components/BmkgNewsCard";

interface BmkgItem {
  title: string;
  date: string;
  dateDisplay: string;
  image: string;
  url: string;
}

export default function BmkgPressRelease() {
  const [data, setData] = useState<BmkgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const fetchedRef = useRef(false);

  const fetchData = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const res = await fetch("/api/bmkg-content?type=siaran-pers");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (json.data?.length > 0) setData(json.data);
    } catch {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchedRef.current) { fetchedRef.current = true; fetchData(); }
  }, []);

  if (loading && data.length === 0) return <BmkgSkeleton title="Siaran Pers BMKG" />;
  if (hasError && data.length === 0) return <BmkgError title="Siaran Pers BMKG" onRetry={fetchData} />;
  if (data.length === 0) return null;

  return (
    <BmkgCardGrid
      title="Siaran Pers BMKG"
      data={data.slice(0, 6)}
      linkUrl="https://www.bmkg.go.id/siaran-pers"
      linkLabel="Lihat semua siaran pers"
      icon="campaign"
    />
  );
}

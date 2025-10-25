import React, { useEffect, useRef, useCallback } from "react";
import { sendLogRequest, getUTMParams, UTMParams, EventData } from "./core";

interface AnalyticsProps {
  client: string;
  url: string;
  path?: string;
}

interface PageDurationEventData extends EventData {
  event_name: "page_duration";
  duration: number;
}

const Analytics = ({ client, url, path }: AnalyticsProps) => {
  const currentPath: string = path || window.location.pathname;

  const startTimeRef = useRef<number>(performance.now());

  const logPageDuration = useCallback((): void => {
    const durationMs: number = performance.now() - startTimeRef.current;
    const durationSeconds: number = Math.floor(durationMs / 1000);

    if (durationSeconds < 1) return;

    const eventData: PageDurationEventData = {
      pathname: currentPath,
      referrer: document.referrer || null,
      ...getUTMParams(),
      event_type: "page_view",
      event_name: "page_duration",
      duration: durationSeconds,
    };

    sendLogRequest(url, client, eventData);
  }, [client, url, currentPath]);

  useEffect(() => {
    const initialData: EventData = {
      pathname: currentPath,
      referrer: document.referrer || null,
      ...getUTMParams(),
      event_type: "page_view",
      event_name: "page_view",
      duration: 0,
    };

    sendLogRequest(url, client, initialData);

    window.addEventListener("beforeunload", logPageDuration);

    return () => {
      window.removeEventListener("beforeunload", logPageDuration);
      logPageDuration();
    };
  }, [client, url, currentPath, logPageDuration]);

  useEffect(() => {
    startTimeRef.current = performance.now();
  }, [currentPath]);

  return null;
};

export default Analytics;

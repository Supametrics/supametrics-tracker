import React, { useEffect, useRef, useCallback } from "react";
import { sendLogRequest, getUTMParams } from "./core";

const Analytics = ({ client, url, path }) => {
  const currentPath = path || window.location.pathname;
  const startTimeRef = useRef(performance.now());

  const logPageDuration = useCallback(() => {
    const durationMs = performance.now() - startTimeRef.current;
    const durationSeconds = Math.floor(durationMs / 1000);

    if (durationSeconds < 1) return;

    const eventData = {
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
    const initialData = {
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

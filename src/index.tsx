import React, { useEffect, useCallback } from "react";
import { sendLogRequest, getUTMParams, EventData } from "./core";

interface AnalyticsProps {
  client: string;
  url: string;
  path?: string;
}

const sessionId = crypto.randomUUID();
const pageLoadTime = Date.now();

const Analytics = ({ client, url, path }: AnalyticsProps) => {
  const currentPath: string = path || window.location.pathname;

  const logExitEvent = useCallback((): void => {
    const durationSeconds = Math.round((Date.now() - pageLoadTime) / 1000);

    const eventData: EventData = {
      eventType: "exit",
      session_id: sessionId,
      duration: durationSeconds,
      pathname: currentPath,
    };

    sendLogRequest(url, client, eventData);
  }, [client, url, currentPath]);

  useEffect(() => {
    const initialData: EventData = {
      eventType: "pageview",
      session_id: sessionId,
      pathname: currentPath,
      hostname: window.location.hostname,
      referrer: document.referrer || null,
      ...getUTMParams(),
    };

    sendLogRequest(url, client, initialData);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        logExitEvent();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const heartbeatInterval = setInterval(() => {
      const durationSeconds = Math.round((Date.now() - pageLoadTime) / 1000);
      const pingData: EventData = {
        eventType: "ping",
        session_id: sessionId,
        duration: durationSeconds,
        pathname: currentPath,
      };
      sendLogRequest(url, client, pingData);
    }, 60000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(heartbeatInterval);
      logExitEvent();
    };
  }, [client, url, currentPath, logExitEvent]);

  return null;
};

export default Analytics;

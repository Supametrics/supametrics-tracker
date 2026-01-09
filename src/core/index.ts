export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export interface EventData extends Partial<UTMParams> {
  eventType: "pageview" | "exit" | "ping";
  session_id: string;
  pathname: string;
  hostname?: string;
  referrer?: string | null;
  duration?: number;
}

export const getUTMParams = (): UTMParams => {
  const params: URLSearchParams = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || null,
    utm_medium: params.get("utm_medium") || null,
    utm_campaign: params.get("utm_campaign") || null,
  };
};

export const sendLogRequest = (
  url: string,
  clientKey: string,
  eventData: EventData
): void => {
  const endpoint: string = `${url.replace(/\/+$/, "")}/api/v1/analytics/log`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Public-Key": clientKey,
  };

  const body: string = JSON.stringify(eventData);

  if (eventData.eventType === "exit" && navigator.sendBeacon) {
    const blob: Blob = new Blob([body], { type: "application/json" });

    const beaconUrl = new URL(endpoint);
    beaconUrl.searchParams.append("publicKey", clientKey);
    navigator.sendBeacon(beaconUrl.toString(), blob);
  } else {
    fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: body,
      keepalive: true,
    })
      .then(() => {})
      .catch(() => {});
  }
};

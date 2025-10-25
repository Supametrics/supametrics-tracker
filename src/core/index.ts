export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export interface EventData extends UTMParams {
  pathname: string;
  referrer: string | null;
  event_type: "page_view" | string;
  event_name: "page_view" | "page_duration" | string;
  duration: number;
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

  const isBeacon: boolean = eventData.event_name === "page_duration";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Public-Key": clientKey,
  };

  const body: string = JSON.stringify(eventData);

  if (isBeacon && navigator.sendBeacon) {
    const blob: Blob = new Blob([body], { type: headers["Content-Type"] });
    navigator.sendBeacon(endpoint, blob);
  } else {
    fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: body,
      keepalive: true,
    })
      .then((response: Response) => {})
      .catch((error: any) => {});
  }
};

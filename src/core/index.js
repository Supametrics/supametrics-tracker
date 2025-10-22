const getUTMParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || null,
    utm_medium: params.get("utm_medium") || null,
    utm_campaign: params.get("utm_campaign") || null,
  };
};

const sendLogRequest = (url, clientKey, eventData) => {
  const endpoint = `${url.replace(/\/+$/, "")}/api/v1/analytics/log`;

  const isBeacon = eventData.event_name === "page_duration";

  const headers = {
    "Content-Type": "application/json",
    "X-Public-Key": clientKey,
  };

  const body = JSON.stringify(eventData);

  if (isBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: headers["Content-Type"] });
    navigator.sendBeacon(endpoint, blob);
  } else {
    fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: body,
      keepalive: true,
    })
      .then((response) => {})
      .catch((error) => {});
  }
};

export { sendLogRequest, getUTMParams };

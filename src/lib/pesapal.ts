/* ─── PesaPal v3 API Integration ─── */

const PESAPAL_API_URL = process.env.PESAPAL_API_URL || "https://cybqa.pesapal.com/pesapalv3/api";
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY || "";
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET || "";

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth2 access token from PesaPal
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

  const response = await fetch(`${PESAPAL_API_URL}/Auth/RequestToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("PesaPal auth error:", text);
    throw new Error(`PesaPal auth failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`PesaPal auth error: ${data.error?.message || JSON.stringify(data.error)}`);
  }

  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + (data.expiryDate ? new Date(data.expiryDate).getTime() : 5 * 60 * 1000),
  };

  return data.token;
}

/**
 * Register an IPN URL with PesaPal
 */
export async function registerIPN(ipnUrl: string): Promise<{ ipn_id: string; url: string }> {
  const token = await getAccessToken();

  const response = await fetch(`${PESAPAL_API_URL}/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: "GET",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("PesaPal register IPN error:", text);
    throw new Error(`PesaPal IPN registration failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`PesaPal IPN error: ${data.error?.message || JSON.stringify(data.error)}`);
  }

  return {
    ipn_id: data.ipn_id,
    url: data.url,
  };
}

export interface SubmitOrderParams {
  id: string; // Our internal order ID
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number?: string;
    country_code?: string;
    first_name?: string;
    last_name?: string;
  };
}

/**
 * Submit an order to PesaPal for payment
 */
export async function submitOrder(params: SubmitOrderParams): Promise<{ order_tracking_id: string; redirect_url: string }> {
  const token = await getAccessToken();

  const response = await fetch(`${PESAPAL_API_URL}/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("PesaPal submit order error:", text);
    throw new Error(`PesaPal submit order failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`PesaPal order error: ${data.error?.message || JSON.stringify(data.error)}`);
  }

  return {
    order_tracking_id: data.order_tracking_id,
    redirect_url: data.redirect_url,
  };
}

/**
 * Get the status of a transaction from PesaPal
 */
export async function getTransactionStatus(orderTrackingId: string): Promise<{
  payment_method: string;
  amount: number;
  created_date: string;
  confirmation_code: string;
  payment_status: string;
  description: string;
  message: string;
}> {
  const token = await getAccessToken();

  const response = await fetch(
    `${PESAPAL_API_URL}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("PesaPal get status error:", text);
    throw new Error(`PesaPal get status failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`PesaPal status error: ${data.error?.message || JSON.stringify(data.error)}`);
  }

  return data;
}

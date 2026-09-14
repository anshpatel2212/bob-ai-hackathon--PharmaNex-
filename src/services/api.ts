// ============================================================
// PharmaGuard AI API Client
// ============================================================

export const APP_NAME = "PharmaGuard AI";
export const API_VERSION = "v1.0.0";


export class ApiError extends Error {

  status: number;

  constructor(
    message: string,
    status: number
  ) {

    super(message);

    this.name = "ApiError";
    this.status = status;
  }
}


// ============================================================
// API BASE URL
// ============================================================

export function resolveApiBase(): string {
  const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

  // 1. Explicit VITE_API_URL provided at build time or runtime
  if (rawApiUrl && rawApiUrl !== "undefined" && rawApiUrl !== "null" && rawApiUrl !== "") {
    // Remove trailing slashes
    const clean = rawApiUrl.replace(/\/+$/, "");
    // If it already ends with /api, use it as is; otherwise append /api
    return clean.endsWith("/api") ? clean : `${clean}/api`;
  }

  // 2. Local development fallback (Vite dev server or localhost hostname)
  if (
    import.meta.env.DEV ||
    (typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"))
  ) {
    return "http://localhost:8000/api";
  }

  // 3. Production fallback (relative /api)
  if (typeof window !== "undefined") {
    console.warn(
      "[PharmaGuard AI] WARNING: VITE_API_URL environment variable was not set during build. " +
        "API requests are falling back to relative '/api', which will be routed to the frontend server."
    );
  }
  return "/api";
}

export const API_BASE = resolveApiBase();

console.log(
  "[PharmaGuard] API base URL:",
  API_BASE,
  import.meta.env.VITE_API_URL ? "(from VITE_API_URL)" : "(local/environment fallback)"
);


// ============================================================
// Temporary in-memory token fallback
// ============================================================

let activeAuthToken: string | null = null;


export function setAuthToken(
  token: string | null
): void {

  activeAuthToken = token;
}


export function getAuthToken(): string | null {

  return activeAuthToken;
}


// ============================================================
// Request Options
// ============================================================

interface RequestOptions
  extends RequestInit {

  data?: unknown;
}


// ============================================================
// Main API Request
// ============================================================

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {

  const {
    data,
    headers = {},
    ...customConfig
  } = options;


  let cleanEndpoint =
    endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

  // Strip a leading /api prefix if the caller accidentally included it —
  // API_BASE already ends with /api.
  cleanEndpoint = cleanEndpoint.replace(/^\/api(\/|$)/, "/");

  const url =
    `${API_BASE}${cleanEndpoint}`;

  if (import.meta.env.DEV) {
    console.debug(`[PharmaGuard API] ${customConfig.method || "GET"} ${url}`);
  }


  const reqHeaders: Record<
    string,
    string
  > = {

    Accept:
      "application/json",

    ...(data !== undefined
      ? {
        "Content-Type":
          "application/json",
      }
      : {}),

    ...(headers as Record<
      string,
      string
    >),
  };


  if (
    activeAuthToken &&
    !reqHeaders.Authorization
  ) {

    reqHeaders.Authorization =
      `Bearer ${activeAuthToken}`;
  }


  const config: RequestInit = {

    ...customConfig,

    method:
      customConfig.method || "GET",

    credentials:
      "include",

    headers:
      reqHeaders,
  };


  if (data !== undefined) {

    config.body =
      JSON.stringify(data);
  }


  let response: Response;


  try {

    response =
      await fetch(
        url,
        config
      );

  } catch (error: unknown) {
    // Network error: backend unreachable, CORS failure, or no internet.
    const rawMsg =
      error instanceof Error
        ? error.message
        : "Network error.";

    throw new ApiError(
      `Unable to connect to the API server. (${rawMsg})`,
      0
    );
  }

  // ----------------------------------------------------------
  // Unauthorized handler (in-memory token cleanup only)
  // ----------------------------------------------------------
  if (response.status === 401) {
    activeAuthToken = null;
  }


  // ----------------------------------------------------------
  // Parse response body
  // ----------------------------------------------------------

  let responseData: unknown = null;


  const contentType =
    response.headers.get(
      "content-type"
    );


  if (
    contentType &&
    contentType.includes(
      "application/json"
    )
  ) {

    try {

      responseData =
        await response.json();

    } catch {

      responseData = null;
    }

  } else if (!response.ok) {
    if (response.status === 405) {
      throw new ApiError(
        "Server error 405 (Not Allowed): The request was received by the frontend web server (Nginx) instead of the FastAPI backend. " +
        "Please ensure VITE_API_URL is configured in your Render service to point to your FastAPI backend URL (e.g. https://pharmaguard-backend.onrender.com) and trigger a redeploy with clean build cache.",
        405
      );
    }

    // Non-JSON error response — backend probably returned HTML (e.g., Nginx 404/502
    // when VITE_API_URL is wrong or the backend is not reachable).
    let bodyPreview = "";
    try {
      const text = await response.text();
      // If it looks like HTML, give a human-readable hint.
      if (text.trim().startsWith("<")) {
        bodyPreview = " (Server returned HTML — check that VITE_API_URL is set to the FastAPI backend URL)";
      }
    } catch {
      // ignore
    }

    throw new ApiError(
      `Server error ${response.status}${bodyPreview}`,
      response.status
    );
  }


  // ----------------------------------------------------------
  // Non-2xx JSON error
  // ----------------------------------------------------------

  if (!response.ok) {

    let message =
      "An unexpected error occurred.";


    if (
      responseData &&
      typeof responseData ===
      "object"
    ) {

      const dataObj =
        responseData as Record<
          string,
          unknown
        >;


      if (
        typeof dataObj.detail ===
        "string"
      ) {

        message =
          dataObj.detail;

      } else if (
        Array.isArray(
          dataObj.detail
        )
      ) {

        // FastAPI/Pydantic validation errors — collect all messages.
        const msgs = (dataObj.detail as { msg?: string; loc?: unknown[] }[])
          .map(e => {
            // Pydantic v2 prefixes messages with "Value error, " — strip it.
            const raw = e.msg || "";
            return raw.replace(/^Value error,\s*/i, "").trim();
          })
          .filter(Boolean);

        message =
          msgs.length > 0
            ? msgs.join(" · ")
            : message;

      } else if (
        typeof dataObj.message ===
        "string"
      ) {

        message =
          dataObj.message;
      }
    }


    throw new ApiError(
      message,
      response.status
    );
  }


  return responseData as T;
}


// ============================================================
// Convenience API
// ============================================================

export const api = {

  get: <T>(
    endpoint: string,
    options?: RequestOptions
  ) =>
    apiRequest<T>(
      endpoint,
      {
        ...options,
        method: "GET",
      }
    ),


  post: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ) =>
    apiRequest<T>(
      endpoint,
      {
        ...options,
        method: "POST",
        data,
      }
    ),


  put: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ) =>
    apiRequest<T>(
      endpoint,
      {
        ...options,
        method: "PUT",
        data,
      }
    ),


  delete: <T>(
    endpoint: string,
    options?: RequestOptions
  ) =>
    apiRequest<T>(
      endpoint,
      {
        ...options,
        method: "DELETE",
      }
    ),
};
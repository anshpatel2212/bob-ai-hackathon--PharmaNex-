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

const rawApiUrl =
  (import.meta.env.VITE_API_URL as string | undefined)
    ?.trim();


const API_BASE = rawApiUrl
  ? `${rawApiUrl.replace(/\/+$/, "")}/api`
  : "/api";


console.log(
  "[PharmaGuard] API:",
  API_BASE
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


  if (
    cleanEndpoint.startsWith("/api/")
  ) {

    cleanEndpoint =
      cleanEndpoint.replace(
        "/api",
        ""
      );
  }


  const url =
    `${API_BASE}${cleanEndpoint}`;


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

    const message =
      error instanceof Error
        ? error.message
        : "Network error. Please check your connection.";

    throw new ApiError(
      message,
      0
    );
  }


  // ----------------------------------------------------------
  // Unauthorized
  // ----------------------------------------------------------

  if (
    response.status === 401
  ) {

    activeAuthToken = null;

    window.dispatchEvent(
      new CustomEvent(
        "pharmaguard:unauthorized",
        {
          detail: {
            message:
              "Your session has expired. Please sign in again.",
          },
        }
      )
    );
  }


  // ----------------------------------------------------------
  // Parse response
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
  }


  // ----------------------------------------------------------
  // Error
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

        const firstError =
          dataObj.detail[0] as {
            msg?: string;
          };


        message =
          firstError?.msg ||
          message;

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
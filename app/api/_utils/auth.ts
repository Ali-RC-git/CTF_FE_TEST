/**
 * Shared authentication utilities for API routes
 */

import { cookies } from "next/headers";

/**
 * Get authentication token from request
 * Checks both Authorization header and cookies
 * 
 * @param req - The incoming request
 * @returns The access token if found, null otherwise
 */
export function getAuthToken(req: Request): string | null {
  // First, try to get from Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // If not in header, try to get from cookies
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    if (accessToken) {
      return accessToken;
    }
  } catch (error) {
    console.error('Error reading cookies:', error);
  }
  
  return null;
}

/**
 * Backend fetch helper that includes authentication
 * 
 * @param endpoint - API endpoint (e.g., '/events/')
 * @param options - Fetch options
 * @param req - The incoming request (to extract auth token)
 * @returns Response from backend
 */
export async function authenticatedBackendFetch(
  endpoint: string,
  options: RequestInit = {},
  req?: Request
): Promise<Response> {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
  const url = `${BACKEND_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  
  // Add Content-Type if not present
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  
  // Add authentication token if request is provided
  if (req) {
    const token = getAuthToken(req);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
}

/**
 * Check if request has valid authentication
 * 
 * @param req - The incoming request
 * @returns True if authenticated, false otherwise
 */
export function isAuthenticated(req: Request): boolean {
  return getAuthToken(req) !== null;
}


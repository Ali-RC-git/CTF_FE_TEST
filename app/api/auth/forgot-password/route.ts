import { NextRequest, NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '../../_utils/auth';

// Types for forgot password request
interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    otp_id: string;
    email: string;
    expires_at: string;
  };
}

// POST /api/auth/forgot-password - Send forgot password OTP
export async function POST(req: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await req.json();
    
    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email address is required' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please enter a valid email address' 
        },
        { status: 400 }
      );
    }

    // For now, return a mock response since the backend endpoint may not be implemented
    // In a real application, you would call the backend API:
    // const response = await authenticatedBackendFetch('/auth/forgot-password/', {
    //   method: 'POST',
    //   body: JSON.stringify(body)
    // }, req);

    // Mock response for development
    const mockResponse: ForgotPasswordResponse = {
      success: true,
      message: 'Password reset OTP has been sent to your email address.',
      data: {
        otp_id: `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: body.email,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now
      }
    };

    // Log the request for debugging
    console.log('Forgot password request:', {
      email: body.email,
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json(mockResponse, { status: 200 });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while processing your request. Please try again.' 
      },
      { status: 500 }
    );
  }
}

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';



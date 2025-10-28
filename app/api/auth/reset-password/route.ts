import { NextRequest, NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '../../_utils/auth';

// Types for reset password request
interface ResetPasswordRequest {
  otp_id: string;
  otp_code: string;
  new_password: string;
  confirm_password: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    email: string;
  };
}

// POST /api/auth/reset-password - Reset password with OTP
export async function POST(req: NextRequest) {
  try {
    const body: ResetPasswordRequest = await req.json();
    
    // Validate required fields
    if (!body.otp_id || !body.otp_code || !body.new_password || !body.confirm_password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'All fields are required' 
        },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (body.new_password !== body.confirm_password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Passwords do not match' 
        },
        { status: 400 }
      );
    }

    // Validate password strength (basic validation)
    if (body.new_password.length < 8) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password must be at least 8 characters long' 
        },
        { status: 400 }
      );
    }

    // For now, return a mock response since the backend endpoint may not be implemented
    // In a real application, you would call the backend API:
    // const response = await authenticatedBackendFetch('/auth/reset-password/', {
    //   method: 'POST',
    //   body: JSON.stringify(body)
    // }, req);

    // Mock response for development
    const mockResponse: ResetPasswordResponse = {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
      data: {
        user_id: `user_${Date.now()}`,
        email: 'user@example.com' // This would come from the OTP validation
      }
    };

    // Log the request for debugging
    console.log('Reset password request:', {
      otp_id: body.otp_id,
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });

    return NextResponse.json(mockResponse, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    
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



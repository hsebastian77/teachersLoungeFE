import { apiUrl } from '@env';

const handleResponse = async (response, defaultMessage) => {
  const data = await response.json();

  if (!response.ok) {
    return { ok: false, message: data.message || defaultMessage };
  }

  return { ok: true, data };
};

// Send OTP
export const sendOTP = async (email, tempToken) => {
  try {
    const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tempToken}`,
      },
      body: JSON.stringify({ email }),
    });

    return await handleResponse(response, 'Failed to send verification code');
  } catch {
    return { ok: false, message: 'Network error sending code' };
  }
};

// Resend OTP
export const resendOTP = async (email, tempToken) => {
  try {
    const response = await fetch(`${apiUrl}/api/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tempToken}`,
      },
      body: JSON.stringify({ email }),
    });

    return await handleResponse(response, 'Failed to resend code');
  } catch {
    return { ok: false, message: 'Network error resending code' };
  }
};

// Verify OTP
export const verifyOTP = async (email, otp, tempToken) => {
  try {
    const response = await fetch(`${apiUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tempToken}`,
      },
      body: JSON.stringify({ email, otp }),
    });

    const result = await handleResponse(response, 'Invalid verification code');

    if (!result.ok) return result;

    return {
      ok: true,
      user: result.data.user,
      token: result.data.token,
    };
  } catch {
    return { ok: false, message: 'Network error verifying code' };
  }
};
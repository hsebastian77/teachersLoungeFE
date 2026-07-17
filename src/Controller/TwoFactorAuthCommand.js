import { apiUrl } from '@env';

// Send OTP
export const sendOTP = async (email, tempToken) => {
  try {
    const response = await fetch(`${apiUrl}/api/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + tempToken,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.status !== 200) {
      return { ok: false, message: data.message || 'Failed to send verification code' };
    }

    return { ok: true };

  } catch (error) {
    return { ok: false, message: 'Failed to send verification code' };
  }
};

// Verify OTP
export const verifyOTP = async (email, otp, tempToken) => {
  try {
    const response = await fetch(`${apiUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + tempToken,
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (response.status !== 200) {
      return { ok: false, message: data.message || 'Invalid verification code' };
    }

    return {
      ok: true,
      user: data.user,
      token: data.token,
    };

  } catch (error) {
    return { ok: false, message: 'Failed to verify code' };
  }
};
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import App_StyleSheet from '../Styles/App_StyleSheet';
import { apiUrl, sendOtpRoute, verifyOtpRoute } from '@env';
import * as SecureStore from 'expo-secure-store';

const SEND_OTP_ROUTE = sendOtpRoute || '/api/auth/send-otp';
const VERIFY_OTP_ROUTE = verifyOtpRoute || '/api/auth/verify-otp';

const safeJson = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    return { message: text };
  }
};

const getMfaToken = (value) => {
  return typeof value === 'string' && value ? value : null;
};

const getFullAuthToken = (data) => {
  if (typeof data?.token === 'string' && data.token) return data.token;
  if (typeof data?.accessToken === 'string' && data.accessToken) return data.accessToken;
  return null;
};

const shouldLockOtpAccess = (response, data) => {
  return (
    response.status === 423 ||
    response.status === 429 ||
    data?.locked === true ||
    data?.blocked === true ||
    data?.otpLocked === true ||
    data?.tooManyAttempts === true ||
    data?.remainingAttempts === 0
  );
};

const getRetryAfterSeconds = (response, data) => {
  const candidates = [
    data?.retryAfterSeconds,
    data?.retryAfter,
    data?.lockoutSeconds,
    data?.waitSeconds,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0) {
      return candidate;
    }

    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  const headerValue = response.headers.get('Retry-After');
  const parsedHeader = Number(headerValue);
  if (Number.isFinite(parsedHeader) && parsedHeader > 0) {
    return parsedHeader;
  }

  return null;
};

const formatRetryMessage = (baseMessage, retryAfterSeconds) => {
  if (!retryAfterSeconds) {
    return baseMessage;
  }

  const minutes = Math.floor(retryAfterSeconds / 60);
  const seconds = retryAfterSeconds % 60;

  if (minutes > 0 && seconds > 0) {
    return `${baseMessage} Try again in ${minutes}m ${seconds}s.`;
  }

  if (minutes > 0) {
    return `${baseMessage} Try again in ${minutes}m.`;
  }

  return `${baseMessage} Try again in ${seconds}s.`;
};

function TwoFactorAuthView({ navigation, route }) {
  const { User, email, fromRegistration = false, registrationData = {} } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [otpLocked, setOtpLocked] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // Send OTP when component mounts
    sendOTP();
    
    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sendOTP = async () => {
    if (!email) {
      setErrorMessage('Missing email address for verification.');
      return;
    }

    if (otpLocked) {
      return;
    }

    setIsSending(true);
    setErrorMessage('');
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      const mfaToken = getMfaToken(storedToken);

      const bodyPayload = mfaToken
        ? { email, mfaToken }
        : { email };

      const response = await fetch(`${apiUrl}${SEND_OTP_ROUTE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(!mfaToken && storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await safeJson(response);
      if (response.status === 200) {
        setStatusMessage('');
      } else {
        const retryAfterSeconds = getRetryAfterSeconds(response, data);
        const message = formatRetryMessage(
          data.message || 'Failed to send verification code',
          retryAfterSeconds
        );
        if (shouldLockOtpAccess(response, data)) {
          setOtpLocked(true);
          setCanResend(false);
          setStatusMessage('');
        }
        setErrorMessage(message);
      }
    } catch (error) {
      setErrorMessage('Failed to send verification code');
    } finally {
      setIsSending(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || otpLocked) return;
    
    setCanResend(false);
    setResendTimer(60);
    setStatusMessage('');
    await sendOTP();
    
    // Restart timer
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (value, index) => {
    if (otpLocked) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setErrorMessage('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 5 && value) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        verifyOTP(fullOtp);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (otpCode) => {
    if (!email) {
      setErrorMessage('Missing email address for verification.');
      return;
    }

    if (otpLocked) {
      return;
    }

    const normalizedOtp = (otpCode || otp.join('')).trim();
    if (normalizedOtp.length !== 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      const mfaToken = getMfaToken(storedToken);

      const requestBody = mfaToken
        ? { otp: normalizedOtp, mfaToken }
        : {
            email,
            otp: normalizedOtp,
            username: registrationData.username,
            firstName: registrationData.firstName,
            lastName: registrationData.lastName,
          };

      const response = await fetch(`${apiUrl}${VERIFY_OTP_ROUTE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(!mfaToken && storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
        },
        body: JSON.stringify(requestBody),
      });

      const data = await safeJson(response);
      if (response.status === 200) {
        // Store only the final authenticated token after OTP verification.
        const fullToken = getFullAuthToken(data);
        if (fullToken) {
          await SecureStore.setItemAsync("token", fullToken);
        } else {
          setErrorMessage('OTP verified but no final auth token was returned.');
          return;
        }

        if (fromRegistration || !User) {
          navigation.replace('Login');
        } else {
          navigation.replace("User", { User });
        }
      } else {
        const retryAfterSeconds = getRetryAfterSeconds(response, data);
        const message = formatRetryMessage(
          data.message || `Invalid verification code (status ${response.status})`,
          retryAfterSeconds
        );
        if (shouldLockOtpAccess(response, data)) {
          setOtpLocked(true);
          setCanResend(false);
          setStatusMessage('');
        }
        setErrorMessage(message);
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setErrorMessage('Failed to verify code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={App_StyleSheet.register_signIn_background}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={App_StyleSheet.block}>
        <Text style={App_StyleSheet.twoFactorTitle}>Email Verification</Text>
        <Text style={App_StyleSheet.twoFactorSubtitle}>
          Enter the 6-digit code sent to the email address on file
        </Text>
        <Text style={App_StyleSheet.fieldHelperText}>
          If you do not see the code, check your spam folder or use Resend Code after the timer ends.
        </Text>

        {statusMessage ? <Text style={App_StyleSheet.authStatusText}>{statusMessage}</Text> : null}
        {errorMessage ? <Text style={App_StyleSheet.authErrorText}>{errorMessage}</Text> : null}
        
        <View style={App_StyleSheet.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={App_StyleSheet.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              textAlign="center"
              editable={!otpLocked && !isVerifying}
            />
          ))}
        </View>

        <TouchableOpacity
          style={App_StyleSheet.default_button}
          onPress={() => verifyOTP()}
          disabled={isVerifying || otpLocked}
        >
          <Text style={App_StyleSheet.text}>{otpLocked ? 'Verification Locked' : isVerifying ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>

        <View style={App_StyleSheet.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResendOTP} disabled={isSending || isVerifying || otpLocked}>
              <Text style={App_StyleSheet.resendText}>{isSending ? 'Sending...' : 'Resend Code'}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={App_StyleSheet.resendTimerText}>
              Resend code in {resendTimer}s
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={App_StyleSheet.default_button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={App_StyleSheet.text}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export default TwoFactorAuthView; 
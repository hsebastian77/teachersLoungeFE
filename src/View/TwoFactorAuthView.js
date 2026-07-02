import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
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

function TwoFactorAuthView({ navigation, route }) {
  const { User, email, fromRegistration = false, registrationData = {} } = route.params || {};
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
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
      Alert.alert('Error', 'Missing email address for verification.');
      return;
    }

    setIsSending(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(`${apiUrl}${SEND_OTP_ROUTE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email }),
      });

      const data = await safeJson(response);
      if (response.status === 200) {
        Alert.alert('Success', 'Verification code sent to your email');
      } else {
        Alert.alert('Error', data.message || 'Failed to send verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code');
    } finally {
      setIsSending(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
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
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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
      Alert.alert('Error', 'Missing email address for verification.');
      return;
    }

    const normalizedOtp = (otpCode || otp.join('')).trim();
    if (normalizedOtp.length !== 6) {
      Alert.alert('Error', 'Please enter the full 6-digit code.');
      return;
    }

    setIsVerifying(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await fetch(`${apiUrl}${VERIFY_OTP_ROUTE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email,
          otp: normalizedOtp,
          username: registrationData.username,
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
        }),
      });

      const data = await safeJson(response);
      if (response.status === 200) {
        // Update token with 2FA verified token
        if (data.token) {
          await SecureStore.setItemAsync("token", data.token);
        }
        
        Alert.alert('Success', 'Verification successful!');
        if (fromRegistration || !User) {
          navigation.replace('Login');
        } else {
          navigation.replace("User", { User });
        }
      } else {
        Alert.alert('Error', data.message || `Invalid verification code (status ${response.status})`);
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code');
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
            />
          ))}
        </View>

        <TouchableOpacity
          style={App_StyleSheet.default_button}
          onPress={() => verifyOTP()}
          disabled={isVerifying}
        >
          <Text style={App_StyleSheet.text}>{isVerifying ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>

        <View style={App_StyleSheet.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResendOTP} disabled={isSending || isVerifying}>
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
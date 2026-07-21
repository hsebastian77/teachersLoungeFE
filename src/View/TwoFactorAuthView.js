import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { verifyOTP, resendOTP } from '../Controller/TwoFactorAuthCommand';
import * as SecureStore from 'expo-secure-store';

const TwoFactorAuthView = () => {
  const { pendingAuth, login } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);

  // countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // handle digit change
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move forward
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // auto submit
    if (index === 5 && value) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (overrideCode) => {
    const finalCode = overrideCode || otp.join('');

    if (finalCode.length !== 6) return;

    if (!pendingAuth?.email || !pendingAuth?.tempToken) {
      alert('Session expired. Please log in again.');
      return;
    }

    try {
      setLoading(true);

      const result = await verifyOTP(
        pendingAuth.email,
        finalCode,
        pendingAuth.tempToken
      );

      if (!result?.ok) throw new Error(result?.message);

      await SecureStore.setItemAsync("token", result.token);
      login(result.user);

    } catch (err) {
      alert(err.message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      setResending(true);

      const result = await resendOTP(
        pendingAuth.email,
        pendingAuth.tempToken
      );

      if (!result.ok) throw new Error(result.message);

      setCooldown(30);

    } catch (err) {
      alert(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Enter Verification Code
      </Text>

      {/* 6-digit input UI */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            value={digit}
            onChangeText={(val) => handleOtpChange(val, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            style={{
              borderWidth: 1,
              width: 45,
              height: 55,
              textAlign: 'center',
              fontSize: 20,
              borderRadius: 8
            }}
          />
        ))}
      </View>

      {/* verify button */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity
          onPress={() => handleVerify()}
          style={{
            marginTop: 20,
            backgroundColor: 'blue',
            padding: 12,
            borderRadius: 8
          }}
        >
          <Text style={{ color: 'white' }}>Verify</Text>
        </TouchableOpacity>
      )}

      {/* resend */}
      <TouchableOpacity
        onPress={handleResend}
        disabled={cooldown > 0 || resending}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: cooldown > 0 ? 'gray' : 'blue' }}>
          {resending
            ? "Sending..."
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : "Resend Code"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TwoFactorAuthView;
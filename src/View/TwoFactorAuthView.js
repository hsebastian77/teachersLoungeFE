import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { verifyOTP, resendOTP } from '../Controller/TwoFactorAuthCommand';

const TwoFactorAuthView = () => {
  const { pendingAuth, login } = useAuth();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }

    if (!pendingAuth?.email || !pendingAuth?.tempToken) {
      Alert.alert('Error', 'Session expired. Please log in again.');
      return;
    }

    try {
      setLoading(true);

      const result = await verifyOTP(
        pendingAuth.email,
        trimmedCode,
        pendingAuth.tempToken
      );

      if (!result?.ok) {
        throw new Error(result?.message || 'Invalid code.');
      }

      await SecureStore.setItemAsync("token", result.token);
      login(result.user);

    } catch (error) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    if (!pendingAuth?.email || !pendingAuth?.tempToken) {
      Alert.alert('Error', 'Session expired. Please log in again.');
      return;
    }

    try {
      setResending(true);

      const result = await resendOTP(
        pendingAuth.email,
        pendingAuth.tempToken
      );

      if (!result.ok) {
        throw new Error(result.message);
      }

      Alert.alert('Success', 'Verification code resent.');
      setCooldown(30);

    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter verification code</Text>

      <TextInput
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        placeholder="6-digit code"
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Verify" onPress={handleVerify} />
      )}

      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          onPress={handleResend}
          disabled={cooldown > 0 || resending}
        >
          <Text style={{ color: cooldown > 0 ? 'gray' : 'blue' }}>
            {resending
              ? "Sending..."
              : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend Code"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TwoFactorAuthView;
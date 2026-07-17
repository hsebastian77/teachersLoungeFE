import React, { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { verifyOTP } from '../Controller/TwoFactorAuthCommand';

const TwoFactorAuthView = () => {
  const { pendingAuth, login } = useAuth();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }

    if (!pendingAuth?.email || !pendingAuth?.tempToken) {
      Alert.alert('Error', 'Authentication session expired. Please log in again.');
      return;
    }

    try {
      setLoading(true);

      const { email, tempToken } = pendingAuth;

      const result = await verifyOTP(email, trimmedCode, tempToken);

      if (!result?.ok) {
        throw new Error(result?.message || 'Invalid verification code.');
      }

      await SecureStore.setItemAsync("token", result.token);
      login(result.user); // sets user
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        error?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 10 }}>
        Enter the verification code
      </Text>

      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="6-digit code"
        keyboardType="numeric"
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          marginBottom: 20,
          borderRadius: 5,
        }}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button
          title="Verify"
          onPress={handleVerify}
          disabled={!code.trim()}
        />
      )}
    </View>
  );
};

export default TwoFactorAuthView;
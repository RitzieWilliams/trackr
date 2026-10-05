import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { loadProfile, saveProfile } from '../data/profile';
import AuthForm from '../components/AuthForm';
import { Button, FormInput, FormLabel } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleLogin() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) { setMessage({ error: true, text: 'Please enter your email and password.' }); return; }

    setBusy(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    setBusy(false);

    if (error) { setMessage({ error: true, text: error.message }); return; }

    const name = data.user?.user_metadata?.name;
    if (name) saveProfile({ ...loadProfile(), name });
    // The root layout's auth guard moves us into the app once the session lands
  }

  return (
    <AuthForm title="Welcome Back" subtitle="Log in to your TRACKR account." message={message}>
      <FormLabel>Email</FormLabel>
      <FormInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <FormLabel style={{ marginTop: 18 }}>Password</FormLabel>
      <FormInput
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleLogin}
      />
      <Button title={busy ? 'Logging in...' : 'Log In'} onPress={handleLogin} disabled={busy} style={{ marginTop: 28 }} />
      <Button title="Create an account" variant="ghost" onPress={() => router.replace('/register')} style={{ marginTop: 10 }} />
    </AuthForm>
  );
}

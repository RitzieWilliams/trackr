import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { saveProfile } from '../data/profile';
import AuthForm from '../components/AuthForm';
import { Button, FormInput, FormLabel } from '../components/ui';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleRegister() {
    const cleanName  = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName)                               { setMessage({ error: true, text: 'Please enter your name.' }); return; }
    if (!cleanEmail || !cleanEmail.includes('@')) { setMessage({ error: true, text: 'Please enter a valid email.' }); return; }
    if (password.length < 6)                      { setMessage({ error: true, text: 'Password must be at least 6 characters.' }); return; }

    setBusy(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { name: cleanName } },
    });
    setBusy(false);

    if (error) { setMessage({ error: true, text: error.message }); return; }

    saveProfile({ name: cleanName, goal: '' });
    if (data.user && !data.session) {
      setMessage({ text: 'Check your email for a confirmation link, then come back and log in.' });
    }
  }

  return (
    <AuthForm title="Create Account" subtitle="Start tracking your activities today." message={message}>
      <FormLabel>Name</FormLabel>
      <FormInput value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" textContentType="name" />
      <FormLabel style={{ marginTop: 18 }}>Email</FormLabel>
      <FormInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <FormLabel style={{ marginTop: 18 }}>Password</FormLabel>
      <FormInput
        value={password}
        onChangeText={setPassword}
        placeholder="At least 6 characters"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleRegister}
      />
      <Button title={busy ? 'Creating account...' : 'Create Account'} onPress={handleRegister} disabled={busy} style={{ marginTop: 28 }} />
      <Button title="I already have an account" variant="ghost" onPress={() => router.replace('/login')} style={{ marginTop: 10 }} />
    </AuthForm>
  );
}

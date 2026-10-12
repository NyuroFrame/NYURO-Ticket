'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/auth-context';
import { PasswordInput } from '../components/PasswordInput';
import { AuthLayout, AuthError } from '../components/AuthLayout';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setSubmitting(true);
    try {
      const err = await resetPassword(newPassword);
      if (err) {
        setError(err);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.replace('/');
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Restablecer contraseña"
      subtitle="Es necesario que cambies tu contraseña antes de continuar."
    >
      {success ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-5 text-center">
          <CheckCircle2 size={22} className="mx-auto text-success" />
          <p className="mt-2 text-sm font-semibold text-ink-900">Contraseña actualizada</p>
          <p className="mt-0.5 text-[13px] text-ink-500">Redirigiendo al panel…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Nueva contraseña"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
          />
          <PasswordInput
            label="Confirmar contraseña"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Repite la contraseña"
          />
          <AuthError message={error} />
          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center !py-2.5">
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Guardando…
              </span>
            ) : (
              'Guardar contraseña'
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

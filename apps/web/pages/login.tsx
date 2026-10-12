'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/auth-context';
import { PasswordInput } from '../components/PasswordInput';
import { AuthLayout, AuthError } from '../components/AuthLayout';

type LoginMode = 'admin' | 'org';

const MODE_META: Record<LoginMode, { hint: string }> = {
  org: { hint: 'Para Agentes y Solicitantes de una organización' },
  admin: { hint: 'Para Super Admin, Account Admin, IT Manager y Org Admin' },
};

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('org');
  const [orgCode, setOrgCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { adminLogin, orgLogin } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const err =
        mode === 'admin'
          ? await adminLogin(name.trim(), password)
          : await orgLogin(orgCode.trim(), name.trim(), password);
      if (err) setError(err);
      else router.replace('/');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle={MODE_META[mode].hint}
      footer={
        mode === 'org' ? (
          <>
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
              Registrarse
            </Link>
          </>
        ) : (
          <>Acceso restringido a roles administrativos</>
        )
      }
    >
      {/* Segmented control empresarial */}
      <div
        role="tablist"
        aria-label="Tipo de acceso"
        className="mb-5 grid grid-cols-2 gap-1 rounded-md border border-line bg-slate-50 p-1"
      >
        {(['org', 'admin'] as LoginMode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            type="button"
            onClick={() => {
              setMode(m);
              setError('');
            }}
            className={`rounded px-3 py-1.5 text-[13px] font-medium transition-colors ${
              mode === m
                ? 'bg-white text-ink-900 shadow-card ring-1 ring-line'
                : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            {m === 'org' ? 'Organización' : 'Admin / IT'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'org' && (
          <div>
            <label htmlFor="orgCode" className="label">
              Código de Organización
            </label>
            <input
              id="orgCode"
              type="text"
              value={orgCode}
              onChange={(e) => setOrgCode(e.target.value)}
              required
              autoComplete="organization"
              className="input ref-mono"
              placeholder="Ej: acme-corp"
            />
          </div>
        )}
        <div>
          <label htmlFor="name" className="label">
            Nombre / Email
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="username"
            className="input"
            placeholder="Tu usuario"
          />
        </div>
        <PasswordInput
          label="Contraseña"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="Ingresa tu contraseña"
        />
        <AuthError message={error} />
        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center !py-2.5">
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Verificando…
            </span>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

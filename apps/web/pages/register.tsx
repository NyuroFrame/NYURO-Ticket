'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/auth-context';
import { useOrgUnits } from '../hooks/useOrgUnits';
import { PasswordInput } from '../components/PasswordInput';
import { AuthLayout, AuthError } from '../components/AuthLayout';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [orgUnitId, setOrgUnitId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { orgUnits, loading: loadingOrgUnits, error: orgUnitsError, fetchOrgUnitsByOrgCode } = useOrgUnits();
  const router = useRouter();

  useEffect(() => {
    if (orgCode.trim().length >= 3) {
      const timeout = setTimeout(() => {
        fetchOrgUnitsByOrgCode(orgCode.trim());
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [orgCode, fetchOrgUnitsByOrgCode]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!orgCode.trim()) {
      setError('El código de organización es requerido');
      return;
    }
    if (!orgUnitId) {
      setError('Selecciona un área');
      return;
    }

    setSubmitting(true);
    try {
      const err = await register(name.trim(), password, orgCode.trim(), orgUnitId);
      if (err) setError(err);
      else router.replace('/');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Para Agentes y Solicitantes. Tu cuenta queda vinculada a tu organización y área."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Ej: maria.lopez"
          />
        </div>
        <PasswordInput
          label="Contraseña"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
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
              placeholder="acme-corp"
              className="input ref-mono"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="orgUnit" className="label">
              Área / Departamento
            </label>
            <select
              id="orgUnit"
              value={orgUnitId}
              onChange={(e) => setOrgUnitId(e.target.value)}
              required
              className="input"
            >
              <option value="">{loadingOrgUnits ? 'Cargando áreas…' : 'Selecciona un área'}</option>
              {orgUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>
        </div>
        {orgUnitsError && (
          <p className="text-xs text-danger">{orgUnitsError}</p>
        )}
        {!orgUnitsError && orgCode.trim().length >= 3 && orgUnits.length === 0 && !loadingOrgUnits && (
          <p className="text-xs text-ink-500">
            Escribe un código válido para cargar sus áreas.
          </p>
        )}
        <AuthError message={error} />
        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center !py-2.5">
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creando cuenta…
            </span>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

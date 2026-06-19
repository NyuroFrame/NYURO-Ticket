'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/auth-context';
import { useOrgUnits } from '../hooks/useOrgUnits';
import { PasswordInput } from '../components/PasswordInput';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [orgUnitId, setOrgUnitId] = useState('');
  const [error, setError] = useState('');
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

    const err = await register(name, password, orgCode, orgUnitId);
    if (err) setError(err);
    else router.replace('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Crear cuenta
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre / Email
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <PasswordInput
              label="Contraseña"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
            />
            <div>
              <label htmlFor="orgCode" className="block text-sm font-medium text-gray-700 mb-1">
                Código de Organización
              </label>
              <input
                id="orgCode"
                type="text"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
                required
                placeholder="Ej: acme-corp"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="orgUnit" className="block text-sm font-medium text-gray-700 mb-1">
                Área / Departamento
              </label>
              <select
                id="orgUnit"
                value={orgUnitId}
                onChange={(e) => setOrgUnitId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{loadingOrgUnits ? 'Cargando áreas...' : 'Selecciona un área'}</option>
                {orgUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
              {orgUnitsError && (
                <p className="text-xs text-red-600 mt-1">{orgUnitsError}</p>
              )}
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Crear cuenta
            </button>
          </form>
          <p className="mt-6 text-sm text-center text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

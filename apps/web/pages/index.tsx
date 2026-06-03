import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/auth-context';

function HomeContent() {
  const { user, tenant, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Nyuro Ticket System</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user?.name} · {tenant?.name}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome, {user?.name}
          </h2>
          <p className="text-sm text-gray-500">
            You are logged in as <span className="font-medium">{user?.role}</span> under{' '}
            <span className="font-medium">{tenant?.name}</span>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

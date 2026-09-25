import { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api/client';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', { username, password });
      const { access_token, user } = res.data;
      
      localStorage.setItem('pizzetas_token', access_token);
      localStorage.setItem('pizzetas_user', JSON.stringify(user));
      
      onLoginSuccess(user);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error al conectar con el servidor de autenticación';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-4xl">🍕</span>
          <h2 className="text-2xl font-black text-slate-800">Pizzetas Artesanales</h2>
          <p className="text-sm text-slate-500">Sistema Inteligente de Control e Inventario</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej. admin u operario"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none text-slate-800"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none text-slate-800"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl shadow-lg transition transform active:scale-95 cursor-pointer"
          >
            {loading ? 'Verificando Credenciales...' : 'Iniciar Sesión Segura'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Acceso rápido pruebas: <br/>
          <span className="font-semibold text-slate-600">Admin:</span> admin / 123 &nbsp;|&nbsp; <span className="font-semibold text-slate-600">Operario:</span> operario / 123
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
};
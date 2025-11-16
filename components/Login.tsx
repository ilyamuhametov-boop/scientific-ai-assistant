import React, { useState } from 'react';
import { ThinkingIcon } from './Icons';
import { auth } from '../services/firebase';
import { SmartCaptcha } from '@yandex/smart-captcha';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

type AuthMode = 'login' | 'register';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaInstanceKey, setCaptchaInstanceKey] = useState(0);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaInstanceKey((prev) => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

     if (!captchaToken) {
      setError('Подтвердите, что вы не робот.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      let message = 'Не удалось выполнить запрос. Попробуйте ещё раз.';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      resetCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setError('');
    resetCaptcha();
  };

  const siteKey = process.env.SMARTCAPTCHA_CLIENT_KEY;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 font-sans px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center">
          <ThinkingIcon className="w-12 h-12 text-indigo-500" />
          <h1 className="mt-4 text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Научный ИИ-ассистент
          </h1>
           <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === 'login' ? 'Войдите, чтобы продолжить' : 'Создайте аккаунт, чтобы начать'}
          </p>
        </div>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
               <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Пароль</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                placeholder="Пароль (мин. 6 символов)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Подтвердите пароль</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-center">
            <SmartCaptcha
              key={captchaInstanceKey}
              sitekey={siteKey || ''}
              language="ru"
              onSuccess={(token) => {
                setCaptchaToken(token);
                setError('');
              }}
              onTokenExpired={() => setCaptchaToken(null)}
              onNetworkError={() => setError('Ошибка сети при проверке капчи. Попробуйте ещё раз.')}
              onJavascriptError={(err) =>
                setError(`SmartCaptcha: ${err.message || 'неизвестная ошибка'}`)
              }
            />
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || !captchaToken}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
            >
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
            <button
              type="button"
              onClick={toggleMode}
              className="w-full text-sm text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              {mode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
            </button>
            <p className="text-xs text-center text-gray-600 dark:text-gray-400">
              Регистрируясь или входя, вы принимаете <a className="text-indigo-600 underline" href="/privacy.html">политику конфиденциальности</a>, <a className="text-indigo-600 underline" href="/cookies.html">политику cookies</a> и <a className="text-indigo-600 underline" href="/consent.html">согласие на обработку персональных данных</a>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};



import React from 'react';
import { User } from 'firebase/auth';
import { UserPlan } from '../types';
import { UserIcon } from './Icons';

interface AccountPanelProps {
  user: User;
  plan: UserPlan;
  onPlanChange: (plan: UserPlan) => void;
}

const plans: Array<{
  id: UserPlan;
  title: string;
  price: string;
  description: string;
  features: string[];
}> = [
  {
    id: 'free',
    title: 'Free',
    price: '0 ₽ / месяц',
    description: 'Базовый доступ к загрузке PDF и личной библиотеке.',
    features: [
      'Загрузка PDF до 10 МБ',
      'Чат и ответы без гарантий скорости',
      'Личная библиотека и рабочее пространство',
    ],
  },
  {
    id: 'pro',
    title: 'Pro',
    price: '990 ₽ / месяц',
    description: 'Ускоренные ответы и расширенные возможности ИИ.',
    features: [
      'Все возможности Free',
      'Приоритетные ответы и больше токенов',
      'Расширенные модели ИИ',
      'Графы и сравнения без лимитов',
    ],
  },
];

export const AccountPanel: React.FC<AccountPanelProps> = ({ user, plan, onPlanChange }) => {
  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      <header className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center space-x-4">
        <div className="flex h-14 w-14 rounded-full bg-indigo-500 text-white items-center justify-center">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Аккаунт</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{user.email || user.displayName || 'Пользователь'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Текущий тариф: {plan === 'pro' ? 'Pro' : 'Free'}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Тарифы</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Выберите подходящий тариф. Pro даёт приоритетные ответы и расширенные лимиты.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((planOption) => {
              const isActive = planOption.id === plan;
              return (
                <div
                  key={planOption.id}
                  className={`rounded-2xl border p-6 flex flex-col h-full transition-shadow ${
                    isActive ? 'border-indigo-500 shadow-lg bg-white dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{planOption.title}</h3>
                    {isActive && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100">
                        Активно
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{planOption.description}</p>
                  <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-50">{planOption.price}</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {planOption.features.map((feature) => (
                      <li key={feature} className="flex items-start space-x-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-auto w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                      isActive
                        ? 'border border-indigo-500 text-indigo-600 dark:text-indigo-300 bg-transparent'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    onClick={() => onPlanChange(planOption.id)}
                    disabled={isActive}
                  >
                    {isActive ? 'Тариф активен' : 'Перейти на тариф'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

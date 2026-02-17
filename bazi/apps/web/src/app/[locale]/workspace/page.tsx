import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function WorkspacePage() {
  const t = useTranslations();

  const tools = [
    { key: 'baziCalculate', href: '/workspace/bazi-calculate', emoji: '🏯' },
    { key: 'baziDaily', href: '/workspace/bazi-daily', emoji: '📅' },
    { key: 'baziMarriage', href: '/workspace/bazi-marriage', emoji: '💑' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('workspace.title')}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ key, href, emoji }) => (
          <Link
            key={key}
            href={href}
            className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
          >
            <div className="mb-3 text-3xl">{emoji}</div>
            <h3 className="mb-1 font-semibold">
              {t(`home.features.${key}`)}
            </h3>
            <p className="text-sm text-gray-500">
              {t(`home.features.${key}Desc`)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

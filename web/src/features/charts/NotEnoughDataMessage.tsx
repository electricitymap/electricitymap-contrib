import { useTranslation } from 'react-i18next';

import { ChartTitle } from './ChartTitle';

export function NotEnoughDataMessage({ title, id }: { title: string; id: string }) {
  const { t } = useTranslation();
  return (
    <div className="w-full">
      <ChartTitle translationKey={title} id={id} />
      <div className="my-2 rounded bg-gray-200 py-4 text-center text-sm dark:bg-gray-800">
        <p>{t('country-history.not-enough-data')}</p>
      </div>
    </div>
  );
}

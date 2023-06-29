import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import type { GridState } from 'types';
import { getBasePath, getHeaders, QUERY_KEYS } from './helpers';
import { timeAverageAtom } from 'utils/state/atoms';

const getState = async (timeAverage: string): Promise<GridState> => {
  const path = `v6/state/${timeAverage}`;
  const requestOptions: RequestInit = {
    method: 'GET',
    headers: await getHeaders(path),
  };

  const response = await fetch(`${getBasePath()}/${path}`, requestOptions);

  if (response.ok) {
    const result = (await response.json()) as GridState;
    return result;
  }

  throw new Error(await response.text());
};

const useGetState = (): UseQueryResult<GridState> => {
  const [timeAverage] = useAtom(timeAverageAtom);
  return useQuery<GridState>([QUERY_KEYS.STATE, { aggregate: timeAverage }], async () =>
    getState(timeAverage)
  );
};

export default useGetState;

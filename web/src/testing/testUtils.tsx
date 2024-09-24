import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { Provider, WritableAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import type { PropsWithChildren, ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

export const DESKTOP_RESOLUTION_WIDTH = 1280;
export const DESKTOP_RESOLUTION_HEIGHT = 800;

export const MOBILE_RESOLUTION_WIDTH = 414;
export const MOBILE_RESOLUTION_HEIGHT = 896;

export default function renderWithProviders(
  ui: ReactElement,
  includeRouter = true
): void {
  render(ui, {
    wrapper: ({ children }: PropsWithChildren): ReactElement => (
      <QueryClientProvider client={queryClient}>
        {includeRouter ? <BrowserRouter>{children}</BrowserRouter> : children}
      </QueryClientProvider>
    ),
  });
}

export interface HydrateProps {
  initialValues: (readonly [WritableAtom<any, any, any>, unknown])[];
  children: React.ReactNode;
}

export const HydrateAtoms = ({ initialValues, children }: HydrateProps) => {
  useHydrateAtoms(initialValues);
  return children;
};

export function TestProvider({ initialValues, children }: HydrateProps) {
  return (
    <Provider>
      <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
    </Provider>
  );
}

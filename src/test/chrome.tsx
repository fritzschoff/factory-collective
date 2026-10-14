import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ChromeProvider } from '@/components/chrome/ChromeProvider';
import { Toast } from '@/components/chrome/Toast';

/** Renders inside the page chrome; the test file must mock next/navigation's usePathname. */
export const renderWithChrome = (ui: ReactElement) => render(<ChromeProvider>{ui}<Toast /></ChromeProvider>);

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './application/context/LanguageContext';
import { ThemeProvider } from './application/context/ThemeContext';
import { FavoritesProvider } from './application/context/FavoritesContext';
import { AppLayout } from './presentation/layouts/AppLayout';
import { HomePage } from './presentation/pages/HomePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10 * 60 * 1000, gcTime: 30 * 60 * 1000, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <FavoritesProvider>
            <AppLayout>
              <HomePage />
            </AppLayout>
          </FavoritesProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantThemeProvider } from "@/themes/theme-provider/TenantThemeProvider";
import { router } from "@/app/router";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TenantThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </TenantThemeProvider>
    </QueryClientProvider>
  );
}


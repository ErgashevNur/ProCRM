import { RouterProvider } from "react-router-dom";
import routes from "./routes";
import NetworkBoundary from "./components/NetworkBoundary";
import { ThemeProvider } from "./hooks/useTheme";

export default function App() {
  return (
    <ThemeProvider>
      <NetworkBoundary>
        <RouterProvider router={routes} />
      </NetworkBoundary>
    </ThemeProvider>
  );
}

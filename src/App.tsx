import { HashRouter, Route, Routes } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { useTheme } from "@/hooks/useTheme";
import { RegisterPage } from "@/components/onboarding/RegisterPage";
import { Dashboard } from "@/pages/Dashboard";

function Gate() {
  const isRegistered = useUserStore((s) => s.isRegistered);
  return isRegistered ? <Dashboard /> : <RegisterPage />;
}

export default function App() {
  useTheme();

  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<Gate />} />
      </Routes>
    </HashRouter>
  );
}

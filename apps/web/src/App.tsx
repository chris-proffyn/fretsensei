import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { HowToScreen } from './screens/HowToScreen';
import { PracticeScreen } from './screens/PracticeScreen';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/practice" element={<PracticeScreen />} />
      <Route path="/how-to" element={<HowToScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

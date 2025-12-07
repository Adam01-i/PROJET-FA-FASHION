// components/client/ClientLayout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from './views/Navbar';
import Footer from './views/Footer';

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
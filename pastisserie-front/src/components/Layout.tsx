import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans text-patisserie-dark bg-patisserie-cream">
      <Navbar />
      {/* El main flex-grow asegura que ocupe el espacio disponible empujando el footer */}
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
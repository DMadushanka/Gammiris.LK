import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import CartPage from './pages/CartPage';
import Login from './pages/Login';
import Nursery from './pages/Nursery';
import SellerRegistration from './pages/SellerRegistration';
import Profile from './pages/Profile';
import ProductDetails from './pages/ProductDetails';
import FarmerPortal   from './pages/FarmerPortal';
import MarketAnalytics from './pages/MarketAnalytics';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

/* Pages that should render WITHOUT the Navbar / Footer */
const AuthRoutes = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
    </Routes>
);

/* All other pages wrapped in the shell */
const ShellRoutes = () => (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#080F0A', color: '#fff' }}>
        <div className="noise-overlay" />
        <div className="bg-mesh" />
        <Navbar />
        <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>
            <Routes>
                <Route path="/"                    element={<Home />} />
                <Route path="/shop"                element={<Shop />} />
                <Route path="/cart"                element={<CartPage />} />
                <Route path="/nursery"             element={<Nursery />} />
                <Route path="/seller-registration" element={<SellerRegistration />} />
                <Route path="/profile"             element={<Profile />} />
                <Route path="/about"               element={<Home />} />
                <Route path="/product/:id"         element={<ProductDetails />} />
                <Route path="/farmer-portal"       element={<FarmerPortal />} />
                <Route path="/analytics"           element={<MarketAnalytics />} />
            </Routes>
        </main>
        <Footer />
    </div>
);

const AppRoutes = () => {
    const { pathname } = useLocation();
    const isAuth = pathname === '/login';
    return (
        <>
            <ScrollToTop />
            {isAuth ? <AuthRoutes /> : <ShellRoutes />}
        </>
    );
};

const App = () => (
    <Router>
        <AuthProvider>
            <CartProvider>
                <AppRoutes />
            </CartProvider>
        </AuthProvider>
    </Router>
);

export default App;


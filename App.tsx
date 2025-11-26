import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Registration } from './pages/Registration';
import { Users } from './pages/Users';
import { Companies } from './pages/Companies';
import { Reports } from './pages/Reports';
import { AdminDashboard } from './pages/AdminDashboard';
import { Sidebar } from './components/Sidebar';
import { StorageService } from './services/storage';
import { User, UserRole } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('register');
  const [pendingPage, setPendingPage] = useState<string | null>(null);

  useEffect(() => {
    const sessionUser = StorageService.getCurrentUser();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // If user was trying to access a specific page, go there, otherwise go to Admin Dashboard
    setCurrentPage(pendingPage || 'admin');
    setPendingPage(null);
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setCurrentPage('register');
  };

  const handleNavigate = (page: string) => {
    // Pages that require Admin authentication
    const restrictedPages = ['users', 'companies', 'reports', 'admin'];
    
    if (restrictedPages.includes(page)) {
      if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        setPendingPage(page);
        setCurrentPage('login');
        return;
      }
    }
    
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'register':
        return <Registration />;
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'users':
        return <Users />;
      case 'companies':
        return <Companies />;
      case 'reports':
        return <Reports />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      default:
        return <Registration />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userRole={currentUser?.role || UserRole.USER}
        isAuthenticated={!!currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
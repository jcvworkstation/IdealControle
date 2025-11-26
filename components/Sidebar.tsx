import React from 'react';
import { Utensils, Users, Building, BarChart2, LogOut, Shield, LogIn } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: UserRole;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, userRole, isAuthenticated, onLogout }) => {
  
  const NavItem = ({ page, icon: Icon, label }: { page: string; icon: any; label: string }) => (
    <button
      onClick={() => onNavigate(page)}
      className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
        currentPage === page
          ? 'bg-[#26804d] border-l-4 border-[#86efac] text-white font-medium'
          : 'text-gray-200 hover:bg-[#26804d] hover:text-white border-l-4 border-transparent'
      }`}
    >
      <Icon size={24} />
      <span className="text-lg">{label}</span>
    </button>
  );

  return (
    <aside className="w-64 bg-primary text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-50 no-print">
      <div className="p-8 flex items-center gap-3 border-b border-green-800">
        <Utensils size={32} className="text-aeroGreen" />
        <h1 className="text-2xl font-bold">IdealControl</h1>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
        <NavItem page="register" icon={Utensils} label="Registro" />
        <NavItem page="users" icon={Users} label="Usuários" />
        <NavItem page="companies" icon={Building} label="Empresas" />
        <NavItem page="reports" icon={BarChart2} label="Relatórios" />
        
        <div className="my-2 border-t border-green-800 mx-4"></div>
        
        <NavItem page="admin" icon={Shield} label="Administração" />
      </nav>

      <div className="p-4 border-t border-green-800">
        {isAuthenticated ? (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-200 hover:bg-red-900/30 hover:text-red-100 rounded transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        ) : (
          <button
             onClick={() => onNavigate('admin')} // Clicking admin triggers login flow
             className="w-full flex items-center gap-3 px-4 py-3 text-green-200 hover:bg-green-900/30 hover:text-white rounded transition-colors"
          >
             <LogIn size={20} />
             <span>Login Admin</span>
          </button>
        )}
      </div>
    </aside>
  );
};
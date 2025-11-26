import React from 'react';
import { Users, Building, BarChart2, Shield } from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const Card = ({ title, desc, icon: Icon, page, colorClass }: any) => (
    <button 
      onClick={() => onNavigate(page)}
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-left border border-gray-100 group"
    >
      <div className={`p-4 rounded-full w-fit mb-4 ${colorClass}`}>
        <Icon size={32} className="text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-gray-500">{desc}</p>
    </button>
  );

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-green-100 rounded-lg">
            <Shield size={32} className="text-primary" />
        </div>
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Administração</h2>
            <p className="text-gray-500">Painel de controle geral do sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card 
          title="Gerenciar Usuários" 
          desc="Cadastre, edite ou remova usuários do sistema e defina permissões."
          icon={Users}
          page="users"
          colorClass="bg-blue-500"
        />
        <Card 
          title="Gerenciar Empresas" 
          desc="Controle o cadastro de empresas parceiras e seus logotipos."
          icon={Building}
          page="companies"
          colorClass="bg-orange-500"
        />
        <Card 
          title="Relatórios Gerais" 
          desc="Visualize gráficos e exporte dados de refeições registradas."
          icon={BarChart2}
          page="reports"
          colorClass="bg-purple-500"
        />
      </div>
    </div>
  );
};
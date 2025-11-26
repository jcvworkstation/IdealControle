import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { User, MealType } from '../types';
import { Search, Coffee, Utensils, Moon, CheckCircle, User as UserIcon } from 'lucide-react';

export const Registration: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  // New state for Outsourced logic
  const [isOutsourced, setIsOutsourced] = useState(false);
  const [outsourcedName, setOutsourcedName] = useState('');

  useEffect(() => {
    setUsers(StorageService.getUsers());
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSelectedUser(null);
    if (val) {
        setIsOutsourced(false);
        setOutsourcedName('');
    }
  };

  const handleOutsourcedClick = () => {
    setIsOutsourced(true);
    setSearchQuery('');
    setSelectedUser(null);
  };

  const handleRegister = () => {
    if ((!selectedUser && !isOutsourced) || !selectedMealType) return;

    let userId: string;
    let companyId: string;
    let userName: string;
    let companyName: string;

    if (isOutsourced) {
        // Logic for Outsourced
        const nameToUse = outsourcedName.trim() || 'TERCEIRIZADO';
        userId = `outsourced_${crypto.randomUUID()}`;
        companyId = 'outsourced_company_id';
        userName = nameToUse;
        companyName = 'TERCEIRIZADO';
    } else {
        // Logic for Registered User
        if (!selectedUser) return;
        const companies = StorageService.getCompanies();
        const userCompany = companies.find(c => c.id === selectedUser.companyId);
        
        userId = selectedUser.id;
        companyId = selectedUser.companyId;
        userName = selectedUser.name;
        companyName = userCompany ? userCompany.name : 'Unknown';
    }

    StorageService.addMeal({
      id: crypto.randomUUID(),
      userId: userId,
      companyId: companyId,
      userName: userName,
      companyName: companyName,
      type: selectedMealType,
      date: new Date().toISOString()
    });

    const mealLabel = selectedMealType === MealType.BREAKFAST ? 'Café da Manhã' : selectedMealType === MealType.LUNCH ? 'Almoço' : 'Jantar';
    setSuccessMsg(`Refeição (${mealLabel}) registrada para ${userName}!`);
    
    // Reset form after short delay
    setTimeout(() => {
      setSuccessMsg('');
      setSelectedUser(null);
      setSelectedMealType(null);
      setSearchQuery('');
      setIsOutsourced(false);
      setOutsourcedName('');
    }, 2000);
  };

  const MealButton = ({ type, label, icon: Icon, colorClass, borderClass }: any) => (
    <button
      onClick={() => setSelectedMealType(type)}
      className={`relative group flex flex-col items-center justify-center h-40 rounded-xl transition-all duration-300 border-2 overflow-hidden shadow-md
        ${selectedMealType === type ? 'ring-4 ring-offset-2 ring-blue-400 scale-105' : 'hover:scale-105 hover:shadow-lg'}
        ${colorClass} ${borderClass}
      `}
    >
      {/* Aero Glass Shine Effect */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-white opacity-20 group-hover:opacity-30 transition-opacity"></div>
      
      <Icon size={48} className="mb-3 text-gray-800 opacity-70 z-10" />
      <span className="text-lg font-bold text-gray-800 z-10">{label}</span>
    </button>
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Registro de Refeição</h2>
          <p className="text-gray-500 text-lg">Selecione seu nome e o tipo de refeição</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle size={24} />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        <div className="mb-6 w-full">
            {/* User Search */}
            <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Pesquisar Usuário</label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Digite seu nome..."
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border focus:ring-2 focus:ring-green-200 outline-none text-lg transition-all 
                            ${selectedUser ? 'border-green-500 bg-green-50' : 'border-gray-200'}
                            ${isOutsourced ? 'bg-gray-100 text-gray-400' : ''}
                        `}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        disabled={isOutsourced}
                    />
                    {isOutsourced && (
                        <button 
                            onClick={() => setIsOutsourced(false)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-blue-600 hover:underline"
                        >
                            Habilitar Pesquisa
                        </button>
                    )}
                </div>
                
                {/* User Dropdown Results */}
                {searchQuery && !selectedUser && !isOutsourced && (
                    <div className="absolute w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-20">
                        {filteredUsers.length === 0 ? (
                            <div className="p-4 text-gray-500 text-center">Nenhum usuário encontrado.</div>
                        ) : (
                            filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    className="w-full text-left px-6 py-3 hover:bg-green-50 transition-colors flex items-center justify-between group"
                                    onClick={() => {
                                        setSearchQuery(user.name);
                                        setSelectedUser(user);
                                    }}
                                >
                                    <span className="font-medium text-gray-700">{user.name}</span>
                                    <span className="text-xs text-gray-400 group-hover:text-green-600">Selecionar</span>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Separator OR */}
            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OU</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* TERCEIRIZADO Button Section */}
            <div className="flex flex-col items-center">
                <button
                    onClick={handleOutsourcedClick}
                    className={`w-full md:w-auto min-w-[200px] px-8 py-3 rounded-xl font-bold transition-all border-2 flex items-center justify-center gap-2
                        ${isOutsourced 
                            ? 'bg-gray-500 text-white border-gray-500 shadow-lg scale-105' 
                            : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                        }
                    `}
                >
                    <UserIcon size={20} />
                    TERCEIRIZADO
                </button>
                <span className="text-xs text-gray-500 mt-2 font-medium">Prestador de Serviço Temporário</span>

                {/* Optional Name Input for Outsourced */}
                {isOutsourced && (
                    <div className="mt-4 w-full md:w-2/3 animate-fade-in">
                        <input 
                            type="text" 
                            placeholder="Nome do Prestador (Opcional)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none text-center bg-gray-50"
                            value={outsourcedName}
                            onChange={(e) => setOutsourcedName(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}
            </div>

        </div>

        {/* Meal Type Selection - Aero Style */}
        <div className="mb-10">
            <label className="block text-sm font-bold text-gray-700 mb-4">Tipo de Refeição</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MealButton 
                    type={MealType.BREAKFAST} 
                    label="Café da Manhã" 
                    icon={Coffee}
                    colorClass="bg-gradient-to-b from-[#fcd34d] to-[#fb923c]" 
                    borderClass="border-orange-400"
                />
                <MealButton 
                    type={MealType.LUNCH} 
                    label="Almoço" 
                    icon={Utensils}
                    colorClass="bg-gradient-to-b from-[#a3e635] to-[#4ade80]" 
                    borderClass="border-green-400"
                />
                <MealButton 
                    type={MealType.DINNER} 
                    label="Jantar" 
                    icon={Moon}
                    colorClass="bg-gradient-to-b from-[#a5b4fc] to-[#6366f1]" 
                    borderClass="border-indigo-400"
                />
            </div>
        </div>

        {/* Submit Button */}
        <button
            onClick={handleRegister}
            disabled={(!selectedUser && !isOutsourced) || !selectedMealType}
            className={`w-full py-4 rounded-xl text-xl font-bold shadow-lg transition-all transform
                ${((!selectedUser && !isOutsourced) || !selectedMealType) 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-gray-300 to-gray-400 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:-translate-y-1 active:scale-95 text-shadow-sm'
                }
            `}
        >
            Registrar Refeição
        </button>

      </div>
    </div>
  );
};
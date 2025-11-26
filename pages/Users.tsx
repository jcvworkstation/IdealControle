import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { User, Company, UserRole } from '../types';
import { Trash2, Edit, UserPlus, ShieldCheck, Shield } from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({ name: '', companyId: '', role: UserRole.USER });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(StorageService.getUsers());
    setCompanies(StorageService.getCompanies());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.companyId) return;

    const newUser: User = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name,
      companyId: formData.companyId,
      role: formData.role || UserRole.USER,
      password: formData.password || undefined // Only keep if set
    };

    StorageService.saveUser(newUser);
    refreshData();
    resetForm();
  };

  const handleEdit = (user: User) => {
    setFormData({ ...user });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      StorageService.deleteUser(id);
      refreshData();
    }
  };

  const toggleAdmin = (user: User) => {
    const newRole = user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    // Set password to 'admin' if promoting, or clear it. In real app, prompt for password.
    const password = newRole === UserRole.ADMIN ? (user.password || 'admin') : undefined;
    
    StorageService.saveUser({ ...user, role: newRole, password });
    refreshData();
  };

  const resetForm = () => {
    setFormData({ name: '', companyId: '', role: UserRole.USER });
    setIsEditing(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Gerenciamento de Usuários</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="text-primary" />
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Nome completo"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <select
                value={formData.companyId || ''}
                onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              >
                <option value="">Selecione uma empresa</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {/* Password field only if making admin manually, hidden for simplicity in requirement */}
            
            <div className="flex gap-2 mt-6">
              <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-green-800 transition">
                {isEditing ? 'Atualizar' : 'Cadastrar'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Nome</th>
                <th className="p-4 font-semibold text-gray-600">Empresa</th>
                <th className="p-4 font-semibold text-gray-600">Perfil</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(user => {
                const company = companies.find(c => c.id === user.companyId);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4 text-gray-500">{company?.name || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === UserRole.ADMIN ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => toggleAdmin(user)}
                        title={user.role === UserRole.ADMIN ? "Remover Admin" : "Promover a Admin"}
                        className={`p-2 rounded-lg transition-colors ${user.role === UserRole.ADMIN ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      >
                         {user.role === UserRole.ADMIN ? <ShieldCheck size={18} /> : <Shield size={18} />}
                      </button>
                      <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">Nenhum usuário cadastrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
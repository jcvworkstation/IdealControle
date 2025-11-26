import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { Company } from '../types';
import { Trash2, Edit, Building, Image as ImageIcon } from 'lucide-react';

export const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({ name: '', logoUrl: '' });

  useEffect(() => {
    setCompanies(StorageService.getCompanies());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newCompany: Company = {
      id: formData.id || crypto.randomUUID(),
      name: formData.name,
      logoUrl: formData.logoUrl || ''
    };

    StorageService.saveCompany(newCompany);
    setCompanies(StorageService.getCompanies());
    resetForm();
  };

  const handleEdit = (company: Company) => {
    setFormData({ ...company });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir empresa? Isso pode afetar usuários vinculados.')) {
      StorageService.deleteCompany(id);
      setCompanies(StorageService.getCompanies());
    }
  };

  const resetForm = () => {
    setFormData({ name: '', logoUrl: '' });
    setIsEditing(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Gerenciamento de Empresas</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building className="text-primary" />
            {isEditing ? 'Editar Empresa' : 'Nova Empresa'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Ex: Minha Empresa Ltda"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL do Logo (Opcional)</label>
              <div className="flex gap-2 items-center border rounded-lg p-2 focus-within:ring-2 focus-within:ring-green-500">
                <ImageIcon size={18} className="text-gray-400" />
                <input
                    type="text"
                    value={formData.logoUrl || ''}
                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full outline-none bg-transparent"
                    placeholder="https://..."
                />
              </div>
            </div>
            
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
                <th className="p-4 font-semibold text-gray-600">Logo</th>
                <th className="p-4 font-semibold text-gray-600">Nome da Empresa</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {companies.map(company => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                        {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                            <Building size={20} className="text-gray-400" />
                        )}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{company.name}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(company)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(company.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                 <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-400">Nenhuma empresa cadastrada</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
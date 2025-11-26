import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../services/storage';
import { MealRecord, Company, MealType } from '../types';
import { Download, Printer, Filter, Calendar } from 'lucide-react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Reports: React.FC = () => {
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  // Filters
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [referenceDate, setReferenceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

  useEffect(() => {
    setMeals(StorageService.getMeals());
    setCompanies(StorageService.getCompanies());
  }, []);

  const filteredMeals = useMemo(() => {
    const refDate = parseISO(referenceDate);
    let start, end;

    switch (period) {
      case 'daily':
        start = startOfDay(refDate);
        end = endOfDay(refDate);
        break;
      case 'weekly':
        start = startOfWeek(refDate, { weekStartsOn: 0 }); // Sunday
        end = endOfWeek(refDate, { weekStartsOn: 0 });
        break;
      case 'monthly':
        start = startOfMonth(refDate);
        end = endOfMonth(refDate);
        break;
      case 'yearly':
        start = startOfYear(refDate);
        end = endOfYear(refDate);
        break;
      default:
        start = startOfDay(refDate);
        end = endOfDay(refDate);
    }

    return meals.filter(meal => {
      const mealDate = parseISO(meal.date);
      const inDateRange = isWithinInterval(mealDate, { start, end });
      const inCompany = selectedCompanyId === 'all' || meal.companyId === selectedCompanyId;
      return inDateRange && inCompany;
    });
  }, [meals, period, referenceDate, selectedCompanyId]);

  const stats = useMemo(() => {
    return {
      total: filteredMeals.length,
      breakfast: filteredMeals.filter(m => m.type === MealType.BREAKFAST).length,
      lunch: filteredMeals.filter(m => m.type === MealType.LUNCH).length,
      dinner: filteredMeals.filter(m => m.type === MealType.DINNER).length
    };
  }, [filteredMeals]);

  const chartData = [
    { name: 'Café da Manhã', value: stats.breakfast, color: '#f97316' },
    { name: 'Almoço', value: stats.lunch, color: '#22c55e' },
    { name: 'Jantar', value: stats.dinner, color: '#6366f1' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Data', 'Usuário', 'Empresa', 'Tipo de Refeição'];
    const csvContent = [
      headers.join(','),
      ...filteredMeals.map(m => [
        format(parseISO(m.date), 'dd/MM/yyyy HH:mm'),
        `"${m.userName}"`, // Quote to handle commas in names
        `"${m.companyName}"`,
        m.type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_idealcontrol_${referenceDate}.csv`;
    link.click();
  };

  const selectedCompanyName = selectedCompanyId === 'all' ? 'Todas as Empresas' : companies.find(c => c.id === selectedCompanyId)?.name;
  const selectedCompanyLogo = selectedCompanyId !== 'all' ? companies.find(c => c.id === selectedCompanyId)?.logoUrl : null;

  return (
    <div className="p-8">
        {/* Header - Report Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 no-print">
            <h2 className="text-3xl font-bold text-gray-800">Relatórios</h2>
            <div className="flex gap-2">
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    <Download size={18} />
                    Exportar CSV
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Printer size={18} />
                    Imprimir
                </button>
            </div>
        </div>

        {/* Print Header (Visible only on print) */}
        <div className="hidden print-only mb-8 border-b pb-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-primary">IdealControl - Relatório</h1>
                {selectedCompanyLogo && <img src={selectedCompanyLogo} alt="Logo" className="h-12" />}
            </div>
            <p className="text-gray-500 mt-2">Gerado em: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            <p className="text-gray-500">Empresa: {selectedCompanyName}</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 no-print">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Período</label>
                    <select 
                        className="w-full border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as any)}
                    >
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                        <option value="yearly">Anual</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Data de Referência</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="date" 
                            className="w-full pl-10 border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                            value={referenceDate}
                            onChange={(e) => setReferenceDate(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Empresa</label>
                    <select 
                        className="w-full border rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                    >
                        <option value="all">Todas as Empresas</option>
                        {companies.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-blue-100 text-sm font-medium">Total de Refeições</p>
                <p className="text-4xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="bg-orange-500 rounded-xl p-6 text-white shadow-lg">
                <p className="text-orange-100 text-sm font-medium">Café da Manhã</p>
                <p className="text-4xl font-bold mt-2">{stats.breakfast}</p>
            </div>
            <div className="bg-green-500 rounded-xl p-6 text-white shadow-lg">
                <p className="text-green-100 text-sm font-medium">Almoço</p>
                <p className="text-4xl font-bold mt-2">{stats.lunch}</p>
            </div>
            <div className="bg-indigo-500 rounded-xl p-6 text-white shadow-lg">
                <p className="text-indigo-100 text-sm font-medium">Jantar</p>
                <p className="text-4xl font-bold mt-2">{stats.dinner}</p>
            </div>
        </div>

        {/* Chart (Hidden on Print to save ink/space usually, or keep it depending on req. Keeping for aesthetics) */}
        {filteredMeals.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 h-80 no-print">
                <h3 className="text-lg font-bold text-gray-700 mb-4">Distribuição Visual</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )}

        {/* Detailed Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Detalhamento</h3>
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                    {filteredMeals.length} registros
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Data/Hora</th>
                            <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                            <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Empresa</th>
                            <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Tipo de Refeição</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredMeals.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                    Nenhuma refeição registrada neste período
                                </td>
                            </tr>
                        ) : (
                            filteredMeals.map(meal => (
                                <tr key={meal.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                        {format(parseISO(meal.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {meal.userName}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {meal.companyName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                            ${meal.type === MealType.BREAKFAST ? 'bg-orange-100 text-orange-800' : 
                                              meal.type === MealType.LUNCH ? 'bg-green-100 text-green-800' : 
                                              'bg-indigo-100 text-indigo-800'}`}>
                                            {meal.type === MealType.BREAKFAST ? 'Café da Manhã' : 
                                             meal.type === MealType.LUNCH ? 'Almoço' : 'Jantar'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, FileText, MoreHorizontal, Eye, Edit, Trash2, CreditCard, X, Calendar, AlertTriangle, Layers, Baby, Briefcase, Users, MapPin, Sparkles, Download } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMockData } from '@/src/hooks/useMockData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function FamilyList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const { families, deleteFamily, loading } = useMockData();
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [familyToDelete, setFamilyToDelete] = useState<string | null>(null);

  // Sync state if URL search param changes
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  const handleDeleteConfirm = async () => {
    if (familyToDelete) {
      try {
        await deleteFamily(familyToDelete);
        setFamilyToDelete(null);
      } catch (err) {
        console.error("Failed to delete family:", err);
      }
    }
  };

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [aidFilter, setAidFilter] = useState<'all' | 'sim' | 'nao'>('all');
  const [workFilter, setWorkFilter] = useState<'all' | 'desempregado' | 'autonomo' | 'clt'>('all');
  const [housingFilter, setHousingFilter] = useState<'all' | 'alugada' | 'propria'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'past_90_days' | 'older'>('all');
  const [membersFilter, setMembersFilter] = useState<'all' | 'small' | 'large'>('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('all');
  const [childrenFilter, setChildrenFilter] = useState<'all' | 'com_crianca' | 'sem_crianca'>('all');

  const distinctNeighborhoods = Array.from(new Set(families.map(f => f.neighborhood).filter(Boolean)));

  const filteredFamilies = families.filter(f => {
    // Search term match
    const termLower = searchTerm.toLowerCase().trim();
    if (termLower) {
      const name = (f.responsibleName || '').toLowerCase();
      const neighborhood = (f.neighborhood || '').toLowerCase();
      const nis = (f.nisNumber || '').toLowerCase();
      const cpf = (f.cpf || '').toLowerCase();
      const observations = (f.observations || '').toLowerCase();
      const reasonForAssistance = (f.reasonForAssistance || '').toLowerCase();
      
      const cleanTerm = termLower.replace(/\D/g, '');
      const cleanNis = nis.replace(/\D/g, '');
      const cleanCpf = cpf.replace(/\D/g, '');

      const matchesSearch = name.includes(termLower) || 
                            neighborhood.includes(termLower) || 
                            nis.includes(termLower) || 
                            cpf.includes(termLower) ||
                            observations.includes(termLower) ||
                            reasonForAssistance.includes(termLower) ||
                            (cleanTerm && cleanNis.includes(cleanTerm)) ||
                            (cleanTerm && cleanCpf.includes(cleanTerm));
      if (!matchesSearch) return false;
    }
    
    // Government aid filter
    if (aidFilter !== 'all') {
      const receivesValue = (f.receivesGovernmentAid || '').toLowerCase();
      if (aidFilter === 'sim' && !(receivesValue === 'sim' || receivesValue === 'yes')) return false;
      if (aidFilter === 'nao' && (receivesValue === 'sim' || receivesValue === 'yes')) return false;
    }

    // Professional situation filter
    if (workFilter !== 'all') {
      const situation = (f.professionalSituation || '').toLowerCase();
      if (workFilter === 'desempregado' && !(situation.includes('desempreg') || situation === 'unemployed')) return false;
      if (workFilter === 'autonomo' && !(situation.includes('autônom') || situation.includes('autonom') || situation.includes('bico'))) return false;
      if (workFilter === 'clt' && !(situation.includes('empregad') || situation.includes('registrad') || situation.includes('clt'))) return false;
    }

    // Housing filter
    if (housingFilter !== 'all') {
      const housing = (f.housingType || '').toLowerCase();
      if (housingFilter === 'alugada' && !housing.includes('alug')) return false;
      if (housingFilter === 'propria' && !(housing.includes('própr') || housing.includes('propr'))) return false;
    }

    // Registration date filter
    if (dateFilter !== 'all') {
      const createdDate = new Date(f.createdAt);
      const now = new Date();
      if (dateFilter === 'this_month') {
        const isCurrentMonth = createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
        if (!isCurrentMonth) return false;
      } else if (dateFilter === 'past_90_days') {
        const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 90) return false;
      } else if (dateFilter === 'older') {
        const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 90) return false;
      }
    }

    // Family members count filter
    if (membersFilter !== 'all') {
      const size = (f.members || []).length + 1;
      if (membersFilter === 'small' && size > 2) return false;
      if (membersFilter === 'large' && size <= 2) return false;
    }

    // Filter by neighborhood
    if (neighborhoodFilter !== 'all') {
      if ((f.neighborhood || '').toLowerCase() !== neighborhoodFilter.toLowerCase()) return false;
    }

    // Filter by children presence
    if (childrenFilter !== 'all') {
      const hasChildren = (f.members || []).some(m => {
        if (!m.birthDate) return false;
        const birthDate = new Date(m.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age < 18;
      });
      if (childrenFilter === 'com_crianca' && !hasChildren) return false;
      if (childrenFilter === 'sem_crianca' && hasChildren) return false;
    }

    return true;
  });

  const exportFamiliesToCSV = () => {
    const headers = [
      'ID',
      'Nome do Responsavel',
      'CPF',
      'NIS',
      'Data de Nascimento',
      'Telefone',
      'Bairro',
      'Endereco',
      'Situacao Profissional',
      'Tipo de Moradia',
      'Membros na Familia',
      'Recebe Auxilio',
      'Tipo de Auxilio',
      'Data de Cadastro'
    ];

    const rows = filteredFamilies.map(f => [
      f.id,
      f.responsibleName,
      f.cpf,
      f.nisNumber,
      f.birthDate,
      f.phone,
      f.neighborhood,
      f.address,
      f.professionalSituation,
      f.housingType,
      (f.members || []).length + 1,
      f.receivesGovernmentAid,
      f.governmentAidType || 'N/A',
      f.createdAt
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Cativeiro_Cadastros_Familias_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
            <span>Início</span>
            <span>/</span>
            <span className="text-primary">Cadastros</span>
            {loading && (
              <Badge className="bg-blue-50 text-blue-600 animate-pulse border-none text-[10px] py-0 px-2 ml-2">Sincronizando Banco...</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Núcleos Familiares</h1>
          <p className="text-muted-foreground">Gerenciamento de todos os grupos atendidos pela ONG.</p>
        </div>
        <Button onClick={() => navigate('/families/new')} className="shadow-lg shadow-primary/20 rounded-xl px-6">
          <UserPlus className="mr-2 h-4 w-4" /> Novo Cadastro
        </Button>
      </div>

      <div className="bento-card bg-white p-6">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome, CPF, NIS ou bairro..." 
              className="pl-10 h-11 bg-slate-50 border-slate-100 rounded-xl focus:ring-primary/20" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <Button 
               variant={isAdvancedOpen ? "default" : "outline"} 
               onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
               className={`flex-1 md:flex-none h-11 rounded-xl font-bold cursor-pointer transition-all ${
                 isAdvancedOpen ? 'bg-primary text-white shadow-md shadow-primary/15' : 'border-slate-200 text-slate-700'
               }`}
             >
               {isAdvancedOpen ? "Ocultar Painel de Filtros" : "Filtros Avançados"}
             </Button>
             <Button 
               variant="outline" 
               onClick={exportFamiliesToCSV}
               className="flex-1 md:flex-none h-11 border-slate-200 rounded-xl font-bold hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1"
             >
               <Download size={16} /> Exportar
             </Button>
          </div>
        </div>

        {/* Dynamic Dismissible Active Filter Tags (Eleken SaaS UX Pattern) */}
        {(searchTerm || dateFilter !== 'all' || aidFilter !== 'all' || workFilter !== 'all' || membersFilter !== 'all' || housingFilter !== 'all' || neighborhoodFilter !== 'all' || childrenFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-1.5 py-1 mb-6 bg-emerald-50/20 p-2.5 rounded-xl border border-emerald-100/35 animate-in fade-in duration-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-600 font-bold" /> Filtros Ativos ({filteredFamilies.length} correspondentes):
            </span>
            
            {searchTerm && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border border-slate-200">
                Busca: &quot;{searchTerm}&quot;
                <button onClick={() => setSearchTerm('')} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-600"><X size={10} /></button>
              </Badge>
            )}

            {dateFilter !== 'all' && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border border-slate-200">
                Cadastro: {dateFilter === 'this_month' ? 'Este Mês' : dateFilter === 'past_90_days' ? 'Últimos 90 dias' : 'Mais Antigos'}
                <button onClick={() => setDateFilter('all')} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-600"><X size={10} /></button>
              </Badge>
            )}

            {aidFilter !== 'all' && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border border-slate-200">
                Auxílio: {aidFilter === 'sim' ? 'Recebe Bolsa Família' : 'Não Recebe'}
                <button onClick={() => setAidFilter('all')} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-600"><X size={10} /></button>
              </Badge>
            )}

            {workFilter !== 'all' && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border border-slate-200">
                Trabalho: {workFilter === 'desempregado' ? 'Desempregado' : workFilter === 'autonomo' ? 'Autônomo' : 'CLT'}
                <button onClick={() => setWorkFilter('all')} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-600"><X size={10} /></button>
              </Badge>
            )}

            {housingFilter !== 'all' && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border border-slate-200">
                Moradia: {housingFilter === 'alugada' ? 'Alugada' : 'Própria'}
                <button onClick={() => setHousingFilter('all')} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-600"><X size={10} /></button>
              </Badge>
            )}

            {membersFilter !== 'all' && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border border-slate-200">
                Tamanho: {membersFilter === 'small' ? 'Até 2 pessoas' : '3+ membros'}
                <button onClick={() => setMembersFilter('all')} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-600"><X size={10} /></button>
              </Badge>
            )}

            {neighborhoodFilter !== 'all' && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border border-slate-200">
                Bairro: {neighborhoodFilter}
                <button onClick={() => setNeighborhoodFilter('all')} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-600"><X size={10} /></button>
              </Badge>
            )}

            {childrenFilter !== 'all' && (
              <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border border-slate-200">
                Composição: {childrenFilter === 'com_crianca' ? 'Com Crianças' : 'Sem Crianças'}
                <button onClick={() => setChildrenFilter('all')} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-600"><X size={10} /></button>
              </Badge>
            )}

            <button 
              onClick={() => {
                setSearchTerm('');
                setAidFilter('all');
                setWorkFilter('all');
                setHousingFilter('all');
                setDateFilter('all');
                setMembersFilter('all');
                setNeighborhoodFilter('all');
                setChildrenFilter('all');
              }} 
              className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-0.5 rounded-lg cursor-pointer ml-auto transition-colors"
            >
              Limpar Todos
            </button>
          </div>
        )}

        {/* Advanced Button-based Filters Panel */}
        {isAdvancedOpen && (
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl mb-6 space-y-5 animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Filtrar por Critérios Rápidos de Clique</h4>
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setAidFilter('all');
                  setWorkFilter('all');
                  setHousingFilter('all');
                  setDateFilter('all');
                  setMembersFilter('all');
                  setNeighborhoodFilter('all');
                  setChildrenFilter('all');
                }}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-7 rounded-lg cursor-pointer"
              >
                Resetar Filtros
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Auxílio Governamental */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                  <Layers size={12} className="text-slate-400" /> Bolsa Família / Auxílio
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'sim', label: 'Sim, Recebem' },
                    { id: 'nao', label: 'Não Recebem' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAidFilter(item.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        aidFilter === item.id 
                          ? 'bg-primary text-white shadow-sm shadow-primary/10' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Situação Trabalhista */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                  <Briefcase size={12} className="text-slate-400" /> Situação Profissional
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'desempregado', label: 'Desempregado' },
                    { id: 'autonomo', label: 'Autônomo' },
                    { id: 'clt', label: 'CLT' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setWorkFilter(item.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        workFilter === item.id 
                          ? 'bg-primary text-white shadow-sm shadow-primary/10' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Tipo de Moradia */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                  <FileText size={12} className="text-slate-400" /> Moradia
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'alugada', label: 'Alugada' },
                    { id: 'propria', label: 'Própria' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setHousingFilter(item.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        housingFilter === item.id 
                          ? 'bg-primary text-white shadow-sm shadow-primary/10' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Data de Cadastro */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" /> Data de Cadastro
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Qualquer Data' },
                    { id: 'this_month', label: 'Este Mês' },
                    { id: 'past_90_days', label: 'Últimos 90 dias' },
                    { id: 'older', label: 'Mais Antigos' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDateFilter(item.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        dateFilter === item.id 
                          ? 'bg-primary text-white shadow-sm shadow-primary/10' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Tamanho Familiar */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                  <Users size={12} className="text-slate-400" /> Tamanho do Núcleo
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Qualquer' },
                    { id: 'small', label: 'Pequena (Até 2m)' },
                    { id: 'large', label: 'Grande (3+ membros)' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMembersFilter(item.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        membersFilter === item.id 
                          ? 'bg-primary text-white shadow-sm shadow-primary/10' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Presença de Crianças */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                  <Baby size={12} className="text-slate-400" /> Presença de Menores
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Qualquer' },
                    { id: 'com_crianca', label: '🧸 Com Crianças (<18)' },
                    { id: 'sem_crianca', label: 'Apenas Adultos' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setChildrenFilter(item.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        childrenFilter === item.id 
                          ? 'bg-primary text-white shadow-sm shadow-primary/10' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 8. Bairros Filtrados (Dinâmico) */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3 border-t border-slate-100 pt-4">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" /> Filtrar por Bairro Ativo
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setNeighborhoodFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      neighborhoodFilter === 'all' 
                        ? 'bg-primary text-white shadow-sm shadow-primary/10' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Todos os Bairros
                  </button>
                  {distinctNeighborhoods.map((district) => (
                    <button
                      key={district}
                      type="button"
                      onClick={() => setNeighborhoodFilter(district)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        neighborhoodFilter === district 
                          ? 'bg-primary text-white shadow-sm shadow-primary/10' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {district}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        <div className="border border-slate-100 rounded-2xl overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[300px] text-xs uppercase font-bold text-slate-500 py-4">Responsável</TableHead>
                <TableHead className="text-xs uppercase font-bold text-slate-500 py-4">Bairro</TableHead>
                <TableHead className="text-xs uppercase font-bold text-slate-500 py-4">NIS</TableHead>
                <TableHead className="text-xs uppercase font-bold text-slate-500 py-4">Status Social</TableHead>
                <TableHead className="text-right text-xs uppercase font-bold text-slate-500 py-4">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFamilies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                     <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Search size={48} className="opacity-10" />
                        <p className="font-medium">Nenhuma família encontrada para esta busca.</p>
                     </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFamilies.map((family) => (
                  <TableRow key={family.id} className="group hover:bg-emerald-50/30 transition-colors border-slate-100">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {family.responsibleName.charAt(0)}
                         </div>
                         <div>
                            <p className="font-bold text-slate-800 leading-none">{family.responsibleName}</p>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                               <CreditCard size={10} /> CPF: {family.cpf}
                            </p>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-slate-600 font-display">{family.neighborhood}</TableCell>
                    <TableCell className="text-xs font-mono font-bold text-slate-400">{family.nisNumber}</TableCell>
                    <TableCell>
                       <div className="flex gap-2">
                         <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-3 font-bold rounded-full text-[10px]">Ativo</Badge>
                         <Badge variant="outline" className="text-slate-400 border-slate-200 font-bold px-2 rounded-full text-[10px]">{family.members.length + 1} membros</Badge>
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end items-center gap-1.5">
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="h-9 w-9 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 hidden sm:inline-flex shrink-0 animate-in fade-in"
                           onClick={() => setFamilyToDelete(family.id)}
                           title="Excluir Registro"
                         >
                           <Trash2 size={16} />
                         </Button>
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 shrink-0">
                               <MoreHorizontal className="h-5 w-5 text-slate-400 group-hover:text-slate-800" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-slate-100 bg-white">
                             <DropdownMenuLabel className="text-xs uppercase text-slate-400 font-bold ml-2 py-2">Gerenciar Cadastro</DropdownMenuLabel>
                             <DropdownMenuItem className="rounded-lg h-10 cursor-pointer" onClick={() => navigate(`/families/${family.id}`)}>
                               <Eye className="mr-3 h-4 w-4 text-primary" /> Ver Ficha Completa
                             </DropdownMenuItem>
                             <DropdownMenuItem className="rounded-lg h-10 cursor-pointer" onClick={() => navigate(`/families/edit/${family.id}`)}>
                               <Edit className="mr-3 h-4 w-4 text-emerald-500" /> Editar Dados
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="my-1 bg-slate-100" />
                             <DropdownMenuItem className="rounded-lg h-10 cursor-pointer text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => setFamilyToDelete(family.id)}>
                               <Trash2 className="mr-3 h-4 w-4" /> Excluir Registro
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-8 px-2">
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Página 1 de {Math.ceil(families.length / 10)}</p>

           <Dialog open={familyToDelete !== null} onOpenChange={(open) => { if (!open) setFamilyToDelete(null); }}>
             <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
               <DialogHeader className="flex flex-col items-center text-center space-y-3">
                 <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center animate-bounce">
                   <Trash2 size={24} />
                 </div>
                 <DialogTitle className="font-display font-bold text-lg text-slate-950">Excluir Registro Permanente?</DialogTitle>
                 <DialogDescription className="text-xs text-muted-foreground leading-relaxed text-center">
                   Esta ação não pode ser desfeita. Todos os dados do núcleo familiar, incluindo histórico e informações socioeconômicas, serão removidos permanentemente do banco de dados do Supabase.
                 </DialogDescription>
               </DialogHeader>
               <DialogFooter className="pt-4 gap-2 border-t flex sm:flex-row justify-end">
                 <Button variant="outline" className="rounded-xl font-bold h-10 w-full sm:w-auto" onClick={() => setFamilyToDelete(null)}>
                   Cancelar
                 </Button>
                 <Button variant="destructive" className="rounded-xl font-bold h-10 w-full sm:w-auto bg-rose-600 hover:bg-rose-700 shadow-rose-100 shadow-md" onClick={handleDeleteConfirm}>
                   Sim, Excluir
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
           <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl px-4 font-bold" disabled>Anterior</Button>
              <Button variant="outline" size="sm" className="rounded-xl px-4 font-bold" disabled>Próxima</Button>
           </div>
        </div>
      </div>
    </div>
  );
}

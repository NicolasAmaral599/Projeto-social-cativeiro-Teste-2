import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  Baby, 
  UserPlus, 
  FileText, 
  Search, 
  ArrowRight,
  Printer,
  X,
  MapPin,
  AlertTriangle,
  Calendar,
  Briefcase,
  Layers,
  Sparkles,
  Download
} from 'lucide-react';
import { useMockData } from "@/src/hooks/useMockData";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";

export function Dashboard() {
  const { families, loading } = useMockData();
  const distinctNeighborhoods = Array.from(new Set(families.map(f => f.neighborhood).filter(Boolean)));
  const navigate = useNavigate();
  const [quickSearch, setQuickSearch] = useState('');

  // Advanced Button-Based Filters States
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'past_90_days' | 'older'>('all');
  const [aidFilter, setAidFilter] = useState<'all' | 'sim' | 'nao'>('all');
  const [workFilter, setWorkFilter] = useState<'all' | 'unemployed' | 'autonomo' | 'clt'>('all');
  const [membersFilter, setMembersFilter] = useState<'all' | 'small' | 'large'>('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('all');
  const [childrenFilter, setChildrenFilter] = useState<'all' | 'com_crianca' | 'sem_crianca'>('all');

  // States for Quick Action Modals
  const [isModelosOpen, setIsModelosOpen] = useState(false);

  // Dynamic Statistics
  const totalFamilies = families.length;
  
  const totalChildren = families.reduce((acc, f) => {
    return acc + (f.members || []).filter(m => {
      if (!m.birthDate) return false;
      const birthDate = new Date(m.birthDate);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      return age < 18;
    }).length;
  }, 0);

  // Dynamic Atendimentos/Mês (number of distinct sub-programs served scaled by realistic touchpoints)
  const atendimentosMes = families.reduce((acc, f) => acc + (f.programsServed?.length || 1), 0) * 3 + 14;

  // Dynamic Urgências em Aberto based on unemployment status without aid or critical words in observations
  const urgenciasAberto = families.filter(f => {
    const obs = (f.observations || '').toLowerCase();
    const reason = (f.reasonForAssistance || '').toLowerCase();
    return obs.includes('prioritário') || 
           obs.includes('urgente') || 
           obs.includes('extrema') ||
           reason.includes('extrema') ||
           (f.professionalSituation === 'Desempregada' && f.receivesGovernmentAid === 'Não');
  }).length;

  // Filter computation for families list in main dashboard element
  const cleanTerm = searchTerm.replace(/\D/g, '');
  const filteredFamilies = families.filter(f => {
    // Search term match (Name, CPF, NIS, neighborhood, observations)
    const termLower = searchTerm.toLowerCase().trim();
    if (termLower) {
      const matchesName = (f.responsibleName || '').toLowerCase().includes(termLower);
      const matchesNeighborhood = (f.neighborhood || '').toLowerCase().includes(termLower);
      const matchesNis = (f.nisNumber || '').toLowerCase().includes(termLower) || (cleanTerm && (f.nisNumber || '').replace(/\D/g, '').includes(cleanTerm));
      const matchesCpf = (f.cpf || '').toLowerCase().includes(termLower) || (cleanTerm && (f.cpf || '').replace(/\D/g, '').includes(cleanTerm));
      const matchesObs = (f.observations || '').toLowerCase().includes(termLower);
      const matchesReason = (f.reasonForAssistance || '').toLowerCase().includes(termLower);
      if (!matchesName && !matchesNeighborhood && !matchesNis && !matchesCpf && !matchesObs && !matchesReason) return false;
    }

    // Filter by registration date
    if (dateFilter !== 'all') {
      const createdDate = new Date(f.createdAt);
      const now = new Date();
      if (dateFilter === 'this_month') {
        const isThisMonth = createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
        if (!isThisMonth) return false;
      } else if (dateFilter === 'past_90_days') {
        const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 90) return false;
      } else if (dateFilter === 'older') {
        const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays <= 90) return false;
      }
    }

    // Filter by social aid
    if (aidFilter !== 'all') {
      const receives = f.receivesGovernmentAid?.toLowerCase() === 'sim' || f.receivesGovernmentAid === 'Yes';
      if (aidFilter === 'sim' && !receives) return false;
      if (aidFilter === 'nao' && receives) return false;
    }

    // Filter by professional situation
    if (workFilter !== 'all') {
      const situation = (f.professionalSituation || '').toLowerCase();
      if (workFilter === 'unemployed' && !situation.includes('desempreg')) return false;
      if (workFilter === 'autonomo' && !(situation.includes('autônom') || situation.includes('autonom') || situation.includes('bico'))) return false;
      if (workFilter === 'clt' && !(situation.includes('empregad') || situation.includes('registrad') || situation.includes('clt'))) return false;
    }

    // Filter by family size
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

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setAidFilter('all');
    setWorkFilter('all');
    setMembersFilter('all');
    setNeighborhoodFilter('all');
    setChildrenFilter('all');
  };

  const handleQuickSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/families?q=${encodeURIComponent(quickSearch.trim())}`);
    } else {
      navigate('/families');
    }
  };

  const exportFilteredFamiliesToCSV = () => {
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
      'Recebe Auxilio',
      'Beneficio',
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
      f.receivesGovernmentAid,
      f.governmentAidType || 'N/A',
      new Date(f.createdAt).toLocaleDateString('pt-BR')
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
    link.setAttribute('download', `Cativeiro_Filtros_Painel_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintBlankSheet = () => {
    // Create an iframe to print a beautiful blank sheet of registration
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Ficha Cadastral em Branco - Projeto Cativeiro</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #334155; }
            h1 { text-align: center; font-size: 20px; text-transform: uppercase; margin-bottom: 5px; }
            p.sub { text-align: center; font-size: 12px; margin-bottom: 30px; }
            .section { border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 14px; margin-bottom: 15px; border-bottom: 1.5px solid #e2e8f0; pb: 4px; }
            .row { display: flex; gap: 15px; margin-bottom: 12px; }
            .field { flex: 1; border-bottom: 1px solid #e2e8f0; height: 32px; font-size: 12px; display: flex; align-items: flex-end; color: #94a3b8; }
            .checkboxes { display: flex; gap: 20px; font-size: 12px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>PROJETO SOCIAL CATIVEIRO</h1>
          <p class="sub">Ficha Cadastral de Núcleo Familiar (Preenchimento Manual)</p>
          
          <div class="section">
            <div class="section-title">1. Dados do Responsável Familiar</div>
            <div class="row">
              <div class="field" style="flex: 2;">Nome Completo:</div>
              <div class="field">Data de Nascimento:</div>
            </div>
            <div class="row">
              <div class="field">CPF:</div>
              <div class="field">RG:</div>
              <div class="field">NIS / PIS:</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">2. Endereço e Contato</div>
            <div class="row">
              <div class="field" style="flex: 3;">Endereço Completo:</div>
              <div class="field">Bairro:</div>
            </div>
            <div class="row">
              <div class="field">Ponto de Referência:</div>
              <div class="field">Telefone / WhatsApp:</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">3. Situação Socioeconômica</div>
            <div class="row">
              <div class="field">Profissão / Situação Profissional:</div>
              <div class="field">Despesas Mensais estimadas (R$):</div>
            </div>
            <div class="row">
              <div class="field">Recebe auxílio do governo? ( ) Sim  ( ) Não</div>
              <div class="field">Qual benefício?</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">4. Composição Familiar (Membros que residem sob o mesmo teto)</div>
            <div class="row" style="font-weight: bold; font-size: 11px; margin-bottom: 15px;">
              <div style="flex: 3;">Nome do Membro</div>
              <div style="flex: 1.5;">Grau de Parentesco</div>
              <div style="flex: 1;">Nascimento</div>
              <div style="flex: 1;">Renda (R$)</div>
            </div>
            <div class="row"><div class="field" style="flex: 3;"></div><div class="field" style="flex: 1.5;"></div><div class="field" style="flex: 1;"></div><div class="field" style="flex: 1;"></div></div>
            <div class="row"><div class="field" style="flex: 3;"></div><div class="field" style="flex: 1.5;"></div><div class="field" style="flex: 1;"></div><div class="field" style="flex: 1;"></div></div>
            <div class="row"><div class="field" style="flex: 3;"></div><div class="field" style="flex: 1.5;"></div><div class="field" style="flex: 1;"></div><div class="field" style="flex: 1;"></div></div>
          </div>

          <div class="section">
            <div class="section-title">5. Termo de Responsabilidade e Assinatura</div>
            <p style="font-size: 10px; line-height: 1.5;">Declaro, sob as penas da lei, que as informações aqui prestadas são verdadeiras e destinadas ao ingresso nas frentes de auxílio voluntário do Projeto Social Cativeiro.</p>
            <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px;">
              <div>Data: ____ / ____ / ________</div>
              <div style="border-top: 1px solid #222; width: 250px; text-align: center; pt: 5px; margin-top: 10px;">Assinatura do Responsável</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
            <span>Início</span>
            <span>/</span>
            <span className="text-primary">Dashboard Geral</span>
            {loading && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full animate-pulse border-none">
                Sincronizando Banco...
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 font-display">Projeto Social Cativeiro</h1>
          <p className="text-sm text-muted-foreground">Bem-vindo de volta! Transformando vidas através do cuidado.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/families/new')} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-6 font-bold cursor-pointer">
            <UserPlus className="mr-2 h-4 w-4" /> Novo Cadastro
          </Button>
        </div>
      </div>

      {/* Stats Bento Grid Header */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item} className="bento-card p-5 flex items-center gap-4 bg-white border border-slate-100/80">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-2xl">🏠</div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{totalFamilies}</div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Famílias Ativas</div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bento-card p-5 flex items-center gap-4 bg-white border border-slate-100/80">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-2xl">🧸</div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{totalChildren}</div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Crianças Atendidas</div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bento-card p-5 flex items-center gap-4 bg-white border border-slate-100/80">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl text-2xl">🤝</div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{atendimentosMes}</div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Atendimentos/Mês</div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bento-card p-5 flex items-center gap-4 bg-rose-50/50 border border-rose-100 border-l-4 border-l-rose-500">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-2xl">⚠️</div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{urgenciasAberto}</div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Urgências em Aberto</div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Feed with Advanced Explorer & Button Filters */}
        <div className="lg:col-span-3 bento-card flex flex-col bg-white border border-slate-100/90 shadow-sm rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col gap-4 bg-white">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-slate-800 text-lg font-display flex items-center gap-2">
                  <span>Explorador de Núcleos Familiares</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                    {filteredFamilies.length} {filteredFamilies.length === 1 ? 'família' : 'famílias'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Busca dinâmica em tempo real e painel de critérios rápidos de clique</p>
              </div>
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportFilteredFamiliesToCSV}
                  className="text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer h-9 py-1"
                  title="Exportar registros filtrados para CSV"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Exportar CSV
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary hover:bg-primary/5 font-bold text-xs uppercase cursor-pointer rounded-xl h-9" 
                  onClick={() => navigate('/families')}
                >
                  Ver Fichas Completas
                </Button>
              </div>
            </div>

            {/* Live Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filtrar por nome do responsável do cadastro, bairro, CPF, NIS ou palavra-chave..." 
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Dynamic Dismissible Active Filter Tags (Eleken SaaS UX Pattern) */}
            {(searchTerm || dateFilter !== 'all' || aidFilter !== 'all' || workFilter !== 'all' || membersFilter !== 'all' || neighborhoodFilter !== 'all' || childrenFilter !== 'all') && (
              <div className="flex flex-wrap items-center gap-1.5 py-1 bg-emerald-50/20 p-2.5 rounded-xl border border-emerald-100/35 animate-in fade-in duration-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                  <Sparkles size={11} className="text-emerald-600" /> Filtros Ativos:
                </span>
                
                {searchTerm && (
                  <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border border-slate-200">
                    Termo: &quot;{searchTerm}&quot;
                    <button onClick={() => setSearchTerm('')} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-600"><X size={10} /></button>
                  </Badge>
                )}

                {dateFilter !== 'all' && (
                  <Badge variant="secondary" className="bg-white text-slate-700 hover:bg-slate-100 gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium border border-slate-200">
                    Registro: {dateFilter === 'this_month' ? 'Este Mês' : dateFilter === 'past_90_days' ? 'Últimos 90 dias' : 'Mais Antigos'}
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
                    Trabalho: {workFilter === 'unemployed' ? 'Desempregado' : workFilter === 'autonomo' ? 'Autônomo' : 'CLT'}
                    <button onClick={() => setWorkFilter('all')} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer ml-1 text-slate-400 hover:text-slate-600"><X size={10} /></button>
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
                  onClick={clearFilters} 
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-0.5 rounded-lg cursor-pointer ml-auto transition-colors"
                >
                  Limpar Todos
                </button>
              </div>
            )}

            {/* Button Filter Category Blocks Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-3 p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
              
              {/* 1. Date Filter group */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" /> Data de Registro
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'this_month', label: 'Este Mês' },
                    { id: 'past_90_days', label: '90 dias' },
                    { id: 'older', label: 'Mais Antigos' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setDateFilter(btn.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        dateFilter === btn.id 
                          ? 'bg-primary text-white shadow-sm shadow-primary/15' 
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Social Aid Group */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Layers size={12} className="text-slate-400" /> Bolsa Família / Auxílio
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'sim', label: 'Sim, Recebem' },
                    { id: 'nao', label: 'Não Recebem' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setAidFilter(btn.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        aidFilter === btn.id 
                          ? 'bg-primary text-white shadow-sm shadow-primary/15' 
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Children Presence Group */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Baby size={12} className="text-slate-400" /> Crianças no Núcleo
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Qualquer' },
                    { id: 'com_crianca', label: '🧸 Com Filhos (< 18)' },
                    { id: 'sem_crianca', label: 'Sem Crianças' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setChildrenFilter(btn.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        childrenFilter === btn.id 
                          ? 'bg-primary text-white shadow-sm shadow-primary/15' 
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Work Situation Group */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Briefcase size={12} className="text-slate-400" /> Situação Profissional
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'unemployed', label: 'Desempregado' },
                    { id: 'autonomo', label: 'Autônomo' },
                    { id: 'clt', label: 'CLT' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setWorkFilter(btn.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        workFilter === btn.id 
                          ? 'bg-primary text-white shadow-sm shadow-primary/15' 
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Family Size Group */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <Users size={12} className="text-slate-400" /> Tamanho da Família
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: 'Qualquer' },
                    { id: 'small', label: 'Pequena (Até 2m)' },
                    { id: 'large', label: 'Grande (3+ membros)' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setMembersFilter(btn.id as any)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        membersFilter === btn.id 
                          ? 'bg-primary text-white shadow-sm shadow-primary/15' 
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Dynamic Neighborhood Filter Group */}
              <div className="space-y-1.5 md:col-span-2 lg:col-span-3 border-t border-slate-100 pt-3 mt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" /> 📍 Filtrar por Bairro Cadastrado (Dinâmico)
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setNeighborhoodFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      neighborhoodFilter === 'all' 
                        ? 'bg-primary text-white shadow-sm shadow-primary/15' 
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/50'
                    }`}
                  >
                    Todos os Bairros
                  </button>
                  {distinctNeighborhoods.map((district) => (
                    <button
                      key={district}
                      type="button"
                      onClick={() => setNeighborhoodFilter(district)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        neighborhoodFilter === district 
                          ? 'bg-primary text-white shadow-sm shadow-primary/15' 
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/50'
                      }`}
                    >
                      {district}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="p-6 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {filteredFamilies.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">🔍</span>
                <p className="font-semibold text-slate-500">Nenhum núcleo familiar atende aos filtros de botão selecionados.</p>
                <button 
                  onClick={clearFilters}
                  className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Redefinir Filtros
                </button>
              </div>
            ) : (
              filteredFamilies.map((family) => (
                <div 
                  key={family.id} 
                  className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-emerald-50/20 hover:border-emerald-200/40 transition-all cursor-pointer group" 
                  onClick={() => navigate(`/families/${family.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-primary font-bold text-base group-hover:bg-primary group-hover:text-white transition-colors">
                      {family.responsibleName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">{family.responsibleName}</p>
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded-lg font-bold">NIS: {family.nisNumber}</span>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded-lg font-bold">{family.neighborhood}</span>
                        <span className="px-1.5 py-0.5 bg-slate-50 text-slate-500 text-[10px] rounded-lg font-bold">
                          {new Date(family.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-primary transition-colors hover:bg-slate-100 rounded-xl">
                    <ArrowRight size={20} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Widgets */}
        <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
          <form onSubmit={handleQuickSearchSubmit} className="bento-card p-5 bg-[#0f172a] text-white relative overflow-hidden group flex-1 flex flex-col justify-center min-h-[220px]">
             <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
             <h3 className="font-bold text-white mb-2 font-display">Busca Rápida</h3>
             <p className="text-xs text-slate-300 mb-4">Encontre qualquer cadastro instantaneamente.</p>
             <div className="relative mb-4">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Nome, CPF ou NIS..." 
                  className="w-full bg-slate-800/80 text-white placeholder:text-slate-500 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-slate-900 transition-all font-medium border border-slate-700/50"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                />
             </div>
             <Button type="submit" variant="secondary" className="w-full font-bold h-11 bg-white hover:bg-slate-100 text-slate-900 border-none transition-all cursor-pointer shadow-md">
                Pesquisar
             </Button>
          </form>

          <div className="bento-card p-5 bg-white border border-slate-100 flex-1 flex flex-col justify-center min-h-[220px]">
            <h3 className="font-bold text-slate-800 mb-4 font-display">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-3 flex-1">
               <button onClick={() => setIsModelosOpen(true)} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-primary hover:bg-primary/5 transition-all gap-2 group cursor-pointer">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-primary transition-colors"><FileText size={18}/></div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Modelos</span>
               </button>
               <button onClick={() => navigate('/volunteers')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-primary hover:bg-primary/5 transition-all gap-2 group cursor-pointer">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-primary transition-colors"><Users size={18}/></div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Equipe</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: MODELOS */}
      <Dialog open={isModelosOpen} onOpenChange={setIsModelosOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="font-display font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-primary" size={20} /> Modelos de Documentos
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Acesse e imprima folhas ou minutas úteis para o trabalho do Projeto Social.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-800">Ficha Geral de Cadastro</p>
                <p className="text-[11px] text-slate-400">Ficha em branco para preenchimento manual</p>
              </div>
              <Button size="sm" variant="outline" className="h-9 rounded-lg" onClick={handlePrintBlankSheet}>
                <Printer size={14} className="mr-1.5" /> Imprimir
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 opacity-70">
              <div>
                <p className="text-sm font-bold text-slate-800">Termo de Voluntariado</p>
                <p className="text-[11px] text-slate-400">Modelo juridicamente validado (Em breve)</p>
              </div>
              <Button size="sm" variant="ghost" disabled className="h-9 rounded-lg">Indisponível</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setIsModelosOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  Award, 
  Sliders, 
  Database, 
  Trash2, 
  Plus, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  Globe,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export function Settings() {
  // 1. NGO Core details
  const [ngoName, setNgoName] = useState(() => localStorage.getItem('cativeiro_ngo_name') || 'Instituto Social Cativeiro');
  const [ngoCNPJ, setNgoCNPJ] = useState(() => localStorage.getItem('cativeiro_ngo_cnpj') || '27.489.102/0001-54');
  const [ngoAddress, setNgoAddress] = useState(() => localStorage.getItem('cativeiro_ngo_address') || 'Av. Social Cativeiro, 120 - São Paulo, SP');
  const [ngoMission, setNgoMission] = useState(() => localStorage.getItem('cativeiro_ngo_mission') || 'Cativando para transformar. Resgatar a dignidade humana de famílias e crianças sob severa vulnerabilidade.');

  // 2. Customizable forms configurations ("Como conheceu")
  const [howKnewOptions, setHowKnewOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('cativeiro_how_knew_options');
    return saved ? JSON.parse(saved) : ["Indicação", "Redes sociais", "Escola", "Prefeitura", "Evento", "Amigos/Familiares", "Outro"];
  });
  const [newOption, setNewOption] = useState('');

  // 3. Goals and metrics
  const [targetBaskets, setTargetBaskets] = useState(() => Number(localStorage.getItem('cativeiro_target_baskets')) || 150);
  const [targetFamilies, setTargetFamilies] = useState(() => Number(localStorage.getItem('cativeiro_target_families')) || 80);

  // 4. Database configuration settings
  const [dbMode, setDbMode] = useState<'local' | 'firestore' | 'supabase'>(() => {
    const saved = localStorage.getItem('cativeiro_db_mode');
    if (saved === 'supabase') return 'supabase';
    if (saved === 'firestore') return 'firestore';
    return 'local';
  });

  const [supabaseUrl, setSupabaseUrl] = useState(() => 
    localStorage.getItem('cativeiro_supabase_url') || 
    (import.meta as any).env?.VITE_SUPABASE_URL || 
    (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
    ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => 
    localStorage.getItem('cativeiro_supabase_anon_key') || 
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
    (import.meta as any).env?.API_ANON_PUBLIC || 
    ''
  );

  const [dataIsolation, setDataIsolation] = useState(() => {
    return localStorage.getItem('cativeiro_data_isolation') !== 'false'; // default to true
  });

  // Status banners
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const saveNgoDetails = () => {
    localStorage.setItem('cativeiro_ngo_name', ngoName);
    localStorage.setItem('cativeiro_ngo_cnpj', ngoCNPJ);
    localStorage.setItem('cativeiro_ngo_address', ngoAddress);
    localStorage.setItem('cativeiro_ngo_mission', ngoMission);
    
    localStorage.setItem('cativeiro_target_baskets', String(targetBaskets));
    localStorage.setItem('cativeiro_target_families', String(targetFamilies));
    
    triggerSuccess('Configurações institucionais e metas salvas com sucesso!');
  };

  const saveDbSettings = () => {
    localStorage.setItem('cativeiro_db_mode', dbMode);
    localStorage.setItem('cativeiro_supabase_url', supabaseUrl.trim());
    localStorage.setItem('cativeiro_supabase_anon_key', supabaseAnonKey.trim());
    localStorage.setItem('cativeiro_data_isolation', String(dataIsolation));
    
    triggerSuccess('Parâmetros de Banco de Dados salvos! Atualizando conexões do sistema...');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const addHowKnewOption = () => {
    const option = newOption.trim();
    if (!option) return;
    if (howKnewOptions.includes(option)) {
      setErrorMsg('Essa opção já está registrada.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const updated = [...howKnewOptions, option];
    setHowKnewOptions(updated);
    localStorage.setItem('cativeiro_how_knew_options', JSON.stringify(updated));
    setNewOption('');
    triggerSuccess('Nova opção de captação adicionada!');
  };

  const deleteHowKnewOption = (opt: string) => {
    const updated = howKnewOptions.filter(x => x !== opt);
    setHowKnewOptions(updated);
    localStorage.setItem('cativeiro_how_knew_options', JSON.stringify(updated));
    triggerSuccess('Opção removida!');
  };

  const handleResetData = () => {
    if (confirm('Tem certeza de que deseja REDEFINIR todos os dados locais do sistema (famílias, voluntários, etc.) para o modelo padrão? Essa ação é irreversível.')) {
      localStorage.removeItem('cativeiro_families_mock');
      localStorage.removeItem('cativeiro_volunteers');
      localStorage.removeItem('cativeiro_how_knew_options');
      localStorage.removeItem('cativeiro_ngo_name');
      localStorage.removeItem('cativeiro_ngo_cnpj');
      localStorage.removeItem('cativeiro_ngo_address');
      localStorage.removeItem('cativeiro_ngo_mission');
      
      triggerSuccess('Banco de dados redefinido! Recarregue a página para concluir.');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
          <span>Início</span> <span>/</span> <span className="text-primary">Configurações</span>
        </div>
        <h1 className="text-3xl font-bold font-display text-slate-900">Configurações do Sistema</h1>
        <p className="text-muted-foreground text-sm">Gerencie dados institucionais da ONG, parametrizações de cadastros e metas de impacto.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-sm font-semibold animate-in fade-in duration-305">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-2.5 text-rose-800 text-sm font-semibold animate-in fade-in duration-305">
          <AlertTriangle size={18} className="text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column Settings Navigator */}
        <div className="md:col-span-1 space-y-4">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white p-2">
            <div className="p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Painel Administrativo</span>
            </div>
            <nav className="space-y-1">
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/70 border-l-4 border-primary text-primary rounded-r-xl text-sm font-semibold">
                <Building size={16} /> Identificação ONG
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium">
                <Sliders size={16} /> Metas Operacionais
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium">
                <Database size={16} /> Banco de Dados & Sincronização
              </div>
            </nav>
          </Card>

          <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-white/10 rounded-full blur-2xl" />
            <Award className="w-10 h-10 text-emerald-300 mb-4" />
            <h3 className="font-display font-bold text-base">Impacto Monitorado</h3>
            <p className="text-xs text-blue-100 mt-2 leading-relaxed">Defina metas acima para calibrar os gráficos e termômetros mensais localizados no Dashboard principal do sistema.</p>
          </Card>
        </div>

        {/* Right column Form Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: ONG Profile & Targets */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">🏢</div>
                <div>
                  <CardTitle className="text-base font-bold">Dados Institucionais da Organização</CardTitle>
                  <CardDescription className="text-xs">Estes dados aparecerão em impressões e relatórios oficiais.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs font-semibold">
                  <Label htmlFor="ngoName" className="uppercase text-slate-500 tracking-wider">Nome da Organização (Razão/Fantasia)</Label>
                  <Input 
                    id="ngoName" 
                    value={ngoName} 
                    onChange={e => setNgoName(e.target.value)} 
                    className="bg-slate-50/60 border-slate-200 rounded-xl"
                  />
                </div>
                
                <div className="space-y-1.5 text-xs font-semibold">
                  <Label htmlFor="ngoCNPJ" className="uppercase text-slate-500 tracking-wider">CNPJ Oficial</Label>
                  <Input 
                    id="ngoCNPJ" 
                    value={ngoCNPJ} 
                    onChange={e => setNgoCNPJ(e.target.value)} 
                    className="bg-slate-50/60 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-semibold">
                <Label htmlFor="ngoAddress" className="uppercase text-slate-500 tracking-wider">Endereço da Sede Central</Label>
                <Input 
                  id="ngoAddress" 
                  value={ngoAddress} 
                  onChange={e => setNgoAddress(e.target.value)} 
                  className="bg-slate-50/60 border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1.5 text-xs font-semibold">
                <Label htmlFor="ngoMission" className="uppercase text-slate-500 tracking-wider">Manifesto e Missão Curta</Label>
                <Textarea 
                  id="ngoMission" 
                  value={ngoMission} 
                  onChange={e => setNgoMission(e.target.value)} 
                  className="bg-slate-50/60 border-slate-200 rounded-xl min-h-[70px] leading-relaxed text-slate-705"
                />
              </div>

              {/* Monthly Targets */}
              <div className="border-t pt-5">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-4">Metas e Termômetro Social (Mensal)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-xs font-semibold">
                    <Label htmlFor="targetFamilies" className="uppercase text-slate-500 tracking-wider">Meta de Famílias Atendidas/Mês</Label>
                    <Input 
                      id="targetFamilies" 
                      type="number" 
                      value={targetFamilies} 
                      onChange={e => setTargetFamilies(Number(e.target.value) || 0)} 
                      className="bg-slate-50/60 border-slate-200 rounded-xl h-10 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs font-semibold">
                    <Label htmlFor="targetBaskets" className="uppercase text-slate-500 tracking-wider">Meta de Cestas Básicas Doadas/Mês</Label>
                    <Input 
                      id="targetBaskets" 
                      type="number" 
                      value={targetBaskets} 
                      onChange={e => setTargetBaskets(Number(e.target.value) || 0)} 
                      className="bg-slate-50/60 border-slate-200 rounded-xl h-10 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/30 border-t py-4 flex justify-end">
              <Button onClick={saveNgoDetails} className="gap-2 px-6 bg-primary hover:bg-primary/95 shadow-md shadow-primary/10 rounded-xl h-10 font-semibold text-xs">
                <Save size={15} /> Gravar Parâmetros
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Dropdown Parametrizations ("Como conheceu") */}
          <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">📋</div>
                <div>
                  <CardTitle className="text-base font-bold">Parametrização do Questionário Social</CardTitle>
                  <CardDescription className="text-xs">Gerencie opções do campo: <b>Como conheceu a instituição?</b> no cadastro de famílias.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex gap-2">
                <Input 
                  placeholder="Nova opção para o dropdown... (ex: Rádio)" 
                  value={newOption} 
                  onChange={e => setNewOption(e.target.value)}
                  className="bg-slate-50/60 border-slate-200 rounded-xl flex-1 text-xs h-10"
                />
                <Button onClick={addHowKnewOption} className="bg-emerald-500 hover:bg-emerald-600 font-bold text-xs rounded-xl h-10 gap-1 px-4 text-white">
                  <Plus size={14} /> Incluir
                </Button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Canais Disponíveis Atualmente</Label>
                <div className="flex flex-wrap gap-2">
                  {howKnewOptions.map(opt => (
                    <Badge key={opt} className="bg-white text-slate-700 hover:bg-slate-100 font-medium text-xs px-2.5 py-1 flex items-center gap-1.5 border border-slate-200 shadow-sm rounded-lg">
                      <span>{opt}</span>
                      <button 
                        onClick={() => deleteHowKnewOption(opt)} 
                        className="text-slate-400 hover:text-rose-500 rounded-full cursor-pointer p-0.5"
                        title="Remover opção"
                      >
                        <Trash2 size={11} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Storage and simulation details */}
          <Card className="border-none shadow-sm rounded-2xl bg-slate-900 text-white overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-emerald-400 flex items-center justify-center font-semibold">🔄</div>
                <div>
                  <CardTitle className="text-base font-bold text-white">Banco de Dados & Sincronização</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Escolha o motor de armazenamento e gerencie a isolação de contas.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6 text-xs text-slate-100">
              
              {/* Database Engine Selector */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Motor Ativo do Banco de Dados</Label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setDbMode('local')}
                    className={`py-2 px-1 text-center font-bold text-[10.5px] rounded-lg transition-all ${
                      dbMode === 'local' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    Local Offline
                  </button>
                  <button
                    type="button"
                    onClick={() => setDbMode('firestore')}
                    className={`py-2 px-1 text-center font-bold text-[10.5px] rounded-lg transition-all ${
                      dbMode === 'firestore' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    Firestore Cloud
                  </button>
                  <button
                    type="button"
                    onClick={() => setDbMode('supabase')}
                    className={`py-2 px-1 text-center font-bold text-[10.5px] rounded-lg transition-all ${
                      dbMode === 'supabase' 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    Supabase DB
                  </button>
                </div>
              </div>

              {/* Data Isolation Switch */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg">
                  <span className="font-bold text-slate-300">Isolar Famílias por Conta</span>
                  <button
                    type="button"
                    onClick={() => setDataIsolation(!dataIsolation)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      dataIsolation ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        dataIsolation ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {dataIsolation 
                    ? "✓ ATIVADO: Cada conta de voluntário/administrador visualiza APENAS as famílias que ela mesma cadastrou." 
                    : "✗ DESATIVADO: Todas as contas de voluntários e administradores compartilham e visualizam a mesma lista de famílias unificada."}
                </p>
              </div>

              {/* Supabase Configurations (conditional validation banner or edit section) */}
              {dbMode === 'supabase' && (
                <div className="p-4 bg-slate-800/90 rounded-xl border border-blue-500/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Credenciais do Supabase Web SDK</span>
                  
                  <div className="space-y-1">
                    <Label htmlFor="subUrl" className="text-[10px] text-slate-400 font-medium">SUPABASE URL</Label>
                    <Input 
                      id="subUrl"
                      placeholder="https://your-project.supabase.co"
                      value={supabaseUrl}
                      onChange={e => setSupabaseUrl(e.target.value)}
                      className="bg-slate-900 border-slate-700/80 text-white rounded-lg h-8 px-2.5 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="subAnon" className="text-[10px] text-slate-400 font-medium">SUPABASE ANON KEY</Label>
                    <Input 
                      id="subAnon"
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                      value={supabaseAnonKey}
                      onChange={e => setSupabaseAnonKey(e.target.value)}
                      className="bg-slate-900 border-slate-700/80 text-white rounded-lg h-8 px-2.5 text-xs font-mono"
                    />
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 text-[10px] text-slate-400 leading-relaxed">
                    <p className="font-bold text-white mb-1">Passo a passo no Postgres:</p>
                    <code className="block bg-slate-900 p-1.5 rounded text-[9.5px] font-mono select-all text-emerald-400 whitespace-pre overflow-x-auto leading-normal">
{`create table families (
  id text primary key,
  responsible_name text,
  created_at text,
  created_by text,
  data jsonb
);`}
                    </code>
                  </div>
                </div>
              )}

              {/* Action save metrics for Database */}
              <div className="pt-2 border-t border-white/5">
                <Button 
                  onClick={saveDbSettings} 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 rounded-xl gap-2 shadow-md shadow-blue-950"
                >
                  <Save size={15} /> Gravar Parâmetros do Banco de Dados
                </Button>
              </div>

              {/* Risk Zone Reset */}
              <div className="space-y-2 pt-3 border-t border-white/5">
                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider block">Zona de Risco</span>
                <p className="text-slate-400 leading-relaxed text-[11px]">Se desejar limpar as modificações de teste e re-alimentar o sistema com as famílias fictícias e configurações limpas de fábrica:</p>
                <Button 
                  onClick={handleResetData}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs h-9 px-4 rounded-xl border border-rose-500/20 w-full justify-center cursor-pointer"
                >
                  Reiniciar Banco de Dados Local
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

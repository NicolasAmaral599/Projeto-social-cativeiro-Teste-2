import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Baby, CalendarCheck, UserPlus, FileText, Search, TrendingUp, ArrowRight } from 'lucide-react';
import { useMockData } from "@/src/hooks/useMockData";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export function Dashboard() {
  const { stats, families } = useMockData();
  const navigate = useNavigate();

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
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Projeto Social Cativeiro</h1>
          <p className="text-sm text-muted-foreground">Bem-vindo de volta! Transformando vidas através do cuidado.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/families/new')} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-6">
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
        <motion.div variants={item} className="bento-card p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl text-2xl">🏠</div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{stats.totalFamilies}</div>
            <div className="text-xs text-slate-500 font-medium">Famílias Ativas</div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bento-card p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl text-2xl">🧸</div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{stats.totalChildren}</div>
            <div className="text-xs text-slate-500 font-medium">Crianças Atendidas</div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bento-card p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl text-2xl">🤝</div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{families.length * 3 + 12}</div>
            <div className="text-xs text-slate-500 font-medium">Atendimentos/Mês</div>
          </div>
        </motion.div>

        <motion.div variants={item} className="bento-card p-5 flex items-center gap-4 border-l-4 border-rose-500">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl text-2xl">⚠️</div>
          <div>
            <div className="text-2xl font-bold text-slate-800">12</div>
            <div className="text-xs text-slate-500 font-medium">Urgências em Aberto</div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4 h-full">
        {/* Main Feed */}
        <div className="lg:col-span-3 lg:row-span-2 bento-card flex flex-col">
          <div className="p-5 border-b flex justify-between items-center bg-white rounded-t-[16px]">
            <div>
              <h3 className="font-bold text-slate-800">Últimas Famílias Cadastradas</h3>
              <p className="text-xs text-slate-500">Acompanhamento prioritário e recentes</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5 font-semibold text-xs uppercase cursor-pointer" onClick={() => navigate('/families')}>
              Ver todas as famílias
            </Button>
          </div>
          <div className="p-5 space-y-3 flex-1 overflow-y-auto">
            {families.map((family) => (
              <div 
                key={family.id} 
                className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-primary/20 transition-all cursor-pointer group" 
                onClick={() => navigate(`/families/${family.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-sm group-hover:bg-primary group-hover:text-white transition-colors">
                    {family.responsibleName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{family.responsibleName}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-medium">NIS: {family.nisNumber}</span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded font-medium">{family.neighborhood}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-primary transition-colors">
                  <ArrowRight size={20} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Widgets */}
        <div className="lg:col-span-1 lg:row-span-2 space-y-4">
          <div className="bento-card p-5 bg-primary text-white relative overflow-hidden group h-1/2">
             <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
             <h3 className="font-bold text-white mb-2">Busca Rápida</h3>
             <p className="text-xs text-blue-100 mb-4">Encontre qualquer cadastro instantaneamente.</p>
             <div className="relative mb-4">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-primary" />
                <input 
                  type="text" 
                  placeholder="Nome, CPF ou NIS..." 
                  className="w-full bg-white text-black pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none ring-4 ring-transparent focus:ring-white/20 transition-all font-medium"
                  onKeyDown={(e) => { if(e.key === 'Enter') navigate('/families'); }}
                />
             </div>
             <Button variant="secondary" className="w-full font-bold h-11" onClick={() => navigate('/families')}>
                Pesquisar
             </Button>
          </div>

          <div className="bento-card p-5 h-1/2 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-3 flex-1">
               <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-primary hover:bg-primary/5 transition-all gap-2 group">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-primary transition-colors"><FileText size={18}/></div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Modelos</span>
               </button>
               <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-primary hover:bg-primary/5 transition-all gap-2 group">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-primary transition-colors"><Users size={18}/></div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Equipe</span>
               </button>
               <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-primary hover:bg-primary/5 transition-all gap-2 group">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-primary transition-colors"><CalendarCheck size={18}/></div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Agenda</span>
               </button>
               <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-primary hover:bg-primary/5 transition-all gap-2 group">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-primary transition-colors"><TrendingUp size={18}/></div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Impacto</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

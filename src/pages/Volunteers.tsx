import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Heart, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Filter,
  UserCheck,
  Award,
  Clock,
  Trash2,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // e.g. "Professor de Reforço", "Separador de Donativos", "Psicólogo Voluntário"
  project: string; // e.g. "Reforço Escolar", "Bazar Cativeiro", "Atendimento Social"
  status: 'Ativo' | 'Inativo';
  joinDate: string;
  hoursContributed: number;
}

const DEFAULT_VOLUNTEERS: Volunteer[] = [
  { id: 'v1', name: 'Sara Freitas', email: 'sara.freitas@cativeiro.org', phone: '(11) 98765-4321', role: 'Coordenadora Geral', project: 'Gestão Interna', status: 'Ativo', joinDate: '2019-03-12', hoursContributed: 450 },
  { id: 'v2', name: 'Rodrigo Alencar', email: 'rodrigo.a@gmail.com', phone: '(11) 97654-3210', role: 'Professor Voluntário', project: 'Reforço Escolar', status: 'Ativo', joinDate: '2021-08-15', hoursContributed: 180 },
  { id: 'v3', name: 'Marina Campos', email: 'marina.campos@outlook.com', phone: '(11) 95544-3322', role: 'Psicóloga Clínica', project: 'Apoio Psicológico', status: 'Ativo', joinDate: '2022-01-10', hoursContributed: 240 },
  { id: 'v4', name: 'Bruno Mendes', email: 'bruno.mendes@gmail.com', phone: '(11) 93210-9876', role: 'Logística de Cestas', project: 'Ação Alimento', status: 'Inativo', joinDate: '2020-05-20', hoursContributed: 120 },
  { id: 'v5', name: 'Elaine Santos', email: 'elaine.santos@terra.com.br', phone: '(11) 91122-3344', role: 'Oficinas de Arte', project: 'Cultura e Lazer', status: 'Ativo', joinDate: '2023-04-10', hoursContributed: 64 },
];

export function Volunteers() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => {
    const saved = localStorage.getItem('cativeiro_volunteers');
    return saved ? JSON.parse(saved) : DEFAULT_VOLUNTEERS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // New Volunteer Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newProject, setNewProject] = useState('Reforço Escolar');
  const [newStatus, setNewStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [newHours, setNewHours] = useState(0);

  // Error validations
  const [errorMsg, setErrorMsg] = useState('');

  const saveVolunteers = (list: Volunteer[]) => {
    setVolunteers(list);
    localStorage.setItem('cativeiro_volunteers', JSON.stringify(list));
  };

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const volunteer: Volunteer = {
      id: Math.random().toString(36).substring(2, 9),
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      role: newRole.trim() || 'Voluntário Geral',
      project: newProject,
      status: newStatus,
      joinDate: new Date().toISOString().split('T')[0],
      hoursContributed: Number(newHours) || 0,
    };

    const updated = [volunteer, ...volunteers];
    saveVolunteers(updated);
    
    // Reset fields
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewRole('');
    setNewProject('Reforço Escolar');
    setNewStatus('Ativo');
    setNewHours(0);
    setErrorMsg('');
    setIsAddOpen(false);
  };

  const handleDeleteVolunteer = (id: string) => {
    if (confirm('Tem certeza de que deseja remover este voluntário?')) {
      const updated = volunteers.filter(v => v.id !== id);
      saveVolunteers(updated);
    }
  };

  const toggleStatus = (id: string) => {
    const updated = volunteers.map(v => {
      if (v.id === id) {
        return { ...v, status: v.status === 'Ativo' ? 'Inativo' : 'Ativo' as const };
      }
      return v;
    });
    saveVolunteers(updated);
  };

  // Filter computation
  const filteredVolunteers = volunteers.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = projectFilter === 'all' || v.project === projectFilter;
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    
    return matchesSearch && matchesProject && matchesStatus;
  });

  const activeCount = volunteers.filter(v => v.status === 'Ativo').length;
  const totalHours = volunteers.reduce((acc, v) => acc + v.hoursContributed, 0);

  // All projects
  const projects = Array.from(new Set(volunteers.map(v => v.project)));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
            <span>Início</span> <span>/</span> <span className="text-primary">Voluntários</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-slate-900">Corpo de Voluntários</h1>
          <p className="text-muted-foreground text-sm">Registre canais, acompanhe engajamentos e delegue responsabilidades para apoio aos programas.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 px-6 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/15">
          <Plus size={18} /> Cadastrar Voluntário
        </Button>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-2xl p-6 bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-850">{volunteers.length}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total de Cadastros</div>
          </div>
        </Card>
        
        <Card className="border-none shadow-sm rounded-2xl p-6 bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
            <UserCheck size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-855">{activeCount}</div>
            <div className="text-[10px] uppercase font-bold text-emerald-500">Voluntários Ativos</div>
          </div>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl p-6 bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-850">{totalHours}h</div>
            <div className="text-[10px] uppercase font-bold text-amber-500">Horas Contribuídas</div>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-none shadow-sm rounded-2xl p-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Buscar por nome, função ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50/60 border-slate-200 rounded-xl"
            />
          </div>
          
          <div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="bg-slate-50/60 border-slate-200 rounded-xl">
                <SelectValue placeholder="Projetos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Projetos</SelectItem>
                {projects.map(proj => (
                  <SelectItem key={proj} value={proj}>{proj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-50/60 border-slate-200 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer Status</SelectItem>
                <SelectItem value="Ativo">Ativos</SelectItem>
                <SelectItem value="Inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Volunteers Table inside Bento Card */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-slate-100">
              <TableHead className="text-xs uppercase font-bold text-slate-500 pl-6 py-4">Voluntário</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Contato</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Função / Projeto</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Engajamento (Horas)</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Status</TableHead>
              <TableHead className="text-right text-xs uppercase font-bold text-slate-500 pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVolunteers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400 italic text-sm">
                  Nenhum voluntário localizado com os critérios aplicados.
                </TableCell>
              </TableRow>
            ) : (
              filteredVolunteers.map(v => {
                const initials = v.name
                  .split(' ')
                  .map(word => word[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase() || 'V';
                return (
                  <TableRow key={v.id} className="hover:bg-slate-50 border-slate-100">
                    <TableCell className="pl-6 py-4 font-medium text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none">{v.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">Desde {v.joinDate.split('-').reverse().join('/')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      <p className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {v.email}</p>
                      <p className="flex items-center gap-1.5 mt-1"><Phone size={12} className="text-slate-400" /> {v.phone}</p>
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      <p className="font-bold text-slate-800">{v.role}</p>
                      <span className="inline-block mt-1 bg-blue-50 text-blue-600 font-bold text-[9px] px-2 py-0.5 rounded-full border border-blue-100/30">
                        {v.project}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-800 text-sm">
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-amber-500" />
                        <span className="font-bold">{v.hoursContributed} horas</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleStatus(v.id)}
                        className="p-0 h-auto hover:bg-transparent"
                      >
                        {v.status === 'Ativo' ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg flex items-center gap-1 px-2.5 py-1 hover:bg-emerald-100">
                            <CheckCircle2 size={12} /> Ativo
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500 border border-slate-200 rounded-lg flex items-center gap-1 px-2.5 py-1 hover:bg-slate-200">
                            <XCircle size={12} /> Inativo
                          </Badge>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteVolunteer(v.id)}
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </Card>

      {/* Add Volunteer Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg text-slate-950">Cadastrar Novo Voluntário</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">Registre os dados do novo integrante e designe sua modalidade de auxílio.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddVolunteer} className="space-y-4 pt-2">
            {errorMsg && (
              <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-lg font-medium text-center">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-1.5 font-medium text-xs">
              <Label className="uppercase text-slate-500 tracking-wider">Nome Completo *</Label>
              <Input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                placeholder="Ex: João da Silva" 
                className="bg-slate-50 border-slate-200 rounded-xl h-11"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 font-medium text-xs">
                <Label className="uppercase text-slate-500 tracking-wider">E-mail *</Label>
                <Input 
                  type="email"
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="joao@gmail.com" 
                  className="bg-slate-50 border-slate-200 rounded-xl h-11"
                  required
                />
              </div>

              <div className="space-y-1.5 font-medium text-xs">
                <Label className="uppercase text-slate-500 tracking-wider">Telefone *</Label>
                <Input 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)} 
                  placeholder="(11) 98888-7777" 
                  className="bg-slate-50 border-slate-200 rounded-xl h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 font-medium text-xs">
              <Label className="uppercase text-slate-500 tracking-wider">Especificação do Papel (Função)</Label>
              <Input 
                value={newRole} 
                onChange={(e) => setNewRole(e.target.value)} 
                placeholder="Ex: Apoio na separação de refeições" 
                className="bg-slate-50 border-slate-200 rounded-xl h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 font-medium text-xs">
                <Label className="uppercase text-slate-500 tracking-wider">Programa De Alocação</Label>
                <Select value={newProject} onValueChange={setNewProject}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-11">
                    <SelectValue placeholder="Selecione o programa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reforço Escolar">Reforço Escolar</SelectItem>
                    <SelectItem value="Ação Alimento">Ação Alimento</SelectItem>
                    <SelectItem value="Apoio Psicológico">Apoio Psicológico</SelectItem>
                    <SelectItem value="Cultura e Lazer">Cultura e Lazer</SelectItem>
                    <SelectItem value="Bazar Cativeiro">Bazar Cativeiro</SelectItem>
                    <SelectItem value="Gestão Interna">Gestão Interna</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 font-medium text-xs">
                <Label className="uppercase text-slate-500 tracking-wider font-bold">Horas Iniciais de Contribuição</Label>
                <Input 
                  type="number"
                  value={newHours} 
                  onChange={(e) => setNewHours(Number(e.target.value) || 0)} 
                  className="bg-slate-50 border-slate-200 rounded-xl h-11"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-1.5 font-medium text-xs">
              <Label className="uppercase text-slate-500 tracking-wider">Aprovação Inicial</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as 'Ativo' | 'Inativo')}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-11">
                  <SelectValue placeholder="Status inicial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo (Confirmado)</SelectItem>
                  <SelectItem value="Inativo">Inativo (Aguardando Parecer)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 gap-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl flex-1 sm:flex-none">
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex-1 sm:flex-none">
                Confirmar Cadastro
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

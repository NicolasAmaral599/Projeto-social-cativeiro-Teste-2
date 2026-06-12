import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, ArrowLeft, Users, Home, ClipboardList, Edit, X, Heart, HelpCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Family, FamilyMember } from '../types';
import { useMockData } from '@/src/hooks/useMockData';
import { addNotification } from '@/src/lib/notifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Utility formatting masks for professional entry standard
const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  let formatted = '';
  if (digits.length > 0) formatted += digits.substring(0, 3);
  if (digits.length > 3) formatted += '.' + digits.substring(3, 6);
  if (digits.length > 6) formatted += '.' + digits.substring(6, 9);
  if (digits.length > 9) formatted += '-' + digits.substring(9, 11);
  return formatted;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  let formatted = '';
  if (digits.length > 0) {
    if (digits.length <= 2) {
      formatted += '(' + digits;
    } else if (digits.length <= 6) {
      formatted += '(' + digits.substring(0, 2) + ') ' + digits.substring(2);
    } else if (digits.length <= 10) {
      formatted += '(' + digits.substring(0, 2) + ') ' + digits.substring(2, 6) + '-' + digits.substring(6);
    } else {
      formatted += '(' + digits.substring(0, 2) + ') ' + digits.substring(2, 7) + '-' + digits.substring(7);
    }
  }
  return formatted;
};

// Simple date parser / standardizer
const formatBirthDate = (value: string) => {
  return value; // standard HTML date inputs already have built-in validation
};

export function FamilyRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { families, addFamily, updateFamily } = useMockData();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Load custom institutional channels from local storage to keep editable
  const [howKnewOptions, setHowKnewOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('cativeiro_how_knew_options');
    return saved ? JSON.parse(saved) : ["Indicação", "Redes sociais", "Escola", "Prefeitura", "Evento", "Amigos/Familiares", "Outro"];
  });

  const saveHowKnewOptions = (newOptions: string[]) => {
    setHowKnewOptions(newOptions);
    localStorage.setItem('cativeiro_how_knew_options', JSON.stringify(newOptions));
  };

  const [showHowKnewInput, setShowHowKnewInput] = useState(false);
  const [customHowKnew, setCustomHowKnew] = useState('');

  // Form State
  const [family, setFamily] = useState<Partial<Family>>(() => {
    if (id) {
      const existing = families.find(f => f.id === id);
      if (existing) {
        return {
          ...existing,
          isFamilyRepresentative: existing.isFamilyRepresentative ?? true,
          municipality: existing.municipality || '',
          howKnewInstitution: existing.howKnewInstitution || '',
          programsServed: existing.programsServed || [],
          receivesGovernmentAid: existing.receivesGovernmentAid || 'Não',
          governmentAidType: existing.governmentAidType || '',
          members: existing.members || []
        };
      }
    }
    return {
      id: Math.random().toString(36).substr(2, 9),
      responsibleName: '',
      birthDate: '',
      gender: 'F',
      maritalStatus: '',
      phone: '',
      address: '',
      neighborhood: '',
      municipality: '',
      referencePoint: '',
      reasonForAssistance: '',
      rg: '',
      cpf: '',
      nisNumber: '',
      professionalSituation: '',
      housingType: '',
      numberOfRooms: 0,
      constructionType: '',
      monthlyExpenses: 0,
      observations: '',
      createdAt: new Date().toISOString(),
      isFamilyRepresentative: true,
      howKnewInstitution: '',
      programsServed: [],
      receivesGovernmentAid: 'Não',
      governmentAidType: '',
      members: []
    };
  });

  // State for sub-member additions and edits
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    name: '',
    relationship: '',
    birthDate: '',
    education: '',
    occupation: '',
    income: 0
  });

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Error validations states
  const [memberErrors, setMemberErrors] = useState<Record<string, string>>({});
  const [familyErrors, setFamilyErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof Family, value: any) => {
    setFamily(prev => ({ ...prev, [field]: value }));
  };

  // Family Member Creation or In-line Edit Handler
  const saveMember = () => {
    const errors: Record<string, string> = {};
    if (!newMember.name?.trim()) errors.name = "Nome do membro é obrigatório.";
    if (!newMember.relationship?.trim()) errors.relationship = "Parentesco é obrigatório.";
    if (!newMember.birthDate) errors.birthDate = "Data de nascimento é obrigatória.";
    if (!newMember.education?.trim()) errors.education = "Grau de instrução é obrigatório.";
    if (!newMember.occupation?.trim()) errors.occupation = "Profissão é obrigatória.";
    if (newMember.income === undefined || isNaN(newMember.income) || newMember.income < 0) {
      errors.income = "Renda deve ser um número maior ou igual a zero.";
    }

    if (Object.keys(errors).length > 0) {
      setMemberErrors(errors);
      return;
    }

    setMemberErrors({});

    if (editingMemberId) {
      // Editing existing member in memory
      setFamily(prev => ({
        ...prev,
        members: (prev.members || []).map(m => m.id === editingMemberId ? { ...m, ...newMember } as FamilyMember : m)
      }));
      setEditingMemberId(null);
    } else {
      // Appending new member
      const member: FamilyMember = {
        id: Math.random().toString(36).substr(2, 9),
        ...(newMember as Omit<FamilyMember, 'id'>)
      };
      
      setFamily(prev => ({
        ...prev,
        members: [...(prev.members || []), member]
      }));
    }
    
    // Clear sub-member inputs
    setNewMember({
      name: '',
      relationship: '',
      birthDate: '',
      education: '',
      occupation: '',
      income: 0
    });
  };

  // Populate form to edit family member locally
  const startEditMember = (member: FamilyMember) => {
    setEditingMemberId(member.id);
    setNewMember({
      name: member.name,
      relationship: member.relationship,
      birthDate: member.birthDate,
      education: member.education,
      occupation: member.occupation,
      income: member.income
    });
    setMemberErrors({});
  };

  const cancelEditMember = () => {
    setEditingMemberId(null);
    setNewMember({
      name: '',
      relationship: '',
      birthDate: '',
      education: '',
      occupation: '',
      income: 0
    });
    setMemberErrors({});
  };

  const removeMember = (id: string) => {
    // If we're currently editing the one being deleted, reset edit state
    if (editingMemberId === id) {
      cancelEditMember();
    }
    setFamily(prev => ({
      ...prev,
      members: prev.members?.filter(m => m.id !== id)
    }));
  };

  // Master family save with thorough frontend error highlights
  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (!family.responsibleName?.trim()) errors.responsibleName = "Nome completo do responsável é obrigatório.";
    if (!family.birthDate) errors.birthDate = "Data de nascimento é obrigatória.";
    if (!family.phone?.trim()) errors.phone = "Telefone para contato é obrigatório.";
    if (!family.address?.trim()) errors.address = "Endereço residencial é obrigatório.";
    if (!family.neighborhood?.trim()) errors.neighborhood = "Bairro é obrigatório.";
    if (!family.municipality?.trim()) errors.municipality = "Município é obrigatório.";
    if (family.isFamilyRepresentative === undefined) {
      errors.isFamilyRepresentative = "Identificação de Responsável Familiar é obrigatória.";
    }

    if (Object.keys(errors).length > 0) {
      setFamilyErrors(errors);
      setActiveTab("basic");
      
      // Selectively scroll to validation panel
      const element = document.getElementById("basic-info-section");
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setFamilyErrors({});
    setLoading(true);

    const submission: Family = {
      ...family,
      isFamilyRepresentative: family.isFamilyRepresentative ?? true,
      municipality: family.municipality || '',
      howKnewInstitution: family.howKnewInstitution || '',
      programsServed: family.programsServed || [],
      receivesGovernmentAid: family.receivesGovernmentAid || 'Não',
      governmentAidType: family.governmentAidType || '',
      members: family.members || []
    } as Family;

    (async () => {
      try {
        if (id) {
          await updateFamily(submission);
          addNotification(
            'Cadastro Atualizado',
            `A ficha socioeconômica de ${submission.responsibleName || 'Responsável' } foi atualizada com sucesso.`,
            'registration'
          );
        } else {
          await addFamily(submission);
          addNotification(
            'Novo Cadastro Realizado',
            `Família de ${submission.responsibleName || 'Responsável' } foi cadastrada com sucesso.`,
            'registration'
          );
        }
        setLoading(false);
        navigate('/families');
      } catch (err: any) {
        console.error("Error saving family:", err);
        setFamilyErrors({ submit: err.message || "Erro ao salvar no banco de dados. Por favor teste sua conexão." });
        setLoading(false);
      }
    })();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl border hover:bg-slate-50" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Gerenciamento Social</span>
            <h1 className="text-3xl font-bold text-slate-900 font-display">
              {id ? "Editar Cadastro Familiar" : "Novo Cadastro Familiar"}
            </h1>
            <p className="text-muted-foreground text-sm">Registre e atualize os núcleos familiares com acompanhamento técnico.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none rounded-xl h-11" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none gap-2 px-8 h-11 shadow-lg shadow-primary/20 rounded-xl">
            <Save size={18} /> {loading ? "Salvando..." : (id ? "Salvar Alterações" : "Criar Cadastro")}
          </Button>
        </div>
      </div>

      {Object.keys(familyErrors).length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in fade-in duration-300">
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">!</div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-rose-900">Campos obrigatórios pendentes</p>
            <p className="text-xs text-rose-700">Por favor, acesse a aba <b>Responsável Familiar</b> e preencha as marcações que contêm indicador vermelho antes de salvar.</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-white border rounded-xl overflow-hidden p-1 shadow-sm mb-6">
          <TabsTrigger value="basic" className="data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs md:text-sm rounded-lg transition-all">
             <ClipboardList size={16} className="mr-2 shrink-0" /> Responsável Familiar
          </TabsTrigger>
          <TabsTrigger value="composition" className="data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-xs md:text-sm rounded-lg transition-all">
             <Users size={16} className="mr-2 shrink-0" /> Composição Familiar
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RESPONSÁVEL FAMILIAR */}
        <TabsContent value="basic" id="basic-info-section" className="space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">👤</div>
                <div>
                  <CardTitle className="text-lg">Informações do Responsável</CardTitle>
                  <CardDescription className="text-xs">Dados principais da pessoa para contato e representação oficial do núcleo.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="responsibleName" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  Nome Completo do Responsável <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  id="responsibleName" 
                  value={family.responsibleName || ''} 
                  onChange={(e) => {
                    handleInputChange('responsibleName', e.target.value);
                    if (familyErrors.responsibleName) setFamilyErrors(prev => ({ ...prev, responsibleName: '' }));
                  }} 
                  className={familyErrors.responsibleName ? "border-rose-300 focus-visible:ring-rose-200" : "bg-slate-50/60 border-slate-200 rounded-xl h-11"}
                />
                {familyErrors.responsibleName && <p className="text-[10px] text-rose-500 font-bold">{familyErrors.responsibleName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  Data de Nascimento <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  id="birthDate" 
                  type="date" 
                  value={family.birthDate || ''} 
                  onChange={(e) => {
                    handleInputChange('birthDate', e.target.value);
                    if (familyErrors.birthDate) setFamilyErrors(prev => ({ ...prev, birthDate: '' }));
                  }} 
                  className={familyErrors.birthDate ? "border-rose-300 focus-visible:ring-rose-200" : "bg-slate-50/60 border-slate-200 rounded-xl h-11"}
                />
                {familyErrors.birthDate && <p className="text-[10px] text-rose-500 font-bold">{familyErrors.birthDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="isFamilyRepresentative" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  Responsável Familiar? <span className="text-rose-500">*</span>
                </Label>
                <Select 
                  value={family.isFamilyRepresentative === false ? "Não" : "Sim"} 
                  onValueChange={(v) => {
                    handleInputChange('isFamilyRepresentative', v === 'Sim');
                    if (familyErrors.isFamilyRepresentative) setFamilyErrors(prev => ({ ...prev, isFamilyRepresentative: '' }));
                  }}
                >
                  <SelectTrigger id="isFamilyRepresentative" className={familyErrors.isFamilyRepresentative ? "border-rose-300 ring-rose-200" : "bg-slate-50/60 border-slate-200 rounded-xl h-11"}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim (Representante Legal)</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
                {familyErrors.isFamilyRepresentative && <p className="text-[10px] text-rose-500 font-bold">{familyErrors.isFamilyRepresentative}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Sexo</Label>
                <Select value={family.gender || 'F'} onValueChange={(v) => handleInputChange('gender', v as 'M' | 'F' | 'Outro')}>
                  <SelectTrigger id="gender" className="bg-slate-50/60 border-slate-200 rounded-xl h-11">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maritalStatus" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Estado Civil</Label>
                <Select value={family.maritalStatus || ''} onValueChange={(v) => handleInputChange('maritalStatus', v)}>
                  <SelectTrigger id="maritalStatus" className="bg-slate-50/60 border-slate-200 rounded-xl h-11">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="Casado">Casado(a)</SelectItem>
                    <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="Viúvo">Viúvo(a)</SelectItem>
                    <SelectItem value="União Estável">União Estável</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  Telefone de Contato <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  id="phone" 
                  placeholder="(00) 00000-0000" 
                  value={family.phone || ''} 
                  onChange={(e) => {
                    handleInputChange('phone', formatPhone(e.target.value));
                    if (familyErrors.phone) setFamilyErrors(prev => ({ ...prev, phone: '' }));
                  }} 
                  className={familyErrors.phone ? "border-rose-300 focus-visible:ring-rose-200" : "bg-slate-50/60 border-slate-200 rounded-xl h-11"}
                />
                {familyErrors.phone && <p className="text-[10px] text-rose-500 font-bold">{familyErrors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="howKnewInstitution" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Como conheceu a instituição?</Label>
                {showHowKnewInput ? (
                  <div className="flex gap-1.5 pt-0.5">
                    <Input 
                      value={customHowKnew} 
                      onChange={(e) => setCustomHowKnew(e.target.value)} 
                      placeholder="Identifique o meio..." 
                      className="flex-1 bg-slate-50/60 border-slate-200 rounded-xl h-10 text-xs text-slate-700"
                    />
                    <Button 
                      type="button" 
                      onClick={() => {
                        const trimmed = customHowKnew.trim();
                        if (trimmed) {
                          if (!howKnewOptions.includes(trimmed)) {
                            saveHowKnewOptions([...howKnewOptions, trimmed]);
                          }
                          handleInputChange('howKnewInstitution', trimmed);
                        }
                        setShowHowKnewInput(false);
                        setCustomHowKnew('');
                      }}
                      className="bg-secondary text-white shrink-0 hover:bg-secondary/95 text-xs h-10 rounded-xl"
                    >
                      Ok
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setShowHowKnewInput(false)}
                      className="shrink-0 text-slate-400 p-2 text-xs hover:bg-slate-50 h-10 rounded-xl"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select value={family.howKnewInstitution || ''} onValueChange={(v) => handleInputChange('howKnewInstitution', v)}>
                      <SelectTrigger id="howKnewInstitution" className="flex-1 bg-slate-50/60 border-slate-200 rounded-xl h-11">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {howKnewOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowHowKnewInput(true)} 
                      className="shrink-0 text-xs px-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl h-11 flex items-center gap-1 font-bold"
                    >
                      <Plus size={14} /> Novo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Endereço Sub-seção */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden mt-6">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">📍</div>
                <div>
                  <CardTitle className="text-lg">Localização Residencial</CardTitle>
                  <CardDescription className="text-xs">Identificação de endereço para visitas técnicas e distribuição de donativos.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="address" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  Logradouro e Número <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  id="address" 
                  value={family.address || ''} 
                  onChange={(e) => {
                    handleInputChange('address', e.target.value);
                    if (familyErrors.address) setFamilyErrors(prev => ({ ...prev, address: '' }));
                  }} 
                  className={familyErrors.address ? "border-rose-300 focus-visible:ring-rose-200" : "bg-slate-50/60 border-slate-200 rounded-xl h-11"}
                />
                {familyErrors.address && <p className="text-[10px] text-rose-500 font-bold">{familyErrors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  Bairro <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  id="neighborhood" 
                  value={family.neighborhood || ''} 
                  onChange={(e) => {
                    handleInputChange('neighborhood', e.target.value);
                    if (familyErrors.neighborhood) setFamilyErrors(prev => ({ ...prev, neighborhood: '' }));
                  }} 
                  className={familyErrors.neighborhood ? "border-rose-300 focus-visible:ring-rose-200" : "bg-slate-50/60 border-slate-200 rounded-xl h-11"}
                />
                {familyErrors.neighborhood && <p className="text-[10px] text-rose-500 font-bold">{familyErrors.neighborhood}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipality" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  Município <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  id="municipality" 
                  value={family.municipality || ''} 
                  onChange={(e) => {
                    handleInputChange('municipality', e.target.value);
                    if (familyErrors.municipality) setFamilyErrors(prev => ({ ...prev, municipality: '' }));
                  }} 
                  className={familyErrors.municipality ? "border-rose-300 focus-visible:ring-rose-200" : "bg-slate-50/60 border-slate-200 rounded-xl h-11"}
                  placeholder="Ex: São Paulo"
                />
                {familyErrors.municipality && <p className="text-[10px] text-rose-500 font-bold">{familyErrors.municipality}</p>}
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="referencePoint" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Ponto de Referência</Label>
                <Input id="referencePoint" value={family.referencePoint || ''} onChange={(e) => handleInputChange('referencePoint', e.target.value)} className="bg-slate-50/60 border-slate-200 rounded-xl h-11" />
              </div>

              {/* Qual programa ou projeto é atendido? */}
              <div className="space-y-3 lg:col-span-3 pt-2">
                <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  Programas e Projetos Atendidos pela ONG
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 border rounded-2xl">
                  {["Projeto Profissionalizar", "Viva Leite", "Cidade Solidária", "Reforço Escolar", "Atividades e eventos pontuais"].map((prog) => {
                    const isChecked = (family.programsServed || []).includes(prog);
                    return (
                      <div 
                        key={prog} 
                        className={`flex items-center space-x-2 bg-white p-3 rounded-xl border shadow-sm hover:border-primary/40 hover:shadow-md transition-all cursor-pointer ${isChecked ? 'border-primary/40 ring-1 ring-primary/10' : 'border-slate-200'}`}
                      >
                        <input 
                          type="checkbox" 
                          id={`prog-${prog}`}
                          checked={isChecked}
                          onChange={(e) => {
                            const current = family.programsServed || [];
                            if (e.target.checked) {
                              handleInputChange('programsServed', [...current, prog]);
                            } else {
                              handleInputChange('programsServed', current.filter(x => x !== prog));
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                        />
                        <Label htmlFor={`prog-${prog}`} className="text-xs font-bold text-slate-700 cursor-pointer select-none leading-none">
                          {prog}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Card 3: Informações Cadastrais e Socioeconômicas */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden mt-6">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">💼</div>
                <div>
                  <CardTitle className="text-lg">Informações Cadastrais e Socioeconômicas</CardTitle>
                  <CardDescription className="text-xs">Registro de documentações, situação profissional, benefícios e observações do atendimento.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="rg" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">RG</Label>
                <Input id="rg" value={family.rg || ''} onChange={(e) => handleInputChange('rg', e.target.value)} className="bg-slate-50/60 border-slate-200 rounded-xl h-11" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">CPF</Label>
                <Input 
                  id="cpf" 
                  placeholder="000.000.000-00" 
                  value={family.cpf || ''} 
                  onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))} 
                  className="bg-slate-50/60 border-slate-200 rounded-xl h-11" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nisNumber" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Número do NIS</Label>
                <Input id="nisNumber" value={family.nisNumber || ''} onChange={(e) => handleInputChange('nisNumber', e.target.value)} className="bg-slate-50/60 border-slate-200 rounded-xl h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professionalSituation" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Situação Profissional</Label>
                <Select value={family.professionalSituation || ''} onValueChange={(v) => handleInputChange('professionalSituation', v)}>
                  <SelectTrigger id="professionalSituation" className="bg-slate-50/60 border-slate-200 rounded-xl h-11">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Desempregado">Desempregado</SelectItem>
                    <SelectItem value="Autônomo">Autônomo</SelectItem>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="Aposentado">Aposentado</SelectItem>
                    <SelectItem value="Pensionista">Pensionista</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivesGovernmentAid" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Recebe algum auxílio governamental?</Label>
                <Select value={family.receivesGovernmentAid || 'Não'} onValueChange={(v) => handleInputChange('receivesGovernmentAid', v)}>
                  <SelectTrigger id="receivesGovernmentAid" className="bg-slate-50/60 border-slate-200 rounded-xl h-11">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {family.receivesGovernmentAid === 'Sim' ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="governmentAidType" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Se sim, qual auxílio?</Label>
                  <Input 
                    id="governmentAidType" 
                    placeholder="Ex: Bolsa Família, BPC, etc." 
                    value={family.governmentAidType || ''} 
                    onChange={(e) => handleInputChange('governmentAidType', e.target.value)} 
                    className="bg-slate-50/60 border-slate-200 rounded-xl h-11"
                  />
                </div>
              ) : (
                <div className="hidden"></div>
              )}

              <div className="space-y-2 lg:col-span-3">
                <Label htmlFor="observations" className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Observações</Label>
                <Textarea id="observations" placeholder="Outras informações relevantes..." value={family.observations || ''} onChange={(e) => handleInputChange('observations', e.target.value)} className="bg-slate-50/60 border-slate-200 rounded-xl min-h-[90px]" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: COMPOSIÇÃO FAMILIAR */}
        <TabsContent value="composition" className="space-y-6">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">👥</div>
                  <div>
                    <CardTitle className="text-lg">Formulário de Membros</CardTitle>
                    <CardDescription className="text-xs">Registre outros moradores que constituem a moradia comum.</CardDescription>
                  </div>
                </div>
                {editingMemberId && (
                  <Button variant="ghost" size="sm" className="rounded-xl font-bold bg-amber-50 hover:bg-amber-100 border text-amber-900 border-amber-200" onClick={cancelEditMember}>
                    Modo Edição Ativo <X size={14} className="ml-1 shrink-0 text-amber-500" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-5 bg-slate-50/80 border border-slate-200/60 rounded-2xl gap-5 items-end shadow-inner">
                
                <div className="space-y-2 lg:col-span-1">
                  <Label className={`text-[10px] uppercase font-bold tracking-wider ${memberErrors.name ? "text-rose-500" : "text-slate-500"}`}>
                    Nome do Membro <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={newMember.name || ''} 
                    onChange={e => {
                      setNewMember({...newMember, name: e.target.value});
                      if (memberErrors.name) setMemberErrors(prev => ({ ...prev, name: '' }));
                    }} 
                    placeholder="Ex: Lucas Silva" 
                    className={memberErrors.name ? "border-rose-300 focus-visible:ring-rose-200" : "bg-white border-slate-200 rounded-xl h-10"}
                  />
                  {memberErrors.name && <p className="text-[10px] text-rose-500 font-bold leading-none mt-1">{memberErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label className={`text-[10px] uppercase font-bold tracking-wider ${memberErrors.relationship ? "text-rose-500" : "text-slate-500"}`}>
                    Parentesco <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={newMember.relationship || ''} 
                    onChange={e => {
                      setNewMember({...newMember, relationship: e.target.value});
                      if (memberErrors.relationship) setMemberErrors(prev => ({ ...prev, relationship: '' }));
                    }} 
                    placeholder="Ex: Filho" 
                    className={memberErrors.relationship ? "border-rose-300 focus-visible:ring-rose-200" : "bg-white border-slate-200 rounded-xl h-10"}
                  />
                  {memberErrors.relationship && <p className="text-[10px] text-rose-500 font-bold leading-none mt-1">{memberErrors.relationship}</p>}
                </div>

                <div className="space-y-2">
                  <Label className={`text-[10px] uppercase font-bold tracking-wider ${memberErrors.birthDate ? "text-rose-500" : "text-slate-500"}`}>
                    Data Nascimento <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    type="date" 
                    value={newMember.birthDate || ''} 
                    onChange={e => {
                      setNewMember({...newMember, birthDate: e.target.value});
                      if (memberErrors.birthDate) setMemberErrors(prev => ({ ...prev, birthDate: '' }));
                    }} 
                    className={memberErrors.birthDate ? "border-rose-300 focus-visible:ring-rose-200" : "bg-white border-slate-200 rounded-xl h-10"}
                  />
                  {memberErrors.birthDate && <p className="text-[10px] text-rose-500 font-bold leading-none mt-1">{memberErrors.birthDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label className={`text-[10px] uppercase font-bold tracking-wider ${memberErrors.education ? "text-rose-500" : "text-slate-500"}`}>
                    Grau de instrução <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={newMember.education || ''} 
                    onChange={e => {
                      setNewMember({...newMember, education: e.target.value});
                      if (memberErrors.education) setMemberErrors(prev => ({ ...prev, education: '' }));
                    }} 
                    placeholder="Ex: Ensino Médio..."
                    className={memberErrors.education ? "border-rose-300 focus-visible:ring-rose-200" : "bg-white border-slate-200 rounded-xl h-10"}
                  />
                  {memberErrors.education && <p className="text-[10px] text-rose-500 font-bold leading-none mt-1">{memberErrors.education}</p>}
                </div>

                <div className="space-y-2">
                  <Label className={`text-[10px] uppercase font-bold tracking-wider ${memberErrors.occupation ? "text-rose-500" : "text-slate-500"}`}>
                    Profissão <span className="text-rose-500">*</span>
                  </Label>
                  <Input 
                    value={newMember.occupation || ''} 
                    onChange={e => {
                      setNewMember({...newMember, occupation: e.target.value});
                      if (memberErrors.occupation) setMemberErrors(prev => ({ ...prev, occupation: '' }));
                    }} 
                    placeholder="Ex: Estudante, Costureiro..."
                    className={memberErrors.occupation ? "border-rose-300 focus-visible:ring-rose-200" : "bg-white border-slate-200 rounded-xl h-10"}
                  />
                  {memberErrors.occupation && <p className="text-[10px] text-rose-500 font-bold leading-none mt-1">{memberErrors.occupation}</p>}
                </div>

                <div className="space-y-2">
                  <Label className={`text-[10px] uppercase font-bold tracking-wider ${memberErrors.income ? "text-rose-500" : "text-slate-500"}`}>
                    Renda (R$) <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-[11px] text-slate-400 font-bold">R$</span>
                    <Input 
                      type="number" 
                      value={newMember.income} 
                      onChange={e => {
                        setNewMember({...newMember, income: parseFloat(e.target.value) || 0});
                        if (memberErrors.income) setMemberErrors(prev => ({ ...prev, income: '' }));
                      }} 
                      className={memberErrors.income ? "border-rose-300 focus-visible:ring-rose-200 pl-8" : "bg-white border-slate-200 pl-8 rounded-xl h-10"}
                    />
                  </div>
                  {memberErrors.income && <p className="text-[10px] text-rose-500 font-bold leading-none mt-1">{memberErrors.income}</p>}
                </div>

                <div className="lg:col-span-3 flex gap-2 pt-2">
                  {editingMemberId && (
                    <Button type="button" variant="outline" onClick={cancelEditMember} className="flex-1 border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-xs h-10">
                      Dispensar Edição
                    </Button>
                  )}
                  <Button 
                    type="button" 
                    onClick={saveMember} 
                    className={`flex-1 font-bold text-xs h-10 rounded-xl shadow-md ${editingMemberId ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-primary hover:bg-primary/95 text-white'}`}
                  >
                    <Plus className="mr-1.5 h-4 w-4 shrink-0" /> 
                    {editingMemberId ? "Salvar Alterações do Membro" : "Adicionar Membro à Tabela"}
                  </Button>
                </div>
              </div>

              {/* Tabela dos Membros Adicionados */}
              <div className="bento-card border border-slate-100 overflow-x-auto rounded-2xl">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-slate-100">
                      <TableHead className="text-xs uppercase font-bold text-slate-500">Nome do Membro</TableHead>
                      <TableHead className="text-xs uppercase font-bold text-slate-500">Parentesco</TableHead>
                      <TableHead className="text-xs uppercase font-bold text-slate-500">Nascimento</TableHead>
                      <TableHead className="text-xs uppercase font-bold text-slate-500">Escolaridade</TableHead>
                      <TableHead className="text-xs uppercase font-bold text-slate-500">Profissão</TableHead>
                      <TableHead className="text-right text-xs uppercase font-bold text-slate-500">Renda</TableHead>
                      <TableHead className="w-[110px] text-right text-xs uppercase font-bold text-slate-500"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!family.members || family.members.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground italic text-xs">
                          Nenhum familiar pendente ou adicionado a este núcleo ainda.
                        </TableCell>
                      </TableRow>
                    ) : (
                      family.members.map((member) => (
                        <TableRow key={member.id} className="group hover:bg-slate-50 transition-colors border-slate-100">
                          <TableCell className="font-bold text-slate-800 text-sm py-3.5">{member.name}</TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium">{member.relationship}</TableCell>
                          <TableCell className="text-xs text-slate-500 font-medium">{member.birthDate}</TableCell>
                          <TableCell className="text-xs text-slate-500 font-medium">{member.education}</TableCell>
                          <TableCell className="text-xs text-slate-500 font-medium">{member.occupation}</TableCell>
                          <TableCell className="text-right text-xs font-bold text-emerald-600 font-mono">
                            R$ {member.income.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right py-2">
                            <div className="flex justify-end gap-1 opacity-90 group-hover:opacity-100">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => startEditMember(member)} 
                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Editar membro"
                              >
                                <Edit size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeMember(member.id)} 
                                className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg"
                                title="Deletar membro"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {familyErrors.submit && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
          {familyErrors.submit}
        </div>
      )}

      <div className="flex justify-end gap-2 px-1">
        <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl h-11">Cancelar</Button>
        <Button onClick={handleSave} disabled={loading} className="px-10 h-11 font-bold shadow-lg shadow-primary/20 rounded-xl">
           {loading ? "Processando..." : (id ? "Salvar Cadastro" : "Criar Cadastro")}
        </Button>
      </div>
    </div>
  );
}

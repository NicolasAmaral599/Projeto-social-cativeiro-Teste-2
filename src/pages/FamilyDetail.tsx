import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMockData } from '@/src/hooks/useMockData';
import { 
  ArrowLeft, 
  Printer, 
  Edit, 
  MapPin, 
  Phone, 
  Calendar, 
  User, 
  CreditCard, 
  Home, 
  Briefcase,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

export function FamilyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { families } = useMockData();
  
  const family = families.find(f => f.id === id);

  if (!family) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <AlertCircle size={48} className="text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">Família não encontrada</h2>
        <p className="text-muted-foreground">O registro solicitado não existe ou foi removido.</p>
        <Button onClick={() => navigate('/families')}>Voltar para a lista</Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12" id="printable-area">
      {/* Header - Hidden on print if needed, but NGO tools usually want a header on print too */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/families')} className="rounded-xl border">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Detalhamento Técnico</span>
            <h1 className="text-3xl font-bold text-slate-900 font-display">Ficha Familiar</h1>
            <p className="text-muted-foreground">Visualização completa do cadastro de {family.responsibleName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" onClick={handlePrint}>
            <Printer size={18} className="mr-2 text-slate-500" /> Imprimir Ficha
          </Button>
          <Button className="rounded-xl gap-2" onClick={() => navigate(`/families/edit/${family.id}`)}>
            <Edit size={16} /> Editar Cadastro
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Essential Info */}
        <div className="space-y-6">
          <Card className="border border-slate-100 rounded-2xl shadow-sm overflow-hidden bg-white">
            <div className="h-2 bg-primary w-full" />
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl mx-auto">
                {family.responsibleName.charAt(0)}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-800">{family.responsibleName}</h2>
                <div className="flex flex-wrap gap-1.5 justify-center items-center">
                  <Badge variant="outline" className="text-slate-400 border-slate-200 text-[10px] font-bold py-0.5 rounded-full px-2.5">
                    {family.maritalStatus}
                  </Badge>
                  {family.isFamilyRepresentative && (
                    <Badge className="bg-primary text-white font-bold border-none text-[9px] py-0.5 rounded-full px-2.5 uppercase tracking-wider">
                      Responsável Familiar
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-center gap-4 py-3 border-y border-slate-100">
                <div className="text-center">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold">Membros</p>
                  <p className="font-bold text-slate-800 text-lg">{(family.members || []).length + 1}</p>
                </div>
                <Separator orientation="vertical" className="h-10 bg-slate-100" />
                <div className="text-center">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold font-sans">Despesa Mensal</p>
                  <p className="font-bold text-rose-600 text-lg">R$ {family.monthlyExpenses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 rounded-2xl shadow-sm bg-white">
            <CardHeader className="pb-2 border-b bg-slate-50/50 rounded-t-2xl">
              <CardTitle className="text-xs uppercase tracking-wider font-bold text-slate-500">Contatos e Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Phone size={14} />
                </div>
                <div>
                   <p className="font-bold text-xs text-slate-400 uppercase tracking-wide">Telefone</p>
                   <p className="font-semibold text-slate-700">{family.phone || 'Não informado'}</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm border-t border-slate-100 pt-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin size={14} />
                </div>
                <div>
                   <p className="font-bold text-xs text-slate-400 uppercase tracking-wide">Endereço</p>
                   <p className="text-sm font-semibold text-slate-700 leading-snug">
                     {family.address}, {family.neighborhood} - {family.municipality || 'Não informado'}
                     <br />
                     <span className="text-xs font-medium text-slate-400 mt-1 block">Ref: {family.referencePoint || 'Não informado'}</span>
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 rounded-2xl shadow-sm bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider font-bold text-slate-500">Motivo do Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700 leading-relaxed italic pr-2">
              "{family.reasonForAssistance || 'Nenhum motivo específico registrado.'}"
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Data */}
        <div className="md:col-span-2 space-y-6">
           <Card className="border border-slate-100 rounded-2xl shadow-sm bg-white">
             <CardHeader className="pb-3 border-b bg-slate-50/50 rounded-t-2xl">
               <CardTitle className="text-base font-bold text-slate-800">Dados do Responsável</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-2 gap-y-6 gap-x-8 pt-5">
               <div className="space-y-1">
                 <p className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1.5 leading-none">
                   <Calendar size={13} className="text-slate-400" /> Data de Nascimento
                 </p>
                 <p className="text-sm font-bold text-slate-700">{family.birthDate}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1.5 leading-none">
                    <User size={13} className="text-slate-400" /> Sexo
                 </p>
                 <p className="text-sm font-bold text-slate-700">{family.gender === 'M' ? 'Masculino' : family.gender === 'F' ? 'Feminino' : family.gender}</p>
               </div>
               <div className="space-y-1 border-t border-slate-50 pt-4">
                 <p className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1.5 leading-none">
                    <CreditCard size={13} className="text-slate-400" /> RG / CPF
                 </p>
                 <p className="text-sm font-bold text-slate-700">{family.rg || '-'} / {family.cpf || '-'}</p>
               </div>
               <div className="space-y-1 border-t border-slate-50 pt-4">
                 <p className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1.5 leading-none">
                    <CreditCard size={13} className="text-slate-400" /> Número do NIS
                 </p>
                 <p className="text-sm font-bold font-mono text-slate-700">{family.nisNumber || '-'}</p>
               </div>
               <div className="space-y-1 border-t border-slate-50 pt-4">
                 <p className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1.5 leading-none">
                    <Briefcase size={13} className="text-slate-400" /> Situação Profissional
                 </p>
                 <p className="text-sm font-bold text-slate-700">{family.professionalSituation}</p>
               </div>
               <div className="space-y-1 border-t border-slate-50 pt-4">
                 <p className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1.5 leading-none">
                    <Home size={13} className="text-slate-400" /> Moradia
                 </p>
                 <p className="text-sm font-bold text-slate-700">{family.housingType} ({family.numberOfRooms} cômodos, {family.constructionType})</p>
               </div>
             </CardContent>
           </Card>

           {/* NOVO: ATENDIMENTO E AUXÍLIOS */}
           <Card className="border border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
             <CardHeader className="pb-3 border-b bg-slate-50/50">
               <CardTitle className="text-base font-bold text-slate-800 animate-in fade-in">Atendimento e Auxílios</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5">
               <div className="space-y-1">
                 <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                   Como conheceu a instituição
                 </p>
                 <p className="text-sm font-bold text-slate-700">{family.howKnewInstitution || 'Não informado'}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                   Auxílio Governamental
                 </p>
                 <p className="text-sm font-semibold">
                   {family.receivesGovernmentAid === 'Sim' ? (
                     <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg font-bold text-xs border border-emerald-200">
                       Sim ({family.governmentAidType || 'Não especificado'})
                     </span>
                   ) : (
                     <span className="text-slate-500 bg-slate-100/70 px-2.5 py-0.5 rounded-lg font-bold text-xs border border-slate-200">
                       Não
                     </span>
                   )}
                 </p>
               </div>
               <div className="space-y-2 sm:col-span-2 border-t border-slate-50 pt-4">
                 <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-1.5">
                   Programas e Projetos Atendidos pela ONG
                 </p>
                 <div className="flex flex-wrap gap-1.5 mt-1">
                   {!family.programsServed || family.programsServed.length === 0 ? (
                     <span className="text-xs text-muted-foreground italic font-medium text-slate-400">Nenhum programa selecionado</span>
                   ) : (
                     family.programsServed.map((prog) => (
                       <Badge key={prog} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none text-[10px] font-bold py-1 px-3 rounded-full shadow-inner">
                         {prog}
                       </Badge>
                     ))
                   )}
                 </div>
               </div>
             </CardContent>
           </Card>

           <Card className="border border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
             <CardHeader className="pb-3 border-b bg-slate-50/50">
               <CardTitle className="text-base font-bold text-slate-800">Composição Familiar</CardTitle>
               <CardDescription className="text-xs">Outros moradores registrados pertencentes ao núcleo.</CardDescription>
             </CardHeader>
             <CardContent className="pt-4">
               <div className="border border-slate-100 rounded-xl overflow-hidden">
                 <Table>
                   <TableHeader className="bg-slate-50">
                     <TableRow className="border-slate-100">
                       <TableHead className="text-xs uppercase font-bold text-slate-500 py-3">Membro</TableHead>
                       <TableHead className="text-xs uppercase font-bold text-slate-500 py-3">Parentesco</TableHead>
                       <TableHead className="text-xs uppercase font-bold text-slate-500 py-3">Nascimento</TableHead>
                        <TableHead className="text-xs uppercase font-bold text-slate-500 py-3">Escolaridade</TableHead>
                        <TableHead className="text-xs uppercase font-bold text-slate-500 py-3">Profissão</TableHead>
                       <TableHead className="text-right text-xs uppercase font-bold text-slate-500 py-3">Renda</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {!family.members || family.members.length === 0 ? (
                        <TableRow className="border-none">
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground italic text-xs">
                            Nenhum membro adicional registrado no núcleo escolar ou residencial.
                          </TableCell>
                        </TableRow>
                     ) : (
                       family.members.map((member) => (
                         <TableRow key={member.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                           <TableCell className="font-bold text-slate-800 text-sm py-3.5">{member.name}</TableCell>
                           <TableCell className="text-xs text-slate-600 font-medium">{member.relationship}</TableCell>
                           <TableCell className="text-xs text-slate-500 font-medium">{member.birthDate}</TableCell>
                            <TableCell className="text-xs text-slate-500 font-medium">{member.education || '-'}</TableCell>
                            <TableCell className="text-xs text-slate-500 font-medium">{member.occupation || '-'}</TableCell>
                           <TableCell className="text-right text-xs font-bold text-slate-600 font-mono">
                             R$ {member.income.toFixed(2)}
                           </TableCell>
                         </TableRow>
                       ))
                     )}
                   </TableBody>
                 </Table>
               </div>
             </CardContent>
           </Card>

           <Card className="border border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
             <CardHeader className="pb-3 border-b bg-slate-50/50">
               <CardTitle className="text-base font-bold text-slate-800">Observações</CardTitle>
             </CardHeader>
             <CardContent className="pt-4">
               <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100/50 text-slate-700 text-sm leading-relaxed">
                 {family.observations || 'Nenhuma observação técnica adicional foi preenchida para esta família.'}
               </div>
             </CardContent>
           </Card>
        </div>
      </div>

      <div className="text-center text-[10px] text-muted-foreground hidden print:block pt-12 border-t mt-12">
        Ficha técnica oficial - Relatório gerado em {new Date().toLocaleString()} pelo sistema de Gestão Projeto Social Cativeiro
      </div>
    </div>
  );
}

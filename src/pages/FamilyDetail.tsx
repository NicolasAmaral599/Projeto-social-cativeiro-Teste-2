import { useState } from 'react';
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
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function FamilyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { families, deleteFamily } = useMockData();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const membersRows = (family.members || []).map(m => `
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px;">${m.name}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px;">${m.relationship}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px;">${m.birthDate ? new Date(m.birthDate).toLocaleDateString('pt-BR') : '-'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px;">${m.education || '-'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px;">${m.occupation || '-'}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 11px; text-align: right;">R$ ${m.income ? m.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td>
      </tr>
    `).join('') || `<tr><td colspan="6" style="padding: 12px; border: 1px solid #cbd5e1; text-align: center; color: #94a3b8; font-size: 11px;">Nenhum membro adicional registrado.</td></tr>`;

    const programs = (family.programsServed || []).map(p => `
      <span style="display: inline-block; padding: 4px 8px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 10px; margin-right: 5px; margin-bottom: 5px; font-weight: bold;">
        ${p}
      </span>
    `).join('') || '<span style="color: #94a3b8; font-size: 11px;">Nenhum programa vinculado.</span>';

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatorio_Ficha_${family.responsibleName.replace(/\s+/g, '_')}</title>
          <style>
            @media print {
              body { padding: 0; margin: 0; color: #000; }
              .no-print { display: none; }
              .page { border: none; padding: 0; }
            }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #334155; line-height: 1.4; background-color: #f8fafc; }
            .page { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .header-title { font-size: 20px; font-weight: bold; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
            .header-subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
            .section { margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
            .section-title { background: #f8fafc; font-weight: bold; font-size: 12px; text-transform: uppercase; color: #475569; padding: 10px 15px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
            .section-content { padding: 15px; }
            .grid-3 { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 15px; }
            .grid-2 { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; }
            .field-box { margin-bottom: 5px; }
            .field-label { font-size: 9px; font-weight: bold; text-transform: uppercase; color: #94a3b8; tracking: 0.5px; }
            .field-value { font-size: 12px; font-weight: 500; color: #1e293b; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 5px; }
            th { background: #f8fafc; padding: 8px; border: 1px solid #cbd5e1; font-size: 10px; font-weight: bold; text-transform: uppercase; text-align: left; color: #475569; }
            .footer-notes { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            .sign-row { display: flex; justify-content: space-between; margin-top: 50px; padding: 0 20px; }
            .sign-box { width: 220px; text-align: center; font-size: 11px; }
            .sign-line { border-top: 1px solid #475569; margin-bottom: 6px; }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; box-shadow: 0 4px 10px rgba(37,99,235,0.2);">🖨️ CONFIRMAR IMPRESSÃO</button>
            <p style="font-size: 11px; color: #64748b; margin-top: 6px;">Caso a tela de impressão não abra automaticamente, clique no botão azul acima.</p>
          </div>
          
          <div class="page">
            <table class="header-table">
              <tr>
                <td style="width: 70px; vertical-align: middle;">
                  <div style="width: 54px; height: 54px; bg-color: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #0f172a; color: #fff; font-weight: bold; font-size: 24px;">C</div>
                </td>
                <td style="vertical-align: middle;">
                  <div class="header-title">Projeto Social Cativeiro</div>
                  <div class="header-subtitle">Ficha Cadastral Eletrônica - Acompanhamento Socioassistencial Integrado</div>
                </td>
                <td style="text-align: right; vertical-align: middle; font-size: 10px; color: #64748b;">
                  <div>ID Cadastro: #${family.id}</div>
                  <div>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</div>
                </td>
              </tr>
            </table>

            <div class="section">
              <div class="section-title">1. Responsável Familiar</div>
              <div class="section-content">
                <div class="grid-3" style="margin-bottom: 12px;">
                  <div class="field-box">
                    <div class="field-label">Nome Completo</div>
                    <div class="field-value">${family.responsibleName}</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label">Data de Nascimento</div>
                    <div class="field-value">${family.birthDate ? new Date(family.birthDate).toLocaleDateString('pt-BR') : '-'}</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label">Estado Civil</div>
                    <div class="field-value">${family.maritalStatus}</div>
                  </div>
                </div>
                <div class="grid-3">
                  <div class="field-box">
                    <div class="field-label">CPF</div>
                    <div class="field-value">${family.cpf}</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label">RG</div>
                    <div class="field-value">${family.rg || '-'}</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label">NIS / PIS</div>
                    <div class="field-value">${family.nisNumber || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">2. Endereço e Contatos</div>
              <div class="section-content">
                <div class="grid-2" style="margin-bottom: 12px;">
                  <div class="field-box">
                    <div class="field-label font-bold">Endereço</div>
                    <div class="field-value">${family.address}</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label">Bairro</div>
                    <div class="field-value">${family.neighborhood}</div>
                  </div>
                </div>
                <div class="grid-3">
                  <div class="field-box">
                    <div class="field-label">Município</div>
                    <div class="field-value">${family.municipality || 'São Paulo'}</div>
                  </div>
                  <div class="field-box" style="grid-column: span 2;">
                    <div class="field-label">Ponto de Referência</div>
                    <div class="field-value">${family.referencePoint || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">3. Detalhamento Socioeconômico</div>
              <div class="section-content">
                <div class="grid-3" style="margin-bottom: 12px;">
                  <div class="field-box">
                    <div class="field-label">Situação Profissional</div>
                    <div class="field-value">${family.professionalSituation}</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label font-bold">Tipo de Habitação</div>
                    <div class="field-value">${family.housingType} (${family.constructionType})</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label">Cômodos</div>
                    <div class="field-value">${family.numberOfRooms} cômodos</div>
                  </div>
                </div>
                <div class="grid-3" style="margin-bottom: 12px;">
                  <div class="field-box">
                    <div class="field-label">Despesa Mensal Média</div>
                    <div class="field-value font-bold">R$ ${family.monthlyExpenses ? family.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label">Recebe Auxílio Governamental</div>
                    <div class="field-value">${family.receivesGovernmentAid}</div>
                  </div>
                  <div class="field-box">
                    <div class="field-label">Tipo de Benefício</div>
                    <div class="field-value">${family.governmentAidType || '-'}</div>
                  </div>
                </div>
                <div class="field-box">
                  <div class="field-label">Motivo do Ingresso Assistencial</div>
                  <div class="field-value">${family.reasonForAssistance}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">4. Programas Associados</div>
              <div class="section-content" style="padding-top: 15px; padding-bottom: 10px;">
                ${programs}
              </div>
            </div>

            <div class="section">
              <div class="section-title">5. Membros da Composição Familiar (${(family.members || []).length} Adicionais)</div>
              <div class="section-content" style="padding: 0;">
                <table>
                  <thead>
                    <tr>
                      <th>Nome Completo</th>
                      <th>Parentesco</th>
                      <th>Nascimento</th>
                      <th>Escolaridade</th>
                      <th>Ocupação</th>
                      <th style="text-align: right;">Renda</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${membersRows}
                  </tbody>
                </table>
              </div>
            </div>

            ${family.observations ? `
            <div class="section">
              <div class="section-title">6. Observações e Parecer Técnico</div>
              <div class="section-content" style="font-size: 11px; color: #475569; font-style: italic; white-space: pre-wrap;">
                ${family.observations}
              </div>
            </div>
            ` : ''}

            <div class="sign-row">
              <div class="sign-box">
                <div class="sign-line"></div>
                <strong>Projeto Cativeiro</strong>
                <div style="font-size: 9px; color: #64748b;">Parecer Assistencial Responsável</div>
              </div>
              <div class="sign-box">
                <div class="sign-line"></div>
                <strong>${family.responsibleName}</strong>
                <div style="font-size: 9px; color: #64748b;">Declarante / Beneficiário</div>
              </div>
            </div>

            <div class="footer-notes">
              Ficha oficial gerada em conformidade com o regimento interno do Projeto Social Cativeiro.<br>
              © ${new Date().getFullYear()} Projeto Cativeiro - Todos os direitos reservados.
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 600);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteFamily(family.id);
      setIsDeleteDialogOpen(false);
      navigate('/families');
    } catch (err) {
      console.error("Failed to delete family:", err);
    }
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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" onClick={handlePrint}>
            <Printer size={18} className="mr-2 text-slate-500" /> Imprimir Ficha
          </Button>
          <Button variant="outline" className="rounded-xl gap-2 border-slate-200" onClick={() => navigate(`/families/edit/${family.id}`)}>
            <Edit size={16} className="text-emerald-500" /> Editar Cadastro
          </Button>
          <Button variant="destructive" className="rounded-xl gap-2 shadow-lg shadow-rose-100 dark:shadow-none bg-rose-600 hover:bg-rose-700" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 size={16} /> Excluir Cadastro
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center animate-bounce">
              <Trash2 size={24} />
            </div>
            <DialogTitle className="font-display font-bold text-lg text-slate-950">Excluir Ficha Familiar?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed text-center">
              Esta ação não pode ser desfeita. Todos os dados de {family.responsibleName}, incluindo composição familiar, histórico e observações serão permanentemente removidos do banco de dados do Supabase.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2 border-t flex sm:flex-row justify-end">
            <Button variant="outline" className="rounded-xl font-bold h-10 w-full sm:w-auto" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" className="rounded-xl font-bold h-10 w-full sm:w-auto bg-rose-600 hover:bg-rose-700 shadow-rose-100 shadow-md" onClick={handleDeleteConfirm}>
              Sim, Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="text-center text-[10px] text-muted-foreground hidden print:block pt-12 border-t mt-12">
        Ficha técnica oficial - Relatório gerado em {new Date().toLocaleString()} pelo sistema de Gestão Projeto Social Cativeiro
      </div>
    </div>
  );
}

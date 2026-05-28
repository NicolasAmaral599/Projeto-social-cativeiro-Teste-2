import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, FileText, MoreHorizontal, Eye, Edit, Trash2, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useMockData } from '@/src/hooks/useMockData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function FamilyList() {
  const navigate = useNavigate();
  const { families, deleteFamily } = useMockData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFamilies = families.filter(f => 
    f.responsibleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cpf.includes(searchTerm) ||
    f.nisNumber.includes(searchTerm) ||
    f.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
            <span>Início</span>
            <span>/</span>
            <span className="text-primary">Cadastros</span>
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
             <Button variant="outline" className="flex-1 md:flex-none h-11 rounded-xl">Filtros Avançados</Button>
             <Button variant="outline" className="flex-1 md:flex-none h-11 rounded-xl">Exportar Dados</Button>
          </div>
        </div>

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
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100">
                             <MoreHorizontal className="h-5 w-5 text-slate-400 group-hover:text-slate-800" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-slate-100">
                           <DropdownMenuLabel className="text-xs uppercase text-slate-400 font-bold ml-2 py-2">Gerenciar Cadastro</DropdownMenuLabel>
                           <DropdownMenuItem className="rounded-lg h-10 cursor-pointer" onClick={() => navigate(`/families/${family.id}`)}>
                             <Eye className="mr-3 h-4 w-4 text-primary" /> Ver Ficha Completa
                           </DropdownMenuItem>
                           <DropdownMenuItem className="rounded-lg h-10 cursor-pointer" onClick={() => navigate(`/families/edit/${family.id}`)}>
                             <Edit className="mr-3 h-4 w-4 text-emerald-500" /> Editar Dados
                           </DropdownMenuItem>
                           <DropdownMenuSeparator className="my-1 bg-slate-100" />
                           <DropdownMenuItem className="rounded-lg h-10 cursor-pointer text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => deleteFamily(family.id)}>
                             <Trash2 className="mr-3 h-4 w-4" /> Excluir Registro
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between mt-8 px-2">
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Página 1 de {Math.ceil(families.length / 10)}</p>
           <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl px-4 font-bold" disabled>Anterior</Button>
              <Button variant="outline" size="sm" className="rounded-xl px-4 font-bold" disabled>Próxima</Button>
           </div>
        </div>
      </div>
    </div>
  );
}

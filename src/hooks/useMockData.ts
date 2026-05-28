import { useState, useEffect } from 'react';
import { Family, DashboardStats } from '../types';

const MOCK_FAMILIES: Family[] = [
  {
    id: '1',
    responsibleName: 'Maria Silva Oliveira',
    birthDate: '1985-05-15',
    gender: 'F',
    maritalStatus: 'Solteira',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123',
    neighborhood: 'Jardim Alvorada',
    municipality: 'São Paulo',
    referencePoint: 'Próximo ao mercadinho do Zé',
    reasonForAssistance: 'Desemprego e vulnerabilidade alimentar',
    rg: '12.345.678-9',
    cpf: '123.456.789-00',
    nisNumber: '123.456.789.10',
    professionalSituation: 'Desempregada',
    housingType: 'Alugada',
    numberOfRooms: 3,
    constructionType: 'Alvenaria',
    monthlyExpenses: 1200,
    observations: 'Família necessita de acompanhamento prioritário.',
    createdAt: '2024-04-10T10:00:00Z',
    isFamilyRepresentative: true,
    howKnewInstitution: 'Indicação',
    programsServed: ['Reforço Escolar', 'Viva Leite'],
    receivesGovernmentAid: 'Sim',
    governmentAidType: 'Bolsa Família',
    members: [
      {
        id: '101',
        name: 'Pedro Silva Oliveira',
        relationship: 'Filho',
        birthDate: '2015-08-20',
        education: 'Ensino Fundamental',
        occupation: 'Estudante',
        income: 0
      },
      {
        id: '102',
        name: 'Ana Silva Oliveira',
        relationship: 'Filha',
        birthDate: '2018-03-12',
        education: 'Educação Infantil',
        occupation: 'Estudante',
        income: 0
      }
    ]
  },
  {
    id: '2',
    responsibleName: 'João Pereira dos Santos',
    birthDate: '1978-11-22',
    gender: 'M',
    maritalStatus: 'Casado',
    phone: '(11) 91234-5678',
    address: 'Av. Brasil, 456',
    neighborhood: 'Vila Esperança',
    municipality: 'São Paulo',
    referencePoint: 'Em frente à escola municipal',
    reasonForAssistance: 'Baixa renda familiar',
    rg: '23.456.789-0',
    cpf: '234.567.890-11',
    nisNumber: '234.567.890.11',
    professionalSituation: 'Autônomo',
    housingType: 'Própria',
    numberOfRooms: 4,
    constructionType: 'Alvenaria',
    monthlyExpenses: 800,
    observations: 'Família com 3 filhos em idade escolar.',
    createdAt: '2024-05-01T09:30:00Z',
    isFamilyRepresentative: true,
    howKnewInstitution: 'Redes sociais',
    programsServed: ['Projeto Profissionalizar'],
    receivesGovernmentAid: 'Não',
    governmentAidType: '',
    members: [
      {
        id: '201',
        name: 'Carla dos Santos',
        relationship: 'Esposa',
        birthDate: '1982-01-10',
        education: 'Ensino Médio',
        occupation: 'Dona de Casa',
        income: 0
      }
    ]
  }
];

export function useMockData() {
  const [families, setFamilies] = useState<Family[]>(() => {
    const saved = localStorage.getItem('cativeiro_families');
    return saved ? JSON.parse(saved) : MOCK_FAMILIES;
  });

  useEffect(() => {
    localStorage.setItem('cativeiro_families', JSON.stringify(families));
  }, [families]);

  const stats: DashboardStats = {
    totalFamilies: families.length,
    totalChildren: families.reduce((acc, f) => {
      return acc + f.members.filter(m => {
        const birthDate = new Date(m.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age < 18;
      }).length;
    }, 0),
    familiesServedThisMonth: families.filter(f => {
      const created = new Date(f.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length
  };

  const addFamily = (family: Family) => {
    setFamilies(prev => [family, ...prev]);
  };

  const updateFamily = (updatedFamily: Family) => {
    setFamilies(prev => prev.map(f => f.id === updatedFamily.id ? updatedFamily : f));
  };

  const deleteFamily = (id: string) => {
    setFamilies(prev => prev.filter(f => f.id !== id));
  };

  return {
    families,
    stats,
    addFamily,
    updateFamily,
    deleteFamily
  };
}

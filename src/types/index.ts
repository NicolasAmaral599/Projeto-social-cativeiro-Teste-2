export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  birthDate: string;
  education: string;
  occupation: string;
  income: number;
}

export interface Family {
  id: string;
  responsibleName: string;
  birthDate: string;
  gender: 'M' | 'F' | 'Outro';
  maritalStatus: string;
  phone: string;
  address: string;
  neighborhood: string;
  municipality: string;
  referencePoint: string;
  reasonForAssistance: string;
  rg: string;
  cpf: string;
  nisNumber: string;
  professionalSituation: string;
  housingType: string;
  numberOfRooms: number;
  constructionType: string;
  monthlyExpenses: number;
  observations: string;
  members: FamilyMember[];
  createdAt: string;
  isFamilyRepresentative: boolean;
  howKnewInstitution: string;
  programsServed: string[];
  receivesGovernmentAid: string;
  governmentAidType?: string;
}

export interface DashboardStats {
  totalFamilies: number;
  totalChildren: number;
  familiesServedThisMonth: number;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // e.g. "Professor de Reforço", "Separador de Donativos"
  project: string; // e.g. "Reforço Escolar", "Bazar Cativeiro"
  status: 'Ativo' | 'Inativo';
  joinDate: string;
  hoursContributed: number;
}

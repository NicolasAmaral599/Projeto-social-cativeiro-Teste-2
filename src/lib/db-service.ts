import { doc, setDoc, getDocs, collection, deleteDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { supabase, isSupabaseConfigured } from "./supabase";
import { Family, Volunteer } from "../types";

// Get isolation setting
export const isDataIsolated = () => {
  return localStorage.getItem('cativeiro_data_isolation') !== 'false'; // default to true
};

// Mode can be: 'local' | 'firestore' | 'supabase'
export const getDatabaseMode = (): 'local' | 'firestore' | 'supabase' => {
  const saved = localStorage.getItem('cativeiro_db_mode');
  if (saved === 'supabase' && isSupabaseConfigured()) return 'supabase';
  if (saved === 'firestore') return 'firestore';
  return 'local';
};

export const setDatabaseMode = (mode: 'local' | 'firestore' | 'supabase') => {
  localStorage.setItem('cativeiro_db_mode', mode);
};

// Get current user email for isolation
export const getCurrentUserEmail = () => {
  return localStorage.getItem('cativeiro_user_email') || 'admin@projeto.org';
};

// Helper to prevent infinite hanging by racing queries with an 8s timeout
const withTimeout = (promise: any, ms = 8000): Promise<any> => {
  return Promise.race([
    promise,
    new Promise<any>((_, reject) => 
      setTimeout(() => reject(new Error("A conexão com o banco de dados expirou (Timeout). Verifique se as credenciais do Supabase ou as regras de RLS estão corretas.")), ms)
    )
  ]);
};

// Main Db Service
export const dbService = {
  // Fetch all families
  async fetchFamilies(): Promise<Family[]> {
    const mode = getDatabaseMode();
    const isolated = isDataIsolated();
    const userEmail = getCurrentUserEmail();

    if (mode === 'firestore') {
      try {
        const familiesCol = collection(db, "families");
        let q = query(familiesCol);
        
        if (isolated) {
          q = query(familiesCol, where("createdBy", "==", userEmail));
        }

        const querySnapshot = await getDocs(q);
        const list: Family[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            ...data
          } as Family);
        });

        // If firestore is empty, and user just started, return fallback
        return list;
      } catch (err) {
        console.error("Error reading from Firestore:", err);
        throw err;
      }
    }

    if (mode === 'supabase' && supabase) {
      try {
        let req = supabase.from('families').select('*');
        
        if (isolated) {
          req = req.eq('created_by', userEmail);
        }
        
        const { data, error } = await withTimeout(req, 8000);
        if (error) throw error;
        
        if (data && data.length > 0) {
          return data.map(row => {
            // Check if stored in 'data' jsonb, or columns
            if (row.data) {
              return {
                ...row.data,
                id: row.id,
                createdAt: row.created_at || row.data.createdAt
              };
            }
            return {
              id: row.id,
              responsibleName: row.responsible_name || row.responsibleName,
              birthDate: row.birth_date || row.birthDate,
              gender: row.gender,
              maritalStatus: row.marital_status || row.maritalStatus,
              phone: row.phone,
              address: row.address,
              neighborhood: row.neighborhood,
              municipality: row.municipality,
              referencePoint: row.reference_point || row.referencePoint,
              reasonForAssistance: row.reason_for_assistance || row.reasonForAssistance,
              rg: row.rg,
              cpf: row.cpf,
              nisNumber: row.nis_number || row.nisNumber,
              professionalSituation: row.professional_situation || row.professionalSituation,
              housingType: row.housing_type || row.housingType,
              numberOfRooms: Number(row.number_of_rooms || row.numberOfRooms || 1),
              constructionType: row.construction_type || row.constructionType,
              monthlyExpenses: Number(row.monthly_expenses || row.monthlyExpenses || 0),
              observations: row.observations,
              members: Array.isArray(row.members) ? row.members : (typeof row.members === 'string' ? JSON.parse(row.members) : []),
              createdAt: row.created_at || row.createdAt,
              isFamilyRepresentative: row.is_family_representative ?? row.isFamilyRepresentative ?? true,
              howKnewInstitution: row.how_knew_institution || row.howKnewInstitution || '',
              programsServed: Array.isArray(row.programs_served) ? row.programs_served : (typeof row.programs_served === 'string' ? JSON.parse(row.programs_served) : []),
              receivesGovernmentAid: row.receives_government_aid || row.receivesGovernmentAid,
              governmentAidType: row.government_aid_type || row.governmentAidType
            } as Family;
          });
        }
        return [];
      } catch (err) {
        console.error("Error reading from Supabase:", err);
        throw err;
      }
    }

    // Default to LocalStorage
    const saved = localStorage.getItem('cativeiro_families');
    const localList: Family[] = saved ? JSON.parse(saved) : [];
    
    if (isolated) {
      // Isolate in local storage by tagging with createdBy
      return localList.filter(f => (f as any).createdBy === userEmail || !(f as any).createdBy);
    }
    return localList;
  },

  // Save/Add family
  async addFamily(family: Family): Promise<void> {
    const mode = getDatabaseMode();
    const userEmail = getCurrentUserEmail();
    const taggedFamily = {
      ...family,
      createdBy: userEmail
    };

    if (mode === 'firestore') {
      try {
        const docRef = doc(db, "families", family.id);
        await setDoc(docRef, taggedFamily);
        return;
      } catch (err) {
        console.error("Error writing to Firestore:", err);
        throw err;
      }
    }

    if (mode === 'supabase' && supabase) {
      try {
        // Only map to columns that exist in the standard families table schema.
        // Everything else is tucked safely inside the 'data' JSONB field, preserving types and ignoring database migrations.
        const rowData = {
          id: family.id,
          responsible_name: family.responsibleName,
          created_by: userEmail,
          created_at: family.createdAt,
          data: taggedFamily
        };

        const { error } = await withTimeout(supabase.from('families').upsert(rowData), 8000);
        if (error) throw error;
        return;
      } catch (err) {
        console.error("Error writing to Supabase:", err);
        throw err;
      }
    }

    // Default: LocalStorage
    const saved = localStorage.getItem('cativeiro_families');
    const localList: Family[] = saved ? JSON.parse(saved) : [];
    localList.unshift(taggedFamily);
    localStorage.setItem('cativeiro_families', JSON.stringify(localList));
  },

  // Update family
  async updateFamily(family: Family): Promise<void> {
    const mode = getDatabaseMode();
    const userEmail = getCurrentUserEmail();
    const taggedFamily = {
      ...family,
      createdBy: (family as any).createdBy || userEmail
    };

    if (mode === 'firestore') {
      try {
        const docRef = doc(db, "families", family.id);
        await setDoc(docRef, taggedFamily, { merge: true });
        return;
      } catch (err) {
        console.error("Error updating Firestore document:", err);
        throw err;
      }
    }

    if (mode === 'supabase' && supabase) {
      try {
        const rowData = {
          id: family.id,
          responsible_name: family.responsibleName,
          created_by: (family as any).createdBy || userEmail,
          created_at: family.createdAt,
          data: taggedFamily
        };

        const { error } = await withTimeout(supabase.from('families').upsert(rowData), 8000);
        if (error) throw error;
        return;
      } catch (err) {
        console.error("Error updating Supabase row:", err);
        throw err;
      }
    }

    // Default: LocalStorage
    const saved = localStorage.getItem('cativeiro_families');
    let localList: Family[] = saved ? JSON.parse(saved) : [];
    localList = localList.map(f => f.id === family.id ? taggedFamily : f);
    localStorage.setItem('cativeiro_families', JSON.stringify(localList));
  },

  // Delete family
  async deleteFamily(id: string): Promise<void> {
    const mode = getDatabaseMode();

    if (mode === 'firestore') {
      try {
        const docRef = doc(db, "families", id);
        await deleteDoc(docRef);
        return;
      } catch (err) {
        console.error("Error deleting Firestore document:", err);
        throw err;
      }
    }

    if (mode === 'supabase' && supabase) {
      try {
        const { error } = await withTimeout(supabase.from('families').delete().eq('id', id), 8000);
        if (error) throw error;
        return;
      } catch (err) {
        console.error("Error deleting Supabase row:", err);
        throw err;
      }
    }

    // Default: LocalStorage
    const saved = localStorage.getItem('cativeiro_families');
    let localList: Family[] = saved ? JSON.parse(saved) : [];
    localList = localList.filter(f => f.id !== id);
    localStorage.setItem('cativeiro_families', JSON.stringify(localList));
  },

  // NEW VOLUNTEER METHODS
  async fetchVolunteers(): Promise<Volunteer[]> {
    const mode = getDatabaseMode();
    const isolated = isDataIsolated();
    const userEmail = getCurrentUserEmail();

    if (mode === 'firestore') {
      try {
        const volunteersCol = collection(db, "volunteers");
        let q = query(volunteersCol);
        
        if (isolated) {
          q = query(volunteersCol, where("createdBy", "==", userEmail));
        }

        const querySnapshot = await getDocs(q);
        const list: Volunteer[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            ...data
          } as Volunteer);
        });
        return list;
      } catch (err) {
        console.error("Error reading volunteers from Firestore:", err);
        throw err;
      }
    }

    if (mode === 'supabase' && supabase) {
      try {
        let req = supabase.from('volunteers').select('*');
        
        if (isolated) {
          req = req.eq('created_by', userEmail);
        }
        
        const { data, error } = await withTimeout(req, 8000);
        if (error) {
          console.warn("Supabase volunteers query failed (table may not exist yet, using local fallback):", error);
          throw error;
        }
        
        if (data && data.length > 0) {
          return data.map(row => {
            if (row.data) {
              return {
                ...row.data,
                id: row.id,
                joinDate: row.created_at || row.data.joinDate
              };
            }
            return {
              id: row.id,
              name: row.name,
              email: row.email,
              phone: row.phone,
              role: row.role,
              project: row.project,
              status: row.status,
              joinDate: row.created_at || row.joinDate,
              hoursContributed: Number(row.hours_contributed || row.hoursContributed || 0)
            } as Volunteer;
          });
        }
        return [];
      } catch (err) {
        console.error("Error reading volunteers from Supabase:", err);
        throw err;
      }
    }

    // Default: LocalStorage
    const saved = localStorage.getItem('cativeiro_volunteers');
    const localList: Volunteer[] = saved ? JSON.parse(saved) : [];
    if (isolated) {
      return localList.filter(v => (v as any).createdBy === userEmail || !(v as any).createdBy);
    }
    return localList;
  },

  async addVolunteer(volunteer: Volunteer): Promise<void> {
    const mode = getDatabaseMode();
    const userEmail = getCurrentUserEmail();
    const taggedVolunteer = {
      ...volunteer,
      createdBy: userEmail
    };

    if (mode === 'firestore') {
      try {
        const docRef = doc(db, "volunteers", volunteer.id);
        await setDoc(docRef, taggedVolunteer);
        return;
      } catch (err) {
        console.error("Error writing volunteer to Firestore:", err);
        throw err;
      }
    }

    if (mode === 'supabase' && supabase) {
      try {
        const rowData = {
          id: volunteer.id,
          name: volunteer.name,
          created_by: userEmail,
          created_at: volunteer.joinDate,
          data: taggedVolunteer
        };

        const { error } = await withTimeout(supabase.from('volunteers').upsert(rowData), 8000);
        if (error) {
          console.error("Failed to insert volunteer in Supabase 'volunteers' table. Ensure a 'volunteers' table exists with dynamic fields or 'data' column:", error);
          throw error;
        }
        return;
      } catch (err) {
        console.error("Error writing volunteer to Supabase:", err);
        throw err;
      }
    }

    // Default: LocalStorage
    const saved = localStorage.getItem('cativeiro_volunteers');
    const localList: Volunteer[] = saved ? JSON.parse(saved) : [];
    localList.unshift(taggedVolunteer);
    localStorage.setItem('cativeiro_volunteers', JSON.stringify(localList));
  },

  async updateVolunteer(volunteer: Volunteer): Promise<void> {
    const mode = getDatabaseMode();
    const userEmail = getCurrentUserEmail();
    const taggedVolunteer = {
      ...volunteer,
      createdBy: (volunteer as any).createdBy || userEmail
    };

    if (mode === 'firestore') {
      try {
        const docRef = doc(db, "volunteers", volunteer.id);
        await setDoc(docRef, taggedVolunteer, { merge: true });
        return;
      } catch (err) {
        console.error("Error updating Firestore volunteer document:", err);
        throw err;
      }
    }

    if (mode === 'supabase' && supabase) {
      try {
        const rowData = {
          id: volunteer.id,
          name: volunteer.name,
          created_by: (volunteer as any).createdBy || userEmail,
          created_at: volunteer.joinDate,
          data: taggedVolunteer
        };

        const { error } = await withTimeout(supabase.from('volunteers').upsert(rowData), 8000);
        if (error) throw error;
        return;
      } catch (err) {
        console.error("Error updating Supabase volunteer row:", err);
        throw err;
      }
    }

    // Default: LocalStorage
    const saved = localStorage.getItem('cativeiro_volunteers');
    let localList: Volunteer[] = saved ? JSON.parse(saved) : [];
    localList = localList.map(v => v.id === volunteer.id ? taggedVolunteer : v);
    localStorage.setItem('cativeiro_volunteers', JSON.stringify(localList));
  },

  async deleteVolunteer(id: string): Promise<void> {
    const mode = getDatabaseMode();

    if (mode === 'firestore') {
      try {
        const docRef = doc(db, "volunteers", id);
        await deleteDoc(docRef);
        return;
      } catch (err) {
        console.error("Error deleting Firestore volunteer document:", err);
        throw err;
      }
    }

    if (mode === 'supabase' && supabase) {
      try {
        const { error } = await withTimeout(supabase.from('volunteers').delete().eq('id', id), 8000);
        if (error) throw error;
        return;
      } catch (err) {
        console.error("Error deleting Supabase volunteer row:", err);
        throw err;
      }
    }

    // Default: LocalStorage
    const saved = localStorage.getItem('cativeiro_volunteers');
    let localList: Volunteer[] = saved ? JSON.parse(saved) : [];
    localList = localList.filter(v => v.id !== id);
    localStorage.setItem('cativeiro_volunteers', JSON.stringify(localList));
  }
};

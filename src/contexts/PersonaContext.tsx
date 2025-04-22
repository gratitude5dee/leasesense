
import { createContext, useContext, useState, ReactNode } from 'react';
import { Constants } from '@/integrations/supabase/types';

type UserType = typeof Constants.public.Enums.user_type[number];

interface PersonaContextType {
  persona: UserType;
  setPersona: (persona: UserType) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<UserType>('renter');

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
}

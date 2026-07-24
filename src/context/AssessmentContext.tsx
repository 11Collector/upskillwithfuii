"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AssessmentContextType {
  isAssessing: boolean;
  setIsAssessing: (value: boolean) => void;
}

const AssessmentContext = createContext<AssessmentContextType>({
  isAssessing: false,
  setIsAssessing: () => {},
});

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [isAssessing, setIsAssessing] = useState(false);

  return (
    <AssessmentContext.Provider value={{ isAssessing, setIsAssessing }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  return useContext(AssessmentContext);
}

export function useAssessmentMode(isAssessing: boolean) {
  const { setIsAssessing } = useAssessment();
  useEffect(() => {
    setIsAssessing(isAssessing);
    return () => {
      setIsAssessing(false);
    };
  }, [isAssessing, setIsAssessing]);
}

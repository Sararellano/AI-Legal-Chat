/** Official source reference for a legal data field. */
export type LegalSource = {
  name: string;
  url: string;
  reference?: string;
};

/** Salario Mínimo Interprofesional (SMI) amounts. */
export type SmiData = {
  year: number;
  monthlyEuros: number;
  dailyEuros: number;
  yearlyEuros14Payments: number;
  effectiveFrom: string;
  boeId: string;
  decree: string;
  source: LegalSource;
  fetchedAt: string;
  fetchMethod: "boe-api" | "baseline";
};

/** Salary cap for indemnity calculations (ET art. 56). */
export type IndemnitySalaryCap = {
  dailyEurosMax: number;
  formula: string;
  legalBasis: string;
  source: LegalSource;
};

/** Indemnity rules for a dismissal type. */
export type IndemnityRule = {
  daysPerYear: number;
  maxMonthlyPayments: number;
  preNoticeDays?: number;
  effectiveFrom?: string;
  priorSeniorityDaysPerYear?: number;
  priorSeniorityMaxMonthlyPayments?: number;
  legalBasis: string;
  source: LegalSource;
};

/** Procedural deadline in business days. */
export type LegalDeadline = {
  id: string;
  label: string;
  businessDays: number;
  legalBasis: string;
  source: LegalSource;
  notes?: string;
};

/** Aggregated legal data consumed by the assistant and update script. */
export type LegalData = {
  version: string;
  updatedAt: string;
  smi: SmiData;
  indemnitySalaryCap: IndemnitySalaryCap;
  indemnityRules: {
    improcedente: IndemnityRule;
    objetivo: IndemnityRule;
    procedente: Pick<IndemnityRule, "legalBasis" | "source"> & {
      indemnityEuros: 0;
    };
  };
  deadlines: LegalDeadline[];
  officialSources: LegalSource[];
  updateLog: string[];
};

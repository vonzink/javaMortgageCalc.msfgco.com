/**
 * Income Calculation Utilities — Barrel Export
 */

export { policyCalc, type PolicyResult, type AveragingMethod } from './policyCalc';
export { calculateForm1040, type Form1040Params, type Form1040Result, type Form1040SectionResult } from './form1040';
export { calculateScheduleC, type ScheduleCParams, type ScheduleCResult, type ScheduleCBusinessResult } from './scheduleC';
export { calculateForm1065, type Form1065Params, type Form1065Result, type Form1065PartnershipResult } from './form1065';
export { calculateForm1120, type Form1120Params, type Form1120Result } from './form1120';
export { calculateForm1120S, type Form1120SParams, type Form1120SResult, type Form1120SCorpResult } from './form1120s';
export { calculateForm1120SK1, type Form1120SK1Params, type Form1120SK1Result, type K1SEntityResult } from './form1120sK1';
export { calculateK1Partnership, type K1PartnershipParams, type K1PartnershipResult, type PartnershipK1Result } from './k1';
export { calculateScheduleB, type ScheduleBParams, type ScheduleBResult } from './scheduleB';
export { calculateScheduleD, type ScheduleDParams, type ScheduleDResult } from './scheduleD';
export { calculateScheduleE, type ScheduleEParams, type ScheduleEResult } from './scheduleE';
export { calculateScheduleESubject, type ScheduleESubjectParams, type ScheduleESubjectResult } from './scheduleESubject';
export { calculateScheduleF, type ScheduleFParams, type ScheduleFResult } from './scheduleF';
export {
  calculateRentalMethodA, calculateRentalMethodB,
  type RentalMethodAParams, type RentalMethodBParams,
  type RentalMethodAResult, type RentalMethodBResult, type Rental1038Result, type RentalMethod,
} from './rental1038';
export {
  calculateVariableIncome, evaluateTrend,
  type VariableIncomeParams, type VariableIncomeResult,
  type EmployerData, type EmployerResult, type IncomeTrend,
  type PayFrequency, PAY_PERIODS_PER_YEAR,
} from './variableIncome';

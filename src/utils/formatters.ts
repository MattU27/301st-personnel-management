import { RankType, CompanyType } from '@/types/personnel';

/**
 * Maps abbreviated rank codes to full rank names from the dropdown
 */
export const getRankDisplayName = (rankCode: string): RankType => {
  // Map of abbreviations to full rank names
  const rankMapping: Record<string, RankType> = {
    // Army ranks
    'PVT': 'Private',
    'PFC': 'Private First Class',
    'CPL': 'Corporal',
    'SGT': 'Sergeant',
    'SGM': 'Sergeant',
    'SSG': 'Sergeant',
    'SSGT': 'Sergeant',
    'MSG': 'Sergeant',
    'SFC': 'Sergeant',
    'CSM': 'Sergeant',
    '2LT': 'Second Lieutenant',
    '1LT': 'First Lieutenant',
    'LT': 'Second Lieutenant',
    'CAPT': 'Captain',
    'CPT': 'Captain',
    'MAJ': 'Major',
    'LTC': 'Lieutenant Colonel',
    'COL': 'Colonel',
    'BG': 'Brigadier General',
    'GEN': 'Brigadier General',
    'MG': 'Brigadier General',
    
    // Navy ranks
    'CPO': 'Sergeant',
    'PO1': 'Corporal',
    'PO2': 'Corporal',
    'PO3': 'Private First Class',
    'MCPO': 'Sergeant',
    'SCPO': 'Sergeant',
    'CWO': 'First Lieutenant',
    'WO': 'Second Lieutenant',
    'RADM': 'Colonel',
    
    // Air Force ranks
    'TSG': 'Sergeant',
    'FMCPO': 'Private',
    'ATC': 'Private',
  };

  // If the rank code is in our mapping, return the full rank
  if (rankCode in rankMapping) {
    return rankMapping[rankCode];
  }
  
  // If the rank is already a valid full rank, return it
  const validRanks: RankType[] = [
    'Private',
    'Private First Class',
    'Corporal',
    'Sergeant',
    'Second Lieutenant',
    'First Lieutenant',
    'Captain',
    'Major',
    'Lieutenant Colonel',
    'Colonel',
    'Brigadier General'
  ];
  
  if (validRanks.includes(rankCode as RankType)) {
    return rankCode as RankType;
  }
  
  // Default fallback
  return 'Private';
};

/**
 * Maps company codes to full company names from the dropdown
 */
export const getCompanyDisplayName = (companyCode: string): CompanyType => {
  // Map of company codes to full company names
  const companyMapping: Record<string, CompanyType> = {
    'HQ': 'Headquarters',
    'FOXTROT': 'Alpha',
    'NERRRSC': 'NERRSC (NERR-Signal Company)',
    'NERRSC': 'NERRSC (NERR-Signal Company)',
    'ENGBAT': 'Alpha',
    'INTELDIV': 'Alpha',
    'MEDCORP': 'Alpha',
    'DELTA': 'Alpha',
    'ECHO': 'Alpha',
    'HOTEL': 'Alpha',
    'NERRFAB': 'NERRFAB (NERR-Field Artillery Battery)',
  };

  // If the company code is in our mapping, return the full company name
  if (companyCode in companyMapping) {
    return companyMapping[companyCode];
  }
  
  // If the company is already a valid full company name, return it
  const validCompanies: CompanyType[] = [
    'Alpha',
    'Bravo',
    'Charlie',
    'Headquarters',
    'NERRSC (NERR-Signal Company)',
    'NERRFAB (NERR-Field Artillery Battery)'
  ];
  
  if (validCompanies.includes(companyCode as CompanyType)) {
    return companyCode as CompanyType;
  }
  
  // Default fallback
  return 'Alpha';
}; 
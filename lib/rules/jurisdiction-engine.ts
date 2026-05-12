import { JurisdictionRule, CECategory, LicenseType } from './rule-types';

/**
 * Jurisdiction Rule Engine
 * Contains hardcoded rules for supported states (CA, TX, NY, FL, IL) for MVP.
 * In future versions, this will be dynamic and database-driven.
 */
export class JurisdictionRuleEngine {
  private rules: Record<string, JurisdictionRule[]> = {
    CA: [
      {
        id: 'ca-lmft-001',
        state: 'CA',
        licenseType: 'LMFT',
        requiredHours: 50,
        renewalPeriodMonths: 24,
        categories: [
          { name: 'Law & Ethics', minHours: 12, required: true },
          { name: 'Suicide Assessment', minHours: 6, required: true },
          { name: 'General CE', minHours: 32, required: false },
        ],
        allowedProviders: ['APA', 'NASW-CA', 'CAMFT'],
      },
      {
        id: 'ca-lcs w-001',
        state: 'CA',
        licenseType: 'LCSW',
        requiredHours: 50,
        renewalPeriodMonths: 24,
        categories: [
          { name: 'Law & Ethics', minHours: 12, required: true },
          { name: 'Suicide Assessment', minHours: 6, required: true },
          { name: 'General CE', minHours: 32, required: false },
        ],
        allowedProviders: ['NASW-CA', 'CBBS'],
      },
    ],
    TX: [
      {
        id: 'tx-lpc-001',
        state: 'TX',
        licenseType: 'LPC',
        requiredHours: 24,
        renewalPeriodMonths: 24,
        categories: [
          { name: 'Ethics', minHours: 6, required: true },
          { name: 'Cultural Diversity', minHours: 3, required: true },
          { name: 'General CE', minHours: 15, required: false },
        ],
        allowedProviders: ['NBCC', 'TCA'],
      },
    ],
    NY: [
      {
        id: 'ny-lmhc-001',
        state: 'NY',
        licenseType: 'LMHC',
        requiredHours: 36,
        renewalPeriodMonths: 36,
        categories: [
          { name: 'Ethics', minHours: 6, required: true },
          { name: 'Infection Control', minHours: 3, required: true },
          { name: 'Child Abuse Reporting', minHours: 2, required: true },
          { name: 'General CE', minHours: 25, required: false },
        ],
        allowedProviders: ['NYSED', 'NAADAC'],
      },
    ],
    FL: [
      {
        id: 'fl-lmhc-001',
        state: 'FL',
        licenseType: 'LMHC',
        requiredHours: 35,
        renewalPeriodMonths: 24,
        categories: [
          { name: 'Ethics', minHours: 8, required: true },
          { name: 'Medical Errors', minHours: 2, required: true },
          { name: 'Domestic Violence', minHours: 3, required: true },
          { name: 'HIV/AIDS', minHours: 3, required: true },
          { name: 'General CE', minHours: 19, required: false },
        ],
        allowedProviders: ['CEBroker', 'NBCC'],
      },
    ],
    IL: [
      {
        id: 'il-lcpc-001',
        state: 'IL',
        licenseType: 'LCPC',
        requiredHours: 30,
        renewalPeriodMonths: 24,
        categories: [
          { name: 'Ethics', minHours: 6, required: true },
          { name: 'Clinical Supervision', minHours: 3, required: true },
          { name: 'General CE', minHours: 21, required: false },
        ],
        allowedProviders: ['NBCC', 'ISW'],
      },
    ],
  };

  /**
   * Retrieves the applicable rules for a specific state and license type.
   */
  getRules(state: string, licenseType: LicenseType): JurisdictionRule | null {
    const stateRules = this.rules[state.toUpperCase()] || [];
    return stateRules.find(rule => rule.licenseType === licenseType) || null;
  }

  /**
   * Validates if a set of CE credits meets the jurisdiction's requirements.
   * @param state - The state abbreviation.
   * @param licenseType - The user's license type.
   * @param credits - Array of completed CE credits with categories.
   * @returns An object indicating validity and any missing requirements.
   */
  validateCredits(
    state: string,
    licenseType: LicenseType,
    credits: Array<{ category: string; hours: number }>
  ): { isValid: boolean; missingRequirements: string[]; totalHours: number } {
    const rule = this.getRules(state, licenseType);
    if (!rule) {
      return { isValid: false, missingRequirements: ['Unknown jurisdiction/license combination'], totalHours: 0 };
    }

    const totalHours = credits.reduce((sum, credit) => sum + credit.hours, 0);
    const missingRequirements: string[] = [];

    // Check total hours
    if (totalHours < rule.requiredHours) {
      missingRequirements.push(`Total hours insufficient: ${totalHours}/${rule.requiredHours}`);
    }

    // Check category requirements
    rule.categories.forEach(cat => {
      if (cat.required) {
        const categoryHours = credits
          .filter(c => c.category.toLowerCase().includes(cat.name.toLowerCase()))
          .reduce((sum, c) => sum + c.hours, 0);

        if (categoryHours < cat.minHours) {
          missingRequirements.push(`${cat.name}: ${categoryHours}/${cat.minHours} hours`);
        }
      }
    });

    return {
      isValid: missingRequirements.length === 0,
      missingRequirements,
      totalHours,
    };
  }

  /**
   * Calculates the readiness score (0-100) based on progress and compliance.
   */
  calculateReadinessScore(
    state: string,
    licenseType: LicenseType,
    credits: Array<{ category: string; hours: number }>,
    daysUntilRenewal: number
  ): number {
    const validation = this.validateCredits(state, licenseType, credits);
    const rule = this.getRules(state, licenseType);

    if (!rule) return 0;

    // Base score from hour completion (50% weight)
    const hourProgress = Math.min(1, validation.totalHours / rule.requiredHours);
    const hourScore = hourProgress * 50;

    // Compliance score from category requirements (30% weight)
    const complianceScore = validation.isValid ? 30 : (30 - validation.missingRequirements.length * 10);

    // Time buffer score (20% weight) - higher score if plenty of time left
    let timeScore = 20;
    if (daysUntilRenewal < 30) timeScore = 5;
    else if (daysUntilRenewal < 60) timeScore = 10;
    else if (daysUntilRenewal < 90) timeScore = 15;

    const totalScore = Math.max(0, Math.min(100, hourScore + complianceScore + timeScore));
    return Math.round(totalScore);
  }
}

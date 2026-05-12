import { describe, it, expect } from 'vitest';
import { JurisdictionRuleEngine } from '@/lib/rules/jurisdiction-engine';

describe('JurisdictionRuleEngine', () => {
  const engine = new JurisdictionRuleEngine();

  describe('getRequirements', () => {
    it('should return California LCSW requirements', () => {
      const requirements = engine.getRequirements('CA', 'LCSW');

      expect(requirements.requiredHours).toBe(36);
      expect(requirements.renewalPeriodMonths).toBe(24);
      expect(requirements.specificRequirements).toContain('Law & Ethics');
    });

    it('should return Texas LPC requirements', () => {
      const requirements = engine.getRequirements('TX', 'LPC');

      expect(requirements.requiredHours).toBe(30);
      expect(requirements.specificRequirements).toContain('Ethics');
    });

    it('should return New York LMFT requirements', () => {
      const requirements = engine.getRequirements('NY', 'LMFT');

      expect(requirements.requiredHours).toBe(36);
      expect(requirements.specificRequirements).toContain('Infection Control');
    });

    it('should return Florida LMHC requirements', () => {
      const requirements = engine.getRequirements('FL', 'LMHC');

      expect(requirements.requiredHours).toBe(30);
      expect(requirements.specificRequirements).toContain('Medical Errors');
    });

    it('should return Illinois LCPC requirements', () => {
      const requirements = engine.getRequirements('IL', 'LCPC');

      expect(requirements.requiredHours).toBe(30);
      expect(requirements.specificRequirements).toContain('Sexual Harassment');
    });

    it('should return default requirements for unknown state', () => {
      const requirements = engine.getRequirements('XX', 'LPC');

      expect(requirements.requiredHours).toBe(20);
      expect(requirements.renewalPeriodMonths).toBe(24);
    });
  });

  describe('calculateReadinessScore', () => {
    it('should return 100 when CE hours meet requirement', () => {
      const score = engine.calculateReadinessScore(36, 36);
      expect(score).toBe(100);
    });

    it('should return proportional score when CE hours are partial', () => {
      const score = engine.calculateReadinessScore(18, 36);
      expect(score).toBe(50);
    });

    it('should cap at 100 when CE hours exceed requirement', () => {
      const score = engine.calculateReadinessScore(50, 36);
      expect(score).toBe(100);
    });

    it('should return 0 when no CE hours completed', () => {
      const score = engine.calculateReadinessScore(0, 36);
      expect(score).toBe(0);
    });
  });

  describe('validateCECredit', () => {
    it('should approve valid CE credit with required category', () => {
      const result = engine.validateCECredit({
        title: 'Ethics Training',
        hours: 3,
        category: 'Ethics',
        provider: 'APA',
        dateCompleted: new Date()
      }, 'CA', 'LCSW');

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn about low confidence OCR', () => {
      const result = engine.validateCECredit({
        title: 'Unknown Course',
        hours: 6,
        category: 'General',
        provider: 'Unknown',
        dateCompleted: new Date(),
        ocrConfidence: 45
      }, 'CA', 'LCSW');

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.stringContaining('confidence')
      );
    });

    it('should reject CE credit with future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const result = engine.validateCECredit({
        title: 'Future Course',
        hours: 6,
        category: 'Ethics',
        provider: 'APA',
        dateCompleted: futureDate
      }, 'CA', 'LCSW');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.stringContaining('future')
      );
    });
  });
});

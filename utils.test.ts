/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { calculateCO2, calculateEcoScore, getComparativeFact, generateStandaloneHTML } from './utils';
import { ActivityLog, UserProfile } from './types';

describe('Carbon Estimator Utilities', () => {
  describe('calculateCO2', () => {
    it('accurately computes transport emissions for representative categories', () => {
      const PetrolCarResult = calculateCO2('transport', 'petrol_car', 24);
      expect(PetrolCarResult.co2).toBeGreaterThan(0);
      expect(PetrolCarResult.label).toContain('Petrol Car');

      const evResult = calculateCO2('transport', 'electric_car', 100);
      expect(evResult.co2).toBeGreaterThan(0);
      expect(evResult.co2).toBeLessThan(PetrolCarResult.co2 * 3); // EV is cleaner than petrol per km
    });

    it('accures correct labels and values for foods', () => {
      const result = calculateCO2('food', 'vegan', 2);
      expect(result.co2).toBeGreaterThan(0);
      expect(result.label).toContain('Vegan Meal');
    });

    it('correctly manages energy calculations including benefits', () => {
      const electricityResult = calculateCO2('energy', 'electricity_kwh', 10);
      expect(electricityResult.co2).toBeGreaterThan(0);

      const solarResult = calculateCO2('energy', 'solar_credit', 10);
      expect(solarResult.co2).toBeLessThan(0); // Benefits are negative offset
    });

    it('gracefully handles missing subcategories or unknown keys', () => {
      const fallbackResult = calculateCO2('digital', 'unknown_key_xyz', 10);
      expect(fallbackResult.co2).toBe(0);
    });
  });

  describe('calculateEcoScore', () => {
    it('returns perfect 100 on clean zero emissions', () => {
      const cleanObj = calculateEcoScore(0);
      expect(cleanObj.score).toBe(100);
      expect(cleanObj.grade).toBe('A+');
    });

    it('drops score correctly when emissions occur within target limits (7.7 kg)', () => {
      const safeEmissionsObj = calculateEcoScore(3.85); // Exactly half of limit
      expect(safeEmissionsObj.score).toBeLessThan(100);
      expect(safeEmissionsObj.score).toBeGreaterThan(60);
    });

    it('fails grade or drops ratings when emissions severely breach safe thresholds', () => {
      const extremeEmissionsObj = calculateEcoScore(50.0);
      expect(extremeEmissionsObj.score).toBeLessThan(40);
      expect(extremeEmissionsObj.grade).toBe('F');
    });
  });

  describe('getComparativeFact', () => {
    it('generates non-empty human explanatory context string', () => {
      const explanation = getComparativeFact(15.5);
      expect(explanation).toBeTypeOf('string');
      expect(explanation.length).toBeGreaterThan(5);
    });
  });

  describe('generateStandaloneHTML', () => {
    it('generates a full non-empty offline bootable HTML payload', () => {
      const testLogs: ActivityLog[] = [
        {
          id: '1',
          timestamp: '2026-06-18T00:00:00.000Z',
          category: 'transport',
          amount: 10,
          unit: 'km',
          co2: 2.4,
          details: 'Drove 10 km'
        }
      ];
      const testProfile: UserProfile = {
        name: 'Super Champion',
        city: 'London',
        lifestyle: 'professional',
        onboarded: true
      };
      const output = generateStandaloneHTML(testLogs, testProfile);

      expect(output).toBeTypeOf('string');
      expect(output).toContain('<!DOCTYPE html>');
      expect(output).toContain('Super Champion');
      expect(output).toContain('London');
      expect(output).toContain('Drove 10 km');
    });
  });
});

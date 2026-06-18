/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  city: string;
  lifestyle: 'student' | 'professional' | 'homemaker';
  onboarded: boolean;
}

export type ActivityCategory = 'transport' | 'food' | 'energy' | 'shopping' | 'flights' | 'digital';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO String
  category: ActivityCategory;
  amount: number;
  unit: string;
  co2: number; // in kg CO2
  details: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null; // null if locked
  requirement: string;
  icon: string; // Lucide icon name
  category: ActivityCategory | 'streak' | 'general';
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  rewardPoints: number;
}

export interface CityData {
  name: string;
  transportTip: string;
  altEnergyTip: string;
  averageComp: string;
}

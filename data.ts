/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Badge, CityData, WeeklyChallenge } from './types';

// Standard emission factors based on Indian grid intensity and averages
// Unit of measurement specified. Values in kg CO2 per unit.
export const EMISSION_FACTORS = {
  transport: {
    petrol_car: 0.18,      // per km
    diesel_car: 0.20,      // per km
    electric_car: 0.05,    // per km (accounts for highly solar/coal mix of India gridding)
    two_wheeler: 0.07,     // per km (bikes/scooter)
    auto_rickshaw: 0.09,   // per km
    metro_train: 0.02,     // per km
    local_train: 0.015,    // per km
    bus_transit: 0.025,    // per km
  },
  food: {
    vegan: 0.45,           // per meal
    vegetarian: 0.95,      // per meal (includes cheese, paneer, ghee)
    dairy_eggs: 1.40,      // per meal (egg/dairy heavy)
    poultry_fish: 2.30,    // per meal
    heavy_meat: 5.50,      // per meal (e.g., mutton, heavy meats)
  },
  energy: {
    electricity_kwh: 0.82,  // per kWh (Indian grid average)
    ac_hour: 0.75,         // per hour of AC (approx 1 ton 3-star AC running)
    lpg_day: 1.25,         // per day of standard cooking LPG usage
    solar_credit: -0.82,   // credit per kWh generated
  },
  shopping: {
    clothing: 10.50,       // per fast fashion item purchased
    packaging_box: 0.85,    // per online commerce delivery package
    smartphone: 55.00,     // per new electronic device/phone
    plastic_bottle: 0.24,  // per single-use plastic bottle bought
  },
  flights: {
    domestic: 130.00,      // per hour (short-haul, e.g. Mumbai to Delhi)
    international: 110.00, // per hour (long-haul)
  },
  digital: {
    streaming_hd: 0.10,    // per hour of HD video streaming (devices + servers)
    ai_prompt: 0.002,      // per AI query generated (e.g. LLM prompts)
    video_call: 0.06,      // per hour of high-quality Zoom/Meet call
  }
};

export const CITIES_DATA: Record<string, CityData> = {
  mumbai: {
    name: "Mumbai",
    transportTip: "Take the iconic BEST electric buses or the local trains over private taxis. They represent some of the most power-efficient transit options in Pune & Maharashtra!",
    altEnergyTip: "Many Mumbai high-rises are adopting solar grid systems. Ask your housing society about rooftop net metering.",
    averageComp: "Your monthly carbon emissions are equivalent to driving the Bandra-Worli Sea Link 12 times."
  },
  delhi: {
    name: "Delhi",
    transportTip: "Swap driving for the clean, highly integrated Delhi Metro! Parts of the network run directly on solar energy generated at Rewa.",
    altEnergyTip: "Delhi's extreme summers push air conditioner loads. Set your temperature to 24°C to save 6-8% energy per degree.",
    averageComp: "Your monthly footprint is equivalent to the cooling energy needed for 4 entire residential cooling towers."
  },
  pune: {
    name: "Pune",
    transportTip: "Pune is expanding its dedicated cycle lanes around BMCC/JM road. Consider pedaling or take Pune Mahanagar Parivahan electric buses.",
    altEnergyTip: "Pune gets supreme solar insulation. Installing a solar water heater on your terrace pays off in less than 2 years!",
    averageComp: "Your emissions savings are equivalent to protecting the direct carbon sink of the beautiful Tekdi hills!"
  },
  bangalore: {
    name: "Bangalore",
    transportTip: "Use the Namma Metro for your office commute to avoid heavy gridlock and save over 80% emissions compared to single cabs.",
    altEnergyTip: "Take advantage of Bangalore's moderate climate—opening windows for cross-ventilation instead of running continuous fans or ACs.",
    averageComp: "Your monthly savings keep the Garden City clean and help prevent heavy urban-heat island traps."
  },
  chennai: {
    name: "Chennai",
    transportTip: "Hop onto the Chennai Suburban Railway or the MRTS. Share rides with app-based electric scooters for short-distance routes.",
    altEnergyTip: "To beat Chennai's coastal heat, apply cool-reflective white paint on your terrace to drop indoor temps by up to 5°C.",
    averageComp: "Your carbon reduction plays a direct role in minimizing local thermal pollution along the Coromandel Coast."
  },
  hyderabad: {
    name: "Hyderabad",
    transportTip: "Take the Hyderabad Metro Rail or TSRTC's new fleet of direct electric luxury airport buses.",
    altEnergyTip: "Hyderabad has immense solar potential. Check the solar rooftop subsidy with TSSPDCL to offset home energy completely.",
    averageComp: "Your carbon-saving journey keeps Hyderabad's historic rock formations and green zones clean!"
  },
  other: {
    name: "Other City",
    transportTip: "Opt for public electric buses, carpools, or walk/cycle for any distance under 2 kilometers.",
    altEnergyTip: "Switch to 5-star BEE rated appliances and ensure your geysers are turned off right after heating.",
    averageComp: "Every kilogram of CO2 you save helps India match its net-zero goals ahead of the 2070 target!"
  }
};

export const INITIAL_BADGES: Badge[] = [
  {
    id: "green_commuter",
    title: "Eco Commuter",
    description: "Logged transit via clean local train, metro, or EV and kept transit emissions near zero.",
    unlockedAt: null,
    requirement: "Log transport with metro, train, or EV for more than 50km total, or log a low-carbon transport entry.",
    icon: "Train",
    category: "transport"
  },
  {
    id: "plant_hero",
    title: "Plant-Based Ally",
    description: "Logged entirely plant-based meals (Vegan or Vegetarian) for a full cycle.",
    unlockedAt: null,
    requirement: "Log 3 vegan or vegetarian meals in a single day or log 5 total vegetarian meals.",
    icon: "Leaf",
    category: "food"
  },
  {
    id: "energy_saver",
    title: "Grid Guardian",
    description: "Logged a daily solar credit or kept electricity/AC logs highly minimal.",
    unlockedAt: null,
    requirement: "Power usage logged under average, or logged solar generation credit.",
    icon: "Zap",
    category: "energy"
  },
  {
    id: "digital_minimalist",
    title: "Byte Sized Footprint",
    description: "Kept streaming hours minimal and controlled digital footprint.",
    unlockedAt: null,
    requirement: "Stream under 2 hours daily or log digital activities under 0.5 kg CO2.",
    icon: "Cpu",
    category: "digital"
  },
  {
    id: "zero_champion",
    title: "Carbon Hero",
    description: "Achieved an Eco Score of 85+ (Grade A) with consistent activity reporting.",
    unlockedAt: null,
    requirement: "Reach an overall Eco Score of 85 or above with at least 5 logged logs.",
    icon: "ShieldAlert", // replaced later with dynamic badge check
    category: "general"
  }
];

export const INITIAL_CHALLENGES: WeeklyChallenge[] = [
  {
    id: "chal_meatless_mon",
    title: "Meatless Commits",
    description: "Log at least 3 vegan/vegetarian meals this week to bypass dairy & poultry footprint.",
    category: "food",
    targetCount: 3,
    currentCount: 0,
    completed: false,
    rewardPoints: 20
  },
  {
    id: "chal_metro_ride",
    title: "Suburban Transit",
    description: "Complete 20 km of travel utilizing Metro, Local Train, or walking instead of personal cars.",
    category: "transport",
    targetCount: 20,
    currentCount: 0,
    completed: false,
    rewardPoints: 25
  },
  {
    id: "chal_digital_diet",
    title: "Digital Forest Breath",
    description: "Keep total online streaming logged hours under 5 hours this week.",
    category: "digital",
    targetCount: 5,
    currentCount: 0,
    completed: false,
    rewardPoints: 15
  },
  {
    id: "chal_cool_planet",
    title: "AC Energy Saver",
    description: "Keep private high-energy AC usage under 4 hours logged.",
    category: "energy",
    targetCount: 4,
    currentCount: 0,
    completed: false,
    rewardPoints: 20
  }
];

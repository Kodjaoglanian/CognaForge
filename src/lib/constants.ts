import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Brain,
  Swords,
  Lightbulb,
  Trophy,
  MessageCircleQuestion,
  Settings, // Added for potential future settings page
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    title: 'Cognitive Battles',
    href: '/cognitive-battle',
    icon: Brain,
    label: 'Battles',
  },
  {
    title: 'Argument Duels',
    href: '/argument-duel',
    icon: Swords,
    label: 'Duels',
  },
  {
    title: 'Knowledge Construction',
    href: '/knowledge-construction',
    icon: Lightbulb,
    label: 'Construct',
  },
  {
    title: 'Boss Levels',
    href: '/boss-level',
    icon: Trophy,
    label: 'Bosses',
  },
  {
    title: 'Socratic Mode',
    href: '/socratic-mode',
    icon: MessageCircleQuestion,
    label: 'Socratic',
  },
];

export const APP_NAME = "CognaForge";

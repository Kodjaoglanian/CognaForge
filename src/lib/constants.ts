
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Brain,
  Swords,
  Lightbulb,
  Trophy,
  MessageCircleQuestion,
  Settings,
  Puzzle,
  Briefcase,
  GraduationCap, // Novo ícone para Clarificador de Conceitos
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
    title: 'Painel Principal',
    href: '/',
    icon: LayoutDashboard,
    label: 'Painel',
  },
  {
    title: 'Clarificador de Conceitos',
    href: '/concept-clarifier',
    icon: GraduationCap,
    label: 'Clarificar',
  },
  {
    title: 'Batalhas Cognitivas',
    href: '/cognitive-battle',
    icon: Brain,
    label: 'Batalhas',
  },
  {
    title: 'Duelos Argumentativos',
    href: '/argument-duel',
    icon: Swords,
    label: 'Duelos',
  },
  {
    title: 'Construção de Conhecimento',
    href: '/knowledge-construction',
    icon: Lightbulb,
    label: 'Construir',
  },
  {
    title: 'Níveis Desafiadores',
    href: '/boss-level',
    icon: Trophy,
    label: 'Desafios',
  },
  {
    title: 'Modo Socrático',
    href: '/socratic-mode',
    icon: MessageCircleQuestion,
    label: 'Socrático',
  },
  {
    title: 'Simulador de Entrevistas',
    href: '/interview-simulator',
    icon: Briefcase,
    label: 'Entrevistas',
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: Settings,
    label: 'Ajustes',
  },
];

export const APP_NAME = "CognaForge";


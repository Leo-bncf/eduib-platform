import {
  LayoutDashboard, Users, BarChart3, FileText, Star, BookOpen
} from 'lucide-react';

/**
 * Build coordinator sidebar links dynamically based on curriculum config.
 * - Hides "IB Core" tab for non-IB-DP curricula
 * - Renames "Predicted Grades" based on curriculum
 */
export function getCoordinatorSidebarLinks(curriculum, config) {
  const isIBDP = curriculum === 'ib_dp';
  const features = config?.features || {};

  const links = [
    { label: 'Dashboard',        page: 'CoordinatorDashboard',      icon: LayoutDashboard },
    { label: 'Cohorts',          page: 'CoordinatorDashboard',       icon: Users },
    { label: 'Subjects',         page: 'SchoolAdminSubjects',        icon: BookOpen },
  ];

  if (features.predictedGrades) {
    links.push({
      label: isIBDP ? 'Predicted Grades' : 'Grade Forecasts',
      page: 'CoordinatorPredictedGrades',
      icon: BarChart3,
    });
  }

  links.push({ label: 'Reporting', page: 'CoordinatorDashboard', icon: FileText });

  if (features.coreModules) {
    links.push({
      label: isIBDP ? 'IB Core' : 'Core Programme',
      page: 'CoordinatorIBCore',
      icon: Star,
    });
  }

  return links;
}
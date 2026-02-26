// Plan-based feature definitions and limits
export const PLAN_LIMITS = {
  starter: {
    max_users: 100,
    max_classes: 50,
    max_students_per_class: 30,
    modules: ['core', 'gradebook', 'assignments', 'attendance'],
    features: {
      parent_portal: false,
      timetable_integration: false,
      advanced_analytics: false,
      predicted_grades: false,
      rubric_grading: false,
      bulk_operations: false,
      api_access: false,
      custom_reports: false,
      audit_logs: false,
    },
  },
  professional: {
    max_users: 500,
    max_classes: 200,
    max_students_per_class: 50,
    modules: ['core', 'gradebook', 'assignments', 'attendance', 'ib_core', 'behavior', 'messaging'],
    features: {
      parent_portal: true,
      timetable_integration: true,
      advanced_analytics: true,
      predicted_grades: true,
      rubric_grading: true,
      bulk_operations: true,
      api_access: false,
      custom_reports: true,
      audit_logs: true,
    },
  },
  enterprise: {
    max_users: -1, // unlimited
    max_classes: -1,
    max_students_per_class: -1,
    modules: ['core', 'gradebook', 'assignments', 'attendance', 'ib_core', 'behavior', 'messaging', 'timetable'],
    features: {
      parent_portal: true,
      timetable_integration: true,
      advanced_analytics: true,
      predicted_grades: true,
      rubric_grading: true,
      bulk_operations: true,
      api_access: true,
      custom_reports: true,
      audit_logs: true,
    },
  },
};

export const PLAN_NAMES = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

export const PLAN_PRICES = {
  starter: 99,
  professional: 299,
  enterprise: 799,
};

// Check if a school can access a specific feature
export function canAccessFeature(plan, feature) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
  return limits.features[feature] === true;
}

// Check if a school can access a specific module
export function canAccessModule(plan, module) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
  return limits.modules.includes(module);
}

// Get limit value for a plan
export function getPlanLimit(plan, limitKey) {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
  return limits[limitKey];
}

// Check if school is within limits
export function isWithinLimit(plan, limitKey, currentValue) {
  const limit = getPlanLimit(plan, limitKey);
  if (limit === -1) return true; // unlimited
  return currentValue < limit;
}

// Get all available plans for upgrade
export function getUpgradePlans(currentPlan) {
  const planOrder = ['starter', 'professional', 'enterprise'];
  const currentIndex = planOrder.indexOf(currentPlan);
  return planOrder.slice(currentIndex + 1);
}
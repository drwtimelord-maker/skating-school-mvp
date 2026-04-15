/**
 * feedbackUtils.js
 * Pure helper functions for the feedback evaluation flow.
 * Extracted to be independently testable without Supabase.
 */

/**
 * Determines the redirect path based on a user's role.
 * @param {string} role - 'instructor' | 'admin'
 * @returns {string} Route path
 */
export function getRoleRedirect(role) {
  if (role === 'admin') return '/admin/reports';
  if (role === 'instructor') return '/instructor';
  if (role === 'parent') return '/parent';
  return '/login';
}

/**
 * Builds the skill results payload ready to insert into feedback_skill_results.
 * Only includes skills that have been explicitly rated (not null).
 * @param {Array} skillList   - Skills from the database [{id, name}]
 * @param {Object} skillValues - Map of skillId → 'pass' | 'not_yet' | null
 * @param {string} reportId   - The parent feedback_report UUID
 * @returns {Array} Rows ready for Supabase insert
 */
export function buildSkillResultsPayload(skillList, skillValues, reportId) {
  return skillList
    .filter(skill => skillValues[skill.id] !== null && skillValues[skill.id] !== undefined)
    .map(skill => ({
      report_id: reportId,
      skill_id: skill.id,
      pass_status: skillValues[skill.id],
    }));
}

/**
 * Validates that at least one skill has been rated before saving.
 * @param {Object} skillValues - Map of skillId → value
 * @returns {{ valid: boolean, message: string }}
 */
export function validateFeedbackForm(skillValues) {
  const rated = Object.values(skillValues).filter(v => v !== null && v !== undefined);
  if (rated.length === 0) {
    return { valid: false, message: 'Please rate at least one skill before saving.' };
  }
  return { valid: true, message: '' };
}

/**
 * Returns a human-readable label for a pass_status value.
 * @param {string} status - 'pass' | 'not_yet'
 * @returns {string}
 */
export function formatPassStatus(status) {
  if (status === 'pass') return 'Pass ✓';
  if (status === 'not_yet') return 'Not Yet';
  return 'Unrated';
}

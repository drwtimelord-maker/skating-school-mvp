import { describe, it, expect } from 'vitest';
import {
  getRoleRedirect,
  buildSkillResultsPayload,
  validateFeedbackForm,
  formatPassStatus,
} from '../utils/feedbackUtils';

// ─── getRoleRedirect ──────────────────────────────────────────────────────────
describe('getRoleRedirect', () => {
  it('redirects admin to /admin/reports', () => {
    expect(getRoleRedirect('admin')).toBe('/admin/reports');
  });

  it('redirects instructor to /instructor', () => {
    expect(getRoleRedirect('instructor')).toBe('/instructor');
  });

  it('redirects unknown roles to /login', () => {
    expect(getRoleRedirect('unknown')).toBe('/login');
    expect(getRoleRedirect('')).toBe('/login');
    expect(getRoleRedirect(null)).toBe('/login');
  });
});

// ─── buildSkillResultsPayload ─────────────────────────────────────────────────
describe('buildSkillResultsPayload', () => {
  const REPORT_ID = 'report-uuid-123';
  const SKILLS = [
    { id: 'skill-1', name: 'Forward Edges' },
    { id: 'skill-2', name: 'Back Crossovers' },
    { id: 'skill-3', name: 'Spiral Sequence' },
  ];

  it('returns only skills that were rated', () => {
    const values = { 'skill-1': 'pass', 'skill-2': null, 'skill-3': 'not_yet' };
    const result = buildSkillResultsPayload(SKILLS, values, REPORT_ID);
    expect(result).toHaveLength(2);
  });

  it('attaches the correct report_id to every row', () => {
    const values = { 'skill-1': 'pass', 'skill-2': 'not_yet', 'skill-3': 'pass' };
    const result = buildSkillResultsPayload(SKILLS, values, REPORT_ID);
    result.forEach(row => expect(row.report_id).toBe(REPORT_ID));
  });

  it('maps pass_status correctly', () => {
    const values = { 'skill-1': 'pass', 'skill-2': 'not_yet', 'skill-3': null };
    const result = buildSkillResultsPayload(SKILLS, values, REPORT_ID);
    expect(result[0]).toMatchObject({ skill_id: 'skill-1', pass_status: 'pass' });
    expect(result[1]).toMatchObject({ skill_id: 'skill-2', pass_status: 'not_yet' });
  });

  it('returns empty array when no skills rated', () => {
    const values = { 'skill-1': null, 'skill-2': null, 'skill-3': null };
    const result = buildSkillResultsPayload(SKILLS, values, REPORT_ID);
    expect(result).toHaveLength(0);
  });
});

// ─── validateFeedbackForm ─────────────────────────────────────────────────────
describe('validateFeedbackForm', () => {
  it('is invalid when no skills are rated', () => {
    const result = validateFeedbackForm({ 'skill-1': null, 'skill-2': null });
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it('is valid when at least one skill is rated', () => {
    const result = validateFeedbackForm({ 'skill-1': 'pass', 'skill-2': null });
    expect(result.valid).toBe(true);
    expect(result.message).toBe('');
  });

  it('is valid when all skills are rated', () => {
    const result = validateFeedbackForm({ 'skill-1': 'pass', 'skill-2': 'not_yet' });
    expect(result.valid).toBe(true);
  });
});

// ─── formatPassStatus ─────────────────────────────────────────────────────────
describe('formatPassStatus', () => {
  it('formats pass correctly', () => {
    expect(formatPassStatus('pass')).toBe('Pass ✓');
  });

  it('formats not_yet correctly', () => {
    expect(formatPassStatus('not_yet')).toBe('Not Yet');
  });

  it('returns Unrated for null or unknown values', () => {
    expect(formatPassStatus(null)).toBe('Unrated');
    expect(formatPassStatus('')).toBe('Unrated');
    expect(formatPassStatus('something_else')).toBe('Unrated');
  });
});

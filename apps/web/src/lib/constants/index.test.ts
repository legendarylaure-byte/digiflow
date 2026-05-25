import { describe, it, expect } from 'vitest';
import { ROLES, DOCUMENT_STATUSES, DOCUMENT_TYPES, ALLOWED_FILE_TYPES } from '@digiflow/shared/constants/index';

describe('ROLES', () => {
  it('has admin role', () => {
    expect(ROLES.find((r) => r.value === 'admin')).toBeTruthy();
  });

  it('has 6 roles', () => {
    expect(ROLES.length).toBe(6);
  });

  it('all roles have value and label', () => {
    ROLES.forEach((r) => {
      expect(r.value).toBeTruthy();
      expect(r.label).toBeTruthy();
    });
  });
});

describe('DOCUMENT_STATUSES', () => {
  it('has 4 statuses', () => {
    expect(DOCUMENT_STATUSES.length).toBe(4);
  });

  it('each status has color', () => {
    DOCUMENT_STATUSES.forEach((s) => {
      expect(s.color).toMatch(/^#/);
    });
  });
});

describe('DOCUMENT_TYPES', () => {
  it('includes common types', () => {
    expect(DOCUMENT_TYPES).toContain('Invoice');
    expect(DOCUMENT_TYPES).toContain('Contract');
  });
});

describe('ALLOWED_FILE_TYPES', () => {
  it('includes PDF', () => {
    expect(ALLOWED_FILE_TYPES).toContain('application/pdf');
  });
});

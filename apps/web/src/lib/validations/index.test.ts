import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  documentUploadSchema,
  approveActionSchema,
} from '@digiflow/shared/validations/index';

describe('loginSchema', () => {
  it('accepts valid input', () => {
    expect(loginSchema.parse({ email: 'user@test.com', password: '123456' })).toBeTruthy();
  });

  it('rejects invalid email', () => {
    expect(() => loginSchema.parse({ email: 'invalid', password: '123456' })).toThrow();
  });

  it('rejects short password', () => {
    expect(() => loginSchema.parse({ email: 'user@test.com', password: '12345' })).toThrow();
  });
});

describe('registerSchema', () => {
  const valid = {
    name: 'Test User',
    email: 'user@test.com',
    password: 'password123',
    confirmPassword: 'password123',
    company: 'Test Corp',
    department: 'Engineering',
  };

  it('accepts valid input', () => {
    expect(registerSchema.parse(valid)).toBeTruthy();
  });

  it('rejects mismatched passwords', () => {
    expect(() => registerSchema.parse({ ...valid, confirmPassword: 'different' })).toThrow();
  });

  it('rejects short name', () => {
    expect(() => registerSchema.parse({ ...valid, name: 'A' })).toThrow();
  });
});

describe('approveActionSchema', () => {
  it('accepts valid approve action', () => {
    expect(approveActionSchema.parse({ documentId: 'abc123', action: 'approve' })).toBeTruthy();
  });

  it('accepts action with comment', () => {
    expect(approveActionSchema.parse({ documentId: 'abc123', action: 'return', comment: 'Fix this' })).toBeTruthy();
  });

  it('rejects invalid action', () => {
    expect(() => approveActionSchema.parse({ documentId: 'abc123', action: 'invalid' })).toThrow();
  });
});

describe('documentUploadSchema', () => {
  const valid = {
    name: 'Test Document',
    documentType: 'Invoice',
    department: 'Finance',
    fiscalYear: '2024-25',
    recommenders: [{ uid: 'u1', name: 'Rec 1', email: 'rec1@test.com' }],
    approver: { uid: 'u2', name: 'App 1', email: 'app1@test.com' },
  };

  it('accepts valid input', () => {
    expect(documentUploadSchema.parse(valid)).toBeTruthy();
  });

  it('rejects empty name', () => {
    expect(() => documentUploadSchema.parse({ ...valid, name: '' })).toThrow();
  });

  it('rejects empty recommenders', () => {
    expect(() => documentUploadSchema.parse({ ...valid, recommenders: [] })).toThrow();
  });
});

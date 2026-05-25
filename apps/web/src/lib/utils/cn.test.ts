import { describe, it, expect } from 'vitest';
import { cn, formatFileSize, getFileExtension, truncate } from './cn';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('merges tailwind conflicts', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('handles undefined values', () => {
    expect(cn('px-4', undefined, 'py-2')).toBe('px-4 py-2');
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(512)).toBe('512 Bytes');
  });

  it('formats KB', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('formats MB', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
  });

  it('formats GB', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });
});

describe('getFileExtension', () => {
  it('returns lowercase extension', () => {
    expect(getFileExtension('document.PDF')).toBe('pdf');
  });

  it('returns extension for dotted names', () => {
    expect(getFileExtension('my.file.name.docx')).toBe('docx');
  });

  it('returns filename when no dot present', () => {
    expect(getFileExtension('README')).toBe('readme');
  });
});

describe('truncate', () => {
  it('returns string if shorter than length', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates with ellipsis', () => {
    expect(truncate('hello world this is long', 10)).toBe('hello worl...');
  });
});

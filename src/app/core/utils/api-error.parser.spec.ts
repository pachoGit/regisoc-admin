import { HttpErrorResponse } from '@angular/common/http';
import { parseApiError } from './api-error.parser';

describe('parseApiError', () => {
  it('handles network / offline errors (status 0)', () => {
    const err = new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' });
    const parsed = parseApiError(err);

    expect(parsed.status).toBe(0);
    expect(parsed.title).toBe('Error de conexión');
  });

  it('parses RFC 7807 ProblemDetail with detail message', () => {
    const err = new HttpErrorResponse({
      status: 409,
      error: {
        title: 'Conflict',
        status: 409,
        detail: 'El club ya está inscrito en el evento',
      },
    });
    const parsed = parseApiError(err);

    expect(parsed.status).toBe(409);
    expect(parsed.title).toBe('Conflict');
    expect(parsed.message).toBe('El club ya está inscrito en el evento');
  });

  it('parses validation field errors from ProblemDetail', () => {
    const err = new HttpErrorResponse({
      status: 400,
      error: {
        title: 'Validation Failed',
        status: 400,
        detail: 'One or more fields are invalid',
        errors: {
          endDate: 'must be a future date',
        },
      },
    });
    const parsed = parseApiError(err);

    expect(parsed.fieldErrors['endDate']).toBe('must be a future date');
    expect(parsed.message).toContain('endDate: must be a future date');
  });

  it('handles plain Error instances', () => {
    const parsed = parseApiError(new Error('Solo administradores'));
    expect(parsed.message).toBe('Solo administradores');
  });
});

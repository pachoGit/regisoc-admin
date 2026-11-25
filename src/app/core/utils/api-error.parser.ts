import { HttpErrorResponse } from '@angular/common/http';
import { ParsedApiError, ProblemDetail } from '../models/api-error.model';

export function parseApiError(error: unknown): ParsedApiError {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return {
        status: 0,
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.',
        fieldErrors: {},
      };
    }

    const body = error.error as ProblemDetail | string | null;

    if (body && typeof body === 'object') {
      const fieldErrors = body.errors ?? {};
      const fieldMessages = Object.entries(fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(' • ');

      return {
        status: body.status ?? error.status,
        title: body.title ?? defaultTitleForStatus(error.status),
        message: fieldMessages || body.detail || defaultMessageForStatus(error.status),
        fieldErrors,
      };
    }

    return {
      status: error.status,
      title: defaultTitleForStatus(error.status),
      message: typeof body === 'string' && body.trim() ? body : defaultMessageForStatus(error.status),
      fieldErrors: {},
    };
  }

  if (error instanceof Error) {
    return {
      status: -1,
      title: 'Error inesperado',
      message: error.message,
      fieldErrors: {},
    };
  }

  return {
    status: -1,
    title: 'Error inesperado',
    message: 'Ha ocurrido un error inesperado.',
    fieldErrors: {},
  };
}

function defaultTitleForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Solicitud inválida';
    case 401:
      return 'No autorizado';
    case 403:
      return 'Acceso denegado';
    case 404:
      return 'No encontrado';
    case 409:
      return 'Conflicto';
    default:
      return 'Error del servidor';
  }
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Revisa los datos ingresados e intenta nuevamente.';
    case 401:
      return 'Tu sesión ha expirado o las credenciales no son válidas.';
    case 403:
      return 'No tienes permisos para realizar esta acción.';
    case 404:
      return 'El recurso solicitado no existe.';
    case 409:
      return 'La operación entra en conflicto con el estado actual.';
    default:
      return 'Ocurrió un error al procesar la solicitud.';
  }
}

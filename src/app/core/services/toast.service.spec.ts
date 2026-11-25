import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('adds and dismisses toasts', () => {
    const id = service.show('success', 'Guardado', 'Registro exitoso', 0);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].title).toBe('Guardado');

    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  });
});

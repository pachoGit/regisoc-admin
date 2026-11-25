import { getStatusPresentation } from './status-presentation';

describe('getStatusPresentation', () => {
  it('returns proper Spanish labels and tones for domain statuses', () => {
    expect(getStatusPresentation('UPCOMING')).toEqual({
      label: 'Programado',
      tone: 'sky',
      dot: true,
    });
    expect(getStatusPresentation('ONGOING')).toEqual({
      label: 'En curso',
      tone: 'amber',
      dot: true,
    });
    expect(getStatusPresentation('CLOSE')).toEqual({
      label: 'Cerrada',
      tone: 'emerald',
      dot: true,
    });
    expect(getStatusPresentation('CLUB_MANAGER')).toEqual({
      label: 'Gestor de Club',
      tone: 'emerald',
    });
  });

  it('returns fallback presentation for null or unknown values', () => {
    expect(getStatusPresentation(null).label).toBe('Sin definir');
    expect(getStatusPresentation('CUSTOM_STATE')).toEqual({
      label: 'CUSTOM_STATE',
      tone: 'slate',
    });
  });
});

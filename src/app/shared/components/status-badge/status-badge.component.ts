import { Component, computed, input } from '@angular/core';
import {
  BADGE_TONE_CLASSES,
  getStatusPresentation,
} from '../../../core/utils/status-presentation';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  readonly status = input<string | null | undefined>(null);
  readonly customLabel = input<string | null>(null);

  protected readonly presentation = computed(() => getStatusPresentation(this.status()));
  protected readonly toneClasses = computed(
    () => BADGE_TONE_CLASSES[this.presentation().tone]
  );
  protected readonly label = computed(
    () => this.customLabel() ?? this.presentation().label
  );
}

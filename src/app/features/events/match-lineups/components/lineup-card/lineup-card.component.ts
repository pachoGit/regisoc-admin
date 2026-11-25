import { Component, input, output } from '@angular/core';
import { Lineup } from '../../../../../core/models/lineup.model';
import { DocumentPerson } from '../../../../../core/models/roster.model';
import { StatusBadgeComponent } from '../../../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-lineup-card',
  standalone: true,
  imports: [StatusBadgeComponent],
  templateUrl: './lineup-card.component.html',
  styleUrl: './lineup-card.component.scss',
})
export class LineupCardComponent {
  readonly sideLabel = input.required<string>();
  readonly sideTone = input<'emerald' | 'sky'>('emerald');
  readonly clubName = input.required<string>();
  readonly lineup = input<Lineup | null>(null);
  readonly closing = input<boolean>(false);

  readonly closeRequested = output<Lineup>();
  readonly inspectPerson = output<{ person: DocumentPerson; roleLabel: string }>();
}

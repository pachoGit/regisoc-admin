import { Component, input, output } from '@angular/core';
import { DocumentPerson } from '../../../core/models/roster.model';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-document-viewer-modal',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './document-viewer-modal.component.html',
  styleUrl: './document-viewer-modal.component.scss',
})
export class DocumentViewerModalComponent {
  readonly person = input<DocumentPerson | null>(null);
  readonly roleLabel = input<string>('Integrante');
  readonly closed = output<void>();
}

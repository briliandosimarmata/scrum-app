import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-draggable-modal',
  imports: [CommonModule, DragDropModule],
  templateUrl: './draggable-modal.html',
  styleUrls: ['./draggable-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraggableModal {
  // Inputs
  isVisible = input<boolean>(false);
  title = input<string>('');
  subtitle = input<string>('');
  closeOnBackdropClick = input<boolean>(true);
  widthClass = input<string>('max-w-4xl');
  
  // Computed
  modalClasses = computed(() => 
    `relative pb-6 top-10 mx-auto w-full ${this.widthClass()} max-h-[90vh] shadow-2xl rounded-xl bg-white cursor-grab border border-gray-200 flex flex-col`
  );
  
  // Outputs
  onClose = output<void>();
  onOpen = output<void>();
  onDragStart = output<void>();
  onDragEnd = output<void>();

  onBackdropClick(): void {
    if (this.closeOnBackdropClick()) {
      this.onClose.emit();
    }
  }

  onModalClick(event: Event): void {
    // Prevent backdrop click when clicking on modal content
    event.stopPropagation();
  }

  onDragStarted(): void {
    this.onDragStart.emit();
  }

  onDragEnded(): void {
    this.onDragEnd.emit();
  }
}

import { Component, input, output, ChangeDetectionStrategy, signal, computed, inject, ViewChild, TemplateRef, ElementRef, OnDestroy, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { TaskStatus, TaskPriority, DropdownOption, DropdownConfig } from '../../interfaces';

@Component({
  selector: 'app-dropdown',
  imports: [CommonModule],
  templateUrl: './dropdown.html',
  styles: [`
    .custom-dropdown-option {
      padding: 8px 12px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .custom-dropdown-option:hover {
      background-color: #f3f4f6;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent implements OnDestroy {
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  
  // ViewChild for template reference
  @ViewChild('dropdownPanel', { static: false }) dropdownPanel!: TemplateRef<any>;
  @ViewChild('trigger', { static: false }) trigger!: ElementRef<HTMLElement>;

  // Inputs
  options = input.required<DropdownOption[]>();
  selectedValue = input<string | number | null>(null);
  config = input.required<DropdownConfig>();
  isDisabled = input<boolean>(false);

  // Outputs
  valueSelected = output<string | number | null>();

  // Internal state
  isOpen = signal<boolean>(false);
  searchTerm = signal<string>('');
  private overlayRef: OverlayRef | null = null;

  // Computed properties
  filteredOptions = computed(() => {
    const options = this.options();
    const searchTerm = this.searchTerm().toLowerCase();
    
    if (!searchTerm) return options;
    
    return options.filter(option => 
      option.name.toLowerCase().includes(searchTerm) ||
      (option.displayName && option.displayName.toLowerCase().includes(searchTerm))
    );
  });

  selectedOption = computed(() => {
    const selectedValue = this.selectedValue();
    return this.options().find(option => option.id === selectedValue);
  });

  displayText = computed(() => {
    const selected = this.selectedOption();
    if (selected) {
      return selected.displayName || selected.name;
    }
    return this.config().placeholder || 'Select...';
  });

  // Methods
  toggleDropdown(): void {
    if (this.isDisabled()) return;
    
    if (this.isOpen()) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown(): void {
    if (this.overlayRef) return;

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.trigger.nativeElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 4
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -4
        }
      ])
      .withFlexibleDimensions(true)
      .withPush(true);

    const scrollStrategy = this.overlay.scrollStrategies.reposition();

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    const portal = new TemplatePortal(this.dropdownPanel, this.viewContainerRef);
    this.overlayRef.attach(portal);

    this.overlayRef.backdropClick().subscribe(() => {
      this.closeDropdown();
    });

    this.isOpen.set(true);
    this.searchTerm.set('');
  }

  closeDropdown(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.isOpen.set(false);
    this.searchTerm.set('');
  }

  selectOption(option: DropdownOption): void {
    this.valueSelected.emit(option.id);
    this.closeDropdown();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  ngOnDestroy(): void {
    this.closeDropdown();
  }
}

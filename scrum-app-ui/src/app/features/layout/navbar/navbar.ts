import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../../core/services/layout.service';
import { ConnectionStatusService } from '../../../core/services/connection-status.service';
import { UserMenuWidgetComponent } from '../../../shared/components/user-menu-widget/user-menu-widget';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, UserMenuWidgetComponent],
  templateUrl: './navbar.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private layoutService = inject(LayoutService);
  private connectionStatusService = inject(ConnectionStatusService);

  pageTitle = computed(() => this.layoutService.pageTitle());
  
  // Connection status
  connectionStatus = computed(() => this.connectionStatusService.status());
  connectionStatusText = computed(() => this.connectionStatusService.getStatusText());
  connectionStatusIcon = computed(() => this.connectionStatusService.getStatusIcon());
  connectionStatusBadgeClass = computed(() => this.connectionStatusService.getStatusBadgeClass());
  lastChecked = computed(() => this.connectionStatusService.lastChecked());
  errorMessage = computed(() => this.connectionStatusService.errorMessage());
}

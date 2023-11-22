import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BootstrapComponent, CoreModule, RouterModule } from '@c8y/ngx-components';
import { RouterModule as ngRouterModule } from '@angular/router';
import { CockpitDashboardModule } from '@c8y/ngx-components/context-dashboard';
import { GpAssetOverviewWidgetPluginModule } from './widget/gp-asset-overview-widget-plugin.module';
import { BsModalRef } from 'ngx-bootstrap/modal';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot([]),
    ngRouterModule.forRoot([], { enableTracing: false, useHash: true }),
    CoreModule.forRoot(),
    CockpitDashboardModule,
    RouterModule.forRoot(),
    GpAssetOverviewWidgetPluginModule
  ],
  providers: [BsModalRef],
  bootstrap: [BootstrapComponent]
})
export class AppModule {}

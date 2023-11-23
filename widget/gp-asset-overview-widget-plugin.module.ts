// Assets need to be imported into the module, or they are not available
import { assetPaths } from '../assets/assets';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GPAssetOverviewWidgetPluginComponent } from './gp-asset-overview-widget-plugin.component';
import { GPAssetOverviewWidgetPluginConfig } from './gp-asset-overview-widget-plugin-config.component';
import { FormsModule, RouterModule, CoreModule, HOOK_COMPONENTS } from '@c8y/ngx-components';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IconSelectorComponent } from '../widget/icon-selector/icon-selector.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { GpAssetOverviewWidgetService } from './gp-asset-overview-widget-plugin.service';

@NgModule({
  declarations: [GPAssetOverviewWidgetPluginComponent, GPAssetOverviewWidgetPluginConfig, IconSelectorComponent],
  entryComponents: [GPAssetOverviewWidgetPluginComponent, GPAssetOverviewWidgetPluginConfig, IconSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    NgSelectModule,
    MatTableModule
  ],
  exports: [IconSelectorComponent, GpAssetOverviewWidgetService],
  providers: [
    {
      provide: HOOK_COMPONENTS,
      multi: true,
      useValue: {
        id: 'asset-overview-widget-plugin',
        label: 'Asset Overview widget plugin',
        description: 'Asset Overview',
        component: GPAssetOverviewWidgetPluginComponent,
        previewImage: assetPaths.previewImage,
        configComponent: GPAssetOverviewWidgetPluginConfig,
        data: {
          ng1: {
            options: {
              noDeviceTarget: false,
              noNewWidgets: false,
              deviceTargetNotRequired: false,
              groupsSelectable: true
            }
          }
        }
      }
    }
  ]

})

export class GpAssetOverviewWidgetPluginModule { }

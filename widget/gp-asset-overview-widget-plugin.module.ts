/**
 * Copyright (c) 2024 Software AG, Darmstadt, Germany and/or its licensors
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// Assets need to be imported into the module, or they are not available

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GPAssetOverviewWidgetPluginComponent } from './gp-asset-overview-widget-plugin.component';
import { GPAssetOverviewWidgetPluginConfig } from './gp-asset-overview-widget-plugin-config.component';
import { FormsModule, CoreModule,hookComponent,DynamicComponentErrorStrategy} from '@c8y/ngx-components';
import { MatTableModule } from '@angular/material/table';
import * as preview from './preview-image';
import { IconSelectorComponent } from '../widget/icon-selector/icon-selector.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { GpAssetOverviewWidgetService } from './gp-asset-overview-widget-plugin.service';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { DatapointSelectorModule } from '@c8y/ngx-components/datapoint-selector';
import { ContextWidgetConfig } from '@c8y/ngx-components/context-dashboard';
@NgModule({
  declarations: [GPAssetOverviewWidgetPluginComponent, GPAssetOverviewWidgetPluginConfig, IconSelectorComponent],
  entryComponents: [GPAssetOverviewWidgetPluginComponent, GPAssetOverviewWidgetPluginConfig, IconSelectorComponent],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    NgSelectModule,
    MatTableModule,
    DatapointSelectorModule,
    PaginationModule.forRoot()
  ],
  exports: [IconSelectorComponent, GpAssetOverviewWidgetService],
  providers: [
     hookComponent({
      
      
        id: 'global-presales-asset-overview-plugin',
        label: 'Asset Overview',
        description: 'The Asset Overview Plugin helps you to display the asset/devices in a tree structure along with the table view for details of the asset and devies with the navigation to the dashboards',
        component: GPAssetOverviewWidgetPluginComponent,
        previewImage: preview.previewImage,
        configComponent: GPAssetOverviewWidgetPluginConfig,
        data: {
          ng1: {
            options: {
              noDeviceTarget: false,
              multi: true,
              noNewWidgets: false,
              deviceTargetNotRequired: false,
              groupsSelectable: true
            }
          }as ContextWidgetConfig,
          errorStrategy: DynamicComponentErrorStrategy.CUSTOM,
        }
      })
  ]
})

export class GpAssetOverviewWidgetPluginModule { }

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

import { Component, Input, OnInit, isDevMode } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SELECTION_MODEL_FACTORY } from '@ng-select/ng-select';
import { DefaultSelectionModelFactory } from '../widget/icon-selector/selection-model'
import { GpAssetOverviewWidgetService } from './gp-asset-overview-widget-plugin.service';
import { InventoryService } from '@c8y/client';
import { MatTableDataSource } from '@angular/material/table';

export interface Property {
  id: any;
  label: string;
  value: string;
}
export interface DashboardConfig {
  type?: any;
  templateID?: string;
  tabGroupID?: string;
  tabGroup?: boolean;
}
@Component({
  selector: 'gp-asset-overview-widget-plugin-config',
  templateUrl: './gp-asset-overview-widget-plugin-config.html',
  styleUrls: ['./../node_modules/@ng-select/ng-select/themes/default.theme.css', './gp-asset-overview-widget-plugin-config.component.css'],
 
  providers: [
    FormBuilder,
    { provide: SELECTION_MODEL_FACTORY, useValue: DefaultSelectionModelFactory }
  ],
})

export class GPAssetOverviewWidgetPluginConfig implements OnInit {
  propertiesToDisplay: Property[] = [];
  @Input() config: any = {};
  appId = null;
  managedObject: any;
  configDevice = '';
  markerIcon: any;
  deviceFile: any;
  busy: false;
  isExpandedP1 = false;
  isExpandedFP = false;
  pageSizeList: string[] = ['5', '10', '20', '50', '100'];
  isExpandedP2 = false;
  isExpandedDBS = false;
  props = new FormControl();
  p1Props;
  dashboardList: DashboardConfig[] = [];
  deviceTypes = null;
  p1DataSource = new MatTableDataSource<Property>([]);
  p2DataSource = new MatTableDataSource<Property>([]);
  displayedColumns: string[] = ['label', 'property'];
  p2Props;
  exemptedValues: string[] = [
    'additionParents',
    'assetParents',
    'c8y_DataPoint',
    'childAdditions',
    'childAssets',
    'childDevices',
    'com_cumulocity_model_Agent',
    'deviceParents',
    'self'
  ];
  otherPropList: boolean = false;
  selected: any;
  otherProp: boolean;


  constructor(private deviceList: GpAssetOverviewWidgetService, private invSvc: InventoryService,private fb: FormBuilder,) { }

  async ngOnInit(): Promise<void> {
    this.appId = this. deviceList.getAppId();
    
    if (!this.config.configDashboard) {
      this.config.configDashboard = false;
    }
    if (!this.config.displayMode) {
      this.config.displayMode = 'All';
    }
    if (!this.config.dashboardList && this.appId) {
      const dashboardObj: DashboardConfig = {};
      dashboardObj.type = 'All';
      this.dashboardList.push(dashboardObj);
      this.config.dashboardList = this.dashboardList;
    }
    if (this.config.markerIcon !== null && this.config.markerIcon !== undefined) {
      this.markerIcon = this.config.markerIcon;
    }
    if (!this.config.device) {
      this.config.device = {};
    }
    else {
      this.configDevice = this.config.device.id;
      if (this.appId) {
        this.getAllDevices(this.configDevice);
      }
    }
    if (!this.config.selectedInputs) {
      this.config.selectedInputs = ['id', 'name', 'deviceExternalDetails.externalId', 'lastUpdated', 'c8y_Availability.status', 'c8y_ActiveAlarmsStatus'];
    }
    if (this.config.selectedInputs && this.config.selectedInputs.indexOf('other') !== -1) {
      this.otherPropList = true;
    }
    if (!this.config.dashboardList && this.appId) {
   
      const dashboardObj: DashboardConfig = {};
      dashboardObj.type = 'All';
      this.dashboardList.push(dashboardObj);
      this.config.dashboardList = this.dashboardList;
    }

    this.propertiesToDisplay = [
      { id: 'id', label: 'ID', value: 'id' },
      { id: 'name', label: 'Name', value: 'name' },
      { id: 'owner', label: 'Owner', value: 'owner' },
      { id: 'creationTime', label: 'Creation time', value: 'creationTime' },
      { id: 'lastUpdated', label: 'Last updated', value: 'lastUpdated' },
      { id: 'externalId', label: 'External id', value: 'externalId' },
      { id: 'externalType', label: 'External type', value: 'externalType' },
     
      { id: 'c8y_AvailabilityStatus', label: 'Availability status', value: 'c8y_AvailabilityStatus' },
      { id: 'c8y_ConnectionStatus',label: 'Connection status', value: 'c8y_ConnectionStatus' },
      { id: 'c8y_FirmwareName', label: 'Firmware name', value: 'c8y_FirmwareName' },
      { id: 'c8y_FirmwareVersion', label: 'Firmware version', value: 'c8y_FirmwareVersion' },
      { id: 'c8y_FirmwareVersionIssues', label: 'Firmware verison issues', value: 'c8y_FirmwareVersionIssues' },
      { id: 'c8y_FirmwareIssuesName', label: '', value: 'c8y_FirmwareVersionIssuesName' },
      {
        id: 'c8y_RequiredAvailabilityResponseInterval'
        , label: 'Required availability', value: 'c8y_RequiredAvailabilityResponseInterval'
      },
    
      { id: 'c8y_ActiveAlarmsStatus', label: 'Active alarms status', value: 'c8y_ActiveAlarmsStatus' },
   
    ];
    if (!this.config.fpProps) {
      this.config.fpProps = ['Availability', 'ActiveAlarmsStatus'];
    } else {
      if (this.config.fpProps.indexOf('Other') > -1) {
        this.otherProp = true;
      }
    }
    if (!this.config.selectedInputs) {
      this.config.selectedInputs = ['id', 'name', 'deviceExternalDetails.externalId', 'lastUpdated', 'c8y_Availability.status', 'c8y_ActiveAlarmsStatus'];
    }
    if (this.config.selectedInputs && this.config.selectedInputs.indexOf('other') !== -1) {
      this.otherPropList = true;
    }
    this.p1Props = this.fb.group({
      p1Props: [null, Validators.required]
    });
    this.p2Props = this.fb.group({
      p2Props: [null, Validators.required]
    });
    let prop1;
    if (!this.config.p1Props) {
      this.config.p1Props = undefined;
    } else {
      prop1 = this.propertiesToDisplay.filter(prop => {
        let ele;
        this.config.p1Props.forEach(element => {
          if (prop.id === element.id) {
            prop.id === 'other' ? (() => {
              prop.label = element.label;
              prop.value = element.value;
              // tslint:disable-next-line:no-unused-expression
            })() : '';
            ele = prop;
          }
        });
        return ele;
      });
    }
    let prop2;
    if (!this.config.p2Props) {
      this.config.p2Props = undefined;
    } else {
      prop2 = this.propertiesToDisplay.filter(prop => {
        let ele = '';
        this.config.p2Props.forEach(element => {
          if (prop.id === element.id) {
            prop.id === 'other' ? (() => {
              prop.label = element.label;
              prop.value = element.value;
              // tslint:disable-next-line:no-unused-expression
            })() : '';
            ele = element;
          }
        });
        return ele;
      });
    }
    if (!this.config.otherProp) {
      this.config.otherProp = { label: '', value: '' };
    }

    if (!this.config.otherPropList) {
      this.config.otherPropList = [{ label: '', value: '' }];
    }

    this.props.setValue(this.config.fpProps);
    this.p1Props.get('p1Props').setValue(prop1);
    this.p2Props.get('p2Props').setValue(prop2);
    if (prop1) {
      this.p1DataSource.data = JSON.parse(JSON.stringify(this.p1Props.get('p1Props').value));
    }
    if (prop2) {
      this.p2DataSource.data = JSON.parse(JSON.stringify(this.p2Props.get('p2Props').value));
    }

    if (this.config.realtime === undefined) {
      this.config.realtime = false;
    }
    if (this.config.isRuntimeExternalId === undefined) {
      this.config.isRuntimeExternalId = false;
    }
    if (this.config.showChildDevices === undefined) {
      this.config.showChildDevices = false;
    }
    
  }

  onP1Change() {
    this.p1DataSource.data = JSON.parse(JSON.stringify(this.p1Props.get('p1Props').value));
    this.config.p1Props = this.p1Props.get('p1Props').value;
  }
  onP2Change() {
    this.p2DataSource.data = JSON.parse(JSON.stringify(this.p2Props.get('p2Props').value));
    this.config.p2Props = this.p2Props.get('p2Props').value;
  }

  commitToP1PropsConfig(props) {
    this.config.p1Props = props.data;
  }

  commitToP2PropsConfig(props) {
    this.config.p2Props = props.data;
  }
  /**
   * Get All devices's device type
   */
  private getAllDevices(deviceId: string) {
    const deviceList: any = null;
    this.deviceList.getChildAssets(deviceId, 1, deviceList)
      .then((deviceFound) => {
        this.deviceTypes = Array.from(new Set(deviceFound.data.map(item => item.type)));
        this.deviceTypes = this.deviceTypes.filter(n => n);
      })
      .catch((err) => {
        if (isDevMode()) { console.log('+-+- ERROR while getting ALL devices ', err); }
      });
  }
  async onColChange() {
    this.selected = this.config.selectedInputs;
    this.config.selectedInputs.forEach((element) => {
      if (element.indexOf('other') !== -1) {
        this.otherPropList = true;
      } else {
        this.otherPropList = false;
        this.config.otherPropList = [{ label: '', value: '' }];
      }
    });
    if (this.config.selectedInputs.length === 0) {
      this.otherPropList = false;
      this.config.otherPropList = [{ label: '', value: '' }];
    }
  }


  async ngDoCheck() {
    if (this.config.device && this.config.device.id && this.config.device.id !== this.configDevice) {
      this.configDevice = this.config.device.id;
      this.getAllDevices(this.configDevice);
    }
  }
  addProperty() {
    this.config.otherPropList.push({ label: '', value: '' });
  }

  /**
   * Add new Row for Dashboard Settings
   */
  addNewRecord(currentIndex) {
    if ((currentIndex + 1) === this.config.dashboardList.length) {
      const dashboardObj: DashboardConfig = {};
      dashboardObj.type = 'All';
      this.config.dashboardList.push(dashboardObj);
    }
  }
  
}
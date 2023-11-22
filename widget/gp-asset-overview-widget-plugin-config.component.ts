import { Component, Input, OnInit, ViewEncapsulation, isDevMode } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SELECTION_MODEL_FACTORY } from '@ng-select/ng-select';
import { DynamicComponent } from '@c8y/ngx-components';
import { DefaultSelectionModelFactory } from '../widget/icon-selector/selection-model'
import { GpAssetOverviewWidgetService } from './gp-asset-overview-widget-plugin.service';
import { InventoryService } from '@c8y/client';

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
  encapsulation: ViewEncapsulation.None,
  providers: [
    FormBuilder,
    { provide: SELECTION_MODEL_FACTORY, useValue: DefaultSelectionModelFactory }
  ],
})

export class GPAssetOverviewWidgetPluginConfig implements OnInit {

  propertiesToDisplayList: Property[] = [];
  @Input() config: any = {};
  appId = null;
  managedObject: any;
  configDevice = '';
  markerIcon: any;
  deviceFile: any;
  busy: false;
  isExpandedDBS = false;
  dashboardList: DashboardConfig[] = [];
  deviceTypes = null;

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


  constructor(private deviceList: GpAssetOverviewWidgetService, private invSvc: InventoryService,) { }

  async ngOnInit(): Promise<void> {
    if (this.config.markerIcon !== null && this.config.markerIcon !== undefined) {
      this.markerIcon = this.config.markerIcon;
    }
    this.getAllDevices(this.config.device.id);

    this.propertiesToDisplayList = [
      { id: 'id', label: 'ID', value: 'id' },
      { id: 'name', label: 'Name', value: 'name' },
      { id: 'owner', label: 'Owner', value: 'owner' },
      { id: 'childDeviceAvailable', label: 'Child devices', value: 'childDeviceAvailable' },
      { id: 'c8y_AvailabilityStatus', label: 'Availability status', value: 'c8y_Availability.status' },
      { id: 'c8y_ConnectionStatus', label: 'Connection status', value: 'c8y_Connection.status' },
      { id: 'c8y_FirmwareName', label: 'Firmware name', value: 'c8y_Firmware.name' },
      { id: 'c8y_FirmwareVersion', label: 'Firmware version', value: 'c8y_Firmware.version' },
      { id: 'c8y_FirmwareVersionIssues', label: 'Firmware verison issues', value: 'c8y_Firmware.versionIssues' },
      { id: 'c8y_FirmwareVersionIssuesName', label: 'Firmware issue name', value: 'c8y_Firmware.versionIssuesName' },
      { id: 'c8y_RequiredAvailabilityResponseInterval', label: 'Required availability', value: 'c8y_RequiredAvailability.responseInterval' },
      { id: 'creationTime', label: 'Creation time', value: 'creationTime' },
      { id: 'lastUpdated', label: 'Last updated', value: 'lastUpdated' },
      { id: 'externalId', label: 'External id', value: 'deviceExternalDetails.externalId' },
      { id: 'externalType', label: 'External type', value: 'deviceExternalDetails.externalType' },
      { id: 'c8y_Notes', label: 'Notes', value: 'c8y_Notes' },
      { id: 'type', label: 'Type', value: 'type' },
      { id: 'c8y_CommunicationMode', label: 'Communication Mode', value: 'c8y_CommunicationMode.mode' },
      { id: 'c8y_HardwareModel', label: 'Hardware Model', value: 'c8y_Hardware.model' },
      { id: 'c8y_ActiveAlarmsStatus', label: 'Active alarms status', value: 'c8y_ActiveAlarmsStatus' },
      { id: 'other', label: 'Other', value: 'other' }
    ];
    if (!this.config.selectedInputs) {
      this.config.selectedInputs = ['id', 'name', 'deviceExternalDetails.externalId', 'lastUpdated', 'c8y_Availability.status', 'c8y_ActiveAlarmsStatus'];
    }
    if (this.config.selectedInputs && this.config.selectedInputs.indexOf('other') !== -1) {
      this.otherPropList = true;
    }
    //if (!this.config.dashboardList && this.appId) {
    if (!this.config.dashboardList) {
      const dashboardObj: DashboardConfig = {};
      dashboardObj.type = 'All';
      this.dashboardList.push(dashboardObj);
      this.config.dashboardList = this.dashboardList;
    }

    await this.getLabelForKey();
  }
  /**
   * Get All devices's device type
   */
  private getAllDevices(deviceId: string) {
    const deviceList: any = null;
    this.deviceList.getChildDevices(deviceId, 1, deviceList)
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
    await this.getLabelForKey();
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

  getLabelForKey() {
    this.config.selectedInputLabels = [];
    if (this.config.selectedInputs) {
      for (let i = 0; i < this.config.selectedInputs.length; i++) {
        for (let j = 0; j < this.propertiesToDisplayList.length; j++) {
          if (this.config.selectedInputs[i] === this.propertiesToDisplayList[j].id) {
            this.config.selectedInputLabels.push(this.propertiesToDisplayList[j].label);
          }
        }
      }
    }
    console.log("selected inputlabesl", this.config.selectedInputLabels);
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
import { Component, ElementRef, Input, OnInit, ViewChild, isDevMode } from '@angular/core';
import { GpAssetOverviewWidgetService } from './gp-asset-overview-widget-plugin.service';
import { Observable, from, Subject, Subscription, BehaviorSubject, combineLatest } from "rxjs";
import { IManagedObject, InventoryService } from '@c8y/client';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as ImageData from './gp-default-image';
import { Router } from '@angular/router';
import { assetTreeNodeService } from './gp-asset-tree.service';
import * as _ from 'lodash';
export interface Node {
  id: number;
  visible: boolean;
  children: Node[];
}
export interface DeviceData {
  id?: string;
  name?: string;
  lastUpdated?: Date;
  firmwareStatus?: string;
  c8y_AvailabilityStatus?: string;
  alertDetails?: any;
  other?: any;
  type?: any;
  c8y_FirmwareName?: string;
  c8y_FirmwareVersion?: string;
  c8y_FirmwareVersionIssues?: string;
  c8y_FirmwareVersionIssuesName?: string;
  c8y_RequiredAvailabilityResponseInterval?: string;
  c8y_ConnectionStatus?: string;
  c8y_CommunicationMode?: string;
  c8y_HardwareModel?: string;
  creationTime?: string;
  owner?: string;
  childDeviceAvailable?: any;
  c8y_Notes?: any;
  assetImage?: any;
  externalId?: string;
  externalType?: string;
  c8y_ActiveAlarmsStatus?: any;
}

@Component({
  selector: 'gp-asset-overview-widget-plugin',
  templateUrl: 'gp-asset-overview-widget-plugin.html',
  styleUrls: ['gp-asset-overview-widget-plugin.component.css'],
  imports: [],
})
export class GPAssetOverviewWidgetPluginComponent implements OnInit {
  selectedInputs: any[] = []; // Assuming your selected inputs are stored in this array
  selectedInputLabels: string[] = []; // Assuming corresponding labels are stored here
  groupedInputs: any[][] = [];
  groupedLabels: string[][] = [];

  configDashboardList = [];
  appId = '';
  @Input() config;
  configDevice = '';
  latestFirmwareVersion = 0;
  isBusy = false;
  otherProp: any;
  matData: any = [];
  selectedAsset: any;

  dataSource: any;
  rootNode: any;
  dynamicDisplayColumns = [];
  displayedColumnsForList: string[] = [];
  markerIcon = '';
  childDevicesAssets = {};
  objectKeys = Object.keys;

  currentPage = 1;
  pageSize = 2;
  totalRecord = -1;
  isMorePages = true;

  constructor(
    private deviceList: GpAssetOverviewWidgetService, private inventoryService: InventoryService, 
    private sanitizer: DomSanitizer, private router: Router, private assetTreeNodeService: assetTreeNodeService) {
  }
  async ngOnInit() {

    this.appId = await this.deviceList.getAppId(); 
    if (!this.config.device) {
      this.config.device = {};
    }
    else {
      this.configDevice = this.config.device.id;
      let inventory = await this.inventoryService.detail(this.configDevice);
      this.dataSource = [];
      this.rootNode = this.assetTreeNodeService.createRoot(inventory.data, true,true);
      this.dataSource = [this.rootNode];
      this.isBusy = true;
      await this.getAllDevices(this.rootNode,this.configDevice);
      this.loadAssetData(this.dataSource[0]);
    } 
    if (this.config.markerIcon !== null && this.config.markerIcon !== undefined) {
      this.markerIcon = this.config.markerIcon;
    }
    this.otherProp = this.config.otherProp ? this.config.otherProp : '';
    this.displayedColumnsForList = this.config.selectedInputs ? this.config.selectedInputs : ['id', 'name', 'deviceExternalDetails.externalId', 'lastUpdated', 'c8y_Availability.status', 'c8y_ActiveAlarmsStatus'];
    if (this.config.otherPropList && this.config.otherPropList.length > 0) {
      this.config.otherPropList.forEach((element) => {
        if (element.label !== '' && element.value !== '') {
          this.dynamicDisplayColumns.push(element);
          this.displayedColumnsForList = this.displayedColumnsForList.concat([element.value]);
        }
      })
    }
    let index = this.displayedColumnsForList.indexOf('other');
    if (index !== -1) {
      this.displayedColumnsForList.splice(index, 1);
    }
    this.configDashboardList = this.config.dashboardList;

    // Assuming you have some logic to populate selectedInputs and selectedInputLabels arrays

    // Split selectedInputs and selectedInputLabels into groups of five
    this.groupedInputs = this.chunkArray(this.selectedInputs, 5);
    this.groupedLabels = this.chunkArray(this.selectedInputLabels, 5);
    console.log("Datasource", this.dataSource);
  }

  // Function to split array into chunks
  chunkArray(array: any[], chunkSize: number): any[][] {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunkedArray.push(array.slice(i, i + chunkSize));
    }
    return chunkedArray;
  }

  // Navigate URL to dashboard if dashboard is exist
  navigateURL(deviceId: string, deviceType: string) {
    console.log("navigator clicked id:" + deviceId + " type:" + deviceType);
    if (deviceType && this.appId) {
      // if (deviceType) {
      const dashboardObj = this.configDashboardList.find((dashboard) => dashboard.type === deviceType);
      if (dashboardObj && dashboardObj.templateID) {
        if (dashboardObj.withTabGroup) {
          this.router.navigate([
            `/application/${this.appId}/tabgroup/${deviceId}/dashboard/${dashboardObj.templateID}/device/${deviceId}`]);
        } else if (dashboardObj.tabGroupID) {
          this.router.navigate([
            `/application/${this.appId}/tabgroup/${dashboardObj.tabGroupID}/dashboard/${dashboardObj.templateID}/device/${deviceId}`]);
        } else {
          console.log("App id:", this.appId);
          this.router.navigate([`/application/${this.appId}/dashboard/${dashboardObj.templateID}/device/${deviceId}`]);
        }
      }
    } else if (deviceType) {
      this.router.navigate([`/device/${deviceId}`]);
    }
  }

  /**
     * Get All devices's device type
     */
  async getAllDevices(rootNode: any, deviceId: string) {
    let allDevices: any = null;
    const assetResponse = await this.deviceList.getDeviceList(deviceId, this.pageSize, this.currentPage, true, 'Assets');
    allDevices  = (assetResponse.data ? assetResponse.data : []);
    if (assetResponse.data && assetResponse.data.length > 0&& assetResponse.data.length < this.pageSize) {
      this.totalRecord = (this.pageSize * (assetResponse.paging.totalPages - 1)) + assetResponse.data.length;
    } else {
      this.totalRecord = this.pageSize * assetResponse.paging.totalPages;
    }

    const deviceResponse = await this.deviceList.getDeviceList(deviceId, this.pageSize, this.currentPage, true, 'Devices');
    allDevices  = (deviceResponse.data ? allDevices.concat(deviceResponse.data): allDevices);
    if (deviceResponse.data && deviceResponse.data.length > 0 &&  deviceResponse.data.length < this.pageSize) {
      this.totalRecord = this.totalRecord + (this.pageSize * (deviceResponse.paging.totalPages - 1)) + deviceResponse.data.length;
    } else {
      this.totalRecord = this.totalRecord +  this.pageSize * deviceResponse.paging.totalPages;
    }
    if(this.totalRecord < (this.currentPage * this.pageSize)) { this.isMorePages = false;}
    if(allDevices) {
      for (const asset of allDevices) {
        this.rootNode = this.assetTreeNodeService.insertChildNode(rootNode,asset)
        if (asset.childAssets.references.length > 0) {
          console.log("asset.childAssets.references", asset.childAssets.references);
          
        }
        if (asset.childDevices.references.length > 0) {
          console.log("asset.childDevices.references", asset.childDevices.references);
        }
      }
    } else  {
      this.totalRecord = -1;
    }
    this.dataSource = [];
    this.dataSource = [this.rootNode];
    console.log("data source", this.dataSource);
    this.loadAssetData(rootNode);
    this.isBusy = false;
  }

  async getDeviceDetails(managedObjectId) {
    let deviceFound = await this.inventoryService.detail(managedObjectId);
    return deviceFound.data;
  }
  async expandAsset(devices) {
    this.selectedAsset = devices?.deviceMO?.id;
    this.totalRecord = -1;
    this.currentPage = 1;
    this.isMorePages = true;
    const children = devices?.children;
    if(devices.hasChild && (!children || children.length == 0) ) {
      devices.isLoading = true;
      await this.getAllDevices(devices,this.selectedAsset);
      devices.isLoading = false;
    }
    if (devices.children && devices.children.length > 0) {
      devices.visible = !devices.visible;
    }
    
  }

  async loadAssetImage(image): Promise<SafeResourceUrl> {
    if (!image && !this.markerIcon) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + ImageData.defaultImage);
    }

    // if content of image variable is a number it is assumed it is a binary id
    // and therefore the corresponding image is loaded from the binary repository
    if (image && Number(image)) {
      const response = await this.deviceList.downloadBinary(image) as Response;
      const binaryBlob = await response.blob();
      return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(binaryBlob));
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl('data:image/png;base64,' + image);
  }


  async loadAssetData(asset: any) {
    this.selectedAsset = asset?.deviceMO?.id;
    this.matData = [];
    let deviceData = await this.mapAssetData(asset.deviceMO);
    this.matData.push(deviceData);
    if (asset.children && asset.children.length > 0) {
      await this.loadChildAssets(asset.children);
     
    }
  }

   /**
   * This method will called during page navigation
   */
   async getPageEvent(devices) {
    this.currentPage = this.currentPage + 1;
    devices.isLoading = true;
    await this.getAllDevices(devices,this.selectedAsset);
    devices.isLoading = false;
  }

  async mapAssetData(asset) {
    let deviceData: DeviceData = {};
    let alertDesc = {
      minor: 0,
      major: 0,
      critical: 0,
      warning: 0
    };
    deviceData.id = asset.id;
    deviceData.name = asset.name;
    deviceData.type = asset.type;
    deviceData.lastUpdated = asset.lastUpdated;
    deviceData.creationTime = asset.creationTime;
    deviceData.externalId = _.get(asset, "asset.deviceExternalDetails.externalId", 'Not Available');
    deviceData.externalType = _.get(asset, "asset.deviceExternalDetails.externalType", 'Not Available');
    deviceData.owner = _.get(asset, "asset.owner", 'Not Available');
    deviceData.c8y_ConnectionStatus = _.get(asset, "asset.c8y_Connection.status", 'Not Available');
    deviceData.c8y_AvailabilityStatus = _.get(asset, "asset.c8y_Availability.status", 'Not Available');
    deviceData.c8y_RequiredAvailabilityResponseInterval = _.get(asset, "asset.c8y_RequiredAvailability.responseInterval", 'Not Available');
    deviceData.c8y_Notes = _.get(asset, "asset.c8y_Notes", 'Not Available');
    deviceData.c8y_CommunicationMode = _.get(asset, "asset.c8y_CommunicationMode.mode", 'Not Available');
    deviceData.c8y_HardwareModel = _.get(asset, "asset.c8y_Hardware.model", 'Not Available');
    deviceData.c8y_FirmwareName = _.get(asset, "asset.c8y_Firmware.name", 'Not Available');
    deviceData.c8y_FirmwareVersionIssues = _.get(asset, "asset.c8y_Firmware.versionIssues", 'Not Available');
    deviceData.c8y_FirmwareVersionIssuesName = _.get(asset, "asset.c8y_Firmware.versionIssuesName", 'Not Available');
//    deviceData.externalId = asset.deviceExternalDetails ? asset.deviceExternalDetails.externalId : 'Not Available';
//    deviceData.externalType = asset.deviceExternalDetails ? asset.deviceExternalDetails.externalType : 'Not Available';
//    deviceData.owner = asset.owner ? asset.owner : 'Not available';
//    deviceData.c8y_ConnectionStatus = asset.c8y_Connection ? asset.c8y_Connection.status : 'Not Available';
//    let availability = asset.c8y_Availability ? asset.c8y_Availability.status : 'Not Available';
    alertDesc = (asset.hasOwnProperty('c8y_IsAsset')) ? await this.deviceList.getAlarmsForAsset(asset) : this.checkAlarm(asset, alertDesc);
    deviceData.assetImage = '';
//    deviceData.c8y_RequiredAvailabilityResponseInterval = asset.c8y_RequiredAvailability ? asset.c8y_RequiredAvailability.responseInterval : 'Not Available';
//    deviceData.c8y_Notes = asset.c8y_Notes ? asset.c8y_Notes : 'Not Available';
//    deviceData.c8y_CommunicationMode = asset.c8y_CommunicationMode ? asset.c8y_CommunicationMode.mode : 'Not Available';
//    deviceData.c8y_HardwareModel = asset.c8y_Hardware ? asset.c8y_Hardware.model : 'Not Available';
    if (asset.image) {
      deviceData.assetImage = await this.loadAssetImage(asset.image);
    }
    deviceData.c8y_FirmwareVersion = (asset.c8y_Firmware && asset.c8y_Firmware.version) ? this.getFirmwareRiskForFilter(asset.c8y_Firmware.version) : 'Not available';
//    deviceData.c8y_FirmwareName = (asset.c8y_Firmware && asset.c8y_Firmware.name) ? asset.c8y_Firmware.name : 'Not available';
//    deviceData.c8y_FirmwareVersionIssues = (asset.c8y_Firmware && asset.c8y_Firmware.versionIssues) ? asset.c8y_Firmware.versionIssues : 'Not available';
 //   deviceData.c8y_FirmwareVersionIssuesName = (asset.c8y_Firmware && asset.c8y_Firmware.versionIssuesName) ? asset.c8y_Firmware.versionIssuesName : 'Not available';
 //   deviceData.c8y_AvailabilityStatus = availability;

    deviceData.alertDetails = alertDesc;
    if ((this.config.p1Props === 'Other' || this.config.p2Props  === 'Other') && this.getTheValue(asset, this.otherProp.value) !== undefined) {
      deviceData.other = this.getTheValue(asset, this.otherProp.value);
      deviceData.other = JSON.stringify(deviceData.other);
    }

    if ((this.config.p1Props === 'other' || this.config.p2Props === 'other') && this.getTheValue(asset, this.otherProp.value) !== undefined) {
      deviceData.other = this.getTheValue(asset, this.otherProp.value);
      deviceData.other = JSON.stringify(deviceData.other);
    }

    this.dynamicDisplayColumns.forEach(element => {
      deviceData[element.value] = this.getTheValue(asset, element.value);
      deviceData[element.value] = JSON.stringify(this.getTheValue(asset, element.value));
    });
    return deviceData;
  }

  loadChildAssets(childAssets) {
    childAssets.forEach(async (data) => {
      let deviceData = await this.mapAssetData(data?.deviceMO);
      this.matData.push(deviceData);
    })
  }


  toDotNotation(obj, res = {}, current = '') {
    for (const key in obj) {
      let value = obj[key];
      let newKey = (current ? current + "." + key : key);  // joined key with dot
      if (value && typeof value === "object") {
        this.toDotNotation(value, res, newKey);  // it's a nested object, so do it again
      } else {
        res[newKey] = value;  // it's not an object, so set the property
      }
    }
    return res;
  }


  isAlerts(alarm) {
    if (alarm === undefined) { return false; }

    return (alarm.critical && alarm.critical > 0) || (alarm.major && alarm.major > 0)
      || (alarm.minor && alarm.minor > 0)
      || (alarm.warning && alarm.warning > 0);
  }
  isAlertsColor(alarm) {
    if (alarm) {
      if (alarm.critical && alarm.critical > 0) {
        return 'criticalAlerts2';
      } else if (alarm.major && alarm.major > 0) {
        return 'majorAlerts2';
      } else if (alarm.minor && alarm.minor > 0) {
        return 'minorAlerts2';
      } else if (alarm.warning && alarm.warning > 0) {
        return 'warningAlerts2';
      } else {
        return '';
      }
    }
    return '';
  }

  isAlertsBGColor(alarm) {
    if (alarm) {
      if (alarm.critical && alarm.critical > 0) {
        return 'criticalAlerts';
      } else if (alarm.major && alarm.major > 0) {
        return 'majorAlerts';
      } else if (alarm.minor && alarm.minor > 0) {
        return 'minorAlerts';
      } else if (alarm.warning && alarm.warning > 0) {
        return 'warningAlerts';
      } else {
        return '';
      }
    }
    return '';
  }

  getTotalAlerts(alarm) {
    let alertCount = 0;
    if (alarm) {
      if (alarm.critical && alarm.critical > 0) {
        alertCount += alarm.critical;
      }
      if (alarm.major && alarm.major > 0) {
        alertCount += alarm.major;
      }
      if (alarm.minor && alarm.minor > 0) {
        alertCount += alarm.minor;
      }
      if (alarm.warning && alarm.warning > 0) {
        alertCount += alarm.warning;
      }
    }
    return alertCount;
  }
  isAlertCritical(alarm) {
    return (alarm && alarm.critical && alarm.critical > 0);
  }
  isAlertMajor(alarm) {
    return (alarm && alarm.major && alarm.major > 0);
  }
  isAlertMinor(alarm) {
    return (alarm && alarm.minor && alarm.minor > 0);
  }
  isAlertWarning(alarm) {
    return (alarm && alarm.warning && alarm.warning > 0);
  }


  loadText(alarm) {
    let alarmsStatus = '';
    if (alarm) {
      if (alarm.critical && alarm.critical > 0) {
        alarmsStatus = alarmsStatus + `Critical: ${alarm.critical} `;
      }
      if (alarm.major && alarm.major > 0) {
        alarmsStatus = alarmsStatus + `Major: ${alarm.major} `;
      }
      if (alarm.minor && alarm.minor > 0) {
        alarmsStatus = alarmsStatus + `Minor: ${alarm.minor} `;
      }
      if (alarm.warning && alarm.warning > 0) {
        alarmsStatus = alarmsStatus + `Warning: ${alarm.warning} `;
      }
    }
    return alarmsStatus;
  }
  getTheValue(device, value: string) {
    if (typeof value === 'string' && value.includes('.')) {
      const arr = value.split('.');
      let actualValue = device[arr[0]] ? device[arr[0]] : undefined;
      if (actualValue !== undefined) {
        for (let i = 1; i < arr.length; i++) {
          actualValue = actualValue[arr[i]];
        }
      }
      return actualValue;
    }
    return device[value];
  }
  getFirmwareRiskForFilter(version) {
    const versionIssue = this.calculateFirmwareRisk(version);
    if (versionIssue === -1) {
      return 'Low  Risk';
    } else if (versionIssue === -2) {
      return 'Medium Risk';
    } else if (versionIssue === -3) {
      return 'High Risk';
    } else {
      return 'No Risk';
    }
  }
  calculateFirmwareRisk(version) {
    let versionIssues = 0;
    versionIssues = version - this.latestFirmwareVersion;
    return versionIssues;
  }
  async getFirmwareData() {
    const firmwareData = await this.inventoryService.list({ type: 'sag_racm_currentFirmware' });
    if (firmwareData.data.length > 0) {
      this.latestFirmwareVersion = firmwareData.data[0].firmware.version;
    }
  }
  checkAlarm(inventory: IManagedObject, alertDesc: any): any {
    if (inventory.c8y_ActiveAlarmsStatus) {
      if (inventory.c8y_ActiveAlarmsStatus.hasOwnProperty('minor')) {
        if (inventory.c8y_ActiveAlarmsStatus.minor > 0) {
          alertDesc.minor += inventory.c8y_ActiveAlarmsStatus.minor;
        }
      }
      if (inventory.c8y_ActiveAlarmsStatus.hasOwnProperty('major')) {
        if (inventory.c8y_ActiveAlarmsStatus.major > 0) {
          alertDesc.major += inventory.c8y_ActiveAlarmsStatus.major;
        }
      }
      if (inventory.c8y_ActiveAlarmsStatus.hasOwnProperty('critical')) {
        if (inventory.c8y_ActiveAlarmsStatus.critical > 0) {
          alertDesc.critical += inventory.c8y_ActiveAlarmsStatus.critical;
        }
      }
      if (inventory.c8y_ActiveAlarmsStatus.hasOwnProperty('warning')) {
        if (inventory.c8y_ActiveAlarmsStatus.warning > 0) {
          alertDesc.warning += inventory.c8y_ActiveAlarmsStatus.warning;
        }
      }
    }
    return alertDesc;
  }
}
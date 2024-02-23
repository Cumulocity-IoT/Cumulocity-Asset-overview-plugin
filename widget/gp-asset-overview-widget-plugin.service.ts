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



import { Injectable } from '@angular/core';
import { AlarmService, IAlarm, IManagedObject, IManagedObjectBinary, IResult, IResultList, InventoryBinaryService, InventoryService, Severity,Realtime } from '@c8y/client';
@Injectable({
  providedIn: 'root',
})
export class GpAssetOverviewWidgetService {
  constructor(private inventoryService: InventoryService, private inventoryBinaryService: InventoryBinaryService,public realtimeService: Realtime,
    private alarmService: AlarmService) {}
  getAppId() {
    const currentURL = window.location.href;
    const routeParam = currentURL.split('#');
    if (routeParam.length > 1) {
      const appParamArray = routeParam[1].split('/');
      const appIndex = appParamArray.indexOf('application');
      if (appIndex !== -1) {
        return appParamArray[appIndex + 1];
      }
    }
    return '';
  }
  /**
  * This service will recursively get all the child assets for the given device id and return a promise with the result list.
  *
  * @param id ID of the managed object to check for child devices
  * @param pageToGet Number of the page passed to the API
  * @param allDevices Child assets already found
  * @param display
  */
  getChildAssets(id: string, pageToGet: number, allDevices: { data: any[], res: any }): Promise<IResultList<IManagedObject>> {
    const inventoryFilter = {
      pageSize: 50,
      withTotalPages: true,
      query: '',
      currentPage: pageToGet
    };
    if (!allDevices) {
      allDevices = { data: [], res: null };
    }
    return new Promise(
      (resolve, reject) => {
        this.inventoryService.childAssetsList(id, inventoryFilter)
          .then((resp) => {
            if (resp.res.status === 200) {
              if (resp.data && resp.data.length >= 0) {
                allDevices.data.push.apply(allDevices.data, resp.data);
                // suppose that if # of devices is less that the page size, then all devices have already been retrieved
                if (resp.data.length < inventoryFilter.pageSize) {
                  resolve(allDevices);
                } else {
                  this.getChildAssets(id, resp.paging.nextPage, allDevices)
                    .then((np) => {
                      resolve(allDevices);
                    })
                    .catch((err) => reject(err));
                }
              }
            
            } else {
              reject(resp);
            }
          });
      });

    }

  /**
  * This service will recursively get all the child devices for the given device id and return a promise with the result list.
  *
  * @param id ID of the managed object to check for child devices
  * @param pageToGet Number of the page passed to the API
  * @param allDevices Child devices already found
  * @param display
  */
  getChildDevices(id: string, pageToGet: number, allDevices: { data: any[], res: any }): Promise<IResultList<IManagedObject>> {
    const inventoryFilter = {
      pageSize: 50,
      withTotalPages: true,
      query: '',
      currentPage: pageToGet
    };
    if (!allDevices) {
      allDevices = { data: [], res: null };
    }
    return new Promise(
      (resolve, reject) => {
        this.inventoryService.childDevicesList(id, inventoryFilter)
          .then((resp) => {
            if (resp.res.status === 200) {
              if (resp.data && resp.data.length >= 0) {
                allDevices.data.push.apply(allDevices.data, resp.data);
                // suppose that if # of devices is less that the page size, then all devices have already been retrieved
                if (resp.data.length < inventoryFilter.pageSize) {
                  resolve(allDevices);
                } else {
                  this.getChildDevices(id, resp.paging.nextPage, allDevices)
                    .then((np) => {
                      resolve(allDevices);
                    })
                    .catch((err) => reject(err));
                }
              }
            
            } else {
              reject(resp);
            }
          });
      });
    }
    async getDeviceList(referenceId: any, pageSize: any, currentPage: any, onlyChildDevice: boolean, deviceType) {
      let queryString = ''; 
      let response: any = null;
      const filter: object = {
        pageSize,
        withTotalPages: true,
        currentPage,
        query: (queryString ? queryString : ''),
      };
      if (onlyChildDevice && deviceType === 'Devices') {
        response = (await this.inventoryService.childDevicesList(referenceId, filter));
      } else if (onlyChildDevice && deviceType === 'Assets') {
        response = (await this.inventoryService.childAssetsList(referenceId, filter));
      } else {
        response = (await this.inventoryService.childAssetsList(referenceId, filter));
      }
      return response;
    }
    public downloadBinary(id): any {
    return this.inventoryBinaryService.download(id);
  }
  public createBinary(file): Promise<IResult<IManagedObjectBinary>> {
    return this.inventoryBinaryService.create(file, {
      deviceListImage: 'DefaultImage', file: { name: file.name }
    });
  }
  async getAlarmsForAsset(asset: IManagedObject): Promise<{
    minor: number,
    major: number,
    critical: number,
    warning: number
  }> {
    const filter = {
      dateFrom: '1970-01-01',
      dateTo: new Date().toISOString(),
      pageSize: 2000,
      severity: 'WARNING,MINOR,MAJOR,CRITICAL',
      source: asset.id,
      status: 'ACTIVE',
      withSourceAssets: true,
      withSourceDevices: true
    }
    const alarms = (await this.alarmService.list(filter)).data;
    const alarmCount = this.calculateAlarmCounts(alarms);
    return alarmCount;
  }
  private calculateAlarmCounts(alarms: IAlarm[]): {
    minor: number,
    major: number,
    critical: number,
    warning: number
  } {
    const alarmCount = {
      minor: 0,
      major: 0,
      critical: 0,
      warning: 0
    }

    alarms.forEach(alarm => {
      if (alarm.severity === Severity.CRITICAL) {
        alarmCount.critical += alarm.count
      } else if (alarm.severity === Severity.MAJOR) {
        alarmCount.major += alarm.count
      } else if (alarm.severity === Severity.MINOR) {
        alarmCount.minor += alarm.count
      } else if (alarm.severity === Severity.WARNING) {
        alarmCount.warning += alarm.count
      }
    });

    return alarmCount;
  }
}


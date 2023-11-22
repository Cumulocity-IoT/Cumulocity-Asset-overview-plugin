import { Injectable } from '@angular/core';
import { AlarmService, IAlarm, IManagedObject, IManagedObjectBinary, IResult, IResultList, InventoryBinaryService, InventoryService, Severity } from '@c8y/client';


@Injectable({
  providedIn: 'root',
})
export class GpAssetOverviewWidgetService {

  constructor(private inventoryService: InventoryService, private inventoryBinaryService: InventoryBinaryService,
    private alarmService: AlarmService) { }
  //assetOverview: Device[] = [];
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
  * This service will recursively get all the child devices for the given device id and return a promise with the result list.
  *
  * @param id ID of the managed object to check for child devices
  * @param pageToGet Number of the page passed to the API
  * @param allDevices Child Devices already found
  * @param display
  */
  getChildDevices(id: string, pageToGet: number, allDevices: { data: any[], res: any }): Promise<IResultList<IManagedObject>> {
    const inventoryFilter = {
      // fragmentType: 'c8y_IsDevice',
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
                  this.getChildDevices(id, resp.paging.nextPage, allDevices)
                    .then((np) => {
                      resolve(allDevices);
                    })
                    .catch((err) => reject(err));
                }
              }
              // resolve(resp);
            } else {
              reject(resp);
            }
          });
      });

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


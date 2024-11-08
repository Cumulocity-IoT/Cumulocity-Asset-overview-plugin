# Deprecation notice
This plugin is not further developed and it might break with upcoming Cumulocity IoT releases. Use it at your own risk.

The repository is archived but feel free to fork & adapt it to your needs in a new repo.

# Cumulocity Asset Overview Widget Plugin[<img width="35" src="https://user-images.githubusercontent.com/32765455/211497905-561e9197-18b9-43d5-a023-071d3635f4eb.png"/>](https://github.com/Cumulocity-IoT/Cumulocity-Asset-overview-plugin/releases/download/1.1.4/sag-ps-pkg-asset-overview-1.1.4.zip)

The Asset Overview Widget Plugin is the Cumulocity module federation plugin created using c8ycli.This plugin can be used in Application Builder or Cockpit. The Asset Overview Plugin helps you to display assets/devices in tree structure and data in the table view along with the navigation to the dashboards.


### Please choose Asset Overview Widget release based on Cumulocity/Application builder version:


|APPLICATION BUILDER&nbsp;|&nbsp;CUMULOCITY&nbsp;|&nbsp;ASSET OVERVIEW WIDGET PLUGIN&nbsp;|
|--------------------|------------|-----------------------------|
| 2.0.x              | >= 1018.x.x| 1.x.x                       |


<kbd>![Asset-Overview](assets/overview.PNG) </kbd>

<kbd>![Asset-Overview-New](assets/assetoverviewnew.PNG)</kbd>

<kbd>![Asset-Overview-Config](assets/config1.PNG) </kbd>

## What's new?

*  **Support Measurements:** Now Asset Overview plugin support realtime measurement. Measurement can be configurable in column 2 settings.

*  **Improved Column 2 Settings:** For the column 2 either the user can choose the configurable columns or can select the measurements for the device or assets.

*  **Expandable View::** Now user can control hierarchical view based configuration to display child devices/assets

*  **Dashboard Navigation(Cockpit Only):** Asset overview supports the navigation for the cockpit application. User can click on the image of the device/asset and can navigate to the device dashboard.


## Features

*  **Display Assets/Devices:** Display Assets/Devices in tree structure mode. It also supports child devices/assets.

*  **Display Assets/Devices in Tree Structure:** We can expand and collapse the hierarchical view of the tree structure.

*  **Pagination:** Configurable Paginations and option to set default page size. You can change the page size in the UI also
     
*  **Configurable Columns:** User can choose what to display in each column of tiles from available list.

*  **Dashboard Settings (App Builder /Blueprint Forge):** Ability to navigate to dashboard by providing dashboard Id.

*  **Custom Icon:** Ability to use the custom icon for the device.



## Prerequisites:
   Cumulocity c8ycli >=1018.x.x
   

## Installation

### Runtime Widget Deployment?

* This widget support runtime deployment. Download [Runtime Binary](https://github.com/Cumulocity-IoT/Cumulocity-Asset-overview-plugin/releases/download/1.1.4/sag-ps-pkg-asset-overview-1.1.4.zip) and install via Administrations --> Ecosystems  --> Extensions

## QuickStart

This guide will teach you how to add widget in your existing or new dashboard.

1. Open your application from App Switcher

2. Add new dashboard or navigate to existing dashboard

3. Click `Add Widget`

4. Search for `Asset Overview`

5. Select `Target Assets or Devices`

6. Follow the user guide and configure the relevant fields.

7. Click `Save`

Congratulations! Asset Overview is configured.

## User Guide

 *  **Target assets or devices:** User can select a device/asset or device/asset group. If group is selected, list of devices/assets will be display in the tree structure and details can be viewed in a table.
*  **UI Pagination:** User can select the page size from the UI using the drop down.
*  **Config Pagination:** User can select the page size from the configuration you can edit the plugin and set the page size.
*   **Upload Default Icon For Device:** User can select the drop down upload the icon for the device where default image is not available
*  **Column1 Settings:** User can select up to 5 fields to display in Column1 of tile. Based on that the asset or devices will be viewed as a table in the UI.
*  **Column2 Settings:** User can select up to 5 fields to display in Column2 of tile. Based on that the asset or devices will be viewed as a table in the UI. In Case if we need to display Measurements for the device. You can add data points and the column2 settings will be disabled.
*  **Add Data point:** Based on selected assets or devices, this field will be populated with available devices to select data points. User can select max 10 data point which is applicable for selected device or group of devices.
*  **Expand Child View:** User can enable the child view so that child of the device will expand in the tree structure.

*  **Dashboard Settings(Application Builder/Blueprint Forge):** This feature is available only in application builder. User can navigate to any other dashboard by providing below details:
    * **Device Type:** Select a device type. Navigation will be applied to all devices/assets of this device/asset type to a specific dashboard.
    * **Dashboard ID:** Dashboard ID of a dashboard where user need to navigate. You can find dashboard id in browser URL.
    * **DeviceId as Tab Group:** Select this option only if you are using Group Template as dashboard in application builder and selected deviceId as tabgroup field during group template configuration.
    * **TabGroup ID(optional):** If your dashboard is based on tab group then provide tab group id.

*  **Dashboard Navigation(Cockpit Only):** User can click on the image of the device/asset and can navigate to the device dashboard.

**Asset Overview On Screen Options:**

-   **Realtime** : On/Off Realtime option.
-   **Refresh**: Useful for force reload/refresh devices.
-   **Pagination**: Page navigation options.

---------------------------------

This widget is provided as-is and without warranty or support. They do not constitute part of the Cumulocity product suite. Users are free to use, fork and modify them, subject to the license agreement. While Cumulocity GmbH welcomes contributions, we cannot guarantee to include every contribution in the master project.
_____________________


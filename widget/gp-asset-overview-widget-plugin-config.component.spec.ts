import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GPAssetOverviewWidgetPluginConfig } from './gp-asset-overview-widget-plugin-config.component';

describe('GPAssetOverviewWidgetPluginConfig', () => {
  let component: GPAssetOverviewWidgetPluginConfig;
  let fixture: ComponentFixture<GPAssetOverviewWidgetPluginConfig>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GPAssetOverviewWidgetPluginConfig]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GPAssetOverviewWidgetPluginConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

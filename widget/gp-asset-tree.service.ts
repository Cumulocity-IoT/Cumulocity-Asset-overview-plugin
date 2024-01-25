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

import { Injectable } from "@angular/core";
import { IManagedObject } from "@c8y/client";

class assetTreeNode {
  deviceMO: IManagedObject= {
    creationTime: "",
    id: "",
    lastUpdated: "",
    owner: "",
    self: "",
    additionParents: undefined,
    assetParents: undefined,
    childAdditions: undefined,
    childAssets: undefined,
    childDevices: undefined,
    deviceParents: undefined
  };
  visible = false;
  isRoot = false;
  isLoading = false;
  hasChild = false;
  children = [];

  constructor(value: any, visible: boolean, isRoot: boolean) {
    this.deviceMO = value;
    this.visible = visible;
    this.isRoot = isRoot,
    this.children = [];
    if (this.deviceMO?.childAssets?.references.length > 0 || this.deviceMO?.childDevices?.references.length > 0) {
      this.hasChild = true;
    }
  }

  addChild(childNode: any) {
    this.children.push(childNode);
  }
  cleartree()
  {
    
    this.children=[];
  }
}

@Injectable({
  providedIn: 'root',
})
export class assetTreeNodeService {
   rootNode: assetTreeNode = null;
   childLoopCounter = 0;

  private findNode(root: any, targetValue: any) : assetTreeNode{
    if (!root) {
      return null;
    }

    if (root.deviceMO?.id === targetValue?.deviceMO?.id) {
      return root;
    }
    for (const child of root.children) {
      const result = this.findNode(child, targetValue);
      if (result) {
        return result;
      }
    }

   /*  const childNode = this.rootNode.children;
    while (this.childLoopCounter < childNode.length) {
      const result = this.findNode(childNode[this.childLoopCounter++], targetValue);
      if (result) {
        return result;
      }
    } */
    return null;
  }

  insertChildNode(targetValue, newNode) {
    this.childLoopCounter = 0;
    const targetNode = this.findNode(this.rootNode,targetValue);

    if (targetNode) {
      targetNode.addChild( new assetTreeNode(newNode, false, false));
    } else {
    }
    return this.rootNode;
  }

  createRoot(asset: any, isVisible: boolean, isRoot: boolean) {
    this.rootNode = new assetTreeNode(asset, isVisible, isRoot);
    return this.rootNode;
  }
  resetTree(){
    this.rootNode.cleartree();
  }

}

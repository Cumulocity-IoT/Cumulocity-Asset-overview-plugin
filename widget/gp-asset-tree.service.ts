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
      console.log(`Target node with value ${targetValue} not found.`);
    }
    return this.rootNode;
  }

  createRoot(asset: any, isVisible: boolean, isRoot: boolean) {
    this.rootNode = new assetTreeNode(asset, isVisible, isRoot);
    return this.rootNode;
  }

}

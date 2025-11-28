export interface TreeItem {
  id: number | string;
  parent: number | string | null;
  [key: string]: any;
}

export class TreeStore {
  private items: TreeItem[];
  private itemMap: Map<number | string, TreeItem>;
  private childrenMap: Map<number | string | null, TreeItem[]>;

  constructor(items: TreeItem[]) {
    this.items = [];
    this.itemMap = new Map();
    this.childrenMap = new Map();

    items.forEach((item) => this.addItem(item));
  }

  getAll(): TreeItem[] {
    return this.items;
  }

  getItem(id: number | string): TreeItem | undefined {
    return this.itemMap.get(id);
  }

  getChildren(id: number | string): TreeItem[] {
    return this.childrenMap.get(id) || [];
  }

  getAllChildren(id: number | string): TreeItem[] {
    const result: TreeItem[] = [];
    const stack: TreeItem[] = [...this.getChildren(id)];

    while (stack.length > 0) {
      const item = stack.pop();
      if (item) {
        result.push(item);
        const children = this.getChildren(item.id);
        stack.push(...children);
      }
    }
    return result;
  }

  getAllParents(id: number | string): TreeItem[] {
    const result: TreeItem[] = [];
    let currentItem = this.getItem(id);

    while (currentItem) {
      result.push(currentItem);
      if (currentItem.parent === null) {
        break;
      }
      currentItem = this.getItem(currentItem.parent);
    }

    return result;
  }

  addItem(item: TreeItem): void {
    if (this.itemMap.has(item.id)) {
      return;
    }

    this.items.push(item);
    this.itemMap.set(item.id, item);

    const parentId = item.parent;
    if (!this.childrenMap.has(parentId)) {
      this.childrenMap.set(parentId, []);
    }
    this.childrenMap.get(parentId)!.push(item);
  }

  removeItem(id: number | string): void {
    const itemToRemove = this.getItem(id);
    if (!itemToRemove) return;

    const descendants = this.getAllChildren(id);
    const idsToRemove = new Set([id, ...descendants.map((i) => i.id)]);

    this.items = this.items.filter((item) => !idsToRemove.has(item.id));

    idsToRemove.forEach((idToRemove) => {
      const item = this.itemMap.get(idToRemove);
      if (item) {
        this.itemMap.delete(idToRemove);
      }
      this.childrenMap.delete(idToRemove);
    });

    const parentId = itemToRemove.parent;
    if (this.childrenMap.has(parentId)) {
      const siblings = this.childrenMap.get(parentId)!;
      this.childrenMap.set(
        parentId,
        siblings.filter((sibling) => sibling.id !== id)
      );
    }
  }

  updateItem(updatedItem: TreeItem): void {
    const currentItem = this.getItem(updatedItem.id);
    if (!currentItem) return;

    const oldParent = currentItem.parent;
    const newParent = updatedItem.parent;

    Object.assign(currentItem, updatedItem);

    if (oldParent !== newParent) {
      if (this.childrenMap.has(oldParent)) {
        const siblings = this.childrenMap.get(oldParent)!;
        this.childrenMap.set(
          oldParent,
          siblings.filter((sibling) => sibling.id !== currentItem.id)
        );
      }

      if (!this.childrenMap.has(newParent)) {
        this.childrenMap.set(newParent, []);
      }
      this.childrenMap.get(newParent)!.push(currentItem);
    }
  }
}

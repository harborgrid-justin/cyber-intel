
class BTreeNode<T> {
  keys: string[] = [];
  values: T[] = [];
  children: BTreeNode<T>[] = [];
  isLeaf = true;
}

export class BTree<T> {
  private root = new BTreeNode<T>();
  private order = 3; // Max children

  insert(key: string, value: T) {
    const r = this.root;
    if (r.keys.length === this.order - 1) {
      const s = new BTreeNode<T>();
      this.root = s;
      s.isLeaf = false;
      s.children.push(r);
      this.splitChild(s, 0);
      this.insertNonFull(s, key, value);
    } else {
      this.insertNonFull(r, key, value);
    }
  }

  search(key: string): T | null {
    return this.searchNode(this.root, key);
  }

  private searchNode(node: BTreeNode<T>, key: string): T | null {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (i < node.keys.length && key === node.keys[i]) return node.values[i];
    if (node.isLeaf) return null;
    return this.searchNode(node.children[i], key);
  }

  private splitChild(x: BTreeNode<T>, i: number) {
    const t = Math.ceil(this.order / 2);
    const y = x.children[i];
    const z = new BTreeNode<T>();
    z.isLeaf = y.isLeaf;

    // Move second half of keys/values to Z
    z.keys = y.keys.splice(t - 1);
    z.values = y.values.splice(t - 1);
    if (!y.isLeaf) z.children = y.children.splice(t);

    x.children.splice(i + 1, 0, z);
    x.keys.splice(i, 0, y.keys.pop()!);
    x.values.splice(i, 0, y.values.pop()!);
  }

  private insertNonFull(x: BTreeNode<T>, key: string, value: T) {
    let i = x.keys.length - 1;
    if (x.isLeaf) {
      while (i >= 0 && key < x.keys[i]) i--;
      x.keys.splice(i + 1, 0, key);
      x.values.splice(i + 1, 0, value);
    } else {
      while (i >= 0 && key < x.keys[i]) i--;
      i++;
      if (x.children[i].keys.length === this.order - 1) {
        this.splitChild(x, i);
        if (key > x.keys[i]) i++;
      }
      this.insertNonFull(x.children[i], key, value);
    }
  }
}

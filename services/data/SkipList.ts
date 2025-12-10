
class SkipNode<T> {
  forward: SkipNode<T>[];
  key: string;
  value: T;

  constructor(key: string, value: T, level: number) {
    this.key = key;
    this.value = value;
    this.forward = new Array(level + 1).fill(null);
  }
}

export class SkipList<T> {
  private head: SkipNode<T>;
  private level = 0;
  private maxLevel = 16;
  private p = 0.5;

  constructor() {
    this.head = new SkipNode<T>('', null as any, this.maxLevel);
  }

  insert(key: string, value: T) {
    const update = new Array(this.maxLevel + 1).fill(null);
    let curr = this.head;

    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].key < key) {
        curr = curr.forward[i];
      }
      update[i] = curr;
    }

    const lvl = this.randomLevel();
    if (lvl > this.level) {
      for (let i = this.level + 1; i <= lvl; i++) {
        update[i] = this.head;
      }
      this.level = lvl;
    }

    const newNode = new SkipNode(key, value, lvl);
    for (let i = 0; i <= lvl; i++) {
      newNode.forward[i] = update[i].forward[i];
      update[i].forward[i] = newNode;
    }
  }

  search(key: string): T | null {
    let curr = this.head;
    for (let i = this.level; i >= 0; i--) {
      while (curr.forward[i] && curr.forward[i].key < key) {
        curr = curr.forward[i];
      }
    }
    curr = curr.forward[0];
    if (curr && curr.key === key) return curr.value;
    return null;
  }

  private randomLevel(): number {
    let lvl = 0;
    while (Math.random() < this.p && lvl < this.maxLevel) lvl++;
    return lvl;
  }
}

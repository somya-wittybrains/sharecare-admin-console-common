export class Branch {
  id = '';
  name = '';
  children = [];

  constructor(id, name, children, sortBy) {
    this.id = id;
    this.name = name;
    this.sortBy = sortBy;
    this.children = [].concat(children).sort((item1, item2) => {
      if (!sortBy) return 0;
      if (sortBy === 'ASC') {
        return item1.name.toLowerCase().localeCompare(item2.name.toLowerCase());
      }
      return item2.name.toLowerCase().localeCompare(item1.name.toLowerCase());
    });
  }

  filter(values) {
    const newChildren = this.children.reduce((all, child) => {
      const newChild = child instanceof Branch ? child.filter(values) : child;
      if (newChild instanceof Leaf && values.includes(newChild.value)) {
        return all.concat(newChild);
      } else if (newChild instanceof Branch && newChild.children.length) {
        return all.concat(newChild);
      } else {
        return all;
      }
    }, []);

    return new Branch(this.id, this.name, newChildren, this.sortBy);
  }

  groupOnParent(values) {
    values.forEach(value => {});
  }

  get isTerminal() {
    return !this.children.some(child => child instanceof Branch);
  }

  get branches() {
    return this.children.filter(child => child instanceof Branch);
  }

  get leaves() {
    return this.children.filter(child => child instanceof Leaf);
  }

  get values() {
    return this.leaves
      .map(({ value }) => value)
      .concat(
        this.branches.reduce((all, branch) => all.concat(branch.values), [])
      );
  }
}

export class Leaf {
  id = '';
  name = '';
  value = '';
  restrictiveOrder = -1;

  constructor(id, name, value, restrictiveOrder = -1) {
    this.id = id;
    this.name = name;
    this.value = value;
    this.restrictiveOrder = restrictiveOrder;
  }
}

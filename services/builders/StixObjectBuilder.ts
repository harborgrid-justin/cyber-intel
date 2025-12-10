
interface StixObject {
  type: string;
  spec_version: string;
  id: string;
  created: string;
  modified: string;
  [key: string]: any;
}

export class StixObjectBuilder {
  private object: Partial<StixObject>;

  constructor() {
    this.object = {
      spec_version: '2.1',
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };
  }

  setType(type: 'indicator' | 'malware' | 'campaign') {
    this.object.type = type;
    this.object.id = `${type}--${crypto.randomUUID()}`;
    return this;
  }

  setName(name: string) {
    this.object['name'] = name;
    return this;
  }

  setPattern(pattern: string) {
    if (this.object.type !== 'indicator') throw new Error("Pattern only valid for Indicators");
    this.object['pattern'] = pattern;
    this.object['pattern_type'] = 'stix';
    return this;
  }

  setDescription(desc: string) {
    this.object['description'] = desc;
    return this;
  }

  build(): StixObject {
    if (!this.object.type || !this.object.id) {
      throw new Error("STIX Object requires Type");
    }
    return this.object as StixObject;
  }
}

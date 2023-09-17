const { EntitySchema } = require("@mikro-orm/core");

/**
 * @property {number} id
 * @property {string} name
 * @property {string} apiKey
 * @property {string} printerURL
 * @property {boolean} enabled
 * @property {string} disabledReason
 * @property {number} dateAdded
 * @property {number} flowRate
 */
class Printer {
  constructor() {
    this.id = null;
    this.name = null;
    this.apiKey = null;
    this.printerURL = null;
    this.enabled = true;
    this.disabledReason = null;
    this.dateAdded = null;
    // this.lastPrintedFile = null;
    // this.fileList = {
    //   files: [],
    //   folders: [],
    //   free: 0,
    //   total: 0,
    // };
    this.feedRate = null;
    this.flowRate = null;
  }
}

const schema = new EntitySchema({
  class: Printer,
  properties: {
    id: { primary: true, type: "number" },
    name: { type: "string", nullable: false },
    apiKey: { type: "string" },
    printerURL: { type: "string" },
    enabled: { type: "boolean", default: true },
    disabledReason: { type: "string", nullable: true },
    dateAdded: { type: "number", nullable: true },
    // TODO move to own entity
    // lastPrintedFile: { type: "json", nullable: true },
    // TODO move to own entity
    // fileList: {
    //   type: "json",
    //   defaultValue: {
    //     files: [],
    //     folders: [],
    //     free: 0,
    //     total: 0,
    //   },
    // },
    feedRate: { type: "number", nullable: true },
    flowRate: { type: "number", nullable: true },
  },
});

module.exports.Printer = Printer;
module.exports.entity = Printer;
module.exports.schema = schema;

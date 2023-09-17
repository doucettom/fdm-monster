const { Migration } = require("@mikro-orm/migrations");

class Migration20230819213101 extends Migration {
  async up() {
    this.addSql(
      "create table `printer` (`id` integer not null primary key autoincrement, `api_key` text not null, `printer_url` text not null, `enabled` integer not null default true, `disabled_reason` text null, `settings_appearance` json not null, `current_user` text null, `date_added` integer null, `last_printed_file` json null, `file_list` json not null, `feed_rate` integer null, `flow_rate` integer null);"
    );
  }
}

module.exports = { Migration20230819213101 };

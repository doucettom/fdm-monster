import { Migration } from "@mikro-orm/migrations";

export class Migration20230924112637 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      "create table `floor` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` text not null, `floor` integer not null);"
    );
    this.addSql("create unique index `floor_floor_unique` on `floor` (`floor`);");

    this.addSql(
      "create table `printer` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` text not null, `api_key` text not null, `printer_url` text not null, `enabled` integer not null default true, `disabled_reason` text null default null);"
    );

    this.addSql(
      "create table `floor_position` (`floor_id` integer not null, `printer_id` integer not null, `x` integer not null, `y` integer not null, constraint `floor_position_floor_id_foreign` foreign key(`floor_id`) references `floor`(`id`) on update cascade, constraint `floor_position_printer_id_foreign` foreign key(`printer_id`) references `printer`(`id`) on update cascade, primary key (`floor_id`, `printer_id`));"
    );
    this.addSql("create index `floor_position_floor_id_index` on `floor_position` (`floor_id`);");
    this.addSql("create index `floor_position_printer_id_index` on `floor_position` (`printer_id`);");

    this.addSql(
      "create table `settings` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `server` json not null, `credentials` json not null, `wizard` json not null, `printer_file_clean` json not null, `frontend` json not null, `timeout` json not null);"
    );
  }

  async down(): Promise<void> {
    this.addSql("drop table if exists `floor`;");

    this.addSql("drop table if exists `printer`;");

    this.addSql("drop table if exists `floor_position`;");

    this.addSql("drop table if exists `settings`;");
  }
}

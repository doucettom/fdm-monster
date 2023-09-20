import { Migration } from '@mikro-orm/migrations';

export class Migration20230917181754 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `printer` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` text not null, `api_key` text not null, `printer_url` text not null, `enabled` integer not null, `disabled_reason` text not null, `feed_rate` integer not null, `flow_rate` integer not null);');
  }

}

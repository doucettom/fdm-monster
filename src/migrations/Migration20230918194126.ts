import { Migration } from '@mikro-orm/migrations';

export class Migration20230918194126 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `floor` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `name` text not null, `floor` integer not null);');
    this.addSql('create unique index `floor_floor_unique` on `floor` (`floor`);');

    this.addSql('alter table `printer` add column `floor_id` integer not null constraint `printer_floor_id_foreign` references `floor` (`id`) on update cascade;');
    this.addSql('create index `printer_floor_id_index` on `printer` (`floor_id`);');
  }

}

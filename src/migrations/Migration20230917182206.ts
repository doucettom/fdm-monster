import { Migration } from '@mikro-orm/migrations';

export class Migration20230917182206 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `settings` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `server` json null);');
  }

}

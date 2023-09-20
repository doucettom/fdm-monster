import { Migration } from '@mikro-orm/migrations';

export class Migration20230917204040 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `settings` add column `credentials` json not null;');
    this.addSql('alter table `settings` add column `wizard` json not null;');
    this.addSql('alter table `settings` add column `printer_file_clean` json not null;');
    this.addSql('alter table `settings` add column `frontend` json not null;');
    this.addSql('alter table `settings` add column `timeout` json not null;');
  }

}

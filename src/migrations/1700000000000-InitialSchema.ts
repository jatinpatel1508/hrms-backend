import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'varchar' },
          { name: 'firstName', type: 'varchar' },
          { name: 'lastName', type: 'varchar' },
          {
            name: 'role',
            type: 'enum',
            enum: ['employee', 'manager', 'admin'],
            default: "'employee'",
          },
          { name: 'hourlyRate', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Projects table
    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'billingRate', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Time logs table
    await queryRunner.createTable(
      new Table({
        name: 'time_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'project_id', type: 'uuid', isNullable: true },
          { name: 'startTime', type: 'timestamp' },
          { name: 'endTime', type: 'timestamp', isNullable: true },
          { name: 'duration', type: 'integer', default: 0 },
          { name: 'idleTime', type: 'integer', default: 0 },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // App usage logs table
    await queryRunner.createTable(
      new Table({
        name: 'app_usage_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'appName', type: 'varchar' },
          { name: 'windowTitle', type: 'varchar', isNullable: true },
          { name: 'startTime', type: 'timestamp' },
          { name: 'endTime', type: 'timestamp', isNullable: true },
          { name: 'duration', type: 'integer', default: 0 },
          { name: 'isProductive', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Screenshots table
    await queryRunner.createTable(
      new Table({
        name: 'screenshots',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'filePath', type: 'varchar' },
          { name: 'fileName', type: 'varchar' },
          { name: 'fileSize', type: 'bigint' },
          {
            name: 'type',
            type: 'enum',
            enum: ['full', 'blurred', 'thumbnail'],
            default: "'full'",
          },
          { name: 'capturedAt', type: 'timestamp' },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Payroll records table
    await queryRunner.createTable(
      new Table({
        name: 'payroll_records',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'user_id', type: 'uuid' },
          { name: 'periodStart', type: 'date' },
          { name: 'periodEnd', type: 'date' },
          { name: 'totalHours', type: 'integer', default: 0 },
          { name: 'idleHours', type: 'integer', default: 0 },
          { name: 'hourlyRate', type: 'decimal', precision: 10, scale: 2 },
          { name: 'totalAmount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'isPaid', type: 'boolean', default: false },
          { name: 'paidAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Settings table
    await queryRunner.createTable(
      new Table({
        name: 'settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'key', type: 'varchar', isUnique: true },
          { name: 'value', type: 'text' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'isUserConfigurable', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Foreign keys - check if they exist before creating
    const timeLogsTable = await queryRunner.getTable('time_logs');
    if (timeLogsTable) {
      const fkUserExists = timeLogsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (!fkUserExists) {
        await queryRunner.createForeignKey(
          'time_logs',
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          }),
        );
      }

      const fkProjectExists = timeLogsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('project_id') !== -1,
      );
      if (!fkProjectExists) {
        await queryRunner.createForeignKey(
          'time_logs',
          new TableForeignKey({
            columnNames: ['project_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'projects',
            onDelete: 'SET NULL',
          }),
        );
      }
    }

    const appUsageLogsTable = await queryRunner.getTable('app_usage_logs');
    if (appUsageLogsTable) {
      const fkExists = appUsageLogsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (!fkExists) {
        await queryRunner.createForeignKey(
          'app_usage_logs',
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          }),
        );
      }
    }

    const screenshotsTable = await queryRunner.getTable('screenshots');
    if (screenshotsTable) {
      const fkExists = screenshotsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (!fkExists) {
        await queryRunner.createForeignKey(
          'screenshots',
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          }),
        );
      }
    }

    const payrollRecordsTable = await queryRunner.getTable('payroll_records');
    if (payrollRecordsTable) {
      const fkExists = payrollRecordsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (!fkExists) {
        await queryRunner.createForeignKey(
          'payroll_records',
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payroll_records', true);
    await queryRunner.dropTable('screenshots', true);
    await queryRunner.dropTable('app_usage_logs', true);
    await queryRunner.dropTable('time_logs', true);
    await queryRunner.dropTable('settings', true);
    await queryRunner.dropTable('projects', true);
    await queryRunner.dropTable('users', true);
  }
}


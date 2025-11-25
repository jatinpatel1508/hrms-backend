import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddCompanyMultiTenancy1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create companies table
    await queryRunner.createTable(
      new Table({
        name: 'companies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar' },
          { name: 'domain', type: 'varchar', isNullable: true },
          { name: 'address', type: 'text', isNullable: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'email', type: 'varchar', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'subscriptionPlan', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Create tasks table
    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'project_id', type: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'in-progress', 'completed', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'medium', 'high'],
            default: "'medium'",
          },
          { name: 'assigned_user_id', type: 'uuid', isNullable: true },
          { name: 'dueDate', type: 'date', isNullable: true },
          { name: 'estimatedHours', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    // Add company_id to users table
    await queryRunner.addColumn('users', new TableColumn({
      name: 'company_id',
      type: 'uuid',
      isNullable: true, // Temporarily nullable for migration
    }));

    // Create default company
    const defaultCompanyId = '00000000-0000-0000-0000-000000000000';
    await queryRunner.query(`
      INSERT INTO companies (id, name, "isActive", "createdAt", "updatedAt")
      VALUES ($1, 'Default Company', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT DO NOTHING
    `, [defaultCompanyId]);

    // Migrate existing users to default company
    await queryRunner.query(`
      UPDATE users SET company_id = $1 WHERE company_id IS NULL
    `, [defaultCompanyId]);

    // Make company_id required
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN company_id SET NOT NULL
    `);

    // Drop old unique constraint on email
    await queryRunner.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key
    `);

    // Add unique constraint on email + company_id
    await queryRunner.createIndex('users', new TableIndex({
      name: 'IDX_users_email_company',
      columnNames: ['email', 'company_id'],
      isUnique: true,
    }));

    // Add super_admin to role enum if not exists
    // Find any enum type that contains the role values (employee, manager, admin)
    const roleEnums = await queryRunner.query(`
      SELECT DISTINCT t.typname as enum_name
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE e.enumlabel IN ('employee', 'manager', 'admin')
      GROUP BY t.typname
      HAVING COUNT(DISTINCT e.enumlabel) = 3
      LIMIT 1;
    `);
    
    if (roleEnums && roleEnums.length > 0) {
      const enumName = roleEnums[0].enum_name;
      
      // Check if super_admin already exists in the enum
      const enumValues = await queryRunner.query(`
        SELECT enumlabel FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = $1);
      `, [enumName]);
      
      const hasSuperAdmin = enumValues.some((v: any) => v.enumlabel === 'super_admin');
      
      if (!hasSuperAdmin) {
        // Add super_admin value to existing enum
        await queryRunner.query(`
          ALTER TYPE ${enumName} ADD VALUE 'super_admin';
        `);
      }
    }
    // If enum doesn't exist, it means the initial migration didn't run properly
    // In that case, TypeORM will handle it when synchronize is true or when entities are loaded

    // Add company_id to projects
    await queryRunner.addColumn('projects', new TableColumn({
      name: 'company_id',
      type: 'uuid',
      isNullable: true,
    }));

    await queryRunner.query(`
      UPDATE projects SET company_id = $1 WHERE company_id IS NULL
    `, [defaultCompanyId]);

    await queryRunner.query(`
      ALTER TABLE projects ALTER COLUMN company_id SET NOT NULL
    `);

    // Add company_id to time_logs
    await queryRunner.addColumn('time_logs', new TableColumn({
      name: 'company_id',
      type: 'uuid',
      isNullable: true,
    }));

    await queryRunner.query(`
      UPDATE time_logs SET company_id = (SELECT company_id FROM users WHERE users.id = time_logs.user_id)
      WHERE company_id IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE time_logs ALTER COLUMN company_id SET NOT NULL
    `);

    // Add company_id to app_usage_logs
    await queryRunner.addColumn('app_usage_logs', new TableColumn({
      name: 'company_id',
      type: 'uuid',
      isNullable: true,
    }));

    await queryRunner.query(`
      UPDATE app_usage_logs SET company_id = (SELECT company_id FROM users WHERE users.id = app_usage_logs.user_id)
      WHERE company_id IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE app_usage_logs ALTER COLUMN company_id SET NOT NULL
    `);

    // Add company_id to screenshots
    await queryRunner.addColumn('screenshots', new TableColumn({
      name: 'company_id',
      type: 'uuid',
      isNullable: true,
    }));

    await queryRunner.query(`
      UPDATE screenshots SET company_id = (SELECT company_id FROM users WHERE users.id = screenshots.user_id)
      WHERE company_id IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE screenshots ALTER COLUMN company_id SET NOT NULL
    `);

    // Add company_id to payroll_records
    await queryRunner.addColumn('payroll_records', new TableColumn({
      name: 'company_id',
      type: 'uuid',
      isNullable: true,
    }));

    await queryRunner.query(`
      UPDATE payroll_records SET company_id = (SELECT company_id FROM users WHERE users.id = payroll_records.user_id)
      WHERE company_id IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE payroll_records ALTER COLUMN company_id SET NOT NULL
    `);

    // Add company_id to settings (nullable for global settings)
    await queryRunner.addColumn('settings', new TableColumn({
      name: 'company_id',
      type: 'uuid',
      isNullable: true,
    }));

    // Drop old unique constraint on settings key
    await queryRunner.query(`
      ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_key_key
    `);

    // Add unique constraint on key + company_id
    await queryRunner.createIndex('settings', new TableIndex({
      name: 'IDX_settings_key_company',
      columnNames: ['key', 'company_id'],
      isUnique: true,
    }));

    // Add foreign keys
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'projects',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        columnNames: ['assigned_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'time_logs',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'app_usage_logs',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'screenshots',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'payroll_records',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'settings',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes for performance
    await queryRunner.createIndex('users', new TableIndex({
      name: 'IDX_users_company',
      columnNames: ['company_id'],
    }));

    await queryRunner.createIndex('projects', new TableIndex({
      name: 'IDX_projects_company',
      columnNames: ['company_id'],
    }));

    await queryRunner.createIndex('tasks', new TableIndex({
      name: 'IDX_tasks_project',
      columnNames: ['project_id'],
    }));

    await queryRunner.createIndex('time_logs', new TableIndex({
      name: 'IDX_time_logs_company',
      columnNames: ['company_id'],
    }));

    await queryRunner.createIndex('app_usage_logs', new TableIndex({
      name: 'IDX_app_usage_company',
      columnNames: ['company_id'],
    }));

    await queryRunner.createIndex('screenshots', new TableIndex({
      name: 'IDX_screenshots_company',
      columnNames: ['company_id'],
    }));

    await queryRunner.createIndex('payroll_records', new TableIndex({
      name: 'IDX_payroll_company',
      columnNames: ['company_id'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('settings', 'FK_settings_company');
    await queryRunner.dropForeignKey('payroll_records', 'FK_payroll_records_company');
    await queryRunner.dropForeignKey('screenshots', 'FK_screenshots_company');
    await queryRunner.dropForeignKey('app_usage_logs', 'FK_app_usage_logs_company');
    await queryRunner.dropForeignKey('time_logs', 'FK_time_logs_company');
    await queryRunner.dropForeignKey('tasks', 'FK_tasks_assigned_user');
    await queryRunner.dropForeignKey('tasks', 'FK_tasks_project');
    await queryRunner.dropForeignKey('projects', 'FK_projects_company');
    await queryRunner.dropForeignKey('users', 'FK_users_company');

    // Drop indexes
    await queryRunner.dropIndex('payroll_records', 'IDX_payroll_company');
    await queryRunner.dropIndex('screenshots', 'IDX_screenshots_company');
    await queryRunner.dropIndex('app_usage_logs', 'IDX_app_usage_company');
    await queryRunner.dropIndex('time_logs', 'IDX_time_logs_company');
    await queryRunner.dropIndex('tasks', 'IDX_tasks_project');
    await queryRunner.dropIndex('projects', 'IDX_projects_company');
    await queryRunner.dropIndex('users', 'IDX_users_company');
    await queryRunner.dropIndex('users', 'IDX_users_email_company');
    await queryRunner.dropIndex('settings', 'IDX_settings_key_company');

    // Remove company_id columns
    await queryRunner.dropColumn('settings', 'company_id');
    await queryRunner.dropColumn('payroll_records', 'company_id');
    await queryRunner.dropColumn('screenshots', 'company_id');
    await queryRunner.dropColumn('app_usage_logs', 'company_id');
    await queryRunner.dropColumn('time_logs', 'company_id');
    await queryRunner.dropColumn('projects', 'company_id');
    await queryRunner.dropColumn('users', 'company_id');

    // Restore unique constraint on email
    await queryRunner.query(`
      ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email)
    `);

    // Drop tasks table
    await queryRunner.dropTable('tasks', true);

    // Drop companies table
    await queryRunner.dropTable('companies', true);
  }
}


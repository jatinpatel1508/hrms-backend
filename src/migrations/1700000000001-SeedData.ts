import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedData1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await queryRunner.query(`
      INSERT INTO users (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
      VALUES (
        '00000000-0000-0000-0000-000000000001',
        'admin@hrms.com',
        $1,
        'Admin',
        'User',
        'super_admin',
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    // Create default settings
    await queryRunner.query(`
      INSERT INTO settings (id, key, value, description, "isUserConfigurable", "createdAt", "updatedAt")
      VALUES
        (gen_random_uuid(), 'screenshot_interval', '5', 'Screenshot capture interval in minutes', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), 'screenshot_type', 'full', 'Screenshot type: full, blurred, or thumbnail', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), 'screenshot_blur', '10', 'Blur amount for blurred screenshots', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        (gen_random_uuid(), 'idle_threshold', '5', 'Idle detection threshold in minutes', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM settings WHERE key IN ('screenshot_interval', 'screenshot_type', 'screenshot_blur', 'idle_threshold')`);
    await queryRunner.query(`DELETE FROM users WHERE email = 'admin@hrms.com'`);
  }
}


import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddTaskIdToTimeLogs1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if task_id column already exists
    const table = await queryRunner.getTable('time_logs');
    const hasTaskIdColumn = table?.columns.find(column => column.name === 'task_id');

    if (!hasTaskIdColumn) {
      // Add task_id column
      await queryRunner.addColumn(
        'time_logs',
        new TableColumn({
          name: 'task_id',
          type: 'uuid',
          isNullable: true,
        }),
      );

      // Add foreign key constraint
      const foreignKeyExists = table?.foreignKeys.find(
        fk => fk.columnNames.includes('task_id')
      );

      if (!foreignKeyExists) {
        await queryRunner.createForeignKey(
          'time_logs',
          new TableForeignKey({
            columnNames: ['task_id'],
            referencedTableName: 'tasks',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('time_logs');
    const foreignKey = table?.foreignKeys.find(
      fk => fk.columnNames.includes('task_id')
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey('time_logs', foreignKey);
    }

    const hasTaskIdColumn = table?.columns.find(column => column.name === 'task_id');
    if (hasTaskIdColumn) {
      await queryRunner.dropColumn('time_logs', 'task_id');
    }
  }
}


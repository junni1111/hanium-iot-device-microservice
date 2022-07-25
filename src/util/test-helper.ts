import { getConnection } from 'typeorm';

export async function clearDB() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Do Not Call Test Helper Function In Production Mode!');
  }

  const entities = getConnection().entityMetadatas;
  for (const entity of entities) {
    const repository = await getConnection().getRepository(entity.name);
    await repository.query(
      `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
    );
  }
}

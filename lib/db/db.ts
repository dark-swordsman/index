// docker run --name index-db -d -p 27017:27017 mongo
import { MongoClient, ObjectId } from 'mongodb'
import { hasOwnProperty } from '../utils'

const uri =
  'DATABASE_URL' in process.env
    ? process.env.DATABASE_URL
    : 'mongodb://localhost'

export const dbClient = new MongoClient(uri, { maxPoolSize: 5 }).connect()

export async function exportData(isAdmin = false) {
  if (isAdmin) {
    return {
      collections: await getAll('collections'),
      columns: await getAll('columns'),
      items: await getAll('items'),
      libraries: await getAll('libraries'),
      lists: await getAll('lists'),
      users: await getAll('users'),
    }
  }

  return {
    collections: await getAll('collections'),
    columns: await getAll('columns'),
    items: await getAll('items'),
    libraries: await getAll('libraries'),
  }
}

export function cleanId(data: Record<string, any>) {
  if (typeof data !== 'undefined' && data !== null) {
    if (Array.isArray(data)) {
      return data.map((d) => cleanId(d))
    }
    if (hasOwnProperty(data, '_id')) {
      data._id = data._id.toString()
    }
    if (hasOwnProperty(data, 'lastModified')) {
      data.lastModified = data.lastModified.toString()
    }
    if (hasOwnProperty(data, 'createdAt')) {
      data.createdAt = data.createdAt.toString()
    }
  }
  return data
}

export function polluteId(query: Record<string, any>) {
  if (typeof query !== 'undefined') {
    if (hasOwnProperty(query, '_id') && typeof query._id === 'string') {
      query._id = new ObjectId(query._id)
    }
    if (
      hasOwnProperty(query, 'lastModified') &&
      typeof query.lastModified === 'string'
    ) {
      query.lastModified = new Date(query.lastModified)
    }
  }
  return query
}

export async function getAll(collection: string): Promise<object[]> {
  const db = (await dbClient).db()
  let data = await db.collection(collection).find().toArray()
  if (data.length > 0 && hasOwnProperty(data[0], 'name')) {
    data = data.sort((a, b) => (a.name < b.name ? -1 : 1))
  }

  return cleanId(data)
}

export async function find(
  collection: string,
  query: Record<string, any>
): Promise<object[]> {
  const db = (await dbClient).db()
  return cleanId(
    await db.collection(collection).find(polluteId(query)).toArray()
  )
}

export async function findOne(
  collection: string,
  query: Record<string, any>
): Promise<object | null> {
  const db = (await dbClient).db()
  return cleanId(await db.collection(collection).findOne(polluteId(query)))
}

export async function count(
  collection: string,
  query: Record<string, any> = {}
): Promise<number> {
  const db = (await dbClient).db()
  return await db.collection(collection).countDocuments(polluteId(query))
}

export async function getByUrlId(
  collection: string,
  urlId: string
): Promise<object | null> {
  return await findOne(collection, { urlId })
}

export async function insert(
  collection: string,
  data: Record<string, any>
): Promise<string> {
  const db = (await dbClient).db()
  data.createdAt = new Date()
  data.lastModified = new Date()
  const { insertedId } = await db.collection(collection).insertOne(data)
  return insertedId.toString()
}

export async function updateOne(
  collection: string,
  query: Record<string, any>,
  data: Record<string, any>
) {
  const db = (await dbClient).db()
  await db.collection(collection).updateOne(polluteId(query), {
    $set: data,
    $currentDate: { lastModified: true },
  })
}

export async function deleteOne(
  collection: string,
  query: Record<string, any>
) {
  const db = (await dbClient).db()
  await db.collection(collection).deleteOne(polluteId(query))
}

import type {SanityClient} from '@sanity/client'

export function fetchMetadataDocument<T>(
  client: SanityClient,
  id: string,
  scope: string
): Promise<T | null> {
  if (!id) return Promise.resolve(null)
  return client.fetch(`*[_id == $id][0]`, {
    id,
  })
}

export async function saveMetadataDocument(
  client: SanityClient,
  id: string,
  scope: string,
  metadata: Record<string, any>
): Promise<unknown> {
  const tr = client
    .transaction()
    .createIfNotExists({_id: id, _type: `metadata.${scope}`})
    .patch(id, (p) => p.set(metadata))

  return tr.commit()
}

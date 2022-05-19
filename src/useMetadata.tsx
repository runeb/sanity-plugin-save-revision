import React, {useState, useCallback, useEffect} from 'react'
import sanityClient from 'part:@sanity/base/client'
import documentStore from 'part:@sanity/base/datastore/document'
import {useCurrentUser} from '@sanity/base/hooks'
import type {CurrentUser} from '@sanity/types'
import {useLoadable} from './useLoadable'
import type {SanityClient} from '@sanity/client'
import {useMemo} from 'react'

const client = sanityClient.withConfig({
  apiVersion: '2022-01-01',
}) as SanityClient

type MetadataConfig = {
  scope: string
  documentId: string
}

// Only save name and id from user

export function useMetadata<T>({scope, documentId}) {
  const metadataId = `metadata.${scope}.${documentId}`

  type MetadataDocument = {
    entries: ({_key:string} & T)[]
  }

  const loadMetadata = useLoadable<MetadataDocument>(
    useMemo(
      () => documentStore.listenQuery<MetadataDocument>(`* [_id == $id][0]`, {id: metadataId}),
      [metadataId]
    )
  )

  const addEntry = useCallback(
    (entry: T) => {
      const patch = client.patch(metadataId).setIfMissing({entries: []}).append('entries', [entry])

      const tr = client
        .transaction()
        .createIfNotExists({_id: metadataId, _type: `metadata.${scope}`})
        .patch(patch)

      return tr.commit({autoGenerateArrayKeys: true})
    },
    [metadataId]
  )

  const removeEntry = useCallback(
    (entry: {_key: string}) => {
      client
        .patch(metadataId)
        .unset([`entries[_key=="${entry._key}"]`])
        .commit()
    },
    [metadataId]
  )

  return [loadMetadata, addEntry, removeEntry] as const
}

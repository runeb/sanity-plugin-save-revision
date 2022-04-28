import React, {useState, useCallback, useEffect} from 'react'
import sanityClient from 'part:@sanity/base/client'
import {usePromise} from './usePromise'
import {fetchMetadataDocument, saveMetadataDocument} from './utils'
import {useCurrentUser} from '@sanity/base/hooks'
import type {CurrentUser} from '@sanity/types'
import {useLoadable} from './useLoadable'
import type {SanityClient} from '@sanity/client'

const client = sanityClient.withConfig({
  apiVersion: '2022-01-01',
}) as SanityClient

type MetadataConfig = {
  scope: string
  documentId: string
}

export function useMetadata<T>({scope, documentId}) {
  const metadataId = `metadata.${scope}.${documentId}`

  const loadMetadataDocument = useCallback(
    () => fetchMetadataDocument<T>(client, metadataId, scope),
    [client, metadataId, scope]
  )

  const loadMetadata = usePromise(loadMetadataDocument)
  const saveMetadata = useCallback(
    (metadata: T) => saveMetadataDocument(client, metadataId, scope, metadata),
    [client, metadataId, scope]
  )

  return [loadMetadata, saveMetadata] as const
}

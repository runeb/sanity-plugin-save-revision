import React, {useCallback} from 'react'
import {Flex, Box, Badge, Card, Stack, Inline, Button, Text} from '@sanity/ui'
import {useMetadata} from './useMetadata'
import {RestoreIcon, RemoveIcon} from '@sanity/icons'
import {useDocumentOperation} from '@sanity/react-hooks'
import {useRouter} from '@sanity/base/router'

import type {MetadataDocument} from './types'

export const SavedRevisions = ({documentId, type, document}) => {
  const {displayed} = document
  const currentRevision: string = displayed?._rev
  const {restore}: any = useDocumentOperation(documentId, type)
  const router = useRouter()
  const [metadata, saveMetadata] = useMetadata<MetadataDocument>({
    scope: 'save-revision',
    documentId,
  })

  // Todo: useCallback ?
  const doRestore = (revision: string) => {
    restore.execute(revision)
    router.navigateIntent('edit', {id: documentId, type})
  }

  if (metadata.type === 'loading') {
    return <small>Loading...</small>
  }

  if (metadata.type === 'error') {
    return <Text>Error loading metadata, please try loading this tab again.</Text>
  }

  const revisions = metadata.result?.revisions || []

  const clearRevision = (revision: string) => {
    saveMetadata({
      revisions: revisions.filter(r => r.revision !== revision)
    })
  }

  return (
    <Card padding={3}>
      <Stack space={4}>
        {revisions.length === 0 && <Text>There are no saved versions yet</Text>}
        {revisions.map((revision) => (
          <React.Fragment key={revision.timestamp}>
            <Stack space={2}>
              <Flex>
                <Box style={{flex: 1}}>
                  <Stack space={2}>
                    <Text weight="bold">{revision.name}</Text>
                    <Text>
                      By {revision.user.name}, {new Date(revision.timestamp).toLocaleDateString()}{' '}
                      {new Date(revision.timestamp).toLocaleTimeString()}
                    </Text>
                  </Stack>
                </Box>
                <Inline space={2}>
                  <Box>
                    <Button onClick={() => clearRevision(revision.revision)} tone='critical' mode="bleed" fontSize={[2]} text="Clear" />
                  </Box>
                  {currentRevision !== revision.revision && (
                    <Box>
                      <Button
                        onClick={() => doRestore(revision.revision)}
                        fontSize={[2]}
                        icon={RestoreIcon}
                        disabled={currentRevision === revision.revision}
                        text="Restore"
                        tone="primary"
                      />
                    </Box>
                  )}
                </Inline>
              </Flex>
              <Box paddingY={1}>
                <Text style={{fontStyle: 'italic'}}>{revision.comment}</Text>
              </Box>
            </Stack>
          </React.Fragment>
        ))}
      </Stack>
    </Card>
  )
}

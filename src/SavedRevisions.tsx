import React, {useCallback} from 'react'
import {Flex, Box, Badge, Card, Stack, Inline, Button, Text} from '@sanity/ui'
import {useMetadata} from './useMetadata'
import {RestoreIcon, RemoveIcon} from '@sanity/icons'
import {useDocumentOperation} from '@sanity/react-hooks'
import {useRouter} from '@sanity/base/router'
import styled, {css} from 'styled-components'
import type {RevisionInfo} from './types'

const Root = styled(Box)(({theme}) => {
  const {bleed, ghost} = theme.sanity.color.button
  return css``
})

type RevisionCardProps = {
  revision: RevisionInfo
  doRestore: (revision: string) => void
  clearRevision: (revision: string) => void
}

const RevisionCard = ({revision, doRestore, clearRevision}: RevisionCardProps) => {
  console.log(revision)
  return (
    <Root key={revision.revision}>
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
              <Button
                onClick={() => clearRevision(revision.revision)}
                tone="critical"
                mode="bleed"
                fontSize={[2]}
                text="Clear"
              />
            </Box>
              <Box>
                <Button
                  onClick={() => doRestore(revision.revision)}
                  fontSize={[2]}
                  icon={RestoreIcon}
                  text="Restore"
                  tone="primary"
                />
              </Box>
          </Inline>
        </Flex>
        <Box paddingY={1}>
          <Text style={{fontStyle: 'italic'}}>{revision.comment}</Text>
        </Box>
      </Stack>
    </Root>
  )
}

export const SavedRevisions = ({documentId, type, document}) => {
  const {displayed} = document
  const currentRevision: string = displayed?._rev
  const {restore}: any = useDocumentOperation(documentId, type)
  const router = useRouter()
  const [metadata, addEntry, removeEntry] = useMetadata<RevisionInfo>({
    scope: 'save-revision',
    documentId,
  })

  // Todo: useCallback ?
  const doRestore = (revision: string) => {
    restore.execute(revision)
    router.navigateIntent('edit', {id: documentId, type})
  }

  if (metadata.isLoading) {
    return <small>Loading...</small>
  }

  if (metadata.error) {
    return <Text>Error loading metadata, please try loading this tab again.</Text>
  }

  const revisions = metadata.value?.entries || []

  return (
    <Card padding={3}>
      <Stack space={4}>
        {revisions.length === 0 && <Text>There are no saved versions yet</Text>}
        {revisions.map((revision) => (
          <RevisionCard
            revision={revision}
            clearRevision={() => removeEntry(revision)}
            doRestore={doRestore}
          />
        ))}
      </Stack>
    </Card>
  )
}

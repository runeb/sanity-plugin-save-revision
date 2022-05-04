import React, {useMemo, useState, useRef, useEffect} from 'react'
import {Card, Stack, Inline, Dialog, Text, TextInput, TextArea, Button} from '@sanity/ui'
import {useMetadata} from './useMetadata'
import {PublishAction} from 'part:@sanity/base/document-actions'
import type {MetadataDocument} from './types'
import type {SanityDocument} from '@sanity/types'
import type {DocumentActionComponent, DocumentActionDialogProps} from '@sanity/base'
import {useCurrentUser} from '@sanity/base/hooks'

const scope = 'save-revision'

type DialogProps = {
  close: () => void
  documentId: string
  revision: string
}

const SaveDialog = ({close, documentId, revision}: DialogProps) => {
  const [valid, setValid] = useState(false)
  const [name, setName] = useState<string>()
  const [comment, setComment] = useState<string>()
  const [saving, setSaving] = useState(false)
  const user = useCurrentUser()
  const [metadata, saveMetadata] = useMetadata<MetadataDocument>({
    scope,
    documentId,
  })

  useEffect(() => {
    setValid(name && !revisionNames.includes(name))
  }, [name])

  const loading = user.isLoading || metadata.type === 'loading'

  if (loading) {
    return <Text>Loading...</Text>
  }

  const error = user.error || metadata.type === 'error'

  if (error) {
    return <Text>Error loading metadata, please try again</Text>
  }

  const revisionNames = (metadata.result?.revisions || []).map((r) => r.name)

  const save = async () => {
    setSaving(true)
    saveMetadata({
      revisions: [
        ...(metadata.result?.revisions || []),
        {
          name,
          revision,
          user: user.value,
          timestamp: Date.now(),
          comment
        },
      ],
    }).then(close)
  }

  const invalid = name?.length && !valid

  return (
    <Card padding={2}>
      <Stack space={3}>
        <Text size={1} style={{color: invalid ? 'red' : 'black'}} weight="semibold">Unique version name</Text>
        <TextInput
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            setName(event.currentTarget.value)
          }}
        />
        <Text size={1} weight="semibold">Optional comment</Text>
        <TextArea onChange={(event) => setComment(event.currentTarget.value)}/>
        <Stack space={1}>
          <Button mode='bleed' onClick={close} text="Cancel" />
          <Button disabled={!valid || saving} onClick={save} text="Save" tone="positive" />
        </Stack>
      </Stack>
    </Card>
  )
}

export const SaveRevisionAction: DocumentActionComponent = (props) => {
  const {onComplete, id, draft, published} = props
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const publishAction = PublishAction(props)
  const document = draft || published

  const dialogProps: DocumentActionDialogProps = {
    type: 'modal',
    onClose: onComplete,
    header: 'Save version',
    content: <SaveDialog documentId={id} revision={document?._rev} close={onComplete} />,
  }

  return {
    label: 'Save…',
    color: 'success',
    dialog: dialogOpen && dialogProps,
    onHandle: () => setDialogOpen(true),
  }
}

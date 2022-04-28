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
  const input = useRef<HTMLInputElement>()
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
    const revisionName = input.current.value
    saveMetadata({
      revisions: [
        ...(metadata.result?.revisions || []),
        {
          name: revisionName,
          revision,
          user: user.value,
          timestamp: Date.now(),
          comment
        },
      ],
    }).then(close)
  }

  const invalid = input.current?.value.length && !valid

  return (
    <Card padding={4}>
      <Stack space={2}>
        <Text style={{color: invalid ? 'red' : 'black'}} weight="bold">Unique version name</Text>
        <TextInput
          ref={input}
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            setName(event.currentTarget.value)
          }}
        />
        <Text weight="bold">Optional comment</Text>
        <TextArea onChange={(event) => setComment(event.currentTarget.value)}/>
        <Button onClick={close} text="Cancel" />
        <Button disabled={!valid || saving} onClick={save} text="Save" tone="primary" />
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
    content: <SaveDialog documentId={id} revision={document?._rev} close={onComplete} />,
  }

  return {
    label: 'Save…',
    color: 'success',
    dialog: dialogOpen && dialogProps,
    onHandle: () => {
      setDialogOpen(true)
    },
  }
}

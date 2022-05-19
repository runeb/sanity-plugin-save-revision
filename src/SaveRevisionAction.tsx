import React, {useMemo, useState, useRef, useEffect} from 'react'
import {Card, Stack, Inline, Dialog, Text, TextInput, TextArea, Button, useToast} from '@sanity/ui'
import {useMetadata} from './useMetadata'
import type {DocumentActionComponent, DocumentActionDialogProps} from '@sanity/base'
import type {RevisionInfo} from './types'
import {useCurrentUser} from '@sanity/base/hooks'

const scope = 'save-revision'

type DialogProps = {
  close: () => void
  documentId: string
  revision: string
}

const SaveDialog = ({close, documentId, revision}: DialogProps) => {
  const [name, setName] = useState<string>()
  const [comment, setComment] = useState<string>()
  const [saving, setSaving] = useState(false)
  const user = useCurrentUser()
  const [metadata, addEntry] = useMetadata<RevisionInfo>({
    scope,
    documentId,
  })
  const toast = useToast()

  const loading = user.isLoading || metadata.isLoading

  if (loading) {
    return <Text>Loading...</Text>
  }

  const error = user.error || metadata.error

  if (error) {
    return <Text>Error loading metadata, please try again</Text>
  }

  const revisionNames = (metadata.value?.entries || []).map((r) => r.name)
  const valid = name && !revisionNames.includes(name)

  const save = async () => {
    setSaving(true)
    addEntry({
      name,
      revision,
      user: {id: user.value.id, name: user.value.name},
      timestamp: Date.now(),
      comment,
    })
      .then(() => {
        toast.push({
          status: 'success',
          title: 'Revision saved',
        })
        close()
      })
      .catch((error) => {
        toast.push({
          status: 'error',
          title: 'Could not save revision. Please try again.',
        })
      })
      .finally(() => setSaving(false))
  }

  const invalid = name?.length && !valid

  return (
    <Card padding={2}>
      <Stack space={3}>
        <Text size={1} style={{color: invalid ? 'red' : 'black'}} weight="semibold">
          Unique version name
        </Text>
        <TextInput
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            setName(event.currentTarget.value)
          }}
        />
        <Text size={1} weight="semibold">
          Optional comment
        </Text>
        <TextArea onChange={(event) => setComment(event.currentTarget.value)} />
        <Stack space={1}>
          <Button mode="bleed" onClick={close} text="Cancel" />
          <Button disabled={!valid || saving} onClick={save} text="Save" tone="positive" />
        </Stack>
      </Stack>
    </Card>
  )
}

export const SaveRevisionAction: DocumentActionComponent = (props) => {
  const {onComplete, id, draft, published} = props
  const [dialogOpen, setDialogOpen] = React.useState(false)
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

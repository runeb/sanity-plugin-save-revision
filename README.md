# sanity-plugin-save-rev

Save document revisions like save games and restore to them later.

## Installation

```
sanity install save-rev
```

### Configure the document action (Sanity Studio 2.x versions)

In your sanity.json, if not already present, add a document action resolver implementation

```json
"parts": [
  {
      "implements": "part:@sanity/base/document-actions/resolver",
      "path": "./resolveDocumentActions"
  }
]
```

in the file referenced, make sure the SaveRevisionAction is included in the relevant document types you want to enable this functionality for

```javascript
import defaultResolve from 'part:@sanity/base/document-actions'
import {SaveRevisionAction} from 'sanity-plugin-save-rev'

export default function resolveDocumentActions(props) {
  return [...defaultResolve(props), SaveRevisionAction]
}
```

### Configure the saved revisions tab

In your sanity.json parts array, if not already present

```json
"parts": [
  {
    "name": "part:@sanity/desk-tool/structure",
    "path": "./desk"
  }
]
```

In the file referenced, return SavedRevisions as one of the components views for the document types you are interested in enabling it for.

```javascript
import * as React from "react"
import S from '@sanity/base/structure-builder'
import {SavedRevisions} from "sanity-plugin-save-rev"

export const getDefaultDocumentNode = () => {
  return S.document().views([
    S.view.form(),
    S.view.component(SavedRevisions).title('Saved Revisions')
  ]);
};

// You may have a different default export from this file, that is fine
export default S.defaults()

```


## License

MIT © Rune Botten
See LICENSE

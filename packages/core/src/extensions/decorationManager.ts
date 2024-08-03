import { Plugin, PluginKey } from 'packages/pm/state'
import { Decoration, DecorationSet } from 'packages/pm/view'

import { Extension } from '../Extension.js'

export const DecorationManager = Extension.create({
  addProseMirrorPlugins() {
    const { editor } = this

    return [
      new Plugin<{ decorations: Decoration[] }>({
        key: new PluginKey('tiptap__DecorationManager'),

        state: {
          init() {
            return {
              decorations: [],
            }
          },
          apply(tr, value) {
            const decorations: Decoration[] = []

            if (!tr.docChanged) {
              return value
            }

            editor.extensionManager.decorations.forEach(decoration => {
              const pmDeco = decoration.toProsemirrorDecoration()

              if (pmDeco) {
                decorations.push(pmDeco)
              }
            })

            return { decorations }
          },
        },
        props: {
          decorations(state) {
            if (!this.getState(state)) {
              return null
            }

            return DecorationSet.create(editor.state.doc, this.getState(state)?.decorations || [])
          },
        },
      }),
    ]
  },
})

import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

import { Extension } from '../Extension.js'

export const DecorationManager = Extension.create({
  addProseMirrorPlugins() {
    const { editor } = this

    return [
      new Plugin<{ decorations: Decoration[] }>({
        key: new PluginKey('tiptap__DecorationManager'),

        state: {
          init() {
            const decorations: Decoration[] = []

            editor.extensionManager.decorations.forEach(decoration => {
              const pmDeco = decoration.toProsemirrorDecoration()

              if (pmDeco) {
                decorations.push(pmDeco)
              }
            })

            return {
              decorations,
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

            const decos = this.getState(state)?.decorations.filter(deco => !!deco) || []

            return DecorationSet.create(editor.state.doc, decos)
          },
        },
      }),
    ]
  },
})

import { Decoration as PMDecoration } from '@tiptap/pm/view'

import { Decoration } from './Decoration.js'

export class WidgetDecoration extends Decoration {
  toProsemirrorDecoration(): PMDecoration {
    return PMDecoration.widget(this.pos, this.toDOM())
  }
}

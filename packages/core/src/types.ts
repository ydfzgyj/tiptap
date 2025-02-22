import {
  Mark as ProseMirrorMark,
  Node as ProseMirrorNode,
  NodeType,
  ParseOptions,
  Slice,
} from '@tiptap/pm/model'
import { EditorState, Transaction } from '@tiptap/pm/state'
import {
  Decoration,
  EditorProps,
  EditorView,
  NodeView,
  NodeViewConstructor,
} from '@tiptap/pm/view'

import { Editor } from './Editor.js'
import { Extension } from './Extension.js'
import {
  Commands, ExtensionConfig, MarkConfig, NodeConfig,
} from './index.js'
import { Mark } from './Mark.js'
import { Node } from './Node.js'

export type AnyConfig = ExtensionConfig | NodeConfig | MarkConfig;
export type AnyExtension = Extension | Node | Mark;
export type Extensions = AnyExtension[];

export type ParentConfig<T> = Partial<{
  [P in keyof T]: Required<T>[P] extends (...args: any) => any
    ? (...args: Parameters<Required<T>[P]>) => ReturnType<Required<T>[P]>
    : T[P];
}>;

export type Primitive = null | undefined | string | number | boolean | symbol | bigint;

export type RemoveThis<T> = T extends (...args: any) => any
  ? (...args: Parameters<T>) => ReturnType<T>
  : T;

export type MaybeReturnType<T> = T extends (...args: any) => any ? ReturnType<T> : T;

export type MaybeThisParameterType<T> = Exclude<T, Primitive> extends (...args: any) => any
  ? ThisParameterType<Exclude<T, Primitive>>
  : any;

export interface EditorEvents {
  beforeCreate: { editor: Editor };
  create: { editor: Editor };
  contentError: {
    editor: Editor;
    error: Error;
    /**
     * If called, will re-initialize the editor with the collaboration extension removed.
     * This will prevent syncing back deletions of content not present in the current schema.
     */
    disableCollaboration: () => void;
  };
  update: { editor: Editor; transaction: Transaction };
  selectionUpdate: { editor: Editor; transaction: Transaction };
  beforeTransaction: { editor: Editor; transaction: Transaction; nextState: EditorState };
  transaction: { editor: Editor; transaction: Transaction };
  focus: { editor: Editor; event: FocusEvent; transaction: Transaction };
  blur: { editor: Editor; event: FocusEvent; transaction: Transaction };
  destroy: void;
  paste: { editor: Editor; event: ClipboardEvent; slice: Slice };
  drop: { editor: Editor; event: DragEvent; slice: Slice; moved: boolean };
}

export type EnableRules = (AnyExtension | string)[] | boolean;

export interface EditorOptions {
  element: Element;
  content: Content;
  extensions: Extensions;
  injectCSS: boolean;
  injectNonce: string | undefined;
  autofocus: FocusPosition;
  editable: boolean;
  editorProps: EditorProps;
  parseOptions: ParseOptions;
  coreExtensionOptions?: {
    clipboardTextSerializer?: {
      blockSeparator?: string;
    };
  };
  enableInputRules: EnableRules;
  enablePasteRules: EnableRules;
  /**
   * Determines whether core extensions are enabled.
   *
   * If set to `false`, all core extensions will be disabled.
   * To disable specific core extensions, provide an object where the keys are the extension names and the values are `false`.
   * Extensions not listed in the object will remain enabled.
   *
   * @example
   * // Disable all core extensions
   * enabledCoreExtensions: false
   *
   * @example
   * // Disable only the keymap core extension
   * enabledCoreExtensions: { keymap: false }
   *
   * @default true
   */
  enableCoreExtensions?:
    | boolean
    | Partial<
        Record<
          | 'editable'
          | 'clipboardTextSerializer'
          | 'commands'
          | 'focusEvents'
          | 'keymap'
          | 'tabindex'
          | 'drop'
          | 'paste',
          false
        >
      >;
  /**
   * If `true`, the editor will check the content for errors on initialization.
   * Emitting the `contentError` event if the content is invalid.
   * Which can be used to show a warning or error message to the user.
   * @default false
   */
  enableContentCheck: boolean;
  onBeforeCreate: (props: EditorEvents['beforeCreate']) => void;
  onCreate: (props: EditorEvents['create']) => void;
  /**
   * Called when the editor encounters an error while parsing the content.
   * Only enabled if `enableContentCheck` is `true`.
   */
  onContentError: (props: EditorEvents['contentError']) => void;
  onUpdate: (props: EditorEvents['update']) => void;
  onSelectionUpdate: (props: EditorEvents['selectionUpdate']) => void;
  onTransaction: (props: EditorEvents['transaction']) => void;
  onFocus: (props: EditorEvents['focus']) => void;
  onBlur: (props: EditorEvents['blur']) => void;
  onDestroy: (props: EditorEvents['destroy']) => void;
  onPaste: (e: ClipboardEvent, slice: Slice) => void;
  onDrop: (e: DragEvent, slice: Slice, moved: boolean) => void;
}

export type HTMLContent = string;

export type JSONContent = {
  type?: string;
  attrs?: Record<string, any>;
  content?: JSONContent[];
  marks?: {
    type: string;
    attrs?: Record<string, any>;
    [key: string]: any;
  }[];
  text?: string;
  [key: string]: any;
};

export type Content = HTMLContent | JSONContent | JSONContent[] | null;

export type CommandProps = {
  editor: Editor;
  tr: Transaction;
  commands: SingleCommands;
  can: () => CanCommands;
  chain: () => ChainedCommands;
  state: EditorState;
  view: EditorView;
  dispatch: ((args?: any) => any) | undefined;
};

export type Command = (props: CommandProps) => boolean;

export type CommandSpec = (...args: any[]) => Command;

export type KeyboardShortcutCommand = (props: { editor: Editor }) => boolean;

export type Attribute = {
  default?: any;
  rendered?: boolean;
  renderHTML?: ((attributes: Record<string, any>) => Record<string, any> | null) | null;
  parseHTML?: ((element: HTMLElement) => any | null) | null;
  keepOnSplit?: boolean;
  isRequired?: boolean;
};

export type Attributes = {
  [key: string]: Attribute;
};

export type ExtensionAttribute = {
  type: string;
  name: string;
  attribute: Required<Attribute>;
};

export type GlobalAttributes = {
  /**
   * The node & mark types this attribute should be applied to.
   */
  types: string[];
  /**
   * The attributes to add to the node or mark types.
   */
  attributes: Record<string, Attribute | undefined>;
}[];

export type PickValue<T, K extends keyof T> = T[K];

export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export type Diff<T extends keyof any, U extends keyof any> = ({ [P in T]: P } & {
  [P in U]: never;
} & { [x: string]: never })[T];

export type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U;

export type ValuesOf<T> = T[keyof T];

export type KeysWithTypeOf<T, Type> = { [P in keyof T]: T[P] extends Type ? P : never }[keyof T];

export type DecorationWithType = Decoration & {
  type: NodeType;
};

export interface NodeViewProps extends NodeViewRendererProps {
  // TODO this type is not technically correct, but it's the best we can do for now since prosemirror doesn't expose the type of decorations
  decorations: readonly DecorationWithType[];
  selected: boolean;
  updateAttributes: (attributes: Record<string, any>) => void;
  deleteNode: () => void;
}

export interface NodeViewRendererOptions {
  stopEvent: ((props: { event: Event }) => boolean) | null;
  ignoreMutation:
    | ((props: { mutation: MutationRecord | { type: 'selection'; target: Element } }) => boolean)
    | null;
  contentDOMElementTag: string;
}

export interface NodeViewRendererProps {
  // pass-through from prosemirror
  node: Parameters<NodeViewConstructor>[0];
  view: Parameters<NodeViewConstructor>[1];
  getPos: () => number; // TODO getPos was incorrectly typed before, change to `Parameters<NodeViewConstructor>[2];` in the next major version
  decorations: Parameters<NodeViewConstructor>[3];
  innerDecorations: Parameters<NodeViewConstructor>[4];
  // tiptap-specific
  editor: Editor;
  extension: Node;
  HTMLAttributes: Record<string, any>;
}

export type NodeViewRenderer = (props: NodeViewRendererProps) => NodeView;

export type AnyCommands = Record<string, (...args: any[]) => Command>;

export type UnionCommands<T = Command> = UnionToIntersection<
  ValuesOf<Pick<Commands<T>, KeysWithTypeOf<Commands<T>, {}>>>
>;

export type RawCommands = {
  [Item in keyof UnionCommands]: UnionCommands<Command>[Item];
};

export type SingleCommands = {
  [Item in keyof UnionCommands]: UnionCommands<boolean>[Item];
};

export type ChainedCommands = {
  [Item in keyof UnionCommands]: UnionCommands<ChainedCommands>[Item];
} & {
  run: () => boolean;
};

export type CanCommands = SingleCommands & { chain: () => ChainedCommands };

export type FocusPosition = 'start' | 'end' | 'all' | number | boolean | null;

export type Range = {
  from: number;
  to: number;
};

export type NodeRange = {
  node: ProseMirrorNode;
  from: number;
  to: number;
};

export type MarkRange = {
  mark: ProseMirrorMark;
  from: number;
  to: number;
};

export type Predicate = (node: ProseMirrorNode) => boolean;

export type NodeWithPos = {
  node: ProseMirrorNode;
  pos: number;
};

export type TextSerializer = (props: {
  node: ProseMirrorNode;
  pos: number;
  parent: ProseMirrorNode;
  index: number;
  range: Range;
}) => string;

export type ExtendedRegExpMatchArray = RegExpMatchArray & {
  data?: Record<string, any>;
};

export type Dispatch = ((args?: any) => any) | undefined;

import { Transforms, Editor, Element as SlateElement } from 'slate';
import { v4 } from 'uuid';
import copy from 'copy-to-clipboard';
import { LegacyRef, useRef, useState } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import cx from 'classnames';
import { HoveredMenuItem } from './HoveredMenuItem';
import { VOID_ELEMENTS } from '../Editor/plugins';
import s from './HoveredMenu.module.scss';

const ElementHover = ({
  children,
  element,
  attributes,
  onPlusButtonClick,
  onDragStart,
  onDragEnd,
  onDrop,
  dndState,
}) => {
  const editor = useSlate();
  const [hovered, setHovered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const index = ReactEditor.findPath(editor, element)[0];

  const isDragging = index === dndState.from;
  const isOver = index === dndState.to;
  const isOverSelf = isDragging && isOver;

  const opacity = isDragging ? 0.4 : 1;

  const onHover = () => setHovered(true);
  const onHoverOut = () => setHovered(false);

  const handlePlusButton = () => {
    onHoverOut();
    onPlusButtonClick(element);
  };

  const handleDeleteNode = () => {
    Transforms.removeNodes(editor, {
      at: editor.selection?.anchor,
      match: (node) => Editor.isEditor(editor) && SlateElement.isElement(node),
    });
  };

  const handleDuplicateNode = () => {
    const currentNode = Array.from(
      Editor.nodes(editor, {
        match: (node) => Editor.isEditor(editor) && SlateElement.isElement(node),
        at: editor.selection?.anchor,
      }),
    )[0]?.[0];

    if (currentNode) {
      const duplicatedNode = { ...currentNode, id: v4() };

      if (editor.selection) {
        Transforms.insertNodes(editor, duplicatedNode, {
          at: { offset: 0, path: [editor.selection.anchor.path[0], 0] },
          match: (node) => Editor.isEditor(editor) && SlateElement.isElement(node),
        });

        ReactEditor.focus(editor);
      }
    }
  };

  const handleCopyLinkNode = () => {
    copy(`${window.location.origin}#${element.id}`);
    // alert.info('Link successfully copied', { position: 'right' });
  };

  const onRef = (ref: LegacyRef<HTMLDivElement>) => {
    /* @ts-ignore */
    elementRef.current = ref;
    attributes.ref(ref);
  };

  return (
    <section
      className={cx(s.hoverWrap, {
        [s.isOver]: isOver,
        [s.isOverSelf]: isOverSelf,
      })}
      data-node-id={element.id}
      data-node-type={element.type}
      onMouseEnter={onHover}
      onMouseLeave={onHoverOut}
      style={{ opacity }}
      onDrop={onDrop}
      {...attributes}
      ref={onRef}
    >
      <HoveredMenuItem
        handlePlusButton={handlePlusButton}
        hovered={hovered}
        elementRef={elementRef}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        isDragging={isDragging}
        handleDeleteNode={handleDeleteNode}
        handleDuplicateNode={handleDuplicateNode}
        handleCopyLinkNode={handleCopyLinkNode}
        isVoidElement={VOID_ELEMENTS.includes(element.type)}
      />
      <div className={s.content}>{children}</div>
    </section>
  );
};

export { ElementHover };

import React, { useState } from "react";
import { Button, ButtonGroup, Confirm, Segment } from "semantic-ui-react";
import { IDevice } from "../Types";

export default function DeleteByIdButtonWithConfirm({ extraConfirmText, entityName, deleteMethod, deleteConfirmCallback }: {
  extraConfirmText: string,
  entityName: string,
  deleteMethod: () => Promise<any>,
  deleteConfirmCallback?: () => Promise<void>
}) {
  const [deleteConfirmPanelOpen, setDeleteConfirmPanelOpen]: [boolean, any] = useState(false);

  const handleDeleteConfirmPanelCancel = () => {
    setDeleteConfirmPanelOpen(false);
  }

  const handleOpenDeletePanelClick = () => {
    setDeleteConfirmPanelOpen(true);
  }

  const handleDeleteConfirmPanelConfirm = async () => {
    await deleteMethod();
    if (typeof deleteConfirmCallback === 'function') {
      await deleteConfirmCallback();
    }
    setDeleteConfirmPanelOpen(false);
  }

  return (
    <span>
      <Button
        color={"red"}
        onClick={handleOpenDeletePanelClick}
      >Delete</Button>
      <Confirm
        open={deleteConfirmPanelOpen}
        header={`Delete ${entityName}`}
        content={`Are you sure? ${extraConfirmText}`}
        onCancel={handleDeleteConfirmPanelCancel}
        onConfirm={handleDeleteConfirmPanelConfirm}
      />
    </span>
  );
};
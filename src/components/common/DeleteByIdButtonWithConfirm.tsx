import React, { useState } from "react";
import { Button, ButtonGroup, Confirm, Segment } from "semantic-ui-react";
import { IDevice } from "../Types";

export default function DeleteByIdButtonWithConfirm({ extraConfirmText, entityName, deleteMethod, deleteConfirmCallback, disabled }: {
  extraConfirmText: string;
  entityName: string;
  deleteMethod: () => Promise<any>;
  deleteConfirmCallback?: () => Promise<void>;
  disabled: boolean
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
        disabled={disabled}
      >Delete</Button>
      <Confirm
        disabled={disabled}
        open={deleteConfirmPanelOpen}
        header={`Delete ${entityName}`}
        content={`Are you sure? ${extraConfirmText}`}
        onCancel={handleDeleteConfirmPanelCancel}
        onConfirm={handleDeleteConfirmPanelConfirm}
      />
    </span>
  );
};
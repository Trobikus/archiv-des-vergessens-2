import {
  getDialog,
  getNPC,
  type DialogDefinition,
  type NpcDefinition,
} from "@adv/content";
import type { EventBus } from "@adv/core";

export type DialogService = {
  getActiveNpc(): NpcDefinition | null;
  getCurrentDialog(): DialogDefinition | null;
  startDialog(npcId: string, dialogId?: string): boolean;
  chooseOption(optionIndex: number): boolean;
  chooseOptionByNext(nextId: string): boolean;
  closeDialog(): void;
  destroy(): void;
};

export function createDialogService(eventBus: EventBus): DialogService {
  let activeNpcId: string | null = null;
  let activeDialogId: string | null = null;

  const publish = (): void => {
    const npc = activeNpcId ? getNPC(activeNpcId) : null;
    const dialog =
      activeNpcId && activeDialogId
        ? getDialog(activeNpcId, activeDialogId)
        : null;
    eventBus.publish("dialog:changed", { npc, dialog });
  };

  const setDialog = (npcId: string, dialogId: string): boolean => {
    const dialog = getDialog(npcId, dialogId);
    if (!dialog) {
      return false;
    }
    activeNpcId = npcId;
    activeDialogId = dialogId;
    publish();
    return true;
  };

  return {
    getActiveNpc() {
      return activeNpcId ? getNPC(activeNpcId) : null;
    },

    getCurrentDialog() {
      if (!activeNpcId || !activeDialogId) {
        return null;
      }
      return getDialog(activeNpcId, activeDialogId);
    },

    startDialog(npcId, dialogId) {
      const npc = getNPC(npcId);
      if (!npc) {
        return false;
      }
      const target = dialogId ?? npc.defaultDialog;
      return setDialog(npcId, target);
    },

    chooseOption(optionIndex) {
      const dialog = this.getCurrentDialog();
      if (!dialog || !activeNpcId) {
        return false;
      }
      const option = dialog.options[optionIndex];
      if (!option) {
        return false;
      }
      return this.chooseOptionByNext(option.next);
    },

    chooseOptionByNext(nextId) {
      if (!activeNpcId) {
        return false;
      }
      if (nextId === "close" || nextId === "end") {
        this.closeDialog();
        return true;
      }
      const next = getDialog(activeNpcId, nextId);
      if (!next) {
        this.closeDialog();
        return true;
      }
      activeDialogId = nextId;
      if (next.isEnding) {
        publish();
        this.closeDialog();
        return true;
      }
      publish();
      return true;
    },

    closeDialog() {
      activeNpcId = null;
      activeDialogId = null;
      eventBus.publish("dialog:closed", {});
    },

    destroy() {
      activeNpcId = null;
      activeDialogId = null;
    },
  };
}

import { useEffect, useState } from "preact/hooks";

import type { AuthService } from "../../services/auth-service";
import type { CloudSyncService } from "../../services/cloud-sync-service";
import type { I18nService } from "../../services/i18n-service";
import type { WsClient } from "../../services/ws-client";
import { useStore } from "../useStore";

type Props = {
  readonly auth: AuthService;
  readonly i18n: I18nService;
  readonly ws: WsClient;
  readonly cloud: CloudSyncService;
};

export function AccountBadge({ auth, i18n, ws, cloud }: Props) {
  const authState = useStore(auth.store);
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(() => ws.status() === "open");
  const user = authState.user;
  const syncLabel =
    cloud.status() === "pending"
      ? i18n.translate("auth.cloudPending")
      : i18n.translate("auth.cloudSynced");

  useEffect(() => {
    setOnline(ws.status() === "open");
    return ws.onStatus((status) => {
      setOnline(status === "open");
    });
  }, [ws]);

  if (user === null || user.isGuest || authState.token === null) {
    return null;
  }

  return (
    <div class="account">
      <button
        type="button"
        class="account__badge"
        data-testid="account-badge"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
      >
        {`${i18n.translate("auth.loggedInAs")} ${user.username}`}
        <span class="account__dot" data-online={online ? "1" : "0"}>
          {online
            ? i18n.translate("auth.online")
            : i18n.translate("auth.offline")}
        </span>
      </button>

      {open ? (
        <div class="account__panel" data-testid="account-panel">
          <p>{syncLabel}</p>
          <button
            type="button"
            class="account__action"
            data-testid="account-logout"
            onClick={() => {
              auth.logout();
              setOpen(false);
            }}
          >
            {i18n.translate("auth.logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

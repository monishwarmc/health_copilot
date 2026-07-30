export {};

interface PromptMomentNotification {
  isNotDisplayed(): boolean;
  getNotDisplayedReason(): string | undefined;

  isSkippedMoment(): boolean;
  getSkippedReason(): string | undefined;

  isDismissedMoment(): boolean;
  getDismissedReason(): string | undefined;
}

declare global {
  interface CredentialResponse {
    credential: string;
    select_by: string;
  }

  interface Window {
    google: {
      accounts: {
        id: {
          initialize(config: {
            client_id: string;
            callback: (response: CredentialResponse) => void;
          }): void;

          renderButton(
            parent: HTMLElement,
            options: Record<string, unknown>
          ): void;

          prompt(
            callback?: (
              notification: PromptMomentNotification
            ) => void
          ): void;
        };
      };
    };
  }
}
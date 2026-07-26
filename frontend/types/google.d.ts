export {};

declare global {
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

          prompt(): void;
        };
      };
    };
  }

  interface CredentialResponse {
    credential: string;
    select_by: string;
  }
}
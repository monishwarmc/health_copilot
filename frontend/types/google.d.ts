export {};

declare global {
  interface Window {
    google: typeof google;
  }

  namespace google.accounts.id {
    interface CredentialResponse {
      credential: string;

      select_by?: string;

      clientId?: string;
    }

    interface IdConfiguration {
      client_id: string;

      callback: (
        response: CredentialResponse
      ) => void | Promise<void>;

      auto_select?: boolean;
    }

    interface GsiButtonConfiguration {
      type?:
        | "standard"
        | "icon";

      theme?:
        | "outline"
        | "filled_blue"
        | "filled_black";

      size?:
        | "small"
        | "medium"
        | "large";

      text?:
        | "signin_with"
        | "signup_with"
        | "continue_with"
        | "signin";

      shape?:
        | "rectangular"
        | "pill"
        | "circle"
        | "square";

      logo_alignment?:
        | "left"
        | "center";

      width?: number | string;

      locale?: string;

      use_fedcm_for_button?: boolean;
    }

    function initialize(
      config: IdConfiguration
    ): void;

    function renderButton(
      parent: HTMLElement,
      options: GsiButtonConfiguration
    ): void;

    function disableAutoSelect(): void;

    function revoke(
      hint: string,
      callback?: () => void
    ): void;
  }
}
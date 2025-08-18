export interface Keys {
  w: boolean;
  s: boolean;
  ArrowUp: boolean;
  ArrowDown: boolean;
  ' ': boolean; // Space bar for pause
}

export enum KeyAction {
  MOVE_LEFT_UP = 'w',
  MOVE_LEFT_DOWN = 's',
  MOVE_RIGHT_UP = 'ArrowUp',
  MOVE_RIGHT_DOWN = 'ArrowDown',
  PAUSE = ' '
}

export class InputManager {
  private keys: Keys = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false,
    ' ': false
  };

  private onPauseToggle?: () => void;

  constructor(onPauseToggle?: () => void) {
    this.onPauseToggle = onPauseToggle;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      const mappedKey = this.getKeyFromEvent(e);
      if (mappedKey) {
        if (mappedKey === KeyAction.PAUSE && !this.keys[' ']) {
          this.onPauseToggle?.();
        }
        this.keys[mappedKey] = true;
      }
    });

    document.addEventListener("keyup", (e: KeyboardEvent) => {
      const mappedKey = this.getKeyFromEvent(e);
      if (mappedKey) {
        this.keys[mappedKey] = false;
      }
    });
  }

  private getKeyFromEvent(e: KeyboardEvent): keyof Keys | null {
    const keyLower = e.key.toLowerCase();
    if (keyLower === 'w' || keyLower === 's') return keyLower;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') return e.key;
    if (e.key === ' ') return ' ';
    return null;
  }

  public isPressed(key: KeyAction): boolean {
    return this.keys[key];
  }

  public getKeyState(): Readonly<Keys> {
    return { ...this.keys };
  }
}

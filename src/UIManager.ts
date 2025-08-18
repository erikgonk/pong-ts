export class UIManager {
  private pauseOverlay: HTMLElement;
  private pauseBtn: HTMLElement;
  private playBtn: HTMLElement;
  private gameArea: HTMLElement;
  private leftPlayer: HTMLElement;
  private rightPlayer: HTMLElement;

  private onPauseToggle?: () => void;

  constructor(
    pauseOverlay: HTMLElement,
    pauseBtn: HTMLElement,
    playBtn: HTMLElement,
    gameArea: HTMLElement,
    leftPlayer: HTMLElement,
    rightPlayer: HTMLElement,
    onPauseToggle?: () => void
  ) {
    this.pauseOverlay = pauseOverlay;
    this.pauseBtn = pauseBtn;
    this.playBtn = playBtn;
    this.gameArea = gameArea;
    this.leftPlayer = leftPlayer;
    this.rightPlayer = rightPlayer;
    this.onPauseToggle = onPauseToggle;
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.pauseBtn.addEventListener("click", () => {
      this.onPauseToggle?.();
    });

    this.playBtn.addEventListener("click", () => {
      this.onPauseToggle?.();
    });
  }

  public showPauseOverlay(): void {
    this.pauseOverlay.classList.remove('hidden');
    this.gameArea.classList.add('blur-[9px]');
  }

  public hidePauseOverlay(): void {
    this.pauseOverlay.classList.add('hidden');
    this.gameArea.classList.remove('blur-[9px]');
  }

  public setPlayerNames(leftName: string, rightName: string): void {
    this.leftPlayer.textContent = leftName;
    this.rightPlayer.textContent = rightName;
  }

  public static getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Required DOM element with id "${id}" not found`);
    }
    return element;
  }
}

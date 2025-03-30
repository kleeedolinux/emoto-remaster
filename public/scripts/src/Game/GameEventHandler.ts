import { Game } from "./Game";

export class GameEventHandler {
    private game: Game;
    
    constructor(game: Game) {
        this.game = game;
        
        // Bind methods to maintain 'this' context
        this.handleChannelChange = this.handleChannelChange.bind(this);
        this.handleChannelFocus = this.handleChannelFocus.bind(this);
        this.handleChannelBlur = this.handleChannelBlur.bind(this);
    }
    
    handleChannelChange(): void {
        this.game.restartGame();
        this.game.ui.hideElement(this.game.ui.subtitle2);
        this.game.channel = this.game.ui.inputChannel.value;
    }
    
    handleChannelFocus(): void {
        this.game.ui.showElement(this.game.ui.subtitle2);
    }
    
    handleChannelBlur(): void {
        this.game.ui.hideElement(this.game.ui.subtitle2);
    }
    
    handleGameplayKeypress(event: KeyboardEvent): void {
        if (event.key === "Enter" && !event.defaultPrevented) {
            this.game.gameplay();
            this.game.hideAutocompleteList();
        }
    }
    
    handleAutocompleteClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (target.classList.contains("autocomplete-item")) {
            this.game.ui.inputEmote.value = target.dataset.fullName || target.innerText;
            this.game.ui.inputEmote.focus();
            this.game.hideAutocompleteList();
        }
    }
    
    handleAutocompleteKeydown(event: KeyboardEvent): void {
        const target = event.target as HTMLElement;
        if (target.classList.contains("autocomplete-item") && event.key === "Enter") {
            this.game.ui.inputEmote.value = target.dataset.fullName || target.innerText;
            this.game.ui.inputEmote.focus();
            this.game.gameplay();
            this.game.hideAutocompleteList();
        }
    }
    
    handleTryAgainClick(): void {
        this.game.ui.clear(this.game.ui.app);
        this.game.restartGame();
    }
    
    handleHomeButtonClick(): void {
        window.location.reload();
    }
} 
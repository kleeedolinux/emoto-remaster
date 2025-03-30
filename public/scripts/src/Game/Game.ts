import { Autocomplete } from "../UI/Autocomplete.js";
import { Emote } from "./Emote";
import { UI } from "../UI/UI.js";
import { User } from "../Profile/User.js";
import { EmoteService } from "./EmoteService.js";
import { ModalManager } from "./ModalManager.js";
import { GameState } from "./GameState.js";
import { GameEventHandler } from "./GameEventHandler.js";

export class Game {
    channel: string;
    emotesList: Emote[];
    emoteNames: string[];
    emoteAtual: Emote;
    acertos: number;
    acertosSeguidos: number;
    vidasRestantes: number;
    autocomplete: Autocomplete;
    user: User;
    ui: UI;
    
    private emoteService: EmoteService;
    private modalManager: ModalManager;
    private gameState: GameState;
    eventHandler: GameEventHandler;
    private isAutocompleteVisible: boolean = false;

    constructor(user: User) {
        this.channel = "";
        this.emotesList = [];
        this.emoteNames = [];
        this.emoteAtual = { name: "", image: "" };
        this.acertos = 0;
        this.acertosSeguidos = 0;
        this.vidasRestantes = 4;
        this.ui = new UI();
        this.user = user;
        this.autocomplete = new Autocomplete(this);
        
        this.emoteService = new EmoteService();
        this.modalManager = new ModalManager(this);
        this.gameState = new GameState(this);
        this.eventHandler = new GameEventHandler(this);
        
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        this.ui.inputChannel.addEventListener("change", this.eventHandler.handleChannelChange);
        this.ui.inputChannel.addEventListener("focus", this.eventHandler.handleChannelFocus);
        this.ui.inputChannel.addEventListener("blur", this.eventHandler.handleChannelBlur);
        
        this.ui.inputEmote.addEventListener("keydown", this.handleKeyboardNavigation);
    }
    
    handleKeyboardNavigation = (event: KeyboardEvent): void => {
        if (!this.isAutocompleteVisible) {
            if (event.key === "ArrowDown" && this.autocomplete.emotesListAutocomplete.children.length > 0) {
                event.preventDefault();
                this.showAutocompleteList();
                this.autocomplete.navigateAutocomplete('down');
                return;
            }
            return;
        }
        
        switch (event.key) {
            case "ArrowUp":
                event.preventDefault();
                this.autocomplete.navigateAutocomplete('up');
                break;
            case "ArrowDown":
                event.preventDefault();
                this.autocomplete.navigateAutocomplete('down');
                break;
            case "Home":
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.autocomplete.navigateAutocomplete('home');
                }
                break;
            case "End":
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.autocomplete.navigateAutocomplete('end');
                }
                break;
            case "Tab":
                event.preventDefault();
                if (event.shiftKey) {
                    this.autocomplete.navigateAutocomplete('up');
                } else {
                    this.autocomplete.navigateAutocomplete('down');
                }
                break;
            case "Enter":
                const selectedValue = this.autocomplete.selectCurrentItem();
                if (selectedValue) {
                    event.preventDefault();
                    this.ui.inputEmote.value = selectedValue;
                    this.hideAutocompleteList();
                    this.gameplay();
                }
                break;
            case "Escape":
                event.preventDefault();
                this.hideAutocompleteList();
                break;
        }
    }
    
    showAutocompleteList(): void {
        this.ui.showElement(this.autocomplete.emotesListAutocomplete);
        this.isAutocompleteVisible = true;
    }
    
    hideAutocompleteList(): void {
        this.ui.hideElement(this.autocomplete.emotesListAutocomplete);
        this.isAutocompleteVisible = false;
    }

    getEmotenames(emotes: Emote[]): void {
        this.emoteNames = this.emoteService.getEmoteNames(emotes);
    }

    showEmoteGame = (emote: Emote): void => {
        this.ui.app.innerHTML = this.emoteService.getEmoteHtml(emote);
    };

    returnToHome = (): void => {
        this.gameState.resetGameState();
        this.ui.clear(this.ui.showAcertos);
        this.ui.clear(this.ui.app);
        this.ui.clear(this.ui.loading);
        this.ui.clear(this.ui.invalidChannel);
        this.ui.hideElement(this.ui.emoteTryContainer);
        this.ui.hideElement(this.ui.vidas.vidasUI);
        
        const elementsToShow = [
            this.user.recordeElement,
            this.ui.peepoThink,
            this.user.medalhas
        ];
        
        for (const el of elementsToShow) {
            this.ui.showElement(el);
        }
    }

    restartGame(): void {
        this.ui.showElementFlex(this.ui.modalInfo.modalHelp);
        this.ui.hideElement(this.ui.modalInfo.modalGameOver);
        this.gameState.resetGameState();
        
        this.ui.hideElement(this.ui.peepoThink);
        this.ui.hideElement(this.user.medalhas);
        
        const channelValue = this.ui.inputChannel.value;
        this.ui.showLoading(channelValue, this.ui.loading);
        this.getEmotesGame(channelValue);
        
        this.ui.clear(this.ui.invalidChannel);
        this.ui.clear(this.ui.subtitle);
        this.ui.clear(this.ui.app);
        this.ui.vidas.resetVidas();
    }

    getEmotesGame = async (channel: string): Promise<void> => {
        this.acertos = 0;
        try {
            const emotes = await this.emoteService.fetchEmotes(channel);
            this.emotesList = this.emoteService.processEmotes(emotes);
            
            this.ui.hideElement(this.user.recordeElement);
            this.getEmotenames(this.emotesList);
            
            this.emoteAtual = this.emoteService.getRandomEmote(this.emotesList);
            
            this.autocomplete.loadEmotesList(this.emotesList);
            
            this.ui.clear(this.ui.app);
            this.ui.clear(this.ui.loading);
            
            this.showEmoteGame(this.emoteAtual);
            this.ui.showEmoteTry(this.autocomplete);
            this.ui.showAcertos.innerHTML = `${this.acertos}`;
            this.ui.showElement(this.ui.vidas.vidasUI);
        } catch (error) {
            this.handleEmotesFetchError(channel);
        }
    };
    
    private handleEmotesFetchError(channel: string): void {
        this.ui.clear(this.ui.loading);
        this.ui.clear(this.ui.app);
        this.ui.clear(this.ui.showAcertos);
        this.ui.hideElement(this.ui.emoteTryContainer);
        this.ui.hideElement(this.ui.vidas.vidasUI);
        this.ui.showInvalidChannel(channel, this.ui.invalidChannel);
        this.ui.showElement(this.ui.peepoThink);
        this.ui.showElement(this.user.recordeElement);
    }

    continueGame = (emotesList: Emote[]): void => {
        this.emoteService.removeCurrentEmote(emotesList, this.emoteAtual, this.emoteNames);
        this.emoteAtual = this.emoteService.getRandomEmote(emotesList);
        
        this.ui.clear(this.ui.app);
        this.ui.inputEmote.value = "";
        this.ui.inputEmote.focus();
        this.showEmoteGame(this.emoteAtual);
    };

    updateGameOverModal = (): void => {
        this.modalManager.updateGameOverModal();
    }
    
    updateWinModal = (): void => {
        this.modalManager.updateWinModal();
    }

    gameplay = (): void => {
        const inputValue = this.ui.inputEmote.value;
        const emoteName = this.emoteAtual.name;
        
        if (inputValue === emoteName) {
            this.handleCorrectGuess();
        } else {
            this.handleIncorrectGuess();
        }
    }
    
    private handleCorrectGuess(): void {
        this.gameState.incrementScore();
        
        if (this.gameState.shouldAddLife()) {
            this.gameState.addLife();
            this.ui.vidas.checkVidas(this.vidasRestantes);
        }
        
        this.ui.inputEmote.setAttribute("placeholder", "Acertou!");
        this.ui.inputEmote.style.boxShadow = "0 0 0 3px green";
        this.ui.showAcertos.innerHTML = `${this.acertos}`;

        if (this.emotesList.length === 1) {
            this.handleWinCondition();
        } else {
            this.continueGame(this.emotesList);
        }
    }
    
    private handleWinCondition(): void {
        this.updateWinModal();
        this.ui.modalInfo.dialog.showModal();
        
        this.ui.showElementFlex(this.ui.modalInfo.modalWin);
        this.ui.hideElement(this.ui.modalInfo.modalHelp);
        this.ui.hideElement(this.ui.modalInfo.modalGameOver);
    }
    
    private handleIncorrectGuess(): void {
        this.gameState.resetConsecutiveCorrect();
        this.gameState.decrementLives();
        this.ui.vidas.checkVidas(this.vidasRestantes);
        
        this.ui.inputEmote.style.boxShadow = "0 0 0 3px rgba(191, 2, 2)";
        this.ui.inputEmote.setAttribute("placeholder", "Tente novamente");
        this.ui.inputEmote.value = "";
        this.ui.showAcertos.innerHTML = `${this.acertos}`;
        
        if (this.vidasRestantes > 0) {
            this.handleContinueAfterIncorrect();
        } else {
            this.handleGameOver();
        }
    }
    
    private handleContinueAfterIncorrect(): void {
        this.ui.shakeWrong(this.ui.inputEmote);
        this.ui.shakeWrong(this.ui.vidas.vidasUI);
        this.ui.clear(this.ui.app);
        this.showEmoteGame(this.emoteAtual);
    }
    
    private handleGameOver(): void {
        this.ui.shakeWrong(this.ui.inputEmote);
        
        if (this.acertos > this.user.recorde) {
            this.user.recorde = this.acertos;
            localStorage.setItem("Recorde", this.user.recorde.toString());
        }
        
        this.updateGameOverModal();
        this.ui.modalInfo.dialog.showModal();
        
        this.ui.showElementFlex(this.ui.modalInfo.modalGameOver);
        this.ui.hideElement(this.ui.modalInfo.modalHelp);
        this.ui.hideElement(this.ui.modalInfo.modalWin);
    }
}

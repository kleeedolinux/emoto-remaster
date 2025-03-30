import { Game } from "./Game";

export class ModalManager {
    private game: Game;
    private modalGameOverContent: HTMLElement | null = null;
    private modalWinContent: HTMLElement | null = null;

    constructor(game: Game) {
        this.game = game;
    }
    
    updateGameOverModal(): void {
        if (!this.modalGameOverContent) {
            this.modalGameOverContent = this.game.ui.modalInfo.modalGameOver.querySelector("#modalGameOverContent");
        }
        
        if (this.modalGameOverContent) {
            this.modalGameOverContent.innerHTML = `
            <p id="modalText">
                O Emote era '${this.game.emoteAtual.name}'
            </p>
            <p id="modalText">
                Você acertou
            </p>
            <p id="modalAcertos">
            ${this.game.acertos}
            </p>
            <p id="modalText">
                emotes!
            </p>
            `;
        }
    }
    
    updateWinModal(): void {
        if (!this.modalWinContent) {
            this.modalWinContent = this.game.ui.modalInfo.modalWin.querySelector("#modalWinContent");
        }
        
        if (this.modalWinContent) {
            this.modalWinContent.innerHTML = `
            <p id="modalText">
            Impossível... 
            Você acertou todos os
            </p>
            <p id="modalAcertos">
            ${this.game.acertos}
            </p>
            <p id="modalText">
                emotes!
            </p>
            <p id="modalText">
                Parabéns... eu acho?
            </p>
            `;
        }
    }
} 
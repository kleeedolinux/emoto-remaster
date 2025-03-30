import { Game } from "./Game";

export class GameState {
    private game: Game;
    
    constructor(game: Game) {
        this.game = game;
    }
    
    resetGameState(): void {
        this.game.emotesList = [];
        this.game.emoteNames = [];
        this.game.acertos = 0;
        this.game.acertosSeguidos = 0;
        this.game.vidasRestantes = 4;
    }
    
    incrementScore(): void {
        this.game.acertos++;
        this.game.acertosSeguidos++;
    }
    
    shouldAddLife(): boolean {
        return this.game.acertosSeguidos === 3 && this.game.vidasRestantes < 4;
    }
    
    addLife(): void {
        this.game.vidasRestantes++;
        this.game.acertosSeguidos = 0;
    }
    
    resetConsecutiveCorrect(): void {
        this.game.acertosSeguidos = 0;
    }
    
    decrementLives(): void {
        this.game.vidasRestantes--;
    }
    
    hasLivesRemaining(): boolean {
        return this.game.vidasRestantes > 0;
    }
    
    updateHighScore(): void {
        if (this.game.acertos > this.game.user.recorde) {
            this.game.user.recorde = this.game.acertos;
            localStorage.setItem("Recorde", this.game.user.recorde.toString());
        }
    }
} 
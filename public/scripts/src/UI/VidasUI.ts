export class Vidas {
    vidasUI: HTMLElement = document.getElementById("vidas")!;
    vida1: HTMLElement = document.getElementById("vida1")!;
    vida2: HTMLElement = document.getElementById("vida2")!;
    vida3: HTMLElement = document.getElementById("vida3")!;
    vida4: HTMLElement = document.getElementById("vida4")!;
    
    private vidasElements: HTMLElement[];
    private readonly RED = "red";
    private readonly GRAY = "gray";
    private lastVidasState: number = 4;
    
    constructor() {
        this.vidasElements = [this.vida1, this.vida2, this.vida3, this.vida4];
    }

    checkVidas(vidasRestantes: number): void {
        if (vidasRestantes === this.lastVidasState) {
            return;
        }
        
        this.lastVidasState = vidasRestantes;
        
        for (let i = 0; i < this.vidasElements.length; i++) {
            this.vidasElements[i].style.color = i < vidasRestantes ? this.RED : this.GRAY;
        }
    }

    resetVidas(): void {
        if (this.lastVidasState === 4) {
            return;
        }
        
        this.lastVidasState = 4;
        
        for (const element of this.vidasElements) {
            element.style.color = this.RED;
        }
    }
}
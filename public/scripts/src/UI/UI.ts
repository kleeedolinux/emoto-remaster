import { Autocomplete } from "./Autocomplete.js";
import { ModalGameOver } from "./ModalGameOver.js";
import { ModalInfo } from "./ModalInfo.js";
import { Vidas } from "./VidasUI.js";

export class UI {
    vidas: Vidas = new Vidas();
    modalInfo: ModalInfo = new ModalInfo();
    modalGameOver: ModalGameOver = new ModalGameOver();

    // Cache DOM elements
    titleEmoto: HTMLElement = document.querySelector(".title")!;
    subtitle: HTMLElement = document.getElementById("subtitle")!;
    peepoThink: HTMLElement = document.getElementById("peepoThink")!;
    inputChannel: HTMLInputElement = document.getElementById("channelInput")! as HTMLInputElement;
    subtitle2: HTMLElement = document.getElementById("subtitle2")!;
    invalidChannel: HTMLElement = document.getElementById("invalidChannel")!;

    app: HTMLElement = document.getElementById("app")!;
    loading: HTMLElement = document.getElementById("loading")!;
    emoteTryContainer: HTMLElement = document.getElementById("emoteTryContainer")!;
    inputEmote: HTMLInputElement = document.getElementById("emoteTry")! as HTMLInputElement;
    showAcertos: HTMLElement = document.getElementById("acertos")!;

    private elementCache: Map<HTMLElement, string> = new Map();
    private animationFrame: number | null = null;

    constructor() {
        this.titleEmoto.addEventListener("click", () => {
            window.location.reload();
        });
    }

    showEmoteTry(autocomplete: Autocomplete): void {
        // Batch style changes
        this.updateElementVisibility(this.emoteTryContainer, "block");
        this.updateElementVisibility(this.inputEmote, "block");
        this.hideElement(autocomplete.emotesListAutocomplete);
        
        // Focus after visibility changes
        requestAnimationFrame(() => {
            this.inputEmote.focus();
        });
    }

    hideElement(element: HTMLElement): void {
        this.updateElementVisibility(element, "none");
    }

    showElement(element: HTMLElement): void {
        this.updateElementVisibility(element, "block");
    }

    showElementFlex(element: HTMLElement): void {
        this.updateElementVisibility(element, "flex");
    }

    private updateElementVisibility(element: HTMLElement, displayValue: string): void {
        // Only update if the display value has changed
        if (this.elementCache.get(element) !== displayValue) {
            element.style.display = displayValue;
            this.elementCache.set(element, displayValue);
        }
    }

    clear = (container: HTMLElement): void => {
        if (container.innerHTML !== "") {
            container.innerHTML = "";
        }
    };

    shakeWrong(element: HTMLElement): void {
        // Cancel any existing animation frame
        if (this.animationFrame !== null) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Apply animation using requestAnimationFrame
        this.animationFrame = requestAnimationFrame(() => {
            // Force browser to process layout before changing animation
            void element.offsetWidth;
            
            element.style.animation = "shake 0.2s";
            element.style.animationIterationCount = "1";
            
            // Clean up animation after it completes
            setTimeout(() => {
                element.style.animation = "none";
                this.animationFrame = null;
            }, 400);
        });
    }

    showLoading = (channel: string, loading: HTMLElement): void => {
        const output = `
        <p id = "loadingText"> Carregando emotes de twitch.tv/${channel}...</p>
        <img id="loadingImg" src="./img/loading2.webp">
        `;
        loading.innerHTML = output;
    };

    showInvalidChannel = (channel: string, invalidChannel: HTMLElement): void => {
        const output = `
        <p id = "invalidChannelText"> O canal ${channel} não foi encontrado...</p>
        `;
        invalidChannel.innerHTML = output;
    };
}
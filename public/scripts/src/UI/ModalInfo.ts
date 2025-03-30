export class ModalInfo {
    // Frequently accessed elements are loaded immediately
    dialog: HTMLDialogElement = document.querySelector("dialog") as HTMLDialogElement;
    modalHelp: HTMLElement;
    modalGameOver: HTMLElement;
    modalWin: HTMLElement;
    
    // Elements accessed less frequently are stored as getter properties
    private _helpBtn: HTMLElement | null = null;
    private _dialogCloseBtn: HTMLElement | null = null;
    private _dialogTryAgainBtn: HTMLElement | null = null;
    private _dialogHomeButtonGameOver: HTMLElement | null = null;
    private _dialogHomeButtonWin: HTMLElement | null = null;
    private _dialogTwitterButtonWin: HTMLElement | null = null;
    private _dialogTwitterButtonGameOver: HTMLElement | null = null;
    
    // Element cache to store elements after they're accessed
    private readonly elementCache = new Map<string, HTMLElement>();

    constructor() {
        // Initialize immediately needed elements
        this.modalHelp = this.getElement("modalHelp");
        this.modalGameOver = this.getElement("modalGameOver");
        this.modalWin = this.getElement("modalWin");
        
        // Set up event listeners using event delegation where possible
        this.getHelpBtn().addEventListener("click", () => {
            this.dialog.showModal();
        });
        
        this.getDialogCloseBtn().addEventListener("click", () => {
            this.dialog.close();
        });
    }
    
    private getElement(id: string): HTMLElement {
        let element = this.elementCache.get(id);
        if (!element) {
            element = document.getElementById(id)!;
            this.elementCache.set(id, element);
        }
        return element;
    }
    
    // Lazy-loaded getters
    get helpBtn(): HTMLElement {
        return this.getHelpBtn();
    }
    
    get dialogCloseBtn(): HTMLElement {
        return this.getDialogCloseBtn();
    }
    
    get dialogTryAgainBtn(): HTMLElement {
        if (!this._dialogTryAgainBtn) {
            this._dialogTryAgainBtn = this.getElement("dialogTryAgainButton");
        }
        return this._dialogTryAgainBtn;
    }
    
    get dialogHomeButtonGameOver(): HTMLElement {
        if (!this._dialogHomeButtonGameOver) {
            this._dialogHomeButtonGameOver = this.getElement("dialogHomeButtonGameOver");
        }
        return this._dialogHomeButtonGameOver;
    }
    
    get dialogHomeButtonWin(): HTMLElement {
        if (!this._dialogHomeButtonWin) {
            this._dialogHomeButtonWin = this.getElement("dialogHomeButtonWin");
        }
        return this._dialogHomeButtonWin;
    }
    
    get dialogTwitterButtonWin(): HTMLElement {
        if (!this._dialogTwitterButtonWin) {
            this._dialogTwitterButtonWin = this.getElement("dialogTwitterButtonWin");
        }
        return this._dialogTwitterButtonWin;
    }
    
    get dialogTwitterButtonGameOver(): HTMLElement {
        if (!this._dialogTwitterButtonGameOver) {
            this._dialogTwitterButtonGameOver = this.getElement("dialogTwitterButtonGameOver");
        }
        return this._dialogTwitterButtonGameOver;
    }
    
    private getHelpBtn(): HTMLElement {
        if (!this._helpBtn) {
            this._helpBtn = this.getElement("Help");
        }
        return this._helpBtn;
    }
    
    private getDialogCloseBtn(): HTMLElement {
        if (!this._dialogCloseBtn) {
            this._dialogCloseBtn = this.getElement("modalCloseButton");
        }
        return this._dialogCloseBtn;
    }
}
import { Emote } from "../Game/Emote.js";
import { Game } from "../Game/Game.js";

export class Autocomplete {
    emotesListAutocomplete: HTMLElement;
    game: Game;
    private cachedFilterResults: Map<string, Emote[]> = new Map();
    private emotesList: Emote[] = [];
    private cachedHtml: Map<string, DocumentFragment> = new Map();
    private maxDisplayLength: number = 25;
    private selectedIndex: number = -1;
    
    constructor(game: Game) {
        this.game = game;
        this.emotesListAutocomplete = document.getElementById("emotes-list")!;
    }

    filterEmotesList(emotes: Emote[], inputText: string): Emote[] {
        if (!inputText) {
            return emotes.slice(0, 10);
        }
        
        const cacheKey = inputText.toLowerCase();
        if (this.cachedFilterResults.has(cacheKey)) {
            return this.cachedFilterResults.get(cacheKey)!;
        }
        
        const normalizedInput = cacheKey;
        const results = emotes.filter(x => 
            x.name.toLowerCase().includes(normalizedInput)
        ).slice(0, 10);
        
        this.cachedFilterResults.set(cacheKey, results);
        return results;
    }

    loadEmotesList(emotes: Emote[]): void {
        this.emotesList = emotes;
        this.cachedFilterResults.clear();
        this.cachedHtml.clear();
        
        if (emotes.length > 0) {
            this.renderEmotesList(emotes.slice(0, 10));
        }
    }
    
    renderEmotesList(emotes: Emote[]): void {
        const cacheKey = emotes.map(e => e.name).join('|');
        
        if (this.cachedHtml.has(cacheKey)) {
            this.emotesListAutocomplete.innerHTML = '';
            this.emotesListAutocomplete.appendChild(
                this.cachedHtml.get(cacheKey)!.cloneNode(true)
            );
            return;
        }
        
        const fragment = document.createDocumentFragment();
        
        emotes.forEach(emote => {
            const li = document.createElement('li');
            li.className = 'autocomplete-item';
            li.tabIndex = 0;
            
            const displayName = this.formatEmoteName(emote.name);
            li.textContent = displayName;
            
            li.dataset.fullName = emote.name;
            
            fragment.appendChild(li);
        });
        
        this.cachedHtml.set(cacheKey, fragment.cloneNode(true) as DocumentFragment);
        
        this.emotesListAutocomplete.innerHTML = '';
        this.emotesListAutocomplete.appendChild(fragment);
        this.selectedIndex = -1;
    }
    
    /**
     * Format emote name for display, adding ellipsis for long names
     * and preserving line breaks
     */
    private formatEmoteName(name: string): string {
        if (name.length <= this.maxDisplayLength) {
            return name;
        }
        
        return name.substring(0, this.maxDisplayLength) + '...';
    }
    
    updateAutocomplete(inputText: string): void {
        const filteredEmotes = this.filterEmotesList(this.emotesList, inputText);
        this.renderEmotesList(filteredEmotes);
    }
    
    navigateAutocomplete(direction: 'up' | 'down' | 'home' | 'end'): void {
        const items = this.emotesListAutocomplete.querySelectorAll('li.autocomplete-item');
        if (items.length === 0) return;
        
        this.clearSelection();
        
        switch (direction) {
            case 'up':
                this.selectedIndex = this.selectedIndex <= 0 ? items.length - 1 : this.selectedIndex - 1;
                break;
            case 'down':
                this.selectedIndex = this.selectedIndex >= items.length - 1 ? 0 : this.selectedIndex + 1;
                break;
            case 'home':
                this.selectedIndex = 0;
                break;
            case 'end':
                this.selectedIndex = items.length - 1;
                break;
        }
        
        this.highlightItem(items[this.selectedIndex] as HTMLElement);
        this.scrollToSelectedItem(items[this.selectedIndex] as HTMLElement);
    }
    
    selectCurrentItem(): string | null {
        const items = this.emotesListAutocomplete.querySelectorAll('li.autocomplete-item');
        if (this.selectedIndex >= 0 && this.selectedIndex < items.length) {
            const selected = items[this.selectedIndex] as HTMLElement;
            return selected.dataset.fullName || selected.textContent;
        }
        return null;
    }
    
    private clearSelection(): void {
        const items = this.emotesListAutocomplete.querySelectorAll('li.autocomplete-item.selected');
        items.forEach(item => item.classList.remove('selected'));
    }
    
    private highlightItem(item: HTMLElement): void {
        item.classList.add('selected');
    }
    
    private scrollToSelectedItem(element: HTMLElement): void {
        if (!element) return;
        
        const container = this.emotesListAutocomplete;
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        if (elementRect.bottom > containerRect.bottom) {
            container.scrollTop = element.offsetTop - container.offsetHeight + element.offsetHeight;
        } else if (elementRect.top < containerRect.top) {
            container.scrollTop = element.offsetTop;
        }
    }
}
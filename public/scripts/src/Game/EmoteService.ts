import { Emote } from "./Emote";

export class EmoteService {
    private emoteNameCache: Map<string, string[]> = new Map();
    private emoteHtmlCache: Map<string, string> = new Map();
    private fetchCache: Map<string, any[]> = new Map();
    private processedEmotesCache: Map<string, Emote[]> = new Map();
    private imageCache: Map<string, HTMLImageElement> = new Map();
    private imageLoadQueue: string[] = [];
    private isLoadingImage: boolean = false;
    private maxConcurrentLoads: number = 10;
    private activeLoads: number = 0;
    private abortControllers: Map<string, AbortController> = new Map();
    
    getEmoteNames(emotes: Emote[]): string[] {
        const cacheKey = this.getCacheKeyForEmotes(emotes);
        
        if (this.emoteNameCache.has(cacheKey)) {
            return this.emoteNameCache.get(cacheKey)!;
        }
        
        const names = emotes.map(emote => emote.name);
        this.emoteNameCache.set(cacheKey, names);
        return names;
    }
    
    getEmoteHtml(emote: Emote): string {
        if (this.emoteHtmlCache.has(emote.name)) {
            return this.emoteHtmlCache.get(emote.name)!;
        }
        
        this.preloadImage(emote.image);
        
        const html = `<a class="card"><img class="card--image4" src=${emote.image} alt="Emoto" /></a>`;
        
        this.emoteHtmlCache.set(emote.name, html);
        return html;
    }
    
    preloadImage(src: string): void {
        if (this.imageCache.has(src)) {
            return;
        }
        
        if (!this.imageLoadQueue.includes(src)) {
            this.imageLoadQueue.push(src);
            this.processImageQueue();
        }
    }
    
    processImageQueue(): void {
        if (this.isLoadingImage || this.imageLoadQueue.length === 0 || this.activeLoads >= this.maxConcurrentLoads) {
            return;
        }
        
        this.isLoadingImage = true;
        
        while (this.imageLoadQueue.length > 0 && this.activeLoads < this.maxConcurrentLoads) {
            const src = this.imageLoadQueue.shift()!;
            this.activeLoads++;
            
            const img = new Image();
            img.onload = () => {
                this.imageCache.set(src, img);
                this.activeLoads--;
                this.processImageQueue();
            };
            img.onerror = () => {
                this.activeLoads--;
                this.processImageQueue();
            };
            img.src = src;
        }
        
        this.isLoadingImage = false;
    }
    
    async fetchEmotes(channel: string): Promise<any[]> {
        if (this.fetchCache.has(channel)) {
            return this.fetchCache.get(channel)!;
        }
        
        if (this.abortControllers.has(channel)) {
            this.abortControllers.get(channel)!.abort();
        }
        
        const controller = new AbortController();
        this.abortControllers.set(channel, controller);
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        try {
            const response: Response = await fetch(
                `https://emotes.crippled.dev/v1/channel/${channel}/all`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                    signal: controller.signal,
                    cache: "force-cache"
                }
            );
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorMessage = response.status === 429 
                    ? `Rate limit exceeded. Reset in ${response.headers.get('X-Ratelimit-Reset')} seconds`
                    : `HTTP error! Status: ${response.status}`;
                throw new Error(errorMessage);
            }
            
            const emotes = await response.json();
            
            if (!Array.isArray(emotes)) {
                throw new Error('Invalid response format: expected an array of emotes');
            }
            
            const validEmotes = [];
            for (let i = 0; i < emotes.length; i++) {
                const emote = emotes[i];
                if (emote && 
                    typeof emote.provider === 'number' && 
                    typeof emote.code === 'string' && 
                    Array.isArray(emote.urls) && 
                    emote.urls.length > 0) {
                    
                    let hasValidUrl = false;
                    for (let j = 0; j < emote.urls.length; j++) {
                        if (emote.urls[j] && typeof emote.urls[j].url === 'string') {
                            hasValidUrl = true;
                            break;
                        }
                    }
                    
                    if (hasValidUrl) {
                        validEmotes.push(emote);
                    }
                }
            }
            
            if (validEmotes.length === 0) {
                throw new Error(`No valid emotes found for channel: ${channel}`);
            }
            
            this.fetchCache.set(channel, validEmotes);
            return validEmotes;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            
            throw error;
        } finally {
            this.abortControllers.delete(channel);
        }
    }
    
    processEmotes(emotes: any[]): Emote[] {
        const cacheKey = this.getCacheKeyForRawEmotes(emotes);
        
        if (this.processedEmotesCache.has(cacheKey)) {
            return this.processedEmotesCache.get(cacheKey)!;
        }
        
        const emoteCount = emotes.length;
        const result = new Array(emoteCount);
        
        const batchSize = 500;
        const batches = Math.ceil(emoteCount / batchSize);
        
        for (let b = 0; b < batches; b++) {
            const startIdx = b * batchSize;
            const endIdx = Math.min(startIdx + batchSize, emoteCount);
            
            for (let i = startIdx; i < endIdx; i++) {
                const emote = emotes[i];
                const imageUrl = emote.urls[Math.min(2, emote.urls.length - 1)].url;
                result[i] = {
                    name: emote.code,
                    image: imageUrl,
                };
                
                if (i < 100) {
                    this.preloadImage(imageUrl);
                }
            }
        }
        
        this.processedEmotesCache.set(cacheKey, result);
        return result;
    }
    
    getRandomEmote(emotes: Emote[]): Emote {
        if (emotes.length === 0) {
            throw new Error("Cannot get random emote from empty array");
        }
        
        const randomIndex = Math.floor(Math.random() * emotes.length);
        return emotes[randomIndex];
    }
    
    removeCurrentEmote(emotesList: Emote[], currentEmote: Emote, emoteNames: string[]): void {
        const currentIndex = emotesList.indexOf(currentEmote);
        if (currentIndex !== -1) {
            const lastElement = emotesList[emotesList.length - 1];
            emotesList[currentIndex] = lastElement;
            emotesList.pop();
        }
        
        const nameIndex = emoteNames.indexOf(currentEmote.name);
        if (nameIndex !== -1) {
            const lastElement = emoteNames[emoteNames.length - 1];
            emoteNames[nameIndex] = lastElement;
            emoteNames.pop();
        }
        
        this.emoteNameCache.delete(this.getCacheKeyForEmotes(emotesList));
    }
    
    clearCache(): void {
        this.emoteNameCache.clear();
        this.emoteHtmlCache.clear();
        this.fetchCache.clear();
        this.processedEmotesCache.clear();
        this.imageCache.clear();
        this.imageLoadQueue = [];
        this.activeLoads = 0;
        this.isLoadingImage = false;
        
        for (const controller of this.abortControllers.values()) {
            controller.abort();
        }
        this.abortControllers.clear();
    }
    
    private getCacheKeyForEmotes(emotes: Emote[]): string {
        return emotes.length.toString();
    }
    
    private getCacheKeyForRawEmotes(emotes: any[]): string {
        return emotes.length.toString();
    }
} 
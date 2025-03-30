import { Game } from "./Game/Game.js";
import { User } from "./Profile/User.js";

document.addEventListener("contextmenu", (event) => event.preventDefault(), { passive: true });

const user = new User("user");
const game = new Game(user);
const autocomplete = game.autocomplete;
const ui = game.ui;

// Use debounce for input events to prevent excessive filtering
let inputDebounceTimer: ReturnType<typeof setTimeout>;
ui.inputEmote.addEventListener("input", () => {
	clearTimeout(inputDebounceTimer);
	inputDebounceTimer = setTimeout(() => {
		const value = ui.inputEmote.value;
		autocomplete.updateAutocomplete(value);
		
		if (autocomplete.emotesListAutocomplete.children.length > 0) {
			game.showAutocompleteList();
		}
	}, 50);
}, { passive: true });

ui.inputEmote.addEventListener("keydown", (e: KeyboardEvent) => {
	if (e.key === "Enter" && !e.defaultPrevented) {
		game.gameplay();
		game.hideAutocompleteList();
	}
});

// Use event delegation for window clicks
window.addEventListener("click", (event) => {
	const target = event.target as HTMLElement;
	
	// Handle modal dialog clicks
	if (event.target === ui.modalInfo.dialog && 
		ui.modalInfo.modalHelp.style.display !== "none") {
		ui.modalInfo.dialog.close();
	}
	
	// Handle autocomplete item clicks with event delegation
	if (target.classList?.contains("autocomplete-item")) {
		ui.inputEmote.value = target.dataset.fullName || target.innerText;
		ui.inputEmote.focus();
		game.hideAutocompleteList();
	}
}, { passive: true });

// Optimize autocomplete keyboard navigation
autocomplete.emotesListAutocomplete.addEventListener("click", (e: MouseEvent) => {
	const target = e.target as HTMLElement;
	if (target.classList.contains("autocomplete-item")) {
		ui.inputEmote.value = target.dataset.fullName || target.innerText;
		ui.inputEmote.focus();
		game.gameplay();
		game.hideAutocompleteList();
	}
});

// Group similar event listeners
const setupButtonListeners = () => {
	ui.modalInfo.dialogTryAgainBtn.addEventListener("click", () => {
		game.ui.clear(game.ui.app);
		game.restartGame();
	});
	
	// Use a single function for home buttons
	const homeButtonHandler = () => window.location.reload();
	ui.modalInfo.dialogHomeButtonGameOver.addEventListener("click", homeButtonHandler);
	ui.modalInfo.dialogHomeButtonWin.addEventListener("click", homeButtonHandler);
	
	// Tweet button handlers
	ui.modalInfo.dialogTwitterButtonWin.addEventListener("click", () => {
		window.open(getURLTweetWin());
	});
	
	ui.modalInfo.dialogTwitterButtonGameOver.addEventListener("click", () => {
		window.open(getURLTweetGameOver());
	});
};

setupButtonListeners();

// URL generators
function getURLTweetGameOver(): string {
	return `https://twitter.com/intent/tweet?text=Eu acertei ${game.acertos} Emotes do canal ${game.channel}! Você consegue acertar mais? Tente agora em emoto.discloud.app !`;
}

function getURLTweetWin(): string {
	return `https://twitter.com/intent/tweet?text=Eu acertei TODOS os Emotes do canal ${game.channel}! Você acha que consegue também? Tente agora em emoto.discloud.app !`;
}

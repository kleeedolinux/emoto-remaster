export class ModalGameOver {
    dialog: HTMLDialogElement = document.querySelector("dialog") as HTMLDialogElement;
    dialogTryAgainBtn = document.getElementById("dialogTryAgainButton")!;

    constructor() {
        this.dialogTryAgainBtn.addEventListener("click", () => {
            this.dialog.close();
        });
    }
}
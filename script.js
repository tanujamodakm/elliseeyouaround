import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs
}
    from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDf875lb59obAXmVhVKUom01FeSGcUmv10",
    authDomain: "ellisee.firebaseapp.com",
    databaseURL: "https://ellisee-default-rtdb.firebaseio.com",
    projectId: "ellisee",
    storageBucket: "ellisee.firebasestorage.app",
    messagingSenderId: "635177822464",
    appId: "1:635177822464:web:8ee9ef757b97b4bb716be5",
    measurementId: "G-96HPL0LWDD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const flowersCollection = collection(db, "flowers");
const nameInput = document.getElementById("nameInput");
const enterBtn = document.getElementById("enterBtn");
const nameBox = document.querySelector(".name-box");
const welcome = document.getElementById("welcome");
const username = document.getElementById("username");
const drawBtn = document.getElementById("drawBtn");
const canvasBox = document.getElementById("canvasBox");
const grid = document.getElementById("grid");
const colorPicker = document.getElementById("colorPicker");
const eraserBtn = document.getElementById("eraserBtn");
const fillBtn = document.getElementById("fillBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const clearCanvasBtn = document.getElementById("clearCanvasBtn");
const saveBtn = document.getElementById("saveBtn");
const message = document.getElementById("message");
const backgroundGarden = document.getElementById("backgroundGarden");
const gardenSpace = document.getElementById("gardenSpace");
const messageBar = document.getElementById("messageBar");
const messageText = document.getElementById("messageText");
const homeBtn = document.getElementById("homeBtn");

let currentUser = "";
let currentColor = "#ff9fa5";
let currentTool = "brush";
let mouseDown = false;
let drawData = [];
let undoStack = [];
let redoStack = [];
let waitingForPlacement = false;
let flowerToPlace = null;
let flowerMessage = "";

function updateToolUI() {
    eraserBtn.classList.remove("active");
    fillBtn.classList.remove("active");
    colorPicker.classList.remove("active");
    if (currentTool === "brush") {
        colorPicker.classList.add("active");
    }

    if (currentTool === "eraser") {
        eraserBtn.classList.add("active");
    }

    if (currentTool === "fill") {
        fillBtn.classList.add("active");
    }
}

function enterName() {
    let name =
        nameInput.value.trim();

    if (!name) return;
    currentUser = name;
    username.textContent = name;
    nameBox.style.display = "none";
    welcome.style.display = "block";
    setTimeout(() => {
        document.getElementById("helloText")
            .style.display = "none";
        drawBtn.style.display = "flex";
    }, 2000);
}

nameInput.addEventListener(
    "keydown",
    (e) => {
        if (e.key === "Enter") {
            enterName();
        }
    });

enterBtn.addEventListener(
    "click",
    () => {
        enterName();
    });

drawBtn.addEventListener(
    "click",
    () => {
        welcome.style.display = "none";
        canvasBox.style.display = "block";
        createGrid();
        updateToolUI();
    });

function createGrid() {
    grid.innerHTML = "";
    drawData = new Array(360).fill("");
    undoStack = [];
    redoStack = [];

    for (let i = 0; i < 360; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            undoStack.push([...drawData]);
            redoStack = [];
            mouseDown = true;
            paint(cell, i);
        });

        cell.addEventListener("pointerenter", (e) => {
            e.preventDefault();
            if (mouseDown) {
                paint(cell, i);
            }
        });

        cell.addEventListener("pointermove", (e) => {
            e.preventDefault();
            if (mouseDown) {
                paint(cell, i);
            }
        });

        cell.addEventListener("pointerup", () => {
            mouseDown = false;
        });

        cell.addEventListener("pointerleave", () => {
            if (!mouseDown) return;
        });

        grid.appendChild(cell);
    }
}

document.addEventListener("pointerup", () => {
    mouseDown = false;
});

function paint(cell, index) {
    if (currentTool === "fill") {
        drawData[index] = currentColor;
        redrawGrid();
        return;
    }

    if (currentTool === "eraser") {
        drawData[index] = "";
        cell.style.background = "white";
        return;
    }

    drawData[index] = currentColor;
    cell.style.background =
        currentColor;
}

function redrawGrid() {
    const cells =
        document.querySelectorAll(
            ".cell"
        );

    cells.forEach(
        (cell, index) => {
            cell.style.background =
                drawData[index] || "white";
        });
}

colorPicker.addEventListener(
    "input",
    () => {
        currentColor =
            colorPicker.value;
        currentTool = "brush";
        updateToolUI();
    });

eraserBtn.addEventListener(
    "click",
    () => {
        currentTool = "eraser";
        updateToolUI();
    });

fillBtn.addEventListener(
    "click",
    () => {
        currentTool = "fill";
        updateToolUI();
    });

undoBtn.addEventListener(
    "click",
    () => {
        if (!undoStack.length)
            return;
        redoStack.push(
            [...drawData]
        );

        drawData =
            undoStack.pop();
        redrawGrid();
    });

redoBtn.addEventListener(
    "click",
    () => {
        if (!redoStack.length)
            return;
        undoStack.push(
            [...drawData]
        );

        drawData =
            redoStack.pop();
        redrawGrid();
    });

clearCanvasBtn.addEventListener(
    "click",
    () => {
        undoStack.push(
            [...drawData]
        );

        redoStack = [];
        drawData =
            new Array(360)
                .fill("");
        redrawGrid();
    });

homeBtn.addEventListener(
    "click",
    () => {
        location.reload();
    });

function saveDrawing() {
    const text =
        message.value.trim();
    if (!text) {
        alert("Write something");
        return;
    }

    const hasDrawing =
        drawData.some(
            pixel => pixel !== ""
        );

    if (!hasDrawing) {
        alert("Draw something first");
        return;
    }

    flowerToPlace =
        [...drawData];
    flowerMessage =
        `${currentUser}|${text}`;
    waitingForPlacement = true;
    canvasBox.style.display = "none";
}

saveBtn.addEventListener(
    "click",
    saveDrawing
);

message.addEventListener(
    "keydown",
    (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveDrawing();
        }
    });

backgroundGarden.addEventListener(
    "click",
    async (e) => {
        if (!waitingForPlacement)
            return;
        const rect =
            backgroundGarden
                .getBoundingClientRect();

        const x =
            e.clientX -
            rect.left +
            backgroundGarden.scrollLeft;

        const y =
            e.clientY -
            rect.top +
            backgroundGarden.scrollTop;

        try {
            await addDoc(
                flowersCollection,
                {
                    drawing:
                        flowerToPlace,

                    message:
                        flowerMessage,

                    x: x,
                    y: y,
                    created:
                        Date.now()
                });

            console.log(
                "Saved"
            );
        }
        catch (err) {
            console.log(
                err
            );
            alert(
                "Firebase error"
            );
        }

        waitingForPlacement = false;
        flowerToPlace = null;
        flowerMessage = "";
        showGarden();
    });

async function showGarden() {
    document
        .querySelectorAll(".pixelFlower")
        .forEach(
            flower => flower.remove()
        );

    try {
        const snapshot =
            await getDocs(
                flowersCollection
            );
        snapshot.forEach(
            (doc) => {
                const data =
                    doc.data();
                createFlower(
                    data.drawing,
                    data.message,
                    data.x,
                    data.y
                );
            });
    }

    catch (error) {
        console.log(
            "Loading error",
            error
        );
    }
}

function createFlower(
    drawing,
    msg,
    x,
    y
) {
    if (
        !drawing ||
        !Array.isArray(drawing)
    )
        return;

    const flower =
        document.createElement("div");
    flower.className =
        "pixelFlower";

    flower.style.left =
        x + "px";

    flower.style.top =
        y + "px";

    flower.style.gridTemplateColumns =
        "repeat(20,8px)";

    flower.style.gridTemplateRows =
        "repeat(18,8px)";

    drawing.forEach(
        pixel => {

            const square =
                document.createElement("div");

            square.style.background =
                pixel || "transparent";

            flower.appendChild(square);
        });

    flower.addEventListener(
        "click",
        (e) => {
            e.stopPropagation();

            let parts =
                (msg || "Unknown|No message")
                    .split("|");

            let author =
                parts[0];

            let text =
                parts.slice(1)
                    .join("|");

            messageText.innerHTML = `
<span class="message-author">
${author}
</span>
:
<span class="message-name">
${text}
</span>
`;

            messageBar.classList.add(
                "show"
            );
        });

    gardenSpace.appendChild(
        flower
    );
}

messageBar.addEventListener(
    "click",
    () => {
        messageBar.classList.remove(
            "show"
        );
    });

backgroundGarden.addEventListener(
    "click",
    () => {
        if (!waitingForPlacement) {

            messageBar.classList.remove(
                "show"
            );
        }
    });

document.addEventListener(
    "keydown",
    (e) => {
        const canvasOpen =
            canvasBox.style.display === "block";
        if (!canvasOpen)
            return;

        if (
            e.ctrlKey &&
            e.key.toLowerCase() === "z"
            &&
            !e.shiftKey
        ) {
            e.preventDefault();
            undoBtn.click();
        }

        if (
            e.ctrlKey &&
            e.key.toLowerCase() === "y"
        ) {
            e.preventDefault();
            redoBtn.click();
        }

        if (
            e.ctrlKey &&
            e.shiftKey &&
            e.key.toLowerCase() === "z"
        ) {
            e.preventDefault();
            redoBtn.click();
        }

        if (
            e.ctrlKey &&
            e.key.toLowerCase() === "s"
        ) {
            e.preventDefault();
            saveDrawing();
        }

        if (
            e.key === "Escape"
        ) {
            canvasBox.style.display = "none";
        }
    });

window.addEventListener(
    "load",
    () => {
        showGarden();

        backgroundGarden.scrollLeft =
            gardenSpace.offsetWidth / 2;
        backgroundGarden.scrollTop =
            gardenSpace.offsetHeight / 2;

        currentTool = "brush";
        updateToolUI();
    });

let saving = false;
async function safeSave() {
    if (saving)
        return;
    saving = true;
    try {
        await saveDrawing();
    }
    finally {
        setTimeout(() => {
            saving = false;
        }, 1000);
    }
}

backgroundGarden.addEventListener(
    "touchmove",
    (e) => {
        if (
            canvasBox.style.display === "block"
        ) {
            e.preventDefault();
        }
    },
    {
        passive: false
    });

async function firebaseCheck() {
    try {
        await getDocs(
            flowersCollection
        );

        console.log(
            "Firebase connected"
        );
    }

    catch (error) {
        console.log(
            "Firebase connection failed ",
            error
        );

        alert(
            "Firebase not connected. Check Firestore rules."
        );
    }
}

firebaseCheck();

if (homeBtn) {
    homeBtn.onclick = () => {
        location.reload();
    };
}

currentTool = "brush";
updateToolUI();
console.log(
    "Pastel Garden Ready"
);

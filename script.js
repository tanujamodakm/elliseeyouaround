const nameInput = document.getElementById("nameInput");
const nameBox = document.getElementById("nameBox");
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

let currentColor = "#ff9fa5";
let currentTool = "brush";
let mouseDown = false;
let drawData = [];
let undoStack = [];
let redoStack = [];
let waitingForPlacement = false;
let flowerToPlace = null;
let flowerMessage = "";
let currentUser = "";

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

nameInput.addEventListener("keydown", function (e) {
    if (e.key !== "Enter") return;
    const name =
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
});

drawBtn.addEventListener("click", () => {
    welcome.style.display = "none";
    canvasBox.style.display = "block";
    createGrid();
    updateToolUI();

});

function createGrid() {
    grid.innerHTML = "";
    if (grid.children.length === 0) {
        drawData = new Array(360).fill("");
        undoStack = [];
        redoStack = [];
    }

    for (let i = 0; i < 360; i++) {
        const cell =
        document.createElement("div");
        cell.className = "cell";
        cell.addEventListener("mousedown", () => {
            undoStack.push([...drawData]);
            redoStack = [];
            mouseDown = true;
            paint(cell, i);
        });

        cell.addEventListener("mouseover", () => {
            if (mouseDown) {
                paint(cell, i);
            }
        });

        grid.appendChild(cell);
    }
}

document.addEventListener("mouseup", () => {
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
    cell.style.background = currentColor;
}

function redrawGrid() {
    const cells =
    document.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        cell.style.background =
        drawData[index] || "white";
    });
}

colorPicker.addEventListener("input", function () {
    currentColor = this.value;
    currentTool = "brush";
    updateToolUI();
});

eraserBtn.addEventListener("click", () => {
    currentTool = "eraser";
    updateToolUI();
});

fillBtn.addEventListener("click", () => {
    currentTool = "fill";
    updateToolUI();
});

undoBtn.addEventListener("click", () => {
    if (undoStack.length === 0) return;
    redoStack.push([...drawData]);
    drawData = undoStack.pop();
    redrawGrid();

});

redoBtn.addEventListener("click", () => {
    if (redoStack.length === 0) return;
    undoStack.push([...drawData]);
    drawData = redoStack.pop();
    redrawGrid();
});

clearCanvasBtn.addEventListener("click", () => {
    undoStack.push([...drawData]);
    redoStack = [];
    drawData = new Array(360).fill("");
    redrawGrid();
});

document.getElementById("homeBtn").onclick = function () {
    location.reload();
};

function saveDrawing() {
    const userMessage =
    message.value.trim();
    if (userMessage === "") {
        alert("Write a message.");
        return;
    }

    const hasDrawing =
    drawData.some(pixel => pixel !== "");
    if (!hasDrawing) {
        alert("Draw something.");
        return;
    }

    flowerToPlace = [...drawData];
    flowerMessage =
    `${currentUser}|${userMessage}`;
    waitingForPlacement = true;
    canvasBox.style.display = "none";
    message.value = "";
}

saveBtn.addEventListener(
    "click",
    saveDrawing
);

message.addEventListener(
    "keydown",
    function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            saveDrawing();
        }
    }
);

backgroundGarden.addEventListener(
    "click",
    function (e) {
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
        const flowers =
        JSON.parse(
            localStorage.getItem(
                "pastelGarden"
            )
        ) || [];
        flowers.push({
            drawing: flowerToPlace,
            message: flowerMessage,
            x,
            y
        });

        localStorage.setItem(
            "pastelGarden",
            JSON.stringify(flowers)
        );

        waitingForPlacement = false;
        flowerToPlace = null;
        flowerMessage = "";
        showGarden();
    }
);

function showGarden() {
    document
    .querySelectorAll(".pixelFlower")
    .forEach(f => f.remove());

    const flowers =
    JSON.parse(
        localStorage.getItem(
            "pastelGarden"
        )
    ) || [];

    flowers.forEach(item => {
        createFlower(
            item.drawing,
            item.message,
            item.x,
            item.y
        );
    });
}

function createFlower(
    drawing,
    msg,
    x,
    y
) {
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
    drawing.forEach(pixel => {
        const square =
        document.createElement("div");
        square.style.background =
        pixel || "transparent";
        flower.appendChild(square);
    });

    flower.addEventListener(
        "click",
        function (e) {
            e.stopPropagation();
            const parts =
            msg.split("|");
            const author =
            parts[0];
            const text =
            parts.slice(1).join("|");
            messageText.innerHTML =
            `<span style="
                color:#4A4A4A;
                font-weight:600;
            ">
                ${author}
            </span> : ${text}`;
            messageBar.classList.add(
                "show"
            );
        }
    );

    gardenSpace.appendChild(
        flower
    );
}

document.addEventListener(
    "keydown",
    function (e) {
        const canvasOpen =
        canvasBox.style.display === "block";
        if (!canvasOpen)
        return;

        if (
            e.ctrlKey &&
            !e.shiftKey &&
            e.key.toLowerCase() === "z"
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

        if (e.key === "Escape") {

            canvasBox.style.display =
            "none";
        }

    }
);

messageBar.addEventListener(
    "click",
    function () {
        messageBar.classList.remove(
            "show"
        );
    }
);

backgroundGarden.addEventListener(
    "click",
    function () {
        if (!waitingForPlacement) {
            messageBar.classList.remove(
                "show"
            );
        }
    }
);

window.onload = function () {
    showGarden();
    backgroundGarden.scrollLeft =
        gardenSpace.offsetWidth / 2;
    backgroundGarden.scrollTop =
        gardenSpace.offsetHeight / 2;
    currentTool = "brush";
    updateToolUI();
};
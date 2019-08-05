let canvas: HTMLCanvasElement | HTMLElement = document.getElementById("mainCavas") !;
let context = ( < HTMLCanvasElement > canvas).getContext('2d') !;
let options = document.getElementById("optionsBuilder") !;
const timeStep = 0
let currentMaze: Maze;
let currentStack: {
    x: number,
    y: number
} [];
let nVisitedCells: number;

class Cell {
    filled: boolean
    dirs ? : {
        north: boolean
        south: boolean
        west: boolean
        east: boolean
    }
    constructor(public x: number, public y: number) {
        this.filled = false
    }
    setFilled() {
        this.filled = true
        this.dirs = {
            north: false,
            south: false,
            west: false,
            east: false,
        }
    }
    setDir(dir: "north" | "south" | "west" | "east", open: boolean) {
        if (!this.dirs) this.setFilled()
        this.dirs![dir] = open
    }
}


class Maze {
    public id: string = Math.floor(Math.random() * 10000).toString(16)
    public cellSize: number = 100
    public cells: (Cell)[]
    public end ? : {
        x: number,
        y: number
    }
    public start ? : {
        x: number,
        y: number
    }
    public bgColor: string = "#0000FF"
    public bgColorStart: string = "#00BA03"
    public bgColorEnd: string = "#B20000"
    public wallColor: string = "#FFFFFF"
    constructor(public width: number, public height: number) {
        console.log(width, height)
        this.cells = new Array(width * height)
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.cells[y * this.height + x] = new Cell(x, y)
            }
        }
    }
    canvasSettings(canvas: HTMLCanvasElement) {
        canvas.height = this.cellSize * this.height
        canvas.width = this.cellSize * this.width
    }
    draw(ctx: CanvasRenderingContext2D) {
        this.cells.forEach((cell, index) => {
            let x = cell.x * this.cellSize
            let y = cell.y * this.cellSize
            if (cell.filled) {
                if (this.end && (this.end.x === cell.x) && (this.end.y == cell.y)) {
                    ctx.fillStyle = this.bgColorEnd
                } else if (this.start && (this.start.x === cell.x) && (this.start.y == cell.y)) {
                    ctx.fillStyle = this.bgColorStart
                } else {
                    ctx.fillStyle = this.bgColor
                }
                ctx.fillRect(x, y, this.cellSize, this.cellSize)
                if (!cell.dirs!.east) {
                    ctx.fillStyle = this.wallColor
                    ctx.fillRect(x + this.cellSize - (this.cellSize * 0.04), y, this.cellSize * 0.04, this.cellSize)
                }
                if (!cell.dirs!.west) {
                    ctx.fillStyle = this.wallColor
                    ctx.fillRect(x, y, this.cellSize * 0.04, this.cellSize)
                }
                if (!cell.dirs!.north) {
                    ctx.fillStyle = this.wallColor
                    ctx.fillRect(x, y, this.cellSize, this.cellSize * 0.04)
                }
                if (!cell.dirs!.south) {
                    ctx.fillStyle = this.wallColor
                    ctx.fillRect(x, y + this.cellSize - (this.cellSize * 0.04), this.cellSize, this.cellSize * 0.04)
                }

                ctx.fillStyle = this.wallColor
                ctx.fillRect(x, y, this.cellSize * 0.04, this.cellSize * 0.04) //TOP LEFT
                ctx.fillRect(x + this.cellSize - (this.cellSize * 0.04), y, this.cellSize * 0.04, this.cellSize * 0.04) //TOP RIGHT
                ctx.fillRect(x, y + this.cellSize - (this.cellSize * 0.04), this.cellSize * 0.04, this.cellSize * 0.04) //BOTTOM LEFT
                ctx.fillRect(x + this.cellSize - (this.cellSize * 0.04), y + this.cellSize - (this.cellSize * 0.04), this.cellSize * 0.04, this.cellSize * 0.04) //BOTTOM RIGHT


            } else {
                ctx.fillStyle = '#404040'
                ctx.fillRect(x, y, this.cellSize, this.cellSize)
                ctx.fillStyle = '#FFFFFF'
                ctx.fillRect(x + (this.cellSize * 0.47), y + (this.cellSize * 0.47), this.cellSize * 0.06, this.cellSize * 0.06)
            }
        });
    }
    static loadFromString(mazeStr: string): Maze {
        let size = mazeStr.match(/^s.*$/gmi) ![0].split(" ")
        size.shift()
        let maze = new Maze(Number(size[0]), Number(size[1]))
        mazeStr.split("\n").forEach((row) => {
            let data = row.split(" ")
            console.log(data[0])
            switch (data[0]) {
                case "c": // c x y filled nort south west east
                    let x = Number(data[1])
                    let y = Number(data[2])
                    let filled = Number(data[3])
                    let north = Number(data[4])
                    let south = Number(data[5])
                    let west = Number(data[6])
                    let east = Number(data[7])
                    maze.cells[y * maze.height + x] = new Cell(x, y)
                    maze.cells[y * maze.height + x].setDir("north", Boolean(north))
                    maze.cells[y * maze.height + x].setDir("south", Boolean(south))
                    maze.cells[y * maze.height + x].setDir("west", Boolean(west))
                    maze.cells[y * maze.height + x].setDir("east", Boolean(east))
                    maze.cells[y * maze.height + x].filled = Boolean(filled)
                    break;
                case "e":
                    maze.end = {
                        x: Number(data[1]),
                        y: Number(data[2])
                    }
                    break;
                case "l":
                    maze.start = {
                        x: Number(data[1]),
                        y: Number(data[2])
                    }
                    break;
                default:
                    break;
            }
        })
        console.log(maze)
        return maze
    }

    changeCellSize(size: number) {
        if (size < 9) return
        this.cellSize = size
        this.canvasSettings( < HTMLCanvasElement > canvas)
    }
}


function generateMaze(maze: Maze) {
    let rExit = ( < HTMLInputElement > options.querySelector("#randomExits")).checked
    maze.canvasSettings( < HTMLCanvasElement > canvas)
    currentStack = [{
        x: Math.floor(Math.random() * maze.width),
        y: Math.floor(Math.random() * maze.height)
    }]
    nVisitedCells = 1
    setTimeout(() => {
        nextStep(maze, currentStack, nVisitedCells, rExit)
    }, 1)
}

function nextStep(maze: Maze, stack: {
    x: number,
    y: number
} [], nCellVisited: number, rExit: boolean) {
    if (currentMaze.id !== maze.id) return

    nVisitedCells = nCellVisited

    function generateExit(): {
        pos: {
            x: number,
            y: number
        },
        dir: "north" | "south" | "west" | "east"
    } {
        let x = 0,
            y = 0;
        let dir: "north" | "south" | "west" | "east";
        if (Math.random() < 0.5) { // ON THE TOP OR BOTTOM
            if (Math.random() < 0.5) { //TOP
                x = Math.floor(Math.random() * maze.width)
                dir = "north"
            } else { //BOTTOM
                x = Math.floor(Math.random() * maze.width)
                y = maze.height - 1
                dir = "south"
            }
        } else { // ON THE SIDES
            if (Math.random() < 0.5) { //LEFT
                y = Math.floor(Math.random() * maze.height)
                dir = "west"
            } else { //RIGHT
                y = Math.floor(Math.random() * maze.height)
                x = maze.width - 1
                dir = "east"
            }
        }
        return {
            pos: {
                y: y,
                x: x
            },
            dir: dir
        }

    }
    maze.draw(context)
    if (nCellVisited < maze.width * maze.height) {
        let cell = maze.cells[stack[stack.length - 1].y * maze.height + stack[stack.length - 1].x]
        let neighbour = {
            north: cell.y > 0 ? maze.cells[(cell.y - 1) * maze.height + cell.x] : null,
            south: cell.y < maze.height + 1 ? maze.cells[(cell.y + 1) * maze.height + cell.x] : null,
            west: cell.x > 0 ? maze.cells[cell.y * maze.height + (cell.x - 1)] : null,
            east: cell.x < maze.width - 1 ? maze.cells[cell.y * maze.height + (cell.x + 1)] : null,
        }
        if (neighbour.north || neighbour.south || neighbour.west || neighbour.east) {
            Object.keys(neighbour).forEach(dir => {
                if (!neighbour[ < "north" | "south" | "west" | "east" > dir]) {
                    delete neighbour[ < "north" | "south" | "west" | "east" > dir]
                    return
                }
                if (neighbour[ < "north" | "south" | "west" | "east" > dir] !.filled) {
                    delete neighbour[ < "north" | "south" | "west" | "east" > dir]
                    return
                }
            })
            if (Object.keys(neighbour).length) {
                let nIndex = Math.floor(Math.random() * Object.keys(neighbour).length)
                let nextNeighourPos = < "north" | "south" | "west" | "east" > Object.keys(neighbour)[nIndex];

                let nextNeighour = maze.cells[neighbour[nextNeighourPos] !.y * maze.height + neighbour[nextNeighourPos] !.x];
                cell.setDir(nextNeighourPos, true)
                switch (nextNeighourPos) {
                    case "north":
                        nextNeighour.setFilled()
                        nextNeighour.setDir("south", true)
                        break;
                    case "south":
                        nextNeighour.setFilled()
                        nextNeighour.setDir("north", true)
                        break;
                    case "west":
                        nextNeighour.setFilled()
                        nextNeighour.setDir("east", true)
                        break;
                    case "east":
                        nextNeighour.setFilled()
                        nextNeighour.setDir("west", true)
                        break;
                }
                nCellVisited++
                stack.push({
                    x: nextNeighour.x,
                    y: nextNeighour.y
                })
            } else {
                stack.pop()
            }
        }
        setTimeout(() => {
            nextStep(maze, stack, nCellVisited, rExit)
        }, 0)
    } else {
        if (rExit) {
            let start = generateExit()
            let end = generateExit()
            while (start.pos.x === end.pos.x && start.pos.y === end.pos.y) {
                end = generateExit()
            }
            maze.cells[start.pos.y * maze.height + start.pos.x].setDir(start.dir, true)
            maze.cells[end.pos.y * maze.height + end.pos.x].setDir(end.dir, true)
            maze.start = {
                y: start.pos.y,
                x: start.pos.x
            }
            maze.end = {
                y: end.pos.y,
                x: end.pos.x
            }
        } else {
            maze.cells[0].setDir("west", true)
            maze.cells[maze.cells.length - 1].setDir("east", true)
            maze.start = {
                x: maze.cells[0].x,
                y: maze.cells[0].y
            }
            maze.end = {
                x: maze.cells[maze.cells.length - 1].x,
                y: maze.cells[maze.cells.length - 1].y
            }
        }
        maze.draw(context)
        currentMaze = maze
    }
}

function handleOptions() {
    let size = Number(( < HTMLInputElement > options.querySelector("#inpSize")).value)
    if (!size || size < 1 || Number.isNaN(size)) {
        size = 10
    }
    currentMaze = new Maze(size, size)
    generateMaze(currentMaze)
}

function handleDownload() {

    /*
        s heigh width                               // size
        c x y filled nort south west east           // cell data
        e x y                                       // end cell
        l x y                                       // start cell

    */

    if (nVisitedCells === currentMaze.height * currentMaze.width) {
        let mazeData = ""
        mazeData += `s ${currentMaze.height} ${currentMaze.width} \n`
        currentMaze.cells.forEach(cell => {
            mazeData += `c ${cell.x} ${cell.y} ${Number(cell.filled)} ${(() => {
                if(cell.filled) {
                    return `${Number(cell.dirs!.north)} ${Number(cell.dirs!.south)} ${Number(cell.dirs!.west)} ${Number(cell.dirs!.east)}`
                }
                else {
                    return "0 0 0 0"
                }
            })()}`
            mazeData += "\n"
        })
        mazeData += `e ${currentMaze.end!.x} ${currentMaze.end!.y} \n`
        mazeData += `l ${currentMaze.start!.x} ${currentMaze.start!.y} \n`
        let mazeBlob = new Blob([mazeData], {
            type: "text/plain"
        })
        let anchorElement = document.createElement("a")
        let mazeURL = URL.createObjectURL(mazeBlob)
        anchorElement.href = mazeURL
        anchorElement.download = "download.maze"
        document.body.appendChild(anchorElement)
        anchorElement.click()
        document.body.removeChild(anchorElement)

        setTimeout(function () {
            URL.revokeObjectURL(mazeURL)
        }, 500)
    }

}

function handleUpload() {
    let fInput = ( < HTMLInputElement > options.querySelector("#buttonUpload"))
    if (fInput.files) {
        let file = fInput.files[0]
        let reader = new FileReader()
        reader.readAsText(file)
        reader.addEventListener("loadend", function () {
            currentMaze = Maze.loadFromString( < string > reader.result)
            currentMaze.canvasSettings( < HTMLCanvasElement > canvas)
            currentMaze.draw(context)
        })
    }
}

function handleChangeSize(this: HTMLInputElement) {
    if (this.valueAsNumber > 10) {
        currentMaze.changeCellSize(this.valueAsNumber)
        currentMaze.draw(context)
    }
}

function handleColorPicker() {
    let type = ( < HTMLElement > options.querySelector("#colorpicker .dropdown .dropdown-content .active")).dataset.value
    let r = ( < HTMLInputElement > options.querySelector("#colorpicker .red")).valueAsNumber
    let g = ( < HTMLInputElement > options.querySelector("#colorpicker .green")).valueAsNumber
    let b = ( < HTMLInputElement > options.querySelector("#colorpicker .blue")).valueAsNumber

    switch (type) {
        case "normal":
            currentMaze.bgColor = `rgb(${r},${g},${b})`
            break;
        case "start":
            currentMaze.bgColorStart = `rgb(${r},${g},${b})`
            break;
        case "end":
            currentMaze.bgColorEnd = `rgb(${r},${g},${b})`
            break;
        case "wall":
            currentMaze.wallColor = `rgb(${r},${g},${b})`
            break;

        default:
            break;
    }
    currentMaze.draw(context)
}

( < HTMLButtonElement > options.querySelector("#buttonGenerate")).addEventListener("click", handleOptions);
( < HTMLButtonElement > options.querySelector("#buttonDownload")).addEventListener("click", handleDownload);
( < HTMLButtonElement > options.querySelector("#buttonUpload")).addEventListener("click", handleUpload);

( < HTMLInputElement > options.querySelector("#cellSize")).addEventListener("change", handleChangeSize);

( < NodeListOf < HTMLElement >> options.querySelectorAll("#colorpicker .dropdown .dropdown-content a")).forEach(node => {
    node.addEventListener("click", function () {
        for (let index = 0; index < node.parentElement!.children.length; index++) {
            const n = node.parentNode!.children[index];
            n.classList.remove("active")

        }
        node.classList.add("active");
        ( < HTMLElement > node.parentElement!.parentElement!.querySelector(".dropbtn")).innerText = node.innerText;
    })
});



( < NodeListOf < HTMLInputElement >> options.querySelectorAll("#colorpicker input")) !.forEach(node => {
    node.addEventListener("change", function () {
        let r = ( < HTMLInputElement > options.querySelector("#colorpicker .red")).valueAsNumber
        let g = ( < HTMLInputElement > options.querySelector("#colorpicker .green")).valueAsNumber
        let b = ( < HTMLInputElement > options.querySelector("#colorpicker .blue")).valueAsNumber
        let colorViewer = ( < HTMLElement > options.querySelector("#colorpicker .colorViewer"))

        colorViewer.style.backgroundColor = `rgb(${r},${g},${b})`
    })
});

( < HTMLButtonElement > options.querySelector("#colorpicker .buttonColor")).addEventListener("click", handleColorPicker);
let canvas: HTMLCanvasElement | HTMLElement = document.getElementById("mainCavas") !;
let context = ( < HTMLCanvasElement > canvas).getContext('2d') !;
let options = document.getElementById("optionsBuilder") !;
const timeStep = 0
const generateSetTimeout = true
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
    public cellSize: number = 60
    public cells: (Cell)[]
    constructor(public width: number, public height: number) {
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
                ctx.fillStyle = '#0000FF'
                ctx.fillRect(x, y, this.cellSize, this.cellSize)
                if (!cell.dirs!.east) {
                    ctx.fillStyle = "#FFFFFF"
                    ctx.fillRect(x + this.cellSize - (this.cellSize * 0.04), y, this.cellSize * 0.04, this.cellSize)
                }
                if (!cell.dirs!.west) {
                    ctx.fillStyle = "#FFFFFF"
                    ctx.fillRect(x, y, this.cellSize * 0.04, this.cellSize)
                }
                if (!cell.dirs!.north) {
                    ctx.fillStyle = "#FFFFFF"
                    ctx.fillRect(x, y, this.cellSize, this.cellSize * 0.04)
                }
                if (!cell.dirs!.south) {
                    ctx.fillStyle = "#FFFFFF"
                    ctx.fillRect(x, y + this.cellSize - (this.cellSize * 0.04), this.cellSize, this.cellSize * 0.04)
                }

                ctx.fillStyle = "#808080"
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
}





function generateMaze(size: number) {
    let maze = new Maze(size, size) // y*9 + 9 = max
    let rExit = (<HTMLInputElement>options.querySelector("#randomExits")).checked
    maze.canvasSettings( < HTMLCanvasElement > canvas)
    setTimeout(nextStep, 0, maze, [{
        x: Math.floor(Math.random() * maze.width),
        y: Math.floor(Math.random() * maze.height)
    }], 1,rExit)
}

function nextStep(maze: Maze, stack: {
    x: number,
    y: number
} [], nCellVisited: number, rExit: boolean) {
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
        setTimeout(nextStep, timeStep, maze, stack, nCellVisited, rExit)
    } else {
        if (rExit) {
            let start = generateExit()
            let end = generateExit()
            while (start.pos === end.pos) {
                end = generateExit()
            }
            maze.cells[start.pos.y * maze.height + start.pos.x].setDir(start.dir, true)
            maze.cells[end.pos.y * maze.height + end.pos.x].setDir(end.dir, true)
        } else {
            maze.cells[0].setDir("west", true)
            maze.cells[maze.cells.length -1 ].setDir("east", true)
        }
        maze.draw(context)
    }
}

function handleOptions() {
    let size = Number(( < HTMLInputElement > options.querySelector("#inpSize")).value)
    if (!size || size < 1 || Number.isNaN(size)) {
        size = 10
    }
    generateMaze(size)
}

( < HTMLButtonElement > options.querySelector("#buttonGenerate")).addEventListener("click", handleOptions)
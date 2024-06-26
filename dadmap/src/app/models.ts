export interface Map {
    name: string
    respawns: Position[]
    spawns: Position[]
}

export interface Position {
    x: number
    y: number
}

export interface MapInfo {
    [key: string]: Map
}

export interface DisplayFlags {
    [key: string]: boolean
}

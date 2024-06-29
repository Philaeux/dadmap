export interface Map {
    name: string
    module: NamedPosition[]
    shrine_health: Position[]
    shrine_health_or_respawn: Position[]
    shrine_respawn: Position[]
    spawn: Position[]
}

export interface Position {
    x: number
    y: number
}

export interface NamedPosition {
    name: string,
    x: number,
    y: number
}

export interface MapInfo {
    [key: string]: Map
}

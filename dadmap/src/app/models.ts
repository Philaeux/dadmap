export interface Map {
    name: string
    herb: Position[]
    module: NamedPosition[]
    ore: Position[]
    shrine_buff: Position[]
    shrine_defense: Position[]
    shrine_defense_or_power: Position[]
    shrine_defense_or_speed: Position[]
    shrine_health: Position[]
    shrine_health_or_respawn: Position[]
    shrine_health_or_speed: Position[]
    shrine_power: Position[]
    shrine_power_or_speed: Position[]
    shrine_respawn: Position[]
    shrine_speed: Position[]
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

import { Chunk } from "./chunk.types";

export interface ChunkBuilderState{

chunks:Chunk[]

currentParts:string[]

currentLength:number

chunkIndex:number

currentStartOffset:number

processedCharacters:number
}
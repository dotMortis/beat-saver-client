import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { LocalMapInfo } from '../../../src/models/maps/localMapInfo.model';
import { TRawMapInfo } from '../../../src/models/maps/rawMapInfo.model';

export default class MapHelpers {
    public static getLocalMapInfo(
        id: string,
        mapsFolderPath: string,
        mapFolderName: string
    ): LocalMapInfo {
        const infoDatPath = join(mapsFolderPath, mapFolderName, 'info.dat');
        const infoDatStr = readFileSync(infoDatPath).toString();
        const infoDat: TRawMapInfo = JSON.parse(infoDatStr);
        const hash = MapHelpers.computeHash(infoDatStr, infoDat, mapsFolderPath, mapFolderName);
        return LocalMapInfo.fromRawMapInfo(infoDat, hash, id, mapFolderName);
    }

    public static getMapIdFromFolder(mapFolderName: string): string {
        return mapFolderName.split(' ')[0];
    }

    public static computeHash(
        infoDatStr: string,
        rawMapInfo: TRawMapInfo,
        mapsFolderPath: string,
        mapFolderName: string
    ): string {
        let binary = infoDatStr;
        for (const diffSet of rawMapInfo._difficultyBeatmapSets) {
            for (const d of diffSet._difficultyBeatmaps) {
                binary += readFileSync(
                    join(mapsFolderPath, mapFolderName, d._beatmapFilename)
                ).toString();
            }
        }
        return createHash('sha1').update(binary).digest('hex').toLowerCase();
    }
}

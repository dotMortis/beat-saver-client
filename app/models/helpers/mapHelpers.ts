import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { LocalMapInfo } from '../../../src/models/localMapInfo.model';
import { TRawMapInfo } from '../../../src/models/rawMapInfo.model';

export default class MapHelpers {
    public static getLocalMapInfo(folderPath: string, foldername: string): LocalMapInfo {
        const infoDatPath = join(folderPath, 'info.dat');
        const infoDatStr = readFileSync(infoDatPath).toString();
        const infoDat: TRawMapInfo = JSON.parse(infoDatStr);
        const hash = MapHelpers.computeHash(infoDatStr, infoDat, folderPath);
        const id = foldername.split(' ')[0];
        return LocalMapInfo.fromRawMapInfo(infoDat, hash, id);
    }

    public static computeHash(
        infoDatStr: string,
        rawMapInfo: TRawMapInfo,
        folderPath: string
    ): string {
        let binary = infoDatStr;
        for (const diffSet of rawMapInfo._difficultyBeatmapSets) {
            for (const d of diffSet._difficultyBeatmaps) {
                binary += readFileSync(join(folderPath, d._beatmapFilename)).toString();
            }
        }
        return createHash('sha1').update(binary).digest('hex').toLowerCase();
    }
}

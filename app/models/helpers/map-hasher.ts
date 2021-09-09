import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { readFile } from 'fs-extra';
import { join } from 'path';

export default class MapHasher {
    public static async compute(folderPath: string): Promise<string | undefined> {
        try {
            const infoDatPath = join(folderPath, 'info.dat');
            const infoDatStr = (await readFile(infoDatPath)).toString();
            const infoDat = JSON.parse(infoDatStr);
            let binary = infoDatStr;
            for (const diffSet of infoDat._difficultyBeatmapSets) {
                for (const d of diffSet._difficultyBeatmaps) {
                    binary += readFileSync(join(folderPath, d._beatmapFilename)).toString();
                }
            }
            return createHash('sha1').update(binary).digest('hex').toLowerCase();
        } catch (e) {
            return undefined;
        }
    }
}

import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import { join } from 'path';

export default class MapHasher {
    public static async Compute(folderPath: string): Promise<string | undefined> {
        try {
            const infoDatPath = join(folderPath, 'info.dat');
            const infoDatStr = (await fs.readFile(infoDatPath)).toString();
            const infoDat = JSON.parse(infoDatStr);
            let binary = infoDatStr;
            for (const diffSet of infoDat._difficultyBeatmapSets) {
                for (const d of diffSet._difficultyBeatmaps) {
                    binary += fs.readFileSync(join(folderPath, d._beatmapFilename)).toString();
                }
            }
            return crypto.createHash('sha1').update(binary).digest('hex').toLowerCase();
        } catch (e) {
            return undefined;
        }
    }
}

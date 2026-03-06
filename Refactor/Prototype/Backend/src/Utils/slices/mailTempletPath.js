import fs from "fs";
import path from "path";

const baseDir = path.resolve()

const mailTempletDir = path.join(baseDir, 'mailTempletHtml')

export const mailTempletHtmlPath = (htmlTempletFileName) => {
    const fullHtmlPath = path.join(mailTempletDir, htmlTempletFileName)
    if (!fs.existsSync(fullHtmlPath)) {
        return null
    }

    return fullHtmlPath
}
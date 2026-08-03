import fs from "fs";

type UploadedFile = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
};

type UploadedFiles = {
    [key: string]: UploadedFile[];
};

export const unlinkUnuseFile = (files: UploadedFiles) => {
    try {
        let unusedFileCount = 0
        Object.keys(files).forEach(key => {
            const file = files[key];
            if (file.length) {
                file.forEach(f => {
                    if (f && fs.existsSync(f.path)) {
                        fs.unlinkSync(f.path);
                        unusedFileCount++
                    }
                })
            }
        })
        console.log(`Removed ${unusedFileCount} unused files`);
    } catch (error) {
        console.log(error);
    }
}
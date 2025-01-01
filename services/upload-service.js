const { google } = require("googleapis");
const fs = require("fs");

class UploadService{
    async uploadToDrive(filePath, fileName){
        try{
            const auth = new google.auth.GoogleAuth({
                keyFile: "./config/credentials.json", // Adjust the path as per your folder structure
                scopes: ["https://www.googleapis.com/auth/drive.file"],
            });

            const drive = google.drive({ version: "v3", auth });
            const fileMetadata = {
                name: fileName, 
                parents: [ process.env.DRIVE_PROFILE_FOLDER_ID ], 
            };

            const media = {
                mimeType: "image/jpeg", // Adjust mime type as needed (e.g., image/png)
                body: fs.createReadStream(filePath), // Read the file from the given file path
            };

            // Saving file to google drive
            const response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: "id", // Request only the file ID in the response
            });

            // Setting permissions for the file to be read by anyone
            await drive.permissions.create({
                fileId: response.data.id, // File ID from the upload response
                requestBody: {
                    role: "reader", // Grant read access
                    type: "anyone", // Allow anyone with the link to view
                },
            });

            const driveLink = `https://drive.google.com/uc?id=${response.data.id}`;
            
            // Delete file to save space
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("Error deleting the file:", err);
                } else {
                    console.log("File successfully deleted from uploads folder:", filePath);
                }
            });

            return driveLink;

        }catch(error){
            console.error("Error uploading file to Google Drive:", error);
            throw new Error("Failed to upload file.");
        }
    }
}

module.exports = new UploadService();
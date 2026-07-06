import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 5000;

async function main() {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error: any) {
    console.log(`Error starting the server ${error}`);
    process.exit(1);
  }
}

main();

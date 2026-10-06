import fs from "fs";
import path from "path";

const BRAIN_DIR = "C:/Users/ghula/.gemini/antigravity/brain/b6fe4adc-8a0f-4a7d-bd3e-4e9a5fd02833/.system_generated/steps";

function parseJsonFromStepFile(stepNum) {
  const filePath = path.join(BRAIN_DIR, `${stepNum}`, "output.txt");
  if (!fs.existsSync(filePath)) {
    console.error("File does not exist:", filePath);
    return null;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) {
    console.error("Could not find json block in step", stepNum);
    return null;
  }
  return JSON.parse(jsonMatch[1]);
}

function saveBase64Image(dataUrl, destPath) {
  if (!dataUrl) return;
  const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!matches) {
    console.error("Invalid data URL for", destPath);
    return;
  }
  const buffer = Buffer.from(matches[2], "base64");
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(destPath, buffer);
  console.log("Saved:", destPath, `(${buffer.length} bytes)`);
}

async function run() {
  const publicDir = "e:/Bargainstore.uk/public/assets";

  // 1. Payment icons (Step 217)
  console.log("Extracting payment icons...");
  const payments = parseJsonFromStepFile(217);
  if (payments) {
    saveBase64Image(payments.mastercard, path.join(publicDir, "payment/mastercard.webp"));
    saveBase64Image(payments.paypal, path.join(publicDir, "payment/paypal.webp"));
    saveBase64Image(payments.visa, path.join(publicDir, "payment/visa.webp"));
    saveBase64Image(payments.applePay, path.join(publicDir, "payment/apple-pay.webp"));
    saveBase64Image(payments.googlePay, path.join(publicDir, "payment/google-pay.webp"));
  }

  // 2. Brand logos (Step 221)
  console.log("Extracting brand logos...");
  const brands = parseJsonFromStepFile(221);
  if (brands) {
    saveBase64Image(brands.flymo, path.join(publicDir, "brands/flymo.webp"));
    saveBase64Image(brands.blackDecker, path.join(publicDir, "brands/black-decker.webp"));
    saveBase64Image(brands.hozelock, path.join(publicDir, "brands/hozelock.webp"));
    saveBase64Image(brands.tower, path.join(publicDir, "brands/tower.webp"));
    saveBase64Image(brands.stanley, path.join(publicDir, "brands/stanley.webp"));
    saveBase64Image(brands.josephJoseph, path.join(publicDir, "brands/joseph-joseph.webp"));
  }

  // 3. Category images (Step 223)
  console.log("Extracting category images...");
  const categories = parseJsonFromStepFile(223);
  if (categories) {
    saveBase64Image(categories.gardenGrowing, path.join(publicDir, "categories/garden-growing.webp"));
    saveBase64Image(categories.outdoorLiving, path.join(publicDir, "categories/outdoor-living.webp"));
    saveBase64Image(categories.diyDecorating, path.join(publicDir, "categories/diy-decorating.webp"));
    saveBase64Image(categories.electricals, path.join(publicDir, "categories/electricals.webp"));
    saveBase64Image(categories.housewares, path.join(publicDir, "categories/housewares.webp"));
    saveBase64Image(categories.laundryUtility, path.join(publicDir, "categories/laundry-utility.webp"));
  }

  // 4. Product images (Step 225)
  console.log("Extracting product images...");
  const prods = parseJsonFromStepFile(225);
  if (prods) {
    saveBase64Image(prods.dulux, path.join(publicDir, "products/dulux-paint.webp"));
    saveBase64Image(prods.blackDeckerMulti, path.join(publicDir, "products/black-decker-multitool.webp"));
    saveBase64Image(prods.drBeckmann, path.join(publicDir, "products/dr-beckmann.webp"));
    saveBase64Image(prods.josephBowl, path.join(publicDir, "products/joseph-bowl.webp"));
    saveBase64Image(prods.digitalBlender, path.join(publicDir, "products/digital-blender.webp"));
    saveBase64Image(prods.josephDishrack, path.join(publicDir, "products/joseph-dishrack.webp"));
  }

  console.log("All real assets successfully extracted and saved to public/assets!");
}

run().catch(console.error);

import { GET as getMerchantFeed } from "@/app/api/feeds/google-merchant/route";

export const dynamic = "force-dynamic";

export async function GET() {
  return getMerchantFeed();
}
